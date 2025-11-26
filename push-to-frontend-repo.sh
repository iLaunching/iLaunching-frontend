#!/bin/bash

# Script to push ilaunching-frontend to separate GitHub repository
# https://github.com/iLaunching/iLaunching-frontend.git

echo "🚀 Preparing to push frontend to separate repository..."
echo ""

# Navigate to frontend directory
cd /workspaces/Ilaunching-SERVERS/ilaunching-frontend

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in ilaunching-frontend directory!"
    exit 1
fi

echo "📦 Current directory: $(pwd)"
echo ""

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Add all files
echo ""
echo "📝 Staging all files..."
git add -A

# Show what will be committed
echo ""
echo "📋 Files to be committed:"
git status --short

# Commit the changes
echo ""
echo "💾 Committing changes..."
git commit -m "feat: Initial frontend setup with Railway configuration

- Added Railway deployment configuration (railway.json)
- Added production environment variables (.env.production)
- Comprehensive deployment guide (RAILWAY_DEPLOY.md)
- Complete auth flow (email, OAuth, verification)
- Streaming chat interface with AI responses
- Responsive design with multiple themes
- Protected routes with JWT authentication
- Ready for production deployment"

# Check if remote already exists
if git remote | grep -q "origin"; then
    echo ""
    echo "⚠️  Remote 'origin' already exists. Removing and re-adding..."
    git remote remove origin
fi

# Add the new remote
echo ""
echo "🔗 Adding remote repository..."
git remote add origin https://github.com/iLaunching/iLaunching-frontend.git

# Show remote
echo ""
echo "📡 Remote configured:"
git remote -v

# Rename branch to main if needed
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo ""
    echo "🔄 Renaming branch to 'main'..."
    git branch -M main
fi

# Push to remote
echo ""
echo "⬆️  Pushing to GitHub..."
echo "   Repository: https://github.com/iLaunching/iLaunching-frontend.git"
echo "   Branch: main"
echo ""

git push -u origin main --force

# Check if push was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ✅ ✅  SUCCESS! ✅ ✅ ✅"
    echo ""
    echo "🎉 Frontend successfully pushed to:"
    echo "   https://github.com/iLaunching/iLaunching-frontend"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Go to https://railway.app"
    echo "   2. Create new project from GitHub"
    echo "   3. Select iLaunching/iLaunching-frontend repo"
    echo "   4. Add environment variables (see RAILWAY_DEPLOY.md)"
    echo "   5. Deploy! 🚀"
    echo ""
else
    echo ""
    echo "❌ Push failed. Please check your credentials and try again."
    echo "   Make sure you have push access to the repository."
    exit 1
fi
