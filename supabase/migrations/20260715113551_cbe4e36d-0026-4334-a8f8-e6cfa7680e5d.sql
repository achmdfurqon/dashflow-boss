
-- 1. Add missing INSERT policy on profiles (users can only insert their own)
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 2. Tighten write access on reference tables to admin role only
-- ref_disposisi
DROP POLICY IF EXISTS "Users can insert ref_disposisi" ON public.ref_disposisi;
DROP POLICY IF EXISTS "Users can update ref_disposisi" ON public.ref_disposisi;
DROP POLICY IF EXISTS "Users can delete ref_disposisi" ON public.ref_disposisi;

CREATE POLICY "Admins can insert ref_disposisi"
ON public.ref_disposisi FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update ref_disposisi"
ON public.ref_disposisi FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete ref_disposisi"
ON public.ref_disposisi FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ref_eviden
DROP POLICY IF EXISTS "Users can insert ref_eviden" ON public.ref_eviden;
DROP POLICY IF EXISTS "Users can update ref_eviden" ON public.ref_eviden;
DROP POLICY IF EXISTS "Users can delete ref_eviden" ON public.ref_eviden;

CREATE POLICY "Admins can insert ref_eviden"
ON public.ref_eviden FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update ref_eviden"
ON public.ref_eviden FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete ref_eviden"
ON public.ref_eviden FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ref_kategori_eviden
DROP POLICY IF EXISTS "Users can insert ref_kategori_eviden" ON public.ref_kategori_eviden;
DROP POLICY IF EXISTS "Users can update ref_kategori_eviden" ON public.ref_kategori_eviden;
DROP POLICY IF EXISTS "Users can delete ref_kategori_eviden" ON public.ref_kategori_eviden;

CREATE POLICY "Admins can insert ref_kategori_eviden"
ON public.ref_kategori_eviden FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update ref_kategori_eviden"
ON public.ref_kategori_eviden FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete ref_kategori_eviden"
ON public.ref_kategori_eviden FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ref_program
DROP POLICY IF EXISTS "Users can insert ref_program" ON public.ref_program;
DROP POLICY IF EXISTS "Users can update ref_program" ON public.ref_program;
DROP POLICY IF EXISTS "Users can delete ref_program" ON public.ref_program;

CREATE POLICY "Admins can insert ref_program"
ON public.ref_program FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update ref_program"
ON public.ref_program FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete ref_program"
ON public.ref_program FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
