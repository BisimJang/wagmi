import React from 'react';
import LoadingSpinner from '../Feedback/LoadingSpinner';
import BrutalistButton from '../UI/BrutalistButton';

const CourseModal = ({ 
    course, 
    enrollmentStatus, 
    loading, 
    onEnroll, 
    onEnterCourse,
    onClose 
}) => {
    
    if (!course) return null;

    const renderActionButton = () => {
        if (enrollmentStatus === 'completed') {
             return (
                 <BrutalistButton 
                    onClick={onEnterCourse}
                    style={{ background: '#fff', color: '#000', maxWidth: '400px' }}
                 >
                     REVIEW COURSE (COMPLETED)
                 </BrutalistButton>
             );
        }
        
        if (enrollmentStatus === 'enrolled') {
             return (
                 <BrutalistButton 
                    onClick={onEnterCourse}
                    style={{ background: 'var(--primary-color)', color: '#000', maxWidth: '400px' }}
                 >
                     ENTER COURSE &rarr;
                 </BrutalistButton>
             );
        }

        return (
            <BrutalistButton 
                onClick={() => onEnroll(course)} 
                style={{ maxWidth: '400px' }}
                disabled={loading}
            >
                {loading ? <LoadingSpinner /> : `ENROLL FOR ${course.price} ETH`}
            </BrutalistButton>
        );
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            padding: '1.5rem'
        }}>
            <div style={{
                background: 'var(--background)',
                width: '100%',
                maxHeight: '95vh',
                maxWidth: '600px', /* Shrunk width for a true popup */
                border: '6px solid #000',
                boxShadow: '12px 12px 0px #000',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <button 
                    onClick={onClose} 
                    className="btn" 
                    style={{ 
                        position: 'absolute', 
                        top: '-1rem', 
                        right: '-1rem', 
                        background: '#ff0000', 
                        color: '#fff',
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.85rem',
                        zIndex: 100,
                        border: '3px solid #000',
                        boxShadow: '4px 4px 0 #000'
                    }}
                >
                    X CLOSE
                </button>

                {course.imageUrl && (
                    <div style={{ borderBottom: '4px solid #000', background: '#000', maxHeight: '200px', overflow: 'hidden' }}>
                        <img 
                            src={course.imageUrl} 
                            alt={course.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'grayscale(100%) contrast(150%)' }} 
                        />
                    </div>
                )}

                <div style={{ 
                    padding: '2.25rem 1.5rem', 
                    textAlign: 'center',
                    flex: 1,
                    overflowY: 'auto'
                }}>
                    <h1 style={{ 
                        fontSize: '2.25rem', 
                        fontWeight: '900', 
                        textTransform: 'uppercase', 
                        lineHeight: '1',
                        letterSpacing: '-1px',
                        marginBottom: '1rem'
                    }}>
                        {course.name}
                    </h1>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                        {course.instructor && (
                            <span style={{ 
                                background: '#000', 
                                color: '#fff', 
                                padding: '0.3rem 0.6rem', 
                                border: '3px solid #000',
                                fontWeight: '900',
                                textTransform: 'uppercase',
                                fontSize: '0.75rem'
                            }}>
                                INSTRUCTOR: {course.instructor}
                            </span>
                        )}
                        <span style={{ 
                            background: 'var(--primary-color)', 
                            color: '#000', 
                            padding: '0.3rem 0.6rem', 
                            border: '3px solid #000',
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            fontSize: '0.75rem'
                        }}>
                            PRICE: {course.price} ETH
                        </span>
                    </div>

                    <p style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: '600', 
                        margin: '0 auto 2.25rem auto',
                        lineHeight: '1.5'
                    }}>
                        {course.description}
                    </p>

                    <div>{renderActionButton()}</div>
                </div>
            </div>
        </div>
    );
};

export default CourseModal;