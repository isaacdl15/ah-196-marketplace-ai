import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { Calendar, MapPin, Award } from 'lucide-react';

async function getEvents() {
  noStore();
  const supabase = await createClient();
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'ACTIVE')
    .order('start_date', { ascending: false })
    .limit(100);
  return data || [];
}

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  NATIONALS: { bg: '#0C4A6E15', text: '#0C4A6E' },
  FINALS: { bg: '#7c3aed15', text: '#7c3aed' },
  US_OPEN: { bg: '#DC262615', text: '#DC2626' },
  REGIONAL: { bg: '#0284c715', text: '#0284c7' },
  STATE: { bg: '#16A34A15', text: '#16A34A' },
  LOCAL: { bg: '#d97706' + '15', text: '#d97706' },
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Events</h1>
        </div>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Sanctioned USA Taekwondo events contributing to national rankings.
        </p>
      </div>

      {events.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>No events found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(event => {
            const tierStyle = TIER_COLORS[event.grade_tier || ''] || { bg: 'var(--color-surface-alt)', text: 'var(--color-text-secondary)' };
            return (
              <div
                key={event.id}
                className="rounded-xl p-5 transition-shadow hover:shadow-md"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-base font-semibold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                    {event.name}
                  </h2>
                  {event.grade_tier && (
                    <span
                      className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                      style={{ backgroundColor: tierStyle.bg, color: tierStyle.text }}
                    >
                      {event.grade_tier}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  {(event.start_date || event.end_date) && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        {event.start_date ? new Date(event.start_date).toLocaleDateString() : ''}
                        {event.end_date && event.end_date !== event.start_date
                          ? ` – ${new Date(event.end_date).toLocaleDateString()}`
                          : ''}
                      </span>
                    </div>
                  )}

                  {(event.location_city || event.location_state) && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        {[event.location_city, event.location_state].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}

                  {event.grade && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <Award className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Grade {event.grade}{event.is_mandatory ? ' · Mandatory' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
