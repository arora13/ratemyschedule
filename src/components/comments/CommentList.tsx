import { useState } from "react"
import { MessageSquare, User } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { Comment } from "@/lib/types"
import { mockComments } from "@/lib/mockData"

interface CommentListProps {
  scheduleId: string
}

export function CommentList({ scheduleId }: CommentListProps) {
  // grab comments for this schedule (mocked for now)
  const [comments] = useState<Comment[]>(mockComments[scheduleId] || [])

  // lil helper to format dates in a friendly way
  const niceDate = (iso: string | number | Date) =>
    new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })

  // empty state — tell the user there's nothing yet
  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        {/* icon just to make it feel less empty */}
        <MessageSquare
          className="h-12 w-12 text-muted-foreground mx-auto mb-4"
          aria-hidden="true"
        />
        <h3 className="text-lg font-semibold mb-2">no comments yet</h3>
        <p className="text-muted-foreground">be the first to share your thoughts</p>
      </div>
    )
  }

  // render each comment in a simple card
  return (
    <div className="space-y-4">
      {comments.map((c) => (
        <Card key={c.id} className="p-4">
          <div className="space-y-3">
            {/* header row: avatar-ish + author + timestamp */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* simple circle avatar placeholder */}
                <div
                  className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center"
                  aria-hidden="true"
                >
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>

                {/* author handle + time */}
                <div>
                  {/* handle: small but readable */}
                  <p className="font-medium text-sm">{c.author.handle}</p>

                  {/* timestamp: lighter so it doesn’t shout */}
                  <p className="text-xs text-muted-foreground">{niceDate(c.created_at)}</p>
                </div>
              </div>
            </div>

            {/* the actual comment body */}
            <p className="text-sm leading-relaxed">{c.body}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
