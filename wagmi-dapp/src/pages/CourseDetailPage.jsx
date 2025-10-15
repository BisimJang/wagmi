// src/pages/CourseDetailPage.jsx

import React from 'react';
import LoadingSpinner from '../components/Feedback/LoadingSpinner';

const CourseDetailPage = ({ 
    course, 
    enrollmentStatus, 
    loading, 
    onEnroll, 
    onComplete, 
    showPage 
}) => {
    
    if (!course) return null;
    
    // Logic to determine the primary action button
    const renderActionButton = () => {
        if (enrollmentStatus === 'completed') {
            return (
                <div className="message success">
                    ✅ Course Completed! Check your certificates.
                </div>
            );
        }
        
        if (enrollmentStatus === 'enrolled') {
            return (
                <div>
                    <div className="message success">
                        ✅ You are enrolled in this course!
                    </div>
                    <button 
                        onClick={() => onComplete(course.id)} 
                        className="btn"
                        disabled={loading}
                        style={{ marginTop: '1rem' }}
                    >
                        {loading ? <LoadingSpinner /> : 'Mark as Completed'}
                    </button>
                </div>
            );
        }
        
        return (
            <button 
                onClick={() => onEnroll(course)} 
                className="btn" 
                style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
                disabled={loading}
            >
                {loading ? <LoadingSpinner /> : `Enroll for ${course.price} ETH`}
            </button>
        );
    };

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
                            backgroundImage: `url('${course.imageUrl}')`, 
                            marginBottom: '2rem' 
                        }}
                    ></div>
                    
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                        {course.name}
                    </h1>
                    <p style={{ 
                        fontSize: '1.2rem', 
                        color: 'var(--text-secondary)', 
                        marginBottom: '2rem' 
                    }}>
                        {course.description}
                    </p>
                    
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '2rem', 
                        marginBottom: '2rem' 
                    }}>
                        <div className="stat-card">
                            <div className="stat-number">{course.price}</div>
                            <div>ETH</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">Active</div>
                            <div>Status</div>
                        </div>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                        {renderActionButton()}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CourseDetailPage;