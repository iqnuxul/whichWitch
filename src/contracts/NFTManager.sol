// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTManager
 * @notice Manages NFT minting for registered works in the whichWitch platform
 * @dev Each registered work gets a corresponding NFT minted to the creator
 */
contract NFTManager is ERC721, ERC721URIStorage, Ownable {
    // Custom errors
    error WorkNotFound(uint256 workId);
    error NFTAlreadyMinted(uint256 workId);
    error UnauthorizedCaller();
    error InvalidCreationManager();

    // State variables
    address public creationManager;
    mapping(uint256 => bool) public workNFTMinted; // workId => minted status
    mapping(uint256 => string) public workMetadataURI; // workId => metadata URI

    // Events
    event WorkNFTMinted(
        uint256 indexed workId,
        address indexed creator,
        uint256 indexed tokenId,
        string metadataURI,
        uint256 timestamp
    );

    event CreationManagerSet(address indexed creationManager);

    /**
     * @notice Constructor initializes the NFT collection
     * @param name Name of the NFT collection
     * @param symbol Symbol of the NFT collection
     * @param initialOwner Initial owner of the contract
     */
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC721(name, symbol) Ownable(initialOwner) {}

    /**
     * @notice Sets the CreationManager contract address
     * @param _creationManager Address of the CreationManager contract
     * @dev Can only be set once by the owner
     */
    function setCreationManager(address _creationManager) external onlyOwner {
        if (_creationManager == address(0)) revert InvalidCreationManager();
        if (creationManager != address(0)) revert InvalidCreationManager();

        creationManager = _creationManager;
        emit CreationManagerSet(_creationManager);
    }

    /**
     * @notice Mints an NFT for a registered work
     * @param workId ID of the work to mint NFT for
     * @param metadataURI URI pointing to the work's metadata
     * @dev Can only be called by the CreationManager contract
     */
    function mintWorkNFT(uint256 workId, string calldata metadataURI) external {
        if (msg.sender != creationManager) revert UnauthorizedCaller();
        if (workNFTMinted[workId]) revert NFTAlreadyMinted(workId);

        // Get work details from CreationManager
        (bool success, bytes memory data) =
            creationManager.call(abi.encodeWithSignature("getWork(uint256)", workId));

        require(success, "Failed to get work");

        // Decode the Work struct (id, creator, parentId, licenseFee, timestamp, derivativeAllowed, exists)
        (, address creator, , , uint256 timestamp, , bool exists) =
            abi.decode(data, (uint256, address, uint256, uint256, uint256, bool, bool));

        if (!exists) revert WorkNotFound(workId);

        // Use workId as tokenId for direct mapping
        uint256 tokenId = workId;

        // Mint NFT to the creator
        _safeMint(creator, tokenId);
        _setTokenURI(tokenId, metadataURI);

        // Update state
        workNFTMinted[workId] = true;
        workMetadataURI[workId] = metadataURI;

        emit WorkNFTMinted(workId, creator, tokenId, metadataURI, timestamp);
    }

    /**
     * @notice Checks if an NFT has been minted for a work
     * @param workId ID of the work to check
     * @return bool True if NFT has been minted, false otherwise
     */
    function isNFTMinted(uint256 workId) external view returns (bool) {
        return workNFTMinted[workId];
    }

    /**
     * @notice Gets the metadata URI for a work's NFT
     * @param workId ID of the work
     * @return string The metadata URI
     */
    function getWorkMetadataURI(uint256 workId) external view returns (string memory) {
        return workMetadataURI[workId];
    }

    /**
     * @notice Gets the owner of a work's NFT
     * @param workId ID of the work
     * @return address The current owner of the NFT
     */
    function getWorkNFTOwner(uint256 workId) external view returns (address) {
        if (!workNFTMinted[workId]) revert WorkNotFound(workId);
        return ownerOf(workId);
    }

    /**
     * @notice Updates the metadata URI for a work's NFT
     * @param workId ID of the work
     * @param newMetadataURI New metadata URI
     * @dev Can only be called by the current NFT owner
     */
    function updateMetadataURI(uint256 workId, string calldata newMetadataURI) external {
        if (!workNFTMinted[workId]) revert WorkNotFound(workId);
        require(ownerOf(workId) == msg.sender, "Not NFT owner");

        _setTokenURI(workId, newMetadataURI);
        workMetadataURI[workId] = newMetadataURI;
    }

    // Override required functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}