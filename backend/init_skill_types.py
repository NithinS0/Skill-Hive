from db import create_connection

def init_skill_types():
    connection = create_connection()
    if connection is None:
        print("Failed to connect to database")
        return
    
    cursor = connection.cursor()
    
    # Skill types to insert (corrected spelling as per user request)
    skill_types = [
        "Plumber",
        "Electrician", 
        "Carpenter",
        "Driver",
        "Mechanic",
        "Cleaner",
        "Painter",
        "Technician"
    ]
    
    try:
        for skill_name in skill_types:
            # Check if skill type already exists
            cursor.execute("SELECT * FROM Skill_Type WHERE skill_name = %s", (skill_name,))
            if not cursor.fetchone():
                # Insert new skill type
                cursor.execute("INSERT INTO Skill_Type (skill_name) VALUES (%s)", (skill_name,))
                print(f"Added skill type: {skill_name}")
            else:
                print(f"Skill type already exists: {skill_name}")
        
        # Remove any incorrect skill types
        incorrect_skill_types = ["Painer", "Mesan"]
        for skill_name in incorrect_skill_types:
            cursor.execute("DELETE FROM Skill_Type WHERE skill_name = %s", (skill_name,))
            if cursor.rowcount > 0:
                print(f"Removed incorrect skill type: {skill_name}")
        
        connection.commit()
        print("All skill types initialized successfully!")
    except Exception as e:
        print(f"Error initializing skill types: {e}")
        connection.rollback()
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    init_skill_types()