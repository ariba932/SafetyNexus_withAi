-- Add additional fields to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add is_active field to company_members if it doesn't exist
ALTER TABLE company_members ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create policy to allow users to view company members in their company
DROP POLICY IF EXISTS "Users can view company members" ON company_members;
CREATE POLICY "Users can view company members"
ON company_members FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.company_id = company_members.company_id
  )
);

-- Create policy to allow users to update company members in their company if they are admin/manager
DROP POLICY IF EXISTS "Admins and managers can update company members" ON company_members;
CREATE POLICY "Admins and managers can update company members"
ON company_members FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.company_id = company_members.company_id
    AND cm.role IN ('Owner/Admin', 'Manager')
  )
);

-- Create policy to allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- Create policy to allow users to view profiles in their company
DROP POLICY IF EXISTS "Users can view profiles in their company" ON user_profiles;
CREATE POLICY "Users can view profiles in their company"
ON user_profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM company_members cm1
    JOIN company_members cm2 ON cm1.company_id = cm2.company_id
    WHERE cm1.user_id = auth.uid()
    AND cm2.user_id = user_profiles.id
  )
);

-- Enable RLS on user_profiles if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
