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

    // -- UI State --
    const [activeTab, setActiveTab] = useState('settings'); // 'settings' or 'curriculum'
    const [expandedSectionId, setExpandedSectionId] = useState(null);
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
                            <div className={`studio-layout ${showMobilePreview ? 'show-preview' : ''}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem', alignItems: 'start' }}>
                                {/* LEFT COLUMN: EDITOR */}
                                <div className="editor-side">
                                    {/* INTERNAL TABS */}
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '4px solid #000', paddingBottom: '0.5rem' }}>
                                        <button 
                                            onClick={() => setActiveTab('settings')}
                                            style={{ 
                                                padding: '0.8rem 1.5rem', 
                                                fontWeight: '900', 
                                                border: '3px solid #000', 
                                                background: activeTab === 'settings' ? 'var(--primary-color)' : '#fff',
                                                cursor: 'pointer',
                                                transform: activeTab === 'settings' ? 'translate(-2px, -2px)' : 'none',
                                                boxShadow: activeTab === 'settings' ? '4px 4px 0 #000' : 'none',
                                                transition: 'all 0.1s'
                                            }}
                                        >
                                            1. SETTINGS & DISTRIBUTION
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab('curriculum')}
                                            style={{ 
                                                padding: '0.8rem 1.5rem', 
                                                fontWeight: '900', 
                                                border: '3px solid #000', 
                                                background: activeTab === 'curriculum' ? 'var(--primary-color)' : '#fff',
                                                cursor: 'pointer',
                                                transform: activeTab === 'curriculum' ? 'translate(-2px, -2px)' : 'none',
                                                boxShadow: activeTab === 'curriculum' ? '4px 4px 0 #000' : 'none',
                                                transition: 'all 0.1s'
                                            }}
                                        >
                                            2. CURRICULUM BUILDER
                                        </button>
                                    </div>

                                    {activeTab === 'settings' ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            <div className="form-container brutalist-card" style={{ padding: '2rem' }}>
                                                <h2 style={{ fontWeight: '900', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    COURSE METADATA
                                                    {!isEditingCourseDetail && (
                                                        <button onClick={() => setIsEditingCourseDetail(true)} style={{ fontSize: '0.7rem', background: '#000', color: '#fff', padding: '0.3rem 0.6rem', border: 'none', cursor: 'pointer' }}>EDIT</button>
                                                    )}
                                                </h2>
                                                
                                                {isEditingCourseDetail ? (
                                                    <form onSubmit={handleCourseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                                        <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                            <label style={{ fontWeight: '900', fontSize: '0.9rem', color: '#000' }}>TITLE</label>
                                                            <input 
                                                                type="text" 
                                                                name="title" 
                                                                value={formData.title} 
                                                                onChange={handleChange} 
                                                                required 
                                                                placeholder="e.g. Master Software Architecture" 
                                                                style={{ padding: '1rem', border: '3px solid #000', width: '100%', fontSize: '1rem' }}
                                                            />
                                                        </div>
                                                        <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                            <label style={{ fontWeight: '900', fontSize: '0.9rem', color: '#000' }}>DESCRIPTION</label>
                                                            <textarea 
                                                                name="description" 
                                                                value={formData.description} 
                                                                onChange={handleChange} 
                                                                required 
                                                                placeholder="Detailed course description..." 
                                                                style={{ padding: '1rem', border: '3px solid #000', width: '100%', minHeight: '160px', fontSize: '1rem', lineHeight: '1.5' }}
                                                            />
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                                            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                                <label style={{ fontWeight: '900', fontSize: '0.9rem', color: '#000' }}>PRICE (ETH)</label>
                                                                <input 
                                                                    type="number" 
                                                                    step="0.001" 
                                                                    name="price" 
                                                                    value={formData.price} 
                                                                    onChange={handleChange} 
                                                                    required 
                                                                    style={{ padding: '1rem', border: '3px solid #000', width: '100%' }}
                                                                />
                                                            </div>
                                                            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                                <label style={{ fontWeight: '900', fontSize: '0.9rem', color: '#000' }}>COVER IMAGE URL</label>
                                                                <input 
                                                                    type="text" 
                                                                    name="image_url" 
                                                                    value={formData.image_url} 
                                                                    onChange={handleChange} 
                                                                    placeholder="https://..." 
                                                                    style={{ padding: '1rem', border: '3px solid #000', width: '100%' }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <BrutalistButton type="submit" style={{ width: '100%', padding: '1.5rem', fontSize: '1.1rem' }}>
                                                            {createdCourse ? 'UPDATE SETTINGS' : 'SAVE & CONTINUE'}
                                                        </BrutalistButton>
                                                    </form>
                                                ) : (
                                                    <div style={{ padding: '1.5rem', background: 'var(--background)', border: '2px solid #000' }}>
                                                        <div style={{ fontWeight: '900' }}>{formData.title}</div>
                                                        <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>{formData.description}</div>
                                                        <div style={{ marginTop: '1rem', fontWeight: '900' }}>PRICING: {formData.price} ETH</div>
                                                    </div>
                                                )}
                                            </div>

                                            {createdCourse && (
                                                <div className="form-container brutalist-card" style={{ padding: '2rem', background: createdCourse.is_minted ? '#f0f0f0' : '#fff' }}>
                                                    <h2 style={{ fontWeight: '900', marginBottom: '1.5rem' }}>DISTRIBUTION</h2>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                                                            {createdCourse.is_minted 
                                                                ? 'This course is published to the blockchain. Further updates to core metadata must be synchronized manually.'
                                                                : 'Your changes are currently in DRAFT mode. Mint to the blockchain to make it available for purchase.'}
                                                        </p>
                                                        {createdCourse.is_minted ? (
                                                            <div style={{ background: 'var(--primary-color)', color: '#000', padding: '1rem', fontWeight: '900', textAlign: 'center', border: '3px solid #000' }}>
                                                                PUBLISHED ON-CHAIN
                                                            </div>
                                                        ) : (
                                                            <BrutalistButton onClick={handleMint} style={{ width: '100%', background: '#ffde00' }}>
                                                                MINT TO BLOCKCHAIN
                                                            </BrutalistButton>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* CURRICULUM TAB */
                                        <div className="form-container brutalist-card" style={{ padding: '2rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                                <h2 style={{ fontWeight: '900', margin: 0 }}>CURRICULUM BUILDER</h2>
                                                <button 
                                                    onClick={() => { setAddingSection(true); setEditingSectionId(null); setExpandedSectionId('new'); }}
                                                    style={{ padding: '0.5rem 1rem', background: '#000', color: '#fff', border: 'none', fontWeight: '900', cursor: 'pointer' }}
                                                >
                                                    + SECTION
                                                </button>
                                            </div>

                                            {!createdCourse && <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>Save course details to begin building.</div>}

                                            <div className="accordion-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {sections.map((section, idx) => (
                                                    <div key={section.id} style={{ border: '3px solid #000', background: '#fff', overflow: 'hidden' }}>
                                                        {/* SECTION HEADER */}
                                                        <div 
                                                            onClick={() => setExpandedSectionId(expandedSectionId === section.id ? null : section.id)}
                                                            style={{ 
                                                                padding: '1rem', 
                                                                background: expandedSectionId === section.id ? '#f8f8f8' : '#fff',
                                                                display: 'flex', 
                                                                justifyContent: 'space-between', 
                                                                alignItems: 'center',
                                                                cursor: 'pointer',
                                                                borderBottom: expandedSectionId === section.id ? '3px solid #000' : 'none'
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                <span style={{ background: '#000', color: '#fff', width: '2rem', height: '2rem', display: 'grid', placeItems: 'center', fontWeight: '900', fontSize: '0.8rem' }}>{idx + 1}</span>
                                                                <span style={{ fontWeight: '900', fontSize: '1.1rem' }}>{section.title.toUpperCase()}</span>
                                                                <span style={{ color: '#999', fontSize: '0.7rem' }}>({section.lessons?.length || 0} LESSONS)</span>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                <button onClick={(e) => { e.stopPropagation(); handleEditSection(section); }} style={{ fontSize: '0.7rem', textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer' }}>Edit Title</button>
                                                                <span style={{ transform: expandedSectionId === section.id ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>▼</span>
                                                            </div>
                                                        </div>

                                                        {/* SECTION CONTENT */}
                                                        {expandedSectionId === section.id && (
                                                            <div style={{ padding: '1rem' }}>
                                                                <div className="lesson-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                                    {section.lessons?.map((lesson, lIdx) => (
                                                                        <div key={lesson.id} style={{ padding: '0.8rem', border: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                                                                            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                                                                <span style={{ color: '#aaa', fontWeight: '900' }}>{lIdx + 1}</span>
                                                                                <span style={{ fontWeight: '800' }}>{lesson.title}</span>
                                                                            </div>
                                                                            <button onClick={() => handleEditLesson(lesson, section.id)} style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', background: '#eee', border: '1px solid #000', cursor: 'pointer' }}>EDIT</button>
                                                                        </div>
                                                                    ))}

                                                                    {activeLessonSectionId === section.id ? (
                                                                        <div style={{ border: '2px solid #000', padding: '1rem', marginTop: '1rem', background: '#fff' }}>
                                                                            <h4 style={{ fontWeight: '900', marginBottom: '1rem' }}>{editingLessonId ? 'UPDATE LESSON' : 'ADD NEW LESSON'}</h4>
                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                                                <input type="text" placeholder="Lesson Title" name="title" value={lessonData.title} onChange={handleLessonChange} style={{ borderBottom: '2px solid #000' }} />
                                                                                <textarea placeholder="Lesson Content (Markdown)..." name="content" value={lessonData.content} onChange={handleLessonChange} style={{ minHeight: '300px' }} />
                                                                                <input type="text" placeholder="Video URL (YouTube/Vimeo)" name="video_url" value={lessonData.video_url} onChange={handleLessonChange} />
                                                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                                                    <BrutalistButton onClick={handleAddLesson} style={{ flex: 1, fontSize: '0.8rem' }}>SAVE</BrutalistButton>
                                                                                    <BrutalistButton onClick={() => { setActiveLessonSectionId(null); setEditingLessonId(null); setLessonData({ title: '', content: '', video_url: '', image_url: '' }); }} style={{ flex: 1, fontSize: '0.8rem', background: '#ccc' }}>CANCEL</BrutalistButton>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <button 
                                                                            onClick={() => setActiveLessonSectionId(section.id)}
                                                                            style={{ marginTop: '0.5rem', padding: '0.8rem', border: '2px dashed #ccc', width: '100%', background: 'none', cursor: 'pointer', fontWeight: '800', color: '#666' }}
                                                                        >
                                                                            + ADD LESSON
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                                {addingSection && expandedSectionId === 'new' && (
                                                    <div style={{ border: '3px solid #000', padding: '1.5rem', background: 'var(--primary-color)' }}>
                                                        <input 
                                                            type="text" 
                                                            value={newSectionTitle} 
                                                            onChange={(e) => setNewSectionTitle(e.target.value)} 
                                                            placeholder="SECTION TITLE" 
                                                            style={{ padding: '0.8rem', width: '100%', marginBottom: '1rem', border: '2px solid #000' }}
                                                            autoFocus
                                                        />
                                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                                            <BrutalistButton onClick={handleAddSection} style={{ flex: 1 }}>SAVE SECTION</BrutalistButton>
                                                            <BrutalistButton onClick={() => { setAddingSection(false); setEditingSectionId(null); setNewSectionTitle(''); setExpandedSectionId(null); }} style={{ background: '#fff', flex: 1 }}>CANCEL</BrutalistButton>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* PREVIEW SIDE - STICKY */}
                                <div className="preview-side" style={{ position: 'sticky', top: '100px' }}>
                                    <div className="brutalist-card" style={{ padding: '1.5rem', background: '#fff', border: '4px solid #000' }}>
                                        <div style={{ fontSize: '0.6rem', fontWeight: '900', color: '#999', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>LIVE PREVIEW</div>
                                        {formData.image_url ? (
                                            <img src={formData.image_url} alt="Preview" style={{ width: '100%', height: '150px', objectFit: 'cover', border: '2px solid #000', marginBottom: '1rem' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '150px', background: '#eee', display: 'grid', placeItems: 'center', fontWeight: '900', color: '#ccc', border: '2px solid #000', marginBottom: '1rem' }}>NO IMAGE</div>
                                        )}
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: '900', lineHeight: 1.1 }}>{(formData.title || 'Untitled Course').toUpperCase()}</h3>
                                        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem', minHeight: '3em' }}>{formData.description?.slice(0, 100)}{formData.description?.length > 100 ? '...' : ''}</p>
                                        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '3px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1.2rem', fontWeight: '900' }}>{formData.price || '0.00'} ETH</span>
                                            <span style={{ fontSize: '0.7rem', fontWeight: '900', background: '#000', color: '#fff', padding: '0.2rem 0.5rem' }}>{sections.length} MODULES</span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '1rem', textAlign: 'center' }}>Preview updates automatically as you type.</p>
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
