// src/pages/SchoolsPage.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useSovereignManagement } from '../hooks/useSovereignManagement';
import { Shield, Coins, Activity, Plus, ArrowLeft, ExternalLink, Cpu } from 'lucide-react';

const SchoolsPage = ({ 
    address, 
    user, 
    schools, 
    fetchSchools, 
    isSchoolLoading, 
    isRegistryLoading,
    createSchoolOnChain,
    createSchoolWithCourses,
    courses, 
    showMessage 
}) => {
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [balances, setBalances] = useState({});
    const [onChainPrices, setOnChainPrices] = useState({});
    const [contractSigner, setContractSigner] = useState(null);
    const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
    const [newSchoolName, setNewSchoolName] = useState('');
    const [selectedOrphanIds, setSelectedOrphanIds] = useState([]);
    
    const { 
        getSchoolBalance, 
        getOnChainPrice, 
        getContractSigner,
        withdrawFunds, 
        updateOnChainPrice, 
        updateOnChainSigner,
        isActionLoading 
    } = useSovereignManagement(showMessage);

    // Schools are already filtered server-side with ?mine=true
    const mySchools = schools || [];

    const orphanedCourses = courses?.filter(c => 
        c.is_instructor && !c.school_address
    ) || [];

    useEffect(() => {
        fetchSchools();
    }, [fetchSchools]);

    const refreshSchoolData = useCallback(async (school) => {
        if (!school) return;
        const bal = await getSchoolBalance(school.address);
        setBalances(prev => ({ ...prev, [school.address]: bal }));
        const signer = await getContractSigner(school.address);
        setContractSigner(signer);

        const newPrices = { ...onChainPrices };
        const schoolCourses = courses.filter(c => c.school_address?.toLowerCase() === school.address.toLowerCase());
        for (const course of schoolCourses) {
            const ocPrice = await getOnChainPrice(school.address, course.id);
            newPrices[`${school.address}-${course.id}`] = ocPrice;
        }
        setOnChainPrices(newPrices);
    }, [courses, getSchoolBalance, getContractSigner, getOnChainPrice, onChainPrices]);

    useEffect(() => {
        if (selectedSchool) refreshSchoolData(selectedSchool);
    }, [selectedSchool]);

    useEffect(() => {
        const fetchInitialBalances = async () => {
            const newBalances = {};
            for (const school of mySchools) {
                const bal = await getSchoolBalance(school.address);
                newBalances[school.address] = bal;
            }
            setBalances(newBalances);
        };
        if (mySchools.length > 0) fetchInitialBalances();
    }, [mySchools, getSchoolBalance]);

    const handleWithdraw = async (addr) => {
        await withdrawFunds(addr);
        refreshSchoolData(selectedSchool);
    };

    const handleLaunch = async (e) => {
        e.preventDefault();
        if (!newSchoolName.trim()) return;
        
        let result;
        if (selectedOrphanIds.length > 0) {
            result = await createSchoolWithCourses(newSchoolName, selectedOrphanIds, orphanedCourses.map(c => c.price || 0.01));
        } else {
            result = await createSchoolOnChain(newSchoolName);
        }

        if (result) {
            setIsLaunchModalOpen(false);
            setNewSchoolName('');
            setSelectedOrphanIds([]);
            fetchSchools();
        }
    };

    if (!user) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '10rem 0' }}>
                <h1 className="gradient-text">Restricted Access</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Connect your decentralized identity to manage institutional nodes.</p>
            </div>
        );
    }

    if (selectedSchool) {
        const schoolCourses = courses.filter(c => c.school_address?.toLowerCase() === selectedSchool.address.toLowerCase());
        
        return (
            <section className="page">
                <div className="container">
                    <button 
                        onClick={() => setSelectedSchool(null)} 
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={16} /> Back to Nodes
                    </button>

                    <div className="glass-panel" style={{ padding: '4rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4rem' }}>
                            <div>
                                <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '0.5rem' }}>{selectedSchool.name}</h1>
                                <code style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 1rem', borderRadius: '8px' }}>{selectedSchool.address}</code>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#444', display: 'block', marginBottom: '0.5rem' }}>TREASURY BALANCE</span>
                                <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary-color)' }}>{balances[selectedSchool.address] || '0'} ETH</div>
                                <button 
                                    onClick={() => handleWithdraw(selectedSchool.address)}
                                    disabled={isActionLoading || balances[selectedSchool.address] === '0'}
                                    style={{ marginTop: '1.5rem', background: '#fff', color: '#000', padding: '0.8rem 2rem' }}
                                >
                                    {isActionLoading ? 'Processing...' : 'Withdraw Funds'}
                                </button>
                            </div>
                        </div>

                        {/* Node Status */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                                <Shield size={20} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
                                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#444', marginBottom: '0.5rem' }}>IDENTITY SIGNER</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#fff', wordBreak: 'break-all' }}>{contractSigner || 'Loading...'}</div>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                                <Activity size={20} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
                                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#444', marginBottom: '0.5rem' }}>ACTIVE MODULES</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff' }}>{schoolCourses.length}</div>
                            </div>
                        </div>

                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '2rem' }}>Protocol Configuration</h2>
                        
                        <div className="course-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {schoolCourses.map(course => {
                                const ocPrice = onChainPrices[`${selectedSchool.address}-${course.id}`];
                                const isUnpublished = ocPrice === '0.0' || ocPrice === '0';
                                
                                return (
                                    <div key={course.id} className="glass-panel" style={{ padding: '2rem', background: isUnpublished ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)', border: isUnpublished ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{course.title}</h4>
                                            {isUnpublished && <span style={{ fontSize: '0.6rem', fontWeight: '900', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>OFFLINE</span>}
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '2rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#444' }}>Network Price:</span>
                                                <span style={{ fontWeight: '800', color: isUnpublished ? '#ef4444' : '#fff' }}>{ocPrice || '...'} ETH</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#444' }}>Target Price:</span>
                                                <span style={{ color: 'var(--text-secondary)' }}>{course.price} ETH</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                id={`price-${course.id}`}
                                                defaultValue={course.price}
                                                style={{ flex: 1, padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' }}
                                            />
                                            <button 
                                                onClick={async () => {
                                                    const price = document.getElementById(`price-${course.id}`).value;
                                                    if (price) {
                                                        await updateOnChainPrice(selectedSchool.address, course.id, price);
                                                        refreshSchoolData(selectedSchool);
                                                    }
                                                }}
                                                disabled={isActionLoading}
                                                style={{ background: 'var(--primary-color)', padding: '0.6rem 1.2rem', fontSize: '0.8rem' }}
                                            >
                                                Sync
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="page">
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <h1 className="gradient-text" style={{ fontSize: '4.5rem', fontWeight: '900', marginBottom: '1.5rem', letterSpacing: '-2px' }}>Learning Engine</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>Deploy and coordinate high-performance institutional nodes on the Study Verse protocol.</p>
                </div>

                <div className="course-grid">
                    {mySchools.map((school, i) => (
                        <div key={i} className="glass-panel" style={{ padding: '3rem', position: 'relative' }}>
                            <Cpu size={24} color="var(--primary-color)" style={{ marginBottom: '1.5rem' }} />
                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#444', marginBottom: '0.5rem' }}>SOVEREIGN NODE</div>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '2rem' }}>{school.name}</h3>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
                                <span style={{ fontSize: '0.8rem', color: '#444', fontWeight: '700' }}>TREASURY</span>
                                <span style={{ fontWeight: '900', color: 'var(--primary-color)', fontSize: '1.4rem' }}>{balances[school.address] || '0'} ETH</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button onClick={() => setSelectedSchool(school)} style={{ background: 'var(--primary-color)' }}>Manage</button>
                                <button style={{ background: 'rgba(255,255,255,0.05)' }} onClick={() => window.open(`https://sepolia.etherscan.io/address/${school.address}`, '_blank')}>Scan</button>
                            </div>
                        </div>
                    ))}
                    
                    <div 
                        onClick={() => setIsLaunchModalOpen(true)}
                        style={{ 
                            padding: '3rem', 
                            border: '1px dashed rgba(255,255,255,0.1)', 
                            borderRadius: '32px',
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '1.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            background: 'rgba(255,255,255,0.01)'
                        }}
                    >
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={32} color="#444" />
                        </div>
                        <span style={{ fontWeight: '800', fontSize: '0.8rem', color: '#444', letterSpacing: '1px' }}>INITIALIZE NEW NODE</span>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {isLaunchModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                    <div className="glass-panel" style={{ width: '90%', maxWidth: '600px', padding: '4rem', position: 'relative' }}>
                        <button onClick={() => setIsLaunchModalOpen(false)} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: '#444', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '3rem' }}>Deploy Node</h2>
                        
                        <form onSubmit={handleLaunch} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#444', marginBottom: '1rem' }}>NODE IDENTIFIER (NAME)</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Creative Forge / Neural Academy" 
                                    value={newSchoolName}
                                    onChange={(e) => setNewSchoolName(e.target.value)}
                                    style={{ width: '100%', padding: '1.2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem' }}
                                />
                            </div>

                            {orphanedCourses.length > 0 && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#444', marginBottom: '1.5rem' }}>SELECT INITIAL MODULES</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px' }}>
                                        {orphanedCourses.map(course => (
                                            <label key={course.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                                                <input type="checkbox" checked={selectedOrphanIds.includes(course.id)} onChange={() => setSelectedOrphanIds(prev => prev.includes(course.id) ? prev.filter(id => id !== course.id) : [...prev, course.id])} />
                                                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{course.title}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button type="submit" style={{ background: 'var(--primary-color)', padding: '1.2rem' }}>
                                {isRegistryLoading ? 'Deploying...' : 'Deploy Node Contract'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default SchoolsPage;
