// src/pages/HomePage_Premium.jsx

import React from 'react';

const HomePage_Premium = ({ stats, user, certificates, showPage }) => {
    return (
        <div style={{
            backgroundColor: '#0a0a0c',
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
            minHeight: '100vh',
            overflowX: 'hidden'
        }}>
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes pulse-glow {
                    0% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                    100% { opacity: 0.4; }
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    transition: all 0.3s ease;
                }
                .glass-card:hover {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(255, 255, 255, 0.2);
                    transform: translateY(-5px);
                }
                .gradient-text {
                    background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .hero-glow {
                    position: absolute;
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
                    top: -200px;
                    left: -100px;
                    pointer-events: none;
                    animation: pulse-glow 8s infinite ease-in-out;
                }
                .btn-premium {
                    background: #fff;
                    color: #000;
                    padding: 1rem 2.5rem;
                    border-radius: 100px;
                    font-weight: 700;
                    font-size: 1rem;
                    text-transform: none;
                    border: none;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
                    transition: all 0.2s;
                }
                .btn-premium:hover {
                    transform: scale(1.02);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.3);
                    background: #f0f0f0;
                }
                .btn-outline {
                    background: transparent;
                    color: #fff;
                    border: 1px solid rgba(255,255,255,0.2);
                    padding: 1rem 2.5rem;
                    border-radius: 100px;
                    font-weight: 700;
                    transition: all 0.2s;
                }
                .btn-outline:hover {
                    background: rgba(255,255,255,0.05);
                    border-color: #fff;
                }
            `}</style>

            {/* HERO SECTION */}
            <section style={{ 
                position: 'relative', 
                padding: '12rem 2rem 8rem 2rem', 
                textAlign: 'center',
                background: 'radial-gradient(circle at 50% 50%, rgba(30, 27, 75, 0.3) 0%, transparent 100%)'
            }}>
                <div className="hero-glow" />
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
                    <div style={{ 
                        display: 'inline-block', 
                        padding: '0.5rem 1.2rem', 
                        background: 'rgba(79, 70, 229, 0.1)', 
                        border: '1px solid rgba(79, 70, 229, 0.3)', 
                        borderRadius: '100px',
                        color: '#a5b4fc',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        marginBottom: '2rem',
                        letterSpacing: '0.5px'
                    }}>
                        STRATEGIC LEARNING INFRASTRUCTURE
                    </div>
                    
                    <h1 className="gradient-text" style={{ 
                        fontSize: 'clamp(3rem, 8vw, 5.5rem)', 
                        fontWeight: '900', 
                        lineHeight: '1', 
                        marginBottom: '2rem',
                        textTransform: 'none',
                        letterSpacing: '-2px'
                    }}>
                        The Study Verse <br/>API Learning Engine
                    </h1>
                    
                    <p style={{ 
                        fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', 
                        color: '#94a3b8', 
                        maxWidth: '700px', 
                        margin: '0 auto 3rem auto',
                        lineHeight: '1.6',
                        fontWeight: '500',
                        textTransform: 'none'
                    }}>
                        Build, scale, and verify sovereign education. <br/>
                        A high-performance protocol for creators and institutions.
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn-premium" onClick={() => showPage('courses')}>
                            Explore the Grid
                        </button>
                        <button className="btn-outline" onClick={() => showPage(user ? 'instructor' : 'profile')}>
                            Deploy Curriculum
                        </button>
                    </div>
                </div>
            </section>

            {/* THREE PILLAR MODEL */}
            <section style={{ padding: '8rem 2rem', background: '#08080a' }}>
                <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', textTransform: 'none' }}>The Three-Pillar Model</h2>
                        <p style={{ color: '#64748b', fontWeight: '500', fontSize: '1.1rem', textTransform: 'none' }}>A modular framework designed for momentum and verification.</p>
                    </div>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                        gap: '3rem',
                        alignItems: 'center'
                    }}>
                        {/* PILLAR 1: THE CORE */}
                        <div className="glass-card" style={{ 
                            padding: '4rem 2.5rem',
                            clipPath: 'polygon(0% 5%, 100% 0%, 95% 92%, 8% 100%)',
                            minHeight: '350px'
                        }}>
                            <div style={{ 
                                width: '48px', height: '48px', 
                                background: 'linear-gradient(135deg, #3b82f6, #2dd4bf)', 
                                borderRadius: '12px', marginBottom: '2rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)'
                            }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: '900' }}>01</span>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', textTransform: 'none' }}>The Core</h3>
                            <p style={{ color: '#94a3b8', lineHeight: '1.7', marginBottom: '0' }}>
                                Watch → Complete → Advance. A self-paced curriculum loop designed to maintain high-speed momentum.
                            </p>
                        </div>

                        {/* PILLAR 2: THE ENGINE */}
                        <div className="glass-card" style={{ 
                            padding: '4rem 2.5rem',
                            clipPath: 'polygon(10% 0%, 95% 8%, 100% 95%, 0% 88%)',
                            minHeight: '350px',
                            background: 'rgba(79, 70, 229, 0.08)',
                            border: '1px solid rgba(79, 70, 229, 0.2)'
                        }}>
                            <div style={{ 
                                width: '48px', height: '48px', 
                                background: 'linear-gradient(135deg, #a855f7, #ec4899)', 
                                borderRadius: '12px', marginBottom: '2rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 10px 20px rgba(168, 85, 247, 0.3)'
                            }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: '900' }}>02</span>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', textTransform: 'none' }}>The Engine</h3>
                            <p style={{ color: '#94a3b8', lineHeight: '1.7', marginBottom: '0' }}>
                                Study Verse API. Decouple content from logic. Host high-performance modules on any sovereign domain.
                            </p>
                        </div>

                        {/* PILLAR 3: THE RECORD */}
                        <div className="glass-card" style={{ 
                            padding: '4rem 2.5rem',
                            clipPath: 'polygon(5% 0%, 100% 12%, 92% 100%, 0% 95%)',
                            minHeight: '350px'
                        }}>
                            <div style={{ 
                                width: '48px', height: '48px', 
                                background: 'linear-gradient(135deg, #f97316, #eab308)', 
                                borderRadius: '12px', marginBottom: '2rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 10px 20px rgba(249, 115, 22, 0.3)'
                            }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: '900' }}>03</span>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', textTransform: 'none' }}>The Record</h3>
                            <p style={{ color: '#94a3b8', lineHeight: '1.7', marginBottom: '0' }}>
                                Web3 Registry. Verifiable, immutable proof of competency stored as on-chain cryptographic signatures.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SPECIALIZED DIVISIONS */}
            <section style={{ padding: '8rem 2rem', background: '#0a0a0c' }}>
                <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-end', 
                        marginBottom: '4rem',
                        flexWrap: 'wrap',
                        gap: '2rem'
                    }}>
                        <div>
                            <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', textTransform: 'none' }}>Specialized Divisions</h2>
                            <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '500px', textTransform: 'none' }}>Bridging the gap between theory and execution.</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem' }}>
                        {/* BUILDERS */}
                        <div className="glass-card" style={{ 
                            padding: '4rem', 
                            borderLeft: '4px solid #3b82f6',
                            clipPath: 'polygon(0% 0%, 100% 5%, 92% 100%, 5% 95%)',
                            background: 'rgba(59, 130, 246, 0.04)'
                        }}>
                            <h3 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '2rem', letterSpacing: '-1px', textTransform: 'none' }}>Builders</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem 0', color: '#94a3b8', fontSize: '1.1rem', fontWeight: '500' }}>
                                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%' }} />
                                    Smart Contract Architecture
                                </li>
                                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%' }} />
                                    Hardware & Robotics
                                </li>
                                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%' }} />
                                    Distributed Systems
                                </li>
                            </ul>
                            <button className="btn-premium" onClick={() => showPage('courses')} style={{ width: '100%' }}>
                                Enter Division
                            </button>
                        </div>

                        {/* CREATIVES */}
                        <div className="glass-card" style={{ 
                            padding: '4rem', 
                            borderLeft: '4px solid #a855f7',
                            clipPath: 'polygon(8% 0%, 100% 0%, 95% 95%, 0% 100%)',
                            background: 'rgba(168, 85, 247, 0.04)'
                        }}>
                            <h3 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '2rem', letterSpacing: '-1px', textTransform: 'none' }}>Creatives</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem 0', color: '#94a3b8', fontSize: '1.1rem', fontWeight: '500' }}>
                                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '6px', height: '6px', background: '#a855f7', borderRadius: '50%' }} />
                                    Visual Architecture
                                </li>
                                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '6px', height: '6px', background: '#a855f7', borderRadius: '50%' }} />
                                    Generative Aesthetics
                                </li>
                                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '6px', height: '6px', background: '#a855f7', borderRadius: '50%' }} />
                                    Product Design Loop
                                </li>
                            </ul>
                            <button className="btn-premium" onClick={() => showPage('courses')} style={{ width: '100%', background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#fff' }}>
                                Enter Division
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage_Premium;
