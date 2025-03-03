import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { web3Service } from '../services/Web3Service';
import { AIAdvisor } from './AIAdvisor';
import { LoadingState } from './shared/LoadingState';
import { useNotifications } from '@/context/NotificationContext';
import { ZeedChainError, ErrorCode } from '@/types/errors';

interface Startup {
    name: string;
    description: string;
    totalShares: number;
    availableShares: number;
    valuation: string;
    founder: string;
    isValidated: boolean;
}

export const NFTInvestment = () => {
    const [startups, setStartups] = useState<Record<string, Startup>>({});
    const [selectedStartupId, setSelectedStartupId] = useState<string>('');
    const [investmentAmount, setInvestmentAmount] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ZeedChainError | null>(null);
    const { addNotification } = useNotifications();

    useEffect(() => {
        loadStartups();
    }, []);

    const loadStartups = async () => {
        try {
            // For demo, we'll load first 10 startups
            const startupMap: Record<string, Startup> = {};
            for (let i = 1; i <= 10; i++) {
                try {
                    const startup = await web3Service.getStartupDetails(i);
                    if (startup.name !== '') {
                        startupMap[i] = {
                            name: startup.name,
                            description: startup.description,
                            totalShares: startup.totalShares.toNumber(),
                            availableShares: startup.availableShares.toNumber(),
                            valuation: ethers.utils.formatEther(startup.valuation),
                            founder: startup.founder,
                            isValidated: startup.isValidated
                        };
                    }
                } catch (err) {
                    break; // Stop if we hit an invalid ID
                }
            }
            setStartups(startupMap);
        } catch (err: any) {
            console.error('Failed to load startups:', err);
            const loadError = new ZeedChainError(
                ErrorCode.CONTRACT_NOT_INITIALIZED,
                'Failed to load startups. Please try again.',
                err
            );
            setError(loadError);
        }
    };

    const handleInvest = async () => {
        if (!selectedStartupId || !investmentAmount) {
            setError(new ZeedChainError(
                ErrorCode.INVALID_INPUT,
                'Please select a startup and enter investment amount'
            ));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const tx = await web3Service.invest(
                parseInt(selectedStartupId),
                investmentAmount
            );
            await tx.wait();
            
            addNotification({
                type: 'success',
                title: 'Investment Successful',
                message: `Successfully invested ${investmentAmount} ETH in ${startups[selectedStartupId].name}`,
                duration: 5000
            });
            
            await loadStartups();
            setInvestmentAmount('');
        } catch (err: any) {
            console.error('Investment failed:', err);
            const investError = new ZeedChainError(
                ErrorCode.TRANSACTION_FAILED,
                err.message || 'Investment failed. Please try again.',
                err
            );
            setError(investError);
            
            addNotification({
                type: 'error',
                title: 'Investment Failed',
                message: investError.message,
                duration: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6">Invest in Startups</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Startup
                            </label>
                            <select
                                value={selectedStartupId}
                                onChange={(e) => setSelectedStartupId(e.target.value)}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="">Select a startup</option>
                                {Object.entries(startups).map(([id, startup]) => (
                                    <option key={id} value={id} disabled={!startup.isValidated}>
                                        {startup.name} - {startup.availableShares} shares available
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedStartupId && startups[selectedStartupId] && (
                            <div className="p-4 bg-gray-50 rounded-md">
                                <h3 className="font-bold mb-2">{startups[selectedStartupId].name}</h3>
                                <p className="text-sm mb-2">{startups[selectedStartupId].description}</p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Valuation:</span>{' '}
                                        {startups[selectedStartupId].valuation} ETH
                                    </div>
                                    <div>
                                        <span className="font-medium">Available Shares:</span>{' '}
                                        {startups[selectedStartupId].availableShares}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Investment Amount (ETH)
                            </label>
                            <input
                                type="number"
                                value={investmentAmount}
                                onChange={(e) => setInvestmentAmount(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                step="0.01"
                                min="0"
                            />
                        </div>

                        <LoadingState isLoading={loading} error={error}>
                            <button
                                onClick={handleInvest}
                                disabled={loading || !selectedStartupId || !investmentAmount}
                                className="w-full btn-primary"
                            >
                                {loading ? 'Processing...' : 'Invest'}
                            </button>
                        </LoadingState>
                    </div>

                    <div>
                        {selectedStartupId && (
                            <AIAdvisor startupId={parseInt(selectedStartupId)} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};