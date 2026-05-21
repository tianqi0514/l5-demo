import { useState } from 'react';
import { Wifi, WifiOff, Thermometer, Video, Printer, CreditCard, Monitor, Activity, Settings, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

const DEVICES = [
  { id: 'd1', name: 'POS-001', type: 'POS收银机', store: '南京路旗舰店', status: 'online', lastHeartbeat: '2秒前', battery: null, icon: CreditCard },
  { id: 'd2', name: 'POS-002', type: 'POS收银机', store: '西湖店', status: 'online', lastHeartbeat: '5秒前', battery: null, icon: CreditCard },
  { id: 'd3', name: 'TEMP-001', type: '温湿度传感器', store: '南京路旗舰店', status: 'online', lastHeartbeat: '1分钟前', battery: 78, icon: Thermometer },
  { id: 'd4', name: 'TEMP-002', type: '温湿度传感器', store: '西湖店', status: 'warning', lastHeartbeat: '15分钟前', battery: 12, icon: Thermometer },
  { id: 'd5', name: 'CAM-001', type: '智能摄像头', store: '南京路旗舰店', status: 'online', lastHeartbeat: '3秒前', battery: null, icon: Video },
  { id: 'd6', name: 'PRINT-001', type: '标签打印机', store: '春熙路店', status: 'offline', lastHeartbeat: '2小时前', battery: null, icon: Printer },
  { id: 'd7', name: 'SCREEN-001', type: '电子价签屏', store: '南京路旗舰店', status: 'online', lastHeartbeat: '10秒前', battery: 45, icon: Monitor },
  { id: 'd8', name: 'SCREEN-002', type: '电子价签屏', store: '西湖店', status: 'online', lastHeartbeat: '8秒前', battery: 62, icon: Monitor },
];

export default function IoTDeviceManagement() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? DEVICES : DEVICES.filter(d => d.status === filter);

  return (
    <div className="h-full flex flex-col bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">门店IoT设备管理</h2>
          <p className="text-sm text-gray-500 mt-1">L1 门店物理层 · POS/传感器/摄像头/电子价签</p>
        </div>
        <div className="flex gap-2">
          {['all', 'online', 'warning', 'offline'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded border transition-colors",
                filter === f ? "bg-slate-800 text-white border-slate-800" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              )}
            >
              {f === 'all' ? '全部' : f === 'online' ? '在线' : f === 'warning' ? '警告' : '离线'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border border-gray-200">
          <div className="text-sm text-gray-500">设备总数</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{DEVICES.length}</div>
        </div>
        <div className="bg-white p-4 border border-gray-200">
          <div className="text-sm text-gray-500">在线</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{DEVICES.filter(d => d.status === 'online').length}</div>
        </div>
        <div className="bg-white p-4 border border-gray-200">
          <div className="text-sm text-gray-500">警告</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{DEVICES.filter(d => d.status === 'warning').length}</div>
        </div>
        <div className="bg-white p-4 border border-gray-200">
          <div className="text-sm text-gray-500">离线</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{DEVICES.filter(d => d.status === 'offline').length}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">设备</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">门店</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">状态</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">最后心跳</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">电量</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((device) => {
              const Icon = device.icon;
              return (
                <tr key={device.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Icon size={18} className="text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-900">{device.name}</div>
                        <div className="text-xs text-gray-500">{device.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{device.store}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "flex items-center gap-1.5 text-xs",
                      device.status === 'online' ? "text-emerald-600" :
                      device.status === 'warning' ? "text-amber-600" : "text-rose-600"
                    )}>
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        device.status === 'online' ? "bg-emerald-500" :
                        device.status === 'warning' ? "bg-amber-500" : "bg-rose-500"
                      )} />
                      {device.status === 'online' ? '在线' : device.status === 'warning' ? '警告' : '离线'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{device.lastHeartbeat}</td>
                  <td className="px-4 py-3">
                    {device.battery !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              device.battery > 50 ? "bg-emerald-500" : device.battery > 20 ? "bg-amber-500" : "bg-rose-500"
                            )}
                            style={{ width: `${device.battery}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{device.battery}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">--</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
