
-- Fix: Replace overly permissive policy with service-role-only insert/update
DROP POLICY "Service role can manage review summaries" ON public.review_summaries;

-- Only allow inserts via service role (edge functions) - anon/authenticated can only read
CREATE POLICY "Allow insert for service role" ON public.review_summaries 
FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow update for service role" ON public.review_summaries 
FOR UPDATE USING (auth.role() = 'service_role');
