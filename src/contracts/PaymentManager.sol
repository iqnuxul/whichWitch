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
    address public authorizationManager; 
    address public platformWallet; // Platform fee recipient
    
    // Revenue split configuration (in basis points, 10000 = 100%)
    uint256 public constant PERCENTAGE_BASE = 10000;
    uint256 public constant DIRECT_CREATOR_SHARE = 4000;  // 40%
    uint256 public constant ORIGINAL_CREATOR_SHARE = 4000; // 40%
    uint256 public constant MIDDLE_ANCESTORS_POOL = 2000;  // 20%
    uint256 public constant PLATFORM_FEE = 1000;           // 10% on withdrawal

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
    event PlatformWalletSet(address indexed platformWallet);
    event PlatformFeeCollected(address indexed user, uint256 feeAmount, uint256 timestamp);

    /**
     * @notice Constructor sets the platform wallet address
     * @param _platformWallet Address where platform fees are sent
     */
    constructor(address _platformWallet) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
    }


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


    function setAuthorizationManager(address _authorizationManager) external {
        require(authorizationManager == address(0), "Already set");
        authorizationManager = _authorizationManager;
    }


    /**
     * @notice Updates the platform wallet address
     * @param _platformWallet New platform wallet address
     * @dev Can only be called once by the current platform wallet
     */
    function setPlatformWallet(address _platformWallet) external {
        require(msg.sender == platformWallet, "Only platform wallet");
        require(_platformWallet != address(0), "Invalid platform wallet");
        
        platformWallet = _platformWallet;
        emit PlatformWalletSet(_platformWallet);
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
     * Distribution: 40% direct creator, 40% original creator, 20% middle ancestors
     * @param workId The work ID for which revenue is being distributed
     * @param directCreator Address of the direct creator (receives 40%)
     * @param ancestors Array of ancestor creator addresses [original, ...middle]
     *                  First gets 40%, rest split 20%
     */
    function distributeRevenue(
        uint256 workId,
        address directCreator,
        address[] calldata ancestors
    ) external payable {
        if (msg.sender != authorizationManager) revert UnauthorizedCaller();
        if (msg.value == 0) revert ZeroAmount();
        
        uint256 totalAmount = msg.value;
        
        // Direct creator gets 40%
        uint256 directShare = (totalAmount * DIRECT_CREATOR_SHARE) / PERCENTAGE_BASE;
        balances[directCreator] += directShare;
        
        // Prepare arrays for event emission
        address[] memory recipients = new address[](ancestors.length + 1);
        uint256[] memory amounts = new uint256[](ancestors.length + 1);
        
        recipients[0] = directCreator;
        amounts[0] = directShare;
        
        // Distribute to ancestors
        if (ancestors.length > 0) {
            uint256 originalShare = (totalAmount * ORIGINAL_CREATOR_SHARE) / PERCENTAGE_BASE;
            
            if (ancestors.length == 1) {
                // Only 2 people: original gets 40% + 20% = 60%
                uint256 totalOriginalShare = originalShare + (totalAmount * MIDDLE_ANCESTORS_POOL) / PERCENTAGE_BASE;
                balances[ancestors[0]] += totalOriginalShare;
                recipients[1] = ancestors[0];
                amounts[1] = totalOriginalShare;
            } else {
                // Multiple ancestors: original gets 40%, middle split 20%
                balances[ancestors[0]] += originalShare;
                recipients[1] = ancestors[0];
                amounts[1] = originalShare;
                
                uint256 middlePool = (totalAmount * MIDDLE_ANCESTORS_POOL) / PERCENTAGE_BASE;
                uint256 perMiddle = middlePool / (ancestors.length - 1);
                uint256 remainder = middlePool % (ancestors.length - 1);
                
                for (uint256 i = 1; i < ancestors.length; i++) {
                    uint256 share = perMiddle + (i == 1 ? remainder : 0);
                    balances[ancestors[i]] += share;
                    recipients[i + 1] = ancestors[i];
                    amounts[i + 1] = share;
                }
            }
        }
        
        emit RevenueDistributed(workId, recipients, amounts, totalAmount, block.timestamp);
    }

    /**
     * @notice Allows creators to withdraw their accumulated balance
     * @dev Uses checks-effects-interactions pattern and reentrancy guard
     * Platform takes 10% fee on withdrawal
     */
    function withdraw() external nonReentrant {
        uint256 amount = balances[msg.sender];
        if (amount == 0) revert InsufficientBalance(msg.sender, 0);
        
        // Calculate platform fee (10%)
        uint256 platformFee = (amount * PLATFORM_FEE) / PERCENTAGE_BASE;
        uint256 userAmount = amount - platformFee;
        
        // Effects: Update balances before transfer
        balances[msg.sender] = 0;
        balances[platformWallet] += platformFee;
        
        // Interactions: Transfer funds to user
        (bool success, ) = payable(msg.sender).call{value: userAmount}("");
        if (!success) revert WithdrawalFailed(msg.sender);
        
        emit PlatformFeeCollected(msg.sender, platformFee, block.timestamp);
        emit Withdrawal(msg.sender, userAmount, block.timestamp);
    }

    /**
     * @notice Allows platform to withdraw accumulated fees
     * @dev Only platform wallet can call this
     */
    function withdrawPlatformFees() external nonReentrant {
        require(msg.sender == platformWallet, "Only platform wallet");
        
        uint256 amount = balances[platformWallet];
        if (amount == 0) revert InsufficientBalance(platformWallet, 0);
        
        // Effects: Update balance before transfer
        balances[platformWallet] = 0;
        
        // Interactions: Transfer funds
        (bool success, ) = payable(platformWallet).call{value: amount}("");
        if (!success) revert WithdrawalFailed(platformWallet);
        
        emit Withdrawal(platformWallet, amount, block.timestamp);
    }
}
