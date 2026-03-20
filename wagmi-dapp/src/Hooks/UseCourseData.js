// src/hooks/useCourseData.js - REVERTED & FIXED

import { useState, useCallback, useEffect } from 'react';
import { apiCall } from '../api/api';
import { useWeb3Enrollment } from './useWeb3Enrollment'; 
import { useWeb3Publish } from './useWeb3Publish';
import { COURSE_CONTRACT_ADDRESS } from '../web3/constants';

export const useCourseData = (address, showMessage) => {
    // --- State Initialization ---
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ totalCourses: 0 });
    
    // Web3 State
    const [courseToEnroll, setCourseToEnroll] = useState(null); 
    const [courseToMint, setCourseToMint] = useState(null);

    // Wagmi hooks
    const {
        writeEnroll, 
        isLoading: isWeb3Loading, 
        isSuccess: isWeb3Success,
        isReady,
        txHash
    } = useWeb3Enrollment(); 

    const {
        publishCourseOnChain,
        bulkPublishOnChain,
        isLoading: isPublishLoading,
        isSuccess: isPublishSuccess,
        txHash: publishTxHash
    } = useWeb3Publish();

    // --- Core Data Fetching Functions ---

    const loadUserData = useCallback(async (token) => {
        if (!address) return;
        try {
            setLoading(true);
            const user_data = await apiCall(`/me/`);
            
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
            const data = await apiCall(`/courses/${courseId}/lessons_and_progress/`);
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
                body: JSON.stringify({ course_id: courseId })
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


    // --- Course Management ---
    const createCourse = useCallback(async (courseData) => {
        const token = localStorage.getItem('jwt');
        if (!token) { showMessage('Please sign in to create a course', 'warning'); return null; }
        
        try {
            setLoading(true);
            showMessage('Creating course...', 'info');
            // Backend handles linking
            const newCourse = await apiCall('/courses/', {
                method: 'POST',
                body: JSON.stringify(courseData)
            });
            showMessage('Course details saved.', 'success');
            await loadCourses(); // refresh the course list
            return newCourse;
        } catch (error) {
            console.error('Course creation error:', error);
            showMessage(`Failed to create course: ${error.message || 'Check console.'}`, 'error');
            return null;
        } finally {
            setLoading(false);
        }
    }, [showMessage, loadCourses]);

    const createSection = useCallback(async (courseId, title) => {
        const token = localStorage.getItem('jwt');
        if (!token) { showMessage('Please sign in to add sections', 'warning'); return null; }
        
        try {
            setLoading(true);
            const newSection = await apiCall('/sections/', {
                method: 'POST',
                body: JSON.stringify({ course: courseId, title: title, order: 0 })
            });
            return newSection;
        } catch (error) {
            console.error('Section creation error:', error);
            showMessage(`Failed to add section: ${error.message}`, 'error');
            return null;
        } finally {
            setLoading(false);
        }
    }, [showMessage]);

    const createLesson = useCallback(async (sectionId, lessonData) => {
        const token = localStorage.getItem('jwt');
        if (!token) { showMessage('Please sign in to add lessons', 'warning'); return null; }
        
        try {
            setLoading(true);
            const newLesson = await apiCall('/lessons/', {
                method: 'POST',
                body: JSON.stringify({ section: sectionId, ...lessonData, order: 0 })
            });
            showMessage('Lesson added.', 'success');
            return newLesson;
        } catch (error) {
            console.error('Lesson creation error:', error);
            showMessage(`Failed to add lesson: ${error.message}`, 'error');
            return null;
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
        
        setCourseToEnroll(course); // Keep it strictly for tracking the background API sync effect
        showMessage('Preparing wallet transaction...', 'info');
        
        try {
            if (typeof writeEnroll === 'function') {
                // Pass the sovereign school address if it exists, otherwise it defaults to legacy in the hook
                await writeEnroll(course.id, course.price, course.school_address);
            }
        } catch (error) {
            showMessage(`Transaction submission failed: ${error?.message || 'User rejected.'}`, 'error');
            setCourseToEnroll(null);
        }
    }, [showMessage, address, writeEnroll]);


    /**
     * Bulk Mints multiple courses in one transaction.
     */
    const bulkMintCourses = useCallback(async (courseIds, prices, targetAddress) => {
        if (!address) { showMessage('Please connect your wallet', 'warning'); return; }
        if (!targetAddress) { showMessage('No school contract found to mint on.', 'error'); return; }
        
        setLoading(true);
        try {
            const receipt = await bulkPublishOnChain(courseIds, prices, targetAddress);
            if (receipt) {
                // Update local state for all courses
                setCourses(prev => prev.map(c => 
                    courseIds.includes(c.id) ? { ...c, is_minted: true, school_address: targetAddress } : c
                ));

                // Notify backend for each course using the correct endpoint
                await Promise.all(courseIds.map(id => apiCall(`/courses/${id}/confirm_mint/`, { 
                    method: 'POST',
                    body: JSON.stringify({ 
                        tx_hash: receipt.transactionHash || receipt.hash,
                        school_address: targetAddress 
                    })
                })));
                showMessage(`${courseIds.length} courses verified on-chain!`, 'success');
                await loadCourses();
            }
        } catch (error) {
            console.error('Bulk minting error:', error);
            showMessage(`Bulk minting failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [bulkPublishOnChain, address, showMessage, loadCourses]);

    const mintCourse = useCallback(async (courseId, price, targetAddress) => {
        const token = localStorage.getItem('jwt');
        if (!token) { showMessage('Please sign in to mint a course', 'warning'); return; }
        if (!address) { showMessage('Please connect your wallet', 'warning'); return; }
        if (!targetAddress) { showMessage('No school contract found to mint on.', 'error'); return; }

        const course = courses.find(c => c.id === courseId);
        if (!course) { showMessage('Course not found.', 'error'); return; }

        setCourseToMint(course);
        setLastMintSchoolAddress(targetAddress);
        showMessage('Initializing on-chain minting...', 'info');

        try {
            // This triggers the useEffect when successful
            await publishCourseOnChain(courseId, price, targetAddress);
        } catch (e) {
            showMessage(`Minting failed: ${e.message}`, 'error');
            setCourseToMint(null);
            setLastMintSchoolAddress(null);
        }
    }, [address, courses, showMessage, publishCourseOnChain]);

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


    // (Removed Web3 Submission Effect to prevent StrictMode double-firing)


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
                    })
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

    // ⚠️ Mint Sync Effect
    const [lastMintSchoolAddress, setLastMintSchoolAddress] = useState(null);

    useEffect(() => {
        if (!isPublishSuccess || !courseToMint || !publishTxHash) return;

        (async () => {
            const token = localStorage.getItem('jwt');
            if (!token) return;

            try {
                showMessage('Verifying mint on backend...', 'info');
                await apiCall(`/courses/${courseToMint.id}/confirm_mint/`, {
                    method: 'POST',
                    body: JSON.stringify({ 
                        tx_hash: publishTxHash,
                        school_address: lastMintSchoolAddress
                    })
                });
                showMessage('Course successfully minted on-chain!', 'success');
                await loadCourses();
            } catch (error) {
                console.error('Mint sync error:', error);
                showMessage('Failed to sync mint status to server.', 'error');
            } finally {
                setCourseToMint(null);
                setLastMintSchoolAddress(null);
            }
        })();
    }, [isPublishSuccess, courseToMint, publishTxHash, lastMintSchoolAddress, showMessage, loadCourses]);

    // --- Initial Load Effect (CRITICAL for courses display) ---
    useEffect(() => {
        loadCourses();
    }, [loadCourses]); 

    // --- Final Return ---
    const combinedLoading = loading || isWeb3Loading || isPublishLoading;

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
        markLessonCompleted,
        createCourse,
        createSection,
        createLesson,
        mintCourse,
        bulkMintCourses
    };
};