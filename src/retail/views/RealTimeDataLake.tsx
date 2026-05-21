import { useState } from 'react';
import { HardDrive, Activity, TrendingUp, Users, ShoppingCart, Store } from 'lucide-react';

const METRICS = [
  { label: '实时交易', value: '2,847', unit: '笔/分钟', icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: '在线门店', value: '3,456', unit: '家', icon: Store, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: '活跃会员', value: '12.5万', unit: '人/小时', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: '实时GMV', value: '48.6万', unit: '元/小时', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const TABLES = [
  { name: 'pos_transaction', rows: '1.2亿', size: '450GB', lastUpdate: '2秒前', topic: '销售域' },
  { name: 'member_profile', rows: '3600万', size: '280GB', lastUpdate: '10秒前', topic: '会员域' },
  { name: 'inventory_realtime', rows: '8500万', size: '120GB', lastUpdate: '5秒前', topic: '供应链域' },
  { name: 'store_operation', rows: '4500万', size: '90GB', lastUpdate: '1分钟前', topic: '门店域' },
  { name: 'promotion_effect', rows: '1200万', size: '45GB', lastUpdate: '3分钟前', topic: '营销域' },
];

export default function RealTimeDataLake() {
  return (
    <div className="h-full flex flex-col bg-white p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">实时数据湖</h2>
        <p className="text-sm text-gray-500 mt-1">L2 数据层 · 流批一体 · 3600万会员 · 1.2亿交易记录</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {METRICS.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className={`${m.bg} p-4 rounded-lg border border-gray-100`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={18} className={m.color} />
                <span className="text-sm text-gray-600">{m.label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{m.value}</div>
              <div className="text-xs text-gray-500 mt-1">{m.unit}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 text-sm">核心数据表</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">表名</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">数据域</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">记录数</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">存储</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">最近更新</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {TABLES.map((t) => (
              <tr key={t.name} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-gray-900">{t.name}</td>
                <td className="px-4 py-3 text-gray-600">{t.topic}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">{t.rows}</td>
                <td className="px-4 py-3 text-gray-600">{t.size}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{t.lastUpdate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
