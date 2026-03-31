import { useEffect, useState } from "react";
import { highlight } from "./shiki";

interface CodeBlockProps {
  code: string;
  lang: string;
}

export function CodeBlock({ code, lang }: CodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    highlight(code, lang).then((result) => {
      if (!cancelled) setHtml(result);
    });
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  if (html) {
    return (
      <div
        // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output is safe
        dangerouslySetInnerHTML={{ __html: html }}
        className="text-sm [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>pre]:bg-slate-900!"
      />
    );
  }

  return (
    <pre className="text-sm p-4 rounded-lg bg-slate-900 text-gray-300 overflow-x-auto font-mono whitespace-pre">
      {code}
    </pre>
  );
}
