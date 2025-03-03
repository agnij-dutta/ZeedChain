import { useState, useEffect } from 'react';
import { web3Service } from '../services/Web3Service';

interface Proposal {
    startupId: number;
    description: string;
    votesFor: number;
    votesAgainst: number;
    deadline: Date;
    executed: boolean;
    proposer: string;
}

export const GovernanceInterface = () => {
    const [proposals, setProposals] = useState<Record<number, Proposal>>({});
    const [newProposal, setNewProposal] = useState({
        startupId: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userShares, setUserShares] = useState<Record<number, number>>({});

    useEffect(() => {
        loadProposals();
        loadUserShares();
    }, []);

    const loadProposals = async () => {
        setLoading(true);
        try {
            const proposalIds = await web3Service.contracts.stakeholderGovernance?.getProposalCount();
            const proposalsMap: Record<number, Proposal> = {};
            
            for (let i = 0; i < proposalIds; i++) {
                const proposal = await web3Service.contracts.stakeholderGovernance?.getProposal(i);
                proposalsMap[i] = {
                    startupId: proposal.startupId.toNumber(),
                    description: proposal.description,
                    votesFor: proposal.votesFor.toNumber(),
                    votesAgainst: proposal.votesAgainst.toNumber(),
                    deadline: new Date(proposal.deadline.toNumber() * 1000),
                    executed: proposal.executed,
                    proposer: proposal.proposer
                };
            }
            setProposals(proposalsMap);
        } catch (err) {
            console.error('Failed to load proposals:', err);
            setError('Failed to load proposals. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadUserShares = async () => {
        try {
            const address = await web3Service.getWalletAddress();
            const startups = await web3Service.contracts.equityNFTFactory?.getFounderStartups(address);
            const sharesMap: Record<number, number> = {};
            
            for (const startupId of startups) {
                const shares = await web3Service.getInvestorShares(startupId.toNumber(), address);
                sharesMap[startupId.toNumber()] = shares.toNumber();
            }
            setUserShares(sharesMap);
        } catch (err) {
            console.error('Failed to load user shares:', err);
        }
    };

    const handleCreateProposal = async () => {
        if (!newProposal.startupId || !newProposal.description) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const tx = await web3Service.createProposal(
                parseInt(newProposal.startupId),
                newProposal.description
            );
            await tx.wait();
            
            setNewProposal({ startupId: '', description: '' });
            await loadProposals();
        } catch (err: any) {
            console.error('Failed to create proposal:', err);
            setError(err.message || 'Failed to create proposal. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (proposalId: number, support: boolean) => {
        setLoading(true);
        setError('');

        try {
            const tx = await web3Service.vote(proposalId, support);
            await tx.wait();
            await loadProposals();
        } catch (err: any) {
            console.error('Failed to vote:', err);
            setError(err.message || 'Failed to vote. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Governance</h2>

            {/* Create Proposal Form */}
            <div className="mb-8 p-4 bg-gray-50 rounded-md">
                <h3 className="text-lg font-semibold mb-4">Create New Proposal</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Startup ID
                        </label>
                        <input
                            type="number"
                            value={newProposal.startupId}
                            onChange={(e) => setNewProposal(prev => ({ ...prev, startupId: e.target.value }))}
                            className="w-full p-2 border rounded-md"
                            min="1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={newProposal.description}
                            onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full p-2 border rounded-md"
                            rows={3}
                        />
                    </div>
                    <button
                        onClick={handleCreateProposal}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:bg-gray-400"
                    >
                        {loading ? 'Creating...' : 'Create Proposal'}
                    </button>
                </div>
            </div>

            {/* Active Proposals */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Active Proposals</h3>
                <div className="space-y-4">
                    {Object.entries(proposals).map(([id, proposal]) => (
                        <div key={id} className="p-4 border rounded-md">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">Startup #{proposal.startupId}</h4>
                                <span className={`px-2 py-1 text-sm rounded ${
                                    proposal.executed ? 'bg-gray-200' : 'bg-green-200'
                                }`}>
                                    {proposal.executed ? 'Executed' : 'Active'}
                                </span>
                            </div>
                            <p className="text-sm mb-4">{proposal.description}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>Votes For: {proposal.votesFor}</div>
                                <div>Votes Against: {proposal.votesAgainst}</div>
                                <div>Deadline: {proposal.deadline.toLocaleDateString()}</div>
                                <div>Proposer: {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</div>
                            </div>
                            {!proposal.executed && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleVote(parseInt(id), true)}
                                        disabled={loading}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md disabled:bg-gray-400"
                                    >
                                        Vote For
                                    </button>
                                    <button
                                        onClick={() => handleVote(parseInt(id), false)}
                                        disabled={loading}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md disabled:bg-gray-400"
                                    >
                                        Vote Against
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
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