"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Conversation, FeedPost, Message } from "@careerlink/shared";
import { currentUser } from "@careerlink/shared";
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

const LIKED_KEY = "naqlah_liked_posts";
const EXTRA_POSTS_KEY = "naqlah_extra_posts";

export function SocialProvider({ children }: { children: ReactNode }) {
  const { user } = useApp();
  const activeUserId = user?.userId ?? currentUser.id;
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [extraPosts, setExtraPosts] = useState<FeedPost[]>([]);
  const [basePosts, setBasePosts] = useState<FeedPost[]>([]);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const liked = JSON.parse(localStorage.getItem(LIKED_KEY) || "[]") as string[];
      setLikedIds(new Set(liked));
      const posts = JSON.parse(localStorage.getItem(EXTRA_POSTS_KEY) || "[]") as FeedPost[];
      setExtraPosts(posts);
    } catch {
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch("/api/data/feed").then((r) => r.json()),
      fetch("/api/data/conversations").then((r) => r.json()),
    ])
      .then(([feedRes, convRes]) => {
        if (cancelled) return;
        if (feedRes.data) setBasePosts(feedRes.data as FeedPost[]);
        if (convRes.data) setConvs(convRes.data as Conversation[]);
      })
      .catch(() => {
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeUserId]);

  const posts = useMemo(() => {
    const merged = [...extraPosts, ...basePosts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return merged.map((p) => ({
      ...p,
      likes: p.likes + (likedIds.has(p.id) ? 1 : 0),
    }));
  }, [extraPosts, basePosts, likedIds]);

  const persistLikes = (ids: Set<string>) => {
    localStorage.setItem(LIKED_KEY, JSON.stringify([...ids]));
  };

  const toggleLike = useCallback((postId: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      persistLikes(next);
      return next;
    });
  }, []);

  const addPost = useCallback(
    (content: string, tags: string[] = []) => {
      const post: FeedPost = {
        id: `post-user-${Date.now()}`,
        authorId: activeUserId,
        authorType: "user",
        content,
        type: "update",
        tags,
        likes: 0,
        comments: 0,
        createdAt: new Date().toISOString(),
      };
      setExtraPosts((prev) => {
        const next = [post, ...prev];
        localStorage.setItem(EXTRA_POSTS_KEY, JSON.stringify(next));
        return next;
      });
    },
    [activeUserId]
  );

  const loadMessages = useCallback(async (conversationId: string) => {
    const res = await fetch(`/api/data/messages?conversationId=${encodeURIComponent(conversationId)}`);
    const json = await res.json();
    if (!res.ok) return;
    const fetched = json.data as Message[];
    setMsgs((prev) => {
      const ids = new Set(prev.map((m) => m.id));
      const merged = [...prev];
      for (const m of fetched) {
        if (!ids.has(m.id)) merged.push(m);
      }
      return merged;
    });
  }, []);

  const getConversationMessages = useCallback(
    (conversationId: string) => {
      const conv = convs.find((c) => c.id === conversationId);
      if (!conv) return [];
      const [a, b] = conv.participantIds;
      return msgs
        .filter(
          (m) =>
            (m.senderId === a && m.receiverId === b) ||
            (m.senderId === b && m.receiverId === a)
        )
        .sort((x, y) => new Date(x.timestamp).getTime() - new Date(y.timestamp).getTime());
    },
    [convs, msgs]
  );

  useEffect(() => {
    if (!convs.length) return;
    convs.slice(0, 3).forEach((c) => {
      void loadMessages(c.id);
    });
  }, [convs, loadMessages]);

  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const conv = convs.find((c) => c.id === conversationId);
      if (!conv) return;

      const otherId = conv.participantIds.find((id) => id !== activeUserId)!;

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

          setMsgs((prev) => [...prev, msg]);
          setConvs((prev) =>
            prev.map((c) =>
              c.id === conversationId ? { ...c, lastMessage: msg, unreadCount: 0 } : c
            )
          );
        })
        .catch(() => {
          const msg: Message = {
            id: `msg-${Date.now()}`,
            senderId: activeUserId,
            receiverId: otherId,
            content: trimmed,
            timestamp: new Date().toISOString(),
            read: true,
          };
          setMsgs((prev) => [...prev, msg]);
        });
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

      const welcome: Message = {
        id: `msg-welcome-${Date.now()}`,
        senderId: activeUserId,
        receiverId: userId,
        content: "مرحباً، أود التواصل معك عبر منصة نقلة.",
        timestamp: new Date().toISOString(),
        read: true,
      };

      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        participantIds: [activeUserId, userId],
        lastMessage: welcome,
        unreadCount: 0,
      };

      setConvs((prev) => [newConv, ...prev]);
      setMsgs((prev) => [...prev, welcome]);
      return newConv.id;
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
        messages: msgs,
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
