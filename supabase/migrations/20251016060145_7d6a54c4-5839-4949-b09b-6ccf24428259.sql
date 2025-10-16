-- Add fields to match POK structure from PDF
ALTER TABLE public.pok 
ADD COLUMN IF NOT EXISTS volume TEXT,
ADD COLUMN IF NOT EXISTS satuan TEXT,
ADD COLUMN IF NOT EXISTS harga NUMERIC,
ADD COLUMN IF NOT EXISTS versi INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS tanggal_versi TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for version queries
CREATE INDEX IF NOT EXISTS idx_pok_user_versi ON public.pok(user_id, versi DESC, tanggal_versi DESC);