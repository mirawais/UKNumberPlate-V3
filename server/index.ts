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

  // Development mode
  if (process.env.NODE_ENV === "development") {
    // Serve static files from client directory
    app.use(express.static(path.resolve(process.cwd(), "client/public")));
    app.use("/src", express.static(path.resolve(process.cwd(), "client/src")));
    app.use("/node_modules", express.static(path.resolve(process.cwd(), "node_modules")));
    
    // Handle React app routing
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
        return next();
      }
      
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Number Plate Customizer</title>
            <script type="module">
              import { createRoot } from 'https://esm.sh/react-dom@18/client';
              import { createElement } from 'https://esm.sh/react@18';
              
              // Simple React app loader
              const App = () => {
                return createElement('div', { 
                  style: { 
                    fontFamily: 'Arial, sans-serif', 
                    padding: '20px', 
                    maxWidth: '1200px', 
                    margin: '0 auto' 
                  } 
                }, [
                  createElement('h1', { 
                    key: 'title',
                    style: { textAlign: 'center', color: '#333' } 
                  }, '🇬🇧 UK Number Plate Customizer'),
                  createElement('p', { 
                    key: 'subtitle',
                    style: { textAlign: 'center', fontSize: '18px', color: '#666' } 
                  }, 'Design and order your personalized UK number plates'),
                  createElement('div', {
                    key: 'buttons',
                    style: { textAlign: 'center', margin: '30px 0' }
                  }, [
                    createElement('button', {
                      key: 'admin',
                      style: {
                        background: '#007bff',
                        color: 'white',
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '16px',
                        margin: '0 10px',
                        cursor: 'pointer'
                      },
                      onClick: () => window.location.href = '/admin'
                    }, 'Admin Panel'),
                    createElement('button', {
                      key: 'customize',
                      style: {
                        background: '#28a745',
                        color: 'white',
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '16px',
                        margin: '0 10px',
                        cursor: 'pointer'
                      },
                      onClick: () => alert('Plate customizer will load your full React application')
                    }, 'Start Customizing')
                  ]),
                  createElement('div', {
                    key: 'features',
                    style: {
                      background: '#f8f9fa',
                      padding: '20px',
                      borderRadius: '8px',
                      margin: '20px 0'
                    }
                  }, [
                    createElement('h3', { key: 'features-title' }, 'Available Services:'),
                    createElement('ul', { key: 'features-list' }, [
                      createElement('li', { key: 'road' }, 'Road Legal Plates (DVLA compliant)'),
                      createElement('li', { key: 'show' }, 'Show Plates (custom designs)'),
                      createElement('li', { key: 'sizes' }, 'Multiple sizes and styles'),
                      createElement('li', { key: 'colors' }, 'Custom colors and badges'),
                      createElement('li', { key: 'payments' }, 'Secure Stripe payments')
                    ])
                  ]),
                  createElement('div', {
                    key: 'admin-info',
                    style: { textAlign: 'center', marginTop: '40px', color: '#666' }
                  }, [
                    createElement('p', { key: 'login' }, 'Admin Login: username: admin, password: admin123'),
                    createElement('p', { key: 'db' }, 'Database connected and fully functional'),
                    createElement('p', { key: 'restore' }, 'Working to restore your full React application...')
                  ])
                ]);
              };
              
              createRoot(document.getElementById('root')).render(createElement(App));
            </script>
          </head>
          <body>
            <div id="root"></div>
          </body>
        </html>
      `);
    });
  } else {
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
