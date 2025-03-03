// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregateV3Interface.sol";
import "./EquityNFTFactory.sol";

contract AIAdvisorIntegration is ChainlinkClient, Ownable {
    using Chainlink for Chainlink.Request;

    bytes32 private jobId;
    uint256 private fee;
    address private oracle;
    
    struct AIAdvice {
        uint256 startupId;
        uint256 confidenceScore;
        string recommendation;
        uint256 timestamp;
    }

    mapping(uint256 => AIAdvice[]) public startupAdvice;
    mapping(bytes32 => uint256) private requestToStartupId;
    
    event AdviceRequested(bytes32 indexed requestId, uint256 indexed startupId);
    event AdviceReceived(uint256 indexed startupId, string recommendation, uint256 confidenceScore);

    constructor(address _linkToken, address _oracle) Ownable() {
        setChainlinkToken(_linkToken);
        oracle = _oracle;
        jobId = "ca98366cc7314957b8c012c72f05aeeb"; // Example Chainlink JobID
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0.1 LINK
    }

    function requestAIAdvice(uint256 startupId) external {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfillAIAdvice.selector);
        
        // Add the startup ID to the request
        req.add("startupId", uint256ToString(startupId));
        
        // Send the request
        bytes32 requestId = sendChainlinkRequest(req, fee);
        requestToStartupId[requestId] = startupId;
        
        emit AdviceRequested(requestId, startupId);
    }

    function fulfillAIAdvice(
        bytes32 requestId,
        uint256 confidenceScore,
        string memory recommendation
    ) external recordChainlinkFulfillment(requestId) {
        uint256 startupId = requestToStartupId[requestId];
        
        AIAdvice memory newAdvice = AIAdvice({
            startupId: startupId,
            confidenceScore: confidenceScore,
            recommendation: recommendation,
            timestamp: block.timestamp
        });
        
        startupAdvice[startupId].push(newAdvice);
        
        emit AdviceReceived(startupId, recommendation, confidenceScore);
    }

    function getLatestAdvice(uint256 startupId) external view returns (
        string memory recommendation,
        uint256 confidenceScore,
        uint256 timestamp
    ) {
        require(startupAdvice[startupId].length > 0, "No advice available");
        AIAdvice memory latest = startupAdvice[startupId][startupAdvice[startupId].length - 1];
        return (latest.recommendation, latest.confidenceScore, latest.timestamp);
    }

    function getAllAdvice(uint256 startupId) external view returns (AIAdvice[] memory) {
        return startupAdvice[startupId];
    }

    function updateJobId(bytes32 _jobId) external onlyOwner {
        jobId = _jobId;
    }

    function updateOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
    }

    function updateFee(uint256 _fee) external onlyOwner {
        fee = _fee;
    }

    // Helper function to convert uint to string
    function uint256ToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // Allow contract to receive LINK tokens
    receive() external payable {}
}