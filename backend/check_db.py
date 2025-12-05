from db import create_connection

def check_database():
    conn = create_connection()
    if conn is None:
        print("Failed to connect to database")
        return
    
    cursor = conn.cursor()
    
    # Check workers
    cursor.execute('SELECT * FROM Login WHERE role = "Worker"')
    workers = cursor.fetchall()
    print("Worker Logins:", workers)
    
    # Check skill workers
    cursor.execute('SELECT * FROM Skill_Worker')
    skill_workers = cursor.fetchall()
    print("Skill Workers:", skill_workers)
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    check_database()