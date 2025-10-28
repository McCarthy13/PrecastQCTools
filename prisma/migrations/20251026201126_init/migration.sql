-- CreateTable
CREATE TABLE "Aggregate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Sieve" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aggregateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" REAL NOT NULL,
    "order" INTEGER NOT NULL,
    "c33Lower" REAL,
    "c33Upper" REAL,
    CONSTRAINT "Sieve_aggregateId_fkey" FOREIGN KEY ("aggregateId") REFERENCES "Aggregate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GradationRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aggregateId" TEXT,
    "aggregateName" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalWeight" REAL NOT NULL,
    "washedWeight" REAL,
    "finenessModulus" REAL,
    "decant" REAL,
    "notes" TEXT,
    "tester" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GradationRecord_aggregateId_fkey" FOREIGN KEY ("aggregateId") REFERENCES "Aggregate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SieveResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recordId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" REAL NOT NULL,
    "weightRetained" REAL NOT NULL,
    "percentRetained" REAL NOT NULL,
    "cumulativeRetained" REAL NOT NULL,
    "percentPassing" REAL NOT NULL,
    "c33Lower" REAL,
    "c33Upper" REAL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "SieveResult_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "GradationRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Aggregate_name_key" ON "Aggregate"("name");
