'use client';
import { useState } from 'react';
import { useAuth } from './AuthProvider';

export default function AuthOverlay() {
  const { hasAccount, signup, login, changePassword, changeUsername, isLoggedIn } = useAuth();
  const [panel, setPanel] = useState(null); // null = auto, 'setup', 'login', 'changepw', 'changeun'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Setup fields
  const [setupUser, setSetupUser] = useState('');
  const [setupPass, setSetupPass] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');

  // Login fields
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Change password fields
  const [cpCurrent, setCpCurrent] = useState('');
  const [cpNew, setCpNew] = useState('');
  const [cpConfirm, setCpConfirm] = useState('');

  // Change username fields
  const [cuPass, setCuPass] = useState('');
  const [cuNew, setCuNew] = useState('');

  if (isLoggedIn && panel !== 'changepw' && panel !== 'changeun') return null;
  if (isLoggedIn && !panel) return null;

  const activePanel = panel || (hasAccount ? 'login' : 'setup');

  const getStrength = (p) => {
    let s = 0;
    if (p.length >= 4) s++;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strengthColor = (s) => ['#DC2626', '#FF6B00', '#C8A84B', '#138808'][Math.min(s, 3)];

  const handleSetup = async () => {
    setError(''); setSuccess('');
    if (setupPass !== setupConfirm) { setError('Passwords do not match'); return; }
    try {
      await signup(setupUser, setupPass);
    } catch (e) { setError(e.message); }
  };

  const handleLogin = async () => {
    setError(''); setSuccess('');
    try {
      await login(loginUser, loginPass);
    } catch (e) { setError(e.message); }
  };

  const handleChangePw = async () => {
    setError(''); setSuccess('');
    if (cpNew !== cpConfirm) { setError('Passwords do not match'); return; }
    try {
      await changePassword(cpCurrent, cpNew);
      setSuccess('Password changed successfully!');
      setTimeout(() => setPanel(null), 1500);
    } catch (e) { setError(e.message); }
  };

  const handleChangeUn = async () => {
    setError(''); setSuccess('');
    try {
      await changeUsername(cuPass, cuNew);
      setSuccess('Username changed successfully!');
      setTimeout(() => setPanel(null), 1500);
    } catch (e) { setError(e.message); }
  };

  return (
    <div id="auth-overlay">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-emblem">📚</div>
          <div className="auth-logo-text">
            <div className="auth-logo-title">EduRegister</div>
            <div className="auth-logo-sub">ऑनलाइन मराठी शालेय अभिलेख प्रणाली</div>
          </div>
        </div>

        {activePanel === 'setup' && (
          <div>
            <div className="auth-heading">प्रथम सेटअप / First Setup</div>
            <div className="auth-subheading">
              कोणताही अकाउंट आढळला नाही. कृपया Admin username आणि password तयार करा.<br />
              <span style={{ fontSize: 12, opacity: 0.8 }}>No account found. Create your admin credentials to begin.</span>
            </div>
            {error && <div className="auth-error">{error}</div>}
            <div className="auth-field">
              <label>Username / वापरकर्तानाव</label>
              <input type="text" value={setupUser} onChange={e => setSetupUser(e.target.value)} placeholder="Enter admin username" />
            </div>
            <div className="auth-field">
              <label>Password / पासवर्ड</label>
              <input type="password" value={setupPass} onChange={e => setSetupPass(e.target.value)} placeholder="Create a strong password" />
              <div className="auth-strength-bar">
                <div className="auth-strength-fill" style={{ width: `${getStrength(setupPass) * 25}%`, background: strengthColor(getStrength(setupPass)) }} />
              </div>
            </div>
            <div className="auth-field">
              <label>Confirm Password / पुष्टी करा</label>
              <input type="password" value={setupConfirm} onChange={e => setSetupConfirm(e.target.value)} placeholder="Re-enter password" />
            </div>
            <button className="auth-btn" onClick={handleSetup}>🔐 Create Account / अकाउंट तयार करा</button>
          </div>
        )}

        {activePanel === 'login' && (
          <div>
            <div className="auth-heading">लॉगिन करा / Sign In</div>
            <div className="auth-subheading">
              EduRegister मध्ये प्रवेश करण्यासाठी लॉगिन करा.<br />
              <span style={{ fontSize: 12, opacity: 0.8 }}>Sign in with your username and password to continue.</span>
            </div>
            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}
            <div className="auth-field">
              <label>Username / वापरकर्तानाव</label>
              <input type="text" value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="Enter username" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <div className="auth-field">
              <label>Password / पासवर्ड</label>
              <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Enter password" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <button className="auth-btn" onClick={handleLogin}>🔓 लॉगिन करा / Sign In</button>
          </div>
        )}

        {activePanel === 'changepw' && (
          <div>
            <div className="auth-heading">पासवर्ड बदला / Change Password</div>
            <div className="auth-subheading">
              तुमचा जुना पासवर्ड द्या आणि नवीन पासवर्ड तयार करा.<br />
              <span style={{ fontSize: 12, opacity: 0.8 }}>Enter your current password then set a new one.</span>
            </div>
            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}
            <div className="auth-field">
              <label>Current Password / सध्याचा पासवर्ड</label>
              <input type="password" value={cpCurrent} onChange={e => setCpCurrent(e.target.value)} placeholder="Enter current password" />
            </div>
            <div className="auth-field">
              <label>New Password / नवीन पासवर्ड</label>
              <input type="password" value={cpNew} onChange={e => setCpNew(e.target.value)} placeholder="Enter new password" />
              <div className="auth-strength-bar">
                <div className="auth-strength-fill" style={{ width: `${getStrength(cpNew) * 25}%`, background: strengthColor(getStrength(cpNew)) }} />
              </div>
            </div>
            <div className="auth-field">
              <label>Confirm New Password / पुष्टी करा</label>
              <input type="password" value={cpConfirm} onChange={e => setCpConfirm(e.target.value)} placeholder="Re-enter new password" />
            </div>
            <button className="auth-btn" onClick={handleChangePw}>✅ पासवर्ड बदला / Update Password</button>
            <button className="auth-btn-secondary" onClick={() => setPanel(null)}>← परत / Cancel</button>
          </div>
        )}

        {activePanel === 'changeun' && (
          <div>
            <div className="auth-heading">Username बदला / Change Username</div>
            <div className="auth-subheading">
              सध्याचा पासवर्ड द्या आणि नवीन username निवडा.<br />
              <span style={{ fontSize: 12, opacity: 0.8 }}>Confirm password and enter a new username.</span>
            </div>
            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}
            <div className="auth-field">
              <label>Current Password / सध्याचा पासवर्ड</label>
              <input type="password" value={cuPass} onChange={e => setCuPass(e.target.value)} placeholder="Enter current password" />
            </div>
            <div className="auth-field">
              <label>New Username / नवीन वापरकर्तानाव</label>
              <input type="text" value={cuNew} onChange={e => setCuNew(e.target.value)} placeholder="Enter new username" />
            </div>
            <button className="auth-btn" onClick={handleChangeUn}>✅ Username बदला / Update Username</button>
            <button className="auth-btn-secondary" onClick={() => setPanel(null)}>← परत / Cancel</button>
          </div>
        )}

        <div className="auth-footer">EduRegister v2 · ADCET, Ashta · सुरक्षित प्रवेश प्रणाली</div>
      </div>
    </div>
  );
}

// Export setPanel hook for external use
export { AuthOverlay };
