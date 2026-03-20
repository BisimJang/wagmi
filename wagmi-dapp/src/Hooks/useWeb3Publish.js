import { useState, useCallback } from 'react';
import { useWalletClient, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { COURSE_CONTRACT_ADDRESS, SCHOOL_ABI } from '../web3/constants';

export function useWeb3Publish() {
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [txHash, setTxHash] = useState(null);

    /**
     * Publishes a course on-chain to a specific school address.
     * @param {string|number} courseId 
     * @param {number|string} coursePrice 
     * @param {string} targetAddress The school contract address.
     */
    const publishCourseOnChain = useCallback(async (courseId, coursePrice, targetAddress = COURSE_CONTRACT_ADDRESS) => {
        if (!walletClient) throw new Error('Wallet not connected');
        
        setIsLoading(true);
        setIsError(false);
        setIsSuccess(false);

        try {
            const valueInWei = parseUnits(String(coursePrice), 18);
            
            // Try real transaction
            const hash = await walletClient.writeContract({
                address: targetAddress,
                abi: SCHOOL_ABI,
                functionName: 'publishCourse',
                args: [BigInt(courseId), valueInWei],
            });

            setTxHash(hash);
            const receipt = await waitForTransactionReceipt(publicClient, { hash });

            if (receipt.status === 'success') {
                setIsSuccess(true);
            } else {
                setIsError(true);
            }
            setIsLoading(false);
            return receipt;
        } catch (err) {
            console.error('Publishing error:', err);
            
            // Simulation fallback if revert occurs (common for old contracts)
            if (err.message.includes('gas limit') || err.message.includes('execution reverted')) {
                const proceed = confirm("Smart Contract logic missing (requires redeploy).\n\nWould you like to SIMULATE a successful on-chain publish for frontend testing?");
                if (proceed) {
                    const mockHash = `0xmock${Math.random().toString(16).slice(2)}abc123456789`;
                    setTxHash(mockHash);
                    setIsSuccess(true);
                    setIsLoading(false);
                    return { status: 'simulated', transactionHash: mockHash };
                }
            }

            setIsError(true);
            setIsLoading(false);
            throw err;
        }
    }, [walletClient, publicClient]);

    /**
     * Publishes multiple course prices in one transaction.
     */
    const bulkPublishOnChain = useCallback(async (courseIds, prices, targetAddress) => {
        if (!walletClient) throw new Error('Wallet not connected');
        setIsLoading(true);
        try {
            const hash = await walletClient.writeContract({
                address: targetAddress,
                abi: SCHOOL_ABI,
                functionName: 'bulkPublishCourses',
                args: [courseIds.map(id => BigInt(id)), prices.map(p => parseUnits(String(p), 18))],
            });
            const receipt = await waitForTransactionReceipt(publicClient, { hash });
            setIsSuccess(receipt.status === 'success');
            setIsLoading(false);
            return receipt;
        } catch (err) {
            console.error('Bulk publish error:', err);
            setIsError(true);
            setIsLoading(false);
            throw err;
        }
    }, [walletClient, publicClient]);

    return {
        publishCourseOnChain,
        bulkPublishOnChain,
        isLoading,
        isError,
        isSuccess,
        txHash
    };
}
