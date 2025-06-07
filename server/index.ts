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

  // For all routes not starting with /api or /uploads, serve the React app
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }

    // Serve the HTML for React app
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <link rel="icon" type="image/svg+xml" href="/vite.svg" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>UK Number Plate Customizer</title>
          <script type="module" crossorigin src="https://unpkg.com/@vitejs/plugin-react@4.2.1/dist/index.js"></script>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@tailwindcss/ui@latest/dist/tailwind-ui.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
            .plate-preview { 
              background: linear-gradient(145deg, #f0f0f0, #ffffff);
              border: 3px solid #333;
              border-radius: 8px;
              padding: 10px 20px;
              font-family: 'Arial Black', sans-serif;
              font-weight: bold;
              letter-spacing: 3px;
              text-align: center;
              box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }
          </style>
        </head>
        <body>
          <div id="root">
            <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
              <header style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #1e40af; font-size: 2.5rem; margin-bottom: 10px;">UK Number Plate Customizer</h1>
                <p style="color: #6b7280; font-size: 1.1rem;">Design and order your personalized number plates</p>
              </header>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
                <div>
                  <h2 style="color: #374151; margin-bottom: 20px;">Customize Your Plate</h2>
                  <form id="plateForm" style="space-y: 4;">
                    <div style="margin-bottom: 15px;">
                      <label style="display: block; margin-bottom: 5px; font-weight: 600;">Plate Text:</label>
                      <input type="text" id="plateText" maxlength="8" value="ABC 123D" 
                             style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; text-transform: uppercase;" />
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                      <label style="display: block; margin-bottom: 5px; font-weight: 600;">Plate Type:</label>
                      <select id="plateType" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
                        <option value="road-legal">Road Legal Plate</option>
                        <option value="show-plate">Show Plate</option>
                      </select>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                      <label style="display: block; margin-bottom: 5px; font-weight: 600;">Background Color:</label>
                      <select id="bgColor" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
                        <option value="#ffffff">White</option>
                        <option value="#ffff00">Yellow</option>
                        <option value="#000000">Black</option>
                        <option value="#ff0000">Red</option>
                        <option value="#0000ff">Blue</option>
                      </select>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                      <label style="display: block; margin-bottom: 5px; font-weight: 600;">Text Color:</label>
                      <select id="textColor" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
                        <option value="#000000">Black</option>
                        <option value="#ffffff">White</option>
                        <option value="#ff0000">Red</option>
                        <option value="#0000ff">Blue</option>
                        <option value="#ffff00">Yellow</option>
                      </select>
                    </div>
                    
                    <button type="button" onclick="addToCart()" 
                            style="width: 100%; background: #1e40af; color: white; padding: 12px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; margin-top: 20px;">
                      Add to Cart - £25.00
                    </button>
                  </form>
                </div>
                
                <div>
                  <h2 style="color: #374151; margin-bottom: 20px;">Preview</h2>
                  <div style="text-align: center; margin-bottom: 20px;">
                    <div id="platePreview" class="plate-preview" style="display: inline-block; min-width: 300px; background: #ffffff; color: #000000;">
                      ABC 123D
                    </div>
                  </div>
                  
                  <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
                    <h3 style="margin-top: 0; color: #374151;">Price Breakdown</h3>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                      <span>Base Plate:</span>
                      <span>£25.00</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                      <span>VAT (20%):</span>
                      <span>£5.00</span>
                    </div>
                    <hr style="margin: 15px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 1.1rem;">
                      <span>Total:</span>
                      <span>£30.00</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 40px;">
                <a href="/admin-login" style="color: #6b7280; text-decoration: none; margin-right: 20px;">Admin Login</a>
                <a href="/api/orders" style="color: #6b7280; text-decoration: none;">View Orders (JSON)</a>
              </div>
            </div>
          </div>
          
          <script>
            function updatePreview() {
              const text = document.getElementById('plateText').value || 'ABC 123D';
              const bgColor = document.getElementById('bgColor').value;
              const textColor = document.getElementById('textColor').value;
              const preview = document.getElementById('platePreview');
              
              preview.textContent = text.toUpperCase();
              preview.style.background = bgColor;
              preview.style.color = textColor;
              
              // Adjust text color for readability
              if (bgColor === textColor) {
                preview.style.color = bgColor === '#000000' ? '#ffffff' : '#000000';
              }
            }
            
            function addToCart() {
              const plateData = {
                text: document.getElementById('plateText').value.toUpperCase(),
                type: document.getElementById('plateType').value,
                bgColor: document.getElementById('bgColor').value,
                textColor: document.getElementById('textColor').value,
                price: 30.00
              };
              
              alert('Plate added to cart: ' + plateData.text + '\\nPrice: £' + plateData.price.toFixed(2));
              console.log('Cart item:', plateData);
            }
            
            // Add event listeners
            document.getElementById('plateText').addEventListener('input', updatePreview);
            document.getElementById('bgColor').addEventListener('change', updatePreview);
            document.getElementById('textColor').addEventListener('change', updatePreview);
            
            // Initial preview update
            updatePreview();
          </script>
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
