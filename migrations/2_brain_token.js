const BrainToken = artifacts.require("BrainToken");
const BrainPresale = artifacts.require("BrainPresale");

module.exports = function (deployer) {
  deployer
    .deploy(BrainToken)
    .then(() => deployer.deploy(BrainPresale, 100, BrainToken.address));
};
