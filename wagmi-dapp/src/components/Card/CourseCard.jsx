// Course Card Component - Enhanced with On-Chain Verification
import React, { useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import BrutalistButton from '../UI/BrutalistButton';
import { SCHOOL_ABI, COURSE_CONTRACT_ADDRESS } from '../../web3/constants';

const CourseCard = ({ course, onEnroll, onViewDetails, enrollmentStatus }) => {
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

  return (
    <div className="course-card" onClick={() => onViewDetails(course)}> 
      <div className="course-image" style={{ backgroundImage: `url('${course.imageUrl}')` }}></div>
      <div className="course-content">
        <h3 className="course-title">{course.name}</h3>
        <p className="course-description">{course.description}</p>
        
        <div className="course-price">
          {(course.is_minted || isOnChainEnrolled) && (
            <div style={{ marginBottom: '0.8rem' }}>
              <span style={{ 
                display: 'block', 
                fontSize: '0.7rem', 
                color: 'var(--primary-color)', 
                fontWeight: '900', 
                letterSpacing: '1px',
                marginBottom: '0.2rem' 
              }}>
                ✓ {course.school_name ? course.school_name.toUpperCase() : 'STUDYVERSE VERIFIED'}
              </span>
              {targetContract && (
                <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', display: 'block', wordBreak: 'break-all' }}>
                  Issuer: {course.school_name || 'Global Catalog'} 
                </span>
              )}
            </div>
          )}
          {course.price} ETH
        </div>

        <div className="course-stats"><span>Active Course</span></div>
        
        {isCompleted ? (
          <BrutalistButton 
            style={{ width: '100%', opacity: 0.7, background: 'var(--primary-color)', color: '#000', border: '3px solid #000' }} 
            arcColor="#000"
            glowColor="rgba(0,0,0,0.4)"
            disabled
          >
            Completed
          </BrutalistButton>
        ) : isEnrolled ? (
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
            disabled={isCheckingStatus}
            onClick={(e) => { e.stopPropagation(); onEnroll(course); }}
          >
            {isCheckingStatus ? 'Checking...' : 'Enroll Now'}
          </BrutalistButton>
        )}
      </div>
    </div>
  );
};

export default CourseCard;