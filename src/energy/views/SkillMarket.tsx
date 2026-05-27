import { useState } from 'react';
import { Search, Zap, Star, TrendingUp, ShieldCheck, BarChart3, Users, Package, Tag, Clock, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

const CATEGORIES = [
  { id: 'all', name: '全部', count: 24 },
  { id: 'product', name: '商品管理', count: 6 },
  { id: 'store', name: '门店运营', count: 5 },
  { id: 'supply', name: '供应链', count: 4 },
  { id: 'member', name: '会员营销', count: 5 },
  { id: 'finance', name: '财务分析', count: 4 },
];

const SKILLS = [
  { id: 's1', name: '智能选品优化', category: 'product', desc: '基于销售数据、季节性和竞品分析自动推荐选品', stars: 4.8, usage: 2340, author: '商品部', icon: Package },
  { id: 's2', name: '坪效诊断引擎', category: 'store', desc: '分析门店坪效、人效，提供优化建议', stars: 4.6, usage: 1890, author: '运营部', icon: BarChart3 },
  { id: 's3', name: '库存智能预警', category: 'supply', desc: '预测缺货和滞销风险，自动触发补货建议', stars: 4.9, usage: 5670, author: '供应链部', icon: TrendingUp },
  { id: 's4', name: '会员流失预测', category: 'member', desc: '识别高流失风险会员，触发精准挽回策略', stars: 4.7, usage: 3450, author: '营销部', icon: Users },
  { id: 's5', name: '促销ROI测算', category: 'finance', desc: '实时测算促销活动的投入产出比', stars: 4.5, usage: 1230, author: '财务部', icon: Tag },
  { id: 's6', name: '食品安全风控', category: 'supply', desc: '临期预警、供应商资质监控、食安合规检查', stars: 4.9, usage: 2890, author: '品控部', icon: ShieldCheck },
  { id: 's7', name: '门店排班优化', category: 'store', desc: '基于客流预测自动生成最优排班方案', stars: 4.4, usage: 1560, author: '运营部', icon: Clock },
  { id: 's8', name: '动态定价策略', category: 'product', desc: '根据库存、季节和竞争态势推荐最优定价', stars: 4.3, usage: 980, author: '商品部', icon: Zap },
];

export default function SkillMarket() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = SKILLS.filter(s => {
    const matchCategory = activeCategory === 'all' || s.category === activeCategory;
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="h-full flex flex-col bg-[#f5f5f7]">
      <div className="px-6 py-4 border-b border-gray-200/50 bg-white/60 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="搜索技能..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <div className="flex gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                  activeCategory === cat.id
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                )}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(skill => {
            const Icon = skill.icon;
            return (
              <div key={skill.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700">
                    <Icon size={20} />
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={14} fill="currentColor" />
                    <span className="text-sm font-medium">{skill.stars}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{skill.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{skill.desc}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>by {skill.author}</span>
                  <span>{skill.usage.toLocaleString()} 次调用</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
