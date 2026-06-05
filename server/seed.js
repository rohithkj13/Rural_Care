const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Appointment = require('./models/Appointment');
const Prescription = require('./models/Prescription');
const Notification = require('./models/Notification');
const { LabTest } = require('./models/LabTest');
const HealthPost = require('./models/HealthPost');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    await Notification.deleteMany({});
    await LabTest.deleteMany({});
    await HealthPost.deleteMany({});

    // Create Doctors
    console.log('Creating doctors...');
    const doctors = await User.create([
      {
        name: 'Arjun Sharma',
        email: 'doctor1@test.com',
        password: 'password123',
        role: 'doctor',
        phone: '9876543210',
        specialization: 'Cardiologist',
        qualification: 'MBBS, MD (Cardiology)',
        experience: 15,
        hospital: 'Sanjay Gandhi Hrudayalaya, Lucknow',
        consultationFee: 800,
        rating: 4.8,
        totalRatings: 120
      },
      {
        name: 'Priya Nair',
        email: 'doctor2@test.com',
        password: 'password123',
        role: 'doctor',
        phone: '9876543211',
        specialization: 'Pediatrician',
        qualification: 'MBBS, MD (Pediatrics)',
        experience: 10,
        hospital: 'Kasturba Bal Chikitsalaya, Pune',
        consultationFee: 600,
        rating: 4.9,
        totalRatings: 150
      },
      {
        name: 'Rahul Verma',
        email: 'doctor3@test.com',
        password: 'password123',
        role: 'doctor',
        phone: '9876543212',
        specialization: 'Dermatologist',
        qualification: 'MBBS, MD (Dermatology)',
        experience: 8,
        hospital: 'Nirmal Twacha Clinic, Jaipur',
        consultationFee: 500,
        rating: 4.7,
        totalRatings: 90
      },
      {
        name: 'Kavitha Reddy',
        email: 'doctor4@test.com',
        password: 'password123',
        role: 'doctor',
        phone: '9876543213',
        specialization: 'Orthopedic',
        qualification: 'MBBS, MS (Orthopedics)',
        experience: 12,
        hospital: 'Asthi Vigyan Kendra, Hyderabad',
        consultationFee: 700,
        rating: 4.6,
        totalRatings: 80
      },
      {
        name: 'Suresh Iyer',
        email: 'doctor5@test.com',
        password: 'password123',
        role: 'doctor',
        phone: '9876543214',
        specialization: 'General Physician',
        qualification: 'MBBS, MD',
        experience: 20,
        hospital: 'Gram Swasthya Kendra, Coimbatore',
        consultationFee: 400,
        rating: 4.9,
        totalRatings: 200
      },
      {
        name: 'Meena Krishnan',
        email: 'doctor6@test.com',
        password: 'password123',
        role: 'doctor',
        phone: '9876543215',
        specialization: 'Neurologist',
        qualification: 'MBBS, DM (Neurology)',
        experience: 14,
        hospital: 'Mastishk Vigyan Hospital, Chennai',
        consultationFee: 900,
        rating: 4.8,
        totalRatings: 110
      },
      {
        name: 'Vikram Patel',
        email: 'doctor7@test.com',
        password: 'password123',
        role: 'doctor',
        phone: '9876543216',
        specialization: 'Gynecologist',
        qualification: 'MBBS, MD (Gynecology)',
        experience: 11,
        hospital: 'Mahila Arogya Kendra, Ahmedabad',
        consultationFee: 650,
        rating: 4.7,
        totalRatings: 95
      },
      {
        name: 'Ananya Bose',
        email: 'doctor8@test.com',
        password: 'password123',
        role: 'doctor',
        phone: '9876543217',
        specialization: 'Psychiatrist',
        qualification: 'MBBS, MD (Psychiatry)',
        experience: 9,
        hospital: 'Manas Swasthya Kendra, Kolkata',
        consultationFee: 750,
        rating: 4.9,
        totalRatings: 130
      }
    ]);

    console.log(`Created ${doctors.length} doctors`);

    // Create Patients
    console.log('Creating patients...');
    const patients = await User.create([
      {
        name: 'Divya Menon',
        email: 'patient1@test.com',
        password: 'password123',
        role: 'patient',
        patientId: 'RC-0001',
        phone: '9123456780',
        age: 28,
        gender: 'female',
        address: 'Ward No. 5, Thrissur, Kerala',
        medicalHistory: 'No major health issues'
      },
      {
        name: 'Rajesh Kumar',
        email: 'patient2@test.com',
        password: 'password123',
        role: 'patient',
        patientId: 'RC-0002',
        phone: '9123456781',
        age: 45,
        gender: 'male',
        address: 'Village Rampur, Dist. Sitapur, Uttar Pradesh',
        medicalHistory: 'Hypertension, Diabetes'
      },
      {
        name: 'Sunita Devi',
        email: 'patient3@test.com',
        password: 'password123',
        role: 'patient',
        patientId: 'RC-0003',
        phone: '9123456782',
        age: 35,
        gender: 'female',
        address: 'Gram Panchayat Hosur, Krishnagiri, Tamil Nadu',
        medicalHistory: 'Asthma'
      },
      {
        name: 'Mohan Lal Gupta',
        email: 'patient4@test.com',
        password: 'password123',
        role: 'patient',
        patientId: 'RC-0004',
        phone: '9123456783',
        age: 60,
        gender: 'male',
        address: 'Village Chandpur, Dist. Bijnor, Uttar Pradesh',
        medicalHistory: 'Diabetes Type 2, Knee Arthritis'
      },
      {
        name: 'Lakshmi Bai',
        email: 'patient5@test.com',
        password: 'password123',
        role: 'patient',
        patientId: 'RC-0005',
        phone: '9123456784',
        age: 38,
        gender: 'female',
        address: 'Gram Panchayat Nandgaon, Wardha, Maharashtra',
        medicalHistory: 'Anaemia, PCOS'
      }
    ]);

    console.log(`Created ${patients.length} patients`);

    // Create Sample Appointments
    console.log('Creating appointments...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const appointments = await Appointment.create([
      {
        patient: patients[0]._id,
        patientId: patients[0]._id,
        doctor: doctors[0]._id,
        doctorId: doctors[0]._id,
        doctorName: 'Dr. ' + doctors[0].name,
        specialization: doctors[0].specialization,
        date: tomorrow,
        appointmentDate: tomorrow,
        time: '10:00 AM',
        appointmentTime: '10:00 AM',
        consultationType: 'video',
        status: 'pending',
        symptoms: 'Chest pain and shortness of breath',
        roomId: Date.now().toString()
      },
      {
        patient: patients[0]._id,
        patientId: patients[0]._id,
        doctor: doctors[1]._id,
        doctorId: doctors[1]._id,
        doctorName: 'Dr. ' + doctors[1].name,
        specialization: doctors[1].specialization,
        date: nextWeek,
        appointmentDate: nextWeek,
        time: '02:00 PM',
        appointmentTime: '02:00 PM',
        consultationType: 'audio',
        status: 'accepted',
        symptoms: 'Regular checkup for child',
        roomId: (Date.now() + 1).toString()
      },
      {
        patient: patients[1]._id,
        patientId: patients[1]._id,
        doctor: doctors[4]._id,
        doctorId: doctors[4]._id,
        doctorName: 'Dr. ' + doctors[4].name,
        specialization: doctors[4].specialization,
        date: tomorrow,
        appointmentDate: tomorrow,
        time: '11:00 AM',
        appointmentTime: '11:00 AM',
        consultationType: 'video',
        status: 'accepted',
        symptoms: 'High blood pressure and dizziness',
        roomId: (Date.now() + 2).toString()
      }
    ]);

    console.log(`Created ${appointments.length} appointments`);

    // Create Sample Prescription
    console.log('Creating prescriptions...');
    const prescriptions = await Prescription.create([
      {
        patient: patients[1]._id,
        doctor: doctors[4]._id,
        appointment: appointments[2]._id,
        diagnosis: 'Hypertension - Stage 1',
        medicines: [
          {
            name: 'Amlodipine',
            dosage: '5mg',
            duration: '30 days',
            instructions: 'Take once daily in the morning'
          },
          {
            name: 'Aspirin',
            dosage: '75mg',
            duration: '30 days',
            instructions: 'Take once daily after dinner'
          }
        ],
        advice: 'Reduce salt intake, exercise regularly, monitor blood pressure daily',
        followUpDate: nextWeek
      }
    ]);

    console.log(`Created ${prescriptions.length} prescriptions`);

    // Create Sample Notifications
    console.log('Creating notifications...');
    const notifications = await Notification.create([
      {
        user: patients[0]._id,
        title: 'Appointment Confirmed',
        message: 'Your appointment with Dr. Priya Nair has been confirmed',
        type: 'appointment',
        isRead: false
      },
      {
        user: patients[1]._id,
        title: 'New Prescription',
        message: 'You have received a new prescription from Dr. Suresh Iyer',
        type: 'general',
        isRead: false
      },
      {
        user: doctors[0]._id,
        title: 'New Appointment Request',
        message: 'You have a new appointment request from Divya Menon',
        type: 'appointment',
        isRead: false
      }
    ]);

    console.log(`Created ${notifications.length} notifications`);

    // Create Lab Tests
    console.log('Creating lab tests...');
    const labTests = await LabTest.create([
      { name: 'Complete Blood Count (CBC)', category: 'blood', description: 'Measures different components of blood including RBC, WBC, platelets', price: 350, discountedPrice: 280, reportTime: '6 hours', isHomeCollection: true, emoji: '🩸' },
      { name: 'Blood Sugar Fasting', category: 'diabetes', description: 'Measures blood glucose level after fasting for 8-12 hours', price: 120, discountedPrice: 90, reportTime: '4 hours', isHomeCollection: true, emoji: '🍬' },
      { name: 'HbA1c (Glycated Hemoglobin)', category: 'diabetes', description: 'Average blood sugar levels over past 2-3 months', price: 450, discountedPrice: 380, reportTime: '24 hours', isHomeCollection: true, emoji: '📊' },
      { name: 'Lipid Profile', category: 'cardiac', description: 'Measures cholesterol, triglycerides, HDL, LDL levels', price: 600, discountedPrice: 480, reportTime: '12 hours', isHomeCollection: true, emoji: '❤️' },
      { name: 'Thyroid Profile (T3, T4, TSH)', category: 'thyroid', description: 'Complete thyroid function test', price: 700, discountedPrice: 560, reportTime: '24 hours', isHomeCollection: true, emoji: '🦋' },
      { name: 'Liver Function Test (LFT)', category: 'liver', description: 'Evaluates liver health including SGOT, SGPT, bilirubin', price: 550, discountedPrice: 440, reportTime: '12 hours', isHomeCollection: true, emoji: '🫀' },
      { name: 'Kidney Function Test (KFT)', category: 'kidney', description: 'Measures creatinine, urea, uric acid levels', price: 500, discountedPrice: 400, reportTime: '12 hours', isHomeCollection: true, emoji: '🫘' },
      { name: 'Urine Routine & Microscopy', category: 'urine', description: 'Complete urine analysis for infections and kidney health', price: 150, discountedPrice: 120, reportTime: '4 hours', isHomeCollection: true, emoji: '🧪' },
      { name: 'Vitamin D (25-OH)', category: 'blood', description: 'Measures Vitamin D levels in blood', price: 900, discountedPrice: 720, reportTime: '24 hours', isHomeCollection: true, emoji: '☀️' },
      { name: 'Vitamin B12', category: 'blood', description: 'Measures Vitamin B12 levels', price: 650, discountedPrice: 520, reportTime: '24 hours', isHomeCollection: true, emoji: '💊' },
      { name: 'Full Body Checkup', category: 'full-body', description: 'Comprehensive 60+ parameter health checkup', price: 2500, discountedPrice: 1799, reportTime: '48 hours', isHomeCollection: true, emoji: '🏥', preparationInstructions: '10-12 hours fasting required' },
      { name: 'COVID-19 RT-PCR', category: 'other', description: 'Gold standard test for COVID-19 detection', price: 500, discountedPrice: 400, reportTime: '24 hours', isHomeCollection: true, emoji: '🦠' },
      { name: 'Dengue NS1 Antigen', category: 'blood', description: 'Early detection of dengue fever', price: 600, discountedPrice: 480, reportTime: '6 hours', isHomeCollection: true, emoji: '🦟' },
      { name: 'ECG (Electrocardiogram)', category: 'cardiac', description: 'Records electrical activity of the heart', price: 300, discountedPrice: 250, reportTime: '2 hours', isHomeCollection: false, emoji: '📈' },
      { name: 'Iron Studies (Serum Iron, TIBC, Ferritin)', category: 'blood', description: 'Evaluates iron levels and storage in body', price: 800, discountedPrice: 640, reportTime: '24 hours', isHomeCollection: true, emoji: '⚙️' }
    ]);
    console.log(`Created ${labTests.length} lab tests`);

    // Create Health Posts
    console.log('Creating health posts...');
    const healthPosts = await HealthPost.create([
      {
        title: '10 Simple Ways to Keep Your Heart Healthy',
        category: 'nutrition',
        summary: 'Heart disease is the leading cause of death worldwide. These 10 simple lifestyle changes can dramatically reduce your risk.',
        content: `## Why Heart Health Matters\n\nYour heart beats about 100,000 times a day. Taking care of it is the most important thing you can do for your health.\n\n## 10 Tips for a Healthy Heart\n\n1. **Eat more fruits and vegetables** - Aim for 5 servings daily\n2. **Exercise regularly** - 30 minutes of moderate activity, 5 days a week\n3. **Quit smoking** - Risk drops significantly within 1 year of quitting\n4. **Limit alcohol** - No more than 1-2 drinks per day\n5. **Manage stress** - Practice yoga, meditation, or deep breathing\n6. **Get enough sleep** - 7-9 hours per night\n7. **Monitor blood pressure** - Keep it below 120/80 mmHg\n8. **Control cholesterol** - Reduce saturated fats in diet\n9. **Maintain healthy weight** - BMI between 18.5-24.9\n10. **Regular checkups** - Annual cardiac screening after age 40\n\n## When to See a Doctor\n\nSeek immediate help if you experience chest pain, shortness of breath, or irregular heartbeat.`,
        coverEmoji: '❤️',
        tags: ['heart', 'cardiology', 'lifestyle', 'prevention'],
        author: 'Dr. Arjun Sharma, Cardiologist',
        readTime: 5,
        views: 1240,
        likes: 89
      },
      {
        title: 'Managing Diabetes: A Complete Guide for Rural Patients',
        category: 'disease-prevention',
        summary: 'Diabetes affects millions in India. Learn how to manage blood sugar effectively with diet, exercise, and medication.',
        content: `## Understanding Diabetes\n\nDiabetes is a chronic condition where the body cannot properly process blood sugar (glucose).\n\n## Types of Diabetes\n\n- **Type 1**: Body doesn't produce insulin\n- **Type 2**: Body doesn't use insulin effectively (most common)\n- **Gestational**: Occurs during pregnancy\n\n## Managing Blood Sugar\n\n### Diet Tips\n- Eat small, frequent meals\n- Avoid white rice, maida, sugary drinks\n- Include whole grains, vegetables, legumes\n- Limit fruits high in sugar (mango, banana)\n\n### Exercise\n- Walk 30 minutes after meals\n- Yoga and light stretching\n- Avoid strenuous exercise if sugar is very high\n\n### Medication\n- Take medicines at the same time daily\n- Never skip doses\n- Monitor blood sugar regularly\n\n## Warning Signs\n\nSeek medical help for: excessive thirst, frequent urination, blurred vision, slow-healing wounds.`,
        coverEmoji: '🍬',
        tags: ['diabetes', 'blood sugar', 'diet', 'rural health'],
        author: 'Dr. Suresh Iyer, General Physician',
        readTime: 7,
        views: 2100,
        likes: 156
      },
      {
        title: 'Child Vaccination Schedule: What Every Parent Must Know',
        category: 'child-health',
        summary: 'Vaccines protect your child from deadly diseases. Here is the complete immunization schedule recommended by Indian Academy of Pediatrics.',
        content: `## Why Vaccination is Critical\n\nVaccines have eliminated or drastically reduced diseases like polio, smallpox, and measles.\n\n## IAP Recommended Schedule\n\n### At Birth\n- BCG (Tuberculosis)\n- Hepatitis B (1st dose)\n- OPV 0 (Polio)\n\n### 6 Weeks\n- DTwP/DTaP (Diphtheria, Tetanus, Pertussis)\n- IPV (Polio)\n- Hib (Haemophilus influenzae)\n- Hepatitis B (2nd dose)\n- Rotavirus\n- PCV (Pneumococcal)\n\n### 9-12 Months\n- MMR (Measles, Mumps, Rubella)\n- Typhoid\n- Hepatitis A\n\n### 15-18 Months\n- Booster doses of DTwP, IPV, Hib, PCV\n- Varicella (Chickenpox)\n\n## Common Side Effects\n\nMild fever and soreness at injection site are normal. Give paracetamol if needed.`,
        coverEmoji: '👶',
        tags: ['vaccination', 'children', 'immunization', 'pediatrics'],
        author: 'Dr. Priya Nair, Pediatrician',
        readTime: 6,
        views: 3200,
        likes: 245
      },
      {
        title: 'Mental Health in Rural India: Breaking the Stigma',
        category: 'mental-health',
        summary: 'Mental health issues affect 1 in 5 Indians, yet most go untreated due to stigma. Learn to recognize symptoms and seek help.',
        content: `## The Mental Health Crisis\n\nIndia has one of the highest rates of depression and anxiety globally, yet mental health remains taboo in rural communities.\n\n## Common Mental Health Conditions\n\n### Depression\n- Persistent sadness for 2+ weeks\n- Loss of interest in activities\n- Changes in sleep and appetite\n- Feelings of worthlessness\n\n### Anxiety\n- Excessive worry\n- Panic attacks\n- Avoidance of social situations\n\n### Stress\n- Physical symptoms: headache, chest tightness\n- Irritability, difficulty concentrating\n\n## How to Help Yourself\n\n1. Talk to someone you trust\n2. Maintain a daily routine\n3. Exercise and eat well\n4. Limit alcohol and tobacco\n5. Practice mindfulness\n\n## Seeking Professional Help\n\nMental illness is a medical condition, not a weakness. Consult a psychiatrist or counselor. Telemedicine makes this accessible from home.`,
        coverEmoji: '🧘',
        tags: ['mental health', 'depression', 'anxiety', 'stigma'],
        author: 'Dr. Ananya Bose, Psychiatrist',
        readTime: 8,
        views: 1800,
        likes: 203
      },
      {
        title: 'Women Health: Understanding PCOS and Its Management',
        category: 'women-health',
        summary: 'PCOS affects 1 in 5 Indian women. Learn about symptoms, diagnosis, and effective management strategies.',
        content: `## What is PCOS?\n\nPolycystic Ovary Syndrome (PCOS) is a hormonal disorder causing enlarged ovaries with small cysts.\n\n## Symptoms\n\n- Irregular or missed periods\n- Excess facial/body hair (hirsutism)\n- Acne and oily skin\n- Weight gain, especially around abdomen\n- Hair thinning on scalp\n- Difficulty getting pregnant\n\n## Diagnosis\n\nDiagnosed by 2 of 3 criteria:\n1. Irregular periods\n2. High androgen levels (blood test)\n3. Polycystic ovaries (ultrasound)\n\n## Management\n\n### Lifestyle Changes (Most Important)\n- Lose 5-10% body weight if overweight\n- Low glycemic index diet\n- Regular exercise (yoga, walking)\n- Stress management\n\n### Medical Treatment\n- Birth control pills to regulate periods\n- Metformin for insulin resistance\n- Clomiphene for fertility\n\n## When to See a Doctor\n\nConsult a gynecologist if you have irregular periods, difficulty conceiving, or severe acne.`,
        coverEmoji: '👩‍⚕️',
        tags: ['PCOS', 'women health', 'hormones', 'fertility'],
        author: 'Dr. Vikram Patel, Gynecologist',
        readTime: 6,
        views: 2800,
        likes: 312
      },
      {
        title: 'Back Pain Relief: Exercises and Posture Tips',
        category: 'fitness',
        summary: 'Back pain affects 80% of people at some point. These simple exercises and posture corrections can provide lasting relief.',
        content: `## Why Back Pain is So Common\n\nModern sedentary lifestyles, poor posture, and heavy lifting are the main culprits.\n\n## Exercises for Back Pain Relief\n\n### Cat-Cow Stretch\n- Get on hands and knees\n- Arch back up (cat), then dip it down (cow)\n- Repeat 10 times\n\n### Child's Pose\n- Kneel and sit back on heels\n- Stretch arms forward on floor\n- Hold 30 seconds\n\n### Knee-to-Chest Stretch\n- Lie on back\n- Pull one knee to chest\n- Hold 20 seconds, switch sides\n\n### Bridge Exercise\n- Lie on back, knees bent\n- Lift hips off floor\n- Hold 5 seconds, repeat 10 times\n\n## Posture Tips\n\n- Keep screen at eye level\n- Use lumbar support when sitting\n- Take breaks every 30 minutes\n- Sleep on a firm mattress\n\n## When to See a Doctor\n\nSeek help if pain radiates to legs, causes numbness, or doesn't improve in 2 weeks.`,
        coverEmoji: '🦴',
        tags: ['back pain', 'exercise', 'posture', 'orthopedic'],
        author: 'Dr. Kavitha Reddy, Orthopedic',
        readTime: 5,
        views: 1560,
        likes: 134
      },
      {
        title: 'Healthy Eating on a Budget: Nutrition for Rural Families',
        category: 'nutrition',
        summary: 'Good nutrition doesn\'t have to be expensive. Learn how to eat healthy with locally available, affordable foods.',
        content: `## Nutrition on a Budget\n\nHealthy eating is possible even with limited resources. Local, seasonal foods are often the most nutritious.\n\n## Affordable Superfoods\n\n### Pulses & Legumes (Dal, Rajma, Chana)\n- Excellent protein source\n- Rich in fiber and iron\n- Very affordable\n\n### Green Leafy Vegetables (Spinach, Methi, Amaranth)\n- High in iron, calcium, vitamins\n- Locally available and cheap\n\n### Eggs\n- Complete protein\n- Rich in vitamins B12, D\n- Affordable and versatile\n\n### Millets (Bajra, Jowar, Ragi)\n- High fiber, low glycemic index\n- Traditional Indian grains\n- Very nutritious\n\n## Meal Planning Tips\n\n1. Cook in bulk to save time and fuel\n2. Use seasonal vegetables\n3. Avoid packaged/processed foods\n4. Drink enough water (8 glasses/day)\n5. Eat together as a family\n\n## Foods to Limit\n\n- White rice and maida\n- Fried snacks\n- Sugary drinks\n- Excess salt`,
        coverEmoji: '🥗',
        tags: ['nutrition', 'diet', 'budget', 'rural', 'healthy eating'],
        author: 'RuralCare Medical Team',
        readTime: 5,
        views: 980,
        likes: 87
      },
      {
        title: 'Senior Health: Staying Active and Independent After 60',
        category: 'senior-health',
        summary: 'Aging well is about staying active, connected, and managing chronic conditions. Here are practical tips for seniors.',
        content: `## Healthy Aging\n\nAging is inevitable, but how you age is largely in your control. Small daily habits make a big difference.\n\n## Physical Health\n\n### Exercise\n- Walk 20-30 minutes daily\n- Chair yoga for flexibility\n- Balance exercises to prevent falls\n- Light strength training\n\n### Nutrition\n- Increase calcium and Vitamin D\n- Eat protein at every meal\n- Stay hydrated (thirst decreases with age)\n- Limit salt for blood pressure\n\n### Regular Screenings\n- Blood pressure every 6 months\n- Blood sugar annually\n- Eye and hearing tests\n- Bone density scan (women)\n\n## Mental Health\n\n- Stay socially connected\n- Learn new skills\n- Read, do puzzles\n- Volunteer in community\n\n## Medication Management\n\n- Use a pill organizer\n- Never stop medicines without doctor's advice\n- Review all medicines with doctor annually\n\n## Fall Prevention\n\n- Remove loose rugs\n- Install grab bars in bathroom\n- Wear non-slip footwear\n- Ensure good lighting`,
        coverEmoji: '👴',
        tags: ['senior health', 'aging', 'elderly', 'active lifestyle'],
        author: 'RuralCare Medical Team',
        readTime: 7,
        views: 1100,
        likes: 98
      }
    ]);
    console.log(`Created ${healthPosts.length} health posts`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('\n👨‍⚕️ Doctors:');
    console.log('Email: doctor1@test.com | Password: password123 | Name: Dr. Arjun Sharma | Cardiologist');
    console.log('Email: doctor2@test.com | Password: password123 | Name: Dr. Priya Nair | Pediatrician');
    console.log('Email: doctor3@test.com | Password: password123 | Name: Dr. Rahul Verma | Dermatologist');
    console.log('Email: doctor4@test.com | Password: password123 | Name: Dr. Kavitha Reddy | Orthopedic');
    console.log('Email: doctor5@test.com | Password: password123 | Name: Dr. Suresh Iyer | General Physician');
    console.log('Email: doctor6@test.com | Password: password123 | Name: Dr. Meena Krishnan | Neurologist');
    console.log('Email: doctor7@test.com | Password: password123 | Name: Dr. Vikram Patel | Gynecologist');
    console.log('Email: doctor8@test.com | Password: password123 | Name: Dr. Ananya Bose | Psychiatrist');
    console.log('\n👤 Patients:');
    console.log('Email: patient1@test.com | Password: password123 | Name: Divya Menon');
    console.log('Email: patient2@test.com | Password: password123 | Name: Rajesh Kumar');
    console.log('Email: patient3@test.com | Password: password123 | Name: Sunita Devi');
    console.log('Email: patient4@test.com | Password: password123 | Name: Mohan Lal Gupta');
    console.log('Email: patient5@test.com | Password: password123 | Name: Lakshmi Bai');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
