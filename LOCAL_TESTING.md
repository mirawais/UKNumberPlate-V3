# Local Testing Guide

Since the Replit environment is having issues with the Vite configuration, here's how to test the application on your local machine:

## Testing Method 1: Using Docker

The simplest way to test the application is using Docker:

1. Download all files from this Replit project.

2. Make sure you have Docker and Docker Compose installed on your machine.

3. Create a `.env` file in the root directory with your Stripe keys:
   ```
   STRIPE_SECRET_KEY=sk_test_your_key
   VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
   ```

4. Run the application using Docker Compose:
   ```bash
   docker-compose up -d
   ```

5. Access the application at `http://localhost:5000`

## Testing Method 2: Manual Setup

If you prefer to run the application without Docker:

### Step 1: Set up the server

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server in development mode:
   ```bash
   npm run dev
   ```

### Step 2: Set up the client

1. In a new terminal, navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the client development server:
   ```bash
   npm run dev
   ```

4. Access the application at the URL shown in the terminal (typically `http://localhost:5173`)

## Testing Method 3: Simplified Server

If you're still having issues, you can use the simplified server we created:

1. Run the simplified server:
   ```bash
   node server-start.js
   ```

2. This will start a basic server that you can access at `http://localhost:5000/api/health` to verify it's working.

## Deploying to Production

For deploying to a production environment, follow the instructions in the `DEPLOYMENT_GUIDE.md` file.