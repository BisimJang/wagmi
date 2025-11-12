// src/hooks/useCourseData.js

import { useState, useCallback, useEffect } from 'react';
import { apiCall } from '../api/api';
// ⚠️ NEW: Import the Web3 enrollment hook
import { useWeb3Enrollment } from './useWeb3Enrollment'; 

export const useCourseData = (address, jwt, showMessage) => {
    // --- State Initialization ---
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ totalCourses: 0 });
    
    // ⚠️ NEW STATE: Holds the course selected for Web3 transaction
    const [courseToEnroll, setCourseToEnroll] = useState(null); 

    // ⚠️ NEW HOOK CALL: Access Wagmi transaction logic
    const {
        writeEnroll, 
        isLoading: isWeb3Loading, 
        isError: isWeb3Error, 
        isSuccess: isWeb3Success,
        isReady,
        txHash,
        prepareError
    } = useWeb3Enrollment(courseToEnroll?.price); 

    // --- Core Data Fetching Functions (Your Original Logic) ---

    const loadUserData = useCallback(async (token) => {
        if (!address || !token) return;
        try {
            setLoading(true);
            // NOTE: Using /me/ as per your previous update
            const user_data = await apiCall(`/me/`, { 
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setUser(user_data);
            setCertificates(user_data.certificates || []); 
        } catch (error) {
            console.error('Error loading user data:', error);
            showMessage(`Failed to load user data: ${error.message || 'Check console.'}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [address, showMessage]);

    const loadCourses = useCallback(async () => {
        try {
            const coursesData = await apiCall('/courses/');
            setCourses(coursesData);
            setStats(prev => ({ ...prev, totalCourses: coursesData.length }));
        } catch (error) {
            console.error('Error loading courses:', error);
            showMessage('Failed to load courses', 'error');
        }
    }, [showMessage]);

    // --- Enrollment Handler (Triggers Web3 Flow) ---

    const enrollInCourse = useCallback(async (course) => {
        const token = localStorage.getItem('jwt');
        if (!token) { 
            showMessage('Please connect and sign in to enroll', 'warning'); 
            return; 
        }
        
        // Ensure wallet is connected/available before preparing tx
        if (!address) { 
            showMessage('Please connect your wallet to enroll', 'warning'); 
            return; 
        }
        
        // Start loading and set the course to initiate Wagmi preparation
        // The submission logic is now handled exclusively by the useEffect below
        setLoading(true);
        setCourseToEnroll(course);
        showMessage('Preparing wallet transaction...', 'info');
        
    }, [showMessage, address]);

    // --- Completion Handler (Your Original Logic) ---

    const completeCourse = useCallback(async (courseId) => {
        const token = localStorage.getItem('jwt');
        if (!token) { showMessage('Please sign in to complete a course', 'warning'); return; }
        try {
            setLoading(true);
            showMessage('Processing completion...', 'warning');
            await apiCall(`/courses/${courseId}/complete/`, { method: 'POST' });
            showMessage('Course completed! Certificate issued.', 'success');
            await loadUserData(token);
        } catch (error) {
            console.error('Completion error:', error);
            showMessage(`Failed to complete course: ${error.message || 'Check console.'}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [loadUserData, showMessage]);


    // ⚠️ Transaction Lifecycle Manager (Web3 Effect)
    useEffect(() => {
        // 1. Exit early if no course is selected or if a transaction is already in flight
        if (!courseToEnroll || isWeb3Loading) return;

        // 2. ERROR: Check for wallet connection failure during preparation
        if (!address) {
            showMessage('Wallet disconnected. Please reconnect to enroll.', 'warning');
            setCourseToEnroll(null);
            setLoading(false);
            return;
        }

        // 3. READY: If Wagmi config is complete, send the transaction
        if (isReady && typeof writeEnroll === 'function') {
            
            // 🎯 Action: Submit transaction to the wallet
            (async () => {
                try {
                    console.debug('Invoking writeEnroll for course:', courseToEnroll.id);
                    await writeEnroll(); // Opens the wallet prompt
                    showMessage('Confirm in wallet...', 'warning');
                } catch (e) {
                    // Catches user rejection or immediate submission error
                    showMessage(`Transaction submission failed: ${e?.message || 'User rejected.'}`, 'error');
                    setCourseToEnroll(null);
                    setLoading(false);
                }
            })();
            
            // Stop further execution until Wagmi success/error state changes
            return;
        }

        // 4. SUCCESS: Transaction is mined
        if (isWeb3Success) {
            showMessage(`Enrollment successful! Tx: ${txHash.substring(0, 10)}...`, 'success');
            
            // 🎯 Action: Call Backend for final logging/NFT trigger
            (async () => {
                const token = localStorage.getItem('jwt');
                if (!token) { showMessage('Session expired. Please re-sign in.', 'error'); return; }
                
                try {
                    await apiCall(`/courses/${courseToEnroll.id}/enroll/`, { 
                        method: 'POST',
                        body: JSON.stringify({ tx_hash: txHash, course_id: courseToEnroll.id }),
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
                    });
                    showMessage('Enrollment confirmed on server.', 'success');
                    await loadUserData(token); 
                } catch (error) {
                    console.error('Backend Enrollment Confirmation Error:', error);
                    showMessage('Enrollment confirmed on-chain, but server recording failed.', 'error');
                } finally {
                    setCourseToEnroll(null);
                    setLoading(false);
                }
            })();
            
            return;
        }

        // 5. ERROR: Preparation or Transaction failed
        if (isWeb3Error) {
            const errorMsg = prepareError ? `Preparation failed: ${prepareError.reason || prepareError.name}` : 'Transaction failed.';
            showMessage(errorMsg, 'error');
            setCourseToEnroll(null);
            setLoading(false);
            return;
        }
        
        // 6. DEBUG: Log that we are waiting for readiness if none of the above states were hit.
        if (courseToEnroll && !isReady) {
            console.debug('Waiting for web3 readiness...', { courseId: courseToEnroll.id });
        }
        
    }, [courseToEnroll, isReady, isWeb3Success, isWeb3Error, isWeb3Loading, writeEnroll, txHash, showMessage, loadUserData, prepareError, address]);


    // --- Initial Load Effect (Your Original Logic) ---
    useEffect(() => {
        loadCourses();
    }, [loadCourses]); 

    // --- Final Return ---
    const combinedLoading = loading || isWeb3Loading;

    return { 
        user, 
        courses, 
        certificates, 
        loading: combinedLoading, // Expose combined loading state
        stats, 
        loadUserData, 
        enrollInCourse, 
        completeCourse 
    };
};