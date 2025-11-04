-- Create menu permissions table for dynamic role-based access control
CREATE TABLE public.menu_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  menu_key TEXT NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, menu_key)
);

-- Enable RLS
ALTER TABLE public.menu_permissions ENABLE ROW LEVEL SECURITY;

-- Only admins can view all permissions
CREATE POLICY "Admins can view all permissions"
ON public.menu_permissions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can manage permissions
CREATE POLICY "Admins can insert permissions"
ON public.menu_permissions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update permissions"
ON public.menu_permissions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete permissions"
ON public.menu_permissions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default permissions for each role and menu
INSERT INTO public.menu_permissions (role, menu_key, can_view, can_create, can_edit, can_delete) VALUES
-- Admin permissions (full access)
('admin', 'dashboard', true, true, true, true),
('admin', 'kegiatan', true, true, true, true),
('admin', 'pok', true, true, true, true),
('admin', 'pencairan', true, true, true, true),
('admin', 'eviden', true, true, true, true),
('admin', 'akun', true, true, true, true),

-- Staf Keuangan permissions
('staf_keuangan', 'dashboard', true, false, false, false),
('staf_keuangan', 'kegiatan', true, true, true, true),
('staf_keuangan', 'pok', true, true, true, true),
('staf_keuangan', 'pencairan', true, true, true, true),
('staf_keuangan', 'eviden', true, true, true, true),
('staf_keuangan', 'akun', false, false, false, false),

-- Staf Biasa permissions
('staf_biasa', 'dashboard', true, false, false, false),
('staf_biasa', 'kegiatan', true, true, true, false),
('staf_biasa', 'pok', false, false, false, false),
('staf_biasa', 'pencairan', false, false, false, false),
('staf_biasa', 'eviden', true, true, false, false),
('staf_biasa', 'akun', false, false, false, false);

-- Add trigger for updated_at
CREATE TRIGGER update_menu_permissions_updated_at
BEFORE UPDATE ON public.menu_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();