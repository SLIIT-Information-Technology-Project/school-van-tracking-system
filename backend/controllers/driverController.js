import jwt from "jsonwebtoken";

// Simulating a database natively in memory since MongoDB was requested to be temporarily bypassed
const driversDB = [];

// Function: Register a new driver (MOCK MEMORY VERSION)
export const registerDriver = async (req, res) => {
  try {
    console.log("[Driver Registration] Incoming Request Body:", req.body);
    // 1. Extract all driver details sent from the frontend request body
    const { name, username, phone, email, password, licenseNumber, vehicleType, vehicleNumber, seatCount, route, emergencyContact } = req.body;

    if (!name || !username || !phone || !email || !password || !licenseNumber || !vehicleType || !vehicleNumber || !seatCount || !route || !emergencyContact) {
      console.log("Missing fields detected in driver registration!");
      return res.status(400).json({ message: "Missing required registration parameters." });
    }

    // Check if user already exists in temporary array DB
    const existing = driversDB.find(d => d.email === email || d.username === username);
    if (existing) {
       return res.status(400).json({ message: "User already exists." });
    }

    // Save user into array safely
    const newDriver = {
      id: Date.now().toString(), // Generate a fake collision-free ID
      name, username, phone, email, password, licenseNumber, vehicleType, vehicleNumber, seatCount, route, emergencyContact
    };
    driversDB.push(newDriver);

    console.log(`Mock Driver (${username}) successfully registered in memory array!`);
    
    // Send success response back to frontend
    res.status(201).json({ message: "Driver registered successfully." }); 
  } catch (error) {
    res.status(500).json({ message: "Error registering driver", error: error.message });
  }
};

// Function: Login an existing driver (MOCK MEMORY VERSION)
export const loginDriver = async (req, res) => {
  try {
    const { input, password } = req.body; // Extract credentials sent via the request body
    
    if (!input || !password) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Attempt to locate the exact driver in our mock memory array by email or username
    const driver = driversDB.find(d => (d.email === input || d.username === input) && d.password === password);
    
    if (!driver) {
       return res.status(400).json({ message: "Invalid credentials." });
    }

    // Generate a mock secure JSON Web Token (JWT)
    const token = jwt.sign(
      { id: driver.id }, 
      process.env.JWT_SECRET || "fallback_secret_key", 
      { expiresIn: "10d" }
    );

    // CRITICAL: Destructure password out of the response so plain text passwords NEVER go to frontend
    const { password: removedPassword, ...safeDriverData } = driver;

    // Send successful response with the exact matched driver data stringified minus the password
    res.status(200).json({ 
      message: "Login successful", 
      token, 
      driver: safeDriverData 
    });

  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};
