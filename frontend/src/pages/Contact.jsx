import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';

export default function Contact() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [agreed, setAgreed] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', msg: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreed) return;
    window.location.href = `mailto:sharifhamadmoko@gmail.com?subject=رسالة من ${form.name}&body=${form.msg}`;
    setSent(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />
      <div style={{ maxWidth: '600px', margin: '48px auto', padding: '0 20px', direction: isRTL ? 'rtl' : 'ltr' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', margin: '0 auto 16px', boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
          }}>✉️</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
            {isRTL ? 'تواصل معنا' : 'Contact Us'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-sub)', lineHeight: '1.6' }}>
            {isRTL ? 'نحن هنا للمساعدة، أرسل لنا رسالتك وسنرد في أقرب وقت.' : 'We are here to help. Send us a message and we will get back to you soon.'}
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
                {isRTL ? 'تم الإرسال!' : 'Message Sent!'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-sub)' }}>
                {isRTL ? 'سنتواصل معك قريباً' : 'We will get back to you soon'}
              </div>
              <button onClick={() => { setSent(false); setForm({ name: '', email: '', msg: '' }); setAgreed(false); }}
                style={{ marginTop: '24px', padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                {isRTL ? 'إرسال رسالة أخرى' : 'Send Another'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Name */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-sub)', display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  type="text" required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={isRTL ? 'أدخل اسمك...' : 'Enter your name...'}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-sub)', display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email" required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={isRTL ? 'example@email.com' : 'example@email.com'}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Message */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-sub)', display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'رسالتك' : 'Your Message'}
                </label>
                <textarea
                  required rows="5"
                  value={form.msg}
                  onChange={(e) => setForm({ ...form, msg: e.target.value })}
                  placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Cairo, sans-serif' }}
                />
              </div>

              {/* GDPR */}
              <label style={{
                display: 'flex', gap: '10px', alignItems: 'flex-start',
                padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                background: agreed ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.04)',
                border: `1px solid ${agreed ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.2)'}`,
                transition: 'all 0.2s',
              }}>
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                  style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: '#10b981', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: 'var(--text-sub)', lineHeight: '1.6' }}>
                  {isRTL
                    ? 'أوافق على سياسة الخصوصية وأن يتم التواصل معي عبر البريد الإلكتروني.'
                    : 'I agree to the privacy policy and consent to be contacted via email.'}
                </span>
              </label>

              {/* Submit */}
              <button type="submit" disabled={!agreed} style={{
                width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
                background: agreed ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'var(--border)',
                color: agreed ? 'white' : 'var(--text-sub)',
                fontWeight: '700', fontSize: '14px',
                cursor: agreed ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: agreed ? '0 4px 14px rgba(99,102,241,0.3)' : 'none',
                fontFamily: 'Cairo, sans-serif',
              }}>
                {isRTL ? '📨 إرسال الرسالة' : '📨 Send Message'}
              </button>

            </form>
          )}
        </div>

        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
          {[
            { icon: '📧', title: isRTL ? 'البريد' : 'Email', value: 'sharifhamadmoko@gmail.com' },
            { icon: '⚡', title: isRTL ? 'وقت الرد' : 'Response', value: isRTL ? 'خلال 24 ساعة' : 'Within 24 hours' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{item.icon}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: '600', marginBottom: '4px' }}>{item.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: '700' }}>{item.value}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
