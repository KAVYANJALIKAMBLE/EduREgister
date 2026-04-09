'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

const navItems = [
  { section: 'मुख्य (MAIN)', items: [
    { href: '/', icon: '📊', label: 'डॅशबोर्ड', labelEn: 'Dashboard' },
    { href: '/students/add', icon: '➕', label: 'नवीन प्रवेश', labelEn: 'New Admission' },
    { href: '/students', icon: '👥', label: 'विद्यार्थी नोंदवही', labelEn: 'Student Register' },
    { href: '/attendance', icon: '📋', label: 'उपस्थिती', labelEn: 'Attendance' },
    { href: '/timetable', icon: '🕐', label: 'वेळापत्रक', labelEn: 'Timetable' },
    { href: '/bonafide', icon: '📜', label: 'बोनाफाईड / दाखला', labelEn: 'Certificates' },
    { href: '/idcard', icon: '🪪', label: 'ओळखपत्र', labelEn: 'ID Card' },
  ]},
  { section: 'व्यवस्थापन (MANAGE)', items: [
    { href: '/meals', icon: '🍽️', label: 'भोजन नोंदवही', labelEn: 'Meal Register' },
    { href: '/reports', icon: '📈', label: 'अहवाल', labelEn: 'Reports' },
  ]},
  { section: 'प्रणाली (SYSTEM)', items: [
    { href: '/settings', icon: '⚙️', label: 'सेटिंग्ज', labelEn: 'Settings' },
  ]},
];

export default function Sidebar({ lang = 'mr', onLangChange, sidebarOpen, onClose }) {
  const pathname = usePathname();
  const { username, logout } = useAuth();

  return (
    <>
      {sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99 }} onClick={onClose} />}
      <aside id="sidebar" className={sidebarOpen ? 'open' : ''}>
        <div className="sidebar-logo">
          <div className="logo-emblem">📚</div>
          <div className="logo-title">EduRegister</div>
          <div className="logo-sub">शालेय अभिलेख प्रणाली</div>
        </div>

        <div className="lang-toggle">
          <button className={`lang-btn ${lang === 'mr' ? 'active' : ''}`} onClick={() => onLangChange?.('mr')}>मराठी</button>
          <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => onLangChange?.('en')}>English</button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((sec, si) => (
            <div className="nav-section" key={si}>
              <div className="nav-section-title">{sec.section}</div>
              {sec.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{lang === 'en' ? item.labelEn : item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          {username && (
            <div className="auth-user-badge">👤 {username}</div>
          )}
          <button className="sidebar-changepw-btn" onClick={() => {
            // Dispatch event for AuthOverlay to pick up
            window.dispatchEvent(new CustomEvent('auth-panel', { detail: 'changepw' }));
          }}>
            🔑 पासवर्ड बदला
          </button>
          <button id="auth-logout-btn" onClick={logout}>
            🚪 लॉगआउट / Logout
          </button>
          <div className="school-badge">
            <div className="school-name">ADCET, Ashta</div>
            शालेय व्यवस्थापन प्रणाली
          </div>
        </div>
      </aside>
    </>
  );
}
