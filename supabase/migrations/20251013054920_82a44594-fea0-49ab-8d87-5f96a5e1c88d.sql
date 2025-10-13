-- Add title and year fields to eviden table
ALTER TABLE public.eviden 
ADD COLUMN title TEXT,
ADD COLUMN tahun INTEGER;

-- Update existing records to have a default title
UPDATE public.eviden 
SET title = 'Untitled Evidence' 
WHERE title IS NULL;