import { Construction } from 'lucide-react';

export default function PlaceholderView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
      <Construction size={48} className="mb-4 opacity-30" />
      <p className="text-sm">功能开发中...</p>
    </div>
  );
}
