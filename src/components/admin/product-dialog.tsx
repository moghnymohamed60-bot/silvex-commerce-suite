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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminSaveProduct } from "@/lib/admin.functions";
import type { Category, Product } from "@/lib/catalog.types";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  categories: Category[];
}

const STATUSES = ["draft", "active", "archived", "out_of_stock"] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductDialog({ open, onOpenChange, product, categories }: ProductDialogProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(product?.status ?? "draft");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? categories[0]?.id ?? "");
  const [featured, setFeatured] = useState(product?.is_featured ?? false);
  const [bestseller, setBestseller] = useState(product?.is_bestseller ?? false);
  const [newArrival, setNewArrival] = useState(product?.is_new_arrival ?? false);
  const [slug, setSlug] = useState(product?.slug ?? "");

  const save = useMutation({
    mutationFn: (input: Parameters<typeof adminSaveProduct>[0]) => adminSaveProduct(input),
    onSuccess: async () => {
      toast.success(product ? "Product updated" : "Product created");
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "").trim();
    const optional = (key: string) => (text(key) === "" ? null : text(key));
    const optionalNumber = (key: string) => (text(key) === "" ? null : Number(text(key)));

    save.mutate({
      data: {
        ...(product ? { id: product.id } : {}),
        name: text("name"),
        slug: slug || slugify(text("name")),
        sku: text("sku"),
        description: text("description"),
        short_description: optional("short_description"),
        price: Number(text("price")),
        compare_at_price: optionalNumber("compare_at_price"),
        category_id: categoryId,
        collection: optional("collection"),
        material: optional("material"),
        color: optional("color"),
        dimensions: optional("dimensions"),
        weight_kg: optionalNumber("weight_kg"),
        stock_quantity: Number(text("stock_quantity") || 0),
        low_stock_threshold: Number(text("low_stock_threshold") || 5),
        status,
        is_featured: featured,
        is_bestseller: bestseller,
        is_new_arrival: newArrival,
        images: text("images")
          .split(/[\n,]/)
          .map((entry) => entry.trim())
          .filter(Boolean),
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "New product"}</DialogTitle>
          <DialogDescription>
            Prices are in USD. Draft products stay hidden from the storefront.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="name">
              <Input
                id="name"
                name="name"
                defaultValue={product?.name ?? ""}
                required
                onChange={(event) => {
                  if (!product) setSlug(slugify(event.target.value));
                }}
              />
            </Field>
            <Field label="URL slug" htmlFor="slug">
              <Input id="slug" value={slug} onChange={(event) => setSlug(event.target.value)} required />
            </Field>
            <Field label="SKU" htmlFor="sku">
              <Input id="sku" name="sku" defaultValue={product?.sku ?? ""} required />
            </Field>
            <Field label="Category" htmlFor="category">
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Price" htmlFor="price">
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={product?.price ?? ""}
                required
              />
            </Field>
            <Field label="Compare-at price" htmlFor="compare_at_price">
              <Input
                id="compare_at_price"
                name="compare_at_price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={product?.compare_at_price ?? ""}
              />
            </Field>
            <Field label="Stock quantity" htmlFor="stock_quantity">
              <Input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                min="0"
                defaultValue={product?.stock_quantity ?? 0}
              />
            </Field>
            <Field label="Low-stock threshold" htmlFor="low_stock_threshold">
              <Input
                id="low_stock_threshold"
                name="low_stock_threshold"
                type="number"
                min="0"
                defaultValue={product?.low_stock_threshold ?? 5}
              />
            </Field>
            <Field label="Collection" htmlFor="collection">
              <Input id="collection" name="collection" defaultValue={product?.collection ?? ""} />
            </Field>
            <Field label="Material" htmlFor="material">
              <Input id="material" name="material" defaultValue={product?.material ?? ""} />
            </Field>
            <Field label="Colour / finish" htmlFor="color">
              <Input id="color" name="color" defaultValue={product?.color ?? ""} />
            </Field>
            <Field label="Dimensions" htmlFor="dimensions">
              <Input id="dimensions" name="dimensions" defaultValue={product?.dimensions ?? ""} />
            </Field>
            <Field label="Weight (kg)" htmlFor="weight_kg">
              <Input
                id="weight_kg"
                name="weight_kg"
                type="number"
                min="0"
                step="0.1"
                defaultValue={product?.weight_kg ?? ""}
              />
            </Field>
            <Field label="Status" htmlFor="status">
              <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Short description" htmlFor="short_description">
            <Input
              id="short_description"
              name="short_description"
              defaultValue={product?.short_description ?? ""}
            />
          </Field>

          <Field label="Description" htmlFor="description">
            <Textarea id="description" name="description" rows={5} defaultValue={product?.description ?? ""} />
          </Field>

          <Field label="Image paths (one per line)" htmlFor="images">
            <Textarea
              id="images"
              name="images"
              rows={3}
              defaultValue={(product?.images ?? []).join("\n")}
              placeholder="/images/products/halden-sofa.jpg"
            />
          </Field>

          <div className="flex flex-wrap gap-8">
            <Toggle label="Featured" checked={featured} onChange={setFeatured} />
            <Toggle label="Best seller" checked={bestseller} onChange={setBestseller} />
            <Toggle label="New arrival" checked={newArrival} onChange={setNewArrival} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <Switch checked={checked} onCheckedChange={onChange} />
      {label}
    </label>
  );
}
