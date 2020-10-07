const BrainToken = artifacts.require("BrainToken");
const FeeDistributor = artifacts.require("FeeDistributor");

contract("FeeDistributor", async (accounts) => {
  it("Pending Dividend should be 0", async () => {
    const instance = await FeeDistributor.deployed();
    const pending = await instance.pendingFarmAmount.call();
    assert.equal(pending.toNumber(), 0);
  });

  it("Pending dividend should update after transfer", async () => {
    const tokenInstance = await BrainToken.deployed();
    const instance = await FeeDistributor.deployed();
    await tokenInstance.transfer(instance.address, 1000000);
    const pending = await instance.pendingFarmAmount.call();
    assert.equal(pending.toNumber(), 750000);
  });

  it("Pending dividend should be 0 after sucessful transfer", async () => {
    const tokenInstance = await BrainToken.deployed();
    const instance = await FeeDistributor.deployed();
    await instance.processTransfer({ from: accounts[0] });
    const farmBalance = await tokenInstance.balanceOf.call(
      "0x0000000000000000000000000000000000000002"
    );
    assert.equal(farmBalance.toNumber(), 750000);
    const pending = await instance.pendingFarmAmount.call();
    assert.equal(pending.toNumber(), 0);
  });
});
