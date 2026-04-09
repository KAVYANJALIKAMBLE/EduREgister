'use client';
import { useState, useEffect } from 'react';

export default function AttendancePage() {
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then(d => setStudents(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const fullName = (s) => [s.first_name_en, s.middle_name_en, s.last_name_en].filter(Boolean).join(' ');

  const classes = [...new Set(students.map(s => s.class_name).filter(Boolean))];
  const filtered = selectedClass ? students.filter(s => s.class_name === selectedClass) : students;

  const toggleAttendance = (id) => {
    setAttendance(prev => ({
      ...prev,
      [id]: prev[id] === 'present' ? 'absent' : 'present'
    }));
  };

  const markAll = (status) => {
    const obj = {};
    filtered.forEach(s => { obj[s.id] = status; });
    setAttendance(obj);
  };

  const presentCount = filtered.filter(s => attendance[s.id] === 'present').length;
  const absentCount = filtered.filter(s => attendance[s.id] === 'absent').length;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>उपस्थिती (Attendance)</h2>
          <p>दैनंदिन उपस्थिती नोंदवा (Mark daily attendance)</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ maxWidth: 200 }}>
          <label className="form-label">दिनांक (Date)</label>
          <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="form-group" style={{ maxWidth: 200 }}>
          <label className="form-label">वर्ग (Class)</label>
          <select className="form-control" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            <option value="">सर्व वर्ग</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button className="btn btn-green btn-sm" onClick={() => markAll('present')}>✅ सर्व उपस्थित</button>
        <button className="btn btn-danger btn-sm" onClick={() => markAll('absent')}>❌ सर्व अनुपस्थित</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
        <div className="stat-card green">
          <div className="stat-value">{presentCount}</div>
          <div className="stat-label">उपस्थित (Present)</div>
        </div>
        <div className="stat-card saffron">
          <div className="stat-value">{absentCount}</div>
          <div className="stat-label">अनुपस्थित (Absent)</div>
        </div>
        <div className="stat-card navy">
          <div className="stat-value">{filtered.length}</div>
          <div className="stat-label">एकूण (Total)</div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">विद्यार्थी निवडा</div>
          <div className="empty-desc">Select a class to mark attendance</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>अ.क्र.</th>
                <th>GR No.</th>
                <th>नाव (Name)</th>
                <th>वर्ग / तुकडी</th>
                <th>स्थिती (Status)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td><span className="badge badge-gold">{s.gr_number}</span></td>
                  <td>{fullName(s)}</td>
                  <td>{s.class_name || '-'} {s.division_name || ''}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${attendance[s.id] === 'present' ? 'btn-green' : attendance[s.id] === 'absent' ? 'btn-danger' : 'btn-secondary'}`}
                      onClick={() => toggleAttendance(s.id)}
                      style={{ minWidth: 120 }}
                    >
                      {attendance[s.id] === 'present' ? '✅ उपस्थित' : attendance[s.id] === 'absent' ? '❌ अनुपस्थित' : '⬜ चिन्हांकित करा'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
