import React, { useState } from 'react';
import { X, Upload, Sparkles, Target, Zap, Book, ArrowRight, Loader2 } from 'lucide-react';

const BubbleGenesisModal = ({ isOpen, onClose, onGenesis }) => {
    const [concept, setConcept] = useState('');
    const [masteryGoal, setMasteryGoal] = useState('strategic'); // strategic, technical, practical
    const [file, setFile] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!concept && !file) return;
        
        setIsGenerating(true);
        try {
            const formData = new FormData();
            formData.append('concept', concept);
            formData.append('learning_style', masteryGoal);
            if (file) formData.append('source_file', file);

            const response = await fetch('http://localhost:8000/api/study-bubbles/generate/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                },
                body: formData
            });

            if (response.ok) {
                const newBubble = await response.json();
                onGenesis(newBubble);
                onClose();
            }
        } catch (error) {
            console.error('Genesis failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(10, 11, 14, 0.85)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '650px',
                background: '#1a1d23',
                borderRadius: '40px',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '3rem',
                position: 'relative',
                boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
                animation: 'modalSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <button 
                    onClick={onClose}
                    style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>

                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--primary-color)', fontWeight: '800', fontSize: '0.85rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                        <Sparkles size={16} /> Synthesis Chamber
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', letterSpacing: '-1px' }}>Genesis Bubble</h2>
                    <p style={{ color: '#888', marginTop: '0.5rem' }}>Define a concept or provide a source to expand your mastery ecosystem.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* INPUT AREA */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#555', marginBottom: '0.8rem', textTransform: 'uppercase' }}>Concept or Objective</label>
                        <textarea 
                            value={concept}
                            onChange={(e) => setConcept(e.target.value)}
                            placeholder="e.g. The impact of L2 scaling on Ethereum's security model..."
                            style={{
                                width: '100%',
                                height: '120px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '24px',
                                padding: '1.5rem',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none',
                                resize: 'none',
                                transition: 'all 0.3s'
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--primary-color)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>

                    {/* FILE UPLOAD */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#555', marginBottom: '0.8rem', textTransform: 'uppercase' }}>Source Materials</label>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '1rem 1.5rem',
                                background: file ? 'rgba(46, 204, 113, 0.1)' : 'rgba(255,255,255,0.03)',
                                border: `1px dashed ${file ? '#2ecc71' : 'rgba(255,255,255,0.2)'}`,
                                borderRadius: '18px',
                                cursor: 'pointer',
                                color: file ? '#2ecc71' : '#888',
                                fontSize: '0.9rem',
                                fontWeight: '700'
                            }}>
                                <Upload size={18} />
                                {file ? file.name : 'Upload PDF or TXT'}
                                <input type="file" onChange={handleFileChange} hidden accept=".pdf,.txt" />
                            </label>
                        </div>
                    </div>

                    {/* MASTERY MODE */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#555', marginBottom: '0.8rem', textTransform: 'uppercase' }}>Mastery Mode</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
                            {[
                                { id: 'strategic', label: 'Strategic', icon: <Target size={16} />, desc: 'Core patterns' },
                                { id: 'technical', label: 'Technical', icon: <Zap size={16} />, desc: 'Deep dive' },
                                { id: 'practical', label: 'Practical', icon: <Book size={16} />, desc: 'Build focus' }
                            ].map(mode => (
                                <button
                                    key={mode.id}
                                    onClick={() => setMasteryGoal(mode.id)}
                                    style={{
                                        padding: '1.2rem',
                                        borderRadius: '20px',
                                        border: '1px solid',
                                        borderColor: masteryGoal === mode.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                                        background: masteryGoal === mode.id ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                                        color: masteryGoal === mode.id ? 'var(--primary-color)' : '#888',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <div style={{ marginBottom: '0.5rem' }}>{mode.icon}</div>
                                    <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{mode.label}</div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{mode.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleSubmit}
                        disabled={isGenerating || (!concept && !file)}
                        style={{
                            marginTop: '1rem',
                            padding: '1.5rem',
                            background: isGenerating ? 'rgba(79, 70, 229, 0.5)' : 'var(--primary-color)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '24px',
                            fontWeight: '900',
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            cursor: isGenerating ? 'not-allowed' : 'pointer',
                            boxShadow: '0 20px 40px rgba(79, 70, 229, 0.3)'
                        }}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 size={24} className="animate-spin" />
                                SYNTHESIZING KNOWLEDGE...
                            </>
                        ) : (
                            <>
                                BEGIN SYNTHESIS <ArrowRight size={24} />
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes modalSlideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}} />
        </div>
    );
};

export default BubbleGenesisModal;
