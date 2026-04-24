// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title TestTarget
/// @notice Demo contract for Cerberus Protocol monitoring
/// @dev Deployed on Sepolia: 0xc4a1367dbaf887387598991bfcf54d9cfdd10a9e
contract TestTarget {
    address public owner;
    uint256 public balance;

    event Deposit(address indexed from, uint256 amount);
    event Withdrawal(address indexed to, uint256 amount);
    event SuspiciousActivity(address indexed actor, string reason);

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        balance += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(msg.sender == owner, "Not owner");
        require(amount <= balance, "Insufficient balance");
        balance -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }

    /// @notice Trigger this to simulate suspicious activity for Cerberus demo
    function triggerAlert(string calldata reason) external {
        emit SuspiciousActivity(msg.sender, reason);
    }
}
