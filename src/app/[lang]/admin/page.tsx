import prisma from '../../../db';
import AdminDashboard from './AdminDashboard';

export default async function Dashboard() {
  const events = await prisma.event.findMany();

  return <AdminDashboard events={events} />;
}
