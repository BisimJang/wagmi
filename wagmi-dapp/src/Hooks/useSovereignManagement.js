import { useState, useCallback } from 'react';
import { useWalletClient, usePublicClient, useAccount } from 'wagmi';
import { parseUnits, formatEther } from 'viem';
import { sepolia } from 'viem/chains';
import { waitForTransactionReceipt } from 'viem/actions';
import { SCHOOL_ABI } from '../web3/constants';
import { apiCall } from '../api/api';

/**
 * Hook for managing specific Sovereign School contracts.
 * Allows instructors to withdraw funds and manually update prices.
 */
export function useSovereignManagement(showMessage) {
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient({ chainId: sepolia.id });
    
    const [isActionLoading, setIsActionLoading] = useState(false);

    /**
     * Fetches the actual on-chain price for a specific course in a school.
     */
    const getOnChainPrice = useCallback(async (schoolAddress, courseId) => {
        if (!publicClient || !schoolAddress) return '0';
        try {
            const price = await publicClient.readContract({
                address: schoolAddress,
                abi: SCHOOL_ABI,
                functionName: 'coursePrices',
                args: [BigInt(courseId)],
            });
            return formatEther(price);
        } catch (error) {
            console.error(`Error fetching price for course ${courseId}:`, error);
            return '0';
        }
    }, [publicClient]);

    /**
     * Fetches the ETH balance of a school contract.
     */
    const getSchoolBalance = useCallback(async (schoolAddress) => {
        if (!publicClient || !schoolAddress) return '0';
        try {
            const balance = await publicClient.getBalance({ address: schoolAddress });
            return formatEther(balance);
        } catch (error) {
            console.error('Error fetching school balance:', error);
            return '0';
        }
    }, [publicClient]);

    /**
     * Withdraws all funds from the school contract to the owner's wallet.
     */
    const withdrawFunds = useCallback(async (schoolAddress) => {
        if (!walletClient || !address) {
            showMessage('Wallet not connected', 'error');
            return null;
        }

        setIsActionLoading(true);
        try {
            const hash = await walletClient.writeContract({
                address: schoolAddress,
                abi: SCHOOL_ABI,
                functionName: 'withdraw',
            });

            showMessage('Requesting withdrawal...', 'info');
            const receipt = await waitForTransactionReceipt(publicClient, { hash });

            if (receipt.status === 'success') {
                showMessage('Funds successfully withdrawn!', 'success');
                return receipt;
            }
        } catch (error) {
            console.error('Withdrawal error:', error);
            if (error.message?.includes('Failed to fetch') || error.message?.includes('network')) {
                showMessage('Network Error: Wallet cannot reach the blockchain provider. Checking your RPC connection and internet speed is recommended.', 'error');
            } else if (error?.name === 'UserRejectedRequestError') {
                showMessage('Transaction cancelled by user.', 'info');
            } else {
                showMessage(`Withdrawal failed: ${error.message}`, 'error');
            }
        } finally {
            setIsActionLoading(false);
        }
        return null;
    }, [walletClient, address, publicClient, showMessage]);

    /**
     * Updates an individual course price on the school contract,
     * then syncs the new price to the backend database.
     */
    const updateOnChainPrice = useCallback(async (schoolAddress, courseId, newPrice) => {
        if (!walletClient || !address) {
            showMessage('Wallet not connected', 'error');
            return null;
        }

        setIsActionLoading(true);
        try {
            const priceInWei = parseUnits(String(newPrice), 18);
            showMessage(`Submitting price update for course ${courseId}...`, 'info');
            const hash = await walletClient.writeContract({
                address: schoolAddress,
                abi: SCHOOL_ABI,
                functionName: 'publishCourse',
                args: [BigInt(courseId), priceInWei],
            });

            showMessage('Waiting for confirmation...', 'info');
            const receipt = await waitForTransactionReceipt(publicClient, { hash });

            if (receipt.status === 'success') {
                // Sync the new price to the backend so the UI reflects it
                try {
                    await apiCall(`/courses/${courseId}/`, {
                        method: 'PATCH',
                        body: JSON.stringify({ price: newPrice }),
                    });
                    showMessage('Price updated on-chain and saved!', 'success');
                } catch (syncError) {
                    console.error('Backend price sync failed:', syncError);
                    showMessage('On-chain price updated, but failed to sync to server.', 'warning');
                }
                return receipt;
            }
        } catch (error) {
            if (error?.name === 'UserRejectedRequestError') {
                showMessage('Transaction cancelled.', 'info');
            } else {
                console.error('Price update error:', error);
                showMessage(`Failed to update price: ${error.message}`, 'error');
            }
        } finally {
            setIsActionLoading(false);
        }
        return null;
    }, [walletClient, address, publicClient, showMessage]);

    /**
     * Fetches the current authorized certificate signer for a school.
     */
    const getContractSigner = useCallback(async (schoolAddress) => {
        if (!publicClient || !schoolAddress) return null;
        try {
            return await publicClient.readContract({
                address: schoolAddress,
                abi: SCHOOL_ABI,
                functionName: 'signer',
            });
        } catch (error) {
            // 🎯 Detect missing function (Legacy Contract)
            if (error.message.includes('not found') || error.message.includes('reverted')) {
                console.warn(`Signer check skipped: School at ${schoolAddress} appears to be a Legacy Contract.`);
                return 'LEGACY_CONTRACT';
            }
            console.error('Error fetching signer:', error);
            return null;
        }
    }, [publicClient]);

    /**
     * Updates the authorized signer for certificates.
     */
    const updateOnChainSigner = useCallback(async (schoolAddress, newSigner) => {
        if (!walletClient || !address) {
            showMessage('Wallet not connected', 'error');
            return null;
        }

        setIsActionLoading(true);
        try {
            const hash = await walletClient.writeContract({
                address: schoolAddress,
                abi: SCHOOL_ABI,
                functionName: 'setSigner',
                args: [newSigner],
            });

            showMessage('Updating authorized signer...', 'info');
            const receipt = await waitForTransactionReceipt(publicClient, { hash });
            showMessage('Signer updated successfully!', 'success');
            return receipt;
        } catch (error) {
            console.error('Error updating signer:', error);
            showMessage('Failed to update signer', 'error');
            return null;
        } finally {
            setIsActionLoading(false);
        }
    }, [walletClient, address, publicClient, showMessage]);

    return {
        getOnChainPrice,
        getSchoolBalance,
        getContractSigner,
        withdrawFunds,
        updateOnChainPrice,
        updateOnChainSigner,
        isActionLoading
    };
}
