import { useState } from 'react';
import { Battery, ShoppingBag, ArrowRight, Cpu, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface IndustrySelectorProps {
  onSelect: (industry: 'battery' | 'retail') => void;
}

export default function IndustrySelector({ onSelect }: IndustrySelectorProps) {
  const [hovered, setHovered] = useState<'battery' | 'retail' | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white">
            <Cpu size={24} />
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white">
            <Sparkles size={24} />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          AI 智能决策中台
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          基于 Palantir 本体论、Skills、MCP 的跨行业 AI 决策平台
        </p>
        <p className="text-sm text-gray-400 mt-2 font-mono">
          Agent Data OS · L1-L5 全栈决策引擎
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Battery Card */}
        <button
          onClick={() => onSelect('battery')}
          onMouseEnter={() => setHovered('battery')}
          onMouseLeave={() => setHovered(null)}
          className={cn(
            "group relative text-left p-8 rounded-2xl border-2 transition-all duration-300",
            hovered === 'battery'
              ? "border-blue-400 bg-white shadow-2xl shadow-blue-100 scale-[1.02]"
              : "border-gray-200 bg-white shadow-lg hover:shadow-xl"
          )}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <Battery size={32} />
            </div>
            <ArrowRight
              size={20}
              className={cn(
                "text-gray-300 transition-all duration-300",
                hovered === 'battery' && "text-blue-500 translate-x-1"
              )}
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">锂电行业</h2>
          <p className="text-gray-500 mb-4">中创新航 · 动力电池智能制造</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              4大生产基地 · 全产线覆盖
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              产能规划 · 质量追溯 · 设备运维
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              26角色决策链 · 多Agent协同
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
              制造业 · L1-L5 全栈
            </span>
          </div>
        </button>

        {/* Retail Card */}
        <button
          onClick={() => onSelect('retail')}
          onMouseEnter={() => setHovered('retail')}
          onMouseLeave={() => setHovered(null)}
          className={cn(
            "group relative text-left p-8 rounded-2xl border-2 transition-all duration-300",
            hovered === 'retail'
              ? "border-amber-400 bg-white shadow-2xl shadow-amber-100 scale-[1.02]"
              : "border-gray-200 bg-white shadow-lg hover:shadow-xl"
          )}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <ShoppingBag size={32} />
            </div>
            <ArrowRight
              size={20}
              className={cn(
                "text-gray-300 transition-all duration-300",
                hovered === 'retail' && "text-amber-500 translate-x-1"
              )}
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">零售行业</h2>
          <p className="text-gray-500 mb-4">来伊份 · 休闲食品连锁零售</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              4大区域 · 3600+门店覆盖
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              门店运营 · 商品管理 · 会员营销
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              26角色决策链 · 多Agent协同
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
              零售业 · L1-L5 全栈
            </span>
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-sm text-gray-400">
        <p>选择行业进入对应决策中台 · 数据相互独立</p>
        <p className="mt-1 font-mono text-xs">Powered by Palantir Ontology + Skills + MCP</p>
      </div>
    </div>
  );
}
