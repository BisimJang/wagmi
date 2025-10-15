// src/App.jsx

// ⚠️ FIX: Added useCallback to the import from 'react'
import React, { useState, useCallback } from 'react'; 
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import './App.css'; 

// Hooks
import {useAuth} from './hooks/useAuth';
import {useCourseData} from './hooks/useCourseData';

// Components
import Message from './components/Feedback/Message'; 
import LoadingSpinner from './components/Feedback/LoadingSpinner';

// Pages
import HomePage from './pages/HomePage.jsx'; 
import CoursesPage from './pages/CoursesPage.jsx';
import CourseDetailPage from './pages/CourseDetailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CertificatesPage from './pages/CertificatesPage.jsx';


function App() {
  const { address, isConnected } = useAccount();
  
  // --- Local State ---
  const [currentPage, setCurrentPage] = useState('home');
  const [message, setMessage] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const showMessage = useCallback((text, type = 'info') => {
    setMessage({ text, type });
    
    // Using functional update form for safer state clearing after timeout
    setTimeout(() => setMessage(null), 5000); 
    
  }, []); // Removed setMessage from dependency array as it's stable, making the function stable.

  // 1. Data Logic Hook
  const {
    user,
    courses,
    certificates,
    loading: dataLoading,
    stats,
    loadUserData, 
    enrollInCourse,
    completeCourse
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
  };

  const loadCourseDetails = (course) => {
    setSelectedCourse(course);
    setCurrentPage('courseDetail');
  };

  const getCourseEnrollmentStatus = (courseId) => {
    if (!user) return null;
    if (user.completedCourses?.includes(courseId)) return 'completed';
    if (user.enrolledCourses?.includes(courseId)) return 'enrolled';
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
                  enrollmentStatus={getCourseEnrollmentStatus(selectedCourse?.id)}
                  loading={loading}
                  onEnroll={enrollInCourse}
                  onComplete={completeCourse}
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
            {/* Conditional Sign-In Button */}
            {isConnected && !jwt && !authLoading && (
                <button className="btn" onClick={() => loginWithWallet()}>
                    Sign In
                </button>
            )}
             {isConnected && !jwt && authLoading && (
                <button className="btn" disabled>
                    <div className="loading">
                        <div className="spinner"></div>
                        <span>Signing In...</span>
                    </div>
                </button>
            )}
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