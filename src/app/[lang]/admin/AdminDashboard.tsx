'use client';

import { Event } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteAdminSession } from '../../../session';

export default function AdminDashboard({ events }: { events: Event[] }) {
  const router = useRouter();

  return (
    <>
      <p>Dashboard</p>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {events
            .sort(
              (a, b) => b.eventStartTime.getTime() - a.eventStartTime.getTime()
            )
            .map((event) => (
              <tr key={event.id}>
                <td>{event.name}</td>
                <td>{event.eventStartTime.toDateString()}</td>
                <td>
                  <Link href={`/admin/event/${event.slug}`}>Edit</Link>
                </td>
                <td>
                  <Link href={`/admin/event/${event.slug}/mail`}>
                    Edit mail
                  </Link>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <Link href="/admin/new">New</Link>
      <button
        onClick={async () => {
          await deleteAdminSession();
          router.refresh();
        }}
      >
        Logout
      </button>
    </>
  );
}
