-- Staff role vocabulary. Roles are stored in their own table (never on profiles)
-- so a compromised profile update can never escalate privileges.
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'manager', 'staff');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT, INSERT, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER so policies can read user_roles without recursing into its own RLS.
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Any back-office access at all.
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;

-- Write access to catalogue and stock: manager and above.
CREATE OR REPLACE FUNCTION public.can_manage_catalog(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin', 'manager')
  )
$$;

-- Role administration: admin and above.
CREATE OR REPLACE FUNCTION public.can_manage_roles(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin')
  )
$$;

-- Bootstrap: the very first signed-in account may claim super_admin. Once any
-- role row exists this becomes a no-op, so it cannot be used to escalate later.
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RETURN false;
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_roles) THEN
    RETURN false;
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'super_admin');
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_first_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Staff can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Role admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.can_manage_roles(auth.uid()));

CREATE POLICY "Role admins can grant roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_roles(auth.uid()));

CREATE POLICY "Role admins can revoke roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.can_manage_roles(auth.uid()));

CREATE TABLE public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL DEFAULT 'adjustment',
  note TEXT,
  resulting_quantity INTEGER NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX inventory_movements_product_idx ON public.inventory_movements (product_id, created_at DESC);

GRANT SELECT, INSERT ON public.inventory_movements TO authenticated;
GRANT ALL ON public.inventory_movements TO service_role;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view stock movements"
  ON public.inventory_movements FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Catalog managers can record stock movements"
  ON public.inventory_movements FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_catalog(auth.uid()) AND created_by = auth.uid());

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs (created_at DESC);

GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Role admins can view audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (public.can_manage_roles(auth.uid()));

CREATE POLICY "Staff can write audit logs"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND actor_id = auth.uid());

-- Back-office catalogue access.
CREATE POLICY "Staff can view all products"
  ON public.products FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Catalog managers can create products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_catalog(auth.uid()));

CREATE POLICY "Catalog managers can update products"
  ON public.products FOR UPDATE TO authenticated
  USING (public.can_manage_catalog(auth.uid()))
  WITH CHECK (public.can_manage_catalog(auth.uid()));

CREATE POLICY "Catalog managers can delete products"
  ON public.products FOR DELETE TO authenticated
  USING (public.can_manage_catalog(auth.uid()));

CREATE POLICY "Staff can view all categories"
  ON public.categories FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Catalog managers can create categories"
  ON public.categories FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_catalog(auth.uid()));

CREATE POLICY "Catalog managers can update categories"
  ON public.categories FOR UPDATE TO authenticated
  USING (public.can_manage_catalog(auth.uid()))
  WITH CHECK (public.can_manage_catalog(auth.uid()));

CREATE POLICY "Catalog managers can delete categories"
  ON public.categories FOR DELETE TO authenticated
  USING (public.can_manage_catalog(auth.uid()));

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();