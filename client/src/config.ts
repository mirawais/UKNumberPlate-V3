// Configuration for API endpoints
// This allows easy switching between local development and production environments

// Base URL for all API requests
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://your-api-server.com'  // Change this to your production API server URL
    : 'http://localhost:5000');

// Stripe publishable key
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

// Websocket URL (if needed)
export const WS_URL = process.env.NODE_ENV === 'production'
  ? 'wss://your-api-server.com'  // Change this to your production WebSocket URL
  : 'ws://localhost:5000';