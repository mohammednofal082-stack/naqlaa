"use client";

import { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardLayout, Header } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/data";
import { useApp } from "@/contexts/app-context";
import { useSocial } from "@/contexts/social-context";
import { Send, Paperclip, MessageSquare } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useI18n } from "@/i18n";

function MessagesContent() {
  const { t } = useI18n();
  const params = useSearchParams();
  const targetUser = params.get("user");
  const { user: currentUser } = useApp();
  const { data: users } = useUsers();
  const {
    conversations,
    sendMessage,
    openConversationWith,
    getConversationMessages,
  } = useSocial();

  const userMap = useMemo(
    () => new Map((users ?? []).map((u) => [u.id, u])),
    [users]
  );

  const [activeConv, setActiveConv] = useState(conversations[0]?.id || "");
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (targetUser && currentUser && targetUser !== currentUser.userId) {
      const id = openConversationWith(targetUser);
      setActiveConv(id);
    }
  }, [targetUser, openConversationWith, currentUser]);

  const activeConversation = conversations.find((c) => c.id === activeConv);
  const otherUserId = activeConversation?.participantIds.find((id) => id !== currentUser?.userId);
  const otherUser = otherUserId ? userMap.get(otherUserId) : null;
  const convMessages = activeConv ? getConversationMessages(activeConv) : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convMessages.length, activeConv]);

  const handleSend = () => {
    if (!activeConv || !newMessage.trim()) return;
    sendMessage(activeConv, newMessage);
    setNewMessage("");
  };

  return (
    <div className="grid lg:grid-cols-3 gap-4 min-h-[calc(100vh-16rem)] pb-20 lg:pb-0">
      <Card className="lg:col-span-1 overflow-y-auto p-0">
        {conversations.length === 0 && (
          <p className="text-text-muted text-xs text-center py-10 px-4">{t("لا محادثات بعد — ابدأ التواصل من صفحة المجتمع", "No conversations yet — start connecting from the Community page")}</p>
        )}
        {conversations.map((conv) => {
          const otherId = conv.participantIds.find((id) => id !== currentUser?.userId);
          const other = otherId ? userMap.get(otherId) : null;
          return (
            <button
              key={conv.id}
              type="button"
              onClick={() => setActiveConv(conv.id)}
              className={`w-full flex items-center gap-3 p-4 text-right transition-colors border-b border-border last:border-0 ${
                activeConv === conv.id ? "bg-brand-muted" : "hover:bg-surface-hover"
              }`}
            >
              {other && <Avatar src={other.avatar} alt={other.firstName} size="sm" />}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <p className="font-semibold text-sm text-text truncate">
                    {other?.firstName} {other?.lastName}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="text-xs font-semibold text-emerald shrink-0 tabular-nums">
                      ({conv.unreadCount})
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted truncate mt-0.5">{conv.lastMessage.content}</p>
              </div>
            </button>
          );
        })}
      </Card>

      <Card className="lg:col-span-2 flex flex-col p-0 overflow-hidden min-h-[420px]">
        {otherUser ? (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-border bg-surface">
              <Avatar src={otherUser.avatar} alt={otherUser.firstName} size="sm" />
              <div>
                <p className="font-semibold text-text">{otherUser.firstName} {otherUser.lastName}</p>
                <p className="text-xs text-text-muted">{otherUser.email}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
              {convMessages.map((msg) => {
                const isMine = msg.senderId === currentUser?.userId;
                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                        isMine
                          ? "bg-brand text-white rounded-br-sm"
                          : "bg-surface border border-border text-text rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                      <p className={`text-[10px] mt-1 ${isMine ? "text-white/70" : "text-text-muted"}`}>
                        {formatDateTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form
              className="p-4 border-t border-border bg-surface flex gap-2 items-center"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <button type="button" className="p-2 rounded-lg hover:bg-surface-hover text-text-muted" title={t("قريباً", "Coming soon")}>
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t("اكتب رسالة...", "Type a message...")}
                className="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-brand/40"
              />
              <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-brand-muted flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-brand" />
            </div>
            <p className="font-display font-bold text-text">{t("اختر محادثة من القائمة", "Select a conversation from the list")}</p>
            <p className="text-text-muted text-xs max-w-xs">{t("تواصل مع الشركات والمرشدين والزملاء مباشرة من هنا", "Connect with companies, mentors, and peers directly from here")}</p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function MessagesPage() {
  const { t } = useI18n();
  return (
    <DashboardLayout>
      <Header title={t("الرسائل", "Messages")} subtitle={t("تواصل مع الشركات والمرشدين والزملاء", "Connect with companies, mentors, and peers")} />
      <Suspense
        fallback={
          <div className="grid lg:grid-cols-3 gap-4 mt-6">
            <div className="nq-skeleton h-96 rounded-xl" />
            <div className="nq-skeleton h-96 rounded-xl lg:col-span-2" />
          </div>
        }
      >
        <div className="nq-page-enter mt-6">
          <MessagesContent />
        </div>
      </Suspense>
    </DashboardLayout>
  );
}
