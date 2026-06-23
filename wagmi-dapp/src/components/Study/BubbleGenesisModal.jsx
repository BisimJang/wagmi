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
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
            fontFamily: "'Poppins', sans-serif"
        }}>
            <div style={{
                width: '100%',
                maxWidth: '820px',
                background: '#fff',
                borderRadius: '16px',
                border: '1.5px solid #0d0d0d',
                padding: '3rem',
                position: 'relative',
                boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
                animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <button 
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#888', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#0d0d0d'}
                    onMouseLeave={e => e.currentTarget.style.color = '#888'}
                >
                    <X size={24} />
                </button>

                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontWeight: '600', fontSize: '11px', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                        <Sparkles size={14} /> Study Workspace
                    </div>
                    <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#0d0d0d', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Create Study Bubble</h2>
                    <p style={{ color: '#666', marginTop: '0.6rem', fontSize: '13px', lineHeight: 1.6, maxWidth: '500px' }}>Define a topic or provide source materials to generate your AI-guided study session.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* LEFT COLUMN: Input & Upload */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Concept or Objective</label>
                            <textarea 
                                value={concept}
                                onChange={(e) => setConcept(e.target.value)}
                                placeholder="e.g. Principles of Thermodynamics, History of Rome, Intro to Machine Learning..."
                                style={{
                                    width: '100%',
                                    height: '110px',
                                    background: '#fff',
                                    border: '1.5px solid #e0e0e0',
                                    borderRadius: '12px',
                                    padding: '1rem 1.2rem',
                                    color: '#0d0d0d',
                                    fontSize: '13px',
                                    fontFamily: "'Poppins', sans-serif",
                                    outline: 'none',
                                    resize: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = '#0d0d0d'}
                                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source Materials</label>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '1rem 1.2rem',
                                background: file ? '#f0fdf4' : '#fafafa',
                                border: file ? '1.5px solid #3EC636' : '1.5px dashed #ccc',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                color: file ? '#16a34a' : '#666',
                                fontSize: '13px',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { if (!file) { e.currentTarget.style.borderColor = '#0d0d0d'; e.currentTarget.style.color = '#0d0d0d'; } }}
                            onMouseLeave={e => { if (!file) { e.currentTarget.style.borderColor = '#ccc'; e.currentTarget.style.color = '#666'; } }}
                            >
                                <Upload size={16} />
                                {file ? file.name : 'Upload PDF or TXT'}
                                <input type="file" onChange={handleFileChange} hidden accept=".pdf,.txt" />
                            </label>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Mode & Action */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'space-between' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Study Mode</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                {[
                                    { id: 'strategic', label: 'Conceptual', icon: <Target size={14} />, desc: 'Core ideas' },
                                    { id: 'technical', label: 'Technical', icon: <Zap size={14} />, desc: 'Deep dive' },
                                    { id: 'practical', label: 'Practical', icon: <Book size={14} />, desc: 'Application' }
                                ].map(mode => (
                                    <button
                                        key={mode.id}
                                        onClick={() => setMasteryGoal(mode.id)}
                                        style={{
                                            padding: '1rem 0.6rem',
                                            borderRadius: '12px',
                                            border: '1.5px solid',
                                            borderColor: masteryGoal === mode.id ? '#0d0d0d' : '#e0e0e0',
                                            background: masteryGoal === mode.id ? '#fafafa' : '#fff',
                                            color: masteryGoal === mode.id ? '#0d0d0d' : '#888',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            fontFamily: "'Poppins', sans-serif"
                                        }}
                                        onMouseEnter={e => { if (masteryGoal !== mode.id) { e.currentTarget.style.borderColor = '#ccc'; e.currentTarget.style.color = '#444'; } }}
                                        onMouseLeave={e => { if (masteryGoal !== mode.id) { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.color = '#888'; } }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>{mode.icon}</div>
                                        <div style={{ fontWeight: '600', fontSize: '12px', marginBottom: '2px' }}>{mode.label}</div>
                                        <div style={{ fontSize: '10px', color: '#999', lineHeight: 1.2 }}>{mode.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={handleSubmit}
                            disabled={isGenerating || (!concept && !file)}
                            style={{
                                padding: '16px',
                                background: isGenerating ? '#333' : '#0d0d0d',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '100px',
                                fontWeight: '600',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                cursor: isGenerating || (!concept && !file) ? 'not-allowed' : 'pointer',
                                opacity: (!concept && !file) ? 0.5 : 1,
                                transition: 'opacity 0.2s, transform 0.2s',
                                fontFamily: "'Poppins', sans-serif",
                                marginTop: 'auto'
                            }}
                            onMouseEnter={e => { if (!isGenerating && (concept || file)) e.currentTarget.style.opacity = 0.8; }}
                            onMouseLeave={e => { if (!isGenerating && (concept || file)) e.currentTarget.style.opacity = 1; }}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    GENERATING...
                                </>
                            ) : (
                                <>
                                    Create Bubble <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes modalSlideUp {
                    from { transform: translateY(20px); opacity: 0; }
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
