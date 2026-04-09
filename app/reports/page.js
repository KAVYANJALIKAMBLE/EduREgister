'use client';
import { useState, useEffect } from 'react';

export default function ReportsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('class');

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then(d => { setStudents(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  // Class-wise summary
  const classSummary = {};
  students.forEach(s => {
    const c = s.class_name || 'Unassigned';
    if (!classSummary[c]) classSummary[c] = { total: 0, boys: 0, girls: 0 };
    classSummary[c].total++;
    if (s.gender === 'male') classSummary[c].boys++;
    else if (s.gender === 'female') classSummary[c].girls++;
  });

  // Category-wise summary
  const catSummary = {};
  students.forEach(s => {
    const cat = s.category || 'Not Specified';
    if (!catSummary[cat]) catSummary[cat] = 0;
    catSummary[cat]++;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>अहवाल (Reports)</h2>
          <p>शाळेचे अहवाल पहा व डाउनलोड करा (View and download school reports)</p>
        </div>
      </div>

      <div className="tabs" style={{ maxWidth: 500 }}>
        <button className={`tab ${tab === 'class' ? 'active' : ''}`} onClick={() => setTab('class')}>वर्गनिहाय (Class-wise)</button>
        <button className={`tab ${tab === 'category' ? 'active' : ''}`} onClick={() => setTab('category')}>प्रवर्गनिहाय (Category-wise)</button>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <div className="empty-title">Loading...</div>
        </div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-title">अद्याप डेटा उपलब्ध नाही</div>
          <div className="empty-desc">No data available for reports yet.</div>
        </div>
      ) : (
        <>
          {tab === 'class' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">वर्गनिहाय गोषवारा (Class-wise Summary)</div>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>वर्ग (Class)</th>
                        <th>एकूण (Total)</th>
                        <th>मुले (Boys)</th>
                        <th>मुली (Girls)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(classSummary).map(([cls, data]) => (
                        <tr key={cls}>
                          <td><span className="badge badge-navy">{cls}</span></td>
                          <td><strong>{data.total}</strong></td>
                          <td>{data.boys}</td>
                          <td>{data.girls}</td>
                        </tr>
                      ))}
                      <tr style={{ fontWeight: 700, background: 'var(--saffron-pale)' }}>
                        <td>एकूण (Total)</td>
                        <td>{students.length}</td>
                        <td>{students.filter(s => s.gender === 'male').length}</td>
                        <td>{students.filter(s => s.gender === 'female').length}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === 'category' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">प्रवर्गनिहाय गोषवारा (Category-wise Summary)</div>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>प्रवर्ग (Category)</th>
                        <th>विद्यार्थी संख्या (Students)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(catSummary).map(([cat, count]) => (
                        <tr key={cat}>
                          <td><span className="badge badge-saffron">{cat}</span></td>
                          <td><strong>{count}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
