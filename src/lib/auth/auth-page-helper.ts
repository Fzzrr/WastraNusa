import { redirect } from 'next/navigation';

import { getSessionUser } from './auth';

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    return redirect('/login?session_expired=true');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'admin') {
    return redirect('/');
  }
  return user;
}
