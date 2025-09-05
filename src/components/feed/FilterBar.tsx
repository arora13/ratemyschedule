import { Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

interface FilterBarProps {
  filters: {
    school: string
    year: string
    major: string
    sort: string
  }
  onFilterChange: (key: string, value: string) => void
}

// filter and sort controls for the feed
export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  // little helper so we do not repeat the handler inline everywhere
  const change = (key: keyof FilterBarProps["filters"]) => (value: string) =>
    onFilterChange(key, value)

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* tiny header with an icon so folks notice these controls */}
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4" aria-hidden="true" />
          <span>filters</span>
        </div>

        {/* all the selects live here and wrap on small screens */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* school select */}
          <div className="min-w-[140px]">
            <Select value={filters.school} onValueChange={change("school")}>
              <SelectTrigger aria-label="filter by school">
                <SelectValue placeholder="all schools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">all schools</SelectItem>
                <SelectItem value="State University">state university</SelectItem>
                <SelectItem value="Tech Institute">tech institute</SelectItem>
                <SelectItem value="City College">city college</SelectItem>
                <SelectItem value="Community College">community college</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* year select */}
          <div className="min-w-[120px]">
            <Select value={filters.year} onValueChange={change("year")}>
              <SelectTrigger aria-label="filter by year">
                <SelectValue placeholder="all years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">all years</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* major select */}
          <div className="min-w-[160px]">
            <Select value={filters.major} onValueChange={change("major")}>
              <SelectTrigger aria-label="filter by major">
                <SelectValue placeholder="all majors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">all majors</SelectItem>
                <SelectItem value="Computer Science">computer science</SelectItem>
                <SelectItem value="Mechanical Engineering">mechanical engineering</SelectItem>
                <SelectItem value="Business Administration">business administration</SelectItem>
                <SelectItem value="Psychology">psychology</SelectItem>
                <SelectItem value="Biology">biology</SelectItem>
                <SelectItem value="Mathematics">mathematics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* sort select sticks to the right when there is room */}
          <div className="min-w-[120px] ml-auto">
            <Select value={filters.sort} onValueChange={change("sort")}>
              <SelectTrigger aria-label="sort feed">
                <SelectValue placeholder="sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">newest first</SelectItem>
                <SelectItem value="trending">most popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  )
}
