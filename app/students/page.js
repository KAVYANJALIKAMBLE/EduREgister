'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '../components/Toast';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const { addToast } = useToast();

  const fetchStudents = () => {
    setLoading(true);
    fetch('/api/students')
      .then(r => r.json())
      .then(data => { setStudents(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setLoading(false); addToast('Failed to load students', 'error'); });
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('या विद्यार्थ्याची नोंद हटवायची आहे का? (Delete this student?)')) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast('विद्यार्थी हटवला (Student deleted)', 'success');
        fetchStudents();
      } else {
        addToast('Delete failed', 'error');
      }
    } catch {
      addToast('Delete failed', 'error');
    }
  };

  const fullName = (s) => [s.first_name_en, s.middle_name_en, s.last_name_en].filter(Boolean).join(' ');
  const fullNameMr = (s) => [s.first_name_mr, s.middle_name_mr, s.last_name_mr].filter(Boolean).join(' ');

  const classes = [...new Set(students.map(s => s.class_name).filter(Boolean))];

  const filtered = students.filter(s => {
    const name = fullName(s).toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchClass = !filterClass || s.class_name === filterClass;
    return matchSearch && matchClass;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>विद्यार्थी नोंदवही (Student Register)</h2>
          <p>सर्व नोंदणीकृत विद्यार्थ्यांची यादी (List of all registered students)</p>
        </div>
        <Link href="/students/add" className="btn btn-primary">+ नवीन प्रवेश</Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar">
          <input
            type="text"
            placeholder="विद्यार्थी शोधा... (Search student)"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-control"
          style={{ maxWidth: 200 }}
          value={filterClass}
          onChange={e => setFilterClass(e.target.value)}
        >
          <option value="">सर्व वर्ग (All Classes)</option>
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <div className="empty-title">Loading...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <div className="empty-title">कोणतेही विद्यार्थी आढळले नाहीत</div>
          <div className="empty-desc">No students found. Try adjusting the filters or add a new student.</div>
          <Link href="/students/add" className="btn btn-primary">+ नवीन प्रवेश</Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>अ.क्र.</th>
                <th>GR No.</th>
                <th>नाव (Name)</th>
                <th>नाव (मराठी)</th>
                <th>वर्ग (Class)</th>
                <th>तुकडी (Div)</th>
                <th>लिंग (Gender)</th>
                <th>क्रिया (Actions)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td><span className="badge badge-gold">{s.gr_number}</span></td>
                  <td style={{ fontWeight: 500 }}>{fullName(s)}</td>
                  <td>{fullNameMr(s) || '-'}</td>
                  <td><span className="badge badge-navy">{s.class_name || '-'}</span></td>
                  <td><span className="badge badge-saffron">{s.division_name || '-'}</span></td>
                  <td>{s.gender === 'male' ? '👦' : s.gender === 'female' ? '👧' : '-'}</td>
                  <td>
                    <button className="btn btn-danger btn-xs" onClick={() => handleDelete(s.id)}>
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text-light)' }}>
        एकूण {filtered.length} विद्यार्थी (Total {filtered.length} students)
      </div>
    </div>
  );
}
