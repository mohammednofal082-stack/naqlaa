import React, { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  authUsers,
  DEMO_PASSWORD,
  findAuthUserByEmail,
  getRoleExperienceBase,
  ROLE_LABELS,
  type UserRole,
} from "@careerlink/shared";
import { useI18n } from "../i18n";

interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

interface AppContextValue {
  user: AppUser | null;
  role: UserRole;
  roleExperience: ReturnType<typeof getRoleExperienceBase>;
  login: (email: string, password: string, role: UserRole) => { error?: string };
  logout: () => void;
  isTalentRole: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [user, setUser] = useState<AppUser | null>(null);

  const role = user?.role ?? "student";
  const roleExperience = getRoleExperienceBase(role);
  const isTalentRole = role === "student" || role === "graduate";

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      role,
      roleExperience,
      isTalentRole,
      login: (email, password, selectedRole) => {
        if (password !== DEMO_PASSWORD) return { error: t("كلمة المرور غير صحيحة", "The password is incorrect") };
        const found = findAuthUserByEmail(email);
        if (!found) return { error: t("البريد غير موجود", "This email does not exist") };
        if (!found.roles.includes(selectedRole)) return { error: t("هذا الحساب لا يملك الدور المختار", "This account does not have the selected role") };
        setUser({
          id: found.id,
          email: found.email,
          fullName: found.fullName,
          role: selectedRole,
        });
        return {};
      },
      logout: () => setUser(null),
    }),
    [user, role, roleExperience, isTalentRole, t]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export { authUsers, DEMO_PASSWORD };
