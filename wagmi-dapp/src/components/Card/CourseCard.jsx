// Course Card Component - FIXED
import BrutalistButton from '../UI/BrutalistButton';

const CourseCard = ({ course, onEnroll, onViewDetails, enrollmentStatus }) => (
   // 💡 FIX: Pass the entire 'course' object instead of just 'course.id'
  <div className="course-card" onClick={() => onViewDetails(course)}> 
    <div className="course-image" style={{ backgroundImage: `url('${course.imageUrl}')` }}></div>
    <div className="course-content">
      <h3 className="course-title">{course.name}</h3>
      <p className="course-description">{course.description}</p>
      <div className="course-price">{course.price} ETH</div>
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