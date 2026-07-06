// src/App.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Compass, School as SchoolIcon, User, Layout, BookOpen, Sparkles, Settings } from 'lucide-react';
import './App.css';

// Hooks
import { useAuth } from './shared-hooks/useAuth';
import { useCourseData } from './shared-hooks/useCourseData';
import { useSchoolRegistry } from './shared-hooks/useSchoolRegistry';

// Components
import Message from './components/Feedback/Message';
import LoadingSpinner from './components/Feedback/LoadingSpinner';
import GlobalVeraModal from './components/Feedback/GlobalVeraModal';
import Footer from './components/Layout/Footer';
import LoginModal from './components/Auth/LoginModal';
import MasterySetupModal from './components/Auth/MasterySetupModal';
import ForceChangePasswordModal from './components/Auth/ForceChangePasswordModal';

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
import PricingPage from './pages/PricingPage.jsx';
import PaymentSuccessPage from './pages/PaymentSuccessPage.jsx';

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
  const [isGlobalVeraOpen, setIsGlobalVeraOpen] = useState(false);
  const [veraPosition, setVeraPosition] = useState(null);

  useEffect(() => {
    const handleDoubleClick = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(e.target.tagName)) return;
      if (!isGlobalVeraOpen) {
          setVeraPosition({ x: e.clientX, y: e.clientY });
      }
      setIsGlobalVeraOpen(prev => !prev);
    };
    window.addEventListener('dblclick', handleDoubleClick);
    return () => window.removeEventListener('dblclick', handleDoubleClick);
  }, [isGlobalVeraOpen]);

  const setGlobalProjectGoal = (goal) => {
    setProjectGoal(goal);
    localStorage.setItem('studyverse_project_goal', goal);
  };



  // --- Basic Routing Persistence ---
  useEffect(() => {
    const path = window.location.pathname.replace('/', '');
  const validPages = ['home', 'courses', 'schools', 'my_courses', 'profile', 'instructor', 'study-bubbles', 'institutions', 'login', 'settings', 'pricing', 'payment-success'];
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
  const showGlobalFooter = !['course_view', 'instructor'].includes(currentPage);

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Dynamically set body background to prevent "black stripes" below the footer on light pages
  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff';
    
    return () => {
      document.body.style.backgroundColor = '#ffffff';
    };
  }, [currentPage]);

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
        const result = await loginWithGoogle(response);
        if (result && result.success) setIsLoginModalOpen(false);
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
            case 'pricing':
                return <PricingPage showPage={showPage} user={user} />;
            case 'payment-success':
                return <PaymentSuccessPage showPage={showPage} />;
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
              <nav className="global-nav">
                <a href="#" onClick={(e) => { e.preventDefault(); showPage('home'); }} className={currentPage === 'home' ? 'active ul-rest' : ''}>Home</a>
                <a href="#" onClick={(e) => { e.preventDefault(); showPage('courses'); }} className={currentPage === 'courses' ? 'active ul-rest' : ''}>Explore</a>
                <a href="#" onClick={(e) => { e.preventDefault(); showPage('pricing'); }} className={currentPage === 'pricing' ? 'active ul-rest' : ''}>Pricing</a>

                {user && (
                  <a href="#" onClick={(e) => { e.preventDefault(); showPage('my_courses'); }} className={currentPage === 'my_courses' ? 'active ul-rest' : ''}>My Courses</a>
                )}

                {user && (!user.is_institution) && (
                  <a href="#" onClick={(e) => { e.preventDefault(); showPage('study-bubbles'); }} className={currentPage === 'study-bubbles' ? 'active ul-rest' : ''}>Study Bubble</a>
                )}

                {user && (
                  <a href="#" onClick={(e) => { e.preventDefault(); showPage('instructor'); }} className={currentPage === 'instructor' ? 'active ul-rest' : ''}>Studio</a>
                )}

                {user ? (
                  <div className="nav-avatar" onClick={() => showPage('profile')}>
                    {user?.display_name?.[0]?.toUpperCase() || user?.address?.[2]?.toUpperCase() || 'U'}
                  </div>
                ) : (
                  <button className="nav-signin" onClick={() => showPage('login')}>Sign In</button>
                )}
              </nav>
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

            <GlobalVeraModal 
                isOpen={isGlobalVeraOpen} 
                onClose={() => setIsGlobalVeraOpen(false)} 
                userName={user?.display_name || user?.address || 'Student'}
                position={veraPosition}
            />

            <ForceChangePasswordModal
                isOpen={user?.must_change_password}
                onSuccess={() => loadUserData(jwt)}
                showMessage={showMessage}
            />
        </>
    );
}

export default App;