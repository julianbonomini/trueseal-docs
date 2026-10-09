// The "Copy as Markdown" button: copies the page's Markdown version, fetched from `href`, to the clipboard.
import { useEffect, useRef, useState } from 'react';

type Outcome = 'copied' | 'failed';

const labels: Record<Outcome | 'idle', string> = { idle: 'Copy as Markdown', copied: 'Copied', failed: 'Copy failed' };
const announcements: Record<Outcome, string> = { copied: 'Markdown copied', failed: "Couldn't copy the Markdown" };

async function fetchText(href: string): Promise<string> {
  const response = await fetch(href);
  if (!response.ok) throw new Error(`${href}: ${response.status}`);
  return response.text();
}

export default function CopyMarkdown({ href }: { href: string }) {
  const pending = useRef<Promise<string>>(undefined);
  const fetched = useRef<string>(undefined);
  const [outcome, setOutcome] = useState<Outcome>();

  useEffect(() => {
    pending.current = fetchText(href);
    pending.current.then(text => (fetched.current = text), () => {});
  }, [href]);

  async function copy() {
    try {
      // Writing straight away while the text is loaded keeps Safari's user activation for the clipboard.
      await navigator.clipboard.writeText(fetched.current ?? (await (pending.current ?? fetchText(href))));
      setOutcome('copied');
    } catch {
      setOutcome('failed');
    }
    setTimeout(() => setOutcome(undefined), 1500);
  }

  return (
    <>
      <button type="button" className="copy-markdown" onClick={copy}>
        {labels[outcome ?? 'idle']}
      </button>
      <span role="status" className="visually-hidden">
        {outcome ? announcements[outcome] : ''}
      </span>
    </>
  );
}
