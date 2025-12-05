from db import create_connection

def check_work_requests():
    conn = create_connection()
    if conn is None:
        print("Failed to connect to database")
        return
    
    cursor = conn.cursor()
    
    # Check work requests
    cursor.execute('SELECT * FROM Work_Request')
    requests = cursor.fetchall()
    print("Work Requests:", requests)
    
    # Check work requests assigned to workers
    cursor.execute('SELECT * FROM Work_Request WHERE worker_id IS NOT NULL')
    assigned_requests = cursor.fetchall()
    print("Assigned Work Requests:", assigned_requests)
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    check_work_requests()