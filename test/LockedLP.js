const LockedLP = artifacts.require("LockedLP");
const BrainToken = artifacts.require("BrainToken");
const truffleAssert = require("truffle-assertions");

contract("LockedLP", async (accounts) => {
  it("Should Mint from transfer", async () => {
    const instance = await LockedLP.deployed();
    const normalLP = await BrainToken.deployed();
    const StartBalance = await instance.balanceOf.call(accounts[0]);
    await normalLP.approve(instance.address, 50000000000000, {
      from: accounts[0],
    });
    await instance.lockLP(50000000000000, { from: accounts[0] });
    const EndBalance = await instance.balanceOf.call(accounts[0]);
    assert.equal(0, StartBalance.toNumber());
    assert.equal(50000000000000, EndBalance.toNumber());
  });

  it("ERC20: transfer correctly", async () => {
    const instance = await LockedLP.deployed();
    const amount = 60;
    const senderStartBalance = await instance.balanceOf.call(accounts[0]);
    const receiverStartBalance = await instance.balanceOf.call(accounts[2]);
    assert(senderStartBalance >= amount);
    await instance.transfer(accounts[2], amount, { from: accounts[0] });
    const senderEndBalance = await instance.balanceOf.call(accounts[0]);
    const receiverEndBalance = await instance.balanceOf.call(accounts[2]);
    assert.equal(
      senderStartBalance.toString(),
      senderEndBalance.add(new web3.utils.BN(amount)).toString()
    );
    assert.equal(
      receiverStartBalance.toNumber(),
      receiverEndBalance.toNumber() - amount
    );
  });

  it("ERC20: transferFrom functions correctly", async () => {
    const instance = await LockedLP.deployed();
    const amount = 45;
    await instance.approve(accounts[2], amount, { from: accounts[0] });
    const senderStartBalance = await instance.balanceOf.call(accounts[0]);
    const receiverStartBalance = await instance.balanceOf.call(accounts[2]);
    assert(senderStartBalance >= amount);
    await instance.transferFrom(accounts[0], accounts[2], amount, {
      from: accounts[2],
    });
    const senderEndBalance = await instance.balanceOf.call(accounts[0]);
    const receiverEndBalance = await instance.balanceOf.call(accounts[2]);
    const afterApproval = await instance.allowance(accounts[1], accounts[2]);
    assert.equal(
      senderStartBalance.toString(),
      senderEndBalance.add(new web3.utils.BN(amount)).toString()
    );
    assert.equal(
      receiverStartBalance.toNumber(),
      receiverEndBalance.toNumber() - amount
    );
    assert.equal(afterApproval.toNumber(), 0);
  });

  it("ERC20: burn correctly", async () => {
    const instance = await LockedLP.deployed();
    const amount = 60;
    const senderStartBalance = await instance.balanceOf.call(accounts[0]);
    assert(senderStartBalance >= amount);
    await instance.burn(amount, { from: accounts[0] });
    const senderEndBalance = await instance.balanceOf.call(accounts[0]);
    assert.equal(
      senderStartBalance.toString(),
      senderEndBalance.add(new web3.utils.BN(amount)).toString()
    );
  });
});
