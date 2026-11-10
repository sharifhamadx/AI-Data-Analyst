import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, History, Info, Mail, Shield, Menu, X, Sun, Moon, LogOut } from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isRTL = i18n.language === 'ar';

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

  const navLinks = [
    { to: '/', label: t('dashboard_title'), icon: <LayoutDashboard size={15} /> },
    { to: '/history', label: t('history'), icon: <History size={15} /> },
    { to: '/about', label: t('about'), icon: <Info size={15} /> },
    { to: '/contact', label: t('contact'), icon: <Mail size={15} /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => setMenuOpen(false)}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '17px', boxShadow: '0 2px 8px rgba(99,102,241,0.35)', flexShrink: 0,
          }}>👑</div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>Rinas</div>
            <div style={{ fontSize: '10px', color: 'var(--text-sub)', fontWeight: '400', marginTop: '2px' }}>{t('subtitle')}</div>
          </div>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'none', alignItems: 'center', gap: '2px' }} className="nav-desktop">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              padding: '7px 12px', borderRadius: '8px', textDecoration: 'none',
              fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px',
              color: isActive(link.to) ? '#3b82f6' : 'var(--text-sub)',
              background: isActive(link.to) ? 'rgba(59,130,246,0.08)' : 'transparent',
            }}>{link.icon}{link.label}</Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" style={{
              padding: '7px 12px', borderRadius: '8px', textDecoration: 'none',
              fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px',
              color: isActive('/admin') ? 'white' : '#ef4444',
              background: isActive('/admin') ? '#ef4444' : 'rgba(239,68,68,0.08)',
            }}><Shield size={15} /> {isRTL ? 'الإدارة' : 'Admin'}</Link>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px', borderRadius: '20px',
              background: 'var(--bg-main)', border: '1px solid var(--border)',
              fontSize: '12px', color: 'var(--text-sub)', fontWeight: '600',
            }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: '800' }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <span style={{ maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name?.split(' ')[0]}</span>
            </div>
          )}

          <button onClick={() => i18n.changeLanguage(isRTL ? 'en' : 'ar')} style={{
            width: '32px', height: '32px', borderRadius: '8px',
            border: '1px solid var(--border)', background: 'var(--bg-main)',
            color: 'var(--text-main)', fontWeight: '700', cursor: 'pointer', fontSize: '11px',
          }}>{isRTL ? 'EN' : 'AR'}</button>

          <button onClick={toggleTheme} style={{
            width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)',
            background: 'var(--bg-main)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)',
          }}>{theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}</button>

          <button onClick={handleLogout} className="nav-desktop" style={{
            padding: '6px 12px', borderRadius: '8px', border: 'none',
            background: 'rgba(239,68,68,0.08)', color: '#ef4444',
            fontSize: '12px', fontWeight: '700', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}><LogOut size={13} />{t('logout')}</button>

          {/* Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="nav-mobile" style={{
            width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)',
            background: 'var(--bg-main)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)',
          }}>{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          borderTop: '1px solid var(--border)', background: 'var(--bg-card)',
          padding: '8px 16px 16px',
        }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 8px', textDecoration: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: '600',
              color: isActive(link.to) ? '#3b82f6' : 'var(--text-main)',
              background: isActive(link.to) ? 'rgba(59,130,246,0.08)' : 'transparent',
              borderBottom: '1px solid var(--border)',
            }}>{link.icon}{link.label}</Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setMenuOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 8px', textDecoration: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: '700', color: '#ef4444',
              borderBottom: '1px solid var(--border)',
            }}><Shield size={15} />{isRTL ? 'الإدارة' : 'Admin'}</Link>
          )}
          <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={{
            marginTop: '8px', width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
            background: 'rgba(239,68,68,0.08)', color: '#ef4444',
            fontSize: '14px', fontWeight: '700', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}><LogOut size={15} />{t('logout')}</button>
        </div>
      )}
    </nav>
  );
}
