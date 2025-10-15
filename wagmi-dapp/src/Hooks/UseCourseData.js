// src/hooks/useCourseData.js

import { useState, useCallback, useEffect } from 'react';
import { apiCall } from '../api/api'; // Assuming api.js exists

export const useCourseData = (address, jwt, showMessage) => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalCourses: 0 });

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
      const coursesData = await apiCall('/courses/');
      setCourses(coursesData);
      setStats(prev => ({ ...prev, totalCourses: coursesData.length }));
    } catch (error) {
      console.error('Error loading courses:', error);
      showMessage('Failed to load courses', 'error');
    }
  }, [showMessage]);

  const enrollInCourse = useCallback(async (course) => {
    const token = localStorage.getItem('jwt');
    if (!token) { showMessage('Please connect and sign in to enroll', 'warning'); return; }
    try {
      setLoading(true);
      showMessage('Processing enrollment...', 'warning');
      await apiCall(`/courses/${course.id}/enroll/`, { method: 'POST' });
      showMessage('Successfully enrolled!', 'success');
      await loadUserData(token);
    } catch (error) {
      console.error('Enrollment error:', error);
      showMessage(`Enrollment failed: ${error.message || 'Check console.'}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [loadUserData, showMessage]);

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

  useEffect(() => {
    // Initial load of courses when component mounts
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
    completeCourse 
  };
};