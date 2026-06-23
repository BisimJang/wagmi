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
        <h3 className="course-title" style={{ fontSize: '1.2rem', marginBottom: '1.2rem', color: '#111' }}>{course.name || course.title}</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="course-price" style={{ fontSize: '0.85rem', color: fiatPrice === 0 ? '#10b981' : '#333', fontWeight: '800' }}>
            {fiatPrice === 0 ? 'FREE' : `₦${fiatPrice.toLocaleString()}`}
          </div>
          {course.is_minted && (
             <span style={{ fontSize: '0.6rem', color: 'var(--primary-color)', fontWeight: '900' }}>✓ VERIFIED</span>
          )}
        </div>

        <div className="course-footer" style={{ border: 'none', paddingTop: 0 }}>
          {isCompleted ? (
            <button style={{ width: '100%', padding: '0.6rem', fontSize: '0.75rem', opacity: 0.5, border: '1px solid #eaeaea', background: '#f9f9f9', color: '#333', borderRadius: '8px' }} disabled>Completed</button>
          ) : isEnrolled ? (
            <button style={{ width: '100%', padding: '0.6rem', fontSize: '0.75rem', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px' }} onClick={(e) => { e.stopPropagation(); onViewDetails(course); }}>Resume</button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              {fiatPrice === 0 ? (
                <button 
                  style={{ flex: 1, padding: '0.6rem', fontSize: '0.75rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700' }}
                  onClick={(e) => { e.stopPropagation(); onEnroll(course); }}
                >
                  Enroll Free
                </button>
              ) : (
                <button 
                  style={{ flex: 1, padding: '0.6rem', fontSize: '0.75rem', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700' }}
                  onClick={(e) => { e.stopPropagation(); onViewDetails(course); }}
                >
                  View Options
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