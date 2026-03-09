import { createAdminClient } from '@/lib/supabase/admin';
import CsvUploadForm from '@/components/admin/CsvUploadForm';
import UploadHistory from '@/components/admin/UploadHistory';

async function getEvents() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('events')
    .select('id, name')
    .eq('status', 'ACTIVE')
    .order('start_date', { ascending: false })
    .limit(100);
  return data || [];
}

export default async function UploadsPage() {
  const events = await getEvents();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>CSV Uploads</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Upload Daedo match result CSV files to process tournament results.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CsvUploadForm events={events} />
      </div>

      <UploadHistory />
    </div>
  );
}
