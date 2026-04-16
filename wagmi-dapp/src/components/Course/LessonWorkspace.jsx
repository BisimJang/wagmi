import React, { useState, useEffect } from 'react';
import DraggableWidget from './DraggableWidget';
import BrutalistButton from '../UI/BrutalistButton';
import { Video, Book, PenTool, Bot, Plus, X, ChevronRight } from 'lucide-react';
import DesktopRecommendation from '../UI/DesktopRecommendation';

const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
        return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
        return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
};

const LessonWorkspace = ({ lesson, onClose, onNext }) => {
    const defaultWidgets = [
        { id: 'widget-media', title: 'Media Viewer', type: 'media', size: { width: 300, height: 195 }, pos: { x: 20, y: 20 }, isVisible: true },
        { id: 'widget-syllabus', title: 'Curriculum & Content', type: 'content', size: { width: 195, height: 195 }, pos: { x: 340, y: 20 }, isVisible: true },
        { id: 'widget-notes', title: 'Personal Notes', type: 'notes', size: { width: 300, height: 175 }, pos: { x: 20, y: 230 }, isVisible: false },
        { id: 'widget-ai', title: 'Studyverse AI', type: 'ai', size: { width: 280, height: 385 }, pos: { x: 340, y: 230 }, isVisible: false },
    ];

    const [widgets, setWidgets] = useState([]);
    const [notesText, setNotesText] = useState("");
    const [stackOrder, setStackOrder] = useState(['widget-media', 'widget-syllabus', 'widget-notes', 'widget-ai']);
    const [dockHoveredWidgetId, setDockHoveredWidgetId] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const workspaceRef = React.useRef(null);

    // Handle Resize for Mobile Detection
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load from local storage or use defaults
    useEffect(() => {
        if (!lesson) return;
        
        const storageKey = `studyverse_layout_v6_${lesson.id}`;
        const savedLayout = localStorage.getItem(storageKey);
        
        if (savedLayout) {
            const parsed = JSON.parse(savedLayout);
            setWidgets(parsed.widgets);
            if (parsed.stackOrder) setStackOrder(parsed.stackOrder);
        } else {
            setWidgets(defaultWidgets);
        }

        const savedNotes = localStorage.getItem(`studyverse_notes_${lesson.id}`);
        if (savedNotes) {
            setNotesText(savedNotes);
        }
    }, [lesson]);

    // Save to local storage whenever widgets change
    useEffect(() => {
        if (!lesson || widgets.length === 0) return;
        const storageKey = `studyverse_layout_v6_${lesson.id}`;
        localStorage.setItem(storageKey, JSON.stringify({ widgets, stackOrder }));
    }, [widgets, stackOrder, lesson]);

    const isNearToolbar = (newPos, widgetWidth) => {
        if (newPos.y > 60) return false;
        if (!workspaceRef.current) return newPos.y <= 60; // fallback
        const centerX = workspaceRef.current.clientWidth / 2;
        const toolbarStart = centerX - 120;
        const toolbarEnd = centerX + 120;
        const widgetStart = newPos.x;
        const widgetEnd = newPos.x + widgetWidth;
        
        return (widgetStart < toolbarEnd && widgetEnd > toolbarStart);
    };

    const handlePosChange = (id, newPos) => {
        setDockHoveredWidgetId(null); // Reset on drop
        const widget = widgets.find(w => w.id === id);
        const wWidth = widget?.size?.width || 300;

        if (isNearToolbar(newPos, wWidth)) {
            setWidgets(widgets.map(w => w.id === id ? { ...w, pos: { x: newPos.x, y: 80 }, isVisible: false } : w));
        } else {
            setWidgets(widgets.map(w => w.id === id ? { ...w, pos: newPos } : w));
        }
    };

    const handleDrag = (id, newPos) => {
        const widget = widgets.find(w => w.id === id);
        const wWidth = widget?.size?.width || 300;
        
        if (isNearToolbar(newPos, wWidth)) {
            if (dockHoveredWidgetId !== id) setDockHoveredWidgetId(id);
        } else {
            if (dockHoveredWidgetId === id) setDockHoveredWidgetId(null);
        }
    };

    const handleSizeChange = (id, newSize) => {
        setWidgets(widgets.map(w => w.id === id ? { ...w, size: newSize } : w));
    };

    const handleFocus = (id) => {
        setStackOrder(prev => {
            const filtered = prev.filter(wId => wId !== id);
            return [...filtered, id];
        });
    };

    const handleNotesChange = (e) => {
        const value = e.target.value;
        setNotesText(value);
        localStorage.setItem(`studyverse_notes_${lesson.id}`, value);
    };

    const handleWidgetClose = (id) => {
        setWidgets(widgets.map(w => w.id === id ? { ...w, isVisible: false } : w));
    };

    const handleWidgetToggle = (id) => {
        setWidgets(widgets.map(w => w.id === id ? { ...w, isVisible: w.isVisible === false ? true : false } : w));
        
        if (!isMobile) {
            setStackOrder(prev => {
                const filtered = prev.filter(wId => wId !== id);
                return [...filtered, id];
            });
        }
    };

    if (!lesson) return null;

    return (
        <div ref={workspaceRef} style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            backgroundColor: isMobile ? '#fff' : '#f0f0f0',
            backgroundImage: isMobile ? 'none' : 'radial-gradient(#ccc 2px, transparent 2px)',
            backgroundSize: '30px 30px', /* Dotted grid background */
            overflow: isMobile ? 'auto' : 'hidden', /* Allow scrolling on mobile fixed view */
            display: isMobile ? 'flex' : 'block',
            flexDirection: isMobile ? 'column' : 'unset',
            padding: isMobile ? '1rem' : '0',
            paddingTop: isMobile ? '2rem' : '6rem'
        }}>
            <DesktopRecommendation />
            {/* Toolbar for toggling widgets - DESKTOP ONLY */}
            {!isMobile && (
            <div style={{ 
                position: 'absolute', 
                top: '1rem', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                zIndex: 1000, 
                display: 'flex', 
                gap: '0.8rem', 
                background: dockHoveredWidgetId !== null ? '#39ff14' : '#000', 
                padding: '0.5rem 1rem', 
                borderRadius: isMobile ? '0' : '40px',
                width: isMobile ? '100%' : 'auto',
                transition: 'background 0.2s',
                boxShadow: isMobile ? 'none' : (dockHoveredWidgetId !== null ? '0 0 20px rgba(57, 255, 20, 0.8)' : 'none'),
                borderLeft: isMobile ? 'none' : '3px solid #000',
                borderRight: isMobile ? 'none' : '3px solid #000',
                borderTop: isMobile ? 'none' : '3px solid #000',
                borderBottom: '3px solid #000',
            }}>
                {widgets
                    .map(w => (
                    <button 
                        key={w.id}
                        onClick={() => handleWidgetToggle(w.id)}
                        title={`Toggle ${w.title}`}
                        style={{
                            background: (w.isVisible !== false ? '#39ff14' : '#fff'),
                            color: '#000',
                            border: '2px solid #000',
                            borderRadius: '50%',
                            flex: 'none',
                            width: '40px',
                            height: '40px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '2px 2px 0px #000',
                            transition: 'all 0.1s'
                        }}
                    >
                        {w.type === 'media' && <Video size={18} />}
                        {w.type === 'content' && <Book size={18} />}
                        {w.type === 'notes' && <PenTool size={18} />}
                        {w.type === 'ai' && <Bot size={18} />}
                    </button>
                ))}
                
                {/* Desktop Next Button - Integrated Power Shortcut */}
                {onNext && (
                    <button 
                        onClick={onNext}
                        title="Mark Complete & Next Lesson"
                        style={{
                            background: '#39ff14',
                            color: '#000',
                            border: '3px solid #000',
                            borderRadius: '50%',
                            width: '42px',
                            height: '42px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '3px 3px 0px #000',
                            marginLeft: '1rem',
                            borderLeft: '4px solid #000',
                            transition: 'all 0.1s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translate(-2px, -2px)';
                            e.currentTarget.style.boxShadow = '5px 5px 0px #000';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '3px 3px 0px #000';
                        }}
                    >
                        <ChevronRight size={24} strokeWidth={3} />
                    </button>
                )}
            </div>
            )}

            {/* Content Area for Mobile or Floating Canvas for Desktop */}
            <div style={{
                flex: isMobile ? 'none' : 'none',
                position: isMobile ? 'relative' : 'static',
                width: '100%',
                height: isMobile ? 'auto' : 'auto',
                overflow: isMobile ? 'visible' : 'visible'
            }}>
                {widgets.filter(w => isMobile ? w.isVisible !== false : w.isVisible !== false).map((widget) => {
                    const zIndex = 10 + stackOrder.indexOf(widget.id);
                    return (
                        <DraggableWidget 
                            key={widget.id} 
                            id={widget.id} 
                            title={widget.title}
                            position={widget.pos}
                            size={widget.size}
                            zIndex={zIndex}
                            onPositionChange={handlePosChange}
                            onSizeChange={handleSizeChange}
                            onFocus={handleFocus}
                            onClose={handleWidgetClose}
                            onDrag={handleDrag}
                            isDockingTarget={dockHoveredWidgetId === widget.id}
                            isMobile={isMobile}
                        >
                        {/* Render content conditionally based on type */}
                        {widget.type === 'media' && (
                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                {lesson.video_url ? (
                                    <div style={{ flex: 1, minHeight: 0 }}>
                                        <iframe 
                                            src={getEmbedUrl(lesson.video_url)} 
                                            title={lesson.title} 
                                            frameBorder="0" 
                                            allowFullScreen
                                            style={{ width: '100%', height: '100%', display: 'block', border: '4px solid #000' }}
                                        />
                                    </div>
                                ) : (
                                    <img 
                                        src={lesson.image_url || 'https://images.unsplash.com/photo-1518005020480-1a2fd6d52579?q=80&w=1964'} 
                                        alt={lesson.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', border: '4px solid #000', filter: 'grayscale(100%)' }}
                                    />
                                )}
                            </div>
                        )}

                        {widget.type === 'content' && (
                            <div style={{ fontSize: '0.65rem', color: '#333', lineHeight: '1.4' }}>
                                {lesson.content ? (
                                    <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                                ) : (
                                    <p>Understanding the core mechanics of this module. The foundation of structured rebellion lies in comprehending the limits of the existing architecture.</p>
                                )}
                            </div>
                        )}

                        {widget.type === 'notes' && (
                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <textarea 
                                    value={notesText}
                                    onChange={handleNotesChange}
                                    placeholder="Start taking notes here. They will persist locally."
                                    style={{ 
                                        flex: 1, 
                                        width: '100%', 
                                        border: '3px solid #000', 
                                        padding: '0.5rem', 
                                        fontSize: '0.7rem',
                                        fontFamily: 'inherit',
                                        resize: 'none',
                                        outline: 'none',
                                        background: '#fff'
                                    }}
                                />
                                <div style={{ fontSize: '0.65rem', color: '#666', marginTop: '0.4rem', textAlign: 'right' }}>
                                    Auto-saving...
                                </div>
                            </div>
                        )}

                        {widget.type === 'ai' && (
                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#000', color: '#fff' }}>
                                <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ alignSelf: 'flex-start', background: '#333', padding: '0.4rem 0.6rem', border: '1px solid #555' }}>
                                        <p style={{ margin: 0, color: '#39ff14', fontWeight: 'bold' }}>[AI SYSTEM READY]</p>
                                        <p style={{ margin: '0.3rem 0 0 0' }}>I am your Studyverse assistant. How can I help you with <strong>{lesson.title}</strong>?</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', borderTop: '2px solid #555', padding: '0.4rem', background: '#111' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Ask AI..." 
                                        style={{ flex: 1, background: '#000', color: '#fff', border: '1px solid #333', padding: '0.4rem', fontSize: '0.7rem', outline: 'none' }}
                                    />
                                    <button style={{ background: '#39ff14', color: '#000', border: 'none', padding: '0.4rem 0.8rem', fontSize: '0.7rem', fontWeight: '900', cursor: 'pointer', marginLeft: '0.4rem' }}>
                                        ASK
                                    </button>
                                </div>
                            </div>
                        )}
                    </DraggableWidget>
                );
            })}
            </div>


            {/* STUDIO HUB / WIDGET HUB - Persistent Action Center */}
            {true && (
                <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 3000 }}>
                    {/* Pop-up Menu */}
                    {isMenuOpen && (
                        <div className="brutalist-card" style={{
                            position: 'absolute',
                            bottom: '4.5rem',
                            right: 0,
                            width: '200px',
                            background: '#fff',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.8rem',
                            boxShadow: '8px 8px 0 #000',
                            border: '4px solid #000'
                        }}>
                             <div style={{ fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', borderBottom: '2px solid #000', paddingBottom: '0.4rem', marginBottom: '0.2rem', color: '#666' }}>
                                 Lesson Controls
                             </div>
                             
                             {onNext && (
                                 <button 
                                     onClick={onNext}
                                     style={{
                                         display: 'flex',
                                         alignItems: 'center',
                                         gap: '1rem',
                                         padding: '0.8rem 1rem',
                                         background: '#000',
                                         color: '#39ff14',
                                         border: '3px solid #000',
                                         cursor: 'pointer',
                                         fontSize: '0.75rem',
                                         fontWeight: '900',
                                         textTransform: 'uppercase',
                                         textAlign: 'left',
                                         width: '100%',
                                         boxShadow: '4px 4px 0 #39ff14',
                                         transition: 'all 0.1s'
                                     }}
                                     onMouseEnter={(e) => {
                                         e.currentTarget.style.transform = 'translate(-2px, -2px)';
                                         e.currentTarget.style.boxShadow = '6px 6px 0 #39ff14';
                                     }}
                                     onMouseLeave={(e) => {
                                         e.currentTarget.style.transform = 'none';
                                         e.currentTarget.style.boxShadow = '4px 4px 0 #39ff14';
                                     }}
                                 >
                                     <div style={{ padding: '4px', background: '#39ff14', color: '#000', borderRadius: '50%' }}>
                                         <Plus size={14} style={{ transform: 'rotate(45deg)' }} strokeWidth={4} />
                                     </div>
                                     <span>Finish & Next</span>
                                     <ChevronRight size={16} />
                                 </button>
                             )}

                             <div style={{ fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', borderBottom: '2px solid #000', paddingBottom: '0.4rem', marginBottom: '0.2rem', color: '#666', marginTop: '0.5rem' }}>
                                 Workspace Modules
                             </div>
                            {widgets.map(w => (
                                <div 
                                    key={w.id} 
                                    onClick={() => handleWidgetToggle(w.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.8rem',
                                        padding: '0.5rem',
                                        background: w.isVisible !== false ? 'var(--primary-color)' : '#f0f0f0',
                                        border: '3px solid #000',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: '700'
                                    }}
                                >
                                    <div style={{ flexShrink: 0 }}>
                                        {w.type === 'media' && <Video size={16} />}
                                        {w.type === 'content' && <Book size={16} />}
                                        {w.type === 'notes' && <PenTool size={16} />}
                                        {w.type === 'ai' && <Bot size={16} />}
                                    </div>
                                    <span style={{ flex: 1 }}>{w.title.split(' ')[0]}</span>
                                    <div style={{ 
                                        width: '12px', 
                                        height: '12px', 
                                        borderRadius: '50%', 
                                        background: w.isVisible !== false ? '#000' : '#ccc',
                                        border: '2px solid #000'
                                    }} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* FAB Bubble */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        style={{
                            width: '56px',
                            height: '56px',
                            background: isMenuOpen ? '#ff00ff' : 'var(--primary-color)',
                            color: '#000',
                            borderRadius: '50%',
                            border: '4px solid #000',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '6px 6px 0 #000',
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'all 0.2s',
                            transform: isMenuOpen ? 'rotate(45deg)' : 'none'
                        }}
                    >
                        <Plus size={32} strokeWidth={3} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default LessonWorkspace;
