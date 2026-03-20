// src/pages/CoursesPage.jsx

import React, { useState, useEffect } from 'react';
import CourseCard from '../components/Card/CourseCard.jsx';
import BrutalistButton from '../components/UI/BrutalistButton';

const CoursesPage = ({ 
    courses, 
    enrollmentStatusGetter, 
    onEnroll, 
    onViewDetails,
    loadCourses,
    pagination 
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Debounced search
    useEffect(() => {
        const handler = setTimeout(() => {
            loadCourses(searchQuery, 1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery, loadCourses]);

    const handlePageChange = (newPage) => {
        if (newPage > 0) {
            loadCourses(searchQuery, newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <section className="page active">
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '3rem', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                        Browse Courses
                    </h2>
                    
                    {/* SEARCH BAR */}
                    <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
                        <input 
                            type="text" 
                            placeholder="Search by title or description..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1.2rem 1.5rem',
                                fontSize: '1.1rem',
                                border: '4px solid #000',
                                outline: 'none',
                                boxShadow: '5px 5px 0px #000'
                            }}
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                style={{
                                    position: 'absolute',
                                    right: '15px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer'
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {courses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔎</div>
                        <h3>No courses found</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search terms</p>
                        {searchQuery && (
                            <BrutalistButton onClick={() => setSearchQuery('')} style={{ marginTop: '2rem' }}>
                                Clear Search
                            </BrutalistButton>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="course-grid">
                            {courses.map(course => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    onEnroll={onEnroll}
                                    onViewDetails={onViewDetails}
                                    enrollmentStatus={enrollmentStatusGetter(course.id)}
                                />
                            ))}
                        </div>

                        {/* PAGINATION CONTROLS */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            gap: '1.5rem', 
                            margin: '4rem 0' 
                        }}>
                            <BrutalistButton 
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={!pagination.previous}
                                style={{ opacity: pagination.previous ? 1 : 0.5 }}
                            >
                                ← Previous
                            </BrutalistButton>
                            
                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                                Page {pagination.currentPage}
                            </div>

                            <BrutalistButton 
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={!pagination.next}
                                style={{ opacity: pagination.next ? 1 : 0.5 }}
                            >
                                Next →
                            </BrutalistButton>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};

export default CoursesPage;