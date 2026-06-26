DROP POLICY IF EXISTS "view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "admin insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "admin update roles" ON public.user_roles;
DROP POLICY IF EXISTS "admin delete roles" ON public.user_roles;
CREATE POLICY "view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "view own profile" ON public.profiles;
CREATE POLICY "view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "view own or admin" ON public.orders;
DROP POLICY IF EXISTS "admin update orders" ON public.orders;
CREATE POLICY "view own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "view own ledger or admin" ON public.rewards_ledger;
DROP POLICY IF EXISTS "admin insert ledger" ON public.rewards_ledger;
DROP POLICY IF EXISTS "admin update ledger" ON public.rewards_ledger;
DROP POLICY IF EXISTS "admin delete ledger" ON public.rewards_ledger;
CREATE POLICY "view own rewards ledger"
ON public.rewards_ledger
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.prevent_points_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.points IS DISTINCT FROM OLD.points AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'points can only be modified through the rewards ledger';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.prevent_points_self_update() FROM PUBLIC, anon, authenticated;