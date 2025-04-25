# UK Number Plate Customizer

A comprehensive web application for customizing and ordering UK-style number plates.

## Project Structure

The application is divided into two main components:

- **Client**: React frontend built with Vite, TypeScript, and TailwindCSS.
- **Server**: Express backend with PostgreSQL database support.

## Deployment Instructions

### Prerequisites

- Node.js v16.x or higher
- PostgreSQL database
- Stripe account for payment processing

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database Connection
DATABASE_URL=postgresql://username:password@hostname:port/database_name

# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

### Server Deployment

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the server:
   ```
   npm run build
   ```

4. Start the server:
   ```
   npm start
   ```

### Client Deployment

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the client:
   ```
   npm run build
   ```
   
   This will create a `dist/public` directory in the project root with the compiled frontend assets.

4. Serve the client files using a static file server or through the included Express server.

### Running in Development Mode

1. Start the server:
   ```
   cd server
   npm run dev
   ```

2. In a separate terminal, start the client:
   ```
   cd client
   npm run dev
   ```

## Database Setup

The application uses PostgreSQL with Drizzle ORM. To set up the database:

1. Make sure your PostgreSQL server is running
2. Create a database for the application
3. Update the `DATABASE_URL` in your `.env` file
4. Run the database migrations:
   ```
   npm run db:push
   ```

## Features

- Customizable number plates (text, badges, colors, borders)
- Road legal plates and show plates options
- Admin panel for site configuration
- Secure payment processing with Stripe
- Document upload for road legal plates