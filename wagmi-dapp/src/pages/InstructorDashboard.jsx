import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import BrutalistButton from '../components/UI/BrutalistButton';

const InstructorDashboard = ({ 
    user,
    createCourse, 
    createSection, 
    createLesson, 
    mintCourse, 
    bulkMintCourses,
    courses,
    createSchoolOnChain,
    ownedSchools,
    isSchoolLoading 
}) => {
    const { address } = useAccount();

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

    // -- State: Step 2 (Curriculum Builder) --
    const [sections, setSections] = useState([]);
    const [addingSection, setAddingSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    
    const [activeLessonSectionId, setActiveLessonSectionId] = useState(null);
    const [lessonData, setLessonData] = useState({ title: '', content: '', video_url: '', image_url: '' });

    const [showMobilePreview, setShowMobilePreview] = useState(false);

    const hasSchool = ownedSchools && ownedSchools.length > 0;

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
        const result = await createCourse(dataToSubmit);
        if (result && result.id) {
            setCreatedCourse(result);
        }
    };

    // --- Section Functions ---
    const handleAddSection = async () => {
        if (!newSectionTitle.trim()) return;
        if (!createdCourse || !createdCourse.id) {
            alert('Please save course details first.');
            return;
        }
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
            setSections(sections.map(sec => 
                sec.id === activeLessonSectionId ? { ...sec, lessons: [...sec.lessons, result] } : sec
            ));
            setLessonData({ title: '', content: '', video_url: '', image_url: '' });
            setActiveLessonSectionId(null);
        }
    };

    // --- Minting ---
    const handleMint = async () => {
        if (!hasSchool) return;
        const targetSchool = ownedSchools[0];
        // We don't have the name of an existing school easily, so we use a fallback or the instructor name
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
                        INSTRUCTOR STUDIO
                    </h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button 
                            className="btn-secondary mobile-only" 
                            onClick={() => setShowMobilePreview(!showMobilePreview)}
                            style={{ fontSize: '0.7rem' }}
                        >
                            {showMobilePreview ? 'EDIT MODE' : 'PREVIEW MODE'}
                        </button>
                        {(() => {
                            try {
                                if (!Array.isArray(courses)) return null;
                                const unsynced = courses.filter(c => c.is_instructor && !c.is_minted);
                                
                                if (hasSchool && unsynced.length > 0) {
                                    return (
                                        <BrutalistButton onClick={handleBulkSync} style={{ background: 'var(--accent-color)', fontSize: '0.8rem' }}>
                                            SYNC {unsynced.length}
                                        </BrutalistButton>
                                    );
                                }
                            } catch (e) {
                                console.error('Error rendering sync button:', e);
                            }
                            return null;
                        })()}
                    </div>
                </div>

                {!hasSchool ? (
                    <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>STEP 0: LAUNCH YOUR SOVEREIGN SCHOOL</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            You need a blockchain contract to publish courses. Launch your own hub now.
                        </p>
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
                    <div className={`studio-layout ${showMobilePreview ? 'show-preview' : ''}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '3rem', alignItems: 'start' }}>
                        {/* LEFT COLUMN: EDITOR */}
                        <div className="editor-side">
                            {/* STEP 1: Details */}
                            <div className="form-container" style={{ marginBottom: '2rem', border: '5px solid var(--text)', padding: '2rem', marginLeft: 0, marginRight: 0, maxWidth: '100%' }}>
                                <h2 style={{ fontWeight: '800', borderBottom: '4px solid var(--text)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                                    {createdCourse ? '✓ 1. COURSE SAVED' : '1. COURSE DETAILS'}
                                </h2>
                                {!createdCourse ? (
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
                                        <BrutalistButton type="submit" style={{ width: '100%', marginTop: '1rem' }}>SAVE & CONTINUE</BrutalistButton>
                                    </form>
                                ) : (
                                    <div style={{ color: 'var(--text-secondary)' }}>
                                        {formData.title} saved at {formData.price} ETH
                                        <button onClick={() => setCreatedCourse(null)} className="btn-text" style={{ marginLeft: '1rem' }}>Edit</button>
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
                                                <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>SECTION {idx + 1}: {section.title.toUpperCase()}</div>
                                                <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                                                    {section.lessons?.map(lesson => (
                                                        <div key={lesson.id} style={{ color: 'var(--text-secondary)', padding: '0.2rem 0' }}>• {lesson.title}</div>
                                                    ))}
                                                    
                                                    {activeLessonSectionId === section.id ? (
                                                        <div style={{ borderTop: '2px solid var(--text)', marginTop: '1rem', paddingTop: '1rem' }}>
                                                            <input type="text" placeholder="Lesson Title" name="title" value={lessonData.title} onChange={handleLessonChange} />
                                                            <textarea placeholder="Content/Markdown" name="content" value={lessonData.content} onChange={handleLessonChange} />
                                                            <BrutalistButton onClick={handleAddLesson} style={{ fontSize: '0.8rem' }}>SAVE LESSON</BrutalistButton>
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
                                                    <BrutalistButton onClick={handleAddSection} style={{ flex: 1 }}>SAVE SECTION</BrutalistButton>
                                                    <BrutalistButton onClick={() => setAddingSection(false)} style={{ background: 'var(--error)', flex: 1 }}>CANCEL</BrutalistButton>
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

                            {/* STEP 3: Mint */}
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
                                        <>
                                            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                                                Ready to finalize? This will anchor your course to your sovereign school contract: <b>{ownedSchools[0]}</b>
                                            </p>
                                            <BrutalistButton onClick={handleMint} style={{ width: '100%', fontSize: '1.5rem' }}>
                                                MINT COURSE ON-CHAIN
                                            </BrutalistButton>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: PREVIEW */}
                        <div className="preview-side" style={{ position: 'sticky', top: '100px' }}>
                            <div style={{ border: '5px solid var(--text)', padding: '1.5rem', background: 'var(--surface)', boxShadow: '10px 10px 0 var(--text)' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-secondary)', marginBottom: '1rem' }}>STUDIO PREVIEW</div>
                                <div style={{ 
                                    width: '100%', 
                                    height: '200px', 
                                    background: 'var(--background)', 
                                    border: '4px solid var(--text)',
                                    backgroundImage: `url(${formData.image_url})`,
                                    backgroundSize: 'cover',
                                    marginBottom: '1rem'
                                }}></div>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: '900', lineHeight: '1' }}>{formData.title || 'COURSE TITLE'}</h3>
                                <p style={{ fontSize: '0.9rem', margin: '1rem 0', color: 'var(--text-secondary)' }}>{formData.description || 'Course description preview...'}</p>
                                <div style={{ fontSize: '1.5rem', fontWeight: '900', borderTop: '4px solid var(--text)', paddingTop: '1rem' }}>
                                    {formData.price ? `${formData.price} ETH` : 'FREE'}
                                </div>
                                <div style={{ marginTop: '1rem', borderTop: '2px solid var(--text)', paddingTop: '1rem' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '800' }}>CURRICULUM ({sections.length} SECTIONS)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default InstructorDashboard;
