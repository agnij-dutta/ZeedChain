import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  EquityNFTFactory,
  FractionalInvestment
} from "../typechain-types";

describe("FractionalInvestment", function () {
  let equityNFTFactory: EquityNFTFactory;
  let fractionalInvestment: FractionalInvestment;
  let owner: SignerWithAddress;
  let founder: SignerWithAddress;
  let investor1: SignerWithAddress;
  let investor2: SignerWithAddress;
  let startupId: number;

  const STARTUP_NAME = "Test Startup";
  const STARTUP_DESC = "Test Description";
  const TOTAL_SHARES = 1000000;
  const INITIAL_VALUATION = ethers.parseEther("1000000"); // 1M ETH
  const INVESTMENT_AMOUNT = ethers.parseEther("10"); // 10 ETH

  beforeEach(async function () {
    [owner, founder, investor1, investor2] = await ethers.getSigners();

    // Deploy EquityNFTFactory
    const EquityNFTFactory = await ethers.getContractFactory("EquityNFTFactory");
    equityNFTFactory = await EquityNFTFactory.deploy();

    // Deploy FractionalInvestment
    const FractionalInvestment = await ethers.getContractFactory("FractionalInvestment");
    fractionalInvestment = await FractionalInvestment.deploy(await equityNFTFactory.getAddress());

    // Add FractionalInvestment as trusted issuer
    await equityNFTFactory.addTrustedIssuer(await fractionalInvestment.getAddress());

    // Register a startup
    const tx = await equityNFTFactory.connect(founder).registerStartup(
      STARTUP_NAME,
      STARTUP_DESC,
      TOTAL_SHARES,
      INITIAL_VALUATION
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find((e: any) => e.eventName === "StartupRegistered");
    startupId = event?.args?.tokenId?.toString();

    // Add owner as validator and validate startup
    await equityNFTFactory.addValidator(owner.address);
    await equityNFTFactory.validateStartup(startupId, true);
  });

  describe("Investment", function () {
    it("Should allow investment in validated startups", async function () {
      await expect(
        fractionalInvestment.connect(investor1).invest(startupId, {
          value: INVESTMENT_AMOUNT
        })
      ).to.not.be.reverted;

      const shares = await fractionalInvestment.getInvestorShares(startupId, investor1.address);
      expect(shares).to.be.gt(0);
    });

    it("Should fail investment in non-validated startups", async function () {
      const invalidStartupId = 999;
      await expect(
        fractionalInvestment.connect(investor1).invest(invalidStartupId, {
          value: INVESTMENT_AMOUNT
        })
      ).to.be.revertedWith("Startup does not exist");
    });

    it("Should calculate shares correctly based on investment amount", async function () {
      await fractionalInvestment.connect(investor1).invest(startupId, {
        value: INVESTMENT_AMOUNT
      });

      const expectedShares = INVESTMENT_AMOUNT * BigInt(TOTAL_SHARES) / INITIAL_VALUATION;
      const actualShares = await fractionalInvestment.getInvestorShares(startupId, investor1.address);
      expect(actualShares).to.equal(expectedShares);
    });

    it("Should update total investment and shares correctly", async function () {
      await fractionalInvestment.connect(investor1).invest(startupId, {
        value: INVESTMENT_AMOUNT
      });

      await fractionalInvestment.connect(investor2).invest(startupId, {
        value: INVESTMENT_AMOUNT * 2n
      });

      const totalInvestment = await fractionalInvestment.getTotalInvestment(startupId);
      expect(totalInvestment).to.equal(INVESTMENT_AMOUNT * 3n);

      const startup = await equityNFTFactory.getStartupDetails(startupId);
      const expectedAvailableShares = BigInt(TOTAL_SHARES) - 
        (INVESTMENT_AMOUNT * 3n * BigInt(TOTAL_SHARES)) / INITIAL_VALUATION;
      expect(startup.availableShares).to.equal(expectedAvailableShares);
    });
  });

  describe("Share Price Tracking", function () {
    it("Should track share price changes over time", async function () {
      // Make initial investment
      await fractionalInvestment.connect(investor1).invest(startupId, {
        value: INVESTMENT_AMOUNT
      });

      const initialSharePrice = INITIAL_VALUATION / BigInt(TOTAL_SHARES);
      const firstInvestorShares = await fractionalInvestment.getInvestorShares(startupId, investor1.address);
      expect(firstInvestorShares * initialSharePrice).to.equal(INVESTMENT_AMOUNT);
    });
  });

  describe("Profit Distribution", function () {
    beforeEach(async function () {
      // Make investments before testing profit distribution
      await fractionalInvestment.connect(investor1).invest(startupId, {
        value: INVESTMENT_AMOUNT
      });
      await fractionalInvestment.connect(investor2).invest(startupId, {
        value: INVESTMENT_AMOUNT
      });
    });

    it("Should allow founder to distribute profits", async function () {
      const profitAmount = ethers.parseEther("1");
      await expect(
        fractionalInvestment.connect(founder).distributeProfit(startupId, {
          value: profitAmount
        })
      ).to.emit(fractionalInvestment, "ProfitDistributed");
    });

    it("Should prevent non-founder from distributing profits", async function () {
      const profitAmount = ethers.parseEther("1");
      await expect(
        fractionalInvestment.connect(investor1).distributeProfit(startupId, {
          value: profitAmount
        })
      ).to.be.revertedWith("Only founder can distribute profits");
    });
  });
});