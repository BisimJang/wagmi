import { useState, useCallback } from 'react';
import { useWalletClient, usePublicClient, useAccount } from 'wagmi';
import { parseUnits, decodeEventLog } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { SCHOOL_REGISTRY_ADDRESS, SCHOOL_REGISTRY_ABI } from '../web3/constants';
import { apiCall } from '../api/api';

/**
 * Hook to interact with the School Registry Factory.
 */
export function useSchoolRegistry(showMessage) {
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    
    const [isLoading, setIsLoading] = useState(false);
    const [ownedSchools, setOwnedSchools] = useState([]);

    /**
     * Creates a new sovereign school contract via the Factory.
     */
    const createSchoolOnChain = useCallback(async (schoolName) => {
        if (!walletClient || !address) {
            showMessage('Wallet not connected', 'error');
            return null;
        }

        setIsLoading(true);
        try {
            const hash = await walletClient.writeContract({
                address: SCHOOL_REGISTRY_ADDRESS,
                abi: SCHOOL_REGISTRY_ABI,
                functionName: 'createSchool',
                args: [schoolName],
            });

            showMessage(`Deploying ${schoolName} on-chain...`, 'info');
            const receipt = await waitForTransactionReceipt(publicClient, { hash });

            if (receipt.status === 'success') {
                // Find school address from logs
                let schoolAddress = null;
                try {
                    for (const log of receipt.logs) {
                        try {
                            const decoded = decodeEventLog({
                                abi: SCHOOL_REGISTRY_ABI,
                                data: log.data,
                                topics: log.topics,
                            });
                            if (decoded.eventName === 'SchoolCreated') {
                                schoolAddress = decoded.args.schoolAddress;
                                break;
                            }
                        } catch (e) { /* ignore other events */ }
                    }
                    
                    if (schoolAddress) {
                        await apiCall('/schools/register/', {
                            method: 'POST',
                            body: JSON.stringify({ address: schoolAddress, name: schoolName })
                        });
                        console.log('School registered in backend:', schoolAddress);
                    }
                } catch (syncErr) {
                    console.error('Failed to sync school to backend:', syncErr);
                }

                showMessage('School successfully created on-chain!', 'success');
                await fetchOwnedSchools();
                return receipt;
            }
        } catch (error) {
            console.error('School creation error:', error);
            
            // Simulation fallback if revert occurs
            if (error.message.includes('gas limit') || error.message.includes('execution reverted')) {
                const proceed = confirm("Smart Contract revert (gas limit too high).\n\nWould you like to SIMULATE a successful school creation for UI testing?");
                if (proceed) {
                    const mockSchoolAddress = `0xschool${Math.random().toString(16).slice(2)}abc987654321`;
                    setOwnedSchools(prev => [...prev, mockSchoolAddress]);
                    showMessage('Simulated school creation successful!', 'success');
                    return { status: 'simulated', address: mockSchoolAddress };
                }
            }

            showMessage(`Failed to create school: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
        return null;
    }, [walletClient, address, publicClient, showMessage]);

    /**
     * Fetches all school addresses owned by the current user.
     * Prioritizes backend for reliability, with contract as secondary.
     */
    const fetchOwnedSchools = useCallback(async () => {
        if (!address) return [];
        
        let schoolsList = [];

        // 1. Fetch from Backend (Source of Truth for Dashboard)
        try {
            const backendSchools = await apiCall('/schools/');
            if (Array.isArray(backendSchools)) {
                // Filter where current user is the instructor
                schoolsList = backendSchools
                    .filter(s => s.instructor_address?.toLowerCase() === address.toLowerCase())
                    .map(s => s.address);
            }
        } catch (err) {
            console.error('Error fetching schools from backend:', err);
        }

        // 2. Optional: Parallel check with Contract (if available)
        if (publicClient && SCHOOL_REGISTRY_ADDRESS && SCHOOL_REGISTRY_ADDRESS !== '0x0000000000000000000000000000000000000000') {
            try {
                const contractSchools = await publicClient.readContract({
                    address: SCHOOL_REGISTRY_ADDRESS,
                    abi: SCHOOL_REGISTRY_ABI,
                    functionName: 'getSchoolsByCreator',
                    args: [address],
                });
                
                // Merge and deduplicate
                const merged = [...new Set([...schoolsList, ...contractSchools])];
                schoolsList = merged;
            } catch (error) {
                // Silicon error if it's just a local deployment mismatch
                console.warn('Contract getSchoolsByCreator failed, relying on backend:', error.message);
            }
        }

        setOwnedSchools(schoolsList);
        return schoolsList;
    }, [publicClient, address]);

    /**
     * Creates a new school and initializes course prices in one transaction.
     */
    const createSchoolWithCourses = useCallback(async (schoolName, courseIds, prices) => {
        if (!walletClient || !address) {
            showMessage('Wallet not connected', 'error');
            return null;
        }

        setIsLoading(true);
        try {
            const hash = await walletClient.writeContract({
                address: SCHOOL_REGISTRY_ADDRESS,
                abi: SCHOOL_REGISTRY_ABI,
                functionName: 'createSchoolWithCourses',
                args: [schoolName, courseIds.map(id => BigInt(id)), prices.map(p => parseUnits(String(p), 18))],
            });

            showMessage(`Launching ${schoolName} with ${courseIds.length} courses...`, 'info');
            const receipt = await waitForTransactionReceipt(publicClient, { hash });

            if (receipt.status === 'success') {
                // Find school address from logs
                let schoolAddress = null;
                try {
                    for (const log of receipt.logs) {
                        try {
                            const decoded = decodeEventLog({
                                abi: SCHOOL_REGISTRY_ABI,
                                data: log.data,
                                topics: log.topics,
                            });
                            if (decoded.eventName === 'SchoolCreated') {
                                schoolAddress = decoded.args.schoolAddress;
                                break;
                            }
                        } catch (e) { /* ignore other events */ }
                    }
                    
                    if (schoolAddress) {
                        await apiCall('/schools/register/', {
                            method: 'POST',
                            body: JSON.stringify({ address: schoolAddress, name: schoolName })
                        });
                        console.log('School & Courses registered in backend:', schoolAddress);
                    }
                } catch (syncErr) {
                    console.error('Failed to sync school to backend:', syncErr);
                }

                showMessage('School & Courses successfully initialized on-chain!', 'success');
                await fetchOwnedSchools();
                return receipt;
            }
        } catch (error) {
            console.error('Bulk school creation error:', error);
            showMessage(`Failed to launch school: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
        return null;
    }, [walletClient, address, publicClient, showMessage, fetchOwnedSchools]);
    return {
        createSchoolOnChain,
        createSchoolWithCourses,
        fetchOwnedSchools,
        ownedSchools,
        isLoading
    };
}
