-- Add tahun column to pok table
ALTER TABLE public.pok ADD COLUMN tahun integer;

-- Make uraian optional (nullable)
ALTER TABLE public.pok ALTER COLUMN uraian DROP NOT NULL;

-- Change volume from text to integer
ALTER TABLE public.pok ALTER COLUMN volume TYPE integer USING CASE 
  WHEN volume ~ '^[0-9]+$' THEN volume::integer 
  ELSE NULL 
END;