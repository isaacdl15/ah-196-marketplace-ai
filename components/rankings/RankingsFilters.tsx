'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import { useCallback } from 'react';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

export default function RankingsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  return (
    <div
      className="rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
        <input
          type="text"
          placeholder="Search athlete, club, division..."
          defaultValue={searchParams.get('search') || ''}
          onChange={e => updateParam('search', e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2"
          style={{
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-alt)',
            color: 'var(--color-text-primary)',
          }}
        />
      </div>

      <select
        value={searchParams.get('gender') || ''}
        onChange={e => updateParam('gender', e.target.value)}
        className="px-3 py-2 rounded-lg text-sm border focus:outline-none"
        style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-primary)' }}
      >
        <option value="">All Genders</option>
        <option value="M">Male</option>
        <option value="F">Female</option>
      </select>

      <select
        value={searchParams.get('state') || ''}
        onChange={e => updateParam('state', e.target.value)}
        className="px-3 py-2 rounded-lg text-sm border focus:outline-none"
        style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-primary)' }}
      >
        <option value="">All States</option>
        {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
        <input
          type="checkbox"
          checked={searchParams.get('qualifiedOnly') === 'true'}
          onChange={e => updateParam('qualifiedOnly', e.target.checked ? 'true' : '')}
          className="rounded"
        />
        Qualified only
      </label>

      <button
        onClick={() => router.push(pathname)}
        className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
      >
        Clear
      </button>
    </div>
  );
}
