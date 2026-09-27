import { redirect } from 'next/navigation';

import { getSessionUser } from './auth';
import { isAdmin, isSeller } from './roles';

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    return redirect('/login?session_expired=true');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!isAdmin(user.role)) {
    return redirect('/');
  }
  return user;
}

export async function requireSeller() {
  const user = await requireUser();
  if (!isSeller(user.role)) {
    return redirect('/');
  }
  return user;
}
