'use client';
import { useState } from 'react';

const mealData = [
  { icon: '🍚', name: 'भात (Rice)', nameEn: 'Rice', qty: '25 kg' },
  { icon: '🫘', name: 'डाळ (Dal)', nameEn: 'Dal', qty: '8 kg' },
  { icon: '🥗', name: 'भाजी (Vegetables)', nameEn: 'Vegetables', qty: '15 kg' },
  { icon: '🫓', name: 'चपाती (Chapati)', nameEn: 'Chapati', qty: '200 pcs' },
  { icon: '🥛', name: 'दूध (Milk)', nameEn: 'Milk', qty: '20 L' },
  { icon: '🍌', name: 'फळ (Fruit)', nameEn: 'Fruits', qty: '100 pcs' },
];

export default function MealsPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [served, setServed] = useState('');
  const [menu, setMenu] = useState('');

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>भोजन नोंदवही — MDM (Meal Register)</h2>
          <p>मध्यान्ह भोजन योजना नोंदवही (Mid-Day Meal Register)</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Daily Register */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">दैनंदिन नोंद (Daily Register)</div>
          </div>
          <div className="card-body">
            <div className="form-grid form-grid-1">
              <div className="form-group">
                <label className="form-label">दिनांक (Date)</label>
                <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">भोजन दिलेले विद्यार्थी (Meals Served)</label>
                <input type="number" className="form-control" placeholder="e.g. 120" value={served} onChange={e => setServed(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">आजचा मेनू (Today&#39;s Menu)</label>
                <textarea className="form-control" placeholder="e.g. भात, डाळ, भाजी, चपाती" value={menu} onChange={e => setMenu(e.target.value)} />
              </div>
              <button className="btn btn-primary">💾 जतन करा (Save)</button>
            </div>
          </div>
        </div>

        {/* Stock Overview */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">साठा गोषवारा (Stock Overview)</div>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {mealData.map((item, i) => (
                <div className="meal-card" key={i}>
                  <div className="meal-icon">{item.icon}</div>
                  <div className="meal-name">{item.name}</div>
                  <div className="meal-count">साठा: {item.qty}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
