// src/App.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Compass, School as SchoolIcon, User, Layout, BookOpen } from 'lucide-react';
import './App.css';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useCourseData } from './hooks/useCourseData';
import { useSchoolRegistry } from './hooks/useSchoolRegistry';

// Components
import Message from './components/Feedback/Message';
import LoadingSpinner from './components/Feedback/LoadingSpinner';
import Footer from './components/Layout/Footer';

// Pages
import HomePage from './pages/HomePage.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import CourseModal from './components/Course/CourseModal.jsx';
import CourseView from './pages/CourseView.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CertificatesPage from './pages/CertificatesPage.jsx';
import InstructorDashboard from './pages/InstructorDashboard.jsx';
import SchoolsPage from './pages/SchoolsPage.jsx';
import MyCoursesPage from './pages/MyCoursesPage.jsx';

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

  // --- Local Theme State ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // --- Local State ---
  const [currentPage, setCurrentPage] = useState('home');
  const [message, setMessage] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // NEW STATE FOR LESSONS
  const [selectedCourseLessons, setSelectedCourseLessons] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({});

  // --- Basic Routing Persistence ---
  useEffect(() => {
    const path = window.location.pathname.replace('/', '');
    const validPages = ['home', 'courses', 'schools', 'my_courses', 'profile', 'instructor'];
    if (validPages.includes(path)) {
      setCurrentPage(path);
    }
  }, []);

  const showPage = (pageId) => {
    setCurrentPage(pageId);
    window.history.pushState({}, '', `/${pageId === 'home' ? '' : pageId}`);
  };

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
    fetchLessonsAndProgress,
    markLessonCompleted,
    loadCourses,
    createCourse,
    createSection,
    createLesson,
    mintCourse,
    bulkMintCourses,
    fetchSchools,
    schools,
    pagination,
    syncEnrollmentWithBackend,
    myCourses
  } = useCourseData(address, showMessage);

  // 1.5. School Registry Hook
  const {
    createSchoolOnChain,
    createSchoolWithCourses,
    fetchOwnedSchools,
    ownedSchools,
    isLoading: isSchoolLoading
  } = useSchoolRegistry(showMessage);

  // Auto-fetch schools when address changes
  useEffect(() => {
    if (address) {
      fetchOwnedSchools();
    }
  }, [address, fetchOwnedSchools]);

  // 2. Auth Logic Hook
  const {
    jwt,
    authLoading,
    loginWithWallet
  } = useAuth(loadUserData, showMessage);

  const loading = dataLoading || authLoading;

  const closeCourseModal = () => {
    setSelectedCourse(null);
    setSelectedCourseLessons(null);
    setLessonProgress({});
  };

  const loadCourseDetails = async (course) => {
    setSelectedCourse(course);
    showPage('course_view'); 

    const { lessons: flatLessons, progress } = await fetchLessonsAndProgress(course.id);
    const nestedSections = groupLessonsBySection(flatLessons);

    setSelectedCourseLessons(nestedSections);
    setLessonProgress(progress);
  };

  const handleLessonComplete = async (lessonId) => {
    const success = await markLessonCompleted(lessonId, selectedCourse.id);

    if (success) {
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

  const isImmersivePage = ['course_view', 'instructor'].includes(currentPage);
  const showGlobalFooter = ['home', 'courses', 'schools'].includes(currentPage);

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
          loadCourses={loadCourses}
          pagination={pagination}
          schools={schools}
          syncEnrollment={syncEnrollmentWithBackend}
        />;
      case 'schools':
        return <SchoolsPage 
          address={address}
          user={user}
          schools={schools}
          fetchSchools={fetchSchools}
          isSchoolLoading={loading}
          courses={courses}
          showMessage={showMessage}
        />;
      case 'course_view':
        return <CourseView
          course={selectedCourse}
          lessons={selectedCourseLessons}
          lessonProgress={lessonProgress}
          enrollmentStatus={getCourseEnrollmentStatus(selectedCourse?.id)}
          loading={loading}
          onComplete={completeCourse}
          onLessonComplete={handleLessonComplete}
          onEnroll={enrollInCourse}
          onBack={() => showPage('courses')}
        />;
      case 'my_courses':
        return <MyCoursesPage
          user={user}
          allCourses={myCourses}
          loading={loading}
          onViewCourse={loadCourseDetails}
          showPage={showPage}
        />;
      case 'profile':
        return <ProfilePage
          user={user}
          certificates={certificates}
          loading={loading}
          theme={theme}
          toggleTheme={toggleTheme}
          allCourses={courses}
          onViewCourse={loadCourseDetails}
          syncOnChainEnrollment={syncEnrollmentWithBackend}
          showMessage={showMessage}
        />;
      case 'certificates':
        return <CertificatesPage
          isConnected={isConnected}
          certificates={certificates}
        />;
      case 'instructor':
        return <InstructorDashboard 
          user={user}
          createCourse={createCourse} 
          createSection={createSection} 
          createLesson={createLesson} 
          mintCourse={mintCourse} 
          bulkMintCourses={bulkMintCourses}
          courses={courses}
          createSchoolOnChain={createSchoolOnChain}
          ownedSchools={ownedSchools}
          isSchoolLoading={isSchoolLoading}
        />;
      default: return <HomePage stats={stats} user={user} certificates={certificates} showPage={showPage} />;
    }
  };

    return (
    <>
      <header>
        <nav className="container">
          <div className="logo"><a onClick={() => showPage('home')} style={{cursor: 'pointer'}}>Studyverse</a></div>
          <ul className="nav-links">
            <li><a onClick={() => showPage('courses')} className={currentPage === 'courses' ? 'active' : ''}>Explore</a></li>
            <li><a onClick={() => showPage('my_courses')} className={currentPage === 'my_courses' ? 'active' : ''}>My Courses</a></li>
            <li><a onClick={() => showPage('schools')} className={currentPage === 'schools' ? 'active' : ''}>Institutional</a></li>
            <li><a onClick={() => showPage('profile')} className={currentPage === 'profile' ? 'active' : ''}>Portfolio</a></li>
            {user && (
              <li><a onClick={() => showPage('instructor')} className={currentPage === 'instructor' ? 'active' : ''}>Studio</a></li>
            )}
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

      {/* Global Footer - Only on static/marketing pages */}
      {showGlobalFooter && <Footer showPage={showPage} />}

      {/* Mobile Fixed Navigation - Hide on Immersive Pages */}
      {!isImmersivePage && (
      <nav className="bottom-nav">
        <a 
          className={`bottom-nav-link ${currentPage === 'courses' ? 'active' : ''}`} 
          onClick={() => showPage('courses')}
        >
          <Compass size={20} />
          <span>Explore</span>
        </a>
        <a 
          className={`bottom-nav-link ${currentPage === 'my_courses' ? 'active' : ''}`} 
          onClick={() => showPage('my_courses')}
        >
          <BookOpen size={20} />
          <span>My Courses</span>
        </a>
        <a 
          className={`bottom-nav-link ${currentPage === 'schools' ? 'active' : ''}`} 
          onClick={() => showPage('schools')}
        >
          <SchoolIcon size={20} />
          <span>Institutional</span>
        </a>
        <a 
          className={`bottom-nav-link ${currentPage === 'profile' ? 'active' : ''}`} 
          onClick={() => showPage('profile')}
        >
          <User size={20} />
          <span>Portfolio</span>
        </a>
        {user && (
          <a 
            className={`bottom-nav-link ${currentPage === 'instructor' ? 'active' : ''}`} 
            onClick={() => showPage('instructor')}
          >
            <Layout size={20} />
            <span>Studio</span>
          </a>
        )}
      </nav>
      )}

    </>
  );
}

export default App;