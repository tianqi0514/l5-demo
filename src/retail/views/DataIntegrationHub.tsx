import { useState } from 'react';
import { Network, ArrowRight, Database, FileJson, Table, CheckCircle2, Clock } from 'lucide-react';

const PIPELINES = [
  { id: 'p1', name: 'POS交易实时同步', source: 'POS系统', target: '实时数据湖', status: 'running', throughput: '12K/s', latency: '<100ms' },
  { id: 'p2', name: '库存数据汇聚', source: 'WMS+ERP', target: '库存中台', status: 'running', throughput: '5K/s', latency: '<500ms' },
  { id: 'p3', name: '会员行为数据', source: 'CRM+小程序', target: '会员画像', status: 'running', throughput: '25K/s', latency: '<200ms' },
  { id: 'p4', name: '商品主数据同步', source: 'ERP', target: '商品中台', status: 'running', throughput: '1K/s', latency: '<1s' },
  { id: 'p5', name: '供应链订单流', source: 'OMS+SCM', target: '供应链中台', status: 'paused', throughput: '0', latency: '--' },
];

export default function DataIntegrationHub() {
  return (
    <div className="h-full flex flex-col bg-white p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">数据集成枢纽</h2>
        <p className="text-sm text-gray-500 mt-1">L2 数据层 · 多源异构数据汇聚与标准化</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 border border-gray-200">
          <div className="text-sm text-gray-500">数据管道</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{PIPELINES.length}</div>
        </div>
        <div className="bg-white p-4 border border-gray-200">
          <div className="text-sm text-gray-500">运行中</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{PIPELINES.filter(p => p.status === 'running').length}</div>
        </div>
        <div className="bg-white p-4 border border-gray-200">
          <div className="text-sm text-gray-500">总吞吐</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">43K/s</div>
        </div>
      </div>

      <div className="space-y-4">
        {PIPELINES.map((pipe) => (
          <div key={pipe.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Network size={18} className="text-gray-500" />
                <span className="font-medium text-gray-900">{pipe.name}</span>
                <span className={`px-2 py-0.5 text-xs rounded ${pipe.status === 'running' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {pipe.status === 'running' ? '运行中' : '暂停'}
                </span>
              </div>
              <div className="text-xs text-gray-500 font-mono">
                延迟: {pipe.latency} · 吞吐: {pipe.throughput}
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded">
                <Database size={14} className="text-gray-400" />
                <span className="text-gray-700">{pipe.source}</span>
              </div>
              <ArrowRight size={16} className="text-gray-300" />
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded">
                <Database size={14} className="text-gray-400" />
                <span className="text-gray-700">{pipe.target}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
