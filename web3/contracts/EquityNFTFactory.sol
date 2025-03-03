// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract EquityNFTFactory is ERC721, Ownable {
    using EnumerableSet for EnumerableSet.UintSet;
    
    uint256 private _nextTokenId;
    
    struct Startup {
        string name;
        string description;
        uint256 totalShares;
        uint256 availableShares;
        uint256 valuation;
        address founder;
        bool isValidated;
    }

    mapping(uint256 => Startup) public startups;
    mapping(address => bool) public validators;
    mapping(address => bool) public trustedIssuers;
    mapping(address => EnumerableSet.UintSet) private _founderStartups;
    
    event StartupRegistered(uint256 indexed tokenId, string name, address founder);
    event StartupValidated(uint256 indexed tokenId, bool status);
    event SharesIssued(uint256 indexed tokenId, address to, uint256 shares);
    event TrustedIssuerUpdated(address indexed issuer, bool status);

    constructor() ERC721("ZeedChain Equity", "ZEED") Ownable() {}

    function registerStartup(
        string memory name,
        string memory description,
        uint256 totalShares,
        uint256 initialValuation
    ) external returns (uint256) {
        _nextTokenId++;
        uint256 newTokenId = _nextTokenId;

        startups[newTokenId] = Startup({
            name: name,
            description: description,
            totalShares: totalShares,
            availableShares: totalShares,
            valuation: initialValuation,
            founder: msg.sender,
            isValidated: false
        });

        _mint(msg.sender, newTokenId);
        _founderStartups[msg.sender].add(newTokenId);
        
        emit StartupRegistered(newTokenId, name, msg.sender);
        return newTokenId;
    }

    function validateStartup(uint256 tokenId, bool status) external {
        require(validators[msg.sender], "Not authorized validator");
        startups[tokenId].isValidated = status;
        emit StartupValidated(tokenId, status);
    }

    function addValidator(address validator) external onlyOwner {
        validators[validator] = true;
    }

    function removeValidator(address validator) external onlyOwner {
        validators[validator] = false;
    }

    function addTrustedIssuer(address issuer) external onlyOwner {
        trustedIssuers[issuer] = true;
        emit TrustedIssuerUpdated(issuer, true);
    }

    function removeTrustedIssuer(address issuer) external onlyOwner {
        trustedIssuers[issuer] = false;
        emit TrustedIssuerUpdated(issuer, false);
    }

    function updateValuation(uint256 tokenId, uint256 newValuation) external {
        require(msg.sender == startups[tokenId].founder, "Only founder can update valuation");
        require(startups[tokenId].isValidated, "Startup not validated");
        startups[tokenId].valuation = newValuation;
    }

    function getStartupDetails(uint256 tokenId) external view returns (Startup memory) {
        return startups[tokenId];
    }

    function getFounderStartups(address founder) external view returns (uint256[] memory) {
        return _founderStartups[founder].values();
    }

    function issueShares(uint256 tokenId, address to, uint256 shares) external {
        require(msg.sender == startups[tokenId].founder || trustedIssuers[msg.sender], 
            "Only founder or trusted issuer can issue shares");
        require(shares <= startups[tokenId].availableShares, "Not enough available shares");
        
        startups[tokenId].availableShares -= shares;
        emit SharesIssued(tokenId, to, shares);
    }
}