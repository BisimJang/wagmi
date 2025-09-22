import React, { useState, useEffect } from 'react';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// API helper function
const apiCall = async (endpoint, options = {}) => {
  const jwt = localStorage.getItem('jwt');
  const headers = {
    'Content-Type': 'application/json',
    ...(jwt && { 'Authorization': `Bearer ${jwt}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="loading">
    <div className="spinner"></div>
    <span>Loading...</span>
  </div>
);

// Message Component
const Message = ({ message, type = 'info', onClose }) => (
  <div className={`message ${type}`}>
    {message}
    {onClose && (
      <button 
        onClick={onClose}
        style={{ background: 'none', border: 'none', color: 'inherit', float: 'right', cursor: 'pointer' }}
      >
        ×
      </button>
    )}
  </div>
);

// Course Card Component
const CourseCard = ({ course, onEnroll, onViewDetails, enrollmentStatus }) => (
  <div className="course-card" onClick={() => onViewDetails(course.id)}>
    <div className="course-image" style={{ backgroundImage: `url('${course.imageUrl}')` }}></div>
    <div className="course-content">
      <h3 className="course-title">{course.name}</h3>
      <p className="course-description">{course.description}</p>
      <div className="course-price">{course.price} ETH</div>
      <div className="course-stats"><span>Active Course</span></div>
      {enrollmentStatus === 'completed' ? (
        <button className="btn" style={{ width: '100%', opacity: 0.7 }} disabled>Completed</button>
      ) : enrollmentStatus === 'enrolled' ? (
        <button className="btn" style={{ width: '100%', opacity: 0.7 }} disabled>Enrolled</button>
      ) : (
        <button className="btn" style={{ width: '100%' }} onClick={(e) => { e.stopPropagation(); onEnroll(course); }}>
          Enroll Now
        </button>
      )}
    </div>
  </div>
);

// Certificate Card Component
const CertificateCard = ({ certificate }) => (
  <div className="certificate-card">
    <div className="certificate-content">
      <h3>Certificate of Completion</h3>
      <h4>{certificate.course_name}</h4>
      <p>Token ID: #{certificate.tokenId}</p>
      <p>Completed: {new Date(certificate.completionDate).toLocaleDateString()}</p>
      <div style={{ marginTop: '1rem' }}>
        <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>NFT Certificate</span>
      </div>
    </div>
  </div>
);

// Main App Component
function App() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // State
  const [currentPage, setCurrentPage] = useState('home');
  const [jwt, setJwt] = useState(null);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [stats, setStats] = useState({ totalCourses: 0, totalStudents: 0, totalCertificates: 0 });

  // Helper to show messages
  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // ------------------ AUTHENTICATION ------------------
  const loginWithWallet = async () => {
    try {
      setLoading(true);
      localStorage.removeItem('jwt'); // clear any old token

      // 1️⃣ Get nonce from backend
      const { nonce } = await apiCall('/auth/nonce/', {
        method: 'POST',
        body: JSON.stringify({ address }),
      });


      // 2️⃣ Sign nonce
      const message = `Sign in to Studyverse\n\nNonce: ${nonce}`;
      const signature = await signMessageAsync({ message });

      // 3️⃣ Verify signature and get JWT
      const data = await apiCall('/auth/wallet/', {
        method: 'POST',
        body: JSON.stringify({ address, signature }),
      });
      
      setJwt(data.access);
      localStorage.setItem('jwt', data.access);
      

      // 4️⃣ Load user data
      await loadUserData();
      showMessage('Successfully logged in!', 'success');
    } catch (error) {
      console.error('Login error:', error);
      showMessage('Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const verifyJWT = async (token) => {
    if (!token) return false;
    try {
      await apiCall('/auth/wallet/', { method: 'POST', body: JSON.stringify({ token }) });
      return true;
    } catch {
      return false;
    }
  };

  // ------------------ DATA LOADING ------------------
  const loadUserData = async () => {
    if (!address || !jwt) return;
    try {
      // const userData = await apiCall(`/users/${address}/`);
      // setUser(userData);
      setCertificates(userData.certificates || []); // Set certificates here too
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const coursesData = await apiCall('/courses/');
      setCourses(coursesData);
      setStats(prev => ({ ...prev, totalCourses: coursesData.length }));
    } catch (error) {
      console.error('Error loading courses:', error);
      showMessage('Failed to load courses', 'error');
    }
  };


  const enrollInCourse = async (course) => {
    if (!jwt) { showMessage('Please connect your wallet first', 'warning'); return; }
    try {
      setLoading(true);
      showMessage('Processing enrollment...', 'warning');
      await apiCall(`/courses/${course.id}/enroll/`, { method: 'POST' });
      showMessage('Successfully enrolled!', 'success');
      await loadUserData();
    } catch (error) {
      console.error('Enrollment error:', error);
      showMessage('Enrollment failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const completeCourse = async (courseId) => {
    if (!jwt) { showMessage('Please connect your wallet first', 'warning'); return; }
    try {
      setLoading(true);
      showMessage('Processing completion...', 'warning');
      await apiCall(`/courses/${courseId}/complete/`, { method: 'POST' });
      showMessage('Course completed! Certificate issued.', 'success');
      await loadUserData();
    } catch (error) {
      console.error('Completion error:', error);
      showMessage('Failed to complete course', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCourseEnrollmentStatus = (courseId) => {
    if (!user) return null;
    if (user.completedCourses?.includes(courseId)) return 'completed';
    if (user.enrolledCourses?.includes(courseId)) return 'enrolled';
    return null;
  };

  const loadCourseDetails = async (courseId) => {
    try {
      const courseData = await apiCall(`/courses/${courseId}/`);
      setSelectedCourse(courseData);
      setCurrentPage('courseDetail');
    } catch (error) {
      console.error('Error loading course details:', error);
      showMessage('Failed to load course details', 'error');
    }
  };

  // ------------------ EFFECTS ------------------
  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (!isConnected || !address) return;

      const storedToken = localStorage.getItem('jwt');
      const valid = await verifyJWT(storedToken);

      if (valid) {
        setJwt(storedToken);
        await loadUserData();
      } else {
        loginWithWallet();
      }
    };
    initAuth();
  }, [isConnected, address]);

  // ------------------ NAVIGATION ------------------
  const showPage = (pageId) => {
    setCurrentPage(pageId);
    if (pageId === 'certificates') loadCertificates();
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home': return renderHomePage();
      case 'courses': return renderCoursesPage();
      case 'courseDetail': return renderCourseDetailPage();
      case 'profile': return renderProfilePage();
      case 'certificates': return renderCertificatesPage();
      default: return renderHomePage();
    }
  };

 // Render pages
  const renderHomePage = () => (
    <section className="page active">
      <div className="hero">
        <div className="container">
          <h1>Welcome to Studyverse</h1>
          <p>Your gateway to Web3 education. Learn blockchain, DeFi, NFTs, and more with hands-on courses and earn verifiable certificates.</p>
          <button onClick={() => showPage('courses')} className="btn">
            Explore Courses
          </button>
        </div>
      </div>
      
      <div className="container">
        <div className="stats">
          <div className="stat-card">
            <div className="stat-number">{stats.totalCourses}</div>
            <div>Total Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{user?.enrolledCourses?.length || 0}</div>
            <div>Enrolled Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{certificates.length}</div>
            <div>Certificates Earned</div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderCoursesPage = () => (
    <section className="page active">
      <div className="container">
        <h2 style={{ textAlign: 'center', margin: '2rem 0', fontSize: '2.5rem' }}>
          Available Courses
        </h2>
        {courses.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            No courses available yet
          </p>
        ) : (
          <div className="course-grid">
            {courses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={enrollInCourse}
                onViewDetails={loadCourseDetails}
                enrollmentStatus={getCourseEnrollmentStatus(course.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );

  const renderCourseDetailPage = () => {
    if (!selectedCourse) return null;
    
    const enrollmentStatus = getCourseEnrollmentStatus(selectedCourse.id);
    
    return (
      <section className="page active">
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <button 
              onClick={() => showPage('courses')} 
              className="btn-secondary" 
              style={{ marginBottom: '2rem' }}
            >
              ← Back to Courses
            </button>
            
            <div 
              className="course-image" 
              style={{ 
                height: '300px', 
                borderRadius: '15px', 
                backgroundImage: `url('${selectedCourse.imageUrl}')`, 
                marginBottom: '2rem' 
              }}
            ></div>
            
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
              {selectedCourse.name}
            </h1>
            <p style={{ 
              fontSize: '1.2rem', 
              color: 'var(--text-secondary)', 
              marginBottom: '2rem' 
            }}>
              {selectedCourse.description}
            </p>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '2rem', 
              marginBottom: '2rem' 
            }}>
              <div className="stat-card">
                <div className="stat-number">{selectedCourse.price}</div>
                <div>ETH</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">Active</div>
                <div>Status</div>
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              {enrollmentStatus === 'completed' ? (
                <div className="message success">
                  ✅ Course Completed! Check your certificates.
                </div>
              ) : enrollmentStatus === 'enrolled' ? (
                <div>
                  <div className="message success">
                    ✅ You are enrolled in this course!
                  </div>
                  <button 
                    onClick={() => completeCourse(selectedCourse.id)} 
                    className="btn"
                    disabled={loading}
                  >
                    {loading ? <LoadingSpinner /> : 'Mark as Completed'}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => enrollInCourse(selectedCourse)} 
                  className="btn" 
                  style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner /> : `Enroll for ${selectedCourse.price} ETH`}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderProfilePage = () => (
    <section className="page active">
      <div className="container">
        {!isConnected ? (
          <div className="form-container">
            <h2>Connect Wallet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Please connect your wallet to view your profile
            </p>
            <ConnectButton />
          </div>
        ) : user ? (
          <div className="profile-header">
            <h2>Student Profile</h2>
            <div className="profile-info">
              <div className="info-item">
                <div className="info-label">Wallet Address</div>
                <div className="info-value">{address}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Enrolled Courses</div>
                <div className="info-value">{user.enrolledCourses?.length || 0}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Completed Courses</div>
                <div className="info-value">{user.completedCourses?.length || 0}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Certificates</div>
                <div className="info-value">{certificates.length}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="form-container">
            <h2>Loading Profile...</h2>
            <LoadingSpinner />
          </div>
        )}
      </div>
    </section>
  );

  const renderCertificatesPage = () => (
    <section className="page active">
      <div className="container">
        <h2 style={{ textAlign: 'center', margin: '2rem 0', fontSize: '2.5rem' }}>
          My Certificates
        </h2>
        {!isConnected ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            Please connect your wallet to view certificates
          </p>
        ) : certificates.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            No certificates earned yet. Complete courses to earn certificates!
          </p>
        ) : (
          <div className="certificate-grid">
            {certificates.map(certificate => (
              <CertificateCard key={certificate.id} certificate={certificate} />
            ))}
          </div>
        )}
      </div>
    </section>
  );

  return (
    <>
      <style>{`
        :root {
          --primary-color: #667eea;
          --secondary-color: #764ba2;
          --accent-color: #f093fb;
          --background: #0f0f23;
          --surface: #1a1a2e;
          --text: #ffffff;
          --text-secondary: #a0a0a0;
          --success: #10b981;
          --warning: #f59e0b;
          --error: #ef4444;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: var(--background);
          color: var(--text);
          line-height: 1.6;
          overflow-x: hidden;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        header {
          background: rgba(26, 26, 46, 0.95);
          backdrop-filter: blur(10px);
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 1000;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(102, 126, 234, 0.3);
        }

        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.8rem;
          font-weight: bold;
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-links {
          display: flex;
          list-style: none;
          gap: 2rem;
        }

        .nav-links a {
          color: var(--text);
          text-decoration: none;
          transition: color 0.3s;
          cursor: pointer;
        }

        .nav-links a:hover {
          color: var(--accent-color);
        }

        .nav-links a.active {
          color: var(--accent-color);
        }

        .wallet-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 25px;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: white;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: transparent;
          border: 2px solid var(--primary-color);
          color: var(--primary-color);
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
        }

        .btn-secondary:hover {
          background: var(--primary-color);
          color: white;
        }

        main {
          margin-top: 80px;
          min-height: calc(100vh - 80px);
        }

        .page {
          display: block;
        }

        .hero {
          padding: 4rem 0;
          text-align: center;
          background: radial-gradient(circle at center, rgba(102, 126, 234, 0.1), transparent 70%);
        }

        .hero h1 {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero p {
          font-size: 1.2rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-top: 4rem;
        }

        .stat-card {
          background: var(--surface);
          padding: 2rem;
          border-radius: 15px;
          text-align: center;
          border: 1px solid rgba(102, 126, 234, 0.3);
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: bold;
          color: var(--primary-color);
        }

        .course-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          padding: 2rem 0;
        }

        .course-card {
          background: var(--surface);
          border-radius: 15px;
          overflow: hidden;
          border: 1px solid rgba(102, 126, 234, 0.3);
          transition: transform 0.3s, box-shadow 0.3s;
          cursor: pointer;
        }

        .course-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }

        .course-image {
          width: 100%;
          height: 200px;
          background-size: cover;
          background-position: center;
          background-color: var(--primary-color);
        }

        .course-content {
          padding: 1.5rem;
        }

        .course-title {
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
          color: var(--text);
        }

        .course-description {
          color: var(--text-secondary);
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .course-price {
          font-size: 1.1rem;
          font-weight: bold;
          color: var(--accent-color);
          margin-bottom: 1rem;
        }

        .course-stats {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .form-container {
          max-width: 500px;
          margin: 2rem auto;
          padding: 2rem;
          background: var(--surface);
          border-radius: 15px;
          border: 1px solid rgba(102, 126, 234, 0.3);
        }

        .profile-header {
          background: var(--surface);
          padding: 2rem;
          border-radius: 15px;
          margin-bottom: 2rem;
          border: 1px solid rgba(102, 126, 234, 0.3);
        }

        .profile-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .info-item {
          background: var(--background);
          padding: 1rem;
          border-radius: 8px;
        }

        .info-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .info-value {
          color: var(--text);
          font-weight: 500;
          margin-top: 0.25rem;
          word-break: break-all;
        }

        .certificate-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          padding: 2rem 0;
        }

        .certificate-card {
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          padding: 2rem;
          border-radius: 15px;
          text-align: center;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .certificate-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .certificate-content {
          position: relative;
          z-index: 1;
        }

        .loading {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .message {
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
          text-align: center;
        }

        .message.success {
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid var(--success);
          color: var(--success);
        }

        .message.error {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid var(--error);
          color: var(--error);
        }

        .message.warning {
          background: rgba(245, 158, 11, 0.2);
          border: 1px solid var(--warning);
          color: var(--warning);
        }

        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
          
          .hero h1 {
            font-size: 2.5rem;
          }
          
          .course-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <header>
        <nav className="container">
          <div className="logo">Studyverse</div>
          <ul className="nav-links">
            <li>
              <a 
                onClick={() => showPage('home')} 
                className={currentPage === 'home' ? 'active' : ''}
              >
                Home
              </a>
            </li>
            <li>
              <a 
                onClick={() => showPage('courses')} 
                className={currentPage === 'courses' ? 'active' : ''}
              >
                Courses
              </a>
            </li>
            <li>
              <a 
                onClick={() => showPage('profile')} 
                className={currentPage === 'profile' ? 'active' : ''}
              >
                Profile
              </a>
            </li>
            <li>
              <a 
                onClick={() => showPage('certificates')} 
                className={currentPage === 'certificates' ? 'active' : ''}
              >
                Certificates
              </a>
            </li>
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
