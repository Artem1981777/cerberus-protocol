// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISafe {
    function execTransactionFromModule(
        address to,
        uint256 value,
        bytes calldata data,
        uint8 operation
    ) external returns (bool success);
}

contract CerberusSafeModule {
    address public keeperHub;
    address public safe;
    bool public cerberusEmergencyLock;

    event CerberusLockTriggered(string reason);
    event CerberusLockReleased();

    modifier onlyKeeper() {
        require(msg.sender == keeperHub, "Only Cerberus KeeperHub can call");
        _;
    }

    constructor(address _keeperHub, address _safe) {
        keeperHub = _keeperHub;
        safe = _safe;
    }

    function triggerEmergencyLock(string calldata reason) external onlyKeeper {
        cerberusEmergencyLock = true;
        emit CerberusLockTriggered(reason);
    }

    function releaseLock() external onlyKeeper {
        cerberusEmergencyLock = false;
        emit CerberusLockReleased();
    }

    function executeThroughSafe(
        address to,
        uint256 value,
        bytes calldata data
    ) external returns (bool) {
        require(!cerberusEmergencyLock, "Safe is locked by Cerberus Protocol");
        return ISafe(safe).execTransactionFromModule(to, value, data, 0);
    }
}
