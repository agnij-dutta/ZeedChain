// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AIAdvisorIntegration is Ownable {
    bytes32 private jobId;
    uint256 private fee;
    address private oracle;
    uint256 private constant PAYMENT = 0.1 * 10**18; // 0.1 LINK

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
    event RequestFailed(bytes32 indexed requestId, bytes reason);

    constructor(address _oracle) Ownable() {
        oracle = _oracle;
        jobId = bytes32("ca98366cc7314957b8c012c72f05aeeb");
        fee = PAYMENT;
    }

    function requestAIAdvice(uint256 startupId) external {
        // Will be implemented with actual oracle service
        bytes32 requestId = keccak256(abi.encodePacked(startupId, block.timestamp));
        requestToStartupId[requestId] = startupId;
        emit AdviceRequested(requestId, startupId);
        
        // For testing purposes, directly call fulfill
        mockFulfillAIAdvice(requestId);
    }

    // Temporary mock function for testing
    function mockFulfillAIAdvice(bytes32 requestId) internal {
        uint256 startupId = requestToStartupId[requestId];
        string memory mockRecommendation = "AI recommends proceeding with investment based on strong market potential";
        
        AIAdvice memory newAdvice = AIAdvice({
            startupId: startupId,
            confidenceScore: 85,
            recommendation: mockRecommendation,
            timestamp: block.timestamp
        });
        
        startupAdvice[startupId].push(newAdvice);
        emit AdviceReceived(startupId, mockRecommendation, 85);
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

    function updateOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
    }

    function updateJobId(bytes32 _jobId) external onlyOwner {
        jobId = _jobId;
    }

    function updateFee(uint256 _fee) external onlyOwner {
        fee = _fee;
    }
}