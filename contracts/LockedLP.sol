// Brain/WETH Locked LP
// https://nobrainer.finance/
// SPDX-License-Identifier: MIT
pragma solidity 0.6.2;

import "./ERC20.sol";

interface LP {
  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract LockedLP is ERC20 {
  address public UniswapPair;
  
  constructor(address _lp) public ERC20("Nobrainer.Finance Locked Univ2 BRAIN/WETH LP", "LOCKED BRAINWETH") {
    UniswapPair = _lp;
  }

  function lockLP(uint256 _amount) public {
    LP(UniswapPair).transferFrom(msg.sender, address(this), _amount);
    _mint(msg.sender, _amount);
  }

  function burn(uint256 _amount) public {
    _burn(msg.sender, _amount);
  }

}
