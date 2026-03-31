import type { Highlighter } from "shiki";

let highlighter: Highlighter | null = null;
let initPromise: Promise<Highlighter> | null = null;

export async function getHighlighter(): Promise<Highlighter> {
  if (highlighter) return highlighter;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const { createHighlighter } = await import("shiki");
    const hl = await createHighlighter({
      themes: ["vitesse-dark"],
      langs: [
        "typescript",
        "javascript",
        "tsx",
        "jsx",
        "json",
        "bash",
        "shell",
        "python",
        "rust",
        "go",
        "css",
        "html",
        "markdown",
        "yaml",
        "toml",
        "sql",
      ],
    });
    highlighter = hl;
    return hl;
  })();

  return initPromise;
}

export async function highlight(code: string, lang: string): Promise<string> {
  const hl = await getHighlighter();
  const supportedLangs = hl.getLoadedLanguages();
  const useLang = supportedLangs.includes(lang as never) ? lang : "text";
  return hl.codeToHtml(code, { lang: useLang, theme: "vitesse-dark" });
}
