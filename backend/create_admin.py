import hashlib
import pymysql
from db import create_connection

def hash_password(password):
    """Hash a password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_admin_user(username, password):
    """Create an admin user in the database"""
    connection = create_connection()
    if connection is None:
        print("Failed to connect to database")
        return False
    
    cursor = connection.cursor()
    try:
        # Check if username already exists
        cursor.execute("SELECT * FROM Login WHERE username = %s", (username,))
        if cursor.fetchone():
            print(f"Username '{username}' already exists")
            return False
        
        # Hash the password
        hashed_password = hash_password(password)
        
        # Insert the admin user
        query = "INSERT INTO Login (username, password, role) VALUES (%s, %s, 'Admin')"
        cursor.execute(query, (username, hashed_password))
        
        connection.commit()
        print(f"Admin user '{username}' created successfully!")
        return True
    except Exception as e:
        print(f"Error creating admin user: {e}")
        return False
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    # Change these values to your desired admin credentials
    admin_username = input("Enter admin username: ")
    admin_password = input("Enter admin password: ")
    
    if create_admin_user(admin_username, admin_password):
        print("Admin account created successfully!")
    else:
        print("Failed to create admin account.")