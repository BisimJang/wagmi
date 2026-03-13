// src/components/Course/LessonItem.jsx

import React from 'react';

const LessonItem = ({ 
    lesson, 
    status, 
    isActive, 
    isEnrolled, 
    loading, 
    onView, 
    onComplete 
}) => {
    
    // Determine styles based on state (omitted inline styles for brevity)
    const itemClasses = `lesson-item lesson-status-${status} ${isActive ? 'active' : ''} ${!isEnrolled ? 'locked' : ''}`;
    
    return (
        <div 
            className={itemClasses} 
            onClick={() => onView(lesson)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', maxWidth: '60%' }}>
                    <span style={{ fontWeight: 'bold', marginRight: '10px' }}>{lesson.order}.</span>
                    <span style={{ fontWeight: '500' }}>{lesson.title}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Status Display */}
                    <span className={`status-text status-${status}`}>
                        {status === 'completed' ? '✅ Completed' : status === 'in_progress' ? '➡️ Progress' : 'View Content'}
                    </span>
                    
                    {/* Action Button */}
                    {isEnrolled && status !== 'completed' && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onComplete(lesson.id); }}
                            className="btn-small"
                            disabled={loading}
                        >
                            Mark Done
                        </button>
                    )}
                    {!isEnrolled && <span style={{ color: 'var(--error-color)' }}>🔒 Locked</span>}
                </div>
            </div>
        </div>
    );
};

export default LessonItem;