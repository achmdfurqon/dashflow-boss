-- Create kegiatan (activities) table
CREATE TABLE public.kegiatan (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('internal', 'external')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location TEXT NOT NULL,
  organizer TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'ongoing', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create POK (budget items) table
CREATE TABLE public.pok (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_amount NUMERIC(15,2) NOT NULL,
  used_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pencairan (disbursements) table
CREATE TABLE public.pencairan (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pok_id UUID REFERENCES public.pok(id) ON DELETE SET NULL,
  request_number TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  request_date DATE NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create eviden (evidence documents) table
CREATE TABLE public.eviden (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kegiatan_id UUID REFERENCES public.kegiatan(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('proposal', 'report', 'invoice', 'photo', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create media (photos/materials) table
CREATE TABLE public.media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kegiatan_id UUID REFERENCES public.kegiatan(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT NOT NULL CHECK (file_type IN ('photo', 'document', 'video')),
  upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.kegiatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pok ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pencairan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eviden ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kegiatan
CREATE POLICY "Users can view their own kegiatan"
  ON public.kegiatan FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own kegiatan"
  ON public.kegiatan FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own kegiatan"
  ON public.kegiatan FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own kegiatan"
  ON public.kegiatan FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for pok
CREATE POLICY "Users can view their own pok"
  ON public.pok FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pok"
  ON public.pok FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pok"
  ON public.pok FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pok"
  ON public.pok FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for pencairan
CREATE POLICY "Users can view their own pencairan"
  ON public.pencairan FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pencairan"
  ON public.pencairan FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pencairan"
  ON public.pencairan FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pencairan"
  ON public.pencairan FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for eviden
CREATE POLICY "Users can view their own eviden"
  ON public.eviden FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own eviden"
  ON public.eviden FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own eviden"
  ON public.eviden FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own eviden"
  ON public.eviden FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for media
CREATE POLICY "Users can view their own media"
  ON public.media FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own media"
  ON public.media FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media"
  ON public.media FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media"
  ON public.media FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_kegiatan_updated_at
  BEFORE UPDATE ON public.kegiatan
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pok_updated_at
  BEFORE UPDATE ON public.pok
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pencairan_updated_at
  BEFORE UPDATE ON public.pencairan
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_kegiatan_user_id ON public.kegiatan(user_id);
CREATE INDEX idx_kegiatan_dates ON public.kegiatan(start_date, end_date);
CREATE INDEX idx_pok_user_id ON public.pok(user_id);
CREATE INDEX idx_pencairan_user_id ON public.pencairan(user_id);
CREATE INDEX idx_pencairan_pok_id ON public.pencairan(pok_id);
CREATE INDEX idx_eviden_user_id ON public.eviden(user_id);
CREATE INDEX idx_eviden_kegiatan_id ON public.eviden(kegiatan_id);
CREATE INDEX idx_media_user_id ON public.media(user_id);
CREATE INDEX idx_media_kegiatan_id ON public.media(kegiatan_id);