const BrainLootbox = artifacts.require("BrainLootbox");
const BrainNFT = artifacts.require("BrainNFT");
const LockedLP = artifacts.require("LockedLP");
const LockedLPFarm = artifacts.require("LockedLPFarm");
const BrainToken = artifacts.require("BrainToken");
const FeeDistributor = artifacts.require("FeeDistributor");
const truffleAssert = require("truffle-assertions");

contract("LockedLPFarm", async (accounts) => {
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

  it("Can deposit $LockedLP", async () => {
    const normalLP = await BrainToken.deployed();
    const token = await LockedLP.deployed();
    await normalLP.approve(
      token.address,
      new web3.utils.BN("100000000000000000000"),
      {
        from: accounts[0],
      }
    );
    await token.lockLP(new web3.utils.BN("100000000000000000000"), {
      from: accounts[0],
    });
    const farm = await LockedLPFarm.deployed();
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
      farm.stake(new web3.utils.BN("200000000000001"), {
        from: accounts[0],
      })
    );
    await farm.stake(new web3.utils.BN("200000000000000"), {
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
    const farm = await LockedLPFarm.deployed();
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
    const farm = await LockedLPFarm.deployed();
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

  it("Dividends add up", async () => {
    const token = await LockedLP.deployed();
    const brain = await BrainToken.deployed();
    const farm = await LockedLPFarm.deployed();
    const distrubutor = await FeeDistributor.deployed();
    await farm.setDistributorAddress(distrubutor.address, {
      from: accounts[0],
    });

    // Give accounts[1] $LockedLP... using $BRAIN as placeholder for $LP
    await brain.transfer(
      distrubutor.address,
      new web3.utils.BN("50000000000000"),
      { from: accounts[0] }
    );
    await token.transfer(accounts[1], new web3.utils.BN("50000000000000"), {
      from: accounts[0],
    });
    await token.approve(
      farm.address,
      new web3.utils.BN("10000000000000000000"),
      {
        from: accounts[1],
      }
    );

    assert.equal(200000000000000, (await farm.totalStaked.call()).toNumber());
    assert.equal(
      0,
      (await farm.magnifiedDividendCorrections.call(accounts[0])).toNumber()
    );

    const pendingToFarm = await distrubutor.pendingFarmAmount.call();
    await farm.stake(new web3.utils.BN("50000000000000"), {
      from: accounts[1],
    });
    const pendingToFarmAfter = await distrubutor.pendingFarmAmount.call();
    assert.equal(pendingToFarm.toString(), "37500000000000");
    assert.equal(pendingToFarmAfter.toString(), "0");

    const dividend0A = await farm.withdrawableDividendOf.call(accounts[0]);
    const dividend1A = await farm.withdrawableDividendOf.call(accounts[1]);
    assert.equal("37500000000000", dividend0A.toString());
    assert.equal(0, dividend1A.toNumber());

    const pendingA = await farm.PendingWithdrawableDividendOf(accounts[0]);
    await brain.transfer(
      distrubutor.address,
      new web3.utils.BN("50000000000000"),
      { from: accounts[0] }
    );
    const pendingB = await farm.PendingWithdrawableDividendOf(accounts[0]);

    const balanceBeforeWithdraw = (
      await brain.balanceOf.call(accounts[0])
    ).toString();
    await farm.withdrawDividend({ from: accounts[0] });
    const balanceAfterWithdraw = (
      await brain.balanceOf.call(accounts[0])
    ).toString();
    const pendingC = await farm.PendingWithdrawableDividendOf(accounts[0]);

    assert.equal(pendingA.toString(), "37500000000000");
    assert.equal(pendingB.toString(), "67499999999999");
    assert.equal(pendingC.toString(), "0");

    assert.equal(
      new web3.utils.BN(balanceBeforeWithdraw)
        .add(new web3.utils.BN("67499999999999"))
        .toString(),
      balanceAfterWithdraw
    );
    const dividend0B = await farm.withdrawableDividendOf.call(accounts[0]);
    const dividend1B = await farm.withdrawableDividendOf.call(accounts[1]);
    assert.equal(
      (await farm.PendingWithdrawableDividendOf(accounts[1])).toString(),
      dividend1B.toString()
    );
    assert.equal(0, dividend0B.toString());
    assert.equal("7499999999999", dividend1B.toString());
  });

  it("Can withdraw $LockedLP", async () => {
    const token = await LockedLP.deployed();
    const farm = await LockedLPFarm.deployed();
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
