import { Upload, Home, User, GraduationCap } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Navigation() {
  // use location so we know which link is active
  const location = useLocation()

  // helper to check if current path matches
  const isActive = (path: string) => location.pathname === path

  return (
    // sticky nav up top w/ glass background
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-glass backdrop-blur-glass">
      <div className="container flex h-16 items-center justify-between">
        {/* left side: logo + main links */}
        <div className="flex items-center space-x-8">
          {/* app logo thingy */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">r</span>
            </div>
            <span className="text-lg font-semibold">ratemyschedule</span>
          </Link>

          {/* main nav links */}
          <div className="flex items-center space-x-1">
            {/* upload button */}
            <Button variant={isActive("/") ? "glass" : "ghost"} size="sm" asChild>
              <Link to="/" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                upload
              </Link>
            </Button>

            {/* feed button */}
            <Button variant={isActive("/feed") ? "glass" : "ghost"} size="sm" asChild>
              <Link to="/feed" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                feed
              </Link>
            </Button>

            {/* colleges button */}
            <Button variant={isActive("/colleges") ? "glass" : "ghost"} size="sm" asChild>
              <Link to="/colleges" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                colleges
              </Link>
            </Button>
          </div>
        </div>

        {/* right side: profile/settings */}
        <div className="flex items-center space-x-2">
          <Button variant={isActive("/settings") ? "glass" : "ghost"} size="sm" asChild>
            <Link to="/settings" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              profile
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
