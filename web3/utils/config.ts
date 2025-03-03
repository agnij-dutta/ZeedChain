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