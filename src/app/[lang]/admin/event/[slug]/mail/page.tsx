import { getEventBySlug } from '../../../../../../db/events';
import MailEditor from './MailEditor';

export default async function Page({ params }: { params: { slug: string } }) {
  return <MailEditor event={await getEventBySlug(params.slug)} />;
}
