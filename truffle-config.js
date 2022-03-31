const { MNEMONIC, ETHERSCAN, BSCSCAN, HECOSCAN, ETHEREUM_MAINNET_NODE,
  ETHEREUM_TEST_NODE, HECO_MAINNET_NODE, 
  HECO_TEST_NODE, BSC_MAINNET_NODE, BSC_TEST_NODE } = require('./config/config.json');

const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    ethereum_mainnet: {
        provider: () => new HDWalletProvider(MNEMONIC, ETHEREUM_MAINNET_NODE),
        network_id: '1',
        networkCheckTimeout: 10000,
        timeoutBlocks: 2000,
        confirmations: 1,
        skipDryRun: true 
    },
    ethereum_testnet: {
        provider: () => new HDWalletProvider(MNEMONIC, ETHEREUM_TEST_NODE),
        network_id: '3', //ropsten
        gasPrice: 8000000000,
        confirmations: 1,
        skipDryRun: true,
    },
    heco_test: {
        provider: () => new HDWalletProvider(MNEMONIC, HECO_TEST_NODE),
        network_id: '256',
        gasPrice: 8000000000, // 8 Gwei
        confirmations: 1,
        skipDryRun: true,
    },
    heco_mainnet:{
        provider: () => new HDWalletProvider(MNEMONIC, HECO_MAINNET_NODE),
        network_id: '128',
        networkCheckTimeout: 10000,
        timeoutBlocks: 2000,
        confirmations: 1,
        skipDryRun: true,
    },
    binance_testnet:{
        provider: () => new HDWalletProvider(MNEMONIC, BSC_TEST_NODE),
        network_id: '97',
        networkCheckTimeout: 10000,
        timeoutBlocks: 2000,
        gasPrice: 20000000000, // 20 Gwei
        confirmations: 1,
        skipDryRun: true
    },
    binance_mainnet:{
        provider: () => new HDWalletProvider(MNEMONIC, BSC_MAINNET_NODE),
        network_id: '56',
        networkCheckTimeout: 10000,
        timeoutBlocks: 2000,
        confirmations: 1,
        skipDryRun: true
    },
    testnet: {
      provider: () => new HDWalletProvider(MNEMONIC, `https://speedy-nodes-nyc.moralis.io/e8c00095108f1be80f03f8da/bsc/testnet`),
      network_id: 97,
      confirmations: 2,
      timeoutBlocks: 200000000,
      skipDryRun: true,
      networkCheckTimeout: 999999,
    },
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 7545, // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    timeout: 100000
  },

  compilers: {
    solc: {
      version: "^0.8.4",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },

  plugins: [
    'truffle-plugin-verify'
  ],
  api_keys: {
    etherscan: ETHERSCAN,
    bscscan: BSCSCAN,
    hecoinfo: HECOSCAN
  },
};
