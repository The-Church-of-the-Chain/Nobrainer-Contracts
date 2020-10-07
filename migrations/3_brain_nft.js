const BrainNFT = artifacts.require("BrainNFT");

module.exports = function (deployer) {
  deployer.deploy(BrainNFT);
};
