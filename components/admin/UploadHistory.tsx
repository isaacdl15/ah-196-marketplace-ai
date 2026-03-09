'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

interface Upload {
  id: string;
  filename: string;
  status: string;
  total_rows?: number;
  parsed_count?: number;
  error_count?: number;
  created_at: string;
  completed_at?: string;
  events?: { name: string } | null;
}

export default function UploadHistory() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUploads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/daedo/uploads');
      const json = await res.json();
      setUploads(json.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-success)' }} />;
      case 'FAILED': return <XCircle className="w-4 h-4" style={{ color: 'var(--color-error)' }} />;
      case 'UPLOADED': return <Clock className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />;
      default: return <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--color-warning)' }} />;
    }
  };

  const statusLabel = (status: string) => {
    const colors: Record<string, string> = {
      COMPLETED: 'var(--color-success)',
      FAILED: 'var(--color-error)',
      UPLOADED: 'var(--color-text-muted)',
      PARSING: 'var(--color-warning)',
      RESOLVING: 'var(--color-warning)',
      CALCULATING: 'var(--color-warning)',
    };
    return <span style={{ color: colors[status] || 'var(--color-text-muted)' }} className="text-xs font-medium">{status}</span>;
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Upload History</h2>
        <button
          onClick={fetchUploads}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
          style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-text-muted)' }} />
        </div>
      ) : uploads.length === 0 ? (
        <div className="py-12 text-center" style={{ color: 'var(--color-text-muted)' }}>No uploads yet</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)' }}>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--color-text-secondary)' }}>File</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Event</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Status</th>
              <th className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Rows</th>
              <th className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Errors</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {uploads.map(upload => (
              <tr key={upload.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>{upload.filename}</td>
                <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                  {upload.events?.name || '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {statusIcon(upload.status)}
                    {statusLabel(upload.status)}
                  </div>
                </td>
                <td className="px-4 py-3 text-right" style={{ color: 'var(--color-text-secondary)' }}>
                  {upload.parsed_count ?? upload.total_rows ?? '-'}
                </td>
                <td className="px-4 py-3 text-right" style={{ color: upload.error_count ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
                  {upload.error_count ?? 0}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {new Date(upload.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
