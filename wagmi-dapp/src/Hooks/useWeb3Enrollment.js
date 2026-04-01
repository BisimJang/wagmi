import { useState, useCallback, useMemo } from 'react';
import { useWalletClient, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem'; // parseUnits is a direct export
import { waitForTransactionReceipt } from 'viem/actions'; // 🎯 FIX: Import from the dedicated actions path
import { COURSE_CONTRACT_ADDRESS, SCHOOL_ABI } from '../web3/constants';

export default function useWeb3Enrollment() {
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [txHash, setTxHash] = useState(null);
    const [prepareError, setPrepareError] = useState(null);

    const isReady = !!walletClient;

    const writeEnroll = useCallback(async (courseId, coursePrice, targetAddress) => {
        // 🎯 FIX: Explicitly handle null/undefined/empty targetAddress to prevent "Contract Deployment" prompt
        // Default parameters only trigger for 'undefined'. This ensures 'null' or '' also fallback correctly.
        const contractAddress = targetAddress || COURSE_CONTRACT_ADDRESS;
        if (!walletClient) {
            const err = new Error('No wallet client available');
            setPrepareError(err);
            setIsError(true);
            throw err;
        }
        
        if (!courseId) {
            const err = new Error('Course ID is missing for enrollment.');
            setPrepareError(err);
            setIsError(true);
            throw err;
        }

        let valueInWei;
        try {
            valueInWei = parseUnits(String(coursePrice || '0'), 18);
        } catch (error) {
            console.error("Error parsing course price to Wei:", error);
            const err = new Error('Invalid course price');
            setPrepareError(err);
            setIsError(true);
            throw err;
        }

        setIsLoading(true);
        setIsError(false);
        setIsSuccess(false);
        setPrepareError(null);

        try {
            const result = await walletClient.writeContract({
                address: contractAddress,
                abi: SCHOOL_ABI,
                functionName: 'enroll',
                args: [BigInt(courseId)], 
                value: valueInWei,
            });

            const hash = result?.hash ?? result;
            setTxHash(hash);

            // FIX: The function call is now valid because the import path is correct.
            const receipt = await waitForTransactionReceipt(publicClient, { hash });

            if (receipt?.status === 'success') { // Viem status is 'success' or 'reverted'
                setIsSuccess(true);
            } else {
                setIsError(true);
            }

            setIsLoading(false);
            return { result, receipt };
        } catch (err) {
            setPrepareError(err);
            setIsError(true);
            setIsLoading(false);
            throw err;
        }
    }, [walletClient, publicClient]);

    return {
        writeEnroll,
        isLoading,
        isError,
        isSuccess,
        txHash,
        isReady,
        prepareError,
    };
}

export { useWeb3Enrollment };