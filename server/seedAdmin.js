const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Always delete and recreate so password is freshly hashed
    await User.deleteOne({ email: 'admin@ruralcare.com' });

    await User.create({
      name: 'Ramesh Gupta',
      email: 'admin@ruralcare.com',
      password: 'admin123',
      phone: '9999999999',
      role: 'admin',
      isApproved: true,
      isActive: true
    });

    console.log('✅ Admin created successfully!');
    console.log('   Email:    admin@ruralcare.com');
    console.log('   Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

seedAdmin();
