import React, { useEffect, useState } from 'react';
import BrutalistButton from '../components/UI/BrutalistButton';
import { useSovereignManagement } from '../hooks/useSovereignManagement';

const SchoolsPage = ({ address, user, schools, fetchSchools, isSchoolLoading, courses, showMessage }) => {
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [balances, setBalances] = useState({});
    const { getSchoolBalance, withdrawFunds, updateOnChainPrice, isActionLoading } = useSovereignManagement(showMessage);

    // Only show schools owned by the current active wallet
    const mySchools = schools.filter(s => 
        address && 
        s.instructor_address?.toLowerCase() === address.toLowerCase()
    );

    useEffect(() => {
        fetchSchools();
    }, [fetchSchools]);

    // Fetch balances for owned schools
    useEffect(() => {
        const fetchBalances = async () => {
            const newBalances = {};
            for (const school of mySchools) {
                const bal = await getSchoolBalance(school.address);
                newBalances[school.address] = bal;
            }
            setBalances(newBalances);
        };
        if (mySchools.length > 0) fetchBalances();
    }, [mySchools, getSchoolBalance]);

    const handleWithdraw = async (addr) => {
        await withdrawFunds(addr);
        const bal = await getSchoolBalance(addr);
        setBalances(prev => ({ ...prev, [addr]: bal }));
    };

    if (!user) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
                <h2 style={{ fontSize: '2.5rem' }}>Access Denied</h2>
                <p>Please connect your wallet to manage your sovereign schools.</p>
            </div>
        );
    }

    if (selectedSchool) {
        const schoolCourses = courses.filter(c => c.school_address?.toLowerCase() === selectedSchool.address.toLowerCase());
        
        return (
            <section className="page active">
                <div className="container">
                    <BrutalistButton onClick={() => setSelectedSchool(null)} style={{ marginBottom: '2rem' }}>
                        ← Back to Schools
                    </BrutalistButton>

                    <div style={{ border: '4px solid #000', padding: '2rem', background: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '2.5rem', textTransform: 'uppercase', margin: 0 }}>{selectedSchool.name}</h2>
                                <p style={{ color: '#666', marginTop: '0.5rem' }}>{selectedSchool.address}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Current Balance</div>
                                <div style={{ fontSize: '2.5rem', color: 'var(--primary-color)' }}>{balances[selectedSchool.address] || '0'} ETH</div>
                                <BrutalistButton 
                                    onClick={() => handleWithdraw(selectedSchool.address)}
                                    disabled={isActionLoading || balances[selectedSchool.address] === '0'}
                                    style={{ marginTop: '1rem', background: '#00ff00' }}
                                >
                                    {isActionLoading ? 'Processing...' : 'Withdraw Funds'}
                                </BrutalistButton>
                            </div>
                        </div>

                        <h3 style={{ borderBottom: '2px solid #000', paddingBottom: '0.5rem', marginTop: '3rem' }}>Course Contract Management</h3>
                        <div className="grid" style={{ marginTop: '1rem' }}>
                            {schoolCourses.length > 0 ? (
                                schoolCourses.map(course => (
                                    <div key={course.id} className="card" style={{ padding: '1.5rem', background: '#f9f9f9' }}>
                                        <h4>{course.title}</h4>
                                        <p>On-Chain Price: {course.price} ETH</p>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                placeholder="New Price (ETH)"
                                                id={`price-${course.id}`}
                                                style={{ flex: 1, padding: '0.5rem', border: '2px solid #000' }}
                                            />
                                            <BrutalistButton 
                                                onClick={() => {
                                                    const price = document.getElementById(`price-${course.id}`).value;
                                                    if (price) updateOnChainPrice(selectedSchool.address, course.id, price);
                                                }}
                                                disabled={isActionLoading}
                                            >
                                                Update
                                            </BrutalistButton>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ gridColumn: '1/-1', color: '#666' }}>No courses are currently assigned to this school contract.</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="page active">
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '4px solid #000', paddingBottom: '1rem' }}>
                    <h2 style={{ fontSize: '2.5rem', textTransform: 'uppercase', margin: 0 }}>School Dashboard</h2>
                    <span className="badge" style={{ fontSize: '1.2rem' }}>{mySchools.length} Owned</span>
                </div>

                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '800px' }}>
                    Manage your Sovereign School contracts. Track balances, withdraw enrollment fees, and update course pricing directly on the blockchain.
                </p>

                <div className="grid">
                    {mySchools.length > 0 ? (
                        mySchools.map((school, i) => (
                            <div key={i} className="card school-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                    Your Institutional Hub
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{school.name}</h3>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', color: '#fff', padding: '1rem', marginTop: '1rem' }}>
                                    <span>Treasury</span>
                                    <span style={{ fontWeight: 'bold', color: '#00ff00' }}>{balances[school.address] || '0'} ETH</span>
                                </div>

                                <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <BrutalistButton onClick={() => setSelectedSchool(school)}>
                                        Manage
                                    </BrutalistButton>
                                    <BrutalistButton style={{ background: '#eee' }} onClick={() => window.open(`https://sepolia.etherscan.io/address/${school.address}`, '_blank')}>
                                        Scan
                                    </BrutalistButton>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: '#f9f9f9', border: '2px dashed #ccc' }}>
                            <p>You haven't launched a Sovereign School yet.</p>
                            <BrutalistButton style={{ marginTop: '1rem' }}>Launch a School</BrutalistButton>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default SchoolsPage;
