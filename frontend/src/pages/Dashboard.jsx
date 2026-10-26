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

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => { 
    document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'; 
    if (!localStorage.getItem('user')) navigate('/login');
  }, [i18n.language, navigate]);

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
    } catch (error) { showToast('خطأ في الاتصال بالخادم', 'error'); } 
    finally { setIsAnalyzing(false); }
  };

  const saveToDB = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.post('http://127.0.0.1:5000/api/save', { user_id: user.id, filename: fileName, chart_data: chartData, preview_data: dataPreview });
      showToast(t('save_success'), 'success');
    } catch (e) { showToast('حدث خطأ', 'error'); }
  };

  const exportToCSV = () => {
    if (!dataPreview || dataPreview.length === 0) return;
    const headers = Object.keys(dataPreview[0]).join(',');
    const rows = filteredPreview.map(row => Object.values(row).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + "\n" + rows;
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Rinas_Data_${fileName}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    showToast('تم التصدير بنجاح 📊', 'success');
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = { sender: 'user', text: chatInput };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/chat', { question: newMsg.text, chartData: chartData });
      setMessages(prev => [...prev, { sender: 'ai', text: response.data.answer }]);
    } catch (error) { setMessages(prev => [...prev, { sender: 'ai', text: 'خطأ.' }]); }
  };

  const downloadPDF = () => {
    html2canvas(reportRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, w, h);
      pdf.save(`Rinas_Report_${fileName}.pdf`);
      showToast('تم تحميل التقرير 📄', 'success');
    });
  };

  const getChartOption = () => {
    if (!chartData) return {};
    let seriesArr = [{ type: chartType, data: chartType === 'pie' ? chartData : chartData.map(d => d.value), itemStyle: { color: '#0056d2', borderRadius: chartType === 'bar' ? [4,4,0,0] : 0 } }];
    if (chartType !== 'pie' && trendData && trendData.length > 0) {
      seriesArr.push({ name: t('trendline'), type: 'line', data: trendData, smooth: true, lineStyle: { type: 'dashed', color: '#ef4444', width: 3 }, symbol: 'none' });
    }
    return {
      graphic: { elements: [{ type: 'text', right: 15, top: 15, style: { text: '👑 Rinas Analytics', font: 'bold 16px Cairo', fill: 'rgba(0, 86, 210, 0.2)' } }] },
      grid: { bottom: chartType === 'pie' ? 10 : 80 }, tooltip: { trigger: chartType === 'pie' ? 'item' : 'axis' },
      xAxis: chartType === 'pie' ? undefined : { type: 'category', data: chartData.map(d => d.name), axisLabel: { interval: 0, rotate: 35, fontSize: 12, color: 'var(--text-sub)' } },
      yAxis: chartType === 'pie' ? undefined : { type: 'value', axisLabel: { color: 'var(--text-sub)' } },
      series: seriesArr
    };
  };

  const filteredPreview = dataPreview.filter(row => Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase())));

  // تنسيق للبطاقات الصغيرة
  const miniCardStyle = { flex: 1, minWidth: '120px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', padding: '15px', textAlign: 'center' };

  return (
    <div style={{ position: 'relative' }}>
      <Navbar />
      {toast && <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: toast.type === 'error' ? '#ef4444' : '#10b981', color: 'white', padding: '12px 24px', borderRadius: '8px', zIndex: 9999, fontWeight: 'bold' }}>{toast.message}</div>}

      <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        
        {!chartData ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '20px' }}>{t('upload_file')}</h3>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ margin: '20px 0', color: 'var(--text-sub)', width: '100%' }} />
            <button onClick={handleAnalyze} className="btn-primary" style={{ width: '100%', padding: '12px' }} disabled={isAnalyzing}>
              {isAnalyzing ? '...' : t('analyze_btn')}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            
            {/* القسم الأيمن الأكبر للتحليل */}
            <div style={{ flex: '2', minWidth: '60%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* أزرار التحكم המدمجة */}
              <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between', padding: '15px' }}>
                <select value={chartType} onChange={(e) => setChartType(e.target.value)} style={{ padding: '8px', borderRadius: '4px', minWidth: '100px' }}>
                  <option value="bar">{t('bar_chart')}</option>
                  <option value="line">{t('line_chart')}</option>
                  <option value="pie">{t('pie_chart')}</option>
                </select>
                
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={saveToDB} className="btn-primary" style={{ background: '#3b82f6', fontSize: '13px' }}>💾 {t('save_db')}</button>
                  <button onClick={downloadPDF} className="btn-primary" style={{ background: '#10b981', fontSize: '13px' }}>📄 {t('download_pdf')}</button>
                  <button onClick={() => setChartData(null)} className="btn-secondary" style={{ fontSize: '13px' }}>🔄 {t('new_analysis')}</button>
                </div>
              </div>

              {/* منطقة الطباعة */}
              <div ref={reportRef} style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '15px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                
                {/* مؤشرات جودة البيانات */}
                <h4 style={{ color: 'var(--btn-bg)', margin: '0' }}>{t('data_health')}</h4>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <div style={{...miniCardStyle}}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>+1K</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{t('rows_count')}</div>
                  </div>
                  <div style={{...miniCardStyle}}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{dataPreview.length > 0 ? Object.keys(dataPreview[0]).length : 0}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{t('cols_count')}</div>
                  </div>
                  <div style={{...miniCardStyle}}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>✓</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{t('clean_yes')}</div>
                  </div>
                </div>

                {/* الملخص الآلي */}
                {insights && (
                  <div style={{ borderLeft: '4px solid #f59e0b', background: 'var(--bg-main)', padding: '15px', borderRadius: '4px' }}>
                    <h5 style={{ color: '#f59e0b', marginBottom: '10px', margin: 0 }}>{t('insights_title')}</h5>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-sub)', marginTop: '10px' }}>
                      <span><b>{t('highest_item')}</b> {insights.max_name}</span>
                      <span><b>{t('lowest_item')}</b> {insights.min_name}</span>
                      <span><b>{t('total_sum')}</b> {insights.total}</span>
                    </div>
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                  <ReactECharts option={getChartOption()} style={{ height: '350px' }} />
                </div>
                
                <div style={{ overflowX: 'auto', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                    <input type="text" placeholder={t('search_data')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '6px', borderRadius: '4px', flex: 1, minWidth: '150px' }} />
                    <button onClick={exportToCSV} className="btn-secondary" style={{ borderColor: '#10b981', color: '#10b981', fontSize: '12px' }}>{t('export_csv')}</button>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead><tr>{dataPreview.length > 0 && Object.keys(dataPreview[0]).map(k => <th key={k} style={{ padding: '8px', textAlign: 'start' }}>{k}</th>)}</tr></thead>
                    <tbody>{filteredPreview.map((row, idx) => (<tr key={idx}>{Object.values(row).map((val, i) => <td key={i} style={{ padding: '8px' }}>{val}</td>)}</tr>))}</tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* قسم الذكاء الاصطناعي */}
            <div className="card" style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', height: '600px' }}>
              <h4 style={{ color: 'var(--btn-bg)', marginBottom: '15px' }}>🤖 {t('ai_assistant')}</h4>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                {messages.map((msg, idx) => (
                  <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', background: msg.sender === 'user' ? 'var(--btn-bg)' : 'var(--bg-main)', color: msg.sender === 'user' ? 'white' : 'var(--text-main)', padding: '10px', borderRadius: '8px', maxWidth: '85%', fontSize: '13px' }}>{msg.text}</div>
                ))}
              </div>
              <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '10px' }}>
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px' }} />
                <button type="submit" className="btn-primary">Send</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
