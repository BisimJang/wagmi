import React, { useState } from 'react';
import { Zap, Mail } from 'lucide-react';

const InstitutionPage = ({ showPage, loginWithEmail }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        const success = await loginWithEmail(email, password);
        if (success) {
            showPage('courses');
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', minHeight: '80vh' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div style={{ 
                    display: 'inline-block', 
                    padding: '0.4rem 1.2rem', 
                    background: 'rgba(251, 191, 36, 0.1)', 
                    border: '1px solid rgba(251, 191, 36, 0.2)', 
                    borderRadius: '100px',
                    color: '#fbbf24',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    marginBottom: '1.5rem',
                    letterSpacing: '1px'
                }}>
                    BaaS NODE
                </div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>
                    Institutional Gateway
                </h1>
                <p style={{ color: '#666', marginTop: '1.5rem', fontSize: '1.1rem', maxWidth: '600px', margin: '1.5rem auto 0' }}>
                    Access your private curriculum or learn how to deploy the Studyverse framework at your institution.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                
                {/* Login Section */}
                <div style={{ 
                    padding: '3rem', 
                    background: 'var(--surface)', 
                    border: '1px solid var(--glass-border)', 
                    borderRadius: '24px',
                }}>
                    <div style={{ width: '40px', height: '40px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                        <Zap size={20} color="#fbbf24" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Student Login</h3>
                    <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.6' }}>
                        If you have been provisioned an account by your university or school, login here to access your private courses.
                    </p>
                    
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input 
                            type="email" 
                            placeholder="Student Email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(0,0,0,0.2)',
                                color: '#111',
                                outline: 'none'
                            }}
                        />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(0,0,0,0.2)',
                                color: '#111',
                                outline: 'none'
                            }}
                        />
                        <button 
                            type="submit"
                            style={{ 
                                background: '#fbbf24',
                                color: '#000',
                                padding: '1rem',
                                borderRadius: '12px',
                                fontWeight: '800',
                                fontSize: '1rem',
                                border: 'none',
                                cursor: 'pointer',
                                marginTop: '1rem'
                            }}
                        >
                            Enter Portal
                        </button>
                    </form>
                </div>

                {/* For Institutions Section */}
                <div style={{ 
                    padding: '3rem', 
                    background: 'var(--surface)', 
                    border: '1px solid var(--glass-border)', 
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ width: '40px', height: '40px', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                            <Mail size={20} color="#a5b4fc" />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>For Institutions</h3>
                        <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.6' }}>
                            Are you an institution and want to use the student framework? Contact us to set up your own sovereign school node, mint private courses, and provision student accounts via our API.
                        </p>
                    </div>
                    
                    <a href="mailto:contact@studyverse.com" style={{ 
                        background: 'var(--primary-color)',
                        color: '#111',
                        padding: '1rem',
                        borderRadius: '12px',
                        fontWeight: '800',
                        fontSize: '1rem',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'block'
                    }}>
                        Contact Team
                    </a>
                </div>

            </div>
        </div>
    );
};

export default InstitutionPage;
