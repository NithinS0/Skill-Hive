import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

# Connect without specifying a database to create the database
connection = pymysql.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    port=int(os.getenv('DB_PORT', 3306)),
    user=os.getenv('DB_USER', 'root'),
    password=os.getenv('DB_PASSWORD', 'Pymapass@11'),
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor
)

try:
    with connection.cursor() as cursor:
        # Create the database if it doesn't exist
        cursor.execute("CREATE DATABASE IF NOT EXISTS skillhive")
        print("Database 'skillhive' created or already exists.")
        
        # Use the database
        cursor.execute("USE skillhive")
        print("Using database 'skillhive'.")
        
        # Show tables to verify connection
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print("Existing tables:", tables)
        
finally:
    connection.close()