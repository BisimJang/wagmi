// src/components/Layout/Footer.jsx

import React from 'react';

const Footer = ({ showPage }) => {
    return (
        <footer style={{
            background: '#08080a',
            color: '#fff',
            padding: '8rem 2rem 4rem 2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
            <div className="container" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '4rem',
                maxWidth: '1200px',
                marginBottom: '6rem'
            }}>
                {/* BRANDING */}
                <div>
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(135deg, #fff 0%, var(--primary-color) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Study Verse
                    </h2>
                    <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: '1.7', marginBottom: '2rem' }}>
                        High-performance infrastructure for the next generation of decentralized learning.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <a href="#" style={{ 
                            background: 'rgba(255,255,255,0.05)', 
                            color: '#fff', 
                            padding: '0.6rem 1.2rem', 
                            fontWeight: '600', 
                            borderRadius: '100px', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            fontSize: '0.8rem'
                        }}>X / TWITTER</a>
                        <a href="#" style={{ 
                            background: 'rgba(255,255,255,0.05)', 
                            color: '#fff', 
                            padding: '0.6rem 1.2rem', 
                            fontWeight: '600', 
                            borderRadius: '100px', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            fontSize: '0.8rem'
                        }}>DISCORD</a>
                    </div>
                </div>

                {/* NAVIGATION */}
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.5rem', color: '#fff' }}>
                        Protocol
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); showPage('courses'); }} style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>The Grid</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); showPage('instructor'); }} style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>Studio</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); showPage('schools'); }} style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>Learning Engine</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); showPage('profile'); }} style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>Portfolio</a></li>
                    </ul>
                </div>

                {/* NEWSLETTER */}
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.5rem', color: '#fff' }}>
                        Intelligence
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                        Get the latest updates on protocol changes and new curriculum deployments.
                    </p>
                    <form style={{ display: 'flex', gap: '0.5rem' }} onSubmit={(e) => e.preventDefault()}>
                        <input 
                            type="email" 
                            placeholder="Email address" 
                            style={{ 
                                padding: '0.8rem 1.2rem', 
                                borderRadius: '100px',
                                border: '1px solid rgba(255,255,255,0.1)', 
                                background: 'rgba(255,255,255,0.03)', 
                                color: '#fff', 
                                fontSize: '0.9rem',
                                outline: 'none',
                                flex: 1
                            }} 
                        />
                        <button 
                            type="submit" 
                            style={{ 
                                padding: '0.8rem 1.5rem', 
                                background: 'var(--primary-color)', 
                                color: '#fff', 
                                fontWeight: '700', 
                                fontSize: '0.9rem', 
                                border: 'none',
                                borderRadius: '100px',
                                cursor: 'pointer'
                            }}
                        >
                            Join
                        </button>
                    </form>
                </div>
            </div>

            {/* COPYRIGHT */}
            <div style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: '500', color: '#444' }}>
                &copy; {new Date().getFullYear()} Study Verse Protocol. Sovereign Learning.
            </div>
        </footer>
    );
};

export default Footer;
