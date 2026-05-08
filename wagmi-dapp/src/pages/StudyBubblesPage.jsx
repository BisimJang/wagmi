import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Search, BookOpen, Clock, AlertCircle, Play, CheckCircle2, MoreVertical, Trash2, ArrowUpRight, ArrowLeft } from 'lucide-react';
import BubbleGenesisModal from '../components/Study/BubbleGenesisModal';
import StudyBubbleView from '../components/Study/StudyBubbleView';

const StudyBubblesPage = ({ showPage }) => {
    const [bubbles, setBubbles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isGenesisOpen, setIsGenesisOpen] = useState(false);
    const [selectedBubble, setSelectedBubble] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);

    useEffect(() => {
        fetchBubbles();
    }, []);

    const fetchBubbles = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/study-bubbles/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}` 
                }
            });
            if (response.ok) {
                const data = await response.json();
                setBubbles(data);
            }
        } catch (error) {
            console.error('Error fetching bubbles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenesis = (newBubble) => {
        setBubbles(prev => [newBubble, ...prev]);
        setTimeout(fetchBubbles, 5000);
    };

    const deleteBubble = async (bubbleId, e) => {
        e.stopPropagation();
        setOpenMenuId(null);
        try {
            const response = await fetch(`http://localhost:8000/api/study-bubbles/${bubbleId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` }
            });
            if (response.ok || response.status === 204) {
                setBubbles(prev => prev.filter(b => b.id !== bubbleId));
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#2ecc71';
            case 'processing': return '#f1c40f';
            case 'failed': return '#e74c3c';
            default: return '#95a5a6';
        }
    };

    if (selectedBubble) {
        return <StudyBubbleView bubble={selectedBubble} onBack={() => setSelectedBubble(null)} />;
    }

    return (
        <section className="page" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
            {/* BACKGROUND DECORATION */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                right: '-10%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(79, 70, 229, 0.05) 0%, transparent 70%)',
                filter: 'blur(80px)',
                zIndex: -1
            }} />

            <div className="container">

                {/* SINGLE TOP BAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <button 
                        onClick={() => showPage('home')}
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', padding: '0.8rem 1.5rem', borderRadius: '16px', fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={18} /> BACK TO HOME
                    </button>

                    <button 
                        onClick={() => setIsGenesisOpen(true)}
                        style={{ padding: '1rem 2rem', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: '900', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(79, 70, 229, 0.3)' }}
                    >
                        <Plus size={22} /> GENESIS BUBBLE
                    </button>
                </div>

                {/* PAGE TITLE */}
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--primary-color)', fontWeight: '800', fontSize: '0.85rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                        <Sparkles size={16} /> Personalized Synthesis
                    </div>
                    <h1 className="gradient-text" style={{ fontSize: '4rem', fontWeight: '900', letterSpacing: '-2px', marginBottom: '1rem' }}>
                        Study Bubbles
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6' }}>
                        Your unique knowledge ecosystem. Upload concepts or files to synthesize custom learning nodes tailored to your mastery goals.
                    </p>
                </div>


                {/* MODAL */}
                <BubbleGenesisModal 
                    isOpen={isGenesisOpen} 
                    onClose={() => setIsGenesisOpen(false)} 
                    onGenesis={handleGenesis} 
                />

                {/* SEARCH & FILTERS */}
                <div style={{ marginBottom: '3rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                        <input 
                            type="text" 
                            placeholder="Search your knowledge ecosystem..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1.2rem 1.5rem 1.2rem 3.5rem',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '18px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none',
                                backdropFilter: 'blur(10px)'
                            }}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                        <div className="loader" />
                    </div>
                ) : bubbles.length === 0 ? (
                    <div style={{ 
                        padding: '6rem 2rem', 
                        textAlign: 'center', 
                        background: 'rgba(255,255,255,0.02)', 
                        borderRadius: '40px', 
                        border: '2px dashed rgba(255,255,255,0.05)',
                        marginTop: '2rem'
                    }}>
                        <div style={{ width: '80px', height: '80px', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'var(--primary-color)' }}>
                            <BookOpen size={40} />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>The ecosystem is silent.</h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto 2.5rem' }}>
                            You haven't synthesized any bubbles yet. Start by providing a concept or uploading a research paper.
                        </p>
                        <button style={{ color: 'var(--primary-color)', fontWeight: '800', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>
                            Synthesize your first node →
                        </button>
                    </div>
                ) : (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
                        gap: '2.5rem' 
                    }}>
                        {bubbles.map(bubble => (
                            <div 
                                key={bubble.id}
                                onClick={() => bubble.status === 'completed' && setSelectedBubble(bubble)}
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '32px',
                                    padding: '2rem',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    backdropFilter: 'blur(20px)',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-10px)';
                                    e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.3)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', gap: '1rem' }}>
                                    <div style={{ 
                                        padding: '0.5rem 1rem', 
                                        borderRadius: '100px', 
                                        background: `${getStatusColor(bubble.status)}15`, 
                                        color: getStatusColor(bubble.status),
                                        fontSize: '0.65rem',
                                        fontWeight: '900',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        flexShrink: 0
                                    }}>
                                        {bubble.status === 'processing' && <Clock size={12} />}
                                        {bubble.status === 'completed' && <CheckCircle2 size={12} />}
                                        {bubble.status === 'failed' && <AlertCircle size={12} />}
                                        {bubble.status}
                                    </div>
                                    <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.05)' }} />
                                    {/* ELLIPSIS MENU */}
                                    <div style={{ position: 'relative' }}>
                                        <button 
                                            onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === bubble.id ? null : bubble.id); }}
                                            style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '8px', display: 'flex' }}
                                        >
                                            <MoreVertical size={18} />
                                        </button>
                                        {openMenuId === bubble.id && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '110%',
                                                right: 0,
                                                background: '#1a1d23',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '16px',
                                                padding: '0.5rem',
                                                zIndex: 100,
                                                minWidth: '160px',
                                                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                                            }}>
                                                <button
                                                    onClick={e => deleteBubble(bubble.id, e)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.8rem 1.2rem',
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#e74c3c',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        borderRadius: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        textAlign: 'left'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(231, 76, 60, 0.1)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                                >
                                                    <Trash2 size={15} /> Delete Bubble
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '0.8rem', lineHeight: '1.2', color: '#fff' }}>{bubble.title}</h3>
                                <div style={{ color: bubble.status === 'failed' ? '#e74c3c' : '#888', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem', flex: 1, overflow: 'hidden' }}>
                                    {bubble.status === 'failed' ? (
                                        <div style={{ fontSize: '0.8rem', opacity: 0.8, background: 'rgba(231, 76, 60, 0.05)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(231, 76, 60, 0.1)' }}>
                                            <strong>Synthesis Error:</strong> {bubble.summary || bubble.concept}
                                        </div>
                                    ) : (
                                        <p style={{ display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {bubble.summary || bubble.concept}
                                        </p>
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                    <div style={{ color: '#444', fontSize: '0.8rem', fontWeight: '700' }}>
                                        {new Date(bubble.created_at).toLocaleDateString()}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {bubble.audio_url && <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}><Play size={16} /></div>}
                                        <div style={{ 
                                            width: '44px', 
                                            height: '44px', 
                                            borderRadius: '16px', 
                                            background: bubble.status === 'completed' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            color: '#fff' 
                                        }}>
                                            <ArrowUpRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .loader {
                    width: 48px;
                    height: 48px;
                    border: 5px solid rgba(79, 70, 229, 0.1);
                    border-bottom-color: var(--primary-color);
                    border-radius: 50%;
                    display: inline-block;
                    box-sizing: border-box;
                    animation: rotation 1s linear infinite;
                }
                @keyframes rotation {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}} />
        </section>
    );
};

export default StudyBubblesPage;
