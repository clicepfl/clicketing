import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '../../session';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  verifyAdminSession();
  return children;
}
