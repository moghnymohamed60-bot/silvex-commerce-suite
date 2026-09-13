import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ProductDialog } from "@/components/admin/product-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminSessionQuery } from "@/routes/_authenticated/admin/route";
import {
  adminDeleteProduct,
  adminListCategories,
  adminListProducts,
} from "@/lib/admin.functions";
import { canManageCatalog } from "@/lib/auth.types";
import type { Product } from "@/lib/catalog.types";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const session = useQuery(adminSessionQuery);
  const mayEdit = canManageCatalog(session.data?.roles ?? []);

  const filters = {
    ...(search ? { search } : {}),
    ...(status !== "all" ? { status: status as "draft" | "active" | "archived" | "out_of_stock" } : {}),
  };

  const products = useQuery({
    queryKey: ["admin-products", filters],
    queryFn: () => adminListProducts({ data: filters }),
  });
  const categories = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => adminListCategories(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteProduct({ data: { id } }),
    onSuccess: async () => {
      toast.success("Product deleted");
      setDeleting(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-eyebrow text-muted-foreground">Catalogue</p>
          <h1 className="display-md mt-3">Products</h1>
        </div>
        {mayEdit && (
          <Button
            variant="hero"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus /> New product
          </Button>
        )}
      </header>

      <div className="mt-8 flex flex-wrap gap-3">
        <Input
          placeholder="Search name or SKU"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="out_of_stock">Out of stock</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 border border-border bg-background">
        {products.isPending ? (
          <p className="p-8 text-sm text-muted-foreground">Loading products…</p>
        ) : products.isError ? (
          <p className="p-8 text-sm text-destructive">{(products.error as Error).message}</p>
        ) : (products.data ?? []).length === 0 ? (
          <p className="p-8 text-sm text-muted-foreground">No products match those filters.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(products.data ?? []).map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="max-w-[240px] truncate">{product.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{product.sku}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {product.categories?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">{formatPrice(Number(product.price))}</TableCell>
                  <TableCell
                    className={
                      product.stock_quantity <= product.low_stock_threshold
                        ? "text-right text-accent"
                        : "text-right"
                    }
                  >
                    {product.stock_quantity}
                  </TableCell>
                  <TableCell className="text-xs uppercase tracking-wider text-muted-foreground">
                    {product.status.replace("_", " ")}
                  </TableCell>
                  <TableCell>
                    {mayEdit && (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${product.name}`}
                          onClick={() => {
                            setEditing(product);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${product.name}`}
                          onClick={() => setDeleting(product)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {dialogOpen && (
        <ProductDialog
          key={editing?.id ?? "new"}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          product={editing}
          categories={categories.data ?? []}
        />
      )}

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the product and its stock history. It cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                if (deleting) remove.mutate(deleting.id);
              }}
            >
              {remove.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
