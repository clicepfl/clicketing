export default function SplitText({ snippets }: { snippets: string[] }) {
  return (
    <div className="split">
      {snippets.map((word, index) => (
        <span key={index}>{word}</span>
      ))}
    </div>
  );
}
