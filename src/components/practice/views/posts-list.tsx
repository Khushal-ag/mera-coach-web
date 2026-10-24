"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  CoachPost,
  PostCategoryOption,
  SavePostInput,
} from "@/types/showcase";

import { EmptyState } from "@/components/practice/empty-state";
import { PracticePageHeader } from "@/components/practice/page-header";
import { PostForm } from "@/components/practice/views/post-form";
import { EventCardsSkeleton } from "@/components/skeletons/packages-events-skeleton";
import { AlertBanner } from "@/components/ui/alert-banner";
import {
  deletePost,
  fetchMyPosts,
  fetchPostCategories,
  savePost,
} from "@/lib/api/showcase";
import { formatDateLabel } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media/media-url";
import { cn } from "@/lib/utils";

/** Gallery, workshops and events, and client success stories: one list, one form. */
export function PostsListView() {
  const [posts, setPosts] = useState<CoachPost[]>([]);
  const [categories, setCategories] = useState<PostCategoryOption[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  /** null = list, 0 = new, otherwise the post being edited. */
  const [editing, setEditing] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchMyPosts(), fetchPostCategories()])
      .then(([mine, masters]) => {
        if (cancelled) return;
        setPosts(mine);
        setCategories(masters);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Could not load your posts.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const post of posts) {
      map.set(post.categoryCode, (map.get(post.categoryCode) ?? 0) + 1);
    }
    return map;
  }, [posts]);

  const shown =
    filter === "ALL" ? posts : posts.filter((p) => p.categoryCode === filter);

  async function publish(input: SavePostInput) {
    const saved = await savePost(input);
    setPosts((prev) =>
      input.postId ?
        prev.map((p) => (p.postId === saved.postId ? saved : p))
      : [saved, ...prev],
    );
    setEditing(null);
    setMessage(
      input.postId ? "Changes saved." : "Published on your public profile.",
    );
  }

  async function remove(post: CoachPost) {
    if (!window.confirm(`Remove "${post.title}" from your profile?`)) return;
    setError(null);
    setMessage(null);
    try {
      await deletePost(post.postId);
      setPosts((prev) => prev.filter((p) => p.postId !== post.postId));
      setMessage("Removed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove it.");
    }
  }

  const editingPost =
    editing ? (posts.find((p) => p.postId === editing) ?? null) : null;

  return (
    <div className="min-w-0">
      <PracticePageHeader
        title="Posts"
        description="Photos, videos and client success stories shown on your public profile."
        icon={
          <i className="fas fa-images" style={{ fontSize: 20 }} aria-hidden />
        }
        action={
          editing === null && posts.length > 0 ?
            <button
              type="button"
              className="mc-btn-primary w-full sm:w-auto"
              onClick={() => {
                setMessage(null);
                setEditing(0);
              }}
            >
              <i className="fas fa-plus" aria-hidden /> Add post
            </button>
          : null
        }
      />

      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}
      {message ?
        <AlertBanner tone="success">{message}</AlertBanner>
      : null}

      {editing !== null ?
        <PostForm
          key={editing}
          categories={categories}
          initial={editingPost}
          onPublish={publish}
          onCancel={() => setEditing(null)}
        />
      : loading ?
        <EventCardsSkeleton />
      : posts.length === 0 ?
        <EmptyState
          icon="fas fa-images"
          title="Nothing published yet"
          description="Add a photo or video, or share a client's success story."
          action={
            <button
              type="button"
              className="mc-btn-primary"
              onClick={() => setEditing(0)}
            >
              <i className="fas fa-plus" aria-hidden /> Add post
            </button>
          }
        />
      : <>
          <div
            role="tablist"
            aria-label="Filter by category"
            className="mb-5 flex gap-1 overflow-x-auto border-b border-line"
          >
            {[
              { code: "ALL", label: "All", count: posts.length },
              ...categories.map((c) => ({
                code: c.code,
                label: c.label,
                count: counts.get(c.code) ?? 0,
              })),
            ].map((tab) => (
              <button
                key={tab.code}
                type="button"
                role="tab"
                aria-selected={filter === tab.code}
                onClick={() => setFilter(tab.code)}
                className={cn(
                  "-mb-px inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-4 font-display text-sm",
                  filter === tab.code ?
                    "border-mc-secondary font-bold text-mc-secondary"
                  : "border-transparent font-semibold text-ink-muted hover:text-ink",
                )}
              >
                {tab.label}
                <span className="rounded-full bg-mc-secondary-light px-2 text-xs text-mc-secondary">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          {shown.length === 0 ?
            <p className="py-10 text-center text-sm text-ink-muted">
              Nothing in this category yet.
            </p>
          : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((post) => (
                <article
                  key={post.postId}
                  className="clt-card flex min-w-0 flex-col overflow-hidden"
                >
                  <div className="relative aspect-[16/10] bg-black/5">
                    {
                      post.mediaType === "video" ?
                        <>
                          <video
                            src={resolveMediaUrl(post.mediaUrl)}
                            muted
                            preload="metadata"
                            className="absolute inset-0 size-full object-cover"
                          />
                          <span className="absolute inset-0 grid place-items-center">
                            <i
                              className="fas fa-play-circle text-4xl text-white drop-shadow"
                              aria-hidden
                            />
                          </span>
                        </>
                        // eslint-disable-next-line @next/next/no-img-element
                      : <img
                          src={resolveMediaUrl(post.mediaUrl)}
                          alt=""
                          className="absolute inset-0 size-full object-cover"
                        />

                    }
                    <span className="absolute top-2 left-2 rounded-full bg-mc-secondary/90 px-3 py-1 text-xs font-semibold text-white">
                      {post.categoryName}
                    </span>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        type="button"
                        aria-label={`Edit ${post.title}`}
                        title="Edit"
                        className="grid size-9 place-items-center rounded-full bg-white/90 text-[#2a4a3a] shadow-md transition hover:bg-white"
                        onClick={() => {
                          setMessage(null);
                          setEditing(post.postId);
                        }}
                      >
                        <i
                          className="fas fa-pen"
                          style={{ fontSize: 13 }}
                          aria-hidden
                        />
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove ${post.title}`}
                        title="Remove"
                        className="grid size-9 place-items-center rounded-full bg-white/90 text-[#b3361f] shadow-md transition hover:bg-white"
                        onClick={() => void remove(post)}
                      >
                        <i
                          className="fas fa-trash"
                          style={{ fontSize: 13 }}
                          aria-hidden
                        />
                      </button>
                    </div>
                  </div>
                  <div className="grid min-w-0 gap-1.5 p-4">
                    <h2 className="text-base leading-snug font-bold break-words">
                      {post.title}
                    </h2>
                    <p className="flex items-start gap-2 text-sm text-ink-muted">
                      <i
                        className="fas fa-calendar-alt mt-1 text-xs"
                        aria-hidden
                      />
                      {formatDateLabel(post.postDate)}
                    </p>
                    {post.location ?
                      <p className="flex items-start gap-2 text-sm text-ink-muted">
                        <i
                          className="fas fa-map-marker-alt mt-1 text-xs"
                          aria-hidden
                        />
                        <span className="min-w-0 break-words">
                          {post.location}
                        </span>
                      </p>
                    : null}
                    {post.clientName ?
                      <p className="flex items-start gap-2 text-sm text-ink-muted">
                        <i className="fas fa-user mt-1 text-xs" aria-hidden />
                        {post.clientName}
                      </p>
                    : null}
                  </div>
                </article>
              ))}
            </div>
          }
        </>
      }
    </div>
  );
}
