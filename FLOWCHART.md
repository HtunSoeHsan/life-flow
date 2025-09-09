# LifeFlow System Flowcharts

## System Architecture Flow

```mermaid
flowchart TD
    A[User Access] --> B{Authentication}
    B -->|Valid| C{Role Check}
    B -->|Invalid| D[Login Page]
    
    C -->|Super Admin| E[Admin Dashboard]
    C -->|Hospital Admin| F[Hospital Management]
    C -->|Hospital Staff| G[Blood Bank Operations]
    
    E --> E1[Manage Hospitals]
    E --> E2[System Analytics]
    E --> E3[User Management]
    
    F --> F1[Manage Hospital Users]
    F --> F2[Hospital Settings]
    F --> F3[Hospital Reports]
    
    G --> G1[Donor Management]
    G --> G2[Blood Collection]
    G --> G3[Inventory Management]
    G --> G4[Distribution Requests]
    
    G1 --> H1[(Tenant Database)]
    G2 --> H1
    G3 --> H1
    G4 --> H2[(Cross-Hospital DBs)]
    
    E1 --> H3[(Master Database)]
    E2 --> H3
    E3 --> H1
```

## Blood Collection Workflow

```mermaid
flowchart TD
    A[Start Collection] --> B[Donor Registration]
    B --> C{Donor Exists?}
    C -->|No| D[Register New Donor]
    C -->|Yes| E[Verify Identity]
    
    D --> F[Biometric Verification]
    E --> F
    F --> G{Eligible?}
    
    G -->|No| H[Reject Collection]
    G -->|Yes| I[Create Collection Record]
    
    I --> J[Pre-Collection Checks]
    J --> K[Blood Collection Process]
    K --> L[Quality Control]
    L --> M{Quality OK?}
    
    M -->|No| N[Discard Sample]
    M -->|Yes| O[Create Blood Unit]
    
    O --> P[Testing Phase]
    P --> Q[Update Inventory]
    Q --> R[Collection Complete]
    
    H --> S[End Process]
    N --> S
    R --> S
```

## Cross-Hospital Blood Request Flow

```mermaid
flowchart TD
    A[Hospital A Needs Blood] --> B[Create Distribution Request]
    B --> C[Select Target Hospital B]
    C --> D[Submit Request to Hospital B DB]
    
    D --> E[Hospital B Receives Request]
    E --> F{Blood Available?}
    
    F -->|No| G[Reject Request]
    F -->|Yes| H[Review Request Details]
    
    H --> I{Approve Request?}
    I -->|No| G
    I -->|Yes| J[Issue Blood Units]
    
    J --> K[Update Status to 'Issued']
    K --> L[Prepare for Delivery]
    L --> M[Notify Hospital A]
    
    M --> N[Hospital A Checks Status]
    N --> O[Receive Blood Units]
    O --> P[Update Local Inventory]
    
    G --> Q[Notify Hospital A of Rejection]
    Q --> R[Hospital A Finds Alternative]
    P --> S[Process Complete]
    R --> S
```

## Multi-Tenant Database Access Flow

```mermaid
flowchart TD
    A[API Request] --> B[Extract Hospital ID]
    B --> C[Schema Manager]
    C --> D{Tenant Client Exists?}
    
    D -->|No| E[Create New Tenant Client]
    D -->|Yes| F[Get Existing Client]
    
    E --> G[Build Schema URL]
    G --> H[Initialize Prisma Client]
    H --> I[Store in Connection Pool]
    I --> F
    
    F --> J[Execute Database Operation]
    J --> K{Cross-Hospital Query?}
    
    K -->|No| L[Single Tenant Query]
    K -->|Yes| M[Multi-Tenant Query Loop]
    
    L --> N[Return Results]
    M --> O[Query Each Hospital DB]
    O --> P[Aggregate Results]
    P --> N
    
    N --> Q[Send API Response]
```

## User Authentication & Authorization Flow

```mermaid
flowchart TD
    A[User Login Request] --> B[Validate Credentials]
    B --> C{Valid Credentials?}
    
    C -->|No| D[Return Error]
    C -->|Yes| E[Generate JWT Token]
    
    E --> F[Include User Role & Hospital ID]
    F --> G[Return Token to Client]
    G --> H[Client Stores Token]
    
    H --> I[Protected API Request]
    I --> J[Extract JWT Token]
    J --> K{Valid Token?}
    
    K -->|No| L[Return 401 Unauthorized]
    K -->|Yes| M[Decode Token Payload]
    
    M --> N[Extract Hospital ID]
    N --> O[Set Request Context]
    O --> P[Route to Controller]
    
    P --> Q{Authorized for Action?}
    Q -->|No| R[Return 403 Forbidden]
    Q -->|Yes| S[Process Request]
    
    S --> T[Return Response]
```

## Blood Inventory Management Flow

```mermaid
flowchart TD
    A[Blood Unit Created] --> B[Initial Status: Quarantine]
    B --> C[Testing Process]
    C --> D{Tests Pass?}
    
    D -->|No| E[Status: Rejected]
    D -->|Yes| F[Status: Available]
    
    F --> G[Add to Inventory]
    G --> H[Monitor Expiry Date]
    H --> I{Near Expiry?}
    
    I -->|Yes| J[Generate Alert]
    I -->|No| K[Continue Monitoring]
    
    J --> L{Used Before Expiry?}
    L -->|No| M[Status: Expired]
    L -->|Yes| N[Status: Issued]
    
    K --> O{Distribution Request?}
    O -->|Yes| P[Reserve Blood Unit]
    O -->|No| K
    
    P --> Q[Status: Reserved]
    Q --> R{Request Approved?}
    R -->|No| S[Status: Available]
    R -->|Yes| N
    
    N --> T[Remove from Inventory]
    E --> U[Dispose Unit]
    M --> U
    S --> G
    T --> V[End Process]
    U --> V
```

## Emergency Request Handling Flow

```mermaid
flowchart TD
    A[Emergency Blood Request] --> B[Mark as Emergency Priority]
    B --> C[Immediate Notification]
    C --> D[Check Local Inventory]
    
    D --> E{Blood Available Locally?}
    E -->|Yes| F[Issue Immediately]
    E -->|No| G[Broadcast to All Hospitals]
    
    G --> H[Parallel Requests to Multiple Hospitals]
    H --> I[Wait for Responses]
    I --> J{Any Hospital Responds?}
    
    J -->|No| K[Escalate to Blood Bank Network]
    J -->|Yes| L[Select Closest Hospital]
    
    L --> M[Arrange Emergency Transport]
    M --> N[Real-time Tracking]
    N --> O[Receive Blood Units]
    
    F --> P[Update Patient Records]
    O --> P
    K --> Q[Alternative Sources]
    P --> R[Emergency Resolved]
    Q --> R
```

## System Monitoring & Analytics Flow

```mermaid
flowchart TD
    A[System Operations] --> B[Data Collection]
    B --> C[Performance Metrics]
    B --> D[Usage Statistics]
    B --> E[Error Logs]
    
    C --> F[Response Times]
    C --> G[Database Performance]
    C --> H[Resource Utilization]
    
    D --> I[User Activity]
    D --> J[Blood Unit Transactions]
    D --> K[Cross-Hospital Requests]
    
    E --> L[Application Errors]
    E --> M[Database Errors]
    E --> N[Authentication Failures]
    
    F --> O[Real-time Dashboard]
    G --> O
    H --> O
    I --> P[Analytics Reports]
    J --> P
    K --> P
    L --> Q[Alert System]
    M --> Q
    N --> Q
    
    O --> R[Super Admin View]
    P --> S[Hospital Admin View]
    Q --> T[System Administrator]
```

## How to View Flowcharts

1. **GitHub/GitLab**: Automatic rendering in markdown
2. **VS Code**: Mermaid Preview extension
3. **Online**: Copy to https://mermaid.live/
4. **Export**: Use Mermaid CLI for images

## Flowchart Legend

- **Rectangles**: Processes/Actions
- **Diamonds**: Decision Points
- **Circles**: Start/End Points
- **Cylinders**: Database Operations
- **Parallelograms**: Input/Output
- **Arrows**: Process Flow Direction