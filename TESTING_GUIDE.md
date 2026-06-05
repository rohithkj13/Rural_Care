# Complete Testing Guide - RuralCare Connect

## ✅ Pre-Testing Checklist

### 1. Ensure Backend is Running
```bash
cd server
npm start
```
Should see: `Server running on port 5000` and `MongoDB Connected Successfully`

### 2. Ensure Frontend is Running
```bash
cd client
npm start
```
Should open: `http://localhost:3000`

### 3. Database is Seeded
```bash
cd server
npm run seed
```

---

## 🧪 Complete Testing Flow

### Test 1: Landing Page ✅
1. Go to `http://localhost:3000`
2. Click "About" → Should show About page
3. Click "Contact" → Should show Contact page
4. Click "Home" → Return to landing
5. All links working ✅

### Test 2: Patient Registration ✅
1. Click "Register"
2. Select "Patient"
3. Fill form:
   - Name: Test Patient
   - Email: testpatient@test.com
   - Password: password123
   - Phone: 9999999999
   - Age: 30
   - Gender: Male
   - Address: Test Address
4. Click "Register"
5. Should redirect to login ✅

### Test 3: Patient Login ✅
1. Go to Login page
2. Enter:
   - Email: `patient1@test.com`
   - Password: `password123`
3. Click "Login"
4. Should redirect to Patient Dashboard ✅

### Test 4: Book Appointment (Quick Method) ✅
1. From Patient Dashboard
2. Click "Book Appointment" card
3. **Select Specialization:**
   - Choose "Cardiologist"
   - Doctors dropdown should update
4. **Select Doctor:**
   - Should see dropdown with doctors
   - Example: "Dr. John Smith - Cardiologist - ₹800"
   - Select a doctor
5. **Doctor details should appear below**
6. **Select Date:** Choose tomorrow's date
7. **Select Time:** Choose "10:00 AM"
8. **Select Consultation Type:** Click "Video"
9. **Add Symptoms:** "Chest pain"
10. Click "Confirm Appointment"
11. Should show success page ✅
12. Click "Go to My Appointments"

### Test 5: View Appointments ✅
1. Should see appointments list
2. Check appointment shows:
   - Doctor name: "Dr. John Smith"
   - Specialization: "Cardiologist"
   - Date and time
   - Status: "PENDING" (yellow badge)
3. Filter buttons work:
   - Click "Pending" → Shows pending only
   - Click "All" → Shows all
4. All appointments display correctly ✅

### Test 6: Browse Doctors ✅
1. Click "Find Your Doctor" from dashboard
2. Should see 8 doctors in cards
3. **Test Search:**
   - Type "John" in search
   - Should filter to Dr. John Smith
4. **Test Filter:**
   - Select "Pediatrician"
   - Should show only pediatricians
5. Click "Book Appointment" on any doctor
6. Should go to booking page with doctor pre-selected ✅

### Test 7: Doctor Login ✅
1. Logout (should return to landing page)
2. Login as doctor:
   - Email: `doctor1@test.com`
   - Password: `password123`
3. Should see Doctor Dashboard ✅

### Test 8: Doctor Dashboard ✅
1. Should see statistics:
   - Total Patients
   - Total Consultations
   - Today's Appointments
2. Should see "Pending Appointments" section
3. Should see appointment from Test Patient ✅

### Test 9: Accept Appointment ✅
1. Find pending appointment
2. Click "Accept" button
3. Status should change to "Accepted"
4. Appointment should move from pending list ✅

### Test 10: View Prescriptions ✅
1. Login as patient2@test.com
2. Go to "Prescriptions"
3. Should see 1 prescription
4. Click "View Details"
5. Should show:
   - Doctor name
   - Diagnosis
   - Medicines list
   - Advice
6. Click "Download" ✅

### Test 11: Upload Medical Report ✅
1. Login as patient
2. Go to "Medical Reports"
3. Click "Upload Report"
4. Fill form:
   - Report Type: Blood Test
   - Report Name: CBC Test
   - Description: Regular checkup
   - Select file
5. Click "Upload"
6. Should see report in list ✅

### Test 12: Notifications ✅
1. Click notifications icon (bell)
2. Should see notification count
3. Click to view notifications
4. Should see appointment notifications
5. Click "Mark as Read"
6. Count should decrease ✅

### Test 13: Logout ✅
1. Click "Logout" button
2. Should redirect to landing page
3. Try accessing `/patient/dashboard`
4. Should redirect to login ✅

---

## 🐛 Common Issues & Solutions

### Issue 1: Doctor Dropdown Empty
**Solution:**
- Check backend is running
- Check MongoDB has doctors (run `npm run seed`)
- Check browser console for errors
- Refresh page

### Issue 2: Login Failed
**Solution:**
- Ensure database is seeded: `npm run seed`
- Use correct credentials:
  - Patient: patient1@test.com / password123
  - Doctor: doctor1@test.com / password123

### Issue 3: Appointments Not Showing
**Solution:**
- Check you're logged in as correct user
- Check backend console for errors
- Verify MongoDB connection
- Try booking a new appointment

### Issue 4: Can't Upload Files
**Solution:**
- Check `server/uploads/` folder exists
- Check file size < 10MB
- Check file type (jpg, png, pdf, doc)

---

## 📋 Feature Checklist

### Landing Page
- [x] Navigation works
- [x] About page loads
- [x] Contact page loads
- [x] Login/Register buttons work

### Authentication
- [x] Patient registration works
- [x] Doctor registration works
- [x] Login works
- [x] Logout redirects to landing
- [x] Protected routes work

### Patient Features
- [x] Dashboard loads
- [x] Book appointment (quick method)
- [x] Book appointment (browse doctors)
- [x] View appointments
- [x] Filter appointments by status
- [x] Cancel appointments
- [x] View prescriptions
- [x] Upload medical reports
- [x] View notifications
- [x] Search doctors
- [x] Filter doctors by specialization

### Doctor Features
- [x] Dashboard with statistics
- [x] View pending appointments
- [x] Accept/Reject appointments
- [x] View patient details
- [x] View appointments list

### Appointment System
- [x] Specialization dropdown works
- [x] Doctor dropdown shows all doctors
- [x] Doctor details display
- [x] Date picker works
- [x] Time slots available
- [x] Consultation type selection
- [x] Symptoms field
- [x] Success confirmation
- [x] Appointments show doctor name
- [x] Status color coding works

---

## 🎯 Quick Test Commands

### Reset Database
```bash
cd server
npm run seed
```

### Check Backend Logs
```bash
cd server
npm start
# Watch console for errors
```

### Check Frontend Logs
- Open browser console (F12)
- Check for errors
- Check Network tab for API calls

---

## ✅ All Features Working!

If all tests pass, your application is fully functional! 🎉

### Test Credentials Summary

**Patients:**
- patient1@test.com / password123
- patient2@test.com / password123
- patient3@test.com / password123

**Doctors:**
- doctor1@test.com / password123 (Cardiologist)
- doctor2@test.com / password123 (Pediatrician)
- doctor3@test.com / password123 (Dermatologist)
- doctor4@test.com / password123 (Orthopedic)
- doctor5@test.com / password123 (General Physician)
