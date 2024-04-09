/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-ethers")
require("@nomiclabs/hardhat-waffle")

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1
      }
    }
  },
  networks: {
    polygon: {
      url: 'https://polygon-mumbai.g.alchemy.com/v2/MYPwc49ru8kphdLXanN10Z8ye9VWcH_W',
      accounts: [
        '0xc9891405696022967f401859c6947d9903e1a952447ce6609d4675dc90ec0c8d',
      ],
    },
    localhost: {
      url: 'http://127.0.0.1:7545',
      accounts: [
        '0x8ccd98c971e702fa99ea5f4632641319cf08ea123572f5cc21867073677b26e8',
      ],
    }
  }
};