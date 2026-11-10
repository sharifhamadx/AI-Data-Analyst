import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const chatEndRef = useRef(null);
  const isRTL = i18n.language === 'ar';

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [chartData, setChartData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [dataPreview, setDataPreview] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [searchTerm, setSearchTerm] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('chart');
  const [dragOver, setDragOver] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    document.dir = isRTL ? 'rtl' : 'ltr';
    if (!localStorage.getItem('user')) navigate('/login');
  }, [i18n.language, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleAnalyze = async () => {
    if (!file) return showToast('الرجاء اختيار ملف', 'error');
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/analyze', formData);
      setChartData(response.data.chart);
      setTrendData(response.data.trend);
      setInsights(response.data.insights);
      setDataPreview(response.data.preview);
      setFileName(response.data.filename || file.name);
      showToast('تم التحليل بنجاح ✅', 'success');
    } catch {
      showToast('خطأ في الاتصال بالخادم', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveToDB = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.post('http://127.0.0.1:5000/api/save', {
        user_id: user.id, filename: fileName,
        chart_data: chartData, preview_data: dataPreview,
      });
      showToast(t('save_success'), 'success');
    } catch {
      showToast('حدث خطأ', 'error');
    }
  };

  const exportToCSV = () => {
    if (!dataPreview?.length) return;
    const headers = Object.keys(dataPreview[0]).join(',');
    const rows = filteredPreview.map(row => Object.values(row).join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI('data:text/csv;charset=utf-8,\uFEFF' + headers + '\n' + rows));
    link.setAttribute('download', `Rinas_${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم التصدير 📊', 'success');
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = { sender: 'user', text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/chat', {
        question: userMsg.text, chartData,
      });
      setMessages(prev => [...prev, { sender: 'ai', text: response.data.answer }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'ai', text: 'خطأ في الاتصال.' }]);
    }
  };

  const downloadPDF = () => {
    html2canvas(reportRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      pdf.addImage(imgData, 'PNG', 0, 0, w, (canvas.height * w) / canvas.width);
      pdf.save(`Rinas_Report_${fileName}.pdf`);
      showToast('تم تحميل التقرير 📄', 'success');
    });
  };

  const getChartOption = () => {
    if (!chartData) return {};
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94a3b8' : '#6b7280';
    const palette = ['#3b82f6','#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b'];
    let series = [{
      type: chartType,
      data: chartType === 'pie'
        ? chartData.map((d, i) => ({ name: d.name, value: d.value, itemStyle: { color: palette[i % palette.length] } }))
        : chartData.map(d => d.value),
      itemStyle: chartType !== 'pie' ? {
        color: (params) => palette[params.dataIndex % palette.length],
        borderRadius: chartType === 'bar' ? [6,6,0,0] : 0,
      } : undefined,
      smooth: chartType === 'line',
      areaStyle: chartType === 'line' ? { opacity: 0.08 } : undefined,
    }];
    if (chartType !== 'pie' && trendData?.length) {
      series.push({
        name: t('trendline'), type: 'line', data: trendData, smooth: true,
        lineStyle: { type: 'dashed', color: '#f43f5e', width: 2 }, symbol: 'none', z: 10,
      });
    }
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: chartType === 'pie' ? 'item' : 'axis', backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e5e7eb', textStyle: { color: isDark ? '#f8fafc' : '#1f2937' } },
      grid: { bottom: chartType === 'pie' ? 10 : 70, left: 16, right: 16, top: 16, containLabel: true },
      xAxis: chartType === 'pie' ? undefined : {
        type: 'category', data: chartData.map(d => d.name),
        axisLabel: { interval: 0, rotate: 30, fontSize: 11, color: textColor },
        axisLine: { lineStyle: { color: isDark ? '#334155' : '#e5e7eb' } },
        splitLine: { show: false },
      },
      yAxis: chartType === 'pie' ? undefined : {
        type: 'value',
        axisLabel: { color: textColor, fontSize: 11 },
        splitLine: { lineStyle: { color: isDark ? '#1e293b' : '#f3f4f6' } },
      },
      series,
    };
  };

  const filteredPreview = dataPreview.filter(row =>
    Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const kpiCards = insights ? [
    { label: 'الأعلى', value: insights.max_name, sub: insights.max_val?.toLocaleString(), color: '#10b981', icon: '📈' },
    { label: 'الأدنى', value: insights.min_name, sub: insights.min_val?.toLocaleString(), color: '#f43f5e', icon: '📉' },
    { label: 'المجموع', value: insights.total?.toLocaleString(), sub: `متوسط: ${insights.avg?.toLocaleString()}`, color: '#3b82f6', icon: '💰' },
    { label: 'التقلب', value: insights.volatility?.toLocaleString() ?? '—', sub: 'Volatility', color: '#f59e0b', icon: '📊' },
  ] : [];

  const s = {
    wrap: { minHeight: '100vh', background: 'var(--bg-main)' },
    page: { maxWidth: '1280px', margin: '0 auto', padding: '24px 20px' },
    uploadZone: { maxWidth: '560px', margin: '60px auto', textAlign: 'center' },
    dropzone: {
      border: `2px dashed ${dragOver ? '#3b82f6' : 'var(--border)'}`,
      borderRadius: '16px', padding: '48px 32px',
      background: dragOver ? 'rgba(59,130,246,0.04)' : 'var(--bg-card)',
      transition: 'all 0.2s', cursor: 'pointer',
    },
    headerBar: {
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '12px', padding: '14px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: '10px',
    },
    kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', margin: '16px 0' },
    kpiCard: (color) => ({
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '12px', padding: '16px', borderTop: `3px solid ${color}`,
    }),
    layout: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' },
    mainCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' },
    tabBar: { display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 16px', gap: '4px' },
    tab: (active) => ({
      padding: '12px 16px', fontSize: '13px', fontWeight: active ? '700' : '500',
      color: active ? '#3b82f6' : 'var(--text-sub)',
      borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
      background: 'none', border: 'none',
      cursor: 'pointer',
    }),
    chartTypeBtn: (active) => ({
      padding: '6px 14px', borderRadius: '20px',
      border: `1px solid ${active ? '#3b82f6' : 'var(--border)'}`,
      background: active ? '#3b82f6' : 'transparent',
      color: active ? 'white' : 'var(--text-sub)',
      fontSize: '12px', fontWeight: '600', cursor: 'pointer',
    }),
    chatPanel: {
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '12px', display: 'flex', flexDirection: 'column', height: '620px', overflow: 'hidden',
    },
    chatBubble: (sender) => ({
      alignSelf: sender === 'user' ? (isRTL ? 'flex-start' : 'flex-end') : (isRTL ? 'flex-end' : 'flex-start'),
      background: sender === 'user' ? '#3b82f6' : 'var(--bg-main)',
      color: sender === 'user' ? 'white' : 'var(--text-main)',
      padding: '10px 14px',
      borderRadius: sender === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
      maxWidth: '88%', fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-wrap',
    }),
    btnPrimary: (bg='#3b82f6') => ({
      padding: '8px 14px', borderRadius: '8px', border: 'none',
      background: bg, color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
    }),
    btnOutline: {
      padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)',
      background: 'transparent', color: 'var(--text-sub)', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
    },
    toast: (type) => ({
      position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
      background: type === 'error' ? '#ef4444' : '#10b981',
      color: 'white', padding: '12px 24px', borderRadius: '10px',
      zIndex: 9999, fontWeight: '700', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    }),
  };

  return (
    <div style={s.wrap}>
      <Navbar />
      {toast && <div style={s.toast(toast.type)}>{toast.message}</div>}
      <div style={s.page}>
        {!chartData ? (
          <div style={s.uploadZone}>
            <div
              style={s.dropzone}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>رفع ملف للتحليل</div>
              <div style={{ fontSize: '13px', color: 'var(--text-sub)', marginBottom: '24px' }}>اسحب الملف هنا أو اضغط للاختيار<br />CSV · Excel · PDF</div>
              <input id="fileInput" type="file" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} accept=".csv,.xlsx,.xls,.pdf" />
              {file && <div style={{ fontSize: '13px', color: '#3b82f6', margin: '0 0 12px', fontWeight: '600' }}>📄 {file.name}</div>}
              <button
                onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                style={{ ...s.btnPrimary(), width: '100%', padding: '12px', fontSize: '14px', borderRadius: '10px', opacity: isAnalyzing ? 0.7 : 1 }}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? '⏳ جاري التحليل...' : '🔍 تحليل البيانات'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={s.headerBar}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-main)' }}>📄 {fileName}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '2px' }}>{dataPreview.length} سجل • {dataPreview.length > 0 ? Object.keys(dataPreview[0]).length : 0} عمود</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={saveToDB} style={s.btnPrimary('#6366f1')}>💾 حفظ</button>
                <button onClick={downloadPDF} style={s.btnPrimary('#10b981')}>📄 PDF</button>
                <button onClick={exportToCSV} style={s.btnPrimary('#f59e0b')}>📊 CSV</button>
                <button onClick={() => { setChartData(null); setFile(null); setMessages([]); }} style={s.btnOutline}>🔄 جديد</button>
              </div>
            </div>

            {insights && (
              <div style={s.kpiRow}>
                {kpiCards.map((k, i) => (
                  <div key={i} style={s.kpiCard(k.color)}>
                    <div style={{ fontSize: '20px', marginBottom: '8px' }}>{k.icon}</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: k.color, marginBottom: '4px' }}>{k.value}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: '600' }}>{k.label}</div>
                    {k.sub && <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '4px' }}>{k.sub}</div>}
                  </div>
                ))}
              </div>
            )}

            <div style={s.layout}>
              <div ref={reportRef} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={s.mainCard}>
                  <div style={s.tabBar}>
                    {[['chart','📊 الرسم البياني'],['table','📋 البيانات']].map(([key,label]) => (
                      <button key={key} style={s.tab(activeTab===key)} onClick={() => setActiveTab(key)}>{label}</button>
                    ))}
                  </div>
                  <div style={{ padding: '20px' }}>
                    {activeTab === 'chart' && (
                      <>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                          {[['bar','📊 أعمدة'],['line','📈 خطي'],['pie','🥧 دائري']].map(([type,label]) => (
                            <button key={type} style={s.chartTypeBtn(chartType===type)} onClick={() => setChartType(type)}>{label}</button>
                          ))}
                        </div>
                        <ReactECharts option={getChartOption()} style={{ height: '380px' }} />
                      </>
                    )}
                    {activeTab === 'table' && (
                      <>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                          <input
                            type="text" placeholder="🔍 بحث في البيانات..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                          />
                          <button onClick={exportToCSV} style={s.btnPrimary('#10b981')}>تصدير</button>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                            <thead>
                              <tr>{dataPreview.length > 0 && Object.keys(dataPreview[0]).map(k => (
                                <th key={k} style={{ padding: '10px 12px', textAlign: 'start', fontWeight: '700', fontSize: '11px', color: 'var(--text-sub)', borderBottom: '2px solid var(--border)' }}>{k}</th>
                              ))}</tr>
                            </thead>
                            <tbody>
                              {filteredPreview.map((row, idx) => (
                                <tr key={idx} style={{ background: idx%2===0 ? 'transparent' : 'rgba(0,0,0,0.015)' }}>
                                  {Object.values(row).map((val, i) => (
                                    <td key={i} style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-main)' }}>{val}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div style={s.chatPanel}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: chartData ? '#10b981' : '#94a3b8' }} />
                  🤖 المساعد الذكي
                </div>
                {messages.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)', gap: '10px', fontSize: '13px' }}>
                    <span style={{ fontSize: '32px' }}>💬</span>
                    <span>اسألني عن بياناتك</span>
                    <span style={{ fontSize: '11px', textAlign: 'center', maxWidth: '200px' }}>مثال: ما أعلى قيمة؟ ما التوصية؟</span>
                  </div>
                ) : (
                  <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {messages.map((msg, idx) => (
                      <div key={idx} style={s.chatBubble(msg.sender)}>{msg.text}</div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}
                <form onSubmit={handleSendChat} style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
                  <input
                    type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                    placeholder="اكتب سؤالك..."
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}
                  />
                  <button type="submit" style={s.btnPrimary()}>↑</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
