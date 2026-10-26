import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);
  
  const toggleTheme = () => { 
    const newTheme = theme === 'dark' ? 'light' : 'dark'; 
    setTheme(newTheme); 
    localStorage.setItem('theme', newTheme); 
  };

  const handleLogout = () => {
    localStorage.clear(); sessionStorage.clear(); navigate('/login');
  };

  return (
    <nav style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '10px 15px', position: 'relative', zIndex: 50 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* اسم الموقع والشعار بخط رفيع */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--btn-bg)', lineHeight: '1' }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>👑 Rinas</Link>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: '300', marginTop: '4px', letterSpacing: '0.5px' }}>
            {t('subtitle')}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')} 
            style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '11px' }}>
            {i18n.language === 'ar' ? 'EN' : 'AR'}
          </button>
          
          <button onClick={toggleTheme} 
            style={{ width: '30px', height: '30px', borderRadius: '50%', border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-main)', marginLeft: '5px' }}>
            ☰
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', right: i18n.language === 'ar' ? 'auto' : '15px', left: i18n.language === 'ar' ? '15px' : 'auto', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', width: '200px', zIndex: 1000, overflow: 'hidden' }}>
          <Link to="/" onClick={() => setIsOpen(false)} style={{ padding: '12px 16px', color: 'var(--text-main)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>{t('dashboard_title')}</Link>
          <Link to="/history" onClick={() => setIsOpen(false)} style={{ padding: '12px 16px', color: 'var(--text-main)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>{t('history')}</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} style={{ padding: '12px 16px', color: 'var(--text-main)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>{t('about')}</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} style={{ padding: '12px 16px', color: 'var(--text-main)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>{t('contact')}</Link>
          {user && user.role === 'admin' && (
            <Link to="/admin" onClick={() => setIsOpen(false)} style={{ padding: '12px 16px', color: 'white', background: '#ef4444', fontWeight: 'bold', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>🛡️ لوحة الإدارة</Link>
          )}
          <button onClick={handleLogout} style={{ padding: '12px 16px', color: '#ef4444', fontWeight: 'bold', textDecoration: 'none', background: 'none', border: 'none', textAlign: i18n.language === 'ar' ? 'right' : 'left', cursor: 'pointer' }}>{t('logout')}</button>
        </div>
      )}
    </nav>
  );
}
