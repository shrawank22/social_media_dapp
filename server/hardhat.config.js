/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-waffle")

module.exports = {
  solidity: "0.8.19",
  networks: {
    matic: {
      url: 'https://polygon-mumbai.g.alchemy.com/v2/MYPwc49ru8kphdLXanN10Z8ye9VWcH_W',
      accounts: [
        '0xd4eb6f52a580ff9448140319173ca779a0eba238a36e0079e03d28e8054ae763',
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