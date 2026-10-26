import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => { document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'; }, [i18n.language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) return alert('يجب الموافقة على القوانين');
    
    try {
      const url = isLogin ? 'http://127.0.0.1:5000/api/login' : 'http://127.0.0.1:5000/api/signup';
      const res = await axios.post(url, formData);
      
      // حفظ بيانات المستخدم في المتصفح
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.error || 'خطأ في الاتصال بالخادم');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="card" style={{ padding: '40px', width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#0056d2', margin: 0 }}>👑 Rinas</h1>
          <h3 style={{ color: '#4b5563', marginTop: '10px' }}>{isLogin ? t('login_title') : 'إنشاء حساب جديد'}</h3>
        </div>

        <button onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')} className="btn-secondary" style={{ width: '100%', marginBottom: '20px' }}>
          {t('switch_lang')}
        </button>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isLogin && (
            <input type="text" placeholder="الاسم الكامل" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '12px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
          )}
          <input type="email" placeholder={t('email')} required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '12px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
          <input type="password" placeholder={t('password')} required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ padding: '12px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
          
          <div style={{ background: '#f3f4f6', padding: '15px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <button type="button" onClick={() => setShowModal(true)} style={{ background: 'none', border: 'none', color: '#0056d2', textDecoration: 'underline', cursor: 'pointer', marginBottom: '10px' }}>{t('read_terms')}</button>
            <label style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#374151', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} /> {t('gdpr_login_consent')}
            </label>
          </div>

          <button type="submit" disabled={!agreed} className="btn-primary" style={{ padding: '12px' }}>
            {isLogin ? t('login_btn') : 'إنشاء الحساب'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#4b5563', fontSize: '13px' }}>
          {isLogin ? "لا تملك حساباً؟ " : "لديك حساب بالفعل؟ "}
          <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#0056d2', cursor: 'pointer', fontWeight: 'bold' }}>
            {isLogin ? "سجل الآن" : "تسجيل الدخول"}
          </span>
        </p>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ padding: '30px', maxWidth: '500px' }}>
            <h2 style={{ color: '#0056d2', marginBottom: '15px' }}>{t('terms_title')}</h2>
            <p style={{ color: '#4b5563', lineHeight: '1.8', marginBottom: '20px' }}>{t('terms_content')}</p>
            <button onClick={() => { setAgreed(true); setShowModal(false); }} className="btn-primary" style={{ width: '100%' }}>{t('agree_close')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
