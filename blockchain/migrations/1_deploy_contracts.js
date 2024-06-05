const SocialMedia = artifacts.require("SocialMedia");

module.exports = (deployer, network, accounts) => {
  // const verifierAdd = accounts[0];
  deployer.deploy(SocialMedia);
};