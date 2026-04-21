-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    username TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'driver', 'parent', 'attendant')),
    phone TEXT,
    license_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 2. Routes table
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Vehicles table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plate_number TEXT UNIQUE NOT NULL,
    model TEXT,
    color TEXT,
    max_seats INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Transportation Systems table (formerly vans)
-- This table stores BOTH static van information AND 
-- the current dynamic live location of the driver.
CREATE TABLE transportation_systems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    plate_number TEXT UNIQUE NOT NULL,
    vehicle_type TEXT,
    max_seats INTEGER,
    join_code TEXT UNIQUE NOT NULL,
    current_lat DECIMAL(10, 8),
    current_lng DECIMAL(11, 8),
    route_id UUID REFERENCES routes(id),
    vehicle_id UUID REFERENCES vehicles(id),
    start_lat DECIMAL(10, 8),
    start_lng DECIMAL(11, 8),
    start_location_name TEXT,
    end_lat DECIMAL(10, 8),
    end_lng DECIMAL(11, 8),
    end_location_name TEXT,
    route_polyline TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Students table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    system_id UUID REFERENCES transportation_systems(id) ON DELETE CASCADE,
    school TEXT,
    grade TEXT,
    pickup_location TEXT,
    dropoff_location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. System Parents join table
CREATE TABLE system_parents (
    system_id UUID REFERENCES transportation_systems(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pickup_lat DECIMAL(10, 8),
    pickup_lng DECIMAL(11, 8),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (system_id, parent_id)
);

-- 7. System Attendants join table
CREATE TABLE system_attendants (
    system_id UUID REFERENCES transportation_systems(id) ON DELETE CASCADE,
    attendant_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    is_present BOOLEAN DEFAULT FALSE,
    has_control BOOLEAN DEFAULT FALSE,
    can_view_activities BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (system_id, attendant_id)
);

-- 6. Attendance table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    system_id UUID REFERENCES transportation_systems(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    morning_pickup BOOLEAN DEFAULT FALSE,
    morning_pickup_time TIMESTAMPTZ,
    morning_dropoff BOOLEAN DEFAULT FALSE,
    morning_dropoff_time TIMESTAMPTZ,
    morning_not_coming BOOLEAN DEFAULT FALSE,
    afternoon_pickup BOOLEAN DEFAULT FALSE,
    afternoon_pickup_time TIMESTAMPTZ,
    afternoon_dropoff BOOLEAN DEFAULT FALSE,
    afternoon_dropoff_time TIMESTAMPTZ,
    afternoon_not_coming BOOLEAN DEFAULT FALSE,
    notes TEXT,
    marked_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, date)
);

-- 7. Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    system_id UUID REFERENCES transportation_systems(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    full_payment DECIMAL(10, 2) DEFAULT 8000,
    attendance_percentage NUMERIC DEFAULT 0,
    calculated_payment DECIMAL(10, 2) DEFAULT 0,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'cancelled')),
    payment_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, month)
);

-- 8. Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    system_id UUID REFERENCES transportation_systems(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Conversations table (Chat)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    system_id UUID REFERENCES transportation_systems(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id_1, user_id_2, system_id),
    CHECK (user_id_1 < user_id_2)  -- Ensure consistent ordering
);

-- 10. Messages table (Chat)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- Step 1: Create the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Attach to transportation_systems
DROP TRIGGER IF EXISTS set_transportation_systems_updated_at ON transportation_systems;
CREATE TRIGGER set_transportation_systems_updated_at
BEFORE UPDATE ON transportation_systems
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Step 3: Attach to attendance
DROP TRIGGER IF EXISTS set_attendance_updated_at ON attendance;
CREATE TRIGGER set_attendance_updated_at
BEFORE UPDATE ON attendance
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Attach to payments
DROP TRIGGER IF EXISTS set_payments_updated_at ON payments;
CREATE TRIGGER set_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Attach to conversations
DROP TRIGGER IF EXISTS set_conversations_updated_at ON conversations;
CREATE TRIGGER set_conversations_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Attach to messages
DROP TRIGGER IF EXISTS set_messages_updated_at ON messages;
CREATE TRIGGER set_messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============ DATABASE CONNECTIONS & INTEGRATIONS ============

-- Function to automatically calculate payment based on attendance percentage
CREATE OR REPLACE FUNCTION calculate_payment_amount()
RETURNS TRIGGER AS $$
DECLARE
  full_payment DECIMAL;
  calculated_amount DECIMAL;
  estimated_days INTEGER;
  current_year_month TEXT;
BEGIN
  -- Get estimated working days in the month (typically 20-22 days)
  estimated_days := 20;
  
  -- Calculate payment: if attendance <= 50%, pay 50% of full payment
  full_payment := NEW.full_payment;
  IF NEW.attendance_percentage <= 50 THEN
    calculated_amount := full_payment / 2;
  ELSE
    calculated_amount := full_payment;
  END IF;
  
  NEW.calculated_payment := calculated_amount;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate payment when attendance percentage is set
DROP TRIGGER IF EXISTS auto_calculate_payment ON payments;
CREATE TRIGGER auto_calculate_payment
BEFORE INSERT OR UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION calculate_payment_amount();

-- Function to update payment status based on payment date
CREATE OR REPLACE FUNCTION update_payment_status_by_date()
RETURNS TRIGGER AS $$
BEGIN
  -- If payment due date is past and not paid, mark as overdue
  IF NEW.month < CURRENT_DATE::text AND NEW.payment_status = 'pending' THEN
    NEW.payment_status := 'overdue';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update payment status
DROP TRIGGER IF EXISTS auto_update_payment_status ON payments;
CREATE TRIGGER auto_update_payment_status
BEFORE INSERT OR UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_payment_status_by_date();

-- ============ VIEWS FOR EASY DATA RETRIEVAL ============

-- View: Student Attendance Summary (for Payment Calculation)
DROP VIEW IF EXISTS student_attendance_summary CASCADE;
CREATE VIEW student_attendance_summary AS
SELECT 
  s.id AS student_id,
  s.name AS student_name,
  ts.id AS system_id,
  ts.name AS system_name,
  COUNT(CASE WHEN a.morning_pickup = true OR a.morning_dropoff = true OR a.afternoon_pickup = true OR a.afternoon_dropoff = true THEN 1 END) AS attended_days,
  COUNT(*) AS total_days,
  ROUND(
    (COUNT(CASE WHEN a.morning_pickup = true OR a.morning_dropoff = true OR a.afternoon_pickup = true OR a.afternoon_dropoff = true THEN 1 END)::DECIMAL / 
    NULLIF(COUNT(*), 0)) * 100, 2
  ) AS attendance_percentage,
  DATE_TRUNC('month', a.date)::DATE AS month
FROM students s
LEFT JOIN transportation_systems ts ON s.system_id = ts.id
LEFT JOIN attendance a ON s.id = a.student_id
GROUP BY s.id, s.name, ts.id, ts.name, DATE_TRUNC('month', a.date);

-- View: Payment Status Overview
DROP VIEW IF EXISTS payment_status_overview CASCADE;
CREATE VIEW payment_status_overview AS
SELECT 
  p.id,
  p.student_id,
  s.name AS student_name,
  s.school,
  p.month,
  p.full_payment,
  p.attendance_percentage,
  p.calculated_payment,
  p.payment_status,
  CASE 
    WHEN p.payment_status = 'paid' THEN 'Paid'
    WHEN p.payment_status = 'overdue' THEN 'Overdue'
    WHEN p.payment_status = 'pending' THEN 'Pending'
    WHEN p.payment_status = 'cancelled' THEN 'Cancelled'
  END AS status_display,
  CASE 
    WHEN p.attendance_percentage <= 50 THEN '50% OFF'
    ELSE 'Full Price'
  END AS discount_status,
  uts.id AS parent_id,
  uts.name AS parent_name,
  ts.name AS system_name
FROM payments p
LEFT JOIN students s ON p.student_id = s.id
LEFT JOIN users uts ON p.parent_id = uts.id
LEFT JOIN transportation_systems ts ON p.system_id = ts.id;

-- View: Student Communication History
DROP VIEW IF EXISTS student_communication_view CASCADE;
CREATE VIEW student_communication_view AS
SELECT 
  s.id AS student_id,
  s.name AS student_name,
  c.id AS conversation_id,
  u1.name AS user1_name,
  u2.name AS user2_name,
  ts.name AS system_name,
  COUNT(m.id) AS total_messages,
  MAX(m.created_at) AS last_message_time
FROM students s
LEFT JOIN transportation_systems ts ON s.system_id = ts.id
LEFT JOIN conversations c ON ts.id = c.system_id
LEFT JOIN users u1 ON c.user_id_1 = u1.id
LEFT JOIN users u2 ON c.user_id_2 = u2.id
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY s.id, s.name, c.id, u1.name, u2.name, ts.name;

-- View: Complete Student Dashboard Data
DROP VIEW IF EXISTS student_complete_dashboard CASCADE;
CREATE VIEW student_complete_dashboard AS
SELECT 
  s.id AS student_id,
  s.name AS student_name,
  s.school,
  s.parent_id,
  p_user.name AS parent_name,
  ts.id AS system_id,
  ts.name AS system_name,
  ts.plate_number,
  -- Attendance Metrics
  COALESCE(sas.attendance_percentage, 0) AS attendance_percentage,
  COALESCE(sas.attended_days, 0) AS attended_days,
  COALESCE(sas.total_days, 0) AS total_days,
  -- Payment Metrics
  COALESCE(latest_payment.calculated_payment, 0) AS latest_payment_amount,
  latest_payment.payment_status,
  latest_payment.month AS latest_payment_month,
  -- Communication
  COALESCE(SUM(CASE WHEN m.id IS NOT NULL THEN 1 ELSE 0 END), 0) AS total_messages
FROM students s
LEFT JOIN users p_user ON s.parent_id = p_user.id
LEFT JOIN transportation_systems ts ON s.system_id = ts.id
LEFT JOIN student_attendance_summary sas ON s.id = sas.student_id
LEFT JOIN LATERAL (
  SELECT calculated_payment, payment_status, month
  FROM payments
  WHERE student_id = s.id
  ORDER BY month DESC
  LIMIT 1
) latest_payment ON true
LEFT JOIN conversations c ON ts.id = c.system_id
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY s.id, s.name, s.school, s.parent_id, p_user.name, ts.id, ts.name, ts.plate_number, 
         sas.attendance_percentage, sas.attended_days, sas.total_days, 
         latest_payment.calculated_payment, latest_payment.payment_status, latest_payment.month;