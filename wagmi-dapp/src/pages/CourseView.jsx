import React from 'react';
import { useAccount, useReadContract } from 'wagmi';
import LoadingSpinner from '../components/Feedback/LoadingSpinner';
import BrutalistButton from '../components/UI/BrutalistButton';
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

    return (
        <section className="page active" style={{ padding: '0', background: 'var(--background)' }}>
            
            {/* 1. TOP HEADER / BADGES */}
            <div style={{ padding: '3rem 1.5rem 0 1.5rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <span className="neon-block" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>INSTRUCTOR: {course.instructor_name || 'STUDYVERSE OWNER'}</span>
                    <span className="neon-block" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', background: '#fff' }}>DURATION: 8 WEEKS</span>
                    <span className="neon-block" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>LEVEL: ADVANCED</span>
                </div>

                <h1 style={{ 
                    fontSize: 'clamp(3rem, 10vw, 5.5rem)', 
                    fontWeight: '900', 
                    letterSpacing: '-4px', 
                    marginBottom: '2rem',
                    lineHeight: '0.9'
                }}>
                    {course.name.toUpperCase()}
                </h1>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    {!isEnrolled ? (
                        <BrutalistButton onClick={() => onEnroll(course)} style={{ background: 'var(--primary-color)', fontSize: '1.2rem' }}>
                            ENROLL NOW
                        </BrutalistButton>
                    ) : (
                        <div className="neon-block" style={{ padding: '0.8rem 1.6rem', fontSize: '1.2rem' }}>
                            ✓ ENROLLED
                        </div>
                    )}
                    <BrutalistButton style={{ background: '#fff', fontSize: '1.2rem' }}>
                        PREVIEW SYLLABUS
                    </BrutalistButton>
                </div>

                <div className="handwritten">
                    "DESTROY THE BOX BEFORE YOU TRY TO THINK OUTSIDE OF IT."
                </div>
            </div>

            {/* 2. HERO IMAGE & FLOATING OVERVIEW */}
            <div className="container" style={{ maxWidth: '1000px', marginTop: '4rem', position: 'relative' }}>
                <div className="brutalist-card" style={{ padding: '0', overflow: 'hidden', background: '#000' }}>
                    <img 
                        src={course.imageUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070'} 
                        alt="Hero" 
                        style={{ width: '100%', display: 'block', filter: 'grayscale(100%) contrast(120%)', opacity: 0.8 }}
                    />
                </div>
                
                {/* Floating Overview Card */}
                <div className="brutalist-card" style={{ 
                    position: 'absolute', 
                    bottom: '-2rem', 
                    right: '2rem', 
                    maxWidth: '350px', 
                    padding: '1.5rem',
                    zIndex: 10
                }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>COURSE OVERVIEW</h3>
                    <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.4' }}>
                        {course.description || "A deep dive into structural anarchy, deconstructionism, and the ethics of permanent structures in an impermanent world."}
                    </p>
                </div>
            </div>

            {/* 3. CURRICULUM FEED */}
            <div style={{ marginTop: '8rem', paddingBottom: '6rem' }}>
                {lessons?.sort((a, b) => a.order - b.order).map((section, sIdx) => (
                    <div key={section.id} style={{ marginBottom: '4rem' }}>
                        {/* MODULE HEADER */}
                        <div className="neon-block" style={{ 
                            padding: '1.5rem 0', 
                            fontSize: '2rem', 
                            textAlign: 'center', 
                            borderLeft: 'none', 
                            borderRight: 'none',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '4rem'
                        }}>
                            <span>MODULE {String(sIdx + 1).padStart(2, '0')}: {section.title.toUpperCase()}</span>
                            <span className="handwritten" style={{ color: '#000', marginTop: 0, fontSize: '1rem' }}>Essential Skills</span>
                        </div>

                        {/* LESSONS */}
                        <div className="container" style={{ maxWidth: '1000px', marginTop: '3rem' }}>
                            {isEnrolled ? (
                                section.lessons?.sort((a, b) => a.order - b.order).map((lesson, lIdx) => {
                                    const isCompleted = lessonProgress?.[lesson.id]?.completed;
                                    const isEven = lIdx % 2 === 0;

                                    return (
                                        <div key={lesson.id} style={{ 
                                            display: 'flex', 
                                            flexDirection: isEven ? 'row' : 'row-reverse',
                                            gap: '3rem',
                                            marginBottom: '4rem',
                                            alignItems: 'center',
                                            flexWrap: 'wrap'
                                        }}>
                                            {/* IMAGE / VIDEO SIDE */}
                                            <div style={{ flex: 1 }}>
                                                <div className="brutalist-card" style={{ padding: 0, overflow: 'hidden', background: '#000' }}>
                                                    {lesson.video_url ? (
                                                        <div style={{ aspectRatio: '16/9', width: '100%' }}>
                                                            <iframe 
                                                                src={getEmbedUrl(lesson.video_url)} 
                                                                title={lesson.title} 
                                                                frameBorder="0" 
                                                                allowFullScreen
                                                                style={{ width: '100%', height: '100%', display: 'block' }}
                                                            ></iframe>
                                                        </div>
                                                    ) : (
                                                        <img 
                                                            src={lesson.image_url || 'https://images.unsplash.com/photo-1518005020480-1a2fd6d52579?q=80&w=1964'} 
                                                            alt={lesson.title}
                                                            style={{ width: '100%', display: 'block', filter: 'grayscale(100%)' }}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* CONTENT SIDE */}
                                            <div style={{ flex: 1.5 }}>
                                                <div className="brutalist-card" style={{ padding: '2rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                        {isCompleted ? (
                                                            <span className="neon-block" style={{ fontSize: '0.6rem', padding: '0.2rem 0.5rem' }}>✓ COMPLETED</span>
                                                        ) : (
                                                            <span className="neon-block" style={{ fontSize: '0.6rem', padding: '0.2rem 0.5rem', background: '#000', color: 'var(--primary-color)' }}>◉ CURRENT</span>
                                                        )}
                                                        <span style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>14:20:00</span>
                                                    </div>
                                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{lesson.title.toUpperCase()}</h3>
                                                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.5rem' }}>
                                                        {lesson.content?.substring(0, 150) || "Understanding the brutalist movement's obsession with honesty in materials and the rejection of ornamentation."}...
                                                    </p>
                                                    <BrutalistButton 
                                                        onClick={() => onLessonComplete(lesson.id)}
                                                        style={{ background: '#000', color: '#fff', fontSize: '0.7rem' }}
                                                    >
                                                        {isCompleted ? 'REWATCH LESSON' : 'MARK COMPLETE'}
                                                    </BrutalistButton>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                /* LOCKED CONTENT VIEW */
                                <div className="locked-block" style={{ 
                                    padding: '5rem 2rem', 
                                    textAlign: 'center', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center',
                                    gap: '1.5rem'
                                }}>
                                    <div style={{ fontSize: '4rem' }}>🔒</div>
                                    <h2 style={{ fontSize: '2.5rem', color: '#ff0000', maxWidth: '600px' }}>LOCKED CONTENT: UNAUTHORIZED ACCESS</h2>
                                    <p style={{ color: '#fff', maxWidth: '500px', fontSize: '0.9rem' }}>
                                        ENROLLMENT IN '{course.name.toUpperCase()}' REQUIRED FOR DECRYPTING THIS SECTOR
                                    </p>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <BrutalistButton onClick={() => onEnroll(course)} style={{ background: '#ff0000', color: '#fff' }}>PURCHASE ACCESS</BrutalistButton>
                                        <BrutalistButton style={{ background: '#000', color: '#fff' }}>VIEW PREREQUISITES</BrutalistButton>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* 4. READY TO GRADUATE SECTION */}
            {isEnrolled && (
                <div style={{ background: '#222', color: '#fff', padding: '6rem 1.5rem', textAlign: 'center', borderTop: '6px solid #000' }}>
                    <div className="container" style={{ maxWidth: '800px' }}>
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

            {/* BACK BUTTON */}
            <BrutalistButton 
                onClick={onBack}
                style={{ position: 'fixed', bottom: '2rem', left: '2rem', background: '#000', color: '#fff', zIndex: 100 }}
            >
                &larr; EXIT STUDIO
            </BrutalistButton>

        </section>
    );
};

export default CourseView;

