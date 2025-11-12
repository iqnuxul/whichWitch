// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PaymentManager
 * @notice Manages all financial transactions including tips, license payments, and revenue distribution
 * @dev Uses pull payment pattern with balance tracking for gas efficiency and security
 */
contract PaymentManager is ReentrancyGuard {
    // Custom errors for gas efficiency
    error ZeroAmount();
    error InsufficientBalance(address user, uint256 balance);
    error WithdrawalFailed(address recipient);
    error InvalidCreationManager();
    error UnauthorizedCaller();

    // State variables
    mapping(address => uint256) public balances;
    address public creationManager;
    
    // Revenue split configuration (in basis points, 10000 = 100%)
    uint256 public constant PERCENTAGE_BASE = 10000;
    uint256 public constant DIRECT_CREATOR_SHARE = 5000;  // 50%
    uint256 public constant ANCESTOR_POOL_SHARE = 5000;   // 50%

    // Events
    event TipReceived(
        address indexed tipper,
        address indexed creator,
        uint256 amount,
        uint256 timestamp
    );

    event RevenueDistributed(
        uint256 indexed workId,
        address[] recipients,
        uint256[] amounts,
        uint256 totalAmount,
        uint256 timestamp
    );

    event Withdrawal(
        address indexed creator,
        uint256 amount,
        uint256 timestamp
    );

    event CreationManagerSet(address indexed creationManager);

    /**
     * @notice Sets the CreationManager contract address
     * @param _creationManager Address of the CreationManager contract
     */
    function setCreationManager(address _creationManager) external {
        if (_creationManager == address(0)) revert InvalidCreationManager();
        if (creationManager != address(0)) revert UnauthorizedCaller();
        
        creationManager = _creationManager;
        emit CreationManagerSet(_creationManager);
    }

    /**
     * @notice Returns the balance for a given creator
     * @param creator Address of the creator
     * @return Balance in wei
     */
    function getBalance(address creator) external view returns (uint256) {
        return balances[creator];
    }

    /**
     * @notice Allows users to tip creators directly
     * @dev Tips go 100% to the creator, no revenue splitting
     * @param creator Address of the creator to tip
     */
    function tipCreator(address creator) external payable {
        if (msg.value == 0) revert ZeroAmount();
        
        balances[creator] += msg.value;
        
        emit TipReceived(msg.sender, creator, msg.value, block.timestamp);
    }

    /**
     * @notice Distributes revenue from license fees across the creation chain
     * @dev Called by AuthorizationManager when a license fee is paid
     * @param workId The work ID for which revenue is being distributed
     * @param directCreator Address of the direct creator (receives 50%)
     * @param ancestors Array of ancestor creator addresses (split remaining 50%)
     */
    function distributeRevenue(
        uint256 workId,
        address directCreator,
        address[] calldata ancestors
    ) external payable {
        if (msg.sender != creationManager) revert UnauthorizedCaller();
        if (msg.value == 0) revert ZeroAmount();
        
        uint256 totalAmount = msg.value;
        uint256 directShare = (totalAmount * DIRECT_CREATOR_SHARE) / PERCENTAGE_BASE;
        uint256 ancestorPool = totalAmount - directShare;
        
        // Allocate direct creator share
        balances[directCreator] += directShare;
        
        // Prepare arrays for event emission
        uint256 recipientCount = ancestors.length + 1;
        address[] memory recipients = new address[](recipientCount);
        uint256[] memory amounts = new uint256[](recipientCount);
        
        recipients[0] = directCreator;
        amounts[0] = directShare;
        
        // Distribute ancestor pool equally among ancestors
        if (ancestors.length > 0) {
            uint256 perAncestor = ancestorPool / ancestors.length;
            uint256 remainder = ancestorPool % ancestors.length;
            
            for (uint256 i = 0; i < ancestors.length; i++) {
                uint256 ancestorShare = perAncestor;
                // Give remainder to first ancestor to ensure all funds are distributed
                if (i == 0) {
                    ancestorShare += remainder;
                }
                
                balances[ancestors[i]] += ancestorShare;
                recipients[i + 1] = ancestors[i];
                amounts[i + 1] = ancestorShare;
            }
        }
        
        emit RevenueDistributed(workId, recipients, amounts, totalAmount, block.timestamp);
    }

    /**
     * @notice Allows creators to withdraw their accumulated balance
     * @dev Uses checks-effects-interactions pattern and reentrancy guard
     */
    function withdraw() external nonReentrant {
        uint256 amount = balances[msg.sender];
        if (amount == 0) revert InsufficientBalance(msg.sender, 0);
        
        // Effects: Update balance before transfer
        balances[msg.sender] = 0;
        
        // Interactions: Transfer funds
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert WithdrawalFailed(msg.sender);
        
        emit Withdrawal(msg.sender, amount, block.timestamp);
    }
}
