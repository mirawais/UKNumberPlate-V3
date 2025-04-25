// Configuration for API endpoints
// This allows easy switching between local development and production environments

// Base URL for all API requests - empty string means same-origin requests (for monorepo)
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Stripe publishable key
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

// Websocket URL (if needed)
export const WS_URL = import.meta.env.VITE_WS_URL || '';