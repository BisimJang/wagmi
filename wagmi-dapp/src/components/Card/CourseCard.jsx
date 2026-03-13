// Course Card Component - FIXED

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
        <button className="btn" style={{ width: '100%', opacity: 0.7 }} disabled>Completed</button>
      ) : enrollmentStatus === 'enrolled' ? (
        <button className="btn" style={{ width: '100%', opacity: 0.7 }} disabled>Enrolled</button>
      ) : (
        <button className="btn" style={{ width: '100%' }} onClick={(e) => { e.stopPropagation(); onEnroll(course); }}>
          Enroll Now
        </button>
      )}
    </div>
  </div>
);

export default CourseCard;