#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Shared MFA Application Setup"
echo "=========================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: PostgreSQL is not installed${NC}"
    echo "Please install PostgreSQL and try again"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js (v16 or higher) and try again"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL found${NC}"
echo -e "${GREEN}✓ Node.js found ($(node --version))${NC}"
echo ""

# Create database
echo "Creating PostgreSQL database..."
DB_NAME=${1:-shared_mfa}

createdb $DB_NAME 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database '$DB_NAME' created${NC}"
else
    echo -e "${YELLOW}! Database '$DB_NAME' already exists or creation failed${NC}"
fi

# Run schema
echo "Setting up database schema..."
psql -d $DB_NAME -f backend/schema.sql > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database schema created${NC}"
else
    echo -e "${RED}✗ Failed to create schema${NC}"
    exit 1
fi
echo ""

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install backend dependencies${NC}"
    exit 1
fi
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
    exit 1
fi
cd ..
echo ""

# Create .env files if they don't exist
if [ ! -f backend/.env ]; then
    echo "Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}! Please update backend/.env with your configuration${NC}"
fi

if [ ! -f frontend/.env ]; then
    echo "Creating frontend .env file..."
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✓ Frontend .env file created${NC}"
fi

if [ ! -f .env ]; then
    echo "Creating root .env file for Docker..."
    cp .env.example .env
    echo -e "${YELLOW}! Please update .env with your Microsoft OAuth credentials${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your database credentials and Microsoft OAuth settings"
echo "2. Start the backend: cd backend && npm start"
echo "3. Start the frontend (in a new terminal): cd frontend && npm run dev"
echo "4. Or use Docker: docker-compose up"
echo ""
echo "The application will be available at:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001"
echo ""
