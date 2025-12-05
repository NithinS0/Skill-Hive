import pymysql
from pymysql import Error
import os
from dotenv import load_dotenv

load_dotenv()

def test_connection():
    try:
        print("Testing MySQL connection without specifying database...")
        print(f"Host: {os.getenv('DB_HOST', 'localhost')}")
        print(f"Port: {os.getenv('DB_PORT', 3306)}")
        print(f"User: {os.getenv('DB_USER', 'root')}")
        print(f"Password: {os.getenv('DB_PASSWORD', 'Pymapass@11')}")
        
        connection = pymysql.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', 3306)),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', 'Pymapass@11'),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        print("Successfully connected to MySQL server")
        
        # Try to create database if it doesn't exist
        cursor = connection.cursor()
        try:
            cursor.execute("CREATE DATABASE IF NOT EXISTS skillhive")
            print("Database 'skillhive' created or already exists")
        except Error as e:
            print(f"Error creating database: {e}")
        
        connection.close()
        return True
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
        return False

if __name__ == "__main__":
    test_connection()