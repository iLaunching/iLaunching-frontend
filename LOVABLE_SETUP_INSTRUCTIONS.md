# 🎨 LOVABLE.DEV SETUP INSTRUCTIONS
## Generate Your Frontend with AI

---

## 📋 **Copy & Paste This Into Lovable.dev**

```
Create a React + TypeScript + Vite application for "iLaunching" - an AI-powered business intelligence platform with 7 specialized AI brains.

TECH STACK:
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS for styling
- shadcn/ui components (modern, accessible UI)
- React Router v6 for routing
- React Query (@tanstack/react-query) for server state
- Zustand for client state management
- React Hook Form + Zod for forms
- Axios for API calls
- Socket.io-client for real-time streaming
- Lucide React for icons

PROJECT STRUCTURE:
src/
├── components/
│   ├── ui/              # shadcn/ui components (button, input, card, form, etc.)
│   ├── layout/          # Header, Footer, Sidebar
│   └── auth/            # LoginForm, SignupForm
├── pages/
│   ├── Landing.tsx      # Landing page
│   ├── Login.tsx        # Login page
│   ├── Signup.tsx       # Signup page
│   └── Dashboard.tsx    # Dashboard (placeholder for now)
├── lib/
│   ├── api.ts           # Axios instance with interceptors
│   └── utils.ts         # Utility functions
├── hooks/
│   └── useAuth.ts       # Authentication hook
├── store/
│   └── authStore.ts     # Zustand auth store
├── types/
│   └── index.ts         # TypeScript types
├── App.tsx              # Main app with routing
└── main.tsx             # Entry point

PAGES TO BUILD:

1. LANDING PAGE (/)
   - Modern, gradient design (indigo/purple theme)
   - Header with logo "iLaunching" and navigation (Sign In, Get Started buttons)
   - Hero section:
     * Headline: "Transform Your Business Ideas Into Reality with AI"
     * Subheadline: "Your intelligent business companion powered by 7 specialized AI brains"
     * Two CTA buttons: "Start Free Today" and "See How It Works"
   - Features section (3 cards):
     * Idea Generation (Sparkles icon)
     * Market Research (Target icon)
     * Strategy Planning (Zap icon)
   - How It Works section (3 steps in circles):
     * Step 1: Share Your Vision
     * Step 2: AI Gets to Work
     * Step 3: Get Results
   - Benefits section (4 items with checkmarks):
     * 7 Specialized AI Brains
     * Context-Aware Intelligence
     * Real-Time Collaboration
     * Unlimited Refinements
   - Final CTA section (gradient background)
   - Footer with links
   - Must be fully responsive (mobile, tablet, desktop)

2. LOGIN PAGE (/login)
   - Centered card layout
   - Form fields:
     * Email (with validation)
     * Password (with show/hide toggle)
   - "Sign In" button (shows loading state)
   - Link to signup: "Don't have an account? Sign up"
   - Error message display
   - Form validation with react-hook-form + zod

3. SIGNUP PAGE (/signup)
   - Centered card layout
   - Form fields:
     * Name (required, min 2 chars)
     * Email (email validation)
     * Password (min 8 chars, uppercase, number required)
     * Confirm Password (must match)
     * Terms & conditions checkbox (required)
   - "Create Account" button (shows loading state)
   - Link to login: "Already have an account? Sign in"
   - Error message display
   - Password strength indicator
   - Form validation with react-hook-form + zod

4. DASHBOARD PAGE (/dashboard) - PLACEHOLDER
   - Simple placeholder: "Dashboard Coming Soon"
   - Protected route (requires authentication)

API CONFIGURATION:
- Base URL: process.env.VITE_API_URL (defaults to http://localhost:8000)
- Axios interceptor to add JWT token to requests
- Axios interceptor to handle 401 (token refresh logic)
- Store access_token and refresh_token in localStorage
- JWT tokens in Authorization header: "Bearer <token>"

AUTH ENDPOINTS:
POST /auth/signup
  Body: { email: string, password: string, name: string }
  Response: { user: User, access_token: string, refresh_token: string }

POST /auth/login
  Body: { email: string, password: string }
  Response: { user: User, access_token: string, refresh_token: string }

POST /auth/refresh
  Body: { refresh_token: string }
  Response: { access_token: string }

POST /auth/logout
  Body: { refresh_token: string }
  Response: { message: string }

AUTH FLOW:
- Zustand store for auth state (user, tokens, isAuthenticated)
- useAuth hook with signup, login, logout mutations
- Protected routes redirect to /login if not authenticated
- Public routes (/login, /signup) redirect to /dashboard if authenticated
- Token stored in localStorage and added to all API requests
- Token refresh on 401 errors

ROUTING:
/ - Landing page (public)
/login - Login page (public, redirect if authenticated)
/signup - Signup page (public, redirect if authenticated)
/dashboard - Dashboard (protected, redirect if not authenticated)

DESIGN SYSTEM:
- Primary color: Indigo (indigo-600, indigo-700)
- Secondary color: Purple (purple-600)
- Background: Light gradients (slate-50, blue-50, indigo-50)
- Cards: White with shadow-lg
- Buttons: Rounded-lg with transitions
- Icons: lucide-react
- Typography: Modern, clean, sans-serif
- Spacing: Generous padding, clean layouts
- Responsive: Mobile-first approach

TYPESCRIPT TYPES:
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  subscription_tier: string;
}

interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

STATE MANAGEMENT:
- Zustand for auth state (persisted to localStorage)
- React Query for server state (API calls)
- Local component state for UI state

FORMS:
- react-hook-form for form state
- zod for validation schemas
- Show validation errors inline
- Disable submit button during API calls
- Show loading state on buttons

IMPORTANT REQUIREMENTS:
1. All pages must be fully responsive
2. Forms must have proper validation
3. Error messages must display clearly
4. Loading states on all async operations
5. Smooth transitions and animations
6. Accessible (ARIA labels, keyboard navigation)
7. Clean, modern design matching the landing page style
8. Type-safe throughout (TypeScript)
9. Environment variables for API URL
10. Token refresh logic working correctly

SHADCN/UI COMPONENTS NEEDED:
- Button
- Input
- Card
- Form (FormField, FormItem, FormLabel, FormControl, FormMessage)
- Badge
- Alert (for error messages)

FILE STRUCTURE TO EXPORT:
- All source files (src/**)
- package.json with all dependencies
- tsconfig.json
- vite.config.ts
- tailwind.config.js
- .env.example
- README.md with setup instructions

DO NOT INCLUDE:
- Backend code
- Database setup
- API implementation
- node_modules
- .git

ADDITIONAL NOTES:
- Use async/await for API calls
- Handle errors gracefully
- Show user-friendly error messages
- Add comments for complex logic
- Follow React best practices
- Use functional components with hooks
- Avoid prop drilling (use Zustand for global state)
```

---

## 🎯 **After Lovable Generates the Code**

### **1. Download the Project**
Lovable will give you a zip file or let you copy files.

### **2. Copy Files to Your Workspace**
```bash
# Extract to a temp folder
cd /workspaces/Ilaunching-SERVERS

# Copy src files
cp -r lovable-export/src/* ilaunching-frontend/src/

# Copy config files
cp lovable-export/package.json ilaunching-frontend/
cp lovable-export/tsconfig.json ilaunching-frontend/
cp lovable-export/vite.config.ts ilaunching-frontend/
cp lovable-export/tailwind.config.js ilaunching-frontend/
cp lovable-export/.env.example ilaunching-frontend/
```

### **3. Install Dependencies**
```bash
cd ilaunching-frontend
npm install
```

### **4. Create .env File**
```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:8000
```

### **5. Run Development Server**
```bash
npm run dev
```

---

## 📝 **What Lovable Should Generate**

### **Core Files:**
- ✅ `src/pages/Landing.tsx` - Beautiful landing page
- ✅ `src/pages/Login.tsx` - Login page with form
- ✅ `src/pages/Signup.tsx` - Signup page with validation
- ✅ `src/pages/Dashboard.tsx` - Dashboard placeholder
- ✅ `src/components/auth/LoginForm.tsx` - Login form component
- ✅ `src/components/auth/SignupForm.tsx` - Signup form component
- ✅ `src/lib/api.ts` - Axios configuration with interceptors
- ✅ `src/hooks/useAuth.ts` - Auth hook with mutations
- ✅ `src/store/authStore.ts` - Zustand auth store
- ✅ `src/types/index.ts` - TypeScript interfaces
- ✅ `src/App.tsx` - Routing setup
- ✅ `src/main.tsx` - Entry point

### **Config Files:**
- ✅ `package.json` - All dependencies
- ✅ `tsconfig.json` - TypeScript config
- ✅ `vite.config.ts` - Vite config
- ✅ `tailwind.config.js` - Tailwind config
- ✅ `.env.example` - Environment variables template

---

## ✅ **Verification Checklist**

After importing from Lovable:

- [ ] All files copied to `ilaunching-frontend/`
- [ ] `npm install` completed successfully
- [ ] `.env` file created with API URL
- [ ] `npm run dev` runs without errors
- [ ] Landing page loads at `http://localhost:5173/`
- [ ] Can navigate to `/login` and `/signup`
- [ ] Forms show validation errors
- [ ] Design is responsive (test mobile view)
- [ ] No TypeScript errors
- [ ] Tailwind CSS working

---

## 🔄 **Iterative Development with Lovable**

If you need to refine:

1. **Go back to Lovable**
2. **Tell it what to change:**
   ```
   Update the landing page:
   - Change primary color from indigo to blue
   - Add a 4th feature card for "Content Creation"
   - Make the hero section taller
   ```
3. **Re-export and copy updated files**

---

## 🎨 **Design Customization Prompts**

After initial generation, you can ask Lovable to:

```
"Make the landing page hero section more dramatic with a larger gradient background"

"Add smooth scroll animations when scrolling to sections"

"Update the color scheme to use teal instead of indigo"

"Add a pricing section to the landing page"

"Create a dark mode toggle"

"Add more micro-interactions and hover effects"
```

---

## 🚀 **Next Steps After Lovable Setup**

1. ✅ Verify everything works locally
2. ✅ Test authentication flow (will fail until backend is ready)
3. ✅ Customize colors/branding if needed
4. ✅ Deploy to Vercel
5. ✅ Connect to Railway backend API

---

## 📚 **Helpful Lovable Tips**

- **Be specific:** The more detail you provide, the better the output
- **Iterate:** Start simple, then add features incrementally
- **Test frequently:** Import to your workspace and test after each generation
- **Use examples:** Show Lovable examples of what you want
- **Request exports:** Ask for "Download as zip" or copy file by file

---

## 🆘 **If Something's Wrong**

### **Missing Dependencies:**
```bash
npm install <package-name>
```

### **TypeScript Errors:**
```bash
npm install --save-dev @types/<package-name>
```

### **Tailwind Not Working:**
Check `tailwind.config.js` content paths include `src/**/*.{js,ts,jsx,tsx}`

### **API Calls Failing:**
1. Check `.env` has correct `VITE_API_URL`
2. Verify backend is running
3. Check browser console for errors
4. Verify CORS is enabled on backend

---

## ✨ **Pro Tip**

Lovable is great for:
- ✅ Initial project setup
- ✅ UI/UX design and layout
- ✅ Component structure
- ✅ Form validation logic
- ✅ Responsive design

You'll still need to:
- 🔧 Fine-tune business logic
- 🔧 Connect real API endpoints
- 🔧 Add complex features later
- 🔧 Optimize performance

**Use Lovable to get 80% of the way there, then refine locally!** 🎯
