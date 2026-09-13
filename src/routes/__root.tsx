import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="label-eyebrow text-muted-foreground">404</p>
      <h1 className="display-lg mt-4">This page has been moved</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        The page you were looking for is no longer here. The collection is still waiting for you.
      </p>
      <Link
        to="/shop"
        className="label-eyebrow mt-8 border border-ink/30 px-8 py-4 transition-colors hover:bg-ink hover:text-ink-foreground"
      >
        Shop the collection
      </Link>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="display-lg">Something interrupted this page</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        We could not finish loading. Try again, or head back to the collection.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="label-eyebrow bg-ink px-8 py-4 text-ink-foreground transition-colors hover:bg-accent"
        >
          Try again
        </button>
        <a
          href="/"
          className="label-eyebrow border border-ink/30 px-8 py-4 transition-colors hover:bg-ink hover:text-ink-foreground"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Silvex Furniture — Premium Furniture for Modern Homes" },
      {
        name: "description",
        content:
          "Silvex Furniture designs premium sofas, beds, dining and outdoor furniture in solid timber, natural fibres and full-grain leather.",
      },
      { name: "author", content: "Silvex Furniture" },
      { property: "og:site_name", content: "Silvex Furniture" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Jost:wght@300;400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <SiteFooter />
      </div>
      <CartDrawer />
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}
