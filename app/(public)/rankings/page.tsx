import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import RankingsTable from '@/components/rankings/RankingsTable';
import RankingsFilters from '@/components/rankings/RankingsFilters';
import RankingsPagination from '@/components/rankings/RankingsPagination';
import { Suspense } from 'react';
import { Ranking } from '@/types';
import { Trophy } from 'lucide-react';

interface SearchParams {
  division?: string;
  ageCategory?: string;
  gender?: string;
  state?: string;
  search?: string;
  qualifiedOnly?: string;
  page?: string;
}

async function getRankings(searchParams: SearchParams) {
  noStore();
  const supabase = await createClient();

  const page = parseInt(searchParams.page || '1');
  const limit = 50;
  const offset = (page - 1) * limit;

  let query = supabase.from('rankings').select('*', { count: 'exact' });

  if (searchParams.division) query = query.eq('division', searchParams.division);
  if (searchParams.ageCategory) query = query.eq('age_category', searchParams.ageCategory);
  if (searchParams.gender) query = query.eq('gender', searchParams.gender);
  if (searchParams.state) query = query.eq('state', searchParams.state);
  if (searchParams.qualifiedOnly === 'true') query = query.eq('is_qualified', true);
  if (searchParams.search) {
    query = query.or(`athlete_name.ilike.%${searchParams.search}%,club.ilike.%${searchParams.search}%,division.ilike.%${searchParams.search}%`);
  }

  query = query.order('rank', { ascending: true }).range(offset, offset + limit - 1);
  const { data, count } = await query;

  return {
    rankings: (data || []).map(r => ({
      athleteId: r.athlete_id,
      division: r.division,
      ageCategory: r.age_category,
      gender: r.gender,
      rank: r.rank,
      totalPoints: r.total_points,
      eventsCounted: r.events_counted,
      athleteName: r.athlete_name,
      state: r.state,
      club: r.club,
      qualificationMethod: r.qualification_method,
      isQualified: r.is_qualified,
      lastCalculatedAt: r.last_calculated_at,
    })) as Ranking[],
    total: count || 0,
    page,
    pageSize: limit,
  };
}

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { rankings, total, page, pageSize } = await getRankings(params);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            National Rankings
          </h1>
        </div>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          USA Taekwondo national athlete rankings. Updated after each sanctioned event.
        </p>
      </div>

      <Suspense fallback={null}>
        <RankingsFilters />
      </Suspense>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {total.toLocaleString()} ranking{total !== 1 ? 's' : ''} found
        </p>
      </div>

      <RankingsTable rankings={rankings} />

      <Suspense fallback={null}>
        <RankingsPagination total={total} page={page} pageSize={pageSize} />
      </Suspense>
    </div>
  );
}
