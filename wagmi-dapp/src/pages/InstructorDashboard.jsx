import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import BrutalistButton from '../components/UI/BrutalistButton';

const InstructorDashboard = ({ 
    user,
    createCourse, 
    updateCourse,
    createSection, 
    updateSection,
    createLesson, 
    updateLesson,
    mintCourse, 
    bulkMintCourses,
    courses,
    createSchoolOnChain,
    ownedSchools,
    isSchoolLoading,
    fetchLessons
}) => {
    const { address } = useAccount();

    const [view, setView] = useState('list'); // 'list' or 'editor'

    // -- State: Step 0 (School Onboarding) --
    const [schoolName, setSchoolName] = useState('');

    // -- State: Step 1 (Course Details) --
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        image_url: ''
    });
    const [createdCourse, setCreatedCourse] = useState(null);
    const [isEditingCourseDetail, setIsEditingCourseDetail] = useState(true);

    // -- State: Step 2 (Curriculum Builder) --
    const [sections, setSections] = useState([]);
    const [addingSection, setAddingSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    
    const [activeLessonSectionId, setActiveLessonSectionId] = useState(null);
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [editingSectionId, setEditingSectionId] = useState(null);
    const [lessonData, setLessonData] = useState({ title: '', content: '', video_url: '', image_url: '' });

    const [showMobilePreview, setShowMobilePreview] = useState(false);

    const hasSchool = ownedSchools && ownedSchools.length > 0;

    // Helper to group lessons
    const groupLessonsBySection = (flatLessons) => {
        const sectionsMap = {};
        flatLessons.forEach(lesson => {
            const sectionId = lesson.section_id;
            if (!sectionsMap[sectionId]) {
                sectionsMap[sectionId] = {
                    id: sectionId,
                    title: lesson.section_title || 'Untitled Section',
                    order: lesson.section_order || 0,
                    lessons: []
                };
            }
            sectionsMap[sectionId].lessons.push(lesson);
        });
        return Object.values(sectionsMap).sort((a, b) => a.order - b.order);
    };

    // --- Actions ---
    const handleEditCourse = async (course) => {
        setCreatedCourse(course);
        setFormData({
            title: course.title,
            description: course.description,
            price: course.price,
            image_url: course.image_url || ''
        });
        setIsEditingCourseDetail(false);
        setView('editor');
        
        // Load lessons
        if (fetchLessons) {
            const data = await fetchLessons(course.id);
            if (data && data.lessons) {
                setSections(groupLessonsBySection(data.lessons));
            }
        }
    };

    const handleCreateNew = () => {
        setCreatedCourse(null);
        setFormData({ title: '', description: '', price: '', image_url: '' });
        setSections([]);
        setIsEditingCourseDetail(true);
        setView('editor');
    };

    // --- Onboarding Functions ---
    const handleLaunchSchool = async () => {
        if (!schoolName.trim()) return;
        await createSchoolOnChain(schoolName);
    };

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
        
        if (createdCourse && createdCourse.id) {
            // Edit existing
            const result = await updateCourse(createdCourse.id, dataToSubmit);
            if (result) {
                setCreatedCourse(result);
                setIsEditingCourseDetail(false);
            }
        } else {
            // Create new
            const result = await createCourse(dataToSubmit);
            if (result && result.id) {
                setCreatedCourse(result);
                setIsEditingCourseDetail(false);
            }
        }
    };

    // --- Section Functions ---
    const handleAddSection = async () => {
        if (!newSectionTitle.trim()) return;
        if (!createdCourse || !createdCourse.id) {
            alert('Please save course details first.');
            return;
        }
        
        if (editingSectionId) {
            const result = await updateSection(editingSectionId, newSectionTitle);
            if (result) {
                setSections(sections.map(s => s.id === editingSectionId ? { ...s, title: result.title } : s));
                setNewSectionTitle('');
                setAddingSection(false);
                setEditingSectionId(null);
            }
        } else {
            const result = await createSection(createdCourse.id, newSectionTitle);
            if (result && result.id) {
                setSections([...sections, { id: result.id, title: result.title, lessons: [] }]);
                setNewSectionTitle('');
                setAddingSection(false);
            }
        }
    };

    const handleEditSection = (section) => {
        setNewSectionTitle(section.title);
        setEditingSectionId(section.id);
        setAddingSection(true);
    };

    // --- Lesson Functions ---
    const handleLessonChange = (e) => {
        const { name, value } = e.target;
        setLessonData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddLesson = async () => {
        if (!lessonData.title.trim()) return;
        
        if (editingLessonId) {
            // Update
            const result = await updateLesson(editingLessonId, lessonData);
            if (result) {
                setSections(sections.map(sec => ({
                    ...sec,
                    lessons: sec.lessons.map(l => l.id === editingLessonId ? result : l)
                })));
                setLessonData({ title: '', content: '', video_url: '', image_url: '' });
                setEditingLessonId(null);
                setActiveLessonSectionId(null);
            }
        } else {
            // Create
            const result = await createLesson(activeLessonSectionId, lessonData);
            if (result && result.id) {
                setSections(sections.map(sec => 
                    sec.id === activeLessonSectionId ? { ...sec, lessons: [...sec.lessons, result] } : sec
                ));
                setLessonData({ title: '', content: '', video_url: '', image_url: '' });
                setActiveLessonSectionId(null);
            }
        }
    };

    const handleEditLesson = (lesson, sectionId) => {
        setLessonData({
            title: lesson.title,
            content: lesson.content || '',
            video_url: lesson.video_url || '',
            image_url: lesson.image_url || ''
        });
        setEditingLessonId(lesson.id);
        setActiveLessonSectionId(sectionId);
    };

    // --- Minting ---
    const handleMint = async () => {
        if (!hasSchool) return;
        const targetSchool = ownedSchools[0];
        const result = await mintCourse(
            createdCourse.id, 
            createdCourse.price, 
            targetSchool, 
            user?.display_name ? `${user.display_name}'s School` : `${address.slice(0, 6)}... School`
        );
        if (result) {
            setCreatedCourse({ ...createdCourse, is_minted: true });
        }
    };

    const handleBulkSync = async () => {
        if (!hasSchool) return;
        const unsynced = courses.filter(c => c.is_instructor && !c.is_minted);
        if (unsynced.length === 0) return;

        const ids = unsynced.map(c => c.id);
        const prices = unsynced.map(c => c.price);
        await bulkMintCourses(ids, prices, ownedSchools[0]);
    };

    // --- RENDER ---
    return (
        <section className="page active" style={{ padding: '2rem 0', background: 'var(--background)' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-2px', margin: 0 }}>
                        {view === 'list' ? 'INSTRUCTOR STUDIO' : 'COURSE EDITOR'}
                    </h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {view === 'editor' && (
                            <button className="btn-secondary" onClick={() => setView('list')} style={{ fontSize: '0.7rem' }}>BACK TO LIST</button>
                        )}
                        <BrutalistButton onClick={handleCreateNew} style={{ fontSize: '0.8rem' }}>+ NEW COURSE</BrutalistButton>
                    </div>
                </div>

                {!hasSchool ? (
                    <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>STEP 0: LAUNCH YOUR SOVEREIGN SCHOOL</h2>
                        <input 
                            type="text" 
                            placeholder="e.g. Harvard CS / The Art Hub" 
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                            style={{ padding: '1rem', width: '100%', marginBottom: '1rem' }}
                        />
                        <BrutalistButton onClick={handleLaunchSchool} disabled={isSchoolLoading} style={{ width: '100%' }}>
                            {isSchoolLoading ? 'LAUNCHING...' : 'LAUNCH SCHOOL ON-CHAIN'}
                        </BrutalistButton>
                    </div>
                ) : (
                    <>
                        {view === 'list' ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {Array.isArray(courses) && courses.filter(c => c.is_instructor).map(course => (
                                    <div key={course.id} className="brutalist-card" style={{ padding: '1.5rem', background: '#fff' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '900', marginBottom: '0.5rem', color: course.is_minted ? 'var(--primary-color)' : '#999' }}>
                                            {course.is_minted ? '✓ PUBLISHED' : '• DRAFT'}
                                        </div>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '1rem' }}>{(course.title || 'Untitled').toUpperCase()}</h3>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button 
                                                onClick={() => handleEditCourse(course)}
                                                style={{ flex: 1, padding: '0.5rem', border: '2px solid #000', fontWeight: '800', cursor: 'pointer', background: 'var(--primary-color)' }}
                                            >
                                                MANAGE
                                            </button>
                                            <button style={{ flex: 1, padding: '0.5rem', border: '2px solid #000', fontWeight: '800', cursor: 'pointer', background: '#fff' }}>
                                                STATS
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!Array.isArray(courses) || courses.filter(c => c.is_instructor).length === 0) && (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', border: '3px dashed #ccc' }}>
                                        <p style={{ color: '#666' }}>You haven't created any courses yet.</p>
                                        <BrutalistButton onClick={handleCreateNew}>Create Your First Course</BrutalistButton>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* THE EDITOR VIEW */
                            <div className={`studio-layout ${showMobilePreview ? 'show-preview' : ''}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '3rem', alignItems: 'start' }}>
                                {/* LEFT COLUMN: EDITOR */}
                                <div className="editor-side">
                                    <div className="form-container" style={{ marginBottom: '2rem', border: '5px solid var(--text)', padding: '2rem', maxWidth: '100%' }}>
                                        <h2 style={{ fontWeight: '800', borderBottom: '4px solid var(--text)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>1. COURSE DETAILS</span>
                                            {!isEditingCourseDetail && (
                                                <button onClick={() => setIsEditingCourseDetail(true)} style={{ fontSize: '0.7rem', background: 'none', border: 'none', cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>Edit Settings</button>
                                            )}
                                        </h2>
                                        {isEditingCourseDetail ? (
                                            <form onSubmit={handleCourseSubmit}>
                                                <div className="input-group">
                                                    <label>TITLE</label>
                                                    <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                                                </div>
                                                <div className="input-group">
                                                    <label>DESCRIPTION</label>
                                                    <textarea name="description" value={formData.description} onChange={handleChange} required />
                                                </div>
                                                <div className="input-group">
                                                    <label>PRICE (ETH)</label>
                                                    <input type="number" step="0.001" name="price" value={formData.price} onChange={handleChange} required />
                                                </div>
                                                <BrutalistButton type="submit" style={{ width: '100%', marginTop: '1rem' }}>
                                                    {createdCourse ? 'UPDATE SETTINGS' : 'SAVE & CONTINUE'}
                                                </BrutalistButton>
                                            </form>
                                        ) : (
                                            <div style={{ color: 'var(--text-secondary)' }}>
                                                <strong>{formData.title}</strong> • {formData.price} ETH
                                            </div>
                                        )}
                                    </div>

                                    {/* STEP 2: Curriculum */}
                                    {createdCourse && !createdCourse.is_minted && (
                                        <div className="form-container" style={{ border: '5px solid var(--text)', padding: '2rem', marginBottom: '2rem' }}>
                                            <h2 style={{ fontWeight: '800', borderBottom: '4px solid var(--text)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                                                2. CURRICULUM BUILDER
                                            </h2>
                                            
                                            <div className="section-list">
                                                {sections.map((section, idx) => (
                                                    <div key={section.id} style={{ marginBottom: '1.5rem', background: 'var(--surface)', border: '3px solid var(--text)', padding: '1rem' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>SECTION {idx + 1}: {section.title.toUpperCase()}</div>
                                                            <button onClick={() => handleEditSection(section)} className="btn-text">Edit</button>
                                                        </div>
                                                        <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                                                            {section.lessons?.map(lesson => (
                                                                <div key={lesson.id} style={{ padding: '0.3rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <div style={{ color: 'var(--text-secondary)' }}>• {lesson.title}</div>
                                                                    <button onClick={() => handleEditLesson(lesson, section.id)} style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', cursor: 'pointer' }}>Edit Content</button>
                                                                </div>
                                                            ))}
                                                            
                                                            {activeLessonSectionId === section.id ? (
                                                                <div style={{ borderTop: '2px solid var(--text)', marginTop: '1rem', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                                    <input type="text" placeholder="Lesson Title" name="title" value={lessonData.title} onChange={handleLessonChange} />
                                                                    <textarea placeholder="Lesson Content (Markdown supported)" name="content" value={lessonData.content} onChange={handleLessonChange} style={{ height: '200px' }} />
                                                                    <input type="text" placeholder="Video URL (YouTube/Vimeo)" name="video_url" value={lessonData.video_url} onChange={handleLessonChange} />
                                                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                                                        <BrutalistButton onClick={handleAddLesson} style={{ flex: 1, fontSize: '0.8rem' }}>
                                                                            {editingLessonId ? 'UPDATE LESSON' : 'SAVE LESSON'}
                                                                        </BrutalistButton>
                                                                        <BrutalistButton 
                                                                            onClick={() => {
                                                                                setActiveLessonSectionId(null);
                                                                                setEditingLessonId(null);
                                                                                setLessonData({ title: '', content: '', video_url: '', image_url: '' });
                                                                            }} 
                                                                            style={{ flex: 1, fontSize: '0.8rem', background: '#ccc' }}
                                                                        >
                                                                            CANCEL
                                                                        </BrutalistButton>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button className="btn-text" onClick={() => setActiveLessonSectionId(section.id)} style={{ marginTop: '0.5rem' }}>+ Add Lesson</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                {addingSection ? (
                                                    <div style={{ background: 'var(--background)', border: '3px dashed var(--text)', padding: '1rem' }}>
                                                        <input type="text" value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} placeholder="SECTION TITLE" />
                                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                                            <BrutalistButton onClick={handleAddSection} style={{ flex: 1 }}>
                                                                {editingSectionId ? 'UPDATE SECTION' : 'SAVE SECTION'}
                                                            </BrutalistButton>
                                                            <BrutalistButton onClick={() => { setAddingSection(false); setEditingSectionId(null); setNewSectionTitle(''); }} style={{ background: 'var(--error)', flex: 1 }}>CANCEL</BrutalistButton>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <BrutalistButton onClick={() => setAddingSection(true)} style={{ background: 'var(--surface)', color: 'var(--text)', width: '100%' }}>
                                                        + ADD NEW SECTION
                                                    </BrutalistButton>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* MINTING SECTION (Remains the same flow) */}
                                    {createdCourse && (
                                        <div className="form-container" style={{ border: '5px solid var(--text)', padding: '2rem' }}>
                                            <h2 style={{ fontWeight: '800', borderBottom: '4px solid var(--text)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                                                3. MINT TO BLOCKCHAIN
                                            </h2>
                                            {createdCourse.is_minted ? (
                                                <div style={{ background: 'var(--primary-color)', color: 'white', padding: '1rem', fontWeight: '800', textAlign: 'center' }}>
                                                    ✓ PUBLISHED ON-CHAIN
                                                </div>
                                            ) : (
                                                <BrutalistButton onClick={handleMint} style={{ width: '100%', fontSize: '1.5rem' }}>
                                                    MINT COURSE ON-CHAIN
                                                </BrutalistButton>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* PREVIEW SIDE */}
                                <div className="preview-side" style={{ position: 'sticky', top: '100px' }}>
                                    <div className="brutalist-card" style={{ padding: '1.5rem', background: 'var(--surface)' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-secondary)', marginBottom: '1rem' }}>LIVE PREVIEW</div>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>{formData.title || 'Untitled'}</h3>
                                        <p style={{ fontSize: '0.8rem', color: '#666' }}>{formData.description?.slice(0, 100)}...</p>
                                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #000', fontSize: '1.2rem', fontWeight: '900' }}>
                                            {formData.price || '0.00'} ETH
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

export default InstructorDashboard;
