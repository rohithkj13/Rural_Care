# RuralCare Connect

RuralCare Connect is a full-stack healthcare access application that helps patients connect with doctors and manage common care tasks online. It provides patient, doctor, and administrator workflows through a React web application and an Express API backed by MongoDB.

## Features

### Patient Features

- Register, sign in, and manage a patient profile.
- Browse doctors, view doctor profiles, and submit or review doctor ratings.
- Book and manage appointments.
- Join real-time consultations with WebRTC video and Socket.IO signaling and chat.
- Use symptom-checking pages with optional speech input and spoken output where supported by the browser.
- View prescriptions and upload or manage medical reports.
- Manage medicine reminders and notifications.
- Browse health-feed posts and order listed laboratory tests.
- Track fitness activity and food entries.
- Register as a blood donor and create or follow blood requests.
- Submit support complaints.

### Doctor Features

- View a doctor dashboard and manage appointments.
- View patients and their medical reports.
- Create prescriptions and participate in consultations.
- Review assigned patients' fitness information and set fitness goals.
- Manage a doctor profile and notifications.

### Administrator Features

- View dashboard statistics and analytics, and download reports.
- Manage doctors and patients.
- Review prescriptions and symptom logs.
- Respond to patient complaints.
- Manage health-feed content, laboratory tests and orders, blood donors, and blood requests.

## Technology Stack

- **Frontend:** React 18, React Router, Tailwind CSS, Axios, Recharts, React Leaflet, and Socket.IO client.
- **Backend:** Node.js, Express, and Socket.IO.
- **Database:** MongoDB with Mongoose.
- **Authentication and access control:** JSON Web Tokens (JWT) and bcryptjs.
- **File uploads:** Multer.
- **Consultation media:** Browser WebRTC APIs, with Socket.IO used for signaling and chat.

## Project Structure

```text
RuralConnect/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       └── utils/
├── database/               # Database documentation
├── server/                 # Express API and Socket.IO server
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── uploads/
├── install.bat
└── start.bat
```

## Prerequisites

1. Install Node.js and npm.
2. Provide access to a MongoDB instance, either local or hosted.
3. Use a modern browser for the React application. WebRTC and speech features depend on browser support and permissions.

## Installation

1. Install backend dependencies:

   ```bash
   cd server
   npm install
   ```

2. Create `server/.env` and add the backend settings from [Environment Configuration](#environment-configuration).
3. Install frontend dependencies in a separate terminal:

   ```bash
   cd client
   npm install
   ```

## Environment Configuration

Create `server/.env` with values for your local environment. Replace the placeholders and do not commit real credentials or secrets.

```dotenv
PORT=5000
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<replace_with_a_long_random_secret>
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

- `PORT` is optional; the server defaults to `5000`.
- `MONGODB_URI` points to the MongoDB database.
- `JWT_SECRET` is used to sign and verify authentication tokens.
- `JWT_EXPIRE` is optional; tokens default to `7d`.
- `CLIENT_URL` is used as the Socket.IO CORS origin.

The shared Axios API client also reads an optional `REACT_APP_API_URL` frontend build variable and otherwise uses `http://localhost:5000/api`. The authentication context currently requests `/api/auth/me` from the hard-coded local API URL, so changing this variable does not change that request.

## Running the Frontend and Backend

1. Start the backend from the `server` directory:

   ```bash
   npm start
   ```

   The API listens on port `5000` by default. The root endpoint is `http://localhost:5000/`.

2. Start the frontend from the `client` directory in a separate terminal:

   ```bash
   npm start
   ```

   The React development server is provided by `react-scripts`.

The backend also provides `npm run dev` for starting with Nodemon. The frontend package defines `npm run build` for creating a production build.

## API Endpoints

The API is mounted at `/api`. The routes below are defined by the backend; `:id`, `:patientId`, `:index`, and `:slug` represent path parameters.

### Health

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | API status message |

### Authentication

| Method | Endpoint |
| --- | --- |
| `POST` | `/api/auth/register` |
| `POST` | `/api/auth/login` |
| `POST` | `/api/auth/admin-login` |
| `GET` | `/api/auth/me` |
| `PUT` | `/api/auth/profile` |

### Doctors and Reviews

| Method | Endpoint |
| --- | --- |
| `GET` | `/api/doctors` |
| `GET` | `/api/doctors/stats` |
| `GET` | `/api/doctors/reviews/mine` |
| `GET` | `/api/doctors/:id` |
| `GET` | `/api/doctors/:id/reviews` |
| `POST` | `/api/doctors/:id/review` |
| `DELETE` | `/api/doctors/:id/review` |

### Appointments and Consultations

| Method | Endpoint |
| --- | --- |
| `POST` | `/api/appointments` |
| `GET` | `/api/appointments` |
| `GET` | `/api/appointments/patient` |
| `GET` | `/api/appointments/:id` |
| `PUT` | `/api/appointments/:id/status` |
| `PUT` | `/api/appointments/:id/cancel` |
| `POST` | `/api/consultations` |
| `GET` | `/api/consultations` |
| `PUT` | `/api/consultations/:id/end` |

### Prescriptions and Medical Reports

| Method | Endpoint |
| --- | --- |
| `POST` | `/api/prescriptions` |
| `GET` | `/api/prescriptions` |
| `GET` | `/api/prescriptions/:id` |
| `GET` | `/api/prescriptions/search-patient` |
| `POST` | `/api/reports` |
| `GET` | `/api/reports` |
| `GET` | `/api/reports/:id` |
| `GET` | `/api/reports/patient/:patientId` |
| `PUT` | `/api/reports/:id/doctor-note` |
| `DELETE` | `/api/reports/:id` |

### Notifications and Medicine Reminders

| Method | Endpoint |
| --- | --- |
| `GET` | `/api/notifications` |
| `PUT` | `/api/notifications/:id/read` |
| `PUT` | `/api/notifications/read-all` |
| `POST` | `/api/reminders` |
| `GET` | `/api/reminders` |
| `PUT` | `/api/reminders/:id` |
| `DELETE` | `/api/reminders/:id` |

### Health Feed

| Method | Endpoint |
| --- | --- |
| `GET` | `/api/health-feed` |
| `GET` | `/api/health-feed/slug/:slug` |
| `PUT` | `/api/health-feed/:id/like` |
| `GET` | `/api/health-feed/admin/all` |
| `POST` | `/api/health-feed` |
| `PUT` | `/api/health-feed/:id` |
| `DELETE` | `/api/health-feed/:id` |

### Laboratory Tests

| Method | Endpoint |
| --- | --- |
| `GET` | `/api/lab/tests` |
| `POST` | `/api/lab/tests` |
| `PUT` | `/api/lab/tests/:id` |
| `DELETE` | `/api/lab/tests/:id` |
| `POST` | `/api/lab/orders` |
| `GET` | `/api/lab/orders/mine` |
| `PUT` | `/api/lab/orders/:id/cancel` |
| `GET` | `/api/lab/orders` |
| `PUT` | `/api/lab/orders/:id/status` |

### Fitness

| Method | Endpoint |
| --- | --- |
| `GET` | `/api/fitness/today` |
| `PUT` | `/api/fitness/today` |
| `GET` | `/api/fitness/history` |
| `POST` | `/api/fitness/food` |
| `DELETE` | `/api/fitness/food/:index` |
| `POST` | `/api/fitness/workout` |
| `DELETE` | `/api/fitness/workout/:index` |
| `GET` | `/api/fitness/doctor/patients` |
| `GET` | `/api/fitness/doctor/patient/:patientId` |
| `PUT` | `/api/fitness/doctor/patient/:patientId/goals` |

### Blood Donors and Requests

| Method | Endpoint |
| --- | --- |
| `GET` | `/api/blood/donors` |
| `POST` | `/api/blood/donors` |
| `GET` | `/api/blood/donors/me` |
| `PUT` | `/api/blood/donors/me` |
| `GET` | `/api/blood/donors/admin` |
| `PUT` | `/api/blood/donors/:id` |
| `DELETE` | `/api/blood/donors/:id` |
| `GET` | `/api/blood/stats` |
| `POST` | `/api/blood/requests` |
| `GET` | `/api/blood/requests/mine` |
| `GET` | `/api/blood/requests/all` |
| `PUT` | `/api/blood/requests/:id/status` |
| `GET` | `/api/blood/requests` |

### Administration

| Method | Endpoint |
| --- | --- |
| `GET` | `/api/admin/stats` |
| `GET` | `/api/admin/analytics` |
| `GET` | `/api/admin/reports/download` |
| `GET` | `/api/admin/doctors` |
| `POST` | `/api/admin/doctors` |
| `PUT` | `/api/admin/doctors/:id/approve` |
| `PUT` | `/api/admin/doctors/:id` |
| `DELETE` | `/api/admin/doctors/:id` |
| `GET` | `/api/admin/patients` |
| `GET` | `/api/admin/patients/:id/history` |
| `PUT` | `/api/admin/patients/:id` |
| `PUT` | `/api/admin/patients/:id/toggle-status` |
| `GET` | `/api/admin/prescriptions` |
| `GET` | `/api/admin/symptom-logs` |
| `GET` | `/api/admin/complaints` |
| `PUT` | `/api/admin/complaints/:id/respond` |
| `POST` | `/api/admin/complaints` |
| `GET` | `/api/admin/complaints/mine` |

## Troubleshooting

- **MongoDB connection fails:** Confirm `MONGODB_URI` in `server/.env` is correct and that the MongoDB instance is reachable.
- **Authentication or token errors:** Confirm `JWT_SECRET` is set and consistent between server restarts; remove an expired browser token by signing out and signing in again.
- **Frontend cannot reach the API:** Confirm the backend is running on port `5000` and that the frontend is using the expected API base URL.
- **Socket.IO connection issues:** Set `CLIENT_URL` to the frontend origin, such as `http://localhost:3000`.
- **Video or voice features are unavailable:** Check browser support, grant camera/microphone permissions for consultations, and grant microphone permissions for speech recognition.

## 🌐 Live Demo
[Open RuralCare Connect](https://YOUR_LIVE_WEBSITE_URL)
