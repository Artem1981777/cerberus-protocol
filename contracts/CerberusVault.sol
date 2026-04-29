// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title CerberusVault
/// @notice A DeFi vault protected by Cerberus Protocol AI security swarm
/// @dev emergencyPause() called automatically by KeeperHub on consensus EXECUTE
contract CerberusVault {
    address public owner;
    address public cerberusGuard;
    bool public paused;
    uint256 public totalDeposits;
    
    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event SuspiciousActivity(address indexed actor, string reason);
    event EmergencyPause(address indexed triggeredBy, string reason);
    event Unpaused(address indexed by);
    event GuardUpdated(address indexed newGuard);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Vault paused by Cerberus Protocol");
        _;
    }

    modifier onlyGuard() {
        require(msg.sender == cerberusGuard || msg.sender == owner, "Not authorized");
        _;
    }

    constructor(address _cerberusGuard) {
        owner = msg.sender;
        cerberusGuard = _cerberusGuard;
    }

    /// @notice Deposit ETH into the vault
    function deposit() external payable whenNotPaused {
        require(msg.value > 0, "Must send ETH");
        balances[msg.sender] += msg.value;
        totalDeposits += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    /// @notice Withdraw ETH from the vault
    function withdraw(uint256 amount) external whenNotPaused {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // Large withdrawal triggers Cerberus monitoring
        if (amount > 0.05 ether) {
            emit SuspiciousActivity(msg.sender, "Large withdrawal attempt detected");
        }
        
        balances[msg.sender] -= amount;
        totalDeposits -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }

    /// @notice Called by KeeperHub after Cerberus consensus EXECUTE
    /// @dev This is the real on-chain protective action
    function emergencyPause(string calldata reason) external onlyGuard {
        paused = true;
        emit EmergencyPause(msg.sender, reason);
    }

    /// @notice Resume vault operations after threat resolved
    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    /// @notice Simulate suspicious activity for demo
    function triggerAlert(string calldata reason) external {
        emit SuspiciousActivity(msg.sender, reason);
    }

    /// @notice Update Cerberus guard address
    function updateGuard(address newGuard) external onlyOwner {
        cerberusGuard = newGuard;
        emit GuardUpdated(newGuard);
    }

    /// @notice Get vault stats
    function getStats() external view returns (
        uint256 tvl,
        bool isPaused,
        address guard
    ) {
        return (totalDeposits, paused, cerberusGuard);
    }

    receive() external payable {
        balances[msg.sender] += msg.value;
        totalDeposits += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
}
