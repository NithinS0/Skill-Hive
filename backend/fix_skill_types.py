from db import create_connection

def check_and_fix_skill_types():
    connection = create_connection()
    if connection is None:
        print("Failed to connect to database")
        return
    
    cursor = connection.cursor()
    
    try:
        # Check current skill types
        cursor.execute("SELECT skill_type_id, skill_name FROM Skill_Type")
        results = cursor.fetchall()
        print("Current skill types in database:")
        for row in results:
            print(f"{row['skill_type_id']}: {row['skill_name']}")
            
        # Check if we have the correct skill types
        required_skill_types = [
            "Plumber",
            "Electrician", 
            "Carpenter",
            "Driver",
            "Mechanic",
            "Cleaner",
            "Painter",
            "Technician"
        ]
        
        # Get current skill names
        current_skill_names = [row['skill_name'] for row in results]
        
        # Check for missing skill types
        for skill_name in required_skill_types:
            if skill_name not in current_skill_names:
                print(f"Adding missing skill type: {skill_name}")
                cursor.execute("INSERT INTO Skill_Type (skill_name) VALUES (%s)", (skill_name,))
        
        # Check for incorrect skill types that need to be corrected
        # For example, if "Painer" exists, we should correct it to "Painter"
        if "Painer" in current_skill_names and "Painter" not in current_skill_names:
            print("Correcting 'Painer' to 'Painter'")
            cursor.execute("UPDATE Skill_Type SET skill_name = %s WHERE skill_name = %s", ("Painter", "Painer"))
            
        # Remove any incorrect skill types like "Mason" if it's not in our required list
        # But first check if it's being used in any work requests
        if "Mason" in current_skill_names and "Mason" not in required_skill_types:
            # Check if Mason is being used in any work requests
            cursor.execute("SELECT COUNT(*) as count FROM Work_Request WHERE skill_type_id = (SELECT skill_type_id FROM Skill_Type WHERE skill_name = %s)", ("Mason",))
            result = cursor.fetchone()
            if result and result['count'] == 0:
                print("Removing incorrect skill type: Mason")
                cursor.execute("DELETE FROM Skill_Type WHERE skill_name = %s", ("Mason",))
            elif result:
                print("Mason skill type is being used in work requests, not removing")
            else:
                print("Mason skill type not found in work requests, removing")
                cursor.execute("DELETE FROM Skill_Type WHERE skill_name = %s", ("Mason",))
        
        connection.commit()
        print("Skill types updated successfully!")
        
        # Check final skill types
        cursor.execute("SELECT skill_type_id, skill_name FROM Skill_Type")
        results = cursor.fetchall()
        print("\nFinal skill types in database:")
        for row in results:
            print(f"{row['skill_type_id']}: {row['skill_name']}")
            
    except Exception as e:
        print(f"Error checking/correcting skill types: {e}")
        connection.rollback()
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    check_and_fix_skill_types()