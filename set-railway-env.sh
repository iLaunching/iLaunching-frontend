#!/bin/bash

# Get the service ID for iLaunching-frontend
echo "Setting Railway environment variables..."

# Set VITE_API_URL
railway variables --set VITE_API_URL=https://ilaunching-servers-production.up.railway.app/api/v1

# Set VITE_AUTH_API_URL
railway variables --set VITE_AUTH_API_URL=https://auth-server-production-b51c.up.railway.app/api/v1

# Set VITE_SALES_WS_URL
railway variables --set VITE_SALES_WS_URL=wss://sales-api-production-3088.up.railway.app

# Set VITE_APP_NAME
railway variables --set VITE_APP_NAME=iLaunching

echo "Environment variables set. Triggering redeploy..."
railway up --detach

