"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/app-context";
import { useSocial } from "@/contexts/social-context";
import { useI18n } from "@/i18n";
import { Image, FileText, Briefcase, X } from "lucide-react";
import Link from "next/link";

export function PostComposer() {
  const { user } = useApp();
  const { addPost } = useSocial();
  const { t } = useI18n();
  const [content, setContent] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [posting, setPosting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const uploadImage = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "posts");
    const res = await fetch("/api/data/media", { method: "POST", body: form });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "UPLOAD_FAILED");
    setImageUrl(String(json.data.url));
    setPreview(URL.createObjectURL(file));
  };

  const handlePost = () => {
    if (!content.trim() && !imageUrl) return;
    setPosting(true);
    const tags = content.match(/#(\w+|[\u0600-\u06FF]+)/g)?.map((tag) => tag.slice(1)) || [];
    addPost(content.trim(), tags, imageUrl || undefined);
    setContent("");
    setImageUrl("");
    setPreview("");
    setExpanded(false);
    setPosting(false);
  };

  return (
    <div className="nq-card nq-lift li-card p-3 mb-2">
      <div className="flex gap-3 items-center">
        <Avatar src={user.avatar} alt={user.fullName} size="sm" />
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex-1 text-right px-4 py-2 rounded-full li-input text-sm transition-colors"
        >
          {t("ابدأ منشوراً...", "Start a post...")}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("شارك تحديثاً، إنجازاً، أو سؤالاً...", "Share an update, achievement, or question...")}
            rows={3}
            autoFocus
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-[var(--li-input)] text-sm text-text placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          {preview && (
            <div className="relative w-full max-h-56 overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="" className="w-full max-h-56 object-cover" />
              <button type="button" className="absolute top-2 left-2 p-1 rounded-full bg-surface" onClick={() => { setPreview(""); setImageUrl(""); }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-0.5">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadImage(file).catch(() => {});
                }}
              />
              <button type="button" className="nq-icon-btn" title={t("صورة", "Image")} onClick={() => fileRef.current?.click()}>
                <Image className="w-5 h-5" />
              </button>
              <Link href="/ai/cv-analyzer" className="nq-icon-btn" title={t("رفع سيرة", "Upload resume")}>
                <FileText className="w-5 h-5" />
              </Link>
              <Link href="/jobs" className="nq-icon-btn" title={t("فرصة عمل", "Job opportunity")}>
                <Briefcase className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setExpanded(false); setContent(""); }}>
                {t("إلغاء", "Cancel")}
              </Button>
              <Button size="sm" onClick={handlePost} disabled={(!content.trim() && !imageUrl) || posting}>
                {t("نشر", "Post")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
