import { ethers } from "hardhat";
import { SEPOLIA } from "../utils/config";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy EquityNFTFactory
  const EquityNFTFactory = await ethers.getContractFactory("EquityNFTFactory");
  const equityNFTFactory = await EquityNFTFactory.deploy();
  await equityNFTFactory.waitForDeployment();
  console.log("EquityNFTFactory deployed to:", await equityNFTFactory.getAddress());

  // Deploy FractionalInvestment
  const FractionalInvestment = await ethers.getContractFactory("FractionalInvestment");
  const fractionalInvestment = await FractionalInvestment.deploy(await equityNFTFactory.getAddress());
  await fractionalInvestment.waitForDeployment();
  console.log("FractionalInvestment deployed to:", await fractionalInvestment.getAddress());

  // Deploy DynamicValuation
  const DynamicValuation = await ethers.getContractFactory("DynamicValuation");
  const dynamicValuation = await DynamicValuation.deploy(await equityNFTFactory.getAddress());
  await dynamicValuation.waitForDeployment();
  console.log("DynamicValuation deployed to:", await dynamicValuation.getAddress());

  // Deploy StartupValidation with initial threshold of 3
  const StartupValidation = await ethers.getContractFactory("StartupValidation");
  const startupValidation = await StartupValidation.deploy(await equityNFTFactory.getAddress(), 3);
  await startupValidation.waitForDeployment();
  console.log("StartupValidation deployed to:", await startupValidation.getAddress());

  // Deploy StakeholderGovernance
  const StakeholderGovernance = await ethers.getContractFactory("StakeholderGovernance");
  const stakeholderGovernance = await StakeholderGovernance.deploy(await fractionalInvestment.getAddress());
  await stakeholderGovernance.waitForDeployment();
  console.log("StakeholderGovernance deployed to:", await stakeholderGovernance.getAddress());

  // Deploy ProfitDistribution
  const ProfitDistribution = await ethers.getContractFactory("ProfitDistribution");
  const profitDistribution = await ProfitDistribution.deploy(await fractionalInvestment.getAddress());
  await profitDistribution.waitForDeployment();
  console.log("ProfitDistribution deployed to:", await profitDistribution.getAddress());

  // Deploy AIAdvisorIntegration
  const AIAdvisorIntegration = await ethers.getContractFactory("AIAdvisorIntegration");
  const aiAdvisor = await AIAdvisorIntegration.deploy(SEPOLIA.LINK_TOKEN, SEPOLIA.CHAINLINK_ORACLE);
  await aiAdvisor.waitForDeployment();
  console.log("AIAdvisorIntegration deployed to:", await aiAdvisor.getAddress());

  // Deploy InvestmentEscrow
  const InvestmentEscrow = await ethers.getContractFactory("InvestmentEscrow");
  const investmentEscrow = await InvestmentEscrow.deploy(await equityNFTFactory.getAddress());
  await investmentEscrow.waitForDeployment();
  console.log("InvestmentEscrow deployed to:", await investmentEscrow.getAddress());

  // Deploy Financial Data Oracle
  const FinancialDataOracle = await ethers.getContractFactory("FinancialDataOracle");
  const financialDataOracle = await FinancialDataOracle.deploy(
    SEPOLIA.LINK_TOKEN,
    SEPOLIA.CHAINLINK_ORACLE
  );
  await financialDataOracle.waitForDeployment();
  console.log("FinancialDataOracle deployed to:", await financialDataOracle.getAddress());

  // Deploy Verification Oracle
  const kycJobId = ethers.encodeBytes32String("kyc-verification-job");
  const amlJobId = ethers.encodeBytes32String("aml-check-job");
  const credentialsJobId = ethers.encodeBytes32String("credentials-validation-job");

  const VerificationOracle = await ethers.getContractFactory("VerificationOracle");
  const verificationOracle = await VerificationOracle.deploy(
    SEPOLIA.LINK_TOKEN,
    SEPOLIA.CHAINLINK_ORACLE,
    kycJobId,
    amlJobId,
    credentialsJobId
  );
  await verificationOracle.waitForDeployment();
  console.log("VerificationOracle deployed to:", await verificationOracle.getAddress());

  // Deploy Performance Metrics Oracle
  const PerformanceMetricsOracle = await ethers.getContractFactory("PerformanceMetricsOracle");
  const performanceMetricsOracle = await PerformanceMetricsOracle.deploy(
    SEPOLIA.LINK_TOKEN,
    SEPOLIA.CHAINLINK_ORACLE
  );
  await performanceMetricsOracle.waitForDeployment();
  console.log("PerformanceMetricsOracle deployed to:", await performanceMetricsOracle.getAddress());

  // Set up roles and permissions
  const VALIDATOR_ROLE = await verificationOracle.VALIDATOR_ROLE();
  const METRICS_PROVIDER_ROLE = await performanceMetricsOracle.METRICS_PROVIDER_ROLE();

  // Grant roles to deployer for initial setup
  await verificationOracle.grantRole(VALIDATOR_ROLE, deployer.address);
  await performanceMetricsOracle.grantRole(METRICS_PROVIDER_ROLE, deployer.address);
  
  // Add deployer as validator in EquityNFTFactory
  await equityNFTFactory.addValidator(deployer.address);

  // Set up price feed for ETH/USD in DynamicValuation
  // This will be used as a base price feed for startup valuations
  await dynamicValuation.setPriceFeed(0, SEPOLIA.ETH_USD_PRICE_FEED);

  console.log("Initial setup completed");

  // Save deployment addresses
  const deployedContracts = {
    equityNFTFactory: await equityNFTFactory.getAddress(),
    fractionalInvestment: await fractionalInvestment.getAddress(),
    dynamicValuation: await dynamicValuation.getAddress(),
    startupValidation: await startupValidation.getAddress(),
    stakeholderGovernance: await stakeholderGovernance.getAddress(),
    profitDistribution: await profitDistribution.getAddress(),
    aiAdvisor: await aiAdvisor.getAddress(),
    investmentEscrow: await investmentEscrow.getAddress(),
    financialDataOracle: await financialDataOracle.getAddress(),
    verificationOracle: await verificationOracle.getAddress(),
    performanceMetricsOracle: await performanceMetricsOracle.getAddress()
  };

  console.log("Deployed contract addresses:", deployedContracts);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });