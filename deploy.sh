#!/bin/bash

# Build script for UK Number Plate Customizer deployment

echo "Starting deployment build process..."

# Create a deployment directory
echo "Creating deployment directory..."
mkdir -p deployment

# Build client
echo "Building client..."
cd client
npm install
npm run build
cd ..

# Copy client build to deployment folder
echo "Copying client build..."
cp -r dist deployment/

# Build server
echo "Building server..."
cd server
npm install
npm run build
cd ..

# Copy server files to deployment folder
echo "Copying server files..."
mkdir -p deployment/server
cp -r server/*.js server/*.json deployment/server/
cp -r shared deployment/shared

# Copy configuration files and .env
echo "Copying configuration files..."
cp package.json deployment/
cp README.md deployment/
cp -r .env deployment/ 2>/dev/null || :
cp drizzle.config.ts deployment/

echo "Deployment build complete. Files are in the 'deployment' directory."
echo "You can now upload the contents of the deployment directory to your hosting provider."