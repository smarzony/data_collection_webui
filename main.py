from flask import Flask, render_template, jsonify, request, redirect, url_for
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

def get_devices_and_locations():
    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT MAC FROM devices')   
    devices = cursor.fetchall()    
    cursor.execute('SELECT NAME FROM locations')
    locations = cursor.fetchall()
    
    cursor.close()
    connection.close()
    return devices, locations


@app.route('/get_mac_and_locations')
def get_mac_and_locations():
    results = get_unique_mac_addresses_with_locations()
    macs = [result['mac'] for result in results]
    locations = [result['location'] for result in results]

    return jsonify({'macs': list(set(macs)), 'locations': list(set(locations))})

@app.route('/update', methods=['POST'])
def update_location():
    mac = request.form['mac']
    location = request.form['location']
    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    query = ('UPDATE devices SET LOCATION = %s WHERE MAC = %s')
    cursor.execute(query, (location, mac))
    connection.commit()
    cursor.close()
    connection.close()
    return redirect(url_for('home'))

@app.route('/')
def home():
    unique_mac_addresses_with_locations = get_unique_mac_addresses_with_locations()
    devices, locations = get_devices_and_locations()
    return render_template('index.html', unique_mac_addresses_with_locations=unique_mac_addresses_with_locations, devices=devices, locations=locations)

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

    # Zaokrąglanie wartości L1_VALUE, L2_VALUE, L3_VALUE do liczb całkowitych
    for entry in data:
        entry['L1_VALUE'] = str(round(entry['L1_VALUE'])) + ' A'
        entry['L2_VALUE'] = str(round(entry['L2_VALUE'])) + ' A'
        entry['L3_VALUE'] = str(round(entry['L3_VALUE'])) + ' A'
        entry['TIME'] = entry['TIME'].strftime('%Y-%m-%d %H:%M:%S')

    return jsonify(data)

@app.route('/fetch_chart_data')
def fetch_chart_data():
    mac_address = request.args.get('mac_address')
    location = request.args.get('location')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    total_samples = 100

    print(f"Received params - MAC: {mac_address}, Location: {location}, Start: {start_date}, End: {end_date}")

    query = """
    WITH OrderedData AS (
        SELECT *, ROW_NUMBER() OVER (ORDER BY time) AS rownum
        FROM acquired_data
        WHERE MAC = %s AND LOCATION = %s AND TIME BETWEEN %s AND %s
    ), TotalRows AS (
        SELECT COUNT(*) as total_count FROM OrderedData
    )
    SELECT * FROM OrderedData, TotalRows
    WHERE OrderedData.rownum % FLOOR(total_count / %s) = 0;
    """

    params = [mac_address, location, start_date, end_date, total_samples]
    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute(query, params)
    data = cursor.fetchall()
    print(f"Query returned {len(data)} records")
    max_print = 3
    current_print = 0
    for entry in data:
        print(entry)
        current_print += 1
        if current_print >= max_print:
            break

    cursor.close()
    connection.close()

    for entry in data:
        entry['TIME'] = entry['TIME'].strftime('%Y-%m-%d %H:%M:%S')

    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)