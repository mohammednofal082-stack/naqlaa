"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

const STORAGE_KEY = "naqlah-mentor-availability";

const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const dayLabels: Record<string, string> = {
  "الأحد": "Sunday",
  "الإثنين": "Monday",
  "الثلاثاء": "Tuesday",
  "الأربعاء": "Wednesday",
  "الخميس": "Thursday",
  "الجمعة": "Friday",
  "السبت": "Saturday",
};

const initialAvailability: Record<string, string[]> = {
  "الأحد": ["10:00", "14:00", "16:00"],
  "الثلاثاء": ["11:00", "15:00"],
  "الخميس": ["09:00", "13:00", "17:00"],
};

export default function MentorAvailabilityPage() {
  const { t } = useI18n();
  const dayLabel = (day: string) => t(day, dayLabels[day] ?? day);
  const [availability, setAvailability] = useState(initialAvailability);
  const [selectedDay, setSelectedDay] = useState("الأحد");
  const [customSlot, setCustomSlot] = useState("");
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAvailability(JSON.parse(raw) as Record<string, string[]>);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSlot = (slot: string) => {
    setAvailability((prev) => {
      const daySlots = prev[selectedDay] ?? [];
      const updated = daySlots.includes(slot)
        ? daySlots.filter((s) => s !== slot)
        : [...daySlots, slot].sort();
      return { ...prev, [selectedDay]: updated };
    });
    setMessage("");
  };

  const addCustomSlot = () => {
    const slot = customSlot.trim();
    if (!/^\d{1,2}:\d{2}$/.test(slot)) return;
    setAvailability((prev) => {
      const daySlots = prev[selectedDay] ?? [];
      if (daySlots.includes(slot)) return prev;
      return { ...prev, [selectedDay]: [...daySlots, slot].sort() };
    });
    setCustomSlot("");
    setShowAddSlot(false);
    setMessage("");
  };

  const saveChanges = async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(availability));
    try {
      const dayIndex: Record<string, number> = {
        "الأحد": 0, "الإثنين": 1, "الثلاثاء": 2, "الأربعاء": 3, "الخميس": 4, "الجمعة": 5, "السبت": 6,
      };
      const slots = Object.entries(availability).flatMap(([day, times]) =>
        times.map((startTime) => ({
          dayOfWeek: dayIndex[day] ?? 0,
          startTime,
          endTime: startTime,
          isActive: true,
        })),
      );
      const res = await fetch("/api/data/mentor-availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "FAILED");
      }
      setMessage(t("تم حفظ الأوقات في قاعدة البيانات", "Availability saved to database"));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : t("حُفظ محلياً — تأكد من migration 009", "Saved locally — ensure migration 009"));
    }
  };

  const allSlots = Array.from(
    new Set([...timeSlots, ...(availability[selectedDay] ?? [])])
  ).sort();

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المرشد", "Mentor Panel")}
        title={t("الأوقات المتاحة", "Available Times")}
        subtitle={t("حدد أوقاتك للجلسات الإرشادية", "Set your availability for mentorship sessions")}
      >
        <div className="grid lg:grid-cols-3 gap-6">
          <PanelCard title={t("اختر اليوم", "Select a Day")}>
            <div className="space-y-2">
              {days.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "nq-lift w-full text-right px-4 py-2.5 rounded-xl text-sm transition-colors border",
                    selectedDay === day
                      ? "bg-brand-muted border-brand/30 text-brand font-medium"
                      : "border-border hover:bg-surface-hover text-text-secondary"
                  )}
                >
                  {dayLabel(day)}
                  {(availability[day]?.length ?? 0) > 0 && (
                    <span className="float-left nq-chip nq-chip-emerald text-[11px]">
                      {availability[day]?.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </PanelCard>

          <div className="lg:col-span-2 space-y-6">
            <PanelCard
              title={t(`أوقات ${selectedDay}`, `${dayLabels[selectedDay] ?? selectedDay} Availability`)}
              action={
                <Button size="sm" variant="outline" onClick={() => setShowAddSlot((v) => !v)}>
                  <Plus className="w-4 h-4" />
                  {t("إضافة فترة", "Add Slot")}
                </Button>
              }
            >
              {showAddSlot && (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="HH:MM"
                    value={customSlot}
                    onChange={(e) => setCustomSlot(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                  <Button size="sm" onClick={addCustomSlot}>{t("إضافة", "Add")}</Button>
                </div>
              )}
              <div className="grid grid-cols-4 gap-3">
                {allSlots.map((slot) => {
                  const isSelected = availability[selectedDay]?.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleSlot(slot)}
                      className={cn(
                        "nq-lift py-3 rounded-xl text-sm font-medium transition-colors border",
                        isSelected
                          ? "bg-emerald/10 border-emerald/30 text-emerald"
                          : "border-border hover:bg-surface-hover text-text-secondary"
                      )}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
              {message && <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}
              <Button className="w-full mt-6" onClick={() => void saveChanges()}>
                {t("حفظ التغييرات", "Save Changes")}
              </Button>
            </PanelCard>

            <PanelCard title={t("ملخص الأسبوع", "Weekly Summary")}>
              <div className="space-y-3">
                {Object.entries(availability).map(([day, slots]) => (
                  <div key={day} className="nq-lift flex items-center gap-3 p-3 rounded-lg border border-border bg-surface-hover/40">
                    <Calendar className="w-4 h-4 text-brand" />
                    <span className="font-medium text-sm w-16">{dayLabel(day)}</span>
                    <span className="text-sm text-text-muted">{slots.join(" · ")}</span>
                  </div>
                ))}
              </div>
            </PanelCard>
          </div>
        </div>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
