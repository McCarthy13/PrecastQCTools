-- CreateTable
CREATE TABLE "StrandPattern" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patternId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "strandCountThreeEight" INTEGER NOT NULL DEFAULT 0,
    "strandCountOneHalf" INTEGER NOT NULL DEFAULT 0,
    "strandCountZeroSix" INTEGER NOT NULL DEFAULT 0,
    "pullingForcePercent" REAL,
    "totalArea" REAL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "StrandPatternGrade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patternId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StrandPatternGrade_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "StrandPattern" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StrandPatternCoordinate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patternId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "xInches" REAL NOT NULL,
    "yInches" REAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StrandPatternCoordinate_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "StrandPattern" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "StrandPattern_patternId_key" ON "StrandPattern"("patternId");
