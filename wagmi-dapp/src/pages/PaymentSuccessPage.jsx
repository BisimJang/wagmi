import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Shield, Sparkles } from 'lucide-react';
import { apiCall } from '../api/api';

const PaymentSuccessPage = ({ showPage }) => {
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Call the backend to verify subscription status from Adi-Sanlo
                const data = await apiCall('/auth/billing/status/');
                
                if (data && data.is_premium) {
                    setStatus('success');
                    // Automatically redirect to courses after a few seconds
                    setTimeout(() => {
                        showPage('courses');
                    }, 4000);
                } else {
                    setStatus('error');
                    setErrorMessage("Payment verification is pending or incomplete. It may take a few minutes for the blockchain/network to confirm.");
                }
            } catch (err) {
                console.error("Verification failed", err);
                setStatus('error');
                setErrorMessage("Failed to verify payment status with the server.");
            }
        };

        verifyPayment();
    }, [showPage]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
            background: '#fff',
            fontFamily: "'Poppins', sans-serif"
        }}>
            {/* Background effects */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: status === 'success' ? 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(circle, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)', zIndex: 0 }} />

            <div style={{ 
                padding: '4rem', 
                maxWidth: '500px', 
                width: '100%', 
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
                background: '#fff',
                borderRadius: '24px',
                border: status === 'success' ? '1px solid rgba(16,185,129,0.3)' : '1px solid #e5e7eb',
                boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
            }}>
                
                {status === 'verifying' && (
                    <>
                        <div style={{ width: '60px', height: '60px', margin: '0 auto 2rem auto', border: '4px solid #f3f4f6', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#111', fontWeight: '800' }}>Verifying Transaction...</h2>
                        <p style={{ color: '#666' }}>Please wait while we confirm your payment with the Adi-Sanlo network.</p>
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    </>
                )}

                {status === 'success' && (
                    <div style={{ animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            background: 'rgba(16, 185, 129, 0.1)', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            margin: '0 auto 2rem auto',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}>
                            <CheckCircle size={40} color="#10b981" />
                        </div>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#111', fontWeight: '800' }}>Access Granted</h2>
                        <p style={{ color: '#666', marginBottom: '2rem' }}>
                            Your node has been upgraded to premium status. You now have full sovereign access to the network.
                        </p>
                        <div style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1.5rem', 
                            background: '#f3f4f6', 
                            borderRadius: '100px',
                            color: '#4b5563',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}>
                            <Sparkles size={16} /> Redirecting to your dashboard...
                        </div>
                        <style>{`@keyframes popIn { 0% { opacity: 0; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }`}</style>
                    </div>
                )}

                {status === 'error' && (
                    <div style={{ animation: 'fadeIn 0.3s ease-out forwards' }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            margin: '0 auto 2rem auto',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                            <AlertCircle size={40} color="#ef4444" />
                        </div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#111', fontWeight: '800' }}>Pending Verification</h2>
                        <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.6' }}>
                            {errorMessage}
                        </p>
                        <button onClick={() => showPage('pricing')} style={{ 
                            width: '100%', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            background: '#000',
                            color: '#fff',
                            padding: '1.2rem',
                            borderRadius: '100px',
                            border: 'none',
                            fontWeight: '700',
                            cursor: 'pointer'
                        }}>
                            Return to Pricing
                        </button>
                        <style>{`@keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }`}</style>
                    </div>
                )}
            </div>
            
            <div style={{ position: 'absolute', bottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>
                <Shield size={16} /> Secured by Adi-Sanlo Network
            </div>
        </div>
    );
};

export default PaymentSuccessPage;
