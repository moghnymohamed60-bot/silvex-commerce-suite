-- These helpers back the RLS policies, so `authenticated` must keep EXECUTE.
-- Nothing signed-out should be able to probe them.
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_staff(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_manage_catalog(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_manage_roles(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_manage_catalog(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_manage_roles(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;