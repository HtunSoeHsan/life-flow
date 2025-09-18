# Life Flow - Blood Bank Management System

A comprehensive blood bank management system built with modern web technologies.

## 📦 Repository

```bash
git clone https://github.com/HtunSoeHsan/life-flow
cd life-flow
```

## 🚀 Quick Start

```bash
# Install all dependencies
npm run install:all

# Setup database (first time only)
npm run db:setup

# Start both frontend and backend
npm start
```

## 📋 Detailed Setup

For complete setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## 🏗️ Architecture

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, and Ant Design
- **Backend**: Node.js with Express, Prisma ORM, and PostgreSQL
- **Database**: PostgreSQL with multi-tenant architecture

## 🔗 Access Points

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database Studio: `npm run db:studio`

## 📁 Project Structure

```
life-flow/
├── backend/          # Node.js API server
├── frontend/         # Next.js React app
├── SETUP_GUIDE.md    # Detailed setup instructions
├── start.sh          # Quick start script
└── package.json      # Root package configuration
```

## 🛠️ Available Scripts

```bash
npm start              # Start both services
npm run install:all    # Install all dependencies
npm run build:all      # Build both applications
npm run backend        # Start only backend
npm run frontend       # Start only frontend
npm run db:setup       # Setup database (first time)
npm run db:studio      # Open database studio
npm run db:reset       # Reset database
```

## 🔐 Default Credentials

- **Admin**: admin@lifeflow.com / admin123
- **Hospital**: hospital@lifeflow.com / hospital123

## 📖 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Complete setup instructions
- [Backend API](./backend/README.md) - API documentation
- [Frontend](./frontend/README.md) - Frontend documentation

---

**Built with ❤️ for healthcare management**