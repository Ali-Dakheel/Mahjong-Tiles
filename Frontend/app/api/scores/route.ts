import { NextRequest, NextResponse } from 'next/server';
import { laravelFetch } from '@/lib/server/laravel';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const response = await laravelFetch('/scores', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
