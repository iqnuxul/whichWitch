const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", (await deployer.getBalance()).toString());

  // 部署 AuthorizationManager
  const AuthorizationManager = await ethers.getContractFactory("AuthorizationManager");
  const authorizationManager = await AuthorizationManager.deploy();
  await authorizationManager.deployed();
  console.log("AuthorizationManager 部署到:", authorizationManager.address);

  // 部署 PaymentManager
  const PaymentManager = await ethers.getContractFactory("PaymentManager");
  const paymentManager = await PaymentManager.deploy();
  await paymentManager.deployed();
  console.log("PaymentManager 部署到:", paymentManager.address);

  // 部署 CreationManager
  const CreationManager = await ethers.getContractFactory("CreationManager");
  const creationManager = await CreationManager.deploy(
    authorizationManager.address,
    paymentManager.address
  );
  await creationManager.deployed();
  console.log("CreationManager 部署到:", creationManager.address);

  // 部署 NFTManager
  const NFTManager = await ethers.getContractFactory("NFTManager");
  const nftManager = await NFTManager.deploy();
  await nftManager.deployed();
  console.log("NFTManager 部署到:", nftManager.address);

  // 部署 NFTMarketplace
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  await nftMarketplace.deployed();
  console.log("NFTMarketplace 部署到:", nftMarketplace.address);

  console.log("\n部署完成！");
  console.log("请将以下地址更新到 .env 文件中:");
  console.log(`CREATION_MANAGER_ADDRESS=${creationManager.address}`);
  console.log(`AUTHORIZATION_MANAGER_ADDRESS=${authorizationManager.address}`);
  console.log(`PAYMENT_MANAGER_ADDRESS=${paymentManager.address}`);
  console.log(`NFT_MANAGER_ADDRESS=${nftManager.address}`);
  console.log(`MARKETPLACE_ADDRESS=${nftMarketplace.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });