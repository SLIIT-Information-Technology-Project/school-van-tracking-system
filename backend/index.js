import 'dotenv/config'; // Load env variables immediately (important for ES Modules)
import cors from "cors";
import express from "express";

// Import route handlers
import driverRoutes    from "./Routes/driverRoutes.js";
import parentRoutes    from "./Routes/parentRoutes.js";
import attendantRoutes from "./Routes/attendantRoutes.js";
import locationRoutes  from "./Routes/locationRoutes.js";
import systemRoutes    from "./Routes/systemRoutes.js";
import studentRoutes   from "./Routes/studentRoutes.js";
import attendanceRoutes from "./Routes/attendanceRoutes.js";
import paymentRoutes from "./Routes/paymentRoutes.js";
import notificationRoutes from "./Routes/notificationRoutes.js";
import profileRoutes      from "./Routes/profileRoutes.js";
import attendanceRoutes   from "./Routes/attendanceRoutes.js";
import vehicleRoutes      from "./Routes/vehicleRoutes.js";
import authRoutes         from "./Routes/authRoutes.js";

// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); // Parse incoming JSON bodies
app.use(cors());         // Allow all cross-origin requests

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Backend is running ✅" });
});

// QR Code endpoint
app.get("/qr", (_req, res) => {
  const expoUrl = "exp://192.168.43.98:8081";
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Expo Go - QR Code</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    </head>
    <body>
      <div id="qrcode"></div>
      <script>
        new QRCode(document.getElementById('qrcode'), {
          text: '${expoUrl}',
          width: 300, height: 300
        });
      </script>
    </body>
    </html>
  `;
  res.send(html);
});

// API Routes

app.use("/api/driver",     driverRoutes);
app.use("/api/parent",     parentRoutes);
app.use("/api/attendant",  attendantRoutes);
app.use("/api/location",   locationRoutes);
app.use("/api/system",     systemRoutes);
app.use("/api/students",   studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payments",   paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profile",       profileRoutes);
app.use("/api/attendance",    attendanceRoutes);
app.use("/api/vehicle",       vehicleRoutes);
app.use("/api/auth",          authRoutes);


const PREFERRED_PORT = parseInt(process.env.PORT || "5000", 10);

function startServer(port) {
  const server = app.listen(port, () => {
    console.log("─────────────────────────────────────");
    console.log(`✅  Server is running on port ${port}`);
    console.log(`🔗  Health: http://localhost:${port}/api/health`);
    console.log("─────────────────────────────────────");
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      // Port is taken — try the next one automatically
      console.warn(`⚠️  Port ${port} is already in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      // Unknown error — log and exit
      console.error("❌  Failed to start server:", err.message);
      process.exit(1);
    }
  });
}

startServer(PREFERRED_PORT);
