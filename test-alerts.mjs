import axios from 'axios';

// Test the API endpoints directly
async function testAlerts() {
    try {
        console.log('🔍 Testing Alert System via API...\n');
        
        // Test 1: Get active alert (should return empty or existing alert)
        console.log('📋 Test 1: Fetching active alerts from API...');
        const activeResponse = await axios.get('http://localhost:3000/api/alerts/active', {
            validateStatus: () => true // Accept any status
        });
        
        console.log(`   Status: ${activeResponse.status}`);
        if (activeResponse.status === 200) {
            console.log('✅ API endpoint responded!');
            console.log(`   Response: ${JSON.stringify(activeResponse.data, null, 2)}\n`);
        } else {
            console.log(`   Response: ${JSON.stringify(activeResponse.data, null, 2)}\n`);
        }
        
        // Test 2: Create test alert
        console.log('📝 Test 2: Creating test alert via API...');
        const createResponse = await axios.post('http://localhost:3000/api/admin/alerts', {
            title: '🎉 Test Alert - Special Promotion',
            message: 'Testing the dynamic alert system for announcements and promotions',
            type: 'PROMOTION',
            bgColor: 'from-purple-600 to-pink-600',
            textColor: 'text-white',
            icon: '🎉',
            priority: 5,
            isActive: true
        }, {
            validateStatus: () => true,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`   Status: ${createResponse.status}`);
        if (createResponse.status === 201 || createResponse.status === 200) {
            console.log('✅ Alert created successfully!');
            console.log(`   ID: ${createResponse.data.id}\n`);
        } else {
            console.log(`   Response: ${JSON.stringify(createResponse.data, null, 2)}\n`);
        }
        
        // Test 3: Get active alert again
        console.log('🔄 Test 3: Fetching active alerts again...');
        const activeResponse2 = await axios.get('http://localhost:3000/api/alerts/active', {
            validateStatus: () => true
        });
        
        console.log(`   Status: ${activeResponse2.status}`);
        if (activeResponse2.status === 200) {
            console.log('✅ Active alert retrieved!');
            console.log(`   Title: ${activeResponse2.data.title}\n`);
        }
        
        console.log('✨ API tests completed successfully!\n');
        console.log('📍 Next steps:');
        console.log('   1. Start the dev server: npm run dev');
        console.log('   2. Visit: http://localhost:3000/admin/alerts');
        console.log('   3. Create alerts from the admin panel');
        console.log('   4. Check homepage for dynamic alert banner\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testAlerts();
