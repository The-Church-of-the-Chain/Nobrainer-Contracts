pragma solidity 0.6.2;

interface IBrainLootbox {
  function getPrice(uint256 _id) external view returns (uint256);
  function redeem(uint256 id, address to) external;
}
