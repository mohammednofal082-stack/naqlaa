import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEMO_PASSWORD, getRoleExperienceBase, type UserRole } from "@careerlink/shared";
import { useI18n } from "../i18n";
import {
  apiLogin,
  apiLogout,
  getApiBaseUrl,
  isRemoteApiEnabled,
  loadSession,
  type MobileSession,
} from "../services/api-client";

/** Demo emails for quick fill — login always hits the API / DB. */
export const DEMO_ACCOUNTS: { role: UserRole; email: string }[] = [
  { role: "student", email: "student@naqlah.ps" },
  { role: "graduate", email: "graduate@naqlah.ps" },
  { role: "company", email: "company@jawwal.ps" },
  { role: "hr", email: "hr@jawwal.ps" },
  { role: "university", email: "career@birzeit.edu" },
  { role: "trainer", email: "trainer@naqlah.ps" },
  { role: "mentor", email: "mentor@naqlah.ps" },
  { role: "admin", email: "admin@naqlah.ps" },
];

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
        if (!getApiBaseUrl()) {
          return {
            error: t(
              "اربط التطبيق بالخادم عبر EXPO_PUBLIC_API_URL",
              "Connect the app via EXPO_PUBLIC_API_URL"
            ),
          };
        }
        try {
          const result = await apiLogin({ email, password, role: selectedRole });
          setUser(toAppUser(result.user));
          return {};
        } catch (e) {
          return { error: e instanceof Error ? e.message : t("فشل تسجيل الدخول", "Login failed") };
        }
      },
      logout: async () => {
        await apiLogout();
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

export { DEMO_PASSWORD };
/** @deprecated use DEMO_ACCOUNTS */
export const authUsers = DEMO_ACCOUNTS.map((a) => ({
  email: a.email,
  roles: [a.role] as UserRole[],
  fullName: a.email,
  id: a.email,
}));
