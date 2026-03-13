import { useState, useCallback, useMemo } from 'react';
import { useWalletClient, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem'; // parseUnits is a direct export
import { waitForTransactionReceipt } from 'viem/actions'; // 🎯 FIX: Import from the dedicated actions path
import { COURSE_CONTRACT_ADDRESS, COURSE_CONTRACT_ABI } from '../web3/constants';

export default function useWeb3Enrollment(coursePrice, courseId) {
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    // 🎯 USE useMemo and parseUnits for guaranteed 18-decimal precision
    const valueInWei = useMemo(() => {
        if (!coursePrice) return 0n;
        try {
            // Converts the price string (e.g., "0.05") into its Wei equivalent
            return parseUnits(String(coursePrice), 18);
        } catch (error) {
            console.error("Error parsing course price to Wei:", error);
            return 0n;
        }
    }, [coursePrice]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [txHash, setTxHash] = useState(null);
    const [prepareError, setPrepareError] = useState(null);

    // isReady now also checks for a valid course ID
    const isReady = !!walletClient && !!coursePrice && valueInWei > 0n && !!courseId; 

    console.log("Web3 Enroll Debug:", {
        coursePriceString: String(coursePrice),
        valueInWei: valueInWei.toString(),
        courseId: courseId, // 🎯 Log the ID for debugging
        contractAddress: COURSE_CONTRACT_ADDRESS
    });

    const writeEnroll = useCallback(async () => {
        if (!walletClient) {
            const err = new Error('No wallet client available');
            setPrepareError(err);
            setIsError(true);
            throw err;
        }
        
        // 🎯 CRITICAL CHECK: Must have an ID to call the contract function
        if (!courseId) {
            const err = new Error('Course ID is missing for enrollment.');
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
                address: COURSE_CONTRACT_ADDRESS,
                abi: COURSE_CONTRACT_ABI,
                functionName: 'enroll',
                args: [BigInt(courseId)], // PASS THE COURSE ID AS THE ARGUMENT
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
    }, [walletClient, publicClient, valueInWei, courseId]);

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