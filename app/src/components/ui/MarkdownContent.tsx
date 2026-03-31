import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({
  content,
  className = "",
}: MarkdownContentProps) {
  return (
    <div
      className={`prose-dark text-sm text-gray-200 leading-relaxed ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className: cls, children, ...props }) {
            const match = /language-(\w+)/.exec(cls || "");
            const codeStr = String(children).replace(/\n$/, "");
            const isBlock =
              "node" in props &&
              (props as { node?: { type?: string } }).node?.type !==
                "inlineCode";

            if (match && isBlock) {
              return <CodeBlock code={codeStr} lang={match[1]} />;
            }

            // Inline code
            return (
              <code
                className="bg-slate-700 text-cyan-300 rounded px-1.5 py-0.5 font-mono text-xs"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre({ children }) {
            // If children is already a CodeBlock, don't double-wrap
            return <>{children}</>;
          },
          a({ href, children, ...props }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                {...props}
              >
                {children}
              </a>
            );
          },
          table({ children, ...props }) {
            return (
              <div className="overflow-x-auto my-3">
                <table
                  className="w-full text-sm border-collapse border border-slate-600"
                  {...props}
                >
                  {children}
                </table>
              </div>
            );
          },
          th({ children, ...props }) {
            return (
              <th
                className="border border-slate-600 px-3 py-2 bg-slate-700 text-gray-200 font-semibold text-left"
                {...props}
              >
                {children}
              </th>
            );
          },
          td({ children, ...props }) {
            return (
              <td
                className="border border-slate-600 px-3 py-2 text-gray-300"
                {...props}
              >
                {children}
              </td>
            );
          },
          h1({ children, ...props }) {
            return (
              <h1
                className="text-lg font-bold font-mono text-gray-100 mt-4 mb-2"
                {...props}
              >
                {children}
              </h1>
            );
          },
          h2({ children, ...props }) {
            return (
              <h2
                className="text-base font-bold font-mono text-gray-100 mt-3 mb-2"
                {...props}
              >
                {children}
              </h2>
            );
          },
          h3({ children, ...props }) {
            return (
              <h3
                className="text-sm font-bold font-mono text-gray-200 mt-3 mb-1"
                {...props}
              >
                {children}
              </h3>
            );
          },
          p({ children, ...props }) {
            return (
              <p className="my-2 text-gray-200 leading-relaxed" {...props}>
                {children}
              </p>
            );
          },
          ul({ children, ...props }) {
            return (
              <ul
                className="my-2 ml-4 list-disc space-y-1 text-gray-200"
                {...props}
              >
                {children}
              </ul>
            );
          },
          ol({ children, ...props }) {
            return (
              <ol
                className="my-2 ml-4 list-decimal space-y-1 text-gray-200"
                {...props}
              >
                {children}
              </ol>
            );
          },
          li({ children, ...props }) {
            return (
              <li className="text-gray-200" {...props}>
                {children}
              </li>
            );
          },
          blockquote({ children, ...props }) {
            return (
              <blockquote
                className="border-l-2 border-slate-600 pl-3 my-2 text-gray-400 italic"
                {...props}
              >
                {children}
              </blockquote>
            );
          },
          hr() {
            return <hr className="border-slate-700 my-4" />;
          },
          strong({ children, ...props }) {
            return (
              <strong className="font-semibold text-gray-100" {...props}>
                {children}
              </strong>
            );
          },
          em({ children, ...props }) {
            return (
              <em className="italic text-gray-300" {...props}>
                {children}
              </em>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
