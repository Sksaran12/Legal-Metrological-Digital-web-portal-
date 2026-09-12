import express from "express";
import path from "path";
import fs from "fs";
import os from "os";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";

// Load environment variables from .env
dotenv.config();

import { connectDB } from "./config/db";
import { seedDatabase } from "./utils/seedDatabase";
import { errorHandler } from "./middleware/errorHandler";
import { generalRateLimiter } from "./middleware/rateLimiter";
import { getAppConfig } from "./config/env";

// API Routes
import authRoutes from "./routes/authRoutes";
import certRoutes from "./routes/certRoutes";
import appRoutes from "./routes/appRoutes";
import officerRoutes from "./routes/officerRoutes";
import instrumentRoutes from "./routes/instrumentRoutes";
import stakeholderRoutes from "./routes/stakeholderRoutes";
import gatcRoutes from "./routes/gatcRoutes";
import alertRoutes from "./routes/alertRoutes";
import inquiryRoutes from "./routes/inquiryRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import { viewCertificateWhitePage, downloadCertificateBinaryPdf } from "./controllers/certController";

async function startServer() {
  const app = express();
  const config = getAppConfig();

  // Connect to MongoDB Atlas
  const isDbConnected = await connectDB();
  if (isDbConnected) {
    await seedDatabase();
  }

  // CORS Configuration
  const defaultOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173"
  ];

  const normalizeOrigin = (value: string): string | null => {
    try {
      return new URL(value.trim()).origin;
    } catch {
      return null;
    }
  };

  const envOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN
        .split(",")
        .map(normalizeOrigin)
        .filter((origin): origin is string => Boolean(origin))
    : [];
  const publicAppOrigin = normalizeOrigin(config.publicAppUrl);
  const knownVercelOrigin = normalizeOrigin(
    "https://legal-metrological-digital-we-git-1a8f41-saran-mandals-projects.vercel.app"
  );

  const allowedOrigins = config.isProduction
    ? Array.from(new Set([...envOrigins, publicAppOrigin, knownVercelOrigin].filter((origin): origin is string => Boolean(origin))))
    : Array.from(new Set([...defaultOrigins, ...envOrigins]));

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Origin is not allowed by CORS policy.'));
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
      credentials: true,
      optionsSuccessStatus: 200
    })
  );

  app.use(helmet({
    contentSecurityPolicy: config.isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false
  }));
  app.use(express.json({
    limit: "10mb",
    verify: (req, _res, buffer) => {
      (req as express.Request & { rawBody?: Buffer }).rawBody = Buffer.from(buffer);
    }
  }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // General rate limiter for API endpoints
  app.use("/api", generalRateLimiter);

  // Cloud Run and GCP health check endpoints
  app.all(["/api/health", "/health", "/healthz", "/_ah/health"], (req, res) => {
    res.status(200).json({
      status: "ok",
      database: isDbConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString()
    });
  });

  // Local Network discovery endpoint for Mobile QR code scanning
  app.get(["/api/system/network-info", "/api/network-info"], (req, res) => {
    const nets = os.networkInterfaces();
    let lanIp = req.hostname;
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === "IPv4" && !net.internal) {
          lanIp = net.address;
          break;
        }
      }
    }
    const port = process.env.PORT || 3000;
    res.status(200).json({
      success: true,
      lanIp,
      lanUrl: `http://${lanIp}:${port}`
    });
  });

  // Mount API REST Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/certificates", certRoutes);
  app.use("/api/applications", appRoutes);
  app.use("/api/lmo-officers", officerRoutes);
  app.use("/api/instruments", instrumentRoutes);
  app.use("/api/stakeholders", stakeholderRoutes);
  app.use("/api/gatc-centres", gatcRoutes);
  app.use("/api/alerts", alertRoutes);
  app.use("/api/inquiries", inquiryRoutes);
  app.use("/api/payments", paymentRoutes);

  // Centralized Error Handling Middleware for API routes
  app.use(errorHandler);

  // Standalone Statutory Form 24 Certificate routes for Mobile QR Scanners & All Browsers
  // Serves crisp, mobile-friendly Form 24 white certificates without SPA bundle dependency
  app.get(["/verify/:query", "/certificate/:query"], viewCertificateWhitePage);
  app.get(["/verify/:query/download", "/download/:query", "/download/:query.pdf"], downloadCertificateBinaryPdf);

  // In development, mount Vite middleware. In production, serve pre-built dist assets.
  if (process.env.NODE_ENV !== "production") {
    process.env.VITE_MIDDLEWARE_MODE = "true";
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.join(process.cwd(), "dist", "index.html"))
      ? path.join(process.cwd(), "dist")
      : path.resolve(__dirname);

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const isProduction = process.env.NODE_ENV === "production";
  const initialPort = isProduction
    ? (Number(process.env.PORT) || 8080)
    : (Number(process.env.PORT) || 3000);

  function startListening(port: number, maxRetries = 10) {
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server listening on http://0.0.0.0:${port} (${isProduction ? "production" : "development"})`);
      console.log(`📡 API Endpoints active at http://localhost:${port}/api/`);
    });

    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE" && maxRetries > 0) {
        console.warn(`⚠️ Port ${port} is already in use (EADDRINUSE). Retrying automatically on port ${port + 1}...`);
        startListening(port + 1, maxRetries - 1);
      } else {
        console.error(`Primary server error on port ${port}:`, err.message);
      }
    });
  }

  startListening(initialPort);
}

startServer();
