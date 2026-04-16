import React, { useState, useEffect } from 'react';
import { Monitor, X } from 'lucide-react';

const DesktopRecommendation = () => {
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        // Only show if on mobile and hasn't been dismissed
        const isMobile = window.innerWidth <= 768;
        const isDismissed = localStorage.getItem('hideDesktopRecommendation') === 'true';
        
        if (isMobile && !isDismissed) {
            setIsVisible(true);
        }
    }, []);

    const dismiss = () => {
        setIsVisible(false);
        localStorage.setItem('hideDesktopRecommendation', 'true');
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '80px', // Above bottom nav
            left: '1rem',
            right: '1rem',
            background: '#000',
            color: '#fff',
            padding: '1rem',
            border: '3px solid #39ff14',
            boxShadow: '8px 8px 0 rgba(57, 255, 20, 0.4)',
            zIndex: 1500,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
        }}>
            <div style={{ background: '#39ff14', padding: '0.5rem', borderRadius: '50%' }}>
                <Monitor size={20} color="#000" />
            </div>
            
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Desktop Experience Recommended
                </p>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.65rem', opacity: 0.8 }}>
                    Use Studyverse on Desktop for the full free-form Studio & Workspace tools.
                </p>
            </div>

            <button 
                onClick={dismiss}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem' }}
            >
                <X size={20} />
            </button>
        </div>
    );
};

export default DesktopRecommendation;
