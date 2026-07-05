import { useState, useCallback, useMemo } from 'react';
import { useWalletClient, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem'; // parseUnits is a direct export
import { sepolia } from 'viem/chains'; // 🎯 FIX: Force Sepolia chain for on-chain checks
import { waitForTransactionReceipt } from 'viem/actions'; // 🎯 FIX: Import from the dedicated actions path
import { COURSE_CONTRACT_ADDRESS, SCHOOL_ABI } from '../web3/constants';

export default function useWeb3Enrollment() {
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient({ chainId: sepolia.id });
    
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
            // 🔍 [PRE-CHECK 1]: Basic Balance Check
            console.log('--- ENROLLMENT PRE-CHECKS ---');
            const balance = await publicClient.getBalance({ address: walletClient.account.address });
            console.log(`User balance: ${balance.toString()} Wei`);
            if (balance < valueInWei) {
                const err = new Error(`Insufficient Balance: You have ${Number(balance) / 1e18} ETH, but the course costs ${Number(valueInWei) / 1e18} ETH.`);
                throw err;
            }

            // 🔍 [PRE-CHECK 2]: Contract State Verification
            console.log(`Reading contract state for School at: ${contractAddress}`);
            try {
                const [onChainPrice, onChainEnrolled] = await Promise.all([
                    publicClient.readContract({
                        address: contractAddress,
                        abi: SCHOOL_ABI,
                        functionName: 'coursePrices',
                        args: [BigInt(courseId)],
                    }),
                    publicClient.readContract({
                        address: contractAddress,
                        abi: SCHOOL_ABI,
                        functionName: 'isEnrolled',
                        args: [walletClient.account.address, BigInt(courseId)],
                    })
                ]);

                console.log(`On-chain Price: ${onChainPrice.toString()}`);
                console.log(`On-chain Enrollment Status: ${onChainEnrolled}`);

                if (onChainEnrolled) {
                    throw new Error("You are already enrolled in this course according to the blockchain.");
                }

                if (onChainPrice === 0n) {
                    throw new Error("This course is not currently available for enrollment in this school (Price is 0).");
                }

                if (onChainPrice !== valueInWei) {
                    throw new Error(`Price Mismatch: Backend price (${Number(valueInWei) / 1e18} ETH) does not match On-chain price (${Number(onChainPrice) / 1e18} ETH).`);
                }
            } catch (stateErr) {
                console.warn("Pre-check failed or contract mismatch:", stateErr.message);
                // We keep going if it's just a read failure, but if it's our custom Error, rethrow it
                if (stateErr.message.includes("already enrolled") || 
                    stateErr.message.includes("not currently available") || 
                    stateErr.message.includes("Price Mismatch")) {
                    throw stateErr;
                }
            }

            // 🎯 NEW: Simulate using our ROBUST publicClient first (uses Fallback RPCs)
            // This bypasses MetaMask's potentially broken internal RPC for the simulation phase.
            console.log('Simulating transaction via fallback RPCs...');
            const { request } = await publicClient.simulateContract({
                account: walletClient.account,
                address: contractAddress,
                abi: SCHOOL_ABI,
                functionName: 'enroll',
                args: [BigInt(courseId)],
                value: valueInWei,
            });

            console.log('Simulation successful, requesting signature...');
            const hash = await walletClient.writeContract(request);
            setTxHash(hash);

            const receipt = await waitForTransactionReceipt(publicClient, { hash });
            
            if (receipt?.status === 'success') {
                setIsSuccess(true);
            } else {
                setIsError(true);
            }

            setIsLoading(false);
            return { hash, receipt };
        } catch (err) {
            console.error('Enrollment failure detail:', err);
            
            // Extract revert reason if available in nested error
            const revertReason = err.walk?.(e => e.reason)?.reason || err.reason || err.shortMessage || err.message;
            console.error('Detected Revert Reason:', revertReason);

            // Helpful error messages
            if (err.message?.includes('Failed to fetch')) {
                setPrepareError(new Error('Network Error: The app could not reach the blockchain. Please check your internet or try again in a moment.'));
            } else if (err.message?.includes('insufficient funds') || err.message?.includes('Insufficient Balance')) {
                setPrepareError(new Error(err.message.includes('Insufficient Balance') ? err.message : 'Insufficient Funds: You do not have enough SepoliaETH to enroll.'));
            } else if (err.name === 'UserRejectedRequestError') {
                setPrepareError(new Error('Transaction cancelled.'));
            } else if (revertReason && revertReason !== 'Internal error') {
                setPrepareError(new Error(`Contract Reverted: ${revertReason}`));
            } else {
                setPrepareError(err);
            }
            
            setIsError(true);
            setIsLoading(false);
            throw err;
        }
    }, [walletClient, publicClient]);

    const claimCertificate = useCallback(async (certificateId) => {
        console.log('--- CLAIM CERTIFICATE DEBUG ---');
        console.log('Certificate ID:', certificateId);
        console.log('Wallet Client:', walletClient);

        if (!walletClient || !certificateId) {
            const err = new Error('Wallet not connected or invalid certificate.');
            console.error(err.message, { walletClient, certificateId });
            setPrepareError(err);
            setIsError(true);
            throw err;
        }

        setIsLoading(true);
        setIsError(false);
        setIsSuccess(false);
        setPrepareError(null);

        try {
            // 1. Get Signature and Metadata from Backend
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/certificates/${certificateId}/claim_signature/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to get claim authorization from server.');
            let { signature, metadata_uri, school_address, course_id, signer: expectedSigner } = await response.json();

            // 🎯 Ensure 0x prefix for viem (prevents SizeExceedsPaddingSizeError)
            const cleanSignature = signature.startsWith('0x') ? signature : `0x${signature}`;

            // 🎯 Signer Verification (Pre-flight check)
            // This prevents "Ordinary People" (students) from hitting a cryptic revert
            // and tells them exactly what to do.
            try {
                const currentContractSigner = await publicClient.readContract({
                    address: school_address,
                    abi: SCHOOL_ABI,
                    functionName: 'signer',
                });
                
                if (currentContractSigner?.toLowerCase() !== expectedSigner?.toLowerCase()) {
                    console.error('Signer mismatch:', { onChain: currentContractSigner, expected: expectedSigner });
                    throw new Error(`NFT Authorization Mismatch: The instructor hasn't authorized platform signatures for this school. Please ask them to "Sync Certificates" in their dashboard.`);
                }
            } catch (err) {
                console.error('Signer verification failed:', err);
                if (err.message.includes('Sync Certificates')) throw err;
                
                // If it's a revert or function not found, it's likely an old school contract
                if (err.message.includes('reverted') || err.message.includes('not found') || err.message.includes('execution reverted')) {
                    throw new Error("Outdated School Contract: This school was created with an older version of the protocol that doesn't support NFT certificates. Please contact the instructor.");
                }
                console.warn('Could not verify signer on-chain, proceeding anyway...', err);
            }

            // 2. Call Contract: claimCertificate(courseId, uri, signature)
            console.log('Claiming NFT Certificate on-chain...');
            const { request } = await publicClient.simulateContract({
                account: walletClient.account,
                address: school_address,
                abi: SCHOOL_ABI,
                functionName: 'claimCertificate',
                args: [BigInt(course_id), metadata_uri, cleanSignature],
            });

            const hash = await walletClient.writeContract(request);
            setTxHash(hash);

            const receipt = await waitForTransactionReceipt(publicClient, { hash });
            
            if (receipt?.status === 'success') {
                // 3. Sync with Backend
                // extract tokenId from receipt logs if possible, or let backend handle it
                const tokenId = receipt.logs?.[0]?.topics?.[3] ? BigInt(receipt.logs[0].topics[3]).toString() : null;
                
                await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/certificates/${certificateId}/sync_claim/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                    },
                    body: JSON.stringify({ tx_hash: hash, token_id: tokenId })
                });
                
                setIsSuccess(true);
            } else {
                setIsError(true);
            }

            setIsLoading(false);
            return { hash, receipt };
        } catch (err) {
            console.error('Certificate claim failure:', err);
            const revertReason = err.walk?.(e => e.reason)?.reason || err.reason || err.shortMessage || err.message;
            setPrepareError(new Error(`Claim Failed: ${revertReason}`));
            setIsError(true);
            setIsLoading(false);
            throw err;
        }
    }, [walletClient, publicClient]);

    return {
        writeEnroll,
        claimCertificate,
        isLoading,
        isError,
        isSuccess,
        txHash,
        isReady,
        prepareError,
    };
}

export { useWeb3Enrollment };