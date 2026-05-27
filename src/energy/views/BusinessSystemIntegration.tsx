import { useState } from 'react';
import { Database, Server, Link2, CheckCircle2, XCircle, Clock, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

const SYSTEMS = [
  { id: 's1', name: 'ERP系统', vendor: 'SAP', type: '企业资源计划', status: 'connected', lastSync: '2秒前', dataRate: '15K/min', icon: Server },
  { id: 's2', name: 'SRM供应商管理', vendor: '自研', type: '供应商关系管理', status: 'connected', lastSync: '5分钟前', dataRate: '8K/min', icon: Database },
  { id: 's3', name: 'GRC合规平台', vendor: '自研', type: '治理风险合规', status: 'connected', lastSync: '1分钟前', dataRate: '3K/min', icon: Database },
  { id: 's4', name: 'OA审批系统', vendor: '泛微', type: '流程审批', status: 'connected', lastSync: '10秒前', dataRate: '20K/min', icon: Server },
  { id: 's5', name: '电子招投标平台', vendor: '自研', type: '招标管理', status: 'warning', lastSync: '15分钟前', dataRate: '2K/min', icon: Activity },
  { id: 's6', name: '财务共享中心', vendor: '用友', type: '财务管理', status: 'connected', lastSync: '3分钟前', dataRate: '6K/min', icon: Database },
  { id: 's7', name: '合同管理系统', vendor: '法大大', type: '合同管理', status: 'connected', lastSync: '1小时前', dataRate: '1K/min', icon: Database },
];

export default function BusinessSystemIntegration() {
  return (
    <div className="h-full flex flex-col bg-white p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">业务系统接入</h2>
        <p className="text-sm text-gray-500 mt-1">L1 业务层 · ERP/SRM/GRC/OA/电子招投标</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border border-gray-200">
          <div className="text-sm text-gray-500">系统总数</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{SYSTEMS.length}</div>
        </div>
        <div className="bg-white p-4 border border-gray-200">
          <div className="text-sm text-gray-500">已连接</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{SYSTEMS.filter(s => s.status === 'connected').length}</div>
        </div>
        <div className="bg-white p-4 border border-gray-200">
          <div className="text-sm text-gray-500">警告</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{SYSTEMS.filter(s => s.status === 'warning').length}</div>
        </div>
        <div className="bg-white p-4 border border-gray-200">
          <div className="text-sm text-gray-500">日数据量</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">112M</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">系统</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">供应商</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">类型</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">状态</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">最后同步</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">数据速率</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {SYSTEMS.map((sys) => {
              const Icon = sys.icon;
              return (
                <tr key={sys.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Icon size={18} className="text-gray-500" />
                      <span className="font-medium text-gray-900">{sys.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{sys.vendor}</td>
                  <td className="px-4 py-3 text-gray-600">{sys.type}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "flex items-center gap-1.5 text-xs",
                      sys.status === 'connected' ? "text-emerald-600" : "text-amber-600"
                    )}>
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        sys.status === 'connected' ? "bg-emerald-500" : "bg-amber-500"
                      )} />
                      {sys.status === 'connected' ? '已连接' : '延迟'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{sys.lastSync}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{sys.dataRate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
