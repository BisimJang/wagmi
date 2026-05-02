// Course Card Component - Enhanced with On-Chain Verification
import React, { useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import BrutalistButton from '../UI/BrutalistButton';
import { SCHOOL_ABI, COURSE_CONTRACT_ADDRESS } from '../../web3/constants';

const CourseCard = ({ course, onEnroll, onViewDetails, enrollmentStatus, onSync }) => {
  const { address } = useAccount();
  const targetContract = course.school_address || COURSE_CONTRACT_ADDRESS;

  // On-chain check: prevents "Transaction likely to fail" by checking status directly
  const { data: isOnChainEnrolled, isLoading: isCheckingStatus } = useReadContract({
    address: targetContract,
    abi: SCHOOL_ABI,
    functionName: 'isEnrolled',
    args: [address, BigInt(course.id)],
    query: {
      enabled: !!address && !!course.id,
      staleTime: 60000, // Cache for 1 minute
    }
  });

  // Effective status (either backend reported it OR the blockchain verified it)
  const isEnrolled = enrollmentStatus === 'enrolled' || enrollmentStatus === 'completed' || isOnChainEnrolled;
  const isCompleted = enrollmentStatus === 'completed';

  // 🆕 Background Sync: if we FOUND it on chain but backend doesn't know, tell the backend!
  React.useEffect(() => {
    if (isOnChainEnrolled && !enrollmentStatus && address && onSync) {
      console.log(`Auto-syncing on-chain enrollment for course ${course.id}`);
      onSync();
    }
  }, [isOnChainEnrolled, enrollmentStatus, address, onSync, course.id]);

  // Premium: Irregular Shard Shapes
  const shardShape = useMemo(() => {
    const shapes = [
      'polygon(0% 2%, 100% 0%, 95% 95%, 5% 100%)',
      'polygon(5% 0%, 95% 5%, 100% 100%, 0% 92%)',
      'polygon(0% 0%, 98% 8%, 92% 100%, 5% 85%)',
      'polygon(10% 0%, 100% 0%, 88% 95%, 0% 100%)',
    ];
    return shapes[course.id % shapes.length];
  }, [course.id]);

  return (
    <div 
      className="course-card" 
      onClick={() => onViewDetails(course)}
      style={{ clipPath: shardShape }}
    > 
      <div className="course-image" style={{ backgroundImage: `url('${course.imageUrl}')` }}></div>
      <div className="course-content">
        <h3 className="course-title">{course.name}</h3>
        <p className="course-description">{course.description}</p>
        
        <div style={{ marginBottom: '1.5rem' }}>
          {(course.is_minted || isOnChainEnrolled) && (
            <div style={{ marginBottom: '0.8rem' }}>
              <span style={{ 
                display: 'block', 
                fontSize: '0.7rem', 
                color: 'var(--primary-color)', 
                fontWeight: '800', 
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '0.2rem' 
              }}>
                ✓ {course.school_name || 'STUDY VERSE VERIFIED'}
              </span>
            </div>
          )}
          <div className="course-price">{course.price} ETH</div>
        </div>

        <div className="course-footer">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            {course.division === 'builders' ? '⚡ BUILDERS' : course.division === 'creatives' ? '🎨 CREATIVES' : '◎ CORE'}
          </span>
          
          {isCompleted ? (
            <button style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', opacity: 0.5 }} disabled>Completed</button>
          ) : isEnrolled ? (
            <button style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', background: 'var(--primary-color)', color: '#fff' }} onClick={(e) => { e.stopPropagation(); onViewDetails(course); }}>Learn</button>
          ) : (
            <button 
              style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', background: 'var(--primary-color)', color: '#fff' }}
              disabled={isCheckingStatus}
              onClick={(e) => { e.stopPropagation(); onEnroll(course); }}
            >
              {isCheckingStatus ? '...' : 'Enroll'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;