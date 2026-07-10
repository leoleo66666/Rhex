"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { MessageCircle, Pin } from "lucide-react"

import { PostListLink } from "@/components/post/post-list-link"
import { UserAvatar } from "@/components/user/user-avatar"
import { formatCompactNumber } from "@/lib/formatters"
import { getPostPath } from "@/lib/post-links"
import type { PostRewardPoolMode } from "@/lib/post-reward-pool-config"
import { cn } from "@/lib/utils"

const pinBadgeColors: Record<string, string> = {
  GLOBAL: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200",
  ZONE: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-200",
  BOARD: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
}

function GalleryBadges({
  isFeatured,
  pinScope,
  pinLabel,
}: {
  isFeatured?: boolean
  pinScope?: string | null
  pinLabel?: string | null
}) {
  if (!isFeatured && !pinScope) return null

  return (
    <div className="absolute right-2 top-2 z-10 flex flex-col items-end gap-1">
      {pinScope && pinBadgeColors[pinScope] ? (
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
            pinBadgeColors[pinScope],
          )}
        >
          <Pin className="h-2.5 w-2.5" />
          {pinLabel ?? "置顶"}
        </span>
      ) : null}
      {isFeatured ? (
        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
          精华
        </span>
      ) : null}
    </div>
  )
}

interface PostGalleryGridProps {
  items: Array<{
    id: string
    slug: string
    title: string
    excerpt: string
    coverImage?: string | null
    typeLabel?: string
    type?: string
    status?: string
    statusLabel?: string
    reviewNote?: string | null
    pinScope?: string | null
    pinLabel?: string | null
    hasRedPacket?: boolean
    rewardMode?: PostRewardPoolMode
    minViewLevel?: number
    minViewVipLevel?: number
    isFeatured?: boolean
    boardName: string
    boardSlug?: string
    boardIcon?: string
    authorName: string
    authorUsername: string
    authorAvatarPath?: string | null
    authorStatus?: "ACTIVE" | "MUTED" | "BANNED" | "INACTIVE"
    authorIsVip?: boolean
    authorVipLevel?: number | null
    authorNameClassName?: string
    metaPrimary: string
    metaPrimaryRaw?: string
    metaSecondary?: string | null
    commentCount: number
    commentAccentColor: string
  }>
  showBoard?: boolean
  postLinkDisplayMode?: "SLUG" | "ID"
  showPinBadge?: boolean
}

function GalleryCoverImage({ src, title }: { src: string; title: string }) {
  const [hasLoadError, setHasLoadError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  if (hasLoadError) {
    return null
  }

  return (
    <div className="relative w-full overflow-hidden bg-secondary/40">
      {!imageLoaded ? <div className="absolute inset-0 animate-pulse bg-muted" /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={title}
        title={title}
        className={cn("block h-auto w-full transition-opacity duration-300", imageLoaded ? "opacity-100" : "opacity-0")}
        loading="lazy"
        decoding="async"
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setHasLoadError(true)
          setImageLoaded(true)
        }}
      />
    </div>
  )
}

function GalleryCoverPlaceholder({ title }: { title: string }) {
  return (
    <div
      className="flex w-full items-center justify-center p-6"
      style={{
        background: "linear-gradient(135deg, hsl(var(--primary) / 0.18), hsl(var(--primary) / 0.12))",
      }}
    >
      <span className="line-clamp-3 text-center text-sm font-bold" style={{ color: "hsl(var(--primary))" }}>{title}</span>
    </div>
  )
}

function PostGalleryCard({
  item,
  postPath,
}: {
  item: PostGalleryGridProps["items"][number]
  postPath: string
}) {
  const hasCover = Boolean(item.coverImage?.trim())

  return (
    <article className="post-gallery-card overflow-hidden rounded-xl border border-border bg-card transition-shadow duration-150 hover:shadow-md">
      <PostListLink href={postPath} className="block">
        <div className="relative">
          {hasCover ? (
            <GalleryCoverImage src={item.coverImage!.trim()} title={item.title} />
          ) : (
            <GalleryCoverPlaceholder title={item.title} />
          )}
          <GalleryBadges isFeatured={item.isFeatured} pinScope={item.pinScope} pinLabel={item.pinLabel} />
        </div>
      </PostListLink>

      <div className="space-y-2.5 p-3 pb-1.5">
        <PostListLink href={postPath} visitedPath={postPath} dimWhenRead className="block" title={item.title}>
          <h2 className="line-clamp-2 text-sm font-bold leading-snug">{item.title}</h2>
        </PostListLink>

        <div className="flex items-center justify-between">
          <Link href={`/users/${item.authorUsername}`} className="flex min-w-0 items-center gap-2" title={item.authorName}>
            <UserAvatar
              name={item.authorName}
              avatarPath={item.authorAvatarPath}
              size="xs"
              isVip={item.authorIsVip}
              vipLevel={item.authorVipLevel}
              rounded="rounded-full"
              className="size-6"
            />
            <span className="truncate text-xs text-muted-foreground hover:underline">{item.authorName}</span>
          </Link>

          <PostListLink
            href={`${postPath}#comments`}
            title={`${item.commentCount} 回复`}
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums"
            style={{ color: item.commentAccentColor }}
          >
            <MessageCircle className="h-3 w-3" />
            {formatCompactNumber(item.commentCount)}
          </PostListLink>
        </div>
      </div>
    </article>
  )
}

function useColumnCount() {
  const [cols, setCols] = useState(3)

  useEffect(() => {
    const update = () => setCols(window.innerWidth < 768 ? 2 : 3)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return cols
}

function distributeToColumns<T extends { coverImage?: string | null; title: string }>(
  items: T[],
  cols: number,
): T[][] {
  const result: T[][] = Array.from({ length: cols }, () => [])
  const heights = new Array(cols).fill(0)

  for (const item of items) {
    let minIdx = 0
    for (let i = 1; i < cols; i++) {
      if (heights[i] < heights[minIdx]) minIdx = i
    }
    result[minIdx].push(item)
    const titleLen = item.title.length
    const hasCover = Boolean(item.coverImage?.trim())
    heights[minIdx] += hasCover ? 180 : 100 + Math.ceil(titleLen / 15) * 18
  }

  return result
}

export function PostGalleryGrid({ items, postLinkDisplayMode = "SLUG" }: PostGalleryGridProps) {
  const colCount = useColumnCount()
  const columns = distributeToColumns(items, colCount)
  const gap = colCount === 2 ? "0.5rem" : "0.75rem"

  return (
    <div
      className="post-gallery-grid px-1.5 py-1.5 sm:px-2"
      style={{
        display: "flex",
        gap,
      }}
    >
      {columns.map((col, colIdx) => (
        <div
          key={colIdx}
          style={{
            display: "flex",
            flexDirection: "column",
            gap,
            flex: "1 1 0",
            minWidth: 0,
          }}
        >
          {col.map((item) => {
            const postPath = getPostPath({ id: item.id, slug: item.slug }, { mode: postLinkDisplayMode })
            return <PostGalleryCard key={item.id} item={item} postPath={postPath} />
          })}
        </div>
      ))}
    </div>
  )
}
