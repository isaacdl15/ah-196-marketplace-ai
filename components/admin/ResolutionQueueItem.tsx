'use client';

import { useState } from 'react';
import { UserCheck, Flag, UserPlus, Search } from 'lucide-react';
import Toast from '@/components/ui/Toast';

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

interface ResolutionQueueItemProps {
  match: MatchResult;
  onResolved: (id: string) => void;
}

export default function ResolutionQueueItem({ match, onResolved }: ResolutionQueueItemProps) {
  const [athleteSearch, setAthleteSearch] = useState('');
  const [resolveCorner, setResolveCorner] = useState<'blue' | 'red'>('blue');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const needsBlue = !match.blue_athlete_id;
  const needsRed = !match.red_athlete_id;

  const handleResolve = async (athleteId: string, corner: 'blue' | 'red') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/resolution-queue/${match.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ athleteId, corner }),
      });
      if (!res.ok) throw new Error('Resolution failed');
      setToast({ message: 'Match resolved successfully', type: 'success' });
      setTimeout(() => onResolved(match.id), 1000);
    } catch {
      setToast({ message: 'Failed to resolve match', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFlag = async () => {
    await fetch(`/api/admin/resolution-queue/${match.id}/flag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: 'Flagged for review' }),
    });
    setToast({ message: 'Match flagged for review', type: 'success' });
    setTimeout(() => onResolved(match.id), 1000);
  };

  return (
    <div
      className="rounded-xl p-5 mb-3"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {match.events?.name || 'Unknown Event'}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {match.division_name} · {match.age_category} · {match.phase_name}
          </div>
        </div>
        <button
          onClick={handleFlag}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{ backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}
        >
          <Flag className="w-3 h-3" />
          Flag
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div
          className="p-3 rounded-lg"
          style={{
            backgroundColor: needsBlue ? '#eff6ff' : 'var(--color-surface-alt)',
            border: needsBlue ? '1px solid #bfdbfe' : '1px solid var(--color-border)',
          }}
        >
          <div className="text-xs font-medium mb-1" style={{ color: needsBlue ? '#1d4ed8' : 'var(--color-text-muted)' }}>
            BLUE {needsBlue ? '(UNRESOLVED)' : '(resolved)'}
          </div>
          <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {match.blue_athlete_raw_name || '-'}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {match.blue_athlete_wtf_id || 'No WTF ID'} · {match.blue_athlete_state || 'No state'}
          </div>
          {needsBlue && (
            <button
              onClick={() => setResolveCorner('blue')}
              className="mt-2 flex items-center gap-1 text-xs font-medium"
              style={{ color: '#1d4ed8' }}
            >
              <UserCheck className="w-3 h-3" />
              Resolve Blue
            </button>
          )}
        </div>

        <div
          className="p-3 rounded-lg"
          style={{
            backgroundColor: needsRed ? '#fff1f2' : 'var(--color-surface-alt)',
            border: needsRed ? '1px solid #fecdd3' : '1px solid var(--color-border)',
          }}
        >
          <div className="text-xs font-medium mb-1" style={{ color: needsRed ? '#dc2626' : 'var(--color-text-muted)' }}>
            RED {needsRed ? '(UNRESOLVED)' : '(resolved)'}
          </div>
          <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {match.red_athlete_raw_name || '-'}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {match.red_athlete_wtf_id || 'No WTF ID'} · {match.red_athlete_state || 'No state'}
          </div>
          {needsRed && (
            <button
              onClick={() => setResolveCorner('red')}
              className="mt-2 flex items-center gap-1 text-xs font-medium"
              style={{ color: '#dc2626' }}
            >
              <UserCheck className="w-3 h-3" />
              Resolve Red
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder={`Enter athlete ID for ${resolveCorner} corner...`}
            value={athleteSearch}
            onChange={e => setAthleteSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border focus:outline-none"
            style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-primary)' }}
          />
        </div>
        <button
          onClick={() => handleResolve(athleteSearch, resolveCorner)}
          disabled={!athleteSearch || loading}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50 transition-colors"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <UserCheck className="w-3.5 h-3.5" />
        </button>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
