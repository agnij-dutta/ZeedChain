// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/AggregateV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./EquityNFTFactory.sol";

contract DynamicValuation is Ownable {
    EquityNFTFactory public immutable equityFactory;
    mapping(uint256 => AggregateV3Interface) public startupPriceFeeds;
    mapping(uint256 => uint256) public lastUpdateTimestamp;
    uint256 public constant UPDATE_INTERVAL = 1 days;
    
    event ValuationUpdated(uint256 indexed startupId, uint256 newValuation);
    event PriceFeedSet(uint256 indexed startupId, address feedAddress);

    constructor(address _equityFactory) Ownable() {
        equityFactory = EquityNFTFactory(_equityFactory);
    }

    function setPriceFeed(uint256 startupId, address priceFeed) external onlyOwner {
        startupPriceFeeds[startupId] = AggregateV3Interface(priceFeed);
        emit PriceFeedSet(startupId, priceFeed);
    }

    function updateValuation(uint256 startupId) external {
        require(address(startupPriceFeeds[startupId]) != address(0), "Price feed not set");
        require(block.timestamp >= lastUpdateTimestamp[startupId] + UPDATE_INTERVAL, "Too soon to update");

        (, int256 price,,,) = startupPriceFeeds[startupId].latestRoundData();
        require(price > 0, "Invalid price");

        uint256 newValuation = uint256(price);
        equityFactory.updateValuation(startupId, newValuation);
        lastUpdateTimestamp[startupId] = block.timestamp;

        emit ValuationUpdated(startupId, newValuation);
    }

    function getLatestValuation(uint256 startupId) external view returns (uint256) {
        require(address(startupPriceFeeds[startupId]) != address(0), "Price feed not set");
        (, int256 price,,,) = startupPriceFeeds[startupId].latestRoundData();
        return uint256(price);
    }
}