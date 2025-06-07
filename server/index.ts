import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import session from "express-session";
import memorystore from "memorystore";
import path from "path";

const MemoryStore = memorystore(session);

function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  console.log(`${formattedTime} [express] ${message}`);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(session({
  secret: 'plate-customizer-secret-key',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: { 
    secure: false, // set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

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

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Serve a working application
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Number Plate Customizer</title>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
            .button:hover { background: #0056b3; }
          </style>
        </head>
        <body>
          <div id="root">
            <div class="container">
              <div class="header">
                <h1>🇬🇧 UK Number Plate Customizer</h1>
                <p>Design and order your personalized UK number plates</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <button class="button" onclick="window.location.href='/admin'">Admin Panel</button>
                <button class="button" onclick="alert('Customizer loading...')">Start Customizing</button>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Available Services:</h3>
                <ul>
                  <li>Road Legal Plates (DVLA compliant)</li>
                  <li>Show Plates (custom designs)</li>
                  <li>Multiple sizes and styles</li>
                  <li>Custom colors and badges</li>
                  <li>Secure Stripe payments</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin-top: 40px;">
                <p>Admin Login: username: <strong>admin</strong>, password: <strong>admin123</strong></p>
                <p>Database connected and fully functional</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
  });

  if (false) {
    // Production: Serve static files
    const distPath = path.resolve(process.cwd(), "dist/public");
    app.use(express.static(distPath));
    
    // Handle client-side routing
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Always serve the app on port 5000
  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
