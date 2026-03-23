import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, service: 'sirena', version: '2.0.0', ts: new Date().toISOString() });
}
