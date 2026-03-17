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
                        font-size: 5rem !important;
                    }
                    .hero-subtitle-massive {
                        font-size: 1.2rem !important;
                        padding: 1rem !important;
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
                    <div className="container" style={{
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
                                Own Your Education.<br/>Cryptographic Validation.
                            </div>

                            <p style={{
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                maxWidth: '350px',
                                lineHeight: '1.6'
                            }}>
                                The decentralized network for creators and students. Reject linear paths. Embrace concentric learning.
                            </p>
                        </div>

                        {/* RIGHT SIDE - BUTTONS */}
                        <div style={{
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
                <div className="marquee-container" style={{ marginTop: '-4px', borderBottom: '6px solid #000' }}>
                    <div className="marquee-content" style={{ fontSize: '2.25rem' }}>
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
                        <h2 style={{
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
                            <div style={{ border: '6px solid #000', padding: '2.25rem', background: '#e0e0e0', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '-1.5rem', left: '-1.5rem', background: '#000', color: '#39ff14', fontSize: '2.25rem', fontWeight: '900', padding: '0.4rem 0.75rem', border: '3px solid #000' }}>01</div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem', marginTop: '0.75rem' }}>Reject Linear</h3>
                                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', fontWeight: '600' }}>Conventional learning forces a single start and end. Here, you dive in anywhere. The curriculum adapts and guides you to a cohesive understanding, regardless of your entry point.</p>
                            </div>

                            <div style={{ border: '6px solid #000', padding: '2.25rem', background: '#39ff14', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '-1.5rem', left: '-1.5rem', background: '#000', color: '#ff00ff', fontSize: '2.25rem', fontWeight: '900', padding: '0.4rem 0.75rem', border: '3px solid #000' }}>02</div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem', marginTop: '0.75rem' }}>Mint & Earn</h3>
                                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', fontWeight: '600' }}>Instructors deploy courses directly onto the decentralized ledger. Set your ETH price, own your content, and retain 100% of the value you generate.</p>
                            </div>

                            <div style={{ border: '6px solid #000', padding: '2.25rem', background: '#000', color: '#fff', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '-1.5rem', left: '-1.5rem', background: '#fff', color: '#000', fontSize: '2.25rem', fontWeight: '900', padding: '0.4rem 0.75rem', border: '3px solid #000' }}>03</div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem', marginTop: '0.75rem' }}>Absolute Validation</h3>
                                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', fontWeight: '600' }}>Complete the process and mint your cryptographic certificate. Immutable, verifiable proof of skill that lives in your wallet, not on a centralized server.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* THE STREET - Informative Signboards */}
                {/* SIGNBOARD 1 */}
                <div style={{
                    background: '#ff00ff',
                    padding: '7rem 1.5rem',
                    borderBottom: '6px solid #000',
                    position: 'relative'
                }}>
                    <div className="container" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{
                            background: '#fff',
                            color: '#000',
                            border: '6px solid #000',
                            boxShadow: '18px 18px 0 #000',
                            padding: '3rem',
                            maxWidth: '525px',
                            transform: 'rotate(-2deg)'
                        }}>
                             <h2 style={{ fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1.5rem', lineHeight: '1' }}>
                                 NOTICE 01:<br/>THE GENESIS
                             </h2>
                             <p style={{ fontSize: '1.15rem', fontWeight: '600', lineHeight: '1.6' }}>
                                 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate.
                             </p>
                        </div>
                    </div>
                </div>

                {/* SIGNBOARD 2 */}
                <div style={{
                    background: '#e0e0e0',
                    padding: '7rem 1.5rem',
                    borderBottom: '6px solid #000',
                    position: 'relative'
                }}>
                    <div className="container" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{
                            background: '#000',
                            color: 'var(--primary-color)',
                            border: '6px solid var(--primary-color)',
                            boxShadow: '-18px 18px 0 var(--primary-color)',
                            padding: '3rem',
                            maxWidth: '525px',
                            transform: 'rotate(2deg)'
                        }}>
                             <h2 style={{ fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1.5rem', lineHeight: '1' }}>
                                 NOTICE 02:<br/>THE PROTOCOL
                             </h2>
                             <p style={{ fontSize: '1.15rem', fontWeight: '600', lineHeight: '1.6' }}>
                                 Massa tempor nec feugiat nisl. Dictumst quisque sagittis purus sit. Ultricies integer quis auctor elit sed vulputate mi sit. Et malesuada fames ac turpis egestas integer eget aliquet nibh. Tincidunt lobortis feugiat vivamus at augue eget arcu.
                             </p>
                        </div>
                    </div>
                </div>

                {/* SIGNBOARD 3 */}
                <div style={{
                    background: 'var(--primary-color)',
                    padding: '7rem 1.5rem',
                    borderBottom: '6px solid #000',
                    position: 'relative'
                }}>
                    <div className="container" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
                        <div style={{
                            background: '#fff',
                            color: '#000',
                            border: '6px solid #000',
                            boxShadow: '18px 18px 0 #000',
                            padding: '3rem',
                            maxWidth: '600px',
                            transform: 'rotate(-1deg)',
                            textAlign: 'center'
                        }}>
                             <h2 style={{ fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1.5rem', lineHeight: '1' }}>
                                 NOTICE 03:<br/>THE FRONTIER
                             </h2>
                             <p style={{ fontSize: '1.15rem', fontWeight: '600', lineHeight: '1.6' }}>
                                 Volutpat diam ut venenatis tellus in metus vulputate eu. Condimentum lacinia quis vel eros donec. Eleifend mi in nulla posuere sollicitudin aliquam ultrices. Faucibus purus in massa tempor nec feugiat. Tellus pellentesque eu tincidunt tortor aliquam.
                             </p>
                        </div>
                    </div>
                </div>

            </section>
        </>
    );
};

export default HomePage;