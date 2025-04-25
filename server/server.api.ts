import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import session from "express-session";
import memorystore from "memorystore";
import cors from "cors";

const MemoryStore = memorystore(session);

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS configuration for cross-domain requests
// This is specifically configured for separate client/server deployment
app.use(cors({
  origin: process.env.CLIENT_DOMAIN ? 
    [process.env.CLIENT_DOMAIN] : // Specific domain in production
    ["http://localhost:3000", "http://localhost:5173"], // Development domains
  credentials: true, // Allow cookies for authentication
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'plate-customizer-secret-key',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // secure in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // required for cross-domain cookies
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Start the server
(async () => {
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error(err);
  });

  // API health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API server is running' });
  });

  // Start the server
  const port = process.env.PORT || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    console.log(`API Server running on port ${port}`);
  });
})();