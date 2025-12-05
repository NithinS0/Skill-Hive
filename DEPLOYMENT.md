# Deployment Guide for SkillHive

## Architecture Overview

SkillHive is a full-stack web application with:
- Frontend: React + Vite + Tailwind CSS
- Backend: Python Flask REST API
- Database: MySQL

## Deployment Strategy

The application is designed to be deployed as two separate services:
1. Backend API service (Python Flask)
2. Frontend static site (React + Vite)

## Environment Variables

### Backend (.env)
```env
DB_HOST=your_mysql_host
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=skillhive
```

### Frontend (.env)
Create a [.env.production](file:///c:/Users/kalka/OneDrive/Documents/DBMS/frontend/.env.production) file with:
```env
VITE_API_BASE_URL=https://your-backend-service.onrender.com
```

## Deployment Steps

### 1. Database Setup
1. Create a MySQL database
2. Run the SQL schema from `skillhive_skill_types.sql`
3. Update the backend [.env](file:///c:/Users/kalka/OneDrive/Documents/DBMS/backend/.env) with your database credentials

### 2. Backend Deployment (Render)
1. Create a new Web Service on Render
2. Connect to your GitHub repository
3. Set the following:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn --bind 0.0.0.0:$PORT app:app`
   - Environment Variables:
     - PYTHON_VERSION=3.9.16
     - DB_HOST=your_mysql_host
     - DB_PORT=3306
     - DB_USER=your_mysql_user
     - DB_PASSWORD=your_mysql_password
     - DB_NAME=skillhive

### 3. Frontend Deployment (Render)
1. Create a new Static Site on Render
2. Connect to your GitHub repository
3. Set the following:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Environment Variables:
     - NODE_VERSION=16
     - VITE_API_BASE_URL=https://your-backend-service.onrender.com

## Notes
- The frontend will be served as a static site
- All API requests will be proxied to the backend service
- Make sure to update the API base URL in the frontend to point to your deployed backend