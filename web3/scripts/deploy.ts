import { ethers } from "hardhat";
import { getConfigValue } from "../utils/config";

async function main() {
  console.log("Starting deployment...");

  // Deploy EquityNFTFactory
  const EquityNFTFactory = await ethers.getContractFactory("EquityNFTFactory");
  const equityNFTFactory = await EquityNFTFactory.deploy();
  await equityNFTFactory.deployed();
  console.log("EquityNFTFactory deployed to:", equityNFTFactory.address);

  // Deploy FractionalInvestment
  const FractionalInvestment = await ethers.getContractFactory("FractionalInvestment");
  const fractionalInvestment = await FractionalInvestment.deploy(equityNFTFactory.address);
  await fractionalInvestment.deployed();
  console.log("FractionalInvestment deployed to:", fractionalInvestment.address);

  // Deploy DynamicValuation
  const DynamicValuation = await ethers.getContractFactory("DynamicValuation");
  const dynamicValuation = await DynamicValuation.deploy(equityNFTFactory.address);
  await dynamicValuation.deployed();
  console.log("DynamicValuation deployed to:", dynamicValuation.address);

  // Deploy StartupValidation with initial threshold of 3
  const StartupValidation = await ethers.getContractFactory("StartupValidation");
  const startupValidation = await StartupValidation.deploy(equityNFTFactory.address, 3);
  await startupValidation.deployed();
  console.log("StartupValidation deployed to:", startupValidation.address);

  // Deploy StakeholderGovernance
  const StakeholderGovernance = await ethers.getContractFactory("StakeholderGovernance");
  const stakeholderGovernance = await StakeholderGovernance.deploy(fractionalInvestment.address);
  await stakeholderGovernance.deployed();
  console.log("StakeholderGovernance deployed to:", stakeholderGovernance.address);

  // Deploy ProfitDistribution
  const ProfitDistribution = await ethers.getContractFactory("ProfitDistribution");
  const profitDistribution = await ProfitDistribution.deploy(fractionalInvestment.address);
  await profitDistribution.deployed();
  console.log("ProfitDistribution deployed to:", profitDistribution.address);

  // Deploy AIAdvisorIntegration with Chainlink oracle details
  const linkToken = getConfigValue("CHAINLINK_TOKEN");
  const oracle = getConfigValue("CHAINLINK_ORACLE");

  const AIAdvisorIntegration = await ethers.getContractFactory("AIAdvisorIntegration");
  const aiAdvisorIntegration = await AIAdvisorIntegration.deploy(linkToken, oracle);
  await aiAdvisorIntegration.deployed();
  console.log("AIAdvisorIntegration deployed to:", aiAdvisorIntegration.address);

  // Setup contract permissions
  console.log("\nSetting up contract permissions...");

  // Add FractionalInvestment as trusted issuer in EquityNFTFactory
  const addIssuerTx = await equityNFTFactory.addTrustedIssuer(fractionalInvestment.address);
  await addIssuerTx.wait();
  console.log("Added FractionalInvestment as trusted issuer");

  // Add StartupValidation as validator in EquityNFTFactory
  const addValidatorTx = await equityNFTFactory.addValidator(startupValidation.address);
  await addValidatorTx.wait();
  console.log("Added StartupValidation as validator");

  console.log("\nDeployment completed successfully!");

  // Return all deployed addresses for frontend configuration
  return {
    equityNFTFactory: equityNFTFactory.address,
    fractionalInvestment: fractionalInvestment.address,
    dynamicValuation: dynamicValuation.address,
    startupValidation: startupValidation.address,
    stakeholderGovernance: stakeholderGovernance.address,
    profitDistribution: profitDistribution.address,
    aiAdvisorIntegration: aiAdvisorIntegration.address,
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