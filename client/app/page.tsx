'use client';

import  WalletConnect  from '@/components/WalletConnect';
import  NFTInvestment  from '@/components/NFTInvestment';
import  GovernanceInterface  from '@/components/GovernanceInterface';
import  ProfitDistribution  from '@/components/ProfitDistribution';
import  { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('invest');

  const renderContent = () => {
    switch (activeTab) {
      case 'invest':
        return <NFTInvestment />;
      case 'governance':
        return <GovernanceInterface />;
      case 'profits':
        return <ProfitDistribution />;
      default:
        return <NFTInvestment />;
    }
  };

  return (
    <main className="min-h-screen p-4 dark">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold mb-6">ZeedChain Platform</h1>
          <WalletConnect />
        </div>

        <div className="mb-8">
          <nav className="flex space-x-4 justify-center">
            <button
              onClick={() => setActiveTab('invest')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'invest'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Invest
            </button>
            <button
              onClick={() => setActiveTab('governance')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'governance'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Governance
            </button>
            <button
              onClick={() => setActiveTab('profits')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'profits'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Profit Distribution
            </button>
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          {renderContent()}
        </div>
      </div>
    </main>
  );
}
