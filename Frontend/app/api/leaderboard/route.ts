import { NextResponse } from 'next/server';
import { laravelFetch } from '@/lib/server/laravel';

export async function GET(): Promise<NextResponse> {
  const response = await laravelFetch('/leaderboard');
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
