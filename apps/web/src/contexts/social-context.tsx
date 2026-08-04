"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Conversation, FeedPost, Message } from "@careerlink/shared";
import { useApp } from "@/contexts/app-context";

interface SocialContextValue {
  posts: FeedPost[];
  addPost: (content: string, tags?: string[]) => void;
  toggleLike: (postId: string) => void;
  isPostLiked: (postId: string) => boolean;
  conversations: Conversation[];
  messages: Message[];
  sendMessage: (conversationId: string, content: string) => void;
  openConversationWith: (userId: string) => string;
  getConversationMessages: (conversationId: string) => Message[];
  loading: boolean;
}

const SocialContext = createContext<SocialContextValue | null>(null);

const POLL_MS = 8000;

export function SocialProvider({ children }: { children: ReactNode }) {
  const { user } = useApp();
  const activeUserId = user?.userId ?? "";
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [basePosts, setBasePosts] = useState<FeedPost[]>([]);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [msgsByConv, setMsgsByConv] = useState<Record<string, Message[]>>({});
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const activeConvRef = useRef<string | null>(null);
  activeConvRef.current = activeConvId;

  const applyFeed = useCallback((feed: FeedPost[]) => {
    setBasePosts(feed);
    setLikedIds(new Set(feed.filter((p) => p.likedByMe).map((p) => p.id)));
  }, []);

  const refreshFeed = useCallback(async () => {
    const res = await fetch("/api/data/feed");
    const json = await res.json();
    if (res.ok && Array.isArray(json.data)) applyFeed(json.data as FeedPost[]);
  }, [applyFeed]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch("/api/data/feed").then((r) => r.json()),
      fetch("/api/data/conversations").then((r) => r.json()),
    ])
      .then(([feedRes, convRes]) => {
        if (cancelled) return;
        if (Array.isArray(feedRes.data)) applyFeed(feedRes.data as FeedPost[]);
        if (Array.isArray(convRes.data)) setConvs(convRes.data as Conversation[]);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeUserId, applyFeed]);

  const posts = useMemo(
    () =>
      [...basePosts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [basePosts]
  );

  const messages = useMemo(() => Object.values(msgsByConv).flat(), [msgsByConv]);

  const toggleLike = useCallback((postId: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      const wasLiked = next.has(postId);
      if (wasLiked) next.delete(postId);
      else next.add(postId);
      return next;
    });
    setBasePosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const wasLiked = Boolean(p.likedByMe);
        return {
          ...p,
          likedByMe: !wasLiked,
          likes: Math.max(0, p.likes + (wasLiked ? -1 : 1)),
        };
      })
    );

    void fetch(`/api/data/feed/${encodeURIComponent(postId)}/like`, { method: "POST" })
      .then((r) => r.json())
      .then((json) => {
        if (!json?.data) return;
        const { liked, likes } = json.data as { liked: boolean; likes: number };
        setLikedIds((prev) => {
          const next = new Set(prev);
          if (liked) next.add(postId);
          else next.delete(postId);
          return next;
        });
        setBasePosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, likedByMe: liked, likes } : p))
        );
      })
      .catch(() => {
        void refreshFeed();
      });
  }, [refreshFeed]);

  const addPost = useCallback(
    (content: string, tags: string[] = []) => {
      const trimmed = content.trim();
      if (!trimmed || !activeUserId) return;

      const optimistic: FeedPost = {
        id: `temp-${Date.now()}`,
        authorId: activeUserId,
        authorType: "user",
        content: trimmed,
        type: "update",
        tags,
        likes: 0,
        comments: 0,
        createdAt: new Date().toISOString(),
        authorName: user?.fullName,
        authorAvatar: user?.avatar,
        likedByMe: false,
      };
      setBasePosts((prev) => [optimistic, ...prev]);

      void fetch("/api/data/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed, tags, type: "update" }),
      })
        .then((r) => r.json())
        .then((json) => {
          if (json.data) {
            const created = json.data as FeedPost;
            setBasePosts((prev) => [created, ...prev.filter((p) => p.id !== optimistic.id)]);
          } else {
            void refreshFeed();
          }
        })
        .catch(() => {
          setBasePosts((prev) => prev.filter((p) => p.id !== optimistic.id));
        });
    },
    [activeUserId, refreshFeed, user?.avatar, user?.fullName]
  );

  const loadMessages = useCallback(async (conversationId: string) => {
    const res = await fetch(`/api/data/messages?conversationId=${encodeURIComponent(conversationId)}`);
    const json = await res.json();
    if (!res.ok) return;
    const fetched = (json.data as Message[]) ?? [];
    setMsgsByConv((prev) => ({ ...prev, [conversationId]: fetched }));
    setActiveConvId(conversationId);
  }, []);

  const getConversationMessages = useCallback(
    (conversationId: string) => {
      const list = msgsByConv[conversationId] ?? [];
      return [...list].sort(
        (x, y) => new Date(x.timestamp).getTime() - new Date(y.timestamp).getTime()
      );
    },
    [msgsByConv]
  );

  useEffect(() => {
    if (!convs.length) return;
    convs.slice(0, 3).forEach((c) => {
      void loadMessages(c.id);
    });
  }, [convs, loadMessages]);

  useEffect(() => {
    if (!activeUserId) return;
    const tick = () => {
      const id = activeConvRef.current;
      if (id) void loadMessages(id);
      void fetch("/api/data/conversations")
        .then((r) => r.json())
        .then((json) => {
          if (Array.isArray(json.data)) setConvs(json.data as Conversation[]);
        })
        .catch(() => {});
      void refreshFeed();
    };
    const timer = window.setInterval(tick, POLL_MS);
    return () => window.clearInterval(timer);
  }, [activeUserId, loadMessages, refreshFeed]);

  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const conv = convs.find((c) => c.id === conversationId);
      if (!conv) return;

      const otherId = conv.participantIds.find((id) => id !== activeUserId) ?? "";

      void fetch("/api/data/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content: trimmed }),
      })
        .then((r) => r.json())
        .then((json) => {
          const msg = (json.data ?? {
            id: `msg-${Date.now()}`,
            senderId: activeUserId,
            receiverId: otherId,
            content: trimmed,
            timestamp: new Date().toISOString(),
            read: true,
          }) as Message;

          setMsgsByConv((prev) => {
            const existing = prev[conversationId] ?? [];
            if (existing.some((m) => m.id === msg.id)) return prev;
            return { ...prev, [conversationId]: [...existing, msg] };
          });
          setConvs((prev) =>
            prev.map((c) =>
              c.id === conversationId ? { ...c, lastMessage: msg, unreadCount: 0 } : c
            )
          );
          setActiveConvId(conversationId);
        })
        .catch(() => {});
    },
    [convs, activeUserId]
  );

  const openConversationWith = useCallback(
    (userId: string) => {
      const existing = convs.find(
        (c) => c.participantIds.includes(userId) && c.participantIds.includes(activeUserId)
      );
      if (existing) {
        void loadMessages(existing.id);
        return existing.id;
      }

      const tempId = `temp-conv-${Date.now()}`;
      const welcome: Message = {
        id: `msg-welcome-${Date.now()}`,
        senderId: activeUserId,
        receiverId: userId,
        content: "مرحباً، أود التواصل معك عبر منصة نقلة.",
        timestamp: new Date().toISOString(),
        read: true,
      };
      const optimistic: Conversation = {
        id: tempId,
        participantIds: [activeUserId, userId],
        lastMessage: welcome,
        unreadCount: 0,
      };
      setConvs((prev) => [optimistic, ...prev]);
      setMsgsByConv((prev) => ({ ...prev, [tempId]: [welcome] }));
      setActiveConvId(tempId);

      void fetch("/api/data/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
        .then((r) => r.json())
        .then((json) => {
          if (!json.data) return;
          const created = json.data as Conversation;
          setConvs((prev) => [created, ...prev.filter((c) => c.id !== tempId && c.id !== created.id)]);
          setMsgsByConv((prev) => {
            const next = { ...prev };
            delete next[tempId];
            return next;
          });
          void loadMessages(created.id);
        })
        .catch(() => {
          setConvs((prev) => prev.filter((c) => c.id !== tempId));
          setMsgsByConv((prev) => {
            const next = { ...prev };
            delete next[tempId];
            return next;
          });
        });

      return tempId;
    },
    [convs, activeUserId, loadMessages]
  );

  const isPostLiked = useCallback((postId: string) => likedIds.has(postId), [likedIds]);

  return (
    <SocialContext.Provider
      value={{
        posts,
        addPost,
        toggleLike,
        isPostLiked,
        conversations: convs,
        messages,
        sendMessage,
        openConversationWith,
        getConversationMessages,
        loading,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error("useSocial must be used within SocialProvider");
  return ctx;
}
