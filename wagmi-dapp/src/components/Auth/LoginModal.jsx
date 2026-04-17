import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { X, Shield, Globe, Zap } from 'lucide-react';
import BrutalistButton from '../UI/BrutalistButton';

const LoginModal = ({ isOpen, onClose, onGoogleSuccess, onGoogleError, loginWithWallet, isAuthorized }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(8px)'
        }} onClick={onClose}>
            <div style={{
                background: '#fff',
                border: '8px solid #000',
                boxShadow: '20px 20px 0px #ff3e00',
                padding: '3rem',
                maxWidth: '900px', // Wider for horizontal layout
                width: '95%',
                position: 'relative',
                animation: 'modalSlide 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }} onClick={e => e.stopPropagation()}>
                
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        zIndex: 10
                    }}
                >
                    <X size={32} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ 
                        background: '#000', 
                        color: '#39ff14', 
                        display: 'inline-block', 
                        padding: '0.4rem 1rem', 
                        fontSize: '0.7rem', 
                        fontWeight: '900', 
                        textTransform: 'uppercase',
                        marginBottom: '1rem'
                    }}>
                        Identity Protocol v2.5
                    </div>
                    <h2 style={{ 
                        fontSize: '3rem', 
                        textTransform: 'uppercase', 
                        margin: 0, 
                        letterSpacing: '-2px',
                        lineHeight: 1
                    }}>
                        Sign into Studyverse
                    </h2>
                </div>

                <div className="login-options-container" style={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    gap: '2rem',
                    alignItems: 'stretch'
                }}>
                    
                    {/* WEB3 OPTION */}
                    <div style={{ 
                        flex: 1,
                        padding: '2rem', 
                        border: '4px solid #000', 
                        background: '#f0f0f0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <Shield size={24} />
                                <span style={{ fontWeight: '900', textTransform: 'uppercase' }}>On-Chain Identity</span>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '2rem' }}>
                                Connect your Ethereum wallet to verify ownership and access on-chain assets.
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
                                        // Wallet is connected but no JWT, trigger signature flow
                                        const success = await loginWithWallet();
                                        if (success) onClose();
                                    }
                                };

                                return (
                                    <div style={{ width: '100%' }}>
                                        <BrutalistButton 
                                            onClick={handleAction}
                                            style={{ 
                                                width: '100%', 
                                                background: isAuthorized ? '#fff' : (connected ? '#ff3e00' : '#39ff14'),
                                                border: '4px solid #000',
                                                color: isAuthorized ? '#000' : (connected ? '#fff' : '#000'),
                                                opacity: ready ? 1 : 0.5,
                                                cursor: ready ? 'pointer' : 'wait'
                                            }}
                                        >
                                            {ready ? (
                                                isAuthorized ? 'Authenticated ✓' : 
                                                (connected ? 'Finalize Auth (Sign Message)' : 'Connect Wallet')
                                            ) : 'Preparing...'}
                                        </BrutalistButton>
                                    </div>
                                );
                            }}
                        </ConnectButton.Custom>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '4px', flex: 1, background: '#000' }}></div>
                        <span style={{ fontWeight: '900', margin: '1rem 0' }}>OR</span>
                        <div style={{ width: '4px', flex: 1, background: '#000' }}></div>
                    </div>

                    {/* WEB2 OPTION */}
                    <div style={{ 
                        flex: 1,
                        padding: '2rem', 
                        border: '4px solid #000', 
                        background: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <Globe size={24} />
                                <span style={{ fontWeight: '900', textTransform: 'uppercase' }}>Social Passport</span>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '2rem' }}>
                                Use your Google account for a fast, gasless entry into the Studyverse.
                            </p>
                        </div>
                        <div style={{ width: '100%' }}>
                            <GoogleLogin
                                onSuccess={onGoogleSuccess}
                                onError={onGoogleError}
                                useOneTap
                                theme="filled_blue"
                                size="large"
                                text="continue_with"
                                shape="square"
                                width="300px" // Fixed width for better look in row
                            />
                        </div>
                    </div>
                </div>

                <div style={{ 
                    marginTop: '2rem', 
                    fontSize: '0.7rem', 
                    textAlign: 'center', 
                    fontWeight: '600',
                    color: '#888'
                }}>
                    By signing in, you agree to the decentralized protocol standards.
                </div>
            </div>

            <style>{`
                @keyframes modalSlide {
                    from { transform: translateY(40px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                .custom-rainbow-btn button {
                    width: 100% !important;
                }
            `}</style>
        </div>
    );
};

export default LoginModal;
