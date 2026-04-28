// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title TestTarget
/// @notice Demo contract for Cerberus Protocol monitoring
contract TestTarget {
    address public owner;
    uint256 public balance;
    bool public paused;

    event Deposit(address indexed from, uint256 amount);
    event Withdrawal(address indexed to, uint256 amount);
    event SuspiciousActivity(address indexed actor, string reason);
    event Paused(address indexed by, string reason);
    event OwnershipTransferred(address indexed from, address indexed to);

    modifier whenNotPaused() {
        require(!paused, "Contract is paused by Cerberus");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable whenNotPaused {
        balance += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external whenNotPaused {
        require(msg.sender == owner, "Not owner");
        require(amount <= balance, "Insufficient balance");
        // Emit suspicious if large withdrawal
        if (amount > 0.1 ether) {
            emit SuspiciousActivity(msg.sender, "Large withdrawal detected");
        }
        balance -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }

    /// @notice Called by Cerberus via KeeperHub after consensus
    function emergencyPause(string calldata reason) external {
        paused = true;
        emit Paused(msg.sender, reason);
    }

    function unpause() external {
        require(msg.sender == owner, "Not owner");
        paused = false;
    }

    /// @notice Trigger for demo — simulates suspicious activity
    function triggerAlert(string calldata reason) external {
        emit SuspiciousActivity(msg.sender, reason);
    }

    function transferOwnership(address newOwner) external {
        require(msg.sender == owner, "Not owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
