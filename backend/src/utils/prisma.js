// prisma.js — Shared Prisma database client
//
// We create ONE instance of the Prisma client and reuse it everywhere.
// If every file created its own client, we'd exhaust the database
// connection pool very quickly.

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'info', 'warn', 'error']  // verbose logging in development
    : ['warn', 'error'],                   // only problems in production
});

module.exports = prisma;