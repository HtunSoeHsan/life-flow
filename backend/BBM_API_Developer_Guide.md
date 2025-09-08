# Blood Bank Management System Developer Guide

## Overview

The Blood Bank Management (BBM) System is a comprehensive full-stack application consisting of a multi-tenant API server and a modern web frontend. The system facilitates blood bank operations including donor management, blood collection processing, inventory management, and distribution tracking. Built with scalability, maintainability, and user experience in mind.

## System Architecture

The BBM System follows a client-server architecture with clear separation between frontend and backend:

### Backend API Server (`bbm-api-server`)

**Project Structure:**
- **src**
  - **controllers**: HTTP request handlers that interact with DAOs and services
  - **dao**: Data Access Objects for database abstraction
  - **middleware**: Request processing middleware (authentication, tenant resolution)
  - **models**: Domain entities and data models
  - **routes**: API endpoint definitions and routing configuration
  - **services**: Business logic and domain services
  - **observers**: Event-driven components for asynchronous operations
  - **database**: Database clients and schema management

### Frontend Console (`bbm-console`)

**Project Structure:**
- **app**: Next.js App Router pages and layouts
- **components**: Reusable React components organized by feature:
  - **donor**: Donor management components (DonorProfile, DonorRegistration, DonorList)
  - **inventory**: Blood inventory management (BloodInventory, AddBloodUnit, ExpiryAlerts)
  - **collection**: Blood collection processing (CollectionProcessing)
  - **distribution**: Distribution management (IssueDistribution)
  - **hospital**: Hospital integration components
  - **reports**: Analytics and reporting components
  - **settings**: System configuration components
- **hooks**: Custom React hooks for state management and API calls
- **lib**: Utility functions and shared configurations
- **public**: Static assets and resources

## Key Design Patterns

1. **MVC (Model-View-Controller)**
   - Separates the project into controllers, DAO (acting as the model), and pre-defined routes (as the view layer).

2. **DAO (Data Access Object)**
   - Abstracts all database operations and deals with the Prisma ORM to provide a clean interface.

3. **Singleton**
   - Utilized in classes like Logger and Database Manager to ensure that a single instance is accessed throughout the application.

## Technical Stack

### Backend Technologies
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Architecture**: Multi-tenant with schema-per-tenant isolation
- **Authentication**: JWT with biometric support
- **Security**: Helmet, CORS, Rate limiting
- **Validation**: Custom validation layers
- **Logging**: Winston (custom Logger implementation)

### Frontend Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI Libraries**: 
  - Ant Design (primary UI components)
  - Radix UI (headless components)
  - Lucide React (icons)
- **Styling**: Tailwind CSS with custom design system
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React hooks and context
- **Charts**: @ant-design/plots, Recharts
- **Date Handling**: Day.js, date-fns

### Development Tools
- **Package Manager**: npm/yarn
- **Code Quality**: ESLint, TypeScript strict mode
- **Build Tool**: Next.js build system
- **Version Control**: Git

## Setup and Installation

### Backend Setup (`bbm-api-server`)

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd bbm-api-server
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file with:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/bbm_master"
   MASTER_DATABASE_URL="postgresql://user:password@localhost:5432/bbm_master"
   TENANT_DATABASE_URL="postgresql://user:password@localhost:5432/bbm_tenant"
   PORT=3001
   FEATURE_MULTI_TENANT=true
   BIOMETRIC_ENABLED=true
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Start Server**
   ```bash
   npm run dev  # Development
   npm start    # Production
   ```

### Frontend Setup (`bbm-console`)

1. **Navigate to Frontend**
   ```bash
   cd ../bbm-console
   ```

2. **Install Dependencies**
   ```bash
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. **Start Development Server**
   ```bash
   yarn dev     # Development server
   yarn build   # Production build
   yarn start   # Production server
   ```

## API Endpoints

### Donors
- `POST /api/donors/register`: Register new donor with biometric data
- `POST /api/donors/verify-biometric`: Verify donor fingerprint
- `POST /api/donors/eligibility`: Check donor eligibility
- `GET /api/donors/:id/events`: Get donor event history

### Collections
- `GET /api/collections`: Fetch all collections with filtering
- `POST /api/collections`: Add new blood collection
- `GET /api/collections/:id`: Fetch collection by ID
- `PUT /api/collections/:id`: Update existing collection
- `DELETE /api/collections/:id`: Delete a collection

### Distributions
- `GET /api/distributions`: List distribution requests (with pagination)
- `POST /api/distributions`: Create new distribution request
- `GET /api/distributions/stats`: Get distribution statistics
- `GET /api/distributions/:id`: Fetch distribution request by ID
- `PUT /api/distributions/:id`: Update distribution request
- `POST /api/distributions/:id/issue`: Issue blood units
- `POST /api/distributions/:id/cancel`: Cancel distribution request
- `DELETE /api/distributions/:id`: Delete distribution request

### Hospitals (Multi-tenant)
- `GET /api/hospitals`: List hospitals
- `POST /api/hospitals`: Create new hospital
- `GET /api/hospitals/:id`: Get hospital details
- `PUT /api/hospitals/:id`: Update hospital information

## Frontend Features

### Core Modules
1. **Donor Management**
   - Registration with biometric enrollment
   - Profile management and history
   - Eligibility checking and validation

2. **Blood Collection Processing**
   - Multi-step collection workflow
   - Quality control checks
   - Testing status tracking
   - Analytics and reporting

3. **Inventory Management**
   - Real-time blood unit tracking
   - Expiry date monitoring and alerts
   - Blood group and component management
   - Storage location tracking

4. **Distribution Management**
   - Hospital request processing
   - Emergency request prioritization
   - Blood unit allocation
   - Delivery tracking

5. **Hospital Integration**
   - Multi-tenant hospital support
   - Request management
   - Communication interfaces

6. **Reports & Analytics**
   - Collection trends analysis
   - Distribution patterns
   - Inventory status reports
   - Donor statistics

### UI/UX Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Live data refresh and notifications
- **Interactive Charts**: Data visualization with multiple chart types
- **Form Validation**: Comprehensive validation with user-friendly error messages
- **Accessibility**: WCAG compliant components from Radix UI
- **Dark/Light Theme**: System theme detection with manual override

## Multi-Tenant Architecture

### Tenant Isolation
- **Schema-per-tenant**: Each hospital gets isolated database schema
- **Tenant Resolution**: Automatic tenant detection via subdomain/header
- **Data Security**: Complete data isolation between hospitals
- **Scalability**: Independent scaling per tenant

### Middleware Stack
1. **Authentication**: JWT token validation
2. **Tenant Resolution**: Hospital identification and client selection
3. **Feature Flags**: Tenant-specific feature enablement
4. **Rate Limiting**: Per-tenant API rate limiting
5. **Logging**: Tenant-aware logging and auditing

## Contributing

- Follow the existing code style and naming conventions.
- Write tests for new features and ensure all tests pass before making a pull request.

## Contact

For additional documentation or support, contact the maintainers at `support@bbmserver.com`.
