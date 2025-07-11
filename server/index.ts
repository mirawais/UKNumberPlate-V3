import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
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

  // Register API routes first
  await registerRoutes(app);

  // Setup Vite dev server for React app in development, serve static files in production
  if (process.env.NODE_ENV === "development") {
    try {
      const { createServer } = await import("vite");
      const vite = await createServer({
        server: { 
          middlewareMode: true,
          host: "0.0.0.0",
          hmr: false, // Disable HMR to prevent connection issues
          allowedHosts: [
            "localhost",
            "127.0.0.1",
            "0.0.0.0",
            ".replit.dev",
            ".repl.co",
            "643571cc-5b2b-4330-87f4-abda9456d49e-00-8jkny1csq62c.riker.replit.dev"
          ]
        },
        root: path.resolve(process.cwd(), "client"),
        configFile: path.resolve(process.cwd(), "vite.config.ts"),
        optimizeDeps: {
          force: true // Force dependency optimization
        }
      });

      app.use(vite.middlewares);
      log("Vite dev server setup completed");
    } catch (error) {
      log(`Vite setup failed: ${error}. Using fallback static serving.`);

      // Fallback: serve static React build if available
      const clientDistPath = path.resolve(process.cwd(), "client", "dist");
      if (await import("fs").then(fs => fs.existsSync(clientDistPath))) {
        app.use(express.static(clientDistPath));
        app.get("*", (req, res, next) => {
          if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
            return next();
          }
          res.sendFile(path.resolve(clientDistPath, "index.html"));
        });
        log("Serving from client/dist");
      } else {
        // Final fallback: serve basic HTML
        app.get("*", (req, res, next) => {
          if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
            return next();
          }

          res.send(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>UK Number Plate Customizer</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body>
              <div id="root">
                <h1>UK Number Plate Customizer</h1>
                <p>Building React application... Please wait.</p>
                <script>
                  setTimeout(() => {
                    window.location.reload();
                  }, 3000);
                </script>
              </div>
            </body>
            </html>
          `);
        });
        log("Serving fallback HTML");
      }
    }
  } else {
    // Production: serve built React app
    const clientDistPath = path.resolve(process.cwd(), "dist", "public");
    if (await import("fs").then(fs => fs.existsSync(clientDistPath))) {
      app.use(express.static(clientDistPath));
      app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
          return next();
        }
        res.sendFile(path.resolve(clientDistPath, "index.html"));
      });
      log("Serving from dist/public");
    } else {
      log("Production build not found. Please run 'npm run build' first.");
      app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
          return next();
        }
        res.status(503).send("Application is building. Please wait...");
      });
    }
  }

  // Create HTTP server
  const httpServer = createServer(app);

  // Always serve the app on port 5000
  const port = 5000;
  httpServer.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();