// src/hooks/useCourseData.js - REVERTED & FIXED

import { useState, useCallback, useEffect } from 'react';
import { apiCall } from '../api/api';
import { useWeb3Enrollment } from './useWeb3Enrollment'; 

export const useCourseData = (address, jwt, showMessage) => {
    // --- State Initialization ---
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ totalCourses: 0 });
    
    // Web3 Enrollment State
    const [courseToEnroll, setCourseToEnroll] = useState(null); 

    // Wagmi hook access
    const {
        writeEnroll, 
        isLoading: isWeb3Loading, 
        isError: isWeb3Error, 
        isSuccess: isWeb3Success,
        isReady,
        txHash,
        prepareError
    } = useWeb3Enrollment(courseToEnroll?.price, courseToEnroll?.id); 

    // --- Core Data Fetching Functions ---

    const loadUserData = useCallback(async (token) => {
        if (!address || !token) return;
        try {
            setLoading(true);
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
            console.debug('Attempting to load available courses...');
            const coursesData = await apiCall('/courses/');
            
            if (Array.isArray(coursesData)) {
                 setCourses(coursesData);
                 setStats(prev => ({ ...prev, totalCourses: coursesData.length }));
                 console.debug(`Successfully loaded ${coursesData.length} courses.`);
            } else {
                 // 🚨 ENHANCED CHECK: If API returns unexpected format (e.g., an error object)
                 console.error('API /courses/ did not return an array:', coursesData);
                 showMessage('Course API returned unexpected data format.', 'error');
            }
           
        } catch (error) {
            console.error('FATAL Error loading courses:', error);
            showMessage(`Failed to load courses: ${error.message || 'Network error.'}`, 'error');
        }
    }, [showMessage]);

    // 📚 Lesson Functions (Simplified)
    const fetchLessonsAndProgress = useCallback(async (courseId) => {
        const token = localStorage.getItem('jwt');
        if (!token) return { lessons: [], progress: {} };
        
        try {
            setLoading(true);
            const data = await apiCall(`/courses/${courseId}/lessons_and_progress/`, {
                 headers: { 'Authorization': `Bearer ${token}` }
            });
            return { lessons: data.lessons || [], progress: data.progress || {} };
        } catch (error) {
            console.error('Error loading lessons and progress:', error);
            showMessage('Failed to load curriculum details.', 'error');
            return { lessons: [], progress: {} };
        } finally {
            setLoading(false);
        }
    }, [showMessage]);

    const markLessonCompleted = useCallback(async (lessonId, courseId) => {
        const token = localStorage.getItem('jwt');
        if (!token) { showMessage('Please sign in to mark a lesson complete', 'warning'); return false; }
        try {
            setLoading(true);
            await apiCall(`/lessons/${lessonId}/complete/`, { 
                method: 'POST', 
                body: JSON.stringify({ course_id: courseId }),
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            return true; 
        } catch (error) {
            console.error('Lesson completion error:', error);
            showMessage(`Failed to mark lesson complete: ${error.message || 'Check console.'}`, 'error');
            return false;
        } finally {
            setLoading(false);
        }
    }, [showMessage]);


    // --- Enrollment Handler (Triggers Web3 Flow) ---

    const enrollInCourse = useCallback(async (course) => {
        const token = localStorage.getItem('jwt');
        if (!token) { showMessage('Please connect and sign in to enroll', 'warning'); return; }
        if (!address) { showMessage('Please connect your wallet to enroll', 'warning'); return; }

        if (!course || !course.id || !course.price) {
            console.error("Enrollment failed: Course data is missing ID or price.", course);
            showMessage('Error: Missing course price or ID.', 'error');
            return;
        }
        
        // 🚨 REFACTOR FIX: Removed setLoading(true) here. 
        // Loading is managed by isWeb3Loading and the final combined state.
        setCourseToEnroll(course);
        showMessage('Preparing wallet transaction...', 'info');
        
    }, [showMessage, address]);


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


    // ⚠️ Transaction Lifecycle Manager (Web3 Submission Effect)
    useEffect(() => {
        if (!courseToEnroll || isWeb3Loading) return;

        if (!address) {
            showMessage('Wallet disconnected. Please reconnect to enroll.', 'warning');
            setCourseToEnroll(null);
            // No need to call setLoading(false) as it wasn't called in enrollInCourse
            return;
        }

        if (isReady && typeof writeEnroll === 'function') {
            (async () => {
                try {
                    // Set loading state explicitly when the tx is submitted
                    setLoading(true); 
                    console.debug('Invoking writeEnroll for course:', courseToEnroll.id);
                    await writeEnroll();
                    showMessage('Confirm in wallet...', 'warning');
                } catch (e) {
                    showMessage(`Transaction submission failed: ${e?.message || 'User rejected.'}`, 'error');
                    setCourseToEnroll(null);
                    setLoading(false);
                }
            })();
            return;
        }
        
        if (isWeb3Error && !isWeb3Success) {
            const errorMsg = prepareError ? `Preparation failed: ${prepareError.reason || prepareError.name}` : 'Configuration error.';
            showMessage(errorMsg, 'error');
            setCourseToEnroll(null);
            // No need to call setLoading(false) here either
            return;
        }
        
    }, [courseToEnroll, isReady, isWeb3Success, isWeb3Error, isWeb3Loading, writeEnroll, showMessage, prepareError, address]);


    // ⚠️ Transaction Backend Sync Effect (Runs only AFTER successful transaction is mined)
    useEffect(() => {
        if (!isWeb3Success || !courseToEnroll || !txHash) return;

        (async () => {
            const token = localStorage.getItem('jwt');
            if (!token) {
                showMessage('Session expired. Please re-sign in.', 'error');
                setCourseToEnroll(null);
                setLoading(false);
                return;
            }

            try {
                showMessage('Recording enrollment on server...', 'info');
                await apiCall(`/courses/${courseToEnroll.id}/enroll/`, {
                    method: 'POST',
                    body: JSON.stringify({ 
                        tx_hash: txHash,
                        wallet_address: address,
                        course_id: courseToEnroll.id
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                showMessage('Enrollment confirmed on server!', 'success');
                await loadUserData(token);
                
            } catch (error) {
                console.error('Backend enrollment error:', error);
                showMessage(`Server sync failed: ${error?.message || 'Unknown error'}`, 'error');
            } finally {
                setCourseToEnroll(null);
                setLoading(false);
            }
        })();

    }, [isWeb3Success, courseToEnroll, txHash, address, showMessage, loadUserData]);

    // --- Initial Load Effect (CRITICAL for courses display) ---
    useEffect(() => {
        loadCourses();
    }, [loadCourses]); 

    // --- Final Return ---
    const combinedLoading = loading || isWeb3Loading;

    return { 
        user, 
        courses, 
        certificates, 
        loading: combinedLoading,
        stats, 
        loadUserData, 
        enrollInCourse, 
        completeCourse,
        fetchLessonsAndProgress,
        markLessonCompleted
    };
};