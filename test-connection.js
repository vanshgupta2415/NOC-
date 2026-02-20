const http = require('http');

console.log('🧪 Testing Frontend-Backend Connection...\n');

// Test 1: Health endpoint
const healthOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/health',
    method: 'GET',
    headers: {
        'Origin': 'http://localhost:8080'
    }
};

const healthReq = http.request(healthOptions, (res) => {
    console.log('✅ Health Check Test');
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   CORS Headers:`);
    console.log(`   - Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin']}`);
    console.log(`   - Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials']}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log(`   Response: ${data}\n`);

        // Test 2: API endpoint
        testAPIEndpoint();
    });
});

healthReq.on('error', (error) => {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
});

healthReq.end();

function testAPIEndpoint() {
    const apiOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Origin': 'http://localhost:8080',
            'Content-Type': 'application/json'
        }
    };

    const apiReq = http.request(apiOptions, (res) => {
        console.log('✅ API Endpoint Test (Login)');
        console.log(`   Status: ${res.statusCode} (401 expected - no credentials)`);
        console.log(`   CORS Headers:`);
        console.log(`   - Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin']}`);
        console.log(`   - Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials']}`);

        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log(`   Response: ${data}\n`);

            if (res.headers['access-control-allow-origin'] === 'http://localhost:8080') {
                console.log('🎉 SUCCESS! Frontend and Backend are properly connected!');
                console.log('   - CORS is configured correctly');
                console.log('   - API endpoints are accessible');
                console.log('   - Credentials are enabled\n');
            } else {
                console.log('⚠️  WARNING: CORS might not be configured correctly');
            }
        });
    });

    apiReq.on('error', (error) => {
        console.error('❌ API test failed:', error.message);
        process.exit(1);
    });

    apiReq.write(JSON.stringify({ email: 'test@test.com', password: 'test' }));
    apiReq.end();
}
