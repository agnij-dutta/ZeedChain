import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { getIgnitionInstance } from "@nomicfoundation/hardhat-ignition/helpers";
import hre from "hardhat";

async function main() {
  const ignition = await getIgnitionInstance(hre);
  const deploymentResult = await ignition.deploy("EquityNFTs");

  console.log("Contracts deployed successfully!");
  console.log("EquityNFTFactory:", deploymentResult.contracts.equityNFTFactory.address);
  console.log("FractionalInvestment:", deploymentResult.contracts.fractionalInvestment.address);

  // Save contract addresses for frontend use
  require('fs').writeFileSync(
    '../client/.env.local',
    `NEXT_PUBLIC_EDUCHAIN_RPC_URL=${process.env.EDUCHAIN_RPC_URL}\n` +
    `NEXT_PUBLIC_CONTRACT_ADDRESS=${deploymentResult.contracts.equityNFTFactory.address}\n` +
    `NEXT_PUBLIC_FRACTIONAL_ADDRESS=${deploymentResult.contracts.fractionalInvestment.address}\n` +
    `NEXT_PUBLIC_CHAIN_ID=1001\n` +
    `NEXT_PUBLIC_GEMINI_API_KEY=${process.env.GEMINI_API_KEY || ''}`
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });