import { createAdminClient } from '@/lib/supabase/admin';
import EventGradeEditor from '@/components/admin/EventGradeEditor';
import { Calendar, MapPin } from 'lucide-react';

async function getEvents() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: false })
    .limit(200);
  return data || [];
}

export default async function AdminEventsPage() {
  const events = await getEvents();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Event Management</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Set grades and tiers for events. These affect points calculations.
        </p>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
      >
        {events.length === 0 ? (
          <div className="py-12 text-center" style={{ color: 'var(--color-text-muted)' }}>
            No events found. Sync from Sport80 to import events.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)' }}>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Event</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Date</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Location</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Grade / Tier / Mandatory</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td className="px-4 py-3">
                    <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{event.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{event.status}</div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {event.start_date ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(event.start_date).toLocaleDateString()}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {(event.location_city || event.location_state) ? (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {[event.location_city, event.location_state].filter(Boolean).join(', ')}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <EventGradeEditor event={event} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
