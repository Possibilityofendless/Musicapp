#!/bin/bash
# Railway Database Migration Helper
# This script helps you run Prisma migrations on your Railway PostgreSQL database

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}MusicApp Railway Migration Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if Railway CLI is installed
echo -e "${YELLOW}[1/4] Checking Railway CLI...${NC}"
if ! command -v railway &> /dev/null; then
    echo -e "${RED}✗ Railway CLI not found${NC}"
    echo "Install with: npm install -g @railway/cli"
    exit 1
fi
echo -e "${GREEN}✓ Railway CLI found${NC}"

# Check if logged in
echo -e "\n${YELLOW}[2/4] Checking Railway login...${NC}"
if ! railway whoami &> /dev/null; then
    echo -e "${RED}✗ Not logged in to Railway${NC}"
    echo "Run: railway login"
    exit 1
fi
USER=$(railway whoami)
echo -e "${GREEN}✓ Logged in as: $USER${NC}"

# Link to project if needed
echo -e "\n${YELLOW}[3/4] Linking to Railway project...${NC}"
if [ ! -f ".railway" ]; then
    echo "No .railway file found. Running: railway link"
    railway link
fi
echo -e "${GREEN}✓ Project linked${NC}"

# Run migrations
echo -e "\n${YELLOW}[4/4] Running database migrations...${NC}"
echo "Executing: npm run prisma:push"
echo ""

cd packages/backend
railway run npm run prisma:push

echo ""
echo -e "${GREEN}✓ Migrations completed!${NC}"
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}SUCCESS! Your database is initialized.${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Test signup: https://your-app.railway.app/api/auth/signup"
echo "  2. Create account via: https://your-app.railway.app"
echo "  3. Create and edit music videos!"
echo ""
