DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StrandPosition') THEN
    CREATE TYPE "StrandPosition" AS ENUM ('TOP', 'BOTTOM', 'BOTH');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StrandSize') THEN
    CREATE TYPE "StrandSize" AS ENUM ('SIZE_3_8', 'SIZE_1_2', 'SIZE_0_6');
  END IF;
END$$;

ALTER TABLE "StrandPattern"
  ALTER COLUMN "position" TYPE "StrandPosition" USING ("position"::"StrandPosition");

ALTER TABLE "StrandPatternGrade"
  ALTER COLUMN "size" TYPE "StrandSize" USING ("size"::"StrandSize");

ALTER TABLE "StrandPatternCoordinate"
  ALTER COLUMN "size" TYPE "StrandSize" USING ("size"::"StrandSize");
