-- Add domain column to companies table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'domain') THEN
    ALTER TABLE companies ADD COLUMN domain TEXT;
  END IF;
END $$;

-- Create function to handle company membership during registration
CREATE OR REPLACE FUNCTION handle_new_user_company_membership()
RETURNS TRIGGER AS $$
DECLARE
  company_id_var UUID;
  user_email TEXT;
  email_domain TEXT;
  role_var TEXT;
BEGIN
  -- Get user email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
  
  -- Extract domain from email
  email_domain := split_part(user_email, '@', 2);
  
  -- Check if company with this domain already exists
  SELECT id INTO company_id_var FROM companies WHERE domain = email_domain LIMIT 1;
  
  -- Set role based on whether company exists
  IF company_id_var IS NULL THEN
    -- No company with this domain exists, user will create a new company
    -- The role will be set when the company is created
    RETURN NEW;
  ELSE
    -- Company exists, add user as a member
    role_var := 'Member';
    
    -- Insert into company_members
    INSERT INTO company_members (company_id, user_id, role, created_at)
    VALUES (company_id_var, NEW.id, role_var, now());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to handle new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_company_membership();

-- Create function to handle company creation and set owner
CREATE OR REPLACE FUNCTION handle_company_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert company creator as Owner/Admin
  INSERT INTO company_members (company_id, user_id, role, created_at)
  VALUES (NEW.id, NEW.created_by, 'Owner/Admin', now());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for company creation
DROP TRIGGER IF EXISTS on_company_created ON companies;
CREATE TRIGGER on_company_created
  AFTER INSERT ON companies
  FOR EACH ROW
  EXECUTE FUNCTION handle_company_creation();

-- Enable RLS on company_members table
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

-- Create policies for company_members table
DROP POLICY IF EXISTS "Users can view their own company memberships" ON company_members;
CREATE POLICY "Users can view their own company memberships"
ON company_members FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Realtime is already enabled for company_members table, no need to add it again
