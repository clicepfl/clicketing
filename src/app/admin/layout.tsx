import { verifyAdminSession } from '../../session';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  verifyAdminSession();
  return children;
}
