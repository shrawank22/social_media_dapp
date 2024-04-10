/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-ethers")
require("@nomiclabs/hardhat-waffle")
require('dotenv').config();
const { PRIVATE_KEY, API_KEY } = process.env;

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
      url:  `https://polygon-mumbai.g.alchemy.com/v2/${API_KEY}`,
      accounts: [
        PRIVATE_KEY,
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