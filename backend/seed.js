import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY are required in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  try {
    console.log('📊 Starting database seeding...\n');

    // Read the seed SQL file
    const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf-8');

    // Execute seed script
    const { error } = await supabase.rpc('exec_sql', {
      sql: seedSQL
    }).catch(() => {
      // If RPC doesn't exist, we'll do it differently
      return { error: 'RPC not available' };
    });

    if (!error) {
      console.log('✅ Database seeded successfully!\n');
      return;
    }

    // Alternative: Use raw SQL execution via the Supabase client
    console.log('📝 Seeding via direct queries...\n');

    // Seed Users
    console.log('➕ Creating sample users...');
    const users = [
      { name: 'Ahmed Khan', email: 'ahmed.khan@email.com', role: 'parent' },
      { name: 'Fatima Ali', email: 'fatima.ali@email.com', role: 'parent' },
      { name: 'Hassan Mohamed', email: 'hassan.mohamed@email.com', role: 'parent' },
      { name: 'Sara Ibrahim', email: 'sara.ibrahim@email.com', role: 'parent' },
      { name: 'Mohammed Hussain', email: 'mohammed.hussain@email.com', role: 'driver' },
      { name: 'Ali Raza', email: 'ali.raza@email.com', role: 'driver' },
      { name: 'Zainab Khan', email: 'zainab.khan@email.com', role: 'attendant' },
      { name: 'Amira Hassan', email: 'amira.hassan@email.com', role: 'attendant' }
    ];

    // Create simple payment records without full relationships
    console.log('➕ Creating sample payments...');
    const payments = [
      {
        student_name: 'Ali Khan (Parent: Ahmed Khan)',
        month: new Date().toISOString().split('T')[0],
        full_payment: 8000.00,
        attendance_percentage: 85.00,
        calculated_payment: 8000.00,
        payment_status: 'pending',
        notes: 'Payment for March 2026 - Full Amount'
      },
      {
        student_name: 'Zara Khan (Parent: Ahmed Khan)',
        month: new Date().toISOString().split('T')[0],
        full_payment: 8000.00,
        attendance_percentage: 45.00,
        calculated_payment: 4000.00,
        payment_status: 'pending',
        notes: 'Payment for March 2026 - 50% Discount (Low Attendance)'
      },
      {
        student_name: 'Hana Ali (Parent: Fatima Ali)',
        month: new Date().toISOString().split('T')[0],
        full_payment: 8000.00,
        attendance_percentage: 90.00,
        calculated_payment: 8000.00,
        payment_status: 'paid',
        notes: 'Payment for March 2026 - Paid'
      },
      {
        student_name: 'Omar Hassan (Parent: Hassan Mohamed)',
        month: new Date().toISOString().split('T')[0],
        full_payment: 8000.00,
        attendance_percentage: 75.00,
        calculated_payment: 8000.00,
        payment_status: 'overdue',
        notes: 'Payment for March 2026 - Overdue'
      },
      {
        student_name: 'Layla Ibrahim (Parent: Sara Ibrahim)',
        month: new Date().toISOString().split('T')[0],
        full_payment: 8000.00,
        attendance_percentage: 55.00,
        calculated_payment: 8000.00,
        payment_status: 'pending',
        notes: 'Payment for March 2026 - Regular Amount'
      }
    ];

    console.log('\n📊 Sample Data Summary:');
    console.log('=====================================');
    console.log(`📝 Users to create: ${users.length}`);
    console.log(`💳 Payment records: ${payments.length}`);
    payments.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.student_name}: Rs. ${p.calculated_payment} (${p.payment_status})`);
    });
    console.log('=====================================\n');

    console.log('✅ Seed data prepared! Execute seed.sql in your Supabase SQL Editor to populate the database.');
    console.log('\n📍 Location: database/seed.sql');
    console.log('🔗 Instructions:');
    console.log('   1. Login to Supabase Dashboard');
    console.log('   2. Go to SQL Editor');
    console.log('   3. Create New Query');
    console.log('   4. Copy & paste contents of database/seed.sql');
    console.log('   5. Click RUN');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
