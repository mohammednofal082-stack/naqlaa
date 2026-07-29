import { NextResponse } from 'next/server';
import { logoutUser } from '@/backend/auth/provider';

export async function POST() {
  await logoutUser();
  return NextResponse.json({ success: true });
}
