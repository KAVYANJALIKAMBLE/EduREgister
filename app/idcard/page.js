'use client';
import { useState, useEffect, useRef } from 'react';

export default function IDCardPage() {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const printRef = useRef();

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then(d => setStudents(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const selected = students.find(s => String(s.id) === selectedId);
  const fullName = (s) => [s.first_name_en, s.middle_name_en, s.last_name_en].filter(Boolean).join(' ');

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>ID Card - EduRegister</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Noto+Sans+Devanagari:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'DM Sans', sans-serif; display: flex; gap: 24px; padding: 40px; justify-content: center; }
        .id-card { width: 300px; background: linear-gradient(135deg, #001F5B, #0A3580); border-radius: 16px; padding: 20px; color: white; position: relative; overflow: hidden; box-shadow: 0 20px 60px rgba(0,31,91,0.18); }
        .id-card-avatar { width: 64px; height: 64px; background: rgba(255,255,255,0.12); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 10px; border: 2px solid rgba(255,255,255,0.2); }
        .id-card-name { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; margin-bottom: 3px; }
        .id-card-class { font-size: 12px; opacity: 0.7; }
        .id-card-divider { height: 1px; background: rgba(255,255,255,0.15); margin: 12px 0; }
        .id-card-row { display: flex; justify-content: space-between; margin-top: 10px; font-size: 11px; opacity: 0.7; }
      </style></head><body>${content.innerHTML}</body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>ओळखपत्र (ID Card)</h2>
          <p>विद्यार्थी ओळखपत्र तयार करा व प्रिंट करा (Generate and print student ID card)</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ maxWidth: 350 }}>
          <label className="form-label">विद्यार्थी निवडा (Select Student)</label>
          <select className="form-control" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
            <option value="">-- विद्यार्थी निवडा --</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{fullName(s)} — GR: {s.gr_number} — {s.class_name || '-'}</option>
            ))}
          </select>
        </div>
        {selected && <button className="btn btn-green" onClick={handlePrint}>🖨️ Print ID Card</button>}
      </div>

      {selected && (
        <div ref={printRef} style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Front */}
          <div className="id-card">
            <div className="id-card-logo">📚</div>
            <div className="id-card-school">EduRegister · ADCET, Ashta</div>
            <div className="id-card-divider" />
            <div className="id-card-avatar">👤</div>
            <div className="id-card-name">{fullName(selected)}</div>
            <div className="id-card-class">वर्ग: {selected.class_name || '-'} | तुकडी: {selected.division_name || '-'}</div>
            <div className="id-card-row">
              <span>GR No: {selected.gr_number}</span>
              <span>2025-26</span>
            </div>
            {selected.blood_group && (
              <div className="id-card-row">
                <span>Blood Group: {selected.blood_group}</span>
              </div>
            )}
          </div>

          {/* Back */}
          <div className="id-card">
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📋 Student Information</div>
            <div className="id-card-divider" />
            <div style={{ fontSize: 12, lineHeight: 2, opacity: 0.8 }}>
              <div>🏫 School: ADCET, Ashta</div>
              {selected.dob && <div>📅 DOB: {new Date(selected.dob).toLocaleDateString('en-IN')}</div>}
              {selected.blood_group && <div>🩸 Blood: {selected.blood_group}</div>}
              {selected.city && <div>📍 City: {selected.city}, {selected.state || 'Maharashtra'}</div>}
              <div>📞 Contact: School Office</div>
              <div>📅 Valid: 2025-26</div>
            </div>
            <div className="id-card-divider" />
            <div style={{ fontSize: 10, opacity: 0.5, textAlign: 'center', marginTop: 8 }}>
              If found, please return to the school office.
            </div>
          </div>
        </div>
      )}

      {!selected && (
        <div className="empty-state">
          <div className="empty-icon">🪪</div>
          <div className="empty-title">विद्यार्थी निवडा</div>
          <div className="empty-desc">Select a student to preview their ID card</div>
        </div>
      )}
    </div>
  );
}
