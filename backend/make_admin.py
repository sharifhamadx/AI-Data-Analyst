import sqlite3
from werkzeug.security import generate_password_hash

conn = sqlite3.connect('rinas_data.db')
c = conn.cursor()
email = 'sharifhamadx122@gmail.com'
password = generate_password_hash('Moko122a@')

c.execute("SELECT id FROM users WHERE email=?", (email,))
if c.fetchone():
    c.execute("UPDATE users SET password=?, role='admin' WHERE email=?", (password, email))
else:
    c.execute("INSERT INTO users (name, email, password, role) VALUES ('شريف حماد (المدير)', ?, ?, 'admin')", (email, password))

conn.commit()
conn.close()
print("تم اعتماد الحساب الجديد كمدير بنجاح! 👑")
