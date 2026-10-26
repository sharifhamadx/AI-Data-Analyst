from flask import Blueprint, request, jsonify
import pandas as pd
import numpy as np
import sqlite3
import json
import datetime
import io
from pypdf import PdfReader
from werkzeug.security import generate_password_hash, check_password_hash

analysis_bp = Blueprint('analysis_bp', __name__)

def init_db():
    conn = sqlite3.connect('rinas_data.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT UNIQUE, password TEXT, role TEXT, sa1 TEXT, sa2 TEXT, sa3 TEXT, status TEXT DEFAULT 'active')''')
    c.execute('''CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, file_name TEXT, analyze_date TEXT, chart_data TEXT, preview_data TEXT)''')
    try: c.execute("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'")
    except: pass
    conn.commit()
    conn.close()

init_db()

@analysis_bp.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    name, email, password = data.get('name'), data.get('email'), data.get('password')
    sa1, sa2, sa3 = data.get('sa1', ''), data.get('sa2', ''), data.get('sa3', '')
    if not name or not email or not password: return jsonify({"error": "Missing data"}), 400
    conn = sqlite3.connect('rinas_data.db')
    c = conn.cursor()
    try:
        c.execute("SELECT id, password FROM users WHERE email=?", (email,))
        existing_user = c.fetchone()
        if existing_user:
            user_id, old_pass = existing_user
            if old_pass == '':
                c.execute("UPDATE users SET name=?, password=?, sa1=?, sa2=?, sa3=?, status='active' WHERE id=?", (name, generate_password_hash(password), sa1, sa2, sa3, user_id))
                conn.commit()
                return jsonify({"message": "Reset success", "user": {"id": user_id, "name": name, "email": email, "role": "user"}})
            else: return jsonify({"error": "البريد مسجل بالفعل"}), 400
        else:
            c.execute("INSERT INTO users (name, email, password, role, sa1, sa2, sa3, status) VALUES (?, ?, ?, 'user', ?, ?, ?, 'active')", (name, email, generate_password_hash(password), sa1, sa2, sa3))
            conn.commit()
            return jsonify({"message": "User created", "user": {"id": c.lastrowid, "name": name, "email": email, "role": "user"}})
    except Exception as e: return jsonify({"error": str(e)}), 500
    finally: conn.close()

@analysis_bp.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email, password = data.get('email'), data.get('password')
    conn = sqlite3.connect('rinas_data.db')
    c = conn.cursor()
    c.execute("SELECT id, name, email, password, role, status FROM users WHERE email=?", (email,))
    user = c.fetchone()
    conn.close()
    if user:
        if user[5] in ['banned', 'deleted']: return jsonify({"error": "حساب محظور."}), 403
        if user[3] != '' and check_password_hash(user[3], password):
            return jsonify({"message": "Login success", "user": {"id": user[0], "name": user[1], "email": user[2], "role": user[4]}})
    return jsonify({"error": "البيانات غير صحيحة"}), 401

@analysis_bp.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    email, ans1, ans2, ans3, new_pass = data.get('email'), data.get('sa1'), data.get('sa2'), data.get('sa3'), data.get('new_password')
    conn = sqlite3.connect('rinas_data.db')
    c = conn.cursor()
    c.execute("SELECT id, sa1, sa2, sa3, status FROM users WHERE email=?", (email,))
    user = c.fetchone()
    if user and user[4] in ['banned', 'deleted']: return jsonify({"error": "حساب محظور"}), 403
    if user and user[1] == ans1 and user[2] == ans2 and user[3] == ans3:
        c.execute("UPDATE users SET password=? WHERE email=?", (generate_password_hash(new_pass), email))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "تم التغيير بنجاح"})
    conn.close()
    return jsonify({"error": "خطأ في الإجابات"}), 400

@analysis_bp.route('/api/admin/users', methods=['GET'])
def get_all_users():
    conn = sqlite3.connect('rinas_data.db')
    c = conn.cursor()
    c.execute('''SELECT u.id, u.name, u.email, u.role, u.status, COUNT(h.id) FROM users u LEFT JOIN history h ON u.id = h.user_id WHERE u.role != 'admin' GROUP BY u.id''')
    users = [{"id": r[0], "name": r[1], "email": r[2], "role": r[3], "status": r[4] or 'active', "file_count": r[5]} for r in c.fetchall()]
    conn.close()
    return jsonify(users)

@analysis_bp.route('/api/admin/clear-password', methods=['POST'])
def admin_clear_password():
    conn = sqlite3.connect('rinas_data.db')
    conn.execute("UPDATE users SET password='' WHERE id=?", (request.json.get('user_id'),))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@analysis_bp.route('/api/admin/change-status', methods=['POST'])
def admin_change_status():
    conn = sqlite3.connect('rinas_data.db')
    conn.execute("UPDATE users SET status=? WHERE id=?", (request.json.get('status'), request.json.get('user_id')))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@analysis_bp.route('/api/analyze', methods=['POST'])
def analyze_file():
    if 'file' not in request.files: return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']
    filename = file.filename.lower()
    
    try:
        chart_data, preview_data, trend_data, insights = [], [], [], {}
        
        if filename.endswith('.csv'):
            df = pd.read_csv(file)
        elif filename.endswith('.xlsx') or filename.endswith('.xls'):
            df = pd.read_excel(file)
        elif filename.endswith('.pdf'):
            reader = PdfReader(file)
            extracted_text = ""
            for page in reader.pages:
                extracted_text += page.extract_text() or ""
            preview_data = [{"PDF_Content": extracted_text[:500] + "..."}]
            chart_data = [{"name": "محتوى المستند المستخرج", "value": len(extracted_text)}]
            insights = {
                "max_name": "إجمالي حروف المستند", "max_val": len(extracted_text),
                "min_name": "عدد الصفحات", "min_val": len(reader.pages),
                "avg": len(extracted_text) / max(len(reader.pages), 1), "total": len(extracted_text)
            }
            return jsonify({"preview": preview_data, "chart": chart_data, "trend": [], "insights": insights, "filename": file.filename})
        else:
            return jsonify({"error": "صيغة الملف غير مدعومة"}), 400

        preview_data = df.head(10).fillna('').to_dict(orient='records')
        string_cols = df.select_dtypes(include=['object', 'string']).columns
        numeric_cols = df.select_dtypes(include=['number']).columns
        
        if len(string_cols) > 0 and len(numeric_cols) > 0:
            grouped = df.groupby(string_cols[0])[numeric_cols[0]].sum().reset_index()
            grouped = grouped.sort_values(by=numeric_cols[0], ascending=False).head(15)
            y_values = []
            for _, row in grouped.iterrows():
                val = float(row[numeric_cols[0]])
                chart_data.append({"name": str(row[string_cols[0]]), "value": val})
                y_values.append(val)
            if len(y_values) > 1:
                x = np.arange(len(y_values))
                z = np.polyfit(x, y_values, 1)
                trend_data = np.poly1d(z)(x).tolist()
            if y_values:
                insights = {
                    "max_name": chart_data[0]['name'], "max_val": chart_data[0]['value'], 
                    "min_name": chart_data[-1]['name'], "min_val": chart_data[-1]['value'], 
                    "avg": round(sum(y_values) / len(y_values), 2), "total": sum(y_values),
                    "volatility": round(float(np.std(y_values)), 2) if len(y_values) > 1 else 0.0
                }
        return jsonify({"preview": preview_data, "chart": chart_data, "trend": trend_data, "insights": insights, "filename": file.filename})
    except Exception as e: return jsonify({"error": str(e)}), 500

# --- محلل ذكي متطور يعطي إجابات مختلفة ودقيقة حسب السؤال ---
@analysis_bp.route('/api/chat', methods=['POST'])
def chat_with_data():
    req_data = request.json
    question = req_data.get('question', '').strip().lower()
    chart_data = req_data.get('chartData', [])
    
    if not chart_data: 
        return jsonify({"answer": "الرجاء رفع ملف بيانات أولاً حتى أتمكن من إجابتك."})
        
    try:
        values = [item['value'] for item in chart_data]
        total = sum(values)
        avg = total / len(values) if values else 0
        maximum = max(chart_data, key=lambda x: x['value'])
        minimum = min(chart_data, key=lambda x: x['value'])
        
        # تحليل نوع السؤال بدقة لتوليد إجابة مخصصة
        if any(w in question for w in ['أول', 'ثان', 'مقارنة', 'مقارنه', 'إيرادات', 'ايرادات']):
            answer = f"📊 **مقارنة الإيرادات والبيانات:**\n• بناءً على الجدول، يتضح تفوق بند ({maximum['name']}) بقيمة إجمالية بلغت ({maximum['value']:,}).\n• إجمالي حجم العمليات المرصودة في نطاق المقارنة بلغ ({total:,$}).\n• يوصى بمتابعة معدلات النمو للربع القادم بناءً على هذه الأرقام."
        elif any(w in question for w in ['توصي', 'توصية', 'استثمار', 'نمو', 'مستقبل', 'توقعات']):
            answer = f"💡 **التوصية الاستثمارية الاستراتيجية:**\n1. نظراً لأن ({maximum['name']}) يمثل الأصول الأكثر ربحية وعائداً بـ ({maximum['value']:,})، يُنصح بتوجيه الحصة الكبرى من السيولة له.\n2. البند الأقل أداءً ({minimum['name']}) يحتاج إلى إعادة هيكلة.\n3. المؤشر العام مستقر بمتوسط ({round(avg, 2):,})."
        elif any(w in question for w in ['أعلى', 'اعلى', 'أكبر', 'اكبر', 'highest', 'max']):
            answer = f"📈 العنصر الأعلى أداءً على الإطلاق هو ({maximum['name']}) بقيمة قياسية تبلغ ({maximum['value']:,})."
        elif any(w in question for w in ['أقل', 'اقل', 'أصغر', 'اصغر', 'lowest', 'min']):
            answer = f"📉 العنصر الأدنى في القائمة هو ({minimum['name']}) بقيمة تسجل ({minimum['value']:,})."
        else:
            answer = f"🤖 **تحليل استفسارك ('{question}'):**\n• عدد العناصر المحللة في الملف: {len(chart_data)} مؤشرات.\n• القيمة الكبرى مسجلة لصالح ({maximum['name']}) بـ {maximum['value']:,}.\n• المتوسط العام للأداء هو {round(avg, 2):,}.\n(يمكنك سؤالي عن: المقارنة، التوصيات الاستثمارية، الأعلى، أو الأقل)."
            
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"answer": f"حدث خطأ أثناء صياغة الرد الذكي: {str(e)}"})

@analysis_bp.route('/api/save', methods=['POST'])
def save_analysis():
    data = request.json
    conn = sqlite3.connect('rinas_data.db')
    conn.execute("INSERT INTO history (user_id, file_name, analyze_date, chart_data, preview_data) VALUES (?, ?, ?, ?, ?)", (data.get('user_id'), data.get('filename'), datetime.datetime.now().strftime("%Y-%m-%d %H:%M"), json.dumps(data.get('chart_data')), json.dumps(data.get('preview_data'))))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@analysis_bp.route('/api/history/<int:user_id>', methods=['GET'])
def get_history(user_id):
    conn = sqlite3.connect('rinas_data.db')
    c = conn.cursor()
    c.execute("SELECT id, file_name, analyze_date, chart_data, preview_data FROM history WHERE user_id=? ORDER BY id DESC", (user_id,))
    rows = c.fetchall()
    conn.close()
    return jsonify([{"id": r[0], "file_name": r[1], "date": r[2], "chart_data": json.loads(r[3]), "preview_data": json.loads(r[4] if r[4] else "[]")} for r in rows])

@analysis_bp.route('/api/history/<int:id>', methods=['DELETE'])
def delete_history(id):
    conn = sqlite3.connect('rinas_data.db')
    conn.execute("DELETE FROM history WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})
