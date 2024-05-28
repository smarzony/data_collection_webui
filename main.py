from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://automatycy:712394@/current_measure_deb?unix_socket=/run/mysqld/mysqld.sock'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Definicja modelu
class AcquiredDataBackup(db.Model):
    __tablename__ = 'acquired_data'
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.DateTime, nullable=False)
    mac = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(100), nullable=True)
    l1_value = db.Column(db.Float, nullable=False)
    l2_value = db.Column(db.Float, nullable=False)
    l3_value = db.Column(db.Float, nullable=False)

def get_unique_mac_addresses():
    return db.session.query(AcquiredDataBackup.mac).distinct().all()

# Pobierz listę unikalnych adresów MAC wraz z lokalizacjami
def get_unique_mac_addresses_with_locations():
    return db.session.query(AcquiredDataBackup.mac, AcquiredDataBackup.location).distinct().all()

@app.route('/')
def home():
    unique_mac_addresses_with_locations = get_unique_mac_addresses_with_locations()
    return render_template('index.html', unique_mac_addresses_with_locations=unique_mac_addresses_with_locations)

@app.route('/fetch_data')
def fetch_data():
    num_records = request.args.get('num_records', default=5, type=int)
    mac_address = request.args.get('mac_address')
    location = request.args.get('location')

    # Pobierz dane z bazy danych zgodnie z przekazanymi parametrami
    if mac_address and location:
        data = AcquiredDataBackup.query.filter_by(mac=mac_address, location=location).order_by(AcquiredDataBackup.id.desc()).limit(num_records).all()
    elif mac_address:
        data = AcquiredDataBackup.query.filter_by(mac=mac_address).order_by(AcquiredDataBackup.id.desc()).limit(num_records).all()
    elif location:
        data = AcquiredDataBackup.query.filter_by(location=location).order_by(AcquiredDataBackup.id.desc()).limit(num_records).all()
    else:
        data = AcquiredDataBackup.query.order_by(AcquiredDataBackup.id.desc()).limit(num_records).all()

    # Przekształć dane na format JSON i zwróć jako odpowiedź
    return jsonify([{
        'time': entry.time.strftime('%Y-%m-%d %H:%M:%S'),
        'mac': entry.mac,
        'location': entry.location,
        'l1_value': entry.l1_value,
        'l2_value': entry.l2_value,
        'l3_value': entry.l3_value
    } for entry in data])

if __name__ == '__main__':
    app.run(debug=True)