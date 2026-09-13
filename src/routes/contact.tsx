import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact the Studio | Silvex Furniture" },
      {
        name: "description",
        content:
          "Speak to a Silvex design advisor about materials, lead times, samples or an existing order.",
      },
      { property: "og:title", content: "Contact the Studio | Silvex Furniture" },
      { property: "og:description", content: "Talk to a Silvex design advisor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    const next: Record<string, string> = {};
    if (name.length < 2) next["name"] = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next["email"] = "Enter a valid email address.";
    if (message.length < 10) next["message"] = "A little more detail helps us answer properly.";
    setErrors(next);

    if (Object.keys(next).length === 0) {
      toast.info("Message sending isn't connected yet — email hello@silvexfurniture.com for now.");
    }
  }

  return (
    <div className="container-page py-16">
      <header className="max-w-2xl">
        <p className="label-eyebrow text-muted-foreground">Contact</p>
        <h1 className="display-lg mt-4">Talk to the studio</h1>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          Questions about materials, lead times, samples or an order in progress? A design advisor
          will come back to you within one business day.
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} noValidate className="max-w-xl space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" autoComplete="name" aria-invalid={!!errors["name"]} />
            {errors["name"] && <p className="text-xs text-destructive">{errors["name"]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!errors["email"]} />
            {errors["email"] && <p className="text-xs text-destructive">{errors["email"]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">How can we help?</Label>
            <Textarea id="message" name="message" rows={6} aria-invalid={!!errors["message"]} />
            {errors["message"] && <p className="text-xs text-destructive">{errors["message"]}</p>}
          </div>
          <Button type="submit" variant="hero" size="editorial">
            Send message
          </Button>
        </form>

        <aside className="h-fit border border-border p-6 text-sm">
          <h2 className="label-eyebrow text-muted-foreground">Studio</h2>
          <ul className="mt-5 space-y-4 text-muted-foreground">
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0" />
              hello@silvexfurniture.com
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0" />
              +1 (555) 240 8890
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              18 Kilnwood Lane, Portland, OR
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0" />
              Mon–Fri, 9am–6pm PT
            </li>
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">
            These studio details are placeholders — send us your real contact information and we will
            swap them in.
          </p>
        </aside>
      </div>
    </div>
  );
}
