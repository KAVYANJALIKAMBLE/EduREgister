'use client';
import './globals.css';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { ToastProvider } from './components/Toast';
import AuthOverlay from './components/AuthOverlay';
import Sidebar from './components/Sidebar';

function AppShell({ children }) {
  const { isLoggedIn, loading } = useAuth();
  const [lang, setLang] = useState('mr');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Listen for auth panel events from sidebar
  const [authPanel, setAuthPanel] = useState(null);
  useEffect(() => {
    const handler = (e) => setAuthPanel(e.detail);
    window.addEventListener('auth-panel', handler);
    return () => window.removeEventListener('auth-panel', handler);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--cream)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>EduRegister</div>
          <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthOverlay />;
  }

  return (
    <>
      {authPanel && <AuthOverlay />}
      <Sidebar lang={lang} onLangChange={setLang} sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div id="main">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
            <div>
              <div className="page-title">{lang === 'en' ? 'EduRegister' : 'EduRegister'}</div>
              <div className="page-subtitle">{lang === 'en' ? 'School Management System' : 'शालेय अभिलेख प्रणाली'}</div>
            </div>
          </div>
          <div className="topbar-actions">
            <span style={{ fontSize: 13, color: 'var(--text-light)' }}>
              {new Date().toLocaleDateString('mr-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
        <div className="content">
          {children}
        </div>
      </div>
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Noto+Sans+Devanagari:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <title>EduRegister - ऑनलाइन मराठी शालेय अभिलेख प्रणाली</title>
        <meta name="description" content="EduRegister — online educational registry system for Marathi-medium schools" />
      </head>
      <body>
        <AuthProvider>
          <ToastProvider>
            <AppShell>
              {children}
            </AppShell>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
