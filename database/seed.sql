-- Seed Data Script for School Van Tracking System
-- This script populates the database with sample data for testing and development

-- 1. Insert Sample Users (Parents, Drivers, Attendants)
INSERT INTO users (name, email, password_hash, role) VALUES
('Ahmed Khan', 'ahmed.khan@email.com', '$2b$10$hashedpassword1', 'parent'),
('Fatima Ali', 'fatima.ali@email.com', '$2b$10$hashedpassword2', 'parent'),
('Hassan Mohamed', 'hassan.mohamed@email.com', '$2b$10$hashedpassword3', 'parent'),
('Sara Ibrahim', 'sara.ibrahim@email.com', '$2b$10$hashedpassword4', 'parent'),
('Mohammed Hussain', 'mohammed.hussain@email.com', '$2b$10$hashedpassword5', 'driver'),
('Ali Raza', 'ali.raza@email.com', '$2b$10$hashedpassword6', 'driver'),
('Zainab Khan', 'zainab.khan@email.com', '$2b$10$hashedpassword7', 'attendant'),
('Amira Hassan', 'amira.hassan@email.com', '$2b$10$hashedpassword8', 'attendant'),
('Admin User', 'admin@email.com', '$2b$10$hashedpassword9', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Sample Routes
INSERT INTO routes (name) VALUES
('Route A - North'),
('Route B - South'),
('Route C - East'),
('Route D - West'),
('Route E - Central')
ON CONFLICT DO NOTHING;

-- 3. Insert Sample Transportation Systems (Vans)
INSERT INTO transportation_systems (
    driver_id, 
    name, 
    plate_number, 
    vehicle_type, 
    max_seats, 
    join_code, 
    current_lat, 
    current_lng, 
    route_id
) VALUES
(
    (SELECT id FROM users WHERE email = 'mohammed.hussain@email.com'),
    'Van Alpha',
    'ABC-1234',
    'Passenger Van',
    12,
    'VAN001',
    24.8607,
    67.0011,
    (SELECT id FROM routes WHERE name = 'Route A - North')
),
(
    (SELECT id FROM users WHERE email = 'ali.raza@email.com'),
    'Van Beta',
    'XYZ-5678',
    'Passenger Van',
    12,
    'VAN002',
    24.9056,
    67.0411,
    (SELECT id FROM routes WHERE name = 'Route B - South')
)
ON CONFLICT (plate_number) DO NOTHING;

-- 4. Insert Sample Students
INSERT INTO students (
    name, 
    parent_id, 
    system_id, 
    school, 
    grade, 
    pickup_location, 
    dropoff_location
) VALUES
(
    'Ali Khan',
    (SELECT id FROM users WHERE email = 'ahmed.khan@email.com'),
    (SELECT id FROM transportation_systems WHERE plate_number = 'ABC-1234'),
    'Al-Noor School',
    '5th Grade',
    '123 Street, North',
    'School Gate A'
),
(
    'Zara Khan',
    (SELECT id FROM users WHERE email = 'ahmed.khan@email.com'),
    (SELECT id FROM transportation_systems WHERE plate_number = 'ABC-1234'),
    'Al-Noor School',
    '3rd Grade',
    '123 Street, North',
    'School Gate A'
),
(
    'Hana Ali',
    (SELECT id FROM users WHERE email = 'fatima.ali@email.com'),
    (SELECT id FROM transportation_systems WHERE plate_number = 'ABC-1234'),
    'Al-Noor School',
    '4th Grade',
    '456 Avenue, North',
    'School Gate B'
),
(
    'Omar Hassan',
    (SELECT id FROM users WHERE email = 'hassan.mohamed@email.com'),
    (SELECT id FROM transportation_systems WHERE plate_number = 'XYZ-5678'),
    'International School',
    '6th Grade',
    '789 Boulevard, South',
    'School Entrance'
),
(
    'Layla Ibrahim',
    (SELECT id FROM users WHERE email = 'sara.ibrahim@email.com'),
    (SELECT id FROM transportation_systems WHERE plate_number = 'XYZ-5678'),
    'International School',
    '5th Grade',
    '321 Park Lane, South',
    'School Entrance'
)
ON CONFLICT DO NOTHING;

-- 5. Insert System Parents (link parents to transportation systems)
INSERT INTO system_parents (system_id, parent_id) VALUES
(
    (SELECT id FROM transportation_systems WHERE plate_number = 'ABC-1234'),
    (SELECT id FROM users WHERE email = 'ahmed.khan@email.com')
),
(
    (SELECT id FROM transportation_systems WHERE plate_number = 'ABC-1234'),
    (SELECT id FROM users WHERE email = 'fatima.ali@email.com')
),
(
    (SELECT id FROM transportation_systems WHERE plate_number = 'ABC-1234'),
    (SELECT id FROM users WHERE email = 'hassan.mohamed@email.com')
),
(
    (SELECT id FROM transportation_systems WHERE plate_number = 'XYZ-5678'),
    (SELECT id FROM users WHERE email = 'hassan.mohamed@email.com')
),
(
    (SELECT id FROM transportation_systems WHERE plate_number = 'XYZ-5678'),
    (SELECT id FROM users WHERE email = 'sara.ibrahim@email.com')
)
ON CONFLICT DO NOTHING;

-- 6. Insert Sample Attendance Records (Last 30 days)
INSERT INTO attendance (
    student_id,
    system_id,
    date,
    morning_pickup,
    morning_dropoff,
    morning_not_coming,
    afternoon_pickup,
    afternoon_dropoff,
    afternoon_not_coming,
    marked_by
) VALUES
(
    (SELECT id FROM students WHERE name = 'Ali Khan'),
    (SELECT id FROM transportation_systems WHERE plate_number = 'ABC-1234'),
    CURRENT_DATE - INTERVAL '1 day',
    true,
    true,
    false,
    true,
    true,
    false,
    (SELECT id FROM users WHERE email = 'zainab.khan@email.com')
),
(
    (SELECT id FROM students WHERE name = 'Ali Khan'),
    (SELECT id FROM transportation_systems WHERE plate_number = 'ABC-1234'),
    CURRENT_DATE - INTERVAL '2 days',
    true,
    true,
    false,
    true,
    true,
    false,
    (SELECT id FROM users WHERE email = 'zainab.khan@email.com')
),
(
    (SELECT id FROM students WHERE name = 'Zara Khan'),
    (SELECT id FROM transportation_systems WHERE plate_number = 'ABC-1234'),
    CURRENT_DATE - INTERVAL '1 day',
    true,
    true,
    false,
    false,
    false,
    true,
    (SELECT id FROM users WHERE email = 'zainab.khan@email.com')
),
(
    (SELECT id FROM students WHERE name = 'Hana Ali'),
    (SELECT id FROM transportation_systems WHERE plate_number = 'ABC-1234'),
    CURRENT_DATE - INTERVAL '1 day',
    true,
    true,
    false,
    true,
    true,
    false,
    (SELECT id FROM users WHERE email = 'zainab.khan@email.com')
),
(
    (SELECT id FROM students WHERE name = 'Omar Hassan'),
    (SELECT id FROM transportation_systems WHERE plate_number = 'XYZ-5678'),
    CURRENT_DATE - INTERVAL '1 day',
    true,
    true,
    false,
    true,
    true,
    false,
    (SELECT id FROM users WHERE email = 'amira.hassan@email.com')
),
(
    (SELECT id FROM students WHERE name = 'Layla Ibrahim'),
    (SELECT id FROM transportation_systems WHERE plate_number = 'XYZ-5678'),
    CURRENT_DATE - INTERVAL '1 day',
    true,
    true,
    false,
    true,
    true,
    false,
    (SELECT id FROM users WHERE email = 'amira.hassan@email.com')
)
ON CONFLICT DO NOTHING;

-- 7. Insert Sample Payment Records
INSERT INTO payments (
    student_id,
    system_id,
    parent_id,
    month,
    full_payment,
    attendance_percentage,
    calculated_payment,
    payment_status,
    notes
) VALUES
(
    (SELECT id FROM students WHERE name = 'Ali Khan'),
    (SELECT id FROM transportation_systems WHERE plate_number = 'ABC-1234'),
    (SELECT id FROM users WHERE email = 'ahmed.khan@email.com'),
    DATE_TRUNC('month', CURRENT_DATE)::DATE,
    8000.00,
    85.00,
    8000.00,
    'pending',
    'Payment for March 2026 - Full Amount'
),
(
    (SELECT id FROM students WHERE name = 'Zara Khan'),
    (SELECT id FROM transportation_systems WHERE plate_number = 'ABC-1234'),
    (SELECT id FROM users WHERE email = 'ahmed.khan@email.com'),
    DATE_TRUNC('month', CURRENT_DATE)::DATE,
    8000.00,
    45.00,
    4000.00,
    'pending',
    'Payment for March 2026 - 50% Discount (Low Attendance)'
),
(
    (SELECT id FROM students WHERE name = 'Hana Ali'),
    (SELECT id FROM transportation_systems WHERE plate_number = 'ABC-1234'),
    (SELECT id FROM users WHERE email = 'fatima.ali@email.com'),
    DATE_TRUNC('month', CURRENT_DATE)::DATE,
    8000.00,
    90.00,
    8000.00,
    'paid',
    'Payment for March 2026 - Paid on 28-Mar-2026'
),
(
    (SELECT id FROM students WHERE name = 'Omar Hassan'),
    (SELECT id FROM transportation_systems WHERE plate_number = 'XYZ-5678'),
    (SELECT id FROM users WHERE email = 'hassan.mohamed@email.com'),
    DATE_TRUNC('month', CURRENT_DATE)::DATE,
    8000.00,
    75.00,
    8000.00,
    'overdue',
    'Payment for March 2026 - Overdue'
),
(
    (SELECT id FROM students WHERE name = 'Layla Ibrahim'),
    (SELECT id FROM transportation_systems WHERE plate_number = 'XYZ-5678'),
    (SELECT id FROM users WHERE email = 'sara.ibrahim@email.com'),
    DATE_TRUNC('month', CURRENT_DATE)::DATE,
    8000.00,
    55.00,
    8000.00,
    'pending',
    'Payment for March 2026 - Regular Amount'
)
ON CONFLICT (student_id, month) DO NOTHING;

-- 8. Insert Sample Conversations (Chat)
INSERT INTO conversations (user_id_1, user_id_2, system_id) VALUES
(
    (SELECT id FROM users WHERE email = 'ahmed.khan@email.com'),
    (SELECT id FROM users WHERE email = 'mohammed.hussain@email.com'),
    (SELECT id FROM transportation_systems WHERE plate_number = 'ABC-1234')
),
(
    (SELECT id FROM users WHERE email = 'fatima.ali@email.com'),
    (SELECT id FROM users WHERE email = 'zainab.khan@email.com'),
    (SELECT id FROM transportation_systems WHERE plate_number = 'ABC-1234')
),
(
    (SELECT id FROM users WHERE email = 'hassan.mohamed@email.com'),
    (SELECT id FROM users WHERE email = 'ali.raza@email.com'),
    (SELECT id FROM transportation_systems WHERE plate_number = 'XYZ-5678')
)
ON CONFLICT (user_id_1, user_id_2, system_id) DO NOTHING;

-- 9. Insert Sample Messages (Chat)
INSERT INTO messages (conversation_id, sender_id, content) VALUES
(
    (SELECT id FROM conversations LIMIT 1),
    (SELECT id FROM users WHERE email = 'ahmed.khan@email.com'),
    'Hi, when will the van arrive tomorrow?'
),
(
    (SELECT id FROM conversations LIMIT 1),
    (SELECT id FROM users WHERE email = 'mohammed.hussain@email.com'),
    'Around 7:30 AM as usual'
),
(
    (SELECT id FROM conversations LIMIT 1),
    (SELECT id FROM users WHERE email = 'ahmed.khan@email.com'),
    'Thanks!'
);

-- 10. Output Summary
SELECT '✓ Seed data inserted successfully!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_students FROM students;
SELECT COUNT(*) as total_payments FROM payments;
SELECT COUNT(*) as total_attendance FROM attendance;
