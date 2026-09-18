import { accentClasses } from "../lib/colors"
import { CATEGORY_ICONS } from "./icons"
import { getCategory, type CategoryId } from "../lib/data"
import clsx from "clsx"

export function CategoryBadge({
  categoryId,
  size = "sm",
}: {
  categoryId: CategoryId
  size?: "sm" | "md"
}) {
  const category = getCategory(categoryId)
  const classes = accentClasses(category.color)
  const Icon = CATEGORY_ICONS[categoryId]
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        classes.bg,
        classes.text,
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
      )}
    >
      <Icon weight="fill" className={size === "sm" ? "size-3.5" : "size-4"} />
      {category.label}
    </span>
  )
}
