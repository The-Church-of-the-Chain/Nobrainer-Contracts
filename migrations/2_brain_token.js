const BrainToken = artifacts.require("BrainToken");
const BrainNFT = artifacts.require("BrainNFT");
const BrainFarm = artifacts.require("BrainFarm");
const LockedLPFarm = artifacts.require("LockedLPFarm");
const FeeDistributor = artifacts.require("FeeDistributor");
const BrainPresale = artifacts.require("BrainPresale");
const BrainLootbox = artifacts.require("BrainLootbox");
const LockedLP = artifacts.require("LockedLP");

module.exports = async (deployer) => {
  await deployer.deploy(BrainToken);
  await deployer.deploy(BrainPresale, 100, BrainToken.address);
  await deployer.deploy(BrainNFT);
  await deployer.deploy(BrainFarm, BrainToken.address);
  await deployer.deploy(LockedLP, BrainToken.address);

  await deployer.deploy(LockedLPFarm, BrainToken.address, LockedLP.address);
  await deployer.deploy(
    FeeDistributor,
    BrainToken.address,
    LockedLPFarm.address,
    "0xDDfF1Ddfb0608964053e9Bf767F2253101247bfb"
  );

  await deployer.deploy(
    BrainLootbox,
    BrainFarm.address,
    LockedLPFarm.address,
    BrainNFT.address
  );
};
