import { useState } from 'react';

interface Tab {
  lang: string;
  code: string;
}

interface Props {
  tabs?: Tab[];
  lang?: string;
  code?: string;
}

export default function CodeBlock({ tabs, lang, code }: Props) {
  const allTabs: Tab[] = tabs ?? [{ lang: lang ?? '', code: code ?? '' }];
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const active = allTabs[activeIdx];

  function copy() {
    navigator.clipboard.writeText(active.code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="code-block">
      <div className="code-block__header">
        <div className="code-block__tabs">
          {allTabs.map((tab, i) => (
            <button
              key={tab.lang + i}
              className={`code-block__tab${i === activeIdx ? ' code-block__tab--active' : ''}`}
              onClick={() => setActiveIdx(i)}
            >
              {tab.lang}
            </button>
          ))}
        </div>
        <button className="code-block__copy" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="code-block__pre"><code>{active.code.trim()}</code></pre>
    </div>
  );
}
