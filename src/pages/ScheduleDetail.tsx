import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Share, Flag, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { ReactionBar } from "@/components/schedule/ReactionBar";
import { CommentList } from "@/components/comments/CommentList";
import { CommentForm } from "@/components/comments/CommentForm";
import { Schedule } from "@/lib/types";
import { mockSchedules, mockComments } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

/**
 * Detailed view of a single schedule with reactions and comments
 */
export default function ScheduleDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<Schedule>(mockSchedules.find(s => s.id === id) || mockSchedules[0]);

  const handleReaction = async (kind: "up" | "down") => {
    try {
      // Optimistic update
      const wasAlreadyReacted = schedule.reactions.mine === kind;
      const newReactions = { ...schedule.reactions };
      
      if (wasAlreadyReacted) {
        // Remove reaction
        newReactions.mine = null;
        newReactions[kind] -= 1;
      } else {
        // Add reaction (and remove opposite if exists)
        if (schedule.reactions.mine) {
          newReactions[schedule.reactions.mine] -= 1;
        }
        newReactions.mine = kind;
        newReactions[kind] += 1;
      }
      
      setSchedule(prev => ({ ...prev, reactions: newReactions }));
      
      toast({
        title: wasAlreadyReacted ? "Reaction removed" : "Reaction added",
        description: `You ${wasAlreadyReacted ? 'removed your' : 'gave a'} ${kind === 'up' ? '👍' : '👎'}`,
      });
    } catch (error) {
      toast({
        title: "Failed to update reaction", 
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Share this schedule with others.",
    });
  };

  const handleReport = () => {
    toast({
      title: "Schedule reported",
      description: "Thank you for keeping our community safe.",
    });
  };

  if (!schedule) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Schedule not found</h2>
          <p className="text-muted-foreground mb-4">
            This schedule may have been removed or doesn't exist.
          </p>
          <Button asChild>
            <Link to="/feed">Back to Feed</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link to="/feed" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Feed
            </Link>
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleReport}>
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Schedule Info */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{schedule.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>by {schedule.author.handle}</span>
                <span>•</span>
                <span>{new Date(schedule.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                {schedule.school && <Badge variant="outline">{schedule.school}</Badge>}
                {schedule.major && <Badge variant="outline">{schedule.major}</Badge>}
                {schedule.year && <Badge variant="outline">{schedule.year}</Badge>}
              </div>
            </div>
            
            <ReactionBar
              reactions={schedule.reactions}
              onReaction={handleReaction}
            />
          </div>

          {/* Schedule Grid */}
          <ScheduleGrid events={schedule.events} />
        </Card>

        {/* Comments Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            Comments ({schedule.comments_count})
          </h2>
          
          <div className="space-y-4">
            <CommentForm scheduleId={schedule.id} />
            <CommentList scheduleId={schedule.id} />
          </div>
        </Card>
      </div>
    </div>
  );
}