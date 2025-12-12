// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CyberGraphSync
 * @notice 将whichWitch平台的内容同步到CyberGraph链上
 * @dev 处理跨链内容同步和社交图谱构建
 */
contract CyberGraphSync is ReentrancyGuard, Ownable {
    // 自定义错误
    error InvalidContent();
    error SyncFailed();
    error UnauthorizedCreator();
    error ContentAlreadySynced();
    error InvalidCyberGraphAddress();

    // 内容类型枚举
    enum ContentType {
        OriginalWork,    // 原创作品
        DerivativeWork,  // 衍生作品
        CreatorProfile,  // 创作者档案
        SocialPost       // 社交动态
    }

    // 同步状态枚举
    enum SyncStatus {
        Pending,    // 待同步
        Syncing,    // 同步中
        Synced,     // 已同步
        Failed      // 同步失败
    }

    // 内容同步记录
    struct ContentSync {
        uint256 syncId;
        uint256 workId;
        address creator;
        ContentType contentType;
        string contentHash;      // IPFS hash或内容哈希
        string cyberGraphId;     // CyberGraph上的内容ID
        string metadata;         // 元数据JSON
        SyncStatus status;
        uint256 createdAt;
        uint256 syncedAt;
        string socialConnections; // 社交连接数据
    }

    // 创作者档案
    struct CreatorProfile {
        address creatorAddress;
        string cyberGraphHandle;  // CyberGraph用户名
        string profileData;       // 档案数据
        uint256 followersCount;
        uint256 followingCount;
        uint256 worksCount;
        bool isVerified;
        uint256 lastUpdated;
    }

    // 社交关系
    struct SocialRelation {
        address follower;
        address following;
        uint256 relationshipType; // 0: follow, 1: collaborate, 2: derivative
        uint256 createdAt;
        bool isActive;
    }

    // 状态变量
    mapping(uint256 => ContentSync) public contentSyncs;
    mapping(uint256 => bool) public workSynced; // workId => synced
    mapping(address => CreatorProfile) public creatorProfiles;
    mapping(address => uint256[]) public creatorSyncs; // creator => syncIds
    mapping(bytes32 => SocialRelation) public socialRelations;
    mapping(address => address[]) public creatorFollowers;
    mapping(address => address[]) public creatorFollowing;
    
    uint256 public nextSyncId = 1;
    address public creationManager;
    address public cyberGraphRelay; // CyberGraph中继服务地址
    uint256 public syncFee = 0.001 ether; // 同步费用

    // 事件
    event ContentSyncInitiated(
        uint256 indexed syncId,
        uint256 indexed workId,
        address indexed creator,
        ContentType contentType,
        string contentHash
    );

    event ContentSynced(
        uint256 indexed syncId,
        string cyberGraphId,
        uint256 timestamp
    );

    event CreatorProfileUpdated(
        address indexed creator,
        string cyberGraphHandle,
        uint256 timestamp
    );

    event SocialRelationCreated(
        address indexed follower,
        address indexed following,
        uint256 relationshipType,
        uint256 timestamp
    );

    event CyberGraphRelayUpdated(address indexed newRelay);

    constructor(address _creationManager, address _cyberGraphRelay, address initialOwner) 
        Ownable(initialOwner) {
        creationManager = _creationManager;
        cyberGraphRelay = _cyberGraphRelay;
    }

    /**
     * @notice 同步作品到CyberGraph
     */
    function syncWorkToCyberGraph(
        uint256 workId,
        ContentType contentType,
        string calldata contentHash,
        string calldata metadata,
        string calldata socialConnections
    ) external payable nonReentrant {
        if (msg.value < syncFee) revert SyncFailed();
        if (workSynced[workId]) revert ContentAlreadySynced();
        if (bytes(contentHash).length == 0) revert InvalidContent();

        // 验证调用者是作品创作者
        (bool success, bytes memory data) = creationManager.call(
            abi.encodeWithSignature("getWork(uint256)", workId)
        );
        require(success, "Failed to get work");
        
        (, address creator, , , , , bool exists) = abi.decode(
            data, 
            (uint256, address, uint256, uint256, uint256, bool, bool)
        );
        
        if (!exists) revert InvalidContent();
        if (creator != msg.sender) revert UnauthorizedCreator();

        uint256 syncId = nextSyncId++;
        
        contentSyncs[syncId] = ContentSync({
            syncId: syncId,
            workId: workId,
            creator: msg.sender,
            contentType: contentType,
            contentHash: contentHash,
            cyberGraphId: "",
            metadata: metadata,
            status: SyncStatus.Pending,
            createdAt: block.timestamp,
            syncedAt: 0,
            socialConnections: socialConnections
        });

        workSynced[workId] = true;
        creatorSyncs[msg.sender].push(syncId);

        // 收取同步费用
        if (msg.value > syncFee) {
            (bool refundSuccess,) = payable(msg.sender).call{value: msg.value - syncFee}("");
            require(refundSuccess, "Refund failed");
        }

        emit ContentSyncInitiated(syncId, workId, msg.sender, contentType, contentHash);
        
        // 触发CyberGraph同步（通过事件或直接调用中继服务）
        _triggerCyberGraphSync(syncId);
    }

    /**
     * @notice 更新创作者档案
     */
    function updateCreatorProfile(
        string calldata cyberGraphHandle,
        string calldata profileData
    ) external {
        CreatorProfile storage profile = creatorProfiles[msg.sender];
        
        profile.creatorAddress = msg.sender;
        profile.cyberGraphHandle = cyberGraphHandle;
        profile.profileData = profileData;
        profile.lastUpdated = block.timestamp;
        
        // 如果是新档案，初始化计数器
        if (profile.worksCount == 0) {
            profile.followersCount = 0;
            profile.followingCount = 0;
            profile.isVerified = false;
        }

        emit CreatorProfileUpdated(msg.sender, cyberGraphHandle, block.timestamp);
    }

    /**
     * @notice 创建社交关系
     */
    function createSocialRelation(
        address following,
        uint256 relationshipType
    ) external {
        bytes32 relationId = keccak256(abi.encodePacked(msg.sender, following, relationshipType));
        
        require(!socialRelations[relationId].isActive, "Relation already exists");
        
        socialRelations[relationId] = SocialRelation({
            follower: msg.sender,
            following: following,
            relationshipType: relationshipType,
            createdAt: block.timestamp,
            isActive: true
        });

        // 更新关注列表
        creatorFollowers[following].push(msg.sender);
        creatorFollowing[msg.sender].push(following);

        // 更新档案计数
        creatorProfiles[msg.sender].followingCount++;
        creatorProfiles[following].followersCount++;

        emit SocialRelationCreated(msg.sender, following, relationshipType, block.timestamp);
    }

    /**
     * @notice 确认CyberGraph同步完成（由中继服务调用）
     */
    function confirmCyberGraphSync(
        uint256 syncId,
        string calldata cyberGraphId
    ) external {
        require(msg.sender == cyberGraphRelay, "Unauthorized relay");
        
        ContentSync storage sync = contentSyncs[syncId];
        require(sync.status == SyncStatus.Pending || sync.status == SyncStatus.Syncing, "Invalid status");
        
        sync.cyberGraphId = cyberGraphId;
        sync.status = SyncStatus.Synced;
        sync.syncedAt = block.timestamp;

        // 更新创作者作品计数
        creatorProfiles[sync.creator].worksCount++;

        emit ContentSynced(syncId, cyberGraphId, block.timestamp);
    }

    /**
     * @notice 标记同步失败
     */
    function markSyncFailed(uint256 syncId, string calldata reason) external {
        require(msg.sender == cyberGraphRelay, "Unauthorized relay");
        
        ContentSync storage sync = contentSyncs[syncId];
        sync.status = SyncStatus.Failed;
        
        // 退还同步费用
        (bool success,) = payable(sync.creator).call{value: syncFee}("");
        require(success, "Refund failed");
    }

    /**
     * @notice 批量同步多个作品
     */
    function batchSyncWorks(
        uint256[] calldata workIds,
        ContentType[] calldata contentTypes,
        string[] calldata contentHashes,
        string[] calldata metadataArray
    ) external payable nonReentrant {
        require(workIds.length == contentTypes.length, "Array length mismatch");
        require(workIds.length == contentHashes.length, "Array length mismatch");
        require(workIds.length == metadataArray.length, "Array length mismatch");
        
        uint256 totalFee = syncFee * workIds.length;
        if (msg.value < totalFee) revert SyncFailed();

        for (uint256 i = 0; i < workIds.length; i++) {
            if (!workSynced[workIds[i]]) {
                _syncSingleWork(workIds[i], contentTypes[i], contentHashes[i], metadataArray[i]);
            }
        }

        // 退还多余费用
        if (msg.value > totalFee) {
            (bool success,) = payable(msg.sender).call{value: msg.value - totalFee}("");
            require(success, "Refund failed");
        }
    }

    /**
     * @notice 获取创作者的社交图谱数据
     */
    function getCreatorSocialGraph(address creator) external view returns (
        address[] memory followers,
        address[] memory following,
        uint256[] memory syncIds,
        CreatorProfile memory profile
    ) {
        return (
            creatorFollowers[creator],
            creatorFollowing[creator],
            creatorSyncs[creator],
            creatorProfiles[creator]
        );
    }

    /**
     * @notice 获取同步状态
     */
    function getSyncStatus(uint256 syncId) external view returns (ContentSync memory) {
        return contentSyncs[syncId];
    }

    /**
     * @notice 检查作品是否已同步
     */
    function isWorkSynced(uint256 workId) external view returns (bool) {
        return workSynced[workId];
    }

    /**
     * @notice 内部函数：触发CyberGraph同步
     */
    function _triggerCyberGraphSync(uint256 syncId) internal {
        contentSyncs[syncId].status = SyncStatus.Syncing;
        
        // 这里可以调用CyberGraph的API或发送跨链消息
        // 实际实现中可能需要使用预言机或中继服务
    }

    /**
     * @notice 内部函数：同步单个作品
     */
    function _syncSingleWork(
        uint256 workId,
        ContentType contentType,
        string memory contentHash,
        string memory metadata
    ) internal {
        // 验证作品存在和权限
        (bool success, bytes memory data) = creationManager.call(
            abi.encodeWithSignature("getWork(uint256)", workId)
        );
        require(success, "Failed to get work");
        
        (, address creator, , , , , bool exists) = abi.decode(
            data, 
            (uint256, address, uint256, uint256, uint256, bool, bool)
        );
        
        if (!exists || creator != msg.sender) return;

        uint256 syncId = nextSyncId++;
        
        contentSyncs[syncId] = ContentSync({
            syncId: syncId,
            workId: workId,
            creator: msg.sender,
            contentType: contentType,
            contentHash: contentHash,
            cyberGraphId: "",
            metadata: metadata,
            status: SyncStatus.Pending,
            createdAt: block.timestamp,
            syncedAt: 0,
            socialConnections: ""
        });

        workSynced[workId] = true;
        creatorSyncs[msg.sender].push(syncId);

        emit ContentSyncInitiated(syncId, workId, msg.sender, contentType, contentHash);
        _triggerCyberGraphSync(syncId);
    }

    /**
     * @notice 设置CyberGraph中继服务地址
     */
    function setCyberGraphRelay(address _cyberGraphRelay) external onlyOwner {
        if (_cyberGraphRelay == address(0)) revert InvalidCyberGraphAddress();
        cyberGraphRelay = _cyberGraphRelay;
        emit CyberGraphRelayUpdated(_cyberGraphRelay);
    }

    /**
     * @notice 设置同步费用
     */
    function setSyncFee(uint256 _syncFee) external onlyOwner {
        syncFee = _syncFee;
    }

    /**
     * @notice 提取合约余额
     */
    function withdraw() external onlyOwner {
        (bool success,) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    // 接收ETH
    receive() external payable {}
}