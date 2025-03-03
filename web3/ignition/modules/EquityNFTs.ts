import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EquityNFTs", (m) => {
  const equityNFTFactory = m.contract("EquityNFTFactory");
  
  const fractionalInvestment = m.contract("FractionalInvestment", [
    equityNFTFactory.address,
  ]);

  return { equityNFTFactory, fractionalInvestment };
});