// src/pages/InstructorDashboard.jsx
import React, { useState } from 'react';

const InstructorDashboard = ({ createCourse }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        image_url: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const floatPrice = parseFloat(formData.price);
        if (isNaN(floatPrice) || floatPrice < 0) {
            alert('Please enter a valid price in ETH.');
            return;
        }

        const dataToSubmit = {
            ...formData,
            price: floatPrice
        };

        const result = await createCourse(dataToSubmit);
        if (result) {
            setFormData({
                title: '',
                description: '',
                price: '',
                image_url: ''
            });
        }
    };

    return (
        <section className="page active" style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
            <div className="container" style={{ maxWidth: '600px', width: '100%' }}>
                <div style={{
                    background: 'var(--surface-color)',
                    border: '3px solid var(--border-color)',
                    boxShadow: 'var(--brutal-shadow)',
                    padding: '2rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                }}>
                    <h2 style={{ fontFamily: '"Permanent Marker", cursive', fontSize: '2rem', color: 'var(--primary-color)', textTransform: 'uppercase', borderBottom: '3px solid var(--primary-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                        Create Course
                    </h2>
                    
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'uppercase' }}>Course Title *</label>
                            <input 
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                style={{
                                    padding: '1rem',
                                    background: 'var(--bg-color)',
                                    color: 'var(--text-primary)',
                                    border: '3px solid var(--border-color)',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit'
                                }}
                                placeholder="DIGITAL POTTERY 101"
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'uppercase' }}>Description *</label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="4"
                                style={{
                                    padding: '1rem',
                                    background: 'var(--bg-color)',
                                    color: 'var(--text-primary)',
                                    border: '3px solid var(--border-color)',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                                placeholder="A raw, brutalist approach to molding smart contracts."
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'uppercase' }}>Price (ETH) *</label>
                            <input 
                                type="number"
                                step="0.0001"
                                min="0"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                style={{
                                    padding: '1rem',
                                    background: 'var(--bg-color)',
                                    color: 'var(--text-primary)',
                                    border: '3px solid var(--border-color)',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit'
                                }}
                                placeholder="0.03"
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'uppercase' }}>Course Image URL</label>
                            <input 
                                type="url"
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleChange}
                                style={{
                                    padding: '1rem',
                                    background: 'var(--bg-color)',
                                    color: 'var(--text-primary)',
                                    border: '3px solid var(--border-color)',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit'
                                }}
                                placeholder="https://images.unsplash.com/..."
                            />
                        </div>

                        <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer', fontFamily: '"Permanent Marker", cursive' }}>
                            MINT COURSE TO BLOCKCHAIN
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default InstructorDashboard;
