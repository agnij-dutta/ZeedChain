import { expect } from "chai";
import { ethers } from "hardhat";
import { EquityNFTFactory } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("EquityNFTFactory", function () {
    let equityFactory: EquityNFTFactory;
    let owner: SignerWithAddress;
    let validator: SignerWithAddress;
    let founder: SignerWithAddress;
    let investor: SignerWithAddress;

    beforeEach(async function () {
        [owner, validator, founder, investor] = await ethers.getSigners();
        
        const EquityNFTFactory = await ethers.getContractFactory("EquityNFTFactory");
        equityFactory = await EquityNFTFactory.deploy();
        await equityFactory.waitForDeployment();
    });

    describe("Startup Registration", function () {
        it("Should register a new startup", async function () {
            const tx = await equityFactory.connect(founder).registerStartup(
                "Test Startup",
                "A test startup description",
                1000, // total shares
                ethers.parseEther("1000") // initial valuation
            );

            const receipt = await tx.wait();
            const startupId = 1; // First token ID

            const startup = await equityFactory.startups(startupId);
            expect(startup.name).to.equal("Test Startup");
            expect(startup.totalShares).to.equal(1000);
            expect(startup.founder).to.equal(founder.address);
            expect(startup.isValidated).to.be.false;
        });
    });

    describe("Validation", function () {
        it("Should allow validator to validate startup", async function () {
            await equityFactory.connect(owner).addValidator(validator.address);
            
            await equityFactory.connect(founder).registerStartup(
                "Test Startup",
                "A test startup description",
                1000,
                ethers.parseEther("1000")
            );

            await equityFactory.connect(validator).validateStartup(1, true);
            
            const startup = await equityFactory.startups(1);
            expect(startup.isValidated).to.be.true;
        });

        it("Should not allow non-validators to validate startup", async function () {
            await equityFactory.connect(founder).registerStartup(
                "Test Startup",
                "A test startup description",
                1000,
                ethers.parseEther("1000")
            );

            await expect(
                equityFactory.connect(investor).validateStartup(1, true)
            ).to.be.revertedWith("Not authorized validator");
        });
    });

    describe("Share Management", function () {
        beforeEach(async function () {
            await equityFactory.connect(founder).registerStartup(
                "Test Startup",
                "A test startup description",
                1000,
                ethers.parseEther("1000")
            );
            await equityFactory.connect(owner).addValidator(validator.address);
            await equityFactory.connect(validator).validateStartup(1, true);
        });

        it("Should allow founder to issue shares", async function () {
            await equityFactory.connect(founder).issueShares(1, investor.address, 100);
            
            const startup = await equityFactory.startups(1);
            expect(startup.availableShares).to.equal(900);
        });

        it("Should not allow non-founders to issue shares", async function () {
            await expect(
                equityFactory.connect(investor).issueShares(1, investor.address, 100)
            ).to.be.revertedWith("Only founder or trusted issuer can issue shares");
        });
    });

    describe("Valuation Updates", function () {
        beforeEach(async function () {
            await equityFactory.connect(founder).registerStartup(
                "Test Startup",
                "A test startup description",
                1000,
                ethers.parseEther("1000")
            );
            await equityFactory.connect(owner).addValidator(validator.address);
            await equityFactory.connect(validator).validateStartup(1, true);
        });

        it("Should allow founder to update valuation", async function () {
            const newValuation = ethers.parseEther("2000");
            await equityFactory.connect(founder).updateValuation(1, newValuation);
            
            const startup = await equityFactory.startups(1);
            expect(startup.valuation).to.equal(newValuation);
        });

        it("Should not allow non-founders to update valuation", async function () {
            await expect(
                equityFactory.connect(investor).updateValuation(1, ethers.parseEther("2000"))
            ).to.be.revertedWith("Only founder can update valuation");
        });
    });
});