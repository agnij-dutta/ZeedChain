import { buildModule } from "@nomicfoundation/hardhat-ignition";

export default buildModule("EquityNFTs", (m) => {
  const equityNFTFactory = m.contract("EquityNFTFactory");
  
  const fractionalInvestment = m.contract(
    "FractionalInvestment",
    [
      equityNFTFactory,
      m.getParameter("feeCollector")
    ]
  );

  const dynamicValuation = m.contract(
    "DynamicValuation",
    [equityNFTFactory]
  );

  const stakeholderGovernance = m.contract(
    "StakeholderGovernance",
    [fractionalInvestment]
  );

  const startupValidation = m.contract(
    "StartupValidation",
    [equityNFTFactory, 3] // Set initial validation threshold to 3
  );

  const profitDistribution = m.contract(
    "ProfitDistribution",
    [fractionalInvestment]
  );

  // Deploy Chainlink integration after getting oracle and LINK token addresses from environment
  const aiAdvisorIntegration = m.contract(
    "AIAdvisorIntegration",
    [
      m.getParameter("linkTokenAddress"),
      m.getParameter("oracleAddress")
    ]
  );

  return {
    equityNFTFactory,
    fractionalInvestment,
    dynamicValuation,
    stakeholderGovernance,
    startupValidation,
    profitDistribution,
    aiAdvisorIntegration
  };
});