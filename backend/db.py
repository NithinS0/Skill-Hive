import pymysql
from pymysql import Error
import os
from dotenv import load_dotenv

load_dotenv()

def create_connection():
    try:
        connection = pymysql.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', 3306)),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', 'Pymapass@11'),
            database=os.getenv('DB_NAME', 'skillhive'),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        return connection
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
        return None

def init_db():
    connection = create_connection()
    if connection is None:
        return
    
    cursor = connection.cursor()
    
    # Create tables if they don't exist
    try:
        # Create Login table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS Login (
            login_id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('User', 'Worker', 'Admin') NOT NULL
        )
        """)
        
        # Create User table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS User (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone_number1 VARCHAR(20),
            phone_number2 VARCHAR(20),
            login_id INT,
            FOREIGN KEY (login_id) REFERENCES Login(login_id) ON DELETE CASCADE
        )
        """)
        
        # Create Skill_Worker table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS Skill_Worker (
            worker_id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            address VARCHAR(255),
            city VARCHAR(50),
            pincode VARCHAR(10),
            door_no VARCHAR(10),
            street_name VARCHAR(100),
            area VARCHAR(100),
            experience_years INT,
            available_status VARCHAR(20) DEFAULT 'Available',
            phone_number1 VARCHAR(20),
            phone_number2 VARCHAR(20),
            login_id INT,
            FOREIGN KEY (login_id) REFERENCES Login(login_id) ON DELETE CASCADE
        )
        """)
        
        # Create Skill_Type table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS Skill_Type (
            skill_type_id INT AUTO_INCREMENT PRIMARY KEY,
            skill_name VARCHAR(100) NOT NULL UNIQUE
        )
        """)
        
        # Create Worker_Availability table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS Worker_Availability (
            availability_id INT AUTO_INCREMENT PRIMARY KEY,
            worker_id INT,
            request_details TEXT,
            FOREIGN KEY (worker_id) REFERENCES Skill_Worker(worker_id) ON DELETE CASCADE
        )
        """)
        
        # Create Work_Request table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS Work_Request (
            request_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            worker_id INT NULL,
            skill_type_id INT,
            description TEXT,
            request_date DATE,
            status VARCHAR(20) DEFAULT 'Pending',
            location VARCHAR(255),
            city VARCHAR(50),
            pincode VARCHAR(10),
            door_no VARCHAR(10),
            street_name VARCHAR(100),
            area VARCHAR(100),
            worker_arrival_time TIME,
            user_confirmation_status ENUM('Pending', 'Confirmed', 'Rejected') DEFAULT 'Pending',
            FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
            FOREIGN KEY (worker_id) REFERENCES Skill_Worker(worker_id) ON DELETE SET NULL,
            FOREIGN KEY (skill_type_id) REFERENCES Skill_Type(skill_type_id) ON DELETE CASCADE
        )
        """)
        
        # Create Notification table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS Notification (
            notification_id INT AUTO_INCREMENT PRIMARY KEY,
            message TEXT,
            date DATE,
            status VARCHAR(20) DEFAULT 'Unread',
            request_id INT,
            FOREIGN KEY (request_id) REFERENCES Work_Request(request_id) ON DELETE CASCADE
        )
        """)
        
        # Create Feedback table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS Feedback (
            feedback_id INT AUTO_INCREMENT PRIMARY KEY,
            request_id INT,
            comments TEXT,
            rating INT CHECK (rating >= 1 AND rating <= 5),
            FOREIGN KEY (request_id) REFERENCES Work_Request(request_id) ON DELETE CASCADE
        )
        """)
        
        # Create Worker_Skills table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS Worker_Skills (
            worker_skill_id INT AUTO_INCREMENT PRIMARY KEY,
            worker_id INT,
            skill_type_id INT,
            FOREIGN KEY (worker_id) REFERENCES Skill_Worker(worker_id) ON DELETE CASCADE,
            FOREIGN KEY (skill_type_id) REFERENCES Skill_Type(skill_type_id) ON DELETE CASCADE
        )
        """)
        
        connection.commit()
        print("Tables created successfully!")
    except Error as e:
        print(f"Error creating tables: {e}")
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    init_db()