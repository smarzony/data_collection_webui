from flask import Flask, render_template, jsonify, request
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)

def create_db_connection():
    connection = None
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='automatycy',
            password='712394',
            database='current_measure_deb',
            unix_socket='/run/mysqld/mysqld.sock'
        )
    except Error as e:
        print(f"The error '{e}' occurred")
    return connection

def get_unique_mac_addresses_with_locations():
    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT DISTINCT mac, location FROM acquired_data")
    result = cursor.fetchall()
    print('unique macs: ', result)
    cursor.close()
    connection.close()
    return result

@app.route('/')
def home():
    unique_mac_addresses_with_locations = get_unique_mac_addresses_with_locations()
    return render_template('index.html', unique_mac_addresses_with_locations=unique_mac_addresses_with_locations)

@app.route('/fetch_data')
def fetch_data():
    num_records = request.args.get('num_records', default=10, type=int)
    mac_address = request.args.get('mac_address')
    location = request.args.get('location')

    query = "SELECT * FROM acquired_data"
    filters = []
    params = []

    if mac_address:
        filters.append("mac = %s")
        params.append(mac_address)
    if location:
        filters.append("location = %s")
        params.append(location)

    if filters:
        query += " WHERE " + " AND ".join(filters)
    
    query += " ORDER BY id DESC LIMIT %s"
    params.append(num_records)

    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute(query, params)
    data = cursor.fetchall()
    # print('data: ', data)
    cursor.close()
    connection.close()

    for entry in data:
        entry['TIME'] = entry['TIME'].strftime('%Y-%m-%d %H:%M:%S')

    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)