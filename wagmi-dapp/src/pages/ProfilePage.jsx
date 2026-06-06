// src/pages/ProfilePage.jsx

import React, { useState, useMemo, useEffect } from 'react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { Settings, BookOpen, Award, Link as LinkIcon, Globe, User, Edit3, CheckCircle, Code, MessageSquare, LogOut, Target, Shield, Zap, Rocket } from 'lucide-react';
import LoadingSpinner from '../components/Feedback/LoadingSpinner';
import CourseCard from '../components/Card/CourseCard';
import NftAvatarSelector from '../components/Profile/NftAvatarSelector';
import { apiCall } from '../api/api';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

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
    projectGoal,
    setProjectGoal
}) => {
    const { disconnect } = useDisconnect();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSignOut = () => {
        disconnect();
        if (onLogout) onLogout();
    };

    const [activeTab, setActiveTab] = useState('path'); 
    const [isNftSelectorOpen, setIsNftSelectorOpen] = useState(false);
    const [isLinking, setIsLinking] = useState(false);
    
    const [formData, setFormData] = useState({
        display_name: user?.display_name || '',
        bio: user?.bio || '',
        twitter_handle: user?.twitter_handle || '',
        github_handle: user?.github_handle || '',
        address: user?.address || ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                display_name: user.display_name || '',
                bio: user.bio || '',
                twitter_handle: user.twitter_handle || '',
                github_handle: user.github_handle || '',
                address: user.address || ''
            });
        }
    }, [user]);

    const { publicKey } = useWallet();
    
    useEffect(() => {
        if (publicKey && formData.address !== publicKey.toString()) {
            setFormData(prev => ({ ...prev, address: publicKey.toString() }));
        }
    }, [publicKey]);

    const enrolledCourses = useMemo(() => {
        if (!user || !allCourses) return [];
        const enrolledIds = user.enrollments?.map(enr => enr.course_id) || [];
        return allCourses.filter(course => enrolledIds.includes(course.id));
    }, [user, allCourses]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await apiCall('/me/', {
                method: 'PATCH',
                body: JSON.stringify(formData)
            });
            showMessage('Profile updated successfully!', 'success');
        } catch (err) {
            showMessage('Failed to update profile', 'error');
        }
    };

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

    const handleLinkWallet = async () => {
        setIsLinking(true);
        try {
            await linkWallet();
        } finally {
            setIsLinking(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <LoadingSpinner />
                <p style={{ marginTop: '2rem', color: 'var(--text-secondary)' }}>Decrypting ID...</p>
            </div>
        );
    }

    return (
        <section className="page">
            <div className="container">
                
                {/* PROFILE HEADER */}
                <div className="glass-panel" style={{ marginBottom: isMobile ? '2rem' : '4rem', padding: isMobile ? '2rem' : '4rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: isMobile ? '4rem' : '10rem', opacity: 0.02, fontWeight: '900' }}>PORTFOLIO</div>
                    
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '2rem' : '4rem', alignItems: isMobile ? 'flex-start' : 'center' }}>
                        {/* Avatar */}
                        <div 
                            onClick={() => user.is_wallet_linked && setIsNftSelectorOpen(true)}
                            style={{ 
                                width: '200px', 
                                height: '200px', 
                                background: 'var(--surface)', 
                                border: '1px solid var(--glass-border)', 
                                borderRadius: '40px',
                                cursor: user.is_wallet_linked ? 'pointer' : 'default',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                            }}
                        >
                            {user.profile_image ? (
                                <img src={user.profile_image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '4rem', fontWeight: '900' }}>{user.display_name?.[0] || '?'}</span>
                            )}
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: '1rem', marginBottom: '1rem' }}>
                                <h1 style={{ fontSize: isMobile ? '2rem' : '3.5rem', fontWeight: '900', letterSpacing: '-1px' }}>{user.display_name || 'Anonymous Creator'}</h1>
                                {user.is_wallet_linked && <CheckCircle size={isMobile ? 20 : 28} style={{ color: 'var(--primary-color)' }} />}
                            </div>
                            
                            <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '1rem' : '1.2rem', marginBottom: '2.5rem', maxWidth: '600px' }}>{user.bio || 'Architecting decentralized futures.'}</p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                {user.address ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.03)', padding: '0.8rem 1.2rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px' }}>
                                        <LinkIcon size={16} color="var(--primary-color)" />
                                        <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>{user.address.slice(0, 6)}...{user.address.slice(-4)} (Solana)</span>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem 1.2rem', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '100px' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ef4444' }}>No Solana Wallet Linked!</span>
                                    </div>
                                )}
                                
                                <button onClick={handleSignOut} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#ef4444' }}>
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
 
                 {/* MASTERY TRAJECTORY HEADER */}
                 <div className="glass-panel" style={{ marginBottom: '3rem', padding: isMobile ? '1.5rem' : '2.5rem', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '1.5rem' : '2rem', borderLeft: '4px solid var(--primary-color)' }}>
                    <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: isMobile ? '1rem' : '1.5rem', borderRadius: '16px' }}>
                        <Target size={isMobile ? 32 : 40} color="var(--primary-color)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--primary-color)', letterSpacing: '2px', marginBottom: '0.5rem' }}>ACTIVE LEARNING TRAJECTORY</div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                            {projectGoal || 'No goal initialized. Set your mastery path in Identity settings.'}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
                            Vera is monitoring your growth nodes against this trajectory.
                        </p>
                    </div>
                </div>

                {/* TABS */}
                <div style={{ 
                    display: 'flex', 
                    gap: isMobile ? '1rem' : '2rem', 
                    marginBottom: isMobile ? '2rem' : '4rem', 
                    borderBottom: '1px solid rgba(255,255,255,0.05)', 
                    paddingBottom: '0.5rem',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    scrollbarWidth: 'none'
                }}>
                    {[
                        { id: 'path', label: 'Learning Path', icon: <BookOpen size={18} /> },
                        { id: 'backpack', label: 'Backpack', icon: <Award size={18} /> },
                        { id: 'settings', label: 'Identity', icon: <Settings size={18} /> }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.8rem',
                                background: 'none',
                                border: 'none',
                                color: activeTab === tab.id ? '#fff' : '#444',
                                fontWeight: '700',
                                fontSize: '1rem',
                                padding: '0.5rem 1rem',
                                borderBottom: activeTab === tab.id ? '2px solid var(--primary-color)' : '2px solid transparent',
                                borderRadius: 0,
                                transform: 'none',
                                boxShadow: 'none'
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* CONTENT */}
                <div style={{ minHeight: '50vh' }}>
                    
                    {activeTab === 'path' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                            {/* RECOMMENDED MASTERY NODES */}
                            {projectGoal && (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                        <Zap size={20} color="#fcd34d" />
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '1px' }}>RECOMMENDED MASTERY NODES</h3>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                                        {allCourses
                                            .filter(c => {
                                                const enrolledIds = user?.enrollments?.map(e => e.course_id) || [];
                                                // Suggest courses not yet enrolled in that match category or division
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
                                                    onEnroll={() => onViewCourse(course)} // Deep link to details
                                                />
                                            ))}
                                        {/* Fallback if no direct match */}
                                        {allCourses.filter(c => {
                                            const enrolledIds = user?.enrollments?.map(e => e.course_id) || [];
                                            return !enrolledIds.includes(c.id) && c.division === 'builders';
                                        }).length > 0 && allCourses.filter(c => {
                                            const enrolledIds = user?.enrollments?.map(e => e.course_id) || [];
                                            return !enrolledIds.includes(c.id) && 
                                                (projectGoal.toLowerCase().includes(c.category?.toLowerCase() || '') || 
                                                 projectGoal.toLowerCase().includes(c.division?.toLowerCase() || ''));
                                        }).length === 0 && (
                                            allCourses
                                                .filter(c => {
                                                    const enrolledIds = user?.enrollments?.map(e => e.course_id) || [];
                                                    return !enrolledIds.includes(c.id) && c.division === 'builders';
                                                })
                                                .slice(0, 3)
                                                .map((course) => (
                                                    <CourseCard 
                                                        key={course.id} 
                                                        course={course} 
                                                        enrollmentStatus={null}
                                                        onViewDetails={onViewCourse}
                                                        onEnroll={() => onViewCourse(course)}
                                                    />
                                                ))
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                    <BookOpen size={20} color="var(--primary-color)" />
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '1px' }}>CURRENT GROWTH NODES</h3>
                                </div>
                                {enrolledCourses.length > 0 ? (
                                    <div className="course-grid">
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
                                    <div className="glass-panel" style={{ textAlign: 'center', padding: '6rem' }}>
                                        <h3 style={{ marginBottom: '1.5rem' }}>The grid is empty.</h3>
                                        <button onClick={() => window.location.hash = 'courses'}>Explore Curriculum</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'backpack' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '3rem' }}>
                            {certificates.map((cert, idx) => (
                                <div key={idx} className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', transition: 'transform 0.3s' }}>
                                    <div style={{ 
                                        width: '100%', 
                                        aspectRatio: '1.4', 
                                        background: 'rgba(255,255,255,0.02)', 
                                        marginBottom: '1.5rem', 
                                        borderRadius: '20px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                                    }}>
                                        {cert.image_uri ? (
                                            <img src={cert.image_uri} alt={cert.course} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <Award size={60} style={{ color: 'var(--primary-color)', opacity: 0.5 }} />
                                        )}
                                    </div>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.4rem', color: '#fff' }}>{cert.course}</h4>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Verified: {new Date(cert.issued_at).toLocaleDateString()}</p>
                                    
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {cert.tx_hash ? (
                                            <button 
                                                onClick={() => window.open(`https://sepolia.etherscan.io/tx/${cert.tx_hash}`)} 
                                                style={{ flex: 1, background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.2)', color: 'var(--primary-color)', fontSize: '0.7rem', fontWeight: '800' }}
                                            >
                                                Explorer
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => onViewCourse({ id: cert.course_id })}
                                                style={{ flex: 1, background: 'var(--primary-color)', fontSize: '0.7rem', fontWeight: '800' }}
                                            >
                                                Claim NFT
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => window.open(cert.metadata_uri)} 
                                            style={{ background: 'rgba(255,255,255,0.05)', padding: '0.6rem', borderRadius: '8px' }}
                                            title="View Metadata"
                                        >
                                            <Globe size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {certificates.length === 0 && (
                                <div className="glass-panel" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '6rem' }}>
                                    <h3>No Proof of Skill detected.</h3>
                                    <p style={{ color: 'var(--text-secondary)' }}>Complete modules to mint your certificates.</p>
                                </div>
                            )}
                        </div>
                    )}

                     {activeTab === 'settings' && (
                        <div className="glass-panel" style={{ padding: isMobile ? '2rem' : '3.5rem', maxWidth: '800px', margin: '0 auto' }}>
                            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '800', fontSize: '0.75rem', color: 'var(--primary-color)', letterSpacing: '1px', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
                                        MASTERY TRAJECTORY (THE GOAL)
                                    </label>
                                    <textarea 
                                        value={projectGoal}
                                        onChange={(e) => setProjectGoal(e.target.value)}
                                        placeholder="e.g. Building a decentralized autonomous organization for sustainable architecture..."
                                        style={{ 
                                            width: '100%', 
                                            background: 'rgba(255,255,255,0.03)', 
                                            border: '1px solid rgba(255,255,255,0.1)', 
                                            borderRadius: '16px', 
                                            padding: '1.5rem', 
                                            color: '#fff', 
                                            height: '150px',
                                            outline: 'none',
                                            transition: 'border-color 0.2s',
                                            resize: 'none'
                                        }} 
                                    />
                                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                        Vera uses this to synthesize your learning path and map knowledge nodes to your project.
                                    </p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1.5rem' : '2rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#444', marginBottom: '0.8rem' }}>DISPLAY NAME</label>
                                        <input 
                                            type="text" 
                                            value={formData.display_name}
                                            onChange={e => setFormData({...formData, display_name: e.target.value})}
                                            style={{ width: '100%', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#444', marginBottom: '0.8rem' }}>GITHUB</label>
                                        <input 
                                            type="text" 
                                            value={formData.github_handle}
                                            onChange={e => setFormData({...formData, github_handle: e.target.value})}
                                            style={{ width: '100%', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#444', marginBottom: '0.8rem' }}>PHILOSOPHY / BIO</label>
                                    <textarea 
                                        rows="4" 
                                        value={formData.bio}
                                        onChange={e => setFormData({...formData, bio: e.target.value})}
                                        style={{ width: '100%', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', marginBottom: '1.5rem' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '800', fontSize: '0.75rem', color: 'var(--primary-color)', letterSpacing: '1px', marginBottom: '0.8rem', textTransform: 'uppercase' }}>
                                        SOLANA WALLET (FOR NFT CERTIFICATES)
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <WalletMultiButton style={{ background: 'var(--primary-color)', borderRadius: '12px', height: '48px', fontFamily: 'inherit', fontWeight: 'bold' }} />
                                        {formData.address && (
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                                Linked: {formData.address.slice(0, 6)}...{formData.address.slice(-4)}
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ marginTop: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                        Securely connect your Phantom wallet. When you complete a course, the Studyverse backend will instantly mint your NFT Certificate to this verified address for free.
                                    </p>
                                </div>
                                <button type="submit" style={{ background: 'var(--primary-color)', alignSelf: 'flex-start', padding: '1rem 3rem' }}>
                                    Update Identity
                                </button>
                            </form>
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
        </section>
    );
};

export default ProfilePage;