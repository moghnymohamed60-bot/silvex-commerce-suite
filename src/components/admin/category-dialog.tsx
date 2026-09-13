import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { adminSaveCategory } from "@/lib/admin.functions";
import type { Category } from "@/lib/catalog.types";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryDialog({ open, onOpenChange, category }: CategoryDialogProps) {
  const queryClient = useQueryClient();
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [active, setActive] = useState(category?.is_active ?? true);

  const save = useMutation({
    mutationFn: (input: Parameters<typeof adminSaveCategory>[0]) => adminSaveCategory(input),
    onSuccess: async () => {
      toast.success(category ? "Category updated" : "Category created");
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "").trim();
    const optional = (key: string) => (text(key) === "" ? null : text(key));

    save.mutate({
      data: {
        ...(category ? { id: category.id } : {}),
        name: text("name"),
        slug: slug || slugify(text("name")),
        description: optional("description"),
        image_url: optional("image_url"),
        sort_order: Number(text("sort_order") || 0),
        is_active: active,
        seo_title: optional("seo_title"),
        seo_description: optional("seo_description"),
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{category ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>
            Disabled categories stay hidden from the storefront navigation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              name="name"
              defaultValue={category?.name ?? ""}
              required
              onChange={(event) => {
                if (!category) setSlug(slugify(event.target.value));
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-slug">URL slug</Label>
            <Input id="cat-slug" value={slug} onChange={(event) => setSlug(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-description">Description</Label>
            <Textarea
              id="cat-description"
              name="description"
              rows={3}
              defaultValue={category?.description ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-image">Image path</Label>
            <Input
              id="cat-image"
              name="image_url"
              defaultValue={category?.image_url ?? ""}
              placeholder="/images/products/halden-sofa.jpg"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cat-sort">Sort order</Label>
              <Input
                id="cat-sort"
                name="sort_order"
                type="number"
                min="0"
                defaultValue={category?.sort_order ?? 0}
              />
            </div>
            <label className="flex items-end gap-3 pb-2 text-sm">
              <Switch checked={active} onCheckedChange={setActive} />
              Visible on the storefront
            </label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-seo-title">SEO title</Label>
            <Input id="cat-seo-title" name="seo_title" defaultValue={category?.seo_title ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-seo-description">SEO description</Label>
            <Textarea
              id="cat-seo-description"
              name="seo_description"
              rows={2}
              defaultValue={category?.seo_description ?? ""}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
