// src/pages/HomePage.jsx

import React from 'react';

const HomePage = ({ stats, user, certificates, showPage }) => {
    return (
        <section className="page active">
            <div className="hero">
                <div className="container">
                    <h1>Welcome to Studyverse</h1>
                    <p>Your gateway to Web3 education. Learn blockchain, DeFi, NFTs, and more with hands-on courses and earn verifiable certificates.</p>
                    <button onClick={() => showPage('courses')} className="btn">
                        Explore Courses
                    </button>
                </div>
            </div>
            
            <div className="container">
                <div className="stats">
                    <div className="stat-card">
                        <div className="stat-number">{stats.totalCourses}</div>
                        <div>Total Courses</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{user?.enrolledCourses?.length || 0}</div>
                        <div>Enrolled Courses</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{certificates.length}</div>
                        <div>Certificates Earned</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomePage;