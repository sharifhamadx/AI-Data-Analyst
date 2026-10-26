import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';

export default function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archive'

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr || JSON.parse(userStr).role !== 'admin') {
      navigate('/');
    } else {
      fetchUsers();
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/admin/users');
      setUsers(res.data);
    } catch (e) { console.error(e); }
  };

  const handleClearPassword = async (userId, userName) => {
    if (!window.confirm(`تصفير كلمة المرور لـ: ${userName}؟`)) return;
    try {
      await axios.post('http://127.0.0.1:5000/api/admin/clear-password', { user_id: userId });
      alert('تم حذف كلمة المرور بنجاح!');
    } catch (e) { alert('خطأ.'); }
  };

  const handleChangeStatus = async (userId, userName, status, actionName) => {
    if (!window.confirm(`هل أنت متأكد من ${actionName} الشركة/المستخدم: ${userName}؟`)) return;
    try {
      await axios.post('http://127.0.0.1:5000/api/admin/change-status', { user_id: userId, status: status });
      fetchUsers();
    } catch (e) { alert('حدث خطأ.'); }
  };

  // تقسيم المستخدمين حسب الحالة
  const activeUsers = users.filter(u => u.status === 'active');
  const archivedUsers = users.filter(u => u.status === 'banned' || u.status === 'deleted');

  const btnStyle = { padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'white', marginLeft: '5px' };

  return (
    <div style={{ background: '#f5f7f8', minHeight: '100vh', fontFamily: 'Cairo, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', direction: 'rtl' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '20px', borderBottom: '2px solid #fca5a5', paddingBottom: '10px' }}>
          🛡️ لوحة إدارة ريناس الشاملة
        </h2>
        
        {/* تبويبات الإدارة */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => setActiveTab('active')} style={{ padding: '10px 20px', background: activeTab === 'active' ? '#0056d2' : '#e5e7eb', color: activeTab === 'active' ? 'white' : '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            الشركات والمستخدمين النشطين ({activeUsers.length})
          </button>
          <button onClick={() => setActiveTab('archive')} style={{ padding: '10px 20px', background: activeTab === 'archive' ? '#ef4444' : '#e5e7eb', color: activeTab === 'archive' ? 'white' : '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            سلة المحظورين والمحذوفين 🗑️ ({archivedUsers.length})
          </button>
        </div>

        <div className="card" style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb' }}>ID</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb' }}>الاسم</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb' }}>الإيميل</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb', textAlign: 'center' }}>عدد الملفات المحللة</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb' }}>إجراءات الحماية وإدارة الحساب</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'active' ? activeUsers : archivedUsers).map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb', background: u.status === 'banned' ? '#fef2f2' : 'transparent' }}>
                    <td style={{ padding: '12px', color: '#6b7280' }}>{u.id}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#1f2937' }}>{u.name}</td>
                    <td style={{ padding: '12px', color: '#0056d2' }}>{u.email}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#10b981' }}>{u.file_count} 📄</td>
                    <td style={{ padding: '12px' }}>
                      {activeTab === 'active' ? (
                        <>
                          <button onClick={() => handleClearPassword(u.id, u.name)} style={{...btnStyle, background: '#f59e0b'}}>حذف الباسورد</button>
                          <button onClick={() => handleChangeStatus(u.id, u.name, 'banned', 'حظر')} style={{...btnStyle, background: '#ef4444'}}>حظر</button>
                          <button onClick={() => handleChangeStatus(u.id, u.name, 'deleted', 'حذف')} style={{...btnStyle, background: '#374151'}}>حذف لسلة المهملات</button>
                        </>
                      ) : (
                        <>
                          <span style={{ color: '#ef4444', fontWeight: 'bold', marginLeft: '15px' }}>{u.status === 'banned' ? 'محظور 🚫' : 'محذوف 🗑️'}</span>
                          <button onClick={() => handleChangeStatus(u.id, u.name, 'active', 'فك الحظر/الاسترجاع لـ')} style={{...btnStyle, background: '#10b981'}}>استرجاع للعمل ✅</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
