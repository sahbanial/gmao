DROP INDEX IF EXISTS "IndicatorSnapshot_machineId_periodStart_periodEnd_key";

CREATE UNIQUE INDEX IF NOT EXISTS "IndicatorSnapshot_machineId_periodStart_key"
ON "IndicatorSnapshot"("machineId", "periodStart");
