-- SQL script to ensure correct skill types are in the database
-- This script will insert the required skill types if they don't exist

INSERT INTO Skill_Type (skill_name) VALUES ('Plumber')
ON DUPLICATE KEY UPDATE skill_name = skill_name;

INSERT INTO Skill_Type (skill_name) VALUES ('Electrician')
ON DUPLICATE KEY UPDATE skill_name = skill_name;

INSERT INTO Skill_Type (skill_name) VALUES ('Carpenter')
ON DUPLICATE KEY UPDATE skill_name = skill_name;

INSERT INTO Skill_Type (skill_name) VALUES ('Driver')
ON DUPLICATE KEY UPDATE skill_name = skill_name;

INSERT INTO Skill_Type (skill_name) VALUES ('Mechanic')
ON DUPLICATE KEY UPDATE skill_name = skill_name;

INSERT INTO Skill_Type (skill_name) VALUES ('Cleaner')
ON DUPLICATE KEY UPDATE skill_name = skill_name;

INSERT INTO Skill_Type (skill_name) VALUES ('Painter')
ON DUPLICATE KEY UPDATE skill_name = skill_name;

INSERT INTO Skill_Type (skill_name) VALUES ('Technician')
ON DUPLICATE KEY UPDATE skill_name = skill_name;

-- Remove any incorrect skill types
DELETE FROM Skill_Type WHERE skill_name = 'Painer' OR skill_name = 'Mesan';

-- Verify the data
SELECT * FROM Skill_Type;