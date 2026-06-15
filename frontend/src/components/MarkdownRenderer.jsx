import React from 'react';

export const MarkdownRenderer = ({ text, isUser = false, isDark = false }) => {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className="flex flex-col gap-1">
      {lines.map((line, index) => {
        let content = line.trim();

        // 1. Headers
        if (line.startsWith('### ')) {
          return (
            <h3 key={index} className={`text-xs font-black mt-3 mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-brand-dark'}`}>
              {parseInlineMarkdown(line.slice(4), isUser, isDark)}
            </h3>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={index} className={`text-xs font-black mt-4 mb-2 border-b pb-1 flex items-center gap-1.5 ${isDark ? 'text-white border-slate-800' : 'text-brand-dark border-brand-bg'}`}>
              {parseInlineMarkdown(line.slice(3), isUser, isDark)}
            </h2>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <h1 key={index} className={`text-sm font-black mt-4 mb-2 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-brand-dark'}`}>
              {parseInlineMarkdown(line.slice(2), isUser, isDark)}
            </h1>
          );
        }

        // 2. Blockquotes
        if (line.startsWith('> ')) {
          return (
            <blockquote key={index} className={`pl-3 border-l-2 my-2 italic ${
              isUser ? 'border-orange-300 text-orange-100' : (isDark ? 'border-brand-orange text-slate-300' : 'border-brand-orange text-brand-lightText')
            }`}>
              {parseInlineMarkdown(line.slice(2), isUser, isDark)}
            </blockquote>
          );
        }

        // 3. Bullet list items
        if (content.startsWith('- ') || content.startsWith('* ')) {
          const bulletContent = content.startsWith('- ') ? line.substring(line.indexOf('- ') + 2) : line.substring(line.indexOf('* ') + 2);
          return (
            <div key={index} className="flex items-start gap-2 ml-4 my-1">
              <span className={`mt-1.5 shrink-0 select-none w-1.5 h-1.5 rounded-full ${isUser ? 'bg-white' : 'bg-brand-orange'}`} />
              <span className="flex-1">{parseInlineMarkdown(bulletContent, isUser, isDark)}</span>
            </div>
          );
        }

        // 4. Empty lines
        if (line === '') {
          return <div key={index} className="h-2" />;
        }

        // 5. Regular paragraph
        return (
          <p key={index} className="my-0.5 leading-relaxed">
            {parseInlineMarkdown(line, isUser, isDark)}
          </p>
        );
      })}
    </div>
  );
};

const parseInlineMarkdown = (text, isUser = false, isDark = false) => {
  const parts = [];
  let currentIndex = 0;

  // Pattern matches:
  // 1) **bold** -> match[2]
  // 2) `code` -> match[3]
  // 3) [text](url) -> match[4] is text, match[5] is url
  const regex = /(\*\*(.*?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add plain text before match
    if (match.index > currentIndex) {
      parts.push(text.substring(currentIndex, match.index));
    }

    if (match[2] !== undefined) {
      // Bold text
      parts.push(
        <strong
          key={match.index}
          className={`font-black ${
            isUser ? 'text-white' : (isDark ? 'text-brand-orange' : 'text-brand-dark')
          }`}
        >
          {match[2]}
        </strong>
      );
    } else if (match[3] !== undefined) {
      // Inline code
      parts.push(
        <code
          key={match.index}
          className={`px-1.5 py-0.5 font-mono rounded text-[10.5px] border ${
            isUser
              ? 'bg-orange-600 border-orange-500 text-white'
              : 'bg-slate-100 border-slate-200 text-brand-orange'
          }`}
        >
          {match[3]}
        </code>
      );
    } else if (match[4] !== undefined && match[5] !== undefined) {
      // Link
      parts.push(
        <a
          key={match.index}
          href={match[5]}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline font-bold transition-all ${
            isUser
              ? 'text-white hover:text-orange-100'
              : (isDark ? 'text-brand-orange hover:text-orange-400' : 'text-brand-orange hover:text-opacity-80')
          }`}
        >
          {match[4]}
        </a>
      );
    }

    currentIndex = regex.lastIndex;
  }

  if (currentIndex < text.length) {
    parts.push(text.substring(currentIndex));
  }

  return parts.length > 0 ? parts : text;
};

export default MarkdownRenderer;
