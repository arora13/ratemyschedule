import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// define the badge styles based on variants
// cva helps keep the class juggling organized
const badgeVariants = cva(
  // base styles for all badges
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // default look — solid primary bg
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        // secondary look — kinda muted
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // red warning vibes
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        // just an outline with text
        outline: "text-foreground",
      },
    },
    // fallback if no variant is passed
    defaultVariants: {
      variant: "default",
    },
  }
)

// the badge props include normal div stuff + variant stuff
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

// basic badge component
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

// export so you can use it anywhere
export { Badge, badgeVariants }
