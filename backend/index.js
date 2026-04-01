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
import paymentRoutes   from "./Routes/paymentRoutes.js";

// Initialize Express app

const app = express();

// Middleware
app.use(express.json()); // Parse incoming JSON bodies
app.use(cors());         // Allow all cross-origin requests (mobile app needs this)

// Health check — visit http://localhost:5000/api/health in browser to confirm it's running
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Backend is running ✅" });
});

// QR Code endpoint for Expo Go
app.get("/qr", (_req, res) => {
  const expoUrl = "exp://172.31.48.153:8081";
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Expo Go - QR Code</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          padding: 50px;
          text-align: center;
          max-width: 600px;
        }
        h1 { color: #667eea; font-size: 32px; margin-bottom: 10px; }
        .subtitle { color: #999; font-size: 16px; margin-bottom: 40px; }
        #qrcode { display: inline-block; padding: 20px; background: #f8f9fa; border-radius: 15px; margin: 20px 0; }
        .url-display {
          background: #f0f0f0;
          padding: 15px;
          border-radius: 10px;
          margin-top: 20px;
          font-family: 'Monaco', 'Menlo', monospace;
          color: #667eea;
          font-size: 14px;
          word-break: break-all;
        }
        .badge { display: inline-block; background: #10b981; color: white; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📱 Expo Go</h1>
        <div class="subtitle">School Van Tracking System</div>
        <div class="badge">✓ Dev Server Active</div>
        <div id="qrcode"></div>
        <div class="url-display">${expoUrl}</div>
        <p style="margin-top: 30px; color: #666;">Scan with Expo Go app to connect</p>
      </div>
      <script>
        new QRCode(document.getElementById('qrcode'), {
          text: '${expoUrl}',
          width: 300,
          height: 300,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
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
