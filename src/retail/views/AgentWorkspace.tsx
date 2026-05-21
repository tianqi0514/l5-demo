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
  Layers,
  TerminalSquare,
  Play,
  LayoutGrid,
  List,
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
  Store,
  Users,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  TrendingUp,
  Package,
  Heart,
  Target
} from 'lucide-react';
import { cn } from '../lib/utils';

// ============================================================
// 零售决策空间角色定义
// ============================================================
type RoleLevel = '战略层' | '经营层' | '执行层' | '区域层' | '城市层' | '门店层';

interface RoleInfo {
  id: string;
  title: string;
  level: RoleLevel;
  initial: string;
  scope: string;
}

const ROLE_TEMPLATES: RoleInfo[] = [
  // 战略层
  { id: 'ceo', title: 'CEO', level: '战略层', initial: 'C', scope: '全集团 · 全国门店' },
  // 经营层
  { id: 'vp_product', title: '商品副总裁', level: '经营层', initial: '商', scope: '集团商品 · 选品策略' },
  { id: 'vp_marketing', title: '营销副总裁', level: '经营层', initial: '营', scope: '集团营销 · 全渠道' },
  { id: 'vp_supply', title: '供应链副总裁', level: '经营层', initial: '供', scope: '集团供应链 · 仓配' },
  { id: 'vp_ops', title: '运营副总裁', level: '经营层', initial: '运', scope: '集团运营 · 门店管理' },
  // 执行层
  { id: 'mgr_product', title: '商品经理', level: '执行层', initial: '选', scope: '商品部 · 选品规划' },
  { id: 'mgr_store', title: '门店运营经理', level: '执行层', initial: '店', scope: '门店运营部' },
  { id: 'mgr_quality', title: '品控经理', level: '执行层', initial: '品', scope: '品控部 · 食品安全' },
  { id: 'mgr_finance', title: '财务经理', level: '执行层', initial: '财', scope: '财务部 · 全口径' },
  { id: 'mgr_member', title: '会员运营经理', level: '执行层', initial: '会', scope: '会员运营部' },
  { id: 'mgr_logistics', title: '物流经理', level: '执行层', initial: '物', scope: '物流部 · 配送优化' },
  { id: 'analyst_demand', title: '需求预测分析师', level: '执行层', initial: '需', scope: '数据分析部 · 需求预测' },
  // 区域层
  { id: 'gm_east', title: '华东大区总经理', level: '区域层', initial: '华', scope: '华东大区 · 江浙沪皖' },
  { id: 'gm_south', title: '华南大区总经理', level: '区域层', initial: '南', scope: '华南大区 · 粤闽赣' },
  { id: 'gm_north', title: '华北大区总经理', level: '区域层', initial: '北', scope: '华北大区 · 京津冀鲁' },
  { id: 'gm_southwest', title: '西南大区总经理', level: '区域层', initial: '西', scope: '西南大区 · 川渝云贵' },
  // 城市层
  { id: 'city_mgr_sh', title: '上海城市经理', level: '城市层', initial: '沪', scope: '上海市 · 全部门店' },
  { id: 'city_mgr_hz', title: '杭州城市经理', level: '城市层', initial: '杭', scope: '杭州市 · 全部门店' },
  { id: 'city_mgr_sz', title: '深圳城市经理', level: '城市层', initial: '深', scope: '深圳市 · 全部门店' },
  // 门店层
  { id: 'store_mgr', title: '店长', level: '门店层', initial: '长', scope: '单店管理' },
];

// 按层级分组
const ROLE_LEVELS: { level: RoleLevel; icon: any; color: string; roles: RoleInfo[] }[] = [
  { level: '战略层', icon: Crown, color: 'bg-purple-100 text-purple-700', roles: ROLE_TEMPLATES.filter(r => r.level === '战略层') },
  { level: '经营层', icon: Briefcase, color: 'bg-blue-100 text-blue-700', roles: ROLE_TEMPLATES.filter(r => r.level === '经营层') },
  { level: '执行层', icon: UserCircle, color: 'bg-emerald-100 text-emerald-700', roles: ROLE_TEMPLATES.filter(r => r.level === '执行层') },
  { level: '区域层', icon: MapPin, color: 'bg-amber-100 text-amber-700', roles: ROLE_TEMPLATES.filter(r => r.level === '区域层') },
  { level: '城市层', icon: Target, color: 'bg-rose-100 text-rose-700', roles: ROLE_TEMPLATES.filter(r => r.level === '城市层') },
  { level: '门店层', icon: Store, color: 'bg-slate-100 text-slate-700', roles: ROLE_TEMPLATES.filter(r => r.level === '门店层') },
];

// --- Mock Data ---
const MODULE_STATS = [
  { id: 'agent', name: '智能体实例', count: 10, active: 7, icon: Bot, color: 'slate' },
  { id: 'workflow', name: '工作流编排', count: 4, active: 3, icon: GitMerge, color: 'slate' },
  { id: 'tool', name: 'MCP 工具', count: 5, active: 4, icon: Wrench, color: 'slate' },
  { id: 'skill', name: '原子技能', count: 5, active: 3, icon: Zap, color: 'slate' },
  { id: 'simulation', name: '推演任务', count: 2, active: 1, icon: MonitorPlay, color: 'slate' },
];

const RECENT_ACTIVITIES = [
  { id: 1, type: 'agent', title: '商品选品Agent', action: '触发了季节性选品工作流', time: '2分钟前', status: 'success' },
  { id: 2, type: 'simulation', title: '618促销策略推演', action: '推演完成，生成最优方案A', time: '15分钟前', status: 'success' },
  { id: 3, type: 'tool', title: 'POS数据接口', action: '响应延迟超阈值 (>2s)', time: '1小时前', status: 'warning' },
  { id: 4, type: 'workflow', title: '食品安全预警工作流', action: '执行失败，等待人工介入', time: '2小时前', status: 'error' },
];

const AGENTS = [
  { id: 'agent-001', name: '商品选品Agent', desc: '基于销售数据和季节趋势进行智能选品推荐', status: 'running', lastRun: '2分钟前', type: 'planner', tasks: 256, roleId: 'mgr_product' },
  { id: 'agent-002', name: '门店运营Agent', desc: '门店日常运营监控与异常预警', status: 'running', lastRun: '5分钟前', type: 'monitor', tasks: 189, roleId: 'mgr_store' },
  { id: 'agent-003', name: '品控Agent', desc: '食品安全质量监控与追溯分析', status: 'running', lastRun: '刚刚', type: 'diagnostic', tasks: 134, roleId: 'mgr_quality' },
  { id: 'agent-004', name: '财务分析Agent', desc: '门店盈利分析与成本管控建议', status: 'idle', lastRun: '1小时前', type: 'analyst', tasks: 89, roleId: 'mgr_finance' },
  { id: 'agent-005', name: '营销Agent', desc: '促销活动效果分析与策略优化', status: 'running', lastRun: '10分钟前', type: 'analyst', tasks: 167, roleId: 'vp_marketing' },
  { id: 'agent-006', name: '供应链Agent', desc: '库存优化与补货建议', status: 'running', lastRun: '3分钟前', type: 'planner', tasks: 234, roleId: 'vp_supply' },
  { id: 'agent-007', name: '会员洞察Agent', desc: '会员消费行为分析与精准营销', status: 'running', lastRun: '8分钟前', type: 'analyst', tasks: 345, roleId: 'mgr_member' },
  { id: 'agent-008', name: '需求预测Agent', desc: '区域/门店级别销售需求预测', status: 'idle', lastRun: '2小时前', type: 'analyst', tasks: 78, roleId: 'analyst_demand' },
  { id: 'agent-009', name: '门店坪效Agent', desc: '门店坪效分析与布局优化建议', status: 'running', lastRun: '刚刚', type: 'analyst', tasks: 156, roleId: 'store_mgr' },
  { id: 'agent-010', name: '物流优化Agent', desc: '配送路径优化与运力调度', status: 'idle', lastRun: '1小时前', type: 'planner', tasks: 98, roleId: 'mgr_logistics' },
];

const WORKFLOWS = [
  { id: 'wf-001', name: '促销活动审批流程', nodes: 7, runs: 1289, status: 'active', updated: '2天前' },
  { id: 'wf-002', name: '食品安全应急响应', nodes: 5, runs: 45, status: 'active', updated: '1周前' },
  { id: 'wf-003', name: '新店开业准备流程', nodes: 9, runs: 12, status: 'draft', updated: '3天前' },
  { id: 'wf-004', name: '季节性选品流程', nodes: 6, runs: 89, status: 'active', updated: '5小时前' },
];

export default function AgentWorkspace() {
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'workflows' | 'tools' | 'skills' | 'simulation' | 'tasks' | 'analytics'>('overview');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedRoleLevel, setSelectedRoleLevel] = useState<RoleLevel | 'all'>('all');
  const [selectedRoleId, setSelectedRoleId] = useState<string | 'all'>('all');
  const [showRoleFilter, setShowRoleFilter] = useState(false);

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
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Layers size={16} className="text-slate-400" />
            <span className="hover:text-slate-900 cursor-pointer">智能体中台</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="font-medium text-slate-900">Agent Workspace</span>
          </div>
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 text-white flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">智能体总览</h1>
                <p className="text-sm text-slate-500">零售决策中台 - 智能体/工具全局运行状态与协同总览</p>
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

        {/* Tabs */}
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
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Left: Stat Cards */}
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
                  <div className="text-2xl font-bold text-slate-900">10</div>
                  <div className="text-sm text-slate-500">智能体实例</div>
                  <div className="mt-3 text-xs text-slate-400">7 个运行中</div>
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
                  <div className="mt-3 text-xs text-slate-400">3 个运行中</div>
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
                      <div className="text-xs text-slate-400">促销策略仿真与门店模型推演</div>
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
                  <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <Play size={14} />
                    进入智能体创建
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agents Tab */}
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

            {/* Agent List */}
            {(() => {
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

        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <div className="max-w-7xl mx-auto p-6">
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
                    <tr key={wf.id} className="hover:bg-slate-50 cursor-pointer">
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

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm font-medium text-slate-900 border-b-2 border-slate-800">运行中 (8)</button>
                <button className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">已完成 (45)</button>
                <button className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">失败 (2)</button>
              </div>
            </div>
            <div className="bg-white border border-slate-200">
              <div className="p-8 text-center text-slate-500">
                <CheckCircle2 size={48} className="mx-auto mb-4 opacity-30" />
                <p>请在智能体创建查看任务详情</p>
              </div>
            </div>
          </div>
        )}

        {/* Tools Tab */}
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
                    { id: 'tool-001', name: 'get_store_sales', type: 'REST API', status: 'active', calls: 12560, latency: '45ms' },
                    { id: 'tool-002', name: 'query_inventory', type: 'GraphQL', status: 'active', calls: 8920, latency: '32ms' },
                    { id: 'tool-003', name: 'update_promotion', type: 'REST API', status: 'active', calls: 1567, latency: '120ms' },
                    { id: 'tool-004', name: 'analyze_member', type: 'REST API', status: 'active', calls: 6789, latency: '85ms' },
                    { id: 'tool-005', name: 'get_product_margin', type: 'REST API', status: 'warning', calls: 2340, latency: '2.1s' },
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

        {/* Skills Tab */}
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
                    { id: 'skill-001', name: '选品推荐引擎', category: '商品管理', status: 'active', calls: 2345, agents: 3 },
                    { id: 'skill-002', name: '会员流失预警', category: '会员运营', status: 'active', calls: 1890, agents: 2 },
                    { id: 'skill-003', name: '门店坪效分析', category: '门店运营', status: 'active', calls: 1567, agents: 2 },
                    { id: 'skill-004', name: '促销效果评估', category: '营销分析', status: 'draft', calls: 0, agents: 0 },
                    { id: 'skill-005', name: '食品安全追溯', category: '品控管理', status: 'active', calls: 987, agents: 1 },
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

        {/* Simulation Tab */}
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
              </div>
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white text-sm font-medium hover:bg-slate-700">
                <Plus size={14} />
                新建推演
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { id: 'sim-001', name: '618促销策略推演', status: 'completed', scenarios: 3, result: '最优方案A', time: '15分钟前' },
                { id: 'sim-002', name: '新店盈利模型推演', status: 'running', scenarios: 5, result: '计算中...', time: '进行中' },
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

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Agent 调用趋势</h3>
                <div className="h-48 flex items-end justify-between gap-2">
                  {[35, 55, 42, 78, 62, 85, 70].map((h, i) => (
                    <div key={i} className="flex-1 bg-slate-200 hover:bg-slate-300 transition-colors" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
              <div className="bg-white border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">技能调用分布</h3>
                <div className="space-y-3">
                  {[
                    { name: '选品推荐引擎', count: 2345, pct: 38 },
                    { name: '会员流失预警', count: 1890, pct: 30 },
                    { name: '门店坪效分析', count: 1567, pct: 25 },
                    { name: '其他', count: 450, pct: 7 },
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
