# Deployment Guide for UK Number Plate Customizer

This guide provides detailed instructions for deploying the UK Number Plate Customizer application to a standard hosting environment outside of Replit.

## Step 1: Use the Production Server Script

We've created a production-ready server script in `server/server.prod.ts` that doesn't depend on Vite for development features. This file:

- Sets up the Express server with proper session handling
- Serves static files from the build directory
- Implements API routes for the application
- Handles errors appropriately

## Step 2: Prepare the Vite Configuration

The current `vite.config.ts` file contains Replit-specific plugins and a top-level await that may cause issues in standard environments. Create a new file named `vite.config.js` with the following content:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

// For Node.js compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});
```

## Step 2: Update Package Dependencies

1. **Server Dependencies**: Use the `server/package.json` file we've already created.

2. **Client Dependencies**: Use the `client/package.json` file we've already created.

3. Remove any Replit-specific plugins from the dependencies:
   - `@replit/vite-plugin-cartographer`
   - `@replit/vite-plugin-runtime-error-modal`
   - `@replit/vite-plugin-shadcn-theme-json`

## Step 3: Theme Implementation

We've already created a custom CSS theme implementation that doesn't rely on Replit plugins:

1. Use the `client/src/lib/theme-variables.css` file we created.
2. Make sure it's imported in `client/src/index.css`.
3. The `SiteConfigContext.tsx` file has been updated to dynamically set the primary color CSS variable.

## Step 4: Database Connection

1. Make sure your PostgreSQL database is set up and running.
2. Set the `DATABASE_URL` environment variable in your hosting environment.
3. If needed, update the database connection parameters in `server/db.ts`.

## Step 5: Build Process

Follow these steps to build and deploy the application:

### Client Build
```bash
cd client
npm install
npm run build --config ../vite.config.js
```

This will generate the client files in the `dist/public` directory.

### Server Build
```bash
cd server
npm install
npm run build
```

## Step 6: Deployment

You have two options for deployment:

### Option 1: Manual Deployment

1. Set up your environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `VITE_STRIPE_PUBLIC_KEY`: Your Stripe public key
   - `SESSION_SECRET`: A random string for session encryption
   - `PORT`: The port to run the server on (default: 5000)
   - `NODE_ENV`: Set to "production"

2. Deploy the server files to your hosting provider.
3. Configure your web server (Nginx, Apache, etc.) to serve the static files from `dist/public` and proxy API requests to the Express server.

### Example Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Serve static files
    location / {
        root /path/to/dist/public;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Express server
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Docker Deployment

We've prepared Docker configuration files for easy deployment:

1. Set your Stripe API keys in the environment or in a `.env` file:
   ```
   STRIPE_SECRET_KEY=sk_test_your_key
   VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
   ```

2. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

This will:
- Build the application containers
- Set up a PostgreSQL database
- Configure the application with the correct environment variables
- Start the application on port 5000

For production, make sure to:
- Change the default passwords in `docker-compose.yml`
- Set a strong `SESSION_SECRET`
- Configure SSL/TLS using a reverse proxy or load balancer

## Troubleshooting

### Top-level await Error
If you encounter a "Top-level await is not supported" error, make sure you're using the new Vite configuration file we provided and that you're using ESM modules.

### CSS Variables Not Applied
If the theme variables are not applied, check that `theme-variables.css` is properly imported in your `index.css` file and that the `SiteConfigContext` is correctly updating the CSS variables.

### Database Connection Issues
Verify that your `DATABASE_URL` is correctly formatted and that your database server is accessible from your hosting environment.