'use client';

import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import Toast from '@/components/ui/Toast';

interface Event {
  id: string;
  name: string;
  grade?: number | null;
  grade_tier?: string | null;
  is_mandatory?: boolean;
  start_date?: string | null;
  status?: string;
}

const GRADE_TIERS = ['LOCAL', 'STATE', 'REGIONAL', 'NATIONALS', 'FINALS', 'US_OPEN'];

interface EventGradeEditorProps {
  event: Event;
  onSaved?: (event: Event) => void;
}

export default function EventGradeEditor({ event, onSaved }: EventGradeEditorProps) {
  const [grade, setGrade] = useState(String(event.grade || ''));
  const [gradeTier, setGradeTier] = useState(event.grade_tier || '');
  const [isMandatory, setIsMandatory] = useState(event.is_mandatory || false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: grade ? parseInt(grade) : null,
          gradeTier: gradeTier || null,
          isMandatory,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      setToast({ message: 'Event updated', type: 'success' });
      onSaved?.({ ...event, grade: parseInt(grade), grade_tier: gradeTier, is_mandatory: isMandatory });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Save failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <input
        type="number"
        min="1"
        max="30"
        value={grade}
        onChange={e => setGrade(e.target.value)}
        placeholder="Grade"
        className="w-20 px-2 py-1 rounded-lg text-sm border focus:outline-none"
        style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-primary)' }}
      />
      <select
        value={gradeTier}
        onChange={e => setGradeTier(e.target.value)}
        className="px-2 py-1 rounded-lg text-sm border focus:outline-none"
        style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-primary)' }}
      >
        <option value="">Tier</option>
        {GRADE_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
        <input
          type="checkbox"
          checked={isMandatory}
          onChange={e => setIsMandatory(e.target.checked)}
          className="rounded"
        />
        Mandatory
      </label>
      <button
        onClick={handleSave}
        disabled={loading}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-white disabled:opacity-50 transition-colors"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
        Save
      </button>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
