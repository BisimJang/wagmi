// src/pages/InstructorDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useSovereignManagement } from '../hooks/useSovereignManagement';
import { useAccount } from 'wagmi';
import { Layout, Plus, Settings, List, Eye, CloudLightning, CheckCircle, ChevronRight, Play, ArrowLeft, Layers, Save } from 'lucide-react';

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

    const hasSchool = ownedSchools && ownedSchools.length > 0;

    const { updateOnChainSigner, withdrawFunds, getContractSigner, isActionLoading } = useSovereignManagement(showMessage);

    useEffect(() => {
        const checkLegacy = async () => {
            if (hasSchool && ownedSchools[selectedSchoolIndex]) {
                const signerStatus = await getContractSigner(ownedSchools[selectedSchoolIndex].address);
                setIsLegacySchool(signerStatus === 'LEGACY_CONTRACT');
            }
        };
        checkLegacy();
    }, [selectedSchoolIndex, ownedSchools, getContractSigner]);

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
            image_url: course.image_url || ''
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
        setFormData({ title: '', description: '', price: '', image_url: '' });
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
                    <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '4rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '2rem' }}>Initialize Sovereign School</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>You must launch an institutional node to issue on-chain certificates.</p>
                        <input 
                            type="text" 
                            placeholder="Institutional Identifier (e.g. Code Culture)" 
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                            style={{ padding: '1.2rem', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', marginBottom: '2rem' }}
                        />
                        <button onClick={handleLaunchSchool} disabled={isSchoolLoading} style={{ width: '100%', padding: '1.2rem', background: 'var(--primary-color)' }}>
                            {isSchoolLoading ? 'Initializing...' : 'Launch On-Chain Node'}
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', minHeight: '100vh', background: '#08080a' }}>
                    
                    {/* STUDIO SIDEBAR */}
                    <div style={{ width: '280px', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '8rem 2rem 2rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: '900', color: '#444', letterSpacing: '1px' }}>WORKSPACE</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button 
                                onClick={() => setView('list')}
                                style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1.2rem', background: view === 'list' ? 'rgba(79, 70, 229, 0.1)' : 'transparent', border: 'none', color: view === 'list' ? '#fff' : '#666', borderRadius: '12px', textAlign: 'left', fontWeight: '700' }}
                            >
                                <Layout size={18} /> Modules
                            </button>
                            <button 
                                onClick={handleCreateNew}
                                style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1.2rem', background: 'transparent', border: 'none', color: '#666', borderRadius: '12px', textAlign: 'left', fontWeight: '700' }}
                            >
                                <Plus size={18} /> New Module
                            </button>
                            <button 
                                onClick={() => setView('settings')}
                                style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1.2rem', background: view === 'settings' ? 'rgba(79, 70, 229, 0.1)' : 'transparent', border: 'none', color: view === 'settings' ? '#fff' : '#666', borderRadius: '12px', textAlign: 'left', fontWeight: '700' }}
                            >
                                <Settings size={18} /> Node Settings
                            </button>
                        </div>
                    </div>

                    {/* MAIN AREA */}
                    <div style={{ flex: 1, padding: '8rem 4rem 4rem 4rem', overflowY: 'auto' }}>
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
                                    
                                    {ownedSchools.length > 1 && (
                                        <div style={{ textAlign: 'right' }}>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#444', marginBottom: '0.8rem' }}>SWITCH SCHOOL</label>
                                            <select 
                                                value={selectedSchoolIndex}
                                                onChange={(e) => setSelectedSchoolIndex(parseInt(e.target.value))}
                                                style={{ padding: '0.8rem 1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', cursor: 'pointer' }}
                                            >
                                                {ownedSchools.map((school, idx) => (
                                                    <option key={idx} value={idx}>{school.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '4rem' }}>
                                    <button onClick={() => setView('list')} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.6rem', borderRadius: '10px' }}><ArrowLeft size={18} /></button>
                                    <h1 style={{ fontSize: '2rem', fontWeight: '900' }}>{formData.title || 'New Module'}</h1>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '4rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <button onClick={() => setActiveTab('settings')} style={{ padding: '1rem 0', background: 'none', border: 'none', color: activeTab === 'settings' ? '#fff' : '#444', fontWeight: '700', borderBottom: activeTab === 'settings' ? '2px solid var(--primary-color)' : '2px solid transparent', borderRadius: 0 }}>Settings</button>
                                            <button onClick={() => setActiveTab('curriculum')} style={{ padding: '1rem 0', background: 'none', border: 'none', color: activeTab === 'curriculum' ? '#fff' : '#444', fontWeight: '700', borderBottom: activeTab === 'curriculum' ? '2px solid var(--primary-color)' : '2px solid transparent', borderRadius: 0 }}>Curriculum</button>
                                        </div>
                                        {activeTab === 'settings' ? (
                                            <form onSubmit={handleCourseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                                <div className="glass-panel" style={{ padding: '2.5rem' }}>
                                                    <div style={{ marginBottom: '2rem' }}>
                                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#444', marginBottom: '0.8rem' }}>MODULE TITLE</label>
                                                        <input type="text" name="title" value={formData.title} onChange={handleChange} style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff' }} />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#444', marginBottom: '0.8rem' }}>DESCRIPTION</label>
                                                        <textarea rows="5" name="description" value={formData.description} onChange={handleChange} style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff' }} />
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
                                                                            <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--primary-color)' }}>
                                                                                <input type="text" value={lessonData.title} onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', marginBottom: '1rem' }} />
                                                                                <input type="text" value={lessonData.video_url} onChange={(e) => setLessonData({ ...lessonData, video_url: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', marginBottom: '1rem' }} />
                                                                                <button onClick={handleAddLesson} style={{ background: 'var(--primary-color)', fontSize: '0.7rem' }}>Save Lesson</button>
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
                                    <div style={{ position: 'sticky', top: '8rem' }}>
                                        <div className="glass-panel" style={{ padding: '2rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem' }}>{formData.title || 'Untitled'}</h3>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--primary-color)' }}>{formData.price || '0.00'} ETH</span>
                                                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#444' }}>{sections.length} SECTIONS</span>
                                            </div>
                                        </div>
                                        {createdCourse && !createdCourse.is_minted && (
                                            <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem', border: '1px solid var(--primary-color)' }}>
                                                <button onClick={handleMint} style={{ width: '100%', background: 'var(--primary-color)' }}>Mint Node</button>
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
