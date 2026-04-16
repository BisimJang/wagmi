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
        <section className="page active" style={{ padding: '1.5rem 0' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <header style={{ 
                    background: 'var(--primary-color)', 
                    border: '3px solid #000', 
                    padding: '1.5rem 2rem', 
                    boxShadow: '6px 6px 0 #000',
                    marginBottom: '2rem',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: '900', textTransform: 'uppercase', margin: 0, letterSpacing: '-1px' }}>
                            MY CURRICULUM
                        </h1>
                        <p style={{ fontWeight: '700', textTransform: 'uppercase', marginTop: '0.2rem', fontSize: '0.8rem', opacity: 0.8 }}>
                            {enrolledCourses.length} ACTIVE MODULES
                        </p>
                    </div>
                    <BookOpen style={{ opacity: 0.1 }} size={40} />
                </header>

                {enrolledCourses.length > 0 ? (
                    <div className="course-grid">
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
                        background: '#fff', 
                        border: '5px solid #000',
                        boxShadow: '12px 12px 0px #000'
                    }}>
                        <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>📚</div>
                        <h2 style={{ fontSize: '2rem', textTransform: 'uppercase', fontWeight: 900 }}>Your workspace is empty</h2>
                        <p style={{ color: '#666', marginBottom: '2.5rem', fontWeight: 600 }}>The frontier of decentralized knowledge awaits. Start your first protocol today.</p>
                        <BrutalistButton onClick={() => showPage('courses')}>
                            EXPLORE THE GRID &rarr;
                        </BrutalistButton>
                    </div>
                )}
            </div>
        </section>
    );
};

export default MyCoursesPage;
