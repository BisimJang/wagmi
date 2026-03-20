// Course Card Component - FIXED
import BrutalistButton from '../UI/BrutalistButton';

const CourseCard = ({ course, onEnroll, onViewDetails, enrollmentStatus }) => (
  <div className="course-card" onClick={() => onViewDetails(course)}> 
    <div className="course-image" style={{ backgroundImage: `url('${course.imageUrl}')` }}></div>
    <div className="course-content">
      <h3 className="course-title">{course.name}</h3>
      <p className="course-description">{course.description}</p>
      
      <div className="course-price">
        {course.is_minted && (
          <div style={{ marginBottom: '0.8rem' }}>
            <span style={{ 
              display: 'block', 
              fontSize: '0.7rem', 
              color: 'var(--primary-color)', 
              fontWeight: '900', 
              letterSpacing: '1px',
              marginBottom: '0.2rem' 
            }}>
              ✓ BLOCKCHAIN VERIFIED
            </span>
            {course.school_address && (
              <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', display: 'block', wordBreak: 'break-all' }}>
                Owner: {course.school_address.slice(0, 6)}...{course.school_address.slice(-4)}
              </span>
            )}
          </div>
        )}
        {course.price} ETH
      </div>

      <div className="course-stats"><span>Active Course</span></div>
      
      {enrollmentStatus === 'completed' ? (
        <BrutalistButton 
          style={{ width: '100%', opacity: 0.7, background: 'var(--primary-color)', color: '#000', border: '3px solid #000' }} 
          arcColor="#000"
          glowColor="rgba(0,0,0,0.4)"
          disabled
        >
          Completed
        </BrutalistButton>
      ) : enrollmentStatus === 'enrolled' ? (
        <BrutalistButton 
          style={{ width: '100%', opacity: 0.7, background: 'var(--primary-color)', color: '#000', border: '3px solid #000' }} 
          arcColor="#000"
          glowColor="rgba(0,0,0,0.4)"
          disabled
        >
          Enrolled
        </BrutalistButton>
      ) : (
        <BrutalistButton 
          style={{ width: '100%', background: 'var(--primary-color)', color: '#000', border: '3px solid #000' }} 
          arcColor="#000" 
          glowColor="rgba(0,0,0,0.4)"
          onClick={(e) => { e.stopPropagation(); onEnroll(course); }}
        >
          Enroll Now
        </BrutalistButton>
      )}
    </div>
  </div>
);

export default CourseCard;