import Markdown from 'react-markdown';
import Twemoji from 'react-twemoji';

export default function FancyMarkdown({ children }: { children: string }) {
  return (
    <Twemoji options={{ className: 'twemoji' }}>
      <Markdown>{children}</Markdown>
    </Twemoji>
  );
}
