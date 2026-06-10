// src/App.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Compass, School as SchoolIcon, User, Layout, BookOpen, Sparkles, Settings } from 'lucide-react';
import './App.css';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useCourseData } from './hooks/useCourseData';
import { useSchoolRegistry } from './hooks/useSchoolRegistry';

// Components
import Message from './components/Feedback/Message';
import LoadingSpinner from './components/Feedback/LoadingSpinner';
import Footer from './components/Layout/Footer';
import LoginModal from './components/Auth/LoginModal';
import MasterySetupModal from './components/Auth/MasterySetupModal';

// Pages
import HomePage from './pages/HomePage_Premium.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import CourseModal from './components/Course/CourseModal.jsx';
import CourseView from './pages/CourseView.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CertificatesPage from './pages/CertificatesPage.jsx';
import InstructorDashboard from './pages/InstructorDashboard.jsx';
import SchoolsPage from './pages/SchoolsPage.jsx';
import MyCoursesPage from './pages/MyCoursesPage.jsx';
import StudyBubblesPage from './pages/StudyBubblesPage.jsx';
import InstitutionPage from './pages/InstitutionPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

// Helper function to convert flat lessons into nested sections
const groupLessonsBySection = (flatLessons) => {
  const sectionsMap = new Map();

  flatLessons.forEach(lesson => {
    const sectionId = lesson.section_id;

    if (!sectionsMap.has(sectionId)) {
      sectionsMap.set(sectionId, {
        id: sectionId,
        title: lesson.section_title,
        order: lesson.section_order || 0,
        lessons: []
      });
    }

    const { section_id, section_title, section_order, ...lessonData } = lesson;
    sectionsMap.get(sectionId).lessons.push(lessonData);
  });

  const nestedSections = Array.from(sectionsMap.values()).sort((a, b) => a.order - b.order);
  return nestedSections;
};

function App() {

  // --- Theme ---
  const [theme, setTheme] = useState('dark'); // Default to dark for Premium

  useEffect(() => {
    document.body.setAttribute('data-theme', 'dark');
  }, []);

  const toggleTheme = () => {
    // Keep it dark for premium look, but allow logic if needed
  };

  // --- Local State ---
  const [currentPage, setCurrentPage] = useState('home');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourseLessons, setSelectedCourseLessons] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({});
  const [projectGoal, setProjectGoal] = useState(localStorage.getItem('studyverse_project_goal') || "");
  const [isMasteryModalOpen, setIsMasteryModalOpen] = useState(false);

  const setGlobalProjectGoal = (goal) => {
    setProjectGoal(goal);
    localStorage.setItem('studyverse_project_goal', goal);
  };



  // --- Basic Routing Persistence ---
  useEffect(() => {
    const path = window.location.pathname.replace('/', '');
  const validPages = ['home', 'courses', 'schools', 'my_courses', 'profile', 'instructor', 'study-bubbles', 'institutions', 'login', 'settings'];
    if (validPages.includes(path)) {
      setCurrentPage(path);
    }
  }, []);

  const showMessage = useCallback((text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  const {
    jwt,
    authLoading,
    loginWithWallet,
    loginWithGoogle,
    loginWithEmail,
    registerUser,
    registerInstitution,
    linkWallet,
    logout
  } = useAuth(showMessage);

    const {
    user,
    courses,
    certificates,
    loading: dataLoading,
    stats,
    loadUserData,
    enrollInCourse,
    completeCourse,
    claimCertificate,
    fetchLessonsAndProgress,
    markLessonCompleted,
    loadCourses,
    createCourse,
    updateCourse,
    createSection,
    updateSection,
    createLesson,
    updateLesson,
    mintCourse,
    bulkMintCourses,
    fetchSchools,
    schools,
    pagination,
    syncEnrollmentWithBackend,
    myCourses,
    payWithFiat
  } = useCourseData(showMessage, jwt);

  // Trigger Onboarding if no goal set
  useEffect(() => {
    if (user && !projectGoal && !localStorage.getItem('mastery_onboarding_skipped')) {
      setIsMasteryModalOpen(true);
    }
  }, [user, projectGoal]);

  const {
    createSchoolOnChain,
    createSchoolWithCourses,
    fetchOwnedSchools,
    ownedSchools,
    isLoading: isSchoolLoading
  } = useSchoolRegistry(showMessage);

  useEffect(() => {
    if (jwt) {
      fetchOwnedSchools();
    }
  }, [jwt, fetchOwnedSchools]);

  const loading = dataLoading || authLoading;
  const isImmersivePage = ['course_view', 'study-bubbles', 'settings'].includes(currentPage);
  const showGlobalFooter = !['home', 'course_view', 'instructor'].includes(currentPage);

  useEffect(() => {
    if (jwt) {
      loadUserData(jwt);
    }
  }, [jwt, loadUserData]);

  const loadCourseDetails = async (course) => {
    setSelectedCourse(course);
    showPage('course_view'); 

    const { lessons: flatLessons, progress } = await fetchLessonsAndProgress(course.id);
    const nestedSections = groupLessonsBySection(flatLessons);

    setSelectedCourseLessons(nestedSections);
    setLessonProgress(progress);
  };

  const handleLessonComplete = async (lessonId) => {
    // Handle Mock/Fallback IDs (like trial-00, elenchus-01, etc.)
    const isMock = typeof lessonId === 'string' && (
      lessonId.startsWith('trial-') || 
      lessonId.startsWith('elenchus-') || 
      lessonId.startsWith('virtue-') || 
      lessonId.startsWith('irony-')
    );

    if (isMock) {
      setLessonProgress(prev => ({
        ...prev,
        [lessonId]: { completed: true, progress: 100 }
      }));
      showMessage('Mastery Node Synced Locally!', 'success');
      return true;
    }

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
    const course = courses.find(c => c.id === courseId);
    if (course?.is_instructor) return 'instructor';
    return null;
  };

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const handleGoogleLoginSuccess = async (response) => {
        const success = await loginWithGoogle(response);
        if (success) setIsLoginModalOpen(false);
    };

    const handleGoogleLoginError = () => {
        showMessage('Google authentication failed', 'error');
    };

    const handleLogout = () => {
        logout();
        setCurrentPage('home');
        window.history.pushState({}, '', '/');
        showMessage('Logged out successfully', 'info');
    };

    const showPage = (pageId) => {
        const privatePages = ['instructor', 'my_courses', 'profile', 'settings'];
        if (privatePages.includes(pageId) && !jwt) {
            setCurrentPage('login');
            window.history.pushState({}, '', '/login');
            return;
        }
        setCurrentPage(pageId);
        window.history.pushState({}, '', `/${pageId === 'home' ? '' : pageId}`);
    };

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage 
                    stats={stats} 
                    user={user} 
                    certificates={certificates} 
                    showPage={showPage} 
                    projectGoal={projectGoal}
                    setProjectGoal={setGlobalProjectGoal}
                />;
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
                    payWithFiat={payWithFiat}
                />;
            case 'schools':
                return <SchoolsPage 
                    user={user}
                    schools={schools}
                    fetchSchools={fetchSchools}
                    isSchoolLoading={loading}
                    isRegistryLoading={isSchoolLoading}
                    createSchoolOnChain={createSchoolOnChain}
                    createSchoolWithCourses={createSchoolWithCourses}
                    courses={courses}
                    showMessage={showMessage}
                />;
            case 'course_view':
                const userCert = user?.certificates?.find(c => c.course_id === selectedCourse?.id);
                return <CourseView
                    user={user}
                    course={selectedCourse}
                    lessons={selectedCourseLessons}
                    lessonProgress={lessonProgress}
                    enrollmentStatus={getCourseEnrollmentStatus(selectedCourse?.id)}
                    certificate={userCert}
                    loading={loading}
                    onComplete={completeCourse}
                    onClaim={claimCertificate}
                    onLessonComplete={handleLessonComplete}
                    onEnroll={enrollInCourse}
                    onBack={() => showPage('courses')}
                    projectGoal={projectGoal}
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
                    linkWallet={linkWallet}
                    onLogout={handleLogout}
                    projectGoal={projectGoal}
                    setProjectGoal={setGlobalProjectGoal}
                />;
            case 'instructor':
                return <InstructorDashboard 
                    user={user}
                    createCourse={createCourse} 
                    updateCourse={updateCourse}
                    createSection={createSection} 
                    updateSection={updateSection}
                    createLesson={createLesson} 
                    updateLesson={updateLesson}
                    mintCourse={mintCourse} 
                    bulkMintCourses={bulkMintCourses}
                    courses={courses}
                    createSchoolOnChain={createSchoolOnChain}
                    ownedSchools={ownedSchools}
                    isSchoolLoading={isSchoolLoading}
                    showMessage={showMessage}
                />;
            case 'study-bubbles':
                return <StudyBubblesPage showPage={showPage} />;
            case 'institutions':
                return <InstitutionPage showPage={showPage} loginWithEmail={loginWithEmail} />;
            case 'settings':
                return <SettingsPage 
                    user={user} 
                    showMessage={showMessage}
                    projectGoal={projectGoal}
                    setProjectGoal={setGlobalProjectGoal}
                    linkWallet={linkWallet}
                    onLogout={handleLogout}
                    showPage={showPage}
                />;
            case 'login':
                return <LoginPage 
                    onGoogleSuccess={loginWithGoogle}
                    onGoogleError={() => showMessage('Google login failed', 'error')}
                    loginWithWallet={loginWithWallet}
                    loginWithEmail={loginWithEmail}
                    registerUser={registerUser}
                    registerInstitution={registerInstitution}
                    isAuthorized={!!jwt}
                    showPage={showPage}
                    defaultTab='login'
                />;
            default: return <HomePage stats={stats} user={user} certificates={certificates} showPage={showPage} />;
        }
    };

    return (
        <>
            <LoginModal 
                isOpen={isLoginModalOpen} 
                onClose={() => setIsLoginModalOpen(false)}
                onGoogleSuccess={handleGoogleLoginSuccess}
                onGoogleError={handleGoogleLoginError}
                loginWithWallet={loginWithWallet}
                isAuthorized={!!jwt}
            />

            <MasterySetupModal 
                isOpen={isMasteryModalOpen} 
                onClose={() => {
                    setIsMasteryModalOpen(false);
                    localStorage.setItem('mastery_onboarding_skipped', 'true');
                }}
                onSave={setGlobalProjectGoal}
            />

            {!isImmersivePage && (
              <header style={{ height: isMobile ? '5rem' : '6rem' }}>
                  <div className="logo nav-module" style={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}>
                      <a onClick={() => showPage('home')}>Study Verse</a>
                  </div>
                  
                  {!isMobile && (
                      <ul className="nav-links nav-module">
                          <li><a onClick={() => showPage('courses')} className={currentPage === 'courses' ? 'active' : ''}>Explore</a></li>
                          
                          {user && (
                              <li><a onClick={() => showPage('my_courses')} className={currentPage === 'my_courses' ? 'active' : ''}>My Courses</a></li>
                          )}
                          
                          {user && (!user.is_institution) && (
                              <li><a onClick={() => showPage('study-bubbles')} className={currentPage === 'study-bubbles' ? 'active' : ''}>Bubbles</a></li>
                          )}
                          
                          {user && (
                              <li><a onClick={() => showPage('instructor')} className={currentPage === 'instructor' ? 'active' : ''}>Studio</a></li>
                          )}
                      </ul>
                  )}

                  <div className="wallet-section nav-module">
                          {!jwt ? (
                              <button onClick={() => showPage('login')} style={{ background: 'var(--primary-color)', color: '#fff', padding: isMobile ? '0.6rem 1.2rem' : '0.8rem 1.6rem', fontSize: isMobile ? '0.8rem' : '1rem' }}>
                                  Sign In
                              </button>
                          ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                  <div 
                                      onClick={() => showPage('profile')}
                                      style={{ 
                                          width: isMobile ? '36px' : '42px', 
                                          height: isMobile ? '36px' : '42px', 
                                          background: 'var(--surface)', 
                                          border: '1px solid var(--glass-border)', 
                                          borderRadius: '50%',
                                          cursor: 'pointer',
                                          overflow: 'hidden',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                      }}
                                  >
                                      {user?.profile_image ? (
                                          <img src={user.profile_image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      ) : (
                                          <span style={{ fontSize: isMobile ? '0.8rem' : '1rem', fontWeight: '800' }}>
                                              {(user?.display_name?.[0] || user?.address?.[2] || '?').toUpperCase()}
                                          </span>
                                      )}
                                  </div>
                                  <div 
                                      onClick={() => showPage('settings')}
                                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', transition: 'color 0.2s' }}
                                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                                      onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
                                      title="Settings"
                                  >
                                      <Settings size={22} />
                                  </div>
                              </div>
                          )}
                      </div>
              </header>
            )}

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

            {showGlobalFooter && <Footer showPage={showPage} />}

            {!isImmersivePage && (
              <nav className="bottom-nav">
                <a className={`bottom-nav-link ${currentPage === 'courses' ? 'active' : ''}`} onClick={() => showPage('courses')}>
                  <Compass size={22} />
                  <span>Explore</span>
                </a>
                
                {user && (
                    <a className={`bottom-nav-link ${currentPage === 'my_courses' ? 'active' : ''}`} onClick={() => showPage('my_courses')}>
                    <BookOpen size={22} />
                    <span>My Courses</span>
                    </a>
                )}
                
                {user && (!user.is_institution) && (
                    <a className={`bottom-nav-link ${currentPage === 'study-bubbles' ? 'active' : ''}`} onClick={() => showPage('study-bubbles')}>
                    <Sparkles size={22} />
                    <span>Bubbles</span>
                    </a>
                )}

                {user && (
                  <a className={`bottom-nav-link ${currentPage === 'instructor' ? 'active' : ''}`} onClick={() => showPage('instructor')}>
                    <Layout size={22} />
                    <span>Studio</span>
                  </a>
                )}
              </nav>
            )}
        </>
    );
}

export default App;