// src/pages/HomePage.jsx

import React from 'react';

const HomePage = ({ stats, user, certificates, showPage }) => {
    return (
        <>
            <style>{`
                .marquee-container {
                    width: 100vw;
                    overflow: hidden;
                    background: #000;
                    color: var(--primary-color);
                    border-bottom: 8px solid #000;
                    padding: 2rem 0;
                }
                .marquee-content {
                    display: flex;
                    white-space: nowrap;
                    animation: marquee 15s linear infinite;
                    font-size: 3rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: -1px;
                }
                .marquee-content span {
                    margin-right: 4rem;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @media (max-width: 768px) {
                    .hero-title-massive {
                        font-size: 3rem !important;
                        letter-spacing: -1px !important;
                    }
                    .hero-subtitle-massive {
                        font-size: 0.9rem !important;
                        padding: 0.8rem 1rem !important;
                    }
                    .hero-grid {
                        grid-template-columns: 1fr !important;
                        text-align: center;
                    }
                    .hero-buttons {
                        align-items: stretch !important;
                        width: 100% !important;
                    }
                    .hero-buttons > button {
                        font-size: 0.8rem !important;
                    }
                    .section-title-massive {
                        font-size: 2.2rem !important;
                    }
                }
            `}</style>

            <section className="page active" style={{ padding: 0 }}>
                {/* 1. PLATFORM HERO SECTION */}
                <div style={{
                    background: '#fff',
                    borderBottom: '6px solid #000',
                    padding: '4rem 1.5rem 6rem 1.5rem',
                    minHeight: '70vh', /* Slightly reduced further */
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div className="container hero-grid" style={{
                        maxWidth: '900px',
                        width: '100%',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '2rem',
                        alignItems: 'center'
                    }}>
                        {/* LEFT SIDE - TEXT */}
                        <div>
                            <h1 className="hero-title-massive" style={{
                                fontSize: '4.8rem',
                                fontWeight: '900',
                                textTransform: 'uppercase',
                                letterSpacing: '-3px',
                                lineHeight: '0.9',
                                marginBottom: '1.5rem',
                                color: '#000'
                            }}>
                                MINT THE<br/>PROCESS.
                            </h1>
                            
                            <div className="hero-subtitle-massive" style={{
                                background: '#fff',
                                color: '#000',
                                border: '4px solid #000',
                                boxShadow: '8px 8px 0 #000',
                                padding: '0.8rem 2rem',
                                fontSize: '1rem',
                                fontWeight: '900',
                                textTransform: 'uppercase',
                                marginBottom: '1.5rem',
                                display: 'inline-block',
                                lineHeight: '1.4'
                            }}>
                                Own Your Education.<br/>Modular Learning Engine.
                            </div>

                            <p style={{
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                maxWidth: '350px',
                                lineHeight: '1.6'
                            }}>
                                The Study Verse API Learning Engine. A modular platform for schools and creators to host high-performance curriculum.
                            </p>
                        </div>

                        {/* RIGHT SIDE - BUTTONS */}
                        <div className="hero-buttons" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            alignItems: 'flex-start',
                            justifyContent: 'center'
                        }}>
                            <button 
                                onClick={() => showPage('courses')} 
                                className="btn" 
                                style={{ 
                                    fontSize: '0.9rem', 
                                    padding: '1rem 2rem', 
                                    background: '#000', 
                                    color: 'var(--primary-color)',
                                    boxShadow: '6px 6px 0 var(--primary-color)',
                                    border: '4px solid #000',
                                    width: '100%',
                                    textAlign: 'left'
                                }}
                            >
                                EXPLORE<br/>THE GRID &rarr;
                            </button>

                            <button 
                                onClick={() => showPage(user ? 'instructor' : 'profile')} 
                                className="btn" 
                                style={{ 
                                    fontSize: '0.9rem', 
                                    padding: '1rem 2rem', 
                                    background: '#ff00ff', 
                                    color: '#000',
                                    boxShadow: '6px 6px 0 #000',
                                    border: '4px solid #000',
                                    width: '100%',
                                    textAlign: 'left'
                                }}
                            >
                                START<br/>INSTRUCTING &rarr;
                            </button>
                        </div>
                    </div>
                </div>

                {/* MARQUEE */}
                <div className="marquee-container" style={{ marginTop: '-4px', borderBottom: '6px solid #000', overflow: 'hidden' }}>
                    <div className="marquee-content" style={{ fontSize: '1.5rem' }}>
                        <span>⚡ DECENTRALIZED EDUCATION ⚡</span>
                        <span>🔥 NFT CERTIFICATES 🔥</span>
                        <span>⚠️ PROOF OF SKILL ⚠️</span>
                        <span>⚡ DECENTRALIZED EDUCATION ⚡</span>
                        <span>🔥 NFT CERTIFICATES 🔥</span>
                        <span>⚠️ PROOF OF SKILL ⚠️</span>
                        <span>⚡ DECENTRALIZED EDUCATION ⚡</span>
                        <span>🔥 NFT CERTIFICATES 🔥</span>
                    </div>
                </div>

                {/* 2. VALUE PROPOSITION: CONCENTRIC LEARNING */}
                <div style={{
                    background: '#fff',
                    padding: '6rem 1.5rem',
                    borderBottom: '6px solid #000'
                }}>
                    <div className="container" style={{ maxWidth: '900px' }}>
                        <h2 className="section-title-massive" style={{
                            fontSize: '3.75rem',
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            letterSpacing: '-1.5px',
                            lineHeight: '1',
                            marginBottom: '3rem',
                            borderBottom: '6px solid #000',
                            paddingBottom: '1.5rem'
                        }}>
                            THE CONCENTRIC APPROACH
                        </h2>
                        
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(225px, 1fr))',
                            gap: '3rem'
                        }}>
                            <div className="brutalist-card" style={{ padding: '2.25rem', background: '#e0e0e0', position: 'relative', border: '6px solid #000', boxShadow: 'none' }}>
                                <div style={{ position: 'absolute', top: '-1rem', left: '-1rem', background: '#000', color: '#39ff14', fontSize: '1.5rem', fontWeight: '900', padding: '0.4rem 0.75rem', border: '3px solid #000' }}>01</div>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem', marginTop: '0.75rem' }}>Reject Linear</h3>
                                <p style={{ fontSize: '0.85rem', lineHeight: '1.6', fontWeight: '600' }}>Conventional learning forces a single start and end. Here, you dive in anywhere. The curriculum adapts and guides you to a cohesive understanding.</p>
                            </div>

                            <div className="brutalist-card" style={{ padding: '2.25rem', background: '#39ff14', position: 'relative', border: '6px solid #000', boxShadow: 'none' }}>
                                <div style={{ position: 'absolute', top: '-1rem', left: '-1rem', background: '#000', color: '#ff00ff', fontSize: '1.5rem', fontWeight: '900', padding: '0.4rem 0.75rem', border: '3px solid #000' }}>02</div>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem', marginTop: '0.75rem' }}>Mint & Earn</h3>
                                <p style={{ fontSize: '0.85rem', lineHeight: '1.6', fontWeight: '600' }}>Instructors deploy courses directly onto the decentralized ledger. Set your ETH price, own your content, and retain 100% of the value you generate.</p>
                            </div>

                            <div className="brutalist-card" style={{ padding: '2.25rem', background: '#000', color: '#fff', position: 'relative', border: '6px solid #000', boxShadow: 'none' }}>
                                <div style={{ position: 'absolute', top: '-1rem', left: '-1rem', background: '#fff', color: '#000', fontSize: '1.5rem', fontWeight: '900', padding: '0.4rem 0.75rem', border: '3px solid #000' }}>03</div>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem', marginTop: '0.75rem' }}>Absolute Validation</h3>
                                <p style={{ fontSize: '0.85rem', lineHeight: '1.6', fontWeight: '600' }}>Complete the process and mint your cryptographic certificate. Immutable, verifiable proof of skill that lives in your wallet.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* THE THREE-PILLAR MODEL */}
                <div style={{
                    background: '#000',
                    padding: '6rem 1.5rem',
                    borderBottom: '6px solid #000'
                }}>
                    <div className="container" style={{ maxWidth: '900px' }}>
                        <h2 style={{
                            fontSize: '3rem',
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            color: 'var(--primary-color)',
                            marginBottom: '4rem',
                            textAlign: 'center'
                        }}>
                            THE THREE-PILLAR MODEL
                        </h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                            {/* PILLAR 1 */}
                            <div style={{ border: '4px solid var(--primary-color)', padding: '2rem', background: '#000' }}>
                                <h3 style={{ color: 'var(--primary-color)', fontSize: '1.5rem', fontWeight: '900', marginBottom: '1rem' }}>THE CORE</h3>
                                <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500', marginBottom: '1.5rem' }}>Watch → Complete → Advance. A self-paced curriculum loop designed for momentum.</p>
                                <div style={{ background: 'var(--primary-color)', color: '#000', padding: '0.5rem', fontWeight: '900', fontSize: '0.7rem', display: 'inline-block' }}>PERSONALIZATION</div>
                            </div>
                            {/* PILLAR 2 */}
                            <div style={{ border: '4px solid #ff00ff', padding: '2rem', background: '#000' }}>
                                <h3 style={{ color: '#ff00ff', fontSize: '1.5rem', fontWeight: '900', marginBottom: '1rem' }}>THE ENGINE</h3>
                                <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500', marginBottom: '1.5rem' }}>Study Verse API. Separate content from logic to host any project with high-performance tracking.</p>
                                <div style={{ background: '#ff00ff', color: '#000', padding: '0.5rem', fontWeight: '900', fontSize: '0.7rem', display: 'inline-block' }}>APPLICATION</div>
                            </div>
                            {/* PILLAR 3 */}
                            <div style={{ border: '4px solid #fff', padding: '2rem', background: '#000' }}>
                                <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '900', marginBottom: '1rem' }}>THE RECORD</h3>
                                <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500', marginBottom: '1.5rem' }}>Web3 Registry. Verifiable, immutable proof of competency stored directly on-chain.</p>
                                <div style={{ background: '#fff', color: '#000', padding: '0.5rem', fontWeight: '900', fontSize: '0.7rem', display: 'inline-block' }}>TRANSPARENCY</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SPECIALIZED DIVISIONS */}
                <div style={{
                    background: '#fff',
                    padding: '6rem 1.5rem',
                    borderBottom: '6px solid #000'
                }}>
                    <div className="container" style={{ maxWidth: '900px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <h2 style={{ fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', lineHeight: '0.9', margin: 0 }}>SPECIALIZED<br/>DIVISIONS</h2>
                            <p style={{ maxWidth: '300px', fontSize: '0.9rem', fontWeight: '600', margin: 0 }}>Bridge the gap between digital theory and real-world skills.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            {/* BUILDERS */}
                            <div className="division-card" style={{ border: '6px solid #000', padding: '2rem' }}>
                                <h3 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>BUILDERS</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', fontWeight: '600' }}>
                                    <li style={{ marginBottom: '0.5rem' }}>• HARDWARE & ROBOTICS</li>
                                    <li style={{ marginBottom: '0.5rem' }}>• SOFTWARE SCALING</li>
                                    <li style={{ marginBottom: '0.5rem' }}>• SMART CONTRACT ARCHITECTURE</li>
                                </ul>
                                <button onClick={() => showPage('courses')} style={{ background: '#000', color: '#fff', padding: '0.8rem 1.5rem', border: 'none', fontWeight: '900', cursor: 'pointer' }}>ENTER DIVISION</button>
                            </div>

                            {/* CREATIVES */}
                            <div className="division-card" style={{ border: '6px solid #000', padding: '2rem', background: '#39ff14' }}>
                                <h3 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>CREATIVES</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', fontWeight: '600' }}>
                                    <li style={{ marginBottom: '0.5rem' }}>• UI/UX DESIGN</li>
                                    <li style={{ marginBottom: '0.5rem' }}>• GENERATIVE ART</li>
                                    <li style={{ marginBottom: '0.5rem' }}>• VISUAL ARCHITECTURE</li>
                                </ul>
                                <button onClick={() => showPage('courses')} style={{ background: '#000', color: '#fff', padding: '0.8rem 1.5rem', border: 'none', fontWeight: '900', cursor: 'pointer' }}>ENTER DIVISION</button>
                            </div>
                        </div>
                    </div>
                </div>

            </section>
        </>
    );
};

export default HomePage;