# Separate Client/Server Deployment Guide

This guide explains how to deploy the Number Plate Customizer application with the client and server on different servers.

## Overview

The application has been restructured to support separate deployment:

- **Client**: React frontend that can be deployed as a static site
- **Server**: Express API that handles data and business logic

## Pre-Deployment Steps

1. **Set environment variables**:
   - For the client, create a `.env` file in the client directory with:
     ```
     VITE_API_URL=https://your-api-server.com
     VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
     ```
   - For the server, create a `.env` file in the server directory with:
     ```
     CLIENT_DOMAIN=https://your-client-domain.com
     STRIPE_SECRET_KEY=sk_test_your_key
     DATABASE_URL=your_database_connection_string
     SESSION_SECRET=your_session_secret
     ```

2. **Configure the database**:
   - If using a PostgreSQL database, make sure your `DATABASE_URL` points to a valid database
   - Run migrations with `npm run db:push` from the server directory

## Deploying the Server (API)

### Option 1: Deploy to a Node.js host (Heroku, DigitalOcean, etc.)

1. Copy the following directories and files to your server:
   - `server/` directory
   - `shared/` directory

2. Install dependencies and build:
   ```bash
   cd server
   npm install
   npm run build
   ```

3. Start the server:
   ```bash
   npm run start
   ```

### Option 2: Deploy using Docker

1. Create a `Dockerfile` in the server directory:
   ```dockerfile
   FROM node:20-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm install

   COPY . .
   COPY ../shared ./shared

   RUN npm run build

   EXPOSE 5000

   CMD ["npm", "start"]
   ```

2. Build and run the Docker image:
   ```bash
   docker build -t plate-customizer-api .
   docker run -p 5000:5000 -d plate-customizer-api
   ```

## Deploying the Client

### Option 1: Deploy to Static Hosting (Netlify, Vercel, etc.)

1. Copy the `client/` directory to your local machine

2. Install dependencies and build:
   ```bash
   cd client
   npm install
   npm run build
   ```

3. Deploy the `dist/` directory to your static hosting provider

### Option 2: Deploy manually to a web server

1. Build the client:
   ```bash
   cd client
   npm install
   npm run build
   ```

2. Copy the contents of the `dist/` directory to your web server's public directory
   (e.g., `/var/www/html` for Apache or `/usr/share/nginx/html` for Nginx)

## Configuration Notes

### CORS

The server is configured to accept requests from specific origins. Make sure to update the `CLIENT_DOMAIN` environment variable with your client's domain.

```js
app.use(cors({
  origin: process.env.CLIENT_DOMAIN ? 
    [process.env.CLIENT_DOMAIN] : // Specific domain in production
    ["http://localhost:3000", "http://localhost:5173"], // Development domains
  credentials: true,
  // ...
}));
```

### API Base URL

The client uses the `API_BASE_URL` from `config.ts` to determine where to send API requests. Make sure this is set correctly:

```typescript
// In client/src/config.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://your-api-server.com' 
    : 'http://localhost:5000');
```

### Cookie Settings

For cross-domain cookies to work (for authentication), the server uses:

```js
cookie: { 
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  // ...
}
```

## Troubleshooting

### CORS Issues

If you see CORS errors in the browser console:

1. Verify the `CLIENT_DOMAIN` environment variable is set correctly on the server
2. Check that the protocol (http/https) matches exactly
3. Ensure cookies are being sent with `credentials: 'include'` in fetch requests

### Authentication Problems

If users are not staying logged in:

1. Ensure cookies are configured correctly with the appropriate domain and sameSite settings
2. Verify the session store is properly configured
3. Check that the client is sending credentials with all requests

### API Connection Issues

If the client cannot connect to the API:

1. Verify `VITE_API_URL` is set correctly in the client's environment
2. Ensure the API server is accessible from the client's location
3. Check network requests in the browser's dev tools for specific errors