'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import Toast from '@/components/ui/Toast';

interface CsvUploadFormProps {
  events: { id: string; name: string }[];
  onSuccess?: (uploadId: string) => void;
}

export default function CsvUploadForm({ events, onSuccess }: CsvUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [eventId, setEventId] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [autoProcess, setAutoProcess] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (eventId) formData.append('eventId', eventId);

      const res = await fetch('/api/admin/daedo/upload', { method: 'POST', body: formData });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Upload failed');

      if (autoProcess && json.uploadId) {
        const procRes = await fetch(`/api/admin/daedo/process/${json.uploadId}`, { method: 'POST' });
        const procJson = await procRes.json();
        if (!procRes.ok) throw new Error(procJson.error || 'Processing failed');
        setToast({ message: 'Upload and processing complete!', type: 'success' });
        onSuccess?.(json.uploadId);
      } else {
        setToast({ message: 'File uploaded successfully', type: 'success' });
        onSuccess?.(json.uploadId);
      }

      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Upload failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
        Upload Daedo CSV
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            Event (optional)
          </label>
          <select
            value={eventId}
            onChange={e => setEventId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none"
            style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-primary)' }}
          >
            <option value="">Select event...</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            CSV File
          </label>
          <div
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-primary"
            style={{ borderColor: file ? 'var(--color-success)' : 'var(--color-border)' }}
            onClick={() => fileRef.current?.click()}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{file.name}</span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8" style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Click to select or drag a CSV file
                </span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Max 50 MB</span>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
          <input
            type="checkbox"
            checked={autoProcess}
            onChange={e => setAutoProcess(e.target.checked)}
            className="rounded"
          />
          Auto-process after upload (parse, resolve identities, recalculate rankings)
        </label>

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {loading ? 'Uploading...' : 'Upload CSV'}
        </button>
      </form>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
