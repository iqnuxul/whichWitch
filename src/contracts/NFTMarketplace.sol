// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/**
 * @title NFTMarketplace
 * @notice NFT交易市场，支持购买、专卖、二创授权等功能
 * @dev 集成ZetaChain跨链支付功能
 */
contract NFTMarketplace is ReentrancyGuard, IERC721Receiver {
    // 自定义错误
    error NotNFTOwner();
    error NotForSale();
    error InsufficientPayment();
    error InvalidPrice();
    error SelfPurchase();
    error TransferFailed();
    error InvalidListing();
    error ListingNotFound();
    error UnauthorizedAccess();

    // 挂单状态枚举
    enum ListingStatus {
        Active,     // 活跃
        Sold,       // 已售出
        Cancelled   // 已取消
    }

    // 挂单类型枚举
    enum ListingType {
        Sale,           // 普通销售
        Exclusive,      // 专卖（独家销售）
        CreativeRights  // 二创授权销售
    }

    // 挂单结构体
    struct Listing {
        uint256 listingId;
        address nftContract;
        uint256 tokenId;
        address seller;
        uint256 price;
        ListingType listingType;
        ListingStatus status;
        uint256 createdAt;
        uint256 expiresAt;
        bool allowCrossChain; // 是否允许跨链支付
    }

    // 出价结构体
    struct Offer {
        uint256 offerId;
        uint256 listingId;
        address bidder;
        uint256 amount;
        uint256 expiresAt;
        bool isActive;
        string sourceChain; // 跨链支付来源链
    }

    // 状态变量
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer[]) public listingOffers;
    mapping(address => uint256[]) public userListings;
    mapping(address => uint256[]) public userOffers;
    mapping(uint256 => bool) public soldTokens; // tokenId => 是否已售出
    
    uint256 public nextListingId = 1;
    uint256 public nextOfferId = 1;
    uint256 public marketplaceFee = 250; // 2.5% (基点制)
    address public feeRecipient;
    address public nftManager;

    // ZetaChain跨链相关
    mapping(string => bool) public supportedChains;
    mapping(string => address) public chainConnectors;

    // 事件
    event ItemListed(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price,
        ListingType listingType
    );

    event ItemSold(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 price,
        string sourceChain
    );

    event OfferMade(
        uint256 indexed offerId,
        uint256 indexed listingId,
        address indexed bidder,
        uint256 amount
    );

    event OfferAccepted(
        uint256 indexed offerId,
        uint256 indexed listingId,
        address indexed seller,
        address bidder,
        uint256 amount
    );

    event ListingCancelled(uint256 indexed listingId);
    event CrossChainPaymentReceived(uint256 indexed listingId, string sourceChain, uint256 amount);

    constructor(address _feeRecipient, address _nftManager) {
        feeRecipient = _feeRecipient;
        nftManager = _nftManager;
        
        // 初始化支持的链
        supportedChains["ethereum"] = true;
        supportedChains["bsc"] = true;
        supportedChains["polygon"] = true;
        supportedChains["bitcoin"] = true;
    }

    /**
     * @notice 挂单销售NFT
     */
    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        ListingType listingType,
        uint256 duration,
        bool allowCrossChain
    ) external nonReentrant {
        if (price == 0) revert InvalidPrice();
        
        IERC721 nft = IERC721(nftContract);
        if (nft.ownerOf(tokenId) != msg.sender) revert NotNFTOwner();
        
        // 转移NFT到市场合约
        nft.safeTransferFrom(msg.sender, address(this), tokenId);
        
        uint256 listingId = nextListingId++;
        
        listings[listingId] = Listing({
            listingId: listingId,
            nftContract: nftContract,
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            listingType: listingType,
            status: ListingStatus.Active,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + duration,
            allowCrossChain: allowCrossChain
        });
        
        userListings[msg.sender].push(listingId);
        
        emit ItemListed(listingId, nftContract, tokenId, msg.sender, price, listingType);
    }

    /**
     * @notice 直接购买NFT
     */
    function buyItem(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        
        if (listing.status != ListingStatus.Active) revert NotForSale();
        if (block.timestamp > listing.expiresAt) revert NotForSale();
        if (msg.value < listing.price) revert InsufficientPayment();
        if (msg.sender == listing.seller) revert SelfPurchase();
        
        // 更新状态
        listing.status = ListingStatus.Sold;
        soldTokens[listing.tokenId] = true;
        
        // 计算费用
        uint256 marketFee = (listing.price * marketplaceFee) / 10000;
        uint256 sellerAmount = listing.price - marketFee;
        
        // 转账
        (bool success1,) = payable(listing.seller).call{value: sellerAmount}("");
        (bool success2,) = payable(feeRecipient).call{value: marketFee}("");
        
        if (!success1 || !success2) revert TransferFailed();
        
        // 转移NFT
        IERC721(listing.nftContract).safeTransferFrom(
            address(this),
            msg.sender,
            listing.tokenId
        );
        
        // 退还多余的ETH
        if (msg.value > listing.price) {
            (bool success3,) = payable(msg.sender).call{value: msg.value - listing.price}("");
            if (!success3) revert TransferFailed();
        }
        
        emit ItemSold(listingId, msg.sender, listing.price, "native");
    }

    /**
     * @notice 出价
     */
    function makeOffer(
        uint256 listingId,
        uint256 duration,
        string calldata sourceChain
    ) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        
        if (listing.status != ListingStatus.Active) revert InvalidListing();
        if (msg.value == 0) revert InvalidPrice();
        if (msg.sender == listing.seller) revert SelfPurchase();
        
        uint256 offerId = nextOfferId++;
        
        Offer memory newOffer = Offer({
            offerId: offerId,
            listingId: listingId,
            bidder: msg.sender,
            amount: msg.value,
            expiresAt: block.timestamp + duration,
            isActive: true,
            sourceChain: sourceChain
        });
        
        listingOffers[listingId].push(newOffer);
        userOffers[msg.sender].push(offerId);
        
        emit OfferMade(offerId, listingId, msg.sender, msg.value);
    }

    /**
     * @notice 接受出价
     */
    function acceptOffer(uint256 listingId, uint256 offerIndex) external nonReentrant {
        Listing storage listing = listings[listingId];
        
        if (listing.seller != msg.sender) revert UnauthorizedAccess();
        if (listing.status != ListingStatus.Active) revert InvalidListing();
        
        Offer storage offer = listingOffers[listingId][offerIndex];
        
        if (!offer.isActive) revert InvalidListing();
        if (block.timestamp > offer.expiresAt) revert InvalidListing();
        
        // 更新状态
        listing.status = ListingStatus.Sold;
        offer.isActive = false;
        soldTokens[listing.tokenId] = true;
        
        // 计算费用
        uint256 marketFee = (offer.amount * marketplaceFee) / 10000;
        uint256 sellerAmount = offer.amount - marketFee;
        
        // 转账
        (bool success1,) = payable(listing.seller).call{value: sellerAmount}("");
        (bool success2,) = payable(feeRecipient).call{value: marketFee}("");
        
        if (!success1 || !success2) revert TransferFailed();
        
        // 转移NFT
        IERC721(listing.nftContract).safeTransferFrom(
            address(this),
            offer.bidder,
            listing.tokenId
        );
        
        emit OfferAccepted(offer.offerId, listingId, msg.sender, offer.bidder, offer.amount);
        emit ItemSold(listingId, offer.bidder, offer.amount, offer.sourceChain);
    }

    /**
     * @notice 取消挂单
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        
        if (listing.seller != msg.sender) revert UnauthorizedAccess();
        if (listing.status != ListingStatus.Active) revert InvalidListing();
        
        listing.status = ListingStatus.Cancelled;
        
        // 退还NFT
        IERC721(listing.nftContract).safeTransferFrom(
            address(this),
            listing.seller,
            listing.tokenId
        );
        
        emit ListingCancelled(listingId);
    }

    /**
     * @notice ZetaChain跨链支付处理
     */
    function processCrossChainPayment(
        uint256 listingId,
        address buyer,
        uint256 amount,
        string calldata sourceChain
    ) external {
        // 只有授权的跨链连接器可以调用
        require(chainConnectors[sourceChain] == msg.sender, "Unauthorized connector");
        
        Listing storage listing = listings[listingId];
        
        if (listing.status != ListingStatus.Active) revert NotForSale();
        if (!listing.allowCrossChain) revert UnauthorizedAccess();
        if (amount < listing.price) revert InsufficientPayment();
        
        // 更新状态
        listing.status = ListingStatus.Sold;
        soldTokens[listing.tokenId] = true;
        
        // 计算费用
        uint256 marketFee = (listing.price * marketplaceFee) / 10000;
        uint256 sellerAmount = listing.price - marketFee;
        
        // 转账（这里需要从跨链桥接收到的资金中支付）
        (bool success1,) = payable(listing.seller).call{value: sellerAmount}("");
        (bool success2,) = payable(feeRecipient).call{value: marketFee}("");
        
        if (!success1 || !success2) revert TransferFailed();
        
        // 转移NFT
        IERC721(listing.nftContract).safeTransferFrom(
            address(this),
            buyer,
            listing.tokenId
        );
        
        emit CrossChainPaymentReceived(listingId, sourceChain, amount);
        emit ItemSold(listingId, buyer, listing.price, sourceChain);
    }

    /**
     * @notice 获取挂单信息
     */
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    /**
     * @notice 获取挂单的所有出价
     */
    function getListingOffers(uint256 listingId) external view returns (Offer[] memory) {
        return listingOffers[listingId];
    }

    /**
     * @notice 获取用户的挂单
     */
    function getUserListings(address user) external view returns (uint256[] memory) {
        return userListings[user];
    }

    /**
     * @notice 设置跨链连接器
     */
    function setChainConnector(string calldata chain, address connector) external {
        require(msg.sender == feeRecipient, "Only admin");
        chainConnectors[chain] = connector;
    }

    /**
     * @notice 设置市场费率
     */
    function setMarketplaceFee(uint256 _fee) external {
        require(msg.sender == feeRecipient, "Only admin");
        require(_fee <= 1000, "Fee too high"); // 最高10%
        marketplaceFee = _fee;
    }

    /**
     * @notice 紧急提取（仅管理员）
     */
    function emergencyWithdraw() external {
        require(msg.sender == feeRecipient, "Only admin");
        (bool success,) = payable(feeRecipient).call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @notice 实现IERC721Receiver接口
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    // 接收ETH
    receive() external payable {}
}