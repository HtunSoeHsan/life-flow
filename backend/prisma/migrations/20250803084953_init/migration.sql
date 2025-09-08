-- CreateTable
CREATE TABLE "public"."tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'staff',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "permissions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."donors" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "bloodGroup" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "emergencyContact" TEXT NOT NULL,
    "hasChronicDisease" BOOLEAN NOT NULL DEFAULT false,
    "chronicDiseaseDetails" TEXT,
    "recentMedication" BOOLEAN NOT NULL DEFAULT false,
    "isPregnant" BOOLEAN NOT NULL DEFAULT false,
    "lastDonationDate" TIMESTAMP(3),
    "preferredDonationTime" TEXT,
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "emergencyDonor" BOOLEAN NOT NULL DEFAULT false,
    "consent" BOOLEAN NOT NULL DEFAULT true,
    "profilePhoto" TEXT,
    "fingerprintHash" TEXT,
    "fingerprintTemplate" BYTEA,
    "biometricData" JSONB,
    "biometricVerified" BOOLEAN NOT NULL DEFAULT false,
    "isEligible" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."blood_units" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "bloodGroup" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "collectionDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Quarantine',
    "location" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "testResults" JSONB NOT NULL,
    "crossMatchStatus" TEXT NOT NULL DEFAULT 'Pending',
    "quarantineStatus" TEXT NOT NULL DEFAULT 'In Quarantine',
    "reservedFor" TEXT,
    "issuedTo" TEXT,
    "issuedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blood_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."collections" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "donorName" TEXT NOT NULL,
    "bloodGroup" TEXT NOT NULL,
    "collectionDate" TIMESTAMP(3) NOT NULL,
    "collectionTime" TEXT NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "collectionType" TEXT NOT NULL,
    "collectionMethod" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "staff" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Scheduled',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "bagNumber" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION,
    "qualityChecks" JSONB NOT NULL,
    "testingStatus" JSONB NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hospitals" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "licenseNo" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."distributions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "distributionId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "bloodUnitId" TEXT NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL,
    "issueDate" TIMESTAMP(3),
    "quantity" DOUBLE PRECISION NOT NULL,
    "purpose" TEXT NOT NULL,
    "urgency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Requested',
    "approvedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."feature_flags" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."biometric_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "confidence" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "biometric_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_domain_key" ON "public"."tenants"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_subdomain_key" ON "public"."tenants"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenantId_email_key" ON "public"."users"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "donors_tenantId_donorId_key" ON "public"."donors"("tenantId", "donorId");

-- CreateIndex
CREATE UNIQUE INDEX "donors_tenantId_email_key" ON "public"."donors"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "blood_units_tenantId_unitId_key" ON "public"."blood_units"("tenantId", "unitId");

-- CreateIndex
CREATE UNIQUE INDEX "collections_tenantId_collectionId_key" ON "public"."collections"("tenantId", "collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_tenantId_email_key" ON "public"."hospitals"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_tenantId_licenseNo_key" ON "public"."hospitals"("tenantId", "licenseNo");

-- CreateIndex
CREATE UNIQUE INDEX "distributions_tenantId_distributionId_key" ON "public"."distributions"("tenantId", "distributionId");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_tenantId_name_key" ON "public"."feature_flags"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_tenantId_key_key" ON "public"."system_settings"("tenantId", "key");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."donors" ADD CONSTRAINT "donors_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blood_units" ADD CONSTRAINT "blood_units_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blood_units" ADD CONSTRAINT "blood_units_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "public"."donors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."collections" ADD CONSTRAINT "collections_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."collections" ADD CONSTRAINT "collections_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "public"."donors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hospitals" ADD CONSTRAINT "hospitals_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."distributions" ADD CONSTRAINT "distributions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
