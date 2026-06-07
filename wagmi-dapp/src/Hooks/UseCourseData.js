// src/hooks/useCourseData.js
// Web3 hooks are imported but dormant — re-enable later by uncommenting

import { useState, useCallback, useEffect } from 'react';
import { apiCall } from '../api/api';
// import { useWeb3Enrollment } from './useWeb3Enrollment'; // Web3 - disabled
// import { useWeb3Publish } from './useWeb3Publish'; // Web3 - disabled

export const useCourseData = (showMessage, jwt) => {
    // --- State Initialization ---
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ totalCourses: 0 });
    const [schools, setSchools] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    
    // Pagination State
    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
        currentPage: 1
    });

    // Web3 state — kept for future re-enable
    // const [courseToEnroll, setCourseToEnroll] = useState(null);
    // const [courseToMint, setCourseToMint] = useState(null);

    // --- Core Data Fetching Functions ---

    const loadUserData = useCallback(async (token) => {
        try {
            setLoading(true);
            const user_data = await apiCall(`/me/`);
            
            setUser(user_data);
            setCertificates(user_data.certificates || []); 
            
            // 🆕 Consolidation: Fetch full course objects for all enrollments
            if (user_data.enrollments && user_data.enrollments.length > 0) {
                const enrolledIds = user_data.enrollments.map(e => e.course_id);
                try {
                    const coursesData = await Promise.all(enrolledIds.map(id => apiCall(`/courses/${id}/`)));
                    setMyCourses(coursesData);
                } catch (e) {
                    console.error('Error fetching enrolled course details:', e);
                }
            } else {
                setMyCourses([]);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            showMessage(`Failed to load user data: ${error.message || 'Check console.'}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [showMessage]);

    const loadCourses = useCallback(async (searchQuery = '', page = 1) => {
        try {
            console.debug('Attempting to load courses...', { searchQuery, page });
            let url = `/courses/?page=${page}`;
            if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
            
            const data = await apiCall(url);
            
            // Handle Paginated Results
            if (data && data.results) {
                 setCourses(data.results);
                 setPagination({
                     count: data.count,
                     next: data.next,
                     previous: data.previous,
                     currentPage: page
                 });
                 setStats(prev => ({ ...prev, totalCourses: data.count }));
            } 
            // Fallback for non-paginated (legacy or special)
            else if (Array.isArray(data)) {
                 setCourses(data);
                 setStats(prev => ({ ...prev, totalCourses: data.length }));
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            showMessage(`Failed to load courses: ${error.message || 'Network error.'}`, 'error');
        }
    }, [showMessage]);

    const fetchSchools = useCallback(async () => {
        try {
            const data = await apiCall('/schools/?mine=true');
            setSchools(Array.isArray(data) ? data : (data?.results || []));
        } catch (error) {
            console.error('Error loading schools:', error);
        }
    }, []);

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

    const updateCourse = useCallback(async (courseId, courseData) => {
        const token = localStorage.getItem('jwt');
        if (!token) return null;
        try {
            setLoading(true);
            const updated = await apiCall(`/courses/${courseId}/`, {
                method: 'PATCH',
                body: JSON.stringify(courseData)
            });
            showMessage('Course updated.', 'success');
            await loadCourses();
            return updated;
        } catch (error) {
            console.error('Course update error:', error);
            showMessage(`Failed to update course: ${error.message}`, 'error');
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

    const updateSection = useCallback(async (sectionId, title) => {
        try {
            setLoading(true);
            const updated = await apiCall(`/sections/${sectionId}/`, {
                method: 'PATCH',
                body: JSON.stringify({ title })
            });
            showMessage('Section updated.', 'success');
            return updated;
        } catch (error) {
            console.error('Section update error:', error);
            showMessage(`Failed to update section: ${error.message}`, 'error');
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

    const updateLesson = useCallback(async (lessonId, lessonData) => {
        try {
            setLoading(true);
            const updated = await apiCall(`/lessons/${lessonId}/`, {
                method: 'PATCH',
                body: JSON.stringify(lessonData)
            });
            showMessage('Lesson updated.', 'success');
            return updated;
        } catch (error) {
            console.error('Lesson update error:', error);
            showMessage(`Failed to update lesson: ${error.message}`, 'error');
            return null;
        } finally {
            setLoading(false);
        }
    }, [showMessage]);

    // --- Enrollment Handler (Web2 — no wallet needed) ---
    const COGNITIVE_LOAD_LIMIT = 3;

    const enrollInCourse = useCallback(async (course) => {
        const token = localStorage.getItem('jwt');
        if (!token) { showMessage('Please sign in to enroll', 'warning'); return; }

        if (!course || !course.id) {
            showMessage('Error: Missing course data.', 'error');
            return;
        }

        // 🧠 Cognitive Load Check
        const activeEnrollments = user?.enrollments?.filter(e => e.role === 'student') || [];
        if (activeEnrollments.length >= COGNITIVE_LOAD_LIMIT) {
            showMessage(`You have ${activeEnrollments.length} active courses. Complete one to unlock a new slot.`, 'warning');
            return;
        }

        const fiatPrice = parseFloat(course.fiat_price || 0);

        // Free course — enroll directly via API
        if (fiatPrice === 0) {
            try {
                setLoading(true);
                await apiCall(`/courses/${course.id}/enroll/`, {
                    method: 'POST',
                    body: JSON.stringify({ tx_hash: null, wallet_address: null })
                });
                showMessage('Enrolled successfully!', 'success');
                await loadUserData(token);
            } catch (error) {
                showMessage(`Enrollment failed: ${error.message}`, 'error');
            } finally {
                setLoading(false);
            }
            return;
        }

        // Paid course — redirect to Paystack
        await payWithFiat(course);
    }, [showMessage, user, loadUserData]);

    const payWithFiat = useCallback(async (course) => {
        const token = localStorage.getItem('jwt');
        if (!token) { showMessage('Please connect and sign in to enroll', 'warning'); return; }

        if (!course || !course.id || !course.price) {
            showMessage('Error: Missing course price or ID.', 'error');
            return;
        }

        try {
            setLoading(true);
            showMessage('Initializing payment...', 'info');
            const data = await apiCall(`/courses/${course.id}/pay/`, {
                method: 'POST',
                body: JSON.stringify({
                    callback_url: window.location.origin + '/courses'
                })
            });
            
            if (data && data.authorization_url) {
                window.location.href = data.authorization_url; // Redirect to Paystack
            } else {
                showMessage('Payment initialization failed.', 'error');
            }
        } catch (error) {
            console.error('Paystack init error:', error);
            showMessage(`Payment failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [showMessage]);



    const mintCourse = useCallback(async () => {
        // Web3 disabled — re-enable by uncommenting and wiring up publishCourseOnChain
        showMessage('On-chain minting is not enabled yet.', 'info');
    }, [showMessage]);

    const bulkMintCourses = useCallback(async () => {
        // Web3 disabled — re-enable later
        showMessage('Bulk minting is not enabled yet.', 'info');
    }, [showMessage]);

    const claimCertificate = useCallback(async () => {
        // Web3 disabled — re-enable later
        showMessage('NFT certificate claiming is not enabled yet.', 'info');
    }, [showMessage]);

    const syncEnrollmentWithBackend = useCallback(async (courseId) => {
        const token = localStorage.getItem('jwt');
        if (!token) return;
        try {
            await apiCall(`/courses/${courseId}/enroll/`, {
                method: 'POST',
                body: JSON.stringify({ tx_hash: null, wallet_address: null })
            });
            await loadUserData(token);
            return true;
        } catch (error) {
            console.error('Sync failed:', error);
            return false;
        }
    }, [loadUserData]);

    const completeCourse = useCallback(async (courseId) => {
        const token = localStorage.getItem('jwt');
        if (!token) { showMessage('Please sign in to complete a course', 'warning'); return; }
        try {
            setLoading(true);
            showMessage('Processing completion...', 'warning');
            const result = await apiCall(`/courses/${courseId}/complete/`, { method: 'POST' });
            showMessage('Course completed! Certificate issued.', 'success');
            await loadUserData(token);
            return result;
        } catch (error) {
            console.error('Completion error:', error);
            showMessage(`Failed to complete course: ${error.message || 'Check console.'}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [loadUserData, showMessage]);

    // --- Initial Load Effect ---
    useEffect(() => {
        loadCourses();
    }, [loadCourses]);

    return {
        user,
        courses,
        certificates,
        loading,
        stats,
        loadUserData,
        enrollInCourse,
        completeCourse,
        claimCertificate,
        fetchLessonsAndProgress,
        markLessonCompleted,
        loadCourses,
        fetchSchools,
        schools,
        pagination,
        createCourse,
        updateCourse,
        createSection,
        updateSection,
        createLesson,
        updateLesson,
        mintCourse,
        bulkMintCourses,
        syncEnrollmentWithBackend,
        myCourses,
        setMyCourses,
        payWithFiat
    };
};
