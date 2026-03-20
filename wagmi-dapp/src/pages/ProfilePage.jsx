import React, { useState, useMemo } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import LoadingSpinner from '../components/Feedback/LoadingSpinner';
import BrutalistButton from '../components/UI/BrutalistButton';
import CourseCard from '../components/Card/CourseCard';

const ProfilePage = ({ user, certificates, loading, theme, toggleTheme, allCourses, onViewCourse }) => {
    const { address, isConnected, chain } = useAccount();
    const { data: balanceData } = useBalance({ address });
    const { disconnect } = useDisconnect();

    const [copied, setCopied] = useState(false);

    // Filter allCourses to find the ones the user is enrolled in
    const enrolledCourses = useMemo(() => {
        if (!user || !allCourses) return [];
        const enrolledIds = user.enrollments?.map(enr => enr.course_id) || [];
        return allCourses.filter(course => enrolledIds.includes(course.id));
    }, [user, allCourses]);

    const handleCopyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isConnected) {
        return (
            <section className="page active">
                <div className="container">
                    <div className="form-container" style={{ textAlign: 'center' }}>
                        <h2>Connect Wallet</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            Please connect your wallet to view your dashboard
                        </p>
                        <ConnectButton />
                    </div>
                </div>
            </section>
        );
    }

    if (loading || !user) {
        return (
            <section className="page active">
                <div className="container">
                    <div style={{ textAlign: 'center', padding: '5rem' }}>
                        <h2>Syncing Dashboard...</h2>
                        <LoadingSpinner />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="page active">
            <div className="container" style={{ maxWidth: '1200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', borderBottom: '4px solid #000', paddingBottom: '1rem' }}>
                    <h2 style={{ fontSize: '2.5rem', textTransform: 'uppercase', margin: 0 }}>Learner Dashboard</h2>
                    <span className="badge">{user.username || address.slice(0, 8)}</span>
                </div>
                
                <div className="profile-layout">
                    {/* SECTION 1: Web 3 Overview */}
                    <div className="profile-column">
                        <div className="profile-card">
                            <h3 className="card-header">Web3 Identity</h3>
                            
                            <div className="info-block">
                                <div className="info-label">Wallet</div>
                                <div className="wallet-copy-container" onClick={handleCopyAddress} style={{ cursor: 'pointer' }}>
                                    <span style={{ fontSize: '0.8rem' }} className="text-ellipsis">{address}</span>
                                    <span style={{ marginLeft: '0.5rem' }}>{copied ? '✓' : '⧉'}</span>
                                </div>
                            </div>

                            <div className="stats-grid" style={{ marginTop: '1.5rem' }}>
                                <div className="stat-box">
                                    <div className="stat-value">{user.enrollments?.length || 0}</div>
                                    <div className="stat-label">Courses</div>
                                </div>
                                <div className="stat-box">
                                    <div className="stat-value">{certificates.length}</div>
                                    <div className="stat-label">NFT Certs</div>
                                </div>
                            </div>

                            <div className="info-block" style={{ marginTop: '2rem' }}>
                                <BrutalistButton onClick={() => disconnect()} style={{ width: '100%', background: '#eee' }}>Disconnect</BrutalistButton>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Main Learning Feed */}
                    <div className="profile-column" style={{ flex: 2 }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ textTransform: 'uppercase', marginBottom: '1.5rem' }}>My Courses</h3>
                            
                            {enrolledCourses.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
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
                                <div style={{ padding: '3rem', textAlign: 'center', background: '#f9f9f9', border: '2px dashed #000' }}>
                                    <p>You haven't enrolled in any courses yet.</p>
                                    <BrutalistButton onClick={() => window.location.hash = 'courses'}>Explore Catalog</BrutalistButton>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION 3: Settings */}
                    <div className="profile-column">
                         <div className="profile-card">
                            <h3 className="card-header">Preferences</h3>
                            <BrutalistButton onClick={toggleTheme} style={{ width: '100%' }}>
                                {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                            </BrutalistButton>
                         </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProfilePage;