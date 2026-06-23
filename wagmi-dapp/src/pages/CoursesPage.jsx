// src/pages/CoursesPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import CourseCard from '../components/Card/CourseCard.jsx';

const CoursesPage = ({ 
    courses, 
    enrollmentStatusGetter, 
    onEnroll, 
    onViewDetails,
    loadCourses,
    pagination,
    schools = [],
    syncEnrollment,
    payWithFiat
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [selectedTag, setSelectedTag] = useState(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            loadCourses(searchQuery, 1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery, loadCourses]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const reference = urlParams.get('reference');
        if (reference) {
            // Remove it from the URL so we don't re-verify on refresh
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({path:newUrl}, '', newUrl);

            // Verify with backend
            const token = localStorage.getItem('jwt');
            if (token) {
                fetch('http://127.0.0.1:8000/api/courses/verify_payment/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ reference })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.enrolled) {
                        alert("Payment successful! You are now enrolled.");
                        loadCourses(searchQuery, pagination.currentPage || 1);
                    } else {
                        alert("Payment verification failed: " + (data.error || "Unknown error"));
                    }
                })
                .catch(err => {
                    console.error("Verification error:", err);
                    alert("Error verifying payment.");
                });
            }
        }
    }, [loadCourses, pagination, searchQuery]);

    const handlePageChange = (newPage) => {
        if (newPage > 0) {
            loadCourses(searchQuery, newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

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

    const filteredCourses = useMemo(() => {
        let result = courses;
        
        if (selectedSchool) {
            result = result.filter(c => c.school_name === selectedSchool);
        }
        
        if (selectedTag) {
            result = result.filter(c => c.tags && c.tags.includes(selectedTag));
        }
        
        return result;
    }, [courses, selectedSchool, selectedTag]);

    const hasFilters = searchQuery || selectedSchool || selectedTag;

    return (
        <div style={{ fontFamily: "'Poppins', sans-serif", background: '#fafafa', minHeight: '100vh', paddingBottom: '4rem', color: '#333' }}>
            <div className="container" style={{ paddingTop: '120px' }}>
                
                {/* SEARCH & FILTERS BAR */}
                <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    marginBottom: '4rem', 
                    flexWrap: 'wrap',
                    maxWidth: '800px',
                    margin: '0 auto 4rem auto'
                }}>
                    {/* SEARCH INPUT */}
                    <div style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search by module name or instructor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1.08rem 1.8rem',
                                fontSize: '0.9rem',
                                background: '#fff',
                                border: '1px solid #eaeaea',
                                borderRadius: '100px',
                                color: '#333',
                                outline: 'none',
                                textAlign: 'center',
                                transition: 'all 0.3s',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                            }}
                        />
                    </div>

                    {/* TAG FILTER */}
                    <select
                        value={selectedTag || ''}
                        onChange={(e) => setSelectedTag(e.target.value || null)}
                        style={{
                            padding: '0.9rem 1.35rem',
                            fontSize: '0.81rem',
                            fontWeight: '600',
                            border: '1px solid #eaeaea',
                            background: '#fff',
                            color: '#333',
                            borderRadius: '100px',
                            cursor: 'pointer',
                            outline: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            minWidth: '180px'
                        }}
                    >
                        <option value="">All Niches</option>
                        <option value="web3">Web3</option>
                        <option value="frontend">Frontend</option>
                        <option value="backend">Backend</option>
                        <option value="ai">AI & ML</option>
                        <option value="design">Design</option>
                        <option value="business">Business</option>
                    </select>

                    {/* SCHOOL FILTER */}
                    {availableSchools.length > 0 && (
                        <select
                            value={selectedSchool || ''}
                            onChange={(e) => setSelectedSchool(e.target.value || null)}
                            style={{
                                padding: '0.9rem 1.35rem',
                                fontSize: '0.81rem',
                                fontWeight: '600',
                                border: '1px solid #eaeaea',
                                background: '#fff',
                                color: '#333',
                                borderRadius: '100px',
                                cursor: 'pointer',
                                outline: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                minWidth: '180px'
                            }}
                        >
                            <option value="">Global Issuers</option>
                            {availableSchools.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* GRID */}
                {filteredCourses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '6rem', background: '#fff', borderRadius: '24px', border: '1px dashed #ccc' }}>
                        <h2 style={{ marginBottom: '1rem', color: '#111' }}>No modules detected.</h2>
                        <p style={{ color: '#666' }}>Try adjusting your search query or filters.</p>
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
                                    onPayFiat={payWithFiat}
                                />
                            ))}
                        </div>

                        {/* PAGINATION */}
                        {!selectedSchool && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '2rem',
                                margin: '6rem 0',
                            }}>
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={!pagination.previous}
                                    style={{ opacity: pagination.previous ? 1 : 0.3 }}
                                >
                                    Previous
                                </button>
                                <span style={{ fontWeight: '800', color: 'var(--primary-color)' }}>{pagination.currentPage}</span>
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={!pagination.next}
                                    style={{ opacity: pagination.next ? 1 : 0.3 }}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CoursesPage;