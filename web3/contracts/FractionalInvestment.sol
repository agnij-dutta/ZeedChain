// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./EquityNFTFactory.sol";

contract FractionalInvestment is ERC1155, Ownable, ReentrancyGuard {
    using EnumerableMap for EnumerableMap.UintToUintMap;
    
    EquityNFTFactory public immutable equityFactory;
    
    struct Investment {
        uint256 startupId;
        uint256 shares;
        uint256 investmentAmount;
        uint256 timestamp;
    }
    
    // Mapping from startupId to total investment amount
    mapping(uint256 => uint256) public totalInvestment;
    // Mapping from startupId to investor address to investments
    mapping(uint256 => mapping(address => Investment[])) public investments;
    // Track share prices for each startup
    mapping(uint256 => EnumerableMap.UintToUintMap) private _sharePrices;
    
    event InvestmentMade(
        uint256 indexed startupId,
        address indexed investor,
        uint256 shares,
        uint256 amount
    );
    
    event ProfitDistributed(
        uint256 indexed startupId,
        uint256 amount,
        uint256 timestamp
    );

    constructor(address _equityFactory) ERC1155("") Ownable() {
        equityFactory = EquityNFTFactory(_equityFactory);
    }

    function invest(uint256 startupId) external payable nonReentrant {
        EquityNFTFactory.Startup memory startup = equityFactory.getStartupDetails(startupId);
        require(startup.isValidated, "Startup not validated");
        require(startup.availableShares > 0, "No shares available");
        
        uint256 sharePrice = startup.valuation / startup.totalShares;
        uint256 sharesToBuy = msg.value / sharePrice;
        require(sharesToBuy > 0, "Investment too small");
        require(sharesToBuy <= startup.availableShares, "Not enough shares available");

        investments[startupId][msg.sender].push(Investment({
            startupId: startupId,
            shares: sharesToBuy,
            investmentAmount: msg.value,
            timestamp: block.timestamp
        }));

        totalInvestment[startupId] += msg.value;
        
        _mint(msg.sender, startupId, sharesToBuy, "");
        equityFactory.issueShares(startupId, msg.sender, sharesToBuy);
        
        // Store current share price
        _sharePrices[startupId].set(block.timestamp, sharePrice);
        
        emit InvestmentMade(startupId, msg.sender, sharesToBuy, msg.value);
    }

    function getTotalInvestment(uint256 startupId) external view returns (uint256) {
        return totalInvestment[startupId];
    }

    function getInvestorShares(uint256 startupId, address investor) external view returns (uint256) {
        return balanceOf(investor, startupId);
    }

    function getInvestmentHistory(uint256 startupId, address investor) external view returns (Investment[] memory) {
        return investments[startupId][investor];
    }

    function distributeProfit(uint256 startupId) external payable nonReentrant {
        EquityNFTFactory.Startup memory startup = equityFactory.getStartupDetails(startupId);
        require(msg.sender == startup.founder, "Only founder can distribute profits");
        require(msg.value > 0, "No profit to distribute");

        // Record profit distribution
        emit ProfitDistributed(startupId, msg.value, block.timestamp);
    }

    function withdrawInvestment(uint256 startupId, uint256 shares) external nonReentrant {
        require(shares > 0 && shares <= balanceOf(msg.sender, startupId), "Invalid share amount");
        
        EquityNFTFactory.Startup memory startup = equityFactory.getStartupDetails(startupId);
        uint256 currentSharePrice = startup.valuation / startup.totalShares;
        uint256 withdrawAmount = shares * currentSharePrice;

        _burn(msg.sender, startupId, shares);
        
        (bool success, ) = payable(msg.sender).call{value: withdrawAmount}("");
        require(success, "Transfer failed");
    }

    function uri(uint256 startupId) public view virtual override returns (string memory) {
        EquityNFTFactory.Startup memory startup = equityFactory.getStartupDetails(startupId);
        // In production, return IPFS/Arweave URI with startup metadata
        return string(abi.encodePacked("ipfs://", startup.name));
    }
}