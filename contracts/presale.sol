// Brain ERC20 Token Presale Contract
// https://nobrainer.finance/
// SPDX-License-Identifier: MIT
pragma solidity 0.6.2;

import "./SafeMath.sol";
import "./Ownable.sol";


interface BRAIN {
  function balanceOf(address account) external view returns (uint256);
  function transfer(address recipient, uint256 amount) external returns (bool);
}

contract BrainPresale is Ownable {
  using SafeMath for uint256;
  uint256 public tokenPrice;
  address public tokenAddress;

  constructor(uint256 _tokenPrice, address _tokenAddress) public {
    tokenPrice = _tokenPrice;
    tokenAddress = _tokenAddress;
  }

  function setTokenPrice(uint256 _tokenPrice) public onlyOwner {
    tokenPrice = _tokenPrice;
  }

  function withdraw(address payable to) public onlyOwner {
    if (presaleStock() > 0) {
      BRAIN(tokenAddress).transfer(address(to), presaleStock());
    }
    if (address(this).balance > 0) {
      to.transfer(address(this).balance);
    }
  }

  function presaleStock() public view returns (uint256) {
    return BRAIN(tokenAddress).balanceOf(address(this));
  }

  function buy() public payable {
    uint256 receiveAmount = tokenPrice.mul(msg.value);
    require(presaleStock() >= receiveAmount, "Not enough tokens available");
    BRAIN(tokenAddress).transfer(msg.sender, receiveAmount);
  }
}
