from flask import Flask, request, jsonify
from flask_cors import CORS
import hashlib
from db import create_connection, init_db
import os

app = Flask(__name__)
CORS(app)

# Initialize database
init_db()

# Hardcoded admin credentials
ADMIN_USERNAME = "nithin"
ADMIN_PASSWORD = "123456789"

# Helper function to hash passwords
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Authentication Routes
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')  # Get the role from the request
    
    # Check for hardcoded admin credentials only if role is Admin
    if role == 'Admin' and username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        return jsonify({
            'login_id': -1,  # Special ID for hardcoded admin
            'username': username,
            'role': 'Admin'
        }), 200
    
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        hashed_password = hash_password(password)
        query = "SELECT * FROM Login WHERE username = %s AND password = %s"
        if role:
            query = "SELECT * FROM Login WHERE username = %s AND password = %s AND role = %s"
            cursor.execute(query, (username, hashed_password, role))
        else:
            cursor.execute(query, (username, hashed_password))
        user = cursor.fetchone()
        
        if user:
            return jsonify({
                'login_id': user['login_id'],
                'username': user['username'],
                'role': user['role']
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/register/user', methods=['POST'])
def register_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    phone_number1 = data.get('phone_number1')
    phone_number2 = data.get('phone_number2')
    
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        # Check if username already exists
        cursor.execute("SELECT * FROM Login WHERE username = %s", (username,))
        if cursor.fetchone():
            return jsonify({'error': 'Username already exists'}), 400
        
        # Create login entry
        hashed_password = hash_password(password)
        login_query = "INSERT INTO Login (username, password, role) VALUES (%s, %s, 'User')"
        cursor.execute(login_query, (username, hashed_password))
        login_id = cursor.lastrowid
        
        # Create user entry
        user_query = """INSERT INTO User (first_name, last_name, email, phone_number1, phone_number2, login_id) 
                        VALUES (%s, %s, %s, %s, %s, %s)"""
        cursor.execute(user_query, (first_name, last_name, email, phone_number1, phone_number2, login_id))
        
        connection.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/register/worker', methods=['POST'])
def register_worker():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    address = data.get('address')
    city = data.get('city')
    pincode = data.get('pincode')
    door_no = data.get('door_no')
    street_name = data.get('street_name')
    area = data.get('area')
    experience_years = data.get('experience_years')
    phone_number1 = data.get('phone_number1')
    phone_number2 = data.get('phone_number2')
    skill_ids = data.get('skill_ids', [])  # New field for worker skills
    
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        # Check if username already exists
        cursor.execute("SELECT * FROM Login WHERE username = %s", (username,))
        if cursor.fetchone():
            return jsonify({'error': 'Username already exists'}), 400
        
        # Create login entry
        hashed_password = hash_password(password)
        login_query = "INSERT INTO Login (username, password, role) VALUES (%s, %s, 'Worker')"
        cursor.execute(login_query, (username, hashed_password))
        login_id = cursor.lastrowid
        
        # Create worker entry
        worker_query = """INSERT INTO Skill_Worker (first_name, last_name, address, city, pincode, door_no, 
                          street_name, area, experience_years, phone_number1, phone_number2, login_id) 
                          VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        cursor.execute(worker_query, (first_name, last_name, address, city, pincode, door_no, 
                                      street_name, area, experience_years, phone_number1, phone_number2, login_id))
        worker_id = cursor.lastrowid
        
        # Insert worker skills
        if skill_ids:
            for skill_id in skill_ids:
                skill_query = "INSERT INTO Worker_Skills (worker_id, skill_type_id) VALUES (%s, %s)"
                cursor.execute(skill_query, (worker_id, skill_id))
        
        connection.commit()
        return jsonify({'message': 'Worker registered successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# User Routes
@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        query = "SELECT * FROM User WHERE user_id = %s"
        cursor.execute(query, (user_id,))
        user = cursor.fetchone()
        
        if user:
            return jsonify(user), 200
        else:
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# Worker Routes
@app.route('/api/workers/<int:worker_id>', methods=['GET'])
def get_worker(worker_id):
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        # First, get the login record to verify it's a worker
        login_query = "SELECT * FROM Login WHERE login_id = %s AND role = 'Worker'"
        cursor.execute(login_query, (worker_id,))
        login = cursor.fetchone()
        
        if not login:
            return jsonify({'error': 'Worker not found'}), 404
        
        # Then get the worker details
        worker_query = "SELECT * FROM Skill_Worker WHERE login_id = %s"
        cursor.execute(worker_query, (worker_id,))
        worker = cursor.fetchone()
        
        if worker:
            return jsonify(worker), 200
        else:
            return jsonify({'error': 'Worker details not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/workers/<int:worker_id>/skills', methods=['GET'])
def get_worker_skills(worker_id):
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        # First, verify the login record exists and is for a worker
        login_query = "SELECT * FROM Login WHERE login_id = %s AND role = 'Worker'"
        cursor.execute(login_query, (worker_id,))
        login = cursor.fetchone()
        
        if not login:
            return jsonify({'error': 'Worker not found'}), 404
        
        query = """SELECT st.skill_type_id, st.skill_name FROM Worker_Skills ws
                   JOIN Skill_Type st ON ws.skill_type_id = st.skill_type_id
                   WHERE ws.worker_id = (SELECT worker_id FROM Skill_Worker WHERE login_id = %s)"""
        cursor.execute(query, (worker_id,))
        skills = cursor.fetchall()
        return jsonify(skills), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/workers/<int:worker_id>/availability', methods=['POST'])
def update_availability(worker_id):
    data = request.get_json()
    # New fields for time slots
    morning_start = data.get('morning_start', '09:30')
    morning_end = data.get('morning_end', '12:00')
    afternoon_start = data.get('afternoon_start', '13:00')
    afternoon_end = data.get('afternoon_end', '18:00')
    
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        # Check if worker exists by login_id
        cursor.execute("SELECT worker_id FROM Skill_Worker WHERE login_id = %s", (worker_id,))
        worker_result = cursor.fetchone()
        if not worker_result:
            return jsonify({'error': 'Worker not found'}), 404
        
        worker_db_id = worker_result['worker_id']
        
        # Insert availability with time slots
        query = """INSERT INTO Worker_Availability (worker_id, request_details) VALUES (%s, %s)"""
        request_details = f"Available: Morning {morning_start}-{morning_end}, Afternoon {afternoon_start}-{afternoon_end}"
        cursor.execute(query, (worker_db_id, request_details))
        
        connection.commit()
        return jsonify({'message': 'Availability updated successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# Skill Type Routes
@app.route('/api/skill-types', methods=['GET'])
def get_skill_types():
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        cursor.execute("SELECT * FROM Skill_Type")
        skill_types = cursor.fetchall()
        return jsonify(skill_types), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/skill-types', methods=['POST'])
def add_skill_type():
    data = request.get_json()
    skill_name = data.get('skill_name')
    
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        query = "INSERT INTO Skill_Type (skill_name) VALUES (%s)"
        cursor.execute(query, (skill_name,))
        
        connection.commit()
        return jsonify({'message': 'Skill type added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/skill-types/<int:skill_type_id>', methods=['PUT'])
def update_skill_type(skill_type_id):
    data = request.get_json()
    skill_name = data.get('skill_name')
    
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        query = "UPDATE Skill_Type SET skill_name = %s WHERE skill_type_id = %s"
        cursor.execute(query, (skill_name, skill_type_id))
        
        if cursor.rowcount > 0:
            connection.commit()
            return jsonify({'message': 'Skill type updated successfully'}), 200
        else:
            return jsonify({'error': 'Skill type not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/skill-types/<int:skill_type_id>', methods=['DELETE'])
def delete_skill_type(skill_type_id):
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        query = "DELETE FROM Skill_Type WHERE skill_type_id = %s"
        cursor.execute(query, (skill_type_id,))
        
        if cursor.rowcount > 0:
            connection.commit()
            return jsonify({'message': 'Skill type deleted successfully'}), 200
        else:
            return jsonify({'error': 'Skill type not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# Work Request Routes
@app.route('/api/work-requests', methods=['POST'])
def create_work_request():
    data = request.get_json()
    user_id = data.get('user_id')
    skill_type_id = data.get('skill_type_id')
    description = data.get('description')
    request_date = data.get('request_date')
    location = data.get('location')
    city = data.get('city')
    pincode = data.get('pincode')
    door_no = data.get('door_no')
    street_name = data.get('street_name')
    area = data.get('area')
    
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        query = """INSERT INTO Work_Request (user_id, skill_type_id, description, request_date, location, city, 
                    pincode, door_no, street_name, area, worker_arrival_time, user_confirmation_status) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NULL, 'Pending')"""
        cursor.execute(query, (user_id, skill_type_id, description, request_date, location, city, 
                               pincode, door_no, street_name, area))
        
        connection.commit()
        return jsonify({'message': 'Work request created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/work-requests/user/<int:user_id>', methods=['GET'])
def get_user_work_requests(user_id):
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        query = """SELECT wr.*, st.skill_name, 
                          sw.first_name as worker_first_name, 
                          sw.last_name as worker_last_name 
                   FROM Work_Request wr 
                   JOIN Skill_Type st ON wr.skill_type_id = st.skill_type_id 
                   LEFT JOIN Skill_Worker sw ON wr.worker_id = sw.worker_id
                   WHERE wr.user_id = %s ORDER BY wr.request_date DESC"""
        cursor.execute(query, (user_id,))
        work_requests = cursor.fetchall()
        return jsonify(work_requests), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# Notification Routes
@app.route('/api/notifications/user/<int:user_id>', methods=['GET'])
def get_user_notifications(user_id):
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        query = """SELECT n.*, wr.request_id, st.skill_name FROM Notification n
                   JOIN Work_Request wr ON n.request_id = wr.request_id
                   JOIN Skill_Type st ON wr.skill_type_id = st.skill_type_id
                   WHERE wr.user_id = %s ORDER BY n.date DESC"""
        cursor.execute(query, (user_id,))
        notifications = cursor.fetchall()
        return jsonify(notifications), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/notifications/worker/<int:worker_id>', methods=['GET'])
def get_worker_notifications(worker_id):
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        # First, verify the login record exists and is for a worker
        login_query = "SELECT * FROM Login WHERE login_id = %s AND role = 'Worker'"
        cursor.execute(login_query, (worker_id,))
        login = cursor.fetchone()
        
        if not login:
            return jsonify({'error': 'Worker not found'}), 404
        
        query = """SELECT n.*, wr.request_id, st.skill_name FROM Notification n
                   JOIN Work_Request wr ON n.request_id = wr.request_id
                   JOIN Skill_Type st ON wr.skill_type_id = st.skill_type_id
                   WHERE wr.worker_id = (SELECT worker_id FROM Skill_Worker WHERE login_id = %s) 
                   ORDER BY n.date DESC"""
        cursor.execute(query, (worker_id,))
        notifications = cursor.fetchall()
        return jsonify(notifications), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/notifications/admin', methods=['GET'])
def get_admin_notifications():
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        query = """SELECT n.*, wr.request_id, st.skill_name, u.first_name as user_first_name, 
                   u.last_name as user_last_name FROM Notification n
                   JOIN Work_Request wr ON n.request_id = wr.request_id
                   JOIN Skill_Type st ON wr.skill_type_id = st.skill_type_id
                   JOIN User u ON wr.user_id = u.user_id
                   ORDER BY n.date DESC"""
        cursor.execute(query)
        notifications = cursor.fetchall()
        return jsonify(notifications), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/notifications/<int:notification_id>/read', methods=['PUT'])
def mark_notification_as_read(notification_id):
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        query = "UPDATE Notification SET status = 'Read' WHERE notification_id = %s"
        cursor.execute(query, (notification_id,))
        connection.commit()
        
        if cursor.rowcount > 0:
            return jsonify({'message': 'Notification marked as read'}), 200
        else:
            return jsonify({'error': 'Notification not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# Feedback Routes
@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    data = request.get_json()
    request_id = data.get('request_id')
    comments = data.get('comments')
    rating = data.get('rating')
    
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        query = "INSERT INTO Feedback (request_id, comments, rating) VALUES (%s, %s, %s)"
        cursor.execute(query, (request_id, comments, rating))
        connection.commit()
        return jsonify({'message': 'Feedback submitted successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/feedback/request/<int:request_id>', methods=['GET'])
def get_feedback_for_request(request_id):
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        query = "SELECT * FROM Feedback WHERE request_id = %s"
        cursor.execute(query, (request_id,))
        feedback = cursor.fetchone()
        return jsonify(feedback), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/feedback/admin', methods=['GET'])
def get_all_feedback():
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        query = """SELECT f.*, wr.request_id, st.skill_name, u.first_name as user_name 
                   FROM Feedback f
                   JOIN Work_Request wr ON f.request_id = wr.request_id
                   JOIN Skill_Type st ON wr.skill_type_id = st.skill_type_id
                   JOIN User u ON wr.user_id = u.user_id
                   ORDER BY f.feedback_id DESC"""
        cursor.execute(query)
        feedbacks = cursor.fetchall()
        return jsonify(feedbacks), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/feedback/worker/<int:worker_id>', methods=['GET'])
def get_worker_feedback(worker_id):
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        # First, verify the login record exists and is for a worker
        login_query = "SELECT * FROM Login WHERE login_id = %s AND role = 'Worker'"
        cursor.execute(login_query, (worker_id,))
        login = cursor.fetchone()
        
        if not login:
            return jsonify({'error': 'Worker not found'}), 404
        
        query = """SELECT f.*, wr.request_id, st.skill_name, u.first_name as user_first_name, 
                   u.last_name as user_last_name
                   FROM Feedback f
                   JOIN Work_Request wr ON f.request_id = wr.request_id
                   JOIN Skill_Type st ON wr.skill_type_id = st.skill_type_id
                   JOIN User u ON wr.user_id = u.user_id
                   JOIN Skill_Worker sw ON wr.worker_id = sw.worker_id
                   WHERE sw.login_id = %s
                   ORDER BY f.feedback_id DESC"""
        cursor.execute(query, (worker_id,))
        feedbacks = cursor.fetchall()
        return jsonify(feedbacks), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/work-requests/<int:request_id>/accept', methods=['POST'])
def accept_work_request(request_id):
    data = request.get_json()
    worker_id = data.get('workerId')
    time_slot = data.get('timeSlot')  # New field for time slot
    arrival_time = data.get('arrivalTime')  # New field for arrival time
    
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        # First, verify the login record exists and is for a worker
        login_query = "SELECT * FROM Login WHERE login_id = %s AND role = 'Worker'"
        cursor.execute(login_query, (worker_id,))
        login = cursor.fetchone()
        
        if not login:
            return jsonify({'error': 'Worker not found'}), 404
        
        # Check if the work request exists and is available
        request_query = "SELECT * FROM Work_Request WHERE request_id = %s AND status = 'Pending' AND worker_id IS NULL"
        cursor.execute(request_query, (request_id,))
        work_request = cursor.fetchone()
        
        if not work_request:
            return jsonify({'error': 'Work request not found or already assigned'}), 404
        
        # Check if the worker has the required skill for this request
        skill_check_query = """SELECT * FROM Worker_Skills ws
                              JOIN Skill_Worker sw ON ws.worker_id = sw.worker_id
                              WHERE sw.login_id = %s AND ws.skill_type_id = %s"""
        cursor.execute(skill_check_query, (worker_id, work_request['skill_type_id']))
        skill_match = cursor.fetchone()
        
        if not skill_match:
            return jsonify({'error': 'Worker does not have the required skill for this request'}), 400
        
        # Assign the work request to the worker and set arrival time
        assign_query = "UPDATE Work_Request SET worker_id = (SELECT worker_id FROM Skill_Worker WHERE login_id = %s), status = 'Accepted', worker_arrival_time = %s WHERE request_id = %s"
        cursor.execute(assign_query, (worker_id, arrival_time, request_id))
        
        # Get worker details for notification
        worker_query = "SELECT * FROM Skill_Worker WHERE login_id = %s"
        cursor.execute(worker_query, (worker_id,))
        worker_details = cursor.fetchone()
        
        # Create a notification for the user with time slot, arrival time, and worker phone number
        time_slot_info = f"Time Slot: {time_slot}" if time_slot else "Time Slot: To be confirmed"
        arrival_time_info = f"Arrival Time: {arrival_time}" if arrival_time else "Arrival Time: To be confirmed"
        phone_info = f"Worker Phone: {worker_details['phone_number1']}" if worker_details else "Worker Phone: Not available"
        
        notification_message = f"Your work request for '{work_request['description'][:50]}...' has been accepted. {time_slot_info}. {arrival_time_info}. {phone_info}. Please confirm arrival time."
        notification_query = """INSERT INTO Notification (message, date, status, request_id) 
                               VALUES (%s, CURDATE(), 'Unread', %s)"""
        cursor.execute(notification_query, (notification_message, request_id))
        
        connection.commit()
        return jsonify({'message': 'Work request accepted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/work-requests/<int:request_id>/decline', methods=['POST'])
def decline_work_request(request_id):
    data = request.get_json()
    worker_id = data.get('workerId')
    
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        # First, verify the login record exists and is for a worker
        login_query = "SELECT * FROM Login WHERE login_id = %s AND role = 'Worker'"
        cursor.execute(login_query, (worker_id,))
        login = cursor.fetchone()
        
        if not login:
            return jsonify({'error': 'Worker not found'}), 404
        
        # Check if the work request exists and is assigned to this worker
        request_query = "SELECT * FROM Work_Request WHERE request_id = %s AND worker_id = (SELECT worker_id FROM Skill_Worker WHERE login_id = %s) AND status = 'Accepted'"
        cursor.execute(request_query, (request_id, worker_id))
        work_request = cursor.fetchone()
        
        if not work_request:
            return jsonify({'error': 'Work request not found or not assigned to this worker'}), 404
        
        # Decline the work request (set worker_id to NULL and status back to Pending)
        decline_query = "UPDATE Work_Request SET worker_id = NULL, status = 'Pending' WHERE request_id = %s"
        cursor.execute(decline_query, (request_id,))
        
        # Get worker details for notification
        worker_query = "SELECT * FROM Skill_Worker WHERE login_id = %s"
        cursor.execute(worker_query, (worker_id,))
        worker_details = cursor.fetchone()
        
        # Create a notification for the user
        worker_name = f"{worker_details['first_name']} {worker_details['last_name']}" if worker_details else "a worker"
        notification_message = f"Your work request for '{work_request['description'][:50]}...' has been declined by {worker_name}. The request is now available for other workers."
        notification_query = """INSERT INTO Notification (message, date, status, request_id) 
                               VALUES (%s, CURDATE(), 'Unread', %s)"""
        cursor.execute(notification_query, (notification_message, request_id))
        
        connection.commit()
        return jsonify({'message': 'Work request declined successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/work-requests/<int:request_id>/complete', methods=['POST'])
def complete_work_request(request_id):
    data = request.get_json()
    worker_id = data.get('workerId')
    amount = data.get('amount')
    
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        # First, verify the login record exists and is for a worker
        login_query = "SELECT * FROM Login WHERE login_id = %s AND role = 'Worker'"
        cursor.execute(login_query, (worker_id,))
        login = cursor.fetchone()
        
        if not login:
            return jsonify({'error': 'Worker not found'}), 404
        
        # Check if the work request exists and is assigned to this worker
        request_query = "SELECT * FROM Work_Request WHERE request_id = %s AND worker_id = (SELECT worker_id FROM Skill_Worker WHERE login_id = %s) AND status = 'Accepted'"
        cursor.execute(request_query, (request_id, worker_id))
        work_request = cursor.fetchone()
        
        if not work_request:
            return jsonify({'error': 'Work request not found or not assigned to this worker'}), 404
        
        # Complete the work request (set status to Completed and add amount)
        complete_query = "UPDATE Work_Request SET status = 'Completed', amount = %s, completed_date = CURDATE() WHERE request_id = %s"
        cursor.execute(complete_query, (amount, request_id))
        
        # Get worker details for notification
        worker_query = "SELECT * FROM Skill_Worker WHERE login_id = %s"
        cursor.execute(worker_query, (worker_id,))
        worker_details = cursor.fetchone()
        
        # Create a notification for the user
        worker_name = f"{worker_details['first_name']} {worker_details['last_name']}" if worker_details else "a worker"
        amount_info = f"Amount: ₹{amount}" if amount else "Amount: Not specified"
        notification_message = f"Your work request for '{work_request['description'][:50]}...' has been completed by {worker_name}. {amount_info}."
        notification_query = """INSERT INTO Notification (message, date, status, request_id) 
                               VALUES (%s, CURDATE(), 'Unread', %s)"""
        cursor.execute(notification_query, (notification_message, request_id))
        
        connection.commit()
        return jsonify({'message': 'Work request completed successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/work-requests/<int:request_id>/cancel', methods=['POST'])
def cancel_work_request(request_id):
    data = request.get_json()
    user_id = data.get('userId')
    
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        # First, verify the login record exists and is for a user
        login_query = "SELECT * FROM Login WHERE login_id = %s AND role = 'User'"
        cursor.execute(login_query, (user_id,))
        login = cursor.fetchone()
        
        if not login:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if the work request exists and belongs to this user
        request_query = "SELECT * FROM Work_Request WHERE request_id = %s AND user_id = %s AND status IN ('Pending', 'Accepted')"
        cursor.execute(request_query, (request_id, user_id))
        work_request = cursor.fetchone()
        
        if not work_request:
            return jsonify({'error': 'Work request not found or cannot be cancelled'}), 404
        
        # Cancel the work request (set status to Cancelled)
        cancel_query = "UPDATE Work_Request SET status = 'Cancelled' WHERE request_id = %s"
        cursor.execute(cancel_query, (request_id,))
        
        # If the request was accepted, we need to notify the worker
        if work_request['worker_id'] and work_request['status'] == 'Accepted':
            # Get worker details for notification
            worker_query = "SELECT * FROM Skill_Worker WHERE worker_id = %s"
            cursor.execute(worker_query, (work_request['worker_id'],))
            worker_details = cursor.fetchone()
            
            # Create a notification for the worker
            user_query = "SELECT * FROM User WHERE user_id = %s"
            cursor.execute(user_query, (user_id,))
            user_details = cursor.fetchone()
            
            user_name = f"{user_details['first_name']} {user_details['last_name']}" if user_details and user_details['first_name'] and user_details['last_name'] else "a user"
            notification_message = f"Work request #{request_id} for '{work_request['description'][:50]}...' has been cancelled by the user."
            notification_query = """INSERT INTO Notification (message, date, status, request_id) 
                                   VALUES (%s, CURDATE(), 'Unread', %s)"""
            cursor.execute(notification_query, (notification_message, request_id))
        
        connection.commit()
        return jsonify({'message': 'Work request cancelled successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# Admin Routes
@app.route('/api/admin/users', methods=['GET'])
def get_all_users():
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        cursor.execute("SELECT * FROM User")
        users = cursor.fetchall()
        return jsonify(users), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        # First, get the login_id for this user
        cursor.execute("SELECT login_id FROM User WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        login_id = user['login_id']
        
        # Delete related records first (due to foreign key constraints)
        # Delete work requests created by this user
        cursor.execute("DELETE FROM Work_Request WHERE user_id = %s", (user_id,))
        
        # Delete notifications related to this user's work requests
        # Note: This is a complex operation that might need to be handled differently in production
        
        # Delete the user record
        cursor.execute("DELETE FROM User WHERE user_id = %s", (user_id,))
        
        # Finally, delete the login record
        cursor.execute("DELETE FROM Login WHERE login_id = %s", (login_id,))
        
        connection.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/admin/workers', methods=['GET'])
def get_all_workers():
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        # Get all workers with their login information
        query = """SELECT sw.*, l.username, l.email FROM Skill_Worker sw 
                   JOIN Login l ON sw.login_id = l.login_id"""
        cursor.execute(query)
        workers = cursor.fetchall()
        return jsonify(workers), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/admin/workers/<int:worker_id>', methods=['DELETE'])
def delete_worker(worker_id):
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        # First, verify the worker exists
        worker_query = "SELECT * FROM Skill_Worker WHERE login_id = %s"
        cursor.execute(worker_query, (worker_id,))
        worker = cursor.fetchone()
        
        if not worker:
            return jsonify({'error': 'Worker not found'}), 404
        
        # Delete related records first (cascading)
        # Delete worker skills
        cursor.execute("DELETE FROM Worker_Skills WHERE worker_id = (SELECT worker_id FROM Skill_Worker WHERE login_id = %s)", (worker_id,))
        
        # Delete worker availability records
        cursor.execute("DELETE FROM Worker_Availability WHERE worker_id = (SELECT worker_id FROM Skill_Worker WHERE login_id = %s)", (worker_id,))
        
        # Delete work requests assigned to this worker
        cursor.execute("DELETE FROM Work_Request WHERE worker_id = (SELECT worker_id FROM Skill_Worker WHERE login_id = %s)", (worker_id,))
        
        # Delete notifications related to this worker's work requests
        # This would require a more complex query to find all notifications for work requests assigned to this worker
        
        # Delete the worker record
        cursor.execute("DELETE FROM Skill_Worker WHERE login_id = %s", (worker_id,))
        
        # Delete the login record
        cursor.execute("DELETE FROM Login WHERE login_id = %s", (worker_id,))
        
        connection.commit()
        return jsonify({'message': 'Worker deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/admin/work-requests', methods=['GET'])
def get_all_work_requests():
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        query = """SELECT wr.*, st.skill_name, u.first_name as user_first_name, 
                   u.last_name as user_last_name, sw.first_name as worker_first_name,
                   sw.last_name as worker_last_name FROM Work_Request wr
                   LEFT JOIN Skill_Type st ON wr.skill_type_id = st.skill_type_id
                   LEFT JOIN User u ON wr.user_id = u.user_id
                   LEFT JOIN Skill_Worker sw ON wr.worker_id = sw.worker_id
                   ORDER BY wr.request_date DESC"""
        cursor.execute(query)
        work_requests = cursor.fetchall()
        return jsonify(work_requests), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/work-requests/worker/<int:worker_id>', methods=['GET'])
def get_worker_work_requests(worker_id):
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        # First, verify the login record exists and is for a worker
        login_query = "SELECT * FROM Login WHERE login_id = %s AND role = 'Worker'"
        cursor.execute(login_query, (worker_id,))
        login = cursor.fetchone()
        
        if not login:
            return jsonify({'error': 'Worker not found'}), 404
        
        query = """SELECT wr.*, st.skill_name, u.first_name as user_first_name, 
                   u.last_name as user_last_name FROM Work_Request wr
                   JOIN Skill_Type st ON wr.skill_type_id = st.skill_type_id
                   JOIN User u ON wr.user_id = u.user_id
                   WHERE wr.worker_id = (SELECT worker_id FROM Skill_Worker WHERE login_id = %s)
                   ORDER BY wr.request_date DESC"""
        cursor.execute(query, (worker_id,))
        work_requests = cursor.fetchall()
        return jsonify(work_requests), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/workers/<int:worker_id>/status', methods=['PUT'])
def update_worker_status(worker_id):
    data = request.get_json()
    status = data.get('status')
    
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        # First, verify the login record exists and is for a worker
        login_query = "SELECT * FROM Login WHERE login_id = %s AND role = 'Worker'"
        cursor.execute(login_query, (worker_id,))
        login = cursor.fetchone()
        
        if not login:
            return jsonify({'error': 'Worker not found'}), 404
        
        # Update worker status
        update_query = "UPDATE Skill_Worker SET available_status = %s WHERE login_id = %s"
        cursor.execute(update_query, (status, worker_id))
        
        connection.commit()
        return jsonify({'message': f'Worker status updated to {status}'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/work-requests/available/<int:worker_id>', methods=['GET'])
def get_available_work_requests(worker_id):
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        # First, verify the login record exists and is for a worker
        login_query = "SELECT * FROM Login WHERE login_id = %s AND role = 'Worker'"
        cursor.execute(login_query, (worker_id,))
        login = cursor.fetchone()
        
        if not login:
            return jsonify({'error': 'Worker not found'}), 404
        
        # Get the worker's skills
        skills_query = """SELECT ws.skill_type_id FROM Worker_Skills ws
                          JOIN Skill_Worker sw ON ws.worker_id = sw.worker_id
                          WHERE sw.login_id = %s"""
        cursor.execute(skills_query, (worker_id,))
        worker_skills = cursor.fetchall()
        
        if not worker_skills:
            return jsonify([]), 200
        
        # Create a list of skill IDs
        skill_ids = [skill['skill_type_id'] for skill in worker_skills]
        
        # Get available work requests that match the worker's skills
        # Available requests are those with status 'Pending' and no worker assigned yet
        format_strings = ','.join(['%s'] * len(skill_ids))
        query = f"""SELECT wr.*, st.skill_name, u.first_name as user_first_name, 
                   u.last_name as user_last_name FROM Work_Request wr
                   JOIN Skill_Type st ON wr.skill_type_id = st.skill_type_id
                   JOIN User u ON wr.user_id = u.user_id
                   WHERE wr.skill_type_id IN ({format_strings})
                   AND wr.status = 'Pending'
                   AND wr.worker_id IS NULL
                   ORDER BY wr.request_date DESC"""
        cursor.execute(query, tuple(skill_ids))
        work_requests = cursor.fetchall()
        return jsonify(work_requests), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    phone_number1 = data.get('phone_number1')
    phone_number2 = data.get('phone_number2')
    
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        # First, verify the user exists
        user_query = "SELECT * FROM User WHERE user_id = %s"
        cursor.execute(user_query, (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        update_query = """UPDATE User SET first_name = %s, last_name = %s, email = %s, 
                          phone_number1 = %s, phone_number2 = %s WHERE user_id = %s"""
        cursor.execute(update_query, (first_name, last_name, email, phone_number1, phone_number2, user_id))
        connection.commit()
        
        return jsonify({'message': 'User updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/workers/<int:worker_id>', methods=['PUT'])
def update_worker(worker_id):
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    address = data.get('address')
    city = data.get('city')
    pincode = data.get('pincode')
    door_no = data.get('door_no')
    street_name = data.get('street_name')
    area = data.get('area')
    experience_years = data.get('experience_years')
    phone_number1 = data.get('phone_number1')
    phone_number2 = data.get('phone_number2')
    skill_ids = data.get('skill_ids')  # New field for worker skills
    
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        # First, verify the login record exists and is for a worker
        login_query = "SELECT * FROM Login WHERE login_id = %s AND role = 'Worker'"
        cursor.execute(login_query, (worker_id,))
        login = cursor.fetchone()
        
        if not login:
            return jsonify({'error': 'Worker not found'}), 404
        
        # Then update the worker details using login_id
        update_query = """UPDATE Skill_Worker SET first_name = %s, last_name = %s, address = %s, 
                          city = %s, pincode = %s, door_no = %s, street_name = %s, area = %s, 
                          experience_years = %s, phone_number1 = %s, phone_number2 = %s 
                          WHERE login_id = %s"""
        cursor.execute(update_query, (first_name, last_name, address, city, pincode, door_no, 
                                      street_name, area, experience_years, phone_number1, 
                                      phone_number2, worker_id))
        
        # Check if any rows were affected
        if cursor.rowcount == 0:
            return jsonify({'error': 'Worker details not found'}), 404
        
        # Update worker skills if provided
        if skill_ids is not None:
            # First, delete existing skills for this worker
            delete_skills_query = "DELETE FROM Worker_Skills WHERE worker_id = (SELECT worker_id FROM Skill_Worker WHERE login_id = %s)"
            cursor.execute(delete_skills_query, (worker_id,))
            
            # Then insert new skills
            # First get the actual worker_id from Skill_Worker table
            cursor.execute("SELECT worker_id FROM Skill_Worker WHERE login_id = %s", (worker_id,))
            worker_result = cursor.fetchone()
            if worker_result:
                actual_worker_id = worker_result['worker_id']
                for skill_id in skill_ids:
                    insert_skill_query = "INSERT INTO Worker_Skills (worker_id, skill_type_id) VALUES (%s, %s)"
                    cursor.execute(insert_skill_query, (actual_worker_id, skill_id))
        
        connection.commit()
        
        return jsonify({'message': 'Worker updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/work-requests/<int:request_id>/set-arrival-time', methods=['POST'])
def set_worker_arrival_time(request_id):
    data = request.get_json()
    worker_id = data.get('workerId')
    arrival_time = data.get('arrivalTime')
    
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        # First, verify the login record exists and is for a worker
        login_query = "SELECT * FROM Login WHERE login_id = %s AND role = 'Worker'"
        cursor.execute(login_query, (worker_id,))
        login = cursor.fetchone()
        
        if not login:
            return jsonify({'error': 'Worker not found'}), 404
        
        # Check if the work request exists and is assigned to this worker
        request_query = "SELECT * FROM Work_Request WHERE request_id = %s AND worker_id = (SELECT worker_id FROM Skill_Worker WHERE login_id = %s) AND status = 'Accepted'"
        cursor.execute(request_query, (request_id, worker_id))
        work_request = cursor.fetchone()
        
        if not work_request:
            return jsonify({'error': 'Work request not found or not assigned to this worker'}), 404
        
        # Set the worker arrival time
        update_query = "UPDATE Work_Request SET worker_arrival_time = %s WHERE request_id = %s"
        cursor.execute(update_query, (arrival_time, request_id))
        
        # Create a notification for the user
        notification_message = f"Worker has set arrival time to {arrival_time} for your work request. Please confirm."
        notification_query = """INSERT INTO Notification (message, date, status, request_id) 
                               VALUES (%s, CURDATE(), 'Unread', %s)"""
        cursor.execute(notification_query, (notification_message, request_id))
        
        connection.commit()
        return jsonify({'message': 'Worker arrival time set successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/work-requests/<int:request_id>/confirm-arrival', methods=['POST'])
def confirm_worker_arrival(request_id):
    data = request.get_json()
    user_id = data.get('userId')
    confirmation_status = data.get('confirmationStatus')  # 'Confirmed' or 'Rejected'
    
    connection = create_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    try:
        # First, verify the login record exists and is for a user
        login_query = "SELECT * FROM Login WHERE login_id = %s AND role = 'User'"
        cursor.execute(login_query, (user_id,))
        login = cursor.fetchone()
        
        if not login:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if the work request exists and belongs to this user
        request_query = "SELECT * FROM Work_Request WHERE request_id = %s AND user_id = %s AND status = 'Accepted'"
        cursor.execute(request_query, (request_id, user_id))
        work_request = cursor.fetchone()
        
        if not work_request:
            return jsonify({'error': 'Work request not found or not assigned to this user'}), 404
        
        # Update the user confirmation status
        update_query = "UPDATE Work_Request SET user_confirmation_status = %s WHERE request_id = %s"
        cursor.execute(update_query, (confirmation_status, request_id))
        
        # Create a notification for the worker
        user_query = "SELECT * FROM User WHERE user_id = %s"
        cursor.execute(user_query, (user_id,))
        user_details = cursor.fetchone()
        
        user_name = f"{user_details['first_name']} {user_details['last_name']}" if user_details else "User"
        notification_message = f"{user_name} has {confirmation_status.lower()} your arrival time for work request #{request_id}."
        notification_query = """INSERT INTO Notification (message, date, status, request_id) 
                               VALUES (%s, CURDATE(), 'Unread', %s)"""
        cursor.execute(notification_query, (notification_message, request_id))
        
        connection.commit()
        return jsonify({'message': f'Worker arrival time {confirmation_status.lower()} successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)