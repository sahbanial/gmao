-- CreateIndex
CREATE UNIQUE INDEX "IndicatorSnapshot_machineId_periodStart_periodEnd_key"
ON "IndicatorSnapshot"("machineId", "periodStart", "periodEnd");
