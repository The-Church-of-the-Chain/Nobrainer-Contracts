// Brain ERC1155 NFT
// https://nobrainer.finance/
// SPDX-License-Identifier: MIT
pragma solidity 0.6.2;

import "./ERC1155.sol";
import "./AccessControl.sol";

contract BrainNFT is ERC1155, AccessControl {
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");


  constructor() public ERC1155("https://www.nobrainer.finance/api/NFT/") {
    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
  }

  uint256 public cards;
  mapping(uint256 => uint256) public totalSupply;
  mapping(uint256 => uint256) public circulatingSupply;

  event CardAdded(uint256 id, uint256 maxSupply);

  function addCard(uint256 maxSupply) public returns (uint256) {
    require(hasRole(MINTER_ROLE, _msgSender()), "Caller is not a minter");
    require(maxSupply > 0, "Maximum supply can not be 0");
    cards = cards.add(1);
    totalSupply[cards] = maxSupply;
    emit CardAdded(cards, maxSupply);
    return cards;
  }

  function mint(address to, uint256 id, uint256 amount) public {
    require(hasRole(MINTER_ROLE, _msgSender()), "Caller is not a minter");
    require(circulatingSupply[id].add(amount) <= totalSupply[id], "Total supply reached.");
    circulatingSupply[id] = circulatingSupply[id].add(amount);
    _mint(to, id, amount, "");
  }
    
  function burn(uint256 id, uint256 amount) public {
    _burn(_msgSender(), id, amount);
  }

}
