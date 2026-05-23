import React from 'react';

function renderInline(text: string) {
  // Gère gras **…**, code inline `…` et images markdown ![alt](url).
  const parts = text.split(/(!\[[^\]]*\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    const img = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (img)
      // eslint-disable-next-line @next/next/no-img-element
      return <img key={i} src={img[2]} alt={img[1] || "Illustration FORJA"} className="block w-full max-w-full h-auto rounded-lg border border-fv-brass/15 my-3" />;
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="text-fv-brass font-bold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="bg-fv-brass/10 text-fv-brass px-1.5 py-0.5 rounded text-[0.84em] font-mono">{part.slice(1, -1)}</code>;
    return part;
  });
}

export default function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-[#D4B896] font-serif text-base font-semibold mt-[1.1rem] mb-[0.2rem] italic">{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-fv-brass font-serif text-[1.12rem] font-bold mt-[1.3rem] mb-[0.3rem] border-b border-fv-brass/20 pb-1">{line.slice(3)}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="text-fv-brass font-serif text-[1.25rem] font-bold mt-[0.8rem] mb-[0.4rem]">{line.slice(2)}</h1>);
    } else if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { codeLines.push(lines[i]); i++; }
      elements.push(<pre key={i} className="bg-black/50 border border-fv-brass/10 rounded-md p-[0.85rem] text-[0.75rem] overflow-x-auto text-[#7EC8A0] font-mono my-[0.6rem] leading-[1.6]">{codeLines.join("\n")}</pre>);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(<li key={i} className="mb-[0.22rem]">{renderInline(lines[i].slice(2))}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="pl-[1.2rem] my-[0.35rem] text-[#C4B49A] list-disc">{items}</ul>);
      continue;
    } else if (/^\d+\. /.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(<li key={i} className="mb-[0.28rem]">{renderInline(lines[i].replace(/^\d+\. /, ""))}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`} className="pl-[1.4rem] my-[0.35rem] text-[#C4B49A] list-decimal">{items}</ol>);
      continue;
    } else if (line === "---") {
      elements.push(<hr key={i} className="border-t border-fv-brass/10 my-[0.9rem]" />);
    } else if (line === "") {
      elements.push(<div key={i} className="h-[0.4rem]" />);
    } else {
      elements.push(<p key={i} className="my-[0.12rem] text-[#C4B49A] leading-[1.75]">{renderInline(line)}</p>);
    }
    i++;
  }
  return <div>{elements}</div>;
}
