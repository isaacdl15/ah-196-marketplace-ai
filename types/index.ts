export interface Athlete {
  id: string;
  sport80Uuid: string;
  firstName: string;
  lastName: string;
  dob?: string;
  gender?: 'M' | 'F';
  state?: string;
  clubName?: string;
  membershipNumber?: string;
  membershipValid?: boolean;
  beltRank?: string;
}

export interface Event {
  id: string;
  sport80Uuid: string;
  name: string;
  eventType?: string;
  grade?: number;
  gradeTier?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  isMandatory: boolean;
  locationState?: string;
  locationCity?: string;
}

export interface CsvUpload {
  id: string;
  filename: string;
  storagePath: string;
  eventId?: string;
  status: 'UPLOADED' | 'PARSING' | 'RESOLVING' | 'CALCULATING' | 'COMPLETED' | 'FAILED';
  totalRows?: number;
  parsedCount?: number;
  errorCount?: number;
  errorDetails?: Record<string, unknown>;
  createdAt: string;
  completedAt?: string;
}

export interface MatchResult {
  id: string;
  eventId: string;
  uploadId?: string;
  daedoMatchNumber?: number;
  phaseName?: string;
  divisionName?: string;
  ageCategory?: string;
  gender?: 'M' | 'F';
  blueAthleteId?: string;
  blueAthleteRawName?: string;
  blueAthleteWtfId?: string;
  blueAthleteState?: string;
  redAthleteId?: string;
  redAthleteRawName?: string;
  redAthleteWtfId?: string;
  redAthleteState?: string;
  winner?: 'RED' | 'BLUE';
  winMethod?: string;
  score?: string;
  resolutionStatus: 'RESOLVED' | 'PARTIAL' | 'UNRESOLVED';
  createdAt: string;
}

export interface Ranking {
  athleteId: string;
  division: string;
  ageCategory: string;
  gender: 'M' | 'F';
  rank?: number;
  totalPoints?: number;
  eventsCounted?: number;
  athleteName?: string;
  state?: string;
  club?: string;
  qualificationMethod?: string;
  isQualified: boolean;
  lastCalculatedAt: string;
}

export interface DashboardStats {
  totalAthletes: number;
  totalEvents: number;
  pendingResolutions: number;
  recentUploads: number;
  athletesRanked: number;
}
