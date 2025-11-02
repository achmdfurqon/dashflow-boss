-- Add RLS policies for INSERT, UPDATE, and DELETE on ref_disposisi
CREATE POLICY "Users can insert ref_disposisi"
ON public.ref_disposisi
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update ref_disposisi"
ON public.ref_disposisi
FOR UPDATE
USING (true);

CREATE POLICY "Users can delete ref_disposisi"
ON public.ref_disposisi
FOR DELETE
USING (true);