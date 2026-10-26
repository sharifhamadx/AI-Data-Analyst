import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import ReactECharts from 'echarts-for-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function History() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const reportRef = useRef(null);

  const fetchHistory = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        navigate('/login');
        return;
      }
      const user = JSON.parse(userStr);
      const res = await axios.get(`http://127.0.0.1:5000/api/history/${user.id}`);
      setHistory(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleDelete = async (id) => {
    if(window.confirm('هل أنت متأكد من الحذف؟')) {
      await axios.delete(`http://127.0.0.1:5000/api/history/${id}`);
      fetchHistory();
    }
  };

  const downloadPDF = () => {
    const input = reportRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Rinas_Report_${selectedReport.file_name}.pdf`);
    });
  };

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        <h2 style={{ color: '#0056d2', marginBottom: '20px' }}>{t('history')}</h2>
        
        {history.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>لا يوجد تحليلات محفوظة بعد.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {history.map(item => (
              <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
                <h4 style={{ color: '#1f2937', marginBottom: '5px' }}>{item.file_name}</h4>
                <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '15px' }}>{item.date}</p>
                <ReactECharts option={{ xAxis: { type: 'category', data: item.chart_data.map(d=>d.name), show: false }, yAxis: { show: false }, series: [{ type: 'bar', data: item.chart_data.map(d=>d.value), itemStyle: { color: '#0056d2' } }] }} style={{ height: '120px', marginBottom: '20px' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setSelectedReport(item)} className="btn-primary" style={{ flex: 1 }}>{t('open_report')}</button>
                  <button onClick={() => handleDelete(item.id)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', flex: 1, cursor: 'pointer' }}>{t('delete')}</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedReport && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: '#f5f7f8', width: '100%', maxWidth: '900px', maxHeight: '90vh', borderRadius: '8px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '20px', background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
                <h3 style={{ margin: 0 }}>{selectedReport.file_name}</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={downloadPDF} className="btn-primary" style={{ background: '#10b981' }}>{t('print')}</button>
                  <button onClick={() => setSelectedReport(null)} className="btn-secondary" style={{ borderColor: '#ef4444', color: '#ef4444' }}>{t('close')}</button>
                </div>
              </div>
              <div ref={reportRef} style={{ padding: '20px', background: 'white', margin: '20px', borderRadius: '8px' }}>
                <ReactECharts option={{ tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: selectedReport.chart_data.map(d=>d.name), axisLabel: { interval: 0, rotate: 30 } }, yAxis: { type: 'value' }, series: [{ type: 'bar', data: selectedReport.chart_data.map(d=>d.value), itemStyle: { color: '#0056d2' } }] }} style={{ height: '350px' }} />
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '13px' }}>
                  <thead><tr style={{ background: '#f3f4f6' }}>{selectedReport.preview_data[0] && Object.keys(selectedReport.preview_data[0]).map(k => <th key={k} style={{ padding: '10px', textAlign: 'start' }}>{k}</th>)}</tr></thead>
                  <tbody>{selectedReport.preview_data.map((row, idx) => <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>{Object.values(row).map((val, i) => <td key={i} style={{ padding: '10px' }}>{val}</td>)}</tr>)}</tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
