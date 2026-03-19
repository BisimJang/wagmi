// src/pages/ProfilePage.jsx

import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import LoadingSpinner from '../components/Feedback/LoadingSpinner';
import BrutalistButton from '../components/UI/BrutalistButton';

const ProfilePage = ({ isConnected, address, user, certificates, loading, theme, toggleTheme }) => {
    const { data: balanceData } = useBalance({ address });
    const { disconnect } = useDisconnect();

    const [copied, setCopied] = useState(false);

    const handleCopyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Logic to determine content based on connection and data status
    if (!isConnected) {
        return (
            <section className="page active">
                <div className="container">
                    <div className="form-container">
                        <h2>Connect Wallet</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            Please connect your wallet to view your profile
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
                    <div className="form-container">
                        <h2>Loading Profile...</h2>
                        <LoadingSpinner />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="page active">
            <div className="container" style={{ maxWidth: '1200px' }}>
                <h2 style={{ marginBottom: '2rem', textTransform: 'uppercase', borderBottom: '3px solid #000', paddingBottom: '0.5rem' }}>
                    Student Profile
                </h2>
                
                <div className="profile-layout">
                    {/* SECTION 1: Web 3 adjustment */}
                    <div className="profile-column">
                        <div className="profile-card">
                            <h3 className="card-header">Web3 Overview</h3>
                            
                            <div className="info-block">
                                <div className="info-label">Wallet Address</div>
                                <div className="wallet-copy-container" onClick={handleCopyAddress}>
                                    <span className="info-value text-ellipsis" title={address}>
                                        {address}
                                    </span>
                                    <button className="btn-icon" title="Copy Address">
                                        {copied ? '✓' : '⧉'}
                                    </button>
                                </div>
                            </div>

                            <div className="info-block">
                                <div className="info-label">Network</div>
                                <div className="info-value" style={{ color: chain ? 'var(--primary-color)' : 'var(--error)' }}>
                                    {chain ? chain.name : 'Unsupported Network'}
                                </div>
                            </div>

                            <div className="info-block">
                                <div className="info-label">Wallet Amount</div>
                                <div className="info-value">
                                    {balanceData ? `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` : 'Loading...'}
                                </div>
                            </div>

                            <div className="info-block" style={{ marginTop: '2rem' }}>
                                <BrutalistButton onClick={() => disconnect()} style={{ background: 'var(--surface)', color: 'var(--text)' }}>
                                    Change Wallet
                                </BrutalistButton>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Courses */}
                    <div className="profile-column">
                        <div className="profile-card">
                            <h3 className="card-header">Courses & Progress</h3>
                            
                            <div className="stats-grid">
                                <div className="stat-box">
                                    <div className="stat-value">{user.enrollments?.length || 0}</div>
                                    <div className="stat-label">Enrolled</div>
                                </div>
                                <div className="stat-box">
                                    <div className="stat-value">{certificates.length}</div>
                                    <div className="stat-label">Certificates</div>
                                </div>
                            </div>

                            <div className="info-block" style={{ marginTop: '1.5rem' }}>
                                <div className="info-label">Current Courses</div>
                                {user.enrollments && user.enrollments.length > 0 ? (
                                    <ul className="course-list">
                                        {user.enrollments.map((enr, i) => (
                                            <li key={i} className="course-list-item">
                                                {enr.course_title || `Course ID: ${enr.course_id}`}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No current courses.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Basic Settings */}
                    <div className="profile-column">
                        <div className="profile-card">
                            <h3 className="card-header">Basic Settings</h3>
                            
                            <div className="info-block">
                                <div className="info-label">Username</div>
                                <div className="info-value">{user.username || 'Anonymous Learner'}</div>
                            </div>

                            <div className="info-block" style={{ marginTop: '1.5rem' }}>
                                <div className="info-label">Theme Preference</div>
                                <BrutalistButton onClick={toggleTheme} style={{ marginTop: '0.5rem', background: 'var(--surface)', color: 'var(--text)' }}>
                                    Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
                                </BrutalistButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProfilePage;