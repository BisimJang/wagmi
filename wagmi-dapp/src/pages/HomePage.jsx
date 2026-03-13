// src/pages/HomePage.jsx

import React from 'react';

const HomePage = ({ stats, user, certificates, showPage }) => {
    return (
        <>
            <style>{`
                .hero-brutal {
                    position: relative;
                    padding: 8rem 0;
                    margin: 2rem 0;
                    border: 4px solid #000;
                    background-color: #eee;
                    background-image: url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80');
                    background-size: cover;
                    background-position: center;
                    background-blend-mode: luminosity;
                    min-height: 70vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 15px 15px 0px #000;
                    overflow: hidden;
                }

                .hero-filter {
                    position: absolute;
                    inset: 0;
                    background: rgba(255, 255, 255, 0.4);
                    z-index: 0;
                }

                .hero-content-brutal {
                    position: relative;
                    z-index: 10;
                    text-align: center;
                    width: 100%;
                    padding: 2rem;
                }

                .graffiti-text {
                    font-family: 'Permanent Marker', cursive;
                    font-size: 8rem;
                    color: #39ff14;
                    text-transform: uppercase;
                    line-height: 0.9;
                    transform: rotate(-5deg);
                    text-shadow: 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 8px 8px 0 #000;
                    margin-bottom: 2rem;
                    letter-spacing: -2px;
                }
                
                .subtitle-brutal {
                    font-size: 1.5rem;
                    font-weight: 900;
                    color: #000;
                    background: #39ff14;
                    display: inline-block;
                    padding: 0.5rem 1.5rem;
                    border: 4px solid #000;
                    box-shadow: 6px 6px 0 #000;
                    margin-bottom: 3rem;
                    text-transform: uppercase;
                }

                .stats-brutal {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 3rem;
                    margin-top: 5rem;
                    margin-bottom: 5rem;
                }

                .stat-card-brutal {
                    background: #fff;
                    padding: 3rem 2rem;
                    text-align: center;
                    border: 4px solid #000;
                    box-shadow: 12px 12px 0px #000;
                    position: relative;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .stat-card-brutal:hover {
                    transform: translate(6px, 6px);
                    box-shadow: 6px 6px 0px #000;
                    background: #39ff14;
                }

                .stat-icon-brutal {
                    font-size: 5rem;
                    margin-bottom: 1rem;
                    filter: drop-shadow(4px 4px 0 #000);
                }

                .stat-number-brutal {
                    font-size: 6rem;
                    font-weight: 900;
                    color: #fff;
                    line-height: 1;
                    margin-bottom: 1rem;
                    -webkit-text-stroke: 4px #000;
                }

                .stat-label-brutal {
                    font-size: 1.5rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    border-top: 4px solid #000;
                    padding-top: 1rem;
                    display: inline-block;
                    margin-top: 1rem;
                }

                .marquee-container {
                    width: 100vw;
                    margin-left: calc(-50vw + 50%);
                    overflow: hidden;
                    background: #000;
                    color: #39ff14;
                    border-top: 4px solid #000;
                    border-bottom: 4px solid #000;
                    padding: 1rem 0;
                    margin-top: 2rem;
                }

                .marquee-content {
                    display: flex;
                    white-space: nowrap;
                    animation: marquee 15s linear infinite;
                    font-family: 'Permanent Marker', cursive;
                    font-size: 2.5rem;
                    text-transform: uppercase;
                    text-shadow: 2px 2px 0 #000;
                }

                .marquee-content span {
                    margin-right: 3rem;
                }

                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }

                @media (max-width: 768px) {
                    .graffiti-text {
                        font-size: 4rem;
                        text-shadow: 2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 4px 4px 0 #000;
                    }
                    .hero-brutal {
                        margin: 1rem 0;
                        padding: 4rem 0;
                        min-height: 50vh;
                    }
                    .subtitle-brutal {
                        font-size: 1rem;
                    }
                    .stat-number-brutal {
                        font-size: 4rem;
                    }
                    .marquee-content {
                        font-size: 1.5rem;
                    }
                }
            `}</style>

            <section className="page active">
                <div className="container">
                    <div className="hero-brutal">
                        <div className="hero-filter"></div>
                        <div className="hero-content-brutal">
                            <div className="graffiti-text">
                                STUDY<br/>VERSE
                            </div>
                            <br />
                            <div className="subtitle-brutal">
                                Learn Web3. Own Your Education.
                            </div>
                            <div>
                                <button onClick={() => showPage('courses')} className="btn" style={{ fontSize: '1.5rem', padding: '1rem 3rem' }}>
                                    ENTER THE GRID
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="marquee-container">
                    <div className="marquee-content">
                        <span>⚡ Blockchain Verified ⚡</span>
                        <span>🔥 NFT Certificates 🔥</span>
                        <span>⚠️ Learn & Earn ⚠️</span>
                        <span>⚡ Blockchain Verified ⚡</span>
                        <span>🔥 NFT Certificates 🔥</span>
                        <span>⚠️ Learn & Earn ⚠️</span>
                        <span>⚡ Blockchain Verified ⚡</span>
                        <span>🔥 NFT Certificates 🔥</span>
                        <span>⚠️ Learn & Earn ⚠️</span>
                    </div>
                </div>

                <div className="container">
                    <div className="stats-brutal">
                        <div className="stat-card-brutal">
                            <div className="stat-icon-brutal">💀</div>
                            <div className="stat-number-brutal">{stats.totalCourses}</div>
                            <div className="stat-label-brutal">Courses</div>
                        </div>
                        <div className="stat-card-brutal">
                            <div className="stat-icon-brutal">✖️</div>
                            <div className="stat-number-brutal">{user?.enrollments?.length || 0}</div>
                            <div className="stat-label-brutal">Enrolled</div>
                        </div>
                        <div className="stat-card-brutal">
                            <div className="stat-icon-brutal">👁️</div>
                            <div className="stat-number-brutal">{certificates.length}</div>
                            <div className="stat-label-brutal">Certificates</div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default HomePage;