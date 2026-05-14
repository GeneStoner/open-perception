import React from 'react';
import { readContent } from '@/lib/content';

function parseInline(text: string): string {
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" style="color:var(--accent);text-decoration:underline">$1</a>');
}

export default function ContentBlurb({
  file,
  className = '',
  style,
}: {
  file: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const text = readContent(file);
  const blocks = text.split(/\n\n+/).filter(Boolean);

  return (
    <div className={className} style={style}>
      {blocks.map((block, i) => {
        const lines = block.split('\n');
        const isList = lines.every(l => l.trimStart().startsWith('- '));
        if (isList) {
          return (
            <ul key={i} className={i > 0 ? 'mt-4' : ''} style={{ listStyle: 'none', padding: 0 }}>
              {lines.map((l, j) => (
                <li
                  key={j}
                  className="mt-2"
                  style={{ paddingLeft: '1em', textIndent: '-1em' }}
                  dangerouslySetInnerHTML={{ __html: '– ' + parseInline(l.replace(/^- /, '')) }}
                />
              ))}
            </ul>
          );
        }
        return (
          <p
            key={i}
            className={i > 0 ? 'mt-4' : ''}
            dangerouslySetInnerHTML={{ __html: parseInline(block.replace(/\n/g, ' ')) }}
          />
        );
      })}
    </div>
  );
}
