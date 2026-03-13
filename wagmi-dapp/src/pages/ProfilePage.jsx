// src/pages/ProfilePage.jsx

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import LoadingSpinner from '../components/Feedback/LoadingSpinner'; 

const ProfilePage = ({ isConnected, address, user, certificates, loading }) => {
    
    // Logic to determine content based on connection and data status
    const renderProfileContent = () => {
        if (!isConnected) {
            return (
                <div className="form-container">
                    <h2>Connect Wallet</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Please connect your wallet to view your profile
                    </p>
                    <ConnectButton />
                </div>
            );
        }

        if (loading || !user) {
            return (
                <div className="form-container">
                    <h2>Loading Profile...</h2>
                    <LoadingSpinner />
                </div>
            );
        }

        return (
            <div className="profile-header">
                <h2>Student Profile</h2>
                <div className="profile-info">
                    <div className="info-item">
                        <div className="info-label">Wallet Address</div>
                        <div className="info-value">{address}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Enrolled Courses</div>
                        <div className="info-value">{user.enrollments?.length || 0}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Completed Courses</div>
                        <div className="info-value">{certificates.length}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Certificates</div>
                        <div className="info-value">{certificates.length}</div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section className="page active">
            <div className="container">
                {renderProfileContent()}
            </div>
        </section>
    );
};

export default ProfilePage;