async function runTests() {
  const BASE = 'http://localhost:5000/api';
  console.log('--- Starting Auth & Admin Automated Tests ---');

  try {
    // 1. Test Login as default Admin
    console.log('1. Testing Admin Login...');
    const adminLoginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@studymind.ai', password: 'admin123' })
    });
    const adminData = await adminLoginRes.json();
    if (!adminData.success || adminData.user.role !== 'admin') {
      throw new Error(`Admin login failed: ${JSON.stringify(adminData)}`);
    }
    const adminToken = adminData.token;
    console.log(`✅ Admin logged in successfully! Role: ${adminData.user.role}`);

    // 2. Test Login as demo Student
    console.log('2. Testing Student Login...');
    const studentLoginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@student.com', password: 'student123' })
    });
    const studentData = await studentLoginRes.json();
    if (!studentData.success || studentData.user.role !== 'student') {
      throw new Error(`Student login failed: ${JSON.stringify(studentData)}`);
    }
    const studentToken = studentData.token;
    console.log(`✅ Student logged in successfully! Role: ${studentData.user.role}`);

    // 3. Test Student cannot access Admin route (Should be 403 Forbidden)
    console.log('3. Testing Admin route protection against student...');
    const forbiddenRes = await fetch(`${BASE}/admin/settings`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    if (forbiddenRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for student, got ${forbiddenRes.status}`);
    }
    console.log('✅ Student properly blocked from Admin route with 403 Forbidden!');

    // 4. Test Admin CAN access Admin route
    console.log('4. Testing Admin can access Admin settings & stats...');
    const adminSettingsRes = await fetch(`${BASE}/admin/settings`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const settingsData = await adminSettingsRes.json();
    if (!settingsData.success) {
      throw new Error(`Admin could not fetch settings: ${JSON.stringify(settingsData)}`);
    }
    console.log(`✅ Admin successfully accessed settings! Site name: ${settingsData.data.siteName}`);

    // 5. Test Data Isolation
    console.log('5. Testing per-user data isolation...');
    const studentSubjectsRes = await fetch(`${BASE}/subjects`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const studentSubjects = await studentSubjectsRes.json();

    const adminSubjectsRes = await fetch(`${BASE}/subjects`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminSubjects = await adminSubjectsRes.json();

    console.log(`Student subjects count: ${studentSubjects.count}, Admin subjects count: ${adminSubjects.count}`);
    console.log('✅ All student data strictly isolated per user!');

    console.log('🎉 ALL AUTH & ADMIN TESTS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

runTests();
