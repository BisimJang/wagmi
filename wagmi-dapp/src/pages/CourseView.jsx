// src/pages/CourseView.jsx

import React from 'react';
import { useAccount, useReadContract } from 'wagmi';
import LoadingSpinner from '../components/Feedback/LoadingSpinner';
import LessonWorkspace from '../components/Course/LessonWorkspace';
import { SCHOOL_ABI, COURSE_CONTRACT_ADDRESS } from '../web3/constants';
import { ArrowLeft, BookOpen, CheckCircle, Play, Shield, Award, ChevronRight, X } from 'lucide-react';

const CourseView = ({ 
    course, 
    lessons,              
    lessonProgress,       
    enrollmentStatus, 
    certificate,
    loading, 
    onComplete, 
    onClaim,
    onLessonComplete,
    onBack,
    onEnroll 
}) => {
    const { address } = useAccount();
    const targetContract = course?.school_address || COURSE_CONTRACT_ADDRESS;
    const [activeLesson, setActiveLesson] = React.useState(null);

    const { data: isOnChainEnrolled, error: enrollmentError, isLoading: isEnrollmentLoading } = useReadContract({
        address: targetContract,
        abi: SCHOOL_ABI,
        functionName: 'isEnrolled',
        args: [address, BigInt(course?.id ?? 0)],
        query: {
            enabled: !!address && !!course?.id && !!targetContract,
            staleTime: 60000,
        }
    });

    const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(window.innerWidth > 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const totalLessons = React.useMemo(() => {
        if (!lessons) return 0;
        return lessons.reduce((acc, section) => acc + (section.lessons?.length || 0), 0);
    }, [lessons]);

    const completedCount = React.useMemo(() => {
        if (!lessonProgress) return 0;
        return Object.values(lessonProgress).filter(p => p.completed).length;
    }, [lessonProgress]);

    const isFullyCompleted = totalLessons > 0 && completedCount >= totalLessons;

    if (!course) return null;

    const isEnrolled = enrollmentStatus === 'enrolled' || enrollmentStatus === 'completed' || isOnChainEnrolled;

    const handleNextLesson = () => {
        if (!activeLesson || !lessons) return;
        if (onLessonComplete) onLessonComplete(activeLesson.id);

        const flatLessons = [...lessons]
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .flatMap(section => 
                [...(section.lessons || [])].sort((a, b) => (a.order || 0) - (b.order || 0))
            );
            
        const currentIndex = flatLessons.findIndex(l => l.id === activeLesson.id);
        
        if (currentIndex !== -1 && currentIndex < flatLessons.length - 1) {
            setActiveLesson(flatLessons[currentIndex + 1]);
        } else {
            setActiveLesson(null);
        }
    };

    if (activeLesson) {
        return (
            <section className="page" style={{ padding: '0', display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#000', position: 'relative' }}>
                {/* SIDEBAR */}
                <div style={{ 
                    width: isSidebarOpen ? (isMobile ? '100vw' : '400px') : '0px', 
                    background: 'rgba(255,255,255,0.02)', 
                    backdropFilter: 'blur(20px)',
                    borderRight: isSidebarOpen ? '1px solid rgba(255,255,255,0.05)' : 'none', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: isMobile ? 'absolute' : 'relative',
                    zIndex: 50,
                    height: '100%',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '3rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ fontSize: '0.6rem', fontWeight: '900', color: 'var(--primary-color)', letterSpacing: '2px' }}>LEARNING NODE</span>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '0.5rem' }}>{course.title}</h2>
                        </div>
                        <button onClick={() => setActiveLesson(null)} style={{ background: 'none', border: 'none', color: '#444' }}><X size={20} /></button>
                    </div>
                    
                    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                        {(lessons || []).sort((a, b) => a.order - b.order).map((section, sIdx) => (
                            <div key={section.id} style={{ marginBottom: '3rem' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: '900', color: '#444', marginBottom: '1.5rem', letterSpacing: '1px' }}>
                                    SECTION {sIdx + 1}: {section.title.toUpperCase()}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {(section.lessons || []).sort((a, b) => a.order - b.order).map((lesson) => {
                                        const isActive = activeLesson.id === lesson.id;
                                        const isCompleted = lessonProgress?.[lesson.id]?.completed;
                                        return (
                                            <div 
                                                key={lesson.id} 
                                                onClick={() => setActiveLesson(lesson)}
                                                style={{ 
                                                    padding: '1.2rem 1.5rem', 
                                                    background: isActive ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                                                    border: isActive ? '1px solid var(--primary-color)' : '1px solid transparent',
                                                    borderRadius: '12px',
                                                    color: isActive ? '#fff' : '#444',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{lesson.title}</span>
                                                {isCompleted && <CheckCircle size={14} color="var(--primary-color)" />}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* WORKSPACE */}
                <div style={{ flex: 1, position: 'relative' }}>
                    <LessonWorkspace 
                        lesson={activeLesson} 
                        isCompleted={!!lessonProgress[activeLesson?.id]?.completed}
                        onClose={() => setActiveLesson(null)} 
                        onNext={handleNextLesson}
                    />
                </div>
            </section>
        );
    }

    return (
        <section className="page">
            <div className="container" style={{ position: 'relative' }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem', cursor: 'pointer' }}>
                    <ArrowLeft size={16} /> Library
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '6rem', alignItems: 'start' }}>
                    {/* INFO */}
                    <div>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--primary-color)', background: 'rgba(79, 70, 229, 0.1)', padding: '6px 12px', borderRadius: '4px' }}>BY {course.instructor_name?.toUpperCase() || 'STUDY VERSE'}</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: '900', color: '#444', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '4px' }}>VERIFIED NODE</span>
                        </div>
                        
                        <h1 style={{ fontSize: '5rem', fontWeight: '900', letterSpacing: '-2px', marginBottom: '2rem', lineHeight: 1 }}>{course.title}</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.3rem', lineHeight: 1.6, marginBottom: '4rem', maxWidth: '800px' }}>{course.description}</p>

                        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '3rem' }}>Syllabus</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {(lessons || []).sort((a, b) => a.order - b.order).map((section, idx) => (
                                <div key={section.id} className="glass-panel" style={{ padding: '3rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>
                                            <span style={{ color: 'var(--primary-color)', marginRight: '1rem' }}>{String(idx + 1).padStart(2, '0')}</span>
                                            {section.title}
                                        </h3>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                        {(section.lessons || []).map(l => (
                                            <span key={l.id} style={{ padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', fontSize: '0.85rem', color: '#666' }}>
                                                {l.title}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div style={{ position: 'sticky', top: '120px' }}>
                        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                            <div style={{ width: '100%', aspectRatio: '1', background: 'rgba(255,255,255,0.02)', borderRadius: '40px', marginBottom: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Award size={120} color="var(--primary-color)" style={{ opacity: 0.5 }} />
                            </div>
                            
                            {!isEnrolled ? (
                                <>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', marginBottom: '1rem' }}>{course.price} ETH</div>
                                    <button 
                                        disabled={loading}
                                        onClick={() => onEnroll(course)} 
                                        style={{ 
                                            width: '100%', 
                                            background: loading ? '#333' : 'var(--primary-color)', 
                                            padding: '1.2rem', 
                                            fontSize: '1.1rem',
                                            cursor: loading ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {loading ? 'Processing...' : 'Enroll Now'}
                                    </button>
                                </>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {/* Primary Action Button */}
                                    {enrollmentError ? (
                                        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '12px', color: '#ef4444', fontSize: '0.8rem' }}>
                                            <strong>Incompatible School:</strong> This course belongs to an outdated school contract that doesn't support blockchain syncing or NFTs.
                                        </div>
                                    ) : !isEnrollmentLoading && !isOnChainEnrolled && course.school_address ? (
                                        <button 
                                            disabled={loading}
                                            onClick={() => onEnroll(course)} 
                                            style={{ 
                                                width: '100%', 
                                                background: loading ? '#333' : 'var(--primary-color)', 
                                                padding: '1.2rem', 
                                                fontSize: '1.1rem', 
                                                fontWeight: '900',
                                                cursor: loading ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {loading ? 'Syncing...' : 'Sync to Blockchain (Required for NFT)'}
                                        </button>
                                    ) : isFullyCompleted && !certificate ? (
                                        <button 
                                            disabled={loading}
                                            onClick={() => onComplete(course.id)} 
                                            style={{ 
                                                width: '100%', 
                                                background: loading ? '#333' : '#39ff14', 
                                                color: '#000', 
                                                padding: '1.2rem', 
                                                fontSize: '1.1rem', 
                                                fontWeight: '900',
                                                cursor: loading ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {loading ? 'Confirming...' : 'Complete Course & Get Certificate'}
                                        </button>
                                    ) : isFullyCompleted && certificate && certificate.status !== 'claimed' ? (
                                        <button 
                                            disabled={loading}
                                            onClick={() => {
                                                if (!address) {
                                                    alert("Please connect your wallet to claim your NFT certificate.");
                                                    return;
                                                }
                                                if (!certificate.id) {
                                                    alert("Certificate ID is missing. Please refresh the page to update your data.");
                                                    return;
                                                }
                                                onClaim(certificate.id);
                                            }} 
                                            style={{ 
                                                width: '100%', 
                                                background: loading ? '#333' : 'var(--primary-color)', 
                                                padding: '1.2rem', 
                                                fontSize: '1.1rem', 
                                                fontWeight: '900',
                                                cursor: loading ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {loading ? 'Claiming NFT...' : (address ? 'Claim NFT Certificate' : 'Connect Wallet to Claim')}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => {
                                                const first = lessons?.[0]?.lessons?.[0];
                                                if (first) setActiveLesson(first);
                                            }} 
                                            style={{ width: '100%', background: 'var(--primary-color)', padding: '1.2rem', fontSize: '1.1rem' }}
                                        >
                                            {isFullyCompleted ? 'Review Lessons' : 'Resume Course'}
                                        </button>
                                    )}

                                    {/* Proof of Skill Link */}
                                    {certificate?.status === 'claimed' && (
                                        <div style={{ padding: '1rem', background: 'rgba(57, 255, 20, 0.1)', border: '1px solid #39ff14', borderRadius: '12px', color: '#39ff14', fontSize: '0.9rem', fontWeight: '700' }}>
                                            ✓ Certificate Claimed on Sepolia
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {isEnrolled && (
                            <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#444', marginBottom: '1rem' }}>COMPLETION STATUS</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary-color)' }}>{completedCount} / {totalLessons}</div>
                                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '1rem', overflow: 'hidden' }}>
                                    <div style={{ width: `${(completedCount / totalLessons) * 100}%`, height: '100%', background: 'var(--primary-color)' }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CourseView;
