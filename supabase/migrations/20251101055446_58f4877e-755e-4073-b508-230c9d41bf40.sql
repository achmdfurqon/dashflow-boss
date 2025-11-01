-- Create ref_disposisi table
CREATE TABLE public.ref_disposisi (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  nama_disposisi TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE public.ref_disposisi ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing
CREATE POLICY "Anyone can view ref_disposisi" 
ON public.ref_disposisi 
FOR SELECT 
USING (true);

-- Alter kegiatan table to change disposisi to text array
ALTER TABLE public.kegiatan 
ALTER COLUMN disposisi TYPE TEXT[] USING 
  CASE 
    WHEN disposisi IS NULL THEN NULL 
    ELSE ARRAY[disposisi]::TEXT[]
  END;