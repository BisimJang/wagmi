// Course Card Component — Web2 native, wallet-free
import React from 'react';

const CourseCard = ({ course, onEnroll, onViewDetails, enrollmentStatus, onPayFiat }) => {
  const isEnrolled = enrollmentStatus === 'enrolled' || enrollmentStatus === 'completed';
  const isCompleted = enrollmentStatus === 'completed';
  const fiatPrice = parseFloat(course.fiat_price || 0);

  return (
    <div 
      className="course-card" 
      onClick={() => onViewDetails(course)}
      style={{ borderRadius: '16px' }}
    > 
      <div className="course-image" style={{ backgroundImage: `url('${course.imageUrl}')` }}></div>
      <div className="course-content">
        <h3 className="course-title" style={{ fontSize: '1.2rem', marginBottom: '1.2rem' }}>{course.name || course.title}</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="course-price" style={{ fontSize: '1rem', color: fiatPrice === 0 ? '#3ec636' : '#fff', fontWeight: '800' }}>
            {fiatPrice === 0 ? 'FREE' : `₦ ${fiatPrice.toLocaleString()}`}
          </div>
          {course.is_minted && (
             <span style={{ fontSize: '0.6rem', color: 'var(--primary-color)', fontWeight: '900' }}>✓ VERIFIED</span>
          )}
        </div>

        <div className="course-footer" style={{ border: 'none', paddingTop: 0 }}>
          {isCompleted ? (
            <button style={{ width: '100%', padding: '0.6rem', fontSize: '0.75rem', opacity: 0.5 }} disabled>Completed</button>
          ) : isEnrolled ? (
            <button style={{ width: '100%', padding: '0.6rem', fontSize: '0.75rem', background: 'var(--primary-color)', color: '#fff' }} onClick={(e) => { e.stopPropagation(); onViewDetails(course); }}>Resume</button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              {fiatPrice === 0 ? (
                <button 
                  style={{ flex: 1, padding: '0.6rem', fontSize: '0.75rem', background: '#3ec636', color: '#000', border: '1px solid #3ec636', fontWeight: '700' }}
                  onClick={(e) => { e.stopPropagation(); onEnroll(course); }}
                >
                  Enroll Free
                </button>
              ) : (
                <button 
                  style={{ flex: 1, padding: '0.6rem', fontSize: '0.75rem', background: 'var(--primary-color)', color: '#fff', border: '1px solid var(--primary-color)' }}
                  onClick={(e) => { e.stopPropagation(); if (onPayFiat) onPayFiat(course); }}
                >
                  Pay ₦{fiatPrice.toLocaleString()}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;