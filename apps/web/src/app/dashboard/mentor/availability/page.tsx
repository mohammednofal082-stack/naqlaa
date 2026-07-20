"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

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

  const toggleSlot = (slot: string) => {
    setAvailability((prev) => {
      const daySlots = prev[selectedDay] ?? [];
      const updated = daySlots.includes(slot)
        ? daySlots.filter((s) => s !== slot)
        : [...daySlots, slot].sort();
      return { ...prev, [selectedDay]: updated };
    });
  };

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
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                  {t("إضافة فترة", "Add Slot")}
                </Button>
              }
            >
              <div className="grid grid-cols-4 gap-3">
                {timeSlots.map((slot) => {
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
              <Button className="w-full mt-6">{t("حفظ التغييرات", "Save Changes")}</Button>
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
