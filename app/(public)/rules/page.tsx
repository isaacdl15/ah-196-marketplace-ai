import { BookOpen, Calculator, Trophy, Award, Clock } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Ranking Rules</h1>
        </div>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          How national rankings are calculated for USA Taekwondo athletes.
        </p>
      </div>

      <div className="space-y-6">
        {/* Points Formula */}
        <section
          className="rounded-xl p-6"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary)' + '15' }}
            >
              <Calculator className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Points Formula</h2>
          </div>
          <div className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <p>
              Points are calculated using: <strong style={{ color: 'var(--color-text-primary)' }}>(Grade × 10) × Placement Multiplier × Bracket Modifier</strong>
            </p>
            <div>
              <p className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Placement Multipliers:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>1st place: 10.0</li>
                <li>2nd place: 6.0</li>
                <li>3rd place: 3.6</li>
                <li>4th place: 2.16</li>
                <li>5th place: 1.51 (0.7 decay from 4th)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Bracket Modifier:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>5 or more athletes: 1.00 (full points)</li>
                <li>Fewer than 5 athletes: 0.75 (reduced points)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Event Grades */}
        <section
          className="rounded-xl p-6"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#16A34A15' }}
            >
              <Award className="w-5 h-5" style={{ color: '#16A34A' }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Event Grades & Tiers</h2>
          </div>
          <div className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <p>Events are assigned a grade (1–30) based on prestige. Higher grade events award more points.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { tier: 'NATIONALS', desc: 'National Championships', cap: 1 },
                { tier: 'FINALS', desc: 'USA Finals', cap: 1 },
                { tier: 'US_OPEN', desc: 'US Open', cap: 1 },
                { tier: 'REGIONAL', desc: 'Regional events', cap: 2 },
                { tier: 'STATE', desc: 'State championships', cap: 2 },
                { tier: 'LOCAL', desc: 'Local tournaments', cap: 2 },
              ].map(({ tier, desc, cap }) => (
                <div
                  key={tier}
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
                >
                  <div className="font-semibold text-xs" style={{ color: 'var(--color-primary)' }}>{tier}</div>
                  <div className="text-xs mt-0.5">{desc}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Best {cap} results count</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Best-of Caps */}
        <section
          className="rounded-xl p-6"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#7c3aed15' }}
            >
              <Trophy className="w-5 h-5" style={{ color: '#7c3aed' }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Counting Rules</h2>
          </div>
          <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <p>Only the best results from each tier count toward total points:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Nationals / Finals / US Open: Best 1 result</li>
              <li>Regional / State / Local: Best 2 results</li>
            </ul>
            <p className="mt-2">This prevents athletes from padding scores by attending many low-tier events.</p>
          </div>
        </section>

        {/* Expiry */}
        <section
          className="rounded-xl p-6"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#D9770615' }}
            >
              <Clock className="w-5 h-5" style={{ color: '#D97706' }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Result Expiry</h2>
          </div>
          <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <p>All results expire 365 days from the event date. Expired results no longer contribute to rankings.</p>
            <p>This rolling 12-month window ensures rankings reflect current competitive performance.</p>
          </div>
        </section>

        {/* Tiebreakers */}
        <section
          className="rounded-xl p-6"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#0284c715' }}
            >
              <Award className="w-5 h-5" style={{ color: '#0284c7' }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Tiebreakers</h2>
          </div>
          <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <p>When athletes have equal total points, tiebreakers are applied in order:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Most wins at highest-grade event</li>
              <li>Highest single-event effective points</li>
              <li>Sum of bracket modifiers (larger brackets preferred)</li>
              <li>Date of birth (older athlete ranks higher)</li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}
