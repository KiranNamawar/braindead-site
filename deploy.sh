#!/bin/bash

# BrainDead.site Deployment Script
echo "🧠 Deploying BrainDead.site to Netlify..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Run quality checks
echo -e "${BLUE}🔍 Running quality checks...${NC}"
npm run lint
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Linting failed. Please fix the issues and try again.${NC}"
    exit 1
fi

npm run type-check
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Type checking failed. Please fix the issues and try again.${NC}"
    exit 1
fi

# Build the project
echo -e "${BLUE}🏗️  Building the project...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed. Please check the errors above.${NC}"
    exit 1
fi

# Check if dist directory was created
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build directory 'dist' not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo -e "${BLUE}📁 Build output is in the 'dist' directory${NC}"

# Check if Netlify CLI is installed
if command -v netlify &> /dev/null; then
    echo -e "${YELLOW}🚀 Netlify CLI detected. Would you like to deploy now? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo -e "${BLUE}🌐 Deploying to Netlify...${NC}"
        netlify deploy --prod --dir=dist
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}🎉 Deployment successful!${NC}"
        else
            echo -e "${RED}❌ Deployment failed.${NC}"
            exit 1
        fi
    fi
else
    echo -e "${YELLOW}💡 To deploy with Netlify CLI:${NC}"
    echo -e "   1. Install: ${BLUE}npm install -g netlify-cli${NC}"
    echo -e "   2. Login: ${BLUE}netlify login${NC}"
    echo -e "   3. Deploy: ${BLUE}netlify deploy --prod --dir=dist${NC}"
    echo ""
    echo -e "${YELLOW}💡 Or drag the 'dist' folder to netlify.com${NC}"
fi

echo -e "${GREEN}🧠 BrainDead.site is ready for deployment!${NC}"