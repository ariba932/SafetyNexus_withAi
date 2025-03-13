-- Create forms table
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  company_id UUID REFERENCES companies(id),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published BOOLEAN DEFAULT FALSE,
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft'
);

-- Create form_fields table
CREATE TABLE IF NOT EXISTS form_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  field_type TEXT NOT NULL,
  label TEXT NOT NULL,
  placeholder TEXT,
  description TEXT,
  required BOOLEAN DEFAULT FALSE,
  options JSONB,
  validation JSONB,
  order_index INTEGER NOT NULL,
  parent_id UUID REFERENCES form_fields(id) ON DELETE CASCADE,
  layout TEXT DEFAULT 'full',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hidden BOOLEAN DEFAULT FALSE,
  readonly BOOLEAN DEFAULT FALSE,
  default_value TEXT
);

-- Create form_submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  submitted_by UUID,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL,
  status TEXT DEFAULT 'submitted',
  location JSONB,
  device_info JSONB
);

-- Enable RLS
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their company's forms" ON forms;
CREATE POLICY "Users can view their company's forms"
  ON forms FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can insert forms" ON forms;
CREATE POLICY "Users can insert forms"
  ON forms FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can update their company's forms" ON forms;
CREATE POLICY "Users can update their company's forms"
  ON forms FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can view form fields" ON form_fields;
CREATE POLICY "Users can view form fields"
  ON form_fields FOR SELECT
  USING (
    form_id IN (
      SELECT id FROM forms WHERE company_id IN (
        SELECT company_id FROM company_members 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert form fields" ON form_fields;
CREATE POLICY "Users can insert form fields"
  ON form_fields FOR INSERT
  WITH CHECK (
    form_id IN (
      SELECT id FROM forms WHERE company_id IN (
        SELECT company_id FROM company_members 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

DROP POLICY IF EXISTS "Users can update form fields" ON form_fields;
CREATE POLICY "Users can update form fields"
  ON form_fields FOR UPDATE
  USING (
    form_id IN (
      SELECT id FROM forms WHERE company_id IN (
        SELECT company_id FROM company_members 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete form fields" ON form_fields;
CREATE POLICY "Users can delete form fields"
  ON form_fields FOR DELETE
  USING (
    form_id IN (
      SELECT id FROM forms WHERE company_id IN (
        SELECT company_id FROM company_members 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

DROP POLICY IF EXISTS "Users can view form submissions" ON form_submissions;
CREATE POLICY "Users can view form submissions"
  ON form_submissions FOR SELECT
  USING (
    form_id IN (
      SELECT id FROM forms WHERE company_id IN (
        SELECT company_id FROM company_members 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert form submissions" ON form_submissions;
CREATE POLICY "Users can insert form submissions"
  ON form_submissions FOR INSERT
  WITH CHECK (
    submitted_by = auth.uid() AND
    form_id IN (
      SELECT id FROM forms WHERE company_id IN (
        SELECT company_id FROM company_members 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

-- Enable realtime
alter publication supabase_realtime add table forms;
alter publication supabase_realtime add table form_fields;
alter publication supabase_realtime add table form_submissions;