
-- rewards_ledger: admin-only writes
CREATE POLICY "admin insert ledger" ON public.rewards_ledger
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update ledger" ON public.rewards_ledger
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete ledger" ON public.rewards_ledger
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- user_roles: admin-only writes
CREATE POLICY "admin insert roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update roles" ON public.user_roles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- profiles: prevent users from changing their own points via trigger
CREATE OR REPLACE FUNCTION public.prevent_points_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.points IS DISTINCT FROM OLD.points AND NOT public.has_role(auth.uid(), 'admin') THEN
    -- Only allow if invoked from the rewards_ledger recompute trigger (no auth.uid())
    IF auth.uid() IS NOT NULL THEN
      RAISE EXCEPTION 'points can only be modified through the rewards ledger';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.prevent_points_self_update() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS profiles_prevent_points_self_update ON public.profiles;
CREATE TRIGGER profiles_prevent_points_self_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_points_self_update();

-- Lock down trigger helper functions from direct user execution
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recompute_points() FROM PUBLIC, anon, authenticated;
