import { ChatCircle, Heart, PencilSimple, ShareNetwork, type Icon } from "@phosphor-icons/react"
import type { AccentColor } from "./colors"

export interface SocialEarnWay {
  id: string
  label: string
  points: number
  icon: Icon
  color: AccentColor
}

export const SOCIAL_WAYS_TO_EARN: SocialEarnWay[] = [
  { id: "post", label: "Post on Social", points: 50, icon: PencilSimple, color: "brand" },
  { id: "comment", label: "Comment on a post", points: 25, icon: ChatCircle, color: "cyan" },
  { id: "like", label: "Like a post", points: 10, icon: Heart, color: "rose" },
  { id: "share", label: "Share a deed on Social", points: 30, icon: ShareNetwork, color: "violet" },
]

export const SOCIAL_WEEKLY_CAP = 200
