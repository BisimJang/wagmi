// src/pages/SchoolsPage.jsx

import React, { useEffect } from 'react';
import BrutalistButton from '../components/UI/BrutalistButton';

const SchoolsPage = ({ schools, fetchSchools, isSchoolLoading }) => {
    useEffect(() => {
        fetchSchools();
    }, [fetchSchools]);

    if (isSchoolLoading && schools.length === 0) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
                <div className="loading-spinner"></div>
                <p>Locating Sovereign Schools...</p>
            </div>
        );
    }

    return (
        <section className="page active">
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '4px solid #000', paddingBottom: '1rem' }}>
                    <h2 style={{ fontSize: '2.5rem', textTransform: 'uppercase', margin: 0 }}>Sovereign Schools</h2>
                    <span className="badge" style={{ fontSize: '1.2rem' }}>{schools.length} Active</span>
                </div>

                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '800px' }}>
                    Browse independent educational institutions deployed on the Studyverse protocol. 
                    Each school is a sovereign smart contract owned and managed by its creator.
                </p>

                <div className="grid">
                    {schools.length > 0 ? (
                        schools.map((school, i) => (
                            <div key={i} className="card school-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                    Deployed School
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{school.name}</h3>
                                
                                <div className="info-block" style={{ margin: '1rem 0' }}>
                                    <div className="info-label">Contract Address</div>
                                    <div className="info-value text-ellipsis" style={{ fontSize: '0.9rem', background: '#f0f0f0', padding: '0.5rem', borderRadius: '4px' }}>
                                        {school.address}
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto' }}>
                                    <BrutalistButton style={{ width: '100%' }} onClick={() => window.open(`https://sepolia.etherscan.io/address/${school.address}`, '_blank')}>
                                        View on Etherscan
                                    </BrutalistButton>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: '#f9f9f9', border: '2px dashed #ccc' }}>
                            <p>No schools have been minted on-chain yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default SchoolsPage;
