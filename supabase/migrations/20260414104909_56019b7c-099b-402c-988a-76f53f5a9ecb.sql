-- 1. Fix newsletter DELETE policy — restrict to matching email via authenticated user's email
DROP POLICY IF EXISTS "Subscribers can delete own subscription" ON public.newsletter_subscribers;
CREATE POLICY "Subscribers can delete own subscription"
  ON public.newsletter_subscribers
  FOR DELETE
  USING (email = auth.jwt()->>'email');

-- 2. Protect user_roles from unauthorized writes (admin-only)
CREATE POLICY "Only admins can insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
  ON public.user_roles
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));