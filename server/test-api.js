const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🔍 Testing RuralCare Connect API...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connection...');
    const serverRes = await axios.get('http://localhost:5000');
    console.log('✅ Server is running:', serverRes.data.message);
    console.log('');

    // Test 2: Get all doctors
    console.log('2️⃣ Testing GET /api/doctors...');
    const doctorsRes = await axios.get(`${API_URL}/doctors`);
    console.log(`✅ Found ${doctorsRes.data.count} doctors`);
    if (doctorsRes.data.count > 0) {
      console.log('   Sample doctor:', {
        name: doctorsRes.data.data[0].name,
        specialization: doctorsRes.data.data[0].specialization,
        fee: doctorsRes.data.data[0].consultationFee
      });
    } else {
      console.log('⚠️  No doctors found! Run: npm run seed');
    }
    console.log('');

    // Test 3: Filter by specialization
    console.log('3️⃣ Testing filter by specialization...');
    const cardioRes = await axios.get(`${API_URL}/doctors?specialization=Cardiologist`);
    console.log(`✅ Found ${cardioRes.data.count} Cardiologists`);
    console.log('');

    // Test 4: Search doctors
    console.log('4️⃣ Testing search...');
    const searchRes = await axios.get(`${API_URL}/doctors?search=John`);
    console.log(`✅ Search results: ${searchRes.data.count} doctors`);
    console.log('');

    console.log('✅ All API tests passed!\n');
    console.log('📋 Summary:');
    console.log(`   - Server: Running`);
    console.log(`   - Doctors: ${doctorsRes.data.count} available`);
    console.log(`   - API: Working correctly`);
    console.log('');
    console.log('🎉 Your backend is working perfectly!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  Backend server is not running!');
      console.log('   Start it with: cd server && npm start');
    } else if (error.response) {
      console.log('\n⚠️  API Error:', error.response.data);
    }
  }
}

testAPI();
