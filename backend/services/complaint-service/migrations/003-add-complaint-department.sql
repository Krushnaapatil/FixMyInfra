ALTER TABLE complaints
  ADD COLUMN IF NOT EXISTS department_id UUID;
