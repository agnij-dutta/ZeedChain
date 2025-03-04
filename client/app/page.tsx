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
    <>
    </>
  );
}
