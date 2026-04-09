'use client';
import { useState } from 'react';

const days = ['सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार'];
const daysEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const timeSlots = ['8:00-8:45', '8:45-9:30', '9:30-10:15', '10:15-10:30', '10:30-11:15', '11:15-12:00', '12:00-12:45'];

const defaultTimetable = [
  ['math', 'marathi', 'science', 'break', 'english', 'social', 'pe'],
  ['english', 'math', 'marathi', 'break', 'science', 'art', 'social'],
  ['science', 'english', 'math', 'break', 'marathi', 'pe', 'art'],
  ['marathi', 'science', 'social', 'break', 'math', 'english', 'art'],
  ['social', 'math', 'english', 'break', 'science', 'marathi', 'pe'],
];

const subjectLabels = {
  math: 'गणित (Math)',
  marathi: 'मराठी',
  science: 'विज्ञान (Science)',
  english: 'इंग्रजी (English)',
  social: 'समाजशास्त्र (Social)',
  art: 'कला (Art)',
  pe: 'क्रीडा (PE)',
  break: 'सुट्टी (Break)',
};

export default function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState('5th');

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>वेळापत्रक (Timetable)</h2>
          <p>साप्ताहिक वेळापत्रक पहा (View weekly timetable)</p>
        </div>
        <select className="form-control" style={{ maxWidth: 200 }} value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
          {['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th'].map(c => (
            <option key={c} value={c}>वर्ग {c}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">वर्ग {selectedClass} — साप्ताहिक वेळापत्रक</div>
        </div>
        <div className="card-body">
          <div className="timetable-grid">
            {/* Header row */}
            <div className="tt-header">वेळ</div>
            {days.map((d, i) => (
              <div className="tt-header" key={i}>{d}<br /><small style={{ opacity: 0.6 }}>{daysEn[i]}</small></div>
            ))}

            {/* Time slots */}
            {timeSlots.map((time, ti) => (
              <>
                <div className="tt-time" key={`t-${ti}`}>{time}</div>
                {defaultTimetable.map((daySchedule, di) => {
                  const sub = daySchedule[ti] || '';
                  return (
                    <div className={`tt-cell ${sub}`} key={`${di}-${ti}`}>
                      {subjectLabels[sub] || sub}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
