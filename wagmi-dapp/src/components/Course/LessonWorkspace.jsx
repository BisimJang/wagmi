import React, { useState, useEffect } from 'react';
import { ArrowLeft, Video, Book, PenTool, Bot, Plus, X, ChevronRight, Send, List, MessageSquare, BookOpen, Notebook, Play, Pause, Volume2, Music, Eye, Headphones, FileText, Sparkles } from 'lucide-react';
import { useStudyVerseAI } from '../../shared-hooks/useStudyVerseAI';
import ReactMarkdown from 'react-markdown';

const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    return url;
};

const LessonWorkspace = ({ lesson, isCompleted, onClose, onNext, onLessonComplete, projectGoal }) => {
    const { askVera, isLoading: aiLoading } = useStudyVerseAI();
    const [notesText, setNotesText] = useState("");
    const [activeTab, setActiveTab] = useState('content'); 
    const [mediaType, setMediaType] = useState('article'); 
    const [chatHistory, setChatHistory] = useState([]);
    const [aiInput, setAiInput] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [isToolPanelOpen, setIsToolPanelOpen] = useState(!window.innerWidth <= 1024);

    const handleCompleteAction = async () => {
        if (!isCompleted && onLessonComplete) {
            await onLessonComplete(lesson.id);
        }
        onNext();
    };

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (lesson?.video_url && lesson.video_url.length > 10) setMediaType('video');
        else if (lesson?.audio_url && lesson.audio_url.length > 10) setMediaType('audio');
        else setMediaType('article');

        setChatHistory([
            { role: 'vera', content: projectGoal 
                ? `[MASTERY ENGINE ACTIVE]\nTo reach your goal of **${projectGoal}**, mastering **${lesson?.title}** is a critical node.`
                : `[AI SYSTEM READY]\nI am Vera, your Study Verse mentor. How can I assist you with your mastery of **${lesson?.title}** today?` 
            }
        ]);
    }, [lesson, projectGoal]);

    useEffect(() => {
        const savedNotes = localStorage.getItem(`studyverse_notes_${lesson?.id}`);
        if (savedNotes) setNotesText(savedNotes);
    }, [lesson]);

    const handleSendAI = async () => {
        if (!aiInput.trim() || aiLoading) return;
        const userMsg = aiInput;
        setAiInput("");
        setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        const response = await askVera(userMsg, lesson.title, projectGoal);
        if (response?.response_text) setChatHistory(prev => [...prev, { role: 'vera', content: response.response_text }]);
    };

    const handleNotesChange = (e) => {
        setNotesText(e.target.value);
        localStorage.setItem(`studyverse_notes_${lesson.id}`, e.target.value);
    };

    if (!lesson) return null;

    const hasVideo = lesson?.video_url && lesson.video_url.length > 10 && !lesson.video_url.includes('placeholder');
    const hasAudio = lesson?.audio_url && lesson.audio_url.length > 10;
    const hasArticle = lesson?.content && lesson.content.length > 0;

    return (
        <div style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            background: isMobile ? '#fff' : '#f8f9fa',
            position: 'relative',
            overflow: 'hidden',
            padding: isMobile ? '0' : '1.5rem'
        }}>
            {/* COMMAND CENTER (PLUS BUTTON) */}
            <button 
                onClick={() => {
                    setIsToolPanelOpen(!isToolPanelOpen);
                    // On mobile, if we open tools, switch to AI by default
                    if (!isToolPanelOpen && isMobile) setActiveTab('ai');
                }}
                style={{
                    position: 'absolute',
                    right: isMobile ? '1.5rem' : '2.5rem',
                    bottom: isMobile ? '1.5rem' : '2.5rem',
                    width: isMobile ? '56px' : '64px',
                    height: isMobile ? '56px' : '64px',
                    background: 'var(--primary-color)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 300,
                    boxShadow: '0 10px 30px rgba(79, 70, 229, 0.4)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isToolPanelOpen ? 'rotate(45deg)' : 'rotate(0)'
                }}
            >
                <Plus size={isMobile ? 28 : 32} />
            </button>

            {/* WORKSPACE HEADER */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: isMobile ? '1rem' : '1rem 2.5rem',
                background: '#fff',
                borderBottom: '1px solid #e9ecef',
                zIndex: 100
            }}>
                <button 
                    onClick={onClose}
                    style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.8rem',
                        color: '#495057',
                        fontWeight: '700',
                        fontSize: '0.9rem'
                    }}
                >
                    <ArrowLeft size={18} /> BACK TO SYLLABUS
                </button>
                {!isMobile && (
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1a1d23' }}>
                        {lesson?.title}
                    </div>
                )}
                <div style={{ width: '100px' }} /> {/* Spacer */}
            </div>

            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                background: '#fff',
                borderRadius: isMobile ? '0' : '32px',
                border: isMobile ? 'none' : '1px solid #e9ecef',
                boxShadow: isMobile ? 'none' : '0 20px 50px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                position: 'relative'
            }}>
                {/* Stage Area */}
                <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    overflowY: 'auto',
                    background: '#fff',
                    position: 'relative'
                }}>
                    {/* LESSON CONTENT VIEW */}
                    <div style={{ padding: isMobile ? '1.5rem' : '3rem', paddingBottom: '100px', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{ background: '#f1f3f5', padding: '6px', borderRadius: '16px', display: 'inline-flex', gap: '4px' }}>
                                {hasVideo && <button onClick={() => setMediaType('video')} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', background: mediaType === 'video' ? '#fff' : 'transparent', color: mediaType === 'video' ? 'var(--primary-color)' : '#868e96' }}><Eye size={16} /> WATCH</button>}
                                {hasAudio && <button onClick={() => setMediaType('audio')} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', background: mediaType === 'audio' ? '#fff' : 'transparent', color: mediaType === 'audio' ? 'var(--primary-color)' : '#868e96' }}><Headphones size={16} /> LISTEN</button>}
                                {hasArticle && <button onClick={() => setMediaType('article')} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', background: mediaType === 'article' ? '#fff' : 'transparent', color: mediaType === 'article' ? 'var(--primary-color)' : '#868e96' }}><FileText size={16} /> READ</button>}
                            </div>
                        </div>

                        <div style={{ minHeight: '400px' }}>
                            {mediaType === 'video' && hasVideo && (
                                <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}>
                                    <iframe src={getEmbedUrl(lesson.video_url)} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
                                </div>
                            )}
                            {mediaType === 'audio' && hasAudio && (
                                <div style={{ padding: '4rem 2rem', background: '#f8f9fa', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', border: '1px solid #e9ecef', textAlign: 'center' }}>
                                    <div style={{ width: '100px', height: '100px', background: 'var(--primary-color)', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Music size={48} /></div>
                                    <audio controls style={{ width: '100%', maxWidth: '500px' }}><source src={lesson.audio_url} type="audio/mpeg" /></audio>
                                </div>
                            )}
                            {mediaType === 'article' && hasArticle && (
                                <div className="prose" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                                    <h1 style={{ fontSize: isMobile ? '2rem' : '3.2rem', fontWeight: '800', color: '#1a1d23', lineHeight: '1.1', marginBottom: '2rem' }}>{lesson.title}</h1>
                                    <div style={{ fontSize: '1.15rem', lineHeight: '1.9', color: '#444' }}>
                                        <ReactMarkdown>{lesson.content}</ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ borderTop: '1px solid #eee', paddingTop: '3rem', textAlign: 'center' }}>
                            <button onClick={handleCompleteAction} style={{ background: isCompleted ? '#2ecc71' : 'var(--primary-color)', color: '#fff', padding: '1.2rem 3.5rem', borderRadius: '18px', border: 'none', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer' }}>
                                {isCompleted ? 'CONTINUE JOURNEY' : 'COMPLETE MODULE'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tool Panel (Mobile Overlay or Desktop Side) */}
                <div style={{ 
                    width: isMobile ? '100%' : (isToolPanelOpen ? '420px' : '0px'), 
                    height: isMobile ? (isToolPanelOpen ? '80%' : '0') : '100%',
                    position: isMobile ? 'fixed' : 'relative',
                    bottom: isMobile ? 0 : 'auto',
                    left: isMobile ? 0 : 'auto',
                    borderLeft: (!isMobile && isToolPanelOpen) ? '1px solid #e9ecef' : 'none', 
                    borderTop: (isMobile && isToolPanelOpen) ? '1px solid #e9ecef' : 'none',
                    display: 'flex', 
                    flexDirection: 'column',
                    background: '#fff',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    zIndex: 250,
                    borderRadius: isMobile ? '32px 32px 0 0' : '0',
                    boxShadow: isMobile ? '0 -20px 50px rgba(0,0,0,0.1)' : 'none'
                }}>
                     <div style={{ display: 'flex', padding: '1.2rem', gap: '0.5rem', background: '#fff', borderBottom: '1px solid #e9ecef', minWidth: isMobile ? '100%' : '420px' }}>
                        <button onClick={() => setActiveTab('ai')} style={{ flex: 1, padding: '1rem', borderRadius: '14px', background: activeTab === 'ai' ? 'rgba(79, 70, 229, 0.08)' : 'transparent', color: activeTab === 'ai' ? 'var(--primary-color)' : '#868e96', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <Bot size={20} /> VERA AI
                        </button>
                        <button onClick={() => setActiveTab('notes')} style={{ flex: 1, padding: '1rem', borderRadius: '14px', background: activeTab === 'notes' ? 'rgba(79, 70, 229, 0.08)' : 'transparent', color: activeTab === 'notes' ? 'var(--primary-color)' : '#868e96', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <PenTool size={20} /> JOURNAL
                        </button>
                    </div>
                    <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', minWidth: isMobile ? '100%' : '420px' }}>
                        {activeTab === 'ai' ? (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    {chatHistory.map((m, i) => (
                                        <div key={i} style={{ 
                                            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', 
                                            maxWidth: '85%', 
                                            background: m.role === 'user' ? 'var(--primary-color)' : '#f8f9fa', 
                                            color: m.role === 'user' ? '#fff' : '#495057', 
                                            padding: '1.2rem', 
                                            borderRadius: '20px', 
                                            fontSize: '0.9rem', 
                                            border: m.role === 'user' ? 'none' : '1px solid #e9ecef', 
                                            whiteSpace: 'pre-wrap' 
                                        }}>
                                            <ReactMarkdown>{m.content}</ReactMarkdown>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', background: '#fff', border: '1.5px solid #e9ecef', borderRadius: '18px', padding: '6px', marginBottom: isMobile ? '2rem' : '0' }}>
                                    <input 
                                        id="vera-ai-input"
                                        name="vera-ai-input"
                                        value={aiInput} 
                                        onChange={e => setAiInput(e.target.value)} 
                                        onKeyDown={e => e.key === 'Enter' && handleSendAI()} 
                                        placeholder="Consult Vera..." 
                                        style={{ flex: 1, border: 'none', padding: '1rem', outline: 'none' }} 
                                    />
                                    <button onClick={handleSendAI} style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', width: '48px', height: '48px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Send size={20} /></button>
                                </div>
                            </div>
                        ) : (
                            <textarea 
                                id="lesson-journal-notes"
                                name="lesson-journal-notes"
                                value={notesText} 
                                onChange={handleNotesChange} 
                                style={{ width: '100%', height: '100%', minHeight: '300px', background: '#fff', border: '1.5px solid #e9ecef', padding: '2rem', borderRadius: '20px', resize: 'none', outline: 'none', marginBottom: isMobile ? '2rem' : '0' }} 
                                placeholder="Your insights..." 
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonWorkspace;
