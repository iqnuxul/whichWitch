const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("开始部署到 ZetaChain 测试网...");
  console.log("网络:", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ZETA\n");

  // 检查网络
  if (hre.network.name !== 'zeta_testnet') {
    console.error("❌ 请使用 ZetaChain 测试网部署");
    console.log("使用命令: npx hardhat run scripts/deploy-zeta.js --network zeta_testnet");
    process.exit(1);
  }

  try {
    // 1. 部署 PaymentManager
    console.log("=" .repeat(60));
    console.log("1. 部署 PaymentManager...");
    console.log("=".repeat(60));
    
    const platformWallet = deployer.address;
    console.log("Platform wallet:", platformWallet);
    
    const PaymentManager = await hre.ethers.getContractFactory("PaymentManager");
    const paymentManager = await PaymentManager.deploy(platformWallet);
    await paymentManager.waitForDeployment();
    const paymentManagerAddress = await paymentManager.getAddress();
    console.log("✅ PaymentManager 部署成功!");
    console.log("   地址:", paymentManagerAddress);
    console.log();

    // 2. 部署 CreationManager
    console.log("=".repeat(60));
    console.log("2. 部署 CreationManager...");
    console.log("=".repeat(60));
    const CreationManager = await hre.ethers.getContractFactory("CreationManager");
    const creationManager = await CreationManager.deploy(paymentManagerAddress);
    await creationManager.waitForDeployment();
    const creationManagerAddress = await creationManager.getAddress();
    console.log("✅ CreationManager 部署成功!");
    console.log("   地址:", creationManagerAddress);
    console.log();

    // 3. 部署 NFTManager
    console.log("=".repeat(60));
    console.log("3. 部署 NFTManager...");
    console.log("=".repeat(60));
    const NFTManager = await hre.ethers.getContractFactory("NFTManager");
    const nftManager = await NFTManager.deploy(
      "whichWitch Works", 
      "WWW",              
      deployer.address    
    );
    await nftManager.waitForDeployment();
    const nftManagerAddress = await nftManager.getAddress();
    console.log("✅ NFTManager 部署成功!");
    console.log("   地址:", nftManagerAddress);
    console.log();

    // 4. 部署 AuthorizationManager
    console.log("=".repeat(60));
    console.log("4. 部署 AuthorizationManager...");
    console.log("=".repeat(60));
    const AuthorizationManager = await hre.ethers.getContractFactory("AuthorizationManager");
    const authorizationManager = await AuthorizationManager.deploy(
      creationManagerAddress,
      paymentManagerAddress
    );
    await authorizationManager.waitForDeployment();
    const authorizationManagerAddress = await authorizationManager.getAddress();
    console.log("✅ AuthorizationManager 部署成功!");
    console.log("   地址:", authorizationManagerAddress);
    console.log();

    // 5. 部署 NFTMarketplace
    console.log("=".repeat(60));
    console.log("5. 部署 NFTMarketplace...");
    console.log("=".repeat(60));
    const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
    const marketplace = await NFTMarketplace.deploy(
      deployer.address, 
      nftManagerAddress  
    );
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    console.log("✅ NFTMarketplace 部署成功!");
    console.log("   地址:", marketplaceAddress);
    console.log();

    // 6. 部署 ZetaChainBridge
    console.log("=".repeat(60));
    console.log("6. 部署 ZetaChainBridge...");
    console.log("=".repeat(60));
    const ZetaChainBridge = await hre.ethers.getContractFactory("ZetaChainBridge");
    const zetaBridge = await ZetaChainBridge.deploy(
      marketplaceAddress, 
      deployer.address    
    );
    await zetaBridge.waitForDeployment();
    const zetaBridgeAddress = await zetaBridge.getAddress();
    console.log("✅ ZetaChainBridge 部署成功!");
    console.log("   地址:", zetaBridgeAddress);
    console.log();

    // 7. 部署 CyberGraphSync
    console.log("=".repeat(60));
    console.log("7. 部署 CyberGraphSync...");
    console.log("=".repeat(60));
    const CyberGraphSync = await hre.ethers.getContractFactory("CyberGraphSync");
    const cyberGraphSync = await CyberGraphSync.deploy(
      creationManagerAddress, 
      deployer.address,       
      deployer.address        
    );
    await cyberGraphSync.waitForDeployment();
    const cyberGraphSyncAddress = await cyberGraphSync.getAddress();
    console.log("✅ CyberGraphSync 部署成功!");
    console.log("   地址:", cyberGraphSyncAddress);
    console.log();

    // 8. 配置合约关系
    console.log("=".repeat(60));
    console.log("8. 配置合约关系...");
    console.log("=".repeat(60));
    
    console.log("设置 CreationManager 的 AuthorizationManager...");
    const tx1 = await creationManager.setAuthorizationManager(authorizationManagerAddress);
    await tx1.wait();
    console.log("✅ 完成");

    console.log("设置 CreationManager 的 NFTManager...");
    const tx2 = await creationManager.setNFTManager(nftManagerAddress);
    await tx2.wait();
    console.log("✅ 完成");

    console.log("设置 NFTManager 的 CreationManager...");
    const tx3 = await nftManager.setCreationManager(creationManagerAddress);
    await tx3.wait();
    console.log("✅ 完成");

    console.log("设置 PaymentManager 的 CreationManager...");
    const tx4 = await paymentManager.setCreationManager(creationManagerAddress);
    await tx4.wait();
    console.log("✅ 完成");

    console.log("设置 PaymentManager 的 AuthorizationManager...");
    const tx5 = await paymentManager.setAuthorizationManager(authorizationManagerAddress);
    await tx5.wait();
    console.log("✅ 完成");
    console.log();

    // 9. 输出部署摘要
    console.log("=".repeat(60));
    console.log("🎉 ZetaChain 部署完成!");
    console.log("=".repeat(60));
    console.log("合约地址:");
    console.log("-".repeat(60));
    console.log("PaymentManager:       ", paymentManagerAddress);
    console.log("CreationManager:      ", creationManagerAddress);
    console.log("NFTManager:           ", nftManagerAddress);
    console.log("AuthorizationManager: ", authorizationManagerAddress);
    console.log("NFTMarketplace:       ", marketplaceAddress);
    console.log("ZetaChainBridge:      ", zetaBridgeAddress);
    console.log("CyberGraphSync:       ", cyberGraphSyncAddress);
    console.log("=".repeat(60));
    console.log();

    // 10. 保存部署信息
    const deploymentInfo = {
      network: hre.network.name,
      chainId: 7001,
      deployer: deployer.address,
      platformWallet: platformWallet,
      timestamp: new Date().toISOString(),
      contracts: {
        PaymentManager: {
          address: paymentManagerAddress,
          constructorArgs: [platformWallet],
        },
        CreationManager: {
          address: creationManagerAddress,
          constructorArgs: [paymentManagerAddress],
        },
        NFTManager: {
          address: nftManagerAddress,
          constructorArgs: ["whichWitch Works", "WWW", deployer.address],
        },
        AuthorizationManager: {
          address: authorizationManagerAddress,
          constructorArgs: [creationManagerAddress, paymentManagerAddress],
        },
        NFTMarketplace: {
          address: marketplaceAddress,
          constructorArgs: [deployer.address, nftManagerAddress],
        },
        ZetaChainBridge: {
          address: zetaBridgeAddress,
          constructorArgs: [marketplaceAddress, deployer.address],
        },
        CyberGraphSync: {
          address: cyberGraphSyncAddress,
          constructorArgs: [creationManagerAddress, deployer.address, deployer.address],
        },
      },
    };

    const filename = `deployment-zetachain-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
    console.log("📝 部署信息已保存到:", filename);
    console.log();

    // 11. 生成环境变量
    console.log("=".repeat(60));
    console.log("环境变量配置:");
    console.log("=".repeat(60));
    console.log("# 复制以下内容到 .env 文件");
    console.log(`RPC_URL=https://rpc.ankr.com/zetachain_evm_testnet`);
    console.log(`CREATION_MANAGER_ADDRESS=${creationManagerAddress}`);
    console.log(`AUTHORIZATION_MANAGER_ADDRESS=${authorizationManagerAddress}`);
    console.log(`PAYMENT_MANAGER_ADDRESS=${paymentManagerAddress}`);
    console.log(`NFT_MANAGER_ADDRESS=${nftManagerAddress}`);
    console.log(`MARKETPLACE_ADDRESS=${marketplaceAddress}`);
    console.log(`ZETA_BRIDGE_ADDRESS=${zetaBridgeAddress}`);
    console.log(`CYBERGRAPH_SYNC_ADDRESS=${cyberGraphSyncAddress}`);
    console.log();
    
    console.log("# 前端环境变量 (.env.local)");
    console.log(`NEXT_PUBLIC_CHAIN_ID=7001`);
    console.log(`NEXT_PUBLIC_NFT_MANAGER_ADDRESS=${nftManagerAddress}`);
    console.log(`NEXT_PUBLIC_MARKETPLACE_ADDRESS=${marketplaceAddress}`);
    console.log("=".repeat(60));

  } catch (error) {
    console.error("❌ 部署失败:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署脚本执行失败:");
    console.error(error);
    process.exit(1);
  });