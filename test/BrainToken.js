const BrainToken = artifacts.require("BrainToken");
const truffleAssert = require("truffle-assertions");

contract("BrainToken", async (accounts) => {
  it("Should set owner to account[1]", async () => {
    const instance = await BrainToken.deployed();
    const owner = await instance.owner.call();
    assert.equal(owner, accounts[0]);
  });

  it("ERC20: transfer correctly", async () => {
    const instance = await BrainToken.deployed();
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
    const instance = await BrainToken.deployed();
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

  it("Admin can set fee", async () => {
    const instance = await BrainToken.deployed();
    await instance.setTransferFee(1000, { from: accounts[0] });
    await instance.setTransferFeeRecipient(accounts[1], { from: accounts[0] });
    const fee = await instance.transferFee.call();
    assert.equal(fee.toNumber(), 1000);
  });

  it("ERC20: transfer correctly with fee", async () => {
    const instance = await BrainToken.deployed();
    const amount = 100;
    const feeRecipient = await instance.balanceOf.call(accounts[1]);
    const senderStartBalance = await instance.balanceOf.call(accounts[0]);
    const receiverStartBalance = await instance.balanceOf.call(accounts[2]);
    assert(senderStartBalance >= amount);
    await instance.transfer(accounts[2], amount, { from: accounts[0] });
    const senderEndBalance = await instance.balanceOf.call(accounts[0]);
    const receiverEndBalance = await instance.balanceOf.call(accounts[2]);
    const feeRecipientAfter = await instance.balanceOf.call(accounts[1]);
    assert.equal(
      senderStartBalance.toString(),
      senderEndBalance.add(new web3.utils.BN(amount)).toString()
    );
    assert.equal(
      receiverStartBalance.toNumber(),
      receiverEndBalance.toNumber() - amount * 0.9
    );
    assert.equal(
      feeRecipient.toNumber() + 0.1 * amount,
      feeRecipientAfter.toNumber()
    );
  });

  it("ERC20: transferFrom functions correctly", async () => {
    const instance = await BrainToken.deployed();
    const amount = 45;
    const feeRecipient = await instance.balanceOf.call(accounts[1]);
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
    const feeRecipientAfter = await instance.balanceOf.call(accounts[1]);
    assert.equal(
      senderStartBalance.toString(),
      senderEndBalance
        .add(new web3.utils.BN(amount + Math.floor(amount * 0.1)))
        .toString()
    );
    assert.equal(
      receiverStartBalance.toNumber(),
      receiverEndBalance.toNumber() - amount
    );
    assert.equal(
      feeRecipient.toNumber() + Math.floor(amount * 0.1),
      feeRecipientAfter.toNumber()
    );
    assert.equal(afterApproval.toNumber(), 0);
  });
});
