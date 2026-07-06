import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { X, Shield, Globe, Zap, ArrowRight, AlertCircle } from 'lucide-react';

const LoginModal = ({ isOpen, onClose, onGoogleSuccess, onGoogleError, loginWithWallet, isAuthorized }) => {
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleGoogleSuccessWrap = async (response) => {
        setError('');
        try {
            await onGoogleSuccess(response);
        } catch (err) {
            setError('Google login failed. Please try again.');
        }
    };

    const handleGoogleErrorWrap = () => {
        setError('Google login could not be initialized. Check your connection.');
        if (onGoogleError) onGoogleError();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            backdropFilter: 'blur(20px)'
        }} onClick={onClose}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(40px)',
                borderRadius: '40px',
                padding: '4rem',
                maxWidth: '1000px',
                width: '95%',
                position: 'relative',
                animation: 'modalFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.6)'
            }} onClick={e => e.stopPropagation()}>
                
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '2rem',
                        right: '2rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.8rem',
                        borderRadius: '50%',
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{ 
                        display: 'inline-block', 
                        padding: '0.4rem 1.2rem', 
                        background: 'rgba(79, 70, 229, 0.1)', 
                        border: '1px solid rgba(79, 70, 229, 0.2)', 
                        borderRadius: '100px',
                        color: '#a5b4fc',
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        marginBottom: '1.5rem',
                        letterSpacing: '1px'
                    }}>
                        IDENTITY PROTOCOL v3.0
                    </div>
                    <h2 style={{ 
                        fontSize: '3.5rem', 
                        fontWeight: '900',
                        margin: 0, 
                        letterSpacing: '-2px',
                        lineHeight: 1,
                        background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Establish Connectivity
                    </h2>
                    <p style={{ color: '#666', marginTop: '1.5rem', fontSize: '1.1rem' }}>Access the sovereign learning network through secure authentication layers.</p>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr', 
                    gap: '2.5rem',
                    maxWidth: '500px',
                    margin: '0 auto'
                }}>
                    
                    {/* WEB3 OPTION (Temporarily Disabled)
                    <div style={{ 
                        padding: '3rem', 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid rgba(255,255,255,0.05)', 
                        borderRadius: '32px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'all 0.3s'
                    }}>
                        <div>
                            <div style={{ width: '40px', height: '40px', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                                <Shield size={20} color="#a5b4fc" />
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1rem', color: '#fff' }}>On-Chain Node</h3>
                            <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', marginBottom: '2rem' }}>
                                Connect your Ethereum wallet to verify institutional ownership and manage cryptographic signatures.
                            </p>
                        </div>
                        
                        <ConnectButton.Custom>
                            {({ account, chain, openConnectModal, authenticationStatus, mounted }) => {
                                const ready = mounted && authenticationStatus !== 'loading';
                                const connected = ready && account && chain;
                                
                                const handleAction = async (e) => {
                                    e.preventDefault();
                                    if (!connected) {
                                        if (openConnectModal) openConnectModal();
                                    } else if (!isAuthorized) {
                                        const result = await loginWithWallet();
                                        if (result && result.success) onClose();
                                    }
                                };

                                return (
                                    <button 
                                        onClick={handleAction}
                                        style={{ 
                                            width: '100%', 
                                            background: connected && !isAuthorized ? '#fff' : 'var(--primary-color)',
                                            color: connected && !isAuthorized ? '#000' : '#fff',
                                            padding: '1.2rem',
                                            borderRadius: '16px',
                                            fontWeight: '800',
                                            fontSize: '1rem',
                                            border: 'none',
                                            cursor: ready ? 'pointer' : 'wait',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '1rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {isAuthorized ? 'IDENTIFIED ✓' : (connected ? 'SIGN PROTOCOL' : 'CONNECT WALLET')}
                                        <ArrowRight size={18} />
                                    </button>
                                );
                            }}
                        </ConnectButton.Custom>
                    </div>
                    */}

                    {/* WEB2 OPTION */}
                    <div style={{ 
                        padding: '3rem', 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid rgba(255,255,255,0.05)', 
                        borderRadius: '32px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                                <Globe size={20} color="#fff" />
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1rem', color: '#fff' }}>Social Gateway</h3>
                            <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', marginBottom: '2rem' }}>
                                Access the network through standard social identity providers for a fast, gasless experience.
                            </p>
                        </div>
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {error && (
                                <div style={{ 
                                    background: 'rgba(220, 38, 38, 0.1)', 
                                    border: '1px solid rgba(220, 38, 38, 0.2)', 
                                    color: '#f87171', 
                                    padding: '0.8rem 1rem', 
                                    borderRadius: '8px', 
                                    fontSize: '0.85rem', 
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    width: '100%'
                                }}>
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}
                            <GoogleLogin
                                onSuccess={handleGoogleSuccessWrap}
                                onError={handleGoogleErrorWrap}
                                useOneTap={false}
                                theme="filled_black"
                                shape="pill"
                                width="320"
                            />
                        </div>

                    </div>
                </div>

                <div style={{ 
                    marginTop: '3rem', 
                    fontSize: '0.75rem', 
                    textAlign: 'center', 
                    color: '#444',
                    letterSpacing: '0.5px'
                }}>
                    BY AUTHENTICATING, YOU AGREE TO THE SOVEREIGN EDUCATION MANIFESTO.
                </div>
            </div>

            <style>{`
                @keyframes modalFadeIn {
                    from { transform: translateY(20px); opacity: 0; filter: blur(10px); }
                    to { transform: translateY(0); opacity: 1; filter: blur(0); }
                }
            `}</style>
        </div>
    );
};

export default LoginModal;
