import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className="absolute right-2 top-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded transition-colors"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <div className="bg-slate-900 text-slate-300 p-4 pt-10 overflow-x-auto rounded-b-lg">
        <pre className="text-sm font-mono">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
