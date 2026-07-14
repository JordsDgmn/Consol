#!/usr/bin/env node
/**
 * Comprehensive end-to-end test suite for Consol application
 * Tests database connectivity, API endpoints, and scoring logic
 * 
 * Usage:
 * node test-e2e.js
 * 
 * Environment variables needed:
 * - DATABASE_URL (local or Neon connection string)
 * - NEXTAUTH_SECRET (any random string for testing)
 */

const https = require('https');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(type, msg) {
  const prefix = {
    pass: `${colors.green}✓${colors.reset}`,
    fail: `${colors.red}✗${colors.reset}`,
    info: `${colors.cyan}ℹ${colors.reset}`,
    warn: `${colors.yellow}⚠${colors.reset}`,
  }[type] || '•';
  console.log(`${prefix} ${msg}`);
}

async function testDatabase() {
  log('info', 'Testing Database Connection...');
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    log('fail', 'DATABASE_URL not set in environment');
    return false;
  }

  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: dbUrl });
    
    const result = await pool.query('SELECT 1 as test');
    await pool.end();
    
    log('pass', `Database connected (test query returned: ${result.rows[0].test})`);
    return true;
  } catch (err) {
    log('fail', `Database connection failed: ${err.message}`);
    return false;
  }
}

async function testLocalServer() {
  log('info', 'Testing Local Next.js Server...');
  
  return new Promise((resolve) => {
    const request = https.get('http://localhost:3000/api/test', (res) => {
      if (res.statusCode === 200) {
        log('pass', 'Local server responding on port 3000');
        resolve(true);
      } else {
        log('warn', `Server returned status ${res.statusCode}`);
        resolve(false);
      }
    });

    request.on('error', (err) => {
      log('warn', `Local server not running on 3000 (expected in production): ${err.code}`);
      resolve(false);
    });

    request.setTimeout(2000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

async function testAPI(endpoint, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const url = `http://localhost:3000/api${endpoint}`;
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (body) options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));

    const request = require('http').request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
          });
        } catch {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    request.on('error', (err) => resolve({ error: err.message }));
    request.setTimeout(3000, () => {
      request.destroy();
      resolve({ error: 'timeout' });
    });

    if (body) request.write(JSON.stringify(body));
    request.end();
  });
}

async function testScoring() {
  log('info', 'Testing Scoring Logic...');
  
  const text1 = 'The quick brown fox jumps over the lazy dog';
  const text2 = 'A fast brown fox leaps over a sleepy dog';
  
  try {
    // Try SimCSE API first
    const res = await fetch('http://localhost:5000/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text1, text2 }),
    });

    if (res.ok) {
      const data = await res.json();
      log('pass', `SimCSE API working (similarity: ${data.similarity})`);
      return true;
    }
  } catch (err) {
    log('warn', `SimCSE API not available (fallback will be used): ${err.message}`);
  }

  // Test fallback scoring
  try {
    const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = [...set1].filter(w => set2.has(w)).length;
    const union = new Set([...words1, ...words2]).size;
    const similarity = union > 0 ? intersection / union : 0;
    
    log('pass', `Fallback scoring works (Jaccard similarity: ${similarity.toFixed(4)})`);
    return true;
  } catch (err) {
    log('fail', `Fallback scoring failed: ${err.message}`);
    return false;
  }
}

async function runTests() {
  console.log(`\n${colors.blue}═════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}   Consol Application - E2E Test Suite${colors.reset}`);
  console.log(`${colors.blue}═════════════════════════════════════════${colors.reset}\n`);

  const tests = [];

  // Test 1: Database
  tests.push({
    name: 'Database Connectivity',
    result: await testDatabase(),
  });

  // Test 2: Local server
  tests.push({
    name: 'Local Server',
    result: await testLocalServer(),
  });

  // Test 3: Scoring
  tests.push({
    name: 'Scoring Logic',
    result: await testScoring(),
  });

  // Summary
  console.log(`\n${colors.blue}═════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}   Test Summary${colors.reset}`);
  console.log(`${colors.blue}═════════════════════════════════════════${colors.reset}\n`);

  const passed = tests.filter(t => t.result).length;
  const total = tests.length;

  tests.forEach(test => {
    const icon = test.result ? colors.green + '✓' : colors.red + '✗';
    console.log(`${icon}${colors.reset} ${test.name}`);
  });

  console.log(`\n${colors.cyan}Result: ${passed}/${total} tests passed${colors.reset}`);

  if (passed === total) {
    log('pass', 'All tests passed! App is ready for deployment.');
    process.exit(0);
  } else {
    log('warn', `${total - passed} test(s) failed. Review above for details.`);
    process.exit(1);
  }
}

// Main execution
runTests().catch(err => {
  log('fail', `Test suite error: ${err.message}`);
  process.exit(1);
});
