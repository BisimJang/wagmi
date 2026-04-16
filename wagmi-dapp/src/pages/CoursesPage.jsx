// src/pages/CoursesPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import CourseCard from '../components/Card/CourseCard.jsx';
import BrutalistButton from '../components/UI/BrutalistButton';

const CoursesPage = ({ 
    courses, 
    enrollmentStatusGetter, 
    onEnroll, 
    onViewDetails,
    loadCourses,
    pagination,
    schools = [],
    syncEnrollment
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSchool, setSelectedSchool] = useState(null); // null = All Schools

    // Debounced backend search (title / description)
    useEffect(() => {
        const handler = setTimeout(() => {
            loadCourses(searchQuery, 1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery, loadCourses]);

    const handlePageChange = (newPage) => {
        if (newPage > 0) {
            loadCourses(searchQuery, newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Build unique school list from loaded courses (preserves real names)
    const availableSchools = useMemo(() => {
        const seen = new Set();
        const list = [];
        courses.forEach(c => {
            const name = c.school_name;
            if (name && !seen.has(name)) {
                seen.add(name);
                list.push(name);
            }
        });
        return list.sort();
    }, [courses]);

    // Client-side school filter
    const filteredCourses = useMemo(() => {
        if (!selectedSchool) return courses;
        return courses.filter(c => c.school_name === selectedSchool);
    }, [courses, selectedSchool]);

    const hasFilters = searchQuery || selectedSchool;

    return (
        <section className="page active">
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '3rem', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                        Browse Courses
                    </h2>

                    {/* SEARCH BAR */}
                    <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search by title or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: 'clamp(0.8rem, 3vw, 1.2rem) clamp(1rem, 4vw, 1.5rem)',
                                fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                                border: '4px solid #000',
                                outline: 'none',
                                boxShadow: 'clamp(3px, 1vw, 5px) clamp(3px, 1vw, 5px) 0px #000',
                                boxSizing: 'border-box',
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
                                    cursor: 'pointer',
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* SCHOOL FILTER CHIPS */}
                {availableSchools.length > 0 && (
                    <div className="filter-scroll-container" style={{
                        display: 'flex',
                        flexWrap: 'nowrap',
                        overflowX: 'auto',
                        gap: '0.6rem',
                        alignItems: 'center',
                        marginBottom: '2.5rem',
                        paddingBottom: '1rem',
                        WebkitOverflowScrolling: 'touch',
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none'
                    }}>
                        <style>{`
                            .filter-scroll-container::-webkit-scrollbar { display: none; }
                        `}</style>
                        <span style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: '900', 
                            textTransform: 'uppercase', 
                            letterSpacing: '1px',
                            color: 'var(--text-secondary)',
                            marginRight: '0.4rem',
                            flexShrink: 0
                        }}>
                            Filter by School:
                        </span>

                        {/* "All" chip */}
                        <button
                            onClick={() => setSelectedSchool(null)}
                            style={{
                                padding: '0.4rem 1rem',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                border: '3px solid #000',
                                cursor: 'pointer',
                                background: selectedSchool === null ? '#000' : 'transparent',
                                color: selectedSchool === null ? '#fff' : '#000',
                                transition: 'background 0.15s, color 0.15s',
                                boxShadow: selectedSchool === null ? '3px 3px 0 var(--primary-color)' : 'none',
                                flexShrink: 0
                            }}
                        >
                            All Schools
                        </button>

                        {availableSchools.map(name => (
                            <button
                                key={name}
                                onClick={() => setSelectedSchool(prev => prev === name ? null : name)}
                                style={{
                                    padding: '0.4rem 1rem',
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    border: '3px solid #000',
                                    cursor: 'pointer',
                                    background: selectedSchool === name ? '#000' : 'transparent',
                                    color: selectedSchool === name ? '#fff' : '#000',
                                    transition: 'background 0.15s, color 0.15s',
                                    boxShadow: selectedSchool === name ? '3px 3px 0 var(--primary-color)' : 'none',
                                    maxWidth: '220px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                }}
                                title={name}
                            >
                                🏫 {name}
                            </button>
                        ))}

                        {selectedSchool && (
                            <button
                                onClick={() => setSelectedSchool(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '0.8rem',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    marginLeft: '0.25rem',
                                    flexShrink: 0
                                }}
                            >
                                Clear filter
                            </button>
                        )}
                    </div>
                )}

                {/* ACTIVE FILTER SUMMARY */}
                {selectedSchool && (
                    <div style={{
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                    }}>
                        Showing <strong>{filteredCourses.length}</strong> course{filteredCourses.length !== 1 ? 's' : ''} from <strong>{selectedSchool}</strong>
                    </div>
                )}

                {/* COURSE GRID */}
                {filteredCourses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔎</div>
                        <h3>No courses found</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {selectedSchool
                                ? `No courses from "${selectedSchool}" match your search.`
                                : 'Try adjusting your search terms.'}
                        </p>
                        {hasFilters && (
                            <BrutalistButton
                                onClick={() => { setSearchQuery(''); setSelectedSchool(null); }}
                                style={{ marginTop: '2rem' }}
                            >
                                Clear All Filters
                            </BrutalistButton>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="course-grid">
                            {filteredCourses.map(course => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    onEnroll={onEnroll}
                                    onViewDetails={onViewDetails}
                                    enrollmentStatus={enrollmentStatusGetter(course.id)}
                                    onSync={() => syncEnrollment(course.id)}
                                />
                            ))}
                        </div>

                        {/* PAGINATION — only when no school filter active (filter is client-side) */}
                        {!selectedSchool && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '1.5rem',
                                margin: '4rem 0',
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
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

export default CoursesPage;