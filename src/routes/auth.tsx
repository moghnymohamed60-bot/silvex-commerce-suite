import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  // Only same-origin relative paths are accepted, so the redirect cannot be
  // used to bounce a signed-in user to an external site.
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const value = search["redirect"];
    return typeof value === "string" && value.startsWith("/") ? { redirect: value } : {};
  },
  head: () => ({
    meta: [
      { title: "Sign In | Silvex Furniture" },
      {
        name: "description",
        content: "Sign in to your Silvex account or to the Silvex staff back office.",
      },
      { property: "og:title", content: "Sign In | Silvex Furniture" },
      { property: "og:description", content: "Access your Silvex account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

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
    navigate({ to: redirect ?? "/admin" });
  }

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password.length < 8) {
      toast.error("Use at least 8 characters for your password.");
      return;
    }

    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: String(form.get("email") ?? "").trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: String(form.get("full_name") ?? "").trim() },
      },
    });
    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      setNeedsConfirmation(true);
      return;
    }
    toast.success("Account created");
    navigate({ to: redirect ?? "/admin" });
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Logo />
          <p className="mt-6 text-sm text-muted-foreground">
            Sign in to your account, or to the Silvex back office.
          </p>
        </div>

        {needsConfirmation ? (
          <div className="mt-10 border border-border p-8 text-center">
            <h1 className="display-md">Check your inbox</h1>
            <p className="mt-4 text-sm text-muted-foreground">
              We sent you a confirmation link. Click it to activate your account, then come back and
              sign in.
            </p>
            <Button
              variant="outlineHero"
              size="editorial"
              className="mt-8"
              onClick={() => setNeedsConfirmation(false)}
            >
              Back to sign in
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="signin" className="mt-10">
            <TabsList className="w-full">
              <TabsTrigger value="signin" className="flex-1">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">
                Create account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-5 border border-border p-8">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" name="email" type="email" autoComplete="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <Button type="submit" variant="hero" size="editorial" className="w-full" disabled={busy}>
                  {busy ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-5 border border-border p-8">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full name</Label>
                  <Input id="signup-name" name="full_name" autoComplete="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" name="email" type="email" autoComplete="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <p className="text-xs text-muted-foreground">At least 8 characters.</p>
                </div>
                <Button type="submit" variant="hero" size="editorial" className="w-full" disabled={busy}>
                  {busy ? "Creating account…" : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
