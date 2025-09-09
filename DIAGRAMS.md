# LifeFlow System Diagrams

## Entity Relationship Diagram (ERD)

### Master Database ERD
```mermaid
erDiagram
    HOSPITAL {
        string id PK
        string name
        string address
        string phone
        string email
        string licenseNo
        string contactPerson
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
    
    SYSTEM_USER {
        string id PK
        string email
        string password
        string role
        string hospitalId FK
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
    
    HOSPITAL ||--o{ SYSTEM_USER : manages
```

### Tenant Database ERD
```mermaid
erDiagram
    USER {
        string id PK
        string email
        string password
        string role
        string firstName
        string lastName
        string phone
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
    
    DONOR {
        string id PK
        string donorId UK
        string firstName
        string lastName
        string email UK
        string phone
        datetime dateOfBirth
        string gender
        string bloodGroup
        float weight
        string address
        json biometricData
        boolean isEligible
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
    
    COLLECTION {
        string id PK
        string collectionId UK
        string donorId FK
        string donorName
        string bloodGroup
        datetime collectionDate
        string collectionTime
        float volume
        string collectionType
        string status
        int currentStep
        string bagNumber
        json qualityChecks
        json testingStatus
        string notes
        datetime createdAt
        datetime updatedAt
    }
    
    BLOOD_UNIT {
        string id PK
        string unitId UK
        string donorId FK
        string bloodGroup
        string component
        datetime collectionDate
        datetime expiryDate
        float volume
        string status
        string location
        float temperature
        string batchNumber
        json testResults
        string crossMatchStatus
        string quarantineStatus
        string reservedFor
        string issuedTo
        datetime issuedDate
        string notes
        datetime createdAt
        datetime updatedAt
    }
    
    DISTRIBUTION {
        string id PK
        string distributionId UK
        string bloodUnitId
        datetime requestDate
        datetime issueDate
        float quantity
        string purpose
        string urgency
        string status
        string requestingHospitalId
        string targetHospitalId
        string contactPerson
        string approvedBy
        string notes
        datetime createdAt
        datetime updatedAt
    }
    
    DONOR ||--o{ COLLECTION : has
    DONOR ||--o{ BLOOD_UNIT : provides
    COLLECTION ||--|| BLOOD_UNIT : produces
    BLOOD_UNIT ||--o{ DISTRIBUTION : distributed_in
```

## Class Diagram

```mermaid
classDiagram
    class BaseEntity {
        <<abstract>>
        +string id
        +Date createdAt
        +Date updatedAt
    }
    
    class BaseDAO~T, K~ {
        <<abstract>>
        #PrismaClient prisma
        +findById(id: K) Promise~T~
        +create(data: any) Promise~T~
        +update(id: K, data: any) Promise~T~
        +delete(id: K) Promise~boolean~
    }
    
    class Hospital {
        +string name
        +string address
        +string phone
        +string email
        +string licenseNo
        +string contactPerson
        +boolean isActive
    }
    
    class Donor {
        +string donorId
        +string firstName
        +string lastName
        +string email
        +string bloodGroup
        +Json biometricData
        +boolean isEligible
    }
    
    class BloodUnit {
        +string unitId
        +string donorId
        +string bloodGroup
        +string component
        +Date expiryDate
        +string status
        +Json testResults
    }
    
    class Distribution {
        +string distributionId
        +string bloodUnitId
        +float quantity
        +string purpose
        +string urgency
        +string status
        +string requestingHospitalId
        +string targetHospitalId
    }
    
    class DonorDAO {
        +findByBloodGroup(bloodGroup: string) Promise~Donor[]~
        +checkEligibility(donorId: string) Promise~boolean~
    }
    
    class DistributionDAO {
        +findByStatus(status: string) Promise~Distribution[]~
        +issueDistribution(id: string, approvedBy: string) Promise~Distribution~
        +getStats() Promise~DistributionStats~
    }
    
    class DonorController {
        -DonorDAO dao
        +registerDonor(req: Request, res: Response) Promise~void~
        +checkEligibility(req: Request, res: Response) Promise~void~
    }
    
    class DistributionController {
        -DistributionDAO dao
        +createDistributionRequest(req: Request, res: Response) Promise~void~
        +issueBloodUnits(req: Request, res: Response) Promise~void~
        +getMyRequests(req: Request, res: Response) Promise~void~
    }
    
    class SchemaManager {
        <<singleton>>
        -Map tenantConnections
        +getInstance() SchemaManager
        +getTenantClient(hospitalId: string) PrismaClient
        +getMasterClient() MasterPrismaClient
    }
    
    BaseEntity <|-- Hospital
    BaseEntity <|-- Donor
    BaseEntity <|-- BloodUnit
    BaseEntity <|-- Distribution
    
    BaseDAO <|-- DonorDAO
    BaseDAO <|-- DistributionDAO
    
    DonorController --> DonorDAO : uses
    DistributionController --> DistributionDAO : uses
    
    SchemaManager --> PrismaClient : creates
```

## Sequence Diagrams

### Blood Collection Process
```mermaid
sequenceDiagram
    participant Staff as Hospital Staff
    participant DC as DonorController
    participant DD as DonorDAO
    participant CC as CollectionController
    participant CD as CollectionDAO
    participant DB as Database
    
    Staff->>+DC: registerDonor(donorData)
    DC->>+DD: create(donorData)
    DD->>+DB: INSERT INTO donors
    DB-->>-DD: donor record
    DD-->>-DC: donor object
    DC-->>-Staff: registration success
    
    Staff->>+CC: createCollection(collectionData)
    CC->>+CD: create(collectionData)
    CD->>+DB: INSERT INTO collections
    DB-->>-CD: collection record
    CD-->>-CC: collection object
    CC-->>-Staff: collection created
    
    Staff->>+CC: completeCollection(id, bloodUnitData)
    CC->>+CD: update(id, status: "Completed")
    CD->>+DB: UPDATE collections
    DB-->>-CD: updated collection
    CD-->>-CC: collection completed
    CC-->>-Staff: collection and blood unit created
```

### Cross-Hospital Blood Request
```mermaid
sequenceDiagram
    participant HS as Hospital Staff A
    participant DC as DistributionController
    participant SM as SchemaManager
    participant DBB as Database B
    participant HSB as Hospital Staff B
    
    HS->>+DC: createDistributionRequest(requestData)
    DC->>+SM: getTenantClient(targetHospitalId)
    SM-->>-DC: Hospital B PrismaClient
    DC->>+DBB: INSERT INTO distributions
    DBB-->>-DC: distribution record
    DC-->>-HS: request created
    
    HSB->>+DC: getDistributions()
    DC->>+DBB: SELECT FROM distributions
    DBB-->>-DC: incoming requests
    DC-->>-HSB: requests displayed
    
    HSB->>+DC: issueBloodUnits(distributionId)
    DC->>+DBB: UPDATE distributions SET status='Issued'
    DBB-->>-DC: updated distribution
    DC-->>-HSB: blood units issued
```

## How to View These Diagrams

1. **GitHub/GitLab**: Renders automatically in markdown files
2. **VS Code**: Install "Mermaid Preview" extension  
3. **Online**: Copy code to https://mermaid.live/
4. **Export**: Use Mermaid CLI or online tools for PNG/SVG