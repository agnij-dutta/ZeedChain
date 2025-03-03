import { ethers } from 'ethers';
import EquityNFTFactoryABI from '../../../web3/artifacts/contracts/EquityNFTFactory.sol/EquityNFTFactory.json';
import FractionalInvestmentABI from '../../../web3/artifacts/contracts/FractionalInvestment.sol/FractionalInvestment.json';
import StakeholderGovernanceABI from '../../../web3/artifacts/contracts/StakeholderGovernance.sol/StakeholderGovernance.json';
import ProfitDistributionABI from '../../../web3/artifacts/contracts/ProfitDistribution.sol/ProfitDistribution.json';
import { ZeedChainError, ErrorCode } from '../types/errors';

export class Web3Service {
    private provider: ethers.providers.Web3Provider | null = null;
    private signer: ethers.Signer | null = null;
    private contracts: {
        equityNFTFactory?: ethers.Contract;
        fractionalInvestment?: ethers.Contract;
        stakeholderGovernance?: ethers.Contract;
        profitDistribution?: ethers.Contract;
    } = {};

    private contractAddresses = {
        equityNFTFactory: process.env.NEXT_PUBLIC_EQUITY_NFT_FACTORY_ADDRESS,
        fractionalInvestment: process.env.NEXT_PUBLIC_FRACTIONAL_INVESTMENT_ADDRESS,
        stakeholderGovernance: process.env.NEXT_PUBLIC_STAKEHOLDER_GOVERNANCE_ADDRESS,
        profitDistribution: process.env.NEXT_PUBLIC_PROFIT_DISTRIBUTION_ADDRESS
    };

    async connect() {
        if (typeof window === 'undefined' || !window.ethereum) {
            throw new Error('Web3 provider not found');
        }

        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        await this.provider.send('eth_requestAccounts', []);
        this.signer = this.provider.getSigner();

        this.initializeContracts();
    }

    private initializeContracts() {
        if (!this.signer) throw new Error('Signer not initialized');

        this.contracts.equityNFTFactory = new ethers.Contract(
            this.contractAddresses.equityNFTFactory!,
            EquityNFTFactoryABI.abi,
            this.signer
        );

        this.contracts.fractionalInvestment = new ethers.Contract(
            this.contractAddresses.fractionalInvestment!,
            FractionalInvestmentABI.abi,
            this.signer
        );

        this.contracts.stakeholderGovernance = new ethers.Contract(
            this.contractAddresses.stakeholderGovernance!,
            StakeholderGovernanceABI.abi,
            this.signer
        );

        this.contracts.profitDistribution = new ethers.Contract(
            this.contractAddresses.profitDistribution!,
            ProfitDistributionABI.abi,
            this.signer
        );
    }

    // NFT Management Functions
    async registerStartup(name: string, description: string, totalShares: number, initialValuation: number) {
        if (!this.contracts.equityNFTFactory) throw new Error('Contract not initialized');
        return await this.contracts.equityNFTFactory.registerStartup(
            name,
            description,
            totalShares,
            initialValuation
        );
    }

    async invest(startupId: number, amount: string) {
        if (!this.contracts.fractionalInvestment) throw new Error('Contract not initialized');
        return await this.contracts.fractionalInvestment.invest(startupId, {
            value: ethers.utils.parseEther(amount)
        });
    }

    // Governance Functions
    async createProposal(startupId: number, description: string) {
        if (!this.contracts.stakeholderGovernance) throw new Error('Contract not initialized');
        return await this.contracts.stakeholderGovernance.createProposal(startupId, description);
    }

    async vote(proposalId: number, support: boolean) {
        if (!this.contracts.stakeholderGovernance) throw new Error('Contract not initialized');
        return await this.contracts.stakeholderGovernance.vote(proposalId, support);
    }

    // Profit Distribution Functions
    async claimProfit(startupId: number, distributionIndex: number) {
        if (!this.contracts.profitDistribution) throw new Error('Contract not initialized');
        return await this.contracts.profitDistribution.claimProfit(startupId, distributionIndex);
    }

    // Utility Functions
    async getStartupDetails(startupId: number) {
        if (!this.contracts.equityNFTFactory) throw new Error('Contract not initialized');
        return await this.contracts.equityNFTFactory.getStartupDetails(startupId);
    }

    async getInvestorShares(startupId: number, address: string) {
        if (!this.contracts.fractionalInvestment) throw new Error('Contract not initialized');
        return await this.contracts.fractionalInvestment.getInvestorShares(startupId, address);
    }

    async getWalletAddress(): Promise<string> {
        if (!this.signer) throw new Error('Signer not initialized');
        return await this.signer.getAddress();
    }

    isConnected(): boolean {
        return !!this.signer;
    }

    getProvider() {
        return this.provider;
    }

    getSigner() {
        return this.signer;
    }

    async getAuthHeaders(): Promise<Record<string, string>> {
        if (!this.signer) {
            throw new ZeedChainError(
                ErrorCode.NO_WEB3,
                'Web3 provider not connected'
            );
        }

        const timestamp = Math.floor(Date.now() / 1000).toString();
        const message = `Authenticate ZeedChain API request at timestamp: ${timestamp}`;
        const signature = await this.signer.signMessage(message);
        const address = await this.signer.getAddress();

        return {
            'x-signature': signature,
            'x-address': address,
            'x-timestamp': timestamp
        };
    }

    async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
        const headers = await this.getAuthHeaders();
        
        const finalOptions: RequestInit = {
            ...options,
            headers: {
                ...options.headers,
                ...headers,
                'Content-Type': 'application/json'
            }
        };

        const response = await fetch(url, finalOptions);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new ZeedChainError(
                ErrorCode.TRANSACTION_FAILED,
                error.error || 'Request failed',
                error
            );
        }

        return response;
    }

    // Use this method for AI advisor requests
    async getAIAdvice(startupId: number) {
        return this.authenticatedFetch(`/api/ai-advisor?startupId=${startupId}`).then(res => res.json());
    }
}

export const web3Service = new Web3Service();