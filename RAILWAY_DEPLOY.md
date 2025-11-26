# 🚀 Railway Deployment Guide - iLaunching Frontend

## 📋 Prerequisites

- Railway account: [railway.app](https://railway.app)
- GitHub repository: `https://github.com/iLaunching/iLaunching-frontend.git`
- Backend services already deployed on Railway:
  - Auth API: `https://auth-server-production-b51c.up.railway.app`
  - Sales API: `wss://sales-api-production-3088.up.railway.app`

---

## 🎯 Quick Start

### Option 1: Deploy via Railway Dashboard (Recommended)

1. **Login to Railway**
   - Go to [railway.app](https://railway.app)
   - Login with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `iLaunching/iLaunching-frontend`
   - Railway will auto-detect the `railway.json` configuration

3. **Configure Environment Variables**
   
   Go to your project → Variables tab, add:
   ```bash
   VITE_API_URL=https://auth-server-production-b51c.up.railway.app/api/v1
   VITE_SALES_WS_URL=wss://sales-api-production-3088.up.railway.app
   VITE_APP_NAME=iLaunching
   NODE_ENV=production
   ```

4. **Generate Domain**
   - Go to Settings → Networking → Generate Domain
   - Railway will provide: `https://your-app.up.railway.app`

5. **Deploy**
   - Railway automatically deploys on push to main branch
   - Watch the build logs in the dashboard

---

### Option 2: Deploy via Railway CLI

```bash
# Install Railway CLI globally
npm install -g @railway/cli

# Login to Railway
railway login

# Navigate to frontend directory
cd /path/to/iLaunching-frontend

# Initialize Railway project
railway init

# Link to your GitHub repo
railway link

# Add environment variables
railway variables set VITE_API_URL=https://auth-server-production-b51c.up.railway.app/api/v1
railway variables set VITE_SALES_WS_URL=wss://sales-api-production-3088.up.railway.app
railway variables set VITE_APP_NAME=iLaunching
railway variables set NODE_ENV=production

# Deploy
railway up
```

---

## 🔧 Configuration Details

### Railway Configuration (`railway.json`)

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "startCommand": "npm run preview -- --host 0.0.0.0 --port $PORT"
  }
}
```

**What this does:**
- Uses Nixpacks builder (Railway's smart build system)
- Installs dependencies and builds the Vite app
- Serves the production build using Vite preview server
- Binds to Railway's dynamic PORT

### Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://auth-server-production-b51c.up.railway.app/api/v1` | Auth API base URL |
| `VITE_SALES_WS_URL` | `wss://sales-api-production-3088.up.railway.app` | Sales WebSocket URL |
| `VITE_APP_NAME` | `iLaunching` | Application name |
| `NODE_ENV` | `production` | Node environment |

---

## 🔄 Update Backend CORS Settings

After deploying your frontend, update CORS settings in your backend services to allow requests from your new domain.

### 1. Update Auth API (`auth-api`)

In Railway dashboard → auth-api service → Variables, update:

```bash
ALLOWED_ORIGINS=http://localhost:5174,https://your-frontend.up.railway.app
```

Or if you have a custom domain:
```bash
ALLOWED_ORIGINS=http://localhost:5174,https://your-frontend.up.railway.app,https://yourdomain.com
```

### 2. Update Sales API (`sales-api`)

Same process - add your frontend URL to the CORS allowed origins.

---

## ✅ Post-Deployment Checklist

### Test Basic Functionality

- [ ] **Frontend loads successfully**
  ```bash
  curl https://your-frontend.up.railway.app
  ```

- [ ] **Landing page renders**
  - Visit your Railway URL
  - Check browser console for errors
  - Verify animations and images load

- [ ] **API connection works**
  - Open browser console
  - Run: `fetch('https://auth-server-production-b51c.up.railway.app/api/v1/auth/oauth/status').then(r => r.json()).then(console.log)`
  - Should return OAuth status without CORS errors

### Test Authentication Flow

- [ ] **Email signup flow**
  - Enter email → Gets checked
  - Password creation works
  - Verification code sent and verified
  - Account created successfully

- [ ] **Google OAuth**
  - Click "Continue with Google"
  - Redirects to Google
  - Successfully returns and logs in
  - No CORS or redirect errors

- [ ] **Facebook OAuth**
  - Same flow as Google

- [ ] **Login flow**
  - Existing user can log in
  - Token refresh works
  - Protected routes accessible

### Test Streaming Chat

- [ ] **Sales stage works**
  - Enter name → Transitions to sales mode
  - Chat interface appears
  - Signup button visible in prompt
  - WebSocket connection establishes

- [ ] **AI responses stream**
  - Send a message
  - Response streams in real-time
  - Formatting renders correctly
  - No WebSocket errors

### Test Responsive Design

- [ ] **Mobile (375px)**
  - Layout doesn't break
  - Chat interface usable
  - Buttons accessible

- [ ] **Tablet (768px)**
  - Proper breakpoints applied

- [ ] **Desktop (1920px)**
  - All features visible and functional

---

## 📊 Monitoring & Logs

### View Build Logs
1. Railway Dashboard → Your Service
2. Click "Deployments" tab
3. Click on latest deployment
4. View build and runtime logs

### Common Log Locations
- Build errors: Check "Build Logs"
- Runtime errors: Check "Deploy Logs"
- Application logs: `console.log` output appears here

### Key Metrics to Watch
- **Build time**: Should be 2-4 minutes
- **Memory usage**: Typically 100-200 MB for Vite preview
- **Response time**: Should be <500ms
- **Error rate**: Should be 0%

---

## 🐛 Troubleshooting

### Build Fails

**Error: `npm install` fails**
```bash
# Solution: Check package.json for syntax errors
# Verify all dependencies are available in npm registry
```

**Error: `npm run build` fails**
```bash
# Solution: Check TypeScript errors
# Run locally: npm run build
# Fix any type errors before pushing
```

### Deploy Fails

**Error: `EADDRINUSE` port already in use**
```bash
# Solution: Railway provides $PORT variable
# Ensure your start command uses it:
npm run preview -- --host 0.0.0.0 --port $PORT
```

**Error: Application crashes on start**
```bash
# Check Deploy Logs for specific error
# Common issues:
# - Missing environment variables
# - Build artifacts not found
# - Port binding issues
```

### Runtime Issues

**CORS errors in browser console**
```bash
# Solution: Add your frontend URL to backend CORS settings
# In auth-api Railway variables:
ALLOWED_ORIGINS=https://your-frontend.up.railway.app
```

**Images not loading**
```bash
# Solution: Check public/ folder is included in build
# Verify image paths use relative paths: /image.png
```

**Environment variables not working**
```bash
# Solution: Vite env vars must start with VITE_
# Set them in Railway dashboard
# Redeploy after adding variables
```

**WebSocket connection fails**
```bash
# Solution: Check VITE_SALES_WS_URL is set correctly
# Verify sales-api is running and accessible
# Use wss:// for production (not ws://)
```

---

## 🔄 Continuous Deployment

Railway automatically deploys when you push to the main branch.

### Deployment Flow
1. Push code to `main` branch on GitHub
2. Railway detects the push via webhook
3. Automatically triggers build process
4. Runs tests (if configured)
5. Builds production bundle
6. Deploys new version
7. Health checks pass
8. Traffic switches to new deployment

### Manual Deployment
```bash
# Via Railway CLI
railway up

# Via Dashboard
# Click "Deploy" → "Redeploy"
```

### Rollback
If something goes wrong:
1. Railway Dashboard → Deployments
2. Find previous successful deployment
3. Click "Redeploy"

---

## 🎯 Production Best Practices

### Performance
- ✅ Images preloaded (signup popup)
- ✅ Code splitting with React lazy loading
- ✅ Vite build optimization enabled
- ✅ Tree shaking removes unused code

### Security
- ✅ Environment variables for sensitive data
- ✅ No API keys in frontend code
- ✅ HTTPS enforced by Railway
- ✅ CORS properly configured

### Monitoring
- Set up Railway notifications for failed deployments
- Monitor error rates in Railway dashboard
- Check build times for performance regression
- Review logs regularly for issues

---

## 📞 Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **GitHub Issues**: Create issue in your repo
- **Railway Status**: https://status.railway.app

---

## 🎉 Success!

Once deployed, your frontend will be live at:
- **Railway URL**: `https://your-app.up.railway.app`
- **Custom Domain** (if configured): `https://yourdomain.com`

Your iLaunching platform is now fully deployed and ready for users! 🚀
