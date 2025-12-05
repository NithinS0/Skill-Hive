import sqlite3
import os

def create_connection():
    try:
        # Create SQLite database file
        conn = sqlite3.connect('skillhive.db')
        conn.row_factory = sqlite3.Row  # This enables column access by name
        print("Successfully connected to SQLite database")
        return conn
    except Exception as e:
        print(f"Error while connecting to SQLite: {e}")
        return None

def init_db():
    connection = create_connection()
    if connection is None:
        return
    
    cursor = connection.cursor()
    
    # Create tables if they don't exist
    try:
        # Enable foreign key constraints
        cursor.execute("PRAGMA foreign_keys = ON")
        
        # Create Login table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS Login (
            login_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('User', 'Worker', 'Admin'))
        )
        """)
        
        # Create User table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS User (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone_number1 TEXT,
            phone_number2 TEXT,
            login_id INTEGER,
            FOREIGN KEY (login_id) REFERENCES Login(login_id) ON DELETE CASCADE
        )
        """)
        
        # Create Skill_Worker table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS Skill_Worker (
            worker_id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            address TEXT,
            city TEXT,
            pincode TEXT,
            door_no TEXT,
            street_name TEXT,
            area TEXT,
            experience_years INTEGER,
            available_status TEXT DEFAULT 'Available',
            phone_number1 TEXT,
            phone_number2 TEXT,
            login_id INTEGER,
            FOREIGN KEY (login_id) REFERENCES Login(login_id) ON DELETE CASCADE
        )
        """)
        
        # Create Skill_Type table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS Skill_Type (
            skill_type_id INTEGER PRIMARY KEY AUTOINCREMENT,
            skill_name TEXT NOT NULL UNIQUE
        )
        """)
        
        # Create Worker_Availability table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS Worker_Availability (
            availability_id INTEGER PRIMARY KEY AUTOINCREMENT,
            worker_id INTEGER,
            request_details TEXT,
            FOREIGN KEY (worker_id) REFERENCES Skill_Worker(worker_id) ON DELETE CASCADE
        )
        """)
        
        # Create Work_Request table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS Work_Request (
            request_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            worker_id INTEGER NULL,
            skill_type_id INTEGER,
            description TEXT,
            request_date DATE,
            status TEXT DEFAULT 'Pending',
            location TEXT,
            city TEXT,
            pincode TEXT,
            door_no TEXT,
            street_name TEXT,
            area TEXT,
            worker_arrival_time TEXT,
            user_confirmation_status TEXT DEFAULT 'Pending' CHECK (user_confirmation_status IN ('Pending', 'Confirmed', 'Rejected')),
            FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
            FOREIGN KEY (worker_id) REFERENCES Skill_Worker(worker_id) ON DELETE SET NULL,
            FOREIGN KEY (skill_type_id) REFERENCES Skill_Type(skill_type_id) ON DELETE CASCADE
        )
        """)
        
        # Create Notification table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS Notification (
            notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT,
            date DATE,
            status TEXT DEFAULT 'Unread',
            request_id INTEGER,
            FOREIGN KEY (request_id) REFERENCES Work_Request(request_id) ON DELETE CASCADE
        )
        """)
        
        # Create Feedback table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS Feedback (
            feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
            request_id INTEGER,
            comments TEXT,
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            FOREIGN KEY (request_id) REFERENCES Work_Request(request_id) ON DELETE CASCADE
        )
        """)
        
        # Create Worker_Skills table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS Worker_Skills (
            worker_skill_id INTEGER PRIMARY KEY AUTOINCREMENT,
            worker_id INTEGER,
            skill_type_id INTEGER,
            FOREIGN KEY (worker_id) REFERENCES Skill_Worker(worker_id) ON DELETE CASCADE,
            FOREIGN KEY (skill_type_id) REFERENCES Skill_Type(skill_type_id) ON DELETE CASCADE
        )
        """)
        
        # Insert default skill types if table is empty
        cursor.execute("SELECT COUNT(*) as count FROM Skill_Type")
        if cursor.fetchone()['count'] == 0:
            default_skills = ['Plumbing', 'Electrical', 'Carpentry', 'Cleaning', 'Gardening', 'Painting']
            for skill in default_skills:
                cursor.execute("INSERT INTO Skill_Type (skill_name) VALUES (?)", (skill,))
            print("Default skill types inserted")
        
        connection.commit()
        print("Tables created successfully!")
    except Exception as e:
        print(f"Error creating tables: {e}")
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    init_db()