-- Create ref_kategori_eviden table for evidence categories
CREATE TABLE public.ref_kategori_eviden (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  kategori_eviden TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.ref_kategori_eviden ENABLE ROW LEVEL SECURITY;

-- Create policies for ref_kategori_eviden
CREATE POLICY "Anyone can view ref_kategori_eviden" 
ON public.ref_kategori_eviden 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert ref_kategori_eviden" 
ON public.ref_kategori_eviden 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update ref_kategori_eviden" 
ON public.ref_kategori_eviden 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete ref_kategori_eviden" 
ON public.ref_kategori_eviden 
FOR DELETE 
USING (true);

-- Create ref_program table for program names
CREATE TABLE public.ref_program (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  nama_program TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.ref_program ENABLE ROW LEVEL SECURITY;

-- Create policies for ref_program
CREATE POLICY "Anyone can view ref_program" 
ON public.ref_program 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert ref_program" 
ON public.ref_program 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update ref_program" 
ON public.ref_program 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete ref_program" 
ON public.ref_program 
FOR DELETE 
USING (true);

-- Add id_ref_kategori to eviden table
ALTER TABLE public.eviden 
ADD COLUMN id_ref_kategori UUID REFERENCES public.ref_kategori_eviden(id);

-- Add id_ref_program to pok table
ALTER TABLE public.pok 
ADD COLUMN id_ref_program UUID REFERENCES public.ref_program(id);