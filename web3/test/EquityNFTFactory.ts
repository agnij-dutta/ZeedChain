import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { EquityNFTFactory } from "../typechain-types";

describe("EquityNFTFactory", function () {
    let equityNFTFactory: EquityNFTFactory;
    let owner: SignerWithAddress;
    let founder: SignerWithAddress;
    let validator: SignerWithAddress;
    let nonOwner: SignerWithAddress;

    const STARTUP_NAME = "Test Startup";
    const STARTUP_DESC = "Test Description";
    const TOTAL_SHARES = 1000000;
    const INITIAL_VALUATION = ethers.utils.parseEther("1000000"); // 1M ETH

    beforeEach(async function () {
        [owner, founder, validator, nonOwner] = await ethers.getSigners();

        const EquityNFTFactory = await ethers.getContractFactory("EquityNFTFactory");
        equityNFTFactory = await EquityNFTFactory.deploy();

        // Add validator to the validators list
        await equityNFTFactory.addValidator(validator.address);
    });

    describe("Startup Registration", function () {
        it("Should allow startup registration", async function () {
            await expect(
                equityNFTFactory.connect(founder).registerStartup(
                    STARTUP_NAME,
                    STARTUP_DESC,
                    TOTAL_SHARES,
                    INITIAL_VALUATION
                )
            ).to.emit(equityNFTFactory, "StartupRegistered");
        });

        it("Should fail with invalid parameters", async function () {
            await expect(
                equityNFTFactory.connect(founder).registerStartup(
                    "",
                    STARTUP_DESC,
                    TOTAL_SHARES,
                    INITIAL_VALUATION
                )
            ).to.be.revertedWith("Name cannot be empty");

            await expect(
                equityNFTFactory.connect(founder).registerStartup(
                    STARTUP_NAME,
                    STARTUP_DESC,
                    0,
                    INITIAL_VALUATION
                )
            ).to.be.revertedWith("Total shares must be greater than 0");
        });

        it("Should set correct startup details", async function () {
            await equityNFTFactory.connect(founder).registerStartup(
                STARTUP_NAME,
                STARTUP_DESC,
                TOTAL_SHARES,
                INITIAL_VALUATION
            );

            const startup = await equityNFTFactory.getStartupDetails(1);
            expect(startup.name).to.equal(STARTUP_NAME);
            expect(startup.description).to.equal(STARTUP_DESC);
            expect(startup.totalShares).to.equal(TOTAL_SHARES);
            expect(startup.availableShares).to.equal(TOTAL_SHARES);
            expect(startup.valuation).to.equal(INITIAL_VALUATION);
            expect(startup.founder).to.equal(founder.address);
            expect(startup.isValidated).to.be.false;
        });
    });

    describe("Startup Validation", function () {
        let startupId: number;

        beforeEach(async function () {
            const tx = await equityNFTFactory.connect(founder).registerStartup(
                STARTUP_NAME,
                STARTUP_DESC,
                TOTAL_SHARES,
                INITIAL_VALUATION
            );
            const receipt = await tx.wait();
            const event = receipt.events?.find(e => e.event === "StartupRegistered");
            startupId = event?.args?.tokenId.toNumber();
        });

        it("Should allow validation by authorized validator", async function () {
            await expect(
                equityNFTFactory.connect(validator).validateStartup(startupId, true)
            ).to.emit(equityNFTFactory, "StartupValidated");
        });

        it("Should prevent validation by non-validator", async function () {
            await expect(
                equityNFTFactory.connect(nonOwner).validateStartup(startupId, true)
            ).to.be.revertedWith("Not a validator");
        });

        it("Should update validation status correctly", async function () {
            await equityNFTFactory.connect(validator).validateStartup(startupId, true);
            const startup = await equityNFTFactory.getStartupDetails(startupId);
            expect(startup.isValidated).to.be.true;
        });
    });

    describe("Trusted Issuer Management", function () {
        it("Should allow owner to add trusted issuer", async function () {
            await expect(
                equityNFTFactory.connect(owner).addTrustedIssuer(nonOwner.address)
            ).to.emit(equityNFTFactory, "TrustedIssuerAdded");
        });

        it("Should prevent non-owner from adding trusted issuer", async function () {
            await expect(
                equityNFTFactory.connect(nonOwner).addTrustedIssuer(nonOwner.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should allow owner to remove trusted issuer", async function () {
            await equityNFTFactory.connect(owner).addTrustedIssuer(nonOwner.address);
            await expect(
                equityNFTFactory.connect(owner).removeTrustedIssuer(nonOwner.address)
            ).to.emit(equityNFTFactory, "TrustedIssuerRemoved");
        });
    });

    describe("NFT Functionality", function () {
        let startupId: number;

        beforeEach(async function () {
            const tx = await equityNFTFactory.connect(founder).registerStartup(
                STARTUP_NAME,
                STARTUP_DESC,
                TOTAL_SHARES,
                INITIAL_VALUATION
            );
            const receipt = await tx.wait();
            const event = receipt.events?.find(e => e.event === "StartupRegistered");
            startupId = event?.args?.tokenId.toNumber();

            // Validate the startup
            await equityNFTFactory.connect(validator).validateStartup(startupId, true);
        });

        it("Should mint NFTs only through trusted issuer", async function () {
            // Add nonOwner as trusted issuer for testing
            await equityNFTFactory.addTrustedIssuer(nonOwner.address);

            await expect(
                equityNFTFactory.connect(nonOwner).mintShares(startupId, founder.address, 100)
            ).to.emit(equityNFTFactory, "SharesMinted");

            await expect(
                equityNFTFactory.connect(founder).mintShares(startupId, founder.address, 100)
            ).to.be.revertedWith("Not a trusted issuer");
        });

        it("Should transfer NFTs correctly", async function () {
            // Add owner as trusted issuer for testing
            await equityNFTFactory.addTrustedIssuer(owner.address);

            // Mint some shares
            await equityNFTFactory.mintShares(startupId, founder.address, 100);

            // Transfer shares
            await equityNFTFactory.connect(founder).transferShares(
                startupId,
                nonOwner.address,
                50
            );

            const founderShares = await equityNFTFactory.balanceOf(founder.address, startupId);
            const nonOwnerShares = await equityNFTFactory.balanceOf(nonOwner.address, startupId);

            expect(founderShares).to.equal(50);
            expect(nonOwnerShares).to.equal(50);
        });

        it("Should prevent transfer of more shares than owned", async function () {
            // Add owner as trusted issuer for testing
            await equityNFTFactory.addTrustedIssuer(owner.address);

            // Mint some shares
            await equityNFTFactory.mintShares(startupId, founder.address, 100);

            // Attempt to transfer more shares than owned
            await expect(
                equityNFTFactory.connect(founder).transferShares(
                    startupId,
                    nonOwner.address,
                    150
                )
            ).to.be.revertedWith("ERC1155: insufficient balance for transfer");
        });
    });
});