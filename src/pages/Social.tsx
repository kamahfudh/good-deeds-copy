import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, BookOpen, MagnifyingGlass } from "@phosphor-icons/react"
import clsx from "clsx"
import { useSocial } from "../lib/socialStore"
import { SocialPostCard, SuggestionRow } from "../components/SocialPostCard"
import { ComposeIcon } from "../components/icons/ComposeIcon"
import { ALL_AUTHORS, YOU } from "../lib/social"
import { getProfile } from "../lib/profile"
import { UsernameRequiredOverlay } from "../components/UsernameRequiredOverlay"

type Tab = "for-you" | "following"

export function Social() {
  const navigate = useNavigate()
  const { posts, isPostLiked, toggleLikePost, isFollowing } = useSocial()

  const [tab, setTab] = useState<Tab>("for-you")
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  if (getProfile().username.trim().length === 0) {
    return <UsernameRequiredOverlay />
  }

  const publicPosts = posts.filter(
    (p) => p.visibility !== "private" && !p.archived && (p.moderationStatus ?? "posted") === "posted",
  )
  const feedPosts =
    tab === "for-you"
      ? publicPosts
      : publicPosts.filter((p) => p.author.handle === YOU.handle || isFollowing(p.author.handle))

  const query = searchQuery.trim().toLowerCase()

  if (searchOpen) {
    const matchingAuthors = ALL_AUTHORS.filter(
      (a) => query.length === 0 || a.name.toLowerCase().includes(query) || a.handle.toLowerCase().includes(query),
    )
    const matchingPosts =
      query.length === 0
        ? []
        : posts.filter(
            (p) =>
              p.visibility !== "private" &&
              !p.archived &&
              (p.moderationStatus ?? "posted") === "posted" &&
              (p.text.toLowerCase().includes(query) ||
                p.author.name.toLowerCase().includes(query) ||
                p.author.handle.toLowerCase().includes(query)),
          )

    return (
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6 lg:max-w-2xl lg:px-10 lg:pt-12">
        <div className="flex items-center justify-between gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => {
              setSearchOpen(false)
              setSearchQuery("")
            }}
            aria-label="Close search"
            className="tap-scale flex size-10 items-center justify-center rounded-full bg-surface text-ink hover:bg-surface-raised"
          >
            <ArrowLeft className="size-[18px]" />
          </button>
          <p className="text-[17px] font-bold text-ink">Search</p>
          <span className="inline-flex w-10 items-center justify-end" />
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-full border border-border-strong bg-canvas px-4 py-3">
          <MagnifyingGlass className="size-4 shrink-0 text-ink-faint" />
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </div>

        {query.length === 0 ? (
          <>
            <p className="mb-1 mt-6 text-sm font-semibold text-ink-faint">Follow suggestions</p>
            <div className="flex flex-col">
              {ALL_AUTHORS.map((author) => (
                <SuggestionRow key={author.handle} author={author} />
              ))}
            </div>
          </>
        ) : (
          <>
            {matchingAuthors.length > 0 && (
              <>
                <p className="mb-1 mt-6 text-sm font-semibold text-ink-faint">People</p>
                <div className="flex flex-col">
                  {matchingAuthors.map((author) => (
                    <SuggestionRow key={author.handle} author={author} />
                  ))}
                </div>
              </>
            )}
            {matchingPosts.length > 0 && (
              <>
                <p className="mb-1 mt-6 text-sm font-semibold text-ink-faint">Posts</p>
                <div className="flex flex-col">
                  {matchingPosts.map((post) => (
                    <SocialPostCard
                      key={post.id}
                      post={post}
                      liked={isPostLiked(post.id)}
                      onToggleLike={() => toggleLikePost(post.id)}
                    />
                  ))}
                </div>
              </>
            )}
            {matchingAuthors.length === 0 && matchingPosts.length === 0 && (
              <p className="py-12 text-center text-sm text-ink-faint">No results for "{searchQuery}"</p>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl pb-16 lg:max-w-2xl">
      <div className="sticky top-0 z-30 bg-canvas/85 px-4 pb-4 pt-4 backdrop-blur-md sm:px-6 sm:pt-6 lg:static lg:bg-transparent lg:px-10 lg:pb-0 lg:pt-12 lg:backdrop-blur-none">
        <div className="flex items-center justify-between gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="tap-scale flex size-10 items-center justify-center rounded-full bg-surface text-ink hover:bg-surface-raised"
          >
            <ArrowLeft className="size-[18px]" />
          </button>
          <p className="text-[17px] font-bold text-ink">Social</p>
          <span className="inline-flex w-10 items-center justify-end">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="tap-scale flex size-10 items-center justify-center rounded-full bg-surface text-ink hover:bg-surface-raised"
            >
              <MagnifyingGlass className="size-[18px]" />
            </button>
          </span>
        </div>

        <div className="mt-4 flex border-b border-border lg:mt-0">
          <button
            type="button"
            onClick={() => setTab("for-you")}
            className={clsx(
              "flex-1 border-b-[3px] pb-3.5 text-sm font-semibold transition-colors",
              tab === "for-you" ? "border-brand text-brand" : "border-transparent text-ink-faint hover:text-ink",
            )}
          >
            For You
          </button>
          <button
            type="button"
            onClick={() => setTab("following")}
            className={clsx(
              "flex-1 border-b-[3px] pb-3.5 text-sm font-semibold transition-colors",
              tab === "following" ? "border-brand text-brand" : "border-transparent text-ink-faint hover:text-ink",
            )}
          >
            Following
          </button>
        </div>
      </div>

      <div className="mt-1 flex flex-col px-4 sm:px-6 lg:px-10">
        {feedPosts.length === 0 && (
          <p className="py-12 text-center text-sm text-ink-faint">
            {tab === "following" ? "Follow people to see their posts here." : "Nothing here yet."}
          </p>
        )}
        {feedPosts.map((post) => (
          <SocialPostCard
            key={post.id}
            post={post}
            liked={isPostLiked(post.id)}
            onToggleLike={() => toggleLikePost(post.id)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => navigate("/social/tadabbur/new")}
        aria-label="New tadabbur — reflect on a verse"
        className="tap-scale fixed bottom-[136px] right-6 z-40 flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan to-brand text-white shadow-lg shadow-cyan/40 hover:shadow-cyan/50"
      >
        <BookOpen weight="fill" className="size-5" />
      </button>

      <button
        type="button"
        onClick={() => navigate("/social/new")}
        aria-label="Write a post"
        className="tap-scale fixed bottom-20 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-strong text-white shadow-xl shadow-brand/50 hover:shadow-brand/60"
      >
        <ComposeIcon className="size-6" />
      </button>
    </div>
  )
}
