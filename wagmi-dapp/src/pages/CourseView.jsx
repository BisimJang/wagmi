import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/Feedback/LoadingSpinner';
import LessonWorkspace from '../components/Course/LessonWorkspace';
import { ArrowLeft, BookOpen, CheckCircle, Play, Shield, Award, ChevronRight, ChevronLeft, X, List } from 'lucide-react';
import { SOCRATIC_FALLBACK_NODES } from '../data/socratic_content';

const CourseView = ({ 
    course, 
    lessons, 
    loading, 
    enrollmentStatus, 
    onEnroll, 
    onBack, 
    onClaim,
    onComplete,
    onLessonComplete,
    certificate,
    lessonProgress = {},
    projectGoal,
    user // Add user prop
}) => {
    const isInstructor = course?.is_instructor;
    const isEnrolled = enrollmentStatus === 'enrolled' || enrollmentStatus === 'completed' || isInstructor;
    const fiatPrice = parseFloat(course?.fiat_price || 0);
    const [activeLesson, setActiveLesson] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [expandedSections, setExpandedSections] = useState({});
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // The Socratic content is now live in the backend!
    const displayLessons = lessons || [];

    // Calculate Progress Stats locally
    const allFlatLessons = displayLessons.reduce((acc, section) => [...acc, ...(section.lessons || [])], []);
    const totalLessonsCount = allFlatLessons.length;
    const completedLessonsCount = allFlatLessons.filter(l => !!(lessonProgress && lessonProgress[l.id]?.completed)).length;
    const isFullyCompleted = totalLessonsCount > 0 && completedLessonsCount === totalLessonsCount;

    // Check for completion transition
    useEffect(() => {
        if (!activeLesson && isFullyCompleted && !certificate) {
            // Check if we just finished the last lesson
            const hasStarted = Object.keys(lessonProgress || {}).length > 0;
            if (hasStarted) setShowCompletionModal(true);
        }
    }, [activeLesson, isFullyCompleted, certificate, lessonProgress]);

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const handleNextLesson = () => {
        let found = false;
        const sortedSections = [...displayLessons].sort((a, b) => a.order - b.order);
        
        for (let i = 0; i < sortedSections.length; i++) {
            const sortedLessons = [...sortedSections[i].lessons].sort((a, b) => a.order - b.order);
            for (let j = 0; j < sortedLessons.length; j++) {
                if (found) {
                    setActiveLesson(sortedLessons[j]);
                    setExpandedSections(prev => ({ ...prev, [sortedSections[i].id]: true }));
                    return;
                }
                if (sortedLessons[j].id === activeLesson.id) {
                    found = true;
                }
            }
        }
        if (found) setActiveLesson(null);
    };

    if (loading) return <LoadingSpinner />;

    if (activeLesson) {
        return (
            <div style={{ height: '100vh', display: 'flex', background: '#f8f9fa', overflow: 'hidden' }}>
                {/* CURRICULUM SIDEBAR */}
                {isSidebarOpen && (
                    <div style={{ 
                        width: isMobile ? '100vw' : '340px', 
                        display: 'flex', 
                        flexDirection: 'column',
                        background: '#fff',
                        zIndex: 200,
                        position: isMobile ? 'fixed' : 'relative',
                        borderRight: '1px solid #e9ecef'
                    }}>
                        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #e9ecef' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--primary-color)', letterSpacing: '1px', marginBottom: '0.5rem' }}>CURRICULUM</div>
                            <div style={{ fontSize: '1rem', fontWeight: '800', lineHeight: '1.3', color: '#1a1d23' }}>{course?.title}</div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                            {(displayLessons || []).sort((a, b) => a.order - b.order).map((section, sIdx) => {
                                const isExpanded = !!expandedSections[section.id];
                                return (
                                    <div key={section.id} style={{ marginBottom: '0.8rem' }}>
                                        <div 
                                            onClick={() => toggleSection(section.id)}
                                            style={{ 
                                                fontSize: '0.75rem', 
                                                fontWeight: '700', 
                                                color: isExpanded ? '#1a1d23' : '#868e96', 
                                                padding: '1rem',
                                                background: isExpanded ? '#f8f9fa' : 'transparent',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <span>{section.title}</span>
                                            <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', opacity: 0.5 }} />
                                        </div>
                                        
                                        {isExpanded && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', paddingLeft: '0.5rem' }}>
                                                {(section.lessons || []).sort((a, b) => a.order - b.order).map((lesson) => {
                                                    const isActive = activeLesson.id === lesson.id;
                                                    const isCompleted = lessonProgress?.[lesson.id]?.completed;
                                                    return (
                                                        <div 
                                                            key={lesson.id} 
                                                            onClick={() => {
                                                                setActiveLesson(lesson);
                                                                if (isMobile) setIsSidebarOpen(false);
                                                            }}
                                                            style={{ 
                                                                padding: '0.8rem 1rem', 
                                                                background: isActive ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                                                                color: isActive ? 'var(--primary-color)' : '#495057',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                fontSize: '0.85rem',
                                                                fontWeight: isActive ? '700' : '500',
                                                                borderRadius: '10px',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                                {isCompleted ? <CheckCircle size={16} color="var(--primary-color)" /> : <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1.5px solid #dee2e6' }} />}
                                                                <span>{lesson.title}</span>
                                                            </div>
                                                            {isActive && <div style={{ width: '4px', height: '14px', background: 'var(--primary-color)', borderRadius: '10px' }} />}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* MAIN STAGE */}
                <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        style={{
                            position: 'absolute',
                            left: '1.5rem',
                            top: '1.5rem',
                            zIndex: 100,
                            background: '#fff',
                            color: '#1a1d23',
                            border: '1px solid #e9ecef',
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isSidebarOpen ? <ChevronLeft size={20} /> : <List size={20} />}
                    </button>

                    <LessonWorkspace 
                        lesson={activeLesson} 
                        isCompleted={!!lessonProgress[activeLesson?.id]?.completed}
                        onClose={() => setActiveLesson(null)} 
                        onNext={handleNextLesson}
                        onLessonComplete={onLessonComplete}
                        projectGoal={projectGoal}
                    />
                </div>
            </div>
        );
    }

    return (
        <section className="page" style={{ background: '#f8f9fa' }}>
            <div className="container" style={{ position: 'relative', paddingTop: '4rem' }}>
                <button onClick={onBack} style={{ background: '#fff', border: '1px solid #e9ecef', color: '#495057', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.5rem', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', marginBottom: '3rem' }}>
                    <ArrowLeft size={18} /> Library
                </button>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 420px', 
                    gap: isMobile ? '3rem' : '5rem', 
                    alignItems: 'start' 
                }}>
                    {/* INFO */}
                    <div>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary-color)', background: 'rgba(79, 70, 229, 0.08)', padding: '8px 16px', borderRadius: '100px' }}>BY {course.instructor_name?.toUpperCase() || 'STUDY VERSE'}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#868e96', background: '#fff', border: '1px solid #e9ecef', padding: '8px 16px', borderRadius: '100px' }}>VERIFIED NODE</span>
                        </div>
                        
                        <h1 style={{ fontSize: isMobile ? '2.5rem' : '4.5rem', fontWeight: '800', color: '#1a1d23', marginBottom: '2rem', lineHeight: 1.1 }}>{course.title}</h1>
                        <p style={{ color: '#495057', fontSize: isMobile ? '1.1rem' : '1.2rem', lineHeight: 1.7, marginBottom: '4rem', maxWidth: '800px' }}>{course.description}</p>

                        {/* Instructor Message */}
                        {isInstructor && (
                            <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--primary-color)', background: 'rgba(79, 70, 229, 0.05)', marginBottom: '3rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ background: 'var(--primary-color)', padding: '0.5rem', borderRadius: '8px' }}><CheckCircle size={18} color="#fff" /></div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Instructor Mode Active</h3>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#888', lineHeight: '1.6' }}>
                                    You have master access to this module. {enrollmentStatus !== 'enrolled' && enrollmentStatus !== 'completed' && (
                                        <span style={{ color: 'var(--primary-color)', fontWeight: '700' }}>
                                            To test on-chain NFT claiming, you must first enroll as a student.
                                        </span>
                                    )}
                                </p>
                                
                                {enrollmentStatus !== 'enrolled' && (
                                    <button 
                                        onClick={() => onEnroll(course)} 
                                        style={{ marginTop: '1.5rem', background: 'var(--primary-color)', padding: '0.8rem 2rem', fontWeight: '800', border: 'none', borderRadius: '12px', color: '#fff', cursor: 'pointer' }}
                                    >
                                        {enrollmentStatus === 'completed' ? 'Re-Enroll On-Chain (Required for NFT Test)' : 'Enroll as Student (Test Mode)'}
                                    </button>
                                )}
                            </div>
                        )}

                        <div style={{ marginBottom: '4rem' }}>
                            {isEnrolled ? (
                                <button 
                                    onClick={() => {
                                        const first = displayLessons?.[0]?.lessons?.[0];
                                        if (first) setActiveLesson(first);
                                    }} 
                                    style={{ 
                                        width: '100%', 
                                        background: 'var(--primary-color)', 
                                        color: '#fff',
                                        padding: '1.5rem', 
                                        fontSize: '1.1rem',
                                        fontWeight: '800',
                                        borderRadius: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '1rem',
                                        boxShadow: '0 20px 40px rgba(79, 70, 229, 0.2)',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {isInstructor ? 'Resume (Instructor Mode)' : (isFullyCompleted ? 'Review Modules' : 'Resume Master Chronicle')}
                                    <ChevronRight size={24} />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => onEnroll(course)}
                                    style={{ 
                                        width: '100%', 
                                        background: fiatPrice === 0 ? '#3ec636' : '#1a1d23', 
                                        color: fiatPrice === 0 ? '#000' : '#fff',
                                        padding: '1.5rem', 
                                        fontSize: '1.1rem',
                                        fontWeight: '800',
                                        borderRadius: '20px',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {fiatPrice === 0 ? 'Enroll Free' : `Pay ₦${fiatPrice.toLocaleString()}`}
                                </button>
                            )}
                        </div>

                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1a1d23', marginBottom: '2.5rem' }}>Syllabus</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {(displayLessons || []).sort((a, b) => a.order - b.order).map((section, idx) => (
                                <div key={section.id} style={{ background: '#fff', borderRadius: '24px', padding: isMobile ? '1.5rem' : '2.5rem', border: '1px solid #e9ecef', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                                    <div 
                                        onClick={() => isMobile && toggleSection(section.id)}
                                        style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            marginBottom: (isMobile && !expandedSections[section.id]) ? '0' : '2rem',
                                            cursor: isMobile ? 'pointer' : 'default'
                                        }}
                                    >
                                        <h3 style={{ fontSize: isMobile ? '1.1rem' : '1.3rem', fontWeight: '800', color: '#1a1d23' }}>
                                            <span style={{ color: 'var(--primary-color)', marginRight: '1rem' }}>{String(idx + 1).padStart(2, '0')}</span>
                                            {section.title}
                                        </h3>
                                        {isMobile && (
                                            <ChevronRight 
                                                size={20} 
                                                style={{ 
                                                    transform: expandedSections[section.id] ? 'rotate(90deg)' : 'none',
                                                    transition: 'transform 0.3s'
                                                }} 
                                            />
                                        )}
                                    </div>
                                    {(!isMobile || expandedSections[section.id]) && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                                            {(section.lessons || []).map(l => {
                                                const isLessonCompleted = lessonProgress?.[l.id]?.completed;
                                                return (
                                                    <div 
                                                        key={l.id} 
                                                        onClick={() => isEnrolled && setActiveLesson(l)}
                                                        style={{ 
                                                            padding: '0.6rem 1.2rem', 
                                                            background: isEnrolled ? '#fff' : '#f8f9fa', 
                                                            borderRadius: '100px', 
                                                            fontSize: '0.85rem', 
                                                            color: isEnrolled ? 'var(--primary-color)' : '#868e96', 
                                                            fontWeight: '700', 
                                                            border: '1px solid #e9ecef',
                                                            cursor: isEnrolled ? 'pointer' : 'default',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            transition: 'all 0.2s',
                                                            boxShadow: isEnrolled ? '0 2px 8px rgba(0,0,0,0.04)' : 'none'
                                                        }}
                                                        onMouseOver={(e) => isEnrolled && (e.currentTarget.style.borderColor = 'var(--primary-color)')}
                                                        onMouseOut={(e) => isEnrolled && (e.currentTarget.style.borderColor = '#e9ecef')}
                                                    >
                                                        {isLessonCompleted && <CheckCircle size={14} />}
                                                        {l.title}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ACTIONS CARD */}
                    <div style={{ position: isMobile ? 'static' : 'sticky', top: '6rem' }}>
                        <div style={{ background: '#fff', borderRadius: '32px', padding: '3rem', textAlign: 'center', border: '1px solid #e9ecef', boxShadow: '0 30px 60px rgba(0,0,0,0.05)' }}>
                            <div style={{ width: '100%', aspectRatio: '1', background: '#f8f9fa', borderRadius: '24px', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Award size={100} color="var(--primary-color)" style={{ opacity: 0.3 }} />
                            </div>
                            
                            {!isEnrolled ? (
                                <>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1a1d23', marginBottom: '1.5rem' }}>
                                        {fiatPrice === 0 ? 'FREE' : `₦${fiatPrice.toLocaleString()}`}
                                    </div>
                                    <button 
                                        disabled={loading}
                                        onClick={() => onEnroll(course)} 
                                        style={{ 
                                            width: '100%', 
                                            background: 'var(--primary-color)', 
                                            color: '#fff',
                                            padding: '1.2rem', 
                                            fontSize: '1.1rem',
                                            fontWeight: '800',
                                            borderRadius: '16px',
                                            border: 'none',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.2)'
                                        }}
                                    >
                                        {loading ? 'Processing...' : 'Enroll Now'}
                                    </button>
                                </>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#adb5bd', letterSpacing: '1px' }}>MASTERY PROGRESS</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary-color)' }}>{completedLessonsCount} <span style={{ fontSize: '1rem', color: '#dee2e6' }}>/</span> {totalLessonsCount}</div>
                                    <div style={{ width: '100%', height: '8px', background: '#f8f9fa', borderRadius: '100px', overflow: 'hidden' }}>
                                        <div style={{ width: `${(completedLessonsCount / (totalLessonsCount || 1)) * 100}%`, height: '100%', background: 'var(--primary-color)', borderRadius: '100px', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                                    </div>

                                    {isFullyCompleted && !certificate && (
                                        <button 
                                            disabled={loading}
                                            onClick={() => onComplete(course.id)} 
                                            style={{ width: '100%', background: 'var(--success)', color: '#fff', padding: '1.2rem', fontWeight: '800', borderRadius: '16px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2)' }}
                                        >
                                            GENERATE CERTIFICATE
                                        </button>
                                    )}

                                    {isFullyCompleted && certificate && certificate.status !== 'claimed' && (
                                        <button 
                                            disabled={loading}
                                            onClick={() => onClaim(certificate.id)} 
                                            style={{ width: '100%', background: 'var(--primary-color)', color: '#fff', padding: '1.2rem', fontWeight: '800', borderRadius: '16px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(79, 70, 229, 0.2)' }}
                                        >
                                            CLAIM NFT CERTIFICATE
                                        </button>
                                    )}
                                    {certificate?.status === 'claimed' && (
                                        <div style={{ padding: '1rem', background: 'rgba(57, 255, 20, 0.05)', border: '1.5px solid #39ff14', borderRadius: '16px', color: '#2ecc71', fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                            <Shield size={18} /> NFT CERTIFICATE CLAIMED
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* COMPLETION MODAL */}
            {showCompletionModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', background: '#fff', color: '#1a1d23', position: 'relative' }}>
                        <button onClick={() => setShowCompletionModal(false)} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#868e96' }}><X size={24} /></button>
                        
                        <div style={{ width: '100px', height: '100px', background: 'var(--success)', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', margin: '0 auto 2.5rem' }}>
                            <Award size={56} />
                        </div>

                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>MASTERY ACHIEVED</h2>
                        <p style={{ color: '#495057', fontSize: '1.1rem', marginBottom: '3rem', lineHeight: 1.6 }}>
                            You have successfully integrated all knowledge nodes within <strong>{course.title}</strong>. 
                            The blockchain is ready to recognize your protocol mastery.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button 
                                onClick={() => {
                                    onComplete(course.id);
                                    setShowCompletionModal(false);
                                }}
                                style={{ width: '100%', background: 'var(--primary-color)', color: '#fff', padding: '1.5rem', borderRadius: '18px', border: 'none', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 20px 40px rgba(79, 70, 229, 0.2)' }}
                            >
                                GENERATE MASTER SHARD
                            </button>
                            <button 
                                onClick={() => setShowCompletionModal(false)}
                                style={{ width: '100%', background: 'transparent', color: '#868e96', padding: '1.2rem', borderRadius: '18px', border: '1px solid #e9ecef', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer' }}
                            >
                                REVIEW CURRICULUM
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default CourseView;
