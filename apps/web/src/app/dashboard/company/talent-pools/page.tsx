"use client";

import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import {
  useTalentPools,
  useUsers,
  createTalentPool,
  addPoolMember,
  removePoolMember,
} from "@/hooks/data";
import { Plus, Search, Target, UserPlus, X, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

export default function TalentPoolsPage() {
  const { t } = useI18n();
  const { data: talentPools, loading: poolsLoading, refetch } = useTalentPools();
  const { data: users, loading: usersLoading } = useUsers();
  const loading = poolsLoading || usersLoading;
  const pools = talentPools ?? [];
  const candidates = (users ?? []).filter((u) => u.role === "student" || u.role === "graduate");

  const [activePoolId, setActivePoolId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const activePool = pools.find((p) => p.id === activePoolId) ?? pools[0];

  const filteredPools = useMemo(
    () => pools.filter((p) => p.name.includes(search) || p.description.includes(search)),
    [pools, search]
  );

  const memberIds = new Set(activePool?.memberIds ?? []);
  const members = candidates.filter((u) => memberIds.has(u.id));
  const suggestions = candidates.filter((u) => !memberIds.has(u.id));

  const notify = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setBusy(true);
    try {
      const pool = await createTalentPool({ name: newName.trim(), description: newDesc.trim() });
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
      await refetch();
      setActivePoolId(pool.id);
      notify(t("تم إنشاء القائمة", "Pool created successfully"));
    } catch (e) {
      notify(e instanceof Error ? e.message : t("فشل إنشاء القائمة", "Failed to create pool"));
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = async (userId: string) => {
    if (!activePool) return;
    setBusy(true);
    try {
      await addPoolMember(activePool.id, userId);
      await refetch();
      notify(t("تمت إضافة المرشح", "Candidate added"));
    } catch (e) {
      notify(e instanceof Error ? e.message : t("فشلت الإضافة", "Failed to add candidate"));
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!activePool) return;
    setBusy(true);
    try {
      await removePoolMember(activePool.id, userId);
      await refetch();
      notify(t("تمت إزالة المرشح", "Candidate removed"));
    } catch (e) {
      notify(e instanceof Error ? e.message : t("فشلت الإزالة", "Failed to remove candidate"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الشركة", "Company Dashboard")}
        title={t("قوائم المواهب", "Talent Pools")}
        subtitle={t("أنشئ قوائم مرشحين واحتفظ بأفضل المواهب للتوظيف المستقبلي", "Create candidate lists and retain top talent for future hiring")}
        actions={
          <Button size="sm" onClick={() => setShowCreate((v) => !v)}>
            <Plus className="w-4 h-4" />
            {t("قائمة جديدة", "New Pool")}
          </Button>
        }
      >
        {feedback && (
          <div className="mb-4 px-4 py-2.5 rounded-lg bg-brand-muted border border-brand/20 text-sm text-brand">
            {feedback}
          </div>
        )}

        {showCreate && (
          <div className="mb-6 p-4 rounded-xl border border-border bg-surface space-y-3">
            <Input
              placeholder={t("اسم القائمة — مثال: مطورين React مميزين", "Pool name — e.g. Top React Developers")}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Textarea
              rows={2}
              placeholder={t("وصف مختصر للقائمة...", "A brief description of the pool...")}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={busy || !newName.trim()}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {t("إنشاء", "Create")}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>
                {t("إلغاء", "Cancel")}
              </Button>
            </div>
          </div>
        )}

        <div className="relative max-w-sm mb-6">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder={t("بحث في القوائم...", "Search pools...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        {loading ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="nq-skeleton h-16" />
              ))}
            </div>
            <div className="lg:col-span-2 space-y-5">
              <div className="nq-skeleton h-64" />
              <div className="nq-skeleton h-48" />
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <PanelCard title={`${t("القوائم", "Pools")} (${filteredPools.length})`}>
              {filteredPools.length === 0 ? (
                <EmptyState
                  icon={Target}
                  title={t("لا توجد قوائم", "No Pools Found")}
                  description={t("أنشئ أول قائمة مواهب للبدء.", "Create your first talent pool to get started.")}
                  action={
                    <Button size="sm" onClick={() => setShowCreate(true)}>
                      <Plus className="w-4 h-4" />
                      {t("قائمة جديدة", "New Pool")}
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-2">
                  {filteredPools.map((pool) => (
                    <button
                      key={pool.id}
                      type="button"
                      onClick={() => setActivePoolId(pool.id)}
                      className={cn(
                        "nq-lift w-full text-right p-3 rounded-lg border transition-colors",
                        activePool?.id === pool.id
                          ? "border-brand/30 bg-brand-muted"
                          : "border-border bg-surface-hover/40 hover:bg-surface-hover"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-muted border border-border flex items-center justify-center">
                          <Target className="w-4 h-4 text-brand" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-text">{pool.name}</p>
                          <p className="text-xs text-text-muted">{pool.membersCount} {t("عضو", "members")}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </PanelCard>

            <div className="lg:col-span-2 space-y-5">
              {activePool ? (
                <>
                  <PanelCard title={`${activePool.name} — ${t("الأعضاء", "Members")} (${members.length})`}>
                    <p className="text-sm text-text-secondary mb-4">{activePool.description}</p>
                    {members.length === 0 ? (
                      <EmptyState
                        icon={Users}
                        title={t("القائمة فارغة", "Empty Pool")}
                        description={t("أضف مرشحين من الاقتراحات أدناه.", "Add candidates from the suggestions below.")}
                      />
                    ) : (
                      <div className="space-y-2">
                        {members.map((member) => (
                          <ActivityRow
                            key={member.id}
                            avatar={
                              <div className="w-9 h-9 rounded-lg bg-brand-muted flex items-center justify-center text-sm font-bold text-brand">
                                {member.firstName[0]}
                              </div>
                            }
                            title={`${member.firstName} ${member.lastName}`}
                            subtitle={member.email}
                            badge={
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                onClick={() => handleRemove(member.id)}
                              >
                                <X className="w-3.5 h-3.5" />
                                {t("إزالة", "Remove")}
                              </Button>
                            }
                          />
                        ))}
                      </div>
                    )}
                  </PanelCard>

                  <PanelCard title={t("مرشحون مقترحون", "Suggested Candidates")}>
                    {suggestions.length === 0 ? (
                      <EmptyState
                        icon={UserPlus}
                        title={t("كل المرشحين مضافون", "All Candidates Added")}
                        description={t("لا يوجد مرشحون جدد للاقتراح حالياً.", "There are no new candidates to suggest at the moment.")}
                      />
                    ) : (
                      <div className="space-y-2">
                        {suggestions.map((candidate) => (
                          <ActivityRow
                            key={candidate.id}
                            avatar={
                              <div className="w-9 h-9 rounded-lg bg-emerald/10 flex items-center justify-center text-sm font-bold text-emerald">
                                {candidate.firstName[0]}
                              </div>
                            }
                            title={`${candidate.firstName} ${candidate.lastName}`}
                            subtitle={candidate.email}
                            badge={
                              <Button size="sm" disabled={busy} onClick={() => handleAdd(candidate.id)}>
                                <UserPlus className="w-3.5 h-3.5" />
                                {t("إضافة", "Add")}
                              </Button>
                            }
                          />
                        ))}
                      </div>
                    )}
                  </PanelCard>
                </>
              ) : (
                <EmptyState
                  icon={Target}
                  title={t("ابدأ هنا", "Start Here")}
                  description={t("أنشئ قائمة مواهب لتجميع أفضل المرشحين.", "Create a talent pool to gather your best candidates.")}
                  action={
                    <Button size="sm" onClick={() => setShowCreate(true)}>
                      <Plus className="w-4 h-4" />
                      {t("قائمة جديدة", "New Pool")}
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
