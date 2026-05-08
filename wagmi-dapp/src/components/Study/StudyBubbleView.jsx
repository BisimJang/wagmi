import React, { useState } from 'react';
import { ArrowLeft, Book, Play, Target, CheckCircle, Video, MessageSquare, Headphones, Share2, Sparkles, Zap, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const StudyBubbleView = ({ bubble, onBack }) => {
    const [activeNodeIndex, setActiveNodeIndex] = useState(0);

    if (!bubble) return null;

    const activeNode = bubble.content[activeNodeIndex];

    return (
        <div style={{ 
            height: '100vh', 
            background: '#0a0b0e', 
            color: '#fff', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* IMMERSIVE HEADER */}
            <header style={{ 
                padding: '1.5rem 3rem', 
                borderBottom: '1px solid rgba(255,255,255,0.05)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'rgba(10, 11, 14, 0.5)',
                backdropFilter: 'blur(20px)',
                zIndex: 10
            }}>
                <button 
                    onClick={onBack}
                    style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '0.9rem' }}
                >
                    <ArrowLeft size={18} /> BACK TO ECOSYSTEM
                </button>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Synthesized mastery
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{bubble.title}</div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Share2 size={18} />
                    </button>
                </div>
            </header>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* PATH NAVIGATION (LEFT SIDE) */}
                <div style={{ 
                    width: '320px', 
                    borderRight: '1px solid rgba(255,255,255,0.05)', 
                    padding: '2rem', 
                    overflowY: 'auto',
                    background: 'rgba(255,255,255,0.01)'
                }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>Mastery Path</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {bubble.content.map((node, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setActiveNodeIndex(i)}
                                    style={{
                                        padding: '1.2rem',
                                        borderRadius: '20px',
                                        border: '1px solid',
                                        borderColor: activeNodeIndex === i ? 'var(--primary-color)' : 'transparent',
                                        background: activeNodeIndex === i ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                                        color: activeNodeIndex === i ? '#fff' : '#666',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}
                                >
                                    <div style={{ 
                                        width: '28px', 
                                        height: '28px', 
                                        borderRadius: '8px', 
                                        background: activeNodeIndex === i ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', 
                                        color: activeNodeIndex === i ? '#fff' : '#555',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.8rem',
                                        fontWeight: '900'
                                    }}>
                                        {i + 1}
                                    </div>
                                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{node.title}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {bubble.video_refs?.length > 0 && (
                        <div>
                            <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>Extended Vision</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {bubble.video_refs.map((video, i) => (
                                    <a 
                                        key={i}
                                        href={video.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '16px',
                                            background: 'rgba(255,255,255,0.03)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            textDecoration: 'none',
                                            color: '#888',
                                            fontSize: '0.85rem',
                                            transition: 'all 0.3s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    >
                                        <div style={{ color: 'var(--primary-color)' }}><Video size={18} /></div>
                                        <div style={{ fontWeight: '700', flex: 1 }}>{video.title}</div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ACTIVE NODE FOCUS (CENTER) */}
                <div style={{ flex: 1, padding: '4rem', overflowY: 'auto', position: 'relative' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        {activeNode ? (
                            <div style={{ animation: 'fadeIn 0.5s ease' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary-color)', fontWeight: '800', fontSize: '0.9rem', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
                                    <Zap size={18} fill="currentColor" /> Node Synthesis {activeNodeIndex + 1}
                                </div>
                                <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '2.5rem', lineHeight: '1.1' }}>{activeNode.title}</h2>
                                
                                <div className="prose" style={{ fontSize: '1.25rem', lineHeight: '1.8', color: '#ccc', marginBottom: '4rem' }}>
                                    <ReactMarkdown>{activeNode.body}</ReactMarkdown>
                                </div>

                                {/* MASTERY CHALLENGE CARD */}
                                <div style={{ 
                                    background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                                    borderRadius: '32px',
                                    padding: '3rem',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}><Target size={120} /></div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontWeight: '900', fontSize: '0.85rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        <Target size={18} /> Mastery Challenge
                                    </div>
                                    <h4 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', color: '#fff' }}>Proof of Understanding</h4>
                                    <p style={{ color: '#aaa', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
                                        {activeNode.mastery_challenge || "Synthesis pending..."}
                                    </p>
                                    <button style={{ 
                                        padding: '1rem 2rem', 
                                        borderRadius: '16px', 
                                        background: '#fff', 
                                        color: '#000', 
                                        border: 'none', 
                                        fontWeight: '800', 
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        INTERNALIZE NODE <CheckCircle size={18} />
                                    </button>
                                </div>
                                
                                {/* NAVIGATION BUTTONS */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4rem', paddingBottom: '4rem' }}>
                                    {activeNodeIndex > 0 ? (
                                        <button 
                                            onClick={() => setActiveNodeIndex(prev => prev - 1)}
                                            style={{ background: 'none', border: '1px solid #333', color: '#666', padding: '1rem 2rem', borderRadius: '16px', fontWeight: '800', cursor: 'pointer' }}
                                        >
                                            Previous Node
                                        </button>
                                    ) : <div />}
                                    
                                    {activeNodeIndex < bubble.content.length - 1 ? (
                                        <button 
                                            onClick={() => setActiveNodeIndex(prev => prev + 1)}
                                            style={{ background: 'var(--primary-color)', border: 'none', color: '#fff', padding: '1rem 2.5rem', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            Next Node <ChevronRight size={18} />
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={onBack}
                                            style={{ background: '#2ecc71', border: 'none', color: '#fff', padding: '1rem 2.5rem', borderRadius: '16px', fontWeight: '800', cursor: 'pointer' }}
                                        >
                                            MASTERY COMPLETE
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '10rem 0' }}>
                                <div className="loader" style={{ marginBottom: '2rem' }}></div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Synthesizing Knowledge...</h3>
                            </div>
                        )}
                    </div>
                </div>

                {/* SIDEBAR (RIGHT SIDE) */}
                <div style={{ 
                    width: '380px', 
                    borderLeft: '1px solid rgba(255,255,255,0.05)', 
                    padding: '2.5rem',
                    background: 'rgba(0,0,0,0.2)'
                }}>
                    <div style={{ marginBottom: '3rem' }}>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>Synthesis Briefing</h4>
                        <div style={{ 
                            background: 'rgba(255,255,255,0.03)', 
                            borderRadius: '24px', 
                            padding: '1.5rem', 
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                    <Headphones size={24} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>Vera Audio Synthesis</div>
                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>Podcast duration: ~2:30</div>
                                </div>
                            </div>
                            <button style={{ width: '100%', padding: '1rem', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Play size={16} fill="currentColor" /> LISTEN NOW
                            </button>
                        </div>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>Growth Summary</h4>
                        <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.7', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {bubble.summary}
                        </p>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .loader {
                    width: 48px;
                    height: 48px;
                    border: 5px solid rgba(79, 70, 229, 0.1);
                    border-bottom-color: var(--primary-color);
                    border-radius: 50%;
                    display: inline-block;
                    animation: rotation 1s linear infinite;
                }
                @keyframes rotation {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}} />
        </div>
    );
};

export default StudyBubbleView;
