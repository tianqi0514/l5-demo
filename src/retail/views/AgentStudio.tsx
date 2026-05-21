import React, { useState } from 'react';
import {
  Bot, Plus, Search, Settings, Cpu, BrainCircuit, Database, Wrench,
  ShieldCheck, MonitorPlay, FileOutput, ArrowRight, Save, Play, CheckCircle2,
  Users, Crown, Briefcase, Store, UserCircle, MapPin, ChevronDown, ChevronUp,
  Target, ShoppingCart, Heart, TrendingUp, Package, Network, Zap, BarChart3,
  AlertTriangle, FileText, GitBranch, Layers
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
                    {/* Tab Switch */}
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                      <button
                        onClick={() => setResultTab('json')}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                          resultTab === 'json'
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <FileOutput size={12} />
                          结构化输出
                        </div>
                      </button>
                      <button
                        onClick={() => setResultTab('graph')}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                          resultTab === 'graph'
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <Network size={12} />
                          推演知识图谱
                        </div>
                      </button>
                    </div>

                    {resultTab === 'json' && (
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
                    )}

                    {resultTab === 'graph' && (
                      <AgentReasoningGraph activeAgentId={activeAgentId} />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 推演知识图谱组件 - 展示Agent完整推演流程
// ============================================================

interface ReasoningNode {
  id: string;
  label: string;
  icon: 'brain' | 'database' | 'arrow' | 'wrench' | 'shield' | 'play' | 'file';
  skills: string[];
  dataSources: string[];
  ontologies: string[];
  description: string;
  output?: string;
}

const REASONING_FLOWS: Record<string, ReasoningNode[]> = {
  a1: [
    {
      id: 'intent',
      label: '意图解析',
      icon: 'brain',
      skills: ['intent_parser_v1'],
      dataSources: ['用户输入文本'],
      ontologies: [''],
      description: '解析"华东区夏季选品优化"意图，提取区域范围、季节维度、优化目标',
      output: '意图: 选品优化 | 区域: 华东 | 季节: 夏季'
    },
    {
      id: 'ontology',
      label: '本体识别',
      icon: 'database',
      skills: ['ontology_resolver_v1'],
      dataSources: ['本体库'],
      ontologies: ['Product', 'SKU', 'Category', 'SalesOrder', 'Store'],
      description: '从本体库中识别与选品优化相关的业务实体，建立实体关联关系',
      output: '识别5个核心本体，建立Product→Category→SalesOrder关联链'
    },
    {
      id: 'binding',
      label: '数据绑定',
      icon: 'arrow',
      skills: ['data_mapper_v1'],
      dataSources: ['POS_Sales_DB', 'ERP_Store_API', 'Inventory_System'],
      ontologies: ['Store', 'SalesOrder', 'Inventory'],
      description: '将本体实体映射到实际数据源，参数化SQL/API查询',
      output: '生成3个数据查询任务，覆盖华东区156家门店'
    },
    {
      id: 'skill',
      label: '技能调用',
      icon: 'wrench',
      skills: ['product_selection_v1', 'sales_analysis_v1', 'margin_calculation_v1'],
      dataSources: ['POS_Sales_DB', 'Inventory_System'],
      ontologies: ['Product', 'SKU', 'Category'],
      description: '调用选品、销售分析、毛利计算技能，并行执行数据处理',
      output: 'SKU级销售分析完成，筛选出TOP200候选商品'
    },
    {
      id: 'constraint',
      label: '约束注入',
      icon: 'shield',
      skills: ['constraint_checker_v1'],
      dataSources: ['规则引擎'],
      ontologies: ['Product', 'Category'],
      description: '应用硬约束（选品通过率>85%, 毛利率>35%）和软约束（新品占比20%）',
      output: '过滤后剩余87个SKU，全部满足约束条件'
    },
    {
      id: 'simulation',
      label: '推演计算',
      icon: 'play',
      skills: ['monte_carlo_v1', 'scenario_generator_v1'],
      dataSources: ['POS_Sales_DB', 'Member_System'],
      ontologies: ['SalesOrder', 'Member', 'Store'],
      description: '蒙特卡洛仿真生成A/B/C三套选品方案，预测各方案的GMV、毛利率、坪效',
      output: '方案A: GMV+12% | 方案B: GMV+8% 毛利+3% | 方案C: GMV+15% 毛利-2%'
    },
    {
      id: 'result',
      label: '结果输出',
      icon: 'file',
      skills: ['result_formatter_v1'],
      dataSources: ['推演结果集'],
      ontologies: ['Product', 'SalesOrder'],
      description: '结构化输出最优方案（方案B），附带决策依据和可复用规则',
      output: '推荐方案B：平衡GMV增长与毛利率，置信度87%'
    },
  ],
  a2: [
    {
      id: 'intent',
      label: '意图解析',
      icon: 'brain',
      skills: ['intent_parser_v1'],
      dataSources: ['用户输入文本'],
      ontologies: [''],
      description: '解析"门店日销异常预警"意图，识别异常类型、预警级别',
      output: '意图: 异常预警 | 类型: 日销下降 | 级别: 紧急'
    },
    {
      id: 'ontology',
      label: '本体识别',
      icon: 'database',
      skills: ['ontology_resolver_v1'],
      dataSources: ['本体库'],
      ontologies: ['Store', 'SalesOrder', 'POSTransaction', 'Member', 'Inventory'],
      description: '识别门店运营相关本体实体，建立Store→POS→SalesOrder→Member关联',
      output: '识别5个核心本体，构建门店运营知识图谱'
    },
    {
      id: 'binding',
      label: '数据绑定',
      icon: 'arrow',
      skills: ['data_mapper_v1'],
      dataSources: ['POS_Stream', 'Member_System', 'Inventory_RealTime'],
      ontologies: ['Store', 'SalesOrder', 'Member'],
      description: '绑定实时POS流水、会员数据、库存数据，建立实时数据管道',
      output: '实时数据管道建立，延迟<3秒'
    },
    {
      id: 'skill',
      label: '技能调用',
      icon: 'wrench',
      skills: ['store_ops_v1', 'daily_report_v1', 'exception_alert_v1'],
      dataSources: ['POS_Stream', 'Store_Mgmt_DB'],
      ontologies: ['Store', 'SalesOrder'],
      description: '调用门店运营监控技能，执行日销对比、同环比分析、异常检测',
      output: '检测到3家门店日销下降超20%'
    },
    {
      id: 'constraint',
      label: '约束注入',
      icon: 'shield',
      skills: ['constraint_checker_v1'],
      dataSources: ['规则引擎'],
      ontologies: ['Store', 'SalesOrder'],
      description: '应用约束条件：日销目标达成率>90%，客单价>35元',
      output: '2家门店触发硬约束，1家触发软约束'
    },
    {
      id: 'simulation',
      label: '推演计算',
      icon: 'play',
      skills: ['root_cause_analyzer_v1', 'attribution_model_v1'],
      dataSources: ['POS_Stream', 'Weather_API', 'Competitor_Data'],
      ontologies: ['Store', 'SalesOrder', 'Member'],
      description: '多维度异常根因分析：天气因素、竞品促销、人员排班、库存缺货',
      output: '根因: 竞品促销(45%) + 库存缺货(30%) + 天气(25%)'
    },
    {
      id: 'result',
      label: '结果输出',
      icon: 'file',
      skills: ['result_formatter_v1'],
      dataSources: ['分析结果集'],
      ontologies: ['Store', 'SalesOrder'],
      description: '生成异常诊断报告，输出处理建议：补货+竞品应对+促销方案',
      output: '3项处理建议，预计2日内恢复日销目标'
    },
  ],
  a3: [
    {
      id: 'intent',
      label: '意图解析',
      icon: 'brain',
      skills: ['intent_parser_v1'],
      dataSources: ['用户输入文本'],
      ontologies: [''],
      description: '解析"高价值会员流失预警"意图，识别会员分层标准、流失定义',
      output: '意图: 流失预警 | 分层: 高价值 | 流失定义: 30天未消费'
    },
    {
      id: 'ontology',
      label: '本体识别',
      icon: 'database',
      skills: ['ontology_resolver_v1'],
      dataSources: ['本体库'],
      ontologies: ['Member', 'Promotion', 'Coupon', 'SalesOrder', 'LoyaltyProgram'],
      description: '识别会员运营相关本体，建立Member→SalesOrder→Promotion关联链',
      output: '识别5个核心本体，构建会员洞察知识图谱'
    },
    {
      id: 'binding',
      label: '数据绑定',
      icon: 'arrow',
      skills: ['data_mapper_v1'],
      dataSources: ['Member_System', 'CRM_DB', 'Sales_History'],
      ontologies: ['Member', 'SalesOrder'],
      description: '绑定会员画像、消费历史、互动记录，构建360°会员视图',
      output: '覆盖全量会员数据，共计2.3M会员档案'
    },
    {
      id: 'skill',
      label: '技能调用',
      icon: 'wrench',
      skills: ['member_segmentation_v1', 'churn_prediction_v1'],
      dataSources: ['Member_System', 'Sales_History'],
      ontologies: ['Member', 'SalesOrder'],
      description: '调用会员分群和流失预测技能，RFM分群+XGBoost预测模型',
      output: 'RFM分群完成，识别高价值会员12,400人'
    },
    {
      id: 'constraint',
      label: '约束注入',
      icon: 'shield',
      skills: ['constraint_checker_v1'],
      dataSources: ['规则引擎'],
      ontologies: ['Member', 'LoyaltyProgram'],
      description: '应用约束：会员增长率>10%，复购率>35%，LTV>2000元',
      output: '流失风险会员中，需优先干预8,600人'
    },
    {
      id: 'simulation',
      label: '推演计算',
      icon: 'play',
      skills: ['scenario_generator_v1', 'campaign_optimizer_v1'],
      dataSources: ['Member_System', 'Promotion_DB'],
      ontologies: ['Member', 'Promotion', 'Coupon'],
      description: '仿真不同挽回策略效果：专属优惠券、生日礼、积分翻倍、到店礼遇',
      output: '策略A(专属券): 挽回率32% | 策略B(到店礼): 挽回率28%'
    },
    {
      id: 'result',
      label: '结果输出',
      icon: 'file',
      skills: ['result_formatter_v1'],
      dataSources: ['推演结果集'],
      ontologies: ['Member', 'Promotion'],
      description: '输出流失风险名单和精准营销方案，附带ROI预测和触达渠道建议',
      output: '推荐策略A，预计挽回2,752人，ROI 1:4.3'
    },
  ],
};

const ICON_MAP: Record<string, any> = {
  brain: BrainCircuit,
  database: Database,
  arrow: ArrowRight,
  wrench: Wrench,
  shield: ShieldCheck,
  play: MonitorPlay,
  file: FileOutput,
};

const NODE_COLORS: Record<string, string> = {
  brain: '#4F46E5',
  database: '#0891B2',
  arrow: '#059669',
  wrench: '#D97706',
  shield: '#DC2626',
  play: '#7C3AED',
  file: '#374151',
};

function AgentReasoningGraph({ activeAgentId }: { activeAgentId: string }) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activeNodeIdx, setActiveNodeIdx] = useState(0);
  const nodes = REASONING_FLOWS[activeAgentId] || REASONING_FLOWS.a1;

  // 自动播放动画
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveNodeIdx(prev => (prev + 1) % nodes.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [nodes.length]);

  const nodeHeight = 88;
  const nodeGap = 32;
  const startY = 24;
  const svgWidth = 720;
  const svgHeight = startY * 2 + nodes.length * nodeHeight + (nodes.length - 1) * nodeGap;

  return (
    <div className="space-y-4">
      {/* 头部信息 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch size={16} className="text-indigo-600" />
          <span className="text-sm font-bold text-gray-900">Agent 推演流程图谱</span>
        </div>
        <span className="text-[10px] text-gray-400">自动轮播演示中...</span>
      </div>

      {/* SVG 流程图 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-x-auto">
        <svg width={svgWidth} height={svgHeight} className="min-w-[720px]">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#9CA3AF" />
            </marker>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.08" />
            </filter>
          </defs>

          {/* 连接线 */}
          {nodes.map((_, i) => {
            if (i === nodes.length - 1) return null;
            const y1 = startY + i * (nodeHeight + nodeGap) + nodeHeight;
            const y2 = startY + (i + 1) * (nodeHeight + nodeGap);
            const isActive = activeNodeIdx >= i;
            return (
              <line
                key={`line-${i}`}
                x1={svgWidth / 2}
                y1={y1}
                x2={svgWidth / 2}
                y2={y2}
                stroke={isActive ? '#4F46E5' : '#D1D5DB'}
                strokeWidth={isActive ? 2.5 : 1.5}
                markerEnd="url(#arrowhead)"
                className="transition-all duration-500"
              />
            );
          })}

          {/* 节点 */}
          {nodes.map((node, i) => {
            const y = startY + i * (nodeHeight + nodeGap);
            const cx = svgWidth / 2;
            const isActive = activeNodeIdx === i;
            const isHovered = hoveredNode === node.id;
            const color = NODE_COLORS[node.icon] || '#4F46E5';
            const Icon = ICON_MAP[node.icon] || BrainCircuit;

            return (
              <g
                key={node.id}
                transform={`translate(0, ${y})`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
                style={{ transition: 'all 0.3s' }}
              >
                {/* 节点卡片背景 */}
                <rect
                  x={40}
                  y={0}
                  width={svgWidth - 80}
                  height={nodeHeight}
                  rx={10}
                  fill={isActive ? '#FFFFFF' : '#FAFAFA'}
                  stroke={isActive ? color : isHovered ? '#9CA3AF' : '#E5E7EB'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  filter="url(#shadow)"
                  className="transition-all duration-300"
                />

                {/* 左侧彩色条 */}
                <rect
                  x={40}
                  y={0}
                  width={4}
                  height={nodeHeight}
                  rx={2}
                  fill={color}
                  className="transition-all duration-300"
                />

                {/* 图标圆圈 */}
                <circle
                  cx={78}
                  cy={nodeHeight / 2}
                  r={18}
                  fill={isActive ? color : '#F3F4F6'}
                  className="transition-all duration-300"
                />

                {/* 步骤序号 */}
                <circle
                  cx={78}
                  cy={nodeHeight / 2}
                  r={18}
                  fill="transparent"
                  stroke={isActive ? color : '#D1D5DB'}
                  strokeWidth={1.5}
                  className="transition-all duration-300"
                />
                <text
                  x={78}
                  y={nodeHeight / 2 + 4}
                  textAnchor="middle"
                  fill={isActive ? '#FFFFFF' : '#6B7280'}
                  fontSize="11"
                  fontWeight="bold"
                  className="transition-all duration-300"
                >
                  {i + 1}
                </text>

                {/* 节点标题 */}
                <text
                  x={110}
                  y={22}
                  fill={isActive ? color : '#1F2937'}
                  fontSize="13"
                  fontWeight="bold"
                  className="transition-all duration-300"
                >
                  {node.label}
                </text>

                {/* 节点描述 */}
                <text
                  x={110}
                  y={42}
                  fill="#6B7280"
                  fontSize="10"
                >
                  {node.description.length > 55 ? node.description.slice(0, 55) + '...' : node.description}
                </text>

                {/* Skills标签 */}
                <text
                  x={110}
                  y={60}
                  fill="#4F46E5"
                  fontSize="9"
                  fontWeight="500"
                >
                  Skills: {node.skills.slice(0, 2).join(', ')}{node.skills.length > 2 ? '...' : ''}
                </text>

                {/* 输出结果 */}
                {isActive && node.output && (
                  <g>
                    <rect
                      x={svgWidth - 220}
                      y={nodeHeight - 28}
                      width={180}
                      height={20}
                      rx={4}
                      fill="#ECFDF5"
                      stroke="#10B981"
                      strokeWidth={1}
                    />
                    <text
                      x={svgWidth - 130}
                      y={nodeHeight - 15}
                      textAnchor="middle"
                      fill="#059669"
                      fontSize="8"
                      fontWeight="500"
                    >
                      {node.output.length > 40 ? node.output.slice(0, 40) + '...' : node.output}
                    </text>
                  </g>
                )}

                {/* 悬停时的详细数据 */}
                {isHovered && (
                  <g>
                    <rect
                      x={svgWidth - 200}
                      y={4}
                      width={160}
                      height={50}
                      rx={6}
                      fill="#FFFFFF"
                      stroke={color}
                      strokeWidth={1}
                      filter="url(#shadow)"
                    />
                    <text x={svgWidth - 190} y={18} fill="#6B7280" fontSize="8" fontWeight="bold">数据</text>
                    <text x={svgWidth - 190} y={30} fill="#374151" fontSize="8">{node.dataSources.slice(0, 2).join(', ')}</text>
                    <text x={svgWidth - 190} y={44} fill="#6B7280" fontSize="8" fontWeight="bold">本体</text>
                    <text x={svgWidth - 160} y={44} fill="#374151" fontSize="8">{node.ontologies.filter(Boolean).slice(0, 3).join(', ')}</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 底部统计 */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '调用技能', value: `${nodes.reduce((s, n) => s + n.skills.length, 0)}个`, icon: Wrench, color: 'text-amber-600 bg-amber-50' },
          { label: '数据源', value: `${[...new Set(nodes.flatMap(n => n.dataSources))].length}个`, icon: Database, color: 'text-cyan-600 bg-cyan-50' },
          { label: '本体实体', value: `${[...new Set(nodes.flatMap(n => n.ontologies).filter(Boolean))].length}个`, icon: Layers, color: 'text-indigo-600 bg-indigo-50' },
          { label: '推演节点', value: `${nodes.length}步`, icon: GitBranch, color: 'text-emerald-600 bg-emerald-50' },
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
