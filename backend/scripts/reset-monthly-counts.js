// reset-monthly-counts.js — Resets monthly order counts for all businesses
//
// Run via cron on the 1st of every month at midnight.
// Also sends trial expiry warnings to businesses whose trial
// ends in the next 4 days.
//
// Cron schedule: 0 0 1 * * (midnight on the 1st of every month)
// Usage: node scripts/reset-monthly-counts.js

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log(`[${new Date().toISOString()}] Running monthly maintenance...`);

  // ── Reset monthly order counts ───────────────────────────────────────
  const resetResult = await prisma.business.updateMany({
    data: { monthly_order_count: 0 }
  });
  console.log(`Reset order counts for ${resetResult.count} businesses`);

  // ── Check for expired trials ─────────────────────────────────────────
  // Find businesses whose trial ended but status is still TRIAL
  const expiredTrials = await prisma.business.findMany({
    where: {
      subscription_status: 'TRIAL',
      trial_ends_at: { lt: new Date() }
    },
    include: {
      users: {
        where: { role: 'MANAGER' },
        take: 1
      }
    }
  });

  for (const business of expiredTrials) {
    await prisma.business.update({
      where: { id: business.id },
      data: { subscription_status: 'EXPIRED' }
    });
    console.log(`Trial expired: ${business.name}`);
  }

  // ── Send trial expiry warnings ───────────────────────────────────────
  // Find businesses whose trial ends in 1-4 days
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + 4);

  const expiringTrials = await prisma.business.findMany({
    where: {
      subscription_status: 'TRIAL',
      trial_ends_at: {
        gte: new Date(),
        lte: warningDate,
      }
    },
    include: {
      users: {
        where: { role: 'MANAGER' },
        take: 1
      }
    }
  });

  const { sendTrialExpiryWarning } = require('../src/services/email.service');

  for (const business of expiringTrials) {
    const manager = business.users[0];
    if (!manager) continue;

    const daysRemaining = Math.ceil(
      (new Date(business.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24)
    );

    await sendTrialExpiryWarning(
      { name: business.name },
      { name: manager.name, email: manager.email },
      daysRemaining
    );
    console.log(`Trial warning sent: ${business.name} (${daysRemaining} days left)`);
  }

  console.log(`[${new Date().toISOString()}] Monthly maintenance complete`);
  await prisma.$disconnect();
}

run().catch(err => {
  console.error('Monthly maintenance failed:', err);
  process.exit(1);
});