# 🔧 Troubleshooting Guide - RuralCare Connect

## Issue: "No doctors available" in dropdown

### Solution Steps:

### Step 1: Check if Backend is Running
Open terminal and check if you see:
```
Server running on port 5000
MongoDB Connected Successfully
```

If not, start backend:
```bash
cd server
npm start
```

### Step 2: Check if Database has Doctors
Run seed script:
```bash
cd server
npm run seed
```

You should see:
```
Created 8 doctors
Created 3 patients
Created 3 appointments
✅ Database seeded successfully!
```

### Step 3: Test API Manually
Open browser and go to:
```
http://localhost:5000/api/doctors
```

You should see JSON with 8 doctors. If you see an error or empty array, database is not seeded.

### Step 4: Check Frontend Console
1. Open browser (Chrome/Firefox)
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for errors (red text)
5. Check Network tab for failed requests

### Step 5: Clear Browser Cache
1. Press Ctrl+Shift+Delete
2. Clear cache and cookies
3. Refresh page (Ctrl+F5)

### Step 6: Restart Everything
```bash
# Terminal 1 - Stop and restart backend
cd server
# Press Ctrl+C to stop
npm start

# Terminal 2 - Stop and restart frontend
cd client
# Press Ctrl+C to stop
npm start
```

---

## Quick Fix Commands

### Reset Everything:
```bash
# Terminal 1
cd server
npm run seed
npm start

# Terminal 2
cd client
npm start
```

### Check if MongoDB is Running:
```bash
mongod --version
```

If not installed, install MongoDB Community Edition.

---

## Common Issues

### Issue 1: CORS Error
**Symptom:** Console shows "CORS policy" error
**Fix:** 
- Check backend .env has: `CLIENT_URL=http://localhost:3000`
- Restart backend

### Issue 2: Connection Refused
**Symptom:** "ERR_CONNECTION_REFUSED"
**Fix:**
- Backend is not running
- Run: `cd server && npm start`

### Issue 3: Empty Dropdown
**Symptom:** Dropdown shows "No doctors available"
**Fix:**
- Run: `cd server && npm run seed`
- Refresh browser

### Issue 4: Login Failed
**Symptom:** "Invalid credentials"
**Fix:**
- Run seed script again: `npm run seed`
- Use: patient1@test.com / password123

---

## Verify Everything Works

### Test 1: Backend API
```
http://localhost:5000/api/doctors
```
Should show 8 doctors in JSON format

### Test 2: Frontend
```
http://localhost:3000
```
Should show landing page

### Test 3: Login
- Email: patient1@test.com
- Password: password123
- Should redirect to dashboard

### Test 4: Book Appointment
- Click "Book Appointment"
- Specialization dropdown should work
- Doctor dropdown should show 8 doctors
- Select doctor and fill form
- Submit should work

---

## Still Not Working?

### Check These:

1. **Node.js Version:**
   ```bash
   node --version
   ```
   Should be v14 or higher

2. **MongoDB Running:**
   ```bash
   # Windows
   net start MongoDB
   ```

3. **Ports Available:**
   - Backend: 5000
   - Frontend: 3000
   - MongoDB: 27017

4. **Environment Variables:**
   Check `server/.env` file exists with:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ruralcare
   JWT_SECRET=ruralcare_secret_key_2024_secure
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:3000
   ```

---

## Success Checklist

✅ Backend running on port 5000
✅ Frontend running on port 3000
✅ MongoDB connected
✅ Database seeded (8 doctors)
✅ Can access http://localhost:5000/api/doctors
✅ Can login with patient1@test.com
✅ Doctor dropdown shows 8 doctors
✅ Can book appointment

---

## Need Help?

1. Check browser console (F12)
2. Check backend terminal for errors
3. Verify all steps above
4. Try restarting everything

**If all steps completed, application should work perfectly!** 🎉
