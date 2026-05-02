// src/pages/ProfilePage.jsx

import React, { useState, useMemo, useEffect } from 'react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { Settings, BookOpen, Award, Link as LinkIcon, Globe, User, Edit3, CheckCircle, Code, MessageSquare, LogOut } from 'lucide-react';
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
    onLogout
}) => {
    const { disconnect } = useDisconnect();

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
        github_handle: user?.github_handle || ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                display_name: user.display_name || '',
                bio: user.bio || '',
                twitter_handle: user.twitter_handle || '',
                github_handle: user.github_handle || ''
            });
        }
    }, [user]);

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
                <div className="glass-panel" style={{ marginBottom: '4rem', padding: '4rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '10rem', opacity: 0.02, fontWeight: '900' }}>PORTFOLIO</div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center' }}>
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <h1 style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-1px' }}>{user.display_name || 'Anonymous Creator'}</h1>
                                {user.is_wallet_linked && <CheckCircle size={28} style={{ color: 'var(--primary-color)' }} />}
                            </div>
                            
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2.5rem', maxWidth: '600px' }}>{user.bio || 'Architecting decentralized futures.'}</p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                {user.address ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.03)', padding: '0.8rem 1.2rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px' }}>
                                        <LinkIcon size={16} color="var(--primary-color)" />
                                        <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>{user.address.slice(0, 6)}...{user.address.slice(-4)}</span>
                                    </div>
                                ) : (
                                    <button onClick={handleLinkWallet} disabled={isLinking} style={{ background: 'var(--primary-color)', color: '#fff' }}>
                                        {isLinking ? 'Linking...' : 'Connect Wallet'}
                                    </button>
                                )}
                                
                                <button onClick={handleSignOut} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#ef4444' }}>
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABS */}
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
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
                        <div>
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
                    )}

                    {activeTab === 'backpack' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '3rem' }}>
                            {certificates.map((cert, idx) => (
                                <div key={idx} className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
                                    <div style={{ width: '100%', aspectRatio: '1', background: 'rgba(255,255,255,0.02)', marginBottom: '2rem', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Award size={80} style={{ color: 'var(--primary-color)', opacity: 0.8 }} />
                                    </div>
                                    <h4 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem' }}>{cert.course}</h4>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>Verified: {new Date(cert.issued_at).toLocaleDateString()}</p>
                                    {cert.tx_hash ? (
                                        <button 
                                            onClick={() => window.open(`https://sepolia.etherscan.io/tx/${cert.tx_hash}`)} 
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem' }}
                                        >
                                            View Proof
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => onViewCourse(allCourses.find(c => c.id === cert.course_id))}
                                            style={{ width: '100%', background: 'var(--primary-color)', fontSize: '0.8rem' }}
                                        >
                                            Claim NFT
                                        </button>
                                    )}
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
                        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
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
                                        style={{ width: '100%', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} 
                                    />
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