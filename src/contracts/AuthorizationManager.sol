// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AuthorizationManager
 * @notice Manages authorization tokens and licensing for derivative work creation
 * @dev Handles license fee payments and authorization verification
 */
contract AuthorizationManager {
    // Custom errors
    error WorkNotFound(uint256 workId);
    error AlreadyAuthorized(address user, uint256 workId);
    error InvalidLicenseFee(uint256 expected, uint256 provided);
    error ZeroAmount();

    // State variables
    mapping(uint256 => mapping(address => bool)) public authorizations; // workId => user => authorized
    mapping(address => uint256[]) public userAuthorizations; // user => workIds

    address public creationManager;
    address public paymentManager;

    // Events
    event AuthorizationGranted(
        uint256 indexed workId, address indexed user, uint256 licenseFee, uint256 timestamp
    );

    /**
     * @notice Constructor sets the CreationManager and PaymentManager addresses
     * @param _creationManager Address of the CreationManager contract
     * @param _paymentManager Address of the PaymentManager contract
     */
    constructor(address _creationManager, address _paymentManager) {
        require(_creationManager != address(0), "Invalid creation manager");
        require(_paymentManager != address(0), "Invalid payment manager");

        creationManager = _creationManager;
        paymentManager = _paymentManager;
    }

    /**
     * @notice Requests authorization to create a derivative work
     * @param workId ID of the work to get authorization for
     * @dev Requires payment equal to the work's license fee
     */
    function requestAuthorization(uint256 workId) external payable {
        if (msg.value == 0) revert ZeroAmount();

        // Check if already authorized
        if (authorizations[workId][msg.sender]) {
            revert AlreadyAuthorized(msg.sender, workId);
        }

        // Get work details from CreationManager
        (bool success, bytes memory data) =
            creationManager.call(abi.encodeWithSignature("getWork(uint256)", workId));

        require(success, "Failed to get work");

        // Decode the Work struct (id, creator, parentId, licenseFee, timestamp, exists)
        (, address creator,, uint256 licenseFee,,) = abi.decode(data, (uint256, address, uint256, uint256, uint256, bool));

        // Validate payment amount
        if (msg.value != licenseFee) {
            revert InvalidLicenseFee(licenseFee, msg.value);
        }

        // Mark user as authorized
        authorizations[workId][msg.sender] = true;
        userAuthorizations[msg.sender].push(workId);

        // Get creator chain for revenue distribution
        (bool chainSuccess, bytes memory chainData) =
            creationManager.call(abi.encodeWithSignature("getCreatorChain(uint256)", workId));

        require(chainSuccess, "Failed to get creator chain");
        address[] memory creatorChain = abi.decode(chainData, (address[]));

        // Prepare ancestors array (all except the direct creator)
        address[] memory ancestors;
        if (creatorChain.length > 1) {
            ancestors = new address[](creatorChain.length - 1);
            for (uint256 i = 0; i < creatorChain.length - 1; i++) {
                ancestors[i] = creatorChain[i];
            }
        } else {
            ancestors = new address[](0);
        }

        // Forward payment to PaymentManager for distribution
        (bool paymentSuccess,) = paymentManager.call{value: msg.value}(
            abi.encodeWithSignature("distributeRevenue(uint256,address,address[])", workId, creator, ancestors)
        );

        require(paymentSuccess, "Payment distribution failed");

        emit AuthorizationGranted(workId, msg.sender, licenseFee, block.timestamp);
    }

    /**
     * @notice Checks if a user has authorization for a work
     * @param user Address of the user to check
     * @param workId ID of the work
     * @return bool True if user is authorized, false otherwise
     */
    function hasAuthorization(address user, uint256 workId) external view returns (bool) {
        return authorizations[workId][user];
    }

    /**
     * @notice Gets all work IDs a user is authorized for
     * @param user Address of the user
     * @return Array of work IDs the user is authorized to create derivatives from
     */
    function getUserAuthorizations(address user) external view returns (uint256[] memory) {
        return userAuthorizations[user];
    }
}
