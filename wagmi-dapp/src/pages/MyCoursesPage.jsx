import React, { useMemo } from 'react';
import LoadingSpinner from '../components/Feedback/LoadingSpinner';
import CourseCard from '../components/Card/CourseCard';
import BrutalistButton from '../components/UI/BrutalistButton';
import { BookOpen } from 'lucide-react';

const MyCoursesPage = ({ user, allCourses, loading, onViewCourse, showPage }) => {
    // We now receive the pre-filtered/fetched enrolled courses as 'allCourses'
    const enrolledCourses = allCourses || [];

    if (loading) {
        return (
            <div className="container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <LoadingSpinner />
                <h3 style={{ marginTop: '2rem', textTransform: 'uppercase' }}>Fetching Your Curriculum...</h3>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="form-container" style={{ textAlign: 'center' }}>
                    <h2 style={{ textTransform: 'uppercase' }}>Identity Required</h2>
                    <p style={{ margin: '1rem 0 2rem' }}>Connect your wallet to access your private learning dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <section className="page active" style={{ transform: 'scale(0.9)', transformOrigin: 'top center', width: '111%', marginLeft: '-5.5%' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                <header style={{ 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '24px',
                    padding: '1.5rem 2rem', 
                    marginBottom: '1.5rem',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: '#fff', letterSpacing: '-0.5px' }}>
                            My Curriculum
                        </h1>
                        <p style={{ color: '#94a3b8', marginTop: '0.4rem', fontSize: '0.85rem' }}>
                            {enrolledCourses.length} Active Modules
                        </p>
                    </div>
                    <BookOpen style={{ color: 'var(--primary-color)', opacity: 0.5 }} size={36} />
                </header>

                {enrolledCourses.length > 0 ? (
                    <div className="course-grid" style={{ gap: '2rem' }}>
                        {enrolledCourses.map(course => (
                            <CourseCard 
                                key={course.id} 
                                course={course} 
                                enrollmentStatus="enrolled"
                                onViewDetails={onViewCourse}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{ 
                        padding: '6rem 2rem', 
                        textAlign: 'center', 
                        background: 'rgba(255, 255, 255, 0.03)', 
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '32px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.8 }}>📚</div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Your workspace is empty</h2>
                        <p style={{ color: '#94a3b8', marginBottom: '2.5rem', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
                            The frontier of decentralized knowledge awaits. Start your first protocol today.
                        </p>
                        <button 
                            onClick={() => showPage('courses')}
                            style={{
                                background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                                color: '#fff',
                                padding: '1rem 2.5rem',
                                borderRadius: '100px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                boxShadow: '0 10px 20px rgba(79, 70, 229, 0.3)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            Explore Courses &rarr;
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default MyCoursesPage;
