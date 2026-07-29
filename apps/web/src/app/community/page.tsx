"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout, Header } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@careerlink/shared";
import { useUsers } from "@/hooks/data";
import { useSocial } from "@/contexts/social-context";
import { EmptyState } from "@/components/layout/page-header";
import { MapPin, Briefcase, GraduationCap, MessageSquare, Search, Users } from "lucide-react";
import { useI18n } from "@/i18n";

export default function CommunityPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { openConversationWith } = useSocial();

  const { data: users, loading } = useUsers();
  const members = (users ?? []).filter((u) => u.role === "student" || u.role === "graduate");

  const filteredMembers = members.filter(
    (u) =>
      !search ||
      u.firstName.includes(search) ||
      u.lastName.includes(search) ||
      u.email.includes(search) ||
      (ROLE_LABELS[u.role] ?? "").includes(search)
  );

  const contact = (userId: string) => {
    openConversationWith(userId);
    router.push(`/messages?user=${userId}`);
  };

  return (
    <DashboardLayout>
      <Header title={t("المجتمع", "Community")} subtitle={t("تواصل مع الخريجين والطلاب في شبكة نقلة", "Connect with graduates and students in the Naqla network")} />

      <div className="nq-page-enter mt-6">
      <div className="relative max-w-md mb-6">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="search"
          placeholder={t("ابحث بالاسم، الشركة، أو المهارة...", "Search by name, company, or skill...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pr-10 pl-4 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:border-brand/40"
        />
      </div>

      {loading ? (
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="nq-skeleton h-40" />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("لا نتائج مطابقة", "No matching results")}
          description={t("جرّب البحث باسم آخر أو مهارة مختلفة", "Try searching with a different name or skill")}
          action={
            <button type="button" onClick={() => setSearch("")} className="btn-ghost">
              {t("مسح البحث", "Clear Search")}
            </button>
          }
        />
      ) : (
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-20 lg:pb-0">
        {filteredMembers.map((user) => (
          <Card key={user.id} className="nq-lift p-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${user.role === "graduate" ? "bg-brand-muted text-brand" : "bg-emerald/10 text-emerald"}`}>
                {user.firstName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-text">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-text-secondary">{ROLE_LABELS[user.role] ?? user.role}</p>
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {user.email}
                  </span>
                  {user.role === "graduate" ? (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      {t("خريج", "Graduate")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {t("طالب", "Student")}
                    </span>
                  )}
                </div>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => contact(user.id)}>
                  <MessageSquare className="w-4 h-4" />
                  {t("تواصل", "Connect")}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      )}
      </div>
    </DashboardLayout>
  );
}
