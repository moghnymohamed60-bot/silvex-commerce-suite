import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { CategoryDialog } from "@/components/admin/category-dialog";
import { Button } from "@/components/ui/button";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminDeleteCategory, adminListCategories } from "@/lib/admin.functions";
import { adminSessionQuery } from "@/routes/_authenticated/admin/route";
import { canManageCatalog } from "@/lib/auth.types";
import type { Category } from "@/lib/catalog.types";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const session = useQuery(adminSessionQuery);
  const mayEdit = canManageCatalog(session.data?.roles ?? []);

  const categories = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => adminListCategories(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteCategory({ data: { id } }),
    onSuccess: async () => {
      toast.success("Category deleted");
      setDeleting(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-eyebrow text-muted-foreground">Catalogue</p>
          <h1 className="display-md mt-3">Categories</h1>
        </div>
        {mayEdit && (
          <Button
            variant="hero"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus /> New category
          </Button>
        )}
      </header>

      <div className="mt-8 border border-border bg-background">
        {categories.isPending ? (
          <p className="p-8 text-sm text-muted-foreground">Loading categories…</p>
        ) : categories.isError ? (
          <p className="p-8 text-sm text-destructive">{(categories.error as Error).message}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Products</TableHead>
                <TableHead className="text-right">Order</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(categories.data ?? []).map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{category.slug}</TableCell>
                  <TableCell className="text-right">{category.product_count}</TableCell>
                  <TableCell className="text-right">{category.sort_order ?? 0}</TableCell>
                  <TableCell className="text-xs uppercase tracking-wider text-muted-foreground">
                    {category.is_active ? "Visible" : "Hidden"}
                  </TableCell>
                  <TableCell>
                    {mayEdit && (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${category.name}`}
                          onClick={() => {
                            setEditing(category);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${category.name}`}
                          onClick={() => setDeleting(category)}
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
        <CategoryDialog
          key={editing?.id ?? "new"}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          category={editing}
        />
      )}

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Categories that still contain products cannot be deleted.
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
