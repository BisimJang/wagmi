import React, { useState, useEffect } from 'react';
import { Check, Zap, AlertCircle, Shield, Sparkles } from 'lucide-react';
import { apiCall } from '../api/api';

const PricingPage = ({ showPage, user }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await apiCall('/auth/billing/plans/');
                setPlans(data || []);
            } catch (err) {
                console.error("Failed to fetch plans", err);
                setError("Unable to load subscription plans at this time.");
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleSubscribe = async (planId) => {
        if (!user) {
            showPage('login');
            return;
        }
        setProcessingId(planId);
        try {
            const callbackUrl = `${window.location.origin}/payment-success`;
            const data = await apiCall('/auth/billing/subscribe/', {
                method: 'POST',
                body: JSON.stringify({
                    plan_id: planId,
                    callback_url: callbackUrl
                })
            });
            
            if (data && data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (err) {
            console.error("Subscription failed", err);
            setError("Failed to initiate checkout. Please try again.");
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(79, 70, 229, 0.3)', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <div style={{ color: 'var(--text-secondary)' }}>Loading access protocols...</div>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            padding: '6rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: '#fff',
            fontFamily: "'Poppins', sans-serif"
        }}>
            {/* Background effects (removed dark theme glows) */}
            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '1200px', textAlign: 'center' }}>
                
                <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 1.2rem', 
                    background: '#f3f4f6', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '100px',
                    color: '#4b5563',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    marginBottom: '2rem',
                    letterSpacing: '1px'
                }}>
                    <Sparkles size={14} /> SOVEREIGN ACCESS
                </div>

                <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', letterSpacing: '-1.5px', color: '#111', fontWeight: '800' }}>
                    Unlock the Network
                </h1>
                
                <p style={{ color: '#666', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 4rem auto', lineHeight: '1.6' }}>
                    Upgrade your node to premium status to access unrestricted sovereign education, AI mentors, and institutional gateways.
                </p>

                {error && (
                    <div style={{ 
                        background: 'rgba(220, 38, 38, 0.1)', 
                        border: '1px solid rgba(220, 38, 38, 0.2)', 
                        color: '#f87171', 
                        padding: '1rem', 
                        borderRadius: '12px', 
                        marginBottom: '3rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        maxWidth: '500px'
                    }}>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    justifyContent: 'center', 
                    gap: '2rem',
                    alignItems: 'stretch'
                }}>
                    {plans.length === 0 && !error ? (
                        <div style={{ padding: '3rem', color: '#666', background: '#fff', borderRadius: '24px', border: '1px solid #eee' }}>
                            No active plans found. Please check Adi-Sanlo dashboard.
                        </div>
                    ) : (
                        plans.map((plan, idx) => (
                            <div key={plan.id} style={{ 
                                padding: '3rem', 
                                width: '350px',
                                display: 'flex',
                                flexDirection: 'column',
                                textAlign: 'left',
                                position: 'relative',
                                overflow: 'hidden',
                                transform: idx === 1 ? 'scale(1.05)' : 'scale(1)',
                                borderColor: idx === 1 ? '#000' : '#e5e7eb',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderRadius: '24px',
                                background: '#fff',
                                boxShadow: idx === 1 ? '0 20px 40px rgba(0,0,0,0.1)' : '0 4px 6px rgba(0,0,0,0.02)',
                                zIndex: idx === 1 ? 2 : 1
                            }}>
                                {idx === 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '1.5rem',
                                        right: '-2rem',
                                        background: '#000',
                                        color: '#fff',
                                        padding: '0.2rem 3rem',
                                        transform: 'rotate(45deg)',
                                        fontSize: '0.7rem',
                                        fontWeight: '800',
                                        letterSpacing: '1px'
                                    }}>
                                        RECOMMENDED
                                    </div>
                                )}
                                
                                <h3 style={{ fontSize: '1.8rem', color: '#111', marginBottom: '0.5rem', fontWeight: '700' }}>{plan.name}</h3>
                                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#111', marginBottom: '1rem' }}>
                                    ₦{(plan.amount / 100).toLocaleString()} <span style={{ fontSize: '1rem', color: '#666', fontWeight: '500' }}>/ {plan.interval}</span>
                                </div>
                                <p style={{ color: '#666', marginBottom: '2rem', minHeight: '3rem', fontSize: '0.95rem' }}>
                                    {plan.description || "Full access to all premium features."}
                                </p>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', color: '#374151', fontSize: '0.95rem' }}>
                                        <Check size={18} color="#000" /> Unlimited Course Access
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', color: '#374151', fontSize: '0.95rem' }}>
                                        <Check size={18} color="#000" /> Vera AI Mentor
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', color: '#374151', fontSize: '0.95rem' }}>
                                        <Check size={18} color="#000" /> Verified Certificates
                                    </div>
                                    {idx > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', color: '#374151', fontSize: '0.95rem' }}>
                                            <Check size={18} color="#000" /> Priority Node Access
                                        </div>
                                    )}
                                </div>

                                <button 
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={processingId === plan.id}
                                    style={{
                                        width: '100%',
                                        marginTop: '2rem',
                                        background: idx === 1 ? '#000' : '#f9fafb',
                                        color: idx === 1 ? '#fff' : '#111',
                                        border: idx === 1 ? 'none' : '1px solid #e5e7eb',
                                        padding: '1.2rem',
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        borderRadius: '100px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        cursor: processingId === plan.id ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s ease',
                                        opacity: processingId === plan.id ? 0.7 : 1
                                    }}
                                    onMouseOver={(e) => {
                                        if (processingId !== plan.id) {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            if (idx !== 1) e.currentTarget.style.background = '#f3f4f6';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (processingId !== plan.id) {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            if (idx !== 1) e.currentTarget.style.background = '#f9fafb';
                                        }
                                    }}
                                >
                                    {processingId === plan.id ? (
                                        <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                    ) : (
                                        <>
                                            <Shield size={18} />
                                            {idx === 1 ? 'UPGRADE NOW' : 'SELECT PLAN'}
                                        </>
                                    )}
                                </button>
                            </div>
                        ))
                    )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <Shield size={16} /> Secure payments powered by Adi-Sanlo & Nomba
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
