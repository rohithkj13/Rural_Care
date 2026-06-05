# RuralCare Connect - Database Schema

## Collections

### 1. Users Collection
Stores both patient and doctor information.

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (required, enum: ['patient', 'doctor']),
  phone: String (required),
  
  // Patient-specific fields
  age: Number,
  gender: String (enum: ['male', 'female', 'other']),
  address: String,
  medicalHistory: String,
  
  // Doctor-specific fields
  specialization: String,
  qualification: String,
  experience: Number,
  hospital: String,
  consultationFee: Number,
  rating: Number (default: 0),
  totalRatings: Number (default: 0),
  
  isActive: Boolean (default: true),
  createdAt: Date (default: Date.now)
}
```

### 2. Appointments Collection
Stores appointment bookings between patients and doctors.

```javascript
{
  _id: ObjectId,
  patient: ObjectId (ref: 'User', required),
  doctor: ObjectId (ref: 'User', required),
  date: Date (required),
  time: String (required),
  consultationType: String (required, enum: ['video', 'audio', 'chat']),
  status: String (default: 'pending', enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled']),
  symptoms: String,
  notes: String,
  roomId: String,
  createdAt: Date (default: Date.now)
}
```

### 3. Prescriptions Collection
Stores digital prescriptions created by doctors.

```javascript
{
  _id: ObjectId,
  patient: ObjectId (ref: 'User', required),
  doctor: ObjectId (ref: 'User', required),
  appointment: ObjectId (ref: 'Appointment'),
  diagnosis: String (required),
  medicines: [{
    name: String (required),
    dosage: String (required),
    duration: String (required),
    instructions: String
  }],
  advice: String,
  followUpDate: Date,
  createdAt: Date (default: Date.now)
}
```

### 4. MedicalReports Collection
Stores uploaded medical reports and documents.

```javascript
{
  _id: ObjectId,
  patient: ObjectId (ref: 'User', required),
  reportType: String (required),
  reportName: String (required),
  fileUrl: String (required),
  uploadDate: Date (default: Date.now),
  description: String
}
```

### 5. Consultations Collection
Stores consultation session records.

```javascript
{
  _id: ObjectId,
  appointment: ObjectId (ref: 'Appointment', required),
  patient: ObjectId (ref: 'User', required),
  doctor: ObjectId (ref: 'User', required),
  startTime: Date,
  endTime: Date,
  duration: Number,
  notes: String,
  status: String (default: 'scheduled', enum: ['scheduled', 'ongoing', 'completed']),
  createdAt: Date (default: Date.now)
}
```

### 6. Notifications Collection
Stores user notifications.

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  title: String (required),
  message: String (required),
  type: String (required, enum: ['appointment', 'medicine', 'followup', 'general']),
  isRead: Boolean (default: false),
  createdAt: Date (default: Date.now)
}
```

## Indexes

### Users
- email (unique)
- role
- specialization (for doctors)

### Appointments
- patient
- doctor
- date
- status

### Prescriptions
- patient
- doctor
- createdAt

### MedicalReports
- patient
- uploadDate

### Notifications
- user
- isRead
- createdAt
