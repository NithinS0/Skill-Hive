# SkillHive - Skill Management System

A full-stack web application for managing skill-based work requests and worker availability.

## Tech Stack

- **Frontend**: React.js + Tailwind CSS
- **Backend**: Python Flask (with REST APIs)
- **Database**: MySQL

## Project Structure

```
SkillHive/
├── backend/
│   ├── app.py          # Main Flask application
│   ├── db.py           # Database connection and initialization
│   ├── requirements.txt # Python dependencies
│   └── .env            # Environment variables
├── frontend/
│   ├── src/
│   │   ├── pages/      # React components for each role dashboard
│   │   ├── services/   # API service functions
│   │   ├── App.jsx     # Main App component
│   │   ├── main.jsx    # Entry point
│   │   └── index.css   # Global styles
│   ├── index.html      # HTML template
│   ├── package.json    # Frontend dependencies
│   ├── vite.config.js  # Vite configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── postcss.config.js  # PostCSS configuration
└── skillhive_database.sql # Database schema
```

## Setup Instructions

### Prerequisites

1. Python 3.8 or higher
2. Node.js 16 or higher
3. MySQL 8.0 or higher

### Database Setup

1. Create a MySQL database:
   ```sql
   CREATE DATABASE SkillHive;
   ```

2. Update the database credentials in `backend/.env` if needed:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=Pymapass@11
   DB_NAME=SkillHive
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the Flask application:
   ```bash
   python app.py
   ```

   The backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:3000`

## Features

### User Roles

1. **User**
   - Register and login
   - Post work requests with detailed location information
   - Track request status (Pending, Accepted, Completed)
   - Receive notifications
   - Give feedback (comments, rating)

2. **Worker**
   - Register and login
   - Update availability with request details
   - Has skills linked to Skill_Type
   - View assigned work requests
   - Accept/Decline work requests
   - Mark job as completed
   - Receive notifications

3. **Admin**
   - Login
   - Manage Users (view, delete)
   - Manage Workers (view, delete)
   - Manage Skill_Types (add, edit, delete)
   - View all Work Requests with filters
   - View Notifications and Feedback

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register/user` - Register new user
- `POST /api/register/worker` - Register new worker

### User APIs
- `GET /api/users/:user_id` - Get user details
- `POST /api/work-requests` - Create work request
- `GET /api/work-requests/user/:user_id` - Get user's work requests

### Worker APIs
- `GET /api/workers/:worker_id` - Get worker details
- `POST /api/workers/:worker_id/availability` - Update worker availability

### Skill Type APIs
- `GET /api/skill-types` - Get all skill types
- `POST /api/skill-types` - Add new skill type

### Admin APIs
- `GET /api/admin/users` - Get all users
- `GET /api/admin/workers` - Get all workers
- `DELETE /api/admin/users/:user_id` - Delete user
- `DELETE /api/admin/workers/:worker_id` - Delete worker

## Database Schema

The database schema is defined in `skillhive_database.sql` and includes the following tables:
- Login
- User
- Skill_Worker
- Skill_Type
- Worker_Availability
- Work_Request
- Notification
- Feedback

### Phone Number Fields

All User and Worker records now include separate fields for:
- `phone_number1` (required)
- `phone_number2` (optional)

## Development

### Backend Development
The backend is built with Flask and uses PyMySQL for database connectivity. All API routes are defined in `app.py`.

### Frontend Development
The frontend is built with React and uses Tailwind CSS for styling. The application is structured with role-based dashboards:
- LoginPage.jsx - Authentication interface
- UserDashboard.jsx - User-specific features
- WorkerDashboard.jsx - Worker-specific features
- AdminDashboard.jsx - Admin-specific features

API calls are handled through the service layer in `src/services/api.js`.

## Deployment

### Prerequisites for Deployment

1. A Render account
2. A MySQL database (can be hosted on Render, AWS RDS, or any other provider)

### Deploying to Render

1. Fork this repository to your GitHub account
2. Create a MySQL database and run the schema from `skillhive_skill_types.sql`
3. Deploy the backend:
   - Create a new Web Service on Render
   - Connect it to your forked repository
   - Set the root directory to `backend`
   - Use these settings:
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `gunicorn --bind 0.0.0.0:$PORT app:app`
   - Add environment variables:
     - DB_HOST (your database host)
     - DB_PORT (usually 3306)
     - DB_USER (your database user)
     - DB_PASSWORD (your database password)
     - DB_NAME (your database name)
4. Deploy the frontend:
   - Create a new Static Site on Render
   - Connect it to your forked repository
   - Set the root directory to `frontend`
   - Use these settings:
     - Build Command: `npm install && npm run build`
     - Publish Directory: `dist`
   - Add environment variables:
     - VITE_API_BASE_URL (the URL of your deployed backend)

### Alternative Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)