import { createContext, useContext, useState, type ReactNode } from "react";

export type Role = "volunteer" | "leader" | "admin";

export const ROLE_LABELS: Record<Role, string> = {
  volunteer: "Volunteer",
  leader: "Ministry Leader",
  admin: "Church Admin",
};

type RoleContextValue = {
  role: Role;
  setRole: (r: Role) => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("volunteer");
  return (
    <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
}
