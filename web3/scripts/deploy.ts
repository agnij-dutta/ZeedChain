import { ethers } from "hardhat";
import { getConfigValue } from "../utils/config";

async function main() {
  console.log("Starting deployment...");

  // For local development, use mock address for oracle
  const mockOracle = "0x0000000000000000000000000000000000000002";

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

  // Deploy AIAdvisorIntegration with mock oracle address for local development
  const AIAdvisorIntegration = await ethers.getContractFactory("AIAdvisorIntegration");
  const aiAdvisorIntegration = await AIAdvisorIntegration.deploy(mockOracle);
  await aiAdvisorIntegration.waitForDeployment();
  console.log("AIAdvisorIntegration deployed to:", await aiAdvisorIntegration.getAddress());

  // Setup contract permissions
  console.log("\nSetting up contract permissions...");

  // Add FractionalInvestment as trusted issuer in EquityNFTFactory
  const addIssuerTx = await equityNFTFactory.addTrustedIssuer(await fractionalInvestment.getAddress());
  await addIssuerTx.wait();
  console.log("Added FractionalInvestment as trusted issuer");

  // Add StartupValidation as validator in EquityNFTFactory
  const addValidatorTx = await equityNFTFactory.addValidator(await startupValidation.getAddress());
  await addValidatorTx.wait();
  console.log("Added StartupValidation as validator");

  console.log("\nDeployment completed successfully!");

  // Return all deployed addresses for frontend configuration
  return {
    equityNFTFactory: await equityNFTFactory.getAddress(),
    fractionalInvestment: await fractionalInvestment.getAddress(),
    dynamicValuation: await dynamicValuation.getAddress(),
    startupValidation: await startupValidation.getAddress(),
    stakeholderGovernance: await stakeholderGovernance.getAddress(),
    profitDistribution: await profitDistribution.getAddress(),
    aiAdvisorIntegration: await aiAdvisorIntegration.getAddress(),
  };
}

main()
  .then((addresses) => {
    console.log("\nDeployed contract addresses:");
    console.log(JSON.stringify(addresses, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });