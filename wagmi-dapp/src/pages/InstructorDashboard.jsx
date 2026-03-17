// src/pages/InstructorDashboard.jsx
import React, { useState } from 'react';

const InstructorDashboard = ({ createCourse, createSection, createLesson }) => {

    // -- State: Step 1 (Course Details) --
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        image_url: ''
    });
    const [createdCourse, setCreatedCourse] = useState(null); // Holds the course complete object after creation

    // -- State: Step 2 (Curriculum Builder) --
    const [sections, setSections] = useState([]); // Array of { id, title, lessons: [] }
    const [addingSection, setAddingSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    
    // Track which section adding a lesson to
    const [activeLessonSectionId, setActiveLessonSectionId] = useState(null);
    const [lessonData, setLessonData] = useState({ title: '', content: '', video_url: '', image_url: '' });

    // --- Course Details Functions ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        const floatPrice = parseFloat(formData.price);
        if (isNaN(floatPrice) || floatPrice < 0) {
            alert('Please enter a valid price in ETH.');
            return;
        }

        const dataToSubmit = { ...formData, price: floatPrice };
        const result = await createCourse(dataToSubmit);
        if (result && result.id) {
            setCreatedCourse(result);
        }
    };

    // --- Section Functions ---
    const handleAddSection = async () => {
        if (!newSectionTitle.trim()) return;
        const result = await createSection(createdCourse.id, newSectionTitle);
        if (result && result.id) {
            setSections([...sections, { id: result.id, title: result.title, lessons: [] }]);
            setNewSectionTitle('');
            setAddingSection(false);
        }
    };

    // --- Lesson Functions ---
    const handleLessonChange = (e) => {
        const { name, value } = e.target;
        setLessonData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddLesson = async () => {
        if (!lessonData.title.trim()) return;
        const result = await createLesson(activeLessonSectionId, lessonData);
        if (result && result.id) {
            // Update local state by nesting lesson
            setSections(sections.map(sec => {
                if (sec.id === activeLessonSectionId) {
                    return { ...sec, lessons: [...sec.lessons, result] };
                }
                return sec;
            }));
            setLessonData({ title: '', content: '', video_url: '', image_url: '' });
            setActiveLessonSectionId(null);
        }
    };

    return (
        <section className="page active" style={{ padding: '2rem 0', background: 'var(--background)' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <h1 style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: '900', 
                    textTransform: 'uppercase', 
                    borderBottom: '4px solid #000', 
                    paddingBottom: '0.5rem', 
                    marginBottom: '2rem',
                    textAlign: 'center'
                }}>
                    Instructor Studio
                </h1>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'flex-start' }}>
                    
                    {/* LEFT COLUMN: BUILDER */}
                    <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* ACCORDION STEP 1: COURSE DETAILS */}
                        <div className="form-container" style={{ margin: '0', maxWidth: '100%', padding: '2.5rem', opacity: createdCourse ? 0.6 : 1, transition: 'all 0.3s ease' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '3px solid var(--primary-color)' }}>
                                <h2 className="card-header" style={{ border: 'none', margin: 0, padding: 0 }}>Step 1: Details</h2>
                                {createdCourse && <span style={{ background: 'var(--success)', color: '#fff', padding: '0.2rem 0.5rem', fontWeight: 'bold' }}>✓ SAVED</span>}
                            </div>
                            
                            {!createdCourse ? (
                                <form onSubmit={handleCourseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '900', fontSize: '0.9rem', textTransform: 'uppercase' }}>Course Title *</label>
                                        <input type="text" name="title" value={formData.title} onChange={handleChange} required style={{ padding: '0.8rem', border: '3px solid var(--border)', background: 'var(--background)', color: 'var(--text)', fontSize: '1rem', fontFamily: 'inherit', fontWeight: '600' }} placeholder="e.g. DIGITAL POTTERY 101" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '900', fontSize: '0.9rem', textTransform: 'uppercase' }}>Description *</label>
                                        <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" style={{ padding: '0.8rem', border: '3px solid var(--border)', background: 'var(--background)', color: 'var(--text)', fontSize: '1rem', fontFamily: 'inherit', fontWeight: '600', resize: 'vertical' }} placeholder="A raw, brutalist approach..." />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '900', fontSize: '0.9rem', textTransform: 'uppercase' }}>Price (ETH) *</label>
                                        <input type="number" step="0.0001" min="0" name="price" value={formData.price} onChange={handleChange} required style={{ padding: '0.8rem', border: '3px solid var(--border)', background: 'var(--background)', color: 'var(--text)', fontSize: '1rem', fontFamily: 'inherit', fontWeight: '600' }} placeholder="0.03" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '900', fontSize: '0.9rem', textTransform: 'uppercase' }}>Course Image URL</label>
                                        <input type="url" name="image_url" value={formData.image_url} onChange={handleChange} style={{ padding: '0.8rem', border: '3px solid var(--border)', background: 'var(--background)', color: 'var(--text)', fontSize: '1rem', fontFamily: 'inherit', fontWeight: '600' }} placeholder="https://..." />
                                    </div>
                                    <button type="submit" className="btn" style={{ marginTop: '1rem', width: '100%', padding: '1rem', fontSize: '1rem' }}>
                                        SAVE DRAFT & CONTINUE
                                    </button>
                                </form>
                            ) : (
                                <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                                    <p><strong>Title:</strong> {createdCourse.title}</p>
                                    <p><strong>Price:</strong> {createdCourse.price} ETH</p>
                                    <p style={{ fontStyle: 'italic', fontSize: '0.9rem', marginTop: '1rem' }}>Course details locked. Proceed to curriculum below.</p>
                                </div>
                            )}
                        </div>

                        {/* ACCORDION STEP 2: CURRICULUM */}
                        {createdCourse && (
                            <div className="form-container" style={{ margin: '0', maxWidth: '100%', padding: '2.5rem', animation: 'slideDown 0.3s ease-out' }}>
                                <h2 className="card-header" style={{ width: '100%', marginBottom: '2rem', borderBottom: '3px solid var(--primary-color)' }}>
                                    Step 2: Curriculum
                                </h2>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* Map through mapped sections */}
                                    {sections.map((section, idx) => (
                                        <div key={section.id} style={{ border: '3px solid var(--border)', background: 'var(--background)', padding: '1.5rem' }}>
                                            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem' }}>
                                                {`Section ${idx + 1}: ${section.title}`}
                                            </h3>
                                            
                                            {/* List Lessons */}
                                            {section.lessons.length > 0 && (
                                                <ul style={{ listStyleType: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {section.lessons.map((lesson, lIdx) => (
                                                        <li key={lesson.id} style={{ padding: '0.8rem', border: '2px dashed var(--border)', background: 'var(--surface)', fontWeight: 'bold' }}>
                                                            {`Lesson ${lIdx + 1}: ${lesson.title}`}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            {/* Add Lesson Form or Button */}
                                            {activeLessonSectionId === section.id ? (
                                                <div style={{ borderTop: '2px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    <input type="text" name="title" value={lessonData.title} onChange={handleLessonChange} placeholder="Lesson Title" style={{ padding: '0.5rem', border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text)'}} />
                                                    <textarea name="content" value={lessonData.content} onChange={handleLessonChange} placeholder="Lesson Content (Text/Article)" rows="3" style={{ padding: '0.5rem', border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text)'}} />
                                                    <input type="url" name="video_url" value={lessonData.video_url} onChange={handleLessonChange} placeholder="Video URL (Optional)" style={{ padding: '0.5rem', border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text)'}} />
                                                    <input type="url" name="image_url" value={lessonData.image_url} onChange={handleLessonChange} placeholder="Image URL (Optional)" style={{ padding: '0.5rem', border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text)'}} />
                                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                                        <button className="btn" onClick={handleAddLesson} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Save Lesson</button>
                                                        <button className="btn" onClick={() => setActiveLessonSectionId(null)} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: 'transparent', color: 'var(--text)' }}>Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button className="btn" onClick={() => setActiveLessonSectionId(section.id)} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: 'transparent', color: 'var(--text)', border: '2px dashed var(--border)' }}>
                                                    + ADD CONTENT (TEXT/VIDEO)
                                                </button>
                                            )}
                                        </div>
                                    ))}

                                    {/* Add Section Controller */}
                                    {addingSection ? (
                                        <div style={{ border: '3px dashed var(--primary-color)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <input type="text" value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} placeholder="Section Title (e.g. Introduction)" style={{ padding: '0.8rem', border: '3px solid var(--border)', background: 'var(--background)', color: 'var(--text)', fontSize: '1rem', fontWeight: 'bold' }} />
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button className="btn" onClick={handleAddSection} style={{ flex: 1 }}>SAVE SECTION</button>
                                                <button className="btn" onClick={() => setAddingSection(false)} style={{ flex: 1, background: 'var(--surface)', color: 'var(--text)' }}>CANCEL</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button className="btn" onClick={() => setAddingSection(true)} style={{ width: '100%', padding: '1.5rem', fontSize: '1.2rem', background: 'var(--surface)', color: 'var(--text)', border: '3px dashed var(--border)' }}>
                                            + ADD NEW SECTION
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: LIVE PREVIEW */}
                    <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', position: 'sticky', top: '2rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'var(--error)', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
                            Live Preview
                        </h2>
                        
                        <div style={{ background: 'var(--surface)', border: '3px dashed var(--border)', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                            <div className="course-card" style={{ width: '100%', maxWidth: '350px', cursor: 'default' }}>
                                <div 
                                    className="course-image" 
                                    style={{ backgroundImage: `url(${formData.image_url || 'https://via.placeholder.com/400x250.png?text=COUR$E+VIEW'})` }}
                                />
                                <div className="course-content">
                                    <h3 className="course-title">
                                        {formData.title || 'UNTITLED COURSE'}
                                    </h3>
                                    <p className="course-description">
                                        {formData.description || 'Description will appear here...'}
                                    </p>
                                    <div className="course-price">
                                        {formData.price || '0.000'} ETH
                                    </div>
                                    <div className="course-stats" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Instructor: You</span>
                                            <span>Preview</span>
                                        </div>
                                        {/* Dynamic stats overlay */}
                                        {sections.length > 0 && (
                                            <div style={{ borderTop: '2px dashed var(--border)', paddingTop: '0.5rem', fontSize: '0.85rem' }}>
                                                <strong>Curriculum size:</strong> {sections.length} Sections, {sections.reduce((acc, s) => acc + s.lessons.length, 0)} Lessons
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <style>{`
                            @keyframes pulse {
                                0% { opacity: 1; transform: scale(1); }
                                50% { opacity: 0.5; transform: scale(1.2); }
                                100% { opacity: 1; transform: scale(1); }
                            }
                            @keyframes slideDown {
                                from { opacity: 0; transform: translateY(-20px); }
                                to { opacity: 1; transform: translateY(0); }
                            }
                        `}</style>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InstructorDashboard;
