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
  const INITIAL_VALUATION = ethers.utils.parseEther("1000000"); // 1M ETH
  const INVESTMENT_AMOUNT = ethers.utils.parseEther("10"); // 10 ETH

  beforeEach(async function () {
    [owner, founder, investor1, investor2] = await ethers.getSigners();

    // Deploy EquityNFTFactory
    const EquityNFTFactory = await ethers.getContractFactory("EquityNFTFactory");
    equityNFTFactory = await EquityNFTFactory.deploy();

    // Deploy FractionalInvestment
    const FractionalInvestment = await ethers.getContractFactory("FractionalInvestment");
    fractionalInvestment = await FractionalInvestment.deploy(equityNFTFactory.address);

    // Add FractionalInvestment as trusted issuer
    await equityNFTFactory.addTrustedIssuer(fractionalInvestment.address);

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
      ).to.be.revertedWith("Startup not found or not validated");
    });

    it("Should calculate shares correctly based on investment amount", async function () {
      await fractionalInvestment.connect(investor1).invest(startupId, {
        value: INVESTMENT_AMOUNT
      });

      const expectedShares = INVESTMENT_AMOUNT.mul(TOTAL_SHARES).div(INITIAL_VALUATION);
      const actualShares = await fractionalInvestment.getInvestorShares(startupId, investor1.address);
      expect(actualShares).to.equal(expectedShares);
    });

    it("Should update total investment and shares correctly", async function () {
      await fractionalInvestment.connect(investor1).invest(startupId, {
        value: INVESTMENT_AMOUNT
      });

      await fractionalInvestment.connect(investor2).invest(startupId, {
        value: INVESTMENT_AMOUNT.mul(2)
      });

      const totalInvestment = await fractionalInvestment.getTotalInvestment(startupId);
      expect(totalInvestment).to.equal(INVESTMENT_AMOUNT.mul(3));

      const startup = await equityNFTFactory.getStartupDetails(startupId);
      const expectedAvailableShares = TOTAL_SHARES
        .sub(INVESTMENT_AMOUNT.mul(3).mul(TOTAL_SHARES).div(INITIAL_VALUATION));
      expect(startup.availableShares).to.equal(expectedAvailableShares);
    });
  });

  describe("Share Management", function () {
    beforeEach(async function () {
      await fractionalInvestment.connect(investor1).invest(startupId, {
        value: INVESTMENT_AMOUNT
      });
    });

    it("Should track individual investor shares correctly", async function () {
      const shares = await fractionalInvestment.getInvestorShares(startupId, investor1.address);
      const expectedShares = INVESTMENT_AMOUNT.mul(TOTAL_SHARES).div(INITIAL_VALUATION);
      expect(shares).to.equal(expectedShares);
    });

    it("Should prevent transfer of more shares than owned", async function () {
      const shares = await fractionalInvestment.getInvestorShares(startupId, investor1.address);
      await expect(
        fractionalInvestment.connect(investor1).transferShares(startupId, investor2.address, shares.add(1))
      ).to.be.revertedWith("Insufficient shares");
    });

    it("Should allow transfer of shares between investors", async function () {
      const initialShares = await fractionalInvestment.getInvestorShares(startupId, investor1.address);
      const transferAmount = initialShares.div(2);

      await fractionalInvestment.connect(investor1).transferShares(
        startupId,
        investor2.address,
        transferAmount
      );

      const finalSharesInvestor1 = await fractionalInvestment.getInvestorShares(startupId, investor1.address);
      const finalSharesInvestor2 = await fractionalInvestment.getInvestorShares(startupId, investor2.address);

      expect(finalSharesInvestor1).to.equal(initialShares.sub(transferAmount));
      expect(finalSharesInvestor2).to.equal(transferAmount);
    });
  });

  describe("Investment Limits", function () {
    it("Should enforce minimum investment amount", async function () {
      const tooSmall = ethers.utils.parseEther("0.0001");
      await expect(
        fractionalInvestment.connect(investor1).invest(startupId, {
          value: tooSmall
        })
      ).to.be.revertedWith("Investment amount too low");
    });

    it("Should not exceed total available shares", async function () {
      const tooLarge = INITIAL_VALUATION.mul(2);
      await expect(
        fractionalInvestment.connect(investor1).invest(startupId, {
          value: tooLarge
        })
      ).to.be.revertedWith("Not enough shares available");
    });
  });
});