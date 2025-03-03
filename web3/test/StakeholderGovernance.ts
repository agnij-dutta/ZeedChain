import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  EquityNFTFactory,
  FractionalInvestment,
  StakeholderGovernance
} from "../typechain-types";

describe("StakeholderGovernance", function () {
  let stakeholderGovernance: StakeholderGovernance;
  let equityNFTFactory: EquityNFTFactory;
  let fractionalInvestment: FractionalInvestment;
  let owner: SignerWithAddress;
  let investor1: SignerWithAddress;
  let investor2: SignerWithAddress;
  let investor3: SignerWithAddress;
  let startupId: number;

  const STARTUP_NAME = "Test Startup";
  const STARTUP_DESC = "Test Description";
  const TOTAL_SHARES = 1000000;
  const INITIAL_VALUATION = ethers.utils.parseEther("1000000"); // 1M ETH
  const VOTING_PERIOD = 7 * 24 * 60 * 60; // 7 days in seconds

  beforeEach(async function () {
    [owner, investor1, investor2, investor3] = await ethers.getSigners();

    // Deploy EquityNFTFactory
    const EquityNFTFactory = await ethers.getContractFactory("EquityNFTFactory");
    equityNFTFactory = await EquityNFTFactory.deploy();

    // Deploy FractionalInvestment
    const FractionalInvestment = await ethers.getContractFactory("FractionalInvestment");
    fractionalInvestment = await FractionalInvestment.deploy(equityNFTFactory.address);

    // Deploy StakeholderGovernance
    const StakeholderGovernance = await ethers.getContractFactory("StakeholderGovernance");
    stakeholderGovernance = await StakeholderGovernance.deploy(fractionalInvestment.address);

    // Register and validate a startup
    const registerTx = await equityNFTFactory.registerStartup(
      STARTUP_NAME,
      STARTUP_DESC,
      TOTAL_SHARES,
      INITIAL_VALUATION
    );
    const receipt = await registerTx.wait();
    const event = receipt.events?.find(e => e.event === "StartupRegistered");
    startupId = event?.args?.tokenId.toNumber();

    // Add owner as validator and validate startup
    await equityNFTFactory.addValidator(owner.address);
    await equityNFTFactory.validateStartup(startupId, true);

    // Add FractionalInvestment as trusted issuer
    await equityNFTFactory.addTrustedIssuer(fractionalInvestment.address);

    // Invest with different investors
    const investAmount = ethers.utils.parseEther("100");
    await fractionalInvestment.connect(investor1).invest(startupId, { value: investAmount });
    await fractionalInvestment.connect(investor2).invest(startupId, { value: investAmount });
    await fractionalInvestment.connect(investor3).invest(startupId, { value: investAmount });
  });

  describe("Proposal Creation", function () {
    it("Should allow shareholders to create proposals", async function () {
      const description = "Test Proposal";
      await expect(
        stakeholderGovernance.connect(investor1).createProposal(startupId, description)
      ).to.not.be.reverted;
    });

    it("Should fail if creator has no shares", async function () {
      const nonInvestor = (await ethers.getSigners())[4];
      await expect(
        stakeholderGovernance.connect(nonInvestor).createProposal(startupId, "Test")
      ).to.be.revertedWith("No shares owned");
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      await stakeholderGovernance.connect(investor1).createProposal(startupId, "Test Proposal");
    });

    it("Should allow shareholders to vote", async function () {
      await expect(
        stakeholderGovernance.connect(investor2).vote(0, true)
      ).to.not.be.reverted;
    });

    it("Should prevent double voting", async function () {
      await stakeholderGovernance.connect(investor2).vote(0, true);
      await expect(
        stakeholderGovernance.connect(investor2).vote(0, true)
      ).to.be.revertedWith("Already voted");
    });

    it("Should prevent voting after deadline", async function () {
      // Move time forward past voting period
      await ethers.provider.send("evm_increaseTime", [VOTING_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        stakeholderGovernance.connect(investor2).vote(0, true)
      ).to.be.revertedWith("Voting period ended");
    });
  });

  describe("Proposal Execution", function () {
    beforeEach(async function () {
      await stakeholderGovernance.connect(investor1).createProposal(startupId, "Test Proposal");
      await stakeholderGovernance.connect(investor1).vote(0, true);
      await stakeholderGovernance.connect(investor2).vote(0, true);
    });

    it("Should allow execution after voting period", async function () {
      await ethers.provider.send("evm_increaseTime", [VOTING_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        stakeholderGovernance.executeProposal(0)
      ).to.not.be.reverted;
    });

    it("Should prevent multiple executions", async function () {
      await ethers.provider.send("evm_increaseTime", [VOTING_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);

      await stakeholderGovernance.executeProposal(0);
      await expect(
        stakeholderGovernance.executeProposal(0)
      ).to.be.revertedWith("Already executed");
    });
  });

  describe("Vote Weight", function () {
    it("Should weight votes by shares held", async function () {
      // Invest different amounts
      await fractionalInvestment.connect(investor1).invest(startupId, {
        value: ethers.utils.parseEther("200")
      });
      await fractionalInvestment.connect(investor2).invest(startupId, {
        value: ethers.utils.parseEther("100")
      });

      await stakeholderGovernance.connect(investor1).createProposal(startupId, "Test Proposal");
      
      await stakeholderGovernance.connect(investor1).vote(0, true);
      await stakeholderGovernance.connect(investor2).vote(0, false);

      const proposal = await stakeholderGovernance.getProposal(0);
      expect(proposal.votesFor).to.be.gt(proposal.votesAgainst);
    });
  });
});