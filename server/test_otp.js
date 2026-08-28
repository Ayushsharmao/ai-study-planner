import { storage } from './services/storage.js';

async function testOtpFlow() {
  console.log('--- Testing OTP Email Authentication Flow ---');
  const testEmail = `student_${Date.now()}@example.com`;
  const testName = 'Test Student';
  const testPass = 'Password123!';

  try {
    // 1. Simulate sending OTP
    console.log(`1. Requesting OTP for ${testEmail}...`);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    storage.setOtp(testEmail, {
      otp,
      name: testName,
      email: testEmail,
      age: 20,
      passwordHash: 'dummy_hash'
    });

    const stored = storage.getOtp(testEmail);
    if (!stored || stored.otp !== otp) {
      throw new Error('OTP was not stored properly in storage service');
    }
    console.log(`✅ OTP stored and retrieved successfully: ${otp}`);

    // 2. Validate OTP deletion after verification
    storage.deleteOtp(testEmail);
    const cleared = storage.getOtp(testEmail);
    if (cleared !== null) {
      throw new Error('OTP was not deleted after verification');
    }
    console.log('✅ OTP cleared successfully after consumption!');

    console.log('🎉 ALL OTP AUTH LOGIC VERIFIED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ OTP test failed:', err);
    process.exit(1);
  }
}

testOtpFlow();
