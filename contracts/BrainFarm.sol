pragma solidity 0.6.2;

import "./SafeMath.sol";
import "./Ownable.sol";
import "./IERC20.sol";
import "./IBrainLootbox.sol";
import "./ReentrancyGuard.sol";

contract BrainFarm is Ownable, ReentrancyGuard {
  using SafeMath for uint256;

  constructor(address _brain) public {
    BrainAddress = _brain;
  }

  address public BrainAddress;
  address public LootboxAddress;

  function setLootboxAddress(address _address) public onlyOwner {
    LootboxAddress = _address;
  }

  mapping(address => uint256) private brainBalance;
  mapping(address => uint256) public lastUpdateTime;
  mapping(address => uint256) public points;

  event Staked(address indexed user, uint256 amount);
  event Withdrawn(address indexed user, uint256 amount);

  modifier updateReward(address account) {
    if (account != address(0)) {
      points[account] = earned(account);
      lastUpdateTime[account] = block.timestamp;
    }
    _;
  }

  function balanceOf(address account) public view returns (uint256) {
    return brainBalance[account];
  }

  /*
  The block.timestamp environment variable is used to determine a control flow decision. 
  Note that the values of variables like coinbase, gaslimit, block number and timestamp are predictable and can be manipulated by a malicious miner. 
  Also keep in mind that attackers know hashes of earlier blocks. 
  Don't use any of those environment variables as sources of randomness and be aware that use of these variables introduces a certain level of trust into miners.
  https://swcregistry.io/docs/SWC-116
  
  AUDITOR NOTE: It appers that intent of this function is to add incremental rewards over time.
    Thus this vulnerability is not relly applicable to this function.
  */
  function earned(address account) public view returns (uint256) {
    uint256 blockTime = block.timestamp;
    return points[account].add(blockTime.sub(lastUpdateTime[account]).mul(1e18).div(86400).mul(balanceOf(account).div(1e18)));
  }

  /*
  An external message call to an address specified by the caller is executed.
  Note that the callee account might contain arbitrary code and could re-enter any function within this contract. 
  Reentering the contract in an intermediate state may lead to unexpected behaviour. 
  Make sure that no state modifications are executed after this call and/or reentrancy guards are in place.
  https://swcregistry.io/docs/SWC-107
  
  AUDITOR NOTE: Fix implmented, and vulnerable code commented out.
  */
  function stake(uint256 amount) public updateReward(_msgSender()) nonReentrant {
    require(amount.add(balanceOf(_msgSender())) <= 5000000000000000000, "Cannot stake more than 5 BRAIN");
    //IERC20(BrainAddress).transferFrom(_msgSender(), address(this), amount);
    brainBalance[_msgSender()] = brainBalance[_msgSender()].add(amount);
    IERC20(BrainAddress).transferFrom(_msgSender(), address(this), amount);
    emit Staked(_msgSender(), amount);
  }

  function withdraw(uint256 amount) public updateReward(_msgSender()) nonReentrant {
    require(amount > 0, "Cannot withdraw 0");
    require(amount <= balanceOf(_msgSender()), "Cannot withdraw more than balance");
    IERC20(BrainAddress).transfer(_msgSender(), amount);
    brainBalance[_msgSender()] = brainBalance[_msgSender()].sub(amount);
    emit Withdrawn(_msgSender(), amount);
  }

  function exit() external {
    withdraw(balanceOf(_msgSender()));
  }
    
  function redeem(uint256 _lootbox) public updateReward(_msgSender()) nonReentrant {
    uint256 price = IBrainLootbox(LootboxAddress).getPrice(_lootbox);
    require(price > 0, "Loot not found");
    require(points[_msgSender()] >= price, "Not enough points to redeem");
    IBrainLootbox(LootboxAddress).redeem(_lootbox, _msgSender());
    points[_msgSender()] = points[_msgSender()].sub(price);
  }
}
