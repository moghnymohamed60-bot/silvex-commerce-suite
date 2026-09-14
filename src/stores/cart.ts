import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Product } from "@/lib/catalog.types";

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  price: number;
  image: string;
  quantity: number;
  maxQuantity: number;
}

const FREE_SHIPPING_THRESHOLD = 35000;
const STANDARD_SHIPPING = 3500;
const TAX_RATE = 0.08;

interface CartState {
  lines: CartLine[];
  addLine: (product: Product, quantity?: number) => void;
  removeLine: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      addLine: (product, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((line) => line.productId === product.id);
          const max = Math.max(product.stock_quantity, 1);

          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.productId === product.id
                  ? { ...line, quantity: Math.min(line.quantity + quantity, max) }
                  : line,
              ),
            };
          }

          return {
            lines: [
              ...state.lines,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                sku: product.sku,
                price: Number(product.price),
                image: product.images[0] ?? "",
                quantity: Math.min(quantity, max),
                maxQuantity: max,
              },
            ],
          };
        }),
      removeLine: (productId) =>
        set((state) => ({ lines: state.lines.filter((line) => line.productId !== productId) })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          lines: state.lines
            .map((line) =>
              line.productId === productId
                ? { ...line, quantity: Math.min(Math.max(quantity, 0), line.maxQuantity) }
                : line,
            )
            .filter((line) => line.quantity > 0),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: "silvex-cart" },
  ),
);

interface CartUiState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
}

export const useCartUi = create<CartUiState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setOpen: (isOpen) => set({ isOpen }),
}));

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  freeShippingRemaining: number;
}

export function cartTotals(lines: CartLine[]): CartTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;

  return {
    itemCount,
    subtotal,
    shipping,
    tax,
    total: subtotal + shipping + tax,
    freeShippingRemaining: Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0),
  };
}

export { FREE_SHIPPING_THRESHOLD };
