import { Link } from "react-router-dom"
import { MessageSquare, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid"
import { ReactionBar } from "@/components/schedule/ReactionBar"
import type { Schedule } from "@/lib/types"

interface ScheduleCardProps {
  schedule: Schedule
  onReaction?: (scheduleId: string, kind: "up" | "down") => void
}

export function ScheduleCard({ schedule, onReaction }: ScheduleCardProps) {
  // helper so we pass id + kind up to parent
  const handleReaction = (kind: "up" | "down") => {
    onReaction?.(schedule.id, kind)
  }

  return (
    <Card className="p-6 transition-smooth hover:shadow-soft">
      <div className="space-y-4">
        {/* header row with title + meta info */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            {/* link to the full schedule */}
            <Link
              to={`/schedule/${schedule.id}`}
              className="text-lg font-semibold hover:text-primary transition-colors"
            >
              {schedule.title || `${schedule.term} schedule`}
            </Link>

            {/* author + created date */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>by {schedule.authorHandle || schedule.author?.handle || 'anonymous'}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(schedule.createdAt || schedule.created_at!).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* lil badges for school + major if present */}
          <div className="flex gap-2">
            {(schedule.collegeSlug || schedule.school) && (
              <Badge variant="outline" className="text-xs">
                {schedule.collegeSlug || schedule.school}
              </Badge>
            )}
            {schedule.major && (
              <Badge variant="outline" className="text-xs">
                {schedule.major}
              </Badge>
            )}
            {schedule.level && (
              <Badge variant="outline" className="text-xs">
                {schedule.level}
              </Badge>
            )}
          </div>
        </div>

        {/* mini grid preview of schedule events */}
        <ScheduleGrid events={schedule.events || []} compact={true} className="max-h-32" />

        {/* footer row with reactions + comments + view link */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-4">
            {/* thumbs up/down bar */}
            <ReactionBar
              reactions={schedule.reactions}
              onReaction={handleReaction}
              compact={true}
            />

            {/* button to jump to comments */}
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/schedule/${schedule.id}`} className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span className="text-xs">{schedule.commentsCount || schedule.comments_count || 0} comments</span>
              </Link>
            </Button>
          </div>

          {/* quick link to see full details */}
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/schedule/${schedule.id}`}>view details</Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
