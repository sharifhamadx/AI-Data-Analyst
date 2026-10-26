import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';

export default function About() {
  const { t } = useTranslation();
  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <div className="card">
          <h2 style={{ color: '#0056d2', marginBottom: '20px', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px' }}>
            {t('about')}
          </h2>
          
          <h4 style={{ color: '#374151', marginBottom: '10px' }}>{t('about_rinas_title')}</h4>
          <p style={{ color: '#4b5563', marginBottom: '30px', fontSize: '14px', lineHeight: '1.8' }}>
            {t('about_rinas_desc')}
          </p>

          <h4 style={{ color: '#374151', marginBottom: '10px' }}>{t('about_dev_title')}</h4>
          <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.8' }}>
            {t('about_dev_desc')}
          </p>
        </div>
      </div>
    </div>
  );
}
