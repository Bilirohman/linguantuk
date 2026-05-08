"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose-ai ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-lg font-bold text-indigo-300 mt-4 mb-2 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-bold text-indigo-200 mt-4 mb-2 first:mt-0 border-b border-indigo-900/50 pb-1">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-indigo-300 mt-3 mb-1 first:mt-0">{children}</h3>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="text-sm text-slate-200 leading-relaxed mb-3 last:mb-0">{children}</p>
          ),

          // Strong / Bold
          strong: ({ children }) => (
            <strong className="font-semibold text-indigo-200">{children}</strong>
          ),

          // Emphasis / Italic
          em: ({ children }) => (
            <em className="italic text-slate-300">{children}</em>
          ),

          // Unordered lists
          ul: ({ children }) => (
            <ul className="space-y-1.5 mb-3 ml-1">{children}</ul>
          ),

          // Ordered lists
          ol: ({ children }) => (
            <ol className="space-y-1.5 mb-3 ml-1 list-decimal list-inside">{children}</ol>
          ),

          // List items
          li: ({ children }) => (
            <li className="text-sm text-slate-200 leading-relaxed flex gap-2">
              <span className="text-indigo-400 mt-1 shrink-0">›</span>
              <span>{children}</span>
            </li>
          ),

          // Inline code
          code: ({ inline, children }: any) =>
            inline ? (
              <code className="text-xs bg-indigo-950/50 text-indigo-300 px-1.5 py-0.5 rounded font-mono border border-indigo-900/40">
                {children}
              </code>
            ) : (
              <code className="block text-xs bg-slate-950 text-emerald-300 p-3 rounded-lg font-mono my-2 overflow-x-auto border border-slate-800">
                {children}
              </code>
            ),

          // Code block wrapper
          pre: ({ children }) => <div className="my-2">{children}</div>,

          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-indigo-500/50 pl-3 my-2 text-slate-300 italic text-sm">
              {children}
            </blockquote>
          ),

          // Horizontal rule
          hr: () => <hr className="border-indigo-900/30 my-3" />,

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),

          // Table
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="w-full text-xs border-collapse border border-slate-800 rounded">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-800">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-slate-300 font-semibold border border-slate-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-slate-400 border border-slate-800">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
