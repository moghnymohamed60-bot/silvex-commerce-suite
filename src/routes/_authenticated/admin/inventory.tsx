import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminAdjustStock, adminListProducts, adminListStockMovements } from "@/lib/admin.functions";
import { adminSessionQuery } from "@/routes/_authenticated/admin/route";
import { canManageCatalog } from "@/lib/auth.types";
import type { Product } from "@/lib/catalog.types";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/inventory")({
  component: AdminInventory,
});

const REASONS = ["restock", "adjustment", "damage", "return", "stocktake"] as const;

function AdminInventory() {
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [adjusting, setAdjusting] = useState<Product | null>(null);

  const session = useQuery(adminSessionQuery);
  const mayAdjust = canManageCatalog(session.data?.roles ?? []);

  const filters = lowStockOnly ? { lowStockOnly: true } : {};
  const products = useQuery({
    queryKey: ["admin-products", filters],
    queryFn: () => adminListProducts({ data: filters }),
  });
  const movements = useQuery({
    queryKey: ["admin-movements", {}],
    queryFn: () => adminListStockMovements({ data: {} }),
  });

  const items = products.data ?? [];

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-eyebrow text-muted-foreground">Operations</p>
          <h1 className="display-md mt-3">Inventory</h1>
        </div>
        <Button variant="outline" onClick={() => setLowStockOnly((value) => !value)}>
          {lowStockOnly ? "Show all products" : "Show low stock only"}
        </Button>
      </header>

      <div className="mt-8 border border-border bg-background">
        {products.isPending ? (
          <p className="p-8 text-sm text-muted-foreground">Loading stock levels…</p>
        ) : products.isError ? (
          <p className="p-8 text-sm text-destructive">{(products.error as Error).message}</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-sm text-muted-foreground">Nothing to show here.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">On hand</TableHead>
                <TableHead className="text-right">Threshold</TableHead>
                <TableHead className="text-right">Stock value</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="max-w-[240px] truncate">{product.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{product.sku}</TableCell>
                  <TableCell
                    className={
                      product.stock_quantity <= product.low_stock_threshold
                        ? "text-right text-accent"
                        : "text-right"
                    }
                  >
                    {product.stock_quantity}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {product.low_stock_threshold}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(Number(product.price) * product.stock_quantity)}
                  </TableCell>
                  <TableCell className="text-right">
                    {mayAdjust && (
                      <Button variant="ghost" onClick={() => setAdjusting(product)}>
                        Adjust
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <section className="mt-10">
        <h2 className="label-eyebrow text-muted-foreground">Stock movement history</h2>
        <div className="mt-4 border border-border bg-background">
          {(movements.data ?? []).length === 0 ? (
            <p className="p-8 text-sm text-muted-foreground">No stock adjustments recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead className="text-right">Resulting</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(movements.data ?? []).map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(movement.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {movement.products?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs uppercase tracking-wider text-muted-foreground">
                      {movement.reason}
                    </TableCell>
                    <TableCell
                      className={movement.delta > 0 ? "text-right text-accent" : "text-right text-destructive"}
                    >
                      {movement.delta > 0 ? "+" : ""}
                      {movement.delta}
                    </TableCell>
                    <TableCell className="text-right">{movement.resulting_quantity}</TableCell>
                    <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">
                      {movement.note ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>

      {adjusting && (
        <AdjustDialog product={adjusting} onClose={() => setAdjusting(null)} />
      )}
    </div>
  );
}

function AdjustDialog({ product, onClose }: { product: Product; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState<(typeof REASONS)[number]>("restock");

  const adjust = useMutation({
    mutationFn: (input: { delta: number; note?: string }) =>
      adminAdjustStock({
        data: {
          productId: product.id,
          delta: input.delta,
          reason,
          ...(input.note ? { note: input.note } : {}),
        },
      }),
    onSuccess: async (result) => {
      toast.success(`${product.name} is now at ${result.stock_quantity} units`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-movements"] }),
      ]);
      onClose();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const delta = Number(String(form.get("delta") ?? "0"));
    if (!Number.isInteger(delta) || delta === 0) {
      toast.error("Enter a whole number other than zero.");
      return;
    }
    const note = String(form.get("note") ?? "").trim();
    adjust.mutate({ delta, ...(note ? { note } : {}) });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>
            {product.name} currently has {product.stock_quantity} units on hand. Use a negative number
            to remove stock.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="delta">Change in units</Label>
            <Input id="delta" name="delta" type="number" step="1" placeholder="e.g. 12 or -3" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Select value={reason} onValueChange={(value) => setReason(value as typeof reason)}>
              <SelectTrigger id="reason">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" name="note" placeholder="Delivery reference, damage detail…" />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={adjust.isPending}>
              {adjust.isPending ? "Saving…" : "Record adjustment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
