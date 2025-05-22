// Fixed demo.js - Better error handling and debugging
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function installAxios() {
    console.log('📦 Installing axios...');
    try {
        await execAsync('npm install axios');
        console.log('✅ Axios installed successfully!');
    } catch (error) {
        console.error('❌ Failed to install axios:', error.message);
        throw error;
    }
}

async function checkAxios() {
    try {
        require.resolve('axios');
        return true;
    } catch (error) {
        return false;
    }
}

async function testConnection(url, description) {
    console.log(`🔍 Testing ${description}: ${url}`);
    try {
        const axios = require('axios');
        const response = await axios.get(url, { timeout: 5000 });
        console.log(`✅ ${description} working - Status: ${response.status}`);
        return { success: true, data: response.data };
    } catch (error) {
        console.log(`❌ ${description} failed - Error: ${error.message}`);
        if (error.code) {
            console.log(`   Error Code: ${error.code}`);
        }
        if (error.response) {
            console.log(`   HTTP Status: ${error.response.status}`);
        }
        return { success: false, error };
    }
}

async function runDiagnostics() {
    console.log('🔧 Running diagnostics...\n');
    
    const BASE_URL = 'http://localhost:3000';
    const testUrls = [
        { url: `${BASE_URL}`, description: 'Frontend Homepage' },
        { url: `${BASE_URL}/api/health`, description: 'API Health Check' },
        { url: `${BASE_URL}/health`, description: 'Legacy Health Check' }
    ];

    for (const test of testUrls) {
        const result = await testConnection(test.url, test.description);
        if (result.success) {
            console.log(`   Response: ${JSON.stringify(result.data).substring(0, 100)}...\n`);
        } else {
            console.log('');
        }
    }
}

async function runDemo() {
    console.log('🚀 Starting Chat Message Archiver Demo...\n');

    try {
        // Check if axios is available
        const axiosAvailable = await checkAxios();
        if (!axiosAvailable) {
            await installAxios();
        }

        const axios = require('axios');

        // Run diagnostics first
        await runDiagnostics();

        // Try both possible health endpoints
        const BASE_URL = 'http://localhost:3000';
        let healthEndpoint = null;
        
        console.log('1. Determining correct API endpoint...');
        
        // Test new API endpoint
        try {
            const response = await axios.get(`${BASE_URL}/api/health`, { timeout: 3000 });
            if (response.status === 200) {
                healthEndpoint = '/api';
                console.log('✅ Using new API endpoints (/api/...)');
            }
        } catch (error) {
            // Try legacy endpoint
            try {
                const response = await axios.get(`${BASE_URL}/health`, { timeout: 3000 });
                if (response.status === 200) {
                    healthEndpoint = '';
                    console.log('✅ Using legacy API endpoints (no /api prefix)');
                }
            } catch (legacyError) {
                console.log('❌ Neither API endpoint is responding');
                console.log('💡 Troubleshooting steps:');
                console.log('   1. Make sure "npm start" is running in another terminal');
                console.log('   2. Check if you see "Chat Message Archiver Service running on port 3000"');
                console.log('   3. Try opening http://localhost:3000 in your browser');
                console.log('   4. Check if port 3000 is being used by another application');
                console.log('   5. Try stopping and restarting with "npm start"');
                return;
            }
        }

        const API_BASE = `${BASE_URL}${healthEndpoint}`;
        
        // Test health endpoint
        console.log('\n2. Testing service health...');
        const healthResponse = await axios.get(`${API_BASE}/health`);
        console.log('✅ Service is running:', healthResponse.data.message);

        // Send some messages
        console.log('\n3. Sending test messages...');
        
        const messages = [
            { content: 'Hello, this is my first message!', sender: 'Alice' },
            { content: 'How are you doing today?', sender: 'Bob' },
            { content: 'The weather is great!', sender: 'Charlie' },
            { content: 'Let\'s meet up later.', sender: 'Alice' }
        ];

        for (const message of messages) {
            try {
                const response = await axios.post(`${API_BASE}/send`, message, { timeout: 5000 });
                console.log(`✅ Message sent by ${message.sender}: "${message.content}"`);
            } catch (error) {
                console.log(`❌ Failed to send message from ${message.sender}: ${error.message}`);
            }
        }

        // Retrieve all messages
        console.log('\n4. Retrieving all messages...');
        try {
            const allMessagesResponse = await axios.get(`${API_BASE}/messages`);
            console.log(`✅ Found ${allMessagesResponse.data.total || allMessagesResponse.data.data.length} messages:`);
            
            allMessagesResponse.data.data.forEach((message, index) => {
                console.log(`   ${index + 1}. [${message.sender}] ${message.content}`);
                console.log(`      ID: ${message.id}, Time: ${new Date(message.timestamp).toLocaleString()}`);
            });
        } catch (error) {
            console.log(`❌ Failed to retrieve messages: ${error.message}`);
        }

        // Test error handling
        console.log('\n5. Testing error handling...');
        try {
            await axios.post(`${API_BASE}/send`, { content: '', sender: 'TestUser' });
            console.log('❌ Error handling not working - empty message was accepted');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ Error handling works:', error.response.data.message);
            } else {
                console.log('⚠️ Unexpected error response:', error.message);
            }
        }

        console.log('\n🎉 Demo completed successfully!');
        console.log('\n📝 Available endpoints:');
        console.log(`   Frontend: ${BASE_URL}`);
        console.log(`   API Health: ${API_BASE}/health`);
        console.log(`   Send Message: POST ${API_BASE}/send`);
        console.log(`   Get Messages: GET ${API_BASE}/messages`);
        console.log(`   Clear Messages: DELETE ${API_BASE}/messages`);

    } catch (error) {
        console.error('❌ Demo failed with error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n🔧 Connection refused - Server is not running or not accessible');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('\n🔧 Connection timed out - Server might be slow or overloaded');
        }
        
        console.log('\n💡 Troubleshooting checklist:');
        console.log('   ✓ Is "npm start" running in another terminal?');
        console.log('   ✓ Do you see "Service running on port 3000" message?');
        console.log('   ✓ Can you open http://localhost:3000 in a browser?');
        console.log('   ✓ Is another application using port 3000?');
        console.log('   ✓ Try restarting the server with Ctrl+C then "npm start"');
        console.log('   ✓ Check Windows Firewall settings');
    }
}

// Add a simple connectivity test
async function quickTest() {
    console.log('🏃‍♂️ Quick connectivity test...');
    const http = require('http');
    
    return new Promise((resolve) => {
        const req = http.get('http://localhost:3000', { timeout: 2000 }, (res) => {
            console.log(`✅ Server responding with status: ${res.statusCode}`);
            resolve(true);
        });
        
        req.on('error', (error) => {
            console.log(`❌ Server not responding: ${error.message}`);
            resolve(false);
        });
        
        req.on('timeout', () => {
            console.log('❌ Server response timed out');
            req.destroy();
            resolve(false);
        });
    });
}

// Main execution
console.log('🔍 Chat Message Archiver - Enhanced Demo Script\n');

quickTest().then((isConnected) => {
    if (isConnected) {
        runDemo();
    } else {
        console.log('\n🛑 Cannot connect to server. Please ensure:');
        console.log('   1. Run "npm start" in another terminal');
        console.log('   2. Wait for "Service running on port 3000" message');
        console.log('   3. Then run this demo again');
    }
});