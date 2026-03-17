// src/components/Layout/Footer.jsx

import React from 'react';

const Footer = ({ showPage }) => {
    return (
        <footer style={{
            background: '#000',
            color: '#fff',
            borderTop: '8px solid #000',
            padding: '6rem 2rem 4rem 2rem'
        }}>
            <div className="container" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '4rem',
                maxWidth: '1200px',
                marginBottom: '4rem'
            }}>
                {/* BRANDING */}
                <div>
                    <h2 style={{
                        fontSize: '3rem',
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        letterSpacing: '-2px',
                        marginBottom: '1rem',
                        color: 'var(--primary-color)'
                    }}>
                        STUDYVERSE
                    </h2>
                    <p style={{ fontSize: '1.2rem', fontWeight: '600', lineHeight: '1.6', marginBottom: '2rem' }}>
                        The decentralized network for creators and students.<br/>
                        Reject linear paths.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <a href="#" style={{ background: '#fff', color: '#000', padding: '0.5rem 1rem', fontWeight: '900', border: '4px solid #fff', textDecoration: 'none' }}>X / TWITTER</a>
                        <a href="#" style={{ background: '#fff', color: '#000', padding: '0.5rem 1rem', fontWeight: '900', border: '4px solid #fff', textDecoration: 'none' }}>DISCORD</a>
                    </div>
                </div>

                {/* NAVIGATION */}
                <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '2rem', borderBottom: '4px solid #333', paddingBottom: '1rem' }}>
                        Network
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); showPage('courses'); }} style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', textDecoration: 'none' }}>Explore Modules</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); showPage('instructor'); }} style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', textDecoration: 'none' }}>Deploy Curriculum</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); showPage('certificates'); }} style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', textDecoration: 'none' }}>Verify Certificates</a></li>
                    </ul>
                </div>

                {/* NEWSLETTER */}
                <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '2rem', borderBottom: '4px solid #333', paddingBottom: '1rem' }}>
                        Stay Synced
                    </h3>
                    <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                        Get notified when new instructors mint content. No spam, just alpha.
                    </p>
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={(e) => e.preventDefault()}>
                        <input 
                            type="email" 
                            placeholder="YOUR EMAIL" 
                            style={{ 
                                padding: '1rem', 
                                border: '4px solid #fff', 
                                background: '#000', 
                                color: '#fff', 
                                fontSize: '1.2rem',
                                fontWeight: '600',
                                outline: 'none'
                            }} 
                        />
                        <button 
                            type="submit" 
                            style={{ 
                                padding: '1rem', 
                                background: 'var(--primary-color)', 
                                color: '#000', 
                                fontWeight: '900', 
                                fontSize: '1.2rem', 
                                border: '4px solid var(--primary-color)',
                                cursor: 'pointer',
                                textTransform: 'uppercase'
                            }}
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>

            {/* COPYRIGHT */}
            <div style={{ textAlign: 'center', borderTop: '4px solid #333', paddingTop: '2rem', fontSize: '1rem', fontWeight: '600', color: '#888' }}>
                &copy; {new Date().getFullYear()} Studyverse Protocol. All components open-source unless specified.
            </div>
        </footer>
    );
};

export default Footer;
