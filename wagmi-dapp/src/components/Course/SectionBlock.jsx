// src/components/Course/SectionBlock.jsx

import React from 'react';
import LessonItem from './LessonItem'; // ⬅️ Import LessonItem

const SectionBlock = ({ 
    section, 
    sectionIndex, 
    lessonProgress, 
    isEnrolled, 
    loading, 
    selectedLesson, 
    onViewLesson, 
    onLessonComplete 
}) => {

    const getLessonStatus = (lessonId) => {
        const progressData = lessonProgress?.[lessonId];
        if (!progressData) return 'not_started';
        if (progressData.completed) return 'completed';
        return 'in_progress'; 
    };

    return (
        <div className="section-block" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)' }}>
                Section {sectionIndex + 1}: {section.title}
            </h3>
            
            <div className="lessons-container">
                {section.lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                    <LessonItem
                        key={lesson.id}
                        lesson={lesson}
                        status={getLessonStatus(lesson.id)}
                        isActive={selectedLesson?.id === lesson.id}
                        isEnrolled={isEnrolled}
                        loading={loading}
                        onView={onViewLesson}
                        onComplete={onLessonComplete}
                    />
                ))}
            </div>
        </div>
    );
};

export default SectionBlock;