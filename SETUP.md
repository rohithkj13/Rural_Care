# RuralCare Connect - Setup Instructions

## Quick Start Guide

### Step 1: Install MongoDB
Make sure MongoDB is installed and running on your system.

**Windows:**
- Download MongoDB from https://www.mongodb.com/try/download/community
- Install and start MongoDB service

**Check if MongoDB is running:**
```bash
mongod --version
```

### Step 2: Install Backend Dependencies

Open terminal in the project root directory:

```bash
cd server
npm install
```

### Step 3: Configure Environment Variables

The `.env` file is already created in the server directory. Update if needed:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ruralcare
JWT_SECRET=ruralcare_secret_key_2024_secure
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

### Step 4: Start Backend Server

```bash
cd server
npm start
```

You should see:
```
Server running on port 5000
MongoDB Connected Successfully
```

### Step 5: Install Frontend Dependencies

Open a NEW terminal window:

```bash
cd client
npm install
```

### Step 6: Start Frontend Application

```bash
cd client
npm start
```

The application will open automatically at http://localhost:3000

## Testing the Application

### 1. Register as a Doctor

- Click "Register" button
- Select "Doctor" role
- Fill in the form:
  - Name: Dr. John Smith
  - Email: doctor@test.com
  - Password: password123
  - Phone: 1234567890
  - Specialization: General Physician
  - Qualification: MBBS, MD
  - Experience: 10
  - Hospital: City Hospital
  - Consultation Fee: 500

### 2. Register as a Patient

- Click "Register" button
- Select "Patient" role
- Fill in the form:
  - Name: Jane Doe
  - Email: patient@test.com
  - Password: password123
  - Phone: 9876543210
  - Age: 30
  - Gender: Female
  - Address: 123 Main St

### 3. Book an Appointment

- Login as patient
- Go to "Doctors" page
- Click "Book Appointment" on a doctor
- Select date, time, and consultation type
- Submit the form

### 4. Accept Appointment (Doctor)

- Login as doctor
- View pending appointments on dashboard
- Click "Accept" to approve the appointment

### 5. Join Consultation

- Both patient and doctor can click "Join Consultation"
- Allow camera and microphone permissions
- Start video call
- Use chat feature
- Doctor can create prescription during consultation

### 6. Upload Medical Reports

- Login as patient
- Go to "Medical Reports"
- Click "Upload Report"
- Select file and fill details
- Submit

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env file

### Port Already in Use
- Change PORT in server/.env
- Update API baseURL in client/src/services/api.js

### Camera/Microphone Not Working
- Allow browser permissions for camera and microphone
- Use HTTPS in production for WebRTC

### CORS Errors
- Ensure CLIENT_URL in server/.env matches frontend URL
- Check cors configuration in server.js

## Production Deployment

### Backend
1. Set environment variables on hosting platform
2. Use production MongoDB URI
3. Set NODE_ENV=production

### Frontend
1. Update API baseURL to production backend URL
2. Build the application: `npm run build`
3. Deploy build folder to hosting service

## Default Test Credentials

After registration, use these for testing:

**Doctor:**
- Email: doctor@test.com
- Password: password123

**Patient:**
- Email: patient@test.com
- Password: password123

## Features to Test

✅ User Registration (Patient & Doctor)
✅ User Login
✅ Patient Dashboard
✅ Doctor Dashboard
✅ Browse Doctors
✅ Book Appointment
✅ Manage Appointments
✅ Video Consultation
✅ Chat Messaging
✅ Create Prescription
✅ View Prescriptions
✅ Upload Medical Reports
✅ View Medical Reports
✅ Notifications
✅ Multilingual Support (English, Hindi, Tamil)

## Support

For issues or questions, check the README.md file or review the code documentation.
