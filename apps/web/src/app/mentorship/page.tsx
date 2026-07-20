"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout, Header } from "@/components/layout/sidebar";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/page-header";
import { useMentors, useMentorshipSessions, bookMentorship } from "@/hooks/data";
import { Calendar, Clock, Star, Video, Loader2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { sessionStatusLabel } from "@/i18n/labels";

export default function MentorshipPage() {
  const { t } = useI18n();
  const { data: mentors } = useMentors();
  const { data: sessions, refetch } = useMentorshipSessions();
  const [selectedTopic, setSelectedTopic] = useState("");
  const [booking, setBooking] = useState(false);
  const topics = [
    t("مراجعة السيرة", "Resume Review"),
    t("محاكاة مقابلة", "Mock Interview"),
    t("تخطيط المسار المهني", "Career Path Planning"),
    t("Portfolio Review", "Portfolio Review"),
  ];

  const mentor = mentors?.[0];
  const upcoming = (sessions ?? []).filter((s) => s.status === "accepted" || s.status === "requested");
  const past = (sessions ?? []).filter((s) => s.status === "completed");

  const handleBook = async () => {
    if (!selectedTopic || !mentor) return;
    setBooking(true);
    try {
      const date = new Date();
      date.setDate(date.getDate() + 3);
      await bookMentorship({
        mentorId: mentor.userId,
        topic: selectedTopic,
        scheduledAt: date.toISOString(),
      });
      setSelectedTopic("");
      await refetch();
    } finally {
      setBooking(false);
    }
  };

  return (
    <DashboardLayout>
      <Header title={t("الإرشاد المهني", "Mentorship")} subtitle={t("احجز جلسة مع مرشد خبير", "Book a session with an expert mentor")} />

      <div className="nq-page-enter mt-6 grid lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardTitle className="font-display mb-4">{t("الجلسات القادمة", "Upcoming Sessions")}</CardTitle>
            <div className="space-y-3">
              {upcoming.map((session) => (
                <div key={session.id} className="nq-lift flex items-center justify-between p-4 rounded-xl border border-border bg-surface">
                  <div className="min-w-0">
                    <p className="font-semibold text-text">{session.topic}</p>
                    <p className="text-sm text-text-secondary flex flex-wrap items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-text-muted" />
                      {formatDateTime(session.scheduledAt)}
                      <span className="nq-chip">{sessionStatusLabel(session.status, t)}</span>
                    </p>
                  </div>
                  {session.meetingLink && (
                    <Link href={session.meetingLink} target="_blank">
                      <Button size="sm"><Video className="w-4 h-4" /> {t("انضم", "Join")}</Button>
                    </Link>
                  )}
                </div>
              ))}
              {!upcoming.length && (
                <EmptyState
                  icon={Calendar}
                  title={t("لا جلسات قادمة", "No upcoming sessions")}
                  description={t("اختر موضوعاً من القائمة الجانبية واحجز جلستك الأولى مع مرشد خبير", "Choose a topic from the side list and book your first session with an expert mentor")}
                />
              )}
            </div>
          </Card>

          <Card>
            <CardTitle className="font-display mb-4">{t("جلسات سابقة", "Past Sessions")}</CardTitle>
            {past.length === 0 && (
              <p className="text-text-muted text-xs">{t("لم تُكمل أي جلسة بعد", "You haven't completed any sessions yet")}</p>
            )}
            {past.map((session) => (
              <div key={session.id} className="p-4 rounded-xl border border-border mb-3 last:mb-0">
                <p className="font-semibold text-text">{session.topic}</p>
                <p className="text-text-muted text-xs mt-0.5">{formatDateTime(session.scheduledAt)}</p>
                {session.rating && (
                  <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />{session.rating}/5
                  </p>
                )}
              </div>
            ))}
          </Card>
        </div>

        <div className="lg:sticky lg:top-24">
          <Card className="nq-gradient-panel">
            {mentor && (
              <div className="mb-5 pb-5 border-b border-border">
                <CardTitle className="font-display mb-1">{mentor.currentTitle}</CardTitle>
                <p className="text-text-secondary text-sm">{mentor.expertiseArea}</p>
                <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />{mentor.rating} · {mentor.sessionsCount} {t("جلسة", "sessions")}
                </p>
              </div>
            )}
            <CardTitle className="font-display mb-4">{t("احجز جلسة", "Book a Session")}</CardTitle>
            <div className="space-y-2 mb-4">
              {topics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setSelectedTopic(topic)}
                  className={`w-full text-right px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    selectedTopic === topic
                      ? "border-brand bg-brand-muted text-brand"
                      : "border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
            <Button className="w-full" onClick={handleBook} disabled={!selectedTopic || booking}>
              {booking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
              {t("إرسال طلب الحجز", "Send Booking Request")}
            </Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
