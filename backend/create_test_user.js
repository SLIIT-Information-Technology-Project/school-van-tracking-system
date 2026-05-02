import axios from 'axios';

async function registerTestUser() {
  const payload = {
    name: 'Test Driver',
    email: 'test@example.com',
    password: 'password123',
    plateNumber: 'TST-1234',
    role: 'driver'
  };

  try {
    const response = await axios.post('http://localhost:5000/api/driver/register', payload);
    console.log('✅ Success:', response.data.message);
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('ℹ️ User already exists');
    } else {
      console.error('❌ Error:', error.response?.data || error.message);
    }
  }
}

registerTestUser();
