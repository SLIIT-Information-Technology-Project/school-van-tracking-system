# Database Seeding Instructions

## Overview
This document explains how to populate the database with sample payment data and related records.

## Files
- `database/seed.sql` - Complete SQL seed script with all sample data
- `backend/seed.js` - Node script to help with seeding (for reference)

## Sample Data Included

### 1. Users (9 total)
| Email | Role | Purpose |
|-------|------|---------|
| ahmed.khan@email.com | Parent | Parent of 2 students (Ali, Zara) |
| fatima.ali@email.com | Parent | Parent of Hana |
| hassan.mohamed@email.com | Parent | Parent of Omar |
| sara.ibrahim@email.com | Parent | Parent of Layla |
| mohammed.hussain@email.com | Driver | Driver of Van Alpha |
| ali.raza@email.com | Driver | Driver of Van Beta |
| zainab.khan@email.com | Attendant | Attendant for Van Alpha |
| amira.hassan@email.com | Attendant | Attendant for Van Beta |
| admin@email.com | Admin | System administrator |

### 2. Transportation Systems (2 Vans)
- **Van Alpha** (ABC-1234) - Route A (North)
  - Driver: Mohammed Hussain
  - 12 seats
  
- **Van Beta** (XYZ-5678) - Route B (South)
  - Driver: Ali Raza
  - 12 seats

### 3. Students (5 total)
- **Ali Khan** → Van Alpha, Al-Noor School, Grade 5
- **Zara Khan** → Van Alpha, Al-Noor School, Grade 3
- **Hana Ali** → Van Alpha, Al-Noor School, Grade 4
- **Omar Hassan** → Van Beta, International School, Grade 6
- **Layla Ibrahim** → Van Beta, International School, Grade 5

### 4. Payment Records (5 total)

| Student | Amount | Status | Reason |
|---------|--------|--------|--------|
| Ali Khan | Rs. 8,000 | Pending | 85% attendance (full price) |
| Zara Khan | Rs. 4,000 | Pending | 45% attendance (**50% OFF**) |
| Hana Ali | Rs. 8,000 | Paid | 90% attendance (paid on time) |
| Omar Hassan | Rs. 8,000 | Overdue | 75% attendance (unpaid) |
| Layla Ibrahim | Rs. 8,000 | Pending | 55% attendance (full price) |

### 5. Attendance Records (Sample)
- 6 attendance records across all students for the last 2 days
- Mix of morning/afternoon pickups and dropoffs
- Some "Not Coming" entries for testing

### 6. Conversations & Messages
- 3 conversations between parents, drivers, and attendants
- 3 sample messages for testing chat functionality

## How to Execute Seeding

### Method 1: Supabase Dashboard (RECOMMENDED)
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** → **New Query**
4. Copy the entire contents of `database/seed.sql`
5. Paste into the editor
6. Click **Run**
7. View output to confirm success

### Method 2: Via Backend Script
```bash
cd backend
node seed.js
```
This will display what data will be seeded, then you execute the seed.sql manually in Supabase.

### Method 3: psql (if you have direct PostgreSQL access)
```bash
psql -h your-host.supabase.co -U postgres -d postgres -f database/seed.sql
```

## Verifying Data

After seeding, verify with these Supabase queries:

```sql
-- Check users
SELECT COUNT(*) FROM users;
-- Expected: 9

-- Check payments
SELECT 
  student_id, 
  month, 
  calculated_payment, 
  payment_status 
FROM payments 
ORDER BY created_at DESC;
-- Expected: 5 records

-- Check attendance summary
SELECT 
  s.name as student_name,
  COUNT(*) as total_days,
  COUNT(CASE WHEN a.morning_pickup = true THEN 1 END) as pickup_days
FROM attendance a
JOIN students s ON a.student_id = s.id
GROUP BY s.id, s.name;

-- Check payment status overview
SELECT * FROM payment_status_overview ORDER BY created_at DESC;
```

## Important Notes

⚠️ **Before Running:**
- Make sure `database/schema.sql` has already been executed
- Ensure all tables exist
- Check that users don't have duplicate emails in the system

⚠️ **Data Conflicts:**
- The seed script uses `ON CONFLICT ... DO NOTHING` to skip duplicates
- Safe to run multiple times without errors
- Will not overwrite existing data with same email/plate number

### Security Note
- Sample passwords are hashed with bcrypt
- Replace with real credentials in production
- Never commit real passwords to repository

## Payment Calculation Tests

The seed data includes payments that test your auto-calculation logic:

```
Attendance ≤ 50% → 50% discount (4,000 Rs instead of 8,000)
Attendance > 50% → Full price (8,000 Rs)
```

Examples:
- Zara Khan (45% attendance) → Rs. 4,000 ✓
- Ali Khan (85% attendance) → Rs. 8,000 ✓

## Modifying Sample Data

To customize sample data:
1. Edit `database/seed.sql`
2. Change email addresses, names, amounts as needed
3. Re-run in Supabase SQL Editor
4. Old data will be skipped (ON CONFLICT), so delete manually first if needed

## Resetting Database

To start fresh:
```sql
-- In Supabase SQL Editor, run:
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS system_parents CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS transportation_systems CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then run schema.sql again
-- Then run seed.sql
```

---

**Questions?** Check the backend server logs or Supabase dashboard for any errors.
