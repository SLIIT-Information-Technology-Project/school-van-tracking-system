import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../utils/supabase.js";

// ─────────────────────────────────────────────────────────
// REGISTER ATTENDANT
// Saves attendant into the 'users' table with role = 'attendant'
// ─────────────────────────────────────────────────────────
export const registerAttendant = async (req, res) => {
  try {
    console.log("[Backend] registerAttendant body:", req.body);
    const { name, email, username, password } = req.body;

    const errors = [];
    if (!name || name.trim().length < 2)         errors.push("Full name is required (at least 2 characters).");
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push("A valid email address is required.(Ex : test@test.com)");
    if (!password || password.length < 6)         errors.push("Password must be at least 6 characters.");

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed.", errors });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert into 'users' table with role = 'attendant'
    // Insertion
    let insertResult = await supabase
      .from("users")
      .insert([{
        name:          name.trim(),
        username:      username ? username.trim().toLowerCase() : null,
        email:         email.trim().toLowerCase(),
        password_hash: passwordHash,
        role:          "attendant",
      }])
      .select()
      .single();

    // Fallback if 'username' column is missing in DB
    if (insertResult.error && insertResult.error.code === '42703') {
       console.warn("[Backend] Attendant registration: username column missing, retrying without it");
       insertResult = await supabase
         .from("users")
         .insert([{
           name:          name.trim(),
           email:         email.trim().toLowerCase(),
           password_hash: passwordHash,
           role:          "attendant",
         }])
         .select()
         .single();
    }

    if (insertResult.error) {
       if (insertResult.error.code === "23505") { // Unique constraint violation
         return res.status(400).json({ message: "Email already exists." });
       }
       throw insertResult.error;
    }

    const data = insertResult.data;

    return res.status(201).json({
      message: "Attendant registered successfully!",
      user: { id: data.id, name: data.name, email: data.email, role: data.role },
    });

  } catch (error) {
    console.error("Unexpected error (registerAttendant):", error);
    return res.status(500).json({ 
      message: "Server error during registration.", 
      error: error.message,
      details: error
    });
  }
};


// ─────────────────────────────────────────────────────────
// LOGIN ATTENDANT
// Finds user in 'users' table by email WHERE role = 'attendant'
// ─────────────────────────────────────────────────────────
export const loginAttendant = async (req, res) => {
  try {
    const { email, input, password } = req.body;
    const identifier = (email || input || "").trim().toLowerCase();
    
    if (!identifier || !password) {
      return res.status(400).json({ message: "Please provide your email and password." });
    }
    console.log(`[Backend] Attendant login attempt: ${identifier}`);

    // 1. Find user (any role)
    let { data: user, error } = await supabase
      .from("users")
      .select("*")
      .or(`email.eq."${identifier}",username.eq."${identifier}"`)
      .maybeSingle();

    // Fallback if column missing
    if (error && error.code === '42703') {
       console.warn("[Backend] username column missing, falling back to email lookup");
       const res = await supabase
         .from("users")
         .select("*")
         .eq("email", identifier)
         .maybeSingle();
       user = res.data;
       error = res.error;
    }

    if (error) {
      console.error("[Backend] Attendant database error:", error.message);
    }

    if (!user) {
      console.info(`[Backend] User not found: ${identifier}`);
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 2. Check role
    if (user.role !== "attendant") {
      console.info(`[Backend] Role mismatch: ${identifier} is ${user.role}, not attendant`);
      return res.status(403).json({ 
        message: `This account is registered as a ${user.role}. Please use the ${user.role} login portal.` 
      });
    }

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.info(`[Backend] Password mismatch: ${identifier}`);
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "10d" }
    );

    return res.status(200).json({
      message: "Login successful!",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }, // changed 'attendant' to 'user'
    });

  } catch (error) {
    console.error("Unexpected error (loginAttendant):", error);
    return res.status(500).json({ message: "Server error during login.", error: error.message });
  }
};
