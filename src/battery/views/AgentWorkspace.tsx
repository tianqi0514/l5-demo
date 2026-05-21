import { useState } from 'react';
import {
  Bot,
  GitMerge,
  Wrench,
  Zap,
  MonitorPlay,
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  Layers,
  TerminalSquare,
  Play,
  LayoutGrid,
  List,
  GitBranch,
  Settings,
  Search,
  Plus,
  MoreHorizontal,
  Filter,
  ChevronRight,
  History,
  BarChart3,
  Crown,
  Briefcase,
  UserCircle,
  MapPin,
  Factory,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '../lib/utils';

// ============================================================
// 决策空间角色定义（与 DecisionSpace 对应）
// ============================================================
type RoleLevel = '战略层' | '经营层' | '执行层' | '基地层' | '工厂层' | '产线层';

interface RoleInfo {
  id: string;
  title: string;
  level: RoleLevel;
  initial: string;
  scope: string;
}

const ROLE_TEMPLATES: RoleInfo[] = [
  // 战略层
  { id: 'ceo', title: 'CEO', level: '战略层', initial: 'C', scope: '全集团 · 4基地 · 全工厂' },
  // 经营层
  { id: 'vp_prod', title: '生产副总裁', level: '经营层', initial: '生', scope: '集团生产 · 4基地' },
  { id: 'vp_sales', title: '销售副总裁', level: '经营层', initial: '销', scope: '集团销售 · 全客户' },
  { id: 'vp_supply', title: '供应链副总裁', level: '经营层', initial: '供', scope: '集团供应链' },
  { id: 'vp_ops', title: '运营副总裁', level: '经营层', initial: '运', scope: '集团运营 · 跨基地协同' },
  // 执行层
  { id: 'mgr_plan', title: '计划经理', level: '执行层', initial: '计', scope: '生产计划部' },
  { id: 'mgr_process', title: '工艺总监', level: '执行层', initial: '工', scope: '工艺技术部 · 全工厂' },
  { id: 'mgr_quality', title: '质量经理', level: '执行层', initial: '质', scope: '质量控制部' },
  { id: 'mgr_finance', title: '财务经理', level: '执行层', initial: '财', scope: '财务部 · 全口径' },
  { id: 'mgr_purchase', title: '采购负责人', level: '执行层', initial: '采', scope: '采购部 · 全物料' },
  { id: 'mgr_ka', title: '大客户经理KA', level: '执行层', initial: 'K', scope: 'A类战略客户' },
  { id: 'mgr_sop', title: 'S&OP经理', level: '执行层', initial: 'S', scope: '销售/生产/供应链协调' },
  { id: 'analyst_demand', title: '需求预测分析师', level: '执行层', initial: '需', scope: '12个月滚动预测' },
  { id: 'planner_capacity', title: '产能规划师', level: '执行层', initial: '容', scope: '中长期产能规划' },
  { id: 'mgr_ops_director', title: '运营部长', level: '执行层', initial: '运', scope: '集团运营管理部 · KPI体系' },
  { id: 'mgr_ops', title: '运营经理', level: '执行层', initial: '运', scope: '运营管理部 · 跨基地协同执行' },
  // 基地层
  { id: 'gm_changzhou', title: '常州基地总经理', level: '基地层', initial: '常', scope: '常州基地 · F02+F03' },
  { id: 'gm_sichuan', title: '四川基地总经理', level: '基地层', initial: '川', scope: '四川基地 · F08+F09' },
  { id: 'gm_wuhan', title: '武汉基地总经理', level: '基地层', initial: '汉', scope: '武汉基地 · F12+F13' },
  { id: 'gm_xiamen', title: '厦门基地总经理', level: '基地层', initial: '厦', scope: '厦门基地 · F15+F16' },
  // 工厂层
  { id: 'mgr_factory', title: '工厂厂长', level: '工厂层', initial: '厂', scope: '单工厂' },
  // 产线层
  { id: 'mgr_line', title: '产线长', level: '产线层', initial: '线', scope: '单产线' },
];

// 按层级分组
const ROLE_LEVELS: { level: RoleLevel; icon: any; color: string; roles: RoleInfo[] }[] = [
  { level: '战略层', icon: Crown, color: 'bg-purple-100 text-purple-700', roles: ROLE_TEMPLATES.filter(r => r.level === '战略层') },
  { level: '经营层', icon: Briefcase, color: 'bg-blue-100 text-blue-700', roles: ROLE_TEMPLATES.filter(r => r.level === '经营层') },
  { level: '执行层', icon: UserCircle, color: 'bg-emerald-100 text-emerald-700', roles: ROLE_TEMPLATES.filter(r => r.level === '执行层') },
  { level: '基地层', icon: MapPin, color: 'bg-amber-100 text-amber-700', roles: ROLE_TEMPLATES.filter(r => r.level === '基地层') },
  { level: '工厂层', icon: Factory, color: 'bg-rose-100 text-rose-700', roles: ROLE_TEMPLATES.filter(r => r.level === '工厂层') },
  { level: '产线层', icon: Users, color: 'bg-slate-100 text-slate-700', roles: ROLE_TEMPLATES.filter(r => r.level === '产线层') },
];

interface AgentWorkspaceProps {
  onNavigate?: (tab: string) => void;
}

// --- Mock Data ---
// 数据与相关模块实际数据保持一致
const MODULE_STATS = [
  { id: 'agent', name: '智能体实例', count: 5, active: 3, icon: Bot, color: 'slate' },
  { id: 'workflow', name: '工作流编排', count: 4, active: 3, icon: GitMerge, color: 'slate' },
  { id: 'tool', name: 'MCP 工具', count: 5, active: 4, icon: Wrench, color: 'slate' },
  { id: 'skill', name: '原子技能', count: 5, active: 2, icon: Zap, color: 'slate' },
  { id: 'simulation', name: '推演任务', count: 2, active: 1, icon: MonitorPlay, color: 'slate' },
];

const RECENT_ACTIVITIES = [
  { id: 1, type: 'agent', title: '生产调度优化Agent', action: '触发了重排程工作流', time: '2分钟前', status: 'success' },
  { id: 2, type: 'simulation', title: 'Q3产能满载推演', action: '推演完成，生成最优方案A', time: '15分钟前', status: 'success' },
  { id: 3, type: 'tool', title: 'ERP_Order_Query', action: '接口响应延迟超阈值 (>2s)', time: '1小时前', status: 'warning' },
  { id: 4, type: 'workflow', title: '主轴过热停机预案', action: '执行失败，等待人工介入', time: '2小时前', status: 'error' },
];

// 智能体列表（关联决策空间角色）
const AGENTS = [
  { id: 'agent-001', name: '生产调度优化Agent', desc: '基于产销匹配的智能排程决策', status: 'running', lastRun: '2分钟前', type: 'planner', tasks: 156, roleId: 'mgr_plan' },
  { id: 'agent-002', name: '设备异常诊断Agent', desc: '基于遥测数据和知识图谱定位根因', status: 'running', lastRun: '5分钟前', type: 'diagnostic', tasks: 89, roleId: 'mgr_process' },
  { id: 'agent-003', name: '质量追溯分析Agent', desc: '跨工序追溯质量缺陷源头', status: 'idle', lastRun: '1小时前', type: 'analyst', tasks: 234, roleId: 'mgr_quality' },
  { id: 'agent-004', name: '物料短缺预警Agent', desc: '实时监控库存并预测短缺风险', status: 'running', lastRun: '刚刚', type: 'monitor', tasks: 567, roleId: 'mgr_purchase' },
  { id: 'agent-005', name: '能源优化Agent', desc: '分析能耗数据并提供节能建议', status: 'idle', lastRun: '3小时前', type: 'analyst', tasks: 45, roleId: 'mgr_factory' },
  { id: 'agent-006', name: '客户需求洞察Agent', desc: '分析大客户历史订单预测未来需求', status: 'running', lastRun: '10分钟前', type: 'analyst', tasks: 123, roleId: 'mgr_ka' },
  { id: 'agent-007', name: '产能规划推演Agent', desc: '中长期产能扩张方案仿真与评估', status: 'idle', lastRun: '2小时前', type: 'planner', tasks: 34, roleId: 'planner_capacity' },
  { id: 'agent-008', name: '基地协同优化Agent', desc: '跨基地资源调配与产能协同', status: 'running', lastRun: '15分钟前', type: 'planner', tasks: 78, roleId: 'gm_changzhou' },
  { id: 'agent-009', name: '产线节拍优化Agent', desc: '实时优化产线节拍平衡', status: 'running', lastRun: '刚刚', type: 'planner', tasks: 189, roleId: 'mgr_line' },
  { id: 'agent-010', name: '财务成本测算Agent', desc: '订单成本实时测算与报价支持', status: 'idle', lastRun: '1小时前', type: 'analyst', tasks: 67, roleId: 'mgr_finance' },
];

const WORKFLOWS = [
  { id: 'wf-001', name: '产销匹配推演流程', nodes: 7, runs: 1289, status: 'active', updated: '2天前' },
  { id: 'wf-002', name: '设备故障处理SOP', nodes: 12, runs: 456, status: 'active', updated: '1周前' },
  { id: 'wf-003', name: '质量异常响应流程', nodes: 5, runs: 234, status: 'draft', updated: '3天前' },
  { id: 'wf-004', name: '自动排产优化流程', nodes: 9, runs: 3456, status: 'active', updated: '5小时前' },
];

export default function AgentWorkspace({ onNavigate }: AgentWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'workflows' | 'tools' | 'skills' | 'simulation' | 'tasks' | 'analytics'>('overview');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedRoleLevel, setSelectedRoleLevel] = useState<RoleLevel | 'all'>('all');
  const [selectedRoleId, setSelectedRoleId] = useState<string | 'all'>('all');
  const [showRoleFilter, setShowRoleFilter] = useState(false);

  const handleNavigate = (id: string) => {
    if (onNavigate) {
      onNavigate(id);
    }
  };

  const tabs: { id: string; label: string; icon: any; count?: number }[] = [
    { id: 'overview', label: '概览', icon: LayoutGrid },
    { id: 'agents', label: '智能体', icon: Bot, count: 10 },
    { id: 'workflows', label: '工作流', icon: GitMerge, count: 4 },
    { id: 'tools', label: 'MCP工具', icon: Wrench, count: 5 },
    { id: 'skills', label: '原子技能', icon: Zap, count: 5 },
    { id: 'simulation', label: '推演', icon: MonitorPlay, count: 2 },
    { id: 'tasks', label: '任务', icon: CheckCircle2, count: 23 },
    { id: 'analytics', label: '分析', icon: BarChart3 },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* GitHub-Style Header */}
      <header className="border-b border-slate-200">
        {/* Top Bar */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Layers size={16} className="text-slate-400" />
            <span className="hover:text-slate-900 cursor-pointer">智能体中台</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="font-medium text-slate-900">Agent Workspace</span>
          </div>
        </div>

        {/* Title Row */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 text-white flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">智能体总览</h1>
                <p className="text-sm text-slate-500">L4 智能体/工具全局运行状态与协同总览</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors">
                <Plus size={14} />
                新建智能体
              </button>
            </div>
          </div>
        </div>

        {/* 选项卡导航 */}
        <div className="flex items-center gap-1 px-4 border-t border-slate-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-t-2 transition-colors",
                  activeTab === tab.id
                    ? "border-slate-800 text-slate-900"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <Icon size={14} />
                {tab.label}
                {tab.count && (
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-slate-50">
        {/* 概览选项卡 */}
        {activeTab === 'overview' && (
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Left: Direct Module Access */}
              <div className="col-span-2 grid grid-cols-2 gap-4">
                {/* 智能体实例 */}
                <div
                  onClick={() => setActiveTab('agents')}
                  className="bg-white p-5 border border-slate-200 hover:border-slate-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Bot size={24} className="text-slate-600" />
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">5</div>
                  <div className="text-sm text-slate-500">智能体实例</div>
                  <div className="mt-3 text-xs text-slate-400">3 个运行中</div>
                </div>

                {/* 工作流编排 */}
                <div
                  onClick={() => setActiveTab('workflows')}
                  className="bg-white p-5 border border-slate-200 hover:border-slate-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <GitMerge size={24} className="text-slate-600" />
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">4</div>
                  <div className="text-sm text-slate-500">工作流编排</div>
                  <div className="mt-3 text-xs text-slate-400">3 个运行中</div>
                </div>

                {/* MCP 工具 */}
                <div
                  onClick={() => setActiveTab('tools')}
                  className="bg-white p-5 border border-slate-200 hover:border-slate-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Wrench size={24} className="text-slate-600" />
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">5</div>
                  <div className="text-sm text-slate-500">MCP 工具</div>
                  <div className="mt-3 text-xs text-slate-400">4 个运行中</div>
                </div>

                {/* 原子技能 */}
                <div
                  onClick={() => setActiveTab('skills')}
                  className="bg-white p-5 border border-slate-200 hover:border-slate-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Zap size={24} className="text-slate-600" />
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">5</div>
                  <div className="text-sm text-slate-500">原子技能</div>
                  <div className="mt-3 text-xs text-slate-400">2 个运行中</div>
                </div>

                {/* 推演任务 - Full width */}
                <div
                  onClick={() => setActiveTab('simulation')}
                  className="col-span-2 bg-white p-5 border border-slate-200 hover:border-slate-400 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <MonitorPlay size={24} className="text-slate-600" />
                    <div>
                      <div className="text-2xl font-bold text-slate-900">2</div>
                      <div className="text-sm text-slate-500">推演任务</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">蒙特卡洛仿真与策略对比</div>
                      <div className="text-xs text-emerald-600 mt-1">1 个运行中</div>
                    </div>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                </div>
              </div>

              {/* Right: Recent Activity */}
              <div className="bg-white border border-slate-200">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <History size={16} className="text-slate-500" />
                    实时运行动态
                  </h3>
                  <button className="text-xs text-sky-600 hover:text-sky-700">查看全部</button>
                </div>

                <div className="divide-y divide-slate-100">
                  {RECENT_ACTIVITIES.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-2 h-2 mt-1.5 shrink-0",
                          activity.status === 'success' ? "bg-emerald-500" :
                          activity.status === 'warning' ? "bg-amber-500" :
                          "bg-rose-500"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900">{activity.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{activity.action}</div>
                          <div className="text-xs text-slate-400 mt-1">{activity.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-slate-200">
                  <button
                    onClick={() => handleNavigate('agent')}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Play size={14} />
                    进入智能体创建
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 智能体选项卡 */}
        {activeTab === 'agents' && (
          <div className="max-w-7xl mx-auto p-6">
            {/* Role Filter Bar */}
            <div className="mb-4 p-4 bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-slate-600" />
                  <span className="font-semibold text-slate-900">按决策空间角色筛选</span>
                </div>
                <button
                  onClick={() => setShowRoleFilter(!showRoleFilter)}
                  className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  {showRoleFilter ? '收起' : '展开'}
                  {showRoleFilter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
              {showRoleFilter && (
                <div className="space-y-3">
                  {/* Level Filter */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setSelectedRoleLevel('all'); setSelectedRoleId('all'); }}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded border transition-colors",
                        selectedRoleLevel === 'all'
                          ? "bg-slate-800 text-white border-slate-800"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                      )}
                    >
                      全部层级
                    </button>
                    {ROLE_LEVELS.map(({ level, color }) => (
                      <button
                        key={level}
                        onClick={() => { setSelectedRoleLevel(level); setSelectedRoleId('all'); }}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded border transition-colors",
                          selectedRoleLevel === level
                            ? color.replace('bg-', 'bg-').replace('text-', 'text-') + " border-current"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  {/* Role Filter */}
                  {selectedRoleLevel !== 'all' && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => setSelectedRoleId('all')}
                        className={cn(
                          "px-2 py-1 text-xs rounded border transition-colors",
                          selectedRoleId === 'all'
                            ? "bg-slate-600 text-white border-slate-600"
                            : "bg-white text-slate-500 border-slate-200"
                        )}
                      >
                        全部
                      </button>
                      {ROLE_LEVELS.find(l => l.level === selectedRoleLevel)?.roles.map((role) => (
                        <button
                          key={role.id}
                          onClick={() => setSelectedRoleId(role.id)}
                          className={cn(
                            "px-2 py-1 text-xs rounded border transition-colors flex items-center gap-1",
                            selectedRoleId === role.id
                              ? "bg-slate-700 text-white border-slate-700"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          <span className="w-4 h-4 rounded bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                            {role.initial}
                          </span>
                          {role.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="搜索智能体..."
                    className="pl-9 pr-4 py-2 w-64 border border-slate-200 text-sm focus:outline-none focus:border-slate-400"
                  />
                </div>
                {(selectedRoleLevel !== 'all' || selectedRoleId !== 'all') && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">筛选中:</span>
                    {selectedRoleLevel !== 'all' && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                        {selectedRoleLevel}
                      </span>
                    )}
                    {selectedRoleId !== 'all' && (
                      <span className="px-2 py-0.5 bg-slate-800 text-white rounded text-xs">
                        {ROLE_TEMPLATES.find(r => r.id === selectedRoleId)?.title}
                      </span>
                    )}
                    <button
                      onClick={() => { setSelectedRoleLevel('all'); setSelectedRoleId('all'); }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      清除
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 border",
                    viewMode === 'list'
                      ? "bg-slate-100 border-slate-300 text-slate-900"
                      : "border-slate-200 text-slate-400 hover:text-slate-600"
                  )}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 border",
                    viewMode === 'grid'
                      ? "bg-slate-100 border-slate-300 text-slate-900"
                      : "border-slate-200 text-slate-400 hover:text-slate-600"
                  )}
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>

            {/* Agent List with Role Filter */}
            {(() => {
              // Apply role filter
              const filteredAgents = AGENTS.filter(agent => {
                if (selectedRoleId !== 'all') return agent.roleId === selectedRoleId;
                if (selectedRoleLevel !== 'all') {
                  const role = ROLE_TEMPLATES.find(r => r.id === agent.roleId);
                  return role?.level === selectedRoleLevel;
                }
                return true;
              });

              return (
                <div className="bg-white border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Agent 名称</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">关联角色</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">状态</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">类型</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">任务数</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">最后运行</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAgents.map((agent) => {
                        const role = ROLE_TEMPLATES.find(r => r.id === agent.roleId);
                        const levelColor = ROLE_LEVELS.find(l => l.level === role?.level)?.color || 'bg-slate-100 text-slate-700';
                        return (
                          <tr key={agent.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <Bot size={18} className="text-slate-500" />
                                <div>
                                  <div className="font-medium text-slate-900">{agent.name}</div>
                                  <div className="text-xs text-slate-500">{agent.desc}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {role && (
                                <div className="flex items-center gap-2">
                                  <div className={cn("w-6 h-6 rounded flex items-center justify-center text-xs font-bold", levelColor.replace('text-', 'bg-').replace('700', '200'), levelColor.replace('bg-', 'text-').replace('100', '700'))}>
                                    {role.initial}
                                  </div>
                                  <div>
                                    <div className="text-xs font-medium text-slate-900">{role.title}</div>
                                    <div className="text-[10px] text-slate-500">{role.level}</div>
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn(
                                "flex items-center gap-1.5 text-xs",
                                agent.status === 'running' ? "text-emerald-600" : "text-slate-500"
                              )}>
                                <span className={cn(
                                  "w-2 h-2 rounded-full",
                                  agent.status === 'running' ? "bg-emerald-500" : "bg-slate-300"
                                )} />
                                {agent.status === 'running' ? '运行中' : '空闲'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs">
                                {agent.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{agent.tasks}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{agent.lastRun}</td>
                            <td className="px-4 py-3">
                              <button className="p-1 hover:bg-slate-200 text-slate-400">
                                <MoreHorizontal size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        )}

        {/* 工作流选项卡 */}
        {activeTab === 'workflows' && (
          <div className="max-w-7xl mx-auto p-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="搜索工作流..."
                    className="pl-9 pr-4 py-2 w-64 border border-slate-200 text-sm focus:outline-none focus:border-slate-400"
                  />
                </div>
                <button className="flex items-center gap-1 px-3 py-2 border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                  <Filter size={14} />
                  状态
                </button>
              </div>
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white text-sm font-medium hover:bg-slate-700">
                <Plus size={14} />
                新建工作流
              </button>
            </div>

            {/* Workflow List */}
            <div className="bg-white border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Workflow 名称</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">节点数</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">运行次数</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">状态</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">更新时间</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {WORKFLOWS.map((wf) => (
                    <tr key={wf.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => handleNavigate('workflow')}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <GitMerge size={18} className="text-slate-500" />
                          <div>
                            <div className="font-medium text-sky-600 hover:underline">{wf.name}</div>
                            <div className="text-xs text-slate-500 font-mono">{wf.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{wf.nodes} 个节点</td>
                      <td className="px-4 py-3 text-slate-600">{wf.runs.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-0.5 text-xs",
                          wf.status === 'active'
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        )}>
                          {wf.status === 'active' ? '已启用' : '草稿'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{wf.updated}</td>
                      <td className="px-4 py-3">
                        <button className="p-1 hover:bg-slate-200 text-slate-400">
                          <Settings size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 任务选项卡 */}
        {activeTab === 'tasks' && (
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm font-medium text-slate-900 border-b-2 border-slate-800">运行中 (8)</button>
                <button className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">已完成 (45)</button>
                <button className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">失败 (2)</button>
              </div>
              <button onClick={() => handleNavigate('agent')} className="text-sm text-sky-600 hover:text-sky-700">
                进入控制台 →
              </button>
            </div>

            <div className="bg-white border border-slate-200">
              <div className="p-8 text-center text-slate-500">
                <CheckCircle2 size={48} className="mx-auto mb-4 opacity-30" />
                <p>请在智能体创建查看任务详情</p>
                <button
                  onClick={() => handleNavigate('agent')}
                  className="mt-4 px-4 py-2 bg-slate-800 text-white text-sm font-medium hover:bg-slate-700"
                >
                  前往控制台
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MCP工具选项卡 */}
        {activeTab === 'tools' && (
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="搜索工具..."
                    className="pl-9 pr-4 py-2 w-64 border border-slate-200 text-sm focus:outline-none focus:border-slate-400"
                  />
                </div>
                <button className="flex items-center gap-1 px-3 py-2 border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                  <Filter size={14} />
                  筛选
                </button>
              </div>
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white text-sm font-medium hover:bg-slate-700">
                <Plus size={14} />
                注册工具
              </button>
            </div>

            <div className="bg-white border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">工具名称</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">类型</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">状态</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">调用次数</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">延迟</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { id: 'tool-001', name: 'ERP_Order_Query', type: 'REST API', status: 'active', calls: 1256, latency: '120ms' },
                    { id: 'tool-002', name: 'MES_Data_Pull', type: 'GraphQL', status: 'active', calls: 892, latency: '85ms' },
                    { id: 'tool-003', name: 'WMS_Inventory', type: 'REST API', status: 'warning', calls: 567, latency: '2.3s' },
                    { id: 'tool-004', name: 'QMS_Report', type: 'REST API', status: 'active', calls: 234, latency: '95ms' },
                    { id: 'tool-005', name: 'IoT_Telemetry', type: 'MQTT', status: 'active', calls: 5678, latency: '15ms' },
                  ].map((tool) => (
                    <tr key={tool.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Wrench size={18} className="text-slate-500" />
                          <div>
                            <div className="font-medium text-slate-900">{tool.name}</div>
                            <div className="text-xs text-slate-500 font-mono">{tool.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{tool.type}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-0.5 text-xs",
                          tool.status === 'active'
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        )}>
                          {tool.status === 'active' ? '正常' : '警告'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{tool.calls.toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-600">{tool.latency}</td>
                      <td className="px-4 py-3">
                        <button className="p-1 hover:bg-slate-200 text-slate-400">
                          <Settings size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 原子技能选项卡 */}
        {activeTab === 'skills' && (
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="搜索技能..."
                    className="pl-9 pr-4 py-2 w-64 border border-slate-200 text-sm focus:outline-none focus:border-slate-400"
                  />
                </div>
                <button className="flex items-center gap-1 px-3 py-2 border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                  <Filter size={14} />
                  分类
                </button>
              </div>
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white text-sm font-medium hover:bg-slate-700">
                <Plus size={14} />
                新建技能
              </button>
            </div>

            <div className="bg-white border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">技能名称</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">分类</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">状态</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">调用次数</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">绑定Agent</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { id: 'skill-001', name: 'OEE智能优化', category: '生产效率', status: 'active', calls: 234, agents: 3 },
                    { id: 'skill-002', name: '质量根因分析', category: '质量管理', status: 'active', calls: 189, agents: 2 },
                    { id: 'skill-003', name: '设备健康诊断', category: '设备运维', status: 'active', calls: 156, agents: 2 },
                    { id: 'skill-004', name: '排程优化', category: '生产计划', status: 'draft', calls: 0, agents: 0 },
                    { id: 'skill-005', name: '能耗分析', category: '能源管理', status: 'active', calls: 98, agents: 1 },
                  ].map((skill) => (
                    <tr key={skill.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Zap size={18} className="text-slate-500" />
                          <div>
                            <div className="font-medium text-slate-900">{skill.name}</div>
                            <div className="text-xs text-slate-500 font-mono">{skill.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{skill.category}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-0.5 text-xs",
                          skill.status === 'active'
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        )}>
                          {skill.status === 'active' ? '已发布' : '草稿'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{skill.calls}</td>
                      <td className="px-4 py-3 text-slate-600">{skill.agents} 个</td>
                      <td className="px-4 py-3">
                        <button className="p-1 hover:bg-slate-200 text-slate-400">
                          <Settings size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 推演选项卡 */}
        {activeTab === 'simulation' && (
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="搜索推演任务..."
                    className="pl-9 pr-4 py-2 w-64 border border-slate-200 text-sm focus:outline-none focus:border-slate-400"
                  />
                </div>
                <button className="flex items-center gap-1 px-3 py-2 border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                  <Filter size={14} />
                  状态
                </button>
              </div>
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white text-sm font-medium hover:bg-slate-700">
                <Plus size={14} />
                新建推演
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { id: 'sim-001', name: 'Q3产能满载推演', status: 'completed', scenarios: 5, result: '最优方案A', time: '2小时前' },
                { id: 'sim-002', name: '设备故障影响分析', status: 'running', scenarios: 3, result: '计算中...', time: '进行中' },
              ].map((sim) => (
                <div key={sim.id} className="bg-white border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <MonitorPlay size={20} className="text-slate-600" />
                      <div>
                        <div className="font-medium text-slate-900">{sim.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{sim.id}</div>
                      </div>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 text-xs",
                      sim.status === 'completed'
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-100 text-blue-700"
                    )}>
                      {sim.status === 'completed' ? '已完成' : '运行中'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">场景数</span>
                      <span className="text-slate-900">{sim.scenarios} 个</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">推演结果</span>
                      <span className="text-slate-900">{sim.result}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">时间</span>
                      <span className="text-slate-500">{sim.time}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                    <button className="flex-1 px-3 py-1.5 text-sm text-slate-700 border border-slate-200 hover:bg-slate-50">
                      查看详情
                    </button>
                    {sim.status === 'completed' && (
                      <button className="flex-1 px-3 py-1.5 text-sm text-white bg-slate-800 hover:bg-slate-700">
                        应用结果
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 分析选项卡 */}
        {activeTab === 'analytics' && (
          <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Agent 调用趋势</h3>
                <div className="h-48 flex items-end justify-between gap-2">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 bg-slate-200 hover:bg-slate-300 transition-colors" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">技能调用分布</h3>
                <div className="space-y-3">
                  {[
                    { name: 'OEE智能优化', count: 234, pct: 35 },
                    { name: '质量根因分析', count: 189, pct: 28 },
                    { name: '设备健康诊断', count: 156, pct: 23 },
                    { name: '其他', count: 98, pct: 14 },
                  ].map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">{item.name}</span>
                        <span className="text-slate-500">{item.count}</span>
                      </div>
                      <div className="h-2 bg-slate-100">
                        <div className="h-full bg-slate-600" style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
