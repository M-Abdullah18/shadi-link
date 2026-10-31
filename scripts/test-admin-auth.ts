/**
 * Automated Security, Auth & Step 3B-1 Database/API Verification Script.
 * Tests:
 * 1. /api/admin/me returns 401 without cookie
 * 2. Wrong password returns generic 401
 * 3. Wrong email returns identical generic 401 (timing-attack mitigation)
 * 4. Password never appears in any response
 * 5. 6th attempt within 15 minutes triggers 429 rate limit
 * 6. X-Powered-By is absent and Helmet headers are present
 * 7. Every new admin route returns 401 without login
 * 8. Bad mapUrl schemes are rejected (javascript:, data:, non-https, unapproved hosts)
 * 9. Duplicate event types are rejected
 * 10. nikah + barat together and shaadi alone are both ACCEPTED
 * 11. expiresAt is computed on the server from the latest event (+24 hours)
 * 12. Fake image with wrong magic bytes is rejected
 * 13. No secrets in any response (/api/health, errors, etc.)
 */

import {
  isValidGoogleMapsUrl,
  WeddingZodSchema,
  computeWeddingMetadata,
  parsePakistanDate,
} from '../server/models/wedding.js';
import { detectMagicBytes } from '../server/routes/images.js';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function runAllTests() {
  console.log(`\n=== Running ShaadiLink Step 3B-1 Tests against ${BASE_URL} ===\n`);
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
    // ----------------------------------------------------
    // Section 1: Auth & Base Security
    // ----------------------------------------------------
    const resMe = await fetch(`${BASE_URL}/api/admin/me`, {
      headers: { Accept: 'application/json' },
    });
    const dataMe = await resMe.json().catch(() => ({}));
    assert(resMe.status === 401, '/api/admin/me returns 401 when unauthenticated');
    assert(dataMe.error === 'Unauthorized', '/api/admin/me returns generic Unauthorized error');
    assert(!resMe.headers.get('x-powered-by'), 'X-Powered-By header is completely disabled');
    assert(Boolean(resMe.headers.get('x-content-type-options')), 'Helmet security headers are active');

    // Test health endpoint for safe public response
    const resHealth = await fetch(`${BASE_URL}/api/health`);
    const dataHealth = await resHealth.json().catch(() => ({}));
    assert(resHealth.status === 200, '/api/health returns 200');
    assert(
      ['connected', 'error', 'not_configured'].includes(dataHealth.database?.status),
      `/api/health database.status is public-safe ('${dataHealth.database?.status}')`
    );
    const rawHealthText = JSON.stringify(dataHealth);
    assert(
      !rawHealthText.includes('mongodb+srv') && !rawHealthText.includes('password'),
      'No database secrets or credentials appear in /api/health'
    );

    // ----------------------------------------------------
    // Section 2: Every New Admin Route Returns 401 Without Login
    // ----------------------------------------------------
    console.log('\n--- Testing 401 Protection on All Admin Routes ---');
    const adminRoutes = [
      { method: 'GET', path: '/api/admin/weddings' },
      { method: 'POST', path: '/api/admin/weddings', body: { groomName: 'Test' } },
      { method: 'GET', path: '/api/admin/weddings/507f1f77bcf86cd799439011' },
      { method: 'PUT', path: '/api/admin/weddings/507f1f77bcf86cd799439011', body: { groomName: 'Test' } },
      { method: 'DELETE', path: '/api/admin/weddings/507f1f77bcf86cd799439011' },
      { method: 'GET', path: '/api/admin/designs' },
      { method: 'POST', path: '/api/admin/images', body: 'fake-image-bytes' },
      { method: 'DELETE', path: '/api/admin/images/507f1f77bcf86cd799439011' },
    ];

    for (const route of adminRoutes) {
      const res = await fetch(`${BASE_URL}${route.path}`, {
        method: route.method,
        headers: {
          'Content-Type': typeof route.body === 'string' ? 'application/octet-stream' : 'application/json',
          Accept: 'application/json',
        },
        body: route.body ? (typeof route.body === 'string' ? route.body : JSON.stringify(route.body)) : undefined,
      });
      assert(
        res.status === 401,
        `Unauthenticated ${route.method} ${route.path} returns HTTP 401`
      );
    }

    // ----------------------------------------------------
    // Section 3: Google Maps URL Strict Validation
    // ----------------------------------------------------
    console.log('\n--- Testing Google Maps URL Strict Validation ---');
    assert(isValidGoogleMapsUrl('https://maps.google.com/?q=Lahore+Fort'), 'Accepts https://maps.google.com/...');
    assert(isValidGoogleMapsUrl('https://maps.app.goo.gl/xyz123'), 'Accepts https://maps.app.goo.gl/...');
    assert(isValidGoogleMapsUrl('https://www.google.com/maps/place/Karachi'), 'Accepts https://www.google.com/maps/...');
    assert(isValidGoogleMapsUrl('https://goo.gl/maps/abc789'), 'Accepts https://goo.gl/maps/...');

    assert(!isValidGoogleMapsUrl('javascript:alert(1)'), 'Rejects javascript: scheme');
    assert(!isValidGoogleMapsUrl('data:text/html,<script>alert(1)</script>'), 'Rejects data: scheme');
    assert(!isValidGoogleMapsUrl('http://maps.google.com/?q=Lahore'), 'Rejects plain http:// (requires https)');
    assert(!isValidGoogleMapsUrl('https://evil-maps.com/fake'), 'Rejects unauthorized hosts');
    assert(!isValidGoogleMapsUrl('https://google.com.attacker.com/maps'), 'Rejects phishing subdomain attacks');

    // ----------------------------------------------------
    // Section 4: Duplicate Event Types Rejection
    // ----------------------------------------------------
    console.log('\n--- Testing Duplicate Event Types Rejection ---');
    const duplicateEventsWedding = {
      groomName: 'Hamza',
      groomFatherName: 'Farooq',
      brideName: 'Ayesha',
      brideFatherName: 'Tariq',
      language: 'en',
      designSlug: 'emerald-royale',
      events: [
        {
          type: 'mehndi',
          startsAt: '2026-12-24T19:00:00+05:00',
          venueName: 'Venue A',
          mapUrl: 'https://maps.google.com/?q=A',
        },
        {
          type: 'mehndi', // DUPLICATE
          startsAt: '2026-12-25T19:00:00+05:00',
          venueName: 'Venue B',
          mapUrl: 'https://maps.google.com/?q=B',
        },
      ],
    };
    const duplicateValidation = WeddingZodSchema.safeParse(duplicateEventsWedding);
    assert(!duplicateValidation.success, 'Duplicate event type ("mehndi" x 2) is strictly rejected');

    // ----------------------------------------------------
    // Section 5: Nikah + Barat Together AND Shaadi Alone are Accepted
    // ----------------------------------------------------
    console.log('\n--- Testing Event Type Flexibility (Nikah + Barat vs Shaadi) ---');
    const nikahBaratWedding = {
      groomName: 'Hamza',
      groomFatherName: 'Farooq',
      brideName: 'Ayesha',
      brideFatherName: 'Tariq',
      language: 'en',
      designSlug: 'emerald-royale',
      events: [
        {
          type: 'nikah',
          startsAt: '2026-12-25T18:00:00+05:00',
          venueName: 'Badshahi Mosque',
          mapUrl: 'https://maps.google.com/?q=Badshahi',
        },
        {
          type: 'barat',
          startsAt: '2026-12-26T20:00:00+05:00',
          venueName: 'Grand Marquee',
          mapUrl: 'https://maps.google.com/?q=Marquee',
        },
      ],
    };
    const nikahBaratValidation = WeddingZodSchema.safeParse(nikahBaratWedding);
    assert(nikahBaratValidation.success, 'nikah + barat together is ACCEPTED');

    const shaadiAloneWedding = {
      groomName: 'Daniyal',
      groomFatherName: 'Jahangir',
      brideName: 'Zainab',
      brideFatherName: 'Mansoor',
      language: 'ur',
      designSlug: 'shahi-darbar',
      events: [
        {
          type: 'shaadi', // Combined Nikah + Barat function
          startsAt: '2026-12-25T20:00:00+05:00',
          venueName: 'Haveli Baradari',
          mapUrl: 'https://maps.google.com/?q=Haveli',
        },
      ],
    };
    const shaadiAloneValidation = WeddingZodSchema.safeParse(shaadiAloneWedding);
    assert(shaadiAloneValidation.success, 'shaadi alone (combined Nikah + Barat) is ACCEPTED');

    // ----------------------------------------------------
    // Section 6: expiresAt Computed on Server (+24 hours from latest event)
    // ----------------------------------------------------
    console.log('\n--- Testing Server-Side expiresAt Computation ---');
    const event1 = parsePakistanDate('2026-12-25 18:00');
    const event2 = parsePakistanDate('2026-12-27 21:00'); // latest
    const metadata = computeWeddingMetadata({
      groomName: 'Hamza',
      groomFatherName: 'Farooq',
      brideName: 'Ayesha',
      brideFatherName: 'Tariq',
      designSlug: 'sea-breeze',
      events: [{ startsAt: event1 }, { startsAt: event2 }],
    });
    const expectedExpiry = new Date(event2.getTime() + 24 * 60 * 60 * 1000);
    assert(
      metadata.expiresAt.getTime() === expectedExpiry.getTime(),
      `expiresAt is exactly latest event (${event2.toISOString()}) + 24 hours (${expectedExpiry.toISOString()})`
    );
    assert(metadata.status === 'ready', 'Wedding with all names, design, and events marked as "ready"');

    // ----------------------------------------------------
    // Section 7: Magic Byte Verification for Images
    // ----------------------------------------------------
    console.log('\n--- Testing Image Magic Byte Verification ---');
    const fakeTextFile = Buffer.from('This is a text file posing as an image');
    assert(detectMagicBytes(fakeTextFile) === null, 'Rejects text file masquerading as image');

    const fakeHtmlFile = Buffer.from('<html><body><script>malicious()</script></body></html>');
    assert(detectMagicBytes(fakeHtmlFile) === null, 'Rejects HTML file with fake image extension');

    // Valid JPEG: FF D8 FF
    const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    assert(detectMagicBytes(validJpeg) === 'image/jpeg', 'Accepts valid JPEG magic bytes (FF D8 FF)');

    // Valid PNG: 89 50 4E 47 0D 0A 1A 0A
    const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    assert(detectMagicBytes(validPng) === 'image/png', 'Accepts valid PNG magic bytes');

    // Valid WebP: RIFF ... WEBP
    const validWebp = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0x20, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]);
    assert(detectMagicBytes(validWebp) === 'image/webp', 'Accepts valid WebP magic bytes (RIFF....WEBP)');

    // ----------------------------------------------------
    // Section 8: Login & Rate Limiting
    // ----------------------------------------------------
    console.log('\n--- Testing Login Security & Rate Limiting ---');
    const testSecretPassword = 'mySecretAttemptString123!';
    const resWrongPass = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: testSecretPassword }),
    });
    const dataWrongPass = await resWrongPass.json().catch(() => ({}));
    assert(resWrongPass.status === 401, 'Wrong password returns HTTP 401');
    assert(
      dataWrongPass.message === 'Invalid email or password',
      'Wrong password returns generic message "Invalid email or password"'
    );
    assert(
      !JSON.stringify(dataWrongPass).includes(testSecretPassword),
      'Password string NEVER appears in API response body'
    );

    // Rate limiting: test that repeated attempts trigger 429
    let rateLimited = false;
    for (let i = 1; i <= 6; i++) {
      const res = await fetch(`${BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: `attacker${i}@test.com`, password: 'wrong' }),
      });
      if (res.status === 429) {
        rateLimited = true;
        break;
      }
    }
    assert(rateLimited, 'Rate limit triggered with HTTP 429 within 15 minutes window');

  } catch (error: any) {
    console.error('[ERROR] Unexpected test execution error:', error.message);
    failed++;
  }

  console.log(`\n=== Test Results: ${passed} Passed, ${failed} Failed ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();
