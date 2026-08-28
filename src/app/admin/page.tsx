import { getSession } from '@/lib/auth';
import { getAdminDashboardData } from '@/actions/admin';
import { redirect } from 'next/navigation';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');

  const data = await getAdminDashboardData();

  return <AdminDashboardClient data={data} session={session} />;
}
