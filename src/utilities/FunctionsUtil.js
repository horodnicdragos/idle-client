import React from "react";
import axios from 'axios';
import moment from 'moment';
import { Text } from "rimble-ui";
import BigNumber from 'bignumber.js';
import IdleGovToken from './IdleGovToken';
import { toBuffer } from "ethereumjs-util";
import globalConfigs from '../configs/globalConfigs';
import ENS, { getEnsAddress } from '@ensdomains/ensjs';

const ethereumjsABI = require('ethereumjs-abi');
const env = process.env;

class FunctionsUtil {

  // Attributes
  props = {};
  idleGovToken = null;

  // Constructor
  constructor(props){
    this.setProps(props);
  }

  // Methods
  setProps = props => {
    this.props = props;
  }
  trimEth = eth => {
    return this.BNify(eth).toFixed(6);
  }
  toBN = n => new this.props.web3.utils.BN(n)
  toEth = wei => {
    if (!this.props.web3){
      return null;
    }
    return this.props.web3.utils.fromWei(
      (wei || 0).toString(),
      "ether"
    );
  }
  toWei = eth => {
    if (!this.props.web3){
      return null;
    }
    return this.props.web3.utils.toWei(
      (eth || 0).toString(),
      "ether"
    );
  }
  htmlDecode = input => {
    var e = document.createElement('textarea');
    e.innerHTML = input;
    return e.childNodes.length === 0 ? '' : e.childNodes[0].nodeValue;
  }
  BNify_obj = s => new BigNumber(s)
  BNify = s => new BigNumber( typeof s === 'object' ? s : String(s) )
  customLog = (...props) => { if (globalConfigs.logs.messagesEnabled) this.customLog(moment().format('HH:mm:ss'),...props); }
  customLogError = (...props) => { if (globalConfigs.logs.errorsEnabled) console.error(moment().format('HH:mm:ss'),...props); }
  getContractByName = (contractName) => {
    const contract = this.props.contracts.find(c => c.name === contractName);
    if (!contract) {
      return false;
    }
    return contract.contract;
  }
  normalizeSimpleIDNotification = (n) => {
    return n.replace(/<\/p><p>/g,"\n")
            .replace(/<p>/g,"")
            .replace(/<br>/g,"")
            .replace(/&nbsp;/g," ")
            .replace(/<\/p>/g,"");
  }
  capitalize = (str) => {
    return str ? str.substr(0,1).toUpperCase()+str.substr(1) : '';
  }
  strToMoment = (date,format=null) => {
    return moment(date,format);
  }
  replaceArrayProps = (arr1,arr2) => {
    if (arr2 && Object.keys(arr2).length){
      Object.keys(arr2).forEach(p => {
        arr1[p] = arr2[p];
      });
    }

    return arr1;
  }
  stripHtml = (html) => {
     var tmp = document.createElement("DIV");
     tmp.innerHTML = html;
     return tmp.textContent || tmp.innerText || "";
  }
  // VanillaJS function for smooth scroll
  scrollTo = (to, duration) => {
    const start = window.scrollY;
    const change = to - start;
    const increment = 20;
    let currentTime = 0;

    Math.easeInOutQuad = function (t, b, c, d) {
      t /= d/2;
      if (t < 1) return c/2*t*t + b;
      t--;
      return -c/2 * (t*(t-2) - 1) + b;
    };

    const animateScroll = () => {
        currentTime += increment;
        var val = Math.easeInOutQuad(currentTime, start, change, duration);
        window.scrollTo(0,val);
        if(currentTime < duration) {
          window.setTimeout(animateScroll, increment);
        }
    };

    animateScroll();
  }
  getQueryStringParameterByName = (name, url = window.location.href) => {
    // eslint-disable-next-line
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
  getTxAction = (tx,tokenConfig) => {

    const idleTokenAddress = tokenConfig.idle.address;
    const depositProxyContractInfo = this.getGlobalConfig(['contract','methods','deposit','proxyContract']);
    const migrationContractAddr = tokenConfig.migration && tokenConfig.migration.migrationContract ? tokenConfig.migration.migrationContract.address : null;
    const migrationContractOldAddrs = tokenConfig.migration && tokenConfig.migration.migrationContract && tokenConfig.migration.migrationContract.oldAddresses ? tokenConfig.migration.migrationContract.oldAddresses : [];
    const batchMigration = this.getGlobalConfig(['tools','batchMigration','props','availableTokens',tokenConfig.idle.token]);
    const batchMigrationContractAddr = batchMigration && batchMigration.migrationContract ? batchMigration.migrationContract.address : null;

    const isBatchMigrationTx = batchMigrationContractAddr && tx.from.toLowerCase() === batchMigrationContractAddr.toLowerCase() && tx.contractAddress.toLowerCase() === tokenConfig.idle.address.toLowerCase() && tx.to.toLowerCase() === this.props.account.toLowerCase();    
    const isMigrationTx = isBatchMigrationTx || (migrationContractAddr && (tx.from.toLowerCase() === migrationContractAddr.toLowerCase() || migrationContractOldAddrs.map((v) => { return v.toLowerCase(); }).indexOf(tx.from.toLowerCase()) !== -1 ) && tx.contractAddress.toLowerCase() === idleTokenAddress.toLowerCase());
    const isSendTransferTx = !isMigrationTx && tx.from.toLowerCase() === this.props.account.toLowerCase() && tx.contractAddress.toLowerCase() === idleTokenAddress.toLowerCase();
    const isReceiveTransferTx = !isMigrationTx && tx.to.toLowerCase() === this.props.account.toLowerCase() && tx.contractAddress.toLowerCase() === idleTokenAddress.toLowerCase();
    const isDepositTx = !isMigrationTx && !isSendTransferTx && !isReceiveTransferTx && (tx.to.toLowerCase() === idleTokenAddress.toLowerCase() || (depositProxyContractInfo && tx.to.toLowerCase() === depositProxyContractInfo.address.toLowerCase()));
    const isRedeemTx = !isMigrationTx && !isSendTransferTx && !isReceiveTransferTx && tx.to.toLowerCase() === this.props.account.toLowerCase();
    const isSwapTx = !isMigrationTx && !isSendTransferTx && !isReceiveTransferTx && !isDepositTx && tx.to.toLowerCase() === this.props.account.toLowerCase() && tx.contractAddress.toLowerCase() === idleTokenAddress.toLowerCase();

    let action = null;

    if (isDepositTx){
      action = 'Deposit';
    } else if (isRedeemTx){
      action = 'Redeem';
    } else if (isMigrationTx){
      action = 'Migrate';
    } else if (isSendTransferTx){
      action = 'Send';
    } else if (isReceiveTransferTx){
      action = 'Receive';
    } else if (isSwapTx){
      action = 'Swap';
    } else if (isSwapTx){
      action = 'SwapOut';
    }

    return action;
  }
  shortenHash = hash => {
    let shortHash = hash;
    const txStart = shortHash.substr(0, 7);
    const txEnd = shortHash.substr(shortHash.length - 4);
    shortHash = txStart + "..." + txEnd;
    return shortHash;
  }
  getENSName = async (address) => {

    const networkId = this.props.network.current.id || this.getGlobalConfig(['network','requiredNetwork']);
    const ensConfig = this.getGlobalConfig(['network','providers','ens']);

    if (!ensConfig.enabled || !ensConfig.supportedNetworks.includes(networkId)){
      return null;
    }

    if (!this.checkAddress(address) || !this.props.web3){
      return null;
    }

    const cachedDataKey = `getENSName_${address}`;
    const cachedData = this.getCachedDataWithLocalStorage(cachedDataKey);
    if (cachedData){
      return cachedData;
    }

    const TTL = 3600;
    const provider = this.props.web3.currentProvider;
    if (networkId === 1){
      const ens = new ENS({ provider, ensAddress: getEnsAddress(networkId.toString()) });
      const ensName = await ens.getName(address);
      if (ensName && ensName.name){
        const addressCheck = await ens.name(ensName.name).getAddress();
        if (addressCheck && address.toLowerCase() === addressCheck.toLowerCase()){
          return this.setCachedDataWithLocalStorage(cachedDataKey,ensName.name,TTL);
        }
      }
    }

    return null;
  }
  getAccountPortfolio = async (availableTokens=null,account=null) => {
    const portfolio = {
      tokensBalance:{},
      avgAPY:this.BNify(0),
      totalBalance:this.BNify(0),
      totalEarnings:this.BNify(0),
      totalAmountLent:this.BNify(0),
      totalEarningsPerc:this.BNify(0),
      totalBalanceConverted:this.BNify(0)
    };

    availableTokens = availableTokens ? availableTokens : this.props.availableTokens;
    account = account ? account : this.props.account;

    if (!account || !availableTokens){
      return portfolio;
    }

    const isRisk = this.props.selectedStrategy === 'risk';

    await this.asyncForEach(Object.keys(availableTokens),async (token) => {
      const tokenConfig = availableTokens[token];
      const idleTokenBalance = await this.getTokenBalance(tokenConfig.idle.token,account);

      if (idleTokenBalance){
        const tokenPrice = await this.getIdleTokenPrice(tokenConfig);
        const tokenBalance = idleTokenBalance.times(tokenPrice);
        const tokenBalanceConverted = await this.convertTokenBalance(tokenBalance,token,tokenConfig,isRisk);

        if (!tokenPrice.isNaN() && !tokenBalance.isNaN()){
          portfolio.tokensBalance[token] = {
            tokenPrice,
            tokenBalance,
            idleTokenBalance,
            tokenBalanceConverted
          };

          // Increment total balance
          portfolio.totalBalance = portfolio.totalBalance.plus(tokenBalance);
          portfolio.totalBalanceConverted = portfolio.totalBalanceConverted.plus(tokenBalanceConverted);
        }
      }
    });

    const orderedTokensBalance = {};
    Object.keys(availableTokens).forEach( token => {
      if (portfolio.tokensBalance[token]){
        orderedTokensBalance[token] = portfolio.tokensBalance[token];
      }
    });

    portfolio.tokensBalance = orderedTokensBalance;

    const depositedTokens = Object.keys(portfolio.tokensBalance).filter(token => ( this.BNify(portfolio.tokensBalance[token].idleTokenBalance).gt(0) ));

    let avgAPY = this.BNify(0);
    let totalEarnings = this.BNify(0);
    let totalAmountLent = this.BNify(0);
    let totalEarningsPerc = this.BNify(0);
    // const amountLents = await this.getAmountLent(depositedTokens,this.props.account);

    await this.asyncForEach(depositedTokens,async (token) => {
      const tokenConfig = availableTokens[token];
      const amountDeposited = await this.getAmountDeposited(tokenConfig,account);

      // console.log(token,'amountDeposited',amountDeposited.toString(),'amountLent',amountLents[token].toString());

      const tokenBalanceConverted = portfolio.tokensBalance[token].tokenBalanceConverted;
      const [
        tokenAprs
        // tokenEarnings
      ] = await Promise.all([
        this.getTokenAprs(tokenConfig)
        // this.loadAssetField('earnings',token,tokenConfig,this.props.account,false),
      ]);

      const tokenAPY = this.BNify(tokenAprs.avgApy);
      const tokenWeight = tokenBalanceConverted.div(portfolio.totalBalanceConverted);
      const amountLentToken = await this.convertTokenBalance(amountDeposited,token,tokenConfig,isRisk);
      const tokenEarnings = tokenBalanceConverted.minus(amountLentToken);

      if (tokenEarnings){
        totalEarnings = totalEarnings.plus(tokenEarnings);
      }

      if (tokenAPY){
        avgAPY = avgAPY.plus(tokenAPY.times(tokenWeight));
      }

      if (amountLentToken){
        totalAmountLent = totalAmountLent.plus(amountLentToken);
      }

      // console.log(token,amountLentToken.toFixed(),tokenEarnings.toFixed(),tokenBalanceConverted.toFixed());
    });

    if (totalAmountLent.gt(0)){
      totalEarningsPerc = totalEarnings.div(totalAmountLent).times(100);
    }

    portfolio.avgAPY = avgAPY;
    portfolio.totalEarnings = totalEarnings;
    portfolio.totalAmountLent = totalAmountLent;
    portfolio.totalEarningsPerc = totalEarningsPerc;

    // debugger;

    return portfolio;
  }
  getCurveAvgSlippage = async (enabledTokens=[],account=null,fixDecimals=true) => {
    account = account ? account : this.props.account;

    if (!account){
      return [];
    }

    const availableTokens = this.getCurveAvailableTokens();

    if (!enabledTokens || !enabledTokens.length){
      enabledTokens = Object.keys(availableTokens);
    }

    let processedTxs = {};
    const processedHashes = {};
    let curveTokensBalance = this.BNify(0);
    const curveTxs = await this.getCurveTxs(account,0,'latest',enabledTokens);

    if (curveTxs && curveTxs.length){

      curveTxs.forEach((tx,index) => {

        // Skip transactions with no hash
        if (!tx.hash || !tx.curveTokens || !tx.curveTokenPrice){
          return false;
        }

        const tokenAmount = this.BNify(tx.tokenAmount);
        let curveTokens = this.BNify(tx.curveTokens);
        const curveTokenPrice = this.BNify(tx.curveTokenPrice);

        switch (tx.action){
          case 'CurveIn':
          case 'CurveZapIn':
          case 'CurveDepositIn':
          case 'CurveTransferIn':
            if (tx.action === 'CurveTransferIn'){
              if (index>0 && curveTokensBalance.gt(0)){
                return;
              }
            }

            if (!processedTxs[tx.hash]){
              processedTxs[tx.hash] = {
                price:null,
                received:null,
                slippage:null,
                deposited:this.BNify(0),
              };
            }

            processedTxs[tx.hash].deposited = processedTxs[tx.hash].deposited.plus(tokenAmount);
            if (processedTxs[tx.hash].received === null){
              processedTxs[tx.hash].price = curveTokenPrice;
              processedTxs[tx.hash].received = curveTokens.times(curveTokenPrice);
            }

            // this.customLog('getCurveAvgSlippage',tx.action,tx.hash,tx.blockNumber,curveTokens.toFixed(6),curveTokenPrice.toFixed(6),processedTxs[tx.hash].deposited.toFixed(6),processedTxs[tx.hash].received.toFixed(6));
          break;
          case 'CurveOut':
          case 'CurveZapOut':
          case 'CurveDepositOut':
            curveTokens = curveTokens.times(this.BNify(-1));
          break;
          default:
          break;
        }

        // Update curveTokens balance
        if (!processedHashes[tx.hash]){
          curveTokensBalance = curveTokensBalance.plus(curveTokens);
          if (curveTokensBalance.lte(0)){
            curveTokensBalance = this.BNify(0);

            // Reset processed transactions
            // processedTxs = {};
          }
          processedHashes[tx.hash] = true;
        }
      });
    }

    // this.customLog('processedTxs',processedTxs);

    let avgSlippage = this.BNify(0);
    let totalDeposited = this.BNify(0);
    Object.values(processedTxs).forEach( tx => {
      const slippage = tx.received.div(tx.deposited).minus(1);
      avgSlippage = avgSlippage.plus(slippage.times(tx.deposited));
      totalDeposited = totalDeposited.plus(tx.deposited);
    });

    avgSlippage = avgSlippage.div(totalDeposited).times(-1);

    // debugger;
    // this.customLog('avgSlippage',avgSlippage.toString());

    return avgSlippage;
  }
  getCurveAvgBuyPrice = async (enabledTokens=[],account=null) => {
    account = account ? account : this.props.account;

    if (!account){
      return [];
    }

    const availableTokens = this.getCurveAvailableTokens();

    if (!enabledTokens || !enabledTokens.length){
      enabledTokens = Object.keys(availableTokens);
    }

    const processedTxs = {};
    let avgBuyPrice = this.BNify(0);
    let curveTokensBalance = this.BNify(0);
    const curveTxs = await this.getCurveTxs(account,0,'latest',enabledTokens);

    // this.customLog('curveTxs',curveTxs);

    if (curveTxs && curveTxs.length){

      curveTxs.forEach((tx,index) => {

        if (!processedTxs[tx.hash]){
          processedTxs[tx.hash] = [];
        }

        if (processedTxs[tx.hash].includes(tx.action)){
          return;
        }

        // Skip transactions with no hash
        if (!tx.hash || !tx.curveTokens || !tx.curveTokenPrice){
          return false;
        }

        const prevAvgBuyPrice = avgBuyPrice;
        let curveTokens = this.BNify(tx.curveTokens);
        const curveTokenPrice = this.BNify(tx.curveTokenPrice);

        // Deposited
        switch (tx.action){
          case 'CurveIn':
          case 'CurveZapIn':
          case 'CurveDepositIn':
          case 'CurveTransferIn':
            if (tx.action === 'CurveTransferIn'){
              if (index>0 && curveTokensBalance.gt(0)){
                return;
              }
            }
            avgBuyPrice = curveTokens.times(curveTokenPrice).plus(prevAvgBuyPrice.times(curveTokensBalance)).div(curveTokensBalance.plus(curveTokens));
          break;
          case 'CurveOut':
          case 'CurveZapOut':
          case 'CurveDepositOut':
          // case 'CurveTransferOut':
            curveTokens = curveTokens.times(this.BNify(-1));
          break;
          default:
          break;
        }
        
        // Update curveTokens balance
        curveTokensBalance = curveTokensBalance.plus(curveTokens);
        if (curveTokensBalance.lte(0)){
          avgBuyPrice = this.BNify(0);
          curveTokensBalance = this.BNify(0);
        }

        processedTxs[tx.hash].push(tx.action);

        // this.customLog('getCurveAvgBuyPrice',tx.action,tx.hash,tx.blockNumber,curveTokens.toString(),curveTokenPrice.toString(),curveTokensBalance.toString(),avgBuyPrice.toString());
      });
    }

    // this.customLog('avgCurveBuyPrice',avgBuyPrice.toString());

    return avgBuyPrice;
  }
  getAvgBuyPrice = async (enabledTokens=[],account) => {
    account = account ? account : this.props.account;

    if (!account || !enabledTokens || !enabledTokens.length || !this.props.availableTokens){
      return [];
    }

    const output = {};
    const etherscanTxs = await this.getEtherscanTxs(account,0,'latest',enabledTokens);

    enabledTokens.forEach( selectedToken => {

      output[selectedToken] = [];
      let avgBuyPrice = this.BNify(0);

      let idleTokensBalance= this.BNify(0);
      const filteredTxs = Object.values(etherscanTxs).filter(tx => (tx.token === selectedToken));

      if (filteredTxs && filteredTxs.length){

        filteredTxs.forEach((tx,index) => {

          // Skip transactions with no hash or pending
          if (!tx.hash || (tx.status && tx.status === 'Pending') || !tx.idleTokens || !tx.tokenPrice){
            return false;
          }

          const prevAvgBuyPrice = avgBuyPrice;
          let idleTokens = this.BNify(tx.idleTokens);
          const tokenPrice = this.BNify(tx.tokenPrice);

          // Deposited
          switch (tx.action){
            case 'Deposit':
            case 'Receive':
            case 'Swap':
            case 'Migrate':
            case 'CurveOut':
              avgBuyPrice = idleTokens.times(tokenPrice).plus(prevAvgBuyPrice.times(idleTokensBalance)).div(idleTokensBalance.plus(idleTokens));
            break;
            case 'Send':
            case 'Redeem':
            case 'SwapOut':
            case 'CurveIn':
            case 'Withdraw':
              idleTokens = idleTokens.times(this.BNify(-1));
            break;
            default:
            break;
          }

          // Update idleTokens balance
          idleTokensBalance = idleTokensBalance.plus(idleTokens);
          if (idleTokensBalance.lte(0)){
            avgBuyPrice = this.BNify(0);
            idleTokensBalance = this.BNify(0);
          }

        });
      }

      // Add token Data
      output[selectedToken] = avgBuyPrice;
    });

    return output;
  }
  getFirstDepositTx = async (enabledTokens=[],account) => {
    account = account ? account : this.props.account;

    if (!account || !enabledTokens || !enabledTokens.length || !this.props.availableTokens){
      return [];
    }

    const etherscanTxs = await this.getEtherscanTxs(account,0,'latest',enabledTokens);

    const deposits = {};

    enabledTokens.forEach((selectedToken) => {
      let amountLent = this.BNify(0);
      let firstDepositTx = null;
      deposits[selectedToken] = firstDepositTx;

      const filteredTxs = Object.values(etherscanTxs).filter(tx => (tx.token === selectedToken));
      if (filteredTxs && filteredTxs.length){

        filteredTxs.forEach((tx,index) => {
          // Skip transactions with no hash or pending
          if (!tx.hash || (tx.status && tx.status === 'Pending') || !tx.tokenAmount){
            return false;
          }

          switch (tx.action){
            case 'Swap':
            case 'Deposit':
            case 'Receive':
            case 'Migrate':
              amountLent = amountLent.plus(tx.tokenAmount);
              if (!firstDepositTx){
                firstDepositTx = tx;
              }
            break;
            case 'Send':
            case 'Redeem':
            case 'SwapOut':
            case 'Withdraw':
              amountLent = amountLent.minus(tx.tokenAmount);
            break;
            default:
            break;
          }

          // Reset amountLent if below zero
          if (amountLent.lt(0)){
            amountLent = this.BNify(0);
            firstDepositTx = null;
          }
        });
      }

      // Add token Data
      deposits[selectedToken] = firstDepositTx;
    });

    return deposits;
  }
  asyncTimeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  getDepositTimestamp = async (enabledTokens=[],account) => {
    const firstDepositTxs = await this.getFirstDepositTx(enabledTokens,account);
    if (firstDepositTxs){
      return Object.keys(firstDepositTxs).reduce( (acc,token) => {
        if (firstDepositTxs[token]){
          acc[token] = firstDepositTxs[token].timeStamp;
        }
        return acc;
      },{});
    }

    return null;
  }
  getAmountDeposited = async (tokenConfig,account) => {
    let [tokenBalance,userAvgPrice] = await Promise.all([
      this.getTokenBalance(tokenConfig.idle.token,account),
      this.genericContractCall(tokenConfig.idle.token, 'userAvgPrices', [account])
    ]);

    if (tokenBalance && userAvgPrice){
      userAvgPrice = this.fixTokenDecimals(userAvgPrice,tokenConfig.decimals);
      const amountDeposited = tokenBalance.times(userAvgPrice);
      return amountDeposited;
    }

    return null;
  }
  getAmountLent = async (enabledTokens=[],account) => {

    account = account || this.props.account;

    if (!account || !enabledTokens || !enabledTokens.length || !this.props.availableTokens){
      return [];
    }

    const etherscanTxs = await this.getEtherscanTxs(account,0,'latest',enabledTokens,false);

    const amountLents = {};

    enabledTokens.forEach((selectedToken) => {
      let amountLent = this.BNify(0);
      amountLents[selectedToken] = amountLent;

      const filteredTxs = Object.values(etherscanTxs).filter(tx => (tx.token === selectedToken));
      if (filteredTxs && filteredTxs.length){

        filteredTxs.forEach((tx,index) => {
          // Skip transactions with no hash or pending
          if (!tx.hash || (tx.status && tx.status === 'Pending') || !tx.tokenAmount){
            return false;
          }

          switch (tx.action){
            case 'Swap':
            case 'Deposit':
            case 'Receive':
            case 'Migrate':
            case 'CurveOut':
              amountLent = amountLent.plus(tx.tokenAmount);
            break;
            case 'Send':
            case 'Redeem':
            case 'SwapOut':
            case 'CurveIn':
            case 'Withdraw':
              amountLent = amountLent.minus(tx.tokenAmount);
            break;
            default:
            break;
          }

          // Reset amountLent if below zero
          if (amountLent.lt(0)){
            amountLent = this.BNify(0);
          }
        });
      }

      // Add token Data
      amountLents[selectedToken] = amountLent;
    });

    // debugger;

    return amountLents;
  }
  getEtherscanBaseTxs = async (account=false,firstBlockNumber=0,endBlockNumber='latest',enabledTokens=[],debug=false) => {
    account = account ? account : this.props.account;

    if (!account || !enabledTokens || !enabledTokens.length){
      return [];
    }

    account = account.toLowerCase();

    const selectedStrategy = this.props.selectedStrategy;

    // Check if firstBlockNumber is less that firstIdleBlockNumber
    const firstIdleBlockNumber = this.getGlobalConfig(['network','firstBlockNumber']);
    firstBlockNumber = Math.max(firstIdleBlockNumber,firstBlockNumber);

    const requiredNetwork = this.props.network.current.id || this.getGlobalConfig(['network','requiredNetwork']);
    const etherscanInfo = this.getGlobalConfig(['network','providers','etherscan']);

    let results = [];
    let etherscanBaseTxs = null;
    let etherscanBaseEndpoint = null;

    // Check if etherscan is enabled for the required network
    if (etherscanInfo.enabled && etherscanInfo.endpoints[requiredNetwork]){
      const etherscanApiUrl = etherscanInfo.endpoints[requiredNetwork];

      // Get base endpoint cached transactions
      etherscanBaseEndpoint = `${etherscanApiUrl}?strategy=${selectedStrategy}&apikey=${env.REACT_APP_ETHERSCAN_KEY}&module=account&action=tokentx&address=${account}&startblock=${firstIdleBlockNumber}&endblock=${endBlockNumber}&sort=asc`;
      etherscanBaseTxs = this.getCachedRequest(etherscanBaseEndpoint);

      if (debug){
        console.log('DEBUG - CACHED - etherscanBaseTxs',etherscanBaseTxs);
      }

      // Check if the latest blockNumber is actually the latest one
      if (etherscanBaseTxs && etherscanBaseTxs.data.result && Object.values(etherscanBaseTxs.data.result).length){

        const lastCachedTx = Object.values(etherscanBaseTxs.data.result).pop();
        const lastCachedBlockNumber = lastCachedTx && lastCachedTx.blockNumber ? parseInt(lastCachedTx.blockNumber)+1 : firstBlockNumber;

        const etherscanEndpointLastBlock = `${etherscanApiUrl}?strategy=${selectedStrategy}&apikey=${env.REACT_APP_ETHERSCAN_KEY}&module=account&action=tokentx&address=${account}&startblock=${lastCachedBlockNumber}&endblock=${endBlockNumber}&sort=asc`;
        let latestTxs = await this.makeCachedRequest(etherscanEndpointLastBlock,15);

        if (latestTxs && latestTxs.data.result && latestTxs.data.result.length){
          
          latestTxs = await this.filterEtherscanTxs(latestTxs.data.result,enabledTokens,true,false);

          if (latestTxs && Object.values(latestTxs).length){

            const latestBlockNumbers = Object.values(latestTxs).map( lastTx => (parseInt(lastTx.blockNumber)) );
            const lastRealBlockNumber = Math.max(...latestBlockNumbers);

            // If real tx blockNumber differs from last blockNumber
            if (lastRealBlockNumber>=lastCachedBlockNumber){
              // Merge latest Txs with etherscanBaseTxs
              Object.values(latestTxs).forEach((tx) => {
                const txFound = Object.keys(etherscanBaseTxs.data.result).includes(tx.hashKey);
                if (!txFound){
                  etherscanBaseTxs.data.result[tx.hashKey] = tx;
                }
              });

              // Save etherscan txs
              this.saveEtherscanTxs(etherscanBaseEndpoint,etherscanBaseTxs.data.result);
            }
          }
        }
      } else {
        etherscanBaseTxs = null;
      }

      let txs = etherscanBaseTxs;

      if (debug){
        console.log('DEBUG - txs',txs);
      }

      if (!txs){
        // Make request
        txs = await this.makeRequest(etherscanBaseEndpoint);

        // console.log('makeRequest 1',account,etherscanBaseEndpoint,txs,txs.data.message,txs.data.status,parseInt(txs.data.status));

        if (!txs || !txs.data || parseInt(txs.data.status)===0){
          let requestCount = 0;
          let requestStatus = false;
          do {
            await this.asyncTimeout(500);
            txs = await this.makeRequest(etherscanBaseEndpoint);
            requestCount++;
            requestStatus = txs && txs.data ? parseInt(txs.data.status) : false;
            // console.log('makeRequest '+(requestCount+1),account,etherscanBaseEndpoint,txs,txs.data.message,txs.data.status,parseInt(txs.data.status));
          } while (requestCount<5 && !requestStatus);
        }

        // Cache request
        if (txs && txs.data && parseInt(txs.data.status)>0){
          const timestamp = parseInt(Date.now()/1000);
          const cachedRequests = this.getCachedDataWithLocalStorage('cachedRequests',{});
          cachedRequests[etherscanBaseEndpoint] = {
            data:txs,
            timestamp
          };
          this.setCachedDataWithLocalStorage('cachedRequests',cachedRequests);
        }
      }

      if (txs && txs.data && txs.data.result){
        results = txs.data.result;
      } else {
        return [];
      }
    }

    return {
      results,
      etherscanBaseTxs,
      etherscanBaseEndpoint
    };
  }
  getCurveTxs = async (account=false,firstBlockNumber=0,endBlockNumber='latest',enabledTokens=[]) => {
    const results = await this.getEtherscanTxs(account,firstBlockNumber,endBlockNumber,enabledTokens);
    // results = results ? Object.values(results) : [];
    return this.filterCurveTxs(results,enabledTokens);
  }
  saveEtherscanTxs = (endpoint,txs) => {
    const txsToStore = {};
    Object.keys(txs).forEach(txHash => {
      const tx = txs[txHash];
      if (tx.blockNumber && (!tx.status || tx.status.toLowerCase() !== 'pending')){
        txsToStore[txHash] = tx;
      }
    });

    // Save new cached data
    const cachedRequest = {
      data:{
        result:txsToStore
      }
    };
    this.saveCachedRequest(endpoint,false,cachedRequest);
  }
  getEtherscanTxs = async (account=false,firstBlockNumber=0,endBlockNumber='latest',enabledTokens=[],debug=false) => {
    const {
      results,
      etherscanBaseTxs,
      etherscanBaseEndpoint
    } = await this.getEtherscanBaseTxs(account,firstBlockNumber,endBlockNumber,enabledTokens,debug);

    // Initialize prevTxs
    let etherscanTxs = {};
    if (etherscanBaseTxs){
      // Filter txs for token
      etherscanTxs = await this.processStoredTxs(results,enabledTokens);
    } else {
      const allAvailableTokens = Object.keys(this.props.availableTokens);
      // Save base endpoint with all available tokens
      etherscanTxs = await this.filterEtherscanTxs(results,allAvailableTokens);

      // Store filtered txs
      if (etherscanTxs && Object.keys(etherscanTxs).length){
        this.saveEtherscanTxs(etherscanBaseEndpoint,etherscanTxs);
      }
    }

    if (debug){
      console.log('DEBUG - getEtherscanTxs -',etherscanTxs);
    }

    return Object
            .values(etherscanTxs)
            .filter(tx => (tx.token && enabledTokens.includes(tx.token.toUpperCase())))
            .sort((a,b) => (a.timeStamp < b.timeStamp ? -1 : 1));
  }
  filterCurveTxs = async (results,enabledTokens=[]) => {

    if (!results || !results.length || typeof results.forEach !== 'function'){
      return [];
    }

    const availableTokens = this.props.availableTokens ? this.props.availableTokens : this.getCurveAvailableTokens();

    if (!enabledTokens || !enabledTokens.length){
      enabledTokens = Object.keys(availableTokens);
    }

    const curveTxs = results.filter( tx => (enabledTokens.includes(tx.token) && ['CurveIn','CurveOut','CurveZapIn','CurveZapOut','CurveTransferIn','CurveTransferOut','CurveDepositIn','CurveDepositOut'].includes(tx.action)) );

    if (curveTxs.length){
      curveTxs.sort((a,b) => (a.timeStamp < b.timeStamp ? -1 : 1));
    }

    return curveTxs;
  }
  filterEtherscanTxs = async (results,enabledTokens=[],processTxs=true,processStoredTxs=true) => {
    if (!this.props.account || !results || !results.length || typeof results.forEach !== 'function'){
      return [];
    }

    if (!enabledTokens || !enabledTokens.length){
      enabledTokens = Object.keys(this.props.availableTokens);
    }

    let etherscanTxs = {};
    let curveTransfersTxs = [];
    let curveTransfersTxsToDelete = [];

    // const idleTokensAddresses = Object.values(this.props.availableTokens).map( tokenConfig => (tokenConfig.idle.address) );
    const curveZapContract = this.getGlobalConfig(['curve','zapContract']);
    const curvePoolContract = this.getGlobalConfig(['curve','poolContract']);
    const curveSwapContract = this.getGlobalConfig(['curve','migrationContract']);
    const curveDepositContract = this.getGlobalConfig(['curve','depositContract']);

    // this.customLog('filterEtherscanTxs',enabledTokens,results);

    enabledTokens.forEach(token => {
      const tokenConfig = this.props.availableTokens[token];
      const depositProxyContractInfo = this.getGlobalConfig(['contract','methods','deposit','proxyContract']);
      const migrationContractAddr = tokenConfig.migration && tokenConfig.migration.migrationContract ? tokenConfig.migration.migrationContract.address : null;
      const migrationContractOldAddrs = tokenConfig.migration && tokenConfig.migration.migrationContract && tokenConfig.migration.migrationContract.oldAddresses ? tokenConfig.migration.migrationContract.oldAddresses : [];
      const tokenMigrationToolParams = this.getGlobalConfig(['tools','tokenMigration','props','migrationContract']);

      const batchMigration = this.getGlobalConfig(['tools','batchMigration','props','availableTokens',tokenConfig.idle.token]);
      const batchMigrationContractAddr = batchMigration && batchMigration.migrationContract ? batchMigration.migrationContract.address : null;

      // const curveEnabled = this.getGlobalConfig(['curve','enabled']);
      const curveTokenConfig = this.getGlobalConfig(['curve','availableTokens',tokenConfig.idle.token]);

      results.forEach( tx => {
        let tokenDecimals = tokenConfig.decimals;
        const idleToken = tokenConfig.idle.token;
        const internalTxs = results.filter(r => r.hash === tx.hash);
        const isRightToken = internalTxs.length>1 && internalTxs.filter(iTx => iTx.contractAddress.toLowerCase() === tokenConfig.address.toLowerCase()).length>0;
        const isSendTransferTx = internalTxs.length === 1 && tx.from.toLowerCase() === this.props.account.toLowerCase() && tx.contractAddress.toLowerCase() === tokenConfig.idle.address.toLowerCase();
        const isReceiveTransferTx = internalTxs.length === 1 && tx.to.toLowerCase() === this.props.account.toLowerCase() && tx.contractAddress.toLowerCase() === tokenConfig.idle.address.toLowerCase();
        const isBatchMigrationTx = batchMigrationContractAddr && tx.from.toLowerCase() === batchMigrationContractAddr.toLowerCase() && tx.contractAddress.toLowerCase() === tokenConfig.idle.address.toLowerCase() && tx.to.toLowerCase() === this.props.account.toLowerCase();

        const isDepositInternalTx = isRightToken && internalTxs.find( iTx => iTx.from.toLowerCase() === this.props.account.toLowerCase() && (iTx.to.toLowerCase() === tokenConfig.idle.address.toLowerCase() || (depositProxyContractInfo && iTx.to.toLowerCase() === depositProxyContractInfo.address.toLowerCase() && internalTxs.filter(iTx2 => iTx2.contractAddress.toLowerCase() === tokenConfig.idle.address.toLowerCase()).length>0 )) );
        const isRedeemInternalTx = isRightToken && internalTxs.find( iTx => iTx.contractAddress.toLowerCase() === tokenConfig.address.toLowerCase() && internalTxs.filter(iTx2 => iTx2.contractAddress.toLowerCase() === tokenConfig.idle.address.toLowerCase()).length && iTx.to.toLowerCase() === this.props.account.toLowerCase() );

        const isMigrationTx = isBatchMigrationTx || (migrationContractAddr && (tx.from.toLowerCase() === migrationContractAddr.toLowerCase() || migrationContractOldAddrs.map((v) => { return v.toLowerCase(); }).includes(tx.from.toLowerCase()) ) && tx.contractAddress.toLowerCase() === tokenConfig.idle.address.toLowerCase());
        const isConversionTx = tokenMigrationToolParams && (tx.from.toLowerCase() === tokenMigrationToolParams.address.toLowerCase() || tokenMigrationToolParams.oldAddresses.map((v) => { return v.toLowerCase(); }).includes(tx.from.toLowerCase())) && tx.to.toLowerCase() === this.props.account.toLowerCase() && tx.contractAddress.toLowerCase() === tokenConfig.idle.address.toLowerCase();
        const isDepositTx = isRightToken && !isMigrationTx && tx.from.toLowerCase() === this.props.account.toLowerCase() && (tx.to.toLowerCase() === tokenConfig.idle.address.toLowerCase() || (depositProxyContractInfo && tx.to.toLowerCase() === depositProxyContractInfo.address.toLowerCase() && internalTxs.filter(iTx => iTx.contractAddress.toLowerCase() === tokenConfig.idle.address.toLowerCase()).length>0 ));
        const isRedeemTx = isRightToken && !isMigrationTx && !isDepositInternalTx && tx.contractAddress.toLowerCase() === tokenConfig.address.toLowerCase() && internalTxs.filter(iTx => iTx.contractAddress.toLowerCase() === tokenConfig.idle.address.toLowerCase()).length && tx.to.toLowerCase() === this.props.account.toLowerCase();
        const isWithdrawTx = internalTxs.length>1 && internalTxs.filter(iTx => tokenConfig.protocols.map(p => p.address.toLowerCase()).includes(iTx.contractAddress.toLowerCase()) ).length>0 && tx.contractAddress.toLowerCase() === tokenConfig.idle.address.toLowerCase();

        // const curveDepositTx = internalTxs.find( iTx => (iTx.contractAddress.toLowerCase() === tokenConfig.address.toLowerCase() && iTx.from.toLowerCase() === this.props.account.toLowerCase()) );
        const idleTokenAddress = curveTokenConfig && curveTokenConfig.address ? curveTokenConfig.address : tokenConfig.idle.address;

        // Check Curve
        const curveTx = internalTxs.find( tx => (tx.contractAddress.toLowerCase() === curvePoolContract.address.toLowerCase() && (tx.to.toLowerCase() === this.props.account.toLowerCase() || tx.from.toLowerCase() === this.props.account.toLowerCase()) ) );
        const isCurveTx = curveTx !== undefined;

        const isCurveDepositTx = isCurveTx && tx.contractAddress.toLowerCase() === idleTokenAddress.toLowerCase() && tx.to.toLowerCase() === curveSwapContract.address.toLowerCase() && tx.from.toLowerCase() === this.props.account.toLowerCase() && this.BNify(tx.value).gt(0);
        const isCurveRedeemTx = isCurveTx && tx.contractAddress.toLowerCase() === idleTokenAddress.toLowerCase() && tx.to.toLowerCase() === this.props.account.toLowerCase() && tx.from.toLowerCase() === curveSwapContract.address.toLowerCase() && this.BNify(tx.value).gt(0);

        const isCurveDepositIn = isCurveTx && tx.contractAddress.toLowerCase() === tokenConfig.address.toLowerCase() && tx.from.toLowerCase() === this.props.account.toLowerCase() && tx.to.toLowerCase() === curveDepositContract.address.toLowerCase() && this.BNify(tx.value).gt(0);
        const isCurveDepositOut = isCurveTx && tx.contractAddress.toLowerCase() === tokenConfig.address.toLowerCase() && tx.to.toLowerCase() === this.props.account.toLowerCase() && tx.from.toLowerCase() === curveDepositContract.address.toLowerCase() && this.BNify(tx.value).gt(0);

        const isCurveZapIn = isCurveTx && tx.contractAddress.toLowerCase() === curvePoolContract.address.toLowerCase() && tx.to.toLowerCase() === this.props.account.toLowerCase() && tx.from.toLowerCase() === curveZapContract.address.toLowerCase() && this.BNify(tx.value).gt(0);
        const isCurveZapOut = isCurveTx && tx.contractAddress.toLowerCase() === curvePoolContract.address.toLowerCase() && tx.from.toLowerCase() === this.props.account.toLowerCase() && tx.to.toLowerCase() === curveZapContract.address.toLowerCase() && this.BNify(tx.value).gt(0);

        const isCurveTransferOut = tx.contractAddress.toLowerCase() === curvePoolContract.address.toLowerCase() && !isCurveZapOut && !isCurveRedeemTx && /*internalTxs[internalTxs.length-1] === tx &&*/ tx.from.toLowerCase() === this.props.account.toLowerCase();
        const isCurveTransferIn = tx.contractAddress.toLowerCase() === curvePoolContract.address.toLowerCase() && !isCurveZapIn && !isCurveDepositTx && /*internalTxs[internalTxs.length-1] === tx &&*/ tx.to.toLowerCase() === this.props.account.toLowerCase();

        const isSwapOutTx = !isCurveTx && !isSendTransferTx && !isWithdrawTx && !isRedeemInternalTx && !etherscanTxs[tx.hash] && tx.from.toLowerCase() === this.props.account.toLowerCase() && tx.contractAddress.toLowerCase() === tokenConfig.idle.address.toLowerCase();
        const isSwapTx = !isCurveTx && !isReceiveTransferTx && !isConversionTx && !isDepositInternalTx && !etherscanTxs[tx.hash] && tx.to.toLowerCase() === this.props.account.toLowerCase() && tx.contractAddress.toLowerCase() === tokenConfig.idle.address.toLowerCase();

        // if (tx.hash.toLowerCase() === '0x599a2e7b0094b0a943ffb1d520cb47598dcf3764145c33824e3b032d91ccc489'.toLowerCase()){
        //   debugger;
        // }

        if (isSendTransferTx || isReceiveTransferTx || isMigrationTx || isDepositTx || isRedeemTx || isSwapTx || isSwapOutTx || isWithdrawTx || isConversionTx || isCurveDepositTx || isCurveRedeemTx || isCurveZapIn || isCurveZapOut || isCurveTransferOut || isCurveTransferIn || isCurveDepositIn || isCurveDepositOut){

          let action = null;
          let hashKey = tx.hash;

          if (isDepositTx){
            action = 'Deposit';
          } else if (isRedeemTx){
            action = 'Redeem';
          } else if (isMigrationTx || isConversionTx){
            action = 'Migrate';
          } else if (isSendTransferTx){
            action = 'Send';
          } else if (isReceiveTransferTx){
            action = 'Receive';
          } else if (isSwapTx){
            action = 'Swap';
          } else if (isSwapOutTx){
            action = 'SwapOut';
          } else if (isWithdrawTx){
            action = 'Withdraw';
          } else if (isCurveDepositTx){
            action = 'CurveIn';
          } else if (isCurveRedeemTx){
            action = 'CurveOut';
          } else if (isCurveZapIn){
            action = 'CurveZapIn';
          } else if (isCurveZapOut){
            action = 'CurveZapOut';
          } else if (isCurveDepositIn){
            action = 'CurveDepositIn';
          } else if (isCurveDepositOut){
            action = 'CurveDepositOut';
          } else if (isCurveTransferIn){
            action = 'CurveTransferIn';
          } else if (isCurveTransferOut){
            action = 'CurveTransferOut';
          }

          let curveTokens = null;
          if (isCurveTx){
            hashKey += '_'+tx.tokenSymbol;
            curveTokens = this.fixTokenDecimals(curveTx.value,curvePoolContract.decimals);

            // Add action for curve tokens transfers
            if ((isCurveTransferIn || isCurveTransferOut)){
              hashKey+='_'+action;
            }
          }

          // this.customLog('SAVE!',action);

          if (tx.contractAddress.toLowerCase() === tokenConfig.idle.address.toLowerCase()){
            tokenDecimals = 18;
          } else if (isCurveTx){
            tokenDecimals = parseInt(tx.tokenDecimal);
          }

          // Sum the value if already processed
          if (etherscanTxs[hashKey]){
            // Prevent second internal tx to sum SwapOut original value
            switch (etherscanTxs[hashKey].action){
              case 'SwapOut':
                if (etherscanTxs[hashKey].action !== action && isRedeemTx){
                  etherscanTxs[hashKey].tokenValue = this.fixTokenDecimals(tx.value,tokenDecimals);
                }
              break;
              default:
                if (!curveTx){
                  const newValue = etherscanTxs[hashKey].value.plus(this.fixTokenDecimals(tx.value,tokenDecimals));
                  etherscanTxs[hashKey].value = newValue;
                }
              break;
            }
          } else {
            // Insert tx in curve transfers buffer
            if (isCurveTransferIn || isCurveTransferOut){
              if (!curveTransfersTxsToDelete.includes(tx.hash.toLowerCase())){
                curveTokens = this.fixTokenDecimals(tx.value,curvePoolContract.decimals);
                curveTransfersTxs.push({...tx, hashKey, token, idleToken, curveTokens, action, value: this.fixTokenDecimals(tx.value,tokenDecimals)});
              }
            } else {
              etherscanTxs[hashKey] = ({...tx, hashKey, token, idleToken, curveTokens, action, value: this.fixTokenDecimals(tx.value,tokenDecimals)});

              // Delete curveTransfers
              if (!curveTransfersTxsToDelete.includes(tx.hash.toLowerCase())){
                curveTransfersTxsToDelete.push(tx.hash.toLowerCase());
              }

              // Take right tokenSymbol
              switch (action){
                case 'Withdraw':
                  const iTxs = internalTxs.filter(iTx => (iTx !== tx));
                  if (iTxs.length>0){
                    const iTx = iTxs[0];
                    etherscanTxs[hashKey].withdrawnValue = this.fixTokenDecimals(iTx.value,iTx.tokenDecimal);
                    etherscanTxs[hashKey].tokenSymbol = iTx.tokenSymbol;
                  }
                break;
                case 'CurveIn':
                case 'CurveOut':
                case 'CurveZapIn':
                case 'CurveZapOut':
                case 'CurveDepositIn':
                case 'CurveDepositOut':
                  etherscanTxs[hashKey].tokenSymbol = token;
                break;
                default:
                break;
              }
            }   
          }
        }
      });
    });
    
    curveTransfersTxs.forEach( tx => {
      if (!curveTransfersTxsToDelete.includes(tx.hash.toLowerCase())){
        etherscanTxs[tx.hashKey] = tx;
      }
    });
  
    if (processTxs){
      etherscanTxs = await this.processEtherscanTransactions(etherscanTxs,enabledTokens,processStoredTxs);
    }

    // console.log('etherscanTxs',etherscanTxs);

    return etherscanTxs;
  }
  addStoredTransaction = (txKey,transaction) => {

    const account = this.props && this.props.account ? this.props.account : null;
    const selectedToken = this.props && this.props.selectedToken ? this.props.selectedToken : null;

    if (!account || !selectedToken || !this.props.availableTokens || !this.props.availableTokens[selectedToken]){
      return false;
    }

    const tokenConfig = this.props.availableTokens[selectedToken];
    const tokenKey = tokenConfig.idle.token;

    let storedTxs = this.getStoredTransactions();
    if (!storedTxs[account]){
      storedTxs[account] = {};
    }

    if (!storedTxs[account][tokenKey]){
      storedTxs[account][tokenKey] = {};
    }

    storedTxs[account][tokenKey][txKey] = transaction;
    this.updateStoredTransactions(storedTxs);
  }
  updateStoredTransactions = transactions => {
    this.setLocalStorage('transactions',JSON.stringify(transactions));
  }
  /*
  Merge storedTxs with this.props.transactions
  */
  getStoredTransactions = (account=null,tokenKey=null,selectedToken=null) => {
    const storedTxs = this.getStoredItem('transactions',true,{});
    const transactions = this.props.transactions ? { ...this.props.transactions } : {};
    let output = storedTxs;

    if (account){
      if (storedTxs[account]){
        output = storedTxs[account];
        if (tokenKey){
          output = output[tokenKey] ? output[tokenKey] : {};

          if (selectedToken){
            Object.keys(transactions).forEach(txKey => {
              const tx = transactions[txKey];
              if (!output[txKey] && tx.token && tx.token.toUpperCase() === selectedToken.toUpperCase()){
                output[txKey] = transactions[txKey];
              }
            });
          }
        }
      } else {
        output = {};
      }
    }

    return output;
  }
  processEtherscanTransactions = async (etherscanTxs,enabledTokens=[],processStoredTxs=true) => {

    if (!enabledTokens || !enabledTokens.length){
      enabledTokens = Object.keys(this.props.availableTokens);
    }

    let txReceipts = {};
    let storedTxs = this.getStoredTransactions();

    // Init storedTxs for pair account-token if empty
    if (typeof storedTxs[this.props.account] !== 'object'){
      storedTxs[this.props.account] = {};
    }

    // Take base tokens addresses and configs
    const baseTokensConfigs = {};
    const baseTokensAddresses = [];
    const curveAvailableTokens = this.getGlobalConfig(['curve','availableTokens']);
    Object.keys(curveAvailableTokens).forEach( token => {
      const curveTokenConfig = curveAvailableTokens[token];
      const baseTokenConfig = this.getGlobalConfig(['stats','tokens',curveTokenConfig.baseToken]);
      const baseTokenAddress = baseTokenConfig.address.toLowerCase();
      baseTokensConfigs[baseTokenAddress] = baseTokenConfig;
      baseTokensConfigs[baseTokenAddress].token = curveTokenConfig.baseToken;
      baseTokensAddresses.push(baseTokenAddress);
    });

    const curveZapContract = this.getGlobalConfig(['curve','zapContract']);
    // const curvePoolContract = this.getGlobalConfig(['curve','poolContract']);
    // const curveSwapContract = this.getGlobalConfig(['curve','migrationContract']);
    // const curveDepositContract = this.getGlobalConfig(['curve','depositContract']);

    await this.asyncForEach(enabledTokens,async (selectedToken) => {

      const tokenConfig = this.props.availableTokens[selectedToken];
      const tokenKey = tokenConfig.idle.token;
      const idleToken = tokenConfig.idle.token;

      // Init storedTxs for pair account-token if empty
      if (typeof storedTxs[this.props.account][tokenKey] !== 'object'){
        storedTxs[this.props.account][tokenKey] = {};
      }

      const minedTxs = {...storedTxs[this.props.account][tokenKey]};

      const filteredTxs = Object.values(etherscanTxs).filter(tx => (tx.token === selectedToken));
      if (filteredTxs && filteredTxs.length){

        await this.asyncForEach(filteredTxs,async (tx,index) => {
          const txKey = `tx${tx.timeStamp}000`;
          const storedTx = storedTxs[this.props.account][tokenKey][txKey] ? storedTxs[this.props.account][tokenKey][txKey] : tx;

          let tokenPrice = null;
          
          if (storedTx.tokenPrice && !this.BNify(storedTx.tokenPrice).isNaN()){
            tokenPrice = this.BNify(storedTx.tokenPrice);
          } else {
            tokenPrice = await this.getIdleTokenPrice(tokenConfig,tx.blockNumber,tx.timeStamp);
            storedTx.tokenPrice = tokenPrice;
          }

          let idleTokens = this.BNify(tx.value);
          let tokensTransfered = tokenPrice.times(idleTokens);

          // Add transactionHash to storedTx
          if (!storedTx.transactionHash){
            storedTx.transactionHash = tx.hash;
          }

          // Deposited
          switch (tx.action){
            case 'Send':
            case 'Receive':
            case 'Swap':
            case 'SwapOut':
            case 'Migrate':
              if (!storedTx.tokenAmount){
                storedTx.idleTokens = idleTokens;
                storedTx.value = tokensTransfered;
                storedTx.tokenAmount = tokensTransfered;
                storedTx.tokenSymbol = selectedToken;
              }
            break;
            case 'Deposit':
            case 'Redeem':
              if (!storedTx.tokenAmount){
                storedTx.value = idleTokens;
                storedTx.tokenAmount = idleTokens;
                storedTx.idleTokens = idleTokens.div(tokenPrice);
              }
            break;
            case 'Withdraw':
              if (!storedTx.tokenAmount){
                storedTx.idleTokens = idleTokens;
                storedTx.tokenAmount = tokensTransfered;
                storedTx.value = storedTx.withdrawnValue;
              }
            break;
            case 'CurveIn':
            case 'CurveOut':
              if (!storedTx.tokenAmount){
                const curveTokenPrice = await this.getCurveTokenPrice(tx.blockNumber);
                storedTx.idleTokens = idleTokens;
                storedTx.tokenAmount = tokensTransfered;
                storedTx.curveTokenPrice = curveTokenPrice;
              }
            break;
            case 'CurveTransferIn':
            case 'CurveTransferOut':
              if (!storedTx.curveTokenPrice){
                const curveTokenPrice = await this.getCurveTokenPrice(tx.blockNumber);
                storedTx.curveTokenPrice = curveTokenPrice;
                storedTx.tokenAmount = this.BNify(storedTx.curveTokens).times(storedTx.curveTokenPrice);
              }

              storedTx.idleTokens = this.BNify(0);
            break;
            case 'CurveZapIn':
            case 'CurveZapOut':
              if (!storedTx.curveTokenPrice){
                const curveTokenPrice = await this.getCurveTokenPrice(tx.blockNumber);
                storedTx.curveTokenPrice = curveTokenPrice;
              }

              if (!storedTx.tokenAmount){

                storedTx.tokenAmount = this.BNify(0);
                storedTx.idleTokens = this.BNify(0);

                const curveTxReceipt = txReceipts[tx.hashKey] ? txReceipts[tx.hashKey] : await (new Promise( async (resolve, reject) => {
                  this.props.web3.eth.getTransactionReceipt(tx.hash,(err,tx)=>{
                    if (err){
                      reject(err);
                    }
                    resolve(tx);
                  });
                }));

                if (curveTxReceipt){

                  // Save receipt
                  if (!txReceipts[tx.hashKey]){
                    txReceipts[tx.hashKey] = curveTxReceipt;
                  }

                  const filteredLogs = curveTxReceipt.logs.filter( log => (baseTokensAddresses.includes(log.address.toLowerCase()) && log.topics[log.topics.length-1].toLowerCase() === `0x00000000000000000000000${curveZapContract.address.replace('x','').toLowerCase()}` ) );

                  this.customLog('filteredLogs',filteredLogs);

                  if (filteredLogs && filteredLogs.length){
                    filteredLogs.forEach( log => {
                      let tokenAmount = parseInt(log.data,16);
                      const baseTokensConfig = baseTokensConfigs[log.address.toLowerCase()];
                      const tokenDecimals = baseTokensConfig.decimals;
                      tokenAmount = this.fixTokenDecimals(tokenAmount,tokenDecimals);
                      storedTx.tokenAmount = storedTx.tokenAmount.plus(tokenAmount);
                      this.customLog('Add tokenAmount ('+tx.hash+')',baseTokensConfig.token,tokenAmount.toFixed(5),storedTx.tokenAmount.toFixed(5));
                    });
                  }
                }
              }
            break;
            case 'CurveDepositIn':
            case 'CurveDepositOut':
              if (!storedTx.curveTokenPrice){
                const curveTokenPrice = await this.getCurveTokenPrice(tx.blockNumber);
                storedTx.curveTokenPrice = curveTokenPrice;
              }

              storedTx.tokenAmount = this.BNify(storedTx.value);

              if (!storedTx.idleTokens){

                const curveTxReceipt = txReceipts[tx.hashKey] ? txReceipts[tx.hashKey] : await (new Promise( async (resolve, reject) => {
                  this.props.web3.eth.getTransactionReceipt(tx.hash,(err,tx)=>{
                    if (err){
                      reject(err);
                    }
                    resolve(tx);
                  });
                }));

                if (curveTxReceipt){
                  const curveTokenConfig = this.getGlobalConfig(['curve','availableTokens',idleToken]);
                  const idleTokenDecimals = curveTokenConfig && curveTokenConfig.decimals ? curveTokenConfig.decimals : 18;
                  const idleTokenAddress = curveTokenConfig && curveTokenConfig.address ? curveTokenConfig.address : tokenConfig.idle.address;

                  // Save receipt
                  if (!txReceipts[tx.hashKey]){
                    txReceipts[tx.hashKey] = curveTxReceipt;
                  }

                  const filteredLogs = curveTxReceipt.logs.filter( log => (log.address.toLowerCase()===idleTokenAddress ) );
                  if (filteredLogs && filteredLogs.length){
                    idleTokens = parseInt(filteredLogs[0].data,16);
                    idleTokens = this.fixTokenDecimals(idleTokens,idleTokenDecimals);
                    storedTx.idleTokens = idleTokens;
                  }
                }
              }
            break;
            default:
            break;
          }
            
          // Save token for future filtering
          storedTx.token = selectedToken;

          // Save processed tx
          etherscanTxs[tx.hashKey] = storedTx;

          // Store processed Tx
          storedTxs[this.props.account][tokenKey][txKey] = storedTx;

          // Remove from minted Txs
          delete minedTxs[txKey];
        });
      }

      // Process Stored txs
      if (processStoredTxs){
        etherscanTxs = await this.processStoredTxs(etherscanTxs,[selectedToken],this.props.transactions);
      }
    });

    // Update Stored txs
    if (storedTxs){
      this.updateStoredTransactions(storedTxs);
    }

    return etherscanTxs;
  }
  processStoredTxs = async (etherscanTxs,enabledTokens=[],txsToProcess=null) => {

    if (!enabledTokens || !enabledTokens.length){
      enabledTokens = Object.keys(this.props.availableTokens);
    }

    let storedTxs = this.getStoredItem('transactions',true,{})

    // Init storedTxs
    if (!storedTxs[this.props.account]){
      storedTxs[this.props.account] = {};
    }

    etherscanTxs = Object.assign({},etherscanTxs);

    const networkId = this.props.network.current.id || this.getGlobalConfig(['network','requiredNetwork']);

    // this.customLog('Processing stored txs',enabledTokens);

    await this.asyncForEach(enabledTokens,async (selectedToken) => {

      const tokenConfig = this.props.availableTokens[selectedToken];
      const tokenKey = tokenConfig.idle.token;

      // Init storedTxs
      if (!storedTxs[this.props.account][tokenKey]){
        storedTxs[this.props.account][tokenKey] = {};
      }

      txsToProcess = txsToProcess && Object.values(txsToProcess).length ? txsToProcess : this.getStoredTransactions(this.props.account,tokenKey,selectedToken);
      
      // this.customLog('txsToProcess',selectedToken,txsToProcess);

      // if (!Object.values(txsToProcess).length && selectedToken==='DAI' && Object.values(this.props.transactions).length>0){
      //   debugger;
      // }

      // Debug transactions
      /*
      txsToProcess['xxxxx'] = {
        status:'success',
        created:Date.now(),
        method:'executeMetaTransaction',
        token:selectedToken.toUpperCase(),
        transactionHash:'0x000000000000000000000000000'
      };
      */

      await this.asyncForEach(Object.keys(txsToProcess),async (txKey,i) => {
        const tx = txsToProcess[txKey];

        // Skip wrong token
        if (!tx || !tx.token || tx.token.toUpperCase() !== selectedToken.toUpperCase() || (tx.networkId && parseInt(tx.networkId) !== parseInt(networkId))){
          return false;
        }

        const isStoredTx = storedTxs && storedTxs[this.props.account] && storedTxs[this.props.account][tokenKey] && storedTxs[this.props.account][tokenKey][txKey];

        const allowedMethods = {
          mintIdleToken:'Deposit',
          redeemIdleToken:'Redeem',
          migrateFromToIdle:'Migrate',
          mintIdleTokensProxy:'Deposit',
          migrateFromAaveToIdle:'Migrate',
          migrateFromIearnToIdle:'Migrate',
          executeMetaTransaction:'Migrate',
          migrateFromFulcrumToIdle:'Migrate',
          migrateFromCompoundToIdle:'Migrate',
        };
        const pendingStatus = ['pending','started'];
        const txSucceeded = tx.status === 'success';
        const txPending = pendingStatus.includes(tx.status);
        const isMetaTx = tx.method === 'executeMetaTransaction';
        const txHash = tx.transactionHash ? tx.transactionHash : null;
        const methodIsAllowed = Object.keys(allowedMethods).includes(tx.method);

        // Skip transaction if already present in etherscanTxs with same status
        if (txHash && etherscanTxs[txHash] && etherscanTxs[txHash].tokenPrice){
          return false;
        }

        if (txPending && txHash && !etherscanTxs[txHash] && methodIsAllowed && tx.params.length){
          // this.customLog('processStoredTxs',tx.method,tx.status,tx.params);
          const isMigrationTx = allowedMethods[tx.method] === 'Migrate';
          const decimals = isMigrationTx ? 18 : tokenConfig.decimals;
          etherscanTxs[`t${tx.created}`] = {
            status:'Pending',
            token:selectedToken,
            action:allowedMethods[tx.method],
            timeStamp:parseInt(tx.created/1000),
            hash:txHash ? tx.transactionHash : null,
            tokenSymbol:isMigrationTx ? tokenConfig.idle.token : selectedToken,
            value: tx.value ? tx.value : this.fixTokenDecimals(tx.params[0],decimals).toString()
          };

          return false;
        }

        // Skip invalid txs
        if (!txSucceeded || !txHash || !methodIsAllowed){
          return false;
        }

        let realTx = tx.realTx ? tx.realTx : null;

        if (!realTx){
          // this.customLog('loadTxs - getTransaction',tx.transactionHash);
          realTx = await (new Promise( async (resolve, reject) => {
            this.props.web3.eth.getTransaction(tx.transactionHash,(err,txReceipt)=>{
              if (err){
                reject(err);
              }
              resolve(txReceipt);
            });
          }));
        }

        // this.customLog('realTx (localStorage)',realTx);

        // Skip txs from other wallets if not meta-txs
        if (!realTx || (!isMetaTx && realTx.from.toLowerCase() !== this.props.account.toLowerCase())){
          return false;
        }

        const tokenPrice = await this.getIdleTokenPrice(tokenConfig,realTx.blockNumber,realTx.timeStamp);

        realTx.status = 'Completed';
        realTx.action = allowedMethods[tx.method];
        realTx.contractAddress = tokenConfig.address;
        realTx.timeStamp = parseInt(tx.created/1000);

        let txValue = null;
        switch (tx.method){
          case 'mintIdleToken':
          case 'mintIdleTokensProxy':
            if (!tx.params){
              if (isStoredTx){
                storedTxs[this.props.account][tokenKey][txKey] = tx;
              }
              return false;
            }

            if (realTx.to.toLowerCase() !== tokenConfig.idle.address.toLowerCase()){
              // Remove wrong contract tx
              if (isStoredTx){
                delete storedTxs[this.props.account][tokenKey][txKey];
              }
              // this.customLog('Skipped deposit tx '+tx.transactionHash+' - wrong contract');
              return false;
            }

            txValue = tx.params ? this.fixTokenDecimals(tx.params[0],tokenConfig.decimals).toString() : 0;
            if (!txValue){
              // this.customLog('Skipped deposit tx '+tx.transactionHash+' - value is zero ('+txValue+')');
              return false;
            }

            realTx.value = txValue;
            realTx.tokenAmount = txValue;
          break;
          case 'redeemIdleToken':
            if (!tx.params){
              if (isStoredTx){
                storedTxs[this.props.account][tokenKey][txKey] = tx;
              }
              return false;
            }

            if (!realTx.tokenPrice){
              const redeemedValueFixed = this.fixTokenDecimals(tx.params[0],18).times(tokenPrice);
              realTx.tokenPrice = tokenPrice;
              realTx.value = redeemedValueFixed;
              realTx.tokenAmount = redeemedValueFixed;
            }
          break;
          case 'executeMetaTransaction':
            let executeMetaTransactionReceipt = tx.txReceipt ? tx.txReceipt : null;

            if (!executeMetaTransactionReceipt){
              executeMetaTransactionReceipt = await (new Promise( async (resolve, reject) => {
                this.props.web3.eth.getTransactionReceipt(tx.transactionHash,(err,tx)=>{
                  if (err){
                    reject(err);
                  }
                  resolve(tx);
                });
              }));
            }

            if (!executeMetaTransactionReceipt){
              return false;
            }

            // Save txReceipt into the tx
            if (!tx.txReceipt){
              tx.txReceipt = executeMetaTransactionReceipt;
              if (isStoredTx){
                storedTxs[this.props.account][tokenKey][txKey] = tx;
              }
            }

            let action = null;
            let executeMetaTransactionContractAddr = null;
            let executeMetaTransactionInternalTransfers = [];
            const IdleProxyMinterInfo = this.getGlobalConfig(['contract','deposit','proxyContract']);

            // Handle migration tx
            if (tokenConfig.migration && tokenConfig.migration.oldContract){
              if (executeMetaTransactionReceipt.logs){
                executeMetaTransactionContractAddr = tokenConfig.migration.oldContract.address.replace('x','').toLowerCase();
                executeMetaTransactionInternalTransfers = executeMetaTransactionReceipt.logs.filter((tx) => { return tx.address.toLowerCase()===tokenConfig.address.toLowerCase() && tx.topics[tx.topics.length-1].toLowerCase() === `0x00000000000000000000000${executeMetaTransactionContractAddr}`; });
              } else if (executeMetaTransactionReceipt.events){
                executeMetaTransactionInternalTransfers = Object.values(executeMetaTransactionReceipt.events).filter((tx) => { return tx.address.toLowerCase()===tokenConfig.address.toLowerCase(); });
              }

              if (executeMetaTransactionInternalTransfers.length){
                action = 'Migrate';
              }
            }

            // Handle deposit tx
            if (!executeMetaTransactionInternalTransfers.length){
              if (executeMetaTransactionReceipt.logs){
                executeMetaTransactionContractAddr = tokenConfig.idle.address.replace('x','').toLowerCase();
                executeMetaTransactionInternalTransfers = executeMetaTransactionReceipt.logs.filter((tx) => { return tx.address.toLowerCase()===tokenConfig.address.toLowerCase() && tx.topics[tx.topics.length-1].toLowerCase() === `0x00000000000000000000000${executeMetaTransactionContractAddr}`; });

                // Handle deposit made with proxy contract
                if (!executeMetaTransactionInternalTransfers.length && IdleProxyMinterInfo){
                  executeMetaTransactionContractAddr = IdleProxyMinterInfo.address.replace('x','').toLowerCase();
                  executeMetaTransactionInternalTransfers = executeMetaTransactionReceipt.logs.filter((tx) => { return tx.address.toLowerCase()===tokenConfig.address.toLowerCase() && tx.topics[tx.topics.length-1].toLowerCase() === `0x00000000000000000000000${executeMetaTransactionContractAddr}`; });
                }
              } else if (executeMetaTransactionReceipt.events){
                executeMetaTransactionInternalTransfers = Object.values(executeMetaTransactionReceipt.events).filter((tx) => { return tx.address.toLowerCase()===tokenConfig.address.toLowerCase(); });
              }

              if (executeMetaTransactionInternalTransfers.length){
                action = 'Deposit';
              }
            }

            if (!executeMetaTransactionInternalTransfers.length){
              return false;
            }

            const internalTransfer = executeMetaTransactionInternalTransfers[0];

            const metaTxValue = internalTransfer.data ? parseInt(internalTransfer.data,16) : (internalTransfer.raw && internalTransfer.raw.data) ? parseInt(internalTransfer.raw.data,16) : null;

            if (!metaTxValue){
              return false;
            }

            const metaTxValueFixed = this.fixTokenDecimals(metaTxValue,tokenConfig.decimals);
            realTx.action = action;
            realTx.value = metaTxValueFixed;
            realTx.tokenAmount = metaTxValueFixed;
            // this.customLog(metaTxValueFixed.toString());
          break;
          case 'migrateFromCompoundToIdle':
          case 'migrateFromFulcrumToIdle':
          case 'migrateFromAaveToIdle':
          case 'migrateFromIearnToIdle':
          case 'migrateFromToIdle':
            if (!tokenConfig.migration || !tokenConfig.migration.oldContract){
              return false;
            }

            let migrationTxReceipt = tx.txReceipt ? tx.txReceipt : null;

            if (!migrationTxReceipt){
              migrationTxReceipt = await (new Promise( async (resolve, reject) => {
                this.props.web3.eth.getTransactionReceipt(tx.transactionHash,(err,tx)=>{
                  if (err){
                    reject(err);
                  }
                  resolve(tx);
                });
              }));
            }

            if (!migrationTxReceipt){
              return false;
            }

            // Save txReceipt into the tx
            if (!tx.txReceipt){
              tx.txReceipt = migrationTxReceipt;
              if (isStoredTx){
                storedTxs[this.props.account][tokenKey][txKey] = tx;
              }
            }

            const migrationContractAddr = tokenConfig.migration.migrationContract.address.toLowerCase().replace('x','');
            const contractAddress = tokenConfig.idle.address.toLowerCase().replace('x','');
            const migrationTxInternalTransfers = migrationTxReceipt.logs.filter((tx) => { return tx.topics.length>=3 && tx.topics[tx.topics.length-2].toLowerCase() === `0x00000000000000000000000${migrationContractAddr}` && tx.topics[tx.topics.length-1].toLowerCase() === `0x00000000000000000000000${contractAddress}`; });

            if (!migrationTxInternalTransfers.length){
              return false;
            }

            const migrationInternalTransfer = migrationTxInternalTransfers.pop();

            const decodedLogs = this.props.web3.eth.abi.decodeLog([
              {
                internalType: "uint256",
                name: "_token",
                type: "uint256"
              },
            ],migrationInternalTransfer.data,migrationInternalTransfer.topics);

            if (!decodedLogs || !decodedLogs._token){
              return false;
            }

            const migrationValue = decodedLogs._token;
            const migrationValueFixed = this.fixTokenDecimals(migrationValue,tokenConfig.decimals);
            realTx.value = migrationValueFixed.toString();
          break;
          default:
          break;
        }

        realTx.tokenPrice = tokenPrice;
        realTx.token = selectedToken;
        realTx.tokenSymbol = selectedToken;
        realTx.idleTokens = tokenPrice.times(this.BNify(realTx.value));

        // Save processed tx
        etherscanTxs[txHash] = realTx;
        // etherscanTxs.push(realTx);

        // Store processed Tx
        if (!tx.realTx){
          tx.realTx = realTx;
          storedTxs[this.props.account][tokenKey][txKey] = tx;
        }
      });
    });

    // Update Stored Txs
    if (storedTxs){
      this.updateStoredTransactions(storedTxs);
    }

    return etherscanTxs;
  }
  saveCachedRequest = (endpoint,alias=false,data) => {
    const key = alias ? alias : endpoint;
    let cachedRequests = this.getCachedDataWithLocalStorage('cachedRequests',{});
    const timestamp = parseInt(Date.now()/1000);
    cachedRequests[key] = {
      data,
      timestamp
    };
    return this.setCachedDataWithLocalStorage('cachedRequests',cachedRequests);
  }
  getCustomAddress = () => {
    return this.getStoredItem('customAddress',false);
  }
  setCustomAddress = (customAddress) => {
    return this.setLocalStorage('customAddress',customAddress);
  }
  getCachedRequest = (endpoint,alias=false) => {
    const key = alias ? alias : endpoint;
    let cachedRequests = this.getCachedDataWithLocalStorage('cachedRequests',{});
    // Check if it's not expired
    if (cachedRequests && cachedRequests[key]){
      return cachedRequests[key].data;
    }
    return null;
  }
  makeRequest = async(endpoint,error_callback=false,config=null) => {
    const data = await axios
                  .get(endpoint,config)
                  .catch(err => {
                    if (typeof error_callback === 'function'){
                      error_callback(err);
                    }
                  });
    return data;
  }
  makeEtherscanApiRequest = async (endpoint,keys=[],TTL=120,apiKeyIndex=0) => {
    const timestamp = parseInt(Date.now()/1000);
    
    // Check if already exists
    let cachedRequests = this.getCachedDataWithLocalStorage('cachedRequests',{});
    // Check if it's not expired
    if (cachedRequests && cachedRequests[endpoint] && cachedRequests[endpoint].timestamp && timestamp-cachedRequests[endpoint].timestamp<TTL){
      return cachedRequests[endpoint].data;
    }

    const apiKey = keys[apiKeyIndex];
    const data = await this.makeRequest(endpoint+'&apikey='+apiKey);

    // console.log('makeEtherscanApiRequest',endpoint,apiKeyIndex+'/'+keys.length,(data.data ? data.data.message : null),apiKeyIndex<keys.length-1);

    if (data && data.data && data.data.message === 'OK'){
      cachedRequests[endpoint] = {
        data,
        timestamp
      };
      this.setCachedDataWithLocalStorage('cachedRequests',cachedRequests);
      return data;
    } else if (apiKeyIndex<keys.length-1) {
      return await this.makeEtherscanApiRequest(endpoint,keys,TTL,apiKeyIndex+1);
    }
    return null;
  }
  makeCachedRequest = async (endpoint,TTL=60,return_data=false,alias=false,config=null) => {
    const key = alias ? alias : endpoint;
    const timestamp = parseInt(Date.now()/1000);
    
    // Check if already exists
    const cachedRequests = this.getCachedDataWithLocalStorage('cachedRequests',{});
    // Check if it's not expired
    if (cachedRequests && cachedRequests[key] && cachedRequests[key].timestamp && timestamp-cachedRequests[key].timestamp<TTL){
      return (cachedRequests[key].data && return_data ? cachedRequests[key].data.data : cachedRequests[key].data);
    }

    const data = await this.makeRequest(endpoint,false,config);

    cachedRequests[key] = {
      data,
      timestamp
    };
    this.setCachedDataWithLocalStorage('cachedRequests',cachedRequests);
    return (data && return_data ? data.data : data);
  }
  getTransactionError = error => {
    let output = 'error';
    if (parseInt(error.code)){
      const errorCode = parseInt(error.code);
      switch (errorCode){
        case 4001:
          output = 'denied';
        break;
        default:
          output = `error_${errorCode}`;
        break;
      }
    } else if (error.message){
      output = error.message.split("\n")[0]; // Take just the first line of the error
    }

    return output;
  }
  getGlobalConfigs = () => {
    return globalConfigs;
  }
  getArrayPath = (path,array) => {
    path = Object.assign([],path);
    if (path.length>0){
      const prop = path.shift();
      if (!path.length){
        return array[prop] ? array[prop] : null;
      } else if (array[prop]) {
        return this.getArrayPath(path,array[prop]);
      }
    }
    return null;
  }
  getGlobalConfig = (path,configs=false) => {
    configs = configs ? configs : globalConfigs;
    if (path.length>0){
      const prop = path.shift();
      if (!path.length){
        return configs[prop] ? configs[prop] : null;
      } else if (configs[prop]) {
        return this.getGlobalConfig(path,configs[prop]);
      }
    }
    return null;
  }
  checkUrlOrigin = () => {
    return window.location.origin.toLowerCase().includes(globalConfigs.baseURL.toLowerCase());
  }
  checkUrlBeta = () => {
    return window.location.origin.toLowerCase().includes(globalConfigs.betaURL.toLowerCase());
  }
  sendGoogleAnalyticsPageview = async (page=null) => {
    page = page || window.location.hash.substr(1);
    const googlePageviewInfo = this.getGlobalConfig(['analytics','google','pageView']);
    const isOrigin = this.checkUrlOrigin();
    if (googlePageviewInfo.enabled && isOrigin && window.ga){
      window.ga('set', 'page', page);
      window.ga('send', 'pageview');
    }
  }
  sendGoogleAnalyticsEvent = async (eventData,callback=null) => {

    const googleEventsInfo = globalConfigs.analytics.google.events;
    const debugEnabled = googleEventsInfo.debugEnabled;
    const originOk = window.location.origin.toLowerCase().includes(globalConfigs.baseURL.toLowerCase());

    if (googleEventsInfo.enabled && window.ga && ( debugEnabled || originOk)){

      // Check if testnet postfix required
      if (googleEventsInfo.addPostfixForTestnet){
        // Postfix network name if not mainnet
        if (globalConfigs.network.requiredNetwork !== 1){
          const currentNetwork = globalConfigs.network.availableNetworks[globalConfigs.network.requiredNetwork];
          eventData.eventCategory += `_${currentNetwork}`;
        // Postfix test for debug
        } else if (debugEnabled && !originOk) {
          eventData.eventCategory += '_test';
        }
      }

      await (new Promise( async (resolve, reject) => {
        eventData.hitCallback = () => {
          resolve(true);
        };
        eventData.hitCallbackFail = () => {
          reject();
        };

        window.ga('send', 'event', eventData);
      }));

      if (typeof callback === 'function'){
        callback();
      }
    }

    if (typeof callback === 'function'){
      callback();
    }

    return false;
  }
  createContract = async (name, address, abi) => {
    try {
      const contract = new this.props.web3.eth.Contract(abi, address);
      return {name, contract};
    } catch (error) {
      this.customLogError("Could not create contract.",name,address,error);
    }
    return null;
  }
  getWalletProvider = (defaultProvider=null) => {
    return this.getStoredItem('walletProvider',false,defaultProvider);
  }
  simpleIDPassUserInfo = (userInfo,simpleID) => {
    if (!userInfo.address && this.props.account){
      userInfo.address = this.props.account;
    }
    if (!userInfo.provider){
      userInfo.provider = this.getWalletProvider();
    }
    if (typeof userInfo.email !== 'undefined' && !userInfo.email){
      delete userInfo.email;
    }
    if (!userInfo.address){
      return false;
    }
    simpleID = simpleID ? simpleID : (this.props.simpleID ? this.props.simpleID : (typeof this.props.initSimpleID === 'function' ? this.props.initSimpleID() : null));
    if (simpleID){
      return simpleID.passUserInfo(userInfo);
    }
    return false;
  }
  getEtherscanTransactionUrl = (txHash) => {
    const requiredNetwork = this.props.network.current.id || this.getGlobalConfig(['network','requiredNetwork']);
    const baseurl = this.getGlobalConfig(['network','providers','etherscan','baseUrl',requiredNetwork]);
    return txHash ? `${baseurl}/tx/${txHash}` : null;
  }
  getEtherscanAddressUrl = (address) => {
    const requiredNetwork = this.props.network.current.id || this.getGlobalConfig(['network','requiredNetwork']);
    const baseurl = this.getGlobalConfig(['network','providers','etherscan','baseUrl',requiredNetwork]);
    return address ? `${baseurl}/address/${address}` : null;
  }
  formatMoney = (amount, decimalCount = 2, decimal = ".", thousands = ",") => {
    try {
      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

      const negativeSign = amount < 0 ? "-" : "";

      let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
      let j = (i.length > 3) ? i.length % 3 : 0;

      return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
    } catch (e) {
      return null;
    }
  }
  getSnapshotProposals = async (activeOnly=false) => {

    const cachedDataKey = `snapshotProposals_${activeOnly}`;
    const cachedData = this.getCachedData(cachedDataKey);
    if (cachedData){
      return cachedData;
    }

    const whitelist = this.getGlobalConfig(['network','providers','snapshot','whitelist']).map( addr => addr.toLowerCase() );
    const endpoint = this.getGlobalConfig(['network','providers','snapshot','endpoints','proposals']);
    let proposals = await this.makeCachedRequest(endpoint,1440,true);

    if (proposals){
      proposals = Object.values(proposals);

      const currTime = parseInt(Date.now()/1000);
      if (activeOnly){
        proposals =  proposals.filter( p => (p.msg.payload.start<=currTime && p.msg.payload.end>currTime) );
      }

      // console.log(proposals);

      const validProposals = [];
      await this.asyncForEach(proposals, async (p) => {
        // Add proposal if ended
        if (p.msg.payload.end<=currTime || whitelist.includes(p.address.toLowerCase())){
          validProposals.push(p);
        } else {
          const blockNumber = p.msg.payload.snapshot;

          let checkedStrategies = false;
          await this.asyncForEach( p.msg.payload.metadata.strategies, async (s) => {
            if (checkedStrategies){
              return;
            }
            if (s.name==='erc20-balance-of'){
              const tokenName = s.params.symbol;
              const tokenContract = this.getContractByName(tokenName);
              if (tokenContract){
                const tokenBalance = await this.getTokenBalance(tokenName,p.address,true,blockNumber);
                // console.log(p.relayerIpfsHash,p.address,s.name,tokenBalance ? tokenBalance.toFixed() : null);
                if (tokenBalance && this.BNify(tokenBalance).gt(100)){
                  checkedStrategies = true;
                }
              }
            } else {
              // checkedStrategies = true;
            }

            // console.log(p.relayerIpfsHash,p.address,s.name,checkedStrategies);
          });
          
          // Add proposal is passed token balances check
          if (checkedStrategies){
            validProposals.push(p);
          }
        }
      });

      return this.setCachedData(cachedDataKey,validProposals);
    }

  }
  getTokenApiData = async (address,isRisk=null,startTimestamp=null,endTimestamp=null,forceStartTimestamp=false,frequency=null,order=null,limit=null) => {
    if (globalConfigs.network.requiredNetwork!==1 || !globalConfigs.stats.enabled){
      return [];
    }

    // Check for cached data
    const cachedDataKey = `tokenApiData_${address}_${isRisk}_${frequency}_${order}_${limit}`;
    let cachedData = this.getCachedData(cachedDataKey);

    if (cachedData){
      // Check for fittable start and end time
      const filteredCachedData = cachedData.filter( c => ( (c.startTimestamp===null || (startTimestamp && c.startTimestamp<=startTimestamp)) && (c.endTimestamp===null || (endTimestamp && c.endTimestamp>=endTimestamp)) ) )

      if (filteredCachedData && filteredCachedData.length>0){
        const filteredData = filteredCachedData.pop().data;
        if (filteredData){
          return filteredData.filter( d => ((!startTimestamp || d.timestamp>=startTimestamp) && (!endTimestamp || d.timestamp<=endTimestamp)) );
        }
        return null;
      }
    // Initialize cachedData
    } else {
      cachedData = [];
    }

    const apiInfo = globalConfigs.stats.rates;
    let endpoint = `${apiInfo.endpoint}${address}`;

    if (startTimestamp || endTimestamp || isRisk !== null || frequency !== null){
      const params = [];

      if (startTimestamp && parseInt(startTimestamp)){
        if (forceStartTimestamp){
          params.push(`start=${startTimestamp}`);
        } else {
          const start = startTimestamp-(60*60*24*2); // Minus 1 day for Volume graph
          params.push(`start=${start}`);
        }
      }

      if (endTimestamp && parseInt(endTimestamp)){
        params.push(`end=${endTimestamp}`);
      }

      if (isRisk !== null){
        params.push(`isRisk=${isRisk}`);
      }

      if (frequency !== null && parseInt(frequency)){
        params.push(`frequency=${frequency}`);
      }

      if (order !== null){
        params.push(`order=${order}`);
      }

      if (limit !== null && parseInt(limit)){
        params.push(`limit=${limit}`);
      }

      if (params.length){
        endpoint += '?'+params.join('&');
      }
    }

    const config = this.getGlobalConfig(['stats','config']);
    let output = await this.makeRequest(endpoint,false,config);
    if (!output){
      return [];
    }

    const data = output.data;

    let filteredData = null;
    if (isRisk !== null){
      filteredData = data.filter( d => ( d.isRisk === isRisk ) );
    }

    cachedData.push({
      isRisk,
      endTimestamp,
      startTimestamp,
      data:filteredData,
    });

    this.setCachedData(cachedDataKey,cachedData);

    return data;
  }
  getTokenDecimals = async (contractName) => {
    contractName = contractName ? contractName : this.props.selectedToken;
    return await this.genericContractCall(contractName,'decimals');
  }
  getAvgApr = (aprs,allocations,totalAllocation) => {
    if (aprs && allocations && totalAllocation){
      let avgApr = Object.keys(aprs).reduce((aprWeighted,protocolAddr) => {
        const allocation = this.BNify(allocations[protocolAddr]);
        const apr = this.BNify(aprs[protocolAddr]);
        return this.BNify(aprWeighted).plus(allocation.times(apr));
      },0);

      if (avgApr){
        return this.BNify(avgApr).div(totalAllocation);
      }
    }
    return null;
  }
  getFrequencySeconds = (frequency,quantity=1) => {
    const frequency_seconds = {
      hour:3600,
      day:86400,
      week:604800
    };
    return frequency_seconds[frequency]*quantity;
  }
  getIdleStakingRewardsTxs = async () => {
    const idleTokenConfig = this.getGlobalConfig(['govTokens','IDLE']);
    const feeDistributorConfig = this.getGlobalConfig(['tools','stake','props','availableTokens','IDLE','feeDistributor']);
    const etherscanInfo = this.getGlobalConfig(['network','providers','etherscan']);
    const etherscanApiUrl = etherscanInfo.endpoints[1];
    const etherscanEndpoint = `${etherscanApiUrl}?module=account&action=tokentx&address=${feeDistributorConfig.address}&sort=desc`;
    const etherscanTxlist = await this.makeEtherscanApiRequest(etherscanEndpoint,etherscanInfo.keys,3600);
    if (etherscanTxlist && etherscanTxlist.data && etherscanTxlist.data.result && typeof etherscanTxlist.data.result.filter === 'function'){
      return etherscanTxlist.data.result.filter( tx => (tx.contractAddress.toLowerCase() === idleTokenConfig.address.toLowerCase() && tx.to.toLowerCase() === feeDistributorConfig.address.toLowerCase() && this.BNify(tx.value).gt(0) ));
    }
    return [];
  }
  getProtocolInfoByAddress = (addr) => {
    return this.props.tokenConfig.protocols.find(c => c.address.toLowerCase() === addr.toLowerCase());
  }
  integerValue = value => {
    return this.BNify(value).integerValue(BigNumber.ROUND_FLOOR).toFixed();
  }
  normalizeTokenDecimals = tokenDecimals => {
    return this.BNify(`1e${tokenDecimals}`);
  }
  normalizeTokenAmount = (tokenBalance,tokenDecimals,round=true) => {
    const normalizedTokenDecimals = this.normalizeTokenDecimals(tokenDecimals);
    return this.BNify(tokenBalance).times(normalizedTokenDecimals).integerValue(BigNumber.ROUND_FLOOR).toFixed();
  }
  fixTokenDecimals = (tokenBalance,tokenDecimals,exchangeRate=null) => {
    const normalizedTokenDecimals = this.normalizeTokenDecimals(tokenDecimals);
    let balance = this.BNify(tokenBalance).div(normalizedTokenDecimals);
    if (exchangeRate && !exchangeRate.isNaN()){
      balance = balance.times(exchangeRate);
    }
    return balance;
  }
  checkContractPaused = async (contractName=null) => {
    contractName = contractName ? contractName : this.props.tokenConfig.idle.token;
    const contractPaused = await this.genericContractCall(contractName, 'paused', [], {}).catch(err => {
      this.customLogError('Generic Idle call err:', err);
    });
    // this.customLog('checkContractPaused',this.props.tokenConfig.idle.token,contractPaused);
    return contractPaused;
  }
  getStoredItem = (key,parse_json=true,return_default=null) => {
    let output = return_default;
    if (window.localStorage){
      const item = localStorage.getItem(key);
      if (item){
        output = item;
        if (parse_json){
          output = JSON.parse(item);
        }
      }
    }
    if (!output){
      return return_default;
    }
    return output;
  }
  clearStoredData = (excludeKeys=[]) => {
    if (window.localStorage){

      if (!excludeKeys || !excludeKeys.length){
        return window.localStorage.clear();
      }

      const storedKeysToRemove = [];
      for (let i=0;i<window.localStorage.length;i++){
        const storedKey = window.localStorage.key(i);
        if (!excludeKeys.includes(storedKey)){
          storedKeysToRemove.push(storedKey);
        }
      }
      storedKeysToRemove.forEach((storedKey) => {
        this.removeStoredItem(storedKey)
      });
    }
  }
  removeStoredItem = (key) => {
    if (window.localStorage){
      window.localStorage.removeItem(key);
      return true;
    }
    return false;
  }
  setLocalStorage = (key,value,stringify=false) => {
    if (window.localStorage){
      try {
        value = stringify ? JSON.stringify(value) : value;
        window.localStorage.setItem(key,value);
        return true;
      } catch (error) {
        // this.customLog('setLocalStorage',error);
        window.localStorage.removeItem(key);
      }
    }
    return false;
  }
  checkRebalance = async (tokenConfig) => {
    if (!tokenConfig && this.props.tokenConfig){
      tokenConfig = this.props.tokenConfig;
    }
    if (!tokenConfig){
      return false;
    }

    const lastAllocationsPromises = [];
    const allocations = await this.genericContractCall(tokenConfig.idle.token, 'getAllocations');

    if (!allocations || !allocations.length){
      return false;
    }

    for (let protocolIndex=0;protocolIndex<allocations.length;protocolIndex++){
      const lastAllocationsPromise = new Promise( async (resolve, reject) => {
        try {
          const lastAllocations = await this.genericContractCall(tokenConfig.idle.token, 'lastAllocations',[protocolIndex]);
          resolve(lastAllocations);
        } catch (error) {
          console.log(error);
          resolve(null);
        }
      });
      lastAllocationsPromises.push(lastAllocationsPromise);
    }

    const newAllocations = await Promise.all(lastAllocationsPromises);

    if (!allocations || !newAllocations){
      return true;
    }

    const diff = allocations.filter( (alloc,index) => alloc !== newAllocations[index] );

    return diff.length>0;
  }
  checkMigration = async (tokenConfig,account) => {

    if (!tokenConfig || !account){
      return false;
    }

    let migrationEnabled = false;
    let oldContractBalance = null;
    let oldContractTokenDecimals = null;
    // let migrationContractApproved = false;
    let oldContractBalanceFormatted = null;

    // Check migration contract enabled and balance
    if (tokenConfig.migration && tokenConfig.migration.enabled){
      const oldContractName = tokenConfig.migration.oldContract.name;
      const oldContract = this.getContractByName(oldContractName);
      const migrationContract = this.getContractByName(tokenConfig.migration.migrationContract.name);

      // this.customLog(oldContractName,tokenConfig.migration.migrationContract.name);

      if (oldContract && migrationContract){
        // Get old contract token decimals
        oldContractTokenDecimals = await this.getTokenDecimals(oldContractName);

        // this.customLog('Migration - token decimals',oldContractTokenDecimals ? oldContractTokenDecimals.toString() : null);

        // Check migration contract approval
        // migrationContractApproved = await this.checkMigrationContractApproved();

        // this.customLog('Migration - approved',migrationContractApproved ? migrationContractApproved.toString() : null);

        // Check old contractBalance
        oldContractBalance = await this.getContractBalance(oldContractName,account);

        if (oldContractBalance){
          oldContractBalanceFormatted = this.fixTokenDecimals(oldContractBalance,oldContractTokenDecimals);
          // Enable migration if old contract balance if greater than 0
          migrationEnabled = this.BNify(oldContractBalance).gt(0);
        }

        // this.customLog('Migration - oldContractBalance',oldContractName,account,oldContractBalance,oldContractBalanceFormatted);
      }
    }

    // Set migration contract balance
    return {
      migrationEnabled,
      oldContractBalance,
      oldContractTokenDecimals,
      oldContractBalanceFormatted,
    };
  }

  getContractEvents = async (contractName, eventName, params = {}) => {
    return await this.getContractPastEvents(contractName, eventName, params);
  }

  estimateMethodGasUsage = async (contractName, methodName, methodParams = [], account = null) => {
    account = account || this.props.account;
    if (!account){
      return null;
    }
    const contract = this.getContractByName(contractName);
    if (contract && contract.methods[methodName]){
      const functionCall = contract.methods[methodName](...methodParams);

      let gasPrice = null;
      let gasLimit = null;
      
      try {
        [
          gasPrice,
          gasLimit
        ] = await Promise.all([
          this.props.web3.eth.getGasPrice(),
          functionCall.estimateGas({from: account})
        ]);
      } catch (error) {

      }

      if (gasPrice && gasLimit){
        return this.fixTokenDecimals(this.fixTokenDecimals(gasPrice,9).times(gasLimit),9);
      }
    }

    return this.BNify(0);
  }

  executeMetaTransaction = async (contract, userAddress, signedParameters, callback, callback_receipt) => {
    try {

      // const gasLimit = await contract.methods
      //   .executeMetaTransaction(userAddress, ...signedParameters)
      //   .estimateGas({ from: userAddress });

      // this.customLog(gasLimit);

      const gasPrice = await this.props.web3.eth.getGasPrice();

      const tx = contract.methods
        .executeMetaTransaction(userAddress, ...signedParameters)
        .send({
          from: userAddress,
          gasPrice
          // gasLimit
        });

      tx.on("transactionHash", function(hash) {
        this.customLog(`Transaction sent by relayer with hash ${hash}`);
        callback_receipt()
      }).once("confirmation", function(confirmationNumber, receipt) {
        this.customLog("Transaction confirmed on chain",receipt);
        callback_receipt(receipt);
      });
    } catch (error) {
      this.customLog(error);
      callback(null,error);
    }
  }

  getSignatureParameters_v4 = signature => {
    if (!this.props.web3.utils.isHexStrict(signature)) {
      throw new Error(
        'Given value "'.concat(signature, '" is not a valid hex string.')
      );
    }
    var r = signature.slice(0, 66);
    var s = "0x".concat(signature.slice(66, 130));
    var v = "0x".concat(signature.slice(130, 132));
    v = this.props.web3.utils.hexToNumber(v);
    if (![27, 28].includes(v)) v += 27;
    return {
      r: r,
      s: s,
      v: v
    };
  };

  constructMetaTransactionMessage = (nonce, chainId, functionSignature, contractAddress) => {
    return ethereumjsABI.soliditySHA3(
      ["uint256","address","uint256","bytes"],
      [nonce, contractAddress, chainId, toBuffer(functionSignature)]
    );
  }

  checkBiconomyLimits = async (userAddress) => {
    const biconomyInfo = this.getGlobalConfig(['network','providers','biconomy']);
    const res = await this.makeRequest(`${biconomyInfo.endpoints.limits}?userAddress=${userAddress}&apiId=${biconomyInfo.params.apiId}`,null,{
      headers:{
        'x-api-key':biconomyInfo.params.apiKey
      }
    });

    if (res && res.data){
      return res.data;
    }

    return null;
  }

  sendTxWithPermit = async (contractName,methodName,methodParams,nonce,callback,callback_receipt) => {
    const contract = this.getContractByName(contractName);

    if (!contract){
      callback(null,'Contract not found');
      return false;
    }

    if (!contract.methods[methodName]){
      callback(null,'Method not found');
      return false;
    }

    const functionSignature = contract.methods[methodName](...methodParams).encodeABI();

    try{
      const userAddress = this.props.account;
      const chainId = this.props.network.current.id || this.getGlobalConfig(['network','requiredNetwork']);
      const messageToSign = this.constructMetaTransactionMessage(nonce, chainId, functionSignature, contract._address);

      const signature = await this.props.web3.eth.personal.sign(
        "0x" + messageToSign.toString("hex"),
        userAddress
      );

      const { r, s, v } = this.getSignatureParameters_v4(signature);

      this.contractMethodSendWrapper(contractName, methodName, methodParams.concat([nonce, r, s, v]), callback, callback_receipt);

      return true;
    } catch (error) {
      callback(null,error);
      return false;
    }
  }

  buildBiconomyErc20ForwarderTx = async (contractName,tokenAddress,permitType,callData,gasLimit) => {
    const contract = this.getContractByName(contractName);

    if (!contract){
      return false;
    }

    console.log('Build Tx ',contract._address,tokenAddress,Number(gasLimit),callData);

    //Create the call data that the recipient contract will receive
    const tx = await this.props.erc20ForwarderClient.buildTx({
      permitType,
      data:callData,
      token:tokenAddress,
      to:contract._address,
      txGas:Number(gasLimit)
    });

    return tx;
  }

  sendBiconomyTxWithErc20Forwarder = async (req,metaInfo,callback,callback_receipt) => {

    let transactionHash = null;

    try {
      const txResponse = await this.props.erc20ForwarderClient.permitAndSendTxEIP712({req,metaInfo});
      transactionHash = txResponse.txHash;
      console.log('permitAndSendTxEIP712',transactionHash);
    } catch (error) {
      console.log('permitAndSendTxEIP712 ERROR',error);
      callback(null,true);
      return false;
    }

    if (!transactionHash){
      console.log('!transactionHash ERROR');
      callback(null,true);
      return false;
    }
    
    const tx = {
      method:'mintIdleToken',
      transactionHash
    };
    console.log('sendBiconomyTxWithErc20Forwarder',transactionHash);
    callback_receipt(tx);

    // fetch mined transaction receipt 
    const fetchReceiptIntervalId = window.setInterval(()=> {
      this.props.web3.eth.getTransactionReceipt(transactionHash, (err, receipt)=> {
        console.log('sendBiconomyTxWithErc20Forwarder',transactionHash,err,receipt);
        if(!err && receipt){
          window.clearInterval(fetchReceiptIntervalId);
          tx.txReceipt = receipt;
          tx.status = !err && receipt.status ? 'success' : 'error';

          callback(tx,err);

          if (typeof window.updateTransaction === 'function'){
            window.updateTransaction(tx,transactionHash,tx.status,null);
          }
        }
      });
    }, 3000);

    return true;
  }

  sendBiconomyTxWithPersonalSign = async (contractName,functionSignature,callback,callback_receipt) => {
    const contract = this.getContractByName(contractName);

    if (!contract){
      callback(null,'Contract not found');
      return false;
    }

    try{
      const userAddress = this.props.account;
      const nonce = await contract.methods.getNonce(userAddress).call();
      const chainId = this.props.network.current.id || this.getGlobalConfig(['network','requiredNetwork']);
      const messageToSign = this.constructMetaTransactionMessage(nonce, chainId, functionSignature, contract._address);

      const signature = await this.props.web3.eth.personal.sign(
        "0x" + messageToSign.toString("hex"),
        userAddress
      );

      const { r, s, v } = this.getSignatureParameters_v4(signature);

      this.contractMethodSendWrapper(contractName, 'executeMetaTransaction', [userAddress, functionSignature, r, s, v], callback, callback_receipt);

      return true;
    } catch (error) {
      console.error(error);
      callback(null,error);
      return false;
    }
  }

  signPermitEIP2612 = async (contractAddress, erc20Name, owner, spender, value, nonce, deadline, chainId) => {
    if (chainId === undefined) {
      const result = await this.props.web3.eth.getChainId();
      chainId = parseInt(result);
    }

    const domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" }
    ];

    const permit = [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ];

    const domainData = {
      version: "2",
      name: erc20Name,
      chainId: chainId,
      verifyingContract: contractAddress
    };

    const message = {
      owner,
      spender,
      value,
      nonce,
      deadline,
    };

    const data = JSON.stringify({
      types: {
        EIP712Domain: domain,
        Permit: permit,
      },
      primaryType: "Permit",
      domain: domainData,
      message: message
    });

    return new Promise((resolve, reject) => {
      this.props.web3.currentProvider.send({
        jsonrpc: '2.0',
        id: Date.now().toString().substring(9),
        method: "eth_signTypedData_v4",
        params: [owner, data],
        from: owner
      }, (error, res) => {
        if (error) {
          return reject(error);
        }

        resolve(res.result);
      });
    });
  }

  signPermit = async (baseContractName, holder, spenderContractName, addToNonce=0) => {
    const baseContract = this.getContractByName(baseContractName);
    const spenderContract = this.getContractByName(spenderContractName);

    if (!baseContract || !spenderContract){
      return false;
    }

    const result = await this.props.web3.eth.net.getId();
    let chainId = parseInt(result);

    const EIP712Domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" }
    ];

    const permitConfig = this.getGlobalConfig(['permit',baseContractName]);

    // console.log('permitConfig',permitConfig);

    const expiry = Math.round(new Date().getTime() / 1000 + 3600);
    let nonce = permitConfig.nonceMethod ? await baseContract.methods[permitConfig.nonceMethod](holder).call() : null;
    if (addToNonce>0){
      nonce = parseInt(nonce)+parseInt(addToNonce);
    }
    nonce = nonce.toString();

    const Permit = permitConfig.type;
    const EIPVersion = permitConfig.EIPVersion;

    const spender = spenderContract._address;
    const verifyingContract = baseContract._address;

    const permitName = permitConfig.name || baseContractName;

    const domain = {
      chainId,
      name: permitName,
      verifyingContract,
      version: permitConfig.version.toString() || '1',
    };

    let message = {};

    switch (EIPVersion){
      case 2612:
        const owner = holder;
        const deadline = expiry;
        // Unlimited allowance
        const value = this.integerValue(this.BNify(2).pow(256).minus(1));
        message = {
          value,
          nonce,
          owner,
          spender,
          deadline
        };
      break;
      default:
        message = {
          holder,
          nonce,
          expiry,
          spender,
          allowed: true,
        };
      break;
    }

    const data = JSON.stringify({
      domain,
      message,
      types: {
        Permit,
        EIP712Domain
      },
      primaryType: 'Permit',
    });

    // console.log('Permit',JSON.parse(data));

    return new Promise((resolve, reject) => {
      this.props.web3.currentProvider.send({
        from: holder,
        jsonrpc: '2.0',
        params: [holder, data],
        method: 'eth_signTypedData_v4',
        id: Date.now().toString().substring(9),
      }, (error, response) => {
        if (error || (response && response.error)) {
          return resolve(null);
        } else if (response && response.result) {
          const signedParameters = this.getSignatureParameters_v4(response.result);
          signedParameters.nonce = nonce;
          signedParameters.expiry = expiry;
          return resolve(signedParameters);
        }
      });
    });
  }

  sendTxWithPermit = async (baseContractName, holder, spenderContractName, methodName, methodParams, callback, callback_receipt, callback_permit=null) => {

    const baseContract = this.getContractByName(baseContractName);
    const spenderContract = this.getContractByName(spenderContractName);

    if (!baseContract || !spenderContract){
      callback(null,'Contract not found');
      return false;
    }

    const signedParameters = await this.signPermit(baseContractName, holder, spenderContractName);

    if (signedParameters){
      const { expiry, nonce, r, s, v } = signedParameters;
      const permitParams = [expiry, v, r, s];

      const methodAbi = spenderContract._jsonInterface.find( f => f.name === methodName );
      const useNonce = methodAbi ? methodAbi.inputs.find( i => i.name === 'nonce' ) : true;
      if (!isNaN(parseInt(nonce)) && useNonce){
        permitParams.unshift(nonce);
      }
      const params = methodParams.concat(permitParams);
      this.contractMethodSendWrapper(spenderContractName, methodName, params, callback, callback_receipt);
    } else {
      callback(null,'Permit cancelled');
    }
  }

  sendSignedTx = async (contractName,contractAddress,functionSignature,callback,callback_receipt) => {

    const EIP712Domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" }
    ];

    const MetaTransaction = [
      { name: "nonce", type: "uint256" },
      { name: "from", type: "address" },
      { name: "functionSignature", type: "bytes" }
    ];

    const chainId = await this.props.web3.eth.getChainId();

    const domainData = {
      chainId,
      version: '1',
      name: contractName,
      verifyingContract: contractAddress
    };

    const contract = this.getContractByName(contractName);

    if (!contract){
      callback(null,'Contract not found');
      return false
    }

    let userAddress = this.props.account;
    let nonce = await contract.methods.getNonce(userAddress).call();
    let message = {};
    message.nonce = nonce;
    message.from = userAddress;
    message.functionSignature = functionSignature;

    const dataToSign = JSON.stringify({
      types: {
        EIP712Domain,
        MetaTransaction
      },
      domain: domainData,
      primaryType: "MetaTransaction",
      message
    });

    // this.customLog('dataToSign',dataToSign);

    this.props.web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        id: 999999999999,
        from: userAddress,
        method: "eth_signTypedData_v4",
        params: [userAddress, dataToSign]
      },
      (error, response) => {
        if (error || (response && response.error)) {
          return callback(null,error);
        } else if (response && response.result) {
          const signedParameters = this.getSignatureParameters_v4(response.result);
          const { r, s, v } = signedParameters;
            
          this.contractMethodSendWrapper(contractName, 'executeMetaTransaction', [userAddress, functionSignature, r, s, v], callback, callback_receipt);
        }
      }
    );
  }

  checkTokenApproved = async (contractName,contractAddr,walletAddr) => {
    const [
      balance,
      allowance
    ] = await Promise.all([
      this.getTokenBalance(contractName,walletAddr,false),
      this.getAllowance(contractName,contractAddr,walletAddr)
    ]);
    this.customLog('checkTokenApproved',contractName,this.BNify(allowance).toFixed(),this.BNify(balance).toFixed(),(allowance && this.BNify(allowance).gte(this.BNify(balance))));
    return allowance && this.BNify(allowance).gte(this.BNify(balance));
  }
  getAllowance = async (contractName,contractAddr,walletAddr) => {
    if (!contractName || !contractAddr || !walletAddr){
      return false;
    }
    this.customLog('getAllowance',contractName,contractAddr,walletAddr);
    return await this.genericContractCall(
      contractName, 'allowance', [walletAddr, contractAddr]
    );
  }
  contractMethodSendWrapper = (contractName,methodName,params,callback,callback_receipt,txData) => {
    this.props.contractMethodSendWrapper(contractName, methodName, params, null, (tx)=>{
      if (typeof callback === 'function'){
        callback(tx);
      }
    }, (tx) => {
      if (typeof callback_receipt === 'function'){
        callback_receipt(tx);
      }
    }, null, txData);
  }
  disableERC20 = (contractName,address,callback,callback_receipt) => {
    this.props.contractMethodSendWrapper(contractName, 'approve', [
      address,
      this.props.web3.utils.toTwosComplement('0') // max uint solidity
    ],null,(tx)=>{
      if (typeof callback === 'function'){
        callback(tx);
      }
    }, (tx) => {
      if (typeof callback_receipt === 'function'){
        callback_receipt(tx);
      }
    });
  }
  enableERC20 = (contractName,address,callback,callback_receipt) => {
    this.props.contractMethodSendWrapper(contractName, 'approve', [
      address,
      this.props.web3.utils.toTwosComplement('-1') // max uint solidity
    ],null,(tx)=>{
      if (typeof callback === 'function'){
        callback(tx);
      }
    }, (tx) => {
      if (typeof callback_receipt === 'function'){
        callback_receipt(tx);
      }
    });
  }
  loadAssetField = async (field,token,tokenConfig,account,addGovTokens=true,addCurveApy=false) => {

    let output = null;
    const govTokens = this.getGlobalConfig(['govTokens']);

    // Remove gov tokens for risk adjusted strategy
    const strategyInfo = this.getGlobalConfig(['strategies',this.props.selectedStrategy]);
    if (addGovTokens && strategyInfo && typeof strategyInfo.addGovTokens !== 'undefined'){
      addGovTokens = strategyInfo.addGovTokens;
    }

    // Take available tokens for gov tokens fields
    let govTokenAvailableTokens = null;
    if (this.props.selectedStrategy && this.props.selectedToken){
      const newTokenConfig = this.props.availableStrategies[this.props.selectedStrategy][this.props.selectedToken];
      if (newTokenConfig){
        govTokenAvailableTokens = {};
        govTokenAvailableTokens[newTokenConfig.token] = newTokenConfig;
      }
    } else if (!Object.keys(govTokens).includes(token)){
      govTokenAvailableTokens = {};
      govTokenAvailableTokens[token] = tokenConfig;
    }

    switch (field){
      case 'amountLentCurve':
        const [
          curveAvgSlippage,
          curveAvgBuyPrice,
          curveTokenBalance,
        ] = await Promise.all([
          this.getCurveAvgSlippage(),
          this.getCurveAvgBuyPrice([],account),
          this.getCurveTokenBalance(account,true),
        ]);

        if (curveAvgBuyPrice && curveTokenBalance){
          output = this.BNify(curveTokenBalance).times(curveAvgBuyPrice);
          if (curveAvgSlippage){
            output = output.minus(output.times(curveAvgSlippage));
          }
          // this.customLog('amountLentCurve',curveTokenBalance.toFixed(6),curveAvgBuyPrice.toFixed(6),curveAvgSlippage.toString(),output.toFixed(6));
        }
      break;
      case 'earningsPercCurve':
        let [amountLentCurve1,redeemableBalanceCurve] = await Promise.all([
          this.loadAssetField('amountLentCurve',token,tokenConfig,account),
          this.loadAssetField('redeemableBalanceCurve',token,tokenConfig,account)
        ]);

        if (amountLentCurve1 && redeemableBalanceCurve && amountLentCurve1.gt(0) && redeemableBalanceCurve.gt(0)){
          output = redeemableBalanceCurve.div(amountLentCurve1).minus(1).times(100);
          // this.customLog('earningsPercCurve',redeemableBalanceCurve.toFixed(6),amountLentCurve1.toFixed(6),output.toFixed(6));
        }
      break;
      case 'curveApy':
        output = await this.getCurveAPY();
      break;
      case 'curveAvgSlippage':
        output = await this.getCurveAvgSlippage();
      break;
      case 'redeemableBalanceCurve':
        output = await this.getCurveRedeemableIdleTokens(account);
        // this.customLog('earningsPercCurve',output.toFixed(6));
      break;
      case 'redeemableBalanceCounterCurve':
        let [
          curveApy,
          amountLentCurve,
          redeemableBalanceCurveStart
        ] = await Promise.all([
          this.loadAssetField('curveApy',token,tokenConfig,account),
          this.loadAssetField('amountLentCurve',token,tokenConfig,account),
          this.loadAssetField('redeemableBalanceCurve',token,tokenConfig,account),
        ]);

        let redeemableBalanceCurveEnd = null;

        if (redeemableBalanceCurveStart && curveApy && amountLentCurve){
          const earningPerYear = amountLentCurve.times(curveApy.div(100));
          redeemableBalanceCurveEnd = redeemableBalanceCurveStart.plus(earningPerYear);
          // this.customLog('redeemableBalanceCounterCurve',amountLentCurve.toFixed(6),redeemableBalanceCurveStart.toFixed(6),redeemableBalanceCurveEnd.toFixed(6));
        }

        output = {
          redeemableBalanceCurveEnd,
          redeemableBalanceCurveStart
        };
      break;
      case 'earningsPerc':
        let [amountLent1,redeemableBalance1] = await Promise.all([
          this.loadAssetField('amountLent',token,tokenConfig,account,false),
          this.loadAssetField('redeemableBalance',token,tokenConfig,account,false)
        ]);

        if (amountLent1 && redeemableBalance1 && amountLent1.gt(0)){
          output = redeemableBalance1.div(amountLent1).minus(1).times(100);
        }
      break;
      case 'daysFirstDeposit':
        const depositTimestamp = await this.loadAssetField('depositTimestamp',token,tokenConfig,account);
        if (depositTimestamp){
          const currTimestamp = parseInt(Date.now()/1000);
          output = (currTimestamp-depositTimestamp)/86400;
        }
      break;
      case 'pool':
        if (Object.keys(govTokens).includes(token)){
          output = await this.getGovTokenPool(token, govTokenAvailableTokens);
        } else {
          output = await this.getTokenPool(tokenConfig,addGovTokens);
        }
      break;
      case 'userDistributionSpeed':
        switch (token){
          case 'COMP':
            output = await this.getCompUserDistribution(account,govTokenAvailableTokens);
          break;
          case 'stkAAVE':
            output = await this.getStkAaveUserDistribution(account,govTokenAvailableTokens);
          break;
          case 'IDLE':
            const idleGovToken = this.getIdleGovToken();
            output = await idleGovToken.getUserDistribution(account,govTokenAvailableTokens);
          break;
          default:
          break;
        }
        if (output && !this.BNify(output).isNaN()){
          output = this.BNify(output).div(1e18);
          if (output){
            output = this.fixDistributionSpeed(output,tokenConfig.distributionFrequency,tokenConfig.distributionMode);
          }
        }
      break;
      case 'idleDistribution':
        const idleGovToken = this.getIdleGovToken();
        const tokenName = this.getGlobalConfig(['governance','props','tokenName']);
        const govTokenConfig = this.getGlobalConfig(['govTokens',tokenName]);
        output = await idleGovToken.getSpeed(tokenConfig.idle.address);

        if (output){

          output = this.fixTokenDecimals(output,govTokenConfig.decimals);

          const blocksPerYear = this.BNify(this.getGlobalConfig(['network','blocksPerYear']));
          switch (govTokenConfig.distributionFrequency){
            case 'day':
              const blocksPerDay = blocksPerYear.div(365.242199);
              output = output.times(blocksPerDay);
            break;
            case 'week':
              const blocksPerWeek = blocksPerYear.div(52.1429);
              output = output.times(blocksPerWeek);
            break;
            case 'month':
              const blocksPerMonth = blocksPerYear.div(12);
              output = output.times(blocksPerMonth);
            break;
            case 'year':
              output = output.times(blocksPerYear);
            break;
            default:
            break;
          }
        }
      break;
      case 'distributionSpeed':
        const selectedTokenConfig = govTokenAvailableTokens[this.props.selectedToken];
        switch (token){
          case 'COMP':
            output = await this.getCompDistribution(selectedTokenConfig);
          break;
          case 'stkAAVE':
            output = await this.getStkAaveDistribution(selectedTokenConfig);
          break;
          case 'IDLE':
            const idleGovToken = this.getIdleGovToken();
            output = await idleGovToken.getSpeed(selectedTokenConfig.idle.address);
          break;
          default:
          break;
        }
        if (output && !this.BNify(output).isNaN()){
          output = this.BNify(output).div(1e18);
        }
      break;
      case 'apr':
        switch (token){
          case 'COMP':
            output = await this.getCompAvgApr(govTokenAvailableTokens);
          break;
          case 'IDLE':
            const idleGovToken = this.getIdleGovToken();
            output = await idleGovToken.getAvgApr(govTokenAvailableTokens);
          break;
          default:
            const tokenAprs = await this.getTokenAprs(tokenConfig,false,addGovTokens);
            if (tokenAprs && tokenAprs.avgApr !== null){
              output = tokenAprs.avgApr;
            }
          break;
        }
      break;
      case 'apy':
        const tokenApys = await this.getTokenAprs(tokenConfig,false,addGovTokens);

        // console.log('apr',token,tokenApys.avgApr ? tokenApys.avgApr.toFixed() : null,tokenApys.avgApy ? tokenApys.avgApy.toFixed() : null);

        output = this.BNify(0);

        if (tokenApys && !this.BNify(tokenApys.avgApy).isNaN()){
          output = this.BNify(tokenApys.avgApy);

          if (addCurveApy){
            const curveAPY = await this.getCurveAPY();
            if (curveAPY){
              output = output.plus(curveAPY);
            }
          }
        } else {

        }
      break;
      case 'avgAPY':
        const [
          tokenPrice,
          firstDepositTx,
          days
        ] = await Promise.all([
          this.getIdleTokenPrice(tokenConfig),
          this.getFirstDepositTx([token],account),
          this.loadAssetField('daysFirstDeposit',token,tokenConfig,account)
        ]);

        if (tokenPrice && firstDepositTx && firstDepositTx[token]){
          const tokenPriceFirstDeposit = await this.getIdleTokenPrice(tokenConfig,firstDepositTx[token].blockNumber);
          output = this.BNify(tokenPrice).div(tokenPriceFirstDeposit).minus(1).times(365).div(days).times(100);
        }
      break;
      case 'avgAPY_old':
        const [
          daysFirstDeposit,
          earningsPerc
        ] = await Promise.all([
          this.loadAssetField('daysFirstDeposit',token,tokenConfig,account),
          this.loadAssetField('earningsPerc',token,tokenConfig,account), // Take earnings perc instead of earnings
        ]);

        if (daysFirstDeposit && earningsPerc){
          output = earningsPerc.times(365).div(daysFirstDeposit);
        }
      break;
      case 'depositTimestamp':
        const depositTimestamps = account ? await this.getDepositTimestamp([token],account) : false;
        if (depositTimestamps && depositTimestamps[token]){
          output = depositTimestamps[token];
        }
      break;
      case 'amountLent':
        output = account ? await this.getAmountDeposited(tokenConfig,account) : false;
        // const amountLents = account ? await this.getAmountLent([token],account) : false;
        // if (amountLents && amountLents[token]){
        //   output = amountLents[token];
        // }
      break;
      case 'tokenPrice':
        if (Object.keys(govTokens).includes(token)){
          const govTokenConfig = govTokens[token];
          const DAITokenConfig = this.getGlobalConfig(['stats','tokens','DAI']);
          try {
            output = await this.getUniswapConversionRate(DAITokenConfig,govTokenConfig);
          } catch (error) {

          }
          if (!output || this.BNify(output).isNaN()){
            output = '-';
          }
        } else {
          output = await this.genericContractCall(tokenConfig.idle.token, 'tokenPrice');
        }
      break;
      case 'fee':
        output = await this.getUserTokenFees(tokenConfig,account);
      break;
      case 'tokenBalance':
        if (Object.keys(govTokens).includes(token)){
          output = await this.getTokenBalance(token,account);
          if (!output || output.isNaN()){
            output = '-';
          }
        } else {
          let tokenBalance = account ? await this.getTokenBalance(tokenConfig.token,account) : false;
          if (!tokenBalance || tokenBalance.isNaN()){
            tokenBalance = '-';
          }
          output = tokenBalance;
        }
      break;
      case 'idleTokenBalance':
        const idleTokenBalance = account ? await this.getTokenBalance(tokenConfig.idle.token,account) : false;
        if (idleTokenBalance){
          output = idleTokenBalance;
        }
      break;
      case 'redeemableBalanceCounter':
        let [tokenAPY1,amountLent2,redeemableBalanceStart] = await Promise.all([
          this.loadAssetField('apy',token,tokenConfig,account,false),
          this.loadAssetField('amountLent',token,tokenConfig,account,false),
          this.loadAssetField('redeemableBalance',token,tokenConfig,account,false),
        ]);

        let redeemableBalanceEnd = redeemableBalanceStart;

        if (redeemableBalanceStart && tokenAPY1 && amountLent2){
          const earningPerYear = amountLent2.times(tokenAPY1.div(100));
          redeemableBalanceEnd = redeemableBalanceStart.plus(earningPerYear);
        }

        // this.customLog('redeemableBalanceCounter',token,parseFloat(redeemableBalanceStart),parseFloat(redeemableBalanceEnd));

        output = {
          redeemableBalanceEnd,
          redeemableBalanceStart
        };
      break;
      case 'redeemableBalance':
        if (Object.keys(govTokens).includes(token)){
          const govTokenConfig = govTokens[token];
          output = await this.getGovTokenUserBalance(govTokenConfig,account,govTokenAvailableTokens);
        } else {
          let [
            idleTokenPrice1,
            idleTokenBalance2,
            govTokensBalance
          ] = await Promise.all([
            this.getIdleTokenPrice(tokenConfig),
            this.loadAssetField('idleTokenBalance',token,tokenConfig,account),
            addGovTokens ? this.getGovTokensUserTotalBalance(account,govTokenAvailableTokens,token) : null,
          ]);

          if (idleTokenBalance2 && idleTokenPrice1){
            const tokenBalance = idleTokenBalance2.times(idleTokenPrice1);
            let redeemableBalance = tokenBalance;
            if (govTokensBalance && !this.BNify(govTokensBalance).isNaN()){
              redeemableBalance = redeemableBalance.plus(this.BNify(govTokensBalance));
            }
            output = redeemableBalance;
            // console.log('redeemableBalance',token,idleTokenBalance2.toFixed(4),idleTokenPrice1.toFixed(4),tokenBalance.toFixed(4),govTokensBalance ? govTokensBalance.toFixed(4) : null,output.toFixed(4));
          }
        }
      break;
      case 'earningsCurve':
        let [amountLentCurve2,redeemableBalanceCurve1] = await Promise.all([
          this.loadAssetField('amountLentCurve',token,tokenConfig,account),
          this.loadAssetField('redeemableBalanceCurve',token,tokenConfig,account)
        ]);

        if (!amountLentCurve2){
          amountLentCurve2 = this.BNify(0);
        }

        if (!redeemableBalanceCurve1){
          redeemableBalanceCurve1 = this.BNify(0);
        }

        output = redeemableBalanceCurve1.minus(amountLentCurve2);
      break;
      case 'earnings':
        let [amountLent,redeemableBalance2] = await Promise.all([
          this.loadAssetField('amountLent',token,tokenConfig,account,false),
          this.loadAssetField('redeemableBalance',token,tokenConfig,account,false)
        ]);

        if (!amountLent){
          amountLent = this.BNify(0);
        }
        if (!redeemableBalance2){
          redeemableBalance2 = this.BNify(0);
        }

        output = redeemableBalance2.minus(amountLent);

        // console.log('earnings',token,amountLent.toFixed(5),redeemableBalance2.toFixed(5),output.toFixed(5));

        if (output.lt(this.BNify(0))){
          output = this.BNify(0);
        }
      break;
      default:
      break;
    }

    return output;
  }
  getIdleTokenSupply = async (idleToken,blockNumber='latest') => {
    const cachedDataKey = `idleTokenSupply_${idleToken}_${blockNumber}`;
    const cachedData = this.getCachedDataWithLocalStorage(cachedDataKey);
    if (cachedData && !this.BNify(cachedData).isNaN()){
      return this.BNify(cachedData);
    }

    let idleTokenSupply = await this.genericContractCall(idleToken,'totalSupply',[],{},blockNumber);
    if (idleTokenSupply){
      idleTokenSupply = this.BNify(idleTokenSupply);
      return this.setCachedDataWithLocalStorage(cachedDataKey,idleTokenSupply);
    }

    return null;
  }
  getIdleTokenPriceWithFee = async (tokenConfig,account,blockNumber='latest') => {
    account = account || this.props.account;
    if (!account){
      return null;
    }

    let [
      fee,
      tokenPrice,
      userAvgPrice
    ] = await Promise.all([
      this.genericContractCall(tokenConfig.idle.token, 'fee', [], {}, blockNumber),
      this.genericContractCall(tokenConfig.idle.token, 'tokenPrice', [], {}, blockNumber),
      this.genericContractCall(tokenConfig.idle.token, 'userAvgPrices', [account], {}, blockNumber)
    ]);
    
    fee = this.BNify(fee);
    tokenPrice = this.BNify(tokenPrice);
    userAvgPrice = this.BNify(userAvgPrice);

    if (!tokenPrice.isNaN() && !userAvgPrice.isNaN() && !fee.isNaN() && !this.BNify(userAvgPrice).eq(0) && this.BNify(tokenPrice).gt(this.BNify(userAvgPrice))){
      const priceWFee = this.integerValue(this.BNify(tokenPrice).minus(parseInt(fee.div(1e5).times(tokenPrice.minus(userAvgPrice)))));
      return priceWFee;
    }

    return tokenPrice;
  }
  getIdleTokenPrice = async (tokenConfig,blockNumber='latest',timestamp=false) => {

    const cachedDataKey = `idleTokenPrice_${tokenConfig.idle.token}_${blockNumber}`;
    // if (blockNumber !== 'latest'){
      const cachedData = this.getCachedDataWithLocalStorage(cachedDataKey);
      if (cachedData && !this.BNify(cachedData).isNaN()){
        return this.BNify(cachedData);
      }
    // }

    let decimals = tokenConfig.decimals;

    let tokenPrice = await this.genericContractCall(tokenConfig.idle.token,'tokenPrice',[],{},blockNumber);

    // If price is NaN try to take it from APIs
    if (!tokenPrice && timestamp){
      const isRisk = this.props.selectedStrategy === 'risk';
      const startTimestamp = parseInt(timestamp)-(60*60);
      const endTimestamp = parseInt(timestamp)+(60*60);
      const tokenData = await this.getTokenApiData(tokenConfig.address,isRisk,startTimestamp,endTimestamp,true);

      let beforePrice = {
        data:null,
        timeDiff:null
      };

      let afterPrice = {
        data:null,
        timeDiff:null
      };

      tokenData.forEach( d => {
        const timeDiff = Math.abs(parseInt(d.timestamp)-parseInt(timestamp));
        if (parseInt(d.timestamp)<parseInt(timestamp) && (!beforePrice.timeDiff || timeDiff<beforePrice.timeDiff)){
          beforePrice.timeDiff = timeDiff;
          beforePrice.data = d;
        }

        if (parseInt(d.timestamp)>parseInt(timestamp) && !afterPrice.timeDiff){
          afterPrice.timeDiff = timeDiff;
          afterPrice.data = d;
        }
      });

      // Take before and after and calculate correct tokenPrice based from price acceleration
      if (beforePrice.data && afterPrice.data){
        const tokenPriceBefore = this.BNify(beforePrice.data.idlePrice);
        const tokenPriceAfter = this.BNify(afterPrice.data.idlePrice);
        const timeBefore = this.BNify(beforePrice.data.timestamp);
        const timeAfter = this.BNify(afterPrice.data.timestamp);
        const timeDiff = timeAfter.minus(timeBefore);
        const priceDiff = tokenPriceAfter.minus(tokenPriceBefore);
        const priceAcceleration = priceDiff.div(timeDiff);
        const timeDiffFromBeforePrice = this.BNify(timestamp).minus(timeBefore);
        tokenPrice = tokenPriceBefore.plus(priceAcceleration.times(timeDiffFromBeforePrice));
      }
    }

    // Fix token price decimals
    if (tokenPrice && !this.BNify(tokenPrice).isNaN()){
      tokenPrice = this.fixTokenDecimals(tokenPrice,decimals);
    }

    // If price is NaN then return 1
    if (!tokenPrice || this.BNify(tokenPrice).isNaN() || this.BNify(tokenPrice).lt(1)){
      tokenPrice = this.BNify(1);
    }

    // if (blockNumber !== 'latest'){
      this.setCachedDataWithLocalStorage(cachedDataKey,tokenPrice);
    // }

    // this.customLog('getIdleTokenPrice',tokenPrice.toString());

    return tokenPrice;
  }
  clearCachedData = () => {
    if (this.props.clearCachedData && typeof this.props.clearCachedData === 'function'){
      // this.customLog('clearCachedData',this.props.clearCachedData,typeof this.props.clearCachedData === 'function');
      this.props.clearCachedData();
    } else {
      // this.customLog('clearCachedData - Function not found!');
    }
    return false;
  }
  /*
  Cache data locally for 3 minutes
  */
  setCachedData = (key,data,TTL=180) => {
    if (this.props.setCachedData && typeof this.props.setCachedData === 'function'){
      this.props.setCachedData(key,data,TTL);
    }
    return data;
  }
  setCachedDataWithLocalStorage = (key,data,TTL=180) => {
    if (this.props.setCachedData && typeof this.props.setCachedData === 'function'){
      this.props.setCachedData(key,data,TTL,true);
    }
    return data;
  }
  getCachedDataWithLocalStorage = (key,defaultValue=null) => {
    return this.getCachedData(key,defaultValue,true);
  }
  getCachedData = (key,defaultValue=null,useLocalStorage=false) => {
    let cachedData = null;
    key = key.toLowerCase();
    // Get cache from current session
    if (this.props.cachedData && this.props.cachedData[key]){
      cachedData = this.props.cachedData[key];
    // Get cache from local storage
    } else if (useLocalStorage) {
      cachedData = this.getStoredItem('cachedData');
      if (cachedData && cachedData[key]){
        cachedData = cachedData[key];
      } else {
        cachedData = null;
      }
    }

    if (cachedData && cachedData.data && (!cachedData.expirationDate || cachedData.expirationDate>=parseInt(Date.now()/1000))){
      return cachedData.data;
    }
    return defaultValue;
  }
  getUserPoolShare = async (walletAddr,tokenConfig) => {
    const [
      idleTokensBalance,
      idleTokensTotalSupply
    ] = await Promise.all([
      this.getTokenBalance(tokenConfig.idle.token,walletAddr,false),
      this.genericContractCall(tokenConfig.idle.token,'totalSupply')
    ]);

    let userShare = this.BNify(0);
    if (this.BNify(idleTokensBalance).gt(0) && this.BNify(idleTokensTotalSupply).gt(0)){
      userShare = this.BNify(idleTokensBalance).div(this.BNify(idleTokensTotalSupply));
    }

    return userShare;
  }
  openWindow = (url) => {
    return window.open(url,'_blank','noopener');
  }
  getActiveCoverages = async (account=null) => {
    const activeCoverages = [];
    account = account || this.props.account;

    if (!account){
      return activeCoverages;
    }

    const currTimestamp = parseInt(Date.now()/1000);
    const coverProtocolConfig = this.getGlobalConfig(['tools','coverProtocol']);
    if (coverProtocolConfig.enabled){
      await this.asyncForEach(coverProtocolConfig.props.coverages, async (coverage) => {
        const token = 'Claim';
        const coverageTokens = coverage.tokens;
        const tokenConfig = coverageTokens[token];
        // Initialize coverage contract
        await this.props.initContract(tokenConfig.name,tokenConfig.address,tokenConfig.abi);
        // Take balance
        const balance = await this.getTokenBalance(tokenConfig.name,account);
        if (balance && balance.gt(0)){
          const collateral = coverage.collateral;
          const protocolName = coverProtocolConfig.label;
          const protocolImage = coverProtocolConfig.image;
          const fileClaimUrl = coverProtocolConfig.fileClaimUrl;
          const status = coverage.expirationTimestamp<=currTimestamp ? 'Expired' : 'Active';
          const expirationDate = moment(coverage.expirationTimestamp*1000).utc().format('YYYY-MM-DD HH:mm:ss')+' UTC';
          activeCoverages.push({
            token,
            status,
            balance,
            collateral,
            protocolName,
            fileClaimUrl,
            protocolImage,
            expirationDate
          });
        }
      });
    }

    return activeCoverages;
  }
  getBatchedDepositExecutions = async (contractAddress) => {
    const requiredNetwork = this.props.network.current.id || this.getGlobalConfig(['network','requiredNetwork']);
    const etherscanInfo = this.getGlobalConfig(['network','providers','etherscan']);
    if (etherscanInfo.enabled && etherscanInfo.endpoints[requiredNetwork]){
      const etherscanApiUrl = etherscanInfo.endpoints[requiredNetwork];
      const etherscanEndpoint = `${etherscanApiUrl}?&apikey=${env.REACT_APP_ETHERSCAN_KEY}&module=account&action=tokentx&address=${contractAddress}&sort=desc`;
      const transactions = await this.makeCachedRequest(etherscanEndpoint,1800,true);
      if (transactions && typeof transactions.result === 'object'){
        return transactions.result.filter( tx => tx.from === '0x0000000000000000000000000000000000000000' && tx.to.toLowerCase() === contractAddress.toLowerCase() );
      }
    }
    return null;
  }
  getBatchedDeposits = async (account=null,filter_by_status=null) => {
    account = account || this.props.account;
    if (!account){
      return null;
    }

    const batchDepositConfig = this.getGlobalConfig(['tools','batchDeposit']);
    if (!batchDepositConfig.enabled){
      return null;
    }

    const cachedDataKey = `batchedDeposits_${account}_${filter_by_status}`;
    const cachedData = this.getCachedData(cachedDataKey);
    if (cachedData) {
      return cachedData;
    }

    const batchedDeposits = {};
    const availableTokens = batchDepositConfig.props.availableTokens;
    await this.asyncForEach(Object.keys(availableTokens),async (token) => {
      const tokenConfig = availableTokens[token];
      const migrationContract = tokenConfig.migrationContract;
      await this.props.initContract(migrationContract.name,migrationContract.address,migrationContract.abi);
      const currBatchIndex = await this.genericContractCall(migrationContract.name,'currBatch');
      for (let batchIndex = 0; batchIndex <= parseInt(currBatchIndex) ; batchIndex++){
        let [
          batchExecutions,
          batchTotal,
          batchRedeem,
          batchDeposit
        ] = await Promise.all([
          this.getBatchedDepositExecutions(migrationContract.address),
          this.genericContractCall(migrationContract.name,'batchTotals',[batchIndex]),
          this.genericContractCall(migrationContract.name,'batchRedeemedTotals',[batchIndex]),
          this.genericContractCall(migrationContract.name,'batchDeposits',[this.props.account,batchIndex])
        ]);
        let batchTotals = null;
        let batchRedeems = null;
        let batchDeposits = null;
        if (batchTotal && batchTotal !== null){
          batchTotals = this.fixTokenDecimals(batchTotal,tokenConfig.decimals);
        }
        if (batchDeposit !== null){
          batchRedeem = this.fixTokenDecimals(batchRedeem,18);
          batchDeposit = this.fixTokenDecimals(batchDeposit,tokenConfig.decimals);
          if (batchDeposit.gt(0)){
            batchDeposits = batchDeposit;

            // Calculate redeemable idleTokens
            batchRedeems = batchDeposit.times(batchRedeem).div(batchTotals);
            if (batchRedeems.gt(batchRedeem)){
              batchRedeems = batchRedeem;
            }

            const status = batchIndex < currBatchIndex && batchRedeems.gt(0) ? 'executed' : 'pending';

            if (filter_by_status !== null && filter_by_status.toLowerCase() !== status){
              return;
            }

            const lastExecution = batchExecutions && batchExecutions.length ? batchExecutions[0] : null;

            batchedDeposits[token] = {
              status,
              batchTotals,
              batchRedeems,
              batchDeposits,
              lastExecution
            };
          }
        }
      }
    });

    return this.setCachedData(cachedDataKey,batchedDeposits);
  }
  getETHBalance = async (walletAddr,fixDecimals=true,blockNumber='latest') => {
    if (!walletAddr){
      return false;
    }

    // Check for cached data
    const cachedDataKey = `ethBalance_${walletAddr}_${fixDecimals}_${blockNumber}`;
    if (blockNumber !== 'latest'){
      const cachedData = this.getCachedDataWithLocalStorage(cachedDataKey);
      if (cachedData && !this.BNify(cachedData).isNaN()){
        return this.BNify(cachedData);
      }
    }

    let tokenBalance = await this.props.web3.eth.getBalance(walletAddr);

    if (tokenBalance){
      if (fixDecimals){
        tokenBalance = this.fixTokenDecimals(tokenBalance,18);
      }

      tokenBalance = this.BNify(tokenBalance);

      // Set cached data
      if (!tokenBalance.isNaN()){
        if (blockNumber !== 'latest'){
          return this.setCachedDataWithLocalStorage(cachedDataKey,tokenBalance);
        } else {
          return tokenBalance;
        }
      }
    }
    return null;
  }
  getTokenBalance = async (contractName,walletAddr,fixDecimals=true,blockNumber='latest') => {
    if (!walletAddr){
      return false;
    }

    // Check for cached data
    const cachedDataKey = `tokenBalance_${contractName}_${walletAddr}_${fixDecimals}_${blockNumber}`;
    if (blockNumber !== 'latest'){
      const cachedData = this.getCachedDataWithLocalStorage(cachedDataKey);
      if (cachedData && !this.BNify(cachedData).isNaN()){
        return this.BNify(cachedData);
      }
    }

    let [
      tokenDecimals,
      tokenBalance
    ] = await Promise.all([
      this.getTokenDecimals(contractName),
      this.getContractBalance(contractName,walletAddr,blockNumber)
    ]);

    if (tokenBalance){
      if (fixDecimals){
        tokenBalance = this.fixTokenDecimals(tokenBalance,tokenDecimals);
      }

      tokenBalance = this.BNify(tokenBalance);

      // Set cached data
      if (!tokenBalance.isNaN()){
        if (blockNumber !== 'latest'){
          return this.setCachedDataWithLocalStorage(cachedDataKey,tokenBalance);
        } else {
          return tokenBalance;
        }
      }
    } else {
      this.customLogError('Error on getting balance for ',contractName);
    }
    return null;
  }
  copyToClipboard = (copyText) => {
    if (typeof copyText.select === 'function'){
      copyText.select();
      copyText.setSelectionRange(0, 99999); // Select
      const res = document.execCommand("copy");
      copyText.setSelectionRange(0, 0); // Deselect
      return res;
    }
    return false;
  }
  loadScript = (url,props,callback) => {
    const script = document.createElement("script");
    script.src = url;

    // Append props
    if (props){
      Object.keys(props).forEach((attr,i) => {
        script[attr] = props[attr];
      });
    }

    if (typeof callback === 'function'){
      if (script.readyState) {  // only required for IE <9
        script.onreadystatechange = function() {
          if ( script.readyState === 'loaded' || script.readyState === 'complete' ) {
            script.onreadystatechange = null;
            callback();
          }
        };
      } else {  //Others
        script.onload = callback;
      }
    }

    if (!script.id || !document.getElementById(script.id)){
      document.body.appendChild(script);
    }
  }
  isValidJSON = str => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
  checkAddress = (address) => {
    return address ? address.match(/^0x[a-fA-F0-9]{40}$/) !== null : false;
  }
  getTokenTotalSupply = async (contractName,blockNumber='latest') => {
    return await this.genericContractCall(contractName, 'totalSupply', [], {}, blockNumber);
  }
  getContractBalance = async (contractName,address,blockNumber='latest') => {
    address = address ? address : this.props.tokenConfig.idle.address;
    return await this.genericContractCall(contractName, 'balanceOf', [address], {}, blockNumber);
  }
  getProtocolBalance = async (contractName,address) => {
    address = address ? address : this.props.tokenConfig.idle.address;
    return await this.genericContractCall(contractName, 'balanceOf', [address]);
  }
  getAprs = async (contractName) => {
    contractName = contractName ? contractName : this.props.tokenConfig.idle.token;
    const aprs = await this.genericContractCall(contractName, 'getAPRs');
    if (aprs){
      return {
        aprs:aprs[1],
        addresses:aprs[0]
      };
    }
    return null;
  }
  genericIdleCall = async (methodName, params = [], callParams = {}) => {
    return await this.genericContractCall(this.props.tokenConfig.idle.token, methodName, params, callParams).catch(err => {
      this.customLogError('Generic Idle call err:', err);
    });
  }
  estimateGas = async (contractName, methodName, params = [], callParams = {}) => {
    let contract = this.getContractByName(contractName);

    if (!contract) {
      this.customLogError('Wrong contract name', contractName);
      return null;
    }

    return await contract.methods[methodName](...params).estimateGas(callParams);
  }
  getTxDecodedLogs = async (tx,logAddr,decodeLogs,storedTx) => {

    let txReceipt = storedTx && storedTx.txReceipt ? storedTx.txReceipt : null;

    if (!txReceipt){
      txReceipt = await (new Promise( async (resolve, reject) => {
        this.props.web3.eth.getTransactionReceipt(tx.hash,(err,tx)=>{
          if (err){
            reject(err);
          }
          resolve(tx);
        });
      }));

    }

    if (!txReceipt){
      return null;
    }

    const internalTransfers = txReceipt.logs.filter((tx) => { return tx.topics[tx.topics.length-1].toLowerCase() === `0x00000000000000000000000${logAddr}`; });

    if (!internalTransfers.length){
      return null;
    }

    try {
      return [
        txReceipt,
        this.props.web3.eth.abi.decodeLog(decodeLogs,internalTransfers[0].data,internalTransfers[0].topics)
      ];
    } catch (error) {
      return null;
    }
  }
  blocksToSeconds = (blocks) => {
    const blocksPerSeconds = this.BNify(this.getGlobalConfig(['network','blocksPerYear'])).div(365.2422).div(86400);
    return this.BNify(blocks).div(blocksPerSeconds);
  }
  getBlockNumber = async () => {
    return await this.props.web3.eth.getBlockNumber();
  }
  getContractPastEvents = async (contractName,methodName,params = {}) => {
    if (!contractName){
      return null;
    }

    const contract = this.getContractByName(contractName);

    if (!contract) {
      this.customLogError('Wrong contract name', contractName);
      return null;
    }

    return await contract.getPastEvents(methodName, params);
  }
  genericContractCall = async (contractName, methodName, params = [], callParams = {}, blockNumber = 'latest') => {

    if (!contractName){
      return null;
    }

    const contract = this.getContractByName(contractName);

    if (!contract) {
      this.customLog('Wrong contract name', contractName);
      return null;
    }

    if (!contract.methods[methodName]) {
      this.customLog('Wrong method name', methodName);
      return null;
    }

    blockNumber = blockNumber !== 'latest' && blockNumber && !isNaN(blockNumber) ? parseInt(blockNumber) : blockNumber;

    try{
      this.customLog(`genericContractCall - ${contractName} - ${methodName}`);
      const value = await contract.methods[methodName](...params).call(callParams,blockNumber).catch(error => {
        this.customLog(`${contractName} contract method ${methodName} error: `, error);
      });
      this.customLog(`genericContractCall - ${contractName} - ${methodName} : ${value}`);
      return value;
    } catch (error) {
      this.customLog("genericContractCall error", error);
    }
  }
  asyncForEach = async (array, callback, async=true) => {
    if (async){
      await Promise.all(array.map( (c,index) => {
        return callback(c, index, array);
      }));
    } else {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    }
  }
  apr2apy = (apr) => {
    return (this.BNify(1).plus(this.BNify(apr).div(12))).pow(12).minus(1);
  }
  getUnlentBalance = async (tokenConfig) => {
    let unlentBalance = await this.getProtocolBalance(tokenConfig.token,tokenConfig.idle.address);
    if (unlentBalance){
      unlentBalance = this.fixTokenDecimals(unlentBalance,tokenConfig.decimals);
    }
    return unlentBalance;
  }
  getTokenPool = async (tokenConfig,addGovTokens=true) => {
    // Check for cached data
    const cachedDataKey = `tokenPool_${tokenConfig.idle.address}_${addGovTokens}`;
    const cachedData = this.getCachedDataWithLocalStorage(cachedDataKey);
    if (cachedData && !this.BNify(cachedData).isNaN() ) {
      return this.BNify(cachedData);
    }

    const tokenAllocation = await this.getTokenAllocation(tokenConfig,false,addGovTokens);
    if (tokenAllocation && tokenAllocation.totalAllocationWithUnlent){
      const tokenPool = tokenAllocation.totalAllocationWithUnlent;
      if (!this.BNify(tokenPool).isNaN()){
        return this.setCachedDataWithLocalStorage(cachedDataKey,tokenPool);
      }
    }

    return null;
  }
  /*
  Get idleToken allocation between protocols
  */
  getTokenAllocation = async (tokenConfig,protocolsAprs=false,addGovTokens=true) => {

    if (!tokenConfig.idle){
      return false;
    }

    // Check for cached data
    const cachedDataKey = `tokenAllocation_${tokenConfig.idle.address}_${addGovTokens}`;
    const cachedData = this.getCachedData(cachedDataKey);
    if (cachedData) {
      return cachedData;
    }

    let totalAllocation = this.BNify(0);

    const tokenAllocation = {
      avgApr: null,
      unlentBalance:null,
      totalAllocation:null,
      protocolsBalances:{},
      protocolsAllocations:null,
      protocolsAllocationsPerc:null,
      totalAllocationConverted:null,
      totalAllocationWithUnlent:null,
      totalAllocationWithUnlentConverted:null,
    };

    const exchangeRates = {};
    const protocolsBalances = {};
    const protocolsAllocations = {};
    const protocolsAllocationsPerc = {};

    await this.asyncForEach(tokenConfig.protocols,async (protocolInfo,i) => {
      const contractName = protocolInfo.token;
      const protocolAddr = protocolInfo.address.toLowerCase();

      let [
        tokenDecimals,
        protocolBalance,
        exchangeRate
      ] = await Promise.all([
        this.getTokenDecimals(contractName),
        this.getProtocolBalance(contractName,tokenConfig.idle.address),
        ( protocolInfo.functions.exchangeRate ? this.genericContractCall(contractName,protocolInfo.functions.exchangeRate.name,protocolInfo.functions.exchangeRate.params) : null )
      ]);

      if (!protocolBalance){
        return;
      }

      if (exchangeRate && protocolInfo.decimals){
        exchangeRates[protocolAddr] = exchangeRate;
        exchangeRate = this.fixTokenDecimals(exchangeRate,protocolInfo.decimals);
      }

      let protocolAllocation = this.fixTokenDecimals(protocolBalance,tokenDecimals,exchangeRate);

      if (protocolAllocation.lt(this.BNify(0.00000001))){
        protocolBalance = this.BNify(0);
        protocolAllocation = this.BNify(0);
      }

      protocolsBalances[protocolAddr] = protocolBalance;
      protocolsAllocations[protocolAddr] = protocolAllocation;
      totalAllocation = totalAllocation.plus(protocolAllocation);

      // console.log('getTokenAllocation',contractName,protocolAddr,protocolAllocation.toFixed(5),exchangeRate ? exchangeRate.toFixed(5) : null,totalAllocation.toFixed(5));
    });

    tokenAllocation.unlentBalance = this.BNify(0);
    tokenAllocation.totalAllocationWithUnlent = this.BNify(totalAllocation);

    // Add unlent balance to the pool
    let unlentBalance = await this.getUnlentBalance(tokenConfig);
    if (unlentBalance){
      tokenAllocation.unlentBalance = unlentBalance;
      tokenAllocation.totalAllocationWithUnlent = tokenAllocation.totalAllocationWithUnlent.plus(unlentBalance);
    }

    // console.log('totalAllocationWithUnlent 1',addGovTokens,tokenAllocation.totalAllocationWithUnlent.toFixed(5));

    Object.keys(protocolsAllocations).forEach((protocolAddr,i) => {
      const protocolAllocation = protocolsAllocations[protocolAddr];
      const protocolAllocationPerc = protocolAllocation.div(totalAllocation);
      protocolsAllocationsPerc[protocolAddr] = protocolAllocationPerc;
    });

    tokenAllocation.totalAllocation = totalAllocation;
    tokenAllocation.protocolsAllocations = protocolsAllocations;
    tokenAllocation.protocolsAllocationsPerc = protocolsAllocationsPerc;

    if (addGovTokens){
      const govTokensBalances = await this.getGovTokensBalances(tokenConfig.idle.address);

      // Sum gov tokens balances
      if (govTokensBalances.total){
        const tokenUsdConversionRate = await this.getTokenConversionRate(tokenConfig,false);
        if (tokenUsdConversionRate){
          govTokensBalances.total = govTokensBalances.total.div(tokenUsdConversionRate);
        }

        tokenAllocation.totalAllocationWithUnlent = tokenAllocation.totalAllocationWithUnlent.plus(govTokensBalances.total);

        // console.log('totalAllocationWithUnlent 2',govTokensBalances.total.toFixed(5),tokenAllocation.totalAllocationWithUnlent.toFixed(5));
      }
    }

    tokenAllocation.totalAllocationConverted = await this.convertTokenBalance(tokenAllocation.totalAllocation,tokenConfig.token,tokenConfig);
    tokenAllocation.totalAllocationWithUnlentConverted = await this.convertTokenBalance(tokenAllocation.totalAllocationWithUnlent,tokenConfig.token,tokenConfig);

    if (protocolsAprs){
      tokenAllocation.avgApr = this.getAvgApr(protocolsAprs,protocolsAllocations,totalAllocation);
    }

    return this.setCachedData(cachedDataKey,tokenAllocation);
  }
  getUniswapConversionRate_path = async (path) => {
    const one = this.normalizeTokenDecimals(18);
    const unires = await this.genericContractCall('UniswapRouter','getAmountsIn',[one.toFixed(),path]);
    return unires;
  }
  getSushiswapPoolTokenPrice = async (contractName,pairAddresses) => {
    const [
      token0_address,
      token1_address,
      poolReserves,
      totalSupply
    ] = await Promise.all([
      this.genericContractCall(contractName,'token0'),
      this.genericContractCall(contractName,'token1'),
      this.genericContractCall(contractName,'getReserves'),
      this.genericContractCall(contractName,'totalSupply')
    ]);

    if (token0_address && token1_address && poolReserves && totalSupply){
      const token0_config = {
        address:token0_address
      };
      const token1_config = {
        address:token1_address
      };
      const DAITokenConfig = this.getGlobalConfig(['stats','tokens','DAI']);

      let [
        token0_price,
        token1_price
      ] = await Promise.all([
        this.getSushiswapConversionRate(DAITokenConfig,token0_config),
        this.getSushiswapConversionRate(DAITokenConfig,token1_config)
      ]);

      if (token0_price && token1_price){
        // token0_price = this.BNify(1).div(this.BNify(token0_price));
        // token1_price = this.BNify(1).div(this.BNify(token1_price));

        const token0_pool = token0_price.times(this.fixTokenDecimals(poolReserves[0],18));
        const token1_pool = token1_price.times(this.fixTokenDecimals(poolReserves[1],18));

        const totalPoolSize = token0_pool.plus(token1_pool);
        const poolTokenPrice = totalPoolSize.div(this.fixTokenDecimals(totalSupply,18));

        // console.log(parseFloat(token0_price),parseFloat(token1_price),parseFloat(poolTokenPrice));

        return poolTokenPrice;
      }
    }

    return null;
  }
  getSushiswapConversionRate = async (tokenConfigFrom,tokenConfigDest) => {

    // Check for cached data
    const cachedDataKey = `sushiswapConversionRate_${tokenConfigFrom.address}_${tokenConfigDest.address}`;
    const cachedData = this.getCachedDataWithLocalStorage(cachedDataKey);
    if (cachedData && !this.BNify(cachedData).isNaN()){
      return this.BNify(cachedData);
    }

    try {
      const WETHAddr = this.getGlobalConfig(['stats','tokens','WETH','address']);
      const one = this.normalizeTokenDecimals(18);

      const path = [];
      path.push(tokenConfigFrom.address);

      // Don't pass through weth if i'm converting weth
      if (WETHAddr.toLowerCase() !== tokenConfigFrom.address.toLowerCase() && WETHAddr.toLowerCase() !== tokenConfigDest.address.toLowerCase()){
        path.push(WETHAddr);
      }
      path.push(tokenConfigDest.address);

      const res = await this.genericContractCall('SushiswapRouter','getAmountsIn',[one.toFixed(),path]);

      if (res){
        const price = this.BNify(res[0]).div(one);
        return this.setCachedDataWithLocalStorage(cachedDataKey,price);
      }
      return null;
    } catch (error) {
      return null;
    }
  }
  getUniswapConversionRate = async (tokenConfigFrom,tokenConfigDest) => {

    if (tokenConfigDest.addressForPrice){
      tokenConfigDest = Object.assign({},tokenConfigDest);
      tokenConfigDest.address = tokenConfigDest.addressForPrice;
    }

    // Check for cached data
    const cachedDataKey = `uniswapConversionRate_${tokenConfigFrom.address}_${tokenConfigDest.address}`;
    const cachedData = this.getCachedDataWithLocalStorage(cachedDataKey);
    // console.log('getUniswapConversionRate - CACHED',cachedDataKey,cachedData);
    if (cachedData && !this.BNify(cachedData).isNaN()){
      return this.BNify(cachedData);
    }

    try {
      const WETHAddr = this.getGlobalConfig(['stats','tokens','WETH','address']);
      const one = this.normalizeTokenDecimals(18);

      const path = [];
      path.push(tokenConfigFrom.address);
      // Don't pass through weth if i'm converting weth
      if (WETHAddr.toLowerCase() !== tokenConfigFrom.address.toLowerCase() && WETHAddr.toLowerCase() !== tokenConfigDest.address.toLowerCase()){
        path.push(WETHAddr);
      }
      path.push(tokenConfigDest.address);

      const unires = await this.genericContractCall('UniswapRouter','getAmountsIn',[one.toFixed(),path]);

      if (unires){
        const price = this.BNify(unires[0]).div(one);
        // console.log('getUniswapConversionRate',path,price.toFixed());
        return this.setCachedDataWithLocalStorage(cachedDataKey,price);
      }
      return null;
    } catch (error) {
      return null;
    }
  }
  /*
  getUniswapConversionRate_old = async (tokenConfigFrom,tokenConfigDest) => {
    const cachedDataKey = `compUniswapConverstionRate_${tokenConfigFrom.address}_${tokenConfigDest.address}`;
    const cachedData = this.getCachedData(cachedDataKey);
    if (cachedData && !this.BNify(cachedData).isNaN()){
      return cachedData;
    }

    const tokenFrom = new Token(ChainId.MAINNET, tokenConfigFrom.address, tokenConfigFrom.decimals);
    const tokenTo = new Token(ChainId.MAINNET, tokenConfigDest.address, tokenConfigDest.decimals);

    const pair = await Fetcher.fetchPairData(tokenFrom, tokenTo);
    const route = new Route([pair], tokenTo);

    let output = null;
    if (route && route.midPrice){
      output = this.BNify(route.midPrice.toSignificant(tokenConfigDest.decimals));
      this.setCachedData(cachedDataKey,output);
    }
    return output;
  }
  */
  getCurveDepositedTokens = async (account,enabledTokens=[]) => {
    account = account ? account : this.props.account;

    if (!enabledTokens || !enabledTokens.length){
      enabledTokens = Object.keys(this.props.availableTokens);
    }

    if (!account || !enabledTokens || !enabledTokens.length){
      return [];
    }

    const curveTxs = await this.getCurveTxs(account,0,'latest',enabledTokens);

    const idleTokensBalances = {};
    let remainingCurveTokens = this.BNify(0);

    // this.customLog('getCurveDepositedTokens',curveTxs);

    curveTxs.forEach( tx => {

      const idleToken = tx.idleToken;
      const idleTokens = this.BNify(tx.idleTokens);

      if (!idleTokensBalances[idleToken]){
        idleTokensBalances[idleToken] = this.BNify(0);
      }

      switch (tx.action){
        case 'CurveIn':
        case 'CurveZapIn':
          idleTokensBalances[idleToken] = idleTokensBalances[idleToken].plus(idleTokens);
        break;
        case 'CurveOut':
        case 'CurveZapOut':
          if (idleTokens.gt(idleTokensBalances[idleToken])){
            remainingCurveTokens = remainingCurveTokens.plus(idleTokens.minus(idleTokensBalances[idleToken]));
          }
          idleTokensBalances[idleToken] = idleTokensBalances[idleToken].minus(idleTokens);
          if (idleTokensBalances[idleToken].lt(0)){
            idleTokensBalances[idleToken] = this.BNify(0);
          }
        break;
        default:
        break;
      }

      // this.customLog(this.strToMoment(tx.timeStamp*1000).format('DD-MM-YYYY HH:mm:ss'),tx.blockNumber,idleToken,tx.action,idleTokens.toFixed(6),idleTokensBalances[idleToken].toFixed(6),remainingCurveTokens.toFixed(6));

      // Scalo il remaining tokens
      if (remainingCurveTokens.gt(0)){
        Object.keys(idleTokensBalances).forEach( token => {
          const tokenBalance = idleTokensBalances[token];
          if (tokenBalance && tokenBalance.gt(0)){
            if (tokenBalance.gt(remainingCurveTokens)){
              idleTokensBalances[token] = idleTokensBalances[token].minus(remainingCurveTokens);
            } else {
              remainingCurveTokens = remainingCurveTokens.minus(idleTokensBalances[token]);
              idleTokensBalances[token] = 0;
            }
          }
        });
      }
    });

    // this.customLog('idleTokensBalances',idleTokensBalances);
  }
  getCurveUnevenTokenAmounts = async (amounts,max_burn_amount) => {
    const curveSwapContract = await this.getCurveDepositContract();
    if (curveSwapContract){
      const unevenAmounts = await this.genericContractCall(curveSwapContract.name, 'remove_liquidity_imbalance', [amounts, max_burn_amount]);
      // this.customLog('getCurveUnevenTokenAmounts',amounts,max_burn_amount,unevenAmounts);
      return unevenAmounts;
    }
    return null;
  }
  getCurveAPY = async () => {

    // Check for cached data
    const cachedDataKey = `getCurveAPY`;
    const cachedData = this.getCachedDataWithLocalStorage(cachedDataKey);
    if (cachedData && !this.BNify(cachedData).isNaN()){
      return this.BNify(cachedData);
    }

    const curveRatesInfo = this.getGlobalConfig(['curve','rates']);
    if (curveRatesInfo){
      const results = await this.makeRequest(curveRatesInfo.endpoint);
      if (results && results.data){
        const path = Object.values(curveRatesInfo.path);
        let curveApy = this.getArrayPath(path,results.data);
        if (curveApy){
          curveApy = this.BNify(curveApy).times(100);
          if (!this.BNify(curveApy).isNaN()){
            return this.setCachedDataWithLocalStorage(cachedDataKey,curveApy);
          }
        }
      }
    }
    return null;
  }
  getCurveAvailableTokens = () => {
    if (!this.props.availableStrategies){
      return false;
    }
    const curveTokens = this.getGlobalConfig(['curve','availableTokens']);
    const strategyTokens = this.props.availableStrategies['best'];
    const availableTokens = Object.keys(strategyTokens).reduce( (availableTokens,token) => {
      const tokenConfig = strategyTokens[token];
      if (Object.keys(curveTokens).includes(tokenConfig.idle.token) && curveTokens[tokenConfig.idle.token].enabled){
        availableTokens[token] = tokenConfig;
      }
      return availableTokens;
    },{});

    return availableTokens;
  }
  getCurveAPYContract = async () => {
    const curveSwapContract = await this.getCurveDepositContract();
    if (curveSwapContract){
      const blockNumber = await this.getBlockNumber();
      if (blockNumber){
        const blocksForPrevTokenPrice = 10;
        let [tokenPrice,prevTokenPrice] = await Promise.all([
          this.genericContractCall(curveSwapContract.name,'get_virtual_price'),
          this.genericContractCall(curveSwapContract.name,'get_virtual_price',[],{},blockNumber-blocksForPrevTokenPrice)
        ]);

        if (tokenPrice && prevTokenPrice){

          const blocksMultiplier = this.BNify(this.getGlobalConfig(['network','blocksPerYear'])).div(blocksForPrevTokenPrice);
          const curveAPR = this.BNify(tokenPrice).div(prevTokenPrice).minus(1).times(blocksMultiplier);
          return this.apr2apy(curveAPR).times(100);
        }
      }
    }
    return null;
  }
  getCurveTokenSupply = async () => {
    const curvePoolContract = await this.getCurvePoolContract();
    if (curvePoolContract){
      return await this.genericContractCall(curvePoolContract.name,'totalSupply');
    }
    return null;
  }
  getCurveTokenBalance = async (account=null,fixDecimals=true) => {
    const curvePoolContract = await this.getCurvePoolContract();
    if (curvePoolContract){
      account = account ? account : this.props.account;
      return await this.getTokenBalance(curvePoolContract.name,account,fixDecimals);
    }
    return null;
  }
  getCurveTokenPrice = async (blockNumber='latest',fixDecimals=true) => {
    const migrationContract = await this.getCurveDepositContract();
    let curveTokenPrice = await this.genericContractCall(migrationContract.name,'get_virtual_price',[],{},blockNumber);
    if (curveTokenPrice){
      curveTokenPrice = this.BNify(curveTokenPrice);
      if (fixDecimals){
        const curvePoolContract = this.getGlobalConfig(['curve','poolContract']);
        curveTokenPrice = this.fixTokenDecimals(curveTokenPrice,curvePoolContract.decimals);
      }
      return curveTokenPrice;
    }
    return null;
  }
  getCurveRedeemableIdleTokens = async (account) => {
    let [curveTokenPrice,curveTokenBalance] = await Promise.all([
      this.getCurveTokenPrice('latest'),
      this.getCurveTokenBalance(account),
    ]);
    if (curveTokenBalance && curveTokenPrice){
      return this.BNify(curveTokenBalance).times(curveTokenPrice);
    }
    return null;
  }
  getCurveDepositContract = async () => {
    const depositContractInfo = this.getGlobalConfig(['curve','depositContract']);
    if (depositContractInfo){
      let curveDepositContract = this.getContractByName(depositContractInfo.name);
      if (!curveDepositContract && depositContractInfo.abi){
        curveDepositContract = await this.props.initContract(depositContractInfo.name,depositContractInfo.address,depositContractInfo.abi);
      }
    }
    return depositContractInfo;
  }
  getCurveZapContract = async () => {
    const zapContractInfo = this.getGlobalConfig(['curve','zapContract']);
    if (zapContractInfo){
      let curveZapContract = this.getContractByName(zapContractInfo.name);
      if (!curveZapContract && zapContractInfo.abi){
        curveZapContract = await this.props.initContract(zapContractInfo.name,zapContractInfo.address,zapContractInfo.abi);
      }
    }
    return zapContractInfo;
  }
  getCurvePoolContract = async () => {
    const poolContractInfo = this.getGlobalConfig(['curve','poolContract']);
    if (poolContractInfo){
      let curvePoolContract = this.getContractByName(poolContractInfo.name);
      if (!curvePoolContract && poolContractInfo.abi){
        curvePoolContract = await this.props.initContract(poolContractInfo.name,poolContractInfo.address,poolContractInfo.abi);
      }
    }
    return poolContractInfo;
  }
  getCurveSwapContract = async () => {
    const migrationContractInfo = this.getGlobalConfig(['curve','migrationContract']);
    if (migrationContractInfo){
      let migrationContract = this.getContractByName(migrationContractInfo.name);
      if (!migrationContract && migrationContractInfo.abi){
        migrationContract = await this.props.initContract(migrationContractInfo.name,migrationContractInfo.address,migrationContractInfo.abi);
      }
    }
    return migrationContractInfo;
  }
  getCurveIdleTokensAmounts = async (account=null,curveTokenBalance=null,max_slippage=null) => {
    if (!account && this.props.account){
      account = this.props.account;
    }

    if (!account){
      return null;
    }

    const tokensBalances = {};
    const curveSwapContract = await this.getCurveSwapContract();
    const curveAvailableTokens = this.getGlobalConfig(['curve','availableTokens']);

    const curveTokenSupply = await this.getCurveTokenSupply();
    if (!curveTokenBalance){
      curveTokenBalance = await this.getCurveTokenBalance(account,false);
    }

    if (curveTokenBalance && curveTokenSupply){
      const curveTokenShare = this.BNify(curveTokenBalance).div(this.BNify(curveTokenSupply));
      const n_coins = Object.keys(curveAvailableTokens).length;

      if (max_slippage){
        max_slippage = this.BNify(max_slippage).div(n_coins);
      }

      // this.customLog('curveTokenShare',this.BNify(curveTokenBalance).toString(),this.BNify(curveTokenSupply).toString(),curveTokenShare.toString());

      await this.asyncForEach(Object.keys(curveAvailableTokens), async (token) => {
        const curveTokenConfig = curveAvailableTokens[token];
        const coinIndex = curveTokenConfig.migrationParams.coinIndex;
        const curveIdleTokens = await this.genericContractCall(curveSwapContract.name,'balances',[coinIndex]);
        if (curveIdleTokens){
          let idleTokenBalance = this.BNify(curveIdleTokens).times(curveTokenShare);
          if (max_slippage){
            // this.customLog('getCurveIdleTokensAmounts',idleTokenBalance.toFixed());
            idleTokenBalance = idleTokenBalance.minus(idleTokenBalance.times(max_slippage));
          }
          tokensBalances[coinIndex] = this.integerValue(idleTokenBalance);
        }
      });
    }

    return Object.values(tokensBalances);
  }

  // Get amounts of underlying tokens in the curve pool
  getCurveTokensAmounts = async (account=null,curveTokenBalance=null,fixDecimals=false,useCoinIndex=false) => {

    if (!account && this.props.account){
      account = this.props.account;
    }

    if (!account){
      return null;
    }

    const tokensBalances = {};
    const availableTokens = this.getCurveAvailableTokens();
    const curveSwapContract = await this.getCurveSwapContract();
    const curveAvailableTokens = this.getGlobalConfig(['curve','availableTokens']);

    const curveTokenSupply = await this.getCurveTokenSupply();
    if (!curveTokenBalance){
      curveTokenBalance = await this.getCurveTokenBalance(account,false);
    }

    if (curveTokenBalance && curveTokenSupply){
      const curveTokenShare = this.BNify(curveTokenBalance).div(this.BNify(curveTokenSupply));

      await this.asyncForEach(Object.keys(curveAvailableTokens), async (token) => {
        const curveTokenConfig = curveAvailableTokens[token];
        const coinIndex = curveTokenConfig.migrationParams.coinIndex;
        const tokenConfig = availableTokens[curveTokenConfig.baseToken];
        const [
          idleTokenPrice,
          idleTokenBalance
        ] = await Promise.all([
          this.getIdleTokenPrice(tokenConfig),
          this.genericContractCall(curveSwapContract.name,'balances',[coinIndex]),
        ]);

        const totalTokenSupply = this.BNify(idleTokenBalance).times(this.BNify(idleTokenPrice));
        let tokenBalance = totalTokenSupply.times(curveTokenShare);
        if (fixDecimals){
          tokenBalance = this.fixTokenDecimals(tokenBalance,18);
        }

        tokensBalances[curveTokenConfig.baseToken] = useCoinIndex ? this.integerValue(tokenBalance) : tokenBalance;
      });
    }

    return useCoinIndex ? Object.values(tokensBalances) : tokensBalances;
  }

  // Compile amounts array for Curve
  getCurveAmounts = async (token,amount,deposit=false) => {
    const amounts = {};
    const availableTokens = this.getCurveAvailableTokens();
    const curveAvailableTokens = this.getGlobalConfig(['curve','availableTokens']);

    await this.asyncForEach(Object.keys(curveAvailableTokens), async (idleToken) => {
      const curveTokenConfig = curveAvailableTokens[idleToken];
      const migrationParams = curveTokenConfig.migrationParams;
      const coinIndex = migrationParams.coinIndex;
      if (idleToken === token && parseFloat(amount)>0){
        const tokenConfig = availableTokens[curveTokenConfig.baseToken];
        amount = this.fixTokenDecimals(amount,18);
        if (!deposit){
          const idleTokenPrice = await this.getIdleTokenPrice(tokenConfig);
          amount = amount.div(idleTokenPrice);
        }
        amount = this.normalizeTokenAmount(amount,curveTokenConfig.decimals);
        amounts[coinIndex] = amount;
      } else {
        amounts[coinIndex] = 0;
      }
    });

    return Object.values(amounts);
  }
  getCurveTokenAmount = async (amounts,deposit=true) => {
    const migrationContract = await this.getCurveSwapContract();
    if (migrationContract){
      return await this.genericContractCall(migrationContract.name,'calc_token_amount',[amounts,deposit]);
    }
    return null;
  }
  getCurveSlippage = async (token,amount,deposit=true,uneven_amounts=null) => {
    let slippage = null;
    const depositContract = await this.getCurveDepositContract();
    if (depositContract){

      const n_coins = this.getGlobalConfig(['curve','params','n_coins']);

      amount = this.BNify(amount)
      if (!amount || amount.isNaN() || amount.lte(0)){
        return null;
      }

      let amounts = uneven_amounts;
      if (!amounts || amounts.length !== n_coins){
        amounts = await this.getCurveAmounts(token,amount);
      }

      let [
        virtualPrice,
        tokenAmount
      ] = await Promise.all([
        this.genericContractCall(depositContract.name,'get_virtual_price'),
        this.genericContractCall(depositContract.name,'calc_token_amount',[amounts,deposit]),
      ]);

      if (virtualPrice && tokenAmount){
        amount = this.fixTokenDecimals(amount,18);
        virtualPrice = this.fixTokenDecimals(virtualPrice,18);
        tokenAmount = this.fixTokenDecimals(tokenAmount,18);
        const Sv = tokenAmount.times(virtualPrice);

        // Handle redeem in uneven amounts (Slippage 0%)
        if (uneven_amounts && !deposit){
          amount = amount.times(virtualPrice);
        }

        if (deposit){
          slippage = Sv.div(amount).minus(1).times(-1);
        } else {
          slippage = amount.div(Sv).minus(1).times(-1);
        }

        // console.log('getCurveSlippage',token,deposit,amounts,tokenAmount.toFixed(6),virtualPrice.toFixed(6),Sv.toFixed(6),amount.toFixed(6),slippage.toFixed(6));

        return slippage;
      }
    }
    return null;
  }
  getStkAaveDistribution = async (tokenConfig,aTokenIdleSupply=null,annualize=true) => {

    const cachedDataKey = `getStkAaveDistribution_${tokenConfig.idle.token}_${aTokenIdleSupply}_${annualize}`;
    const cachedData = this.getCachedDataWithLocalStorage(cachedDataKey);
    if (cachedData && !this.BNify(cachedData).isNaN()){
      return this.BNify(cachedData);
    }

    let aaveDistribution = this.BNify(0);
    const stkAAVETokenConfig = this.getGlobalConfig(['govTokens','stkAAVE']);
    const aTokenConfig = tokenConfig.protocols.find( p => p.name === stkAAVETokenConfig.protocol );

    if (!aTokenConfig || stkAAVETokenConfig.disabledTokens.includes(tokenConfig.idle.token)){
      return aaveDistribution;
    }

    const aaveIncentivesController_address = await this.genericContractCall(aTokenConfig.token,'getIncentivesController');

    // console.log('getStkAaveDistribution',tokenConfig.idle.token,aTokenConfig.token,aaveIncentivesController_address);

    if (!aaveIncentivesController_address){
      return aaveDistribution;
    }

    const IAaveIncentivesController_name = `IAaveIncentivesController_${aTokenConfig.token}`;
    await this.props.initContract(IAaveIncentivesController_name,aaveIncentivesController_address,stkAAVETokenConfig.abi);

    let [
      aTokenTotalSupply,
      tokenAllocation,
      assetData,
    ] = await Promise.all([
      this.getTokenTotalSupply(aTokenConfig.token),
      this.getTokenAllocation(tokenConfig,false,false),
      this.genericContractCall(IAaveIncentivesController_name,'getAssetData',[aTokenConfig.address]),
    ]);

    if (assetData && tokenAllocation){

      const aaveAllocationPerc = tokenAllocation.protocolsAllocationsPerc[aTokenConfig.address.toLowerCase()];

      if (aaveAllocationPerc && aaveAllocationPerc.gte(0.001)){
        if (!aTokenIdleSupply){
          aTokenIdleSupply = await this.genericContractCall(aTokenConfig.token,'balanceOf',[tokenConfig.idle.address]);
        }

        const aaveSpeed = this.BNify(assetData[1]);
        aTokenIdleSupply = this.BNify(aTokenIdleSupply);
        aTokenTotalSupply = this.BNify(aTokenTotalSupply);
        const secondsPerYear = this.getGlobalConfig(['network','secondsPerYear']);

        const aavePoolShare = aTokenIdleSupply.div(aTokenTotalSupply);
        aaveDistribution = aaveSpeed.times(aavePoolShare);

        if (annualize){
          aaveDistribution = aaveDistribution.div(1e18).times(secondsPerYear);
        }

        // console.log('getStkAaveDistribution',tokenConfig.idle.token,aTokenIdleSupply.toFixed(),aTokenTotalSupply.toFixed(),aavePoolShare.toFixed(),aaveSpeed.toFixed(),aaveDistribution.toFixed());

        if (!this.BNify(aaveDistribution).isNaN()){
          return this.setCachedDataWithLocalStorage(cachedDataKey,aaveDistribution);
        }
      }
    }

    return aaveDistribution;
  }
  getStkAaveUserDistribution = async (account=null,availableTokens=null) => {
    if (!account){
      account = this.props.account;
    }
    if (!availableTokens && this.props.selectedStrategy){
      availableTokens = this.props.availableStrategies[this.props.selectedStrategy];
    }

    if (!account || !availableTokens){
      return false;
    }

    const stkAAVETokenConfig = this.getGlobalConfig(['govTokens','stkAAVE']);

    let output = this.BNify(0);
    await this.asyncForEach(Object.keys(availableTokens),async (token) => {
      const tokenConfig = availableTokens[token];
      const aTokenInfo = tokenConfig.protocols.find( p => (p.name === stkAAVETokenConfig.protocol) );
      if (aTokenInfo){
        const [
          userPoolShare,
          aaveDistribution,
        ] = await Promise.all([
          this.getUserPoolShare(account,tokenConfig,false),
          this.getStkAaveDistribution(tokenConfig,null,false),
        ]);

        if (aaveDistribution && userPoolShare){
          output = output.plus(aaveDistribution.times(userPoolShare));
        }
      }
    });

    return output;
  }
  getStkAaveApr = async (token,tokenConfig,aaveConversionRate=null) => {
    const stkAAVETokenConfig = this.getGlobalConfig(['govTokens','stkAAVE']);
    if (!stkAAVETokenConfig.enabled){
      return false;
    }

    const cachedDataKey = `getStkAaveApr_${tokenConfig.idle.token}_${aaveConversionRate}`;
    const cachedData = this.getCachedDataWithLocalStorage(cachedDataKey);
    if (cachedData && !this.BNify(cachedData).isNaN()){
      return this.BNify(cachedData);
    }

    let stkAaveAPR = this.BNify(0);
    const aaveDistribution = await this.getStkAaveDistribution(tokenConfig);

    if (aaveDistribution && this.BNify(aaveDistribution).gt(0)){

      // Get COMP conversion rate
      if (!aaveConversionRate){
        const DAITokenConfig = this.getGlobalConfig(['stats','tokens','DAI']);
        try {
          const destTokenConfig = {
            address:stkAAVETokenConfig.addressForPrice || stkAAVETokenConfig.address
          };
          aaveConversionRate = await this.getUniswapConversionRate(DAITokenConfig,destTokenConfig);
        } catch (error) {

        }
        if (!aaveConversionRate || aaveConversionRate.isNaN()){
          aaveConversionRate = this.BNify(1);
        }
      }

      const stkAaveValue = this.BNify(aaveConversionRate).times(aaveDistribution);

      const tokenAllocation = await this.getTokenAllocation(tokenConfig,false,false);

      if (tokenAllocation){
        stkAaveAPR = stkAaveValue.div(tokenAllocation.totalAllocationConverted).times(100);

        // console.log('getStkAaveApr',tokenConfig.idle.token,aaveDistribution.toFixed(),this.BNify(aaveConversionRate).toFixed(),stkAaveValue.toFixed(),tokenAllocation.totalAllocationConverted.toFixed(),stkAaveAPR.toFixed());

        if (!this.BNify(stkAaveAPR).isNaN()){
          this.setCachedDataWithLocalStorage(cachedDataKey,stkAaveAPR);
        }
      }
    }

    return stkAaveAPR;
  }
  getCompAPR = async (token,tokenConfig,cTokenIdleSupply=null,compConversionRate=null) => {
    const COMPTokenConfig = this.getGlobalConfig(['govTokens','COMP']);
    if (!COMPTokenConfig.enabled){
      return false;
    }

    const cachedDataKey = `getCompAPR_${tokenConfig.idle.token}_${cTokenIdleSupply}_${compConversionRate}`;
    const cachedData = this.getCachedDataWithLocalStorage(cachedDataKey);
    if (cachedData && !this.BNify(cachedData).isNaN()){
      return this.BNify(cachedData);
    }

    let compAPR = this.BNify(0);
    const compDistribution = await this.getCompDistribution(tokenConfig,cTokenIdleSupply);

    if (compDistribution){

      const DAITokenConfig = this.getGlobalConfig(['stats','tokens','DAI']);
        
      // Get COMP conversion rate
      if (!compConversionRate){
        try {
          compConversionRate = await this.getUniswapConversionRate(DAITokenConfig,COMPTokenConfig);
        } catch (error) {

        }
        if (!compConversionRate || compConversionRate.isNaN()){
          compConversionRate = this.BNify(1);
        }
      }

      const compValue = this.BNify(compConversionRate).times(compDistribution);

      const tokenAllocation = await this.getTokenAllocation(tokenConfig,false,false);

      if (tokenAllocation){
        compAPR = compValue.div(tokenAllocation.totalAllocationConverted).times(100);
        if (!this.BNify(compAPR).isNaN()){
          this.setCachedDataWithLocalStorage(cachedDataKey,compAPR);
        }
      }
    }

    return compAPR;
  }
  getCompSpeed = async (cTokenAddress) => {
    let compSpeed = await this.genericContractCall('Comptroller','compSpeeds',[cTokenAddress]);
    if (compSpeed){
      return this.BNify(compSpeed);
    }
    return null;
  }
  getCompDistribution = async (tokenConfig,cTokenIdleSupply=null,annualize=true) => {

    const cachedDataKey = `getCompDistribution_${tokenConfig.idle.token}_${cTokenIdleSupply}_${annualize}`;
    const cachedData = this.getCachedDataWithLocalStorage(cachedDataKey);
    if (cachedData && !this.BNify(cachedData).isNaN()){
      return this.BNify(cachedData);
    }

    const cTokenInfo = tokenConfig.protocols.find( p => (p.name === 'compound') );
    if (cTokenInfo){

      // Get IdleToken allocation in compound
      const tokenAllocation = await this.getTokenAllocation(tokenConfig,false,false);
      const compoundAllocationPerc = tokenAllocation.protocolsAllocationsPerc[cTokenInfo.address.toLowerCase()];

      // Calculate distribution if compound allocation >= 0.1%
      if (compoundAllocationPerc && compoundAllocationPerc.gte(0.001)){

        // Get COMP distribution speed and Total Supply
        const [
          compSpeed,
          cTokenTotalSupply
        ] = await Promise.all([
          this.getCompSpeed(cTokenInfo.address),
          this.genericContractCall(cTokenInfo.token,'totalSupply'),
        ]);

        if (compSpeed && cTokenTotalSupply){

          // Get Idle liquidity supply
          if (!cTokenIdleSupply){
            cTokenIdleSupply = await this.genericContractCall(cTokenInfo.token,'balanceOf',[tokenConfig.idle.address]);
          }

          if (cTokenIdleSupply){

            // Get COMP distribution for Idle in a Year
            const blocksPerYear = this.getGlobalConfig(['network','blocksPerYear']);

            // Take 50% of distrubution for lenders side
            const compoundPoolShare = this.BNify(cTokenIdleSupply).div(this.BNify(cTokenTotalSupply));
            let compDistribution = this.BNify(compSpeed).times(compoundPoolShare);

            if (annualize){
              compDistribution = compDistribution.div(1e18).times(this.BNify(blocksPerYear));
            }

            if (!this.BNify(compDistribution).isNaN()){
              return this.setCachedDataWithLocalStorage(cachedDataKey,compDistribution);
            }
          }
        }
      }
    }

    return null;
  }
  getCompUserDistribution = async (account=null,availableTokens=null) => {
    if (!account){
      account = this.props.account;
    }
    if (!availableTokens && this.props.selectedStrategy){
      availableTokens = this.props.availableStrategies[this.props.selectedStrategy];
    }

    if (!account || !availableTokens){
      return false;
    }

    let output = this.BNify(0);
    await this.asyncForEach(Object.keys(availableTokens),async (token) => {
      const tokenConfig = availableTokens[token];
      const cTokenInfo = tokenConfig.protocols.find( p => (p.name === 'compound') );
      if (cTokenInfo){
        const [
          userPoolShare,
          compDistribution,
        ] = await Promise.all([
          this.getUserPoolShare(account,tokenConfig,false),
          this.getCompDistribution(tokenConfig,null,false),
        ]);

        if (compDistribution && userPoolShare){
          output = output.plus(compDistribution.times(userPoolShare));
        }
      }
    });

    return output;
  }
  getCompAvgApr = async (availableTokens=null) => {
    if (!availableTokens && this.props.selectedStrategy){
      availableTokens = this.props.availableStrategies[this.props.selectedStrategy];
    }
    let output = this.BNify(0);
    let totalAllocation = this.BNify(0);
    await this.asyncForEach(Object.keys(availableTokens),async (token) => {
      const tokenConfig = availableTokens[token];
      const [compApr,tokenAllocation] = await Promise.all([
        this.getCompAPR(token,tokenConfig),
        this.getTokenAllocation(tokenConfig,false,false)
      ]);
      
      if (compApr && tokenAllocation){
        output = output.plus(compApr.times(tokenAllocation.totalAllocation));
        totalAllocation = totalAllocation.plus(tokenAllocation.totalAllocation);
        // this.customLog(token,compApr.toString(),tokenAllocation.totalAllocation.toString(),output.toString(),totalAllocation.toString());
      }
    });

    output = output.div(totalAllocation);

    return output;
  }
  getTokensCsv = async () => {

    // eslint-disable-next-line
    Array.prototype.sum = function() {
      return this.reduce(function(pv, cv) { return pv + cv; }, 0);
    };
    // eslint-disable-next-line
    Array.prototype.max = function() {
      return Math.max.apply(null, this);
    };
    // eslint-disable-next-line
    Array.prototype.avg = function() {
      return this.sum()/this.length;
    };

    const csv = [];
    const availableStrategies = this.props.availableStrategies;
    await this.asyncForEach(Object.keys(availableStrategies), async (strategy) => {
      const availableTokens = availableStrategies[strategy];
      const isRisk = strategy === 'risk';
      await this.asyncForEach(Object.keys(availableTokens), async (token) => {
        const tokenConfig = availableTokens[token];
        const rates = await this.getTokenApiData(tokenConfig.address,isRisk,null,null,false,7200,'ASC');
        const header = [];
        let protocols = null;
        const rows = [];
        const aprAvg = {};
        const scoreAvg = {};

        const lastRow = rates[rates.length-1];

        rates.forEach( r => {
          if (!protocols){
            header.push('Token');
            header.push('Date');

            // Get protocols
            protocols = [];
            lastRow.protocolsData.forEach( p1 => {
              const foundProtocol = tokenConfig.protocols.find( p2 => ( p2.address.toLowerCase() === p1.protocolAddr.toLowerCase() ) );
              if (foundProtocol){
                protocols.push(foundProtocol);
              }
            });

            // Add APR columns
            header.push('APR Idle');
            header.push('SCORE Idle');

            aprAvg['idle'] = [];
            scoreAvg['idle'] = [];

            protocols.forEach( p => {
              header.push('APR '+p.name);
              header.push('SCORE '+p.name);

              aprAvg[p.name] = [];
              scoreAvg[p.name] = [];
            });

            rows.push(header.join(','));
          }

          const date = moment(r.timestamp*1000).format('YYYY-MM-DD');
          const rate = this.BNify(r.idleRate).div(1e18).toFixed(5);
          const score = parseFloat(r.idleScore);

          const row = [];
          row.push(`${token}-${strategy}`);
          row.push(date);
          row.push(rate);
          row.push(score);

          if (date>='2020-09-15'/* && date<='2020-11-09'*/){
            aprAvg['idle'].push(parseFloat(rate));
            scoreAvg['idle'].push(parseFloat(score));
          }

          protocols.forEach( pInfo => {
            const pData = r.protocolsData.find( p => (p.protocolAddr.toLowerCase() === pInfo.address.toLowerCase()) );
            let pRate = '';
            let pScore = '';
            if (pData){
              pScore = !this.BNify(pData.defiScore).isNaN() ? parseFloat(pData.defiScore) : '0.00000';
              pRate = !this.BNify(pData.rate).isNaN() ? this.BNify(pData.rate).div(1e18) : '0.00000';
              if (typeof pData[`${pInfo.name}AdditionalAPR`] !== 'undefined'){
                const additionalRate = this.BNify(pData[`${pInfo.name}AdditionalAPR`]).div(1e18);
                if (!additionalRate.isNaN()){
                  pRate = pRate.plus(additionalRate);
                }
              }

              if (date>='2020-09-15'/* && date<='2020-11-09'*/){
                if (!isNaN(parseFloat(pRate))){
                  aprAvg[pInfo.name].push(parseFloat(pRate));
                }
                if (!isNaN(parseFloat(pScore))){
                  scoreAvg[pInfo.name].push(parseFloat(pScore));
                }
              }
            }

            row.push(pRate);
            row.push(pScore);
          });

          rows.push(row.join(','));
        });

        Object.keys(aprAvg).forEach( p => {
          const avgRate = aprAvg[p].sum()/aprAvg[p].length;
          this.customLog(`${token}-${strategy}-${p} - Avg Rate: ${avgRate}`);
        });

        Object.keys(scoreAvg).forEach( p => {
          const avgScore = scoreAvg[p].sum()/scoreAvg[p].length;
          this.customLog(`${token}-${strategy}-${p} - Avg Score: ${avgScore}`);
        });

        // if (token==='DAI' && isRisk){
        //   debugger;
        // }

        csv.push(rows.join('\n'));
      });
    });

    this.customLog(csv.join('\n'));
  }
  getGovTokenPool = async (govToken=null,availableTokens=null,convertToken=null) => {
    let output = this.BNify(0);

    if (!availableTokens){
      availableTokens = this.props.availableStrategies[this.props.selectedStrategy];
    }

    await this.asyncForEach(Object.keys(availableTokens),async (token) => {
      const tokenConfig = availableTokens[token];
      const enabledTokens = govToken ? [govToken] : null;
      const compTokenBalance = await this.getGovTokensBalances(tokenConfig.idle.address,convertToken,enabledTokens);
      if (compTokenBalance && compTokenBalance.total){
        output = output.plus(compTokenBalance.total);
      }
    });
    return output;
  }
  getIdleGovToken = () => {
    if (!this.idleGovToken){
      this.idleGovToken = new IdleGovToken(this.props);
    }
    return this.idleGovToken;
  }
  getTokenGovTokens = (tokenConfig) => {
    const output = {};
    const govTokens = this.getGlobalConfig(['govTokens']);
    Object.keys(govTokens).forEach( govToken => {
      const govTokenConfig = govTokens[govToken];
      if (!govTokenConfig.enabled || govTokenConfig.disabledTokens.includes(tokenConfig.idle.token)){
        return;
      }
      if (govTokenConfig.protocol === 'idle'){
        output[govToken] = govTokenConfig;
      } else {
        const foundProtocol = tokenConfig.protocols.find( p => (p.enabled && p.name.toLowerCase() === govTokenConfig.protocol.toLowerCase()) )
        if (foundProtocol){
          output[govToken] = govTokenConfig;
        }
      }
    });
    return output;
  }
  fixDistributionSpeed = (speed,frequency='day',mode='block') => {
    const blocksPerYear = this.BNify(this.getGlobalConfig(['network','blocksPerYear']));
    const secondsPerYear = this.BNify(this.getGlobalConfig(['network','secondsPerYear']));
    const multipliers = {
      'day':{
        'block':blocksPerYear.div(365.242199),
        'second':secondsPerYear.div(365.242199)
      },
      'week':{
        'block':blocksPerYear.div(52.1429),
        'second':secondsPerYear.div(52.1429)
      },
      'month':{
        'block':blocksPerYear.div(12),
        'second':secondsPerYear.div(12)
      },
      'year':{
        'block':blocksPerYear.div(1),
        'second':secondsPerYear.div(1)
      }
    };
    speed = this.BNify(speed);
    if (speed && !speed.isNaN()){
      return speed.times(multipliers[frequency][mode]);
    }
    return null;
  }
  getGovTokensUserDistributionSpeed = async (account,tokenConfig=null,enabledTokens=null) => {
    const govTokensUserDistribution = {};
    const govTokens = this.getGlobalConfig(['govTokens']);

    await this.asyncForEach(Object.keys(govTokens),async (govToken) => {
      if (enabledTokens && !enabledTokens.includes(govToken)){
        return;
      }

      const govTokenConfig = govTokens[govToken];

      if (!govTokenConfig.enabled){
        return;
      }

      const availableTokens = {};
      availableTokens[tokenConfig.token] = tokenConfig;

      let output = null;
      switch (govToken){
        case 'COMP':
          output = await this.getCompUserDistribution(account,availableTokens);
        break;
        case 'IDLE':
          const idleGovToken = this.getIdleGovToken();
          output = await idleGovToken.getUserDistribution(account,availableTokens);
        break;
        default:
        break;
      }

      if (output){
        output = output.div(1e18);
        if (govTokenConfig.distributionFrequency){
          output = this.fixDistributionSpeed(output,govTokenConfig.distributionFrequency,govTokenConfig.distributionMode);
        }
        govTokensUserDistribution[govToken] = output;
      }
    });

    return govTokensUserDistribution;
  }
  getGovTokensDistributionSpeed = async (tokenConfig,enabledTokens=null) => {
    const govTokensDistribution = {};
    const tokenGovTokens = this.getTokenGovTokens(tokenConfig);
    
    await this.asyncForEach(Object.keys(tokenGovTokens), async (govToken) => {
      let govSpeed = null;
      const govTokenConfig = tokenGovTokens[govToken];

      switch (govToken){
        case 'COMP':
          govSpeed = await this.getCompDistribution(tokenConfig,null,false);
        break;
        case 'stkAAVE':
          govSpeed = await this.getStkAaveDistribution(tokenConfig,null,false);
        break;
        case 'IDLE':
          const idleGovToken = this.getIdleGovToken();
          govSpeed = await idleGovToken.getSpeed(tokenConfig.idle.address);
        break;
        default:
        break;
      }

      if (govSpeed){
        govSpeed = govSpeed.div(1e18);
        if (govTokenConfig.distributionFrequency && govTokenConfig.distributionMode){
          govSpeed = this.fixDistributionSpeed(govSpeed,govTokenConfig.distributionFrequency,govTokenConfig.distributionMode);
        }
        govTokensDistribution[govToken] = govSpeed;
      }
    });

    return govTokensDistribution;
  }
  getGovTokensAprs = async (token,tokenConfig,enabledTokens=null) => {
    const govTokens = this.getGlobalConfig(['govTokens']);
    const govTokensAprs = {}

    await this.asyncForEach(Object.keys(govTokens),async (govToken) => {

      if (enabledTokens && !enabledTokens.includes(govToken)){
        return;
      }

      const govTokenConfig = govTokens[govToken];

      if (!govTokenConfig.enabled || govTokenConfig.aprTooltipMode === false){
        return;
      }

      let output = null;
      let tokenAllocation = null;

      switch (govToken){
        case 'stkAAVE':
          switch (govTokenConfig.aprTooltipMode){
            default:
            case 'apr':
              [output,tokenAllocation] = await Promise.all([
                this.getStkAaveApr(token,tokenConfig),
                this.getTokenAllocation(tokenConfig,false,false)
              ]);

              // Cut the AAVE token proportionally on Idle funds allocation in aave
              if (tokenAllocation){
                const aTokenConfig = tokenConfig.protocols.find( p => (p.name === govTokenConfig.protocol) );
                if (aTokenConfig){
                  if (tokenAllocation.protocolsAllocationsPerc[aTokenConfig.address.toLowerCase()]){
                    const aaveAllocationPerc = tokenAllocation.protocolsAllocationsPerc[aTokenConfig.address.toLowerCase()];
                    output = output.times(aaveAllocationPerc);
                  }
                }
              }
            break;
          }
        break;
        case 'COMP':
          switch (govTokenConfig.aprTooltipMode){
            default:
            case 'apr':
              [output,tokenAllocation] = await Promise.all([
                this.getCompAPR(token,tokenConfig),
                this.getTokenAllocation(tokenConfig,false,false)
              ]);

              // Cut the COMP token proportionally on Idle funds allocation in compound
              if (tokenAllocation){
                const cTokenConfig = tokenConfig.protocols.find( p => (p.name === 'compound') );
                if (cTokenConfig){
                  if (tokenAllocation.protocolsAllocationsPerc[cTokenConfig.address.toLowerCase()]){
                    const compoundAllocationPerc = tokenAllocation.protocolsAllocationsPerc[cTokenConfig.address.toLowerCase()];
                    output = output.times(compoundAllocationPerc);
                  }
                }
              }
            break;
          }
        break;
        case 'IDLE':
          const idleGovToken = this.getIdleGovToken();
          switch (govTokenConfig.aprTooltipMode){
            case 'apr':
              output = await idleGovToken.getAPR(token,tokenConfig);
            break;
            case 'distribution':
              output = await idleGovToken.getSpeed(tokenConfig.idle.address);
              if (output){
                output = this.fixTokenDecimals(output,18);
                output = this.fixDistributionSpeed(output,govTokenConfig.distributionFrequency,govTokenConfig.distributionMode);
              }
            break;
            case 'userDistribution':
              output = await idleGovToken.getUserDistribution(tokenConfig);
            break;
            default:
            break;
          }
        break;
        default:
        break;
      }

      if (output !== null && this.BNify(output).gt(0)){
        govTokensAprs[govToken] = output;
      }
    });

    return govTokensAprs;
  }
  getGovTokensBalances = async (address=null,convertToken='DAI',enabledTokens=null) => {
    if (!address){
      address = this.props.tokenConfig.idle.address;
    }

    const cachedDataKey = `getGovTokensBalances_${address}_${convertToken}_${JSON.stringify(enabledTokens)}`;
    const cachedData = this.getCachedData(cachedDataKey);
    if (cachedData){
      return cachedData;
    }

    const govTokens = this.getGlobalConfig(['govTokens']);
    const govTokensBalances = {}

    await this.asyncForEach(Object.keys(govTokens),async (token) => {

      if (enabledTokens && !enabledTokens.includes(token)){
        return;
      }
      
      const govTokenConfig = govTokens[token];

      if (!govTokenConfig.enabled){
        return;
      }

      const destTokenConfig = {
        address:govTokenConfig.addressForPrice || govTokenConfig.address
      };

      // Get gov token balance
      let govTokenBalance = await this.getProtocolBalance(token,address);

      if (govTokenBalance){
        // Get gov token conversion rate
        let tokenConversionRate = null;
        if (convertToken){
          const fromTokenConfig = this.getGlobalConfig(['stats','tokens',convertToken]);
          try {
            tokenConversionRate = await this.getUniswapConversionRate(fromTokenConfig,destTokenConfig);
          } catch (error) {
            tokenConversionRate = this.BNify(0);
          }
        }

        const tokenBalance = this.fixTokenDecimals(govTokenBalance,govTokens[token].decimals,tokenConversionRate);

        // Fix token decimals and convert
        govTokensBalances[token] = tokenBalance;

        // Initialize Total gov Tokens
        if (!govTokensBalances.total){
          govTokensBalances.total = this.BNify(0);
        }

        // Sum Total gov Tokens
        govTokensBalances.total = govTokensBalances.total.plus(govTokensBalances[token]);
      }
    });

    return this.setCachedData(cachedDataKey,govTokensBalances);
  }
  getGovTokenConfigByAddress = (address) => {
    if (!address){
      return false;
    }
    const govTokens = this.getGlobalConfig(['govTokens']);
    return Object.values(govTokens).find( tokenConfig => (tokenConfig.enabled && tokenConfig.address.toLowerCase() === address.toLowerCase()) );
  }
  getGovTokensUserTotalBalance = async (account=null,availableTokens=null,convertToken=null,checkShowBalance=true) => {

    // Check for cached data
    const cachedDataKey = `govTokensUserTotalBalance_${account}_${JSON.stringify(availableTokens)}_${convertToken}_${checkShowBalance}`;
    const cachedData = this.getCachedDataWithLocalStorage(cachedDataKey);
    if (cachedData && !this.BNify(cachedData).isNaN()){
      return this.BNify(cachedData);
    }

    const govTokensUserBalances = await this.getGovTokensUserBalances(account,availableTokens,convertToken,null,checkShowBalance);
    if (govTokensUserBalances){
      const govTokensEarnings = Object.values(govTokensUserBalances).reduce( (acc, govTokenAmount) => {
        acc = acc.plus(this.BNify(govTokenAmount));
        return acc;
      }, this.BNify(0));

      return this.setCachedDataWithLocalStorage(cachedDataKey,govTokensEarnings);
    }
    return this.BNify(0);
  }
  getGovTokensIndexes = async (account,tokenConfig) => {
    if (!account){
      account = this.props.account;
    }
    const output = {};
    const govTokensAmounts = await this.genericContractCall(tokenConfig.idle.token,'getGovTokensAmounts',[account]);
    if (govTokensAmounts){
      await this.asyncForEach(govTokensAmounts, async (govTokenAmount,govTokenIndex) => {
        // Get gov Token config by index
        const govTokenAddress = await this.genericContractCall(tokenConfig.idle.token,'govTokens',[govTokenIndex]);

        if (govTokenAddress){
          const govTokenConfig = this.getGovTokenConfigByAddress(govTokenAddress);

          if (govTokenConfig){
            output[govTokenConfig.token] = govTokenIndex;
          }
        }
      });
    }

    return output;
  }
  getGovTokensUserBalances = async (account=null,availableTokens=null,convertToken=null,govTokenConfigForced=null,checkShowBalance=false) => {
    if (!account){
      account = this.props.account;
    }
    if (!availableTokens && this.props.availableStrategies && this.props.selectedStrategy){
      availableTokens = this.props.availableStrategies[this.props.selectedStrategy];
    }

    const output = {};

    await this.asyncForEach(Object.keys(availableTokens),async (token) => {
      const idleTokenConfig = availableTokens[token].idle;

      // Get govTokens amounts
      const govTokensAmounts = await this.genericContractCall(idleTokenConfig.token,'getGovTokensAmounts',[account]);

      // console.log('getGovTokensUserBalances_1',idleTokenConfig.token,govTokensAmounts);

      if (govTokensAmounts){
        await this.asyncForEach(govTokensAmounts, async (govTokenAmount,govTokenIndex) => {
          govTokenAmount = this.BNify(govTokenAmount);
          // Get gov Token config by index
          const govTokenAddress = await this.genericContractCall(idleTokenConfig.token,'govTokens',[govTokenIndex]);

          // console.log('getGovTokensUserBalances_2',idleTokenConfig.token,govTokenIndex,govTokenAddress);

          if (govTokenAddress){
            const govTokenConfig = govTokenConfigForced ? govTokenConfigForced : this.getGovTokenConfigByAddress(govTokenAddress);

            if (govTokenConfig && (!checkShowBalance || govTokenConfig.showBalance) && govTokenConfig.address && govTokenConfig.address.toLowerCase() === govTokenAddress.toLowerCase()){

              // Get gov token conversion rate
              let tokenConversionRate = null;
              if (convertToken){
                const fromTokenConfig = this.getGlobalConfig(['stats','tokens',convertToken]);
                if (fromTokenConfig){
                  try {
                    tokenConversionRate = await this.getUniswapConversionRate(fromTokenConfig,govTokenConfig);
                  } catch (error) {
                    
                  }
                }
              }

              govTokenAmount = this.fixTokenDecimals(govTokenAmount,govTokenConfig.decimals,tokenConversionRate);

              // console.log('getGovTokensUserBalances',idleTokenConfig.token,govTokenIndex,govTokenConfig.token,govTokenAddress,parseFloat(tokenConversionRate),parseFloat(govTokenAmount));

              // Initialize govToken balance
              if (!output[govTokenConfig.token]){
                output[govTokenConfig.token] = this.BNify(0); // this.BNify(1) for testing
              }

              // Add govTokens balance
              output[govTokenConfig.token] = output[govTokenConfig.token].plus(govTokenAmount);
            }
          }
        });
      }
    });

    return output;
  }
  getTokenFees = async (tokenConfig=null) => {
    if (!tokenConfig && this.props.tokenConfig){
      tokenConfig = this.props.tokenConfig;
    }
    const fee = await this.genericContractCall(tokenConfig.idle.token, 'fee');
    if (fee){
      return this.BNify(fee).div(this.BNify(100000));
    }
    return null;
  }
  getUserTokenFees = async (tokenConfig=null,account=null) => {
    if (!tokenConfig && this.props.tokenConfig){
      tokenConfig = this.props.tokenConfig;
    }
    if (!account && this.props.account){
      account = this.props.account;
    }

    if (!account || !tokenConfig){
      return null;
    }

    let [
      feePercentage,
      amountLent,
      redeemableBalance
    ] = await Promise.all([
      this.getTokenFees(tokenConfig),
      this.loadAssetField('amountLent',tokenConfig.token,tokenConfig,account),
      this.loadAssetField('redeemableBalance',tokenConfig.token,tokenConfig,account)
    ]);

    if (feePercentage && amountLent && redeemableBalance){
      const gain = redeemableBalance.minus(amountLent);
      const fees = gain.times(feePercentage);

      // this.customLog('fees',tokenConfig.token,amountLent.toString(),redeemableBalance.toString(),gain.toString(),fees.toString());

      return fees;
    }

    return null;
  }
  getGovTokenUserBalance = async (govTokenConfig,account=null,availableTokens=null,convertToken=null) => {
    const govTokensUserBalances = await this.getGovTokensUserBalances(account,availableTokens,convertToken,govTokenConfig);
    return govTokensUserBalances && govTokensUserBalances[govTokenConfig.token] ? govTokensUserBalances[govTokenConfig.token] : this.BNify(0);
  }
  getTotalTVL = async () => {
    const tokensTVL = await this.getTokensTVL();
    return Object.values(tokensTVL).reduce( (totalTVL,tokenInfo) => {
      const tokenTVL = this.BNify(tokenInfo.totalTVL);
      if (tokenTVL && !tokenTVL.isNaN()){
        totalTVL = totalTVL.plus(tokenTVL);
      }
      return totalTVL;
    },this.BNify(0));
  }
  getTokensTVL = async () => {
    const output = {};
    const DAITokenConfig = this.getGlobalConfig(['stats','tokens','DAI']);
    await this.asyncForEach(Object.keys(this.props.availableStrategies),async (strategy) => {
      const isRisk = strategy === 'risk';
      const availableTokens = this.props.availableStrategies[strategy];
      await this.asyncForEach(Object.keys(availableTokens),async (token) => {

        let tokenTVL = this.BNify(0);
        let totalTVL = this.BNify(0);
        let oldTokenTVL = this.BNify(0);
        const tokenConfig = availableTokens[token];
        const idleTokenName = tokenConfig.idle.token;

        output[idleTokenName] = {
          tokenTVL,
          totalTVL,
          oldTokenTVL,
          govTokens:{},
        };

        const [
          tokenPrice,
          totalSupply
        ] = await Promise.all([
          this.getIdleTokenPrice(tokenConfig),
          this.getIdleTokenSupply(tokenConfig)
        ]);

        tokenTVL = this.fixTokenDecimals(totalSupply,18).times(tokenPrice);
        tokenTVL = await this.convertTokenBalance(tokenTVL,token,tokenConfig,isRisk);

        output[idleTokenName].tokenTVL = tokenTVL;
        totalTVL = totalTVL.plus(tokenTVL);

        // Add Gov Tokens
        const govTokens = this.getTokenGovTokens(tokenConfig);
        if (govTokens){
          await this.asyncForEach(Object.keys(govTokens).filter( govToken => (govTokens[govToken].showAUM) ), async (govToken) => {
            const govTokenConfig = govTokens[govToken];
            const [
              govTokenBalance,
              govTokenConversionRate
            ] = await Promise.all([
              this.getProtocolBalance(govToken,tokenConfig.idle.address),
              this.getUniswapConversionRate(DAITokenConfig,govTokenConfig)
            ]);
            
            if (govTokenBalance && govTokenConversionRate){
              const govTokenBalanceConverted = this.fixTokenDecimals(govTokenBalance,govTokenConfig.decimals).times(this.BNify(govTokenConversionRate));
              if (govTokenBalanceConverted && !govTokenBalanceConverted.isNaN()){
                totalTVL = totalTVL.plus(govTokenBalanceConverted);
                output[idleTokenName].govTokens[govToken] = govTokenBalanceConverted;
              }
            }
          });
        }

        // Get old token allocation
        if (tokenConfig.migration && tokenConfig.migration.oldContract){
          const oldTokenConfig = Object.assign({},tokenConfig);
          oldTokenConfig.protocols = Object.values(tokenConfig.protocols);
          oldTokenConfig.idle = Object.assign({},tokenConfig.migration.oldContract);

          // Replace protocols with old protocols
          if (oldTokenConfig.migration.oldProtocols){
            oldTokenConfig.migration.oldProtocols.forEach( oldProtocol => {
              const foundProtocol = oldTokenConfig.protocols.find( p => (p.name === oldProtocol.name) );
              if (foundProtocol){
                const protocolPos = oldTokenConfig.protocols.indexOf(foundProtocol);
                oldTokenConfig.protocols[protocolPos] = oldProtocol;
              }
            });
          }

          const [
            oldTokenPrice,
            oldTotalSupply
          ] = await Promise.all([
            this.getIdleTokenPrice(oldTokenConfig),
            this.getIdleTokenSupply(oldTokenConfig.idle.name)
          ]);

          if (oldTokenPrice && oldTotalSupply){
            oldTokenTVL = this.fixTokenDecimals(oldTotalSupply,18).times(oldTokenPrice);
            oldTokenTVL = await this.convertTokenBalance(oldTokenTVL,token,oldTokenConfig,isRisk);
            if (oldTokenTVL && !oldTokenTVL.isNaN()){
              output[idleTokenName].oldTokenTVL = oldTokenTVL;
              totalTVL = totalTVL.plus(oldTokenTVL);
            }
          }
        }

        output[idleTokenName].totalTVL = totalTVL;
      });
    });

    return output;
  }
  getSubstackLatestFeed = async () => {
    const cachedDataKey = `substackLatestFeed`;
    const cachedData = this.getCachedDataWithLocalStorage(cachedDataKey);
    if (cachedData){
      return cachedData;
    }

    const config = this.getGlobalConfig(['stats','config']);
    const endpointInfo = this.getGlobalConfig(['stats','substack']);
    const idleSubstackFeed = await this.makeRequest(endpointInfo.endpoint,false,config);

    if (idleSubstackFeed && idleSubstackFeed.data && idleSubstackFeed.data.items && idleSubstackFeed.data.items.length>0){
      const latestFeed = idleSubstackFeed.data.items[0];
      return this.setCachedDataWithLocalStorage(cachedDataKey,latestFeed,endpointInfo.TTL);
    }

    return null;
  }
  getAggregatedStats = async (addGovTokens=true) => {
    const config = this.getGlobalConfig(['stats','config']);
    const endpointInfo = this.getGlobalConfig(['stats','tvls']);
    const tvls = await this.makeCachedRequest(endpointInfo.endpoint,endpointInfo.TTL,true,false,config);

    if (tvls){
      const avgAPY = this.BNify(tvls.avgAPY);
      const totalAUM = this.BNify(tvls.totalTVL);
      return {
        avgAPY,
        totalAUM
      };
    } else {
      return await this.getAggregatedStats_chain();
    }
  }
  getAggregatedStats_chain = async (addGovTokens=true) => {

    // Check for cached data
    const cachedDataKey = `getAggregatedStats_${addGovTokens}`;
    const cachedData = this.getCachedDataWithLocalStorage(cachedDataKey);
    if (cachedData && (cachedData.avgAPR && !this.BNify(cachedData.avgAPR).isNaN()) && (cachedData.avgAPY && !this.BNify(cachedData.avgAPY).isNaN()) && (cachedData.totalAUM && !this.BNify(cachedData.totalAUM).isNaN())){
      return {
        avgAPR:this.BNify(cachedData.avgAPR),
        avgAPY:this.BNify(cachedData.avgAPY),
        totalAUM:this.BNify(cachedData.totalAUM)
      };
    }

    let avgAPR = this.BNify(0);
    let avgAPY = this.BNify(0);
    let totalAUM = this.BNify(0);
    const DAITokenConfig = this.getGlobalConfig(['stats','tokens','DAI']);
    await this.asyncForEach(Object.keys(this.props.availableStrategies),async (strategy) => {
      const isRisk = strategy === 'risk';
      const availableTokens = this.props.availableStrategies[strategy];
      await this.asyncForEach(Object.keys(availableTokens),async (token) => {
        const tokenConfig = availableTokens[token];
        const tokenAllocation = await this.getTokenAllocation(tokenConfig,false,addGovTokens);
        const tokenAprs = await this.getTokenAprs(tokenConfig,tokenAllocation,addGovTokens);
        if (tokenAllocation && tokenAllocation.totalAllocationWithUnlent && !tokenAllocation.totalAllocationWithUnlent.isNaN()){
          const tokenAUM = await this.convertTokenBalance(tokenAllocation.totalAllocationWithUnlent,token,tokenConfig,isRisk);
          totalAUM = totalAUM.plus(tokenAUM);
          // console.log(tokenConfig.idle.token+'V4',tokenAUM.toFixed());
          if (tokenAprs && tokenAprs.avgApr && !tokenAprs.avgApr.isNaN()){
            avgAPR = avgAPR.plus(tokenAUM.times(tokenAprs.avgApr));
            avgAPY = avgAPY.plus(tokenAUM.times(tokenAprs.avgApy));
          }
        }

        // Add Gov Tokens
        const govTokens = this.getTokenGovTokens(tokenConfig);
        if (govTokens){
          await this.asyncForEach(Object.keys(govTokens).filter( govToken => (govTokens[govToken].showAUM) ), async (govToken) => {
            const govTokenConfig = govTokens[govToken];
            const [
              tokenBalance,
              tokenConversionRate
            ] = await Promise.all([
              this.getProtocolBalance(govToken,tokenConfig.idle.address),
              this.getUniswapConversionRate(DAITokenConfig,govTokenConfig)
            ]);
            
            if (tokenBalance && tokenConversionRate){
              const tokenBalanceConverted = this.fixTokenDecimals(tokenBalance,govTokenConfig.decimals).times(this.BNify(tokenConversionRate));
              if (tokenBalanceConverted && !tokenBalanceConverted.isNaN()){
                // console.log(tokenConfig.idle.token+'V4 - COMP',tokenBalanceConverted.toFixed());
                totalAUM = totalAUM.plus(tokenBalanceConverted);
              }
            }
          });
        }

        // Get old token allocation
        if (tokenConfig.migration && tokenConfig.migration.oldContract){
          const oldTokenConfig = Object.assign({},tokenConfig);
          oldTokenConfig.protocols = Object.values(tokenConfig.protocols);
          oldTokenConfig.idle = Object.assign({},tokenConfig.migration.oldContract);

          // Replace protocols with old protocols
          if (oldTokenConfig.migration.oldProtocols){
            oldTokenConfig.migration.oldProtocols.forEach( oldProtocol => {
              const foundProtocol = oldTokenConfig.protocols.find( p => (p.name === oldProtocol.name) );
              if (foundProtocol){
                const protocolPos = oldTokenConfig.protocols.indexOf(foundProtocol);
                oldTokenConfig.protocols[protocolPos] = oldProtocol;
              }
            });
          }

          const oldTokenAllocation = await this.getTokenAllocation(oldTokenConfig,false,false);
          if (oldTokenAllocation && oldTokenAllocation.totalAllocation && !oldTokenAllocation.totalAllocation.isNaN()){
            const oldTokenTotalAllocation = await this.convertTokenBalance(oldTokenAllocation.totalAllocation,token,oldTokenConfig,isRisk);
            totalAUM = totalAUM.plus(oldTokenTotalAllocation);
            // console.log(oldTokenConfig.idle.name,oldTokenTotalAllocation.toFixed(5));
          }
        }
      });
    });

    avgAPR = avgAPR.div(totalAUM);
    avgAPY = avgAPY.div(totalAUM);

    const output = {
      avgAPR,
      avgAPY,
      totalAUM
    };

    return this.setCachedDataWithLocalStorage(cachedDataKey,output);
  }
  getTokenApy = async (tokenConfig) => {
    const tokenAprs = await this.getTokenAprs(tokenConfig);
    if (tokenAprs && tokenAprs.avgApy !== null){
      return tokenAprs.avgApy;
    }
    return null;
  }
  getTokensToMigrate = async (selectedStrategy=null) => {

    if (!this.props.availableStrategies || !this.props.account){
      return false;
    }

    const tokensToMigrate = {};

    await this.asyncForEach(Object.keys(this.props.availableStrategies),async (strategy) => {
      if (selectedStrategy && selectedStrategy !== strategy){
        return;
      }
      const availableTokens = this.props.availableStrategies[strategy];
      await this.asyncForEach(Object.keys(availableTokens),async (token) => {
        const tokenConfig = availableTokens[token];
        const {
          migrationEnabled,
          oldContractBalanceFormatted
        } = await this.checkMigration(tokenConfig,this.props.account);
        
        if (migrationEnabled){
          const tokenKey = selectedStrategy ? token : tokenConfig.idle.token;
          tokensToMigrate[tokenKey] = {
            token,
            strategy,
            tokenConfig,
            oldContractBalanceFormatted
          }
        }
      });
    });

    return tokensToMigrate;
  }
  /*
  Get protocols tokens balances
  */
  getProtocolsTokensBalances = async (protocol=null) => {
    if (!this.props.account){
      return false;
    }
    const tokenBalances = {};
    const minTokenBalance = this.BNify(1).div(1e4);
    const protocolsTokens = this.getGlobalConfig(['tools','tokenMigration','props','availableTokens']);
    if (protocolsTokens){
      await this.asyncForEach(Object.keys(protocolsTokens),async (token) => {
        const tokenConfig = protocolsTokens[token];
        if (protocol !== null && tokenConfig.protocol.toLowerCase() !== protocol.toLowerCase() ){
          return;
        }
        let tokenContract = this.getContractByName(tokenConfig.token);
        if (!tokenContract && tokenConfig.abi){
          tokenContract = await this.props.initContract(tokenConfig.token,tokenConfig.address,tokenConfig.abi);
        }
        if (tokenContract){
          const tokenBalance = await this.getTokenBalance(tokenConfig.token,this.props.account);
          if (tokenBalance && tokenBalance.gte(minTokenBalance)){
            tokenBalances[token] = {
              tokenConfig,
              balance:tokenBalance,
            };
          }
        }
      });
    }

    return tokenBalances;
  }
  /*
  Convert token Balance
  */
  convertTokenBalance = async (tokenBalance,token,tokenConfig,isRisk=false) => {
    // Check for USD conversion rate
    tokenBalance = this.BNify(tokenBalance);
    if (tokenBalance.gt(0)){
      const tokenUsdConversionRate = await this.getTokenConversionRate(tokenConfig,isRisk);
      // console.log('convertTokenBalance',token,isRisk,tokenUsdConversionRate);
      if (tokenUsdConversionRate){
        tokenBalance = tokenBalance.times(tokenUsdConversionRate);
      }
    }
    return tokenBalance;
  }

  getAvgAPYStats = async (address,isRisk,startTimestamp=null,endTimestamp=null) => {

    const apiResults = await this.getTokenApiData(address,isRisk,startTimestamp,endTimestamp,true,7200);

    if (apiResults && apiResults.length){
      const apr = apiResults.reduce( (sum,r) => {
        const idleRate = this.fixTokenDecimals(r.idleRate,18);
        return sum.plus(idleRate);
      },this.BNify(0));

      // Calculate average
      return apr.div(apiResults.length);
    }

    return this.BNify(0);
  }

  /*
  Get idleToken conversion rate
  */
  getTokenConversionRate = async (tokenConfig,isRisk,conversionRateField=null,count=0) => {

    if (!conversionRateField){
      conversionRateField = this.getGlobalConfig(['stats','tokens',tokenConfig.token,'conversionRateField']);
      if (!conversionRateField){
        return null;
      }
    }

    // Check for cached data
    const cachedDataKey = `tokenConversionRate_${tokenConfig.address}_${isRisk}_${conversionRateField}`;
    const cachedData = this.getCachedDataWithLocalStorage(cachedDataKey);
    if (cachedData && !this.BNify(cachedData).isNaN()){
      return this.BNify(cachedData);
    }

    let tokenData = await this.getTokenApiData(tokenConfig.address,isRisk,null,null,false,null,'desc',1);

    if (tokenData && tokenData.length){
      tokenData = tokenData.pop();
      if (tokenData && !this.BNify(tokenData[conversionRateField]).isNaN()){
        const conversionRate = this.fixTokenDecimals(tokenData[conversionRateField],18);
        if (!this.BNify(conversionRate).isNaN()){
          return this.setCachedDataWithLocalStorage(cachedDataKey,conversionRate);
        }
      }
    }

    const DAITokenConfig = this.getGlobalConfig(['stats','tokens','DAI']);
    const conversionRate = await this.getUniswapConversionRate(DAITokenConfig,tokenConfig);
    if (!this.BNify(conversionRate).isNaN()){
      return this.setCachedDataWithLocalStorage(cachedDataKey,conversionRate);
    }

    if (count<3){
      return await this.getTokenConversionRate(tokenConfig,isRisk,conversionRateField,count+1); 
    }

    return null;
  }

  getTokenScore = async (tokenConfig,isRisk) => {
    // Check for cached data
    const cachedDataKey = `tokenScore_${tokenConfig.address}_${isRisk}`;
    const cachedData = this.getCachedDataWithLocalStorage(cachedDataKey);
    if (cachedData && !this.BNify(cachedData).isNaN()){
      return this.BNify(cachedData);
    }

    const apiInfo = globalConfigs.stats.rates;
    const config = this.getGlobalConfig(['stats','config']);
    const endpoint = `${apiInfo.endpoint}${tokenConfig.address}?isRisk=${isRisk}&limit=1&order=DESC`;
    const [
      tokenData,
      tokenAllocation
    ] = await Promise.all([
      this.makeCachedRequest(endpoint,apiInfo.TTL,true,false,config),
      this.getTokenAllocation(tokenConfig,false,false)
    ]);

    let tokenScore = this.BNify(0);

    if (tokenData && tokenAllocation){
      Object.keys(tokenAllocation.protocolsAllocationsPerc).forEach( protocolAddr => {
        const protocolAllocationPerc = this.BNify(tokenAllocation.protocolsAllocationsPerc[protocolAddr]);
        if (protocolAllocationPerc.gt(0.001) && tokenData.length>0){
          const protocolInfo = tokenData[0].protocolsData.find( p => (p.protocolAddr.toLowerCase() === protocolAddr.toLowerCase()) );
          if (protocolInfo){
            const protocolScore = this.BNify(protocolInfo.defiScore);
            if (!protocolScore.isNaN()){
              tokenScore = tokenScore.plus(protocolScore.times(protocolAllocationPerc));
            }
          }
        }
      });
    }

    // Fallback
    if (!tokenScore || tokenScore.isNaN() || tokenScore.lte(0)){
      tokenScore = await this.getTokenScoreApi(tokenConfig,isRisk);
    }

    return this.setCachedDataWithLocalStorage(cachedDataKey,tokenScore);
  }

  /*
  Get idleToken score
  */
  getTokenScoreApi = async (tokenConfig,isRisk) => {
    // Check for cached data
    const cachedDataKey = `tokenScoreApi_${tokenConfig.address}_${isRisk}`;
    const cachedData = this.getCachedDataWithLocalStorage(cachedDataKey);
    if (cachedData && !this.BNify(cachedData).isNaN()){
      return this.BNify(cachedData);
    }

    const apiInfo = globalConfigs.stats.scores;
    const config = this.getGlobalConfig(['stats','config']);
    const endpoint = `${apiInfo.endpoint}${tokenConfig.address}?isRisk=${isRisk}`;
    let scores = await this.makeCachedRequest(endpoint,apiInfo.TTL,true,false,config);

    if (scores && scores.length>0){
      let tokenData = scores.find( s => s.address.toLowerCase() === tokenConfig.address.toLowerCase() );
      if (tokenData){
        let tokenScore = this.BNify(tokenData.idleScore);
        if (tokenScore && tokenScore.gt(0)){
          // Set cached data
          return this.setCachedData(cachedDataKey,tokenScore);
        // Take latest historical valid score
        } else {
          const timestamp = parseInt(Date.now()/1000);
          const startTimestamp = parseInt(timestamp)-(60*60*24);
          tokenData = await this.getTokenApiData(tokenConfig.address,isRisk,startTimestamp,null,true,null,'DESC');

          const filteredTokenData = tokenData.filter( d => (this.BNify(d.idleScore).gt(0)) );
          if (filteredTokenData.length){
            tokenScore = this.BNify(filteredTokenData[0].idleScore);
            if (!this.BNify(tokenScore).isNaN()){
              return this.setCachedDataWithLocalStorage(cachedDataKey,tokenScore);
            }
          }
        }
      }
    }

    return this.BNify(0);
  }
  /*
  Get idleTokens aggregated APR
  */
  getTokenAprs = async (tokenConfig,tokenAllocation=false,addGovTokens=true) => {

    const tokenAprs = {
      avgApr: this.BNify(0),
      avgApy: this.BNify(0)
    };

    if (!tokenConfig.idle){
      // console.log('getTokenAprs - !tokenConfig.idle',tokenConfig);
      return tokenAprs;
    }

    // Check for cached data
    const cachedDataKey = `tokenAprs_${tokenConfig.idle.address}_${addGovTokens}`;
    const cachedData = this.getCachedDataWithLocalStorage(cachedDataKey);
    if (cachedData && (cachedData.avgApr && !this.BNify(cachedData.avgApr).isNaN()) && (cachedData.avgApy && !this.BNify(cachedData.avgApy).isNaN()) ){
      // console.log('getTokenAprs - CACHED',tokenConfig.idle.token,cachedData);
      return {
        avgApr:this.BNify(cachedData.avgApr),
        avgApy:this.BNify(cachedData.avgApy)
      };
    }

    const Aprs = await this.getAprs(tokenConfig.idle.token);

    if (!Aprs){
      // console.log('getTokenAprs - !Aprs',Aprs);
      return tokenAprs;
    }

    if (!tokenAllocation){
      tokenAllocation = await this.getTokenAllocation(tokenConfig);
    }

    if (!tokenAllocation){
      // console.log('getTokenAprs - !tokenAllocation',tokenAllocation);
      return tokenAprs;
    }

    const addresses = Aprs.addresses.map((addr,i) => { return addr.toString().toLowerCase() });
    const aprs = Aprs.aprs;

    const govTokensAprs = {};
    const protocolsAprs = {};
    const protocolsApys = {};

    await this.asyncForEach(tokenConfig.protocols,async (protocolInfo,i) => {
      const protocolAddr = protocolInfo.address.toString().toLowerCase();
      const addrIndex = addresses.indexOf(protocolAddr);
      if ( addrIndex !== -1 ) {
        let protocolApr = this.BNify(+this.toEth(aprs[addrIndex]));
        let protocolApy = this.apr2apy(protocolApr.div(100)).times(100);

        if (addGovTokens){
          let govTokenAPR = null;
          const tokenGovTokens = this.getTokenGovTokens(tokenConfig);
          await this.asyncForEach(Object.keys(tokenGovTokens), async (govToken) => {
            switch (govToken){
              case 'COMP':
                govTokenAPR = await this.getCompAPR(tokenConfig.token,tokenConfig);
              break;
              case 'stkAAVE':
                govTokenAPR = await this.getStkAaveApr(tokenConfig.token,tokenConfig);
              break;
              default:
              break;
            }
            if (govTokenAPR){
              govTokensAprs[govToken] = govTokenAPR;
            }
          });
          
        }

        protocolsApys[protocolAddr] = protocolApy;
        protocolsAprs[protocolAddr] = protocolApr;
      }
    });

    if (tokenAllocation){
      tokenAprs.avgApr = this.getAvgApr(protocolsAprs,tokenAllocation.protocolsAllocations,tokenAllocation.totalAllocation);
      tokenAprs.avgApy = this.getAvgApr(protocolsApys,tokenAllocation.protocolsAllocations,tokenAllocation.totalAllocation);

      Object.values(govTokensAprs).forEach( govTokenAPR => {
        tokenAprs.avgApr = tokenAprs.avgApr.plus(govTokenAPR);
        tokenAprs.avgApy = tokenAprs.avgApy.plus(govTokenAPR);
      });

      // console.log('getTokenAprs',tokenConfig.idle.token,tokenConfig,aprs,protocolsAprs,tokenAllocation,tokenAprs,govTokensAprs);

      // Add $IDLE token APR
      const idleGovTokenShowAPR = this.getGlobalConfig(['govTokens','IDLE','showAPR']);
      const idleGovTokenEnabled = this.getGlobalConfig(['govTokens','IDLE','enabled']);
      if (idleGovTokenEnabled && idleGovTokenShowAPR){
        const idleGovToken = this.getIdleGovToken();
        const idleAPR = await idleGovToken.getAPR(tokenConfig.token,tokenConfig);
        if (idleAPR){
          tokenAprs.avgApr = tokenAprs.avgApr.plus(idleAPR);
          tokenAprs.avgApy = tokenAprs.avgApy.plus(idleAPR);
        }
      }

      if (this.BNify(tokenAprs.avgApy).isNaN()){
        tokenAprs.avgApy = this.BNify(0);
      }
      if (this.BNify(tokenAprs.avgApr).isNaN()){
        tokenAprs.avgApr = this.BNify(0);
      }

      return this.setCachedDataWithLocalStorage(cachedDataKey,tokenAprs);
    }

    return tokenAprs;
  }
  abbreviateNumber(value,decimals=3,maxPrecision=5,minPrecision=0){

    const isNegative = parseFloat(value)<0;
    let newValue = this.BNify(value).abs();
    const suffixes = ["", "K", "M", "B","T"];
    let suffixNum = 0;
    while (newValue.gte(1000)) {
      newValue = newValue.div(1000);
      suffixNum++;
    }

    maxPrecision = Math.max(1,maxPrecision);

    // Prevent decimals on integer number
    if (value>=1000){
      const decimalPart = decimals ? newValue.mod(1).toFixed(maxPrecision).substr(2,decimals) : null;
      newValue = parseInt(newValue).toString()+( decimalPart ? '.'+decimalPart : '' );
    } else {
      newValue = newValue.toFixed(decimals);
    }

    // Adjust number precision
    if (newValue>=1 && (newValue.length-1)>maxPrecision){
      newValue = parseFloat(newValue).toPrecision(maxPrecision);
    } else if ((newValue.length-1)<minPrecision) {
      const difference = minPrecision-(newValue.length-1);
      const append = this.BNify(value).abs().toString().replace('.','').substr((newValue.length-1),difference);
      newValue += append;
    }

    // Add minus if number is negative
    if (isNegative){
      newValue = '-'+newValue;
    }

    newValue += suffixes[suffixNum];

    return newValue;
  }
  getFormattedBalance(balance,label,decimals,maxLen,highlightedDecimals){
    const defaultValue = '-';
    decimals = !isNaN(decimals) ? decimals : 6;
    maxLen = !isNaN(maxLen) ? maxLen : 10;
    highlightedDecimals = !isNaN(highlightedDecimals) ? highlightedDecimals : 0;
    balance = parseFloat(this.BNify(balance)).toFixed(decimals);

    const numLen = balance.toString().replace('.','').length;
    if (numLen>maxLen){
      decimals = Math.max(0,decimals-(numLen-maxLen));
      balance = parseFloat(this.BNify(balance)).toFixed(decimals);
    }

    const intPart = Math.floor(balance);
    let decPart = (balance%1).toPrecision(decimals).substr(2,decimals);;
    decPart = (decPart+("0".repeat(decimals))).substr(0,decimals);

    if (highlightedDecimals){
      const highlightedDec = decPart.substr(0,highlightedDecimals);
      decPart = decPart.substr(highlightedDecimals);
      const highlightedIntPart = (<Text.span fontSize={'100%'} color={'blue'} fontWeight={'inerith'}>{intPart}.{highlightedDec}</Text.span>);
      return !isNaN(this.trimEth(balance)) ? ( <>{highlightedIntPart}<small style={{fontSize:'70%'}}>{decPart}</small> <Text.span fontSize={[1,2]}>{label}</Text.span></> ) : defaultValue;
    } else {
      return !isNaN(this.trimEth(balance)) ? ( <>{intPart}<small>.{decPart}</small>{ label !== '%' ? ' ' : null }{ label ? <Text.span fontSize={[1,2]}>{label}</Text.span> : null }</> ) : defaultValue;
    }
  }
};

export default FunctionsUtil;