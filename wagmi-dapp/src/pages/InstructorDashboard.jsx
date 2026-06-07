import React, { useState, useEffect } from 'react';
import { useSovereignManagement } from '../hooks/useSovereignManagement';
import { Layout, Plus, Settings, List, CheckCircle, ChevronRight, ArrowLeft, Layers, Building2, X } from 'lucide-react';

const InstructorDashboard = ({ 
    user,
    createCourse, 
    updateCourse,
    createSection, 
    updateSection,
    createLesson, 
    updateLesson,
    mintCourse, 
    courses,
    createSchoolOnChain,
    ownedSchools,
    isSchoolLoading,
    fetchLessons,
    showMessage
}) => {


    const [activeTab, setActiveTab] = useState('courses'); // 'courses' or 'institutions'
    const [view, setView] = useState('list'); // 'list' or 'editor' (for courses)
    const [schoolName, setSchoolName] = useState('');

    // Course Details
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        fiat_price: '',
        image_url: '',
        school_address: ''
    });
    const [createdCourse, setCreatedCourse] = useState(null);

    // Curriculum
    const [sections, setSections] = useState([]);
    const [addingSection, setAddingSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    
    const [activeLessonSectionId, setActiveLessonSectionId] = useState(null);
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [editingSectionId, setEditingSectionId] = useState(null);
    const [lessonData, setLessonData] = useState({ title: '', content: '', video_url: '', image_url: '' });

    // UI
    const [courseEditorTab, setCourseEditorTab] = useState('settings'); 
    const [expandedSectionId, setExpandedSectionId] = useState(null);
    const [selectedSchoolIndex, setSelectedSchoolIndex] = useState(0);
    const [isLegacySchool, setIsLegacySchool] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    const hasSchool = ownedSchools && ownedSchools.length > 0;

    const { updateOnChainSigner, withdrawFunds, getContractSigner, isActionLoading } = useSovereignManagement(showMessage);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        const checkLegacyStatus = async () => {
            if (hasSchool && ownedSchools[selectedSchoolIndex] && ownedSchools[selectedSchoolIndex].address.startsWith('0x')) {
                const signerStatus = await getContractSigner(ownedSchools[selectedSchoolIndex].address);
                setIsLegacySchool(signerStatus === 'LEGACY_CONTRACT');
            }
        };

        window.addEventListener('resize', handleResize);
        checkLegacyStatus();
        return () => window.removeEventListener('resize', handleResize);
    }, [selectedSchoolIndex, ownedSchools, getContractSigner, hasSchool]);

    const groupLessonsBySection = (flatLessons) => {
        const sectionsMap = {};
        flatLessons.forEach(lesson => {
            const sectionId = lesson.section_id;
            if (!sectionsMap[sectionId]) {
                sectionsMap[sectionId] = { id: sectionId, title: lesson.section_title || 'Untitled Section', order: lesson.section_order || 0, lessons: [] };
            }
            sectionsMap[sectionId].lessons.push(lesson);
        });
        return Object.values(sectionsMap).sort((a, b) => a.order - b.order);
    };

    const handleEditCourse = async (course) => {
        setCreatedCourse(course);
        setFormData({
            title: course.title || '',
            description: course.description || '',
            fiat_price: course.fiat_price || '',
            image_url: course.image_url || '',
            school_address: course.school_address || ''
        });
        setView('editor');
        
        if (fetchLessons) {
            const data = await fetchLessons(course.id);
            if (data && data.lessons) {
                setSections(groupLessonsBySection(data.lessons));
            }
        }
    };

    const handleCreateNewCourse = () => {
        setCreatedCourse(null);
        setFormData({ title: '', description: '', fiat_price: '', image_url: '', school_address: hasSchool ? ownedSchools[0].address : '' });
        setSections([]);
        setView('editor');
    };

    const handleLaunchSchool = async () => {
        if (!schoolName.trim()) return;
        await createSchoolOnChain(schoolName);
        setSchoolName('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e, type = 'course') => {
        const file = e.target.files[0];
        if (!file) return;
        
        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('image', file);
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/upload/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` },
                body: uploadData
            });
            if (!response.ok) throw new Error('Upload failed');
            const data = await response.json();
            
            if (type === 'course') setFormData(prev => ({ ...prev, image_url: data.url }));
            else setLessonData(prev => ({ ...prev, image_url: data.url }));
            showMessage('Image uploaded successfully', 'success');
        } catch (error) {
            showMessage('Failed to upload image', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        const price = parseFloat(formData.fiat_price);
        const dataToSubmit = { ...formData, fiat_price: isNaN(price) ? 0 : price };
        
        if (createdCourse && createdCourse.id) {
            const result = await updateCourse(createdCourse.id, dataToSubmit);
            if (result) setCreatedCourse(result);
        } else {
            const result = await createCourse(dataToSubmit);
            if (result && result.id) setCreatedCourse(result);
        }
    };

    const handleAddSection = async () => {
        if (!newSectionTitle.trim()) return;
        if (editingSectionId) {
            const result = await updateSection(editingSectionId, newSectionTitle);
            if (result) {
                setSections(sections.map(s => s.id === editingSectionId ? { ...s, title: result.title } : s));
                setNewSectionTitle(''); setAddingSection(false); setEditingSectionId(null);
            }
        } else {
            if (!createdCourse) { showMessage('Please save course details before adding sections.', 'error'); return; }
            const result = await createSection(createdCourse.id, newSectionTitle);
            if (result && result.id) {
                setSections([...sections, { id: result.id, title: result.title, lessons: [] }]);
                setNewSectionTitle(''); setAddingSection(false);
            }
        }
    };

    const handleAddLesson = async () => {
        if (!lessonData.title.trim()) return;
        if (editingLessonId) {
            const result = await updateLesson(editingLessonId, lessonData);
            if (result) {
                setSections(sections.map(sec => ({ ...sec, lessons: sec.lessons.map(l => l.id === editingLessonId ? result : l) })));
                setLessonData({ title: '', content: '', video_url: '', image_url: '' });
                setEditingLessonId(null); setActiveLessonSectionId(null);
            }
        } else {
            const result = await createLesson(activeLessonSectionId, lessonData);
            if (result && result.id) {
                setSections(sections.map(sec => sec.id === activeLessonSectionId ? { ...sec, lessons: [...sec.lessons, result] } : sec));
                setLessonData({ title: '', content: '', video_url: '', image_url: '' });
                setActiveLessonSectionId(null);
            }
        }
    };

    return (
        <section className="page" style={{ padding: 0 }}>
            <div style={{ display: 'flex', minHeight: '100vh', background: '#08080a', position: 'relative' }}>
                
                {/* STUDIO SIDEBAR */}
                <div style={{ 
                    width: isSidebarOpen ? '280px' : '0px', 
                    borderRight: isSidebarOpen ? '1px solid rgba(255,255,255,0.05)' : 'none', 
                    padding: isSidebarOpen ? '8rem 2rem 2rem 2rem' : '0', 
                    display: 'flex', flexDirection: 'column', gap: '2rem', 
                    background: 'rgba(13, 13, 15, 0.98)',
                    position: isMobile ? 'fixed' : 'relative',
                    top: 0, left: 0, height: '100vh', zIndex: 3500,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden', backdropFilter: 'blur(20px)'
                }}>
                    {isSidebarOpen && (
                        <>
                            <button 
                                onClick={() => setIsSidebarOpen(false)}
                                style={{ position: 'absolute', top: '2rem', right: '1.5rem', background: 'none', border: 'none', color: '#444', cursor: 'pointer' }}
                            >
                                <X size={isMobile ? 24 : 20} />
                            </button>
                            <div style={{ fontSize: '0.6rem', fontWeight: '900', color: '#444', letterSpacing: '1px' }}>WORKSPACE</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button 
                                    onClick={() => { setActiveTab('courses'); setView('list'); if(isMobile) setIsSidebarOpen(false); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1.2rem', background: activeTab === 'courses' ? 'rgba(79, 70, 229, 0.1)' : 'transparent', border: 'none', color: activeTab === 'courses' ? '#fff' : '#666', borderRadius: '12px', textAlign: 'left', fontWeight: '700' }}
                                >
                                    <Layout size={18} /> Courses
                                </button>
                                <button 
                                    onClick={() => { setActiveTab('institutions'); if(isMobile) setIsSidebarOpen(false); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1.2rem', background: activeTab === 'institutions' ? 'rgba(79, 70, 229, 0.1)' : 'transparent', border: 'none', color: activeTab === 'institutions' ? '#fff' : '#666', borderRadius: '12px', textAlign: 'left', fontWeight: '700' }}
                                >
                                    <Building2 size={18} /> Institutions
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* MOBILE TOGGLE */}
                {isMobile && !isSidebarOpen && (
                    <button onClick={() => setIsSidebarOpen(true)} style={{ position: 'fixed', bottom: '6.5rem', left: '1.5rem', zIndex: 3600, background: 'var(--primary-color)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                        <List size={20} />
                    </button>
                )}

                {/* MAIN AREA */}
                <div style={{ flex: 1, padding: isMobile ? '6rem 1.5rem 6rem 1.5rem' : '8rem 4rem 4rem 4rem', overflowY: 'auto', position: 'relative' }}>
                    {!isSidebarOpen && !isMobile && (
                        <button onClick={() => setIsSidebarOpen(true)} style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 100, background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.2)', color: 'var(--primary-color)', padding: '0.8rem', borderRadius: '12px', cursor: 'pointer' }}>
                            <List size={20} />
                        </button>
                    )}

                    {activeTab === 'institutions' ? (
                        <div style={{ maxWidth: '800px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4rem' }}>
                                <div>
                                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem' }}>Institutions</h1>
                                    <p style={{ color: 'var(--text-secondary)' }}>Manage your organisations and web3 nodes.</p>
                                </div>
                            </div>

                            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1rem' }}>Create New Institution</h3>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Institution Name" 
                                        value={schoolName} 
                                        onChange={(e) => setSchoolName(e.target.value)} 
                                        style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }} 
                                    />
                                    <button onClick={handleLaunchSchool} disabled={isSchoolLoading} style={{ background: 'var(--primary-color)', padding: '0 2rem', borderRadius: '10px', fontWeight: '700' }}>
                                        {isSchoolLoading ? 'Creating...' : 'Create'}
                                    </button>
                                </div>
                            </div>

                            {hasSchool && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#444', marginBottom: '0.8rem' }}>SELECT INSTITUTION TO MANAGE</label>
                                    <select 
                                        value={selectedSchoolIndex}
                                        onChange={(e) => setSelectedSchoolIndex(parseInt(e.target.value))}
                                        style={{ width: '100%', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '1rem', cursor: 'pointer' }}
                                    >
                                        {ownedSchools.map((school, idx) => (
                                            <option key={idx} value={idx} style={{color: '#000'}}>{school.name} {school.address.startsWith('0x') ? `(${school.address.slice(0,6)}...)` : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {hasSchool && ownedSchools[selectedSchoolIndex]?.address.startsWith('0x') && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    {isLegacySchool && (
                                        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid #ff4d4d', background: 'rgba(255, 77, 77, 0.05)' }}>
                                            <h3 style={{ color: '#ff4d4d', marginBottom: '0.5rem' }}>Legacy Node Detected</h3>
                                            <p style={{ fontSize: '0.9rem', color: '#888' }}>This school was launched on an older version of the protocol.</p>
                                        </div>
                                    )}
                                    <div className="glass-panel" style={{ padding: '2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                            <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '1rem', borderRadius: '12px' }}><CheckCircle size={24} color="var(--primary-color)" /></div>
                                            <div>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Web3 Signatures</h3>
                                                <p style={{ fontSize: '0.8rem', color: '#666' }}>Authorize platform signatures for NFT certificates.</p>
                                            </div>
                                        </div>
                                        <button disabled={isActionLoading} onClick={async () => { await updateOnChainSigner(ownedSchools[selectedSchoolIndex].address, "0x8fd379246834eac74B8419FfdA202CF8051F7A03"); }} style={{ background: 'var(--primary-color)', padding: '0.8rem 1.5rem', fontSize: '0.8rem' }}>{isActionLoading ? 'Authorizing...' : 'Authorize Signer'}</button>
                                    </div>
                                    <div className="glass-panel" style={{ padding: '2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                            <div style={{ background: 'rgba(57, 255, 20, 0.1)', padding: '1rem', borderRadius: '12px' }}><Layers size={24} color="#39ff14" /></div>
                                            <div>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Treasury</h3>
                                                <p style={{ fontSize: '0.8rem', color: '#666' }}>Withdraw crypto enrollment fees from the contract.</p>
                                            </div>
                                        </div>
                                        <button disabled={isActionLoading} onClick={async () => { await withdrawFunds(ownedSchools[selectedSchoolIndex].address); }} style={{ background: '#39ff14', color: '#000', padding: '0.8rem 1.5rem', fontSize: '0.8rem', fontWeight: '700' }}>{isActionLoading ? 'Processing...' : 'Withdraw Funds'}</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : view === 'list' ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
                                <div>
                                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.5rem' }}>Courses</h1>
                                    <p style={{ color: 'var(--text-secondary)' }}>Manage and deploy your learning modules.</p>
                                </div>
                                <button onClick={handleCreateNewCourse} style={{ background: 'var(--primary-color)', padding: '0.8rem 2rem' }}>+ Create Course</button>
                            </div>
                            <div className="course-grid" style={{ padding: 0 }}>
                                {Array.isArray(courses) && courses.filter(c => c.is_instructor).map(course => (
                                    <div key={course.id} className="glass-panel" style={{ padding: '2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                            <span style={{ fontSize: '0.6rem', fontWeight: '900', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', color: course.is_minted ? 'var(--primary-color)' : '#444' }}>{course.is_minted ? 'ON-CHAIN' : 'DRAFT'}</span>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#3ec636' }}>₦ {course.fiat_price || 0}</span>
                                        </div>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem' }}>{course.title}</h3>
                                        <button onClick={() => handleEditCourse(course)} style={{ width: '100%', background: 'var(--primary-color)', fontSize: '0.8rem', padding: '0.6rem' }}>Edit Course</button>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ maxWidth: '900px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: isMobile ? '2rem' : '4rem' }}>
                                <button onClick={() => setView('list')} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.6rem', borderRadius: '10px' }}><ArrowLeft size={18} /></button>
                                <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: '900' }}>{formData.title || 'New Course'}</h1>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr', gap: isMobile ? '2rem' : '4rem' }}>
                                <div>
                                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <button onClick={() => setCourseEditorTab('settings')} style={{ padding: '1rem 0', background: 'none', border: 'none', color: courseEditorTab === 'settings' ? '#fff' : '#444', fontWeight: '700', borderBottom: courseEditorTab === 'settings' ? '2px solid var(--primary-color)' : '2px solid transparent' }}>
                                            Settings
                                        </button>
                                        <button disabled={!createdCourse} onClick={() => setCourseEditorTab('curriculum')} style={{ padding: '1rem 0', background: 'none', border: 'none', color: !createdCourse ? '#222' : (courseEditorTab === 'curriculum' ? '#fff' : '#444'), fontWeight: '700', borderBottom: courseEditorTab === 'curriculum' ? '2px solid var(--primary-color)' : '2px solid transparent', opacity: !createdCourse ? 0.5 : 1, cursor: !createdCourse ? 'not-allowed' : 'pointer' }}>
                                            Curriculum
                                        </button>
                                    </div>
                                    {courseEditorTab === 'settings' ? (
                                        <form onSubmit={handleCourseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                                                <div style={{ marginBottom: '2rem' }}>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#444', marginBottom: '0.8rem' }}>COURSE TITLE</label>
                                                    <input type="text" name="title" value={formData.title} onChange={handleChange} style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff' }} required />
                                                </div>
                                                <div style={{ marginBottom: '2rem' }}>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#444', marginBottom: '0.8rem' }}>PRICE (₦)</label>
                                                    <input type="number" step="0.01" name="fiat_price" value={formData.fiat_price} onChange={handleChange} placeholder="0.00" style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff' }} />
                                                </div>
                                                <div style={{ marginBottom: '2rem' }}>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#444', marginBottom: '0.8rem' }}>ASSOCIATED INSTITUTION</label>
                                                    <select name="school_address" value={formData.school_address || ''} onChange={handleChange} style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff' }}>
                                                        <option value="" style={{ color: '#000' }}>-- Select an Institution --</option>
                                                        {ownedSchools && ownedSchools.map(s => (
                                                            <option key={s.address} value={s.address} style={{ color: '#000' }}>{s.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div style={{ marginBottom: '2rem' }}>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#444', marginBottom: '0.8rem' }}>DESCRIPTION</label>
                                                    <textarea rows="5" name="description" value={formData.description} onChange={handleChange} style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff' }} />
                                                </div>
                                                <div style={{ marginBottom: '2rem' }}>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#444', marginBottom: '0.8rem' }}>COVER IMAGE</label>
                                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                        {formData.image_url && <img src={formData.image_url} alt="Course" style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} />}
                                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'course')} style={{ display: 'none' }} id="course-image-upload" />
                                                        <label htmlFor="course-image-upload" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '800' }}>{isUploading ? 'Uploading...' : 'Upload Image'}</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <button type="submit" style={{ background: 'var(--primary-color)', padding: '1rem 3rem', alignSelf: 'flex-start', borderRadius: '10px', fontWeight: '700' }}>Save Course Details</button>
                                        </form>
                                    ) : (
                                        <div className="glass-panel" style={{ padding: '2.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                                                <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Curriculum</h2>
                                                <button onClick={() => { setAddingSection(true); setExpandedSectionId('new'); }} style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.7rem', padding: '0.5rem 1rem' }}>+ Add Section</button>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {addingSection && (
                                                    <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--primary-color)' }}>
                                                        <input type="text" placeholder="Section Title" value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} autoFocus style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', marginBottom: '1rem' }} />
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button onClick={handleAddSection} style={{ background: 'var(--primary-color)', fontSize: '0.7rem' }}>Save Section</button>
                                                            <button onClick={() => setAddingSection(false)} style={{ background: 'transparent', fontSize: '0.7rem' }}>Cancel</button>
                                                        </div>
                                                    </div>
                                                )}
                                                {sections.map((section, idx) => (
                                                    <div key={section.id} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', overflow: 'hidden' }}>
                                                        <div onClick={() => setExpandedSectionId(expandedSectionId === section.id ? null : section.id)} style={{ padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                                            <span style={{ fontWeight: '700' }}>{idx + 1}. {section.title}</span>
                                                            <ChevronRight size={16} style={{ transform: expandedSectionId === section.id ? 'rotate(90deg)' : 'none' }} />
                                                        </div>
                                                        {expandedSectionId === section.id && (
                                                            <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                                    {section.lessons?.map(lesson => <div key={lesson.id} style={{ padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '0.9rem' }}>{lesson.title}</div>)}
                                                                    {activeLessonSectionId === section.id && (
                                                                        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--primary-color)', marginTop: '1rem' }}>
                                                                            <input type="text" placeholder="Lesson Title" value={lessonData.title} onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', marginBottom: '1rem' }} />
                                                                            <textarea rows="4" placeholder="Lesson Content (Markdown)" value={lessonData.content} onChange={(e) => setLessonData({ ...lessonData, content: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', marginBottom: '1rem' }} />
                                                                            <input type="text" placeholder="Video URL" value={lessonData.video_url} onChange={(e) => setLessonData({ ...lessonData, video_url: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', marginBottom: '1rem' }} />
                                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                                <button onClick={handleAddLesson} style={{ background: 'var(--primary-color)', fontSize: '0.7rem' }}>Save Lesson</button>
                                                                                <button onClick={() => setActiveLessonSectionId(null)} style={{ background: 'transparent', fontSize: '0.7rem' }}>Cancel</button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {activeLessonSectionId !== section.id && (
                                                                        <button onClick={() => setActiveLessonSectionId(section.id)} style={{ background: 'none', border: '1px dashed rgba(255,255,255,0.1)', color: '#666', padding: '0.8rem', borderRadius: '8px', marginTop: '0.5rem', fontSize: '0.8rem' }}>+ Add Lesson</button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default InstructorDashboard;
