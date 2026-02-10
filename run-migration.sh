#!/bin/bash

# MusicApp Railway Database Migration - Complete Guide
# This script will run Prisma migrations on your Railway PostgreSQL database

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}MusicApp Railway Migration${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Check Railway CLI
echo -e "${YELLOW}[1/5] Checking Railway CLI...${NC}"
if ! command -v railway &> /dev/null; then
    echo -e "${RED}✗ Railway CLI not found${NC}"
    echo "  Install with: npm install -g @railway/cli"
    exit 1
fi
RAILWAY_VERSION=$(railway --version)
echo -e "${GREEN}✓ Railway CLI found: $RAILWAY_VERSION${NC}"
echo ""

# Step 2: Check if logged in
echo -e "${YELLOW}[2/5] Checking Railway authentication...${NC}"
if ! railway whoami &> /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Not logged in. Opening login page...${NC}"
    railway login
    echo -e "${GREEN}✓ Login complete${NC}"
else
    USER=$(railway whoami)
    echo -e "${GREEN}✓ Logged in as: $USER${NC}"
fi
echo ""

# Step 3: Link to Railway project
echo -e "${YELLOW}[3/5] Linking to Railway project...${NC}"
cd /workspaces/Musicapp

# Check if already linked
if [ -f ".railway" ] || [ -d ".railway" ]; then
    echo -e "${GREEN}✓ Project already linked${NC}"
else
    echo "  Opening project selector..."
    railway link
fi
echo ""

# Step 4: Verify database exists
echo -e "${YELLOW}[4/5] Verifying PostgreSQL on Railway...${NC}"
echo "  Checking railw database status..."
SERVICE_INFO=$(railway status 2>/dev/null || echo "")
if [[ $SERVICE_INFO == *"postgres"* ]] || [[ $SERVICE_INFO == *"database"* ]]; then
    echo -e "${GREEN}✓ PostgreSQL service found${NC}"
else
    echo -e "${YELLOW}⚠ Could not verify PostgreSQL, continuing anyway...${NC}"
fi
echo ""

# Step 5: Run Prisma migrations
echo -e "${YELLOW}[5/5] Running Prisma migrations...${NC}"
cd /workspaces/Musicapp/packages/backend

echo "  Executing: npm run prisma:push"
echo ""

# Run the migration
if railway run npm run prisma:push; then
    echo ""
    echo -e "${GREEN}✓ Migrations completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}🎉 Database initialized!${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Test API: bash /workspaces/Musicapp/test-api.sh"
    echo "  2. Or visit: https://musicapp-production-4e4b.up.railway.app"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Migration failed${NC}"
    echo "Read the error above for details"
    exit 1
fi
