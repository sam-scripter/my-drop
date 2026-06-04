// security-audit.js — Multi-tenant security audit script
//
// Run with: node scripts/security-audit.js
//
// This script verifies that the business_id scoping is working correctly
// across all API endpoints. It creates two test businesses, then attempts
// to access Business B's data using Business A's JWT token.
//
// Every cross-business request should return 403 or 404.
// If any request returns 200 with another business's data, that is a
// critical security vulnerability and must be fixed immediately.
//
// Clean up: the script deletes all test data it creates at the end.

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

// Test data — two separate businesses
const BUSINESS_A = {
  businessName: 'Security Test Business A',
  businessPhone: '0700000001',
  businessEmail: `security-test-a-${Date.now()}@test.com`,
  managerName: 'Manager A',
  password: 'TestPassword123',
  businessType: 'OTHER',
};

const BUSINESS_B = {
  businessName: 'Security Test Business B',
  businessPhone: '0700000002',
  businessEmail: `security-test-b-${Date.now()}@test.com`,
  managerName: 'Manager B',
  password: 'TestPassword123',
  businessType: 'OTHER',
};

// Counters for the audit report
let passed = 0;
let failed = 0;
const failures = [];

// ── Helpers ────────────────────────────────────────────────────────────

function pass(testName) {
  console.log(`  ✅ PASS: ${testName}`);
  passed++;
}

function fail(testName, detail) {
  console.log(`  ❌ FAIL: ${testName} — ${detail}`);
  failed++;
  failures.push({ testName, detail });
}

/**
 * Makes an API request and checks that it is BLOCKED (403 or 404).
 * If the request succeeds (2xx), that's a security failure.
 */
async function assertBlocked(testName, requestFn) {
  try {
    const response = await requestFn();
    // If we get here, the request succeeded — that's a failure
    fail(testName, `Expected 403/404 but got ${response.status}`);
  } catch (err) {
    const status = err.response?.status;
    if (status === 403 || status === 404) {
      pass(testName);
    } else if (status === 401) {
      pass(testName); // Unauthorized is also acceptable
    } else {
      fail(testName, `Unexpected error status: ${status} — ${err.response?.data?.message}`);
    }
  }
}

/**
 * Makes an API request and checks that it SUCCEEDS (2xx).
 * Used to confirm our own business's data is still accessible.
 */
async function assertAllowed(testName, requestFn) {
  try {
    await requestFn();
    pass(testName);
  } catch (err) {
    fail(testName, `Expected success but got ${err.response?.status} — ${err.response?.data?.message}`);
  }
}

// ── Main audit ─────────────────────────────────────────────────────────

async function runAudit() {
  console.log('\n🔒 mydrop Multi-tenant Security Audit');
  console.log('=====================================\n');

  // ── Step 1: Register both businesses ────────────────────────────────
  console.log('Setting up test data...\n');

  let tokenA, tokenB, businessAId, businessBId;
  let orderBId, riderBId;

  try {
    const regA = await axios.post(`${BASE_URL}/auth/register`, BUSINESS_A);
    tokenA = regA.data.token;
    businessAId = regA.data.business.id;
    console.log(`  Created Business A: ${businessAId}`);

    const regB = await axios.post(`${BASE_URL}/auth/register`, BUSINESS_B);
    tokenB = regB.data.token;
    businessBId = regB.data.business.id;
    console.log(`  Created Business B: ${businessBId}`);
  } catch (err) {
    console.error('Failed to create test businesses:', err.response?.data);
    process.exit(1);
  }

  // Create a rider and order for Business B
  try {
    const riderB = await axios.post(
      `${BASE_URL}/users/rider`,
      {
        name: 'Rider B',
        phone: '0711111111',
        email: `rider-b-${Date.now()}@test.com`,
      },
      { headers: { Authorization: `Bearer ${tokenB}` } }
    );
    riderBId = riderB.data.rider.id;
    console.log(`  Created Rider B: ${riderBId}`);

    const orderB = await axios.post(
      `${BASE_URL}/orders`,
      {
        customer_name: 'Customer B',
        customer_phone: '0722222222',
        customer_address: 'Business B Address, Nairobi',
        items_description: 'Test item',
      },
      { headers: { Authorization: `Bearer ${tokenB}` } }
    );
    orderBId = orderB.data.order.id;
    console.log(`  Created Order B: ${orderBId}`);
  } catch (err) {
    console.error('Failed to create test resources:', err.response?.data);
    process.exit(1);
  }

  const headersA = { Authorization: `Bearer ${tokenA}` };
  const headersB = { Authorization: `Bearer ${tokenB}` };

  console.log('\n── Business data isolation ──────────────────────────────\n');

  // ── Step 2: Business endpoint isolation ─────────────────────────────

  // A can access their own business
  await assertAllowed(
    'Business A can read their own business',
    () => axios.get(`${BASE_URL}/business/me`, { headers: headersA })
  );

  console.log('\n── Order isolation ──────────────────────────────────────\n');

  // A cannot read B's specific order
  await assertBlocked(
    'Business A cannot read Business B order by ID',
    () => axios.get(`${BASE_URL}/orders/${orderBId}`, { headers: headersA })
  );

  // A cannot assign a rider to B's order
  await assertBlocked(
    'Business A cannot assign rider to Business B order',
    () => axios.post(
      `${BASE_URL}/orders/${orderBId}/assign`,
      { riderId: riderBId },
      { headers: headersA }
    )
  );

  // A cannot update status of B's order
  await assertBlocked(
    'Business A cannot update status of Business B order',
    () => axios.put(
      `${BASE_URL}/orders/${orderBId}/status`,
      { status: 'PICKED_UP' },
      { headers: headersA }
    )
  );

  // A's order list should not contain B's orders
  try {
    const ordersA = await axios.get(`${BASE_URL}/orders`, { headers: headersA });
    const businessBOrderInA = ordersA.data.orders.find(o => o.id === orderBId);
    if (businessBOrderInA) {
      fail('Business A order list does not contain Business B orders',
        'Business B order appeared in Business A order list');
    } else {
      pass('Business A order list does not contain Business B orders');
    }
  } catch (err) {
    fail('Business A order list check', err.message);
  }

  console.log('\n── Rider isolation ──────────────────────────────────────\n');

  // A cannot toggle B's rider status
  await assertBlocked(
    'Business A cannot toggle Business B rider status',
    () => axios.put(
      `${BASE_URL}/users/riders/${riderBId}/toggle`,
      {},
      { headers: headersA }
    )
  );

  // A's rider list should not contain B's riders
  try {
    const ridersA = await axios.get(`${BASE_URL}/users/riders`, { headers: headersA });
    const businessBRiderInA = ridersA.data.riders.find(r => r.id === riderBId);
    if (businessBRiderInA) {
      fail('Business A rider list does not contain Business B riders',
        'Business B rider appeared in Business A rider list');
    } else {
      pass('Business A rider list does not contain Business B riders');
    }
  } catch (err) {
    fail('Business A rider list check', err.message);
  }

  console.log('\n── Analytics isolation ──────────────────────────────────\n');

  // Analytics should only return A's data — we verify it doesn't
  // crash and returns a valid response scoped to A
  await assertAllowed(
    'Business A can access their own analytics',
    () => axios.get(`${BASE_URL}/analytics/today`, { headers: headersA })
  );

  console.log('\n── JWT manipulation checks ──────────────────────────────\n');

  // Tampered token should be rejected
  await assertBlocked(
    'Tampered JWT token is rejected',
    () => axios.get(`${BASE_URL}/business/me`, {
      headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.tampered.signature' }
    })
  );

  // No token should be rejected
  await assertBlocked(
    'Missing JWT token is rejected',
    () => axios.get(`${BASE_URL}/business/me`)
  );

  // ── Step 3: Clean up test data ───────────────────────────────────────
  console.log('\nCleaning up test data...');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Delete in correct order to respect foreign key constraints
    await prisma.order.deleteMany({
      where: { business_id: { in: [businessAId, businessBId] } }
    });
    await prisma.user.deleteMany({
      where: { business_id: { in: [businessAId, businessBId] } }
    });
    await prisma.business.deleteMany({
      where: { id: { in: [businessAId, businessBId] } }
    });

    await prisma.$disconnect();
    console.log('  Test data cleaned up successfully\n');
  } catch (err) {
    console.log('  Warning: cleanup failed —', err.message);
    console.log('  Please manually delete test businesses from the database\n');
  }

  // ── Step 4: Print audit report ───────────────────────────────────────
  console.log('=====================================');
  console.log('🔒 Security Audit Report');
  console.log('=====================================');
  console.log(`  Total checks: ${passed + failed}`);
  console.log(`  ✅ Passed:    ${passed}`);
  console.log(`  ❌ Failed:    ${failed}`);

  if (failures.length > 0) {
    console.log('\n⚠️  FAILURES — these must be fixed before onboarding real customers:\n');
    failures.forEach(f => {
      console.log(`  ❌ ${f.testName}`);
      console.log(`     ${f.detail}\n`);
    });
    process.exit(1); // exit with error code so CI can catch it
  } else {
    console.log('\n✅ All security checks passed.');
    console.log('   Multi-tenant isolation is working correctly.\n');
  }
}

runAudit().catch(err => {
  console.error('Audit script crashed:', err.message);
  process.exit(1);
});