# Database Seed Guide - RuralCare Connect

## How to Populate Database with Sample Data

### Step 1: Run the Seed Script

Open terminal in the server directory and run:

```bash
cd server
npm run seed
```

### Step 2: Wait for Completion

You'll see output like:
```
MongoDB Connected
Clearing existing data...
Creating doctors...
Created 8 doctors
Creating patients...
Created 3 patients
Creating appointments...
Created 3 appointments
Creating prescriptions...
Created 1 prescriptions
Creating notifications...
Created 3 notifications

✅ Database seeded successfully!
```

---

## Sample Data Created

### 👨⚕️ Doctors (8 doctors)

| Email | Password | Name | Specialization | Fee |
|-------|----------|------|----------------|-----|
| doctor1@test.com | password123 | Dr. John Smith | Cardiologist | ₹800 |
| doctor2@test.com | password123 | Dr. Sarah Johnson | Pediatrician | ₹600 |
| doctor3@test.com | password123 | Dr. Michael Brown | Dermatologist | ₹500 |
| doctor4@test.com | password123 | Dr. Emily Davis | Orthopedic | ₹700 |
| doctor5@test.com | password123 | Dr. David Wilson | General Physician | ₹400 |
| doctor6@test.com | password123 | Dr. Lisa Anderson | Neurologist | ₹900 |
| doctor7@test.com | password123 | Dr. Robert Taylor | Gynecologist | ₹650 |
| doctor8@test.com | password123 | Dr. Jennifer Martinez | Psychiatrist | ₹750 |

### 👤 Patients (3 patients)

| Email | Password | Name | Age | Gender |
|-------|----------|------|-----|--------|
| patient1@test.com | password123 | Alice Cooper | 28 | Female |
| patient2@test.com | password123 | Bob Martin | 45 | Male |
| patient3@test.com | password123 | Carol White | 35 | Female |

### 📅 Appointments (3 appointments)

1. **Alice Cooper** → Dr. John Smith (Cardiologist)
   - Date: Tomorrow
   - Time: 10:00 AM
   - Type: Video
   - Status: Pending

2. **Alice Cooper** → Dr. Sarah Johnson (Pediatrician)
   - Date: Next Week
   - Time: 02:00 PM
   - Type: Audio
   - Status: Accepted

3. **Bob Martin** → Dr. David Wilson (General Physician)
   - Date: Tomorrow
   - Time: 11:00 AM
   - Type: Video
   - Status: Accepted

### 💊 Prescriptions (1 prescription)

- **Patient:** Bob Martin
- **Doctor:** Dr. David Wilson
- **Diagnosis:** Hypertension - Stage 1
- **Medicines:** Amlodipine 5mg, Aspirin 75mg

### 🔔 Notifications (3 notifications)

- Appointment confirmations
- New prescription alerts
- New appointment requests

---

## Testing the Application

### Test as Patient

1. **Login:**
   - Email: `patient1@test.com`
   - Password: `password123`

2. **Browse Doctors:**
   - Go to "Find Your Doctor"
   - See 8 doctors listed
   - Search by name
   - Filter by specialization

3. **View Appointments:**
   - Go to "My Appointments"
   - See 2 appointments for Alice Cooper
   - Filter by status

4. **Book New Appointment:**
   - Click "Find Your Doctor"
   - Select any doctor
   - Click "Book Appointment"
   - Fill form and submit

### Test as Doctor

1. **Login:**
   - Email: `doctor1@test.com`
   - Password: `password123`

2. **View Dashboard:**
   - See statistics
   - View pending appointments

3. **Manage Appointments:**
   - Accept/Reject appointments
   - View patient details

---

## Re-seed Database

To clear and re-populate the database:

```bash
cd server
npm run seed
```

This will:
- Delete all existing data
- Create fresh sample data
- Reset to initial state

---

## Quick Start After Seeding

1. **Start Backend:**
```bash
cd server
npm start
```

2. **Start Frontend:**
```bash
cd client
npm start
```

3. **Login and Test:**
   - Use any credentials from tables above
   - Explore all features
   - Book appointments
   - View prescriptions

---

## What You Can Test

✅ **Doctor List Page**
- 8 doctors available
- Search functionality
- Filter by specialization
- View doctor details

✅ **Appointments**
- View existing appointments
- Book new appointments
- Filter by status
- Cancel appointments

✅ **Prescriptions**
- View sample prescription
- Download prescription

✅ **Notifications**
- See appointment alerts
- Mark as read

✅ **Dashboard**
- Patient dashboard with stats
- Doctor dashboard with analytics

---

## All Set! 🎉

Your database is now populated with sample data and ready for testing!
