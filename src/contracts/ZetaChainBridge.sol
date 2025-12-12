// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ZetaChainBridge
 * @notice ZetaChain跨链支付桥接合约
 * @dev 处理跨链支付和资产转移
 */
contract ZetaChainBridge is ReentrancyGuard {
    // 自定义错误
    error InvalidChain();
    error InsufficientAmount();
    error TransferFailed();
    error UnauthorizedCaller();
    error InvalidRecipient();

    // 跨链支付结构体
    struct CrossChainPayment {
        uint256 paymentId;
        string sourceChain;
        string destinationChain;
        address sender;
        address recipient;
        uint256 amount;
        uint256 fee;
        bytes32 txHash;
        uint256 timestamp;
        PaymentStatus status;
    }

    // 支付状态枚举
    enum PaymentStatus {
        Pending,    // 待处理
        Confirmed,  // 已确认
        Completed,  // 已完成
        Failed      // 失败
    }

    // 状态变量
    mapping(uint256 => CrossChainPayment) public payments;
    mapping(string => bool) public supportedChains;
    mapping(string => uint256) public chainFees; // 每条链的手续费
    mapping(address => bool) public authorizedRelayers;
    
    uint256 public nextPaymentId = 1;
    address public marketplace;
    address public feeCollector;
    uint256 public baseFee = 0.001 ether; // 基础手续费

    // 事件
    event CrossChainPaymentInitiated(
        uint256 indexed paymentId,
        string sourceChain,
        string destinationChain,
        address indexed sender,
        address indexed recipient,
        uint256 amount
    );

    event CrossChainPaymentConfirmed(
        uint256 indexed paymentId,
        bytes32 txHash
    );

    event CrossChainPaymentCompleted(
        uint256 indexed paymentId,
        address indexed recipient,
        uint256 amount
    );

    event ChainAdded(string chain, uint256 fee);
    event RelayerAuthorized(address indexed relayer);

    constructor(address _marketplace, address _feeCollector) {
        marketplace = _marketplace;
        feeCollector = _feeCollector;
        authorizedRelayers[msg.sender] = true;
        
        // 初始化支持的链
        supportedChains["ethereum"] = true;
        supportedChains["bsc"] = true;
        supportedChains["polygon"] = true;
        supportedChains["bitcoin"] = true;
        
        // 设置各链手续费
        chainFees["ethereum"] = 0.005 ether;
        chainFees["bsc"] = 0.001 ether;
        chainFees["polygon"] = 0.001 ether;
        chainFees["bitcoin"] = 0.01 ether;
    }

    /**
     * @notice 发起跨链支付
     */
    function initiateCrossChainPayment(
        string calldata sourceChain,
        string calldata destinationChain,
        address recipient,
        uint256 listingId
    ) external payable nonReentrant {
        if (!supportedChains[sourceChain] || !supportedChains[destinationChain]) {
            revert InvalidChain();
        }
        if (recipient == address(0)) revert InvalidRecipient();
        
        uint256 fee = chainFees[sourceChain] + baseFee;
        if (msg.value <= fee) revert InsufficientAmount();
        
        uint256 amount = msg.value - fee;
        uint256 paymentId = nextPaymentId++;
        
        payments[paymentId] = CrossChainPayment({
            paymentId: paymentId,
            sourceChain: sourceChain,
            destinationChain: destinationChain,
            sender: msg.sender,
            recipient: recipient,
            amount: amount,
            fee: fee,
            txHash: bytes32(0),
            timestamp: block.timestamp,
            status: PaymentStatus.Pending
        });
        
        // 收取手续费
        (bool success,) = payable(feeCollector).call{value: fee}("");
        if (!success) revert TransferFailed();
        
        emit CrossChainPaymentInitiated(
            paymentId,
            sourceChain,
            destinationChain,
            msg.sender,
            recipient,
            amount
        );
        
        // 如果是本链交易，直接处理
        if (keccak256(bytes(destinationChain)) == keccak256(bytes("zetachain"))) {
            _processLocalPayment(paymentId, listingId);
        }
    }

    /**
     * @notice 确认跨链支付（由中继器调用）
     */
    function confirmCrossChainPayment(
        uint256 paymentId,
        bytes32 txHash
    ) external {
        if (!authorizedRelayers[msg.sender]) revert UnauthorizedCaller();
        
        CrossChainPayment storage payment = payments[paymentId];
        require(payment.status == PaymentStatus.Pending, "Invalid status");
        
        payment.txHash = txHash;
        payment.status = PaymentStatus.Confirmed;
        
        emit CrossChainPaymentConfirmed(paymentId, txHash);
    }

    /**
     * @notice 完成跨链支付
     */
    function completeCrossChainPayment(
        uint256 paymentId,
        uint256 listingId
    ) external nonReentrant {
        if (!authorizedRelayers[msg.sender]) revert UnauthorizedCaller();
        
        CrossChainPayment storage payment = payments[paymentId];
        require(payment.status == PaymentStatus.Confirmed, "Payment not confirmed");
        
        payment.status = PaymentStatus.Completed;
        
        // 调用市场合约处理支付
        (bool success,) = marketplace.call{value: payment.amount}(
            abi.encodeWithSignature(
                "processCrossChainPayment(uint256,address,uint256,string)",
                listingId,
                payment.sender,
                payment.amount,
                payment.sourceChain
            )
        );
        
        if (!success) {
            payment.status = PaymentStatus.Failed;
            // 退款
            (bool refundSuccess,) = payable(payment.sender).call{value: payment.amount}("");
            if (!refundSuccess) revert TransferFailed();
        } else {
            emit CrossChainPaymentCompleted(paymentId, payment.recipient, payment.amount);
        }
    }

    /**
     * @notice 处理本链支付
     */
    function _processLocalPayment(uint256 paymentId, uint256 listingId) internal {
        CrossChainPayment storage payment = payments[paymentId];
        payment.status = PaymentStatus.Completed;
        
        // 直接调用市场合约
        (bool success,) = marketplace.call{value: payment.amount}(
            abi.encodeWithSignature(
                "processCrossChainPayment(uint256,address,uint256,string)",
                listingId,
                payment.sender,
                payment.amount,
                payment.sourceChain
            )
        );
        
        if (!success) {
            payment.status = PaymentStatus.Failed;
            (bool refundSuccess,) = payable(payment.sender).call{value: payment.amount}("");
            if (!refundSuccess) revert TransferFailed();
        } else {
            emit CrossChainPaymentCompleted(paymentId, payment.recipient, payment.amount);
        }
    }

    /**
     * @notice 添加支持的链
     */
    function addSupportedChain(string calldata chain, uint256 fee) external {
        require(authorizedRelayers[msg.sender], "Unauthorized");
        supportedChains[chain] = true;
        chainFees[chain] = fee;
        emit ChainAdded(chain, fee);
    }

    /**
     * @notice 授权中继器
     */
    function authorizeRelayer(address relayer) external {
        require(authorizedRelayers[msg.sender], "Unauthorized");
        authorizedRelayers[relayer] = true;
        emit RelayerAuthorized(relayer);
    }

    /**
     * @notice 设置基础手续费
     */
    function setBaseFee(uint256 _baseFee) external {
        require(authorizedRelayers[msg.sender], "Unauthorized");
        baseFee = _baseFee;
    }

    /**
     * @notice 获取支付信息
     */
    function getPayment(uint256 paymentId) external view returns (CrossChainPayment memory) {
        return payments[paymentId];
    }

    /**
     * @notice 计算跨链支付费用
     */
    function calculateFee(string calldata sourceChain) external view returns (uint256) {
        return chainFees[sourceChain] + baseFee;
    }

    /**
     * @notice 紧急提取
     */
    function emergencyWithdraw() external {
        require(authorizedRelayers[msg.sender], "Unauthorized");
        (bool success,) = payable(feeCollector).call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    // 接收ETH
    receive() external payable {}
}