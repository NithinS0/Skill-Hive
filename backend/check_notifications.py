from db import create_connection

def check_notifications():
    conn = create_connection()
    if conn is None:
        print("Failed to connect to database")
        return
    
    cursor = conn.cursor()
    
    # Check notifications
    cursor.execute('SELECT * FROM Notification')
    notifications = cursor.fetchall()
    print("Notifications:", notifications)
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    check_notifications()