import QualificationBadge from './QualificationBadge';
import { Ranking } from '@/types';

interface RankingsTableProps {
  rankings: Ranking[];
}

export default function RankingsTable({ rankings }: RankingsTableProps) {
  if (rankings.length === 0) {
    return (
      <div
        className="rounded-xl p-12 text-center"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <p style={{ color: 'var(--color-text-muted)' }} className="text-lg">No rankings found</p>
        <p style={{ color: 'var(--color-text-muted)' }} className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)' }}>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Rank</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Athlete</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--color-text-secondary)' }}>State</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Club</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Division</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Age</th>
              <th className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Points</th>
              <th className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Events</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((r, idx) => (
              <tr
                key={`${r.athleteId}-${r.division}-${r.ageCategory}-${r.gender}`}
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  backgroundColor: idx % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-alt)',
                }}
                className="hover:opacity-90 transition-opacity"
              >
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: r.rank && r.rank <= 3 ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                      color: r.rank && r.rank <= 3 ? 'white' : 'var(--color-text-secondary)',
                    }}
                  >
                    {r.rank || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {r.athleteName || 'Unknown'}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{r.state || '-'}</td>
                <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{r.club || '-'}</td>
                <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{r.division}</td>
                <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{r.ageCategory}</td>
                <td className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--color-primary)' }}>
                  {r.totalPoints?.toFixed(2) || '0.00'}
                </td>
                <td className="px-4 py-3 text-right" style={{ color: 'var(--color-text-secondary)' }}>
                  {r.eventsCounted || 0}
                </td>
                <td className="px-4 py-3">
                  <QualificationBadge isQualified={r.isQualified} method={r.qualificationMethod} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
