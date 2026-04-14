
CREATE TABLE public.api_call_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id UUID REFERENCES public.developers(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'POST',
  status_code INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_api_call_logs_developer_id ON public.api_call_logs(developer_id);
CREATE INDEX idx_api_call_logs_created_at ON public.api_call_logs(created_at);

ALTER TABLE public.api_call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Devs can view own API logs"
  ON public.api_call_logs FOR SELECT
  USING (developer_id IN (
    SELECT id FROM developers WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Service role can insert API logs"
  ON public.api_call_logs FOR INSERT
  WITH CHECK (developer_id IN (
    SELECT id FROM developers WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Admins can view all API logs"
  ON public.api_call_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'));
