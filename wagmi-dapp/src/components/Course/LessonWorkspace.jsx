import React, { useState, useEffect } from 'react';
import DraggableWidget from './DraggableWidget';
import BrutalistButton from '../UI/BrutalistButton';
import { Video, Book, PenTool } from 'lucide-react';

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

const LessonWorkspace = ({ lesson, onClose }) => {
    const defaultWidgets = [
        { id: 'widget-media', title: 'Media Viewer', type: 'media', size: { width: 300, height: 195 }, pos: { x: 20, y: 20 }, isVisible: true },
        { id: 'widget-syllabus', title: 'Curriculum & Content', type: 'content', size: { width: 195, height: 195 }, pos: { x: 340, y: 20 }, isVisible: true },
        { id: 'widget-notes', title: 'Personal Notes', type: 'notes', size: { width: 300, height: 175 }, pos: { x: 20, y: 230 }, isVisible: true },
    ];

    const [widgets, setWidgets] = useState([]);
    const [notesText, setNotesText] = useState("");
    const [stackOrder, setStackOrder] = useState(['widget-media', 'widget-syllabus', 'widget-notes']);
    const [dockHoveredWidgetId, setDockHoveredWidgetId] = useState(null);
    const workspaceRef = React.useRef(null);

    // Load from local storage or use defaults
    useEffect(() => {
        if (!lesson) return;
        
        const storageKey = `studyverse_layout_v4_${lesson.id}`;
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
        const storageKey = `studyverse_layout_v2_${lesson.id}`;
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
        setStackOrder(prev => {
            const filtered = prev.filter(wId => wId !== id);
            return [...filtered, id];
        });
    };

    if (!lesson) return null;

    return (
        <div ref={workspaceRef} style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '800px',
            backgroundColor: '#f0f0f0',
            backgroundImage: 'radial-gradient(#ccc 2px, transparent 2px)',
            backgroundSize: '30px 30px', /* Dotted grid background */
            overflow: 'hidden', /* True canvas, no scrollbars over the overall area. Can be panning later */
        }}>
            {/* Toolbar for toggling widgets */}
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
                border: '3px solid #000', 
                borderRadius: '40px',
                transition: 'background 0.2s',
                boxShadow: dockHoveredWidgetId !== null ? '0 0 20px rgba(57, 255, 20, 0.8)' : 'none'
            }}>
                {widgets.map(w => (
                    <button 
                        key={w.id}
                        onClick={() => handleWidgetToggle(w.id)}
                        title={`Toggle ${w.title}`}
                        style={{
                            background: w.isVisible !== false ? '#39ff14' : '#fff',
                            color: '#000',
                            border: '2px solid #000',
                            borderRadius: '50%',
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
                    </button>
                ))}
            </div>

            {widgets.filter(w => w.isVisible !== false).map((widget) => {
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
                    </DraggableWidget>
                );
            })}
        </div>
    );
};

export default LessonWorkspace;
