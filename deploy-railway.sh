#!/bin/bash
# Railway Deployment Script

echo "🚀 Railway Deployment Guide"
echo "=========================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

echo "✅ Railway CLI installed"
echo ""

# Login
echo "📝 Step 1: Login to Railway"
echo "Run this command and follow the browser prompt:"
echo ""
echo "  railway login"
echo ""
read -p "Press Enter after you've logged in..."

# Link project
echo ""
echo "🔗 Step 2: Link to your Railway project"
echo "Run this command and select your project:"
echo ""
echo "  railway link"
echo ""
read -p "Press Enter after you've linked the project..."

# Deploy
echo ""
echo "🚀 Step 3: Deploy"
echo "Choose your deployment method:"
echo ""
echo "A. Deploy backend (recommended):"
echo "   cd packages/backend && railway up"
echo ""
echo "B. Deploy entire project:"
echo "   railway up"
echo ""
echo "C. Trigger redeploy from latest commit:"
echo "   railway redeploy"
echo ""
read -p "Which option? (A/B/C): " choice

case $choice in
    A|a)
        cd packages/backend
        railway up
        ;;
    B|b)
        railway up
        ;;
    C|c)
        railway redeploy
        ;;
    *)
        echo "Invalid option. Please run manually:"
        echo "  railway redeploy"
        ;;
esac

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "Check status at: https://railway.app/dashboard"
