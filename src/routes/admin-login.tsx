import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Staff Sign In | Silvex Furniture" },
      {
        name: "description",
        content: "Sign in to the Silvex staff back office.",
      },
      { property: "og:title", content: "Staff Sign In | Silvex Furniture" },
      { property: "og:description", content: "Silvex staff back office access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  // Already signed in — go straight to the dashboard.
  useEffect(() => {
    let cancelled = false;
    void supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      if (data.user) {
        navigate({ to: "/admin", replace: true });
      } else {
        setChecking(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    });
    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
    navigate({ to: "/admin", replace: true });
  }

  if (checking) {
    return <div className="min-h-[70vh]" aria-hidden />;
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Logo />
          <p className="label-eyebrow mt-8">Staff only</p>
          <h1 className="display-md mt-2">Back office sign in</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Sign in with your staff account to manage products, categories and inventory. If this is
            the first staff account on this store, you can claim owner access after signing in.
          </p>
        </div>

        <form onSubmit={handleSignIn} className="mt-10 space-y-5 border border-border p-8">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input id="admin-email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <Button type="submit" variant="hero" size="editorial" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in to dashboard"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Roles and permissions are checked on every action, not just at this page — signing in here
          never grants access by itself.
        </p>
      </div>
    </div>
  );
}
