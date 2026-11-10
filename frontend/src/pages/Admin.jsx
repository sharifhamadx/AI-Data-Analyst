import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';

export default function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr || JSON.parse(userStr).role !== 'admin') {
      navigate('/');
    } else {
      fetchUsers();
    }
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/admin/users');
      setUsers(res.data);
    } catch {
      showToast('خطأ في تحميل المستخدمين', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearPassword = (userId, userName) => {
    setConfirmModal({
      title: 'تصفير كلمة المرور',
      message: `هل تريد تصفير كلمة المرور لـ: ${userName}؟`,
      color: '#f59e0b', icon: '🔑',
      onConfirm: async () => {
        try {
          await axios.post('http://127.0.0.1:5000/api/admin/clear-password', { user_id: userId });
          showToast('تم تصفير كلمة المرور ✅');
        } catch {
          showToast('حدث خطأ', 'error');
        }
        setConfirmModal(null);
      },
    });
  };

  const handleChangeStatus = (userId, userName, status, label) => {
    setConfirmModal({
      title: label,
      message: `هل أنت متأكد من ${label} المستخدم: ${userName}؟`,
      color: status !== 'active' ? '#ef4444' : '#10b981',
      icon: status === 'banned' ? '🚫' : status === 'deleted' ? '🗑️' : '✅',
      onConfirm: async () => {
        try {
          await axios.post('http://127.0.0.1:5000/api/admin/change-status', { user_id: userId, status });
          showToast(`تم ${label} بنجاح`);
          fetchUsers();
        } catch {
          showToast('حدث خطأ', 'error');
        }
        setConfirmModal(null);
      },
    });
  };

  const activeUsers = users.filter(u => u.status === 'active');
  const archivedUsers = users.filter(u => u.status === 'banned' || u.status === 'deleted');
  const displayedUsers = (activeTab === 'active' ? activeUsers : archivedUsers)
    .filter(u => u.name.includes(search) || u.email.includes(search));
  const totalFiles = users.reduce((acc, u) => acc + (u.file_count || 0), 0);

  const avatarColors = ['#3b82f6','#6366f1','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4'];
  const getAvatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];
  const statusConfig = {
    active: { label: 'نشط', color: '#10b981', bg: '#d1fae5' },
    banned: { label: 'محظور', color: '#ef4444', bg: '#fee2e2' },
    deleted: { label: 'محذوف', color: '#6b7280', bg: '#f3f4f6' },
  };

  const s = {
    wrap: { minHeight: '100vh', background: 'var(--bg-main)' },
    page: { maxWidth: '1200px', margin: '0 auto', padding: '28px 20px', direction: 'rtl' },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' },
    statCard: (color) => ({ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', borderTop: `3px solid ${color}` }),
    tabGroup: { display: 'flex', gap: '6px', background: 'var(--bg-card)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' },
    tab: (active) => ({ padding: '8px 18px', borderRadius: '8px', border: 'none', background: active ? '#3b82f6' : 'transparent', color: active ? 'white' : 'var(--text-sub)', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }),
    tableCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' },
    th: { padding: '12px 16px', textAlign: 'right', fontWeight: '700', fontSize: '11px', color: 'var(--text-sub)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' },
    td: { padding: '14px 16px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' },
    actionBtn: (color) => ({ padding: '5px 11px', borderRadius: '7px', border: 'none', background: color + '18', color: color, fontSize: '11px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }),
    actionBtnSolid: (bg) => ({ padding: '5px 11px', borderRadius: '7px', border: 'none', background: bg, color: 'white', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }),
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modal: { background: 'var(--bg-card)', borderRadius: '16px', padding: '32px', maxWidth: '380px', width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
    toast: (type) => ({ position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)', background: type === 'error' ? '#ef4444' : '#10b981', color: 'white', padding: '12px 24px', borderRadius: '10px', zIndex: 9999, fontWeight: '700', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }),
  };

  return (
    <div style={s.wrap}>
      <Navbar />
      {toast && <div style={s.toast(toast.type)}>{toast.message}</div>}

      {confirmModal && (
        <div style={s.overlay} onClick={() => setConfirmModal(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>{confirmModal.icon}</div>
            <div style={{ fontWeight: '800', fontSize: '17px', color: 'var(--text-main)', marginBottom: '8px' }}>{confirmModal.title}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-sub)', marginBottom: '24px', lineHeight: '1.6' }}>{confirmModal.message}</div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button style={{ padding: '10px 20px', borderRadius: '9px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-sub)', fontWeight: '700', cursor: 'pointer' }} onClick={() => setConfirmModal(null)}>إلغاء</button>
              <button style={{ padding: '10px 20px', borderRadius: '9px', border: 'none', background: confirmModal.color, color: 'white', fontWeight: '700', cursor: 'pointer' }} onClick={confirmModal.onConfirm}>تأكيد</button>
            </div>
          </div>
        </div>
      )}

      <div style={s.page}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>🛡️ لوحة الإدارة</div>
          <div style={{ fontSize: '13px', color: 'var(--text-sub)' }}>إدارة المستخدمين والصلاحيات</div>
        </div>

        <div style={s.statsRow}>
          {[
            { label: 'إجمالي المستخدمين', value: users.length, color: '#3b82f6', icon: '👥' },
            { label: 'المستخدمون النشطون', value: activeUsers.length, color: '#10b981', icon: '✅' },
            { label: 'المحظورون / المحذوفون', value: archivedUsers.length, color: '#ef4444', icon: '🚫' },
            { label: 'إجمالي الملفات', value: totalFiles, color: '#6366f1', icon: '📄' },
          ].map((stat, i) => (
            <div key={i} style={s.statCard(stat.color)}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '6px', fontWeight: '600' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={s.tabGroup}>
            <button style={s.tab(activeTab === 'active')} onClick={() => setActiveTab('active')}>النشطون ({activeUsers.length})</button>
            <button style={s.tab(activeTab === 'archive')} onClick={() => setActiveTab('archive')}>الأرشيف ({archivedUsers.length})</button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text" placeholder="🔍 بحث بالاسم أو الإيميل..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '9px 14px', borderRadius: '9px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', minWidth: '220px' }}
            />
            <button onClick={fetchUsers} style={{ padding: '9px 14px', borderRadius: '9px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-sub)', cursor: 'pointer' }}>🔄</button>
          </div>
        </div>

        <div style={s.tableCard}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>⏳ جاري التحميل...</div>
          ) : displayedUsers.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-sub)' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>{activeTab === 'active' ? '🎉' : '📭'}</div>
              <div>{activeTab === 'active' ? 'لا يوجد مستخدمون نشطون' : 'الأرشيف فارغ'}</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead style={{ background: 'var(--bg-main)' }}>
                  <tr>
                    {['المستخدم','الحالة','الملفات','الإجراءات'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayedUsers.map((u, idx) => {
                    const sc = statusConfig[u.status] || statusConfig.active;
                    return (
                      <tr key={u.id} style={{ background: idx%2===0 ? 'transparent' : 'rgba(0,0,0,0.012)' }}>
                        <td style={s.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: getAvatarColor(u.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', color: 'white', flexShrink: 0 }}>
                              {u.name[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{u.name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-sub)', marginTop: '2px' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={s.td}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', background: sc.bg, color: sc.color, fontSize: '11px', fontWeight: '700' }}>
                            {sc.label}
                          </span>
                        </td>
                        <td style={s.td}>
                          <span style={{ fontWeight: '800', fontSize: '15px', color: '#3b82f6' }}>{u.file_count}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-sub)', marginRight: '4px' }}> ملف</span>
                        </td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {activeTab === 'active' ? (
                              <>
                                <button style={s.actionBtn('#f59e0b')} onClick={() => handleClearPassword(u.id, u.name)}>🔑 تصفير</button>
                                <button style={s.actionBtn('#ef4444')} onClick={() => handleChangeStatus(u.id, u.name, 'banned', 'حظر')}>🚫 حظر</button>
                                <button style={s.actionBtn('#6b7280')} onClick={() => handleChangeStatus(u.id, u.name, 'deleted', 'حذف')}>🗑️ حذف</button>
                              </>
                            ) : (
                              <button style={s.actionBtnSolid('#10b981')} onClick={() => handleChangeStatus(u.id, u.name, 'active', 'استرجاع')}>✅ استرجاع</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
