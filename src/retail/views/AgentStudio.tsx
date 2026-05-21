import React, { useState } from 'react';
import {
  Bot, Plus, Search, Settings, Cpu, BrainCircuit, Database, Wrench,
  ShieldCheck, MonitorPlay, FileOutput, ArrowRight, Save, Play, CheckCircle2,
  Users, Crown, Briefcase, Store, UserCircle, MapPin, ChevronDown, ChevronUp,
  Target, ShoppingCart, Heart, TrendingUp, Package
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
