
-- Programs (e.g. Skill Development, ESP, Health)
CREATE TABLE public.programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programs TO authenticated;
GRANT ALL ON public.programs TO service_role;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view programs" ON public.programs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage programs" ON public.programs FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Departments (e.g. HR, Finance, IT)
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.departments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.departments TO authenticated;
GRANT ALL ON public.departments TO service_role;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage departments" ON public.departments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Document types (e.g. Policy, Handbook, Form, Notice)
CREATE TABLE public.document_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.document_types TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_types TO authenticated;
GRANT ALL ON public.document_types TO service_role;
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view document_types" ON public.document_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage document_types" ON public.document_types FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Link categories to policy_documents
ALTER TABLE public.policy_documents
  ADD COLUMN program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  ADD COLUMN department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  ADD COLUMN document_type_id UUID REFERENCES public.document_types(id) ON DELETE SET NULL;

CREATE INDEX idx_policy_documents_program ON public.policy_documents(program_id);
CREATE INDEX idx_policy_documents_department ON public.policy_documents(department_id);
CREATE INDEX idx_policy_documents_doc_type ON public.policy_documents(document_type_id);

-- AI-generated chart specs per document
CREATE TABLE public.document_charts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.policy_documents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  chart_type TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_charts TO authenticated;
GRANT ALL ON public.document_charts TO service_role;
ALTER TABLE public.document_charts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view charts" ON public.document_charts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage charts" ON public.document_charts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE INDEX idx_document_charts_doc ON public.document_charts(document_id);

-- Seed a few sample programs/departments for the nonprofit
INSERT INTO public.programs (name, description) VALUES
  ('Skill Development', 'Vocational training and skill-building programs'),
  ('ESP', 'Education Sponsorship Program'),
  ('Health', 'Healthcare and wellness initiatives')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.departments (name, description) VALUES
  ('Human Resources', 'HR and people operations'),
  ('Finance', 'Finance and accounting'),
  ('Operations', 'Program operations and logistics'),
  ('Fundraising', 'Donor relations and fundraising')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.document_types (name) VALUES
  ('Policy'), ('Handbook'), ('Form'), ('Notice'), ('Report')
ON CONFLICT (name) DO NOTHING;
