// src/App.jsx

import React, { useState, useCallback } from 'react';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import './App.css';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useCourseData } from './hooks/useCourseData';

// Components
import Message from './components/Feedback/Message';
import LoadingSpinner from './components/Feedback/LoadingSpinner';

// Pages
import HomePage from './pages/HomePage.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import CourseDetailPage from './pages/CourseDetailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CertificatesPage from './pages/CertificatesPage.jsx';

// Helper function to convert flat lessons into nested sections
const groupLessonsBySection = (flatLessons) => {
  // 1. Create a map to hold sections temporarily
  const sectionsMap = new Map();

  flatLessons.forEach(lesson => {
    // Assuming the flat lesson data contains section_id, section_title, and section_order
    const sectionId = lesson.section_id;

    // If the section hasn't been added to the map yet, create it.
    if (!sectionsMap.has(sectionId)) {
      sectionsMap.set(sectionId, {
        id: sectionId,
        title: lesson.section_title,
        order: lesson.section_order || 0,
        lessons: []
      });
    }

    // 2. Add the lesson to the corresponding section's lessons array
    // NOTE: We strip the redundant section_id/title here to keep the final lesson object clean.
    const { section_id, section_title, section_order, ...lessonData } = lesson;
    sectionsMap.get(sectionId).lessons.push(lessonData);
  });

  // 3. Convert the map values back to an array and sort by section order
  const nestedSections = Array.from(sectionsMap.values()).sort((a, b) => a.order - b.order);

  return nestedSections;
};


function App() {
  const { address, isConnected } = useAccount();

  // --- Local State ---
  const [currentPage, setCurrentPage] = useState('home');
  const [message, setMessage] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // NEW STATE FOR LESSONS
  const [selectedCourseLessons, setSelectedCourseLessons] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({});

  const showMessage = useCallback((text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  // 1. Data Logic Hook
  const {
    user,
    courses,
    certificates,
    loading: dataLoading,
    stats,
    loadUserData,
    enrollInCourse,
    completeCourse,
    fetchLessonsAndProgress, // Assumed to be available
    markLessonCompleted,     // Assumed to be available
  } = useCourseData(address, null, showMessage);

  // 2. Auth Logic Hook
  const {
    jwt,
    authLoading,
    loginWithWallet
  } = useAuth(loadUserData, showMessage);

  const loading = dataLoading || authLoading;

  // --- Core Application Logic ---

  const showPage = (pageId) => {
    setCurrentPage(pageId);
    // Clear detail state when navigating away
    if (pageId !== 'courseDetail') {
      setSelectedCourse(null);
      setSelectedCourseLessons(null);
      setLessonProgress({});
    }
  };

  // UPDATED: Fetch lessons, group by section, and update state
  const loadCourseDetails = async (course) => {
    setSelectedCourse(course);
    setCurrentPage('courseDetail');

    // Call the assumed hook function to fetch specific course lessons and user progress
    // Assume flatLessons contains lesson objects with section_id and section_title
    const { lessons: flatLessons, progress } = await fetchLessonsAndProgress(course.id);

    // Group the flat lessons into the section hierarchy
    const nestedSections = groupLessonsBySection(flatLessons);

    setSelectedCourseLessons(nestedSections); // Now contains sections -> lessons
    setLessonProgress(progress);
  };

  const handleLessonComplete = async (lessonId) => {
    const success = await markLessonCompleted(lessonId, selectedCourse.id);

    if (success) {
      // Optimistically update local state to reflect completion
      setLessonProgress(prev => ({
        ...prev,
        [lessonId]: { ...prev[lessonId], completed: true, progress: 100 }
      }));
      showMessage('Lesson marked as complete!', 'success');
    }
  };

  const getCourseEnrollmentStatus = (courseId) => {
    if (!user) return null;
    if (user.certificates?.some(cert => cert.course_id === courseId)) return 'completed';
    if (user.enrollments?.some(enrollment => enrollment.course_id === courseId)) return 'enrolled';
    return null;
  };

  // --- Router/View Render ---

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage stats={stats} user={user} certificates={certificates} showPage={showPage} />;
      case 'courses':
        return <CoursesPage
          courses={courses}
          enrollmentStatusGetter={getCourseEnrollmentStatus}
          onEnroll={enrollInCourse}
          onViewDetails={loadCourseDetails}
        />;
      case 'courseDetail':
        return <CourseDetailPage
          course={selectedCourse}
          lessons={selectedCourseLessons}
          lessonProgress={lessonProgress}
          enrollmentStatus={getCourseEnrollmentStatus(selectedCourse?.id)}
          loading={loading}
          onEnroll={enrollInCourse}
          onComplete={completeCourse}
          onLessonComplete={handleLessonComplete}
          showPage={showPage}
        />;
      case 'profile':
        return <ProfilePage
          isConnected={isConnected}
          address={address}
          user={user}
          certificates={certificates}
          loading={loading}
        />;
      case 'certificates':
        return <CertificatesPage
          isConnected={isConnected}
          certificates={certificates}
        />;
      default: return <HomePage stats={stats} user={user} certificates={certificates} showPage={showPage} />;
    }
  };

  return (
    <>
      <header>
        <nav className="container">
          <div className="logo">Studyverse</div>
          <ul className="nav-links">
            <li><a onClick={() => showPage('home')} className={currentPage === 'home' ? 'active' : ''}>Home</a></li>
            <li><a onClick={() => showPage('courses')} className={currentPage === 'courses' ? 'active' : ''}>Courses</a></li>
            <li><a onClick={() => showPage('profile')} className={currentPage === 'profile' ? 'active' : ''}>Profile</a></li>
            <li><a onClick={() => showPage('certificates')} className={currentPage === 'certificates' ? 'active' : ''}>Certificates</a></li>
          </ul>
          <div className="wallet-section">
            <ConnectButton />
          </div>
        </nav>
      </header>

      <main>
        {message && (
          <Message
            message={message.text}
            type={message.type}
            onClose={() => setMessage(null)}
          />
        )}
        {renderCurrentPage()}
      </main>
    </>
  );
}

export default App;