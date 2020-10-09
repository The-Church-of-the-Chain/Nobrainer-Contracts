// Brain ERC20 Token
// https://nobrainer.finance/
// SPDX-License-Identifier: MIT
pragma solidity 0.6.2;

import "./Ownable.sol";
import "./ERC20.sol";

contract BrainToken is ERC20, Ownable {
  constructor() public ERC20("Nobrainer.Finance", "BRAIN") { // Symbol and Name
    // Mint 30,0000 BRAIN (18 Decimals)
    _mint(_msgSender(), 30000000000000000000000);
  }

  // Transfer Fee
  event TransferFeeChanged(uint256 newFee);
  event FeeRecipientChange(address account);
  event AddFeeException(address account);
  event RemoveFeeException(address account);

  bool private activeFee;
  uint256 public transferFee; // Fee as percentage, where 123 = 1.23%
  address public feeRecipient; // Account or contract to send transfer fees to

  // Exception to transfer fees, for example for Uniswap contracts.
  mapping (address => bool) public feeException;

  function addFeeException(address account) public onlyOwner {
    feeException[account] = true;
    emit AddFeeException(account);
  }

  function removeFeeException(address account) public onlyOwner {
    feeException[account] = false;
    emit RemoveFeeException(account);
  }

  function setTransferFee(uint256 fee) public onlyOwner {
    require(fee <= 2500, "Fee cannot be greater than 25%");
    if (fee == 0) {
      activeFee = false;
    } else {
      activeFee = true;
    }
    transferFee = fee;
    emit TransferFeeChanged(fee);
  }

  function setTransferFeeRecipient(address account) public onlyOwner {
    feeRecipient = account;
    emit FeeRecipientChange(account);
  }

  // Transfer recipient recives amount - fee
  function transfer(address recipient, uint256 amount) public override returns (bool) {
    if (activeFee && feeException[_msgSender()] == false) {
      uint256 fee = transferFee.mul(amount).div(10000);
      uint amountLessFee = amount.sub(fee);
      _transfer(_msgSender(), recipient, amountLessFee);
      _transfer(_msgSender(), feeRecipient, fee);
    } else {
      _transfer(_msgSender(), recipient, amount);
    }
    return true;
  }

  // TransferFrom recipient recives amount, sender's account is debited amount + fee
  function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
    if (activeFee && feeException[recipient] == false) {
      uint256 fee = transferFee.mul(amount).div(10000);
      _transfer(sender, feeRecipient, fee);
    }
    _transfer(sender, recipient, amount);
    _approve(sender, _msgSender(), _allowances[sender][_msgSender()].sub(amount, "ERC20: transfer amount exceeds allowance"));
    return true;
  }

}
