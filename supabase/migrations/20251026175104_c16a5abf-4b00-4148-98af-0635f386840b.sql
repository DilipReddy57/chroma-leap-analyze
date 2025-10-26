-- Create table for storing image analysis results
CREATE TABLE public.image_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.image_analyses ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view analyses)
CREATE POLICY "Anyone can view analyses"
  ON public.image_analyses
  FOR SELECT
  USING (true);

-- Public insert access (anyone can create analyses)
CREATE POLICY "Anyone can create analyses"
  ON public.image_analyses
  FOR INSERT
  WITH CHECK (true);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_image_analyses_updated_at
  BEFORE UPDATE ON public.image_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for uploaded images
INSERT INTO storage.buckets (id, name, public)
VALUES ('image-analyses', 'image-analyses', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for public access
CREATE POLICY "Public can upload images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'image-analyses');

CREATE POLICY "Public can view images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'image-analyses');