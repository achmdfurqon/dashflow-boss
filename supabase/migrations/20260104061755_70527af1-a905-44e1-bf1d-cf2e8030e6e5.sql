-- Add missing RLS policies for ref_eviden table
CREATE POLICY "Users can insert ref_eviden" 
ON public.ref_eviden 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update ref_eviden" 
ON public.ref_eviden 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete ref_eviden" 
ON public.ref_eviden 
FOR DELETE 
USING (true);