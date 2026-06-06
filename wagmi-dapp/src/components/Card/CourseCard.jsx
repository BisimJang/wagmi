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

  return (
    <div 
      className="course-card" 
      onClick={() => onViewDetails(course)}
      style={{ borderRadius: '16px' }}
    > 
      <div className="course-image" style={{ backgroundImage: `url('${course.imageUrl}')` }}></div>
      <div className="course-content">
        <h3 className="course-title" style={{ fontSize: '1.2rem', marginBottom: '1.2rem' }}>{course.name}</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="course-price" style={{ fontSize: '1rem' }}>{Number(course.price).toFixed(4)} ETH</div>
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
              <button 
                style={{ flex: 1, padding: '0.6rem', fontSize: '0.75rem', background: 'transparent', color: '#fff', border: '1px solid var(--primary-color)' }}
                disabled={isCheckingStatus}
                onClick={(e) => { e.stopPropagation(); onEnroll(course); }}
              >
                {isCheckingStatus ? '...' : 'Enroll (Crypto)'}
              </button>
              {course.price > 0 && (
                <button 
                  style={{ flex: 1, padding: '0.6rem', fontSize: '0.75rem', background: '#0BA4DB', color: '#fff', border: '1px solid #0BA4DB' }}
                  disabled={isCheckingStatus}
                  onClick={(e) => { e.stopPropagation(); if(onPayFiat) onPayFiat(course); }}
                >
                  Pay with Card
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