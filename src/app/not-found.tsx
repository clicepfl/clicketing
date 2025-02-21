import Card from '@/components/Card';
import ErrorIcon from '@/components/icons/ErrorIcon';

export default function NotFound() {
  return (
    <div className="form">
      <h1>404 Not Found</h1>
      <Card Icon={ErrorIcon}>
        <p>The page you are looking for does not exist.</p>
      </Card>
    </div>
  );
}
