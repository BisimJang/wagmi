import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X } from 'lucide-react';
import { useStudyVerseAI } from '../../hooks/useStudyVerseAI';

const GlobalVeraModal = ({ isOpen, onClose, userName, position }) => {
    const { askVera, isLoading } = useStudyVerseAI();
    const [input, setInput] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'vera', content: '[GLOBAL AI ONLINE]\nI am Vera. Double-clicking the background summoned me. How can I assist you right now?' }
    ]);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory]);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg = input;
        setInput('');
        setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        
        const response = await askVera(userMsg, "Global Platform Context", userName || "User");
        if (response?.response_text) {
            setChatHistory(prev => [...prev, { role: 'vera', content: response.response_text }]);
        } else {
            setChatHistory(prev => [...prev, { role: 'vera', content: "I am experiencing network issues. Please ensure Central Intelligence is running." }]);
        }
    };

    return (
        <>
        <style>{`
            @keyframes bubblePop {
                0% { transform: scale(0.8) translateY(20px); opacity: 0; }
                50% { transform: scale(1.05) translateY(-5px); opacity: 1; }
                100% { transform: scale(1) translateY(0); opacity: 1; }
            }
        `}</style>
        <div style={{
            position: 'fixed',
            top: position ? `${Math.max(16, Math.min(position.y - 500, window.innerHeight - 500 - 16))}px` : 'auto',
            left: position ? `${Math.max(16, Math.min(position.x - 350, window.innerWidth - 350 - 16))}px` : 'auto',
            bottom: position ? 'auto' : '2rem',
            right: position ? 'auto' : '2rem',
            width: '350px',
            height: '500px',
            background: '#ffffff',
            border: '2px solid var(--primary-color)',
            borderRadius: '40px 40px 8px 40px',
            boxShadow: '0 20px 50px rgba(79, 70, 229, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'hidden',
            animation: 'bubblePop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            fontFamily: "'Poppins', sans-serif"
        }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', fontWeight: '800' }}>
                    <Bot size={20} />
                    VERA GLOBAL
                </div>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}>
                    <X size={20} />
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {chatHistory.map((msg, i) => (
                    <div key={i} style={{ 
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        background: msg.role === 'user' ? 'var(--primary-color)' : '#f5f5f5',
                        padding: '0.8rem 1rem',
                        borderRadius: '16px',
                        maxWidth: '85%',
                        color: msg.role === 'user' ? '#fff' : '#0d0d0d',
                        fontSize: '0.85rem',
                        lineHeight: '1.5',
                        borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                        borderBottomLeftRadius: msg.role === 'vera' ? '4px' : '16px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                    }}>
                        {msg.content}
                    </div>
                ))}
                {isLoading && (
                    <div style={{ alignSelf: 'flex-start', color: '#666', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        Vera is processing...
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div style={{ padding: '1.2rem', borderTop: '1px solid #eaeaea', display: 'flex', gap: '0.8rem', background: '#fff' }}>
                <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Ask Vera anything..."
                    style={{ 
                        flex: 1, 
                        padding: '1rem 1.2rem', 
                        background: '#fafafa', 
                        border: '1px solid #eaeaea', 
                        borderRadius: '100px', 
                        color: '#0d0d0d',
                        outline: 'none',
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '0.85rem'
                    }}
                />
                <button 
                    onClick={handleSend}
                    disabled={isLoading}
                    style={{ 
                        background: 'var(--primary-color)', 
                        border: 'none', 
                        color: '#fff', 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                    }}
                >
                    <Send size={18} style={{ marginLeft: '2px' }}/>
                </button>
            </div>
        </div>
        </>
    );
};

export default GlobalVeraModal;
