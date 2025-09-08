# Blood Bank Management API Server

A comprehensive REST API server for blood bank management with Object-Oriented Design (OOD) principles, multi-tenant architecture, and biometric authentication.

## 🏗️ Architecture & Design Patterns

This project demonstrates advanced software engineering concepts:

### Object-Oriented Design (OOD) Principles
- **Inheritance**: BaseEntity class with common functionality
- **Encapsulation**: Private fields with getter methods
- **Abstraction**: Abstract classes and interfaces
- **Polymorphism**: Strategy pattern implementations

### Design Patterns Implemented
- **Repository Pattern**: Data access abstraction
- **Strategy Pattern**: Donor eligibility checking
- **Observer Pattern**: Event-driven architecture
- **Factory Pattern**: Biometric matcher creation
- **Template Method**: Entity save operations
- **Specification Pattern**: Complex query building

### Advanced Features
- **Multi-tenant Architecture**: Isolated data per tenant
- **Feature Toggles**: Enable/disable features dynamically
- **Biometric Authentication**: Fingerprint-based donor verification
- **Event Sourcing**: Domain events for audit trails
- **Domain-Driven Design**: Rich domain models

## 🚀 Quick Start

### Installation
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start development server
npm run dev
```

### Environment Configuration
Copy `.env` and configure:
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bbm_database"

# Security
JWT_SECRET="your-super-secret-jwt-key"

# Features
FEATURE_MULTI_TENANT=false
BIOMETRIC_ENABLED=true
FEATURE_DONOR_REGISTRATION=true
```

## 📚 API Documentation

### Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "tenant": "Default Tenant"
}
```

### Donor Registration
```bash
POST /api/donors/register
Content-Type: application/json
```

Request body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "dateOfBirth": "1990-05-15",
  "gender": "Male",
  "bloodGroup": "O+",
  "weight": 70,
  "address": "123 Main St, City",
  "occupation": "Engineer",
  "emergencyContact": "+1234567891",
  "medicalHistory": {
    "hasChronicDisease": false,
    "recentMedication": false,
    "isPregnant": false,
    "allergies": [],
    "surgeries": []
  },
  "preferences": {
    "preferredDonationTime": "morning",
    "notifications": true,
    "emergencyDonor": true
  },
  "rawFingerprintData": "fingerprint_template_data"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "donor_id",
    "donorId": "D1640123456789",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "bloodGroup": "O+",
    "age": 33,
    "isEligible": true,
    "eligibility": {
      "isEligible": true,
      "summary": "Donor is eligible for blood donation",
      "strategyResults": [...]
    }
  },
  "message": "Donor registered successfully"
}
```

### Biometric Verification
```bash
POST /api/donors/verify-biometric
Content-Type: application/json
```

Request body:
```json
{
  "fingerprintData": "captured_fingerprint_data",
  "donorId": "D1640123456789"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "verified": true,
    "confidence": 0.92,
    "donorId": "D1640123456789"
  },
  "message": "Biometric verification successful"
}
```

### Eligibility Check
```bash
POST /api/donors/check-eligibility
Content-Type: application/json
```

Request body:
```json
{
  "donorData": {
    "firstName": "Jane",
    "lastName": "Smith",
    "dateOfBirth": "1985-03-20",
    "weight": 55,
    "bloodGroup": "A+",
    "medicalHistory": {
      "hasChronicDisease": false,
      "recentMedication": true,
      "isPregnant": false
    }
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "isEligible": false,
    "summary": "Donor is not eligible: Currently taking medication",
    "strategyResults": [
      {
        "strategyName": "AgeEligibilityStrategy",
        "isEligible": true,
        "reasons": []
      },
      {
        "strategyName": "MedicalHistoryEligibilityStrategy",
        "isEligible": false,
        "reasons": ["Currently taking medication"]
      }
    ]
  },
  "message": "Eligibility check completed"
}
```

### Event History
```bash
GET /api/donors/{donorId}/events
```

Response:
```json
{
  "success": true,
  "data": {
    "donorId": "D1640123456789",
    "events": [
      {
        "eventId": "1640123456789-abc123",
        "eventType": "DonorRegisteredEvent",
        "occurredOn": "2024-01-20T10:30:00.000Z",
        "eventData": {
          "donorId": "D1640123456789",
          "email": "john.doe@example.com",
          "bloodGroup": "O+",
          "isEligible": true,
          "biometricEnrolled": true
        }
      }
    ]
  },
  "message": "Event history retrieved successfully"
}
```

## 🏛️ OOD Concepts Demonstrated

### 1. Inheritance Hierarchy
```
BaseEntity (Abstract)
├── Donor
├── BloodUnit
└── Collection
```

### 2. Composition
- `Donor` contains `MedicalHistory`, `DonorPreferences`, and `BiometricData`
- Demonstrates "has-a" relationships

### 3. Strategy Pattern
- Different eligibility checking strategies
- Easily extensible for new rules
- Runtime strategy selection

### 4. Observer Pattern
- Event-driven architecture
- Loose coupling between components
- Automatic event propagation

### 5. Repository Pattern
- Data access abstraction
- Testable business logic
- Database independence

## 🧪 Testing OOD Concepts

You can test the OOD implementation by:

1. **Testing Inheritance**: Create different entity types and observe shared behavior
2. **Testing Polymorphism**: Use different eligibility strategies
3. **Testing Encapsulation**: Try accessing private fields (should fail)
4. **Testing Events**: Register donors and check event history

## 🏢 Multi-Tenant Support

The system supports multi-tenancy through:
- Tenant-specific data isolation
- Feature flags per tenant
- Subdomain-based tenant resolution
- Header-based tenant identification

## 🔐 Security Features

- Biometric authentication with fingerprint matching
- Secure hash storage
- Constant-time comparisons to prevent timing attacks
- Event logging for security audits

## 📊 Database Skills Demonstrated

- Complex schema design with relationships
- JSON field usage for flexible data
- Unique constraints for data integrity
- Proper indexing strategies
- Migration management with Prisma

## 🎯 Key Learning Outcomes

This project demonstrates:
- ✅ Object-Oriented Programming principles
- ✅ Design patterns in real-world scenarios
- ✅ Clean architecture and separation of concerns
- ✅ Event-driven architecture
- ✅ Database design and ORM usage
- ✅ Multi-tenant application architecture
- ✅ Security best practices
- ✅ TypeScript advanced features

## 🔧 Development

```bash
# Install dependencies
npm install

# Build project
npm run build

# Start development server
npm run dev

# Database operations
npm run db:generate
npm run db:migrate
npm run db:seed
```

## 📝 License

This project is for educational purposes demonstrating advanced software engineering concepts.
