export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "SALES"
  | "CA_FINANCE_EXPERT"
  | "ACCOUNTANT"
  | "LEGAL_PARTNER"
  | "VIRTUAL_CFO"
  | "CUSTOMER";

export interface UserSession {
  userId: string;
  email?: string | null;
  mobile?: string | null;
  fullName: string;
  role: UserRole;
  customerProfileId?: string | null;
  expertProfileId?: string | null;
}

export interface JWTPayload {
  sub: string; // userId
  email?: string | null;
  mobile?: string | null;
  fullName: string;
  role: UserRole;
  customerProfileId?: string | null;
  expertProfileId?: string | null;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: {
    id: string;
    email?: string | null;
    mobile?: string | null;
    fullName: string;
    role: UserRole;
    customerProfileId?: string | null;
    expertProfileId?: string | null;
  };
  token: string;
}
