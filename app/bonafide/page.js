'use client';
import { useState, useEffect, useRef } from 'react';

export default function BonafidePage() {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [certType, setCertType] = useState('bonafide');
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then(d => setStudents(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const selected = students.find(s => String(s.id) === selectedId);
  const fullName = (s) => [s.first_name_en, s.middle_name_en, s.last_name_en].filter(Boolean).join(' ');
  const fullNameMr = (s) => [s.first_name_mr, s.middle_name_mr, s.last_name_mr].filter(Boolean).join(' ');

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Certificate - EduRegister</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Noto+Sans+Devanagari:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Noto Sans Devanagari', sans-serif; padding: 40px; }
        .certificate-box { border: 3px double #C8A84B; border-radius: 16px; padding: 40px; text-align: center; background: linear-gradient(135deg, #FFFEF5, #FFF8E8); position: relative; }
        .cert-heading { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 900; color: #001F5B; margin-bottom: 8px; }
        .cert-school { font-size: 14px; color: #4A4A6A; margin-bottom: 20px; }
        .cert-body { font-size: 15px; line-height: 1.9; max-width: 520px; margin: 0 auto; }
        .cert-body strong { color: #001F5B; }
        .cert-footer { margin-top: 28px; display: flex; justify-content: space-between; font-size: 13px; color: #4A4A6A; }
      </style></head><body>${content.innerHTML}</body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>बोनाफाईड / दाखला (Certificates)</h2>
          <p>विद्यार्थ्यांना दाखला व प्रमाणपत्र देणे (Issue certificates to students)</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">दाखला तयार करा (Generate Certificate)</div>
          </div>
          <div className="card-body">
            <div className="form-grid form-grid-1">
              <div className="form-group">
                <label className="form-label">विद्यार्थी निवडा (Select Student) <span>*</span></label>
                <select className="form-control" value={selectedId} onChange={e => { setSelectedId(e.target.value); setShowPreview(false); }}>
                  <option value="">-- विद्यार्थी निवडा --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {fullName(s)} — GR: {s.gr_number} — {s.class_name || '-'} {s.division_name || ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">दाखला प्रकार (Certificate Type)</label>
                <select className="form-control" value={certType} onChange={e => setCertType(e.target.value)}>
                  <option value="bonafide">बोनाफाईड दाखला (Bonafide Certificate)</option>
                  <option value="school_leaving">शाळा सोडल्याचा दाखला (School Leaving)</option>
                  <option value="character">चारित्र्य दाखला (Character Certificate)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-primary" onClick={() => selected && setShowPreview(true)} disabled={!selectedId}>
                  📜 Preview Certificate
                </button>
                {showPreview && (
                  <button className="btn btn-green" onClick={handlePrint}>🖨️ Print</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {showPreview && selected && (
          <div ref={printRef}>
            <div className="certificate-box">
              <div className="cert-heading">
                {certType === 'bonafide' ? 'बोनाफाईड प्रमाणपत्र' : certType === 'school_leaving' ? 'शाळा सोडल्याचा दाखला' : 'चारित्र्य प्रमाणपत्र'}
              </div>
              <div className="cert-school">ADCET, Ashta · शालेय व्यवस्थापन प्रणाली</div>
              <div className="cert-body">
                हे प्रमाणित करण्यात येते की, <strong>{fullNameMr(selected) || fullName(selected)}</strong> (GR No. <strong>{selected.gr_number}</strong>) हा/ही विद्यार्थी/विद्यार्थिनी
                या शाळेत वर्ग <strong>{selected.class_name || '-'}</strong>, तुकडी <strong>{selected.division_name || '-'}</strong> मध्ये
                शिक्षण घेत आहे/होता/होती.
                <br /><br />
                This is to certify that <strong>{fullName(selected)}</strong> (GR No. <strong>{selected.gr_number}</strong>) is/was a bonafide student of this school
                studying in class <strong>{selected.class_name || '-'}</strong>, division <strong>{selected.division_name || '-'}</strong>.
              </div>
              <div className="cert-footer">
                <div>
                  <div>दिनांक / Date</div>
                  <div><strong>{new Date().toLocaleDateString('en-IN')}</strong></div>
                </div>
                <div>
                  <div>मुख्याध्यापक / Principal</div>
                  <div><strong>___________________</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
