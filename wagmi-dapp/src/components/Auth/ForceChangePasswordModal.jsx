import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

const ForceChangePasswordModal = ({ isOpen, onSuccess, showMessage }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password.length < 6) {
            showMessage('Password must be at least 6 characters', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/auth/change-password/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                },
                body: JSON.stringify({ new_password: password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage('Password updated successfully!', 'success');
                onSuccess(); // Triggers a reload of user profile to clear the flag
            } else {
                showMessage(data.error || 'Failed to update password', 'error');
            }
        } catch (error) {
            showMessage('Network error while updating password', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="glass-panel" style={{
                maxWidth: '400px',
                width: '90%',
                padding: '3rem',
                border: '1px solid #ff4d4d',
                textAlign: 'center'
            }}>
                <ShieldAlert size={48} color="#ff4d4d" style={{ marginBottom: '1.5rem' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1rem', color: '#fff' }}>Change Required</h2>
                <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    Your account was provisioned by your institution. For security reasons, you must set a new personal password before you can continue.
                </p>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <input 
                        type="password" 
                        placeholder="New Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', width: '100%' }}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Confirm New Password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', width: '100%' }}
                        required
                    />
                    
                    <button type="submit" disabled={isLoading} style={{
                        background: '#ff4d4d',
                        color: '#fff',
                        padding: '1rem',
                        borderRadius: '8px',
                        fontWeight: '800',
                        marginTop: '1rem'
                    }}>
                        {isLoading ? 'Updating...' : 'Set New Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForceChangePasswordModal;
