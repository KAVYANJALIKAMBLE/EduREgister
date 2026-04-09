'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/students')
      .then(r => r.json())
      .then(data => { setStudents(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalStudents = students.length;
  const totalBoys = students.filter(s => s.gender === 'male').length;
  const totalGirls = students.filter(s => s.gender === 'female').length;
  const classes = [...new Set(students.map(s => s.class_name).filter(Boolean))].length;

  const fullName = (s) => [s.first_name_en, s.middle_name_en, s.last_name_en].filter(Boolean).join(' ');

  return (
    <div>
      {/* Hero */}
      <div className="dashboard-hero">
        <div className="hero-greeting">🙏 नमस्कार! स्वागत आहे</div>
        <div className="hero-title">EduRegister Dashboard</div>
        <div className="hero-sub">शाळेच्या विद्यार्थी संख्येचा व माहितीचा थोडक्यात गोषवारा</div>
        <div className="hero-flags">🇮🇳 📚</div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card saffron">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{loading ? '...' : totalStudents}</div>
          <div className="stat-label">एकूण विद्यार्थी (Total Students)</div>
        </div>
        <div className="stat-card navy">
          <div className="stat-icon">👨</div>
          <div className="stat-value">{loading ? '...' : totalBoys}</div>
          <div className="stat-label">एकूण मुले (Total Boys)</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">👩</div>
          <div className="stat-value">{loading ? '...' : totalGirls}</div>
          <div className="stat-label">एकूण मुली (Total Girls)</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-icon">🏫</div>
          <div className="stat-value">{loading ? '...' : classes}</div>
          <div className="stat-label">एकूण वर्ग (Total Classes)</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link href="/students/add" className="quick-action" style={{ textDecoration: 'none' }}>
          <div className="qa-icon">➕</div>
          <div className="qa-label">नवीन प्रवेश<br />New Admission</div>
        </Link>
        <Link href="/students" className="quick-action" style={{ textDecoration: 'none' }}>
          <div className="qa-icon">📋</div>
          <div className="qa-label">विद्यार्थी यादी<br />Student List</div>
        </Link>
        <Link href="/bonafide" className="quick-action" style={{ textDecoration: 'none' }}>
          <div className="qa-icon">📜</div>
          <div className="qa-label">दाखला तयार करा<br />Generate Certificate</div>
        </Link>
        <Link href="/reports" className="quick-action" style={{ textDecoration: 'none' }}>
          <div className="qa-icon">📊</div>
          <div className="qa-label">अहवाल पहा<br />View Reports</div>
        </Link>
      </div>

      {/* Recent Students Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">अलीकडील नोंदणी (Recent Admissions)</div>
            <div className="card-subtitle">शेवटचे 10 प्रवेश</div>
          </div>
          <Link href="/students" className="btn btn-secondary btn-sm">सर्व पहा →</Link>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="empty-state">
              <div className="empty-icon">⏳</div>
              <div className="empty-title">Loading...</div>
            </div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <div className="empty-title">अद्याप कोणतीही नोंदणी नाही</div>
              <div className="empty-desc">No students registered yet. Add a student to get started.</div>
              <Link href="/students/add" className="btn btn-primary">+ नवीन प्रवेश</Link>
            </div>
          ) : (
            <div className="table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>GR No.</th>
                    <th>नाव (Name)</th>
                    <th>वर्ग (Class)</th>
                    <th>तुकडी (Division)</th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice(0, 10).map((s, i) => (
                    <tr key={s.id}>
                      <td>{i + 1}</td>
                      <td><span className="badge badge-gold">{s.gr_number}</span></td>
                      <td>{fullName(s)}</td>
                      <td><span className="badge badge-navy">{s.class_name || '-'}</span></td>
                      <td><span className="badge badge-saffron">{s.division_name || '-'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
