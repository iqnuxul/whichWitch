const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Integration", function () {
  let paymentManager, creationManager, nftManager, authorizationManager;
  let owner, creator, user;

  beforeEach(async function () {
    [owner, creator, user] = await ethers.getSigners();

    // Deploy PaymentManager
    const PaymentManager = await ethers.getContractFactory("PaymentManager");
    paymentManager = await PaymentManager.deploy(owner.address);
    await paymentManager.waitForDeployment();

    // Deploy CreationManager
    const CreationManager = await ethers.getContractFactory("CreationManager");
    creationManager = await CreationManager.deploy(await paymentManager.getAddress());
    await creationManager.waitForDeployment();

    // Deploy NFTManager
    const NFTManager = await ethers.getContractFactory("NFTManager");
    nftManager = await NFTManager.deploy("whichWitch Works", "WWW", owner.address);
    await nftManager.waitForDeployment();

    // Deploy AuthorizationManager
    const AuthorizationManager = await ethers.getContractFactory("AuthorizationManager");
    authorizationManager = await AuthorizationManager.deploy(
      await creationManager.getAddress(),
      await paymentManager.getAddress()
    );
    await authorizationManager.waitForDeployment();

    // Set up contract relationships
    await creationManager.setAuthorizationManager(await authorizationManager.getAddress());
    await creationManager.setNFTManager(await nftManager.getAddress());
    await nftManager.setCreationManager(await creationManager.getAddress());
    await paymentManager.setCreationManager(await creationManager.getAddress());
    await paymentManager.setAuthorizationManager(await authorizationManager.getAddress());
  });

  describe("Original Work NFT Minting", function () {
    it("Should mint NFT when registering original work", async function () {
      const licenseFee = ethers.parseEther("0.1");
      const metadataURI = "https://example.com/metadata/1";

      // Register original work
      const tx = await creationManager.connect(creator).registerOriginalWork(
        licenseFee,
        true, // derivativeAllowed
        metadataURI
      );

      const receipt = await tx.wait();
      
      // Check if WorkRegistered event was emitted
      const workRegisteredEvent = receipt.logs.find(
        log => log.fragment && log.fragment.name === "WorkRegistered"
      );
      expect(workRegisteredEvent).to.not.be.undefined;
      
      const workId = workRegisteredEvent.args[0];

      // Check if NFT was minted
      expect(await nftManager.isNFTMinted(workId)).to.be.true;
      expect(await nftManager.getWorkNFTOwner(workId)).to.equal(creator.address);
      expect(await nftManager.getWorkMetadataURI(workId)).to.equal(metadataURI);
      expect(await nftManager.tokenURI(workId)).to.equal(metadataURI);
    });

    it("Should mint NFT when registering derivative work", async function () {
      const licenseFee = ethers.parseEther("0.1");
      const parentMetadataURI = "https://example.com/metadata/1";
      const derivativeMetadataURI = "https://example.com/metadata/2";

      // Register original work first
      const tx1 = await creationManager.connect(creator).registerOriginalWork(
        licenseFee,
        true,
        parentMetadataURI
      );
      const receipt1 = await tx1.wait();
      const parentWorkId = receipt1.logs.find(
        log => log.fragment && log.fragment.name === "WorkRegistered"
      ).args[0];

      // Get authorization for derivative work
      await authorizationManager.connect(user).requestAuthorization(parentWorkId, {
        value: licenseFee
      });

      // Register derivative work
      const tx2 = await creationManager.connect(user).registerDerivativeWork(
        parentWorkId,
        ethers.parseEther("0.05"),
        true,
        derivativeMetadataURI
      );
      const receipt2 = await tx2.wait();
      const derivativeWorkId = receipt2.logs.find(
        log => log.fragment && log.fragment.name === "DerivativeWorkRegistered"
      ).args[0];

      // Check if NFT was minted for derivative work
      expect(await nftManager.isNFTMinted(derivativeWorkId)).to.be.true;
      expect(await nftManager.getWorkNFTOwner(derivativeWorkId)).to.equal(user.address);
      expect(await nftManager.getWorkMetadataURI(derivativeWorkId)).to.equal(derivativeMetadataURI);
    });
  });

  describe("NFT Metadata Management", function () {
    let workId;

    beforeEach(async function () {
      const licenseFee = ethers.parseEther("0.1");
      const metadataURI = "https://example.com/metadata/1";

      const tx = await creationManager.connect(creator).registerOriginalWork(
        licenseFee,
        true,
        metadataURI
      );
      const receipt = await tx.wait();
      workId = receipt.logs.find(
        log => log.fragment && log.fragment.name === "WorkRegistered"
      ).args[0];
    });

    it("Should allow NFT owner to update metadata URI", async function () {
      const newMetadataURI = "https://example.com/metadata/updated";

      await nftManager.connect(creator).updateMetadataURI(workId, newMetadataURI);

      expect(await nftManager.getWorkMetadataURI(workId)).to.equal(newMetadataURI);
      expect(await nftManager.tokenURI(workId)).to.equal(newMetadataURI);
    });

    it("Should not allow non-owner to update metadata URI", async function () {
      const newMetadataURI = "https://example.com/metadata/updated";

      await expect(
        nftManager.connect(user).updateMetadataURI(workId, newMetadataURI)
      ).to.be.revertedWith("Not NFT owner");
    });
  });

  describe("NFT Transfer", function () {
    let workId;

    beforeEach(async function () {
      const licenseFee = ethers.parseEther("0.1");
      const metadataURI = "https://example.com/metadata/1";

      const tx = await creationManager.connect(creator).registerOriginalWork(
        licenseFee,
        true,
        metadataURI
      );
      const receipt = await tx.wait();
      workId = receipt.logs.find(
        log => log.fragment && log.fragment.name === "WorkRegistered"
      ).args[0];
    });

    it("Should allow NFT transfer", async function () {
      // Transfer NFT from creator to user
      await nftManager.connect(creator).transferFrom(creator.address, user.address, workId);

      expect(await nftManager.getWorkNFTOwner(workId)).to.equal(user.address);
      expect(await nftManager.ownerOf(workId)).to.equal(user.address);
    });

    it("Should maintain work ownership separate from NFT ownership", async function () {
      // Transfer NFT
      await nftManager.connect(creator).transferFrom(creator.address, user.address, workId);

      // Check that work creator is still the original creator
      const work = await creationManager.getWork(workId);
      expect(work.creator).to.equal(creator.address);

      // But NFT owner is now the user
      expect(await nftManager.getWorkNFTOwner(workId)).to.equal(user.address);
    });
  });

  describe("ERC721 Standard Compliance", function () {
    let workId;

    beforeEach(async function () {
      const licenseFee = ethers.parseEther("0.1");
      const metadataURI = "https://example.com/metadata/1";

      const tx = await creationManager.connect(creator).registerOriginalWork(
        licenseFee,
        true,
        metadataURI
      );
      const receipt = await tx.wait();
      workId = receipt.logs.find(
        log => log.fragment && log.fragment.name === "WorkRegistered"
      ).args[0];
    });

    it("Should support ERC721 interface", async function () {
      // ERC721 interface ID: 0x80ac58cd
      expect(await nftManager.supportsInterface("0x80ac58cd")).to.be.true;
    });

    it("Should have correct name and symbol", async function () {
      expect(await nftManager.name()).to.equal("whichWitch Works");
      expect(await nftManager.symbol()).to.equal("WWW");
    });

    it("Should track balance correctly", async function () {
      expect(await nftManager.balanceOf(creator.address)).to.equal(1);
      expect(await nftManager.balanceOf(user.address)).to.equal(0);
    });
  });
});