import fs from 'fs';
import path from 'path';

const envPath = path.resolve('../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  line = line.replace('\r', '').trim();
  if (!line || line.startsWith('#')) return;
  const idx = line.indexOf('=');
  if (idx !== -1) {
    const key = line.substring(0, idx).trim();
    const val = line.substring(idx + 1).trim();
    env[key] = val;
  }
});

const appUrl = env['NEXT_PUBLIC_SUPABASE_APP_URL'] || env['SUPABASE_APP_URL'];
const appServiceKey = env['SUPABASE_APP_SERVICE_ROLE_KEY'];

const platformUrl = env['NEXT_PUBLIC_SUPABASE_PLATFORM_URL'] || env['SUPABASE_PLATFORM_URL'];
const platformServiceKey = env['SUPABASE_PLATFORM_SERVICE_ROLE_KEY'];

if (!appUrl || !appServiceKey || !platformUrl || !platformServiceKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

async function checkTable(url, key, table) {
  try {
    const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    
    if (res.ok) {
      console.log(`✅ Successfully queried '${table}'`);
    } else {
      const err = await res.json();
      console.error(`❌ Failed querying '${table}': ${err.message || res.statusText}`);
    }
  } catch (e) {
    console.error(`❌ Error querying '${table}': ${e.message}`);
  }
}

async function main() {
  console.log('--- Testing App Project Schema ---');
  const appTables = [
    'broadcast_reads', 'community_posts', 'community_post_reactions',
    'community_post_comments', 'community_events', 'event_rsvps',
    'amenities', 'amenity_bookings', 'contractors', 'staff_shifts',
    'notification_tokens'
  ];

  for (const table of appTables) {
    await checkTable(appUrl, appServiceKey, table);
  }

  console.log('\n--- Testing Platform Project Schema ---');
  const platformViews = ['platform_estates', 'superadmin_profiles', 'support_logs'];
  
  for (const view of platformViews) {
    await checkTable(platformUrl, platformServiceKey, view);
  }
}

main().catch(console.error);
