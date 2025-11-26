const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("开始部署 whichWitch 智能合约...");
  console.log("网络:", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

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

  // 3. 部署 AuthorizationManager
  console.log("=".repeat(60));
  console.log("3. 部署 AuthorizationManager...");
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

  // 4. 配置合约关系
  console.log("=".repeat(60));
  console.log("4. 配置合约关系...");
  console.log("=".repeat(60));
  
  console.log("设置 CreationManager 的 AuthorizationManager...");
  const tx1 = await creationManager.setAuthorizationManager(authorizationManagerAddress);
  await tx1.wait();
  console.log("✅ 完成");

  console.log("设置 PaymentManager 的 CreationManager...");
  const tx2 = await paymentManager.setCreationManager(creationManagerAddress);
  await tx2.wait();
  console.log("✅ 完成");
  console.log();

  // 5. 输出部署摘要
  console.log("=".repeat(60));
  console.log("部署完成! 🎉");
  console.log("=".repeat(60));
  console.log("合约地址:");
  console.log("-".repeat(60));
  console.log("PaymentManager:       ", paymentManagerAddress);
  console.log("CreationManager:      ", creationManagerAddress);
  console.log("AuthorizationManager: ", authorizationManagerAddress);
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:");
    console.error(error);
    process.exit(1);
  });
