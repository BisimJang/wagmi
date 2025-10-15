// src/pages/CertificatesPage.jsx

import React from 'react';
import CertificateCard from '../components/Card/CertificateCard.jsx';

const CertificatesPage = ({ isConnected, certificates }) => {
    return (
        <section className="page active">
            <div className="container">
                <h2 style={{ textAlign: 'center', margin: '2rem 0', fontSize: '2.5rem' }}>
                    My Certificates
                </h2>
                {!isConnected ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Please connect your wallet to view certificates
                    </p>
                ) : certificates.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No certificates earned yet. Complete courses to earn certificates!
                    </p>
                ) : (
                    <div className="certificate-grid">
                        {certificates.map(certificate => (
                            <CertificateCard key={certificate.id} certificate={certificate} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default CertificatesPage;