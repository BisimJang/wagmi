import React, { useState, useRef, useEffect } from 'react';
import { GripHorizontal, Minimize2, Maximize2, X } from 'lucide-react';

const DraggableWidget = ({ 
    id, 
    title, 
    children, 
    position, 
    size, 
    zIndex, 
    onPositionChange, 
    onSizeChange,
    onFocus,
    onClose,
    onDrag,
    isDockingTarget,
    isMobile = false
}) => {
    // Local state for smooth dragging/resizing
    const [localPos, setLocalPos] = useState(position);
    const [localSize, setLocalSize] = useState(size);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    
    const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
    const resizeRef = useRef({ startX: 0, startY: 0, startWidth: 0, startHeight: 0 });

    // Sync with props when they update from external sources (e.g. initial load)
    useEffect(() => {
        if (!isDragging) setLocalPos(position);
    }, [position, isDragging]);

    useEffect(() => {
        if (!isResizing) setLocalSize(size);
    }, [size, isResizing]);

    /* DRAGGING LOGIC */
    const startDrag = (e) => {
        if (isMobile) return; // No dragging on mobile
        if (e.button !== 0) return; // Only left click
        setIsDragging(true);
        if (onFocus) onFocus(id);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: localPos.x,
            initialY: localPos.y
        };
        e.preventDefault();
    };

    /* RESIZING LOGIC */
    const startResize = (e) => {
        if (isMobile) return; // No resizing on mobile
        if (e.button !== 0) return;
        setIsResizing(true);
        if (onFocus) onFocus(id);
        resizeRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startWidth: localSize.width,
            startHeight: localSize.height,
        };
        e.preventDefault();
        e.stopPropagation(); // Don't trigger other parent events
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                const deltaX = e.clientX - dragRef.current.startX;
                const deltaY = e.clientY - dragRef.current.startY;
                const newPos = {
                    x: Math.max(0, dragRef.current.initialX + deltaX),
                    y: Math.max(0, dragRef.current.initialY + deltaY)
                };
                setLocalPos(newPos);
                if (onDrag) onDrag(id, newPos);
            } else if (isResizing) {
                const deltaX = e.clientX - resizeRef.current.startX;
                const deltaY = e.clientY - resizeRef.current.startY;
                setLocalSize({
                    width: Math.max(140, resizeRef.current.startWidth + deltaX),
                    height: Math.max(80, resizeRef.current.startHeight + deltaY)
                });
            }
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                if (onPositionChange) onPositionChange(id, localPos);
            }
            if (isResizing) {
                setIsResizing(false);
                if (onSizeChange) onSizeChange(id, localSize);
            }
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, localPos, localSize, id, onPositionChange, onSizeChange, onDrag]);

    const handleWidgetClick = () => {
        if (onFocus) onFocus(id);
    };

    return (
        <div
            onClick={handleWidgetClick}
            className={`brutalist-card widget-container ${isDragging ? 'dragging' : ''}`}
            style={{
                position: isMobile ? 'relative' : 'absolute',
                left: isMobile ? '0' : localPos.x,
                top: isMobile ? '0' : localPos.y,
                width: isMobile ? '100%' : localSize.width,
                height: isMobile ? 'auto' : localSize.height,
                minHeight: isMobile ? '300px' : 'none',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                background: '#fff',
                overflow: 'hidden',
                zIndex: zIndex,
                boxShadow: isMobile ? 'none' : (isDragging ? '16px 16px 0px #000' : '8px 8px 0px #000'),
                border: isMobile ? '3px solid #000' : '3px solid #000',
                borderBottom: isMobile ? '8px solid #000' : '3px solid #000', // Stronger divider on mobile
                marginBottom: isMobile ? '2rem' : '0',
                opacity: isDragging && isDockingTarget ? 0.5 : 1,
                transform: isDragging && isDockingTarget ? 'scale(0.95)' : 'scale(1)',
                transition: isDragging || isResizing ? 'opacity 0.2s, transform 0.2s' : 'box-shadow 0.2s, z-index 0.1s, opacity 0.2s, transform 0.2s',
                transformOrigin: 'top center'
            }}
        >
            {!isMobile && (
            <div 
                className="window-titlebar"
                onMouseDown={startDrag}
                style={{
                    background: '#000',
                    color: '#fff',
                    padding: '0.3rem 0.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '3px solid #000',
                    cursor: isMobile ? 'default' : (isDragging ? 'grabbing' : 'grab')
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <GripHorizontal size={10} color="#39ff14" />
                    <span style={{ fontSize: '0.55rem', fontWeight: '900', letterSpacing: '1px', userSelect: 'none' }}>{title.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <Minimize2 size={10} style={{ cursor: 'pointer' }} />
                    <Maximize2 size={10} style={{ cursor: 'pointer' }} />
                    <X size={10} style={{ cursor: 'pointer', color: '#ff0000' }} onClick={(e) => { e.stopPropagation(); if(onClose) onClose(id); }} />
                </div>
            </div>
            )}

            {/* Window Content */}
            <div className="window-content" style={{ flex: 1, padding: isMobile ? '1rem' : '0.5rem', overflowY: isMobile ? 'visible' : 'auto' }}>
                {isMobile && (
                    <div style={{ marginBottom: '1rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</span>
                        <div 
                            onClick={(e) => { e.stopPropagation(); if(onClose) onClose(id); }}
                            style={{
                                background: '#000',
                                color: '#fff',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                fontWeight: '900',
                                cursor: 'pointer',
                                border: '2px solid #000',
                                boxShadow: '2px 2px 0 #39ff14'
                            }}
                        >
                            <X size={14} />
                        </div>
                    </div>
                )}
                {children}
            </div>

            {/* Custom Corner Gripper - Hidden on Mobile */}
            {!isMobile && (
                <div 
                    className="gripper"
                    onMouseDown={startResize}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '20px',
                        height: '20px',
                        cursor: 'se-resize',
                        background: 'linear-gradient(135deg, transparent 50%, #000 50%, transparent 60%, transparent 70%, #000 70%, transparent 80%, transparent 90%, #000 90%)',
                        backgroundSize: '10px 10px',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'bottom right',
                        zIndex: 10
                    }}
                />
            )}
        </div>
    );
};

export default DraggableWidget;
