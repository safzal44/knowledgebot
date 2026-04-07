
-- Create policy_documents table
CREATE TABLE public.policy_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  extracted_text TEXT,
  uploaded_by UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.policy_documents ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage policy documents"
ON public.policy_documents
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- All authenticated users can read active documents
CREATE POLICY "Authenticated users can read active policy documents"
ON public.policy_documents
FOR SELECT
TO authenticated
USING (is_active = true);

-- Timestamp trigger
CREATE TRIGGER update_policy_documents_updated_at
BEFORE UPDATE ON public.policy_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('policy-pdfs', 'policy-pdfs', false);

-- Storage policies
CREATE POLICY "Admins can upload policy PDFs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'policy-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update policy PDFs"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'policy-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete policy PDFs"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'policy-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view policy PDFs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'policy-pdfs');
