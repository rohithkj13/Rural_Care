# RuralCare Connect - Quick Reference Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
# Run this in project root
install.bat
```

### Step 2: Start MongoDB
Make sure MongoDB is running on your system

### Step 3: Start Application
```bash
# Run this in project root
start.bat
```

**Access:** http://localhost:3000

---

## 📋 Manual Commands

### Backend
```bash
cd server
npm install
npm start
```
Runs on: http://localhost:5000

### Frontend
```bash
cd client
npm install
npm start
```
Runs on: http://localhost:3000

---

## 🔑 Test Credentials

### Create Test Accounts

**Doctor Account:**
- Role: Doctor
- Email: doctor@test.com
- Password: password123
- Specialization: General Physician
- Qualification: MBBS, MD
- Experience: 10 years
- Hospital: City Hospital
- Fee: 500

**Patient Account:**
- Role: Patient
- Email: patient@test.com
- Password: password123
- Age: 30
- Gender: Female

---

## 🎯 Feature Checklist

### Patient Features
- [x] Register & Login
- [x] Browse Doctors
- [x] Book Appointment
- [x] Video Consultation
- [x] Chat Messaging
- [x] View Prescriptions
- [x] Upload Medical Reports
- [x] View Notifications
- [x] Change Language

### Doctor Features
- [x] Register & Login
- [x] View Appointments
- [x] Accept/Reject Appointments
- [x] Video Consultation
- [x] Create Prescriptions
- [x] View Patient History
- [x] Dashboard Analytics

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| MongoDB | mongodb://localhost:27017/ruralcare |

---

## 📡 API Endpoints Quick Reference

### Auth
- POST `/api/auth/register` - Register
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get current user

### Doctors
- GET `/api/doctors` - Get all doctors
- GET `/api/doctors/:id` - Get doctor details

### Appointments
- POST `/api/appointments` - Book appointment
- GET `/api/appointments` - Get appointments
- PUT `/api/appointments/:id/status` - Update status

### Prescriptions
- POST `/api/prescriptions` - Create prescription
- GET `/api/prescriptions` - Get prescriptions

### Reports
- POST `/api/reports` - Upload report
- GET `/api/reports` - Get reports

### Notifications
- GET `/api/notifications` - Get notifications
- PUT `/api/notifications/:id/read` - Mark as read

---

## 🔧 Configuration

### Environment Variables (server/.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ruralcare
JWT_SECRET=ruralcare_secret_key_2024_secure
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

---

## 🐛 Troubleshooting

### MongoDB Not Running
```bash
# Check MongoDB status
mongod --version

# Start MongoDB service (Windows)
net start MongoDB
```

### Port Already in Use
- Change PORT in server/.env
- Update baseURL in client/src/services/api.js

### Camera Not Working
- Allow browser permissions
- Use Chrome or Firefox
- Check camera/microphone settings

### CORS Error
- Verify CLIENT_URL in server/.env
- Check backend is running

---

## 📱 Testing Flow

1. **Register Doctor** → Login as Doctor
2. **Register Patient** → Login as Patient
3. **Patient:** Browse Doctors → Book Appointment
4. **Doctor:** Accept Appointment
5. **Both:** Join Consultation → Start Video Call
6. **Doctor:** Create Prescription
7. **Patient:** Upload Medical Report
8. **Both:** Check Notifications

---

## 🌍 Language Support

Switch language from navigation bar:
- English (Default)
- हिंदी (Hindi)
- தமிழ் (Tamil)

---

## 📦 Tech Stack

**Frontend:** React + Tailwind CSS + Axios + Socket.io
**Backend:** Node.js + Express + MongoDB + JWT
**Real-time:** Socket.io + WebRTC

---

## 📞 Need Help?

1. Check **SETUP.md** for detailed installation
2. Read **README.md** for features
3. Review **PROJECT_STRUCTURE.md** for code organization
4. See **PROJECT_SUMMARY.md** for complete overview

---

## ✅ Project Status

**Status:** Production Ready ✅
**All Features:** Implemented ✅
**Documentation:** Complete ✅
**Testing:** Ready ✅

---

**Happy Coding! 🚀**
