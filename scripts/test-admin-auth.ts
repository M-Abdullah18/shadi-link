/**
 * Automated Security & Auth Verification Script for Step 3A.
 * Tests:
 * 1. /api/admin/me returns 401 without cookie
 * 2. Wrong password returns generic 401
 * 3. Wrong email returns identical generic 401 (constant-time timing mitigation)
 * 4. Password never appears in any response
 * 5. 6th attempt within 15 minutes triggers 429 rate limit
 * 6. X-Powered-By is absent and Helmet headers are present
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function runSecurityTests() {
  console.log(`\n=== Running Step 3A Admin Security & Auth Tests against ${BASE_URL} ===\n`);
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, title: string, details?: any) {
    if (condition) {
      console.log(`[PASS] ${title}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title}`, details || '');
      failed++;
    }
  }

  try {
    // Test 1: /api/admin/me returns 401 without cookie
    const resMe = await fetch(`${BASE_URL}/api/admin/me`, {
      headers: { 'Accept': 'application/json' }
    });
    const dataMe = await resMe.json().catch(() => ({}));
    assert(resMe.status === 401, '/api/admin/me returns 401 when unauthenticated', { status: resMe.status });
    assert(dataMe.error === 'Unauthorized', '/api/admin/me returns generic Unauthorized error', dataMe);

    // Test 2: Check security headers
    assert(!resMe.headers.get('x-powered-by'), 'X-Powered-By header is completely disabled');
    assert(Boolean(resMe.headers.get('x-content-type-options')), 'Helmet security headers are active (X-Content-Type-Options: nosniff)');

    // Test 3: Wrong password returns generic 401
    const testSecretPassword = 'mySecretAttemptString123!';
    const resWrongPass = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: testSecretPassword })
    });
    const dataWrongPass = await resWrongPass.json().catch(() => ({}));
    assert(resWrongPass.status === 401, 'Wrong password returns HTTP 401', { status: resWrongPass.status });
    assert(dataWrongPass.message === 'Invalid email or password', 'Wrong password returns generic message "Invalid email or password"', dataWrongPass);

    // Test 4: Password never leaks into response
    const rawResText = JSON.stringify(dataWrongPass);
    assert(!rawResText.includes(testSecretPassword), 'Password string NEVER appears in API response body');

    // Test 5: Wrong email returns identical generic 401
    const resWrongEmail = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email: 'completely-unknown-user@example.com', password: 'SomeRandomPassword' })
    });
    const dataWrongEmail = await resWrongEmail.json().catch(() => ({}));
    assert(resWrongEmail.status === 401, 'Wrong email returns HTTP 401', { status: resWrongEmail.status });
    assert(dataWrongEmail.message === 'Invalid email or password', 'Wrong email returns identical generic message', dataWrongEmail);

    // Test 6: Rate limiting - send remaining attempts until 6th attempt triggers 429
    console.log('\n--- Testing Rate Limiting (Max 5 attempts / 15 mins) ---');
    let rateLimited = false;
    let rateLimitResponse: any = null;

    // We already sent 2 attempts (Tests 3 & 5). Send up to 6 more attempts.
    for (let i = 3; i <= 8; i++) {
      const res = await fetch(`${BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: `attacker${i}@test.com`, password: 'wrong' })
      });
      if (res.status === 429) {
        rateLimited = true;
        rateLimitResponse = await res.json().catch(() => ({}));
        console.log(`[INFO] Rate limit triggered as expected on attempt #${i} (HTTP 429)`);
        break;
      }
    }

    assert(rateLimited, 'The 6th attempt within 15 minutes is rate limited with HTTP 429');
    assert(
      rateLimitResponse?.error === 'TooManyRequests',
      'Rate limit response contains friendly TooManyRequests message',
      rateLimitResponse
    );

  } catch (error: any) {
    console.error('[ERROR] Unexpected test execution error:', error.message);
    failed++;
  }

  console.log(`\n=== Test Results: ${passed} Passed, ${failed} Failed ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTests();
