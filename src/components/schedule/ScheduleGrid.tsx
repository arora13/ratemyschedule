import { EventIn } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ScheduleGridProps {
  events: EventIn[]
  className?: string
  compact?: boolean
}

// weekdays we care about
const DAYS = [
  { short: "Mon", full: "Monday", value: 1 },
  { short: "Tue", full: "Tuesday", value: 2 },
  { short: "Wed", full: "Wednesday", value: 3 },
  { short: "Thu", full: "Thursday", value: 4 },
  { short: "Fri", full: "Friday", value: 5 },
]

// slots for the main grid (8am - 6pm)
const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
]

export function ScheduleGrid({ events, className, compact = false }: ScheduleGridProps) {
  // helper: filter events by day
  const getEventsForDay = (dayValue: number) => {
    return events.filter((e) => e.day_of_week === dayValue)
  }

  // helper: parse "HH:mm" into float hours (e.g. 9:30 → 9.5)
  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return hours + minutes / 60
  }

  // figure out where event block goes in vertical timeline
  const getEventPosition = (event: EventIn) => {
    const startHour = parseTime(event.start_time)
    const endHour = parseTime(event.end_time)
    const duration = endHour - startHour

    // grid starts at 8am → map hours to pixels (60px per hr)
    const top = Math.max(0, (startHour - 8) * 60)
    const height = duration * 60

    return { top, height }
  }

  // quick color assigner, based on either given color or hash of title
  const getEventColor = (event: EventIn) => {
    if (event.color) return event.color

    const hash = event.title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const colors = [
      "bg-primary/20 border-primary",
      "bg-secondary/20 border-secondary",
      "bg-accent/20 border-accent",
      "bg-destructive/20 border-destructive",
    ]
    return colors[hash % colors.length]
  }

  // compact version → small preview grid (no time rows, just day columns)
  if (compact) {
    return (
      <div className={cn("grid grid-cols-5 gap-1 p-2 bg-card rounded-lg border", className)}>
        {DAYS.map((day) => (
          <div key={day.value} className="space-y-1">
            {/* tiny header per day */}
            <div className="text-xs font-medium text-muted-foreground text-center p-1">
              {day.short}
            </div>
            {/* each event shown as lil block */}
            {getEventsForDay(day.value).map((event, idx) => (
              <div
                key={idx}
                className={cn("text-xs p-1 rounded border-l-2 truncate", getEventColor(event))}
                title={`${event.title} - ${event.start_time}-${event.end_time}`}
              >
                {event.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  // full schedule grid → time column + day columns
  return (
    <Card className={cn("p-4", className)}>
      <div className="grid grid-cols-6 gap-4">
        {/* first col = times */}
        <div className="space-y-4">
          <div className="h-8" /> {/* spacer so times line up with headers */}
          {TIME_SLOTS.map((time) => (
            <div key={time} className="h-12 flex items-start text-sm text-muted-foreground">
              {time}
            </div>
          ))}
        </div>

        {/* now loop through days */}
        {DAYS.map((day) => (
          <div key={day.value} className="space-y-1">
            {/* header w/ full or short day name */}
            <div className="h-8 flex items-center justify-center font-medium bg-muted/30 rounded">
              <span className="hidden sm:inline">{day.full}</span>
              <span className="sm:hidden">{day.short}</span>
            </div>

            {/* column body → timeline grid + events */}
            <div className="relative" style={{ height: `${TIME_SLOTS.length * 48}px` }}>
              {/* faint lines for each hour */}
              {TIME_SLOTS.map((_, idx) => (
                <div
                  key={idx}
                  className="absolute w-full border-t border-border/50"
                  style={{ top: idx * 48 }}
                />
              ))}

              {/* drop events in the right spots */}
              {getEventsForDay(day.value).map((event, idx) => {
                const pos = getEventPosition(event)
                return (
                  <div
                    key={idx}
                    className={cn(
                      "absolute w-full p-2 rounded border-l-4 text-sm transition-smooth hover:shadow-soft cursor-pointer",
                      getEventColor(event)
                    )}
                    style={{
                      top: pos.top,
                      height: Math.max(32, pos.height),
                      zIndex: 1,
                    }}
                    title={`${event.location || "no location"}`}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {event.start_time}-{event.end_time}
                    </div>
                    {event.location && (
                      <div className="text-xs text-muted-foreground truncate">
                        {event.location}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
