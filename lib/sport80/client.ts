/**
 * Sport80 REST client - stubbed for Phase 1
 */

const BASE_URL = process.env.SPORT80_API_BASE_URL || 'https://usataekwondo.sport80.com/api/ext/';
const API_TOKEN = process.env.SPORT80_API_TOKEN || '';

export class Sport80Error extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'Sport80Error';
  }
}

export async function syncAthletes(_updatedSince?: string): Promise<{ count: number }> {
  if (!API_TOKEN || API_TOKEN === 'placeholder_token') {
    throw new Sport80Error(503, 'Sport80 sync unavailable — check API token and IP whitelist');
  }
  throw new Sport80Error(503, 'Sport80 sync unavailable — check API token and IP whitelist');
}

export async function syncEvents(): Promise<{ count: number }> {
  if (!API_TOKEN || API_TOKEN === 'placeholder_token') {
    throw new Sport80Error(503, 'Sport80 sync unavailable — check API token and IP whitelist');
  }
  throw new Sport80Error(503, 'Sport80 sync unavailable — check API token and IP whitelist');
}
