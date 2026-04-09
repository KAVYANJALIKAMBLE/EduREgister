'use client';
import { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useToast } from '../components/Toast';

export default function SettingsPage() {
  const { username, changePassword, changeUsername } = useAuth();
  const { addToast } = useToast();

  // School info
  const [schoolName, setSchoolName] = useState('ADCET, Ashta');
  const [schoolCode, setSchoolCode] = useState('');
  const [udiseCode, setUdiseCode] = useState('');
  const [address, setAddress] = useState('Ashta, Maharashtra');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Password change
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  // Username change
  const [unPw, setUnPw] = useState('');
  const [newUn, setNewUn] = useState('');

  const handleChangePw = async () => {
    if (newPw !== confirmPw) { addToast('Passwords do not match', 'error'); return; }
    try {
      await changePassword(currentPw, newPw);
      addToast('पासवर्ड बदलला! (Password changed!)', 'success');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (e) { addToast(e.message, 'error'); }
  };

  const handleChangeUn = async () => {
    try {
      await changeUsername(unPw, newUn);
      addToast('Username बदलले! (Username changed!)', 'success');
      setUnPw(''); setNewUn('');
    } catch (e) { addToast(e.message, 'error'); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>सेटिंग्ज (Settings)</h2>
          <p>शाळा माहिती व खाते व्यवस्थापन (School info and account management)</p>
        </div>
      </div>

      <div className="grid-2">
        {/* School Profile */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏫 शाळा माहिती (School Profile)</div>
          </div>
          <div className="card-body">
            <div className="form-grid form-grid-1">
              <div className="form-group">
                <label className="form-label">शाळेचे नाव (School Name)</label>
                <input type="text" className="form-control" value={schoolName} onChange={e => setSchoolName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">शाळा कोड (School Code)</label>
                <input type="text" className="form-control" value={schoolCode} onChange={e => setSchoolCode(e.target.value)} placeholder="e.g. MH-2024-001" />
              </div>
              <div className="form-group">
                <label className="form-label">UDISE कोड</label>
                <input type="text" className="form-control" value={udiseCode} onChange={e => setUdiseCode(e.target.value)} placeholder="e.g. 27120100101" />
              </div>
              <div className="form-group">
                <label className="form-label">पत्ता (Address)</label>
                <input type="text" className="form-control" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">फोन (Phone)</label>
                <input type="text" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 02342-123456" />
              </div>
              <div className="form-group">
                <label className="form-label">ईमेल (Email)</label>
                <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. school@example.com" />
              </div>
              <button className="btn btn-primary" onClick={() => addToast('School info saved!', 'success')}>💾 जतन करा (Save)</button>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <div className="card-title">🔑 पासवर्ड बदला (Change Password)</div>
            </div>
            <div className="card-body">
              <div className="form-grid form-grid-1">
                <div className="form-group">
                  <label className="form-label">सध्याचा पासवर्ड (Current Password)</label>
                  <input type="password" className="form-control" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">नवीन पासवर्ड (New Password)</label>
                  <input type="password" className="form-control" value={newPw} onChange={e => setNewPw(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">पुष्टी करा (Confirm)</label>
                  <input type="password" className="form-control" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={handleChangePw}>✅ पासवर्ड बदला</button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">👤 Username बदला (Change Username)</div>
            </div>
            <div className="card-body">
              <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 12 }}>
                सध्याचे: <strong style={{ color: 'var(--navy)' }}>{username}</strong>
              </p>
              <div className="form-grid form-grid-1">
                <div className="form-group">
                  <label className="form-label">पासवर्ड (Password)</label>
                  <input type="password" className="form-control" value={unPw} onChange={e => setUnPw(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">नवीन Username</label>
                  <input type="text" className="form-control" value={newUn} onChange={e => setNewUn(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={handleChangeUn}>✅ Username बदला</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
