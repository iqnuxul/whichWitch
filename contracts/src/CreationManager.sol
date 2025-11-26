// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CreationManager
 * @notice Manages registration of original and derivative works, maintains creation tree structure
 * @dev Stores work relationships and metadata references on-chain
 */
contract CreationManager {
    // Custom errors
    error WorkNotFound(uint256 workId);
    error InvalidParentWork(uint256 parentId);
    error NotAuthorized(address user, uint256 workId);
    error InvalidLicenseFee();
    error InvalidAuthorizationManager();
    error DerivativesNotAllowed(uint256 workId);

    // Work structure
    struct Work {
        uint256 id;
        address creator;
        uint256 parentId; // 0 for original works
        uint256 licenseFee; // in wei
        uint256 timestamp;
        bool derivativeAllowed; // whether derivatives are allowed
        bool exists;
    }

    // State variables
    mapping(uint256 => Work) public works;
    mapping(uint256 => address[]) public workAncestors; // workId => array of ancestor creator addresses
    mapping(address => uint256[]) public creatorWorks;
    mapping(uint256 => uint256[]) public derivatives; // parentId => childIds
    uint256 public nextWorkId = 1;

    address public paymentManager;
    address public authorizationManager;

    // Events
    event WorkRegistered(
        uint256 indexed workId,
        address indexed creator,
        uint256 licenseFee,
        bool derivativeAllowed,
        string metadataURI,
        uint256 timestamp
    );

    event DerivativeWorkRegistered(
        uint256 indexed workId,
        uint256 indexed parentId,
        address indexed creator,
        uint256 licenseFee,
        bool derivativeAllowed,
        string metadataURI,
        uint256 timestamp
    );

    event AuthorizationManagerSet(address indexed authorizationManager);

    /**
     * @notice Constructor sets the PaymentManager address
     * @param _paymentManager Address of the PaymentManager contract
     */
    constructor(address _paymentManager) {
        require(_paymentManager != address(0), "Invalid payment manager");
        paymentManager = _paymentManager;
    }

    /**
     * @notice Sets the AuthorizationManager contract address
     * @param _authorizationManager Address of the AuthorizationManager contract
     * @dev Can only be set once after deployment
     */
    function setAuthorizationManager(address _authorizationManager) external {
        if (_authorizationManager == address(0)) revert InvalidAuthorizationManager();
        if (authorizationManager != address(0)) revert InvalidAuthorizationManager();

        authorizationManager = _authorizationManager;
        emit AuthorizationManagerSet(_authorizationManager);
    }

    /**
     * @notice Registers a new original work
     * @param licenseFee Fee in wei that others must pay to create derivatives
     * @param derivativeAllowed Whether derivative works are allowed
     * @param metadataURI URI pointing to off-chain metadata (IPFS/Supabase)
     * @return workId The ID of the newly registered work
     */
    function registerOriginalWork(uint256 licenseFee, bool derivativeAllowed, string calldata metadataURI)
        external
        returns (uint256 workId)
    {
        workId = nextWorkId++;

        works[workId] = Work({
            id: workId,
            creator: msg.sender,
            parentId: 0, // 0 indicates original work
            licenseFee: licenseFee,
            timestamp: block.timestamp,
            derivativeAllowed: derivativeAllowed,
            exists: true
        });

        // Original works have no ancestors - empty array
        workAncestors[workId] = new address[](0);

        creatorWorks[msg.sender].push(workId);

        emit WorkRegistered(workId, msg.sender, licenseFee, derivativeAllowed, metadataURI, block.timestamp);
    }

    /**
     * @notice Registers a new derivative work
     * @param parentId ID of the parent work
     * @param licenseFee Fee in wei for others to create derivatives of this work
     * @param derivativeAllowed Whether derivative works are allowed for this work
     * @param metadataURI URI pointing to off-chain metadata
     * @return workId The ID of the newly registered derivative work
     */
    function registerDerivativeWork(
        uint256 parentId,
        uint256 licenseFee,
        bool derivativeAllowed,
        string calldata metadataURI
    ) external returns (uint256 workId) {
        // Validate parent work exists
        if (!works[parentId].exists) revert InvalidParentWork(parentId);

        // Check if parent allows derivatives
        if (!works[parentId].derivativeAllowed) revert DerivativesNotAllowed(parentId);

        // Check authorization through AuthorizationManager
        (bool success, bytes memory data) =
            authorizationManager.call(abi.encodeWithSignature("hasAuthorization(address,uint256)", msg.sender, parentId));

        if (!success || !abi.decode(data, (bool))) {
            revert NotAuthorized(msg.sender, parentId);
        }

        workId = nextWorkId++;

        works[workId] = Work({
            id: workId,
            creator: msg.sender,
            parentId: parentId,
            licenseFee: licenseFee,
            timestamp: block.timestamp,
            derivativeAllowed: derivativeAllowed,
            exists: true
        });

        // Build ancestor array: parent's ancestors + parent creator
        address[] memory parentAncestors = workAncestors[parentId];
        address[] memory newAncestors = new address[](parentAncestors.length + 1);
        
        // Copy parent's ancestors
        for (uint256 i = 0; i < parentAncestors.length; i++) {
            newAncestors[i] = parentAncestors[i];
        }
        
        // Add parent's creator as the last ancestor
        newAncestors[parentAncestors.length] = works[parentId].creator;
        
        // Store ancestors for this work
        workAncestors[workId] = newAncestors;

        creatorWorks[msg.sender].push(workId);
        derivatives[parentId].push(workId);

        emit DerivativeWorkRegistered(
            workId, parentId, msg.sender, licenseFee, derivativeAllowed, metadataURI, block.timestamp
        );
    }

    /**
     * @notice Gets the ancestor creator addresses for a work (excluding the work's creator)
     * @param workId ID of the work
     * @return Array of ancestor creator addresses from original to parent
     * @dev Used by PaymentManager for revenue distribution
     */
    function getAncestors(uint256 workId) external view returns (address[] memory) {
        if (!works[workId].exists) revert WorkNotFound(workId);
        return workAncestors[workId];
    }

    /**
     * @notice Gets the full creator chain for a work (ancestors + current creator)
     * @param workId ID of the work to get creator chain for
     * @return creators Array of creator addresses from original to specified work
     * @dev Used by PaymentManager for revenue distribution
     */
    function getCreatorChain(uint256 workId) external view returns (address[] memory creators) {
        if (!works[workId].exists) revert WorkNotFound(workId);

        address[] memory ancestors = workAncestors[workId];
        creators = new address[](ancestors.length + 1);
        
        // Copy ancestor creators
        for (uint256 i = 0; i < ancestors.length; i++) {
            creators[i] = ancestors[i];
        }
        
        // Add current work's creator at the end
        creators[ancestors.length] = works[workId].creator;
        
        return creators;
    }

    /**
     * @notice Gets all derivative works for a given work
     * @param workId ID of the parent work
     * @return Array of derivative work IDs
     */
    function getDerivatives(uint256 workId) external view returns (uint256[] memory) {
        return derivatives[workId];
    }

    /**
     * @notice Gets all works created by a specific address
     * @param creator Address of the creator
     * @return Array of work IDs created by the address
     */
    function getCreatorWorks(address creator) external view returns (uint256[] memory) {
        return creatorWorks[creator];
    }

    /**
     * @notice Gets work details
     * @param workId ID of the work
     * @return work The Work struct containing all work details
     */
    function getWork(uint256 workId) external view returns (Work memory work) {
        if (!works[workId].exists) revert WorkNotFound(workId);
        return works[workId];
    }
}
