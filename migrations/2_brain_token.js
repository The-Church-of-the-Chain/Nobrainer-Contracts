const BrainToken = artifacts.require("BrainToken");
const BrainNFT = artifacts.require("BrainNFT");
const BrainFarm = artifacts.require("BrainFarm");
const LockedLPFarm = artifacts.require("LockedLPFarm");
const FeeDistributor = artifacts.require("FeeDistributor");
const BrainPresale = artifacts.require("BrainPresale");
const BrainLootbox = artifacts.require("BrainLootbox");

module.exports = async (deployer) => {
  await deployer.deploy(BrainToken);
  await deployer.deploy(BrainPresale, 100, BrainToken.address);
  await deployer.deploy(
    FeeDistributor,
    BrainToken.address,
    "0x0000000000000000000000000000000000000002",
    "0x0000000000000000000000000000000000000003"
  );
  await deployer.deploy(BrainNFT);
  await deployer.deploy(BrainFarm, BrainToken.address);
  await deployer.deploy(
    LockedLPFarm,
    BrainToken.address,
    BrainToken.address,
    FeeDistributor.address
  );
  await deployer.deploy(
    BrainLootbox,
    BrainFarm.address,
    LockedLPFarm.address,
    BrainNFT.address
  );
};
