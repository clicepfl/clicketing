import ErrorIcon from './icons/ErrorIcon';

export default function ErrorMessage({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }
  return (
    <div className="error-message">
      <ErrorIcon className="icon" />
      <span>{message}</span>
    </div>
  );
}
