import { useState, useEffect, useCallback } from 'react';
import { web3Service } from '../services/Web3Service';
import { ZeedChainError, ErrorCode } from '../types/errors';

export interface Web3State {
    isConnected: boolean;
    address: string | null;
    chainId: number | null;
    error: ZeedChainError | null;
}

export function useWeb3() {
    const [state, setState] = useState<Web3State>({
        isConnected: false,
        address: null,
        chainId: null,
        error: null
    });

    const connect = useCallback(async () => {
        try {
            await web3Service.connect();
            const address = await web3Service.getWalletAddress();
            const provider = web3Service.getProvider();
            const network = await provider?.getNetwork();
            
            setState({
                isConnected: true,
                address,
                chainId: network?.chainId || null,
                error: null
            });
        } catch (error: any) {
            const web3Error = ZeedChainError.fromWeb3(error);
            setState(prev => ({
                ...prev,
                error: web3Error,
                isConnected: false
            }));
            throw web3Error;
        }
    }, []);

    const checkConnection = useCallback(async () => {
        if (web3Service.isConnected()) {
            try {
                const address = await web3Service.getWalletAddress();
                const provider = web3Service.getProvider();
                const network = await provider?.getNetwork();
                
                setState({
                    isConnected: true,
                    address,
                    chainId: network?.chainId || null,
                    error: null
                });
            } catch (error) {
                console.error('Failed to check connection:', error);
            }
        }
    }, []);

    useEffect(() => {
        checkConnection();

        // Setup event listeners for wallet changes
        if (typeof window !== 'undefined' && window.ethereum) {
            window.ethereum.on('accountsChanged', () => {
                checkConnection();
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });

            window.ethereum.on('disconnect', () => {
                setState({
                    isConnected: false,
                    address: null,
                    chainId: null,
                    error: null
                });
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', checkConnection);
                window.ethereum.removeListener('chainChanged', () => {
                    window.location.reload();
                });
            }
        };
    }, [checkConnection]);

    const executeContractCall = async <T>(
        call: () => Promise<T>
    ): Promise<T> => {
        try {
            if (!state.isConnected) {
                throw new ZeedChainError(
                    ErrorCode.NO_WEB3,
                    'Not connected to Web3'
                );
            }
            return await call();
        } catch (error: any) {
            const contractError = ZeedChainError.fromContract(error);
            setState(prev => ({ ...prev, error: contractError }));
            throw contractError;
        }
    };

    return {
        ...state,
        connect,
        executeContractCall
    };
}