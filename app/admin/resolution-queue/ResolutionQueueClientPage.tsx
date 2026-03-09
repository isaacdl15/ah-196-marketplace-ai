'use client';

import { useState } from 'react';
import ResolutionQueueItem from '@/components/admin/ResolutionQueueItem';
import { CheckCircle } from 'lucide-react';

interface MatchResult {
  id: string;
  blue_athlete_raw_name?: string;
  blue_athlete_wtf_id?: string;
  blue_athlete_state?: string;
  blue_athlete_id?: string;
  red_athlete_raw_name?: string;
  red_athlete_wtf_id?: string;
  red_athlete_state?: string;
  red_athlete_id?: string;
  division_name?: string;
  age_category?: string;
  phase_name?: string;
  winner?: string;
  score?: string;
  events?: { name: string; start_date: string } | null;
}

interface Props {
  initialItems: MatchResult[];
}

export default function ResolutionQueueClientPage({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);

  const handleResolved = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  if (items.length === 0) {
    return (
      <div
        className="rounded-xl p-12 text-center"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <p className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>All clear!</p>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>No matches need resolution.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map(item => (
        <ResolutionQueueItem
          key={item.id}
          match={item}
          onResolved={handleResolved}
        />
      ))}
    </div>
  );
}
