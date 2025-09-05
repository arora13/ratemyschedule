import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface CommentFormProps {
  scheduleId: string
  onComment?: (comment: string) => void
}

export function CommentForm({ scheduleId, onComment }: CommentFormProps) {
  // toast hook to show lil messages
  const { toast } = useToast()

  // track comment text
  const [comment, setComment] = useState("")

  // track loading state so button shows spinner-ish
  const [isSubmitting, setIsSubmitting] = useState(false)

  // handle submit when user hits post
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // dont reload page

    // if comment is empty, just bail with a toast
    if (!comment.trim()) {
      toast({
        title: "comment cannot be empty",
        description: "please type something before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true) // lock the button

    try {
      // fake api delay so it feels real
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // call the parent callback if provided
      onComment?.(comment)

      // clear text field
      setComment("")

      // success toast
      toast({
        title: "comment posted",
        description: "your comment was added",
      })
    } catch (err) {
      // if something went wrong, let the user know
      toast({
        title: "failed to post",
        description: "try again later maybe",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false) // unlock button
    }
  }

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* textarea for typing comments */}
        <Textarea
          placeholder="share your thoughts..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[80px] resize-none"
          maxLength={500}
        />

        <div className="flex items-center justify-between">
          {/* char counter so user knows the limit */}
          <p className="text-xs text-muted-foreground">
            {comment.length}/500 characters
          </p>

          {/* submit button with icon and loading state */}
          <Button
            type="submit"
            size="sm"
            disabled={!comment.trim() || isSubmitting}
            className="flex items-center gap-2"
          >
            <Send className="h-3 w-3" />
            {isSubmitting ? "posting..." : "post"}
          </Button>
        </div>
      </form>
    </Card>
  )
}
