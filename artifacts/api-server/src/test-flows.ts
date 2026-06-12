import fs from 'fs';
import path from 'path';

// 1. Load env before importing anything
const envPath = path.resolve('../../.env.local');
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    line = line.replace('\r', '').trim();
    if (!line || line.startsWith('#')) return;
    const idx = line.indexOf('=');
    if (idx !== -1) {
      const key = line.substring(0, idx).trim();
      const val = line.substring(idx + 1).trim();
      process.env[key] = val;
    }
  });
} catch (e) {
  console.log("No .env.local found, assuming vars are loaded.");
}

// Ensure fallbacks are set
process.env.SUPABASE_APP_URL = process.env.SUPABASE_APP_URL || process.env.NEXT_PUBLIC_SUPABASE_APP_URL;
process.env.SUPABASE_APP_ANON_KEY = process.env.SUPABASE_APP_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_APP_ANON_KEY;
process.env.SUPABASE_PLATFORM_URL = process.env.SUPABASE_PLATFORM_URL || process.env.NEXT_PUBLIC_SUPABASE_PLATFORM_URL;

// Now import app and supabase
import app from './app';
import { supabaseApp, supabasePlatform } from './lib/supabase';
import { createClient } from '@supabase/supabase-js';

const PORT = 8081;
const API_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log("Starting backend verification flows...");
  
  // Start server
  const server = app.listen(PORT);

  try {
    // 1. Setup Test Data
    const dummyEmail = `test.resident.${Date.now()}@estavo.co.za`;
    const dummyAdminEmail = `test.admin.${Date.now()}@estavo.co.za`;
    
    // Create Estate
    const { data: estate, error: estErr } = await supabasePlatform.from('estates').insert({
      name: 'Integration Test Estate',
      subscription_tier: 'enterprise',
      is_active: true
    }).select().single();
    if (estErr) throw new Error("Estate creation failed: " + estErr.message);

    const estateId = estate.id;
    const appEstateId = estate.app_estate_id;

    // Create Unit
    const { data: unit, error: unitErr } = await supabaseApp.from('units').insert({
      estate_id: appEstateId,
      unit_number: 'TEST-123',
    }).select().single();
    if (unitErr) throw new Error("Unit creation failed: " + unitErr.message);

    // Create App User
    const { data: appUserAuth, error: authErr1 } = await supabaseApp.auth.admin.createUser({
      email: dummyEmail,
      password: 'password123',
      email_confirm: true
    });
    if (authErr1) throw new Error("App User auth failed: " + authErr1.message);
    const appUserId = appUserAuth.user.id;

    // Create Profile
    await supabaseApp.from('profiles').insert({
      id: appUserId,
      estate_id: appEstateId,
      unit_id: unit.id,
      role: 'resident',
      full_name: 'Test Resident',
      email: dummyEmail,
      is_active: true
    });

    // Create Platform Admin
    const { data: platUserAuth, error: authErr2 } = await supabasePlatform.auth.admin.createUser({
      email: dummyAdminEmail,
      password: 'password123',
      email_confirm: true
    });
    if (authErr2) throw new Error("Platform Admin auth failed: " + authErr2.message);
    const platUserId = platUserAuth.user.id;

    await supabasePlatform.from('platform_admins').insert({
      id: platUserId,
      email: dummyAdminEmail,
      role: 'super_admin',
      is_active: true
    });

    // 2. Generate Session Tokens (JWTs)
    console.log("Acquiring session tokens...");
    
    // App Anon Client for login
    const appClient = createClient(process.env.SUPABASE_APP_URL!, process.env.SUPABASE_APP_ANON_KEY!);
    const { data: appSession, error: appSessErr } = await appClient.auth.signInWithPassword({
      email: dummyEmail,
      password: 'password123'
    });
    if (appSessErr || !appSession.session) throw new Error("Failed to sign in resident");
    const appToken = appSession.session.access_token;

    // Platform Client for login
    const platClient = createClient(process.env.SUPABASE_PLATFORM_URL!, process.env.NEXT_PUBLIC_SUPABASE_PLATFORM_ANON_KEY!);
    const { data: platSession, error: platSessErr } = await platClient.auth.signInWithPassword({
      email: dummyAdminEmail,
      password: 'password123'
    });
    if (platSessErr || !platSession.session) throw new Error("Failed to sign in admin");
    const platToken = platSession.session.access_token;

    const request = async (path: string, token: string, method = 'GET', body?: any) => {
      const res = await fetch(`${API_URL}${path}`, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      });
      const data = await res.json();
      if (!res.ok) throw new Error(`${method} ${path} failed: ${JSON.stringify(data)}`);
      return data;
    };

    // 3. Execute API Flows
    console.log("Running endpoint tests...");

    // -> Auth Me
    const me = await request('/auth/me', appToken);
    console.log(`✅ GET /auth/me - Hello ${me.firstName}`);

    // -> Community
    const postRes = await request('/community/posts', appToken, 'POST', {
      content: 'Hello World', postType: 'general', isAnonymous: false
    });
    console.log(`✅ POST /community/posts - ID: ${postRes.post.id}`);

    await request(`/community/posts/${postRes.post.id}/react`, appToken, 'POST', { reaction: 'like' });
    console.log(`✅ POST /community/posts/:id/react`);

    const posts = await request('/community/posts', appToken);
    if (!posts.posts.length) throw new Error("No posts returned");
    console.log(`✅ GET /community/posts - Found ${posts.posts.length} posts`);

    // -> Emergency
    const alert = await request('/emergency', appToken, 'POST');
    console.log(`✅ POST /emergency - Ref: ${alert.emergencyRef}`);

    const emergencyHistory = await request('/emergency/history', appToken);
    console.log(`✅ GET /emergency/history - Found ${emergencyHistory.alerts.length} alerts`);

    // -> Reports
    const report = await request('/reports', appToken, 'POST', {
      title: 'Leaky Faucet', description: 'Dripping non-stop', category: 'maintenance', priority: 'medium'
    });
    console.log(`✅ POST /reports - Ticket: ${report.report.ticketNumber}`);

    const reports = await request('/reports', appToken);
    console.log(`✅ GET /reports - Found ${reports.reports.length} reports`);

    // -> Platform
    const stats = await request('/platform/stats', platToken);
    console.log(`✅ GET /platform/stats - Active Estates: ${stats.activeEstates}`);

    // -> Logout
    await request('/auth/logout', appToken, 'POST');
    console.log(`✅ POST /auth/logout (App)`);

    console.log("\n🚀 All API flows completed successfully!");

    // 4. Cleanup
    console.log("\nCleaning up test data...");
    await supabasePlatform.auth.admin.deleteUser(platUserId);
    await supabaseApp.auth.admin.deleteUser(appUserId);
    await supabasePlatform.from('estates').delete().eq('id', estateId);
    console.log("✅ Cleanup complete");

  } catch (err) {
    console.error("❌ Test Failed:", err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
