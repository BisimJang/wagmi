import React from 'react';
import LoadingSpinner from '../components/Feedback/LoadingSpinner';

const CourseView = ({ 
    course, 
    lessons,              
    lessonProgress,       
    enrollmentStatus, 
    loading, 
    onComplete, 
    onLessonComplete,
    onBack
}) => {
    if (!course) return null;

    const isEnrolled = enrollmentStatus === 'enrolled' || enrollmentStatus === 'completed';

    return (
        <section className="page active" style={{ padding: '0', background: 'var(--background)' }}>
            
            {/* HEROS HEADER BLOCK - GUMROAD STYLE */}
            <div style={{
                background: '#fff',
                borderBottom: '6px solid #000',
                padding: '4rem 1.5rem 3rem 1.5rem',
                textAlign: 'center',
                position: 'relative'
            }}>
                <button 
                    onClick={onBack} 
                    className="btn" 
                    style={{ 
                        position: 'absolute', 
                        top: '1rem', 
                        left: '1.5rem', 
                        background: '#000', 
                        color: 'var(--primary-color)',
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.85rem'
                    }}
                >
                    &larr; BACK
                </button>

                <div className="container" style={{ maxWidth: '800px' }}>
                    <h1 style={{ 
                        fontSize: '3rem',
                        fontWeight: '900', 
                        textTransform: 'uppercase', 
                        lineHeight: '1',
                        letterSpacing: '-1px',
                        marginBottom: '1rem',
                        marginTop: '2rem'
                    }}>
                        {course.name}
                    </h1>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
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
                            background: enrollmentStatus === 'completed' ? '#39ff14' : 'var(--primary-color)', 
                            color: '#000', 
                            padding: '0.3rem 0.6rem', 
                            border: '3px solid #000',
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            fontSize: '0.75rem'
                        }}>
                            {enrollmentStatus === 'completed' ? 'COMPLETED' : 'ENROLLED'}
                        </span>
                    </div>

                    <p style={{ 
                        fontSize: '0.9rem',
                        fontWeight: '600', 
                        maxWidth: '600px', 
                        margin: '0 auto',
                        lineHeight: '1.5'
                    }}>
                        {course.description}
                    </p>
                </div>
            </div>

            {/* MAIN CONTENT SPLIT */}
            <div className="container" style={{ maxWidth: '800px', paddingBottom: '6rem', paddingTop: '3rem' }}>
                
                {course.imageUrl && (
                    <div style={{ border: '6px solid #000', marginBottom: '2.25rem', background: '#000' }}>
                        <img 
                            src={course.imageUrl} 
                            alt={course.name} 
                            style={{ width: '100%', height: 'auto', display: 'block', filter: 'grayscale(100%) contrast(150%)' }} 
                        />
                    </div>
                )}

                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-1px', marginBottom: '1.5rem', borderBottom: '4px solid #000', paddingBottom: '0.5rem' }}>
                    COURSE MATERIAL
                </h2>

                {!isEnrolled && (
                     <div style={{ background: '#000', color: '#ff0000', padding: '1.15rem', border: '3px solid #000', marginBottom: '1.5rem' }}>
                         <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase' }}>⚠️ UNAUTHORIZED ACCESS</h3>
                         <p style={{ marginTop: '0.5rem', color: '#fff', fontSize: '0.85rem' }}>You must be enrolled to view the full lesson content.</p>
                     </div>
                )}

                {/* LINEAR CURRICULUM FEED */}
                {isEnrolled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {lessons?.sort((a, b) => a.order - b.order).map((section, sectionIndex) => (
                            <article key={section.id} style={{ position: 'relative' }}>
                                {/* SECTION HEADER BLOCK */}
                                <div style={{ 
                                    background: 'var(--primary-color)', 
                                    border: '3px solid #000', 
                                    borderBottom: 'none',
                                    padding: '0.75rem 1.15rem',
                                    color: '#000'
                                }}>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: '900', textTransform: 'uppercase' }}>
                                        {section.title}
                                    </h3>
                                </div>

                                {/* LESSONS LIST IN THE SECTION */}
                                <div style={{ border: '3px solid #000', background: '#fff' }}>
                                    {section.lessons?.sort((a, b) => a.order - b.order).map((lesson, lessonIndex) => {
                                        const progress = lessonProgress?.[lesson.id] || {};
                                        const isCompleted = progress.completed;
                                        const isLast = lessonIndex === section.lessons.length - 1;

                                        return (
                                            <div key={lesson.id} style={{ 
                                                padding: '1.15rem', 
                                                borderBottom: isLast ? 'none' : '3px solid #000'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem' }}>
                                                    <h4 style={{ fontSize: '0.9rem', fontWeight: '900', textTransform: 'uppercase' }}>
                                                        {lesson.title}
                                                    </h4>
                                                    {isCompleted && (
                                                        <span style={{ background: '#000', color: 'var(--primary-color)', padding: '0.15rem 0.4rem', fontWeight: '900', border: '2px solid #000', fontSize: '0.7rem' }}>
                                                            COMPLETED ✓
                                                        </span>
                                                    )}
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                                                    {lesson.video_url && (
                                                        <div style={{ border: '3px solid #000', background: '#000', padding: '0', aspectRatio: '16/9' }}>
                                                            <iframe 
                                                                src={lesson.video_url} 
                                                                title={lesson.title} 
                                                                frameBorder="0" 
                                                                allowFullScreen
                                                                style={{ width: '100%', height: '100%', display: 'block' }}
                                                            ></iframe>
                                                        </div>
                                                    )}

                                                    {lesson.image_url && (
                                                        <div style={{ border: '3px solid #000' }}>
                                                            <img 
                                                                src={lesson.image_url} 
                                                                alt={lesson.title} 
                                                                style={{ width: '100%', display: 'block', filter: 'grayscale(100%) contrast(150%)' }} 
                                                            />
                                                        </div>
                                                    )}

                                                    {lesson.content && (
                                                        <div style={{ 
                                                            fontSize: '0.85rem', 
                                                            lineHeight: '1.6', 
                                                            fontWeight: '600', 
                                                            borderLeft: '3px solid var(--primary-color)',
                                                            background: '#fafafa',
                                                            padding: '1.15rem'
                                                        }}>
                                                            {lesson.content}
                                                        </div>
                                                    )}

                                                    {/* ACTION BAR FOR LESSON */}
                                                    {!isCompleted && (
                                                        <div style={{ marginTop: '0.5rem' }}>
                                                            <button 
                                                                onClick={() => onLessonComplete(lesson.id)}
                                                                className="btn-secondary"
                                                                disabled={loading}
                                                                style={{ width: '100%', textAlign: 'center', padding: '0.6rem', fontSize: '0.85rem' }}
                                                            >
                                                                {loading ? <LoadingSpinner /> : 'MARK LESSON COMPLETE'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* FINAL COMPLETE BUTTON AT THE BOTTOM OF THE FEED */}
                {isEnrolled && enrollmentStatus !== 'completed' && (
                    <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2.25rem', background: '#000', color: '#fff', border: '3px solid #000' }}>
                        <h2 style={{ fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: '1.15rem' }}>Ready to Graduate?</h2>
                        <button 
                            onClick={() => onComplete(course.id)} 
                            className="btn"
                            disabled={loading}
                            style={{ padding: '0.9rem 2.25rem', fontSize: '0.9rem' }}
                        >
                            {loading ? <LoadingSpinner /> : 'FINALIZE & MINT CERTIFICATE'}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CourseView;
