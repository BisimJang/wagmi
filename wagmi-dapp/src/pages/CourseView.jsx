import React from 'react';
import { useAccount, useReadContract } from 'wagmi';
import LoadingSpinner from '../components/Feedback/LoadingSpinner';
import BrutalistButton from '../components/UI/BrutalistButton';
import LessonWorkspace from '../components/Course/LessonWorkspace';
import { SCHOOL_ABI, COURSE_CONTRACT_ADDRESS } from '../web3/constants';

const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
        return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
        return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
};

const CourseView = ({ 
    course, 
    lessons,              
    lessonProgress,       
    enrollmentStatus, 
    loading, 
    onComplete, 
    onLessonComplete,
    onBack,
    onEnroll // Pass down enroll from parent if needed
}) => {
    const { address } = useAccount();
    const targetContract = course?.school_address || COURSE_CONTRACT_ADDRESS;
    const [activeLesson, setActiveLesson] = React.useState(null);

    // On-chain fallback
    const { data: isOnChainEnrolled } = useReadContract({
        address: targetContract,
        abi: SCHOOL_ABI,
        functionName: 'isEnrolled',
        args: [address, BigInt(course?.id ?? 0)],
        query: {
            enabled: !!address && !!course?.id,
            staleTime: 60000,
        }
    });

    if (!course) return null;

    const isEnrolled = enrollmentStatus === 'enrolled' || enrollmentStatus === 'completed' || isOnChainEnrolled;

    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    if (activeLesson) {
        return (
            <section className="page active" style={{ padding: '0', display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#fff' }}>
                {/* LEFT SIDEBAR - COMPACT CURRICULUM */}
                <div style={{ 
                    width: isSidebarOpen ? '350px' : '60px', 
                    background: '#000', 
                    color: '#fff', 
                    borderRight: '4px solid #000', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'width 0.2s',
                    position: 'relative'
                }}>
                    {/* Collapser Toggle */}
                    <div 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: isSidebarOpen ? '1rem' : 'auto',
                            left: isSidebarOpen ? 'auto' : '50%',
                            transform: isSidebarOpen ? 'none' : 'translateX(-50%)',
                            cursor: 'pointer',
                            zIndex: 20
                        }}
                    >
                        {isSidebarOpen ? '◀' : '▶'}
                    </div>

                    {isSidebarOpen ? (
                        <>
                            <div style={{ padding: '1.5rem', borderBottom: '2px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1rem', color: '#ccc', marginBottom: '0.2rem', lineHeight: 1.1 }}>{course.name.toUpperCase()}</h2>
                                    <h3 style={{ fontSize: '0.9rem', color: '#39ff14', margin: 0, fontWeight: '900' }}>STUDIO: {activeLesson.title.toUpperCase()}</h3>
                                </div>
                                <button 
                                    style={{ background: '#ff0000', color: '#fff', padding: '0.4rem 0.6rem', fontSize: '0.7rem', border: '2px solid #000', cursor: 'pointer', fontWeight: '900', flexShrink: 0 }} 
                                    onClick={() => setActiveLesson(null)}
                                >
                                    CLOSE [X]
                                </button>
                            </div>
                            
                            <div style={{ flex: 1, overflowY: 'auto', padding: '0 2rem 2rem 2rem' }} className="sidebar-scroll">
                                {lessons?.sort((a, b) => a.order - b.order).map((section, sIdx) => (
                                    <div key={section.id} style={{ marginBottom: '2rem' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#39ff14', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                            MODULE {String(sIdx + 1).padStart(2, '0')}: {section.title.toUpperCase()}
                                        </div>
                                        <div>
                                            {section.lessons?.sort((a, b) => a.order - b.order).map((lesson, lIdx) => {
                                                const isActive = activeLesson.id === lesson.id;
                                                const isCompleted = lessonProgress?.[lesson.id]?.completed;
                                                return (
                                                    <div 
                                                        key={lesson.id} 
                                                        onClick={() => setActiveLesson(lesson)}
                                                        style={{ 
                                                            padding: '0.6rem', 
                                                            marginBottom: '0.5rem',
                                                            border: '2px solid #fff',
                                                            background: isActive ? '#39ff14' : 'transparent',
                                                            color: isActive ? '#000' : '#fff',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            transition: 'all 0.1s'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '0.7rem', fontWeight: '900' }}>{lesson.title}</span>
                                                        {isCompleted && <span style={{ fontSize: '0.7rem' }}>✓</span>}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                        </>
                    ) : (
                        // Collapsed State
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 0 1rem 0' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '0.8rem', color: '#39ff14', fontWeight: 'bold', letterSpacing: '2px' }}>
                                    {activeLesson.title.toUpperCase()}
                                </div>
                            </div>
                            <div style={{ marginTop: 'auto' }}>
                                <div style={{ fontSize: '1.2rem', cursor: 'pointer', color: '#ff0000' }} onClick={() => setActiveLesson(null)}>
                                    ✖
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT CANVAS */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    <LessonWorkspace lesson={activeLesson} onClose={() => setActiveLesson(null)} />
                </div>
            </section>
        );
    }

    return (
        <section className="page active" style={{ padding: '0', background: 'var(--background)', position: 'relative' }}>
            
            {/* BACK BUTTON */}
            <button 
                onClick={onBack}
                style={{ 
                    position: 'absolute', 
                    top: '1.5rem', 
                    left: '1.5rem', 
                    background: 'transparent',
                    border: 'none',
                    fontWeight: '900',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textTransform: 'uppercase',
                    color: '#666',
                    zIndex: 10
                }}
            >
                &larr; BACK TO CATALOG
            </button>

            {/* 1. TOP HEADER / BADGES */}
            <div style={{ padding: '4rem 1.5rem 0 1.5rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <span className="neon-block" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>INSTRUCTOR: {course.instructor_name || 'STUDYVERSE OWNER'}</span>
                    <span className="neon-block" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', background: '#fff' }}>DURATION: 8 WEEKS</span>
                    <span className="neon-block" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>LEVEL: ADVANCED</span>
                </div>

                <div className="container" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    gap: '2rem', 
                    flexWrap: 'wrap', 
                    marginBottom: '2rem',
                    textAlign: 'left'
                }}>
                    <div style={{ flex: '1 1 500px' }}>
                        <h1 style={{ 
                            fontSize: 'clamp(2rem, 5vw, 4rem)', 
                            fontWeight: '900', 
                            letterSpacing: '-2px', 
                            marginBottom: '1rem',
                            lineHeight: '1'
                        }}>
                            {course.name.toUpperCase()}
                        </h1>
                        <p style={{ color: '#666', fontSize: '1.2rem', margin: 0, lineHeight: 1.5 }}>
                            {course.description || "A deep dive into structural anarchy, deconstructionism, and the ethics of permanent structures in an impermanent world."}
                        </p>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                        {!isEnrolled ? (
                            <BrutalistButton onClick={() => onEnroll(course)} style={{ background: '#fff', fontSize: '1.2rem', padding: '1rem 2rem' }}>
                                ENROLL NOW
                            </BrutalistButton>
                        ) : (
                            <BrutalistButton 
                                onClick={() => {
                                    const firstLesson = lessons?.[0]?.lessons?.[0];
                                    if (firstLesson) setActiveLesson(firstLesson);
                                }} 
                                style={{ background: '#fff', fontSize: '1.2rem', padding: '1rem 2rem' }}
                            >
                                START COURSE
                            </BrutalistButton>
                        )}
                    </div>
                </div>

                <div className="handwritten" style={{ marginTop: '2rem' }}>
                    "DESTROY THE BOX BEFORE YOU TRY TO THINK OUTSIDE OF IT."
                </div>
            </div>

            {/* 3. COMPACT SYLLABUS */}
            <div style={{ marginTop: '4rem', paddingBottom: '6rem' }}>
                <div className="container">
                    <h2 style={{ fontSize: '3rem', marginBottom: '3rem', borderBottom: '6px solid #000', paddingBottom: '1rem' }}>COURSE SYLLABUS</h2>
                    
                    {lessons?.sort((a, b) => a.order - b.order).map((section, sIdx) => {
                        const moduleCompleted = isEnrolled && section.lessons?.every(l => lessonProgress?.[l.id]?.completed);
                        
                        return (
                            <div key={section.id} className="brutalist-card" style={{ marginBottom: '2rem', padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.5rem', margin: 0 }}>
                                        <span style={{ color: 'var(--primary-color)', marginRight: '1rem' }}>{String(sIdx + 1).padStart(2, '0')}</span>
                                        {section.title.toUpperCase()}
                                    </h3>
                                    {moduleCompleted && <span className="neon-block" style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}>✓</span>}
                                </div>
                                <p style={{ color: '#666', fontSize: '1rem', marginBottom: '1.5rem', paddingLeft: '2.5rem' }}>
                                    {section.description || `Explore the foundational concepts of "${section.title}" through aggressive, uncompromising architectural learning nodes.`}
                                </p>
                                <div style={{ paddingLeft: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {section.lessons?.sort((a, b) => a.order - b.order).map((lesson, lIdx) => (
                                        <span key={lesson.id} style={{ 
                                            background: '#f0f0f0', 
                                            padding: '0.4rem 0.8rem', 
                                            fontSize: '0.75rem', 
                                            fontWeight: 'bold',
                                            border: '2px solid #000'
                                        }}>
                                            {lessonProgress?.[lesson.id]?.completed && '✓ '}{lesson.title}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 4. READY TO GRADUATE SECTION */}
            {isEnrolled && (
                <div style={{ background: '#222', color: '#fff', padding: '6rem 1.5rem', textAlign: 'center', borderTop: '6px solid #000' }}>
                    <div className="container">
                        <h2 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>READY TO GRADUATE?</h2>
                        <p style={{ color: 'var(--primary-color)', fontWeight: '900', fontSize: '1.1rem', marginBottom: '3rem' }}>
                            VALIDATE YOUR ARCHITECTURAL REBELLION ON THE BLOCKCHAIN
                        </p>

                        <div style={{ 
                            border: '2px dashed var(--primary-color)', 
                            padding: '2rem', 
                            maxWidth: '500px', 
                            margin: '0 auto 3rem auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.5rem',
                            textAlign: 'left'
                        }}>
                            <div className="neon-block" style={{ padding: '1rem', borderRadius: '50%' }}>🛡️</div>
                            <div>
                                <h4 style={{ color: '#fff', fontSize: '1rem' }}>V. KANE SIGNATURE NFT</h4>
                                <p style={{ color: 'var(--primary-color)', fontSize: '0.7rem', fontWeight: 'bold' }}>OFFICIAL COMPLETION CERTIFICATE</p>
                                <p style={{ fontSize: '0.6rem', color: '#999', marginTop: '0.5rem' }}>Minting requires 100% curriculum completion and final project submission approved by the Studio Board.</p>
                            </div>
                        </div>

                        <BrutalistButton 
                            onClick={() => onComplete(course.id)}
                            style={{ background: 'var(--primary-color)', fontSize: '1.5rem', width: '100%', maxWidth: '500px' }}
                            disabled={loading}
                        >
                            {loading ? <LoadingSpinner /> : 'FINALIZE & MINT CERTIFICATE →'}
                        </BrutalistButton>
                    </div>
                </div>
            )}

        </section>
    );
};

export default CourseView;

