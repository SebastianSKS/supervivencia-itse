import { getSession } from '@/lib/auth';
import { getNotifications } from '@/actions/social';
import NavbarClient from './NavbarClient';

/** Navbar compartida — Server Component, lee sesión y notificaciones */
export default async function Navbar() {
  const session = await getSession();

  const { notifications, unreadCount } = session
    ? await getNotifications()
    : { notifications: [], unreadCount: 0 };

  return (
    <NavbarClient
      session={session}
      notifications={notifications}
      unreadCount={unreadCount}
    />
  );
}
