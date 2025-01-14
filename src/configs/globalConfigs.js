import Staking from '../Staking/Staking';
import IDLE from '../contracts/IDLE.json';
import WETH from '../abis/tokens/WETH.json';
import COMP from '../abis/compound/COMP.json';
import aToken from '../abis/aave/AToken.json';
import TokenSwap from '../TokenSwap/TokenSwap';
import yDAIv3 from '../abis/iearn/yDAIv3.json';
import LpStaking from '../LpStaking/LpStaking';
import stkIDLE from '../contracts/stkIDLE.json';
import yUSDCv3 from '../abis/iearn/yUSDCv3.json';
import yUSDTv3 from '../abis/iearn/yUSDTv3.json';
import ySUSDv3 from '../abis/iearn/ySUSDv3.json';
import yTUSDv3 from '../abis/iearn/yTUSDv3.json';
import Timelock from '../contracts/Timelock.json';
import CurveZap from '../abis/curve/CurveZap.json';
import CovToken from '../abis/cover/CovToken.json';
import B2BVester from '../contracts/B2BVester.json';
import IdleStaking from '../IdleStaking/IdleStaking';
// import CurveSwap from '../abis/curve/CurveSwap.json';
import CurvePool from '../abis/curve/CurvePool.json';
import NexusMutual from '../NexusMutual/NexusMutual';
import CoverMint from '../abis/cover/CoverMint.json';
import LockedIDLE from '../contracts/LockedIDLE.json';
import LpStakingAbi from '../contracts/LpStaking.json';
import FunctionsUtil from '../utilities/FunctionsUtil';
import TokenWrapper from '../TokenWrapper/TokenWrapper';
import PriceOracle from '../contracts/PriceOracle.json';
import FeeTreasury from '../contracts/FeeTreasury.json';
import IdleTokenV2 from '../contracts/IdleTokenV2.json';
import StrategyPage from '../StrategyPage/StrategyPage';
import BuyModal from '../utilities/components/BuyModal';
import IdleTokenV3 from '../contracts/IdleTokenV3.json';
import BatchDeposit from '../BatchDeposit/BatchDeposit';
import EarlyRewards from '../contracts/EarlyRewards.json';
import CoverProtocol from '../CoverProtocol/CoverProtocol';
import CurveDeposit from '../abis/curve/CurveDeposit.json';
import VesterFactory from '../contracts/VesterFactory.json';
import GovernorAlpha from '../contracts/GovernorAlpha.json';
import EcosystemFund from '../contracts/EcosystemFund.json';
import Comptroller from '../abis/compound/Comptroller.json';
import erc20Forwarder from '../contracts/erc20Forwarder.json';
import BalancerPool from '../abis/balancer/BalancerPool.json';
import IdleController from '../contracts/IdleController.json';
import TokenMigration from '../TokenMigration/TokenMigration';
import BatchMigration from '../BatchMigration/BatchMigration';
import IdleBatchedMint from '../contracts/IdleBatchedMint.json';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import IdleProxyMinter from '../contracts/IdleProxyMinter.json';
import IdleRebalancerV3 from '../contracts/IdleRebalancerV3.json';
import LiquidityGaugeV2 from '../abis/curve/LiquidityGaugeV2.json';
import DeployB2BVesting from '../DeployB2BVesting/DeployB2BVesting';
import SushiV2Router02 from '../abis/sushiswap/SushiV2Router02.json';
import IdleBatchConverter from '../contracts/IdleBatchConverter.json';
import UniswapV2Router02 from '../abis/uniswap/UniswapV2Router02.json';
import IdleDepositForwarder from '../contracts/IdleDepositForwarder.json';
import SushiLiquidityPool from '../abis/sushiswap/SushiLiquidityPool.json';
import StakingFeeDistributor from '../contracts/StakingFeeDistributor.json';
import BalancerExchangeProxy from '../abis/balancer/BalancerExchangeProxy.json';
import IdleConverterPersonalSignV4 from '../contracts/IdleConverterPersonalSignV4.json';
import MinimalInitializableProxyFactory from '../contracts/MinimalInitializableProxyFactory.json';

const env = process.env;

const globalConfigs = {
  appName: 'Idle',
  version: 'v5.9',
  baseToken: 'ETH',
  baseURL: 'https://idle.finance',
  forumURL:'https://gov.idle.finance',
  theme:{
    darkModeEnabled:true
  },
  betaURL: 'https://beta.idle.finance',
  countries:{
    'USA':'United States of America',
    'GBR':'United Kingdom',
    'AUS':'Australia',
    'BRA':'Brazil',
    'CHN':'China',
    'CAN':'Canada',
    'EUR':'Europe',
    'HKG':'Hong Kong',
    'IND':'India',
    'MEX':'Mexico',
    'RUS':'Russia',
    'ZAF':'South Africa',
    'KOR':'South Korea'
  },
  logs:{ // Enable logs levels
    errorsEnabled:false,
    messagesEnabled:false,
  },
  connectors:{ // Connectors props
    metamask:{
      enabled:true,
      subcaption:'Browser extension'
    },
    opera:{
      enabled:true,
      subcaption:'Opera injected wallet'
    },
    dapper:{
      enabled:true,
      icon:'dapper.png',
      subcaption:'Browser extension',
    },
    coinbase:{
      enabled:true,
      icon:'coinbase.png',
      subcaption:'Connect with Coinbase wallet'
    },
    trustwallet:{
      enabled:true,
      subcaption:'Connect with Trust Wallet'
    },
    walletconnect:{
      enabled:true,
      iconModal:'walletconnect.png',
      subcaption:'Connect with QR code'
    },
    walletlink:{
      enabled:true,
      icon:'coinbase.png',
      name:'Coinbase Wallet',
      subcaption:'Connect with QR code'
    },
    gnosis:{
      enabled:true,
      // icon:'coinbase.png',
      name:'Gnosis Safe App',
      subcaption:'Connect with Gnosis Safe App'
    },
    fortmatic:{
      enabled:true,
      subcaption:'Login with phone-number'
    },
    portis:{
      enabled:true,
      subcaption:'Login with e-mail'
    },
    authereum:{
      enabled:true,
      subcaption:'Cross-device wallet'
    },
    torus:{
      enabled:true,
      icon:'torus.png',
      subcaption:'One-Click login for Web 3.0'
    },
    trezor:{
      enabled:true,
      subcaption:'Hardware wallet'
    },
    ledger:{
      enabled:true,
      subcaption:'Hardware wallet'
    },
    custom:{
      enabled:true,
      subcaption:'Custom address'
    }
  },
  newsletterSubscription:{
    endpoint:'https://dev.lapisgroup.it/idle/newsletter.php'
  },
  messages:{
    scoreShort:'Protocol Risk Score',
    apyShort:'Annual Percentage Yield',
    tokenPrice:'The token price is calculated using Uniswap spot prices.',
    cheapRedeem:'Amount of unlent funds available for low gas fees redeem',
    curveBonusSlippage:'Slippage or bonus depending on if the coin is low or high in the Curve Pool',
    distributionSpeed:'The distribution indicates the amount of tokens distributed for the entire pool.',
    directMint:'Pay an additional gas fee to rebalance the pool and help all users gain an additional APR',
    performanceFee:'This fee is charged on positive returns generated by Idle including accrued gov tokens except IDLE',
    userDistributionSpeed:'The distribution indicates the amount of tokens distributed for your account based on your current pool share.',
    govTokenApr:'Governance Token APR is calculated using the spot price from Uniswap and the current distribution speed for the specific pool.',
    govTokenRedeemableBalance:'The redeemable balance is re-calculated on every interaction with the smart-contract so, the shown balance may be lower than the real one.',
    riskScoreShort:'It\'s a single, consistently, comparable value for measuring protocol risk, based on factors including smart contract risk, collateralization and liquidity.',
    redeemSkipGov:'This feature allows you to save some gas by skipping the redeem of all or some of your accrued governance tokens, the skipped governance tokens will be given away to the entire pool',
    batchDepositExecutionSchedule:'Batches are executed twice a week, usually on Sunday and Wednesday, and only when the pool size reaches at least 20,000$. The time of each execution will vary depending on the gas price of the Ethereum network.',
    apyLong:'APY is based on (I) the current yield advertised by the underlying protocol, (II) the current distribution rate of governance tokens provided by underlying lending protocols (III) the current estimated price of governance tokens from Uniswap spot prices. (IV) IDLE token distribution is referred to the entire pool.',
    yieldFarming:'Strategies in Idle now will be able to support and distribute a vast range of yield opportunities across multiple protocols. Users will be able to receive their equivalent share of governance token that the protocol is receiving while allocating liquidity to yield farming opportunities. <a target="_blank" rel="nofollow noopener noreferrer" href="https://idlefinance.medium.com/idle-yield-farming-upgrade-18e4bc483c8f">Read more here</a>.',
    riskScore:`It's a single, consistently, comparable value for measuring protocol risk, based on factors including smart contract risk, collateralization and liquidity.<br /><br />The model outputs a 0-10 score, where <strong>0 is the most risky and 10 is the most safe.</strong> Visit <a target="_blank" rel="nofollow noopener noreferrer" href="https://defiscore.io/overview">https://defiscore.io/overview</a> for further information.`,
    curveInstructions:`<strong>Depositing into the pool:</strong><br />By depositing your funds into the Curve Pool you may incur in slippage or bonus depending on if the coin is low or high in the pool.<br /><br /><strong>Withdrawing share from the pool:</strong><br />When you redeem your tokens previously deposited in the Curve Pool you get back an uneven amounts of tokens, that can give slippage or bonus depending on if the coin is low or high in the pool.`
  },
  analytics:{
    google:{
      events:{
        enabled:true, // Enable Google Analytics events
        debugEnabled:false, // Enable sending for test environments
        addPostfixForTestnet:true // Append testnet to eventCategory
      },
      pageView:{
        enabled:true
      }
    }
  },
  modals:{ // Enable modals
    first_deposit_referral:false, // Referral share modal
    first_deposit_share:true, // First deposit share modal
    migrate:{
      enabled:true
    },
    welcome:{ // Welcome modal
      enabled:true,
      frequency:604800 // One week
    }
  },
  dashboard:{
    baseRoute:'/dashboard',
    theme:{
      mode:'light',
      darkModeEnabled:true
    },
  },
  governance:{
    test:false,
    enabled:true,
    startBlock:11333729,
    baseRoute:'/governance',
    props:{
      tokenName:'IDLE',
      availableContracts:{
        IDLE,
        FeeTreasury,
        PriceOracle,
        GovernorAlpha,
        EcosystemFund,
        IdleController
      }
    },
    proposals:{
      7:{
        description:`Upgrade of IdleTokenGovernance contract to include the following changes:<br />
        <ul>
          <li>support for EIP 3165 flashLoans (fee is set to 0.08% of the flash loaned amount redistributed to LP)</li>
          <li>support for stkAAVE distribution</li>
          <li>support for new cWBCT distribution</li>
          <li>other minor updates for gas and redeems</li>
        </ul>
        See more in the gov forum post: <a class="link" href="https://gov.idle.finance/t/iip-7-idletoken-upgrade-stkaave-distribution/466">https://gov.idle.finance/t/iip-7-idletoken-upgrade-stkaave-distribution/466</a>`
      }
    },
    contracts:{
      delegates:'IDLE',
      governance:'GovernorAlpha',
    }
  },
  curve:{
    enabled:false,
    params:{
      n_coins:3,
      label:'Curve',
      route:'/dashboard/curve',
      image:'images/protocols/curve.svg',
      imageInactive:'images/protocols/curve-off.svg',
    },
    rates:{
      path:['apy','day','idle'],
      endpoint:'https://www.curve.fi/raw-stats/apys.json'
    },
    poolContract:{
      decimals:18,
      abi:CurvePool,
      name:'idleDAI+idleUSDC+idleUSDT',
      token:'idleDAI+idleUSDC+idleUSDT',
      address:'0x09f4b84a87fc81fc84220fd7287b613b8a9d4c05'
    },
    depositContract:{
      abi:CurveDeposit,
      name:'idleCurveDeposit',
      address:'0x83f252f036761a1e3d10daca8e16d7b21e3744d7'
    },
    gaugeContract:{
      abi:LiquidityGaugeV2,
      name:'LiquidityGaugeV2',
      address:'0xd69ac8d9D25e99446171B5D0B3E4234dAd294890'
    },
    zapContract:{
      abi:CurveZap,
      name:'idleCurveZap',
      address:'0x456974df1042ba7a46fd49512a8778ac3b840a21'
    },
    migrationContract:{
      abi:CurveDeposit,
      name:'idleCurveDeposit',
      address:'0x83f252f036761a1e3d10daca8e16d7b21e3744d7',
      functions:[
        {
          label:'Deposit',
          name:'add_liquidity'
        },
      ]
    },
    availableTokens:{
      idleDAIYield:{
        decimals:18,
        enabled:true,
        baseToken:'DAI',
        token:'idleDAIYield',
        address:'0x3fe7940616e5bc47b0775a0dccf6237893353bb4',
        migrationParams:{
          n_coins:3,
          coinIndex:0
        },
      },
      idleUSDCYield:{
        decimals:18,
        enabled:true,
        baseToken:'USDC',
        token:'idleUSDCYield',
        address:'0x5274891bEC421B39D23760c04A6755eCB444797C',
        migrationParams:{
          n_coins:3,
          coinIndex:1
        },
      },
      idleUSDTYield:{
        decimals:18,
        enabled:true,
        baseToken:'USDT',
        token:'idleUSDTYield',
        address:'0xF34842d05A1c888Ca02769A633DF37177415C2f8',
        migrationParams:{
          n_coins:3,
          coinIndex:2
        },
      },
    }
  },
  permit:{
    DAI:{
      version:1,
      EIPVersion:null,
      nonceMethod:'nonces',
      name:'Dai Stablecoin',
      type:[
        { name: "holder", type: "address" },
        { name: "spender", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "expiry", type: "uint256" },
        { name: "allowed", type: "bool" },
      ]
    },
    USDC:{
      version:2,
      name:'USD Coin',
      EIPVersion:2612,
      nonceMethod:'nonces',
      type:[
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ]
    },
    SLP:{
      version:1,
      EIPVersion:2612,
      nonceMethod:'nonces',
      name:'SushiSwap LP Token',
      type:[
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ]
    }
  },
  govTokens:{
    IDLE:{
      abi:IDLE,
      decimals:18,
      token:'IDLE',
      enabled:true,
      showAUM:false, // Include IDLE balance in AUM
      showAPR:false, // Include IDLE Apr
      protocol:'idle',
      showPrice:false, // Show price in Yield Farming section
      showBalance:false, // Include IDLE balance in Portfolio Donut
      aprTooltipMode:false,
      distributionMode:'block',
      distributionFrequency:'day', // Multiply distribution per block
      color:'hsl(162, 100%, 41%)',
      icon:'images/tokens/IDLE.png',
      disabledTokens:['idleRAIYield'], // Disable IDLE distribution for idleToken
      address:'0x875773784Af8135eA0ef43b5a374AaD105c5D39e' // MAIN
      // address:'0xAB6Bdb5CCF38ECDa7A92d04E86f7c53Eb72833dF', // KOVAN
      // address:'0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f' // Fork
    },
    COMP:{
      abi:COMP,
      decimals:18,
      token:'COMP',
      enabled:true,
      showAUM:true, // Include IDLE balance in AUM
      showAPR:true, // Include COMP Apr
      showPrice:true,
      showBalance:true, // Include COMP balance in Portfolio Donut
      disabledTokens:[],
      protocol:'compound',
      aprTooltipMode:false,
      distributionMode:'block',
      distributionFrequency:'day',
      color:'hsl(162, 100%, 41%)',
      address:'0xc00e94cb662c3520282e6f5717214004a7f26888', // MAIN
      // address:'0x61460874a7196d6a22d1ee4922473664b3e95270' // KOVAN
    },
    stkAAVE:{
      abi:aToken,
      decimals:18,
      showAUM:true, // Include stkAAVE balance in AUM
      showAPR:true, // Include stkAAVE Apr
      enabled:true,
      showPrice:true,
      token:'stkAAVE',
      showBalance:true, // Include stkAAVE balance in Portfolio Donut
      protocol:'aavev2',
      aprTooltipMode:false,
      distributionMode:'second',
      color:'hsl(314, 41%, 51%)',
      distributionFrequency:'day',
      address:'0x4da27a545c0c5b758a6ba100e3a049001de870f5', // MAIN
      addressForPrice:'0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // MAIN
      disabledTokens:['idleTUSDYield','idleSUSDYield','idleRAIYield']
    }
  },
  contracts:{
    ProxyFactory:{
      abi:MinimalInitializableProxyFactory,
      address:'0x91baced76e3e327ba7850ef82a7a8251f6e43fb8'
    },
    LockedIDLE:{
      abi:LockedIDLE,
      address:'0xF241a0151841AE2E6ea750D50C5794b5EDC31D99'
    },
    FeeTreasury:{
      abi:FeeTreasury,
      address:'0x69a62c24f16d4914a48919613e8ee330641bcb94' // MAIN
    },
    PriceOracle:{
      abi:PriceOracle,
      address:'0x972A64d108e250dF98dbeac8170678501f5EF181' // MAIN
      // address:'0xCab5760688db837Bb453FE1DFBC5eDeE6fa8F0FF' // KOVAN
    },
    Timelock:{
      abi:Timelock,
      address:'0xD6dABBc2b275114a2366555d6C481EF08FDC2556' // MAIN
      // address:'0xfD88D7E737a06Aa9c62B950C1cB5eE63DA379AFd' // KOVAN
    },
    EcosystemFund:{
      abi:EcosystemFund,
      address:'0xb0aA1f98523Ec15932dd5fAAC5d86e57115571C7' // MAIN
      // address:'0x125d3D6A8e546BD13802c309429CBB4db5737d57' // KOVAN
    },
    VesterFactory:{
      abi:VesterFactory,
      address:'0xbF875f2C6e4Cc1688dfe4ECf79583193B6089972' // MAIN
      // address:'0x9b52f91578c8AfA8e2DF07d4D7726bB6b73Ec1FE' // KOVAN
    },
    IdleController:{
      abi:IdleController,
      address:'0x275DA8e61ea8E02d51EDd8d0DC5c0E62b4CDB0BE' // MAIN
      // address:'0x8Ad5F0644b17208c81bA5BDBe689c9bcc7143d87' // KOVAN
    },
    EarlyRewards:{
        abi:EarlyRewards,
        address:'0xa1F71ED24ABA6c8Da8ca8C046bBc9804625d88Fc' // MAIN
        // address:'0x07A94A60B54c6b2Da19e23D6E9123180Bf92ED40' // KOVAN
    },
    GovernorAlpha:{
      abi:GovernorAlpha,
      address:'0x2256b25CFC8E35c3135664FD03E77595042fe31B' // MAIN
      // address:'0x782cB1dbd0bD4df95c2497819be3984EeA5c2c25' // KOVAN
    },
    Comptroller:{
      abi:Comptroller,
      address:'0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b', // Main
      // address:'0x5eae89dc1c671724a672ff0630122ee834098657' // Kovan
    },
    SushiswapRouter:{
      abi:SushiV2Router02,
      address:'0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F'
    },
    UniswapRouter:{
      abi:UniswapV2Router02,
      address:'0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
    },
    BalancerExchangeProxy:{
      abi:BalancerExchangeProxy,
      address:'0x3E66B66Fd1d0b02fDa6C811Da9E0547970DB2f21'
    }
  },
  tokens:{
    DAI:{
      zeroExInstant:{
        orderSource: 'https://api.0x.org/sra/',
        assetData:'0xf47261b00000000000000000000000006b175474e89094c44da98b954eedeac495271d0f',
        affiliateInfo: {
            feeRecipient: '0x4215606a720477178AdFCd5A59775C63138711e8',
            feePercentage: 0.0025
        },
      },
    },
    USDC:{
      zeroExInstant:{
        orderSource: 'https://api.0x.org/sra/',
        assetData:'0xf47261b0000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        affiliateInfo: {
            feeRecipient: '0x4215606a720477178AdFCd5A59775C63138711e8',
            feePercentage: 0.0025
        },
      },
    },
  },
  strategies:{
    best:{
      token:'DAI',
      color:'#f32121',
      comingSoon:false,
      addGovTokens:true,
      titlePostfix:null,
      title:'Best-Yield',
      iconName:'Whatshot',
      govTokensEnabled:true,
      component: StrategyPage,
      chartColor:'hsl(40,95%,59%)',
      icon:'images/strategies/best-on.svg',
      iconInactive:'images/strategies/best-off.svg',
      iconInactiveDark:'images/strategies/best-white.svg',
      desc:'Maximize your returns across DeFi protocols',
      descLong:'The Best-Yield allocation strategy allows to maximize the interest rate returns by detecting the interest rate changes on different lending protocols. Idle’s monitoring system automatically triggers a rebalance if it spots a better-performing allocation: this includes taking account of the total liquidity within the pool, incorporating underlying protocol rate functions and levels of supply and demand. As a user, you will end up with an higher return without constantly checking rates and burning gas on every transfer. Unlock your funds from a single protocol performance with this strategy.',
      descShort:'The Best-Yield allocation strategy allows to maximize the interest rate returns by detecting the interest rate changes on different lending protocols.'
    },
    risk:{
      token:'DAI',
      color:'#2196F3',
      comingSoon:false,
      titlePostfix:null,
      addGovTokens:true,
      iconName:'Security',
      title:'Risk-Adjusted',
      govTokensEnabled:true,
      component: StrategyPage,
      chartColor:'hsl(211,67%,47%)',
      icon:'images/strategies/risk-on.svg',
      iconInactive:'images/strategies/risk-off.svg',
      iconInactiveDark:'images/strategies/risk-white.svg',
      desc:'Optimize your risk exposure across DeFi protocols',
      descLong:'The Risk-Adjusted allocation strategy provides a way to earn the best rate at the lowest risk-level. The risk-management algorithm takes account of the total assets within a pool, incorporates underlying protocol rate functions and levels of supply and demand, skimming protocols with a bad score/rate mix, and finally determining an allocation that achieves the highest risk-return score possible after the rebalance happens.',
      descShort:'The Risk-Adjusted allocation strategy provides a way to earn the best rate at the lowest risk-level.'
    },
    new:{
      token:'DAI',
      color:'#2196F3',
      comingSoon:true,
      addGovTokens:true,
      iconName:'Adjust',
      title:'Coming Soon',
      chartColor:'hsl(211,67%,47%)',
      icon:'images/strategies/solr-on.svg',
      desc:'More strategies are coming soon!',
      iconInactive:'images/strategies/solr-off.svg',
      descLong:'The Risk-Adjusted allocation strategy provides a way to earn the best rate at the lowest risk-level. The risk-management algorithm takes account of the total assets within a pool, incorporates underlying protocol rate functions and levels of supply and demand, skimming protocols with a bad score/rate mix, and finally determining an allocation that achieves the highest risk-return score possible after the rebalance happens.',
      descShort:'The Risk-Adjusted allocation strategy provides a way to earn the best rate at the lowest risk-level.'
    }
  },
  stats:{
    enabled:true, // Enable endpoint
    rates:{
      TTL:300, // 5 minutes
      endpoint:'https://api.idle.finance/rates/'
    },
    tvls:{
      TTL:120,
      endpoint:'https://api.idle.finance/tvls/'
    },
    substack:{
      TTL:1800,
      endpoint:'https://api.idle.finance/substack/'
    },
    scores:{
      TTL:300, // 5 minutes
      endpoint:'https://api.idle.finance/scores/'
    },
    config:{
      headers: env.REACT_APP_IDLE_KEY ? { Authorization: `Bearer ${env.REACT_APP_IDLE_KEY}` } : {}
    },
    versions:{
      /*
      v2:{
        label:'Idle V2',
        startTimestamp:null,
        additionalProtocols:[],
        endTimestamp:1589752999,
        enabledStrategies:['best'],
        showPerformanceTooltip:false,
        enabledTokens:['DAI','USDC'],
      },
      */
      v3:{
        label:'Idle V3',
        additionalProtocols:[],
        endTimestamp:1597237542,
        startTimestamp:1589801874,
        showPerformanceTooltip:false,
        strategiesParams:{
          risk:{
            endTimestamp:1597233922,
          }
        },
        enabledStrategies:['best','risk'],
        enabledTokens:['DAI','USDC','USDT','TUSD','SUSD','WBTC'],
      },
      v4:{
        label:'Idle V4',
        endTimestamp:null,
        startTimestamp:1597442400, // 1598220000
        enabledStrategies:['best','risk'],
        showPerformanceTooltip:true,
        strategiesParams:{
          risk:{
            startTimestamp:1599183170,
          }
        },
        enabledTokens:['DAI','USDC','USDT','TUSD','SUSD','WBTC','WETH','RAI'],
        additionalProtocols:[
          {
            decimals:16,
            protocol:'compound',
            name:'compoundWithCOMP',
            enabledTokens:['DAI','USDC','USDT','TUSD','SUSD','WBTC','WETH'],
          },
          {
            decimals:18,
            protocol:'aavev2',
            name:'aavev2WithStkAAVE',
            enabledTokens:['DAI','USDC','USDT','TUSD','SUSD','WBTC','WETH'],
          }
        ]
      }
    },
    tokens:{
      DAI:{
        decimals:18,
        enabled:true,
        color:{
          rgb:[250,184,51],
          hex:'#F7B24A',
          hsl:['40', '95%', '59%']
        },
        chart:{
          labelTextColorModifiers:['darker', 2]
        },
        startTimestamp:'2020-02-11',
        address:'0x6b175474e89094c44da98b954eedeac495271d0f',
        performanceTooltip:'APR is calculated proportionally to historical allocations of each lending protocol in the selected time period. This pool has 1% unlent reserve to help reduce gas costs.',
      },
      USD:{
        enabled:true,
        color:{
          hex:'#85bb65',
          rgb:[133, 187, 101],
          hsl:['98', '39%', '56%']
        },
        chart:{
          labelTextColorModifiers:['brighter', 2]
        },
        address:null,
        startTimestamp:'2020-02-04',
      },
      USDC:{
        decimals:6,
        enabled:true,
        color:{
          hex:'#2875C8',
          rgb:[40,117,200],
          hsl:['211', '67%', '47%']
        },
        chart:{
          labelTextColorModifiers:['brighter', 2]
        },
        startTimestamp:'2020-02-04',
        address:'0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        performanceTooltip:'APR is calculated proportionally to historical allocations of each lending protocol in the selected time period. This pool has 1% unlent reserve to help reduce gas costs.',
      },
      USDT:{
        decimals:6,
        enabled:true,
        color:{
          hex:'#22a079',
          rgb:[34, 160, 121],
          hsl:['161', '65%', '38%']
        },
        chart:{
          labelTextColorModifiers:['darker', 4]
        },
        startTimestamp:'2020-02-04',
        address:'0xdac17f958d2ee523a2206206994597c13d831ec7',
        performanceTooltip:'APR is calculated proportionally to historical allocations of each lending protocol in the selected time period. This pool has 1% unlent reserve to help reduce gas costs.',
      },
      TUSD:{
        decimals:18,
        enabled:true,
        color:{
          hex:'0340a1',
          rgb:[3, 64, 161],
          hsl:['217', '96%', '32%']
        },
        chart:{
          labelTextColorModifiers:['brighter', 5]
        },
        startTimestamp:'2020-06-22',
        address:'0x0000000000085d4780b73119b644ae5ecd22b376',
      },
      SUSD:{
        decimals:18,
        enabled:true,
        color:{
          hex:'#1e1a31',
          rgb:[30, 26, 49],
          hsl:['250', '31%', '15%']
        },
        chart:{
          labelTextColorModifiers:['brighter', 5]
        },
        startTimestamp:'2020-06-22',
        address:'0x57ab1ec28d129707052df4df418d58a2d46d5f51',
      },
      WBTC:{
        decimals:8,
        enabled:true,
        color:{
          hex:'#eb9444',
          rgb:[235, 148, 68],
          hsl:['29', '81%', '59%']
        },
        startTimestamp:'2020-06-15',
        conversionRateField:'wbtcDAIPrice',
        chart:{
          labelTextColorModifiers:['darker', 4],
        },
        address:'0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        performanceTooltip:'APR is calculated proportionally to historical allocations of each lending protocol in the selected time period. This pool has 1% unlent reserve to help reduce gas costs.',
      },
      WETH:{
        decimals:18,
        enabled:true,
        color:{
          hex:'#ee1f79',
          rgb:[238, 31, 121],
          hsl:['334', '86%', '53%']
        },
        startTimestamp:'2021-02-16',
        conversionRateField:'wethDAIPrice',
        chart:{
          labelTextColorModifiers:['darker', 4],
        },
        address:'0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        performanceTooltip:'APR is calculated proportionally to historical allocations of each lending protocol in the selected time period. This pool has 1% unlent reserve to help reduce gas costs.',
      },
      COMP:{
        decimals:18,
        enabled:true,
        color:{
          hex:'#00d395',
          rgb:[0, 211, 149],
          hsl:['162', '100%', '41%']
        },
        startTimestamp:'2020-06-15',
        conversionRateField:'compDAIPrice',
        chart:{
          labelTextColorModifiers:['darker', 4]
        },
        address:'0xc00e94cb662c3520282e6f5717214004a7f26888',
      },
      stkAAVE:{
        decimals:18,
        enabled:true,
        color:{
          hex:'#B6509E',
          rgb:[182, 80, 158],
          hsl:['314', '41%', '51%']
        },
        startTimestamp:'2021-04-30',
        conversionRateField:'compDAIPrice',
        chart:{
          labelTextColorModifiers:['darker', 4]
        },
        address:'0x4da27a545c0c5b758a6ba100e3a049001de870f5',
      },
      IDLE:{
        decimals:18,
        enabled:true,
        color:{
          hex:'#0d55bb',
          rgb:[13, 85, 187],
          hsl:['215', '87%', '39%']
        },
        startTimestamp:'2020-11-10',
        icon:'images/tokens/IDLE.png',
        conversionRateField:'idleDAIPrice',
        chart:{
          labelTextColorModifiers:['darker', 4]
        },
        address:'0x875773784Af8135eA0ef43b5a374AaD105c5D39e',
      },
      RAI:{
        decimals:18,
        enabled:true,
        color:{
          hex:'#378879',
          rgb:[55, 136, 121],
          hsl:['169', '42%', '37%']
        },
        startTimestamp:'2021-05-25',
        icon:'images/tokens/RAI.png',
        conversionRateField:'raiDAIPrice',
        chart:{
          labelTextColorModifiers:['darker', 4]
        },
        address:'0x03ab458634910aad20ef5f1c8ee96f1d6ac54919',
      },
      'idleDAI+idleUSDC+idleUSDT':{
        decimals:18,
        enabled:false,
        name:'Curve.fi',
        color:{
          hex:'#ff0000',
          rgb:[255, 0, 0],
          hsl:['0', '100%', '50%']
        },
        startTimestamp:'2020-06-15',
      },
    },
    protocols:{
      compound:{
        legend:true,
        enabled:true,
        label:'Compound',
        color:{
          rgb:[0, 209, 146],
          hsl:['162', '100%', '41%']
        }
      },
      aavev2WithStkAAVE:{
        enabled:true,
        label:'Aave V2 + stkAAVE',
        startTimestamp:'2021-05-08 14:30:00',
        // tokensProps:{
        //   WETH:{
        //     startTimestamp:'2021-05-19 12:20:00',
        //   }
        // },
        color:{
          hex:'#B6509E',
          rgb:[182, 80, 158],
          hsl:['314', '41%', '51%']
        },
        rateField:['rate','aaveAdditionalAPR']
      },
      compoundWithCOMP:{
        enabled:true,
        label:'Compound + COMP',
        color:{
          rgb:[0, 153, 107],
          hsl:['162', '100%', '30%']
        },
        rateField:['rate','compoundAdditionalAPR']
      },
      fulcrum:{
        legend:false,
        enabled:false,
        label:'Fulcrum',
        color:{
          rgb:[2, 138, 192],
          hsl:['197', '98%', '38%']
        }
      },
      dsr:{
        label:'DSR',
        enabled:false,
        icon:'CHAI.png',
        color:{
          rgb:[222, 52, 67],
          hsl:['355', '72%', '54%']
        }
      },
      dydx:{
        legend:true,
        label:'DyDx',
        enabled:true,
        color:{
          rgb:[87, 87, 90],
          hsl:['240', '2%', '35%']
        }
      },
      iearn:{
        label:'Yearn',
        enabled:true,
      },
      aave:{
        label:'Aave V1',
        legend:true,
        enabled:true,
        color:{
          rgb:[230, 131, 206],
          hsl:['315', '66%', '71%']
        }
      },
      aavev2:{
        legend:true,
        enabled:true,
        icon:'aave.svg',
        label:'Aave V2',
        color:{
          rgb:[151, 79, 141],
          hsl:['308', '31%', '45%']
        }
      },
      cream:{
        legend:true,
        enabled:true,
        label:'Cream',
        icon:'cream.svg',
        color:{
          rgb:[105, 226, 220],
          hsl:['177', '68%', '65%']
        }
      },
      fuse:{
        legend:true,
        enabled:true,
        label:'Fuse',
        icon:'fuse.png',
        color:{
          rgb:[0, 0, 0],
          hsl:['0', '0%', '0%']
        }
      },
      curve:{
        label:'',
        enabled:true,
        color:{
          rgb:[0, 55, 255],
          hsl:['227', '100%', '50%']
        }
      },
      idle:{
        label:'Idle',
        enabled:true,
        color:{
          rgb:[0, 55, 255],
          hsl:['227', '100%', '50%']
        }
      }
    }
  },
  contract:{
    methods:{
      redeem:{
        skipRebalance:true,
        metaTransactionsEnabled:false
      },
      deposit:{
        skipMint:true,
        minAmountForMint:100000,
        erc20ForwarderEnabled:true,
        skipMintCheckboxEnabled:true,
        metaTransactionsEnabled:false,
        // Proxy contract for Meta Tx or ERC20 Forwarder
        erc20ForwarderProxyContract:{
          forwarder:{
            enabled:true,
            abi:erc20Forwarder,
            name:'erc20Forwarder',
            function:'emitMessage',
            address:'0x84a0856b038eaAd1cC7E297cF34A7e72685A8693', // Main
            // address:'0xCB3F801C91DEcaaE9b08b1eDb915F9677D8fdB4A' // Kovan
          },
          tokens:{
            DAI:{
              enabled:true,
              permitType:'DAI_Permit',
              abi:IdleDepositForwarder,
              function:'permitAndDeposit', // foo
              name:'IdleDepositForwarderDAI',
              address:'0xDe3c769cCD1878372864375e9f89956806B86daA', // Main
              // address:'0x1E32F1E96B9735E5D31a23e12fe8e6D9845a9072', // Kovan
            },
            USDC:{
              enabled:true,
              permitType:'USDC_Permit',
              abi:IdleDepositForwarder,
              name:'IdleDepositForwarderUSDC',
              function:'permitEIP2612AndDeposit',
              address:'0x43bD6a78b37b50E3f52CAcec53F1202dbDe6a761', // Main
              // address:'0x8f9048CFAa27b1A1b77c32a0b87D2DcF5D016cb5', // Kovan
            },
          }
        },
        proxyContract:{
          enabled:false,
          abi:IdleProxyMinter,
          name:'IdleProxyMinter',
          function:'mintIdleTokensProxy',
          address:'0x7C4414aA6B0c6CB1Bc7e5BFb7433138426AC637a',
        }
      },
      migrate:{
        skipRebalance:true,
        minAmountForRebalance:10000,
        minAmountForRebalanceMetaTx:10000
      },
      redeemGovTokens:{
        enabled:true
      },
      redeemSkipGov:{
        enabled:true,
        disabledTokens:['idleDAISafe','idleUSDCSafe','idleUSDTSafe']
      },
      rebalance:{
        enabled:true,
        abi:IdleRebalancerV3
      }
    }
  },
  network:{ // Network configurations
    availableNetworks:{
      1:'Mainnet',
      3:'Ropsten',
      4:'Rinkeby',
      42:'Kovan',
      1337:'Hardhat'
    },
    isForked:false, // If TRUE the tx confirmation callback is fired on the receipt
    requiredNetwork:1, // { 1: Mainnet, 3: Ropsten, 42: Kovan }
    blocksPerYear:2371428,
    secondsPerYear:31536000,
    firstBlockNumber:8119247,
    requiredConfirmations: 1,
    enabledNetworks:[1,42,1337],
    accountBalanceMinimum: 0, // in ETH for gas fees
    providers:{
      infura:{
        42: 'https://kovan.infura.io/v3/',
        1: 'https://mainnet.infura.io/v3/',
        1337: 'https://mainnet.infura.io/v3/'
      },
      ens:{
        enabled:true,
        supportedNetworks:[1]
      },
      etherscan:{
        enabled:true, // False for empty txs list (try new wallet)
        endpoints:{
          1: 'https://api.etherscan.io/api',
          1337: 'https://api.etherscan.io/api',
          42: 'https://api-kovan.etherscan.io/api'
        },
        baseUrl:{
          1: 'https://etherscan.io',
          1337: 'https://etherscan.io',
          42: 'https://kovan.etherscan.io',
        }
      },
      snapshot:{
        whitelist:[
          '0x9993ADB62085AcB05Fc493f7A1D10C11227A78fa',
          '0xf12ce5807e3d3128B876aa1Cec0632D63547E22E'
        ],
        endpoints:{
          proposals:'https://hub.snapshot.page/api/idlefinance.eth/proposals'
        },
        urls:{
          proposals:'https://signal.idle.finance/#/idlefinance.eth/proposal/'
        }
      },
      biconomy:{
        enabled:false,
        enableLogin:false,
        supportedNetworks:[1,42],
        disabledWallets:['authereum'],
        endpoints:{
          limits:'https://api.biconomy.io/api/v1/dapp/checkLimits'
        },
        params:{
          debug: false,
          apiKey: env.REACT_APP_BICONOMY_KEY, // Mainnet
          dappId: env.REACT_APP_BICONOMY_APPID,
          apiId: '36572ec9-ae5c-4c4a-9530-f3ae7c7ac829',
          // apiKey: env.REACT_APP_BICONOMY_KEY_KOVAN, // Kovan
        }
      },
      simpleID:{
        enabled:false,
        supportedNetworks:[1],
        getNetwork:(networkId,availableNetworks) => {
          let networkName = null;
          switch (networkId){
            case 1:
              networkName = 'mainnet';
            break;
            default:
              networkName = availableNetworks[networkId] ? availableNetworks[networkId].toLowerCase() : 'mainnet';
            break;
          }
          return networkName;
        },
        params:{
          appOrigin: window.location.origin,
          appName: "Idle",
          appId: "eb4d1754-a76e-4c58-8422-54b5ca2395e7",
          renderNotifications: false,
          network: 'mainnet'
        }
      }
    }
  },
  notifications:[
    {
      enabled:false,
      end:1612282726374,
      start:1611677841027,
      date:'Jan 26, 2021 16:18 UTC',
      title:'Cover Protocol Available',
      hash:'/dashboard/tools/cover-protocol',
      image:'/images/protocols/cover-logo.svg',
      text:'Protect your portfolio with Cover Protocol',
    }
  ],
  tools:{
    stake:{
      enabled:true,
      icon:'Layers',
      label:'Staking',
      route:'staking',
      subComponent:Staking,
      desc:'Stake your IDLE / Sushi Swap LP tokens and earn $IDLE rewards',
      props:{
        availableTokens:{
          IDLE:{
            component:IdleStaking,
            contract:{
              abi:stkIDLE,
              decimals:18,
              name:'stkIDLE',
              fromBlock:12561464,
              rewardToken:'IDLE',
              address:'0xaac13a116ea7016689993193fce4badc8038136f' // Mainnet
            },
            feeDistributor:{
              fromBlock:12649361,
              abi:StakingFeeDistributor,
              name:'StakingFeeDistributor',
              address:'0xbabb82456c013fd7e3f25857e0729de8207f80e2' // Mainnet
            },
            abi:IDLE,
            name:'IDLE',
            token:'IDLE',
            decimals:18,
            enabled:true,
            label:'IDLE Token',
            icon:'images/tokens/IDLE.png',
            address:'0x875773784Af8135eA0ef43b5a374AaD105c5D39e', // Mainnet
            poolLink:'https://etherscan.com/address/0x875773784Af8135eA0ef43b5a374AaD105c5D39e',
          },
          SLP:{
            component:LpStaking,
            contract:{
              decimals:24,
              name:'LpStaking',
              maxMultiplier:3,
              abi:LpStakingAbi,
              maxBonusDays:120,
              rewardToken:'IDLE',
              address:'0xcc0b9f7ed0e6bc7c2e69dbd247e8420f29aeb48d' // Mainnet
            },
            name:'SLP',
            token:'SLP',
            decimals:18,
            enabled:true,
            abi:SushiLiquidityPool,
            label:'SushiSwap IDLE/ETH LP Token',
            icon:'images/protocols/sushiswap.png',
            address:'0xa7f11e026a0af768d285360a855f2bded3047530', // Mainnet
            poolLink:'https://analytics.sushi.com/pairs/0xa7f11e026a0af768d285360a855f2bded3047530',
          }
        }
      }
    },
    b2bVesting:{
      enabled:true,
      visible:true,
      icon:'CloudUpload',
      label:'B2B Vesting',
      route:'b2b-vesting-contract',
      subComponent:DeployB2BVesting,
      desc:'Deploy/Deposit/Claim for B2B Vesting Contracts<br /><small style="color:#ff9900">(only for partners that joined the B2B Affiliate program)</small>',
      props:{
        contracts:{
          vesterImplementation:{
            abi:B2BVester,
            address:'0x3024656ae91d7bf724f613c314bc56030ba2344c'
          }
        }
      }
    },
    ethWrapper:{
      enabled:true,
      label:'ETH Wrapper',
      route:'eth-wrapper',
      subComponent:TokenWrapper,
      image:'images/tokens/WETH.svg',
      desc:'Wrap your ETH and get WETH. Unwrap your WETH and get back ETH.',
      props:{
        startContract:{
          name:'ETH',
          token:'ETH',
          decimals:18,
          wrapMethod:'deposit',
        },
        destContract:{
          abi:WETH,
          name:'WETH',
          decimals:18,
          token:'WETH',
          unwrapMethod:'withdraw',
          address:'0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
        },
      }
    },
    coverProtocol:{
      enabled:false,
      label:'Cover Protocol',
      route:'cover-protocol',
      subComponent:CoverProtocol,
      image:'images/protocols/cover-logo.svg',
      desc:'Get your Idle Portfolio covered against Smart Contract risk',
      fileClaimUrl:'https://app.coverprotocol.com/app/claims/new?protocol=IDLE',
      props:{
        contract:{
          decimals:18,
          abi:CoverMint,
          name:'CoverMint',
          address:'0x46f2f34742c1d9b9b220aabf0ff26bf59ec9f8a0'
        },
        coverages:[
          {
            collateral:'DAI',
            expirationTimestamp:1614470400,
            tokens:{
              Claim:{
                abi:CovToken,
                name:'COVER_IDLE_2021_02_28_DAI_0_CLAIM',
                address:'0xa7dac6774e5e40f56a0bf06af6cf9b1f3d037bcc',
                balancerPool:{
                  decimals:18,
                  abi:BalancerPool,
                  name:'BAL_COVER_IDLE_2021_02_28_DAI_0_CLAIM',
                  address:'0xeb2b9959c7943eb3c0bdb69ede25247bab4d1c6c',
                }
              },
              NoClaim:{
                abi:CovToken,
                name:'COVER_IDLE_2021_02_28_DAI_0_NOCLAIM',
                address:'0x53df0bfa014b7522299c129c5a7b318f02adb469',
                balancerPool:{
                  decimals:18,
                  abi:BalancerPool,
                  name:'BAL_COVER_IDLE_2021_02_28_DAI_0_NOCLAIM',
                  address:'0xce0e9e7a1163badb7ee79cfe96b5148e178cab73',
                }
              }
            }
          },
        ],
      }
    },
    batchDeposit:{
      enabled:true,
      icon:'Storage',
      claimEnabled:true,
      depositEnabled:true,
      route:'batch-deposit',
      label:'Batch Deposit',
      subComponent:BatchDeposit,
      desc:'Deposit your tokens in the batch and wait until its execution to claim your Idle Tokens V4',
      props:{
        availableTokens:{
          idleDAIYield:{
            decimals:18,
            strategy:'best',
            baseToken:'DAI',
            minPoolSize:20000,
            migrationContract:{
              abi:IdleBatchedMint,
              name:'IdleBatchedMintDAI',
              address:'0x633fb4d38B24dC890b11Db2AE2B248D13F996A79', // Main
              // address:'0x1B7bA0361A15CCF62521cF7d2Cbb2Ba90b1521a7', // Kovan
              functions:[
                {
                  name:'deposit',
                  usePermit:true,
                  label:'Deposit',
                  permitName:'permitAndDeposit'
                },
              ]
            },
          },
          idleUSDCYield:{
            decimals:6,
            strategy:'best',
            baseToken:'USDC',
            minPoolSize:20000,
            migrationContract:{
              abi:IdleBatchedMint,
              name:'IdleBatchedMintUSDC',
              address:'0x562C4fd96F0652F5Fcfa96b0a33088B5a6eAeE9B', // Main
              // address:'0x3F35eB839f91b614195a47A593dB46b14cd7EaF8', // Kovan
              functions:[
                {
                  name:'deposit',
                  label:'Deposit',
                  usePermit:true,
                  permitName:'permitEIP2612AndDepositUnlimited'
                },
              ]
            },
          },
          /*
          idleUSDTYield:{
            decimals:18,
            abi:IdleTokenV3,
            strategy:'best',
            baseToken:'USDT',
            migrationContract:{
              abi:IdleBatchedMint,
              name:'IdleBatchedMintUSDT',
              address:'0xee5c50c7c49dec47dde2f9b0233b9e14a8f00cf2',
              functions:[
                {
                  label:'Deposit',
                  name:'deposit'
                },
              ]
            },
          },
          idleSUSDYield:{
            decimals:18,
            abi:IdleTokenV3,
            strategy:'best',
            baseToken:'SUSD',
            migrationContract:{
              abi:IdleBatchedMint,
              name:'IdleBatchedMintSUSD',
              address:'0xE2eE519399a49f1A2004a25DA61e82867A69b9b1',
              functions:[
                {
                  label:'Deposit',
                  name:'deposit'
                },
              ]
            },
          },
          idleTUSDYield:{
            decimals:18,
            abi:IdleTokenV3,
            strategy:'best',
            baseToken:'TUSD',
            migrationContract:{
              abi:IdleBatchedMint,
              name:'IdleBatchedMintTUSD',
              address:'0x174a273f0ea28e55b6dd13259aa43d262b863a86',
              functions:[
                {
                  usePermit:true,
                  label:'Deposit',
                  name:'deposit'
                },
              ]
            },
          },
          idleWBTCYield:{
            decimals:18,
            abi:IdleTokenV3,
            strategy:'best',
            baseToken:'WBTC',
            migrationContract:{
              abi:IdleBatchedMint,
              name:'IdleBatchedMintWBTC',
              address:'0xbfDC7d97559173B52EF2A2f1bC9BeCf97B0D401D',
              functions:[
                {
                  label:'Deposit',
                  name:'deposit'
                },
              ]
            },
          },
          idleDAISafe:{
            decimals:18,
            abi:IdleTokenV3,
            strategy:'risk',
            baseToken:'DAI',
            migrationContract:{
              abi:IdleBatchedMint,
              name:'IdleBatchedMintDAISafe',
              address:'0x08db226d63cE724A6091Ba82D28dFc76ceCa23d8',
              functions:[
                {
                  name:'deposit',
                  label:'Deposit',
                  usePermit:true,
                },
              ]
            },
          },
          idleUSDCSafe:{
            decimals:18,
            abi:IdleTokenV3,
            strategy:'risk',
            baseToken:'USDC',
            migrationContract:{
              abi:IdleBatchedMint,
              name:'IdleBatchedMintUSDCSafe',
              address:'0xA6C89A31D59f9C68D9Cba28d690C5E52058fb472',
              functions:[
                {
                  name:'deposit',
                  label:'Deposit',
                  usePermit:true,
                },
              ]
            },
          },
          idleUSDTSafe:{
            decimals:18,
            abi:IdleTokenV3,
            strategy:'risk',
            baseToken:'USDT',
            migrationContract:{
              abi:IdleBatchedMint,
              name:'IdleBatchedMintUSDTSafe',
              address:'0xd47B96Fb33b79a4Dd81a2bfa676eBB669166f619',
              functions:[
                {
                  label:'Deposit',
                  name:'deposit'
                },
              ]
            },
          }
          */
        }
      }
    },
    batchMigration:{
      enabled:true,
      claimEnabled:true,
      depositEnabled:false,
      icon:'FileDownload',
      route:'batch-migration',
      label:'Batch Migration',
      subComponent:BatchMigration,
      desc:'Deposit your Idle Tokens V3 into a batch and wait until its conversion to the Idle Token V4',
      props:{
        availableTokens:{
          idleDAIYield:{
            decimals:18,
            abi:IdleTokenV3,
            strategy:'best',
            baseToken:'DAI',
            name:'idleDAIYieldV3',
            token:'idleDAIYieldV3',
            address:'0x78751b12da02728f467a44eac40f5cbc16bd7934',
            migrationContract:{
              abi:IdleBatchConverter,
              name:'IdleBatchConverterDAI',
              address:'0xe0BfD08dA4DAf8f8BA11d1c3802009E75f963497',
              functions:[
                {
                  label:'Deposit',
                  name:'deposit'
                },
              ]
            },
          },
          idleUSDCYield:{
            decimals:18,
            abi:IdleTokenV3,
            strategy:'best',
            baseToken:'USDC',
            name:'idleUSDCYieldV3',
            token:'idleUSDCYieldV3',
            address:'0x12B98C621E8754Ae70d0fDbBC73D6208bC3e3cA6',
            migrationContract:{
              abi:IdleBatchConverter,
              name:'IdleBatchConverterUSDC',
              address:'0x86c8b56d124c2a8e7ea8a9e6a7f8ed99dde5cca8',
              functions:[
                {
                  label:'Deposit',
                  name:'deposit'
                },
              ]
            },
          },
          idleUSDTYield:{
            decimals:18,
            abi:IdleTokenV3,
            strategy:'best',
            baseToken:'USDT',
            name:'idleUSDTYieldV3',
            token:'idleUSDTYieldV3',
            address:'0x63D27B3DA94A9E871222CB0A32232674B02D2f2D',
            migrationContract:{
              abi:IdleBatchConverter,
              name:'IdleBatchConverterUSDT',
              address:'0xee5c50c7c49dec47dde2f9b0233b9e14a8f00cf2',
              functions:[
                {
                  label:'Deposit',
                  name:'deposit'
                },
              ]
            },
          },
          idleSUSDYield:{
            decimals:18,
            abi:IdleTokenV3,
            strategy:'best',
            baseToken:'SUSD',
            name:'idleSUSDYieldV3',
            token:'idleSUSDYieldV3',
            address:'0xe79e177d2a5c7085027d7c64c8f271c81430fc9b',
            migrationContract:{
              abi:IdleBatchConverter,
              name:'IdleBatchConverterSUSD',
              address:'0xE2eE519399a49f1A2004a25DA61e82867A69b9b1',
              functions:[
                {
                  label:'Deposit',
                  name:'deposit'
                },
              ]
            },
          },
          idleTUSDYield:{
            decimals:18,
            abi:IdleTokenV3,
            strategy:'best',
            baseToken:'TUSD',
            name:'idleTUSDYieldV3',
            token:'idleTUSDYieldV3',
            address:'0x51C77689A9c2e8cCBEcD4eC9770a1fA5fA83EeF1',
            migrationContract:{
              abi:IdleBatchConverter,
              name:'IdleBatchConverterTUSD',
              address:'0x174a273f0ea28e55b6dd13259aa43d262b863a86',
              functions:[
                {
                  label:'Deposit',
                  name:'deposit'
                },
              ]
            },
          },
          idleWBTCYield:{
            decimals:18,
            abi:IdleTokenV3,
            strategy:'best',
            baseToken:'WBTC',
            name:'idleWBTCYieldV3',
            token:'idleWBTCYieldV3',
            address:'0xD6f279B7ccBCD70F8be439d25B9Df93AEb60eC55',
            migrationContract:{
              abi:IdleBatchConverter,
              name:'IdleBatchConverterWBTC',
              address:'0xbfDC7d97559173B52EF2A2f1bC9BeCf97B0D401D',
              functions:[
                {
                  label:'Deposit',
                  name:'deposit'
                },
              ]
            },
          },
          idleDAISafe:{
            decimals:18,
            abi:IdleTokenV3,
            strategy:'risk',
            baseToken:'DAI',
            name:'idleDAISafeV3',
            token:'idleDAISafeV3',
            address:'0x1846bdfDB6A0f5c473dEc610144513bd071999fB',
            migrationContract:{
              abi:IdleBatchConverter,
              name:'IdleBatchConverterDAISafe',
              address:'0x08db226d63cE724A6091Ba82D28dFc76ceCa23d8',
              functions:[
                {
                  label:'Deposit',
                  name:'deposit'
                },
              ]
            },
          },
          idleUSDCSafe:{
            decimals:18,
            abi:IdleTokenV3,
            strategy:'risk',
            baseToken:'USDC',
            name:'idleUSDCSafeV3',
            token:'idleUSDCSafeV3',
            address:'0xcDdB1Bceb7a1979C6caa0229820707429dd3Ec6C',
            migrationContract:{
              abi:IdleBatchConverter,
              name:'IdleBatchConverterUSDCSafe',
              address:'0xA6C89A31D59f9C68D9Cba28d690C5E52058fb472',
              functions:[
                {
                  label:'Deposit',
                  name:'deposit'
                },
              ]
            },
          },
          idleUSDTSafe:{
            decimals:18,
            abi:IdleTokenV3,
            strategy:'risk',
            baseToken:'USDT',
            name:'idleUSDTSafeV3',
            token:'idleUSDTSafeV3',
            address:'0x42740698959761baf1b06baa51efbd88cb1d862b',
            migrationContract:{
              abi:IdleBatchConverter,
              name:'IdleBatchConverterUSDTSafe',
              address:'0xd47B96Fb33b79a4Dd81a2bfa676eBB669166f619',
              functions:[
                {
                  label:'Deposit',
                  name:'deposit'
                },
              ]
            },
          }
        }
      }
    },
    tokenMigration:{
      enabled:true,
      icon:'SwapHoriz',
      route:'convert',
      label:'Token Migration',
      desc:'Easily convert your Compound, Fulcrum, Aave and iEarn tokens into Idle',
      subComponent:TokenMigration,
      props:{
        migrationContract:{
          name:'IdleConverterV4',
          abi:IdleConverterPersonalSignV4,
          address:'0xa55caa40b32a02becfad1d0d29c4f1cf38c4c743',
          oldAddresses:[],
          functions:[
            {
              label:'Migrate',
              name:'migrateFromToIdle'
            },
          ]
        },
        availableStrategies:['best','risk'],
        availableTokens:{
          idleDAIv2:{
            decimals:18,
            enabled:true,
            protocol:'idle',
            baseToken:'DAI',
            abi:IdleTokenV2,
            token:'idleDAIOld',
            icon:'images/tokens/idleDAI.svg',
            migrateFunction:'migrateFromToIdle',
            address:'0x10eC0D497824e342bCB0EDcE00959142aAa766dD',
          },
          cDAI:{
            decimals:8,
            enabled:true,
            token:"cDAI",
            baseToken:'DAI',
            protocol:"compound",
            migrateFunction:'migrateFromCompoundToIdle',
            address:"0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",
          },
          iDAI:{
            decimals:18,
            enabled:false,
            token:"iDAI",
            baseToken:'DAI',
            protocol:"fulcrum",
            migrateFunction:'migrateFromFulcrumToIdle',
            address:"0x493c57c4763932315a328269e1adad09653b9081",
          },
          aDAI:{
            decimals:18,
            enabled:true,
            token:"aDAI",
            protocol:"aave",
            baseToken:'DAI',
            migrateFunction:'migrateFromAaveToIdle',
            address:"0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d",
          },
          yDAIv3:{
            decimals:18,
            enabled:true,
            token:"yDAIv3",
            abi:yDAIv3.abi,
            baseToken:'DAI',
            protocol:"iearn",
            icon:'images/tokens/yDAI.png',
            migrateFunction:'migrateFromIearnToIdle',
            address:"0xC2cB1040220768554cf699b0d863A3cd4324ce32",
          },
          yDAIv2:{
            decimals:18,
            enabled:true,
            token:"yDAIv2",
            baseToken:'DAI',
            abi:yDAIv3.abi,
            protocol:"iearn",
            icon:'images/tokens/yDAI.png',
            migrateFunction:'migrateFromIearnToIdle',
            address:"0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01",
          },
          idleUSDCv2:{
            decimals:18,
            enabled:true,
            protocol:'idle',
            abi:IdleTokenV2,
            baseToken:'USDC',
            token:'idleUSDCOld',
            icon:'images/tokens/idleUSDC.svg',
            migrateFunction:'migrateFromToIdle',
            address:'0xeB66ACc3d011056B00ea521F8203580C2E5d3991',
          },
          cUSDC:{
            decimals:8,
            enabled:true,
            token:"cUSDC",
            baseToken:'USDC',
            protocol:"compound",
            migrateFunction:'migrateFromCompoundToIdle',
            address:"0x39aa39c021dfbae8fac545936693ac917d5e7563",
          },
          iUSDC:{
            decimals:6,
            enabled:false,
            token:"iUSDC",
            baseToken:'USDC',
            protocol:"fulcrum",
            migrateFunction:'migrateFromFulcrumToIdle',
            address:"0xf013406a0b1d544238083df0b93ad0d2cbe0f65f",
          },
          aUSDC:{
            decimals:6,
            enabled:true,
            token:"aUSDC",
            protocol:"aave",
            baseToken:'USDC',
            migrateFunction:'migrateFromAaveToIdle',
            address:"0x9bA00D6856a4eDF4665BcA2C2309936572473B7E",
          },
          yUSDCv3:{
            decimals:6,
            enabled:true,
            token:"yUSDCv3",
            protocol:"iearn",
            abi:yUSDCv3.abi,
            baseToken:'USDC',
            icon:'images/tokens/yUSDC.png',
            migrateFunction:'migrateFromIearnToIdle',
            address:"0x26EA744E5B887E5205727f55dFBE8685e3b21951",
          },
          yUSDCv2:{
            decimals:6,
            enabled:true,
            token:"yUSDCv2",
            protocol:"iearn",
            abi:yUSDCv3.abi,
            baseToken:'USDC',
            icon:'images/tokens/yUSDC.png',
            migrateFunction:'migrateFromIearnToIdle',
            address:"0xd6aD7a6750A7593E092a9B218d66C0A814a3436e",
          },
          cUSDT:{
            decimals:8,
            enabled:true,
            token:"cUSDT",
            baseToken:'USDT',
            protocol:"compound",
            migrateFunction:'migrateFromCompoundToIdle',
            address:"0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9",
          },
          iUSDT:{
            decimals:6,
            enabled:false,
            token:"iUSDT",
            baseToken:'USDT',
            protocol:"fulcrum",
            migrateFunction:'migrateFromFulcrumToIdle',
            address:"0x8326645f3aa6de6420102fdb7da9e3a91855045b",
          },
          aUSDT:{
            decimals:6,
            enabled:true,
            token:"aUSDT",
            protocol:"aave",
            baseToken:'USDT',
            migrateFunction:'migrateFromAaveToIdle',
            address:"0x71fc860F7D3A592A4a98740e39dB31d25db65ae8",
          },
          yUSDTv3:{
            decimals:6,
            enabled:true,
            token:"yUSDTv3",
            abi:yUSDTv3.abi,
            protocol:"iearn",
            baseToken:'USDT',
            icon:'images/tokens/yUSDT.png',
            migrateFunction:'migrateFromIearnToIdle',
            address:"0xE6354ed5bC4b393a5Aad09f21c46E101e692d447",
          },
          yUSDTv2:{
            decimals:6,
            enabled:true,
            token:"yUSDTv2",
            abi:yUSDTv3.abi,
            protocol:"iearn",
            baseToken:'USDT',
            icon:'images/tokens/yUSDT.png',
            migrateFunction:'migrateFromIearnToIdle',
            address:"0x83f798e925BcD4017Eb265844FDDAbb448f1707D",
          },
          idleSUSDv2:{
            decimals:18,
            enabled:true,
            abi:IdleTokenV2,
            protocol:'idle',
            baseToken:'SUSD',
            token:'idleSUSDYieldOld',
            availableStrategies:['best'],
            migrateFunction:'migrateFromToIdle',
            icon:'images/tokens/idleSUSDYield.svg',
            address:'0xb39ca0261a1b2986a6a9Fe38d344B56374963dE5',
          },
          aSUSD:{
            decimals:6,
            enabled:true,
            token:"aSUSD",
            protocol:"aave",
            baseToken:'SUSD',
            migrateFunction:'migrateFromAaveToIdle',
            address:"0x625aE63000f46200499120B906716420bd059240",
          },
          ySUSDv3:{
            decimals:18,
            enabled:true,
            token:"ySUSDv3",
            abi:ySUSDv3,
            baseToken:'SUSD',
            protocol:"iearn",
            availableStrategies:['best'],
            icon:'images/tokens/ySUSDv3.png',
            migrateFunction:'migrateFromIearnToIdle',
            address:"0xf61718057901f84c4eec4339ef8f0d86d2b45600",
          },
          idleTUSDv2:{
            decimals:18,
            enabled:true,
            abi:IdleTokenV2,
            protocol:'idle',
            baseToken:'TUSD',
            token:'idleTUSDYieldOld',
            availableStrategies:['best'],
            migrateFunction:'migrateFromToIdle',
            icon:'images/tokens/idleTUSDYield.svg',
            address:'0x7DB7A4a50b26602E56536189Aa94678C80F8E5b6',
          },
          aTUSD:{
            decimals:6,
            enabled:true,
            token:"aTUSD",
            protocol:"aave",
            baseToken:'TUSD',
            migrateFunction:'migrateFromAaveToIdle',
            address:"0x4DA9b813057D04BAef4e5800E36083717b4a0341",
          },
          yTUSDv3:{
            decimals:18,
            enabled:true,
            abi:yTUSDv3,
            token:"yTUSDv3",
            baseToken:'TUSD',
            protocol:"iearn",
            icon:'images/tokens/yTUSDv3.png',
            migrateFunction:'migrateFromIearnToIdle',
            address:"0x73a052500105205d34daf004eab301916da8190f",
          },
          cWBTC:{
            decimals:8,
            enabled:true,
            token:"cWBTC",
            baseToken:'WBTC',
            protocol:"compound",
            migrateFunction:'migrateFromCompoundToIdle',
            address:"0xc11b1268c1a384e55c48c2391d8d480264a3a7f4",
          },
          iWBTC:{
            decimals:8,
            enabled:false,
            token:"iWBTC",
            baseToken:'WBTC',
            protocol:"fulcrum",
            migrateFunction:'migrateFromFulcrumToIdle',
            address:"0xba9262578efef8b3aff7f60cd629d6cc8859c8b5",
          },
          aWBTC:{
            decimals:8,
            enabled:true,
            token:"aWBTC",
            protocol:"aave",
            baseToken:'WBTC',
            migrateFunction:'migrateFromAaveToIdle',
            address:"0xfc4b8ed459e00e5400be803a9bb3954234fd50e3",
          },
        }
      }
    },
    addFunds:{
      enabled:true,
      icon:'AddCircleOutline',
      route:'add-funds',
      label:'Add Funds',
      desc:'Buy tokens with your Bank account, Credit card or Ethereum Wallet',
      subComponent:BuyModal,
      directProps:{
        showInline:true,
        showAllTokens:true
      }
    },
    insurance:{
      enabled:false,
      icon:'Security',
      route:'nexus-mutual',
      label:'Nexus Mutual',
      desc:'Buy tokens with Bank account or Credit card',
      subComponent:NexusMutual,
      props:{
        availableTokens:{
          "ETH":{"token":"ETH"},
          "DAI":{"token":"DAI"},
        }
      },
      directProps:{
        ens:'idlefinancev3.nexusmutual.eth',
        address:'0x78751B12Da02728F467A44eAc40F5cbc16Bd7934'
      }
    },
    tokenSwap:{
      enabled:true,
      icon:'Sync',
      route:'token-swap',
      label:'Token Swap',
      desc:'Easily swap your tokens using Kyber Swap widget',
      subComponent:TokenSwap,
      props:{
        availableTokens:{
          "ETH":{"token":"ETH"},
          "DAI":{"token":"DAI"},
          "SUSD":{"token":"SUSD"},
          "TUSD":{"token":"TUSD"},
          "USDC":{"token":"USDC"},
          "USDS":{"token":"USDS"},
          "USDT":{"token":"USDT"},
          "WBTC":{"token":"WBTC"},
          "WETH":{"token":"WETH"},
          "BUSD":{"token":"BUSD"},
          "EURS":{"token":"EURS"},
          "2KEY":{"token":"2KEY"},
          "ABT":{"token":"ABT"},
          "ABYSS":{"token":"ABYSS"},
          "AMPL":{"token":"AMPL"},
          "ANT":{"token":"ANT"},
          "BAM":{"token":"BAM"},
          "BAND":{"token":"BAND"},
          "BAT":{"token":"BAT"},
          "BLZ":{"token":"BLZ"},
          "BNT":{"token":"BNT"},
          "BQX":{"token":"BQX"},
          "BTU":{"token":"BTU"},
          "CDT":{"token":"CDT"},
          "CVC":{"token":"CVC"},
          "DAT":{"token":"DAT"},
          "DGX":{"token":"DGX"},
          "EKG":{"token":"EKG"},
          "ELF":{"token":"ELF"},
          "ENJ":{"token":"ENJ"},
          "EQUAD":{"token":"EQUAD"},
          "FXC":{"token":"FXC"},
          "GDC":{"token":"GDC"},
          "GEN":{"token":"GEN"},
          "GHT":{"token":"GHT"},
          "GNO":{"token":"GNO"},
          "IOST":{"token":"IOST"},
          "KEY":{"token":"KEY"},
          "KNC":{"token":"KNC"},
          "LEND":{"token":"LEND"},
          "LINK":{"token":"LINK"},
          "LOOM":{"token":"LOOM"},
          "LRC":{"token":"LRC"},
          "MANA":{"token":"MANA"},
          "MCO":{"token":"MCO"},
          "MET":{"token":"MET"},
          "MFG":{"token":"MFG"},
          "MKR":{"token":"MKR"},
          "MLN":{"token":"MLN"},
          "MTL":{"token":"MTL"},
          "MYB":{"token":"MYB"},
          "NEXXO":{"token":"NEXXO"},
          "NPXS":{"token":"NPXS"},
          "OGN":{"token":"OGN"},
          "OMG":{"token":"OMG"},
          "OST":{"token":"OST"},
          "PAX":{"token":"PAX"},
          "PBTC":{"token":"PBTC"},
          "PLR":{"token":"PLR"},
          "PNK":{"token":"PNK"},
          "POLY":{"token":"POLY"},
          "POWR":{"token":"POWR"},
          "PT":{"token":"PT"},
          "QKC":{"token":"QKC"},
          "QNT":{"token":"QNT"},
          "RAE":{"token":"RAE"},
          "REN":{"token":"REN"},
          "REP":{"token":"REP"},
          "REQ":{"token":"REQ"},
          "RLC":{"token":"RLC"},
          "RSR":{"token":"RSR"},
          "RSV":{"token":"RSV"},
          "SAN":{"token":"SAN"},
          "SNT":{"token":"SNT"},
          "SNX":{"token":"SNX"},
          "SPIKE":{"token":"SPIKE"},
          "SPN":{"token":"SPN"},
          "TKN":{"token":"TKN"},
          "TKX":{"token":"TKX"},
          "TRYB":{"token":"TRYB"},
          "UBT":{"token":"UBT"},
          "UPP":{"token":"UPP"},
          "ZRX":{"token":"ZRX"}
        }
      },
      directProps:{
      }
    }
  },
  payments: { // Payment methods & providers
    methods:{
      bank:{
        defaultProvider:null,
        showDefaultOnly:false,
        props:{
          imageSrc:'images/bank.png',
          caption:'Bank Account'
        }
      },
      card:{
        defaultProvider:null,
        showDefaultOnly:false,
        props:{
          imageSrc:'images/debit-card.png',
          caption:'Credit Card'
        }
      },
      wallet:{
        defaultProvider:'zeroExInstant',
        showDefaultOnly:false,
        props:{
          imageSrc:'images/ethereum-wallet.svg',
          caption:'Ethereum Wallet',
          imageProps:{
            padding:['0','5px']
          }
        }
      },
    },
    providers: {
      wyre: {
        enabled: true,
        imageSrc: 'images/payments/wyre.svg',
        imageProps: {
          width: ['100%','auto'],
          height: ['auto','35px'],
          my: '8px'
        },
        caption: 'Buy with',
        captionPos: 'top',
        subcaption: '~ 0.75% fee ~',
        supportedMethods:['card'],
        supportedCountries:['USA','GBR','AUS','BRA','CHN','MEX','EUR'],
        supportedTokens:['USDC','DAI','ETH'],
        remoteResources:{},
        env:'prod',
        envParams:{
          test:{
            accountId:'AC_Q2Y4AARC3TP'
          },
          prod:{
            accountId:'AC_PQQBX33XVEQ'
          }
        },
        getInfo: (props) => {
          const info = {};
          if (props.selectedMethod && props.selectedMethod){
            switch (props.selectedMethod){
              case 'bank':
                info.subcaption = `~ 0.75% fee ~\nKYC REQUIRED`;
              break;
              case 'card':
                info.subcaption = `~ 3.2% fee ~\n$250.00/day`;
              break;
              default:
              break;
            }
          }
          return info;
        },
        getInitParams: (props,globalConfigs,buyParams) => {
          const env = globalConfigs.payments.providers.wyre.env;
          const envParams = globalConfigs.payments.providers.wyre.envParams[env];
          const referrerAccountId = envParams.accountId;
          const url = 'https://pay.sendwyre.com/purchase';

          const params = {
            dest: `ethereum:${props.account}`,
            destCurrency: buyParams.selectedToken ? buyParams.selectedToken : ( props.tokenConfig.wyre && props.tokenConfig.wyre.destCurrency ? props.tokenConfig.wyre.destCurrency : props.selectedToken ),
            referrerAccountId,
            redirectUrl:globalConfigs.baseURL
            // failureRedirectUrl:globalConfigs.baseURL
          };

          return `${url}?`+Object.keys(params)
              .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
              .join('&');
        },
        render: (initParams,amount,props,globalConfigs) => {
          const wyreWidget = document.getElementById('wyre-widget');
          if (!wyreWidget){
            const iframeBox = document.createElement("div");
            iframeBox.innerHTML = `
              <div id="wyre-widget" class="wyre-widget iframe-container" style="position:fixed;display:flex;justify-content:center;align-items:center;top:0;left:0;width:100%;height:100%;z-index:999">
                <div id="wyre-widget-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:1"></div>
                <a class="wyre-close-button" href="javascript:void(0);" onclick="document.getElementById('wyre-widget').remove();" style="position:absolute;width:30px;height:30px;top:10px;right:10px;font-size:22px;line-height:30px;text-align:center;color:#fff;font-weight:bold;z-index:10;text-decoration:none">✕</a>
                <div id="wyre-widget-container" style="position:relative;z-index:2;width:400px;height:650px">
                  <iframe
                    style="position:relative;z-index:2;"
                    frameborder="0"
                    height="100%"
                    src="${initParams}"
                    width="100%"
                  >
                    <p>Your browser does not support iframes.</p>
                  </iframe>
                  <div id="wyre-widget-loading-placeholder" style="position:absolute;background:#fff;width:100%;height:100%;z-index:1;top:0;display:flex;justify-content:center;align-items:center;">
                    <div style="display:flex;flex-direction:row;align-items:center">
                      <img src="${globalConfigs.payments.providers.wyre.imageSrc}" style="height:50px;" />
                      <h3 style="font-weight:600;font-style:italic;color:#000;padding-left:10px">is loading...</h3>
                    </div>
                  </div>
                </div>
              </div>
            `;
            document.body.appendChild(iframeBox);

            // Add wyre Widget style (mobile)
            if (!document.getElementById('wyreWidget_style')){
              const wyreStyle = document.createElement('style');
              wyreStyle.id = 'wyreWidget_style';
              wyreStyle.innerHTML = `
              @media (max-width: 40em){
                #wyre-widget {
                  align-items: flex-start !important;
                }
                #wyre-widget-overlay{
                  background:#fff !important;
                }
                #wyre-widget-container{
                  width:100vw;
                  min-height: calc( 100vh - 60px ) !important;
                }
              }`;
              document.body.appendChild(wyreStyle);
            }
          }
        },
      },
      ramp: {
        enabled:true,
        imageSrc: 'images/payments/ramp.png',
        imageProps: {
          width: ['100%','auto'],
          height: ['auto','35px'],
          my: '8px'
        },
        caption: 'Buy with',
        captionPos: 'top',
        subcaption:`~ 2.5% fee ~\nEUR / GBP`,
        supportedMethods:['bank','card'],
        badge: {
          text:'NO ID REQUIRED',
          color:'#fff',
          bgColor:'#0cade4'
        },
        supportedTokens:['ETH','DAI','USDC'],
        supportedCountries:['USA','GBR','AUS','BRA','CAN','EUR','HKG','IND','MEX','RUS','ZAF','KOR'],
        getInfo: (props) => {
          const info = {};
            switch (props.selectedMethod){
              case 'bank':
                info.supportedCountries = ['GBR','EUR'];
                info.subcaption = `~ 1.49-1.99% fee ~`;
              break;
              case 'card':
                info.supportedCountries = ['USA','GBR','AUS','BRA','CAN','EUR','HKG','IND','MEX','RUS','ZAF','KOR'];
                info.subcaption = `~ 2.90% fee ~`;
              break;
              default:
              break;
            }
          return info;
        },
        getInitParams: (props,globalConfigs,buyParams) => {
        	return {
	          hostAppName: 'Idle',
            userAddress: props.account,
            hostApiKey: env.REACT_APP_RAMP_KEY,
            variant: props.isMobile ? 'mobile' : 'desktop',
            hostLogoUrl: `${globalConfigs.baseURL}/images/idle-round.png`,
            swapAsset: buyParams.selectedToken ? buyParams.selectedToken : ( props.tokenConfig.ramp && props.tokenConfig.ramp.swapAsset ? props.tokenConfig.ramp.swapAsset : props.selectedToken )
        	};
        },
        render: (initParams,amount,props,globalConfigs) => {
          new RampInstantSDK(initParams)
            .on('*', async (event) => {
              const functionsUtil = new FunctionsUtil(props);
              let tokenDecimals = null;
              let tokenAmount = null;

              switch (event.type){
                case 'PURCHASE_SUCCESSFUL':
                  // Update balance
                  props.getAccountBalance();

                  tokenDecimals = await props.getTokenDecimals();

                  tokenAmount = event.payload.purchase.tokenAmount;
                  tokenAmount = functionsUtil.BNify(tokenAmount.toString()).div(functionsUtil.BNify(Math.pow(10,parseInt(tokenDecimals)).toString())).toString();

                  // Toast message
                  window.toastProvider.addMessage(`Payment completed`, {
                    secondaryMessage: `${tokenAmount} ${props.selectedToken} are now in your wallet`,
                    colorTheme: 'light',
                    actionHref: "",
                    actionText: "",
                    variant: "success",
                  });

                break;
                default:
                break;
              }
            })
            .show();
        }
      },
      transak: {
        enabled:true,
        imageSrc: 'images/payments/transak.png',
        imageProps: {
          width: ['100%','auto'],
          height: ['auto','35px'],
          my: '8px'
        },
        caption: 'Buy with',
        captionPos: 'top',
        subcaption:`~ 1.5% fee ~\nALL CURRENCIES`,
        supportedMethods:['bank','card'],
        supportedCountries:['USA','GBR','AUS','BRA','CHN','MEX','EUR','IND'],
        supportedTokens:['ETH','DAI','USDC','USDT','TUSD','SUSD','WBTC'],
        remoteResources:{'https://global.transak.com/v1/widget.js':{}},
        env:'prod',
        badge:{
          text:'INSTANT',
          bgColor:'#0069ee'
        },
        envParams:{
          test:{
            apiKey:env.REACT_APP_TRANSAK_KEY_TEST,
            url:'https://global.transak.com'
          },
          prod:{
            apiKey:env.REACT_APP_TRANSAK_KEY_PROD,
            url:'https://global.transak.com'
          }
        },
        getInfo: (props) => {
          const info = {};

          const selectedMethod = props.selectedMethod && props.selectedMethod;
          let fee = selectedMethod === 'bank' ? '1.5%' : '4.5%';

          if (props.selectedCountry && props.selectedCountry.value){
            switch (props.selectedCountry.value.toUpperCase()){
              case 'GBR':
                info.badge = {
                  text:'INSTANT',
                  bgColor:'#0069ee'
                };
                info.subcaption = `~ ${fee} fee ~\nGBP ONLY`;
              break;
              case 'IND':
                fee = '1.0%';
                info.badge = {
                  text:'INSTANT',
                  bgColor:'#0069ee'
                };
                info.subcaption = `~ ${fee} fee ~\nINR ONLY`;
              break;
              case 'EUR':
                if (selectedMethod === 'bank'){
                  info.badge = {
                    text:'SEPA',
                    color:'#f7cb05 ',
                    bgColor:'#10288a'
                  };
                } else {
                  info.badge = {
                    text:'INSTANT',
                    bgColor:'#0069ee'
                  };
                }
                info.subcaption = `~ ${fee} fee ~\nEUR ONLY`;
              break;
              default:
              break;
            }
          }
          return info;
        },
        getInitParams: (props,globalConfigs,buyParams) => {
          const env = globalConfigs.payments.providers.transak.env;
          const envParams = globalConfigs.payments.providers.transak.envParams[env];

          let fiatCurrency = null;

          if (buyParams.selectedCountry && buyParams.selectedCountry.value){
            switch (buyParams.selectedCountry.value.toUpperCase()){
              case 'IND':
                fiatCurrency = 'INR';
              break;
              case 'GBR':
                fiatCurrency = 'GBP';
              break;
              case 'EUR':
                fiatCurrency = 'EUR';
              break;
              case 'USA':
                fiatCurrency = 'USD';
              break;
              default:
                fiatCurrency = 'GBP';
              break;
            }
          }

          let cryptoCurrencyCode = buyParams.selectedToken ? buyParams.selectedToken.toLowerCase() : ( props.tokenConfig.transak && props.tokenConfig.transak.currencyCode ? props.tokenConfig.transak.currencyCode : props.selectedToken);
          cryptoCurrencyCode = cryptoCurrencyCode.toUpperCase();

          const apiKey = envParams.apiKey;
          const walletAddress = props.account;
          const partnerCustomerId = props.account;
          const disableWalletAddressForm = false;

          return {
            apiKey,
            cryptoCurrencyCode,
            walletAddress,
            fiatCurrency,
            partnerCustomerId,
            disableWalletAddressForm,
            width:'100%',
            height:'100%'
            // email,
          };
        },
        render: (initParams,amount,props,globalConfigs) => {
          if (window.transakGlobal){

            const transakWidget = document.getElementById('transak-widget');
            if (!transakWidget){
              const iframeBox = document.createElement("div");
              iframeBox.innerHTML = `
                <div id="transak-widget" class="transak-widget iframe-container" style="position:fixed;display:flex;justify-content:center;align-items:center;top:0;left:0;width:100%;height:100%;z-index:999">
                  <div id="transak-widget-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:1" onclick="document.getElementById('transak-widget').remove();"></div>
                  <a class="transak-close-button" href="javascript:void(0);" onclick="document.getElementById('transak-widget').remove();" style="position:absolute;width:30px;height:30px;top:10px;right:10px;font-size:22px;line-height:30px;text-align:center;color:#fff;font-weight:bold;z-index:10;text-decoration:none">✕</a>
                  <div class="transak-widget-container" style="position:relative;z-index:2;width:500px;height:550px">
                    <div id="transak-widget-container" style="position:relative;z-index:2;width:500px;height:550px"></div>
                    <div id="transak-widget-loading-placeholder" style="position:absolute;background:#fff;width:100%;height:100%;z-index:1;top:0;display:flex;justify-content:center;align-items:center;">
                      <div style="display:flex;flex-direction:row;align-items:center">
                        <img src="${globalConfigs.payments.providers.transak.imageSrc}" style="height:50px;" />
                        <h3 style="font-weight:600;font-style:italic;color:#0040ca">is loading...</h3>
                      </div>
                    </div>
                  </div>
                </div>
              `;
              document.body.appendChild(iframeBox);

              // Add transak Widget style (mobile)
              if (!document.getElementById('transakWidget_style')){
                const transakStyle = document.createElement('style');
                transakStyle.id = 'transakWidget_style';
                transakStyle.innerHTML = `
                @media (max-width: 40em){
                  #transak-widget {
                    align-items: flex-start !important;
                  }
                  #transak-widget-overlay{
                    background:#fff !important;
                  }
                  #transak-widget-container{
                    width:100vw;
                    min-height: calc( 100vh - 60px ) !important;
                  }
                }`;
                document.body.appendChild(transakStyle);
              }
            }

            window.transakGlobal.render(initParams, 'transak-widget-container');
          }
        }
      },
      moonpay: {
        enabled:true,
        imageSrc: 'images/payments/moonpay.svg',
        imageProps: {
          width: ['100%','auto'],
          height: ['auto','35px'],
          my: '8px'
        },
        caption: 'Buy with',
        captionPos: 'top',
        subcaption: '~ 4.5% fee ~',
        supportedMethods:['card','bank'],
        supportedCountries:['GBR','EUR','AUS','BRA','CHN','MEX','CAN','HKG','RUS','ZAF','KOR'],
        supportedTokens:['USDC','DAI','ETH'],
        env:'prod',
        envParams:{
          test:{
            url:'https://buy-staging.moonpay.io',
            apiKey:env.REACT_APP_MOONPAY_KEY_TEST
          },
          prod:{
            url:'https://buy.moonpay.io',
            apiKey:env.REACT_APP_MOONPAY_KEY_PROD
          }
        },
        getInfo: (props) => {
          const info = {};
          if (props.selectedMethod && props.selectedMethod){
            switch (props.selectedMethod){
              case 'bank':
                if (props.selectedCountry && props.selectedCountry.value){
                  switch (props.selectedCountry.value.toUpperCase()){
                    case 'EUR':
                      info.badge = {
                        text:'SEPA',
                        color:'#f7cb05 ',
                        bgColor:'#10288a'
                      }
                      info.subcaption = `~ 1.5% fee ~\nEUR ONLY`;
                    break;
                    case 'GBR':
                      info.badge = {
                        text:'GBP',
                      }
                      info.subcaption = `~ 1.5% fee ~\nGBP ONLY`;
                    break;
                    default:
                      info.badge = null;
                      info.subcaption = `~ 1.5% fee ~\nEUR/GBP ONLY`;
                    break;
                  }
                }
              break;
              case 'card':
                info.badge = null;
                info.subcaption = `~ 5% fee ~`;
              break;
              default:
              break;
            }
          }
          return info;
        },
        getInitParams: (props,globalConfigs,buyParams) => {
          const env = globalConfigs.payments.providers.moonpay.env;
          const envParams = globalConfigs.payments.providers.moonpay.envParams[env];
          const apiKey = envParams.apiKey;
          const params = {
            apiKey,
            currencyCode: buyParams.selectedToken ? buyParams.selectedToken.toLowerCase() : ( props.tokenConfig.moonpay && props.tokenConfig.moonpay.currencyCode ? props.tokenConfig.moonpay.currencyCode : props.selectedToken.toLowerCase()),
            walletAddress:props.account,
            baseCurrencyCode:'USD',
            showWalletAddressForm: true
          };

          const methods = {
            'bank':{
              'GBR':'gbp_bank_transfer',
              'EUR':'sepa_bank_transfer'
            },
            'card':'credit_debit_card'
          };

          const selectedCountry = buyParams.selectedCountry && buyParams.selectedCountry.value ? buyParams.selectedCountry.value.toUpperCase() : null;

          // Set payment method
          if (buyParams.selectedMethod){
            switch (buyParams.selectedMethod){
              case 'bank':
                params.enabledPaymentMethods = methods[buyParams.selectedMethod]['EUR'];
                switch (selectedCountry){
                  case 'GBR':
                  case 'EUR':
                    params.enabledPaymentMethods = methods[buyParams.selectedMethod][selectedCountry];
                  break;
                  default:
                    params.enabledPaymentMethods = Object.values(methods[buyParams.selectedMethod]).join(',');
                  break;
                }
              break;
              case 'card':
              default:
                params.enabledPaymentMethods = methods[buyParams.selectedMethod];
              break;
            }
          }

          // Set baseCurrencyCode
          switch (selectedCountry){
            case 'GBR':
              params.baseCurrencyCode = 'GBP';
            break;
            case 'EUR':
              params.baseCurrencyCode = 'EUR';
            break;
            default:
              params.baseCurrencyCode = 'USD';
            break;
          }

          let url = envParams.url;

          // Safari Fix
          var isSafari = navigator.userAgent.indexOf("Safari") > -1;
          if (isSafari) {
            if (!document.cookie.match(/^(.*;)?\s*moonpay-fixed\s*=\s*[^;]+(.*)?$/)) {
              document.cookie = "moonpay-fixed=fixed; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/";
              url += "/safari_fix";
            }
          }

          return `${url}?`+Object.keys(params)
              .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
              .join('&');
        },
        render: (initParams,amount,props,globalConfigs) => {
          const moonpayWidget = document.getElementById('moonpay-widget');
          if (!moonpayWidget){
            const iframeBox = document.createElement("div");
            iframeBox.innerHTML = `
              <div id="moonpay-widget" class="moonpay-widget iframe-container" style="position:fixed;display:flex;justify-content:center;align-items:center;top:0;left:0;width:100%;height:100%;z-index:999">
                <div id="moonpay-widget-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:1"></div>
                  <div id="moonpay-widget-container" style="position:relative;z-index:2;width:500px;height:490px">
                    <iframe
                      style="position:relative;z-index:2;"
                      frameborder="0"
                      height="100%"
                      src="${initParams}"
                      width="100%"
                    >
                      <p>Your browser does not support iframes.</p>
                    </iframe>
                    <div id="moonpay-widget-loading-placeholder" style="position:absolute;background:#fff;width:100%;height:100%;z-index:1;top:0;display:flex;justify-content:center;align-items:center;">
                      <div style="display:flex;flex-direction:row;align-items:end">
                        <img src="${globalConfigs.payments.providers.moonpay.imageSrc}" style="height:50px;" />
                        <h3 style="padding-left:5px;font-weight:600;font-style:italic;">is loading...</h3>
                      </div>
                    </div>
                    <div id="moonpay-widget-footer" style="position:relative;display:flex;justify-content:center;align-items:center;padding:8px 16px;width:100%;background:#fff;top:-20px;z-index:3">
                      <button style="background:#000;color:#fff;text-align:center;border-radius:5px;width:100%;height:51px;line-height:51px;font-weight:500;border:0;cursor:pointer" onclick="document.getElementById('moonpay-widget').remove();">Close</button>
                    </div>
                  </div>
                </div>
              </div>
            `;
            document.body.appendChild(iframeBox);

            // Add Moonpay Widget style (mobile)
            if (!document.getElementById('moonpayWidget_style')){
              const moonpayStyle = document.createElement('style');
              moonpayStyle.id = 'moonpayWidget_style';
              moonpayStyle.innerHTML = `
              @media (max-width: 40em){
                #moonpay-widget {
                  align-items: flex-start !important;
                }
                #moonpay-widget-overlay{
                  background:#fff !important;
                }
                #moonpay-widget-container{
                  width:100vw;
                  min-height: calc( 100vh - 60px ) !important;
                }
              }`;
              document.body.appendChild(moonpayStyle);
            }
          }
        }
      },
      zeroExInstant: {
        enabled: true,
        imageSrc: 'images/payments/zeroexinstant.svg',
        imageProps: {
          width: ['100%','auto'],
          height: ['auto','35px'],
          my: '8px'
        },
        caption: 'Buy with',
        captionPos: 'top',
        subcaption: '~ 0.25% fee ~',
        supportedMethods:['wallet'],
        supportedTokens:['USDC','DAI'],
        remoteResources:{'https://instant.0x.org/v3/instant.js':{}},
        getInitParams: (props,globalConfigs,buyParams,onSuccess,onClose) => {

          const tokenParams = globalConfigs.tokens[buyParams.selectedToken];
          const connectorName = window.RimbleWeb3_context ? window.RimbleWeb3_context.connectorName : null;

          if (!tokenParams.zeroExInstant){
            return null;
          }

          return {
            networkId: globalConfigs.network.requiredNetwork,
            chainId: globalConfigs.network.requiredNetwork,
            provider: connectorName && connectorName!=='Injected' && window.RimbleWeb3_context.connector[connectorName.toLowerCase()] ? window.RimbleWeb3_context.connector[window.RimbleWeb3_context.connectorName.toLowerCase()].provider : window.ethereum,
            orderSource: tokenParams.zeroExInstant.orderSource,
            affiliateInfo: tokenParams.zeroExInstant.affiliateInfo,
            defaultSelectedAssetData: tokenParams.zeroExInstant.assetData,
            availableAssetDatas: [tokenParams.zeroExInstant.assetData],
            shouldDisableAnalyticsTracking: true,
            onSuccess: onSuccess ? onSuccess : () => {},
            onClose: onClose ? onClose : () => {}
          };
        },
        render: (initParams,amount) => {
          if (window.zeroExInstant && initParams){
            if (amount){
              initParams.defaultAssetBuyAmount = parseFloat(amount);
            }
            window.zeroExInstant.render(initParams, 'body');
          }
        }
      },
      kyberSwap: {
        enabled: true,
        imageSrc: 'images/payments/kyber.svg',
        imageProps: {
          width: ['100%','auto'],
          height: ['auto','35px'],
          my: '8px'
        },
        caption: 'Swap with',
        captionPos: 'top',
        subcaption: '~ 0.25% fee ~',
        supportedMethods:['wallet'],
        supportedTokens:['WETH','USDC','DAI','USDT','TUSD','SUSD','WBTC','RAI'],
        web3Subscription:{ // Data for web3 subscription
          enabled: true,
          contractAddress: '0x818e6fecd516ecc3849daf6845e3ec868087b755',
          decodeLogsData: [
            {
              "internalType": "address",
              "name": "_startAddress",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "_tokenAddress",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "_startAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "_tokenAmount",
              "type": "uint256"
            },
          ],
        },
        remoteResources:{
          'https://widget.kyber.network/v0.7.5/widget.css':{},
          'https://widget.kyber.network/v0.7.5/widget.js':{
            parentElement:document.body,
            precall: (props,globalConfigs,providerInfo) => {

              // Remove previous elements
              const buttons = document.querySelectorAll('.kyber-widget-button');
              for (let i=0;i<buttons.length;i++){
                buttons[i].remove();
              }

              // const kyberWidgetScript = document.getElementById('kyber-widget-script');
              // if (kyberWidgetScript){
              //   kyberWidgetScript.remove();
              // }

              const scripts = document.querySelectorAll('.script_kyberSwap');
              for (let i=0;i<scripts.length;i++){
                scripts[i].remove();
              }

              const buttonId = props.buttonId ? props.buttonId : `kyber-swapper-${props.selectedToken}`;
              if (!document.getElementById(buttonId)){
                const a = document.createElement('a');
                a.id = buttonId;
                a.href = providerInfo.getInitParams(props,globalConfigs);
                a.target = '_blank';
                a.rel = 'nofollow noopener noreferrer';
                a.className = 'kyber-widget-button theme-ocean theme-supported';
                a.title = 'Swap with Kyber';
                a.style = 'display:none;';
                document.body.appendChild(a);
              }
            }
          }
        },
        getInitParams: (props,globalConfigs,buyParams=null) => {
          const baseToken = props.baseToken ? props.baseToken : 'ETH';
          const params = {
            lang:'en',
            type:'swap',
            mode:'iframe',
            theme:'theme-ocean',
            paramForwarding:true,
            // callback:globalConfigs.baseURL,
            pinnedTokens:`${baseToken}_${props.selectedToken}`,
            title:`Swap ${baseToken} for ${props.selectedToken}`,
            defaultPair:`${baseToken}_${props.selectedToken}`,
            commissionId:'0x4215606a720477178AdFCd5A59775C63138711e8',
            network: globalConfigs.network.requiredNetwork === 1 ? 'mainnet' : 'test',
          };

          const url  = 'https://widget.kyber.network/v0.7.5/';

          return `${url}?`+Object.keys(params)
              .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
              .join('&');
        },
        render: (initParams,amount,props) => {
          const buttonId = props.buttonId ? props.buttonId :`kyber-swapper-${props.selectedToken}`;
          const a = document.getElementById(buttonId);
          if (a){
            a.click();

            // Observe for pending transaction
            /*
            if (window.MutationObserver){
              setTimeout(() => {

                const observer = new window.MutationObserver(function(mutations) {
                  mutations.forEach((m,i) => {
                    if (m.addedNodes.length && m.target.className === 'kyber_widget-broadcast'){
                      
                      // Show persistent toast message
                      window.showToastMessage({
                        variant:'processing',
                        message:'Pending deposit',
                        secondaryMessage:'kyberSwap is processing your request'
                      });

                      observer.disconnect();
                    } else if (m.target.id === 'kyber-widget' && m.removedNodes.length && m.removedNodes[0].firstChild.className.includes('kyber_widget-widget-container')) {
                      observer.disconnect();
                    }
                  });
                });
                const target = document.querySelector('#kyber-widget');
                observer.observe(target, { childList: true, subtree: true });
              },1000);
            }
            */
          }
        }
      },
      airSwap: {
        enabled: false,
        imageSrc: 'images/payments/airswap.svg',
        imageProps: {
          width: ['100%','auto'],
          height: ['auto','35px'],
          my: '8px'
        },
        caption: 'Buy with',
        captionPos: 'top',
        subcaption: '~ 0% fee ~',
        supportedMethods:['wallet'],
        supportedTokens:['USDC','DAI'],
        env:'production',
        remoteResources:{'https://cdn.airswap.io/airswap-instant-widget.js':{}},
        getInitParams: (props,globalConfigs,buyParams,onComplete,onClose) => {
          return {
            env: 'production',
            mode: 'buy',
            token: props.tokenConfig.address,
            baseToken: 'ETH',
            onComplete: onComplete ? onComplete : () => {},
            onClose: onClose ? onClose : () => {}
          };
        },
        render: (initParams,amount,props) => {
          if (window.AirSwapInstant){
            if (amount){
              initParams.amount = amount.toString();
            }
            window.AirSwapInstant.render(initParams,'body');
          }
        }
      },
      totle: {
        enabled: false,
        imageSrc: 'images/payments/totle.svg',
        imageProps: {
          width: ['100%','auto'],
          height: ['auto','35px'],
          my: '8px'
        },
        caption: 'Buy with',
        captionPos: 'top',
        subcaption: '~ 0% fee ~',
        supportedMethods:['wallet'],
        supportedTokens:['USDC','DAI'],
        env:'production',
        remoteResources:{'https://widget.totle.com/latest/dist.js':{}},
        getInitParams: (props,globalConfigs,buyParams,onComplete,onClose) => {
          return {
            sourceAssetAddress: null,
            sourceAmountDecimal: null,
            destinationAssetAddress: null,
            destinationAmountDecimal: null,
            apiKey: null,
            partnerContractAddress: null,
          };
        },
        render: (initParams,amount,props) => {
          if (window.TotleWidget){
            const nodeId = 'totle-widget';
            if (!document.getElementById(nodeId)){
              const totleWidgetContainer = document.createElement("div");
              totleWidgetContainer.id = nodeId;
              document.body.appendChild(totleWidgetContainer);
            }

            window.TotleWidget.default.run(initParams,document.getElementById(nodeId));
          }
        }
      }
    }
  }
};

export default globalConfigs;