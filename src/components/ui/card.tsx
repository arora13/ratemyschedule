import * as React from "react"

import { cn } from "@/lib/utils"

// basic wrapper card component
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref} // let parent get ref to the div
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm", // lil border + bg + shadow
      className // merge user classes
    )}
    {...props} // spread the rest of the props
  />
))
Card.displayName = "Card"

// header area of the card
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)} // stack things with some spacing
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

// card title (usually the h3)
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight", // big and bold
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

// smaller descriptive text under the title
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)} // muted gray look
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

// main body area of the card
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-6 pt-0", className)} // padding but no top padding
    {...props} 
  />
))
CardContent.displayName = "CardContent"

// footer area (usually buttons/links at the bottom)
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)} // flex row with padding
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// export all the parts so ppl can compose their own card layout
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
