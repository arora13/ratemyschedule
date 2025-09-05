import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { useToast } from "@/hooks/use-toast";
import { EventIn, UploadResponse } from "@/lib/types";
// Removed Select components - using native HTML selects for better reliability

// College type for the comprehensive list from backend
type College = {
  slug: string;
  name: string;
};

const MAJORS = [
  "computer science",
  "electrical engineering", 
  "mechanical engineering",
  "biology",
  "psychology",
  "business"
];

// dumb little hero img fallback (use anything or remove the top hero entirely)
const heroImage =
  "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1600&auto=format&fit=crop";

type Tab = "upload" | "manual";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // core state for the schedule-in-progress
  const [term, setTerm] = useState("Fall 2024");
  const [events, setEvents] = useState<EventIn[]>([]);
  const [selectedCollegeSlug, setSelectedCollegeSlug] = useState<string>("");
  const [selectedMajor, setSelectedMajor] = useState<string>("");

  // ui state
  const [activeTab, setActiveTab] = useState<Tab>("upload");
  const [isPublishing, setIsPublishing] = useState(false);

  // colleges state - fetched from backend
  const [colleges, setColleges] = useState<College[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(true);

  // Fetch colleges from backend on component mount
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch('/api/colleges');
        if (response.ok) {
          const collegesData = await response.json();
          setColleges(collegesData);
        } else {
          console.error('Failed to fetch colleges');
          toast({
            title: "Warning",
            description: "Could not load college list. Using limited options.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching colleges:', error);
        toast({
          title: "Warning", 
          description: "Could not load college list. Using limited options.",
          variant: "destructive",
        });
      } finally {
        setLoadingColleges(false);
      }
    };

    fetchColleges();
  }, [toast]);

  // manual class editor scratch fields
  const [mTitle, setMTitle] = useState("");
  const [mDay, setMDay] = useState<"1" | "2" | "3" | "4" | "5" | "6" | "7">("1");
  const [mStart, setMStart] = useState("09:00");
  const [mEnd, setMEnd] = useState("10:00");
  const [mLocation, setMLocation] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // when a file is picked, just clear existing events so we don't mix
  const handleFileSelect = () => {
    // reset parse results, keep tag selections though (feels nicer)
    setEvents([]);
  };

  // REAL upload + parse - calls backend API
  const handleUpload = async (file: File): Promise<void> => {
    // super basic guard so users choose tags before uploading
    if (!selectedCollegeSlug || !selectedMajor) {
      throw new Error("please choose your college and major first");
    }

    try {
      console.log('📁 Starting REAL upload for:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('schedule', file);
      
      // Make REAL API call to backend
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ REAL upload successful:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }
      
      // Set the parsed events from backend
      setEvents(result.events);
      
      toast({
        title: "✅ Schedule parsed successfully!",
        description: `Found ${result.events.length} classes - review below, then publish`,
      });
      
    } catch (error) {
      console.error('❌ REAL Upload error:', error);
      throw new Error("Upload failed: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  // add or update a manual class
  const addOrUpdateClass = () => {
    // quick validation
    if (!mTitle.trim()) {
      toast({
        title: "class needs a title",
        description: "give it a short name like 'calc ii' or 'bio lab'",
        variant: "destructive",
      });
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(mStart) || !/^\d{2}:\d{2}$/.test(mEnd)) {
      toast({
        title: "time format is hh:mm",
        description: "example: 09:00 to 10:15",
        variant: "destructive",
      });
      return;
    }

    const classData: EventIn = {
      title: mTitle,
      day_of_week: Number(mDay) as EventIn["day_of_week"],
      start_time: mStart,
      end_time: mEnd,
      location: mLocation || undefined,
    };

    if (editingIndex !== null) {
      // Update existing class
      setEvents((prev) => prev.map((event, idx) => 
        idx === editingIndex ? classData : event
      ));
      setEditingIndex(null);
      toast({
        title: "class updated",
        description: "changes saved successfully",
      });
    } else {
      // Add new class
      setEvents((prev) => [...prev, classData]);
    }

    // clear scratch
    setMTitle("");
    setMLocation("");
    setMStart("09:00");
    setMEnd("10:00");
    setMDay("1");
  };

  // delete a manual class by index
  const removeEvent = (idx: number) => {
    setEvents((prev) => prev.filter((_, i) => i !== idx));
    if (editingIndex === idx) {
      setEditingIndex(null);
      // Clear form when deleting the currently edited item
      setMTitle("");
      setMLocation("");
      setMStart("09:00");
      setMEnd("10:00");
      setMDay("1");
    }
  };

  // start editing a class
  const startEditEvent = (idx: number) => {
    const event = events[idx];
    setMTitle(event.title);
    setMDay(String(event.day_of_week) as any);
    setMStart(event.start_time);
    setMEnd(event.end_time);
    setMLocation(event.location || "");
    setEditingIndex(idx);
  };

  // cancel editing
  const cancelEdit = () => {
    setEditingIndex(null);
    setMTitle("");
    setMLocation("");
    setMStart("09:00");
    setMEnd("10:00");
    setMDay("1");
  };

  // REAL publish function - saves to backend
  const handlePublish = async () => {
    if (!selectedCollegeSlug || !selectedMajor) {
      toast({
        title: "missing tags",
        description: "please select your college and major before publishing",
        variant: "destructive",
      });
      return;
    }
    if (events.length === 0) {
      toast({
        title: "no classes yet",
        description: "add at least one class or upload a schedule",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    
    try {
      console.log('📝 Starting REAL publish...');
      
      // Prepare the schedule data
      const scheduleData = {
        title: `${term} Schedule`,
        collegeSlug: selectedCollegeSlug,
        major: selectedMajor,
        level: "junior",
        events: events,
        authorHandle: "anonymous"
      };
      
      console.log('📊 Sending to backend:', scheduleData);
      
      // Make REAL API call to backend
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ REAL publish successful:', result);
      
      toast({
        title: "✅ Schedule published successfully! 🎉",
        description: `Your ${selectedCollegeSlug} ${selectedMajor} schedule is now live!`,
      });

      // Navigate to feed after successful publish
      setTimeout(() => {
        navigate(`/feed?college=${encodeURIComponent(selectedCollegeSlug)}&major=${encodeURIComponent(selectedMajor)}`);
      }, 1000);
      
    } catch (error) {
      console.error('❌ REAL Publish error:', error);
      toast({
        title: "❌ Failed to publish",
        description: error instanceof Error ? error.message : "Network error - try again",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // little helper to label the selected school
  const selectedSchoolLabel =
    colleges.find((c) => c.slug === selectedCollegeSlug)?.name || "—";

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <div className="space-y-8">
        {/* hero */}
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={heroImage}
            alt="schedule visualization"
            className="w-full h-56 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/85 to-background/30 flex items-center">
            <div className="px-6 space-y-2">
              <h1 className="text-3xl font-bold">
                share your schedule
              </h1>
              <p className="text-sm text-foreground/90 max-w-xl">
                upload + auto-parse, or just add classes by hand. tag your college + major so others can find it.
              </p>
            </div>
          </div>
        </div>

        {/* tags */}
        <Card className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {/* college select */}
            <div className="space-y-2">
              <div className="text-sm font-medium">college</div>
              <select
                value={selectedCollegeSlug}
                onChange={(e) => setSelectedCollegeSlug(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                disabled={loadingColleges}
              >
                <option value="">
                  {loadingColleges ? "Loading colleges..." : "choose college"}
                </option>
                {colleges.map((college) => (
                  <option key={college.slug} value={college.slug}>
                    {college.name}
                  </option>
                ))}
              </select>
              <div className="text-xs text-muted-foreground">
                selected: <Badge variant="outline">{selectedSchoolLabel}</Badge>
                {colleges.length > 0 && (
                  <span className="ml-2">({colleges.length} colleges available)</span>
                )}
              </div>
            </div>

            {/* major select */}
            <div className="space-y-2">
              <div className="text-sm font-medium">major</div>
              <select
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">choose major</option>
                {MAJORS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <div className="text-xs text-muted-foreground">
                tag your schedule so it shows up in major filters
              </div>
            </div>

            {/* term text input (simple) */}
            <div className="space-y-2">
              <div className="text-sm font-medium">term</div>
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="e.g., Fall 2024"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none"
              />
              <div className="text-xs text-muted-foreground">
                keep it short, like &quot;fall 2024&quot; or &quot;spring 2025&quot;
              </div>
            </div>
          </div>
        </Card>

        {/* tabs: upload vs manual */}
        <Card className="p-6">
          <div className="mb-4 flex gap-2">
            <Button
              variant={activeTab === "upload" ? "default" : "outline"}
              onClick={() => setActiveTab("upload")}
            >
              upload & parse
            </Button>
            <Button
              variant={activeTab === "manual" ? "default" : "outline"}
              onClick={() => setActiveTab("manual")}
            >
              manual entry
            </Button>
          </div>

          {activeTab === "upload" ? (
            <UploadDropzone onFileSelect={handleFileSelect} onUpload={handleUpload} />
          ) : (
            <div className="space-y-4">
              {/* manual entry form (tiny and forgiving) */}
              <div className="grid gap-3 md:grid-cols-5">
                <input
                  value={mTitle}
                  onChange={(e) => setMTitle(e.target.value)}
                  placeholder="class title (e.g., calc ii)"
                  className="rounded-md border bg-background px-3 py-2 text-sm outline-none md:col-span-2"
                />
                <select
                  value={mDay}
                  onChange={(e) => setMDay(e.target.value as any)}
                  className="rounded-md border bg-background px-3 py-2 text-sm outline-none"
                >
                  <option value="1">mon</option>
                  <option value="2">tue</option>
                  <option value="3">wed</option>
                  <option value="4">thu</option>
                  <option value="5">fri</option>
                  <option value="6">sat</option>
                  <option value="7">sun</option>
                </select>
                <input
                  value={mStart}
                  onChange={(e) => setMStart(e.target.value)}
                  placeholder="start (hh:mm)"
                  className="rounded-md border bg-background px-3 py-2 text-sm outline-none"
                />
                <input
                  value={mEnd}
                  onChange={(e) => setMEnd(e.target.value)}
                  placeholder="end (hh:mm)"
                  className="rounded-md border bg-background px-3 py-2 text-sm outline-none"
                />
                <input
                  value={mLocation}
                  onChange={(e) => setMLocation(e.target.value)}
                  placeholder="location (optional)"
                  className="rounded-md border bg-background px-3 py-2 text-sm outline-none md:col-span-2"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={addOrUpdateClass}>
                  {editingIndex !== null ? "update class" : "add class"}
                </Button>
                {editingIndex !== null && (
                  <Button variant="outline" onClick={cancelEdit}>
                    cancel edit
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setEvents([])}
                >
                  clear all
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* live preview */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">preview</h2>
              <p className="text-muted-foreground text-sm">
                {events.length} classes — {term}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{selectedSchoolLabel || "college"}</Badge>
              <Badge variant="secondary">{selectedMajor || "major"}</Badge>
            </div>
          </div>

          <div className="mt-4">
            {events.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                nothing here yet — upload a schedule or add a class.
              </div>
            ) : (
              <ScheduleGrid events={events} />
            )}
          </div>

          {/* simple remove list (so users can fix mistakes) */}
          {events.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-sm font-medium">quick edits</div>
              <div className="space-y-2">
                {events.map((e, idx) => (
                  <div
                    key={`${e.title}-${idx}`}
                    className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                      editingIndex === idx ? "bg-accent" : ""
                    }`}
                  >
                    <div className="truncate">
                      {e.title} — day {e.day_of_week}, {e.start_time}-{e.end_time}
                      {e.location ? ` @ ${e.location}` : ""}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => startEditEvent(idx)}
                        disabled={editingIndex === idx}
                      >
                        {editingIndex === idx ? "editing..." : "edit"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => removeEvent(idx)}>
                        remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* publish row */}
          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <div className="text-xs text-muted-foreground">
              publishing will tag your schedule with your selected college + major so it shows in filtered feeds
            </div>
            <Button onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? "publishing..." : "publish to feed"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
