from db import create_connection

def check_skill_types():
    connection = create_connection()
    if connection is None:
        print("Failed to connect to database")
        return
    
    cursor = connection.cursor()
    
    try:
        cursor.execute("SELECT skill_name FROM Skill_Type")
        results = cursor.fetchall()
        print("Current skill types in database:")
        for row in results:
            print(f"- {row['skill_name']}")
    except Exception as e:
        print(f"Error checking skill types: {e}")
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    check_skill_types()