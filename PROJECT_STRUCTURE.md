# RuralCare Connect - Project Structure

```
ruralcare-connect/
│
├── client/                          # React Frontend
│   ├── public/
│   │   └── index.html              # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   └── PrivateRoute.js     # Protected route component
│   │   ├── context/
│   │   │   ├── AuthContext.js      # Authentication state management
│   │   │   └── LanguageContext.js  # Multilingual support
│   │   ├── pages/
│   │   │   ├── Landing.js          # Landing page
│   │   │   ├── Login.js            # Login page
│   │   │   ├── Register.js         # Registration page
│   │   │   ├── PatientDashboard.js # Patient dashboard
│   │   │   ├── DoctorDashboard.js  # Doctor dashboard
│   │   │   ├── DoctorsList.js      # Browse doctors
│   │   │   ├── BookAppointment.js  # Book appointment form
│   │   │   ├── Appointments.js     # View appointments
│   │   │   ├── Consultation.js     # Video consultation room
│   │   │   ├── Prescriptions.js    # View prescriptions
│   │   │   ├── MedicalReports.js   # Upload/view reports
│   │   │   └── Notifications.js    # User notifications
│   │   ├── services/
│   │   │   └── api.js              # API service layer
│   │   ├── App.js                  # Main app component with routes
│   │   └── index.js                # Entry point
│   ├── package.json                # Frontend dependencies
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   └── postcss.config.js           # PostCSS configuration
│
├── server/                          # Node.js Backend
│   ├── config/
│   │   └── db.js                   # Database connection
│   ├── controllers/
│   │   ├── authController.js       # Authentication logic
│   │   ├── doctorController.js     # Doctor operations
│   │   ├── appointmentController.js # Appointment management
│   │   ├── prescriptionController.js # Prescription handling
│   │   ├── reportController.js     # Medical reports
│   │   ├── notificationController.js # Notifications
│   │   └── consultationController.js # Consultation sessions
│   ├── middleware/
│   │   ├── auth.js                 # JWT authentication middleware
│   │   └── upload.js               # File upload middleware
│   ├── models/
│   │   ├── User.js                 # User model (Patient & Doctor)
│   │   ├── Appointment.js          # Appointment model
│   │   ├── Prescription.js         # Prescription model
│   │   ├── MedicalReport.js        # Medical report model
│   │   ├── Consultation.js         # Consultation model
│   │   └── Notification.js         # Notification model
│   ├── routes/
│   │   ├── auth.js                 # Authentication routes
│   │   ├── doctors.js              # Doctor routes
│   │   ├── appointments.js         # Appointment routes
│   │   ├── prescriptions.js        # Prescription routes
│   │   ├── reports.js              # Medical report routes
│   │   ├── notifications.js        # Notification routes
│   │   └── consultations.js        # Consultation routes
│   ├── uploads/                    # Uploaded files directory
│   ├── .env                        # Environment variables
│   ├── server.js                   # Main server file
│   └── package.json                # Backend dependencies
│
├── database/
│   └── schema.md                   # Database schema documentation
│
├── .gitignore                      # Git ignore file
├── README.md                       # Project documentation
├── SETUP.md                        # Setup instructions
├── install.bat                     # Installation script (Windows)
└── start.bat                       # Start script (Windows)
```

## Key Components

### Frontend Components

**Pages:**
- Landing: Homepage with features and navigation
- Login/Register: User authentication
- PatientDashboard: Patient overview and quick actions
- DoctorDashboard: Doctor overview with statistics
- DoctorsList: Browse and search doctors
- BookAppointment: Appointment booking form
- Appointments: View and manage appointments
- Consultation: Video call room with WebRTC
- Prescriptions: View digital prescriptions
- MedicalReports: Upload and manage medical documents
- Notifications: User notifications center

**Context:**
- AuthContext: Global authentication state
- LanguageContext: Multilingual support (EN, HI, TA)

**Services:**
- api.js: Centralized API calls with Axios

### Backend Components

**Controllers:**
Handle business logic for each feature

**Models:**
MongoDB schemas with Mongoose

**Routes:**
API endpoints for each feature

**Middleware:**
- auth.js: JWT token verification
- upload.js: File upload handling with Multer

### Database

**Collections:**
- users: Patient and doctor accounts
- appointments: Booking records
- prescriptions: Digital prescriptions
- medicalreports: Uploaded documents
- consultations: Session records
- notifications: User alerts

## Technology Stack

**Frontend:**
- React 18
- Tailwind CSS
- Axios
- React Router v6
- Socket.io-client
- WebRTC

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- Socket.io for real-time communication
- Multer for file uploads

## Features Implementation

✅ User Authentication (JWT)
✅ Role-based Access Control
✅ Doctor Search & Filter
✅ Appointment Booking System
✅ Video Consultation (WebRTC)
✅ Real-time Chat (Socket.io)
✅ Digital Prescriptions
✅ Medical Report Upload
✅ Notification System
✅ Multilingual Support
✅ Responsive Design
✅ Health Record Management
