import React, { useState, useEffect } from 'react';
import { User, Shield, Bell, Palette, Link as LinkIcon, LogOut, AlertTriangle, ArrowLeft } from 'lucide-react';
import { apiCall } from '../api/api';

const SettingsPage = ({ 
  user, 
  showMessage, 
  projectGoal, 
  setProjectGoal, 
  linkWallet, 
  onLogout,
  showPage
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [formData, setFormData] = useState({
    display_name: user?.display_name || '',
    bio: user?.bio || '',
    twitter_handle: user?.twitter_handle || '',
    github_handle: user?.github_handle || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        bio: user.bio || '',
        twitter_handle: user.twitter_handle || '',
        github_handle: user.github_handle || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await apiCall('/me/', {
        method: 'PATCH',
        body: JSON.stringify(formData)
      });
      showMessage('Profile updated successfully!', 'success');
    } catch (err) {
      showMessage('Failed to update profile', 'error');
    }
  };

  const handleLinkWallet = async () => {
    try {
      await linkWallet();
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Identity', icon: <User size={18} /> },
    { id: 'account', label: 'Account & Security', icon: <Shield size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'preferences', label: 'Preferences', icon: <Palette size={18} /> },
  ];

  return (
    <div className="sv-settings">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');

        /* Hide global header so this page is standalone like premium home */
        header { display: none !important; }
        .bottom-nav { display: none !important; }

        .sv-settings {
          font-family: 'Poppins', sans-serif;
          background: #fafafa;
          color: #0d0d0d;
          min-height: 100vh;
        }

        .sv-settings * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .settings-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 999;
          display: flex; align-items: center; padding: 18px 5vw;
          background: rgba(250,250,250,.93); backdrop-filter: blur(10px);
          border-bottom: 1px solid #eaeaea;
        }

        .back-btn {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none; font-family: 'Poppins', sans-serif;
          font-size: 14px; font-weight: 500; cursor: pointer; color: #0d0d0d;
          transition: opacity 0.2s;
        }
        .back-btn:hover { opacity: 0.6; }

        .settings-container {
          display: flex;
          flex-direction: column;
          max-width: 1100px;
          margin: 0 auto;
          padding: 100px 5vw 60px;
          gap: 40px;
        }

        @media (min-width: 768px) {
          .settings-container {
            flex-direction: row;
            padding-top: 120px;
          }
        }

        .sidebar {
          flex: 0 0 250px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tab-btn {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 18px; border-radius: 12px; border: none;
          background: transparent; color: #555;
          font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all 0.2s; text-align: left;
        }

        .tab-btn:hover { background: #f0f0f0; color: #0d0d0d; }
        .tab-btn.active { background: #fff; color: #0d0d0d; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

        .content-area {
          flex: 1;
          background: #fff;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.04);
        }

        .section-title { font-size: 24px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px; }
        .section-desc { font-size: 14px; color: #666; margin-bottom: 32px; line-height: 1.6; }

        .form-group { margin-bottom: 24px; }
        .form-label { display: block; font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        
        .form-input, .form-textarea {
          width: 100%; padding: 14px 18px; border-radius: 12px;
          border: 1px solid #e0e0e0; background: #fafafa;
          font-family: 'Poppins', sans-serif; font-size: 14px; color: #0d0d0d;
          transition: all 0.2s;
        }
        .form-input:focus, .form-textarea:focus { border-color: #3B5BDB; outline: none; background: #fff; box-shadow: 0 0 0 4px rgba(59,91,219,0.1); }
        .form-textarea { resize: vertical; min-height: 100px; }

        .btn-primary {
          background: #3B5BDB; color: #fff; padding: 14px 28px; border-radius: 100px;
          border: none; font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(59,91,219,0.2); }

        .btn-secondary {
          background: #f0f0f0; color: #0d0d0d; padding: 14px 28px; border-radius: 100px;
          border: none; font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: background 0.2s;
        }
        .btn-secondary:hover { background: #e0e0e0; }

        .btn-danger {
          background: #fff0f0; color: #e03131; padding: 14px 28px; border-radius: 100px;
          border: 1px solid #ffc9c9; font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-danger:hover { background: #ffe3e3; }

        .card-row { display: flex; align-items: center; justify-content: space-between; padding: 20px; border: 1px solid #eaeaea; border-radius: 16px; margin-bottom: 16px; background: #fafafa; }
        .card-info h4 { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
        .card-info p { font-size: 13px; color: #666; }

        .toggle-switch {
          position: relative; width: 44px; height: 24px; background: #ccc; border-radius: 24px; cursor: pointer; transition: background 0.3s;
        }
        .toggle-switch.on { background: #3EC636; }
        .toggle-knob {
          position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: transform 0.3s;
        }
        .toggle-switch.on .toggle-knob { transform: translateX(20px); }

      `}</style>

      <nav className="settings-nav">
        <button className="back-btn" onClick={() => showPage('profile')}>
          <ArrowLeft size={18} /> Back to Profile
        </button>
      </nav>

      <div className="settings-container">
        <div className="sidebar">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="content-area">
          {activeTab === 'profile' && (
            <div>
              <h2 className="section-title">Profile Identity</h2>
              <p className="section-desc">Manage your public persona, bio, and mastery goals.</p>

              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label className="form-label">Mastery Trajectory (Goal)</label>
                  <textarea 
                    className="form-textarea"
                    value={projectGoal}
                    onChange={(e) => setProjectGoal(e.target.value)}
                    placeholder="e.g. Building a decentralized autonomous organization..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                    <label className="form-label">Display Name</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={formData.display_name}
                      onChange={e => setFormData({...formData, display_name: e.target.value})}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                    <label className="form-label">GitHub Handle</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={formData.github_handle}
                      onChange={e => setFormData({...formData, github_handle: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Philosophy / Bio</label>
                  <textarea 
                    className="form-textarea"
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                  />
                </div>

                <button type="submit" className="btn-primary">Save Changes</button>
              </form>
            </div>
          )}

          {activeTab === 'account' && (
            <div>
              <h2 className="section-title">Account & Security</h2>
              <p className="section-desc">Manage your connected wallets and account security.</p>

              <div className="card-row">
                <div className="card-info">
                  <h4>Connected Wallet</h4>
                  <p>
                    {user?.address 
                      ? `Connected: ${user.address.slice(0, 6)}...${user.address.slice(-4)}` 
                      : 'No wallet linked currently.'}
                  </p>
                </div>
                <button className="btn-secondary" onClick={handleLinkWallet}>
                  <LinkIcon size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  {user?.address ? 'Change Wallet' : 'Link Wallet'}
                </button>
              </div>

              <div className="card-row" style={{ borderColor: '#ffc9c9', background: '#fff0f0' }}>
                <div className="card-info">
                  <h4 style={{ color: '#e03131' }}>Danger Zone</h4>
                  <p style={{ color: '#e03131' }}>Permanently delete your account and data.</p>
                </div>
                <button className="btn-danger" onClick={() => showMessage('Account deletion is not available in this demo.', 'info')}>
                  <AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="section-title">Notifications</h2>
              <p className="section-desc">Control how Vera and Study Verse communicate with you.</p>

              <div className="card-row">
                <div className="card-info">
                  <h4>Email Alerts</h4>
                  <p>Receive updates about new courses and platform features.</p>
                </div>
                <div className="toggle-switch on" onClick={(e) => e.currentTarget.classList.toggle('on')}>
                  <div className="toggle-knob"></div>
                </div>
              </div>

              <div className="card-row">
                <div className="card-info">
                  <h4>Study Reminders</h4>
                  <p>Vera will remind you to maintain your mastery streak.</p>
                </div>
                <div className="toggle-switch on" onClick={(e) => e.currentTarget.classList.toggle('on')}>
                  <div className="toggle-knob"></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div>
              <h2 className="section-title">Preferences</h2>
              <p className="section-desc">Customize your Study Verse experience.</p>

              <div className="card-row">
                <div className="card-info">
                  <h4>Platform Theme</h4>
                  <p>Study Verse is currently optimized for its Premium Dark/Light aesthetic.</p>
                </div>
                <button className="btn-secondary" onClick={() => showMessage('Theme locked to Premium layout.', 'info')}>
                  System Default
                </button>
              </div>

              <div className="card-row">
                <div className="card-info">
                  <h4>Language</h4>
                  <p>Change your primary learning language.</p>
                </div>
                <select className="form-input" style={{ width: '150px', padding: '8px 12px' }}>
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
