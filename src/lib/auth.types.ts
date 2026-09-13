export type AppRole = "super_admin" | "admin" | "manager" | "staff";

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
};

export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  super_admin: "Full access, including staff roles and settings.",
  admin: "Manages the catalogue, stock and staff roles.",
  manager: "Manages products, categories and stock levels.",
  staff: "Read-only access to the back office.",
};

/**
 * Single source of truth for back-office permissions. Mirrors the database
 * policy helpers (can_manage_catalog / can_manage_roles) so the UI never offers
 * an action the database would reject.
 */
const CATALOG_ROLES: AppRole[] = ["super_admin", "admin", "manager"];
const ROLE_ADMIN_ROLES: AppRole[] = ["super_admin", "admin"];

export interface AdminSession {
  userId: string;
  email: string | null;
  fullName: string | null;
  roles: AppRole[];
  /** True when no staff account exists yet, so this account may claim ownership. */
  canClaimFirstAdmin: boolean;
}

export function isStaff(roles: AppRole[]): boolean {
  return roles.length > 0;
}

export function canManageCatalog(roles: AppRole[]): boolean {
  return roles.some((role) => CATALOG_ROLES.includes(role));
}

export function canManageRoles(roles: AppRole[]): boolean {
  return roles.some((role) => ROLE_ADMIN_ROLES.includes(role));
}

export function highestRoleLabel(roles: AppRole[]): string {
  const order: AppRole[] = ["super_admin", "admin", "manager", "staff"];
  const found = order.find((role) => roles.includes(role));
  return found ? ROLE_LABELS[found] : "No access";
}
