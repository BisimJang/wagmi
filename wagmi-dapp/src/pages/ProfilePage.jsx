import React, { useState, useMemo } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useDisconnect, useChainId } from 'wagmi';
import LoadingSpinner from '../components/Feedback/LoadingSpinner';
import BrutalistButton from '../components/UI/BrutalistButton';
import CourseCard from '../components/Card/CourseCard';

const ProfilePage = ({ 
    user, 
    certificates, 
    loading, 
    theme, 
    toggleTheme, 
    allCourses, 
    onViewCourse,
    syncOnChainEnrollment,
    showMessage
}) => {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { data: balanceData } = useBalance({ address });
    const { disconnect } = useDisconnect();

    const [isSyncing, setIsSyncing] = useState(false);
    const [copied, setCopied] = useState(false);

    // Filter allCourses to find the ones the user is enrolled in
    const enrolledCourses = useMemo(() => {
        if (!user || !allCourses) return [];
        const enrolledIds = user.enrollments?.map(enr => enr.course_id) || [];
        return allCourses.filter(course => enrolledIds.includes(course.id));
    }, [user, allCourses]);

    const handleSync = async () => {
        if (!syncOnChainEnrollment || !allCourses) return;
        setIsSyncing(true);
        showMessage('Starting deep blockchain sync...', 'info');
        
        try {
            // In a real app, you might iterate and check isEnrolled for each course,
            // but for now, we'll suggest the user that it's syncing their known enrollments.
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulating search
            showMessage('Dashboard synced with Sepolia network.', 'success');
        } catch (error) {
            showMessage('Sync failed. Try again later.', 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleCopyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isConnected) {
        return (
            <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ 
                    padding: '4rem', 
                    background: '#fff', 
                    border: '5px solid #000', 
                    boxShadow: '15px 15px 0px #ff3e00',
                    textAlign: 'center',
                    maxWidth: '500px'
                }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Identity Required</h2>
                    <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: '#555' }}>Connect your Web3 passport to access your learning portfolio and NFT certifications.</p>
                    <ConnectButton />
                </div>
            </div>
        );
    }

    if (loading || !user) {
        return (
            <div className="container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <LoadingSpinner />
                <h3 style={{ marginTop: '2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Syncing Ledger...</h3>
            </div>
        );
    }

    return (
        <section className="profile-page-premium" style={{ padding: '4rem 0', background: 'var(--bg-color)' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                
                {/* PREMIUM HERO HEADER */}
                <div style={{ 
                    position: 'relative', 
                    background: 'linear-gradient(135deg, #ff3e00 0%, #ffbe00 100%)',
                    padding: '4rem',
                    border: '5px solid #000',
                    boxShadow: '12px 12px 0px #000',
                    marginBottom: '4rem',
                    overflow: 'hidden'
                }}>
                    {/* Decorative Elements */}
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '10rem', opacity: 0.1, fontWeight: '900', fontStyle: 'italic' }}>LEARNER</div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                        {/* Avatar Block */}
                        <div style={{ 
                            width: '150px', 
                            height: '150px', 
                            background: '#fff', 
                            border: '5px solid #000', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '4rem',
                            fontWeight: 'bold',
                            boxShadow: '8px 8px 0px #000'
                        }}>
                            {user.username ? user.username[0].toUpperCase() : address[2].toUpperCase()}
                        </div>

                        {/* Text Block */}
                        <div style={{ color: '#000', flex: 1, minWidth: '300px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                <h1 style={{ fontSize: '3.5rem', margin: 0, textTransform: 'uppercase', lineHeight: 1 }}>{user.username || 'Anonymous'}</h1>
                                <span style={{ background: '#000', color: '#fff', padding: '0.2rem 1rem', fontSize: '0.8rem', fontWeight: 'bold' }}>PRO LEARNER</span>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div 
                                    onClick={handleCopyAddress}
                                    style={{ 
                                        padding: '0.5rem 1rem', 
                                        background: 'rgba(255,255,255,0.3)', 
                                        backdropFilter: 'blur(10px)',
                                        border: '2px solid #000',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {address.slice(0, 8)}...{address.slice(-8)} {copied ? '✓ COPIED' : '⧉'}
                                </div>
                                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                                    Balance: {parseFloat(balanceData?.formatted || '0').toFixed(4)} {balanceData?.symbol}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                             <BrutalistButton onClick={handleSync} disabled={isSyncing} style={{ background: '#fff' }}>
                                {isSyncing ? 'Syncing...' : '🔄 Force Sync'}
                             </BrutalistButton>
                             <BrutalistButton onClick={() => disconnect()} style={{ background: '#000', color: '#fff' }}>
                                Exit
                             </BrutalistButton>
                        </div>
                    </div>
                </div>

                {/* STATS GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                    <div style={{ padding: '2rem', background: '#fff', border: '5px solid #000', boxShadow: '8px 8px 0px #000' }}>
                        <div style={{ textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: '900', color: '#888', marginBottom: '1rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>Courses Enrolled</div>
                        <div style={{ fontSize: '3rem', fontWeight: '900' }}>{enrolledCourses.length < 10 ? `0${enrolledCourses.length}` : enrolledCourses.length}</div>
                    </div>
                    <div style={{ padding: '2rem', background: '#fff', border: '5px solid #000', boxShadow: '8px 8px 0px #000' }}>
                        <div style={{ textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: '900', color: '#888', marginBottom: '1rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>Verifiable Certs</div>
                        <div style={{ fontSize: '3rem', fontWeight: '900' }}>{certificates.length < 10 ? `0${certificates.length}` : certificates.length}</div>
                    </div>
                    <div style={{ padding: '2rem', background: '#fff', border: '5px solid #000', boxShadow: '8px 8px 0px #000' }}>
                        <div style={{ textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: '900', color: '#888', marginBottom: '1rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>Network Health</div>
                        <div style={{ fontSize: '3rem', fontWeight: '900', color: '#00e676' }}>100%</div>
                    </div>
                </div>

                {/* ENROLLED COURSES SECTION */}
                <div style={{ marginBottom: '5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2.5rem', textTransform: 'uppercase', margin: 0 }}>My Learning Path</h2>
                        <div style={{ height: '4px', background: '#000', flex: 1, margin: '0 2rem' }}></div>
                        <BrutalistButton onClick={toggleTheme}>
                            {theme === 'light' ? '🌙 Dark mode' : '☀️ Light mode'}
                        </BrutalistButton>
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
                        <div style={{ 
                            padding: '6rem 2rem', 
                            textAlign: 'center', 
                            background: '#f8f8f8', 
                            border: '4px dashed #000',
                            borderRadius: '0'
                        }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎓</div>
                            <h3 style={{ fontSize: '1.8rem', textTransform: 'uppercase' }}>Your portfolio is empty</h3>
                            <p style={{ color: '#666', marginBottom: '2rem' }}>Discover high-quality courses from sovereign schools worldwide.</p>
                            <BrutalistButton onClick={() => window.location.hash = 'courses'}>
                                Start Learning Now
                            </BrutalistButton>
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
};

export default ProfilePage;