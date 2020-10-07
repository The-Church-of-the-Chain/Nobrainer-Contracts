pragma solidity ^0.6.2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface BrainLootbox {
  function getPrice(uint256 _id) external view returns (uint256);
  function redeem(uint256 id) external returns (uint256);
}

contract BrainFarm is Ownable {
  using SafeMath for uint256;

  address public BrainAddress = 0xEA3cB156745a8d281A5fC174186C976F2dD04c2E;
  address public LootboxAddress;

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

  function earned(address account) public view returns (uint256) {
    uint256 blockTime = block.timestamp;
    return points[account].add(blockTime.sub(lastUpdateTime[account]).mul(1e18).div(86400).mul(balanceOf(account).div(1e18)));
  }

  function stake(uint256 amount) public updateReward(msg.sender) {
    require(amount.add(balanceOf(msg.sender)) <= 5000000000000000000, "Cannot stake more than 5 BRAIN");
    IERC20(BrainAddress).transferFrom(msg.sender, address(this), amount);
    brainBalance[msg.sender] = brainBalance[msg.sender].add(amount);
    emit Staked(msg.sender, amount);
  }

  function withdraw(uint256 amount) public updateReward(msg.sender) {
    require(amount > 0, "Cannot withdraw 0");
    require(amount <= balanceOf(msg.sender), "Cannot withdraw more than balance");
    IERC20(BrainAddress).transfer(msg.sender, amount);
    brainBalance[msg.sender] = brainBalance[msg.sender].sub(amount);
    emit Withdrawn(msg.sender, amount);
  }

  function exit() external {
    withdraw(balanceOf(msg.sender));
  }
    
  function redeem(uint256 _lootbox) public updateReward(msg.sender) {
    uint256 price = BrainLootbox(LootboxAddress).getPrice(_lootbox);
    require(price > 0, "Loot not found");
    require(points[msg.sender] >= price, "Not enough points to redeem");
    BrainLootbox(LootboxAddress).redeem(_lootbox);
    points[msg.sender] = points[msg.sender].sub(price);
  }
}
