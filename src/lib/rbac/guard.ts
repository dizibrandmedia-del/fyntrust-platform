import { UserSession } from "../types/auth";
import { Permission, ROLE_PERMISSIONS } from "../types/rbac";
import { ForbiddenError } from "../errors/app-error";

export function hasPermission(session: UserSession, permission: Permission): boolean {
  if (!session || !session.role) return false;
  if (session.role === "SUPER_ADMIN") return true;

  const permissions = ROLE_PERMISSIONS[session.role] || [];
  return permissions.includes(permission);
}

export function hasAnyPermission(session: UserSession, permissions: Permission[]): boolean {
  if (!session || !session.role) return false;
  if (session.role === "SUPER_ADMIN") return true;

  return permissions.some((perm) => hasPermission(session, perm));
}

export function assertPermission(session: UserSession, permission: Permission): void {
  if (!hasPermission(session, permission)) {
    throw new ForbiddenError(`You lack the required permission: [${permission}]`);
  }
}
