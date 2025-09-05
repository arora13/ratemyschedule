import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Metrics = {
  users: number;
  impressions: number;
  posts: number;
  colleges: number;
};

export function MetricsDisplay() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        } else {
          setError('Failed to load metrics');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Loading metrics...</div>
      </Card>
    );
  }

  if (error || !metrics) {
    return (
      <Card className="p-4">
        <div className="text-sm text-destructive">Failed to load metrics</div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Community Stats</h3>
          <div className="flex gap-4 mt-2">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{metrics.users}</span> users
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{metrics.impressions}</span> impressions
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{metrics.posts}</span> schedules
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{metrics.colleges}</span> colleges
            </div>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          Live
        </Badge>
      </div>
    </Card>
  );
}
