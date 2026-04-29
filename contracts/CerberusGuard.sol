// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title CerberusGuard
/// @notice Meta-protection layer — Cerberus watching Cerberus
/// @dev "Who watches the watchmen? Cerberus does."
contract CerberusGuard {
    address public owner;
    address public cerberusVault;
    bool public paused;
    uint256 public threatCount;
    uint256 public lastCheckBlock;

    struct ThreatRecord {
        uint256 blockNumber;
        address reporter;
        string threatType;
        bool resolved;
    }

    mapping(uint256 => ThreatRecord) public threats;

    event MetaThreatDetected(address indexed reporter, string threatType, uint256 indexed threatId);
    event CerberusCompromised(address indexed by, string reason);
    event MetaPause(address indexed triggeredBy, string reason);
    event SystemHealthCheck(uint256 blockNumber, bool healthy);
    event SuspiciousActivity(address indexed actor, string reason);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _cerberusVault) {
        owner = msg.sender;
        cerberusVault = _cerberusVault;
        lastCheckBlock = block.number;
    }

    /// @notice Report a threat against Cerberus itself
    function reportMetaThreat(string calldata threatType) external {
        threatCount++;
        threats[threatCount] = ThreatRecord({
            blockNumber: block.number,
            reporter: msg.sender,
            threatType: threatType,
            resolved: false
        });
        emit MetaThreatDetected(msg.sender, threatType, threatCount);
        emit SuspiciousActivity(msg.sender, threatType);
    }

    /// @notice Called when Cerberus itself is compromised
    function reportCompromised(string calldata reason) external {
        paused = true;
        emit CerberusCompromised(msg.sender, reason);
        emit MetaPause(msg.sender, reason);
    }

    /// @notice Emergency pause of meta-guard
    function emergencyPause(string calldata reason) external {
        paused = true;
        emit MetaPause(msg.sender, reason);
    }

    /// @notice System health check — emit event for monitoring
    function healthCheck() external {
        lastCheckBlock = block.number;
        emit SystemHealthCheck(block.number, !paused);
    }

    /// @notice Trigger alert for demo
    function triggerAlert(string calldata reason) external {
        emit SuspiciousActivity(msg.sender, reason);
    }

    function unpause() external onlyOwner {
        paused = false;
    }

    function getStats() external view returns (
        uint256 total,
        bool isPaused,
        address vault,
        uint256 lastBlock
    ) {
        return (threatCount, paused, cerberusVault, lastCheckBlock);
    }
}
