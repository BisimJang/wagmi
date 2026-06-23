import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ArrowRight, Shield, Eye, EyeOff, Building2 } from 'lucide-react';

const LoginPage = ({
  onGoogleSuccess,
  onGoogleError,
  loginWithWallet,
  loginWithEmail,
  registerUser,
  registerInstitution,
  isAuthorized,
  showPage,
  defaultTab = 'login', // 'login' | 'signup' | 'institution'
}) => {
  const [mode, setMode] = useState(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  // Institution fields
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('');
  const [orgSize, setOrgSize] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [instSent, setInstSent] = useState(false);

  const switchMode = (m) => { setMode(m); setError(''); };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    let result;
    if (mode === 'signup') {
      result = await registerUser(email, password, displayName);
    } else {
      result = await loginWithEmail(email, password);
    }
    setLoading(false);
    if (!result.success) setError(result.error || 'Authentication failed. Please check your credentials.');
    else showPage('home');
  };

  const handleInstitutionSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await registerInstitution({
      email,
      org_name: orgName,
      org_type: orgType,
      org_size: orgSize,
      website: orgWebsite
    });
    setLoading(false);
    if (result.success) {
      setInstSent(true);
      setTimeout(() => showPage('home'), 3000);
    } else {
      setError(result.error || 'Failed to register institution. Please check your details.');
    }
  };

  const handleGoogleSuccess = async (response) => {
    setError('');
    setLoading(true);
    const result = await onGoogleSuccess(response);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Google authentication failed. Please try again.');
    } else {
      showPage('home');
    }
  };

  const handleGoogleFail = () => {
    setError('Google login could not be initialized. Please check your connection.');
    if (onGoogleError) onGoogleError();
  };

  return (
    <div className="lp-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        header { display: none !important; }
        .bottom-nav { display: none !important; }

        .lp-root {
          font-family: 'Poppins', sans-serif;
          background: #fff;
          color: #0d0d0d;
          min-height: 100vh;
        }
        .lp-root * { box-sizing: border-box; margin: 0; padding: 0; }

        /* NAV */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 999;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 22vw;
          background: rgba(255,255,255,.93); backdrop-filter: blur(10px);
        }
        .lp-nav-logo { font-size: 14px; font-weight: 700; cursor: pointer; letter-spacing: -.01em; color: #0d0d0d; }
        .lp-nav-back { font-size: 13px; font-weight: 500; color: #0d0d0d; background: none; border: none; cursor: pointer; font-family: 'Poppins', sans-serif; transition: opacity .2s; }
        .lp-nav-back:hover { opacity: .45; }
        @media (max-width: 1024px) { .lp-nav { padding: 18px 12vw; } }
        @media (max-width: 768px)  { .lp-nav { padding: 16px 6vw; } }

        /* PAGE */
        .lp-body {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 120px 22vw 80px;
        }
        @media (max-width: 1024px) { .lp-body { padding: 100px 12vw 60px; } }
        @media (max-width: 768px)  { .lp-body { padding: 90px 6vw 50px; } }

        .lp-card { width: 100%; max-width: 440px; }

        .lp-heading {
          font-size: clamp(26px, 2.8vw, 40px); font-weight: 700;
          line-height: 1.05; letter-spacing: -.02em; margin-bottom: 7px;
        }
        .lp-subheading { font-size: 13px; font-weight: 300; color: #555; line-height: 1.6; margin-bottom: 28px; }

        /* TABS */
        .lp-tabs { display: flex; border-bottom: 1.5px solid #e8e8e8; margin-bottom: 22px; gap: 24px; }
        .lp-tab {
          font-size: 12px; font-weight: 600; color: #aaa;
          background: none; border: none; font-family: 'Poppins', sans-serif;
          padding-bottom: 10px; cursor: pointer; position: relative; transition: color .2s;
          display: flex; align-items: center; gap: 5px;
        }
        .lp-tab.active { color: #0d0d0d; }
        .lp-tab.active::after {
          content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
          height: 2px; background: #0d0d0d; border-radius: 2px;
        }
        .lp-tab.inst-tab.active::after { background: #3B5BDB; }
        .lp-tab.inst-tab.active { color: #3B5BDB; }

        /* FIELDS */
        .lp-field { margin-bottom: 11px; }
        .lp-field label { display: block; font-size: 10px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: #999; margin-bottom: 4px; }
        .lp-field-wrap { position: relative; }
        .lp-field input, .lp-field select {
          width: 100%; padding: 10px 13px;
          border: 1.5px solid #e8e8e8; border-radius: 8px;
          font-size: 13px; font-family: 'Poppins', sans-serif;
          color: #0d0d0d; background: #fafafa; outline: none;
          transition: border-color .2s; appearance: none;
        }
        .lp-field input:focus, .lp-field select:focus { border-color: #0d0d0d; background: #fff; }
        .lp-field select { cursor: pointer; }
        .lp-eye {
          position: absolute; right: 11px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #aaa;
          display: flex; align-items: center; padding: 0;
        }
        .lp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        /* ERROR */
        .lp-error { font-size: 12px; color: #c0392b; margin-bottom: 11px; padding: 7px 11px; background: #fff5f5; border: 1px solid #fcc; border-radius: 6px; }

        /* CTA */
        .lp-submit {
          width: 100%; padding: 10px 24px;
          background: #3EC636; color: #fff;
          border: none; border-radius: 100px;
          font-size: 13px; font-weight: 500; font-family: 'Poppins', sans-serif;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: transform .2s; margin-bottom: 16px; margin-top: 14px;
        }
        .lp-submit:hover { transform: scale(1.03); }
        .lp-submit:disabled { opacity: .5; cursor: wait; transform: none; }
        .lp-submit.inst { background: #3B5BDB; }

        /* DIVIDER */
        .lp-divider { display: flex; align-items: center; gap: 10px; font-size: 11px; color: #ccc; margin-bottom: 12px; }
        .lp-divider::before, .lp-divider::after { content: ''; flex: 1; height: 1px; background: #eee; }

        .lp-google-wrap { margin-bottom: 9px; display: flex; justify-content: center; }

        .lp-wallet-btn {
          width: 100%; padding: 9px 20px;
          border: 1.5px solid #0d0d0d; border-radius: 100px;
          background: transparent; color: #0d0d0d;
          font-size: 12px; font-weight: 500; font-family: 'Poppins', sans-serif;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: background .2s, color .2s; margin-bottom: 9px;
        }
        .lp-wallet-btn:hover { background: #0d0d0d; color: #fff; }

        .lp-footnote { font-size: 11px; color: #ccc; text-align: center; margin-top: 16px; line-height: 1.5; }

        /* INSTITUTION SUCCESS */
        .lp-success {
          text-align: center; padding: 32px 0;
        }
        .lp-success-icon {
          width: 52px; height: 52px; border-radius: 50%;
          background: #f0fdf4; border: 1.5px solid #bbf7d0;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px; font-size: 22px;
        }
        .lp-success h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .lp-success p { font-size: 13px; color: #666; line-height: 1.6; }

        /* INST BADGE */
        .lp-inst-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(59,91,219,.06); border: 1px solid rgba(59,91,219,.15);
          color: #3B5BDB; border-radius: 100px;
          padding: 3px 10px; font-size: 10px; font-weight: 600; letter-spacing: .04em;
          text-transform: uppercase; margin-bottom: 10px;
        }
      `}</style>

      {/* NAV */}
      <nav className="lp-nav">
        <span className="lp-nav-logo" onClick={() => showPage('home')}>Study Verse</span>
        <button className="lp-nav-back" onClick={() => showPage('home')}>
          ← <span style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>ack to home</span>
        </button>
      </nav>

      <div className="lp-body">
        <div className="lp-card">

          <h1 className="lp-heading">
            {mode === 'institution' ? <>Register<br />Institution.</> : mode === 'signup' ? <>Create<br />account.</> : <>Welcome<br />back.</>}
          </h1>
          <p className="lp-subheading">
            {mode === 'institution'
              ? 'Deploy the Studyverse framework at your organisation.'
              : mode === 'signup'
              ? 'Join thousands of learners on Study Verse.'
              : 'Sign in to continue your learning journey.'}
          </p>

          {/* TABS */}
          <div className="lp-tabs">
            <button className={`lp-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>Sign In</button>
            <button className={`lp-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => switchMode('signup')}>Sign Up</button>
            <button className={`lp-tab inst-tab ${mode === 'institution' ? 'active' : ''}`} onClick={() => switchMode('institution')}>
              <Building2 size={12} /> Institution
            </button>
          </div>

          {/* ── INSTITUTION FLOW ── */}
          {mode === 'institution' && (
            instSent ? (
              <div className="lp-success">
                <div className="lp-success-icon">✓</div>
                <h3>Request received!</h3>
                <p>Our team will reach out within 24 hours to set up your institution node, private courses, and student provisioning.</p>
              </div>
            ) : (
              <form onSubmit={handleInstitutionSubmit}>
                <div className="lp-inst-badge"><Building2 size={10} /> Organisation Details</div>
                <div className="lp-field">
                  <label>Organisation Name</label>
                  <input type="text" placeholder="University / School / Company" value={orgName} onChange={e => setOrgName(e.target.value)} required />
                </div>
                <div className="lp-row">
                  <div className="lp-field">
                    <label>Type</label>
                    <select value={orgType} onChange={e => setOrgType(e.target.value)} required>
                      <option value="">Select…</option>
                      <option>University</option>
                      <option>School</option>
                      <option>Bootcamp</option>
                      <option>Corporate</option>
                      <option>NGO</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="lp-field">
                    <label>Size</label>
                    <select value={orgSize} onChange={e => setOrgSize(e.target.value)} required>
                      <option value="">Select…</option>
                      <option>1–50</option>
                      <option>51–500</option>
                      <option>500–5000</option>
                      <option>5000+</option>
                    </select>
                  </div>
                </div>
                <div className="lp-field">
                  <label>Contact Email</label>
                  <input type="email" placeholder="admin@institution.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="lp-field">
                  <label>Website (optional)</label>
                  <input type="url" placeholder="https://yourschool.com" value={orgWebsite} onChange={e => setOrgWebsite(e.target.value)} />
                </div>
                <button type="submit" className="lp-submit inst" disabled={loading}>
                  {loading ? 'Processing...' : <>Request Institution Access <ArrowRight size={14} /></>}
                </button>
                {error && <div className="lp-error" style={{ marginTop: '10px' }}>{error}</div>}
                <p className="lp-footnote">Our team will contact you to complete onboarding and provision your node.</p>
              </form>
            )
          )}

          {/* ── REGULAR LOGIN / SIGNUP ── */}
          {mode !== 'institution' && (
            <>
              <form onSubmit={handleEmailSubmit}>
                {mode === 'signup' && (
                  <div className="lp-field">
                    <label>Name</label>
                    <input type="text" placeholder="Your name" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
                  </div>
                )}
                <div className="lp-field">
                  <label>Email</label>
                  <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="lp-field">
                  <label>Password</label>
                  <div className="lp-field-wrap">
                    <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: 38 }} />
                    <button type="button" className="lp-eye" onClick={() => setShowPass(v => !v)}>
                      {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
                {mode === 'signup' && (
                  <div className="lp-field">
                    <label>Confirm Password</label>
                    <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  </div>
                )}
                {error && <div className="lp-error">{error}</div>}
                <button type="submit" className="lp-submit" disabled={loading}>
                  {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
                  {!loading && <ArrowRight size={13} />}
                </button>
              </form>

              <div className="lp-divider">or continue with</div>

              <div className="lp-google-wrap">
                <GoogleLogin 
                  onSuccess={handleGoogleSuccess} 
                  onError={handleGoogleFail} 
                  useOneTap={false} 
                  theme="outline" 
                  shape="pill" 
                  width="360" 
                  text={mode === 'signup' ? 'signup_with' : 'signin_with'} 
                />
              </div>

              <ConnectButton.Custom>
                {({ account, chain, openConnectModal, authenticationStatus, mounted }) => {
                  const ready = mounted && authenticationStatus !== 'loading';
                  const connected = ready && account && chain;
                  return (
                    <button className="lp-wallet-btn" onClick={() => {
                      if (!connected) { if (openConnectModal) openConnectModal(); }
                      else if (!isAuthorized) loginWithWallet();
                    }}>
                      <Shield size={13} />
                      {isAuthorized ? 'Wallet Connected ✓' : connected ? 'Sign with Wallet' : 'Connect Wallet'}
                    </button>
                  );
                }}
              </ConnectButton.Custom>

              <p className="lp-footnote">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
