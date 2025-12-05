import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def clear_all_data():
    connection = pymysql.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=int(os.getenv('DB_PORT', 3306)),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', 'Pymapass@11'),
        database=os.getenv('DB_NAME', 'skillhive'),
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
    
    cursor = connection.cursor()
    
    try:
        # Disable foreign key checks to avoid constraint errors
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        
        # Get all tables
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        
        # Delete data from each table
        for table in tables:
            table_name = list(table.values())[0]
            print(f"Deleting data from {table_name}...")
            cursor.execute(f"DELETE FROM {table_name}")
            
            # Reset auto-increment counter
            cursor.execute(f"ALTER TABLE {table_name} AUTO_INCREMENT = 1")
        
        # Re-enable foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
        
        connection.commit()
        print("\n✅ All data deleted successfully from all tables!")
        print("Table structures are preserved.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        connection.rollback()
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    confirm = input("⚠️  This will delete ALL data from ALL tables. Are you sure? (yes/no): ")
    if confirm.lower() == 'yes':
        clear_all_data()
    else:
        print("Operation cancelled.")
