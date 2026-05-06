// src/components/Auth/MasterySetupModal.jsx
import React, { useState } from 'react';
import { Target, Zap, Rocket, X } from 'lucide-react';

const MasterySetupModal = ({ isOpen, onClose, onSave }) => {
    const [goal, setGoal] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        if (goal.trim()) {
            onSave(goal);
            onClose();
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)'
        }}>
            <div className="glass-panel" style={{ 
                width: '90%', maxWidth: '600px', padding: '4rem', 
                textAlign: 'center', position: 'relative',
                border: '1px solid rgba(79, 70, 229, 0.3)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <button 
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>

                <div style={{ background: 'rgba(79, 70, 229, 0.1)', width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem auto' }}>
                    <Target size={40} color="#a5b4fc" />
                </div>

                <h1 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '1.5rem', letterSpacing: '-1px' }}>Initialize Your Mastery</h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '3rem', lineHeight: '1.6' }}>
                    To personalize your engine, Vera needs to know your objective. What are you building?
                </p>

                <textarea 
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. A high-frequency trading bot, a sustainable fashion DAO..."
                    style={{ 
                        width: '100%', height: '150px', background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', 
                        padding: '1.5rem', color: '#fff', fontSize: '1.1rem', marginBottom: '2.5rem',
                        outline: 'none', resize: 'none'
                    }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button 
                        onClick={handleSave}
                        className="btn-premium"
                        style={{ width: '100%', background: 'var(--primary-color)', color: '#fff' }}
                    >
                        Initialize Engine &rarr;
                    </button>
                    <button 
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: '#444', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                        Skip for now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MasterySetupModal;
