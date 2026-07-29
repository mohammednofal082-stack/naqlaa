import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  authUsers,
  DEMO_PASSWORD,
  findAuthUserByEmail,
  getRoleExperienceBase,
  type UserRole,
} from "@careerlink/shared";
import { useI18n } from "../i18n";
import {
  apiLogin,
  apiLogout,
  isRemoteApiEnabled,
  loadSession,
  type MobileSession,
} from "../services/api-client";

interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organizationId?: string;
}

interface AppContextValue {
  user: AppUser | null;
  role: UserRole;
  roleExperience: ReturnType<typeof getRoleExperienceBase>;
  login: (email: string, password: string, role: UserRole) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isTalentRole: boolean;
  loading: boolean;
  apiEnabled: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

function toAppUser(session: MobileSession): AppUser {
  return {
    id: session.userId || (session as { id?: string }).id || "",
    email: session.email,
    fullName: session.fullName,
    role: session.role as UserRole,
    organizationId: session.organizationId,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const apiEnabled = isRemoteApiEnabled();

  useEffect(() => {
    loadSession()
      .then((session) => {
        if (session) setUser(toAppUser(session));
      })
      .finally(() => setLoading(false));
  }, []);

  const role = user?.role ?? "student";
  const roleExperience = getRoleExperienceBase(role);
  const isTalentRole = role === "student" || role === "graduate";

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      role,
      roleExperience,
      isTalentRole,
      loading,
      apiEnabled,
      login: async (email, password, selectedRole) => {
        if (apiEnabled) {
          try {
            const result = await apiLogin({ email, password, role: selectedRole });
            setUser(toAppUser(result.user));
            return {};
          } catch (e) {
            return { error: e instanceof Error ? e.message : t("فشل تسجيل الدخول", "Login failed") };
          }
        }

        if (password !== DEMO_PASSWORD) {
          return { error: t("كلمة المرور غير صحيحة — أو اضبط EXPO_PUBLIC_API_URL", "Wrong password — or set EXPO_PUBLIC_API_URL") };
        }
        const found = findAuthUserByEmail(email);
        if (!found) return { error: t("البريد غير موجود", "This email does not exist") };
        if (!found.roles.includes(selectedRole)) {
          return { error: t("هذا الحساب لا يملك الدور المختار", "This account does not have the selected role") };
        }
        setUser({
          id: found.id,
          email: found.email,
          fullName: found.fullName,
          role: selectedRole,
          organizationId: found.organizationId,
        });
        return {};
      },
      logout: async () => {
        if (apiEnabled) await apiLogout();
        setUser(null);
      },
    }),
    [user, role, roleExperience, isTalentRole, loading, apiEnabled, t]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export { authUsers, DEMO_PASSWORD };
