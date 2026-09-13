import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, LayoutDashboard, LogOut, Package, Tags } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { claimFirstAdmin, getAdminSession } from "@/lib/admin.functions";
import { highestRoleLabel, isStaff } from "@/lib/auth.types";
import { cn } from "@/lib/utils";

export const adminSessionQuery = {
  queryKey: ["admin-session"],
  queryFn: () => getAdminSession(),
} as const;

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package, exact: false },
  { to: "/admin/categories", label: "Categories", icon: Tags, exact: false },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes, exact: false },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session, isPending, isError, error } = useQuery(adminSessionQuery);

  const claim = useMutation({
    mutationFn: () => claimFirstAdmin(),
    onSuccess: async (result) => {
      if (result.claimed) {
        toast.success("You are now the Super Admin of this store.");
        await queryClient.invalidateQueries({ queryKey: ["admin-session"] });
      } else {
        toast.error("Staff accounts already exist — ask an admin to grant you a role.");
      }
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: {}, replace: true });
  }

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Checking your access…
      </div>
    );
  }

  if (isError) {
    return (
      <AccessShell title="We could not check your access">
        <p className="mt-4 text-sm text-muted-foreground">{(error as Error).message}</p>
        <Button variant="outlineHero" size="editorial" className="mt-8" onClick={signOut}>
          Sign out
        </Button>
      </AccessShell>
    );
  }

  if (!session || !isStaff(session.roles)) {
    return (
      <AccessShell title="No back-office access">
        <p className="mt-4 text-sm text-muted-foreground">
          You are signed in as {session?.email ?? "an unknown account"}, but this account has no staff
          role yet.
        </p>
        {session?.canClaimFirstAdmin && (
          <>
            <p className="mt-6 text-sm text-muted-foreground">
              No staff accounts exist yet, so you can claim ownership of this store.
            </p>
            <Button
              variant="hero"
              size="editorial"
              className="mt-6"
              disabled={claim.isPending}
              onClick={() => claim.mutate()}
            >
              {claim.isPending ? "Claiming…" : "Claim Super Admin access"}
            </Button>
          </>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outlineHero" size="editorial">
            <Link to="/">Back to the store</Link>
          </Button>
          <Button variant="ghost" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </AccessShell>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto flex max-w-[1500px] flex-col lg:flex-row">
        <aside className="border-b border-border bg-background lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-6 py-6">
            <Link to="/">
              <Logo className="text-lg" />
            </Link>
            <ThemeToggle />
          </div>

          <nav className="flex gap-1 overflow-x-auto px-4 pb-4 lg:flex-col lg:overflow-visible">
            {NAV.map(({ to, label, icon: Icon, exact }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact }}
                className="shrink-0 rounded-sm px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                activeProps={{ className: cn("bg-surface !text-foreground") }}
              >
                <span className="flex items-center gap-3">
                  <Icon className="size-4" />
                  {label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="hidden px-6 py-6 lg:block">
            <p className="label-eyebrow text-muted-foreground">Signed in</p>
            <p className="mt-2 truncate text-sm">{session.email}</p>
            <p className="mt-1 text-xs text-accent">{highestRoleLabel(session.roles)}</p>
            <Button variant="ghost" className="mt-4 px-0 text-muted-foreground" onClick={signOut}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </aside>

        <main className="flex-1 px-6 py-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AccessShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="max-w-md text-center">
        <h1 className="display-md">{title}</h1>
        {children}
      </div>
    </div>
  );
}
