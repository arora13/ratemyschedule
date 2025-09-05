// ratemyschedule type defs

// event inside a schedule
export type EventIn = {
    title: string
    day_of_week: 1 | 2 | 3 | 4 | 5 | 6 | 7 // mon-sun
    start_time: string // "09:00"
    end_time: string   // "10:15"
    location?: string
    color?: string
  }
  
  // a schedule (the main thing we post to the feed)
  export type Schedule = {
    id: string
    title?: string
    term?: string
    events?: EventIn[]
    collegeSlug?: string
    major?: string
    level?: "freshman" | "sophomore" | "junior" | "senior"
    authorHandle?: string
    reactions: {
      up: number
      down: number
      mine?: "up" | "down" | null
    }
    commentsCount: number
    createdAt: string
    deletedAt?: string | null
    // Legacy fields for backward compatibility
    author?: {
      id: string
      handle: string
    }
    comments_count?: number
    created_at?: string
    school?: string
    year?: string
  }
  
  // a single comment on a schedule
  export type Comment = {
    id: string
    body: string
    created_at: string
    author: {
      id: string
      handle: string
    }
    schedule_id: string
  }
  
  // user basics
  export type User = {
    id: string
    handle: string
  }
  
  // api response when uploading a file
  export type UploadResponse = {
    ok: boolean
    saved_as?: string
    parsed?: {
      term: string
      events: EventIn[]
    }
    error?: string
  }
  
  // feed response → basically a paginated list of schedules
  export type FeedResponse = {
    items: Schedule[]
    nextCursor?: string
  }
  
  // reaction response → new counts + what i picked
  export type ReactionResponse = {
    up: number
    down: number
    mine: "up" | "down" | null
  }
  
  // comments api response
  export type CommentsResponse = {
    items: Comment[]
  }
  
  // some handy utility types
  export type ReactionKind = "up" | "down"
  export type SortOption = "new" | "trending"
  