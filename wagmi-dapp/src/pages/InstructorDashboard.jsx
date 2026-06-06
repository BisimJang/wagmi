// src/pages/InstructorDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useSovereignManagement } from '../hooks/useSovereignManagement';
import { useAccount } from 'wagmi';
import { Layout, Plus, Settings, List, Eye, CloudLightning, CheckCircle, ChevronRight, Play, ArrowLeft, Layers, Save, X } from 'lucide-react';

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
    fetchLessons,
    showMessage
}) => {
    const { address } = useAccount();

    const [view, setView] = useState('list'); // 'list' or 'editor'
    const [schoolName, setSchoolName] = useState('');

    // Course Details
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        image_url: ''
    });
    const [createdCourse, setCreatedCourse] = useState(null);
    const [isEditingCourseDetail, setIsEditingCourseDetail] = useState(true);

    // Curriculum
    const [sections, setSections] = useState([]);
    const [addingSection, setAddingSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    
    const [activeLessonSectionId, setActiveLessonSectionId] = useState(null);
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [editingSectionId, setEditingSectionId] = useState(null);
    const [lessonData, setLessonData] = useState({ title: '', content: '', video_url: '', image_url: '' });

    // UI
    const [activeTab, setActiveTab] = useState('settings'); 
    const [expandedSectionId, setExpandedSectionId] = useState(null);
    const [selectedSchoolIndex, setSelectedSchoolIndex] = useState(0);
    const [isLegacySchool, setIsLegacySchool] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    const hasSchool = ownedSchools && ownedSchools.length > 0;

    const { updateOnChainSigner, withdrawFunds, getContractSigner, isActionLoading } = useSovereignManagement(showMessage);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 1024;
            setIsMobile(mobile);
            // Only force open on PC if transitioning from mobile
            if (!mobile && window.innerWidth > 1024) {
                // We don't force it here so user preference is kept
            }
        };
        
        const checkLegacyStatus = async () => {
            if (hasSchool && ownedSchools[selectedSchoolIndex]) {
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

    const handleEditCourse = async (course) => {
        setCreatedCourse(course);
        setFormData({
            title: course.title,
            description: course.description,
            price: course.price,
            image_url: course.image_url || '',
            school_address: course.school_address || ''
        });
        setIsEditingCourseDetail(false);
        setView('editor');
        
        if (fetchLessons) {
            const data = await fetchLessons(course.id);
            if (data && data.lessons) {
                setSections(groupLessonsBySection(data.lessons));
            }
        }
    };

    const handleCreateNew = () => {
        setCreatedCourse(null);
        setFormData({ title: '', description: '', price: '', image_url: '', school_address: ownedSchools.length > 0 ? ownedSchools[0].address : '' });
        setSections([]);
        setIsEditingCourseDetail(true);
        setView('editor');
    };

    const handleLaunchSchool = async () => {
        if (!schoolName.trim()) return;
        await createSchoolOnChain(schoolName);
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
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                },
                body: uploadData
            });
            
            if (!response.ok) throw new Error('Upload failed');
            const data = await response.json();
            
            if (type === 'course') {
                setFormData(prev => ({ ...prev, image_url: data.url }));
            } else {
                setLessonData(prev => ({ ...prev, image_url: data.url }));
            }
            
            showMessage('Image uploaded successfully', 'success');
        } catch (error) {
            console.error('Upload error:', error);
            showMessage('Failed to upload image', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        const floatPrice = parseFloat(formData.price);
        if (isNaN(floatPrice) || floatPrice < 0) return;

        const dataToSubmit = { ...formData, price: floatPrice };
        
        if (createdCourse && createdCourse.id) {
            const result = await updateCourse(createdCourse.id, dataToSubmit);
            if (result) {
                setCreatedCourse(result);
                setIsEditingCourseDetail(false);
            }
        } else {
            const result = await createCourse(dataToSubmit);
            if (result && result.id) {
                setCreatedCourse(result);
                setIsEditingCourseDetail(false);
            }
        }
    };

    const handleAddSection = async () => {
        if (!newSectionTitle.trim()) return;
        
        if (editingSectionId) {
            const result = await updateSection(editingSectionId, newSectionTitle);
            if (result) {
                setSections(sections.map(s => s.id === editingSectionId ? { ...s, title: result.title } : s));
                setNewSectionTitle('');
                setAddingSection(false);
                setEditingSectionId(null);
            }
        } else {
            if (!createdCourse) {
                if (showMessage) showMessage('Please save course details before adding sections.', 'error');
                return;
            }
            const result = await createSection(createdCourse.id, newSectionTitle);
            if (result && result.id) {
                setSections([...sections, { id: result.id, title: result.title, lessons: [] }]);
                setNewSectionTitle('');
                setAddingSection(false);
            }
        }
    };

    const handleAddLesson = async () => {
        if (!lessonData.title.trim()) return;
        
        if (editingLessonId) {
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

    const handleMint = async () => {
        if (!hasSchool) return;
        const targetSchool = ownedSchools[selectedSchoolIndex];
        const result = await mintCourse(createdCourse.id, createdCourse.price, targetSchool.address, user?.display_name || 'Anonymous');
        if (result) setCreatedCourse({ ...createdCourse, is_minted: true });
    };

    return (
        <section className="page" style={{ padding: 0 }}>
            {!hasSchool ? (
                <div className="container" style={{ paddingTop: '8rem' }}>
                    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1rem' }}>Initialize Sovereign School</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem auto' }}>You haven't launched an institutional node yet. Create one to start publishing your own on-chain curriculum.</p>
                        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
                            <label htmlFor="school-name-input" style={{ display: 'block', fontSize: '0.6rem', fontWeight: '800', color: '#444', marginBottom: '0.8rem' }}>INSTITUTION NAME</label>
                            <input 
                                id="school-name-input"
                                name="school-name-input"
                                type="text" 
                                placeholder="e.g. Code Culture Academy" 
                                value={schoolName} 
                                onChange={(e) => setSchoolName(e.target.value)} 
                                style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', marginBottom: '1.5rem' }} 
                            />
                            <button onClick={handleLaunchSchool} disabled={isSchoolLoading} style={{ width: '100%', background: 'var(--primary-color)', padding: '1rem' }}>
                                {isSchoolLoading ? 'Initializing...' : 'Launch Sovereign School'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', minHeight: '100vh', background: '#08080a', position: 'relative' }}>
                    
                    {/* STUDIO SIDEBAR */}
                    <div style={{ 
                        width: isSidebarOpen ? '280px' : '0px', 
                        borderRight: isSidebarOpen ? '1px solid rgba(255,255,255,0.05)' : 'none', 
                        padding: isSidebarOpen ? '8rem 2rem 2rem 2rem' : '0', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '2rem', 
                        background: 'rgba(13, 13, 15, 0.98)',
                        position: isMobile ? 'fixed' : 'relative',
                        top: 0,
                        left: 0,
                        height: '100vh',
                        zIndex: 3500,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflow: 'hidden',
                        backdropFilter: 'blur(20px)'
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
                                        onClick={() => { setView('list'); if(isMobile) setIsSidebarOpen(false); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1.2rem', background: view === 'list' ? 'rgba(79, 70, 229, 0.1)' : 'transparent', border: 'none', color: view === 'list' ? '#fff' : '#666', borderRadius: '12px', textAlign: 'left', fontWeight: '700' }}
                                    >
                                        <Layout size={18} /> Modules
                                    </button>
                                    <button 
                                        onClick={() => { handleCreateNew(); if(isMobile) setIsSidebarOpen(false); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1.2rem', background: 'transparent', border: 'none', color: '#666', borderRadius: '12px', textAlign: 'left', fontWeight: '700' }}
                                    >
                                        <Plus size={18} /> New Module
                                    </button>
                                    <button 
                                        onClick={() => { setView('settings'); if(isMobile) setIsSidebarOpen(false); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1.2rem', background: view === 'settings' ? 'rgba(79, 70, 229, 0.1)' : 'transparent', border: 'none', color: view === 'settings' ? '#fff' : '#666', borderRadius: '12px', textAlign: 'left', fontWeight: '700' }}
                                    >
                                        <Settings size={18} /> Node Settings
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* MOBILE TOGGLE (Floating) */}
                    {isMobile && !isSidebarOpen && (
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            style={{ 
                                position: 'fixed', 
                                bottom: '6.5rem', 
                                left: '1.5rem', 
                                zIndex: 3600, 
                                background: 'var(--primary-color)', 
                                width: '48px', 
                                height: '48px', 
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                cursor: 'pointer'
                            }}
                        >
                            <List size={20} />
                        </button>
                    )}

                    {/* MAIN AREA */}
                    <div style={{ 
                        flex: 1, 
                        padding: isMobile ? '6rem 1.5rem 6rem 1.5rem' : '8rem 4rem 4rem 4rem', 
                        overflowY: 'auto',
                        position: 'relative'
                    }}>
                        {/* PC Sidebar Toggle (Only visible when closed) */}
                        {!isSidebarOpen && !isMobile && (
                            <button 
                                onClick={() => setIsSidebarOpen(true)}
                                style={{ 
                                    position: 'absolute', 
                                    top: '2rem', 
                                    left: '2rem', 
                                    zIndex: 100, 
                                    background: 'rgba(79, 70, 229, 0.1)', 
                                    border: '1px solid rgba(79, 70, 229, 0.2)', 
                                    color: 'var(--primary-color)',
                                    padding: '0.8rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer'
                                }}
                            >
                                <List size={20} />
                            </button>
                        )}
                        {view === 'list' ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
                                    <div>
                                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.5rem' }}>Curriculum Studio</h1>
                                        <p style={{ color: 'var(--text-secondary)' }}>Manage and deploy your learning modules.</p>
                                    </div>
                                    <button onClick={handleCreateNew} style={{ background: 'var(--primary-color)', padding: '0.8rem 2rem' }}>+ Create New</button>
                                </div>
                                <div className="course-grid" style={{ padding: 0 }}>
                                    {Array.isArray(courses) && courses.filter(c => c.is_instructor).map(course => (
                                        <div key={course.id} className="glass-panel" style={{ padding: '2rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                                <span style={{ fontSize: '0.6rem', fontWeight: '900', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', color: course.is_minted ? 'var(--primary-color)' : '#444' }}>{course.is_minted ? 'DEPLOYED' : 'DRAFT'}</span>
                                                <span style={{ fontSize: '0.8rem', fontWeight: '800' }}>{course.price} ETH</span>
                                            </div>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem' }}>{course.title}</h3>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleEditCourse(course)} style={{ flex: 1, background: 'var(--primary-color)', fontSize: '0.8rem', padding: '0.6rem' }}>Edit</button>
                                                <button style={{ flex: 1, background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem', padding: '0.6rem' }}>Stats</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : view === 'settings' ? (
                            <div style={{ maxWidth: '800px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4rem' }}>
                                    <div>
                                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem' }}>Node Management</h1>
                                        <p style={{ color: 'var(--text-secondary)' }}>Configure on-chain authorization and financial settings.</p>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                                        {ownedSchools.length > 0 && (
                                            <div style={{ textAlign: 'right' }}>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#444', marginBottom: '0.8rem' }}>SWITCH NODE</label>
                                                <select 
                                                    value={selectedSchoolIndex}
                                                    onChange={(e) => setSelectedSchoolIndex(parseInt(e.target.value))}
                                                    style={{ padding: '0.8rem 1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', cursor: 'pointer' }}
                                                >
                                                    {ownedSchools.map((school, idx) => (
                                                        <option key={idx} value={idx}>{school.name} ({school.address.slice(0,6)}...)</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => {
                                                // Trigger a "New School" flow
                                                const name = prompt("Enter a name for your New Institutional Node:");
                                                if (name) createSchoolOnChain(name);
                                            }}
                                            style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary-color)', border: '1px dashed var(--primary-color)', padding: '0.8rem 1.5rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800' }}
                                        >
                                            + Launch New Node
                                        </button>
                                    </div>
                                </div>

                                {isLegacySchool && (
                                    <div className="glass-panel" style={{ padding: '2rem', border: '1px solid #ff4d4d', background: 'rgba(255, 77, 77, 0.05)', marginBottom: '3rem' }}>
                                        <h3 style={{ color: '#ff4d4d', marginBottom: '0.5rem' }}>Legacy Node Detected</h3>
                                        <p style={{ fontSize: '0.9rem', color: '#888' }}>This school was launched on an older version of the protocol. It does not support NFT certificates. To use new features, please launch a new Institutional Node.</p>
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                                    <div className="glass-panel" style={{ padding: '3rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                                            <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '1rem', borderRadius: '12px' }}><CheckCircle size={24} color="var(--primary-color)" /></div>
                                            <div>
                                                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Certificate Authorization</h3>
                                                <p style={{ fontSize: '0.9rem', color: '#666' }}>Link this school to the Studyverse signature network to enable NFT certificates.</p>
                                            </div>
                                        </div>
                                        <button disabled={isActionLoading} onClick={async () => { const school = ownedSchools[selectedSchoolIndex]; await updateOnChainSigner(school.address, "0x8fd379246834eac74B8419FfdA202CF8051F7A03"); }} style={{ background: 'var(--primary-color)', padding: '1rem 2rem' }}>{isActionLoading ? 'Authorizing...' : 'Authorize Platform Signatures'}</button>
                                    </div>
                                    <div className="glass-panel" style={{ padding: '3rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                                            <div style={{ background: 'rgba(57, 255, 20, 0.1)', padding: '1rem', borderRadius: '12px' }}><Layers size={24} color="#39ff14" /></div>
                                            <div>
                                                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Financial Treasury</h3>
                                                <p style={{ fontSize: '0.9rem', color: '#666' }}>Withdraw collected enrollment fees from the school contract.</p>
                                            </div>
                                        </div>
                                        <button disabled={isActionLoading} onClick={async () => { const school = ownedSchools[selectedSchoolIndex]; await withdrawFunds(school.address); }} style={{ background: '#39ff14', color: '#000', padding: '1rem 2rem' }}>{isActionLoading ? 'Processing...' : 'Withdraw All Funds'}</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: isMobile ? '2rem' : '4rem' }}>
                                    <button onClick={() => setView('list')} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.6rem', borderRadius: '10px' }}><ArrowLeft size={18} /></button>
                                    <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: '900' }}>{formData.title || 'New Module'}</h1>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: isMobile ? '2rem' : '4rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <button 
                                                onClick={() => setActiveTab('settings')} 
                                                style={{ padding: '1rem 0', background: 'none', border: 'none', color: activeTab === 'settings' ? '#fff' : '#444', fontWeight: '700', borderBottom: activeTab === 'settings' ? '2px solid var(--primary-color)' : '2px solid transparent', borderRadius: 0 }}
                                            >
                                                Settings
                                            </button>
                                            <button 
                                                disabled={!createdCourse}
                                                onClick={() => setActiveTab('curriculum')} 
                                                style={{ 
                                                    padding: '1rem 0', 
                                                    background: 'none', 
                                                    border: 'none', 
                                                    color: !createdCourse ? '#222' : (activeTab === 'curriculum' ? '#fff' : '#444'), 
                                                    fontWeight: '700', 
                                                    borderBottom: activeTab === 'curriculum' ? '2px solid var(--primary-color)' : '2px solid transparent', 
                                                    borderRadius: 0,
                                                    opacity: !createdCourse ? 0.5 : 1,
                                                    cursor: !createdCourse ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                Curriculum
                                            </button>
                                        </div>
                                        {activeTab === 'settings' ? (
                                            <form onSubmit={handleCourseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                                <div className="glass-panel" style={{ padding: '2.5rem' }}>
                                                    <div style={{ marginBottom: '2rem' }}>
                                                        <label htmlFor="course-title" style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#444', marginBottom: '0.8rem' }}>MODULE TITLE</label>
                                                        <input id="course-title" type="text" name="title" value={formData.title} onChange={handleChange} style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff' }} />
                                                    </div>
                                                    <div style={{ marginBottom: '2rem' }}>
                                                        <label htmlFor="course-image-url" style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#444', marginBottom: '0.8rem' }}>MODULE IMAGE</label>
                                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                            {formData.image_url && <img src={formData.image_url} alt="Course" style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} />}
                                                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'course')} style={{ display: 'none' }} id="course-image-upload" />
                                                            <label htmlFor="course-image-upload" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '800' }}>
                                                                {isUploading ? 'Uploading...' : 'Upload Image'}
                                                            </label>
                                                            <input id="course-image-url" type="text" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="Or paste image URL" style={{ flex: 1, minWidth: '200px', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff' }} />
                                                        </div>
                                                    </div>
                                                    <div style={{ marginBottom: '2rem' }}>
                                                        <label htmlFor="course-price" style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#444', marginBottom: '0.8rem' }}>PRICE (ETH)</label>
                                                        <input id="course-price" type="number" step="0.001" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff' }} />
                                                    </div>
                                                    <div style={{ marginBottom: '2rem' }}>
                                                        <label htmlFor="course-school" style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#444', marginBottom: '0.8rem' }}>ASSOCIATED SCHOOL</label>
                                                        <select id="course-school" name="school_address" value={formData.school_address || ''} onChange={handleChange} style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff' }}>
                                                            <option value="" style={{ color: '#000' }}>-- Select a School --</option>
                                                            {ownedSchools && ownedSchools.map(s => (
                                                                <option key={s.address} value={s.address} style={{ color: '#000' }}>{s.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label htmlFor="course-desc" style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#444', marginBottom: '0.8rem' }}>DESCRIPTION</label>
                                                        <textarea id="course-desc" rows="5" name="description" value={formData.description} onChange={handleChange} style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff' }} />
                                                    </div>
                                                </div>
                                                <button type="submit" style={{ background: 'var(--primary-color)', padding: '1rem 3rem', alignSelf: 'flex-start' }}>Save Changes</button>
                                            </form>
                                        ) : (
                                            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                                                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Curriculum Nodes</h2>
                                                    <button onClick={() => { setAddingSection(true); setExpandedSectionId('new'); }} style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.7rem', padding: '0.5rem 1rem' }}>+ Add Section</button>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    {addingSection && (
                                                        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--primary-color)' }}>
                                                            <input 
                                                                id="new-section-title"
                                                                name="new-section-title"
                                                                type="text" 
                                                                placeholder="Section Title" 
                                                                value={newSectionTitle} 
                                                                onChange={(e) => setNewSectionTitle(e.target.value)} 
                                                                autoFocus 
                                                                style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', marginBottom: '1rem' }} 
                                                            />
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
                                                                            <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--primary-color)' }}>
                                                                                <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: '800', color: '#444', marginBottom: '0.5rem' }}>LESSON TITLE</label>
                                                                                <input 
                                                                                    id="lesson-title-input"
                                                                                    name="lesson-title-input"
                                                                                    type="text" 
                                                                                    placeholder="Lesson Title" 
                                                                                    value={lessonData.title} 
                                                                                    onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })} 
                                                                                    style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', marginBottom: '1rem' }} 
                                                                                />
                                                                                
                                                                                <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: '800', color: '#444', marginBottom: '0.5rem' }}>LESSON CONTENT (MARKDOWN)</label>
                                                                                <textarea 
                                                                                    id="lesson-content-input"
                                                                                    name="lesson-content-input"
                                                                                    rows="4" 
                                                                                    placeholder="Enter lesson content..." 
                                                                                    value={lessonData.content} 
                                                                                    onChange={(e) => setLessonData({ ...lessonData, content: e.target.value })} 
                                                                                    style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', marginBottom: '1rem' }} 
                                                                                />

                                                                                <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: '800', color: '#444', marginBottom: '0.5rem' }}>VIDEO URL</label>
                                                                                <input 
                                                                                    id="lesson-video-url"
                                                                                    name="lesson-video-url"
                                                                                    type="text" 
                                                                                    placeholder="https://..." 
                                                                                    value={lessonData.video_url} 
                                                                                    onChange={(e) => setLessonData({ ...lessonData, video_url: e.target.value })} 
                                                                                    style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', marginBottom: '1rem' }} 
                                                                                />
                                                                                
                                                                                <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: '800', color: '#444', marginBottom: '0.5rem' }}>LESSON IMAGE</label>
                                                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                                                    {lessonData.image_url && <img src={lessonData.image_url} alt="Lesson" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />}
                                                                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'lesson')} style={{ display: 'none' }} id="lesson-image-upload" />
                                                                                    <label htmlFor="lesson-image-upload" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.6rem', fontWeight: '800' }}>
                                                                                        {isUploading ? '...' : 'Upload'}
                                                                                    </label>
                                                                                    <input 
                                                                                        id="lesson-image-url-manual"
                                                                                        name="lesson-image-url-manual"
                                                                                        type="text" 
                                                                                        value={lessonData.image_url} 
                                                                                        onChange={(e) => setLessonData({ ...lessonData, image_url: e.target.value })} 
                                                                                        placeholder="URL" 
                                                                                        style={{ flex: 1, padding: '0.6rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }} 
                                                                                    />
                                                                                </div>

                                                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                                                    <button onClick={handleAddLesson} style={{ background: 'var(--primary-color)', fontSize: '0.7rem', flex: 1 }}>Save Lesson</button>
                                                                                    <button onClick={() => setActiveLessonSectionId(null)} style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.7rem' }}>Cancel</button>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        <button onClick={() => setActiveLessonSectionId(section.id)} style={{ padding: '0.8rem', border: '1px dashed rgba(255,255,255,0.1)', background: 'none', color: '#444', fontSize: '0.7rem' }}>+ ADD LESSON</button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ position: isMobile ? 'static' : 'sticky', top: '8rem' }}>
                                        <div className="glass-panel" style={{ padding: '2rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem' }}>{formData.title || 'Untitled'}</h3>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--primary-color)' }}>{formData.price || '0.00'} ETH</span>
                                                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#444' }}>{sections.length} SECTIONS</span>
                                            </div>
                                        </div>
                                        {createdCourse && (
                                            <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem', border: '1px solid var(--primary-color)', background: 'rgba(79, 70, 229, 0.05)' }}>
                                                <h4 style={{ fontSize: '0.8rem', fontWeight: '900', marginBottom: '1rem', color: 'var(--primary-color)' }}>NODE DEPLOYMENT</h4>
                                                <p style={{ fontSize: '0.7rem', color: '#666', marginBottom: '1.5rem' }}>
                                                    {createdCourse.is_minted 
                                                        ? `Currently deployed to ${createdCourse.school_name || 'Legacy Node'}. You can redeploy to your active node below.`
                                                        : "This module is in draft mode. Deploy it to your institutional node to enable enrollments."}
                                                </p>
                                                <button 
                                                    onClick={handleMint} 
                                                    style={{ width: '100%', background: 'var(--primary-color)', padding: '1rem', fontWeight: '800' }}
                                                >
                                                    {createdCourse.is_minted ? 'REDEPLOY TO ACTIVE NODE' : 'DEPLOY TO NODE'}
                                                </button>
                                                {isLegacySchool && (
                                                    <p style={{ fontSize: '0.6rem', color: '#ff4d4d', marginTop: '1rem', fontWeight: '700' }}>
                                                        ⚠️ Current school is LEGACY. Redeploying to a new node is required for certificates.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export default InstructorDashboard;
