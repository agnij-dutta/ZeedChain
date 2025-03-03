import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  EquityNFTFactory,
  DynamicValuation,
  MockV3Aggregator
} from "../typechain-types";

describe("DynamicValuation", function () {
  let dynamicValuation: DynamicValuation;
  let equityNFTFactory: EquityNFTFactory;
  let mockPriceFeed: MockV3Aggregator;
  let owner: SignerWithAddress;
  let founder: SignerWithAddress;
  let nonOwner: SignerWithAddress;
  let startupId: number;

  const STARTUP_NAME = "Test Startup";
  const STARTUP_DESC = "Test Description";
  const TOTAL_SHARES = 1000000;
  const INITIAL_VALUATION = ethers.utils.parseEther("1000000"); // 1M ETH
  const UPDATE_INTERVAL = 86400; // 1 day in seconds

  beforeEach(async function () {
    [owner, founder, nonOwner] = await ethers.getSigners();

    // Deploy mock price feed
    const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
    mockPriceFeed = await MockV3Aggregator.deploy(8, 100000000); // 8 decimals, $1000.00

    // Deploy EquityNFTFactory
    const EquityNFTFactory = await ethers.getContractFactory("EquityNFTFactory");
    equityNFTFactory = await EquityNFTFactory.deploy();

    // Deploy DynamicValuation
    const DynamicValuation = await ethers.getContractFactory("DynamicValuation");
    dynamicValuation = await DynamicValuation.deploy(equityNFTFactory.address);

    // Register a startup
    const tx = await equityNFTFactory.connect(founder).registerStartup(
      STARTUP_NAME,
      STARTUP_DESC,
      TOTAL_SHARES,
      INITIAL_VALUATION
    );
    const receipt = await tx.wait();
    const event = receipt.events?.find(e => e.event === "StartupRegistered");
    startupId = event?.args?.tokenId.toNumber();

    // Add founder as validator
    await equityNFTFactory.addValidator(founder.address);
    
    // Validate startup
    await equityNFTFactory.connect(founder).validateStartup(startupId, true);
  });

  describe("Price Feed Integration", function () {
    it("Should set price feed correctly", async function () {
      await dynamicValuation.setPriceFeed(startupId, mockPriceFeed.address);
      expect(await dynamicValuation.startupPriceFeeds(startupId)).to.equal(mockPriceFeed.address);
    });

    it("Should fail to set price feed from non-owner", async function () {
      await expect(
        dynamicValuation.connect(nonOwner).setPriceFeed(startupId, mockPriceFeed.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Valuation Updates", function () {
    beforeEach(async function () {
      await dynamicValuation.setPriceFeed(startupId, mockPriceFeed.address);
    });

    it("Should update valuation based on price feed", async function () {
      await mockPriceFeed.updateAnswer(120000000); // $1200.00
      await dynamicValuation.updateValuation(startupId);
      
      const startup = await equityNFTFactory.getStartupDetails(startupId);
      expect(startup.valuation).to.equal(120000000);
    });

    it("Should prevent updates within the minimum interval", async function () {
      await dynamicValuation.updateValuation(startupId);
      
      await expect(
        dynamicValuation.updateValuation(startupId)
      ).to.be.revertedWith("Too soon to update");
    });

    it("Should allow update after interval passes", async function () {
      await dynamicValuation.updateValuation(startupId);
      
      // Move time forward
      await ethers.provider.send("evm_increaseTime", [UPDATE_INTERVAL + 1]);
      await ethers.provider.send("evm_mine", []);
      
      // Should now succeed
      await expect(dynamicValuation.updateValuation(startupId)).to.not.be.reverted;
    });
  });

  describe("Price Queries", function () {
    beforeEach(async function () {
      await dynamicValuation.setPriceFeed(startupId, mockPriceFeed.address);
    });

    it("Should get latest valuation", async function () {
      const valuation = await dynamicValuation.getLatestValuation(startupId);
      expect(valuation).to.equal(100000000); // Initial mock price
    });

    it("Should fail getting valuation for non-existent feed", async function () {
      await expect(
        dynamicValuation.getLatestValuation(999)
      ).to.be.revertedWith("Price feed not set");
    });
  });
});