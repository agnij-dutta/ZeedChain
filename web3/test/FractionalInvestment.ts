import { expect } from "chai";
import { ethers } from "hardhat";
import { FractionalInvestment, EquityNFTFactory } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("FractionalInvestment", function () {
    let fractionalInvestment: FractionalInvestment;
    let equityFactory: EquityNFTFactory;
    let owner: SignerWithAddress;
    let founder: SignerWithAddress;
    let investor: SignerWithAddress;
    let validator: SignerWithAddress;

    beforeEach(async function () {
        [owner, founder, investor, validator] = await ethers.getSigners();
        
        const EquityNFTFactory = await ethers.getContractFactory("EquityNFTFactory");
        equityFactory = await EquityNFTFactory.deploy();
        const FractionalInvestment = await ethers.getContractFactory("FractionalInvestment");
        fractionalInvestment = await FractionalInvestment.deploy(await equityFactory.getAddress());

        // Add validator
        await equityFactory.connect(owner).addValidator(validator.address);
        // Add FractionalInvestment as trusted issuer
        await equityFactory.connect(owner).addTrustedIssuer(await fractionalInvestment.getAddress());
    });

    describe("Investment Flow", function () {
        beforeEach(async function () {
            // Register a startup
            await equityFactory.connect(founder).registerStartup(
                "Test Startup",
                "A test startup description",
                1000, // total shares
                ethers.parseEther("1000") // initial valuation (1000 ETH)
            );

            // Validate the startup
            await equityFactory.connect(validator).validateStartup(1, true);
        });

        it("Should allow investment in startup shares", async function () {
            const investmentAmount = ethers.parseEther("100"); // 100 ETH investment
            
            await expect(
                fractionalInvestment.connect(investor).invest(1, { value: investmentAmount })
            ).to.emit(fractionalInvestment, "InvestmentMade")
                .withArgs(1, investor.address, 100, investmentAmount);

            const shares = await fractionalInvestment.getInvestorShares(1, investor.address);
            expect(shares).to.equal(100);
        });

        it("Should not allow investment in unvalidated startups", async function () {
            // Register another startup but don't validate it
            await equityFactory.connect(founder).registerStartup(
                "Unvalidated Startup",
                "Another test startup",
                1000,
                ethers.parseEther("1000")
            );

            const investmentAmount = ethers.parseEther("100");
            
            await expect(
                fractionalInvestment.connect(investor).invest(2, { value: investmentAmount })
            ).to.be.revertedWith("Startup not validated");
        });

        it("Should track investment history", async function () {
            const investmentAmount = ethers.parseEther("50");
            
            await fractionalInvestment.connect(investor).invest(1, { value: investmentAmount });
            
            const investments = await fractionalInvestment.getInvestmentHistory(1, investor.address);
            expect(investments.length).to.equal(1);
            expect(investments[0].shares).to.equal(50);
            expect(investments[0].investmentAmount).to.equal(investmentAmount);
        });

        it("Should handle multiple investments from same investor", async function () {
            const firstInvestment = ethers.parseEther("50");
            const secondInvestment = ethers.parseEther("30");
            
            await fractionalInvestment.connect(investor).invest(1, { value: firstInvestment });
            await fractionalInvestment.connect(investor).invest(1, { value: secondInvestment });
            
            const shares = await fractionalInvestment.getInvestorShares(1, investor.address);
            expect(shares).to.equal(80); // 50 + 30 shares
        });
    });

    describe("Profit Distribution", function () {
        beforeEach(async function () {
            await equityFactory.connect(founder).registerStartup(
                "Test Startup",
                "A test startup description",
                1000,
                ethers.parseEther("1000")
            );
            await equityFactory.connect(validator).validateStartup(1, true);
            
            // Investor buys 100 shares
            await fractionalInvestment.connect(investor).invest(1, {
                value: ethers.parseEther("100")
            });
        });

        it("Should allow founder to distribute profits", async function () {
            const profitAmount = ethers.parseEther("10");
            const latestBlock = await ethers.provider.getBlock("latest");
            const currentTimestamp = latestBlock!.timestamp;
            
            await expect(
                fractionalInvestment.connect(founder).distributeProfit(1, {
                    value: profitAmount
                })
            ).to.emit(fractionalInvestment, "ProfitDistributed")
                .withArgs(1, profitAmount, (timestamp: bigint) => {
                    // Allow 2 second difference to account for block time variations
                    return Math.abs(Number(timestamp) - Number(currentTimestamp)) <= 2;
                });
        });

        it("Should not allow non-founders to distribute profits", async function () {
            const profitAmount = ethers.parseEther("10");
            
            await expect(
                fractionalInvestment.connect(investor).distributeProfit(1, {
                    value: profitAmount
                })
            ).to.be.revertedWith("Only founder can distribute profits");
        });
    });
});