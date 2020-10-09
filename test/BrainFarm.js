const BrainLootbox = artifacts.require("BrainLootbox");
const BrainNFT = artifacts.require("BrainNFT");
const BrainToken = artifacts.require("BrainToken");
const BrainFarm = artifacts.require("BrainFarm");
const truffleAssert = require("truffle-assertions");

contract("BrainFarm", async (accounts) => {
  it("Only Admin can create lootbox", async () => {
    const instance = await BrainLootbox.deployed();
    await truffleAssert.reverts(
      instance.addLootBox(
        "IQ Box 1",
        new web3.utils.BN(100000000000000000n),
        [10, 10, 1],
        { from: accounts[2] }
      )
    );
  });

  it("Creates lootbox correctly", async () => {
    const nft = await BrainNFT.deployed();
    const instance = await BrainLootbox.deployed();
    const minterRole = await nft.MINTER_ROLE.call();
    await nft.grantRole(minterRole, BrainLootbox.address, {
      from: accounts[0],
    });
    const acc1 = await nft.hasRole.call(minterRole, BrainLootbox.address);
    assert.equal(true, acc1);
    const cardNumbers = await instance.addLootBox.call(
      "IQ Box 1",
      123,
      [10, 5],
      {
        from: accounts[0],
      }
    );
    await instance.addLootBox("IQ Box 1", 123, [10, 5], { from: accounts[0] });
    const totalCards = await nft.cards.call();
    assert.equal(cardNumbers.pop().toNumber(), totalCards.toNumber());
  });

  it("Can deposit $BRAIN", async () => {
    const token = await BrainToken.deployed();
    const farm = await BrainFarm.deployed();
    const [tokenBalanceA, farmBalanceA] = await Promise.all([
      token.balanceOf.call(accounts[0]),
      farm.balanceOf.call(accounts[0]),
    ]);
    await token.approve(
      farm.address,
      new web3.utils.BN("10000000000000000000"),
      {
        from: accounts[0],
      }
    );
    await truffleAssert.reverts(
      farm.stake(new web3.utils.BN("6000000000000000000"), {
        from: accounts[0],
      })
    );
    await farm.stake(new web3.utils.BN("5000000000000000000"), {
      from: accounts[0],
    });
    const [tokenBalanceB, farmBalanceB] = await Promise.all([
      token.balanceOf.call(accounts[0]),
      farm.balanceOf.call(accounts[0]),
    ]);
    assert.equal(
      tokenBalanceA.sub(farmBalanceB).toString(),
      tokenBalanceB.add(farmBalanceA).toString()
    );
  });

  it("Generates IQ", async () => {
    const farm = await BrainFarm.deployed();
    const earnedA = await farm.earned.call(accounts[0]);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await web3.currentProvider.send(
      { jsonrpc: "2.0", method: "evm_mine", params: [], id: 0 },
      () => {}
    );
    await web3.currentProvider.send(
      { jsonrpc: "2.0", method: "evm_mine", params: [], id: 0 },
      () => {}
    );
    await web3.currentProvider.send(
      { jsonrpc: "2.0", method: "evm_mine", params: [], id: 0 },
      () => {}
    );
    const earnedB = await farm.earned.call(accounts[0]);
    assert.isAbove(earnedB.toNumber(), earnedA.toNumber());
  });

  it("Can redeem card", async () => {
    const nft = await BrainNFT.deployed();
    const lootbox = await BrainLootbox.deployed();
    const farm = await BrainFarm.deployed();
    await farm.setLootboxAddress(lootbox.address, { from: accounts[0] });
    const boxA = await lootbox.lootbox.call(1);
    const startCards = boxA.totalCards.toNumber();
    await farm.redeem(1, { from: accounts[0] });
    const boxB = await lootbox.lootbox.call(1);
    const endCards = boxB.totalCards.toNumber();
    assert.equal(startCards, endCards + 1);
    await farm.redeem(1, { from: accounts[0] });
    await farm.redeem(1, { from: accounts[0] });
    await farm.redeem(1, { from: accounts[0] });
    await farm.redeem(1, { from: accounts[0] });
    await farm.redeem(1, { from: accounts[0] });
    await farm.redeem(1, { from: accounts[0] });
    await farm.redeem(1, { from: accounts[0] });
    await farm.redeem(1, { from: accounts[0] });
    await farm.redeem(1, { from: accounts[0] });
    await farm.redeem(1, { from: accounts[0] });
    await farm.redeem(1, { from: accounts[0] });
    await farm.redeem(1, { from: accounts[0] });
    await farm.redeem(1, { from: accounts[0] });
    await farm.redeem(1, { from: accounts[0] });
    await truffleAssert.reverts(farm.redeem(1, { from: accounts[0] }));
    const card1 = await nft.balanceOf(accounts[0], 1);
    const card2 = await nft.balanceOf(accounts[0], 2);
    assert.equal(card1.toNumber(), 10);
    assert.equal(card2.toNumber(), 5);
  });

  it("Can withdraw $BRAIN", async () => {
    const token = await BrainToken.deployed();
    const farm = await BrainFarm.deployed();
    const [tokenBalanceA, farmBalanceA] = await Promise.all([
      token.balanceOf.call(accounts[0]),
      farm.balanceOf.call(accounts[0]),
    ]);
    await farm.withdraw(farmBalanceA, {
      from: accounts[0],
    });
    const [tokenBalanceB, farmBalanceB] = await Promise.all([
      token.balanceOf.call(accounts[0]),
      farm.balanceOf.call(accounts[0]),
    ]);
    assert.equal(
      tokenBalanceA.add(farmBalanceB).toString(),
      tokenBalanceB.sub(farmBalanceA).toString()
    );
  });
});
