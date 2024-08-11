'use client';

import { Editor } from '@monaco-editor/react';
import { Event } from '@prisma/client';
import { useRef, useState } from 'react';
import { sendTestMail } from '../../../../../../mail';
import { injectTestQrCode } from '../../../../../../qrcode';

const emptyTemplate = '<!DOCTYPE html>\n<html>\n<body>\n\n</body>\n</html>';

export default function MailEditor({ event }: { event: Event }) {
  const editorRef = useRef(null);
  const [template, setTemplate] = useState(event.mailTemplate || emptyTemplate);
  const [testAddress, setTestAddress] = useState('');

  return (
    <div>
      <Editor
        height="40vh"
        language="html"
        onMount={(editor, monaco) => (editorRef.current = editor)}
        onChange={setTemplate}
        value={template}
      />
      <input
        value={testAddress}
        onChange={(e) => setTestAddress(e.target.value)}
      />
      <button
        onClick={async () => {
          let successful;

          try {
            successful = await sendTestMail(template, testAddress);
          } catch (_) {
            successful = false;
          }

          alert(successful ? 'Mail successfully sent' : 'An error occured');
        }}
      >
        Test
      </button>
      <div
        dangerouslySetInnerHTML={{
          __html: injectTestQrCode(template),
        }}
      />
    </div>
  );
}
