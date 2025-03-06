import * as dotenv from 'dotenv';
dotenv.config();

export function getConfigValue(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

export function getOptionalConfigValue(key: string, defaultValue: string = ''): string {
    return process.env[key] || defaultValue;
}

export const CONFIG = {
    CHAINLINK_TOKEN: getConfigValue('CHAINLINK_TOKEN'),
    CHAINLINK_ORACLE: getConfigValue('CHAINLINK_ORACLE'),
    SEPOLIA_URL: getConfigValue('SEPOLIA_URL'),
    PRIVATE_KEY: getConfigValue('PRIVATE_KEY'),
    ETHERSCAN_API_KEY: getOptionalConfigValue('ETHERSCAN_API_KEY'),
    REPORT_GAS: getOptionalConfigValue('REPORT_GAS', 'false') === 'true'
} as const;

// Mainnet Addresses
export const LINK_TOKEN = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
export const CHAINLINK_ORACLE = "0x6090149792dAAeE9D1D568c9f9a6F6B46AA29eFD"; // Chainlink Any-API Oracle
export const ETH_USD_PRICE_FEED = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";

// Sepolia Testnet Addresses
export const SEPOLIA = {
  LINK_TOKEN: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
  CHAINLINK_ORACLE: "0x6090149792dAAeE9D1D568c9f9a6F6B46AA29eFD",
  ETH_USD_PRICE_FEED: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
};

// Network-specific configurations
export const NETWORK_CONFIG = {
  // Update interval for price feeds (in seconds)
  UPDATE_INTERVAL: 24 * 60 * 60, // 1 day
  
  // Grace period for stale price data (in seconds)
  GRACE_PERIOD: 60 * 60, // 1 hour
  
  // Maximum valuation change threshold (percentage)
  MAX_VALUATION_CHANGE: 30 // 30%
};