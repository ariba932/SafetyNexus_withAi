-- Modify the companies table to allow new users to create companies
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_created_by_fkey;

-- Add the constraint back but make it deferrable
ALTER TABLE companies ADD CONSTRAINT companies_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id) DEFERRABLE INITIALLY DEFERRED;

-- Enable row-level security on the companies table
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own companies
DROP POLICY IF EXISTS "Users can insert their own companies" ON companies;
CREATE POLICY "Users can insert their own companies"
ON companies FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Create policy to allow users to view their own companies
DROP POLICY IF EXISTS "Users can view their own companies" ON companies;
CREATE POLICY "Users can view their own companies"
ON companies FOR SELECT
TO authenticated
USING (created_by = auth.uid());

-- Create policy to allow users to update their own companies
DROP POLICY IF EXISTS "Users can update their own companies" ON companies;
CREATE POLICY "Users can update their own companies"
ON companies FOR UPDATE
TO authenticated
USING (created_by = auth.uid());

-- Realtime is already enabled for companies table, no need to add it again
