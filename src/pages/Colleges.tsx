// src/pages/Colleges.tsx
// direct colleges page: grid of buttons -> /feed?college=<slug>

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// helper type
type School = { name: string; slug: string };

// extended "popular / state-heavy / private" list
const SCHOOLS: School[] = [
  // UC system
  { name: "UC Berkeley", slug: "uc-berkeley" },
  { name: "UC Davis", slug: "uc-davis" },
  { name: "UC Irvine", slug: "uc-irvine" },
  { name: "UC Los Angeles (UCLA)", slug: "ucla" },
  { name: "UC San Diego", slug: "uc-san-diego" },
  { name: "UC Santa Barbara", slug: "uc-santa-barbara" },
  { name: "UC Santa Cruz", slug: "ucsc" },
  { name: "UC Riverside", slug: "ucr" },
  { name: "UC Merced", slug: "uc-merced" },

  // CSU system (popular ones)
  { name: "San José State University (SJSU)", slug: "sjsu" },
  { name: "San Diego State University (SDSU)", slug: "sdsu" },
  { name: "CSU Long Beach (CSULB)", slug: "csulb" },
  { name: "CSU Fullerton (CSUF)", slug: "csuf" },
  { name: "Cal Poly SLO", slug: "cal-poly-slo" },
  { name: "Sacramento State (CSUS)", slug: "sac-state" },
  { name: "San Francisco State (SFSU)", slug: "sfsu" },

  // West Coast privates
  { name: "Stanford University", slug: "stanford" },
  { name: "Santa Clara University (SCU)", slug: "scu" },
  { name: "University of Southern California (USC)", slug: "usc" },

  // Big 10
  { name: "University of Illinois Urbana–Champaign", slug: "uiuc" },
  { name: "University of Michigan", slug: "umich" },
  { name: "Michigan State University", slug: "msu" },
  { name: "Ohio State University", slug: "ohio-state" },
  { name: "Indiana University Bloomington", slug: "iu" },
  { name: "Purdue University", slug: "purdue" },
  { name: "University of Wisconsin–Madison", slug: "uw-madison" },
  { name: "University of Minnesota", slug: "umn" },
  { name: "Penn State (PSU)", slug: "penn-state" },
  { name: "Rutgers University–New Brunswick", slug: "rutgers" },

  // South & East
  { name: "University of Florida", slug: "uf" },
  { name: "University of Texas at Austin", slug: "ut-austin" },
  { name: "Texas A&M University", slug: "texas-am" },
  { name: "University of Georgia (UGA)", slug: "uga" },
  { name: "Clemson University", slug: "clemson" },
  { name: "University of South Carolina", slug: "uofsc" },
  { name: "NC State University", slug: "nc-state" },
  { name: "UNC Chapel Hill", slug: "unc" },
  { name: "UNC Charlotte", slug: "unc-charlotte" },
  { name: "Duke University", slug: "duke" },
  { name: "Georgia State University", slug: "georgia-state" },
  { name: "Kennesaw State University", slug: "kennesaw-state" },

  // East Coast / Ivies
  { name: "Harvard University", slug: "harvard" },
  { name: "Yale University", slug: "yale" },
  { name: "Princeton University", slug: "princeton" },
  { name: "Columbia University", slug: "columbia" },
  { name: "Cornell University", slug: "cornell" },
  { name: "University of Pennsylvania (UPenn)", slug: "upenn" },
  { name: "Brown University", slug: "brown" },
  { name: "Dartmouth College", slug: "dartmouth" },

  // Other elites
  { name: "Massachusetts Institute of Technology (MIT)", slug: "mit" },
  { name: "Carnegie Mellon University (CMU)", slug: "cmu" },
  { name: "New York University (NYU)", slug: "nyu" },
  { name: "Boston University (BU)", slug: "bu" },
  { name: "Northeastern University", slug: "northeastern" },
  { name: "University of Chicago", slug: "uchicago" },
  { name: "Northwestern University", slug: "northwestern" },
];

export default function Colleges() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Colleges</h1>
        <p className="text-sm text-muted-foreground">
          Pick a school to see a tailored feed. (We pass a slug via query params)
        </p>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {SCHOOLS.map((s) => (
            <Button
              key={s.slug}
              variant="outline"
              className="justify-start"
              onClick={() =>
                navigate(`/feed?college=${encodeURIComponent(s.slug)}`)
              }
            >
              {s.name}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
