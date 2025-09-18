# Life Flow - Blood Bank Management System Setup Guide

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v13 or higher) - [Download here](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager
- **Git** (for version control)

## Project Structure

```
life-flow/
├── backend/          # Node.js/Express API server
├── frontend/         # Next.js React application
└── SETUP_GUIDE.md   # This file
```

## Quick Start

### 1. Clone Repository and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/HtunSoeHsan/life-flow
cd life-flow

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### 2. Database Setup

#### Create PostgreSQL Databases

```bash
# Connect to PostgreSQL
psql -U postgres

# Create databases
CREATE DATABASE lifeflow_master;
CREATE DATABASE lifeflow_tenant;

# Create user (optional)
CREATE USER lifeflow_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE lifeflow_master TO lifeflow_user;
GRANT ALL PRIVILEGES ON DATABASE lifeflow_tenant TO lifeflow_user;

# Exit PostgreSQL
\q
```

### 3. Environment Configuration

#### Backend Environment Setup

```bash
# Navigate to backend
cd backend

# Copy environment template
cp .env.example .env

# Edit .env file with your database credentials
nano .env
```

Update the `.env` file:
```env
# Database URLs
MASTER_DATABASE_URL="postgresql://username:password@localhost:5432/lifeflow_master"
TENANT_DATABASE_URL="postgresql://username:password@localhost:5432/lifeflow_tenant"

# Server Configuration
PORT=3001
NODE_ENV=development

# Features
FEATURE_MULTI_TENANT=true
BIOMETRIC_ENABLED=false

# JWT Secret (generate a secure key)
JWT_SECRET=your-super-secret-jwt-key-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Environment Setup

The frontend `.env.local` is already configured:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Database Migration and Seeding

```bash
# Navigate to backend
cd backend

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with initial data
npm run db:seed
```

## Running the Application

### Option 1: Run Both Services Simultaneously

Create a script to run both services:

```bash
# From project root, create start script
cat > start.sh << 'EOF'
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Life Flow Blood Bank Management System${NC}"

# Function to kill background processes on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${GREEN}Starting Backend Server...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo -e "${GREEN}Starting Frontend Application...${NC}"
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Display running services
echo -e "\n${GREEN}✅ Services Started Successfully!${NC}"
echo -e "${YELLOW}Backend API:${NC} http://localhost:3001"
echo -e "${YELLOW}Frontend App:${NC} http://localhost:3000"
echo -e "${YELLOW}Database Studio:${NC} Run 'npm run db:studio' in backend folder"
echo -e "\n${RED}Press Ctrl+C to stop all services${NC}"

# Wait for background processes
wait
EOF

# Make script executable
chmod +x start.sh

# Run the script
./start.sh
```

### Option 2: Run Services Separately

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend Application
```bash
cd frontend
npm run dev
```

#### Terminal 3 - Database Studio (Optional)
```bash
cd backend
npm run db:studio
```

## Access Points

Once both services are running:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs (if implemented)
- **Database Studio**: http://localhost:5555 (when running db:studio)

## Available Scripts

### Backend Scripts
```bash
cd backend

# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with initial data
npm run db:reset     # Reset database and reseed
```

### Frontend Scripts
```bash
cd frontend

# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Default Login Credentials

After seeding the database, you can use these default credentials:

- **Admin User**: 
  - Email: admin@lifeflow.com
  - Password: admin123

- **Hospital User**:
  - Email: hospital@lifeflow.com
  - Password: hospital123

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill processes on ports 3000 and 3001
   lsof -ti:3000 | xargs kill -9
   lsof -ti:3001 | xargs kill -9
   ```

2. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify database exists

3. **Prisma Client Error**
   ```bash
   cd backend
   npm run db:generate
   ```

4. **Missing Dependencies**
   ```bash
   # Reinstall dependencies
   cd backend && npm install
   cd ../frontend && npm install
   ```

### Reset Everything
```bash
# Stop all services
pkill -f "node"

# Reset backend
cd backend
npm run db:reset
npm run db:generate

# Clear frontend cache
cd ../frontend
rm -rf .next
npm run build
```

## Development Workflow

1. **Start Services**: Use the start script or run separately
2. **Make Changes**: Edit code in respective directories
3. **Hot Reload**: Both services support hot reloading
4. **Database Changes**: Run migrations after schema changes
5. **Testing**: Access frontend at localhost:3000

## Production Deployment

### Backend
```bash
cd backend
npm run build
npm run start
```

### Frontend
```bash
cd frontend
npm run build
npm run start
```

## Additional Tools

- **Database Management**: Use Prisma Studio for visual database management
- **API Testing**: Use tools like Postman or curl for API testing
- **Logs**: Check console output for debugging information

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs for error messages
3. Ensure all prerequisites are installed
4. Verify environment configuration

---

**Happy Coding! 🩸💻**