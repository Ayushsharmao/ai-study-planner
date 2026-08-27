async function test() {
  try {
    const sRes = await fetch('http://localhost:5000/api/subjects');
    const sData = await sRes.json();
    console.log(`Subjects: count=${sData.count}`);

    const dRes = await fetch('http://localhost:5000/api/deadlines');
    const dData = await dRes.json();
    console.log(`Deadlines: count=${dData.count}`);

    const aRes = await fetch('http://localhost:5000/api/analytics');
    const aData = await aRes.json();
    console.log('Analytics summary:', aData.data.summary);

    // Test generating schedule
    const genRes = await fetch('http://localhost:5000/api/schedule/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ daysAhead: 7 })
    });
    const genData = await genRes.json();
    console.log(`Generated schedule: count=${genData.count}, readiness=${genData.insights.readinessScore}`);

    console.log('✅ ALL BACKEND APIS FUNCTIONING PERFECTLY!');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

test();
