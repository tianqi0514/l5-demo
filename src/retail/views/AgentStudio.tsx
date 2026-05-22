import React, { useState } from 'react';
import {
  Bot, Plus, Search, Settings, Cpu, BrainCircuit, Database, Wrench,
  ShieldCheck, MonitorPlay, FileOutput, ArrowRight, Save, Play, CheckCircle2,
  Users, Crown, Briefcase, Store, UserCircle, MapPin, ChevronDown, ChevronUp,
  Target, ShoppingCart, Heart, TrendingUp, Package, Network, Zap, BarChart3,
  AlertTriangle, FileText, GitBranch, Layers, X, ZoomIn, ZoomOut, Maximize2
} from 'lucide-react';
import { cn } from '../lib/utils';

// ============================================================
// 零售决策空间角色模板
// ============================================================
type RoleLevel = '战略层' | '经营层' | '执行层' | '区域层' | '城市层' | '门店层';

interface RoleTemplate {
  id: string;
  title: string;
  level: RoleLevel;
  initial: string;
  scope: string;
  defaultOntologies: string[];
  defaultSkills: string[];
  defaultConstraints: string[];
  desc: string;
}

const ROLE_TEMPLATES: RoleTemplate[] = [
  // 战略层
  { id: 'ceo', title: 'CEO', level: '战略层', initial: 'C', scope: '全集团 · 全国门店',
    defaultOntologies: ['store', 'product', 'sales_order', 'member', 'inventory'],
    defaultSkills: ['strategic_analysis_v1', 'kpi_monitor_v1', 'risk_alert_v1', 'decision_support_v1'],
    defaultConstraints: ['年度GMV目标', '毛利率控制', '食品安全合规'],
    desc: '全集团战略决策，年度目标监控，重大事项决策' },

  // 经营层
  { id: 'vp_product', title: '商品副总裁', level: '经营层', initial: '商', scope: '集团商品 · 选品策略',
    defaultOntologies: ['product', 'sku', 'category', 'supplier'],
    defaultSkills: ['product_selection_v1', 'category_optimization_v1', 'seasonal_planning_v1'],
    defaultConstraints: ['SKU数量控制', '新品占比', '滞销品清理'],
    desc: '集团商品统筹，选品策略，品类规划' },
  { id: 'vp_marketing', title: '营销副总裁', level: '经营层', initial: '营', scope: '集团营销 · 全渠道',
    defaultOntologies: ['promotion', 'member', 'sales_order', 'coupon'],
    defaultSkills: ['promotion_strategy_v1', 'member_growth_v1', 'campaign_roi_v1'],
    defaultConstraints: ['营销费用率', 'ROI目标', '会员增长率'],
    desc: '集团营销管理，促销活动策划，会员增长' },
  { id: 'vp_supply', title: '供应链副总裁', level: '经营层', initial: '供', scope: '集团供应链 · 仓配',
    defaultOntologies: ['supplier', 'warehouse', 'distribution', 'inventory'],
    defaultSkills: ['inventory_optimization_v1', 'demand_forecasting_v1', 'logistics_coordination_v1'],
    defaultConstraints: ['库存周转天数', '缺货率', '配送准时率'],
    desc: '集团供应链管理，库存优化，配送协调' },
  { id: 'vp_ops', title: '运营副总裁', level: '经营层', initial: '运', scope: '集团运营 · 门店管理',
    defaultOntologies: ['store', 'sales_order', 'pos_transaction', 'inventory'],
    defaultSkills: ['store_ops_v1', 'revenue_analysis_v1', 'efficiency_monitor_v1'],
    defaultConstraints: ['门店坪效', '人效目标', '运营成本'],
    desc: '集团运营管理，门店绩效，运营效率' },

  // 执行层
  { id: 'mgr_product', title: '商品经理', level: '执行层', initial: '选', scope: '商品部 · 选品规划',
    defaultOntologies: ['product', 'sku', 'category', 'sales_order'],
    defaultSkills: ['product_selection_v1', 'sales_analysis_v1', 'margin_calculation_v1'],
    defaultConstraints: ['选品通过率', '毛利率目标', '新品上市周期'],
    desc: '商品选品规划，销售分析，毛利管控' },
  { id: 'mgr_store', title: '门店运营经理', level: '执行层', initial: '店', scope: '门店运营部',
    defaultOntologies: ['store', 'sales_order', 'pos_transaction', 'member'],
    defaultSkills: ['store_ops_v1', 'daily_report_v1', 'exception_alert_v1'],
    defaultConstraints: ['日销目标', '客单价', '会员转化率'],
    desc: '门店日常运营，销售目标跟踪，异常处理' },
  { id: 'mgr_quality', title: '品控经理', level: '执行层', initial: '品', scope: '品控部 · 食品安全',
    defaultOntologies: ['product', 'supplier', 'inventory'],
    defaultSkills: ['quality_inspection_v1', 'traceability_query_v1', 'supplier_audit_v1'],
    defaultConstraints: ['食品安全标准', '保质期管理', '供应商资质'],
    desc: '食品安全管控，质量追溯，供应商审核' },
  { id: 'mgr_finance', title: '财务经理', level: '执行层', initial: '财', scope: '财务部 · 全口径',
    defaultOntologies: ['sales_order', 'product', 'store', 'inventory'],
    defaultSkills: ['revenue_analysis_v1', 'margin_calculation_v1', 'cost_control_v1'],
    defaultConstraints: ['毛利率>35%', '费用预算', '现金流目标'],
    desc: '财务分析，毛利测算，成本控制' },
  { id: 'mgr_member', title: '会员运营经理', level: '执行层', initial: '会', scope: '会员运营部',
    defaultOntologies: ['member', 'promotion', 'coupon', 'sales_order'],
    defaultSkills: ['member_segmentation_v1', 'churn_prediction_v1', 'campaign_roi_v1'],
    defaultConstraints: ['会员增长率', '复购率', 'LTV目标'],
    desc: '会员运营，精准营销，流失预警' },
  { id: 'mgr_logistics', title: '物流经理', level: '执行层', initial: '物', scope: '物流部 · 配送优化',
    defaultOntologies: ['warehouse', 'distribution', 'inventory', 'store'],
    defaultSkills: ['route_optimization_v1', 'delivery_tracking_v1', 'capacity_planning_v1'],
    defaultConstraints: ['配送准时率>95%', '配送成本', '车辆满载率'],
    desc: '配送路径优化，运力调度，配送跟踪' },
  { id: 'analyst_demand', title: '需求预测分析师', level: '执行层', initial: '需', scope: '数据分析部 · 需求预测',
    defaultOntologies: ['sales_order', 'product', 'store', 'member'],
    defaultSkills: ['demand_forecasting_v1', 'trend_analysis_v1', 'model_training_v1'],
    defaultConstraints: ['预测准确率', '数据质量', '模型更新频率'],
    desc: '需求预测分析，趋势洞察，数据建模' },

  // 区域层
  { id: 'gm_east', title: '华东大区总经理', level: '区域层', initial: '华', scope: '华东大区 · 江浙沪皖',
    defaultOntologies: ['store', 'region', 'sales_order', 'inventory'],
    defaultSkills: ['regional_ops_v1', 'kpi_monitor_v1', 'cross_city_coordination_v1'],
    defaultConstraints: ['区域GMV目标', '区域毛利率', '门店扩张计划'],
    desc: '华东大区全面管理，跨区域协调' },
  { id: 'gm_south', title: '华南大区总经理', level: '区域层', initial: '南', scope: '华南大区 · 粤闽赣',
    defaultOntologies: ['store', 'region', 'sales_order', 'inventory'],
    defaultSkills: ['regional_ops_v1', 'kpi_monitor_v1', 'cross_city_coordination_v1'],
    defaultConstraints: ['区域GMV目标', '区域毛利率', '门店扩张计划'],
    desc: '华南大区全面管理，跨区域协调' },
  { id: 'gm_north', title: '华北大区总经理', level: '区域层', initial: '北', scope: '华北大区 · 京津冀鲁',
    defaultOntologies: ['store', 'region', 'sales_order', 'inventory'],
    defaultSkills: ['regional_ops_v1', 'kpi_monitor_v1', 'cross_city_coordination_v1'],
    defaultConstraints: ['区域GMV目标', '区域毛利率', '门店扩张计划'],
    desc: '华北大区全面管理，跨区域协调' },
  { id: 'gm_southwest', title: '西南大区总经理', level: '区域层', initial: '西', scope: '西南大区 · 川渝云贵',
    defaultOntologies: ['store', 'region', 'sales_order', 'inventory'],
    defaultSkills: ['regional_ops_v1', 'kpi_monitor_v1', 'cross_city_coordination_v1'],
    defaultConstraints: ['区域GMV目标', '区域毛利率', '门店扩张计划'],
    desc: '西南大区全面管理，跨区域协调' },

  // 城市层
  { id: 'city_mgr_sh', title: '上海城市经理', level: '城市层', initial: '沪', scope: '上海市 · 全部门店',
    defaultOntologies: ['store', 'city', 'sales_order', 'member'],
    defaultSkills: ['city_ops_v1', 'store_management_v1', 'local_marketing_v1'],
    defaultConstraints: ['城市GMV目标', '门店达标率', '本地竞争策略'],
    desc: '上海市门店管理，本地运营策略' },
  { id: 'city_mgr_hz', title: '杭州城市经理', level: '城市层', initial: '杭', scope: '杭州市 · 全部门店',
    defaultOntologies: ['store', 'city', 'sales_order', 'member'],
    defaultSkills: ['city_ops_v1', 'store_management_v1', 'local_marketing_v1'],
    defaultConstraints: ['城市GMV目标', '门店达标率', '本地竞争策略'],
    desc: '杭州市门店管理，本地运营策略' },
  { id: 'city_mgr_sz', title: '深圳城市经理', level: '城市层', initial: '深', scope: '深圳市 · 全部门店',
    defaultOntologies: ['store', 'city', 'sales_order', 'member'],
    defaultSkills: ['city_ops_v1', 'store_management_v1', 'local_marketing_v1'],
    defaultConstraints: ['城市GMV目标', '门店达标率', '本地竞争策略'],
    desc: '深圳市门店管理，本地运营策略' },

  // 门店层
  { id: 'store_mgr', title: '店长', level: '门店层', initial: '长', scope: '单店管理',
    defaultOntologies: ['store', 'sales_order', 'pos_transaction', 'inventory', 'member'],
    defaultSkills: ['daily_ops_v1', 'sales_tracking_v1', 'member_conversion_v1', 'inventory_check_v1'],
    defaultConstraints: ['日销目标', '客单价', '会员转化率', '库存准确率'],
    desc: '单店全面管理，销售目标达成，团队管理' },
];

// 按层级分组
const ROLE_LEVELS: { level: RoleLevel; icon: any; roles: RoleTemplate[] }[] = [
  { level: '战略层', icon: Crown, roles: ROLE_TEMPLATES.filter(r => r.level === '战略层') },
  { level: '经营层', icon: Briefcase, roles: ROLE_TEMPLATES.filter(r => r.level === '经营层') },
  { level: '执行层', icon: UserCircle, roles: ROLE_TEMPLATES.filter(r => r.level === '执行层') },
  { level: '区域层', icon: MapPin, roles: ROLE_TEMPLATES.filter(r => r.level === '区域层') },
  { level: '城市层', icon: Target, roles: ROLE_TEMPLATES.filter(r => r.level === '城市层') },
  { level: '门店层', icon: Store, roles: ROLE_TEMPLATES.filter(r => r.level === '门店层') },
];

const configuredAgents = [
  { id: 'a1', name: '商品选品Agent', desc: '基于销售数据和季节趋势进行智能选品推荐', status: 'active', roleId: 'mgr_product' },
  { id: 'a2', name: '门店运营Agent', desc: '门店日常运营监控与异常预警', status: 'active', roleId: 'mgr_store' },
  { id: 'a3', name: '会员洞察Agent', desc: '会员消费行为分析与精准营销建议', status: 'draft', roleId: 'mgr_member' },
];

const steps = [
  { id: 'role', title: '步骤 0: 角色选择', desc: '选择决策空间角色模板', icon: Users },
  { id: 'intent', title: '步骤 1: 意图解析', desc: '自然语言理解 (LLM)', icon: BrainCircuit },
  { id: 'ontology', title: '步骤 2: 本体解析', desc: '识别业务对象 (语义解析)', icon: Database },
  { id: 'binding', title: '步骤 3: 数据绑定', desc: '参数映射与填充', icon: ArrowRight },
  { id: 'skill', title: '步骤 4: 技能选择', desc: '匹配最佳工具 (MCP)', icon: Wrench },
  { id: 'constraint', title: '步骤 5: 约束注入', desc: '应用业务规则', icon: ShieldCheck },
  { id: 'simulation', title: '步骤 6: 推演计算', desc: '仿真与数值计算', icon: MonitorPlay },
  { id: 'result', title: '步骤 7: 结果结构化', desc: '格式化输出', icon: FileOutput },
];

export default function AgentStudio() {
  const [agents, setAgents] = useState(configuredAgents);
  const [activeAgentId, setActiveAgentId] = useState('a1');
  const [activeStep, setActiveStep] = useState('role');
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState<string[]>(['执行层']);
  const [resultTab, setResultTab] = useState<'json' | 'graph'>('json');
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [graphZoom, setGraphZoom] = useState(1);

  const activeAgent = agents.find(a => a.id === activeAgentId) || agents[0];
  const activeRole = ROLE_TEMPLATES.find(r => r.id === activeAgent.roleId);

  const handleCreateAgent = () => {
    const newId = `a${Date.now()}`;
    const newAgent = {
      id: newId,
      name: '新建智能体',
      desc: '请描述该智能体的功能与用途...',
      status: 'draft',
      roleId: undefined as string | undefined
    };
    setAgents([newAgent, ...agents]);
    setActiveAgentId(newId);
    setActiveStep('role');
    setIsEditing(true);
  };

  const applyRoleTemplate = (role: RoleTemplate) => {
    updateActiveAgent({
      roleId: role.id,
      name: `${role.title} Agent`,
      desc: role.desc
    });
    setActiveStep('intent');
  };

  const toggleLevel = (level: string) => {
    setExpandedLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const updateActiveAgent = (updates: Partial<typeof activeAgent>) => {
    setAgents(agents.map(a => a.id === activeAgentId ? { ...a, ...updates } : a));
  };

  const handleSave = () => {
    setIsEditing(false);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  // 技能配置状态
  const AVAILABLE_SKILLS = [
    'product_selection_v1', 'category_optimization_v1', 'seasonal_planning_v1',
    'promotion_strategy_v1', 'member_growth_v1', 'campaign_roi_v1',
    'inventory_optimization_v1', 'demand_forecasting_v1', 'logistics_coordination_v1',
    'store_ops_v1', 'revenue_analysis_v1', 'efficiency_monitor_v1',
    'sales_analysis_v1', 'margin_calculation_v1', 'daily_report_v1',
    'exception_alert_v1', 'quality_inspection_v1', 'traceability_query_v1',
    'member_segmentation_v1', 'churn_prediction_v1', 'route_optimization_v1',
    'trend_analysis_v1', 'model_training_v1', 'regional_ops_v1',
    'city_ops_v1', 'local_marketing_v1', 'daily_ops_v1',
    'sales_tracking_v1', 'member_conversion_v1', 'inventory_check_v1',
  ];

  const [agentSkillConfigs, setAgentSkillConfigs] = useState<{ agentId: string; selectedSkillIds: string[] }[]>([
    { agentId: "a1", selectedSkillIds: ['product_selection_v1', 'sales_analysis_v1', 'margin_calculation_v1'] },
    { agentId: "a2", selectedSkillIds: ['store_ops_v1', 'daily_report_v1', 'exception_alert_v1'] },
    { agentId: "a3", selectedSkillIds: ['member_segmentation_v1', 'churn_prediction_v1'] },
  ]);

  // 约束配置状态
  const AVAILABLE_CONSTRAINTS = [
    '年度GMV目标', '毛利率控制', '食品安全合规',
    'SKU数量控制', '新品占比', '滞销品清理',
    '营销费用率', 'ROI目标', '会员增长率',
    '库存周转天数', '缺货率', '配送准时率',
    '门店坪效', '人效目标', '运营成本',
    '选品通过率', '毛利率目标', '新品上市周期',
    '日销目标', '客单价', '会员转化率',
    '食品安全标准', '保质期管理', '供应商资质',
    '毛利率>35%', '费用预算', '现金流目标',
    '复购率', 'LTV目标',
    '配送准时率>95%', '配送成本', '车辆满载率',
    '预测准确率', '数据质量', '模型更新频率',
    '区域GMV目标', '区域毛利率', '门店扩张计划',
    '城市GMV目标', '门店达标率', '本地竞争策略',
    '库存准确率'
  ];

  const [agentConstraintConfigs, setAgentConstraintConfigs] = useState<{ agentId: string; selectedConstraintIds: string[] }[]>([
    { agentId: "a1", selectedConstraintIds: ['选品通过率', '毛利率目标', '新品上市周期'] },
    { agentId: "a2", selectedConstraintIds: ['日销目标', '客单价', '会员转化率'] },
    { agentId: "a3", selectedConstraintIds: ['会员增长率', '复购率', 'LTV目标'] },
  ]);

  const [selectedOntologyIds, setSelectedOntologyIds] = useState<string[]>(['product', 'sku', 'category']);

  const ONTOLOGY_LIBRARY = [
    { id: 'store', name: 'Store (门店)', domain: '门店域' },
    { id: 'region', name: 'Region (大区)', domain: '门店域' },
    { id: 'city', name: 'City (城市)', domain: '门店域' },
    { id: 'store_manager', name: 'StoreManager (店长)', domain: '门店域' },
    { id: 'product', name: 'Product (商品)', domain: '商品域' },
    { id: 'sku', name: 'SKU (库存单元)', domain: '商品域' },
    { id: 'category', name: 'Category (品类)', domain: '商品域' },
    { id: 'brand', name: 'Brand (品牌)', domain: '商品域' },
    { id: 'supplier', name: 'Supplier (供应商)', domain: '供应链域' },
    { id: 'warehouse', name: 'Warehouse (仓库)', domain: '供应链域' },
    { id: 'distribution', name: 'Distribution (配送单)', domain: '供应链域' },
    { id: 'inventory', name: 'Inventory (库存)', domain: '供应链域' },
    { id: 'purchase_order', name: 'PurchaseOrder (采购订单)', domain: '供应链域' },
    { id: 'member', name: 'Member (会员)', domain: '会员域' },
    { id: 'promotion', name: 'Promotion (促销活动)', domain: '会员域' },
    { id: 'coupon', name: 'Coupon (优惠券)', domain: '会员域' },
    { id: 'sales_order', name: 'SalesOrder (销售订单)', domain: '销售域' },
    { id: 'pos_transaction', name: 'POSTransaction (POS交易)', domain: '销售域' },
    { id: 'sales_target', name: 'SalesTarget (销售目标)', domain: '销售域' },
  ];

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
      {/* Header */}
      <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 shrink-0 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Cpu size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">智能体配置中心</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors text-xs shadow-sm">
            <Play size={14} className="text-emerald-600" />
            测试 Agent
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-indigo-600 text-white font-medium rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors text-xs shadow-sm"
          >
            <Save size={14} />
            保存配置
          </button>
        </div>
      </div>

      {showSaveToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg shadow-lg">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span className="text-sm font-medium">配置已保存！</span>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Agent List */}
        <div className="w-64 border-r border-gray-200 bg-gray-50/30 flex flex-col shrink-0 z-20">
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">已配置智能体</span>
            <button
              onClick={handleCreateAgent}
              className="p-1 hover:bg-gray-200 rounded text-indigo-600 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="搜索 Agent..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {agents.map(agent => (
              <div
                key={agent.id}
                onClick={() => {
                  setActiveAgentId(agent.id);
                  setIsEditing(false);
                }}
                className={cn(
                  "p-3 rounded-lg cursor-pointer border transition-all",
                  activeAgentId === agent.id
                    ? "bg-indigo-50 border-indigo-200 shadow-sm"
                    : "bg-white border-transparent hover:border-gray-200 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Bot size={14} className={activeAgentId === agent.id ? "text-indigo-600" : "text-gray-500"} />
                    <span className={cn("text-xs font-bold", activeAgentId === agent.id ? "text-indigo-900" : "text-gray-700")}>
                      {agent.name}
                    </span>
                  </div>
                  {agent.status === 'active' && <CheckCircle2 size={12} className="text-emerald-500" />}
                </div>
                <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                  {agent.desc}
                </p>
                {(() => {
                  const skillConfig = agentSkillConfigs.find(c => c.agentId === agent.id);
                  const skillCount = skillConfig?.selectedSkillIds?.length || 0;
                  return (
                    <div className="mt-2 flex items-center gap-1 text-[10px]">
                      <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-medium">
                        {skillCount} 技能
                      </span>
                      {agent.roleId && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {ROLE_TEMPLATES.find(r => r.id === agent.roleId)?.initial}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content - Agent Configuration */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              {isEditing ? (
                <input
                  type="text"
                  value={activeAgent.name}
                  onChange={(e) => updateActiveAgent({ name: e.target.value })}
                  className="text-xl font-bold text-gray-900 border-b border-indigo-300 focus:outline-none focus:border-indigo-600 bg-transparent px-1 py-0.5"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900">{activeAgent.name}</h1>
                  <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-indigo-600">
                    <Settings size={14} />
                  </button>
                </div>
              )}
              <span className={cn(
                "px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider",
                activeAgent.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              )}>
                {activeAgent.status}
              </span>
            </div>
            {isEditing ? (
              <input
                type="text"
                value={activeAgent.desc}
                onChange={(e) => updateActiveAgent({ desc: e.target.value })}
                className="w-full text-sm text-gray-500 border-b border-indigo-300 focus:outline-none focus:border-indigo-600 bg-transparent px-1 py-0.5"
              />
            ) : (
              <p className="text-sm text-gray-500">{activeAgent.desc}</p>
            )}
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Steps Navigation */}
            <div className="w-64 border-r border-gray-100 bg-gray-50/50 p-4 overflow-y-auto">
              <div className="space-y-2 relative before:absolute before:inset-y-0 before:left-[19px] before:w-px before:bg-gray-200">
                {steps.map((step) => {
                  const Icon = step.icon;
                  const isActive = activeStep === step.id;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(step.id)}
                      className={cn(
                        "relative flex items-start gap-3 w-full p-2 rounded-lg text-left transition-colors group",
                        isActive ? "bg-white shadow-sm ring-1 ring-gray-200 z-10" : "hover:bg-gray-100/80"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2",
                        isActive ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-300 text-gray-400 group-hover:border-indigo-400"
                      )}>
                        <Icon size={12} />
                      </div>
                      <div>
                        <div className={cn("text-xs font-bold", isActive ? "text-indigo-900" : "text-gray-700")}>
                          {step.title}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{step.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50/30">
              <div className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    {React.createElement(steps.find(s => s.id === activeStep)?.icon || BrainCircuit, { size: 20 })}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{steps.find(s => s.id === activeStep)?.title}</h2>
                    <p className="text-xs text-gray-500">{steps.find(s => s.id === activeStep)?.desc}</p>
                  </div>
                </div>

                {activeStep === 'role' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <p className="text-sm text-indigo-800">
                        <span className="font-semibold">角色模板说明：</span>选择与该智能体对应的决策空间角色，系统将自动加载该角色的推荐本体、技能和约束配置。
                      </p>
                    </div>

                    {activeRole && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-bold">
                            {activeRole.initial}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{activeRole.title}</span>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded">{activeRole.level}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-0.5">{activeRole.scope}</p>
                          </div>
                          <button
                            onClick={() => setActiveStep('intent')}
                            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            继续配置 →
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-gray-700">选择角色模板</h3>
                      {ROLE_LEVELS.map(({ level, icon: LevelIcon, roles }) => (
                        <div key={level} className="border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleLevel(level)}
                            className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <LevelIcon size={18} className="text-gray-600" />
                              <span className="font-medium text-gray-900">{level}</span>
                              <span className="text-xs text-gray-500">({roles.length}个角色)</span>
                            </div>
                            {expandedLevels.includes(level) ? (
                              <ChevronUp size={18} className="text-gray-400" />
                            ) : (
                              <ChevronDown size={18} className="text-gray-400" />
                            )}
                          </button>
                          {expandedLevels.includes(level) && (
                            <div className="p-3 grid grid-cols-2 gap-2">
                              {roles.map((role) => (
                                <button
                                  key={role.id}
                                  onClick={() => applyRoleTemplate(role)}
                                  className={cn(
                                    "p-3 text-left border rounded-lg transition-all",
                                    activeAgent.roleId === role.id
                                      ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500"
                                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={cn(
                                      "w-8 h-8 rounded flex items-center justify-center text-sm font-bold",
                                      activeAgent.roleId === role.id
                                        ? "bg-emerald-200 text-emerald-800"
                                        : "bg-gray-200 text-gray-700"
                                    )}>
                                      {role.initial}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm text-gray-900 truncate">{role.title}</div>
                                      <div className="text-xs text-gray-500 truncate">{role.scope}</div>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeStep === 'intent' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">系统提示词 (System Prompt)</label>
                      <textarea
                        className="w-full h-32 p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-gray-600"
                        defaultValue="你是一个零售门店运营专家。你的任务是解析用户的自然语言意图，提取出关键的门店运营需求、销售目标和经营约束条件。"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">意图分类模型</label>
                      <select className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                        <option>Gemini 1.5 Pro (推荐用于复杂推理)</option>
                        <option>Gemini 1.5 Flash (推荐用于快速分类)</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeStep === 'ontology' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">目标本体映射 (Target Ontology)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {ONTOLOGY_LIBRARY.map((onto) => {
                          const isSelected = selectedOntologyIds.includes(onto.id);
                          return (
                            <div
                              key={onto.id}
                              onClick={() => {
                                setSelectedOntologyIds(prev =>
                                  isSelected ? prev.filter(id => id !== onto.id) : [...prev, onto.id]
                                );
                              }}
                              className={cn(
                                "p-3 border rounded-lg cursor-pointer transition-all",
                                isSelected
                                  ? "border-indigo-200 bg-indigo-50"
                                  : "border-gray-200 bg-white hover:bg-gray-50"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked={isSelected} readOnly className="mt-0.5" />
                                <div>
                                  <div className={cn("text-sm font-bold", isSelected ? "text-indigo-900" : "text-gray-700")}>
                                    {onto.name}
                                  </div>
                                  <div className="text-[10px] text-gray-500">{onto.domain}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 'binding' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">配置如何将解析出的本体实体绑定到实际的业务系统数据源。</p>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 text-xs text-gray-500">
                          <th className="pb-2 font-medium">本体实体</th>
                          <th className="pb-2 font-medium">数据源 (Data Source)</th>
                          <th className="pb-2 font-medium">映射规则</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        <tr className="border-b border-gray-100">
                          <td className="py-3 font-medium text-gray-800">SalesOrder</td>
                          <td className="py-3 text-blue-600">POS_Sales_DB</td>
                          <td className="py-3 text-gray-500 font-mono text-xs">SELECT * FROM pos_transaction WHERE ...</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 font-medium text-gray-800">Store</td>
                          <td className="py-3 text-emerald-600">ERP_Store_API</td>
                          <td className="py-3 text-gray-500 font-mono text-xs">GET /api/v1/stores/:id/sales</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 font-medium text-gray-800">Member</td>
                          <td className="py-3 text-rose-600">Member_System</td>
                          <td className="py-3 text-gray-500 font-mono text-xs">SELECT * FROM member_profile WHERE ...</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {activeStep === 'skill' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-bold text-gray-700">可用技能 / MCP 工具</label>
                      {activeRole && (
                        <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          已加载 {activeRole.title} 推荐技能
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {AVAILABLE_SKILLS.map((skillId) => {
                        const currentSkillConfig = agentSkillConfigs.find(c => c.agentId === activeAgentId);
                        const isSelected = currentSkillConfig?.selectedSkillIds.includes(skillId) || false;
                        return (
                          <div
                            key={skillId}
                            onClick={() => {
                              setAgentSkillConfigs(prev => {
                                const existing = prev.find(c => c.agentId === activeAgentId);
                                if (existing) {
                                  const newIds = isSelected
                                    ? existing.selectedSkillIds.filter(id => id !== skillId)
                                    : [...existing.selectedSkillIds, skillId];
                                  return prev.map(c => c.agentId === activeAgentId ? { ...c, selectedSkillIds: newIds } : c);
                                }
                                return [...prev, { agentId: activeAgentId, selectedSkillIds: [skillId] }];
                              });
                            }}
                            className={cn(
                              "p-3 border rounded-lg flex items-start gap-3 cursor-pointer transition-all",
                              isSelected
                                ? "border-indigo-200 bg-indigo-50"
                                : "border-gray-200 bg-white hover:bg-gray-50"
                            )}
                          >
                            <input type="checkbox" checked={isSelected} readOnly className="mt-1" />
                            <div>
                              <div className={cn("text-sm font-bold", isSelected ? "text-indigo-900" : "text-gray-700")}>
                                {skillId}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeStep === 'constraint' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-bold text-gray-700">业务约束条件 (Hard/Soft Constraints)</label>
                      {activeRole && (
                        <span className="text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded">
                          已加载 {activeRole.title} 推荐约束
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                      {AVAILABLE_CONSTRAINTS.map((constraint) => {
                        const currentConstraintConfig = agentConstraintConfigs.find(c => c.agentId === activeAgentId);
                        const isSelected = currentConstraintConfig?.selectedConstraintIds.includes(constraint) || false;
                        const isHard = constraint.includes('>') || constraint.includes('目标') || constraint.includes('率') || constraint.includes('标准');
                        return (
                          <div
                            key={constraint}
                            onClick={() => {
                              setAgentConstraintConfigs(prev => {
                                const existing = prev.find(c => c.agentId === activeAgentId);
                                if (existing) {
                                  const newIds = isSelected
                                    ? existing.selectedConstraintIds.filter(id => id !== constraint)
                                    : [...existing.selectedConstraintIds, constraint];
                                  return prev.map(c => c.agentId === activeAgentId ? { ...c, selectedConstraintIds: newIds } : c);
                                }
                                return [...prev, { agentId: activeAgentId, selectedConstraintIds: [constraint] }];
                              });
                            }}
                            className={cn(
                              "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all",
                              isSelected
                                ? isHard ? "border-rose-200 bg-rose-50" : "border-amber-200 bg-amber-50"
                                : "border-gray-200 bg-white hover:bg-gray-50"
                            )}
                          >
                            <span className={cn(
                              "px-2 py-0.5 text-[10px] font-bold rounded shrink-0",
                              isHard ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                            )}>
                              {isHard ? '硬约束' : '软约束'}
                            </span>
                            <span className={cn("text-sm", isSelected ? "text-gray-800" : "text-gray-600")}>
                              {constraint}
                            </span>
                            {isSelected && <CheckCircle2 size={16} className={isHard ? "text-rose-600" : "text-amber-600"} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeStep === 'simulation' && (
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">仿真推演配置</label>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-700">推演策略生成数量</span>
                        <input type="number" defaultValue={3} className="w-20 p-1.5 text-sm border border-gray-300 rounded text-center" />
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-700">仿真引擎</span>
                        <select className="p-1.5 text-sm border border-gray-300 rounded">
                          <option>蒙特卡洛仿真</option>
                          <option>系统动力学 (SD)</option>
                        </select>
                      </div>
                      <div className="text-xs text-gray-500 bg-white p-3 rounded border border-gray-200">
                        Agent 将根据前置条件生成多种策略（如：促销方案A/B/C），并调用仿真引擎对比各方案的 KPI（GMV、毛利率、坪效）。
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 'result' && (
                  <div className="space-y-4">
                    {/* 预览推演过程按钮 */}
                    <button
                      onClick={() => setShowGraphModal(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
                    >
                      <Maximize2 size={16} />
                      <span className="text-sm font-semibold">预览推演过程</span>
                    </button>

                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700 mb-2">输出结构 (JSON Schema)</label>
                        <textarea
                          className="w-full h-48 p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-gray-600 bg-gray-50"
                          defaultValue={`{
  "best_strategy": "string (方案A/方案B/方案C)",
  "confidence_score": "number",
  "kpi_impact": {
    "gmv_change": "number",
    "margin_change": "number",
    "member_conversion_change": "number"
  },
  "reasoning_chain": ["string"]
}`}
                        />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 推演过程预览模态框 */}
      {showGraphModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowGraphModal(false)}
          />
          <div className="relative z-10 w-[95vw] h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* 头部 */}
            <div className="h-14 flex items-center justify-between px-5 border-b border-slate-700 bg-slate-900 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Network size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">推演过程预览</h3>
                  <p className="text-[10px] text-slate-400">{activeAgent.name} · 知识图谱推演流程</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* 缩放控制 */}
                <div className="flex items-center gap-1 bg-slate-800 border border-slate-600 rounded-lg p-0.5">
                  <button
                    onClick={() => setGraphZoom(z => Math.max(0.5, z - 0.15))}
                    className="p-1.5 hover:bg-slate-700 rounded text-slate-300"
                    title="缩小"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <span className="text-[10px] font-mono text-slate-300 w-10 text-center">{Math.round(graphZoom * 100)}%</span>
                  <button
                    onClick={() => setGraphZoom(z => Math.min(2, z + 0.15))}
                    className="p-1.5 hover:bg-slate-700 rounded text-slate-300"
                    title="放大"
                  >
                    <ZoomIn size={14} />
                  </button>
                </div>
                <button
                  onClick={() => setShowGraphModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* 图谱区域 - 3D效果 */}
            <div
              className="flex-1 overflow-hidden p-4 flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                perspective: '1200px',
              }}
            >
              {/* 背景网格 */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(rgba(99,102,241,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.15) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
              {/* 径向光晕 */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 50% 50%, rgba(79,70,229,0.08) 0%, transparent 70%)',
                }}
              />
              <div
                style={{
                  transform: `scale(${graphZoom}) rotateX(8deg) rotateY(-2deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transformStyle: 'preserve-3d',
                }}
                className="w-full h-full flex items-center justify-center relative z-10"
              >
                <AgentReasoningGraph activeAgentId={activeAgentId} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 推演知识图谱组件 - 展示Agent完整推演流程 (Network Graph)
// ============================================================

type NodeType = 'intent' | 'ontology' | 'attribute' | 'data_source' | 'data' | 'skill' | 'constraint' | 'simulation' | 'result';

interface GraphNode {
  id: string;
  label: string;
  sublabel?: string;
  type: NodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  skills?: string[];
  dataSources?: string[];
  ontologies?: string[];
  description?: string;
  output?: string;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

function buildAgentGraph(agentId: string): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const configs: Record<string, { nodes: GraphNode[]; edges: GraphEdge[] }> = {
    a1: {
      nodes: [
        { id: 'intent', label: '意图解析', sublabel: '选品优化 · 华东区 · 夏季', type: 'intent', x: 400, y: 40, width: 140, height: 48, skills: ['intent_parser_v1'], dataSources: ['用户输入文本'], ontologies: [], description: '解析"华东区夏季选品优化"意图，提取区域范围、季节维度、优化目标', output: '意图: 选品优化 | 区域: 华东 | 季节: 夏季' },
        { id: 'onto_product', label: 'Product', sublabel: '商品本体', type: 'ontology', x: 160, y: 140, width: 100, height: 44, ontologies: ['Product'], description: '商品基础信息本体' },
        { id: 'onto_sku', label: 'SKU', sublabel: '库存单元', type: 'ontology', x: 300, y: 150, width: 90, height: 44, ontologies: ['SKU'], description: 'SKU级库存单元本体' },
        { id: 'onto_category', label: 'Category', sublabel: '品类', type: 'ontology', x: 440, y: 150, width: 100, height: 44, ontologies: ['Category'], description: '商品品类层级本体' },
        { id: 'onto_store', label: 'Store', sublabel: '门店', type: 'ontology', x: 580, y: 140, width: 90, height: 44, ontologies: ['Store'], description: '门店信息本体' },
        { id: 'data_pos', label: 'POS销售', sublabel: 'POS_Sales_DB', type: 'data', x: 140, y: 240, width: 100, height: 44, dataSources: ['POS_Sales_DB'], description: 'POS交易流水数据' },
        { id: 'data_inventory', label: '库存', sublabel: 'Inventory_System', type: 'data', x: 280, y: 250, width: 100, height: 44, dataSources: ['Inventory_System'], description: '实时库存数据' },
        { id: 'data_erp', label: 'ERP', sublabel: 'ERP_Store_API', type: 'data', x: 420, y: 250, width: 90, height: 44, dataSources: ['ERP_Store_API'], description: 'ERP门店数据' },
        { id: 'data_member', label: '会员', sublabel: 'Member_System', type: 'data', x: 560, y: 240, width: 90, height: 44, dataSources: ['Member_System'], description: '会员消费数据' },
        { id: 'skill_select', label: '智能选品', sublabel: 'product_selection', type: 'skill', x: 180, y: 340, width: 110, height: 44, skills: ['product_selection_v1'], description: '基于多维度数据的智能选品算法' },
        { id: 'skill_sales', label: '销售分析', sublabel: 'sales_analysis', type: 'skill', x: 340, y: 350, width: 110, height: 44, skills: ['sales_analysis_v1'], description: '销售趋势与同环比分析' },
        { id: 'skill_margin', label: '毛利计算', sublabel: 'margin_calculation', type: 'skill', x: 500, y: 340, width: 110, height: 44, skills: ['margin_calculation_v1'], description: 'SKU级毛利率测算' },
        { id: 'con_pass', label: '选品率', sublabel: '>85%', type: 'constraint', x: 200, y: 440, width: 100, height: 44, description: '选品通过率硬约束' },
        { id: 'con_margin', label: '毛利率', sublabel: '>35%', type: 'constraint', x: 350, y: 450, width: 100, height: 44, description: '毛利率硬约束' },
        { id: 'con_new', label: '新品占比', sublabel: '~20%', type: 'constraint', x: 500, y: 440, width: 100, height: 44, description: '新品占比软约束' },
        { id: 'sim_mc', label: '蒙特卡洛仿真', sublabel: 'A/B/C方案', type: 'simulation', x: 350, y: 530, width: 140, height: 52, skills: ['monte_carlo_v1', 'scenario_generator_v1'], description: '蒙特卡洛仿真生成多套选品方案', output: '方案A: GMV+12% | 方案B: GMV+8% 毛利+3% | 方案C: GMV+15% 毛利-2%' },
        { id: 'result', label: '最优方案', sublabel: '方案B · 置信度87%', type: 'result', x: 400, y: 630, width: 140, height: 52, description: '结构化输出最优方案，附带决策依据', output: '推荐方案B：平衡GMV增长与毛利率，置信度87%' },
      ],
      edges: [
        { id: 'e1', source: 'intent', target: 'onto_product', label: '解析' },
        { id: 'e2', source: 'intent', target: 'onto_sku', label: '解析' },
        { id: 'e3', source: 'intent', target: 'onto_category', label: '解析' },
        { id: 'e4', source: 'intent', target: 'onto_store', label: '解析' },
        { id: 'e5', source: 'onto_product', target: 'data_pos', label: '绑定' },
        { id: 'e6', source: 'onto_sku', target: 'data_inventory', label: '绑定' },
        { id: 'e7', source: 'onto_category', target: 'data_erp', label: '绑定' },
        { id: 'e8', source: 'onto_store', target: 'data_member', label: '绑定' },
        { id: 'e9', source: 'data_pos', target: 'skill_select', label: '输入' },
        { id: 'e10', source: 'data_inventory', target: 'skill_sales', label: '输入' },
        { id: 'e11', source: 'data_erp', target: 'skill_margin', label: '输入' },
        { id: 'e12', source: 'skill_select', target: 'con_pass', label: '校验' },
        { id: 'e13', source: 'skill_sales', target: 'con_margin', label: '校验' },
        { id: 'e14', source: 'skill_margin', target: 'con_new', label: '校验' },
        { id: 'e15', source: 'con_pass', target: 'sim_mc', label: '推演' },
        { id: 'e16', source: 'con_margin', target: 'sim_mc', label: '推演' },
        { id: 'e17', source: 'con_new', target: 'sim_mc', label: '推演' },
        { id: 'e18', source: 'sim_mc', target: 'result', label: '输出' },
      ]
    },
    a2: {
      nodes: [
        { id: 'intent', label: '意图解析', sublabel: '日销异常预警 · 紧急', type: 'intent', x: 400, y: 40, width: 150, height: 48, skills: ['intent_parser_v1'], dataSources: ['用户输入文本'], ontologies: [], description: '解析"门店日销异常预警"意图，识别异常类型、预警级别', output: '意图: 异常预警 | 类型: 日销下降 | 级别: 紧急' },
        { id: 'onto_store', label: 'Store', sublabel: '门店', type: 'ontology', x: 140, y: 140, width: 90, height: 44, ontologies: ['Store'], description: '门店信息本体' },
        { id: 'onto_pos', label: 'POS', sublabel: '交易', type: 'ontology', x: 260, y: 150, width: 80, height: 44, ontologies: ['POSTransaction'], description: 'POS交易本体' },
        { id: 'onto_sales', label: 'SalesOrder', sublabel: '销售订单', type: 'ontology', x: 380, y: 150, width: 110, height: 44, ontologies: ['SalesOrder'], description: '销售订单本体' },
        { id: 'onto_member', label: 'Member', sublabel: '会员', type: 'ontology', x: 520, y: 150, width: 90, height: 44, ontologies: ['Member'], description: '会员本体' },
        { id: 'onto_inventory', label: 'Inventory', sublabel: '库存', type: 'ontology', x: 640, y: 140, width: 100, height: 44, ontologies: ['Inventory'], description: '库存本体' },
        { id: 'data_pos', label: 'POS流水', sublabel: 'POS_Stream', type: 'data', x: 130, y: 240, width: 100, height: 44, dataSources: ['POS_Stream'], description: '实时POS流水数据' },
        { id: 'data_member', label: '会员系统', sublabel: 'Member_System', type: 'data', x: 270, y: 250, width: 110, height: 44, dataSources: ['Member_System'], description: '会员实时数据' },
        { id: 'data_inv', label: '库存实时', sublabel: 'Inventory_RealTime', type: 'data', x: 410, y: 250, width: 110, height: 44, dataSources: ['Inventory_RealTime'], description: '实时库存数据' },
        { id: 'data_store', label: '门店管理', sublabel: 'Store_Mgmt_DB', type: 'data', x: 550, y: 250, width: 110, height: 44, dataSources: ['Store_Mgmt_DB'], description: '门店管理数据库' },
        { id: 'skill_ops', label: '门店运营', sublabel: 'store_ops', type: 'skill', x: 180, y: 340, width: 110, height: 44, skills: ['store_ops_v1'], description: '门店运营监控技能' },
        { id: 'skill_report', label: '日报生成', sublabel: 'daily_report', type: 'skill', x: 340, y: 350, width: 110, height: 44, skills: ['daily_report_v1'], description: '自动生成运营日报' },
        { id: 'skill_alert', label: '异常预警', sublabel: 'exception_alert', type: 'skill', x: 500, y: 340, width: 110, height: 44, skills: ['exception_alert_v1'], description: '异常检测与预警' },
        { id: 'con_target', label: '日销目标', sublabel: '>90%', type: 'constraint', x: 200, y: 440, width: 100, height: 44, description: '日销目标达成率硬约束' },
        { id: 'con_atv', label: '客单价', sublabel: '>35元', type: 'constraint', x: 350, y: 450, width: 90, height: 44, description: '客单价硬约束' },
        { id: 'con_member', label: '会员转化', sublabel: '>25%', type: 'constraint', x: 490, y: 440, width: 100, height: 44, description: '会员转化率软约束' },
        { id: 'sim_rca', label: '根因分析', sublabel: '多维度归因', type: 'simulation', x: 350, y: 530, width: 140, height: 52, skills: ['root_cause_analyzer_v1', 'attribution_model_v1'], description: '多维度异常根因分析', output: '根因: 竞品促销(45%) + 库存缺货(30%) + 天气(25%)' },
        { id: 'result', label: '诊断报告', sublabel: '3项处理建议', type: 'result', x: 400, y: 630, width: 140, height: 52, description: '生成异常诊断报告和处理建议', output: '3项处理建议，预计2日内恢复日销目标' },
      ],
      edges: [
        { id: 'e1', source: 'intent', target: 'onto_store', label: '解析' },
        { id: 'e2', source: 'intent', target: 'onto_pos', label: '解析' },
        { id: 'e3', source: 'intent', target: 'onto_sales', label: '解析' },
        { id: 'e4', source: 'intent', target: 'onto_member', label: '解析' },
        { id: 'e5', source: 'intent', target: 'onto_inventory', label: '解析' },
        { id: 'e6', source: 'onto_store', target: 'data_pos', label: '绑定' },
        { id: 'e7', source: 'onto_pos', target: 'data_member', label: '绑定' },
        { id: 'e8', source: 'onto_sales', target: 'data_inv', label: '绑定' },
        { id: 'e9', source: 'onto_member', target: 'data_store', label: '绑定' },
        { id: 'e10', source: 'data_pos', target: 'skill_ops', label: '输入' },
        { id: 'e11', source: 'data_member', target: 'skill_report', label: '输入' },
        { id: 'e12', source: 'data_inv', target: 'skill_alert', label: '输入' },
        { id: 'e13', source: 'skill_ops', target: 'con_target', label: '校验' },
        { id: 'e14', source: 'skill_report', target: 'con_atv', label: '校验' },
        { id: 'e15', source: 'skill_alert', target: 'con_member', label: '校验' },
        { id: 'e16', source: 'con_target', target: 'sim_rca', label: '推演' },
        { id: 'e17', source: 'con_atv', target: 'sim_rca', label: '推演' },
        { id: 'e18', source: 'con_member', target: 'sim_rca', label: '推演' },
        { id: 'e19', source: 'sim_rca', target: 'result', label: '输出' },
      ]
    },
    a3: {
      nodes: [
        { id: 'intent', label: '意图解析', sublabel: '高价值会员流失预警', type: 'intent', x: 400, y: 40, width: 160, height: 48, skills: ['intent_parser_v1'], dataSources: ['用户输入文本'], ontologies: [], description: '解析"高价值会员流失预警"意图，识别会员分层标准、流失定义', output: '意图: 流失预警 | 分层: 高价值 | 流失定义: 30天未消费' },
        { id: 'onto_member', label: 'Member', sublabel: '会员', type: 'ontology', x: 140, y: 140, width: 90, height: 44, ontologies: ['Member'], description: '会员本体' },
        { id: 'onto_promo', label: 'Promotion', sublabel: '促销', type: 'ontology', x: 260, y: 150, width: 100, height: 44, ontologies: ['Promotion'], description: '促销活动本体' },
        { id: 'onto_coupon', label: 'Coupon', sublabel: '优惠券', type: 'ontology', x: 390, y: 150, width: 100, height: 44, ontologies: ['Coupon'], description: '优惠券本体' },
        { id: 'onto_sales', label: 'SalesOrder', sublabel: '销售订单', type: 'ontology', x: 520, y: 150, width: 110, height: 44, ontologies: ['SalesOrder'], description: '销售订单本体' },
        { id: 'onto_loyalty', label: 'Loyalty', sublabel: '忠诚度', type: 'ontology', x: 650, y: 140, width: 100, height: 44, ontologies: ['LoyaltyProgram'], description: '忠诚度计划本体' },
        { id: 'data_member', label: '会员系统', sublabel: 'Member_System', type: 'data', x: 130, y: 240, width: 110, height: 44, dataSources: ['Member_System'], description: '会员主数据' },
        { id: 'data_crm', label: 'CRM', sublabel: 'CRM_DB', type: 'data', x: 280, y: 250, width: 90, height: 44, dataSources: ['CRM_DB'], description: 'CRM客户关系数据' },
        { id: 'data_sales', label: '消费历史', sublabel: 'Sales_History', type: 'data', x: 410, y: 250, width: 110, height: 44, dataSources: ['Sales_History'], description: '历史消费记录' },
        { id: 'data_promo', label: '促销库', sublabel: 'Promotion_DB', type: 'data', x: 550, y: 250, width: 100, height: 44, dataSources: ['Promotion_DB'], description: '促销活动历史数据' },
        { id: 'skill_segment', label: '会员分群', sublabel: 'RFM分群', type: 'skill', x: 190, y: 340, width: 110, height: 44, skills: ['member_segmentation_v1'], description: 'RFM会员价值分群' },
        { id: 'skill_churn', label: '流失预测', sublabel: 'XGBoost模型', type: 'skill', x: 360, y: 350, width: 110, height: 44, skills: ['churn_prediction_v1'], description: 'XGBoost流失预测模型' },
        { id: 'skill_campaign', label: '营销优化', sublabel: 'campaign_optimizer', type: 'skill', x: 520, y: 340, width: 110, height: 44, skills: ['campaign_optimizer_v1'], description: '营销活动效果优化' },
        { id: 'con_growth', label: '会员增长', sublabel: '>10%', type: 'constraint', x: 200, y: 440, width: 100, height: 44, description: '会员增长率硬约束' },
        { id: 'con_repurchase', label: '复购率', sublabel: '>35%', type: 'constraint', x: 350, y: 450, width: 90, height: 44, description: '复购率硬约束' },
        { id: 'con_ltv', label: 'LTV', sublabel: '>2000元', type: 'constraint', x: 490, y: 440, width: 90, height: 44, description: 'LTV硬约束' },
        { id: 'sim_scenario', label: '策略仿真', sublabel: '挽回策略A/B', type: 'simulation', x: 350, y: 530, width: 140, height: 52, skills: ['scenario_generator_v1', 'campaign_optimizer_v1'], description: '仿真不同挽回策略效果', output: '策略A(专属券): 挽回率32% | 策略B(到店礼): 挽回率28%' },
        { id: 'result', label: '营销方案', sublabel: '策略A · ROI 1:4.3', type: 'result', x: 400, y: 630, width: 150, height: 52, description: '输出流失风险名单和精准营销方案', output: '推荐策略A，预计挽回2,752人，ROI 1:4.3' },
      ],
      edges: [
        { id: 'e1', source: 'intent', target: 'onto_member', label: '解析' },
        { id: 'e2', source: 'intent', target: 'onto_promo', label: '解析' },
        { id: 'e3', source: 'intent', target: 'onto_coupon', label: '解析' },
        { id: 'e4', source: 'intent', target: 'onto_sales', label: '解析' },
        { id: 'e5', source: 'intent', target: 'onto_loyalty', label: '解析' },
        { id: 'e6', source: 'onto_member', target: 'data_member', label: '绑定' },
        { id: 'e7', source: 'onto_promo', target: 'data_crm', label: '绑定' },
        { id: 'e8', source: 'onto_coupon', target: 'data_sales', label: '绑定' },
        { id: 'e9', source: 'onto_sales', target: 'data_promo', label: '绑定' },
        { id: 'e10', source: 'data_member', target: 'skill_segment', label: '输入' },
        { id: 'e11', source: 'data_crm', target: 'skill_churn', label: '输入' },
        { id: 'e12', source: 'data_sales', target: 'skill_campaign', label: '输入' },
        { id: 'e13', source: 'skill_segment', target: 'con_growth', label: '校验' },
        { id: 'e14', source: 'skill_churn', target: 'con_repurchase', label: '校验' },
        { id: 'e15', source: 'skill_campaign', target: 'con_ltv', label: '校验' },
        { id: 'e16', source: 'con_growth', target: 'sim_scenario', label: '推演' },
        { id: 'e17', source: 'con_repurchase', target: 'sim_scenario', label: '推演' },
        { id: 'e18', source: 'con_ltv', target: 'sim_scenario', label: '推演' },
        { id: 'e19', source: 'sim_scenario', target: 'result', label: '输出' },
      ]
    },
  };
  return configs[agentId] || configs.a1;
}

// ============================================================
// 推演知识图谱组件 - 力导向知识关系网络图
// ============================================================

interface ForceNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  pinned: boolean;
  opacity: number;
  label: string;
  sublabel?: string;
  type: NodeType;
  skills?: string[];
  dataSources?: string[];
  ontologies?: string[];
  description?: string;
  output?: string;
  width: number;
  height: number;
}

interface ForceEdge {
  id: string;
  source: string;
  target: string;
  relationType: string;
  idealLength: number;
  label?: string;
}

const NODE_TYPE_CONFIG: Record<string, { color: string; bg: string; barColor: string; icon: any; mass: number; width: number; height: number; shape: string }> = {
  ontology:   { color: '#1677FF', bg: '#FFFFFF', barColor: '#1677FF', icon: Database, mass: 3, width: 120, height: 40, shape: 'roundRect' },
  attribute:  { color: '#1677FF', bg: '#E6F4FF', barColor: '#1677FF', icon: Database, mass: 1, width: 80, height: 28, shape: 'ellipse' },
  data_source:{ color: '#13C2C2', bg: '#FFFFFF', barColor: '#13C2C2', icon: Database, mass: 2, width: 120, height: 40, shape: 'roundRect' },
  skill:      { color: '#FA8C16', bg: '#FFFFFF', barColor: '#FA8C16', icon: Wrench, mass: 2, width: 120, height: 40, shape: 'roundRect' },
  constraint: { color: '#F5222D', bg: '#FFFFFF', barColor: '#F5222D', icon: ShieldCheck, mass: 1.5, width: 110, height: 40, shape: 'roundRect' },
  result:     { color: '#52C41A', bg: '#FFFFFF', barColor: '#52C41A', icon: CheckCircle2, mass: 2, width: 130, height: 44, shape: 'roundRect' },
  intent:     { color: '#722ED1', bg: '#FFFFFF', barColor: '#722ED1', icon: BrainCircuit, mass: 2.5, width: 140, height: 48, shape: 'roundRect' },
  simulation: { color: '#4F46E5', bg: '#FFFFFF', barColor: '#4F46E5', icon: MonitorPlay, mass: 2, width: 140, height: 52, shape: 'roundRect' },
  data:       { color: '#0891B2', bg: '#ECFEFF', barColor: '#0891B2', icon: ArrowRight, mass: 1.5, width: 100, height: 44, shape: 'diamond' },
};

const EDGE_TYPE_CONFIG: Record<string, { color: string; opacity: number; width: number; dashed: boolean; hasArrow: boolean; animated: boolean }> = {
  has_attribute: { color: '#94A3B8', opacity: 0.4, width: 1, dashed: true, hasArrow: false, animated: false },
  bound_to:      { color: '#13C2C2', opacity: 0.5, width: 1.5, dashed: true, hasArrow: true, animated: false },
  consumes:      { color: '#FA8C16', opacity: 0.5, width: 1.5, dashed: false, hasArrow: true, animated: false },
  constrains:    { color: '#EF4444', opacity: 0.5, width: 1.5, dashed: false, hasArrow: true, animated: false },
  produces:      { color: '#10B981', opacity: 0.5, width: 1.5, dashed: false, hasArrow: true, animated: false },
  depends_on:    { color: '#94A3B8', opacity: 0.4, width: 1, dashed: false, hasArrow: true, animated: false },
  flows_to:      { color: '#13C2C2', opacity: 0.6, width: 2, dashed: false, hasArrow: true, animated: true },
  default:       { color: '#94A3B8', opacity: 0.4, width: 1, dashed: false, hasArrow: true, animated: false },
};

function mapEdgeType(label?: string): string {
  if (!label) return 'default';
  const l = label.toLowerCase();
  if (l.includes('绑定') || l.includes('bound')) return 'bound_to';
  if (l.includes('输入') || l.includes('消费') || l.includes('consume')) return 'consumes';
  if (l.includes('校验') || l.includes('约束') || l.includes('constrain')) return 'constrains';
  if (l.includes('输出') || l.includes('产出') || l.includes('produce')) return 'produces';
  if (l.includes('依赖') || l.includes('depend')) return 'depends_on';
  if (l.includes('流向') || l.includes('flow')) return 'flows_to';
  if (l.includes('解析') || l.includes('属性') || l.includes('attribute')) return 'has_attribute';
  return 'default';
}

function buildForceGraph(agentId: string): { nodes: ForceNode[]; edges: ForceEdge[] } {
  const raw = buildAgentGraph(agentId);
  const nodeMap = new Map<string, ForceNode>();
  const edges: ForceEdge[] = [];
  const edgeIdSet = new Set<string>();

  // Convert raw nodes to force nodes
  raw.nodes.forEach(n => {
    const cfg = NODE_TYPE_CONFIG[n.type] || NODE_TYPE_CONFIG.ontology;
    const w = n.width || cfg.width;
    const h = n.height || cfg.height;
    nodeMap.set(n.id, {
      id: n.id,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      mass: cfg.mass,
      pinned: false,
      opacity: 0,
      label: n.label,
      sublabel: n.sublabel,
      type: n.type,
      skills: n.skills,
      dataSources: n.dataSources,
      ontologies: n.ontologies,
      description: n.description,
      output: n.output,
      width: w,
      height: h,
    });
  });

  // Convert raw edges
  raw.edges.forEach(e => {
    const relType = mapEdgeType(e.label);
    edges.push({
      id: e.id,
      source: e.source,
      target: e.target,
      relationType: relType,
      idealLength: relType === 'has_attribute' ? 80 : (relType === 'bound_to' ? 100 : 120),
      label: e.label,
    });
  });

  // Generate extra has_attribute edges from ontologies to their attributes
  // Also generate extra consumes edges from skills to dataSources
  raw.nodes.forEach(n => {
    if (n.type === 'ontology' && n.skills && n.skills.length > 0) {
      n.skills.forEach((skillName, idx) => {
        const attrId = `attr_${n.id}_${idx}`;
        if (!nodeMap.has(attrId)) {
          const cfg = NODE_TYPE_CONFIG.attribute;
          nodeMap.set(attrId, {
            id: attrId,
            x: 0, y: 0, vx: 0, vy: 0,
            mass: cfg.mass,
            pinned: false,
            opacity: 0,
            label: skillName,
            type: 'attribute',
            width: cfg.width,
            height: cfg.height,
          });
        }
        const edgeId = `ea_${n.id}_${attrId}`;
        if (!edgeIdSet.has(edgeId)) {
          edgeIdSet.add(edgeId);
          edges.push({
            id: edgeId,
            source: n.id,
            target: attrId,
            relationType: 'has_attribute',
            idealLength: 80,
          });
        }
      });
    }
    if (n.type === 'skill' && n.dataSources && n.dataSources.length > 0) {
      n.dataSources.forEach((dsName, idx) => {
        const dsId = `ds_${n.id}_${idx}`;
        if (!nodeMap.has(dsId)) {
          const cfg = NODE_TYPE_CONFIG.data_source;
          nodeMap.set(dsId, {
            id: dsId,
            x: 0, y: 0, vx: 0, vy: 0,
            mass: cfg.mass,
            pinned: false,
            opacity: 0,
            label: dsName,
            type: 'data_source',
            width: cfg.width,
            height: cfg.height,
          });
        }
        const edgeId = `ec_${n.id}_${dsId}`;
        if (!edgeIdSet.has(edgeId)) {
          edgeIdSet.add(edgeId);
          edges.push({
            id: edgeId,
            source: dsId,
            target: n.id,
            relationType: 'consumes',
            idealLength: 100,
          });
        }
      });
    }
  });

  return { nodes: Array.from(nodeMap.values()), edges };
}

function AgentReasoningGraph({ activeAgentId }: { activeAgentId: string }) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const animFrameRef = React.useRef<number>(0);
  const simFrameRef = React.useRef<number>(0);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.0);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [isSimulating, setIsSimulating] = useState(true);
  const [nodes, setNodes] = useState<ForceNode[]>([]);
  const [edges, setEdges] = useState<ForceEdge[]>([]);
  const [enteredNodes, setEnteredNodes] = useState<Set<string>>(new Set());
  const [enteredEdges, setEnteredEdges] = useState<Set<string>>(new Set());
  const dragStartRef = React.useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [canvasSize, setCanvasSize] = React.useState({ w: 900, h: 600 });

  // Build graph data
  React.useEffect(() => {
    const { nodes: fNodes, edges: fEdges } = buildForceGraph(activeAgentId);
    const w = canvasSize.w;
    const h = canvasSize.h;

    // Initialize positions in a circle around center
    const count = fNodes.length;
    fNodes.forEach((n, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = Math.min(w, h) * 0.25;
      n.x = w / 2 + Math.cos(angle) * radius;
      n.y = h / 2 + Math.sin(angle) * radius;
      n.vx = 0;
      n.vy = 0;
      n.pinned = false;
      n.opacity = 0;
    });

    setNodes(fNodes);
    setEdges(fEdges);
    setEnteredNodes(new Set());
    setEnteredEdges(new Set());
    setIsSimulating(true);
    simFrameRef.current = 0;

    // Entrance animation: nodes fade in sequentially
    const timers: NodeJS.Timeout[] = [];
    fNodes.forEach((n, i) => {
      const t = setTimeout(() => {
        setEnteredNodes(prev => new Set([...prev, n.id]));
      }, i * 60 + 100);
      timers.push(t);
    });

    // Edges appear after both endpoints are entered
    fEdges.forEach((e, i) => {
      const t = setTimeout(() => {
        setEnteredEdges(prev => new Set([...prev, e.id]));
      }, fNodes.length * 60 + i * 40 + 200);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, [activeAgentId, canvasSize.w, canvasSize.h]);

  // Measure container size
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setCanvasSize({ w: cr.width, h: cr.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Force-directed layout engine
  React.useEffect(() => {
    if (nodes.length === 0 || edges.length === 0) return;

    const K_REPULSE = 150;
    const K_SPRING = 0.05;
    const K_CENTER = 0.01;
    const DAMPING = 0.9;
    const MAX_FRAME = 300;
    const ENERGY_THRESHOLD = 0.01;
    const w = canvasSize.w;
    const h = canvasSize.h;

    const nodeMap = new Map<string, ForceNode>();
    nodes.forEach(n => nodeMap.set(n.id, n));

    let running = true;

    const step = () => {
      if (!running) return;
      simFrameRef.current++;
      const frame = simFrameRef.current;

      if (frame > MAX_FRAME) {
        setIsSimulating(false);
        return;
      }

      let totalEnergy = 0;
      const temperature = Math.max(0.1, 1 - frame / MAX_FRAME);

      // Repulsion between all node pairs
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq) || 1;
          const minDist = (a.width + b.height) / 2 + 20;
          const effectiveDist = Math.max(dist, minDist);
          const force = (K_REPULSE * a.mass * b.mass) / (effectiveDist * effectiveDist) * temperature;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (!a.pinned) { a.vx -= fx / a.mass; a.vy -= fy / a.mass; }
          if (!b.pinned) { b.vx += fx / b.mass; b.vy += fy / b.mass; }
        }
      }

      // Spring force along edges
      edges.forEach(edge => {
        const src = nodeMap.get(edge.source);
        const tgt = nodeMap.get(edge.target);
        if (!src || !tgt) return;
        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = K_SPRING * (dist - edge.idealLength) * temperature;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (!src.pinned) { src.vx += fx / src.mass; src.vy += fy / src.mass; }
        if (!tgt.pinned) { tgt.vx -= fx / tgt.mass; tgt.vy -= fy / tgt.mass; }
      });

      // Center gravity
      nodes.forEach(n => {
        if (n.pinned) return;
        const dx = w / 2 - n.x;
        const dy = h / 2 - n.y;
        n.vx += dx * K_CENTER * temperature;
        n.vy += dy * K_CENTER * temperature;
      });

      // Apply velocity with damping and boundary constraints
      nodes.forEach(n => {
        if (n.pinned) return;
        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.x += n.vx;
        n.y += n.vy;

        // Keep within bounds with padding
        const padX = n.width / 2 + 20;
        const padY = n.height / 2 + 20;
        n.x = Math.max(padX, Math.min(w - padX, n.x));
        n.y = Math.max(padY, Math.min(h - padY, n.y));

        totalEnergy += n.vx * n.vx + n.vy * n.vy;
      });

      // Trigger re-render
      setNodes(prev => prev.map((n, i) => ({ ...n, ...nodes[i] })));

      if (totalEnergy < ENERGY_THRESHOLD && frame > 50) {
        setIsSimulating(false);
        return;
      }

      animFrameRef.current = requestAnimationFrame(step);
    };

    if (isSimulating) {
      animFrameRef.current = requestAnimationFrame(step);
    }

    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [nodes.length, edges.length, isSimulating, canvasSize.w, canvasSize.h]);

  // Canvas drag handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    const target = e.target as Element;
    if (target.closest('[data-node]')) return; // Don't drag canvas when clicking a node
    setIsDraggingCanvas(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDraggingCanvas) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({ x: dragStartRef.current.panX + dx, y: dragStartRef.current.panY + dy });
  };

  const handleMouseUp = () => setIsDraggingCanvas(false);

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.3, Math.min(3.0, zoom + delta));
    const zoomRatio = newZoom / zoom;
    setPan({
      x: mouseX - (mouseX - pan.x) * zoomRatio,
      y: mouseY - (mouseY - pan.y) * zoomRatio,
    });
    setZoom(newZoom);
  };

  const handleDoubleClick = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1.0);
  };

  const handleNodeClick = (nodeId: string) => {
    setNodes(prev => prev.map(n =>
      n.id === nodeId ? { ...n, pinned: !n.pinned } : n
    ));
  };

  // Build edge path
  const buildEdgePath = (src: ForceNode, tgt: ForceNode) => {
    const sx = src.x;
    const sy = src.y;
    const tx = tgt.x;
    const ty = tgt.y;
    const dx = tx - sx;
    const dy = ty - sy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    // Shorten line to not overlap node bounds
    const srcR = Math.max(src.width, src.height) / 2 + 4;
    const tgtR = Math.max(tgt.width, tgt.height) / 2 + 4;
    const startX = sx + (dx / dist) * srcR;
    const startY = sy + (dy / dist) * srcR;
    const endX = tx - (dx / dist) * tgtR;
    const endY = ty - (dy / dist) * tgtR;
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  };

  // Compute hover highlights
  const highlightedNodes = React.useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const set = new Set<string>([hoveredNode]);
    edges.forEach(e => {
      if (e.source === hoveredNode) set.add(e.target);
      if (e.target === hoveredNode) set.add(e.source);
    });
    return set;
  }, [hoveredNode, edges]);

  const highlightedEdges = React.useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const set = new Set<string>();
    edges.forEach(e => {
      if (e.source === hoveredNode || e.target === hoveredNode) set.add(e.id);
    });
    return set;
  }, [hoveredNode, edges]);

  const hoveredNodeData = nodes.find(n => n.id === hoveredNode);

  // Arrow marker for edges
  const getArrowId = (relType: string) => `arrow-${relType}`;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network size={16} className="text-indigo-600" />
          <span className="text-sm font-bold text-gray-900">Agent 知识关系网络</span>
          {isSimulating && (
            <span className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full animate-pulse">
              布局收敛中...
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-500">
          <span>拖拽画布移动</span>
          <span className="mx-1">·</span>
          <span>滚轮缩放</span>
          <span className="mx-1">·</span>
          <span>点击节点固定</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2">
        {([
          { type: 'ontology', label: '本体' },
          { type: 'attribute', label: '属性' },
          { type: 'data_source', label: '数据源' },
          { type: 'skill', label: '技能' },
          { type: 'constraint', label: '约束' },
          { type: 'result', label: '结果' },
        ] as { type: string; label: string }[]).map(item => {
          const cfg = NODE_TYPE_CONFIG[item.type];
          return (
            <div key={item.type} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-gray-200">
              <div className="w-1 h-3 rounded-full" style={{ background: cfg?.barColor || '#94A3B8' }} />
              <span className="text-[10px] font-medium text-gray-600">{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* SVG Force-Directed Graph */}
      <div
        ref={containerRef}
        className="rounded-lg overflow-hidden relative"
        style={{
          background: '#F8FAFC',
          backgroundImage: 'radial-gradient(circle, #E2E8F0 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          height: 520,
        }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ cursor: isDraggingCanvas ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
        >
          <defs>
            {/* Arrow markers for each edge type */}
            {Object.entries(EDGE_TYPE_CONFIG).map(([type, cfg]) => (
              cfg.hasArrow && (
                <marker
                  key={type}
                  id={getArrowId(type)}
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={cfg.color} opacity={cfg.opacity} />
                </marker>
              )
            ))}

            {/* Drop shadow filters */}
            <filter id="card-shadow" x="-10%" y="-20%" width="130%" height="160%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.08" />
            </filter>
            <filter id="card-shadow-hover" x="-10%" y="-20%" width="130%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.15" />
            </filter>
            <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="tooltip-shadow" x="-5%" y="-5%" width="115%" height="120%">
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#000" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Main transform group for pan and zoom */}
          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`} style={{ transformOrigin: '0 0' }}>
            {/* Edges */}
            {edges.map(edge => {
              const src = nodes.find(n => n.id === edge.source);
              const tgt = nodes.find(n => n.id === edge.target);
              if (!src || !tgt) return null;
              const cfg = EDGE_TYPE_CONFIG[edge.relationType] || EDGE_TYPE_CONFIG.default;
              const entered = enteredEdges.has(edge.id);
              const isHighlighted = highlightedEdges.has(edge.id);
              const isDimmed = hoveredNode && !isHighlighted;
              const pathD = buildEdgePath(src, tgt);

              return (
                <g
                  key={edge.id}
                  opacity={entered ? (isDimmed ? 0.15 : (isHighlighted ? 1 : cfg.opacity)) : 0}
                  style={{ transition: 'opacity 0.3s ease' }}
                >
                  <path
                    d={pathD}
                    fill="none"
                    stroke={cfg.color}
                    strokeWidth={isHighlighted ? cfg.width + 1 : cfg.width}
                    strokeDasharray={cfg.dashed ? '4 4' : 'none'}
                    markerEnd={cfg.hasArrow ? `url(#${getArrowId(edge.relationType)})` : undefined}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  {/* Animated flow dot for flows_to */}
                  {cfg.animated && entered && (
                    <circle r="3" fill={cfg.color} opacity={0.8}>
                      <animateMotion dur="2s" repeatCount="indefinite" path={pathD} />
                    </circle>
                  )}
                  {/* Edge label */}
                  {edge.label && (
                    <text
                      x={(src.x + tgt.x) / 2}
                      y={(src.y + tgt.y) / 2 - 4}
                      textAnchor="middle"
                      fill={cfg.color}
                      fontSize="9"
                      fontWeight="500"
                      opacity={0.7}
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const cfg = NODE_TYPE_CONFIG[node.type] || NODE_TYPE_CONFIG.ontology;
              const Icon = cfg.icon;
              const entered = enteredNodes.has(node.id);
              const isHovered = hoveredNode === node.id;
              const isHighlighted = highlightedNodes.has(node.id);
              const isDimmed = hoveredNode && !isHighlighted;
              const opacity = entered ? (isDimmed ? 0.2 : (isHovered ? 1 : 0.9)) : 0;

              return (
                <g
                  key={node.id}
                  data-node={node.id}
                  style={{
                    opacity,
                    transition: 'opacity 0.4s ease, transform 0.3s ease',
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                    transformOrigin: `${node.x}px ${node.y}px`,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={(e) => { e.stopPropagation(); handleNodeClick(node.id); }}
                >
                  {/* Glow effect on hover */}
                  {isHovered && (
                    <rect
                      x={node.x - node.width / 2 - 6}
                      y={node.y - node.height / 2 - 6}
                      width={node.width + 12}
                      height={node.height + 12}
                      rx={node.type === 'attribute' ? 14 : 10}
                      fill="none"
                      stroke={cfg.barColor}
                      strokeWidth={2}
                      opacity={0.4}
                      filter="url(#glow-filter)"
                    />
                  )}

                  {/* Pinned indicator */}
                  {node.pinned && (
                    <circle
                      cx={node.x + node.width / 2 - 4}
                      cy={node.y - node.height / 2 + 4}
                      r={4}
                      fill="#F59E0B"
                      stroke="#FFF"
                      strokeWidth={1}
                    />
                  )}

                  {/* Node body */}
                  {node.type === 'attribute' ? (
                    // Ellipse for attribute nodes
                    <ellipse
                      cx={node.x}
                      cy={node.y}
                      rx={node.width / 2}
                      ry={node.height / 2}
                      fill={cfg.bg}
                      stroke={cfg.color}
                      strokeWidth={1}
                      filter={isHovered ? 'url(#card-shadow-hover)' : 'url(#card-shadow)'}
                    />
                  ) : (
                    // Rounded rect for other nodes
                    <rect
                      x={node.x - node.width / 2}
                      y={node.y - node.height / 2}
                      width={node.width}
                      height={node.height}
                      rx={8}
                      fill={cfg.bg}
                      filter={isHovered ? 'url(#card-shadow-hover)' : 'url(#card-shadow)'}
                    />
                  )}

                  {/* Left color bar (for non-ellipse nodes) */}
                  {node.type !== 'attribute' && (
                    <rect
                      x={node.x - node.width / 2}
                      y={node.y - node.height / 2}
                      width={4}
                      height={node.height}
                      rx={8}
                      fill={cfg.barColor}
                      clipPath={`inset(0 ${node.width - 4}px 0 0 round 8px)`}
                    />
                  )}

                  {/* Icon */}
                  <foreignObject
                    x={node.x - node.width / 2 + 8}
                    y={node.y - 9}
                    width={18}
                    height={18}
                  >
                    <div className="flex items-center justify-center w-full h-full">
                      <Icon size={14} color={cfg.color} />
                    </div>
                  </foreignObject>

                  {/* Label */}
                  <text
                    x={node.x - node.width / 2 + 30}
                    y={node.y + 1}
                    fill="#1F2937"
                    fontSize="12"
                    fontWeight="500"
                    dominantBaseline="middle"
                  >
                    {node.label}
                  </text>

                  {/* Sublabel */}
                  {node.sublabel && node.height > 36 && (
                    <text
                      x={node.x - node.width / 2 + 30}
                      y={node.y + 14}
                      fill="#6B7280"
                      fontSize="9"
                    >
                      {node.sublabel}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating tooltip card */}
        {hoveredNodeData && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: '50%',
              top: 16,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-white rounded-lg border border-gray-200 shadow-lg px-4 py-3 min-w-[280px] max-w-[360px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 rounded-full" style={{ background: NODE_TYPE_CONFIG[hoveredNodeData.type]?.barColor || '#94A3B8' }} />
                <span className="text-sm font-bold text-gray-900">{hoveredNodeData.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{hoveredNodeData.type}</span>
              </div>
              {hoveredNodeData.description && (
                <p className="text-xs text-gray-600 mb-2 leading-relaxed">{hoveredNodeData.description}</p>
              )}
              {hoveredNodeData.skills && hoveredNodeData.skills.length > 0 && (
                <div className="flex items-start gap-1 mb-1">
                  <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {hoveredNodeData.skills.map(s => (
                      <span key={s} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {hoveredNodeData.dataSources && hoveredNodeData.dataSources.length > 0 && (
                <div className="flex items-start gap-1 mb-1">
                  <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">Data:</span>
                  <div className="flex flex-wrap gap-1">
                    {hoveredNodeData.dataSources.map(d => (
                      <span key={d} className="text-[10px] px-1.5 py-0.5 bg-cyan-50 text-cyan-600 rounded">{d}</span>
                    ))}
                  </div>
                </div>
              )}
              {hoveredNodeData.output && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <span className="text-[10px] text-emerald-600 font-medium">{hoveredNodeData.output}</span>
                </div>
              )}
              {hoveredNodeData.pinned && (
                <div className="mt-1 text-[10px] text-amber-600">已固定位置</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: '本体实体', value: `${nodes.filter(n => n.type === 'ontology').length}个`, icon: Database, color: 'text-blue-600 bg-blue-50' },
          { label: '数据源', value: `${nodes.filter(n => n.type === 'data_source' || n.type === 'data').length}个`, icon: Database, color: 'text-cyan-600 bg-cyan-50' },
          { label: '技能工具', value: `${nodes.filter(n => n.type === 'skill').length}个`, icon: Wrench, color: 'text-amber-600 bg-amber-50' },
          { label: '约束规则', value: `${nodes.filter(n => n.type === 'constraint').length}个`, icon: ShieldCheck, color: 'text-red-600 bg-red-50' },
          { label: '关系边', value: `${edges.length}条`, icon: Network, color: 'text-indigo-600 bg-indigo-50' },
        ].map(stat => (
          <div key={stat.label} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <div className={`p-1.5 rounded-md ${stat.color}`}>
              <stat.icon size={14} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">{stat.value}</div>
              <div className="text-[10px] text-gray-500">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
