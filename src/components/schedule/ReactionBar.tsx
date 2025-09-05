import { ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ReactionBarProps {
  reactions: {
    up: number
    down: number
    mine?: "up" | "down" | null
  }
  onReaction: (kind: "up" | "down") => void
  compact?: boolean
}

export function ReactionBar({ reactions, onReaction, compact = false }: ReactionBarProps) {
  return (
    <div className="flex items-center gap-2">
      {/* thumbs up button */}
      <Button
        variant={reactions.mine === "up" ? "default" : "ghost"}
        size={compact ? "sm" : "default"}
        onClick={() => onReaction("up")}
        className={cn(
          "transition-smooth",
          reactions.mine === "up" && "bg-primary text-primary-foreground"
        )}
      >
        {/* icon with spacing depending on compact mode */}
        <ThumbsUp className={cn("h-4 w-4", compact ? "mr-1" : "mr-2")} />
        {/* show how many ups we got */}
        <span className={compact ? "text-xs" : "text-sm"}>{reactions.up}</span>
      </Button>

      {/* thumbs down button */}
      <Button
        variant={reactions.mine === "down" ? "destructive" : "ghost"}
        size={compact ? "sm" : "default"}
        onClick={() => onReaction("down")}
        className={cn(
          "transition-smooth",
          reactions.mine === "down" && "bg-destructive text-destructive-foreground"
        )}
      >
        {/* icon with spacing depending on compact mode */}
        <ThumbsDown className={cn("h-4 w-4", compact ? "mr-1" : "mr-2")} />
        {/* show how many downs we got */}
        <span className={compact ? "text-xs" : "text-sm"}>{reactions.down}</span>
      </Button>
    </div>
  )
}
