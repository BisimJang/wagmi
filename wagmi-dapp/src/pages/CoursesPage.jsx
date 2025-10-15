// src/pages/CoursesPage.jsx

import React from 'react';
import CourseCard from '../components/Card/CourseCard.jsx';
const CoursesPage = ({ courses, enrollmentStatusGetter, onEnroll, onViewDetails }) => {
    return (
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
                                onEnroll={onEnroll}
                                onViewDetails={onViewDetails}
                                enrollmentStatus={enrollmentStatusGetter(course.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default CoursesPage;