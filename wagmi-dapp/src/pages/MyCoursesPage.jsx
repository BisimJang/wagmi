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
        <section className="page active" style={{ transform: 'scale(0.9)', transformOrigin: 'top center', width: '111%', marginLeft: '-5.5%', fontFamily: "'Poppins', sans-serif", background: '#fafafa', color: '#333' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                <header style={{ 
                    background: '#fff', 
                    border: '1px solid #eaeaea', 
                    borderRadius: '24px',
                    padding: '1.5rem 2rem', 
                    marginBottom: '1.5rem',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: '#111', letterSpacing: '-0.5px' }}>
                            My Curriculum
                        </h1>
                        <p style={{ color: '#666', marginTop: '0.4rem', fontSize: '0.85rem' }}>
                            {enrolledCourses.length} Active Modules
                        </p>
                    </div>
                    <BookOpen style={{ color: 'var(--primary-color)', opacity: 0.5 }} size={36} />
                </header>

                {enrolledCourses.length > 0 ? (
                    <div className="course-grid" style={{ gap: '2rem' }}>
                        {enrolledCourses.map(course => (
                            <div 
                                key={course.course_id || course.id}
                                onClick={() => onViewCourse(course)}
                                style={{
                                    position: 'relative',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    background: '#fff',
                                    border: '1px solid #eaeaea',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                                }}
                                className="enrolled-course-card"
                            >
                                {/* Image & Overlay */}
                                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                        backgroundImage: `url('${course.imageUrl || course.image_url}')`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        transition: 'transform 0.5s ease',
                                    }} className="ecc-bg" />
                                    
                                    {/* Hover Overlay */}
                                    <div className="ecc-overlay" style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                        background: 'rgba(0,0,0,0.8)',
                                        backdropFilter: 'blur(4px)',
                                        padding: '1.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        opacity: 0,
                                        transition: 'opacity 0.3s ease',
                                        zIndex: 10
                                    }}>
                                        <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>About</h4>
                                        <p style={{ color: '#ccc', fontSize: '0.8rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {course.description || "No description available."}
                                        </p>
                                        <span style={{ marginTop: '1rem', color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 'bold' }}>Click for details &rarr;</span>
                                    </div>
                                </div>

                                {/* Info Bar */}
                                <div style={{ padding: '1.5rem', position: 'relative', zIndex: 11, background: '#fff' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {course.name || course.title || course.course}
                                        </h3>
                                        {course.role === 'instructor' && (
                                            <span style={{ fontSize: '0.6rem', color: 'var(--primary-color)', fontWeight: '900', padding: '4px 8px', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '4px' }}>INSTRUCTOR</span>
                                        )}
                                    </div>

                                    {/* Progress Bar */}
                                    <div style={{ marginTop: '1.2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                                            <span style={{ color: '#666', fontWeight: '600' }}>Progress</span>
                                            <span style={{ color: course.progress === 100 ? '#10b981' : '#333', fontWeight: 'bold' }}>{course.progress || 0}%</span>
                                        </div>
                                        <div style={{ height: '6px', background: '#eaeaea', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ 
                                                height: '100%', 
                                                width: `${course.progress || 0}%`, 
                                                background: course.progress === 100 ? '#3ec636' : 'var(--primary-color)',
                                                borderRadius: '3px',
                                                transition: 'width 1s ease-out'
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ 
                        padding: '6rem 2rem', 
                        textAlign: 'center', 
                        background: '#fff', 
                        border: '1px dashed #ccc',
                        borderRadius: '32px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.8 }}>📚</div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111', marginBottom: '1rem' }}>Your workspace is empty</h2>
                        <p style={{ color: '#666', marginBottom: '2.5rem', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
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
