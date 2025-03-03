import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { web3Service } from '../services/Web3Service';

interface Distribution {
    startupId: number;
    amount: string;
    remainingAmount: string;
    timestamp: Date;
    claimed: boolean;
}

export const ProfitDistribution = () => {
    const [distributions, setDistributions] = useState<Distribution[]>([]);
    const [userStartups, setUserStartups] = useState<number[]>([]);
    const [selectedStartup, setSelectedStartup] = useState('');
    const [distributionAmount, setDistributionAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadUserStartups();
        loadDistributions();
    }, []);

    const loadUserStartups = async () => {
        try {
            const address = await web3Service.getWalletAddress();
            const startups = await web3Service.contracts.equityNFTFactory?.getFounderStartups(address);
            setUserStartups(startups.map(id => id.toNumber()));
        } catch (err) {
            console.error('Failed to load user startups:', err);
        }
    };

    const loadDistributions = async () => {
        try {
            const address = await web3Service.getWalletAddress();
            const distributionsList: Distribution[] = [];

            for (const startupId of userStartups) {
                const unclaimedDistributions = await web3Service.contracts.profitDistribution?.getUnclaimedDistributions(startupId, address);
                
                for (const index of unclaimedDistributions) {
                    const distribution = await web3Service.contracts.profitDistribution?.distributions(startupId, index);
                    distributionsList.push({
                        startupId,
                        amount: ethers.utils.formatEther(distribution.totalAmount),
                        remainingAmount: ethers.utils.formatEther(distribution.remainingAmount),
                        timestamp: new Date(distribution.timestamp.toNumber() * 1000),
                        claimed: false
                    });
                }
            }

            setDistributions(distributionsList);
        } catch (err) {
            console.error('Failed to load distributions:', err);
            setError('Failed to load distributions. Please try again.');
        }
    };

    const handleDistributeProfit = async () => {
        if (!selectedStartup || !distributionAmount) {
            setError('Please select a startup and enter distribution amount');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const tx = await web3Service.contracts.profitDistribution?.distributeProfit(
                parseInt(selectedStartup),
                { value: ethers.utils.parseEther(distributionAmount) }
            );
            await tx.wait();
            
            setDistributionAmount('');
            await loadDistributions();
        } catch (err: any) {
            console.error('Distribution failed:', err);
            setError(err.message || 'Distribution failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClaimProfit = async (startupId: number, distributionIndex: number) => {
        setLoading(true);
        setError('');

        try {
            const tx = await web3Service.claimProfit(startupId, distributionIndex);
            await tx.wait();
            await loadDistributions();
        } catch (err: any) {
            console.error('Claim failed:', err);
            setError(err.message || 'Claim failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Profit Distribution</h2>

            {/* Distribute Profit Form */}
            {userStartups.length > 0 && (
                <div className="mb-8 p-4 bg-gray-50 rounded-md">
                    <h3 className="text-lg font-semibold mb-4">Distribute Profit</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Startup
                            </label>
                            <select
                                value={selectedStartup}
                                onChange={(e) => setSelectedStartup(e.target.value)}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="">Select a startup</option>
                                {userStartups.map((id) => (
                                    <option key={id} value={id}>
                                        Startup #{id}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Distribution Amount (ETH)
                            </label>
                            <input
                                type="number"
                                value={distributionAmount}
                                onChange={(e) => setDistributionAmount(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <button
                            onClick={handleDistributeProfit}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:bg-gray-400"
                        >
                            {loading ? 'Processing...' : 'Distribute Profit'}
                        </button>
                    </div>
                </div>
            )}

            {/* Available Distributions */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Available Distributions</h3>
                <div className="space-y-4">
                    {distributions.map((distribution, index) => (
                        <div key={index} className="p-4 border rounded-md">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <span className="font-medium">Startup ID:</span> #{distribution.startupId}
                                </div>
                                <div>
                                    <span className="font-medium">Amount:</span> {distribution.amount} ETH
                                </div>
                                <div>
                                    <span className="font-medium">Remaining:</span> {distribution.remainingAmount} ETH
                                </div>
                                <div>
                                    <span className="font-medium">Date:</span> {distribution.timestamp.toLocaleDateString()}
                                </div>
                            </div>
                            {!distribution.claimed && (
                                <button
                                    onClick={() => handleClaimProfit(distribution.startupId, index)}
                                    disabled={loading}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md disabled:bg-gray-400"
                                >
                                    {loading ? 'Claiming...' : 'Claim Profit'}
                                </button>
                            )}
                        </div>
                    ))}
                    {distributions.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No available distributions</p>
                    )}
                </div>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}
        </div>
    );
};