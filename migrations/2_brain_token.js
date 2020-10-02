const BrainToken = artifacts.require("BrainToken");

module.exports = function (deployer) {
  deployer.deploy(BrainToken);
};
