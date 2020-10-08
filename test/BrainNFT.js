const BrainNFT = artifacts.require("BrainNFT");
const truffleAssert = require("truffle-assertions");

contract("BrainNFT", async (accounts) => {
  it("Returns correct Metadata", async () => {
    const instance = await BrainNFT.deployed();
    const contractMetadata = await instance.contractURI.call();
    const cardMetadata = await instance.tokenURI.call(5);
    assert.equal(
      contractMetadata,
      "https://www.nobrainer.finance/api/nft.json"
    );
    assert.equal(cardMetadata, "https://www.nobrainer.finance/api/NFT/5");
  });

  it("Sets minter", async () => {
    const instance = await BrainNFT.deployed();
    const minterRole = await instance.MINTER_ROLE.call();
    await instance.grantRole(minterRole, accounts[1]);
    const [acc1, acc2] = await Promise.all([
      instance.hasRole.call(minterRole, accounts[1]),
      instance.hasRole.call(minterRole, accounts[2]),
    ]);
    assert.equal(true, acc1);
    assert.equal(false, acc2);
  });

  it("Only minter can create token", async () => {
    const instance = await BrainNFT.deployed();
    await instance.addCard(1, { from: accounts[1] });
    await truffleAssert.reverts(instance.addCard(1, { from: accounts[2] }));
    await truffleAssert.reverts(instance.addCard(0, { from: accounts[1] }));
    const created = await instance.cards.call();
    assert.equal(1, created.toNumber());
  });

  it("Cannot mint more than max supply", async () => {
    const instance = await BrainNFT.deployed();
    await instance.addCard(5, { from: accounts[1] });
    const cardID = await instance.cards.call();
    await instance.mint(accounts[2], cardID.toNumber(), 3, {
      from: accounts[1],
    });
    await truffleAssert.reverts(
      instance.mint(accounts[2], cardID.toNumber(), 3, { from: accounts[1] })
    );
    await truffleAssert.reverts(
      instance.mint(accounts[2], cardID.toNumber(), 1, { from: accounts[2] })
    );
    await instance.mint(accounts[2], cardID.toNumber(), 2, {
      from: accounts[1],
    });
    await truffleAssert.reverts(
      instance.mint(accounts[2], cardID.toNumber(), 1, { from: accounts[1] })
    );
  });

  it("Burn functions correctly", async () => {
    const instance = await BrainNFT.deployed();
    let balance = await instance.balanceOf(accounts[2], 2);
    assert.equal(5, balance.toNumber());
    await instance.burn(2, 4, { from: accounts[2] });
    await truffleAssert.reverts(instance.burn(2, 4, { from: accounts[2] }));
    await truffleAssert.reverts(instance.burn(2, 1, { from: accounts[1] }));
    balance = await instance.balanceOf(accounts[2], 2);
    assert.equal(1, balance.toNumber());
  });
});
