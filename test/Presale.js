const BrainToken = artifacts.require("BrainToken");
const BrainPresale = artifacts.require("BrainPresale");
const truffleAssert = require("truffle-assertions");

contract("BrainPresale", async (accounts) => {
  it("Should set owner to account[1]", async () => {
    const instance = await BrainPresale.deployed();
    const owner = await instance.owner.call();
    assert.equal(owner, accounts[0]);
  });

  it("Can read its token balance", async () => {
    const tokenInstance = await BrainToken.deployed();
    const instance = await BrainPresale.deployed();
    const initalBalance = (await instance.presaleStock.call()).toNumber();
    assert.equal(initalBalance, 0);
    await tokenInstance.transfer(
      instance.address,
      Math.floor(1000 * (10 ^ 18))
    );
    const newBalance = (await instance.presaleStock.call()).toString();
    assert.equal(newBalance, String(Math.floor(1000 * (10 ^ 18))));
  });
});
