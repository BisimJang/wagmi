import React, { useState, useEffect } from 'react';
import { Alchemy, Network } from 'alchemy-sdk';
import { X, Loader2, Image as ImageIcon } from 'lucide-react';
import BrutalistButton from '../UI/BrutalistButton';

const NftAvatarSelector = ({ address, onSelect, onClose }) => {
    const [nfts, setNfts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNfts = async () => {
            if (!address) {
                setError("Wallet address not linked.");
                setLoading(false);
                return;
            }

            try {
                const config = {
                    apiKey: import.meta.env.VITE_ALCHEMY_API_KEY || "demo",
                    network: Network.ETH_SEPOLIA,
                };
                const alchemy = new Alchemy(config);
                
                const response = await alchemy.nft.getNftsForOwner(address);
                setNfts(response.ownedNfts || []);
            } catch (err) {
                console.error("Alchemy NFT Fetch Error:", err);
                setError("Failed to fetch NFTs from your wallet.");
            } finally {
                setLoading(false);
            }
        };

        fetchNfts();
    }, [address]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            backdropFilter: 'blur(10px)'
        }} onClick={onClose}>
            <div style={{
                background: '#fff',
                border: '8px solid #000',
                boxShadow: '15px 15px 0px #39ff14',
                padding: '2rem',
                maxWidth: '800px',
                width: '90%',
                maxHeight: '80vh',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }} onClick={e => e.stopPropagation()}>
                
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <X size={32} />
                </button>

                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2.5rem', textTransform: 'uppercase', margin: 0, letterSpacing: '-1px' }}>
                        Your Backpack
                    </h2>
                    <p style={{ fontWeight: '600', color: '#666' }}>
                        Select a verified on-chain asset to represent your identity.
                    </p>
                </div>

                <div style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    padding: '0.5rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {loading ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
                            <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto' }} />
                            <p style={{ marginTop: '1rem', fontWeight: '900', textTransform: 'uppercase' }}>Scanning Ledger...</p>
                        </div>
                    ) : error ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: '#fff1f1', border: '4px solid #000' }}>
                            <p style={{ fontWeight: '900', color: 'red' }}>{error}</p>
                            <BrutalistButton onClick={onClose} style={{ marginTop: '1rem' }}>Close</BrutalistButton>
                        </div>
                    ) : nfts.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
                            <ImageIcon size={48} style={{ margin: '0 auto', opacity: 0.3 }} />
                            <p style={{ marginTop: '1rem', fontWeight: '900' }}>NO NFTS DETECTED IN THIS WALLET</p>
                            <p style={{ fontSize: '0.8rem', color: '#888' }}>{address}</p>
                        </div>
                    ) : (
                        nfts.map((nft, idx) => {
                            const imageUrl = nft.raw.metadata?.image || nft.raw.tokenUri || "https://placeholder.com/150";
                            return (
                                <div 
                                    key={`${nft.contract.address}-${nft.tokenId}-${idx}`}
                                    onClick={() => onSelect(imageUrl)}
                                    style={{
                                        border: '4px solid #000',
                                        cursor: 'pointer',
                                        background: '#000',
                                        aspectRatio: '1/1',
                                        position: 'relative',
                                        transition: 'transform 0.2s',
                                        overflow: 'hidden'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <img 
                                        src={imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')} 
                                        alt={nft.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=NFT" }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        background: 'rgba(255,255,255,0.9)',
                                        padding: '0.2rem 0.5rem',
                                        fontSize: '0.7rem',
                                        fontWeight: '900',
                                        textTransform: 'uppercase',
                                        borderTop: '2px solid #000',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {nft.title || `#${nft.tokenId.slice(0, 5)}`}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
            
            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default NftAvatarSelector;
