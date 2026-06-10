import React, { useState, useMemo, useEffect } from 'react';
import { BookOpen, Award, Link as LinkIcon, Globe, CheckCircle, LogOut, Target, Zap } from 'lucide-react';
import LoadingSpinner from '../components/Feedback/LoadingSpinner';
import CourseCard from '../components/Card/CourseCard';
import NftAvatarSelector from '../components/Profile/NftAvatarSelector';
import { apiCall } from '../api/api';

const ProfilePage = ({ 
    user, 
    certificates, 
    loading, 
    allCourses, 
    onViewCourse,
    showMessage,
    linkWallet,
    address: connectedAddress,
    onLogout,
    projectGoal
}) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isNftSelectorOpen, setIsNftSelectorOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('path'); 

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const enrolledCourses = useMemo(() => {
        if (!user || !allCourses) return [];
        const enrolledIds = user.enrollments?.map(enr => enr.course_id) || [];
        return allCourses.filter(course => enrolledIds.includes(course.id));
    }, [user, allCourses]);

    const handleAvatarSelect = async (imageUrl) => {
        try {
            await apiCall('/me/', {
                method: 'PATCH',
                body: JSON.stringify({ profile_image: imageUrl })
            });
            setIsNftSelectorOpen(false);
            showMessage('NFT Avatar set!', 'success');
        } catch (err) {
            showMessage('Failed to set avatar', 'error');
        }
    };

    if (loading || !user) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <LoadingSpinner />
                <p style={{ marginTop: '1rem', color: '#666', fontFamily: "'Poppins', sans-serif" }}>Loading...</p>
            </div>
        );
    }

    return (
        <div className="simple-profile">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

                .simple-profile {
                    font-family: 'Poppins', sans-serif;
                    background: #fafafa;
                    color: #333;
                    min-height: 100vh;
                    padding: 40px 20px;
                }

                .simple-profile * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                .sp-container {
                    max-width: 900px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }

                /* ── HEADER CARD ── */
                .sp-header-card {
                    background: #fff;
                    border-radius: 16px;
                    padding: 30px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                    border: 1px solid #eaeaea;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                @media (min-width: 600px) {
                    .sp-header-card {
                        flex-direction: row;
                        align-items: flex-start;
                        padding: 40px;
                        gap: 30px;
                    }
                }

                .sp-avatar {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: #f0f0f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    font-weight: 600;
                    color: #aaa;
                    overflow: hidden;
                    cursor: pointer;
                    flex-shrink: 0;
                    border: 1px solid #eaeaea;
                }

                .sp-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .sp-info {
                    flex: 1;
                }

                .sp-name {
                    font-size: 24px;
                    font-weight: 600;
                    color: #111;
                    margin-bottom: 6px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .sp-bio {
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 20px;
                    line-height: 1.5;
                }

                .sp-actions {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .sp-btn {
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    font-family: inherit;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    border: 1px solid transparent;
                    transition: all 0.2s;
                    text-decoration: none;
                }

                .sp-btn-wallet {
                    background: #f8f9fa;
                    border-color: #e0e0e0;
                    color: #333;
                }

                .sp-btn-logout {
                    background: transparent;
                    border-color: #ffc9c9;
                    color: #e03131;
                }
                .sp-btn-logout:hover {
                    background: #fff0f0;
                }

                /* ── TABS ── */
                .sp-tabs {
                    display: flex;
                    gap: 10px;
                    border-bottom: 1px solid #eaeaea;
                    margin-bottom: 20px;
                }

                .sp-tab {
                    padding: 12px 20px;
                    background: none;
                    border: none;
                    font-family: inherit;
                    font-size: 14px;
                    font-weight: 500;
                    color: #888;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: color 0.2s;
                }

                .sp-tab:hover {
                    color: #333;
                }

                .sp-tab.active {
                    color: #3B5BDB;
                    border-bottom-color: #3B5BDB;
                }

                /* ── CONTENT ── */
                .sp-content-box {
                    background: #fff;
                    border-radius: 16px;
                    padding: 30px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                    border: 1px solid #eaeaea;
                }

                .sp-section-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #111;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .sp-traj-box {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 12px;
                    border-left: 4px solid #3B5BDB;
                    margin-bottom: 30px;
                }

                .sp-traj-box h4 {
                    font-size: 15px;
                    font-weight: 600;
                    margin-bottom: 4px;
                    color: #111;
                }

                .sp-traj-box p {
                    font-size: 13px;
                    color: #666;
                }

                .sp-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 20px;
                }

                /* Certificate Cards */
                .sp-cert {
                    border: 1px solid #eaeaea;
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .sp-cert-img {
                    width: 100%;
                    aspect-ratio: 1.5;
                    background: #fafafa;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                .sp-cert-img img { width: 100%; height: 100%; object-fit: contain; }

                .sp-cert-info h5 { font-size: 14px; font-weight: 600; color: #111; margin-bottom: 2px; }
                .sp-cert-info p { font-size: 12px; color: #888; }

                .sp-cert-links { display: flex; gap: 8px; margin-top: 8px; }
                .sp-cert-link {
                    font-size: 11px;
                    font-weight: 500;
                    color: #3B5BDB;
                    text-decoration: none;
                    background: #f0f4ff;
                    padding: 4px 8px;
                    border-radius: 4px;
                }
                .sp-cert-link:hover { background: #e0e7ff; }

                .sp-empty {
                    padding: 40px 20px;
                    text-align: center;
                    color: #888;
                    font-size: 14px;
                }
            `}</style>

            <div className="sp-container">
                
                {/* Header Card */}
                <div className="sp-header-card">
                    <div 
                        className="sp-avatar"
                        onClick={() => user.is_wallet_linked && setIsNftSelectorOpen(true)}
                    >
                        {user.profile_image ? (
                            <img src={user.profile_image} alt="Avatar" />
                        ) : (
                            <span>{user.display_name?.[0]?.toUpperCase() || '?'}</span>
                        )}
                    </div>

                    <div className="sp-info">
                        <div className="sp-name">
                            {user.display_name || 'Anonymous Creator'}
                            {user.is_wallet_linked && <CheckCircle size={18} color="#3EC636" />}
                        </div>
                        <p className="sp-bio">{user.bio || 'Architecting decentralized futures. No biography provided.'}</p>

                        <div className="sp-actions">
                            {user.address ? (
                                <div className="sp-btn sp-btn-wallet">
                                    <LinkIcon size={14} />
                                    {user.address.slice(0, 6)}...{user.address.slice(-4)}
                                </div>
                            ) : (
                                <div className="sp-btn sp-btn-wallet" style={{ color: '#e03131', borderColor: '#ffc9c9' }}>
                                    No Wallet Linked
                                </div>
                            )}
                            
                            <button className="sp-btn sp-btn-logout" onClick={onLogout}>
                                <LogOut size={14} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="sp-tabs">
                    <button 
                        className={`sp-tab ${activeTab === 'path' ? 'active' : ''}`}
                        onClick={() => setActiveTab('path')}
                    >
                        <BookOpen size={16} /> Learning Path
                    </button>
                    <button 
                        className={`sp-tab ${activeTab === 'backpack' ? 'active' : ''}`}
                        onClick={() => setActiveTab('backpack')}
                    >
                        <Award size={16} /> Backpack
                    </button>
                </div>

                {/* Content Box */}
                <div className="sp-content-box">
                    
                    {activeTab === 'path' && (
                        <div>
                            {/* Trajectory */}
                            <div className="sp-section-title">
                                <Target size={18} color="#3B5BDB" /> Mastery Trajectory
                            </div>
                            <div className="sp-traj-box">
                                {projectGoal ? (
                                    <>
                                        <h4>{projectGoal}</h4>
                                        <p>Vera monitors your progression against this objective.</p>
                                    </>
                                ) : (
                                    <>
                                        <h4 style={{ color: '#888' }}>Trajectory Undefined</h4>
                                        <p>Configure your trajectory in Settings to begin AI-guided curriculum mapping.</p>
                                    </>
                                )}
                            </div>

                            {/* Enrolled Courses */}
                            <div className="sp-section-title" style={{ marginTop: '40px' }}>
                                <BookOpen size={18} color="#111" /> Current Growth Nodes
                            </div>
                            {enrolledCourses.length > 0 ? (
                                <div className="sp-grid">
                                    {enrolledCourses.map(course => (
                                        <CourseCard 
                                            key={course.id} 
                                            course={course} 
                                            enrollmentStatus="enrolled"
                                            onViewDetails={onViewCourse}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="sp-empty">
                                    Your learning grid is currently empty.
                                </div>
                            )}

                            {/* Recommendations */}
                            {projectGoal && (
                                <div style={{ marginTop: '40px' }}>
                                    <div className="sp-section-title">
                                        <Zap size={18} color="#fcd34d" fill="#fcd34d" /> Recommended Next Steps
                                    </div>
                                    <div className="sp-grid">
                                        {allCourses
                                            .filter(c => {
                                                const enrolledIds = user?.enrollments?.map(e => e.course_id) || [];
                                                return !enrolledIds.includes(c.id) && 
                                                    (projectGoal.toLowerCase().includes(c.category?.toLowerCase() || '') || 
                                                     projectGoal.toLowerCase().includes(c.division?.toLowerCase() || ''));
                                            })
                                            .slice(0, 3)
                                            .map((course) => (
                                                <CourseCard 
                                                    key={course.id} 
                                                    course={course} 
                                                    enrollmentStatus={null}
                                                    onViewDetails={onViewCourse}
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'backpack' && (
                        <div>
                            <div className="sp-section-title">
                                <Award size={18} /> Verified Certificates
                            </div>

                            {certificates.length > 0 ? (
                                <div className="sp-grid">
                                    {certificates.map((cert, idx) => (
                                        <div key={idx} className="sp-cert">
                                            <div className="sp-cert-img">
                                                {cert.image_uri ? (
                                                    <img src={cert.image_uri} alt={cert.course} />
                                                ) : (
                                                    <Award size={40} color="#ccc" />
                                                )}
                                            </div>
                                            <div className="sp-cert-info">
                                                <h5>{cert.course}</h5>
                                                <p>Issued {new Date(cert.issued_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="sp-cert-links">
                                                {cert.tx_hash ? (
                                                    <a href={`https://sepolia.etherscan.io/tx/${cert.tx_hash}`} target="_blank" rel="noreferrer" className="sp-cert-link">
                                                        Explorer
                                                    </a>
                                                ) : (
                                                    <span 
                                                        className="sp-cert-link" 
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => onViewCourse({ id: cert.course_id })}
                                                    >
                                                        Claim NFT
                                                    </span>
                                                )}
                                                <a href={cert.metadata_uri} target="_blank" rel="noreferrer" className="sp-cert-link">
                                                    Metadata
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="sp-empty">
                                    No Proof of Skill detected. Complete modules to mint your certificates.
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {isNftSelectorOpen && (
                <NftAvatarSelector 
                    address={connectedAddress || user.address} 
                    onSelect={handleAvatarSelect} 
                    onClose={() => setIsNftSelectorOpen(false)} 
                />
            )}
        </div>
    );
};

export default ProfilePage;