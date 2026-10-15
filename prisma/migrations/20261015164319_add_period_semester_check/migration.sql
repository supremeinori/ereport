-- Add check constraint for period_semester (must be 1 or 2)
ALTER TABLE "reports" ADD CONSTRAINT "reports_period_semester_check" CHECK ("period_semester" IN (1, 2));