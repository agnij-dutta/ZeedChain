import { useState, useEffect } from 'react';
import { web3Service } from '../services/Web3Service';

export const WalletConnect = () => {
    const [address, setAddress] = useState<string>('');
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            if (web3Service.isConnected()) {
                const addr = await web3Service.getWalletAddress();
                setAddress(addr);
                setIsConnected(true);
            }
        } catch (err) {
            console.error('Connection check failed:', err);
        }
    };

    const connectWallet = async () => {
        try {
            await web3Service.connect();
            const addr = await web3Service.getWalletAddress();
            setAddress(addr);
            setIsConnected(true);
            setError('');
        } catch (err) {
            setError('Failed to connect wallet. Please make sure MetaMask is installed and unlocked.');
            console.error('Connection failed:', err);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {!isConnected ? (
                <button
                    onClick={connectWallet}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Connect Wallet
                </button>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <span className="text-sm text-gray-600">Connected:</span>
                    <span className="font-mono bg-gray-100 px-3 py-1 rounded">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                </div>
            )}
            {error && (
                <div className="text-red-500 text-sm">
                    {error}
                </div>
            )}
        </div>
    );
};