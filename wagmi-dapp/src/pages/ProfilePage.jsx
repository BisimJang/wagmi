import React, { useState, useMemo, useEffect } from 'react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { Settings, BookOpen, Award, Link as LinkIcon, Globe, User, Edit3, CheckCircle, Code, MessageSquare } from 'lucide-react';
import LoadingSpinner from '../components/Feedback/LoadingSpinner';
import BrutalistButton from '../components/UI/BrutalistButton';
import CourseCard from '../components/Card/CourseCard';
import NftAvatarSelector from '../components/Profile/NftAvatarSelector';
import { apiCall } from '../api/api';

const ProfilePage = ({ 
    user, 
    certificates, 
    loading, 
    theme, 
    toggleTheme, 
    allCourses, 
    onViewCourse,
    syncOnChainEnrollment,
    showMessage,
    linkWallet,
    address: connectedAddress,
    onLogout
}) => {
    const { disconnect } = useDisconnect();
    const { data: balanceData } = useBalance({ address: connectedAddress });

    const handleSignOut = () => {
        disconnect();
        if (onLogout) onLogout();
    };

    const [activeTab, setActiveTab] = useState('path'); // 'path', 'backpack', 'settings'
    const [isNftSelectorOpen, setIsNftSelectorOpen] = useState(false);
    const [isLinking, setIsLinking] = useState(false);
    
    // Settings form state
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

    // Filter allCourses to find the ones the user is enrolled in
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
                <h3 style={{ marginTop: '2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Reading Passport...</h3>
            </div>
        );
    }

    return (
        <section className="profile-page-premium" style={{ padding: '4rem 0', background: 'var(--bg-color)' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                
                {/* 1. PREMIUM HERO HEADER (The Passport) */}
                <div style={{ 
                    position: 'relative', 
                    background: 'linear-gradient(135deg, #000 0%, #333 100%)',
                    padding: '3rem',
                    border: '8px solid #000',
                    boxShadow: '15px 15px 0px #000',
                    marginBottom: '4rem',
                    color: '#fff',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '8rem', opacity: 0.05, fontWeight: '900', fontStyle: 'italic' }}>PASSPORT</div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                        {/* Avatar Block */}
                        <div 
                            onClick={() => user.is_wallet_linked && setIsNftSelectorOpen(true)}
                            style={{ 
                                width: '180px', 
                                height: '180px', 
                                background: '#fff', 
                                border: '5px solid #39ff14', 
                                position: 'relative',
                                cursor: user.is_wallet_linked ? 'pointer' : 'default',
                                overflow: 'hidden'
                            }}
                        >
                            {user.profile_image ? (
                                <img src={user.profile_image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', fontWeight: 'bold', color: '#000' }}>
                                    {user.display_name?.[0] || user.address?.[2] || '?'}
                                </div>
                            )}
                            {user.is_wallet_linked && (
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(57, 255, 20, 0.9)', color: '#000', fontSize: '0.6rem', fontWeight: '900', textAlign: 'center', padding: '2px' }}>
                                    CHANGE NFT
                                </div>
                            )}
                        </div>

                        {/* Identity Block */}
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
                                <h1 style={{ fontSize: '3rem', margin: 0, textTransform: 'uppercase', lineHeight: 1 }}>{user.display_name || 'Anonymous'}</h1>
                                {user.is_wallet_linked && <CheckCircle size={24} style={{ color: '#39ff14' }} />}
                            </div>
                            
                            <p style={{ margin: '0 0 1.5rem 0', color: '#aaa', fontSize: '1.1rem', fontWeight: '500' }}>{user.bio || 'No bio provided.'}</p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                                {user.address ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', border: '1px solid #444' }}>
                                        <LinkIcon size={16} />
                                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{user.address.slice(0, 6)}...{user.address.slice(-4)}</span>
                                    </div>
                                ) : (
                                    <BrutalistButton onClick={handleLinkWallet} disabled={isLinking} style={{ background: '#39ff14', color: '#000', fontSize: '0.7rem' }}>
                                        {isLinking ? 'Linking...' : 'Connect Passport (Link Wallet)'}
                                    </BrutalistButton>
                                )}

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {user.twitter_handle && <MessageSquare size={20} style={{ cursor: 'pointer', color: '#39ff14' }} />}
                                    {user.github_handle && <Code size={20} style={{ cursor: 'pointer' }} />}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                             <BrutalistButton onClick={handleSignOut} style={{ background: '#ff3e00', color: '#fff' }}>
                                Sign Out
                             </BrutalistButton>
                             <BrutalistButton onClick={toggleTheme} style={{ background: '#fff', color: '#000' }}>
                                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                             </BrutalistButton>
                        </div>
                    </div>
                </div>

                {/* 2. TAB NAVIGATION */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '6px solid #000', paddingBottom: '1rem' }}>
                    {[
                        { id: 'path', label: 'Learning Path', icon: <BookOpen size={20} /> },
                        { id: 'backpack', label: 'Backpack', icon: <Award size={20} /> },
                        { id: 'settings', label: 'Settings', icon: <Settings size={20} /> }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '1rem 2rem',
                                border: '4px solid #000',
                                background: activeTab === tab.id ? '#000' : '#fff',
                                color: activeTab === tab.id ? '#39ff14' : '#000',
                                fontWeight: '900',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transform: activeTab === tab.id ? 'translate(-4px, -4px)' : 'none',
                                boxShadow: activeTab === tab.id ? '4px 4px 0 #000' : 'none',
                                transition: 'all 0.1s'
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* 3. TAB CONTENT */}
                <div style={{ minHeight: '400px' }}>
                    
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
                                <div style={{ padding: '6rem', textAlign: 'center', border: '5px dashed #000' }}>
                                    <BookOpen size={48} style={{ margin: '0 auto 1rem autof' }} />
                                    <h3 style={{ textTransform: 'uppercase' }}>No active courses</h3>
                                    <BrutalistButton onClick={() => window.location.hash = 'courses'}>Explore the Grid</BrutalistButton>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'backpack' && (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                                {certificates.map((cert, idx) => (
                                    <div key={idx} style={{ padding: '2rem', background: '#fff', border: '5px solid #000', boxShadow: '8px 8px 0px #000' }}>
                                        <div style={{ width: '100%', aspectRatio: '16/9', background: '#f0f0f0', marginBottom: '1.5rem', border: '3px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Award size={64} style={{ color: '#39ff14' }} />
                                        </div>
                                        <h4 style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '1.2rem' }}>{cert.course}</h4>
                                        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>MINTED: {new Date(cert.issued_at).toLocaleDateString()}</p>
                                        <BrutalistButton onClick={() => window.open(`https://sepolia.etherscan.io/tx/${cert.tx_hash}`)} style={{ width: '100%', fontSize: '0.7rem' }}>
                                            View On Explorer
                                        </BrutalistButton>
                                    </div>
                                ))}
                                {certificates.length === 0 && (
                                    <div style={{ gridColumn: '1/-1', padding: '6rem', textAlign: 'center', border: '5px dashed #000' }}>
                                        <Award size={48} style={{ margin: '0 auto 1rem autof' }} />
                                        <h3 style={{ textTransform: 'uppercase' }}>No certificates earned yet</h3>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div style={{ maxWidth: '600px', background: '#fff', border: '5px solid #000', padding: '3rem', boxShadow: '10px 10px 0 #000' }}>
                            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Public Display Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.display_name}
                                        onChange={e => setFormData({...formData, display_name: e.target.value})}
                                        style={{ width: '100%', padding: '1rem', border: '4px solid #000', fontSize: '1.1rem', fontWeight: '600' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Bio / Philosophy</label>
                                    <textarea 
                                        rows="3" 
                                        value={formData.bio}
                                        onChange={e => setFormData({...formData, bio: e.target.value})}
                                        style={{ width: '100%', padding: '1rem', border: '4px solid #000', fontSize: '1.1rem', fontWeight: '600' }} 
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Twitter Handle</label>
                                        <input 
                                            type="text" 
                                            value={formData.twitter_handle}
                                            onChange={e => setFormData({...formData, twitter_handle: e.target.value})}
                                            placeholder="@johndoe"
                                            style={{ width: '100%', padding: '1rem', border: '4px solid #000', fontSize: '1.1rem', fontWeight: '600' }} 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.5rem' }}>GitHub Handle</label>
                                        <input 
                                            type="text" 
                                            value={formData.github_handle}
                                            onChange={e => setFormData({...formData, github_handle: e.target.value})}
                                            placeholder="johndoe"
                                            style={{ width: '100%', padding: '1rem', border: '4px solid #000', fontSize: '1.1rem', fontWeight: '600' }} 
                                        />
                                    </div>
                                </div>
                                <BrutalistButton type="submit" style={{ background: '#39ff14', width: '200px' }}>
                                    Save Profile
                                </BrutalistButton>
                            </form>
                        </div>
                    )}

                </div>
            </div>

            {/* NFT SELECTOR OVERLAY */}
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