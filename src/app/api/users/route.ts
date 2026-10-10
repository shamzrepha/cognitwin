import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/lib/types';
import { INITIAL_ADMIN_USER } from '@/lib/mockData';

let globalUsers: UserProfile[] = [INITIAL_ADMIN_USER];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (email) {
    const user = globalUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    return NextResponse.json({ user: user || null });
  }

  return NextResponse.json({ users: globalUsers });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user } = body;

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Valid user profile required' }, { status: 400 });
    }

    const cleanEmail = user.email.toLowerCase().trim();
    const existingIdx = globalUsers.findIndex(u => u.email.toLowerCase() === cleanEmail);

    if (existingIdx >= 0) {
      // Update existing user profile with latest data
      globalUsers[existingIdx] = {
        ...globalUsers[existingIdx],
        ...user,
        email: cleanEmail,
      };
      return NextResponse.json({ success: true, user: globalUsers[existingIdx] });
    } else {
      globalUsers.push(user);
      return NextResponse.json({ success: true, user });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
