/** JSON.parse result, with `ok: false` when the text isn't valid JSON. */
export function parseJson(text: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}

/** Pretty-printed with 2 spaces; text that isn't valid JSON is shown as it is. */
export function prettyJson(text: string) {
  const parsed = parseJson(text);
  return parsed.ok ? JSON.stringify(parsed.value, null, 2) : text;
}

// Keys, strings, numbers and literals, in the order they appear.
const TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|\b(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b|\b(true|false|null)\b/g;

/** Read-only JSON with light syntax colouring, in the system's code block style. */
export function JsonBlock({ text, className = '' }: { text: string; className?: string }) {
  const pretty = prettyJson(text);
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of pretty.matchAll(TOKEN)) {
    if (m.index > last) parts.push(pretty.slice(last, m.index));
    const [whole, str, colon, num, lit] = m;
    if (str && colon) parts.push(<span key={m.index} className="text-[#1A1A1A] font-medium">{str}</span>, colon);
    else if (str) parts.push(<span key={m.index} className="text-[#C2410C]">{str}</span>);
    else if (num) parts.push(<span key={m.index} className="text-[#2563EB]">{num}</span>);
    else if (lit) parts.push(<span key={m.index} className="text-[#7C3AED]">{lit}</span>);
    else parts.push(whole);
    last = m.index + whole.length;
  }
  parts.push(pretty.slice(last));
  return (
    <pre className={`font-mono text-[13px] leading-relaxed text-[#6B7280] bg-[#F9FAFB] border border-[#F0F0F0] rounded-lg px-3.5 py-3 overflow-auto whitespace-pre ${className}`}>
      <code>{parts}</code>
    </pre>
  );
}
