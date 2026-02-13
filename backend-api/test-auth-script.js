const assert = require('assert');
// fetch is available in Node 18+ globally, but for robustness:
const fetch = globalThis.fetch;

const BASE_URL = 'http://localhost:3000';

const TEST_USER = {
    email: 'testauth@example.com',
    password: 'SecurePassword123!',
    fullName: 'Test Auth User'
};

async function runTests() {
    console.log('--- STARTING AUTH TESTS ---');
    try {
        // 1. Register User
        console.log('1. Registering User...');
        let res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER)
        });

        let data;
        try {
            data = await res.json();
        } catch (e) { }

        if (res.ok) {
            console.log('   Create Success:', data.id);
        } else {
            console.log('   Create Result:', data ? (data.message || data.error) : res.statusText);
            // Often if user exists, it's 500 or 400 depending on implementation. Assuming it's fine if user exists and we proceed to login.
        }

        // 2. Login (Success)
        console.log('2. Login (Correct Credentials)...');
        res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password })
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Login failed with status ${res.status}: ${errorText}`);
        }

        const loginData = await res.json();
        const token = loginData.access_token;
        console.log('   Login Success. Token received.');
        if (!token) throw new Error('Token missing');

        // 3. Login (Failure)
        console.log('3. Login (Incorrect Credentials)...');
        res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_USER.email, password: 'WRONGPASSWORD' })
        });
        if (res.status !== 401) {
            throw new Error(`Login failure test failed, status: ${res.status}`);
        }
        console.log('   Login Failed correctly (401).');

        // 4. Access Protected Route (Valid Token)
        console.log('4. Access Protected Route (Valid Token)...');
        res = await fetch(`${BASE_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Protected route failed: ${res.status} ${txt}`);
        }
        data = await res.json();
        if (data.email !== TEST_USER.email) throw new Error('Email mismatch');
        console.log('   Protected route Success.');

        // 5. Access Protected Route (No Token)
        console.log('5. Access Protected Route (No Token)...');
        res = await fetch(`${BASE_URL}/auth/profile`);
        if (res.status !== 401) throw new Error(`Protected route no token check failed: ${res.status}`);
        console.log('   Protected route denied correctly (401).');

        // 6. Access Public Route (No Token)
        console.log('6. Access Public Route (No Token)...');
        res = await fetch(`${BASE_URL}/auth/public`);
        if (!res.ok) throw new Error(`Public route failed: ${res.status}`);
        console.log('   Public route Success.');

        console.log('--- ALL TESTS PASSED ---');
    } catch (err) {
        console.error('TEST FAILED:', err);
        process.exit(1);
    }
}

runTests();
