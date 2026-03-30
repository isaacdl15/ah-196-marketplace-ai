#!/usr/bin/env node
// Apply Phase 2 migration via Supabase API
// Since there's no exec_sql RPC, we use a creative approach:
// spin up a Next.js API route handler that runs the SQL, then call it.
// Actually, let's just use supabase-js to create the tables via individual statements
// by calling an inline function trick.

const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SB_URL || !SB_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SB_URL, SB_KEY, {
  auth: { persistSession: false }
});

// Try to apply SQL via Supabase's hidden postgres endpoint
async function applySQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    const url = new URL(SB_URL);

    const options = {
      hostname: url.hostname,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Applying Phase 2 migration...');
  console.log('Supabase URL:', SB_URL);

  // Check if tables already exist
  const { data: existing, error: checkError } = await supabase
    .from('mp_profiles')
    .select('id')
    .limit(1);

  if (!checkError) {
    console.log('mp_profiles table already exists! Skipping migration.');
    return;
  }

  console.log('Tables do not exist. Need to apply migration manually.');
  console.log('Please apply the migration SQL from:');
  console.log('  supabase/migrations/20260330000000_phase2_marketplace.sql');
  console.log('');
  console.log('You can do this via:');
  console.log('1. Supabase Dashboard > SQL Editor');
  console.log('2. supabase db push (if CLI available)');
  console.log('3. Direct postgres connection');

  process.exit(1);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
