# RuralCare Connect - Telemedicine & Digital Health Access System

A full-stack MERN application for connecting rural patients with doctors for remote consultation and digital healthcare services.

## Features

### Patient Features
- User registration and authentication
- Browse and search doctors by specialization
- Book appointments (video/audio/chat)
- Online video consultation with WebRTC
- View and download digital prescriptions
- Upload and manage medical reports
- Health record management
- Notifications for appointments and reminders
- Multilingual support (English, Hindi, Tamil)

### Doctor Features
- Doctor registration with professional details
- Manage appointments (accept/reject/reschedule)
- Conduct video consultations
- Generate digital prescriptions
- View patient history and medical reports
- Dashboard with analytics
- Patient management

## Technology Stack

### Frontend
- React.js
- Tailwind CSS
- Axios
- React Router
- Socket.io-client
- WebRTC

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- bcrypt
- Socket.io
- Multer

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ruralcare
JWT_SECRET=ruralcare_secret_key_2024_secure
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

4. Start the server:
```bash
npm start
```

Server will run on http://localhost:5000

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

Client will run on http://localhost:3000

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user
- PUT /api/auth/profile - Update profile

### Doctors
- GET /api/doctors - Get all doctors
- GET /api/doctors/:id - Get doctor by ID
- GET /api/doctors/stats - Get doctor statistics

### Appointments
- POST /api/appointments - Create appointment
- GET /api/appointments - Get all appointments
- GET /api/appointments/:id - Get appointment by ID
- PUT /api/appointments/:id/status - Update appointment status
- PUT /api/appointments/:id/cancel - Cancel appointment

### Prescriptions
- POST /api/prescriptions - Create prescription
- GET /api/prescriptions - Get all prescriptions
- GET /api/prescriptions/:id - Get prescription by ID

### Medical Reports
- POST /api/reports - Upload report
- GET /api/reports - Get all reports
- GET /api/reports/:id - Get report by ID
- DELETE /api/reports/:id - Delete report

### Notifications
- GET /api/notifications - Get all notifications
- PUT /api/notifications/:id/read - Mark as read
- PUT /api/notifications/read-all - Mark all as read

### Consultations
- POST /api/consultations - Create consultation
- PUT /api/consultations/:id/end - End consultation
- GET /api/consultations - Get all consultations

## Database Collections

- users - Patient and doctor information
- appointments - Appointment bookings
- prescriptions - Digital prescriptions
- medicalreports - Uploaded medical reports
- consultations - Consultation records
- notifications - User notifications

## Usage

1. Register as a Patient or Doctor
2. Login with credentials
3. Patients can browse doctors and book appointments
4. Doctors can manage appointments and accept/reject them
5. Join video consultation at scheduled time
6. Doctors can create digital prescriptions during consultation
7. Patients can upload medical reports
8. View notifications for appointment updates

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Protected API routes
- Role-based access control

## License

MIT License
