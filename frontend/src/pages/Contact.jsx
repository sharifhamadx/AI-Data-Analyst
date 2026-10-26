import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';

export default function Contact() {
  const { t } = useTranslation();
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreed) return alert('يجب الموافقة على الشروط أولاً');
    // فتح تطبيق الإيميل مباشرة لإرسال الرسالة إلى بريدك
    window.location.href = 'mailto:sharifhamadmoko@gmail.com';
  };

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>{t('contact_title')}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" placeholder={t('name')} required style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
          <input type="email" placeholder={t('email')} required style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
          <textarea placeholder={t('msg')} rows="5" required style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }}></textarea>
          
          <label style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#fef2f2', padding: '10px', border: '1px solid #fca5a5', borderRadius: '6px', color: '#991b1b', fontSize: '0.9rem' }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ width: '20px', height: '20px' }} />
            {t('gdpr_contact_consent')}
          </label>

          <button type="submit" disabled={!agreed} style={{ background: agreed ? '#10b981' : '#9ca3af', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: agreed ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '1rem' }}>
            {t('send_msg')}
          </button>
        </form>
      </div>
    </div>
  );
}
