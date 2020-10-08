// Brain/WETH Locked LP
// https://nobrainer.finance/
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

interface IBrainNFT {
  function addCard(uint256 maxSupply) external returns (uint256);
  function mint(address to, uint256 id, uint256 amount) external;
}

contract BrainLootbox is Ownable {
  using SafeMath for uint256;
  address public NFTAddress;
  mapping(address => bool) public isFarmAddress;

  constructor(address _brainFarm, address _lockedLPFarm, address _NFTAddress) public {
    isFarmAddress[_brainFarm] = true;
    isFarmAddress[_lockedLPFarm] = true;
    NFTAddress = _NFTAddress;
  }

  event AddLootBox(uint256 id);
  event CardRedeemed(address user, uint256 id, uint256 card);

  uint256 private createdLootboxes;
  mapping(uint256 => LootBox) public lootbox;

  function getPrice(uint256 _id) public view returns (uint256) {
    return lootbox[_id].price;
  }

  struct LootBox {
    uint256 seed;
    string name;
    uint256 price;
    uint256[] cardIds;
    uint256[] cardAmounts;
    uint256 totalCards;
  }

  function addLootBox(string memory _name, uint256 _price, uint256[] memory _cardAmounts) public onlyOwner returns (uint256[] memory) {
    require(_price > 0, "Price must be greater than 0");
    createdLootboxes = createdLootboxes.add(1);
    lootbox[createdLootboxes].name = _name;
    lootbox[createdLootboxes].price = _price;
    lootbox[createdLootboxes].cardAmounts = _cardAmounts;
    uint256 total;
    for (uint256 i = 0; i < _cardAmounts.length; i++) {
      total = total.add(_cardAmounts[i]);
      lootbox[createdLootboxes].cardIds.push(IBrainNFT(NFTAddress).addCard(_cardAmounts[i]));
    }
    lootbox[createdLootboxes].totalCards = total;
    lootbox[createdLootboxes].seed = uint256(keccak256(abi.encodePacked(now, _price, _name, block.difficulty)));
    emit AddLootBox(createdLootboxes);
    return lootbox[createdLootboxes].cardIds;
  }

  function remainingCards(uint256 _id) public view returns (uint256) {
    return lootbox[_id].totalCards;
  }

  function redeem(uint256 id, address to) public {
    require(isFarmAddress[msg.sender] == true, "Only NFT Farm can call this method");
    require(id != 0 && id <= createdLootboxes, "Lootbox does not exist");
    require(lootbox[id].totalCards > 0, "No cards left in lootbox");
    uint256 rand = uint256(keccak256(abi.encodePacked(now, lootbox[id].totalCards, lootbox[id].seed, block.difficulty)));
    lootbox[id].seed = rand;
    uint256 pickedCard = rand.mod(lootbox[id].totalCards);
    uint256 counted;
    uint256[] memory _cardAmounts = lootbox[id].cardAmounts;
    for (uint256 i = 0; i < lootbox[id].cardIds.length; i++) {
      counted = counted.add(_cardAmounts[i]);
      if (pickedCard < counted) {
        IBrainNFT(NFTAddress).mint(to, lootbox[id].cardIds[i], 1);
        lootbox[id].cardAmounts[i] = lootbox[id].cardAmounts[i].sub(1);
        lootbox[id].totalCards = lootbox[id].totalCards.sub(1);
        emit CardRedeemed(to, id, lootbox[id].cardIds[i]);
        break;
      }
    }
  }
}
