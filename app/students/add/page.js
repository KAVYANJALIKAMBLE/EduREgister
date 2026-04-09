'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/Toast';

const defaultClasses = [
  '1st', '2nd', '3rd', '4th', '5th',
  '6th', '7th', '8th', '9th', '10th',
  '11th', '12th'
];

const defaultDivisions = ['A', 'B', 'C', 'D'];

export default function AddStudentPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    gr_number: '',
    admission_number: '',
    roll_number: '',
    first_name_en: '',
    middle_name_en: '',
    last_name_en: '',
    first_name_mr: '',
    middle_name_mr: '',
    last_name_mr: '',
    gender: '',
    dob: '',
    blood_group: '',
    caste: '',
    category: '',
    religion: '',
    aadhaar_number: '',
    mother_tongue: '',
    nationality: 'Indian',
    address_line1: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    class_name: '',
    division_name: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name_en.trim() || !formData.gr_number.trim()) {
      addToast('कृपया नाव आणि GR क्रमांक भरा (Name and GR number required)', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        addToast('विद्यार्थी नोंदणी यशस्वी! (Student Added!)', 'success');
        setFormData({
          gr_number: '', admission_number: '', roll_number: '',
          first_name_en: '', middle_name_en: '', last_name_en: '',
          first_name_mr: '', middle_name_mr: '', last_name_mr: '',
          gender: '', dob: '', blood_group: '', caste: '', category: '',
          religion: '', aadhaar_number: '', mother_tongue: '',
          nationality: 'Indian', address_line1: '', city: '',
          state: 'Maharashtra', pincode: '', class_name: '', division_name: '',
        });
      } else {
        const data = await res.json();
        addToast(data.error || 'Error adding student', 'error');
      }
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
    }
    setSubmitting(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>नवीन प्रवेश (New Admission)</h2>
          <p>विद्यार्थ्याची संपूर्ण माहिती भरा (Enter complete student details)</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">विद्यार्थी नोंदणी फॉर्म</div>
            <div className="card-subtitle">Student Registration Form</div>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Registration Numbers */}
            <h3 style={{ fontSize: 15, color: 'var(--navy)', marginBottom: 12 }}>📋 नोंदणी क्रमांक (Registration Numbers)</h3>
            <div className="form-grid form-grid-3" style={{ marginBottom: 24 }}>
              <div className="form-group">
                <label className="form-label">GR क्रमांक (GR Number) <span>*</span></label>
                <input type="text" className="form-control" name="gr_number" value={formData.gr_number} onChange={handleChange} placeholder="e.g. GR-001" required />
              </div>
              <div className="form-group">
                <label className="form-label">प्रवेश क्रमांक (Admission No.)</label>
                <input type="text" className="form-control" name="admission_number" value={formData.admission_number} onChange={handleChange} placeholder="e.g. ADM-2025-001" />
              </div>
              <div className="form-group">
                <label className="form-label">हजेरी क्रमांक (Roll No.)</label>
                <input type="text" className="form-control" name="roll_number" value={formData.roll_number} onChange={handleChange} placeholder="e.g. 1" />
              </div>
            </div>

            {/* English Name */}
            <h3 style={{ fontSize: 15, color: 'var(--navy)', marginBottom: 12 }}>🔤 नाव (इंग्रजी) — Name (English)</h3>
            <div className="form-grid form-grid-3" style={{ marginBottom: 24 }}>
              <div className="form-group">
                <label className="form-label">पहिले नाव (First Name) <span>*</span></label>
                <input type="text" className="form-control" name="first_name_en" value={formData.first_name_en} onChange={handleChange} placeholder="e.g. Rahul" required />
              </div>
              <div className="form-group">
                <label className="form-label">वडिलांचे नाव (Middle Name)</label>
                <input type="text" className="form-control" name="middle_name_en" value={formData.middle_name_en} onChange={handleChange} placeholder="e.g. Suresh" />
              </div>
              <div className="form-group">
                <label className="form-label">आडनाव (Last Name)</label>
                <input type="text" className="form-control" name="last_name_en" value={formData.last_name_en} onChange={handleChange} placeholder="e.g. Patil" />
              </div>
            </div>

            {/* Marathi Name */}
            <h3 style={{ fontSize: 15, color: 'var(--navy)', marginBottom: 12 }}>🔡 नाव (मराठी) — Name (Marathi)</h3>
            <div className="form-grid form-grid-3" style={{ marginBottom: 24 }}>
              <div className="form-group">
                <label className="form-label">पहिले नाव (मराठी)</label>
                <input type="text" className="form-control" name="first_name_mr" value={formData.first_name_mr} onChange={handleChange} placeholder="उदा. राहुल" />
              </div>
              <div className="form-group">
                <label className="form-label">वडिलांचे नाव (मराठी)</label>
                <input type="text" className="form-control" name="middle_name_mr" value={formData.middle_name_mr} onChange={handleChange} placeholder="उदा. सुरेश" />
              </div>
              <div className="form-group">
                <label className="form-label">आडनाव (मराठी)</label>
                <input type="text" className="form-control" name="last_name_mr" value={formData.last_name_mr} onChange={handleChange} placeholder="उदा. पाटील" />
              </div>
            </div>

            {/* Class & Division */}
            <h3 style={{ fontSize: 15, color: 'var(--navy)', marginBottom: 12 }}>🏫 वर्ग/तुकडी (Class/Division)</h3>
            <div className="form-grid form-grid-2" style={{ marginBottom: 24 }}>
              <div className="form-group">
                <label className="form-label">वर्ग (Class)</label>
                <select className="form-control" name="class_name" value={formData.class_name} onChange={handleChange}>
                  <option value="">वर्ग निवडा...</option>
                  {defaultClasses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">तुकडी (Division)</label>
                <select className="form-control" name="division_name" value={formData.division_name} onChange={handleChange}>
                  <option value="">तुकडी निवडा...</option>
                  {defaultDivisions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Personal Details */}
            <h3 style={{ fontSize: 15, color: 'var(--navy)', marginBottom: 12 }}>👤 वैयक्तिक माहिती (Personal Details)</h3>
            <div className="form-grid form-grid-3" style={{ marginBottom: 24 }}>
              <div className="form-group">
                <label className="form-label">लिंग (Gender)</label>
                <select className="form-control" name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">निवडा...</option>
                  <option value="male">मुलगा (Male)</option>
                  <option value="female">मुलगी (Female)</option>
                  <option value="other">इतर (Other)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">जन्मतारीख (Date of Birth)</label>
                <input type="date" className="form-control" name="dob" value={formData.dob} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">रक्तगट (Blood Group)</label>
                <select className="form-control" name="blood_group" value={formData.blood_group} onChange={handleChange}>
                  <option value="">निवडा...</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">जात (Caste)</label>
                <input type="text" className="form-control" name="caste" value={formData.caste} onChange={handleChange} placeholder="e.g. Maratha" />
              </div>
              <div className="form-group">
                <label className="form-label">प्रवर्ग (Category)</label>
                <select className="form-control" name="category" value={formData.category} onChange={handleChange}>
                  <option value="">निवडा...</option>
                  <option value="General">सामान्य (General)</option>
                  <option value="OBC">ओबीसी (OBC)</option>
                  <option value="SC">अनुसूचित जाती (SC)</option>
                  <option value="ST">अनुसूचित जमाती (ST)</option>
                  <option value="NT">भटक्या जाती (NT)</option>
                  <option value="SBC">विशेष मागासवर्ग (SBC)</option>
                  <option value="VJNT">विजाभज (VJNT)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">धर्म (Religion)</label>
                <input type="text" className="form-control" name="religion" value={formData.religion} onChange={handleChange} placeholder="e.g. Hindu" />
              </div>
              <div className="form-group">
                <label className="form-label">आधार क्रमांक (Aadhaar)</label>
                <input type="text" className="form-control" name="aadhaar_number" value={formData.aadhaar_number} onChange={handleChange} placeholder="e.g. 1234-5678-9012" maxLength={14} />
              </div>
              <div className="form-group">
                <label className="form-label">मातृभाषा (Mother Tongue)</label>
                <input type="text" className="form-control" name="mother_tongue" value={formData.mother_tongue} onChange={handleChange} placeholder="e.g. Marathi" />
              </div>
              <div className="form-group">
                <label className="form-label">राष्ट्रीयत्व (Nationality)</label>
                <input type="text" className="form-control" name="nationality" value={formData.nationality} onChange={handleChange} />
              </div>
            </div>

            {/* Address */}
            <h3 style={{ fontSize: 15, color: 'var(--navy)', marginBottom: 12 }}>📍 पत्ता (Address)</h3>
            <div className="form-grid form-grid-2" style={{ marginBottom: 24 }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">पत्ता (Address Line)</label>
                <input type="text" className="form-control" name="address_line1" value={formData.address_line1} onChange={handleChange} placeholder="e.g. 123 Main Road" />
              </div>
              <div className="form-group">
                <label className="form-label">शहर / गाव (City)</label>
                <input type="text" className="form-control" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Ashta" />
              </div>
              <div className="form-group">
                <label className="form-label">राज्य (State)</label>
                <input type="text" className="form-control" name="state" value={formData.state} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">पिन कोड (Pincode)</label>
                <input type="text" className="form-control" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="e.g. 416301" maxLength={6} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? '⏳ जतन करत आहे...' : '💾 जतन करा (Save)'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => router.push('/students')}>
                📋 यादी पहा (View List)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
