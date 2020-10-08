const BrainLootbox = artifacts.require("BrainLootbox");
const BrainNFT = artifacts.require("BrainNFT");
const truffleAssert = require("truffle-assertions");

contract("BrainLootbox", async (accounts) => {
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
});
