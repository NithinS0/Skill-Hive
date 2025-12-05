import pymysql
from pymysql import Error
import os
from dotenv import load_dotenv

load_dotenv()

def test_connection():
    try:
        print("Testing MySQL connection...")
        print(f"Host: {os.getenv('DB_HOST', 'localhost')}")
        print(f"Port: {os.getenv('DB_PORT', 3306)}")
        print(f"User: {os.getenv('DB_USER', 'root')}")
        print(f"Password: {os.getenv('DB_PASSWORD', 'Pymapass@11')}")
        print(f"Database: {os.getenv('DB_NAME', 'skillhive')}")
        
        connection = pymysql.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', 3306)),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', 'Pymapass@11'),
            database=os.getenv('DB_NAME', 'skillhive'),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        print("Successfully connected to MySQL database")
        connection.close()
        return True
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
        return False

if __name__ == "__main__":
    test_connection()