import React from 'react';
import { Sparkles, ArrowRight, Zap, Shield, Database } from 'lucide-react';

const HomePage_Premium = ({ stats, user, certificates, showPage }) => {
    return (
        <div style={{
            backgroundColor: '#050505',
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
                    0% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.05); }
                    100% { opacity: 0.2; transform: scale(1); }
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
                }
                .glass-card:hover {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(255, 255, 255, 0.15);
                    transform: translateY(-8px);
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
                }
                .gradient-text {
                    background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .hero-glow-1 {
                    position: absolute;
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, rgba(0, 0, 0, 0) 70%);
                    top: -100px;
                    left: -200px;
                    pointer-events: none;
                    animation: pulse-glow 8s infinite ease-in-out;
                }
                .hero-glow-2 {
                    position: absolute;
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
                    bottom: -100px;
                    right: -100px;
                    pointer-events: none;
                    animation: pulse-glow 10s infinite ease-in-out reverse;
                }
                .btn-primary {
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    color: #fff;
                    padding: 1.2rem 3rem;
                    border-radius: 100px;
                    font-weight: 800;
                    font-size: 1.1rem;
                    text-transform: none;
                    border: none;
                    box-shadow: 0 10px 30px rgba(79, 70, 229, 0.3);
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.8rem;
                    cursor: pointer;
                }
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 40px rgba(79, 70, 229, 0.5);
                    filter: brightness(1.1);
                }
                .btn-secondary {
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 1.2rem 3rem;
                    border-radius: 100px;
                    font-weight: 700;
                    font-size: 1.1rem;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                .btn-secondary:hover {
                    background: rgba(255,255,255,0.1);
                    border-color: rgba(255,255,255,0.2);
                }
            `}</style>

            {/* HERO SECTION */}
            <section style={{ 
                position: 'relative', 
                minHeight: '90vh',
                display: 'flex',
                alignItems: 'center',
                padding: '8rem 2rem', 
                textAlign: 'center',
                overflow: 'hidden'
            }}>
                <div className="hero-glow-1" />
                <div className="hero-glow-2" />
                
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 1.5rem', 
                        background: 'rgba(255, 255, 255, 0.03)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        borderRadius: '100px',
                        color: '#a5b4fc',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        marginBottom: '2.5rem',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <Sparkles size={16} /> Welcome to the Future of Education
                    </div>
                    
                    <h1 className="gradient-text" style={{ 
                        fontSize: 'clamp(3.5rem, 8vw, 6rem)', 
                        fontWeight: '900', 
                        lineHeight: '1.1', 
                        marginBottom: '2rem',
                        letterSpacing: '-2px'
                    }}>
                        Learn, Build, and <br/> Prove Your Mastery.
                    </h1>
                    
                    <p style={{ 
                        fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', 
                        color: '#94a3b8', 
                        maxWidth: '700px', 
                        margin: '0 auto 3.5rem auto',
                        lineHeight: '1.7',
                        fontWeight: '500'
                    }}>
                        Studyverse is the next-generation platform for builders and creatives. 
                        Master new skills, earn verifiable certificates, and launch your own sovereign institution.
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn-primary" onClick={() => showPage('courses')}>
                            Get Started with Studyverse <ArrowRight size={20} />
                        </button>
                        <button className="btn-secondary" onClick={() => showPage(user ? 'instructor' : 'profile')}>
                            Deploy a School
                        </button>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS / PILLARS */}
            <section style={{ padding: '8rem 2rem', position: 'relative', zIndex: 10 }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>How Studyverse Works</h2>
                        <p style={{ color: '#64748b', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>A seamless ecosystem designed to help you accelerate your learning and prove your competence to the world.</p>
                    </div>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                        gap: '2.5rem'
                    }}>
                        {/* Feature 1 */}
                        <div className="glass-card" style={{ padding: '3.5rem 2.5rem' }}>
                            <div style={{ 
                                width: '60px', height: '60px', 
                                background: 'rgba(79, 70, 229, 0.1)', 
                                border: '1px solid rgba(79, 70, 229, 0.2)',
                                color: '#a5b4fc',
                                borderRadius: '16px', marginBottom: '2rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Zap size={28} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Immersive Learning</h3>
                            <p style={{ color: '#94a3b8', lineHeight: '1.7' }}>
                                Dive into high-quality modules crafted by top industry experts. Learn at your own pace through interactive video and rich markdown content.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="glass-card" style={{ padding: '3.5rem 2.5rem' }}>
                            <div style={{ 
                                width: '60px', height: '60px', 
                                background: 'rgba(45, 212, 191, 0.1)', 
                                border: '1px solid rgba(45, 212, 191, 0.2)',
                                color: '#5eead4',
                                borderRadius: '16px', marginBottom: '2rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Shield size={28} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Verifiable Credentials</h3>
                            <p style={{ color: '#94a3b8', lineHeight: '1.7' }}>
                                Your achievements are minted as immutable, cryptographic certificates. Prove your skills to employers with unquestionable authenticity.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-card" style={{ padding: '3.5rem 2.5rem' }}>
                            <div style={{ 
                                width: '60px', height: '60px', 
                                background: 'rgba(244, 63, 94, 0.1)', 
                                border: '1px solid rgba(244, 63, 94, 0.2)',
                                color: '#fda4af',
                                borderRadius: '16px', marginBottom: '2rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Database size={28} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Sovereign Institutions</h3>
                            <p style={{ color: '#94a3b8', lineHeight: '1.7' }}>
                                Ready to teach? Launch your own Institutional Node in seconds. Deploy curriculum and monetize your knowledge globally without friction.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA BANNER */}
            <section style={{ padding: '8rem 2rem' }}>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div className="glass-card" style={{ 
                        padding: '6rem 4rem', 
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, rgba(79,70,229,0.05) 0%, rgba(124,58,237,0.05) 100%)',
                        border: '1px solid rgba(124,58,237,0.2)'
                    }}>
                        <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '1.5rem', letterSpacing: '-1px' }}>Ready to unlock your potential?</h2>
                        <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
                            Join thousands of builders and creatives who are already accelerating their careers on Studyverse.
                        </p>
                        <button className="btn-primary" onClick={() => showPage('courses')} style={{ padding: '1.5rem 4rem', fontSize: '1.2rem' }}>
                            Get Started Now <ArrowRight size={24} />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage_Premium;
