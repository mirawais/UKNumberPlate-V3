// Temporary workaround to start the server without using the problematic Vite config
// This bypasses the top-level await error in vite.config.ts

// Set environment variables
process.env.NODE_ENV = 'development';

import express from 'express';
import path from 'path';
import { createServer } from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple Express app
const app = express();
app.use(express.json());

// Basic route to test that the server is working
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Serve static files from attached_assets
app.use('/assets', express.static(path.join(__dirname, 'attached_assets')));

// Start the server
const port = 5000;
const server = createServer(app);
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log('Note: This is a minimal server setup for testing purposes.');
  console.log('For the full application, use the deployment files.');
});