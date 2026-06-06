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
    const [selectedDivision, setSelectedDivision] = useState(null);

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
        
        if (selectedDivision) {
            if (selectedDivision === 'builders') {
                result = result.filter(c => c.division === 'builders' || c.division === 'both');
            } else if (selectedDivision === 'creatives') {
                result = result.filter(c => c.division === 'creatives' || c.division === 'both');
            } else if (selectedDivision === 'neither') {
                result = result.filter(c => c.division === 'neither');
            }
        }
        
        return result;
    }, [courses, selectedSchool, selectedDivision]);

    const hasFilters = searchQuery || selectedSchool || selectedDivision;

    return (
        <section className="page">
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 className="gradient-text" style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '1.5rem', letterSpacing: '-1px' }}>
                        Curriculum Grid
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '3rem' }}>
                        Access high-performance modules deployed across the network.
                    </p>

                    {/* SEARCH BAR */}
                    <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search by module name or instructor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1.2rem 2rem',
                                fontSize: '1rem',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '100px',
                                color: '#fff',
                                outline: 'none',
                                backdropFilter: 'blur(10px)',
                                textAlign: 'center',
                                transition: 'all 0.3s'
                            }}
                        />
                    </div>
                </div>

                {/* DIVISION FILTER */}
                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap' }}>
                    {[
                        { id: null, label: 'ALL MODULES' },
                        { id: 'builders', label: 'BUILDERS' },
                        { id: 'creatives', label: 'CREATIVES' },
                        { id: 'neither', label: 'CORE' }
                    ].map(div => (
                        <button
                            key={div.id}
                            onClick={() => setSelectedDivision(div.id)}
                            style={{
                                padding: '0.6rem 1.5rem',
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                border: '1px solid',
                                borderColor: selectedDivision === div.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                                background: selectedDivision === div.id ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                                color: selectedDivision === div.id ? 'var(--primary-color)' : 'var(--text-secondary)',
                                borderRadius: '100px',
                            }}
                        >
                            {div.label}
                        </button>
                    ))}
                </div>

                {/* SCHOOL FILTER CHIPS */}
                {availableSchools.length > 0 && (
                    <div style={{
                        display: 'flex',
                        flexWrap: 'nowrap',
                        overflowX: 'auto',
                        gap: '0.6rem',
                        alignItems: 'center',
                        marginBottom: '4rem',
                        paddingBottom: '1rem',
                        scrollbarWidth: 'none'
                    }}>
                        <span style={{ 
                            fontSize: '0.7rem', 
                            fontWeight: '800', 
                            color: '#444',
                            marginRight: '0.5rem',
                            flexShrink: 0
                        }}>
                            ISSUERS:
                        </span>

                        <button
                            onClick={() => setSelectedSchool(null)}
                            style={{
                                padding: '0.4rem 1.2rem',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                border: '1px solid',
                                borderColor: selectedSchool === null ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                                background: selectedSchool === null ? 'rgba(255,255,255,0.05)' : 'transparent',
                                color: selectedSchool === null ? '#fff' : '#444',
                                borderRadius: '100px',
                                flexShrink: 0
                            }}
                        >
                            Global
                        </button>

                        {availableSchools.map(name => (
                            <button
                                key={name}
                                onClick={() => setSelectedSchool(prev => prev === name ? null : name)}
                                style={{
                                    padding: '0.4rem 1.2rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    border: '1px solid',
                                    borderColor: selectedSchool === name ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                                    background: selectedSchool === name ? 'rgba(255,255,255,0.05)' : 'transparent',
                                    color: selectedSchool === name ? '#fff' : '#444',
                                    borderRadius: '100px',
                                    flexShrink: 0
                                }}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                )}

                {/* GRID */}
                {filteredCourses.length === 0 ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '6rem' }}>
                        <h2 style={{ marginBottom: '1rem' }}>No modules detected.</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search query or filters.</p>
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
        </section>
    );
};

export default CoursesPage;