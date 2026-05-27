import { useState } from 'react';
import { Wifi, WifiOff, Thermometer, Video, Printer, CreditCard, Monitor, Activity, Settings, AlertTriangle, Fingerprint, MapPin, Camera } from 'lucide-react';
import { cn } from '../lib/utils';

const DEVICES = [
  { id: 'd1', name: 'ESIGN-001', type: '电子签章终端', location: '华北采购中心', status: 'online', lastHeartbeat: '2秒前', battery: null, icon: Fingerprint },
  { id: 'd2', name: 'ESIGN-002', type: '电子签章终端', location: '华东采购中心', status: 'online', lastHeartbeat: '5秒前', battery: null, icon: Fingerprint },
  { id: 'd3', name: 'GATE-001', type: '智能门禁', location: '集团总部-招标大厅', status: 'online', lastHeartbeat: '1分钟前', battery: null, icon: Monitor },
  { id: 'd4', name: 'GATE-002', type: '智能门禁', location: '华北仓库A区', status: 'warning', lastHeartbeat: '15分钟前', battery: 12, icon: Monitor },
  { id: 'd5', name: 'CAM-001', type: '招标现场监控', location: '集团总部-评标室', status: 'online', lastHeartbeat: '3秒前', battery: null, icon: Camera },
  { id: 'd6', name: 'CAM-002', type: '仓库视频监控', location: '华东仓库B区', status: 'online', lastHeartbeat: '10秒前', battery: null, icon: Camera },
  { id: 'd7', name: 'GPS-001', type: '物流GPS追踪器', location: '运输车辆-华东线', status: 'online', lastHeartbeat: '8秒前', battery: 78, icon: MapPin },
  { id: 'd8', name: 'GPS-002', type: '物流GPS追踪器', location: '运输车辆-西北线', status: 'offline', lastHeartbeat: '2小时前', battery: 5, icon: MapPin },
];

export default function IoTDeviceManagement() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? DEVICES : DEVICES.filter(d => d.status === filter);

  return (
    <div className="h-full flex flex-col bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">IoT设备接入</h2>
          <p className="text-sm text-gray-500 mt-1">L1 物理层 · 电子签章/智能门禁/视频监控/GPS追踪</p>
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
              <th className="px-4 py-3 text-left font-semibold text-gray-700">位置</th>
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
                  <td className="px-4 py-3 text-gray-600">{device.location}</td>
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
