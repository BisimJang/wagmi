import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ExternalLink, 
  Trash2, 
  ArrowLeft
} from 'lucide-react';
import BubbleGenesisModal from '../components/Study/BubbleGenesisModal';
import StudyBubbleView from '../components/Study/StudyBubbleView';

const StudyBubblesPage = ({ showPage }) => {
    const [bubbles, setBubbles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [isGenesisOpen, setIsGenesisOpen] = useState(false);
    const [selectedBubble, setSelectedBubble] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);

    useEffect(() => {
        fetchBubbles();
    }, []);

    const fetchBubbles = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/study-bubbles/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}` 
                }
            });
            if (response.ok) {
                const data = await response.json();
                setBubbles(data);
            }
        } catch (error) {
            console.error('Error fetching bubbles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenesis = (newBubble) => {
        setBubbles(prev => [newBubble, ...prev]);
        setTimeout(fetchBubbles, 5000);
    };

    const deleteBubble = async (bubbleId, e) => {
        e.stopPropagation();
        setOpenMenuId(null);
        try {
            const response = await fetch(`http://localhost:8000/api/study-bubbles/${bubbleId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` }
            });
            if (response.ok || response.status === 204) {
                setBubbles(prev => prev.filter(b => b.id !== bubbleId));
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const filteredBubbles = useMemo(() => {
        return bubbles.filter(b => {
            const matchQ = (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (b.summary || b.concept || '').toLowerCase().includes(searchQuery.toLowerCase());
            // The HTML mock used 'ready', 'processing', 'failed', 'pending'
            // The API uses 'completed', 'processing', 'failed', etc.
            const apiStatus = b.status === 'completed' ? 'ready' : b.status;
            const matchF = activeFilter === 'all' || apiStatus === activeFilter;
            return matchQ && matchF;
        });
    }, [bubbles, searchQuery, activeFilter]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (openMenuId !== null) setOpenMenuId(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [openMenuId]);

    const pipClass = (s) => {
        const status = s === 'completed' ? 'ready' : s;
        return status === 'ready' ? 'pip-ready' : status === 'processing' ? 'pip-processing' : status === 'failed' ? 'pip-failed' : 'pip-pending';
    };
    
    const stClass = (s) => {
        const status = s === 'completed' ? 'ready' : s;
        return status === 'ready' ? 'st-ready' : status === 'processing' ? 'st-processing' : status === 'failed' ? 'st-failed' : 'st-pending';
    };
    
    const stLabel = (s) => {
        const status = s === 'completed' ? 'ready' : s;
        return status === 'ready' ? 'Ready' : status === 'processing' ? 'Processing…' : status === 'failed' ? 'Failed' : 'Queued';
    };

    if (selectedBubble) {
        return <StudyBubbleView bubble={selectedBubble} onBack={() => setSelectedBubble(null)} />;
    }

    return (
        <div className="sv">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
                
                .sv * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                
                .sv {
                    --green: #3EC636;
                    --ink: #0d0d0d;
                    --pad: 22vw;
                    font-family: 'Poppins', sans-serif;
                    background: #fff;
                    color: var(--ink);
                    min-height: 100vh;
                    padding: 0 var(--pad);
                }
                
                @media (max-width: 1024px) {
                    .sv { --pad: 12vw; }
                }
                @media (max-width: 768px) {
                    .sv { --pad: 6vw; }
                }

                .topbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 28px 0 48px;
                }

                .btn-back {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: none;
                    border: 1.5px solid var(--ink);
                    border-radius: 100px;
                    padding: 9px 20px;
                    font-family: 'Poppins', sans-serif;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    color: var(--ink);
                    transition: opacity .2s;
                }
                .btn-back:hover { opacity: .45; }

                .btn-genesis {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--ink);
                    color: #fff;
                    border: none;
                    border-radius: 100px;
                    padding: 10px 24px;
                    font-family: 'Poppins', sans-serif;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: opacity .2s;
                }
                .btn-genesis:hover { opacity: .7; }



                .search-bar {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 56px;
                    max-width: 560px;
                }

                .search-wrap {
                    flex: 1;
                    position: relative;
                }

                .search-wrap input {
                    width: 100%;
                    padding: 13px 16px 13px 42px;
                    border: 1.5px solid #e0e0e0;
                    border-radius: 100px;
                    font-family: 'Poppins', sans-serif;
                    font-size: 13px;
                    font-weight: 400;
                    color: var(--ink);
                    outline: none;
                    transition: border-color .2s;
                }
                .search-wrap input:focus { border-color: var(--ink); }
                .search-wrap input::placeholder { color: #aaa; }

                .search-ico {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #aaa;
                }

                .filter-pill {
                    padding: 10px 18px;
                    border-radius: 100px;
                    border: 1.5px solid #e0e0e0;
                    background: none;
                    font-family: 'Poppins', sans-serif;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    color: #888;
                    transition: all .2s;
                    white-space: nowrap;
                }
                .filter-pill.on {
                    border-color: var(--ink);
                    color: var(--ink);
                }

                .rule {
                    width: 100%;
                    height: 1px;
                    background: #f0f0f0;
                    margin-bottom: 40px;
                }

                .bubble-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 1px;
                    border: 1px solid #f0f0f0;
                    border-radius: 0;
                    margin-bottom: 4rem;
                }

                .bubble-cell {
                    padding: 28px 24px;
                    border-right: 1px solid #f0f0f0;
                    border-bottom: 1px solid #f0f0f0;
                    cursor: pointer;
                    transition: background .2s;
                    display: flex;
                    flex-direction: column;
                    min-height: 200px;
                }
                .bubble-cell:hover { background: #fafafa; }

                .cell-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                }

                .cell-num {
                    font-size: 11px;
                    font-weight: 600;
                    color: #ccc;
                    letter-spacing: .06em;
                }

                .status-pip {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    margin-top: 3px;
                }
                .pip-ready { background: #3EC636; }
                .pip-processing { background: #F0A500; }
                .pip-failed { background: #E53935; }
                .pip-pending { background: #ccc; }

                .cell-title {
                    font-size: 15px;
                    font-weight: 600;
                    line-height: 1.35;
                    color: var(--ink);
                    margin-bottom: 8px;
                }

                .cell-desc {
                    font-size: 12px;
                    font-weight: 300;
                    color: #666;
                    line-height: 1.65;
                    flex: 1;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .cell-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 18px;
                    padding-top: 16px;
                    border-top: 1px solid #f0f0f0;
                }

                .cell-status {
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: .05em;
                    text-transform: uppercase;
                }
                .st-ready { color: #3EC636; }
                .st-processing { color: #F0A500; }
                .st-failed { color: #E53935; }
                .st-pending { color: #bbb; }

                .cell-cards {
                    font-size: 11px;
                    color: #bbb;
                    font-weight: 500;
                }

                .open-arrow {
                    font-size: 15px;
                    color: #ccc;
                    transition: color .2s;
                }
                .bubble-cell:hover .open-arrow { color: var(--ink); }

                .empty {
                    text-align: center;
                    padding: 5rem 2rem;
                    grid-column: 1 / -1;
                }
                .empty-big {
                    font-size: clamp(36px, 5vw, 56px);
                    font-weight: 700;
                    line-height: 1;
                    letter-spacing: -.02em;
                    color: #e8e8e8;
                    margin-bottom: 1rem;
                }
                .empty-sub {
                    font-size: 13px;
                    color: #aaa;
                    font-weight: 300;
                }

                .menu-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #bbb;
                    padding: 2px;
                    line-height: 1;
                    font-size: 16px;
                    transition: color .2s;
                    display: flex;
                }
                .menu-btn:hover { color: var(--ink); }

                .rel { position: relative; }

                .dropdown {
                    position: absolute;
                    top: 1.8rem;
                    right: 0;
                    background: #fff;
                    border: 1.5px solid var(--ink);
                    border-radius: 12px;
                    overflow: hidden;
                    z-index: 10;
                    min-width: 130px;
                }

                .dd-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 14px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    color: var(--ink);
                    font-family: 'Poppins', sans-serif;
                    background: none;
                    border: none;
                    width: 100%;
                    text-align: left;
                }
                .dd-item:hover { background: #f5f5f5; }

                .dd-del { color: #E53935; }
                .dd-del:hover { background: #fff5f5; }
                
                .loader-container {
                    grid-column: 1 / -1;
                    display: flex;
                    justify-content: center;
                    padding: 5rem;
                }
                .loader {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #f0f0f0;
                    border-bottom-color: var(--ink);
                    border-radius: 50%;
                    display: inline-block;
                    box-sizing: border-box;
                    animation: rotation 1s linear infinite;
                }
                @keyframes rotation {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

            <div className="topbar">
                <button className="btn-back" onClick={() => showPage('home')}>
                    <ArrowLeft size={14} /> Home
                </button>
                <button className="btn-genesis" onClick={() => setIsGenesisOpen(true)}>
                    <Plus size={14} /> New bubble
                </button>
            </div>



            <div className="search-bar">
                <div className="search-wrap">
                    <Search className="search-ico" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search bubbles…" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button 
                    className={`filter-pill ${activeFilter === 'all' ? 'on' : ''}`} 
                    onClick={() => setActiveFilter('all')}
                >All</button>
                <button 
                    className={`filter-pill ${activeFilter === 'ready' ? 'on' : ''}`} 
                    onClick={() => setActiveFilter('ready')}
                >Ready</button>
                <button 
                    className={`filter-pill ${activeFilter === 'processing' ? 'on' : ''}`} 
                    onClick={() => setActiveFilter('processing')}
                >Processing</button>
            </div>

            <div className="rule"></div>
            
            <div className="bubble-grid">
                {isLoading ? (
                    <div className="loader-container">
                        <div className="loader" />
                    </div>
                ) : filteredBubbles.length === 0 ? (
                    <div className="empty">
                        <div className="empty-big">Nothing<br/>here.</div>
                        <p className="empty-sub">Try a different search or create a new bubble.</p>
                    </div>
                ) : (
                    filteredBubbles.map((bubble, i) => (
                        <div 
                            key={bubble.id} 
                            className="bubble-cell" 
                            onClick={() => bubble.status === 'completed' && setSelectedBubble(bubble)}
                        >
                            <div className="cell-top">
                                <span className="cell-num">{String(i + 1).padStart(2, '0')}</span>
                                <div className="rel">
                                    <button 
                                        className="menu-btn" 
                                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === bubble.id ? null : bubble.id); }}
                                        aria-label="Options"
                                    >
                                        &#8942;
                                    </button>
                                    
                                    {openMenuId === bubble.id && (
                                        <div className="dropdown" onClick={e => e.stopPropagation()}>
                                            {bubble.status === 'completed' && (
                                                <button className="dd-item" onClick={() => setSelectedBubble(bubble)}>
                                                    <ExternalLink size={14} /> Open
                                                </button>
                                            )}
                                            <button className="dd-item dd-del" onClick={(e) => deleteBubble(bubble.id, e)}>
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                                <span className={`status-pip ${pipClass(bubble.status)}`} style={{ marginTop: '5px', flexShrink: 0 }}></span>
                                <p className="cell-title">{bubble.title}</p>
                            </div>
                            
                            <p className="cell-desc">{bubble.summary || bubble.concept}</p>
                            
                            <div className="cell-footer">
                                <span className={`cell-status ${stClass(bubble.status)}`}>{stLabel(bubble.status)}</span>
                                {bubble.cards ? (
                                    <span className="cell-cards">{bubble.cards} cards</span>
                                ) : (
                                    <span className="open-arrow">&#8599;</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <BubbleGenesisModal 
                isOpen={isGenesisOpen} 
                onClose={() => setIsGenesisOpen(false)} 
                onGenesis={handleGenesis} 
            />
        </div>
    );
};

export default StudyBubblesPage;
