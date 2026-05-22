import React, { useState, useEffect } from 'react';
import {
  Bot, Plus, Search, Settings, Cpu, BrainCircuit, Database, Wrench,
  ShieldCheck, MonitorPlay, FileOutput, ArrowRight, Save, Play, CheckCircle2,
  Users, Crown, Briefcase, Factory, UserCircle, MapPin, ChevronDown, ChevronUp,
  Network, GitBranch, Layers, X, ZoomIn, ZoomOut, Maximize2
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  LITHIUM_BATTERY_ONTOLOGY_LIBRARY,
  Ontology,
  createOntology,
} from "../constants/ontology";

// ============================================================
// 决策空间角色模板（与 DecisionSpace v46 对应）
// ============================================================
type RoleLevel = '战略层' | '经营层' | '执行层' | '基地层' | '工厂层' | '产线层';

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
  { id: 'ceo', title: 'CEO', level: '战略层', initial: 'C', scope: '全集团 · 4基地 · 全工厂',
    defaultOntologies: ['sales_order', 'production_line', 'material', 'inventory', 'finance'],
    defaultSkills: ['strategic_analysis_v1', 'kpi_monitor_v1', 'risk_alert_v1', 'decision_support_v1'],
    defaultConstraints: ['年度目标达成', '毛利率控制', '合规审计'],
    desc: '全集团战略决策，年度目标监控，重大事项决策' },

  // 经营层
  { id: 'vp_prod', title: '生产副总裁', level: '经营层', initial: '生', scope: '集团生产 · 4基地',
    defaultOntologies: ['production_line', 'work_order', 'equipment', 'material'],
    defaultSkills: ['capacity_planning_v1', 'production_scheduling_v1', 'oee_optimizer_v2', 'cross_base_coordination_v1'],
    defaultConstraints: ['产能利用率>96%', '交期履约率>95%', '安全库存控制'],
    desc: '集团生产统筹，产能规划，跨基地资源协调' },
  { id: 'vp_sales', title: '销售副总裁', level: '经营层', initial: '销', scope: '集团销售 · 全客户',
    defaultOntologies: ['sales_order', 'customer', 'product', 'delivery'],
    defaultSkills: ['demand_forecasting_v1', 'order_priority_v1', 'customer_classification_v1', 'delivery_commitment_v1'],
    defaultConstraints: ['订单交付准时率', '客户满意度', '回款周期'],
    desc: '集团销售管理，客户需求洞察，订单交付保障' },
  { id: 'vp_supply', title: '供应链副总裁', level: '经营层', initial: '供', scope: '集团供应链',
    defaultOntologies: ['supplier', 'material', 'inventory', 'purchase_order'],
    defaultSkills: ['supplier_evaluation_v1', 'procurement_optimization_v1', 'inventory_optimization_v1', 'logistics_coordination_v1'],
    defaultConstraints: ['供应商交付准时率', '库存周转天数', '采购成本'],
    desc: '集团供应链管理，供应商协同，采购成本控制' },
  { id: 'vp_ops', title: '运营副总裁', level: '经营层', initial: '运', scope: '集团运营 · 跨基地协同 · KPI管控',
    defaultOntologies: ['work_order', 'production_line', 'quality', 'equipment'],
    defaultSkills: ['data_analysis_v1', 'kpi_monitor_v1', 'process_optimization_v1', 'risk_alert_v1'],
    defaultConstraints: ['运营效率指标', '成本控制', '质量标准'],
    desc: '集团运营管理，跨基地协同，KPI体系管控' },

  // 执行层
  { id: 'mgr_plan', title: '计划经理', level: '执行层', initial: '计', scope: '生产计划部',
    defaultOntologies: ['work_order', 'production_line', 'inventory', 'material'],
    defaultSkills: ['scheduling_optimization_v1', 'capacity_calculation_v1', 'material_requirements_planning_v1', 'delivery_assessment_v1'],
    defaultConstraints: ['产能约束', '物料齐套', '优先级规则'],
    desc: '生产计划制定，排程优化，交期评估与承诺' },
  { id: 'mgr_process', title: '工艺总监', level: '执行层', initial: '工', scope: '工艺技术部 · 全工厂',
    defaultOntologies: ['process', 'product', 'equipment', 'quality'],
    defaultSkills: ['process_optimization_v1', 'standard_man_hours_v1', 'process_route_v1', 'quality_control_v1'],
    defaultConstraints: ['工艺标准', '质量门', '良率目标'],
    desc: '工艺技术管理，工艺优化，质量标准制定' },
  { id: 'mgr_quality', title: '质量经理', level: '执行层', initial: '质', scope: '质量控制部',
    defaultOntologies: ['quality_inspection', 'product', 'process', 'work_order'],
    defaultSkills: ['quality_analysis_v1', 'root_cause_analysis_v3', 'spc_analysis_v1', 'traceability_query_v1'],
    defaultConstraints: ['良率目标>97.5%', '质量标准', '检验规范'],
    desc: '质量管理，缺陷分析，质量标准执行' },
  { id: 'mgr_finance', title: '财务经理', level: '执行层', initial: '财', scope: '财务部 · 全口径',
    defaultOntologies: ['cost_center', 'sales_order', 'material', 'product'],
    defaultSkills: ['cost_calculation_v1', 'budget_analysis_v1', 'gross_profit_analysis_v1', 'expense_control_v1'],
    defaultConstraints: ['毛利率>19.5%', '预算控制', '成本目标'],
    desc: '财务管理，成本测算，预算控制' },
  { id: 'mgr_purchase', title: '采购负责人', level: '执行层', initial: '采', scope: '采购部 · 全物料',
    defaultOntologies: ['supplier', 'material', 'purchase_order', 'inventory'],
    defaultSkills: ['supplier_management_v1', 'procurement_planning_v1', 'price_analysis_v1', 'inventory_optimization_v1'],
    defaultConstraints: ['采购成本目标', '交付准时率', '库存上限'],
    desc: '采购管理，供应商协同，采购成本控制' },
  { id: 'mgr_ka', title: '大客户经理KA', level: '执行层', initial: 'K', scope: 'A类战略客户',
    defaultOntologies: ['customer', 'sales_order', 'product', 'delivery'],
    defaultSkills: ['customer_needs_analysis_v1', 'order_tracking_v1', 'customer_classification_v1', 'satisfaction_monitoring_v1'],
    defaultConstraints: ['大客户交付优先', '合同条款', '客户满意度'],
    desc: '大客户管理，需求对接，交付保障' },
  { id: 'mgr_sop', title: 'S&OP经理', level: '执行层', initial: 'S', scope: '销售/生产/供应链协调',
    defaultOntologies: ['sales_order', 'production_line', 'inventory', 'material'],
    defaultSkills: ['production_sales_balance_v1', 'demand_forecasting_v1', 'supply_planning_v1', 'collaboration_meeting_v1'],
    defaultConstraints: ['供需平衡', '库存目标', '交付承诺'],
    desc: '产销协同，S&OP流程，供需平衡' },
  { id: 'analyst_demand', title: '需求预测分析师', level: '执行层', initial: '需', scope: '12个月滚动预测',
    defaultOntologies: ['customer', 'sales_order', 'product', 'market'],
    defaultSkills: ['demand_forecasting_v1', 'data_analysis_v1', 'trend_forecasting_v1', 'model_training_v1'],
    defaultConstraints: ['预测准确率', '滚动更新', '数据质量'],
    desc: '需求预测分析，趋势预测，数据建模' },
  { id: 'planner_capacity', title: '产能规划师', level: '执行层', initial: '容', scope: '中长期产能规划',
    defaultOntologies: ['production_line', 'equipment', 'work_order', 'factory'],
    defaultSkills: ['capacity_planning_v1', 'expansion_simulation_v1', 'equipment_investment_v1', 'layout_optimization_v1'],
    defaultConstraints: ['产能利用率', '投资回报率', '扩张节奏'],
    desc: '产能规划，扩张推演，投资决策支持' },
  { id: 'mgr_ops_director', title: '运营部长', level: '执行层', initial: '运', scope: '集团运营管理部 · KPI体系',
    defaultOntologies: ['work_order', 'production_line', 'quality', 'equipment'],
    defaultSkills: ['kpi_monitor_v1', 'kpi_monitor_v1', 'strategic_analysis_v1', 'collaboration_meeting_v1'],
    defaultConstraints: ['KPI达成', '运营效率', '体系合规'],
    desc: '运营体系管理，KPI监控，跨部门协同' },
  { id: 'mgr_ops', title: '运营经理', level: '执行层', initial: '运', scope: '运营管理部 · 跨基地协同执行',
    defaultOntologies: ['work_order', 'production_line', 'equipment'],
    defaultSkills: ['production_scheduling_v1', 'risk_alert_v1', 'collaboration_meeting_v1', 'data_analysis_v1'],
    defaultConstraints: ['执行效率', 'risk_alert_v1', '协同质量'],
    desc: '运营执行，异常处理，跨基地协同' },

  // 基地层
  { id: 'gm_changzhou', title: '常州基地总经理', level: '基地层', initial: '常', scope: '常州基地 · F02+F03',
    defaultOntologies: ['factory', 'production_line', 'work_order', 'equipment'],
    defaultSkills: ['cross_base_coordination_v1', 'inventory_optimization_v1', 'collaboration_meeting_v1', 'kpi_monitor_v1'],
    defaultConstraints: ['基地KPI', '成本控制', '交付目标'],
    desc: '常州基地全面管理，本地资源协调' },
  { id: 'gm_sichuan', title: '四川基地总经理', level: '基地层', initial: '川', scope: '四川基地 · F08+F09',
    defaultOntologies: ['factory', 'production_line', 'work_order', 'equipment'],
    defaultSkills: ['cross_base_coordination_v1', 'inventory_optimization_v1', 'collaboration_meeting_v1', 'kpi_monitor_v1'],
    defaultConstraints: ['基地KPI', '成本控制', '交付目标'],
    desc: '四川基地全面管理，本地资源协调' },
  { id: 'gm_wuhan', title: '武汉基地总经理', level: '基地层', initial: '汉', scope: '武汉基地 · F12+F13',
    defaultOntologies: ['factory', 'production_line', 'work_order', 'equipment'],
    defaultSkills: ['cross_base_coordination_v1', 'inventory_optimization_v1', 'collaboration_meeting_v1', 'kpi_monitor_v1'],
    defaultConstraints: ['基地KPI', '成本控制', '交付目标'],
    desc: '武汉基地全面管理，本地资源协调' },
  { id: 'gm_xiamen', title: '厦门基地总经理', level: '基地层', initial: '厦', scope: '厦门基地 · F15+F16',
    defaultOntologies: ['factory', 'production_line', 'work_order', 'equipment'],
    defaultSkills: ['cross_base_coordination_v1', 'inventory_optimization_v1', 'collaboration_meeting_v1', 'kpi_monitor_v1'],
    defaultConstraints: ['基地KPI', '成本控制', '交付目标'],
    desc: '厦门基地全面管理，本地资源协调' },

  // 工厂层
  { id: 'mgr_factory', title: '工厂厂长', level: '工厂层', initial: '厂', scope: '单工厂',
    defaultOntologies: ['factory', 'production_line', 'work_order', 'equipment', 'worker'],
    defaultSkills: ['production_scheduling_v1', 'scheduling_optimization_v1', 'scheduling_optimization_v1', 'quality_control_v1'],
    defaultConstraints: ['产量目标', '质量目标', '安全目标'],
    desc: '工厂全面管理，生产调度，班组管理' },

  // 产线层
  { id: 'mgr_line', title: '产线长', level: '产线层', initial: '线', scope: '单产线',
    defaultOntologies: ['production_line', 'work_order', 'equipment', 'worker', 'quality'],
    defaultSkills: ['oee_optimizer_v2', 'scheduling_optimization_v1', 'quality_control_v1', 'risk_alert_v1'],
    defaultConstraints: ['节拍目标', '良率目标', '安全规范'],
    desc: '产线现场管理，节拍优化，质量门管控' },
];

// 按层级分组
const ROLE_LEVELS: { level: RoleLevel; icon: any; roles: RoleTemplate[] }[] = [
  { level: '战略层', icon: Crown, roles: ROLE_TEMPLATES.filter(r => r.level === '战略层') },
  { level: '经营层', icon: Briefcase, roles: ROLE_TEMPLATES.filter(r => r.level === '经营层') },
  { level: '执行层', icon: UserCircle, roles: ROLE_TEMPLATES.filter(r => r.level === '执行层') },
  { level: '基地层', icon: MapPin, roles: ROLE_TEMPLATES.filter(r => r.level === '基地层') },
  { level: '工厂层', icon: Factory, roles: ROLE_TEMPLATES.filter(r => r.level === '工厂层') },
  { level: '产线层', icon: Users, roles: ROLE_TEMPLATES.filter(r => r.level === '产线层') },
];

const configuredAgents = [
  { id: 'a1', name: '产销匹配推演 Agent', desc: '判断瓶颈、选择策略、调用仿真对比方案', status: 'active', roleId: 'mgr_plan' },
  { id: 'a2', name: '设备异常诊断 Agent', desc: '基于遥测数据和知识图谱定位根因', status: 'active', roleId: 'mgr_process' },
  { id: 'a3', name: '质量追溯分析 Agent', desc: '跨工序追溯质量缺陷源头', status: 'draft', roleId: 'mgr_quality' },
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
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const activeAgent = agents.find(a => a.id === activeAgentId) || agents[0];
  const activeRole = ROLE_TEMPLATES.find(r => r.id === activeAgent.roleId);

  const handleCreateAgent = () => {
    const newId = `a${Date.now()}`;
    const newAgent = {
      id: newId,
      name: '新建智能体',
      desc: '请描述该智能体的功能与用途...',
      status: 'draft',
      roleId: undefined
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
    // 自动配置本体
    setAgentOntologyConfigs(prev => {
      const existing = prev.find(c => c.agentId === activeAgentId);
      if (existing) {
        return prev.map(c => c.agentId === activeAgentId ? { ...c, selectedOntologyIds: role.defaultOntologies } : c);
      }
      return [...prev, { agentId: activeAgentId, selectedOntologyIds: role.defaultOntologies }];
    });
    // 自动配置技能
    setAgentSkillConfigs(prev => {
      const existing = prev.find(c => c.agentId === activeAgentId);
      if (existing) {
        return prev.map(c => c.agentId === activeAgentId ? { ...c, selectedSkillIds: role.defaultSkills } : c);
      }
      return [...prev, { agentId: activeAgentId, selectedSkillIds: role.defaultSkills }];
    });
    // 自动配置约束
    setAgentConstraintConfigs(prev => {
      const existing = prev.find(c => c.agentId === activeAgentId);
      if (existing) {
        return prev.map(c => c.agentId === activeAgentId ? { ...c, selectedConstraintIds: role.defaultConstraints } : c);
      }
      return [...prev, { agentId: activeAgentId, selectedConstraintIds: role.defaultConstraints }];
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
  
  // 本体库状态
  const [ontologyLibrary, setOntologyLibrary] = useState<Ontology[]>(LITHIUM_BATTERY_ONTOLOGY_LIBRARY);
  const [agentOntologyConfigs, setAgentOntologyConfigs] = useState<{ agentId: string; selectedOntologyIds: string[] }[]>([
    { agentId: "a1", selectedOntologyIds: ["sales_order", "production_line", "material"] },
    { agentId: "a2", selectedOntologyIds: ["equipment", "product"] },
    { agentId: "a3", selectedOntologyIds: ["product", "work_order"] },
  ]);

  // 技能名称到 skill_id 的映射
  const SKILL_NAME_TO_ID: Record<string, string> = {
    'strategic_analysis_v1': 'strategic_analysis_v1',
    'kpi_monitor_v1': 'kpi_monitor_v1',
    'risk_alert_v1': 'risk_alert_v1',
    'decision_support_v1': 'decision_support_v1',
    'capacity_planning_v1': 'capacity_planning_v1',
    'production_scheduling_v1': 'production_scheduling_v1',
    'oee_optimizer_v2': 'oee_optimizer_v2',
    'cross_base_coordination_v1': 'cross_base_coordination_v1',
    'demand_forecasting_v1': 'demand_forecasting_v1',
    'order_priority_v1': 'order_priority_v1',
    'customer_classification_v1': 'customer_classification_v1',
    'delivery_commitment_v1': 'delivery_commitment_v1',
    'supplier_evaluation_v1': 'supplier_evaluation_v1',
    'procurement_optimization_v1': 'procurement_optimization_v1',
    'inventory_optimization_v1': 'inventory_optimization_v1',
    'logistics_coordination_v1': 'logistics_coordination_v1',
    'scheduling_optimization_v1': 'scheduling_optimization_v1',
    'capacity_calculation_v1': 'capacity_calculation_v1',
    'material_requirements_planning_v1': 'material_requirements_planning_v1',
    'delivery_assessment_v1': 'delivery_assessment_v1',
    'process_optimization_v1': 'process_optimization_v1',
    'standard_man_hours_v1': 'standard_man_hours_v1',
    'process_route_v1': 'process_route_v1',
    'quality_control_v1': 'quality_control_v1',
    'quality_analysis_v1': 'quality_analysis_v1',
    'root_cause_analysis_v3': 'root_cause_analysis_v3',
    'spc_analysis_v1': 'spc_analysis_v1',
    'traceability_query_v1': 'traceability_query_v1',
    'cost_calculation_v1': 'cost_calculation_v1',
    'budget_analysis_v1': 'budget_analysis_v1',
    'gross_profit_analysis_v1': 'gross_profit_analysis_v1',
    'expense_control_v1': 'expense_control_v1',
    'supplier_management_v1': 'supplier_management_v1',
    'procurement_planning_v1': 'procurement_planning_v1',
    'price_analysis_v1': 'price_analysis_v1',
    'customer_needs_analysis_v1': 'customer_needs_analysis_v1',
    'order_tracking_v1': 'order_tracking_v1',
    'satisfaction_monitoring_v1': 'satisfaction_monitoring_v1',
    'production_sales_balance_v1': 'production_sales_balance_v1',
    'supply_planning_v1': 'supply_planning_v1',
    'collaboration_meeting_v1': 'collaboration_meeting_v1',
    'data_analysis_v1': 'data_analysis_v1',
    'trend_forecasting_v1': 'trend_forecasting_v1',
    'model_training_v1': 'model_training_v1',
    'expansion_simulation_v1': 'expansion_simulation_v1',
    'equipment_investment_v1': 'equipment_investment_v1',
    'layout_optimization_v1': 'layout_optimization_v1',
    'equipment_health_diagnosis_v2': 'equipment_health_diagnosis_v2',
    'supply_chain_simulator_v2': 'supply_chain_simulator_v2',
    'carbon_emission_tracker_v1': 'carbon_emission_tracker_v1',
  };

  // skill_id 到技能名称的反向映射
  const SKILL_ID_TO_NAME: Record<string, string> = Object.fromEntries(
    Object.entries(SKILL_NAME_TO_ID).map(([name, id]) => [id, name])
  );

  // 可用技能列表（使用 skill_id）
  const AVAILABLE_SKILLS = Object.values(SKILL_NAME_TO_ID);
  const [agentSkillConfigs, setAgentSkillConfigs] = useState<{ agentId: string; selectedSkillIds: string[] }[]>([
    { agentId: "a1", selectedSkillIds: ['scheduling_optimization_v1', 'capacity_calculation_v1', 'material_requirements_planning_v1', 'delivery_assessment_v1'] },
    { agentId: "a2", selectedSkillIds: ['quality_analysis_v1', 'root_cause_analysis_v3', 'traceability_query_v1'] },
    { agentId: "a3", selectedSkillIds: ['quality_analysis_v1', 'root_cause_analysis_v3', 'spc_analysis_v1', 'traceability_query_v1'] },
  ]);

  // 约束配置状态
  const AVAILABLE_CONSTRAINTS = [
    '年度目标达成', '毛利率控制', '合规审计',
    '产能利用率>96%', '交期履约率>95%', '安全库存控制',
    '订单交付准时率', '客户满意度', '回款周期',
    '供应商交付准时率', '库存周转天数', '采购成本',
    '产能约束', '物料齐套', '优先级规则',
    '工艺标准', '质量门', '良率目标',
    '良率目标>97.5%', '质量标准', '检验规范',
    '毛利率>19.5%', '预算控制', '成本目标',
    '采购成本目标', '交付准时率', '库存上限',
    '大客户交付优先', '合同条款',
    '供需平衡', '库存目标', '交付承诺',
    '预测准确率', '滚动更新', '数据质量',
    '投资回报率', '扩张节奏',
    'KPI达成', '运营效率', '体系合规',
    '执行效率', 'risk_alert_v1', '协同质量',
    '基地KPI', '成本控制', '交付目标',
    '产量目标', '质量目标', '安全目标',
    '节拍目标', '安全规范'
  ];
  const [agentConstraintConfigs, setAgentConstraintConfigs] = useState<{ agentId: string; selectedConstraintIds: string[] }[]>([
    { agentId: "a1", selectedConstraintIds: ['产能约束', '物料齐套', '优先级规则'] },
    { agentId: "a2", selectedConstraintIds: ['工艺标准', '质量门', '良率目标'] },
    { agentId: "a3", selectedConstraintIds: ['良率目标>97.5%', '质量标准', '检验规范'] },
  ]);
  const [showCreateOntologyModal, setShowCreateOntologyModal] = useState(false);
  const [newOntologyName, setNewOntologyName] = useState("");
  const [newOntologyDesc, setNewOntologyDesc] = useState("");
  const [newOntologyAttrs, setNewOntologyAttrs] = useState("");
  const [isOntologyDropdownOpen, setIsOntologyDropdownOpen] = useState(false);
  
  const currentOntologyConfig = agentOntologyConfigs.find(c => c.agentId === activeAgentId);
  const selectedOntologyIds = currentOntologyConfig?.selectedOntologyIds || [];
  const selectedOntologies = ontologyLibrary.filter(o => selectedOntologyIds.includes(o.id));
  
  const handleAddOntology = (ontologyId: string) => {
    setAgentOntologyConfigs(prev => {
      const existing = prev.find(c => c.agentId === activeAgentId);
      if (existing) {
        return prev.map(c => c.agentId === activeAgentId ? { ...c, selectedOntologyIds: [...c.selectedOntologyIds, ontologyId] } : c);
      }
      return [...prev, { agentId: activeAgentId, selectedOntologyIds: [ontologyId] }];
    });
  };
  
  const handleRemoveOntology = (ontologyId: string) => {
    setAgentOntologyConfigs(prev => prev.map(c => c.agentId === activeAgentId ? { ...c, selectedOntologyIds: c.selectedOntologyIds.filter(id => id !== ontologyId) } : c));
  };
  
  const handleCreateOntology = () => {
    if (!newOntologyName.trim()) return;
    const newOntology = createOntology(newOntologyName.trim(), newOntologyDesc.trim(), newOntologyAttrs.split(",").map(s => s.trim()).filter(Boolean));
    setOntologyLibrary(prev => [...prev, newOntology]);
    handleAddOntology(newOntology.id);
    setNewOntologyName("");
    setNewOntologyDesc("");
    setNewOntologyAttrs("");
    setShowCreateOntologyModal(false);
  };
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
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-4">
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
                {steps.map((step, idx) => {
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

                {/* Step specific content */}
                {activeStep === 'role' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <p className="text-sm text-indigo-800">
                        <span className="font-semibold">角色模板说明：</span>选择与该智能体对应的决策空间角色，系统将自动加载该角色的推荐本体、技能和约束配置。
                      </p>
                    </div>

                    {/* Selected Role Display */}
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

                    {/* Role Selection by Level */}
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
                        defaultValue="你是一个产销匹配推演专家。你的任务是解析用户的自然语言意图，提取出关键的生产需求、交期要求和产能约束条件。"
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
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                        <div className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded shadow-sm">
                          <span className="text-sm font-medium text-gray-700">SalesOrder (销售订单)</span>
                          <span className="text-xs text-gray-500">提取: 交期, 数量, 产品型号</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded shadow-sm">
                          <span className="text-sm font-medium text-gray-700">ProductionLine (产线)</span>
                          <span className="text-xs text-gray-500">提取: 产能, 状态, OEE</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded shadow-sm">
                          <span className="text-sm font-medium text-gray-700">Material (物料)</span>
                          <span className="text-xs text-gray-500">提取: 库存量, 采购周期</span>
                        </div>
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
                          <td className="py-3 text-blue-600">ERP_Sales_DB</td>
                          <td className="py-3 text-gray-500 font-mono text-xs">SELECT * FROM orders WHERE ...</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 font-medium text-gray-800">ProductionLine</td>
                          <td className="py-3 text-emerald-600">MES_Equipment_API</td>
                          <td className="py-3 text-gray-500 font-mono text-xs">GET /api/v1/lines/:id/status</td>
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
                        const skillName = SKILL_ID_TO_NAME[skillId] || skillId;
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
                                {skillName}
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
                        const isHard = constraint.includes('>') || constraint.includes('目标') || constraint.includes('达成');
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
                          <option>离散事件仿真 (DES)</option>
                          <option>系统动力学 (SD)</option>
                        </select>
                      </div>
                      <div className="text-xs text-gray-500 bg-white p-3 rounded border border-gray-200">
                        Agent 将根据前置条件生成多种策略（如：加班、调线、外包），并调用仿真引擎对比各方案的 KPI（成本、准交率）。
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 'result' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-bold text-gray-700">输出结构 (JSON Schema)</label>
                      <button
                        onClick={() => setShowPreviewModal(true)}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
                      >
                        <Network size={14} />
                        预览推演过程
                      </button>
                    </div>
                    <textarea
                      className="w-full h-48 p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-gray-600 bg-gray-50"
                      defaultValue={`{
  "best_strategy": "string (加班/调线/外包)",
  "confidence_score": "number",
  "kpi_impact": {
    "cost_increase": "number",
    "on_time_delivery_rate": "number"
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

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPreviewModal(false)}
          />
          <div className="relative w-[95vw] h-[90vh] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Network size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">推演知识图谱</h3>
                  <p className="text-[10px] text-gray-500">{activeAgent.name} · 完整推理流程可视化</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400">拖拽移动 · 滚轮缩放 · 点击节点固定</span>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body - Graph */}
            <div className="flex-1 overflow-hidden bg-gray-50/50">
              <BatteryReasoningGraph activeAgentId={activeAgentId} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ============================================================
// 锂电版推演知识图谱组件 —— 力导向网络图可视化
// ============================================================

type GraphNodeType = 'intent' | 'ontology' | 'attribute' | 'data_source' | 'skill' | 'constraint' | 'simulation' | 'result';

interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  description: string;
  details?: string[];
  output?: string;
  icon: string;
  attributes?: string[];
  dataSources?: string[];
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  relationType?: EdgeRelationType;
}

type EdgeRelationType = 'has_attribute' | 'bound_to' | 'consumes' | 'constrains' | 'produces' | 'depends_on' | 'flows_to';

// Agent a1: 产销匹配推演Agent
const AGENT_A1_NODES: GraphNode[] = [
  // Intent
  { id: 'a1-intent', label: '产销匹配意图', type: 'intent', x: 400, y: 30, width: 140, height: 44, description: '解析"Q3产能瓶颈应对"意图，提取时间维度、约束条件、决策目标', output: '意图: 产能优化 | 时间: Q3 | 约束: 准时交付>95%', icon: 'brain', details: ['用户输入文本'] },

  // Ontologies
  { id: 'a1-onto-prodline', label: 'ProductionLine', type: 'ontology', x: 120, y: 120, width: 120, height: 40, description: '产线本体：产能、状态、OEE、节拍等属性', icon: 'database', details: ['产能: 1200pcs/day', 'OEE: 85%', '状态: 运行中'], attributes: ['产能', '状态', 'OEE', '节拍'] },
  { id: 'a1-onto-workorder', label: 'WorkOrder', type: 'ontology', x: 280, y: 110, width: 110, height: 40, description: '工单本体：工序、数量、优先级、交期', icon: 'database', details: ['工单数: 47', '优先级: 高', '交期: 2024-08-15'], attributes: ['工序', '数量', '优先级', '交期'] },
  { id: 'a1-onto-equip', label: 'Equipment', type: 'ontology', x: 430, y: 115, width: 100, height: 40, description: '设备本体：设备编号、类型、健康度', icon: 'database', details: ['设备数: 28', '健康度: 92%', '维保状态: 正常'], attributes: ['设备编号', '类型', '健康度'] },
  { id: 'a1-onto-material', label: 'Material', type: 'ontology', x: 570, y: 110, width: 100, height: 40, description: '物料本体：库存量、采购周期、供应商', icon: 'database', details: ['库存: 5000pcs', '采购周期: 7天', '供应商: 12家'], attributes: ['库存量', '采购周期', '供应商'] },
  { id: 'a1-onto-sales', label: 'SalesOrder', type: 'ontology', x: 700, y: 120, width: 110, height: 40, description: '销售订单本体：客户、数量、交期、优先级', icon: 'database', details: ['订单数: 23', '客户: A类', '交付窗口: Q3'], attributes: ['客户', '数量', '交期', '优先级'] },

  // Data sources
  { id: 'a1-data-mes', label: 'MES', type: 'data_source', x: 180, y: 200, width: 80, height: 40, description: '制造执行系统实时数据', icon: 'database', details: ['产线实时状态', '工单进度', '质量数据'] },
  { id: 'a1-data-erp', label: 'ERP', type: 'data_source', x: 320, y: 195, width: 80, height: 40, description: '企业资源计划系统数据', icon: 'database', details: ['销售订单', '物料库存', '财务数据'] },
  { id: 'a1-data-scada', label: 'SCADA', type: 'data_source', x: 480, y: 200, width: 90, height: 40, description: '数据采集与监控系统', icon: 'database', details: ['设备遥测', '温度/压力', '能耗数据'] },

  // Skills
  { id: 'a1-skill-capacity', label: 'capacity_planning', type: 'skill', x: 140, y: 290, width: 140, height: 40, description: '产能规划技能：计算各产线产能利用率', icon: 'wrench', details: ['瓶颈分析', '产能平衡', '负载预测'], dataSources: ['a1-data-mes'] },
  { id: 'a1-skill-scheduling', label: 'production_scheduling', type: 'skill', x: 330, y: 285, width: 160, height: 40, description: '生产排程优化技能：智能排产算法', icon: 'wrench', details: ['遗传算法', '约束满足', '多目标优化'], dataSources: ['a1-data-erp'] },
  { id: 'a1-skill-oee', label: 'oee_optimizer', type: 'skill', x: 540, y: 290, width: 130, height: 40, description: 'OEE优化技能：设备综合效率提升', icon: 'wrench', details: ['停机分析', '速度损失', '质量损失'], dataSources: ['a1-data-scada'] },

  // Constraints
  { id: 'a1-constraint-capacity', label: '产能利用率>96%', type: 'constraint', x: 200, y: 370, width: 140, height: 40, description: '硬约束：产能利用率必须大于96%', icon: 'shield', details: ['当前: 78%', '缺口: 18%', '优先级: P0'] },
  { id: 'a1-constraint-delivery', label: '准时交付率>95%', type: 'constraint', x: 400, y: 375, width: 140, height: 40, description: '硬约束：订单准时交付率必须大于95%', icon: 'shield', details: ['当前: 89%', '缺口: 6%', '优先级: P0'] },
  { id: 'a1-constraint-cost', label: '成本最优', type: 'constraint', x: 580, y: 370, width: 100, height: 40, description: '软约束：在满足硬约束前提下成本最优', icon: 'shield', details: ['加班成本', '调线成本', '外包成本'] },

  // Simulation
  { id: 'a1-sim-des', label: '离散事件仿真', type: 'simulation', x: 320, y: 460, width: 160, height: 48, description: 'DES仿真引擎：生成多套方案并预测KPI', output: '加班: 成本+8% 准交+3% | 调线: 成本+2% 准交+1%', icon: 'play', details: ['方案数: 3', '仿真时长: 30天', '置信度: 91%'] },

  // Result
  { id: 'a1-result', label: '最优方案', type: 'result', x: 330, y: 550, width: 140, height: 48, description: '推荐调线方案：成本最低且满足交付约束', output: '推荐调线方案：成本最低且满足交付约束，置信度91%', icon: 'file', details: ['成本增加: +2%', '准交率: 96.5%', '执行周期: 3天'] },
];

const AGENT_A1_EDGES: GraphEdge[] = [
  // Intent -> Ontologies (depends_on)
  { id: 'e1', source: 'a1-intent', target: 'a1-onto-prodline', relationType: 'depends_on' },
  { id: 'e2', source: 'a1-intent', target: 'a1-onto-workorder', relationType: 'depends_on' },
  { id: 'e3', source: 'a1-intent', target: 'a1-onto-equip', relationType: 'depends_on' },
  { id: 'e4', source: 'a1-intent', target: 'a1-onto-material', relationType: 'depends_on' },
  { id: 'e5', source: 'a1-intent', target: 'a1-onto-sales', relationType: 'depends_on' },
  // Ontologies -> Data sources (bound_to)
  { id: 'e6', source: 'a1-onto-prodline', target: 'a1-data-mes', relationType: 'bound_to' },
  { id: 'e7', source: 'a1-onto-workorder', target: 'a1-data-mes', relationType: 'bound_to' },
  { id: 'e8', source: 'a1-onto-equip', target: 'a1-data-scada', relationType: 'bound_to' },
  { id: 'e9', source: 'a1-onto-material', target: 'a1-data-erp', relationType: 'bound_to' },
  { id: 'e10', source: 'a1-onto-sales', target: 'a1-data-erp', relationType: 'bound_to' },
  // Data sources -> Skills (flows_to)
  { id: 'e11', source: 'a1-data-mes', target: 'a1-skill-capacity', relationType: 'flows_to' },
  { id: 'e12', source: 'a1-data-erp', target: 'a1-skill-scheduling', relationType: 'flows_to' },
  { id: 'e13', source: 'a1-data-scada', target: 'a1-skill-oee', relationType: 'flows_to' },
  // Skills -> Constraints (constrains)
  { id: 'e14', source: 'a1-skill-capacity', target: 'a1-constraint-capacity', relationType: 'constrains' },
  { id: 'e15', source: 'a1-skill-scheduling', target: 'a1-constraint-delivery', relationType: 'constrains' },
  { id: 'e16', source: 'a1-skill-oee', target: 'a1-constraint-cost', relationType: 'constrains' },
  // Constraints -> Simulation (depends_on)
  { id: 'e17', source: 'a1-constraint-capacity', target: 'a1-sim-des', relationType: 'depends_on' },
  { id: 'e18', source: 'a1-constraint-delivery', target: 'a1-sim-des', relationType: 'depends_on' },
  { id: 'e19', source: 'a1-constraint-cost', target: 'a1-sim-des', relationType: 'depends_on' },
  // Simulation -> Result (produces)
  { id: 'e20', source: 'a1-sim-des', target: 'a1-result', relationType: 'produces' },
];

// Agent a2: 设备异常诊断Agent
const AGENT_A2_NODES: GraphNode[] = [
  { id: 'a2-intent', label: '设备异常诊断', type: 'intent', x: 400, y: 30, width: 140, height: 44, description: '解析"产线设备异常诊断"意图，识别异常类型、设备编号', output: '意图: 异常诊断 | 设备: L3-涂布机-02 | 类型: 温度异常', icon: 'brain', details: ['用户输入文本'] },

  { id: 'a2-onto-equip', label: 'Equipment', type: 'ontology', x: 130, y: 120, width: 110, height: 40, description: '设备本体：设备编号、类型、健康度、维保记录', icon: 'database', details: ['设备: L3-涂布机-02', '类型: 涂布', '运行时长: 8760h'], attributes: ['设备编号', '类型', '健康度', '维保记录'] },
  { id: 'a2-onto-prodline', label: 'ProductionLine', type: 'ontology', x: 290, y: 110, width: 120, height: 40, description: '产线本体：产线编号、工序、产能', icon: 'database', details: ['产线: L3', '工序: 涂布', '节拍: 120pcs/h'], attributes: ['产线编号', '工序', '产能'] },
  { id: 'a2-onto-quality', label: 'QualityCheck', type: 'ontology', x: 450, y: 115, width: 120, height: 40, description: '质量检测本体：检测项、标准值、实测值', icon: 'database', details: ['检测项: 温度', '标准: 80±2°C', '实测: 87.3°C'], attributes: ['检测项', '标准值', '实测值'] },
  { id: 'a2-onto-material', label: 'Material', type: 'ontology', x: 610, y: 110, width: 100, height: 40, description: '物料本体：浆料批次、供应商、入库时间', icon: 'database', details: ['浆料批次: SJ-240815', '供应商: B公司', '入库: 2024-08-10'], attributes: ['浆料批次', '供应商', '入库时间'] },
  { id: 'a2-onto-process', label: 'Process', type: 'ontology', x: 740, y: 120, width: 100, height: 40, description: '工艺本体：工艺参数、标准配方', icon: 'database', details: ['工艺: 负极涂布', '速度: 12m/min', '厚度: 120μm'], attributes: ['工艺参数', '标准配方'] },

  { id: 'a2-data-scada', label: 'SCADA', type: 'data_source', x: 160, y: 200, width: 90, height: 40, description: 'SCADA实时数据流', icon: 'database', details: ['温度遥测', '压力数据', '振动频谱'] },
  { id: 'a2-data-iot', label: 'IoT Sensors', type: 'data_source', x: 310, y: 195, width: 100, height: 40, description: 'IoT传感器数据', icon: 'database', details: ['温度传感器', '电流传感器', '红外热像'] },
  { id: 'a2-data-maint', label: 'Maintenance', type: 'data_source', x: 470, y: 200, width: 110, height: 40, description: '设备维保历史数据库', icon: 'database', details: ['维保记录', '备件更换', '故障历史'] },

  { id: 'a2-skill-anomaly', label: 'anomaly_detector', type: 'skill', x: 130, y: 290, width: 150, height: 40, description: '异常检测技能：基于时序数据的异常模式识别', icon: 'wrench', details: ['温度异常', '趋势分析', '阈值判断'], dataSources: ['a2-data-scada'] },
  { id: 'a2-skill-rootcause', label: 'root_cause_analysis', type: 'skill', x: 330, y: 285, width: 160, height: 40, description: '根因分析技能：基于知识图谱的故障定位', icon: 'wrench', details: ['故障树', '关联分析', '历史匹配'], dataSources: ['a2-data-iot'] },
  { id: 'a2-skill-predict', label: 'predictive_maintenance', type: 'skill', x: 540, y: 290, width: 170, height: 40, description: '预测性维护技能：剩余使用寿命预测', icon: 'wrench', details: ['RUL预测', '劣化趋势', '维护建议'], dataSources: ['a2-data-maint'] },

  { id: 'a2-constraint-downtime', label: '停机时间<4h', type: 'constraint', x: 180, y: 375, width: 130, height: 40, description: '硬约束：设备停机维修时间必须小于4小时', icon: 'shield', details: ['当前预估: 2h', '满足约束', '优先级: P0'] },
  { id: 'a2-constraint-cost', label: '维修成本<5万', type: 'constraint', x: 360, y: 380, width: 130, height: 40, description: '硬约束：单次维修成本必须小于5万元', icon: 'shield', details: ['当前预估: 1.2万', '满足约束', '优先级: P0'] },
  { id: 'a2-constraint-safety', label: '安全标准', type: 'constraint', x: 530, y: 375, width: 100, height: 40, description: '硬约束：必须符合安全生产标准', icon: 'shield', details: ['温度超限', '安全停机', '人员疏散'] },

  { id: 'a2-sim-impact', label: '影响仿真', type: 'simulation', x: 310, y: 465, width: 140, height: 48, description: '仿真故障对产线排程的影响', output: '预计产能损失120pcs，可通过调线弥补80%缺口', icon: 'play', details: ['产能损失: 120pcs', '调线弥补: 80%', '恢复时间: 2h'] },

  { id: 'a2-result', label: '诊断报告', type: 'result', x: 310, y: 555, width: 140, height: 48, description: '输出故障诊断报告和维修建议', output: '根因: 加热管老化 | 建议: 立即更换 | 预计恢复: 2h', icon: 'file', details: ['根因: 加热管老化', '建议: 立即更换', '预计恢复: 2h'] },
];

const AGENT_A2_EDGES: GraphEdge[] = [
  { id: 'e1', source: 'a2-intent', target: 'a2-onto-equip', relationType: 'depends_on' },
  { id: 'e2', source: 'a2-intent', target: 'a2-onto-prodline', relationType: 'depends_on' },
  { id: 'e3', source: 'a2-intent', target: 'a2-onto-quality', relationType: 'depends_on' },
  { id: 'e4', source: 'a2-intent', target: 'a2-onto-material', relationType: 'depends_on' },
  { id: 'e5', source: 'a2-intent', target: 'a2-onto-process', relationType: 'depends_on' },
  { id: 'e6', source: 'a2-onto-equip', target: 'a2-data-scada', relationType: 'bound_to' },
  { id: 'e7', source: 'a2-onto-prodline', target: 'a2-data-scada', relationType: 'bound_to' },
  { id: 'e8', source: 'a2-onto-quality', target: 'a2-data-iot', relationType: 'bound_to' },
  { id: 'e9', source: 'a2-onto-material', target: 'a2-data-maint', relationType: 'bound_to' },
  { id: 'e10', source: 'a2-onto-process', target: 'a2-data-iot', relationType: 'bound_to' },
  { id: 'e11', source: 'a2-data-scada', target: 'a2-skill-anomaly', relationType: 'flows_to' },
  { id: 'e12', source: 'a2-data-iot', target: 'a2-skill-rootcause', relationType: 'flows_to' },
  { id: 'e13', source: 'a2-data-maint', target: 'a2-skill-predict', relationType: 'flows_to' },
  { id: 'e14', source: 'a2-skill-anomaly', target: 'a2-constraint-downtime', relationType: 'constrains' },
  { id: 'e15', source: 'a2-skill-rootcause', target: 'a2-constraint-cost', relationType: 'constrains' },
  { id: 'e16', source: 'a2-skill-predict', target: 'a2-constraint-safety', relationType: 'constrains' },
  { id: 'e17', source: 'a2-constraint-downtime', target: 'a2-sim-impact', relationType: 'depends_on' },
  { id: 'e18', source: 'a2-constraint-cost', target: 'a2-sim-impact', relationType: 'depends_on' },
  { id: 'e19', source: 'a2-constraint-safety', target: 'a2-sim-impact', relationType: 'depends_on' },
  { id: 'e20', source: 'a2-sim-impact', target: 'a2-result', relationType: 'produces' },
];

// Agent a3: 质量追溯分析Agent
const AGENT_A3_NODES: GraphNode[] = [
  { id: 'a3-intent', label: '质量追溯分析', type: 'intent', x: 400, y: 30, width: 140, height: 44, description: '解析"批次质量缺陷追溯"意图，识别批次号、缺陷类型', output: '意图: 质量追溯 | 批次: BT-2024-Q3-8847 | 缺陷: 容量衰减', icon: 'brain', details: ['用户输入文本'] },

  { id: 'a3-onto-product', label: 'Product', type: 'ontology', x: 110, y: 120, width: 100, height: 40, description: '产品本体：产品型号、批次、规格', icon: 'database', details: ['型号: LP-280', '批次: BT-8847', '规格: 280Ah'], attributes: ['产品型号', '批次', '规格'] },
  { id: 'a3-onto-workorder', label: 'WorkOrder', type: 'ontology', x: 250, y: 110, width: 110, height: 40, description: '工单本体：工序流转、操作员、设备', icon: 'database', details: ['工单: WO-4521', '工序: 12道', '操作员: 张三'], attributes: ['工序流转', '操作员', '设备'] },
  { id: 'a3-onto-quality', label: 'QualityCheck', type: 'ontology', x: 400, y: 115, width: 120, height: 40, description: '质量检测本体：检测项、CPK、不良率', icon: 'database', details: ['CPK: 1.15', '不良率: 0.8%', '检测项: 容量'], attributes: ['检测项', 'CPK', '不良率'] },
  { id: 'a3-onto-material', label: 'Material', type: 'ontology', x: 560, y: 110, width: 100, height: 40, description: '物料本体：物料批次、供应商、来料检验', icon: 'database', details: ['物料批次: FM-3321', '供应商: C公司', '来料: 合格'], attributes: ['物料批次', '供应商', '来料检验'] },
  { id: 'a3-onto-equip', label: 'Equipment', type: 'ontology', x: 700, y: 120, width: 100, height: 40, description: '设备本体：设备编号、工序、维护记录', icon: 'database', details: ['设备: E-1205', '工序: 负极涂布', '维护: 正常'], attributes: ['设备编号', '工序', '维护记录'] },

  { id: 'a3-data-qms', label: 'QMS', type: 'data_source', x: 150, y: 200, width: 80, height: 40, description: '质量管理系统数据', icon: 'database', details: ['检验记录', 'SPC数据', '不合格品'] },
  { id: 'a3-data-mes', label: 'MES', type: 'data_source', x: 290, y: 195, width: 80, height: 40, description: '制造执行系统数据', icon: 'database', details: ['工序参数', '设备数据', '环境数据'] },
  { id: 'a3-data-wms', label: 'WMS', type: 'data_source', x: 430, y: 200, width: 80, height: 40, description: '仓库管理系统数据', icon: 'database', details: ['物料批次', '入库记录', '库位信息'] },

  { id: 'a3-skill-trace', label: 'traceability_query', type: 'skill', x: 140, y: 290, width: 150, height: 40, description: '追溯查询技能：跨工序正向/反向追溯', icon: 'wrench', details: ['正向追溯', '反向追溯', '树状展开'], dataSources: ['a3-data-qms'] },
  { id: 'a3-skill-correlation', label: 'correlation_analyzer', type: 'skill', x: 350, y: 285, width: 170, height: 40, description: '关联分析技能：缺陷与工艺参数关联', icon: 'wrench', details: ['相关性分析', '回归模型', '显著性检验'], dataSources: ['a3-data-mes'] },
  { id: 'a3-skill-spc', label: 'spc_analysis', type: 'skill', x: 570, y: 290, width: 130, height: 40, description: 'SPC统计过程控制分析', icon: 'wrench', details: ['控制图', '过程能力', '异常模式'], dataSources: ['a3-data-wms'] },

  { id: 'a3-constraint-cpk', label: 'CPK>1.33', type: 'constraint', x: 170, y: 375, width: 110, height: 40, description: '硬约束：过程能力指数必须大于1.33', icon: 'shield', details: ['当前: 1.15', '不满足', '触发预警'] },
  { id: 'a3-constraint-defect', label: '不良率<0.5%', type: 'constraint', x: 330, y: 380, width: 120, height: 40, description: '硬约束：不良率必须小于0.5%', icon: 'shield', details: ['当前: 0.8%', '不满足', '触发预警'] },
  { id: 'a3-constraint-trace', label: '追溯完整度100%', type: 'constraint', x: 500, y: 375, width: 140, height: 40, description: '硬约束：质量追溯数据完整度100%', icon: 'shield', details: ['当前: 100%', '满足', '优先级: P0'] },

  { id: 'a3-sim-impact', label: '影响范围分析', type: 'simulation', x: 300, y: 465, width: 160, height: 48, description: '分析缺陷影响范围：同批次、同供应商、同设备', output: '影响范围：同批次200pcs + 同供应商3批次共600pcs', icon: 'play', details: ['同批次: 200pcs', '同供应商: 600pcs', '同设备: 1500pcs'] },

  { id: 'a3-result', label: '追溯报告', type: 'result', x: 310, y: 555, width: 140, height: 48, description: '输出质量追溯报告和处置建议', output: '建议隔离800pcs产品，调整涂布参数后复测CPK', icon: 'file', details: ['隔离: 800pcs', '调整: 涂布参数', '复测: CPK'] },
];

const AGENT_A3_EDGES: GraphEdge[] = [
  { id: 'e1', source: 'a3-intent', target: 'a3-onto-product', relationType: 'depends_on' },
  { id: 'e2', source: 'a3-intent', target: 'a3-onto-workorder', relationType: 'depends_on' },
  { id: 'e3', source: 'a3-intent', target: 'a3-onto-quality', relationType: 'depends_on' },
  { id: 'e4', source: 'a3-intent', target: 'a3-onto-material', relationType: 'depends_on' },
  { id: 'e5', source: 'a3-intent', target: 'a3-onto-equip', relationType: 'depends_on' },
  { id: 'e6', source: 'a3-onto-product', target: 'a3-data-qms', relationType: 'bound_to' },
  { id: 'e7', source: 'a3-onto-workorder', target: 'a3-data-mes', relationType: 'bound_to' },
  { id: 'e8', source: 'a3-onto-quality', target: 'a3-data-qms', relationType: 'bound_to' },
  { id: 'e9', source: 'a3-onto-material', target: 'a3-data-wms', relationType: 'bound_to' },
  { id: 'e10', source: 'a3-onto-equip', target: 'a3-data-mes', relationType: 'bound_to' },
  { id: 'e11', source: 'a3-data-qms', target: 'a3-skill-trace', relationType: 'flows_to' },
  { id: 'e12', source: 'a3-data-mes', target: 'a3-skill-correlation', relationType: 'flows_to' },
  { id: 'e13', source: 'a3-data-wms', target: 'a3-skill-spc', relationType: 'flows_to' },
  { id: 'e14', source: 'a3-skill-trace', target: 'a3-constraint-cpk', relationType: 'constrains' },
  { id: 'e15', source: 'a3-skill-correlation', target: 'a3-constraint-defect', relationType: 'constrains' },
  { id: 'e16', source: 'a3-skill-spc', target: 'a3-constraint-trace', relationType: 'constrains' },
  { id: 'e17', source: 'a3-constraint-cpk', target: 'a3-sim-impact', relationType: 'depends_on' },
  { id: 'e18', source: 'a3-constraint-defect', target: 'a3-sim-impact', relationType: 'depends_on' },
  { id: 'e19', source: 'a3-constraint-trace', target: 'a3-sim-impact', relationType: 'depends_on' },
  { id: 'e20', source: 'a3-sim-impact', target: 'a3-result', relationType: 'produces' },
];

const AGENT_GRAPHS: Record<string, { nodes: GraphNode[]; edges: GraphEdge[] }> = {
  a1: { nodes: AGENT_A1_NODES, edges: AGENT_A1_EDGES },
  a2: { nodes: AGENT_A2_NODES, edges: AGENT_A2_EDGES },
  a3: { nodes: AGENT_A3_NODES, edges: AGENT_A3_EDGES },
};

// ============================================================
// 力导向知识关系网络图 —— 节点与边样式配置
// ============================================================

const NODE_TYPE_COLORS: Record<GraphNodeType, string> = {
  intent:     '#722ED1',
  ontology:   '#1677FF',
  attribute:  '#1677FF',
  data_source:'#13C2C2',
  skill:      '#FA8C16',
  constraint: '#F5222D',
  simulation: '#2F54EB',
  result:     '#52C41A',
};

const NODE_TYPE_CONFIG: Record<GraphNodeType, { color: string; bg: string; label: string; icon: string }> = {
  intent:     { color: '#722ED1', bg: '#F3E8FF', label: '意图', icon: 'brain' },
  ontology:   { color: '#1677FF', bg: '#DBEAFE', label: '本体', icon: 'database' },
  attribute:  { color: '#1677FF', bg: '#E6F4FF', label: '属性', icon: 'tag' },
  data_source:{ color: '#13C2C2', bg: '#CFFAFE', label: '数据源', icon: 'database' },
  skill:      { color: '#FA8C16', bg: '#FEF3C7', label: '技能', icon: 'wrench' },
  constraint: { color: '#F5222D', bg: '#FEE2E2', label: '约束', icon: 'shield' },
  simulation: { color: '#2F54EB', bg: '#E0E7FF', label: '推演', icon: 'play' },
  result:     { color: '#52C41A', bg: '#D1FAE5', label: '结果', icon: 'file' },
};

const EDGE_STYLES: Record<EdgeRelationType, { color: string; opacity: number; width: number; dashed: boolean; arrow: boolean; flow: boolean }> = {
  has_attribute: { color: '#94A3B8', opacity: 0.4, width: 1,   dashed: true,  arrow: false, flow: false },
  bound_to:      { color: '#13C2C2', opacity: 0.5, width: 1.5, dashed: true,  arrow: true,  flow: false },
  consumes:      { color: '#FA8C16', opacity: 0.5, width: 1.5, dashed: false, arrow: true,  flow: false },
  constrains:    { color: '#EF4444', opacity: 0.5, width: 1.5, dashed: false, arrow: true,  flow: false },
  produces:      { color: '#10B981', opacity: 0.5, width: 1.5, dashed: false, arrow: true,  flow: false },
  depends_on:    { color: '#94A3B8', opacity: 0.4, width: 1,   dashed: false, arrow: true,  flow: false },
  flows_to:      { color: '#13C2C2', opacity: 0.6, width: 2,   dashed: false, arrow: true,  flow: true },
};

// Node dimensions for rendering
const NODE_DIMS: Record<GraphNodeType, { w: number; h: number }> = {
  intent:      { w: 140, h: 44 },
  ontology:    { w: 120, h: 40 },
  attribute:   { w: 80,  h: 24 },
  data_source: { w: 100, h: 36 },
  skill:       { w: 140, h: 40 },
  constraint:  { w: 130, h: 40 },
  simulation:  { w: 150, h: 48 },
  result:      { w: 140, h: 48 },
};

/** Draw rounded rectangle path */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

/** Draw arrow head */
function drawArrow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  angle: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, -size * 0.5);
  ctx.lineTo(-size, size * 0.5);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

// ============================================================
// 力导向引擎接口
// ============================================================

interface SimNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  pinned: boolean;
  type: GraphNodeType;
  label: string;
  width: number;
  height: number;
  description: string;
  details?: string[];
  output?: string;
}

interface SimEdge {
  id: string;
  source: string;
  target: string;
  relationType: EdgeRelationType;
}

function getNodeMass(type: GraphNodeType): number {
  if (type === 'ontology') return 3;
  if (type === 'skill') return 2;
  return 1;
}

function buildSimGraph(activeAgentId: string): { nodes: SimNode[]; edges: SimEdge[] } {
  const raw = AGENT_GRAPHS[activeAgentId] || AGENT_GRAPHS.a1;
  const nodeMap = new Map<string, SimNode>();
  const simNodes: SimNode[] = [];

  // Convert raw nodes to sim nodes
  for (const n of raw.nodes) {
    const dims = NODE_DIMS[n.type];
    const simNode: SimNode = {
      id: n.id,
      x: n.x,
      y: n.y,
      vx: 0,
      vy: 0,
      mass: getNodeMass(n.type),
      pinned: false,
      type: n.type,
      label: n.label,
      width: dims.w,
      height: dims.h,
      description: n.description,
      details: n.details,
      output: n.output,
    };
    simNodes.push(simNode);
    nodeMap.set(n.id, simNode);
  }

  // Add attribute nodes for each ontology
  let attrIdx = 0;
  for (const n of raw.nodes) {
    if (n.type === 'ontology' && n.attributes && n.attributes.length > 0) {
      for (const attr of n.attributes) {
        const attrId = `${n.id}-attr-${attrIdx++}`;
        const attrNode: SimNode = {
          id: attrId,
          x: n.x + (Math.random() - 0.5) * 60,
          y: n.y + 60 + Math.random() * 30,
          vx: 0,
          vy: 0,
          mass: 1,
          pinned: false,
          type: 'attribute',
          label: attr,
          width: NODE_DIMS.attribute.w,
          height: NODE_DIMS.attribute.h,
          description: `${n.label} 的属性: ${attr}`,
        };
        simNodes.push(attrNode);
        nodeMap.set(attrId, attrNode);
      }
    }
  }

  // Build edges
  const simEdges: SimEdge[] = [];

  // Original edges
  for (const e of raw.edges) {
    simEdges.push({
      id: e.id,
      source: e.source,
      target: e.target,
      relationType: e.relationType || 'depends_on',
    });
  }

  // has_attribute edges
  attrIdx = 0;
  for (const n of raw.nodes) {
    if (n.type === 'ontology' && n.attributes && n.attributes.length > 0) {
      for (const _attr of n.attributes) {
        const attrId = `${n.id}-attr-${attrIdx++}`;
        simEdges.push({
          id: `attr-${attrId}`,
          source: n.id,
          target: attrId,
          relationType: 'has_attribute',
        });
      }
    }
  }

  // consumes edges: skill -> data_source
  for (const n of raw.nodes) {
    if (n.type === 'skill' && n.dataSources && n.dataSources.length > 0) {
      for (const dsId of n.dataSources) {
        simEdges.push({
          id: `consumes-${n.id}-${dsId}`,
          source: n.id,
          target: dsId,
          relationType: 'consumes',
        });
      }
    }
  }

  return { nodes: simNodes, edges: simEdges };
}

// ============================================================
// BatteryReasoningGraph —— 力导向知识关系网络图
// ============================================================

function BatteryReasoningGraph({ activeAgentId }: { activeAgentId: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const animationRef = React.useRef<number>(0);
  const simRef = React.useRef<{ nodes: SimNode[]; edges: SimEdge[] } | null>(null);
  const frameCountRef = React.useRef(0);
  const convergedRef = React.useRef(false);
  const flowParticlesRef = React.useRef<{ edgeId: string; t: number; speed: number }[]>([]);
  const entranceProgressRef = React.useRef(0);
  const hoverNodeRef = React.useRef<string | null>(null);
  const pinnedNodesRef = React.useRef<Set<string>>(new Set());
  const [tooltipPos, setTooltipPos] = React.useState<{ x: number; y: number; node: SimNode } | null>(null);

  // View transform
  const viewRef = React.useRef({ panX: 0, panY: 0, zoom: 1, targetZoom: 1 });
  const isDraggingRef = React.useRef(false);
  const isPanningRef = React.useRef(false);
  const lastMouseRef = React.useRef<{ x: number; y: number } | null>(null);
  const [cursorStyle, setCursorStyle] = React.useState('grab');

  const CSS_W = 840;
  const CSS_H = 640;

  // Build simulation graph when agent changes
  React.useEffect(() => {
    const sim = buildSimGraph(activeAgentId);
    // Initialize positions around center with random spread
    const cx = CSS_W / 2;
    const cy = CSS_H / 2;
    for (const n of sim.nodes) {
      n.x = cx + (Math.random() - 0.5) * 200;
      n.y = cy + (Math.random() - 0.5) * 200;
      n.vx = 0;
      n.vy = 0;
      n.pinned = false;
    }
    simRef.current = sim;
    frameCountRef.current = 0;
    convergedRef.current = false;
    entranceProgressRef.current = 0;
    pinnedNodesRef.current = new Set();
    hoverNodeRef.current = null;
    setTooltipPos(null);

    // Initialize flow particles for flows_to edges
    const particles: { edgeId: string; t: number; speed: number }[] = [];
    for (const edge of sim.edges) {
      if (EDGE_STYLES[edge.relationType].flow) {
        particles.push({ edgeId: edge.id, t: Math.random(), speed: 0.003 + Math.random() * 0.004 });
      }
    }
    flowParticlesRef.current = particles;
  }, [activeAgentId]);

  // Force-directed simulation step
  const stepSimulation = React.useCallback(() => {
    const sim = simRef.current;
    if (!sim) return;
    if (convergedRef.current) return;

    const nodes = sim.nodes;
    const edges = sim.edges;
    const kRepulse = 150;
    const kSpring = 0.05;
    const kCenter = 0.01;
    const idealLength = 120;
    const cx = CSS_W / 2;
    const cy = CSS_H / 2;

    // Temperature (cooling)
    const temp = Math.max(0.01, 1 - frameCountRef.current / 300);

    // Repulsion (Coulomb)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (kRepulse * a.mass * b.mass) / (dist * dist);
        const fx = (dx / dist) * force * temp;
        const fy = (dy / dist) * force * temp;
        if (!a.pinned) { a.vx -= fx / a.mass; a.vy -= fy / a.mass; }
        if (!b.pinned) { b.vx += fx / b.mass; b.vy += fy / b.mass; }
      }
    }

    // Spring attraction (edges)
    for (const edge of edges) {
      const src = nodes.find(n => n.id === edge.source);
      const tgt = nodes.find(n => n.id === edge.target);
      if (!src || !tgt) continue;
      const dx = tgt.x - src.x;
      const dy = tgt.y - src.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = kSpring * (dist - idealLength) * temp;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      if (!src.pinned) { src.vx += fx / src.mass; src.vy += fy / src.mass; }
      if (!tgt.pinned) { tgt.vx -= fx / tgt.mass; tgt.vy -= fy / tgt.mass; }
    }

    // Center gravity
    for (const n of nodes) {
      if (n.pinned) continue;
      n.vx += (cx - n.x) * kCenter * temp;
      n.vy += (cy - n.y) * kCenter * temp;
    }

    // Velocity damping + position update
    let totalVelocity = 0;
    for (const n of nodes) {
      if (n.pinned) continue;
      n.vx *= 0.9;
      n.vy *= 0.9;
      n.x += n.vx;
      n.y += n.vy;
      totalVelocity += Math.sqrt(n.vx * n.vx + n.vy * n.vy);
    }

    frameCountRef.current++;

    // Convergence check
    if (frameCountRef.current > 300 || totalVelocity < 0.5) {
      convergedRef.current = true;
    }
  }, []);

  // Canvas rendering
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CSS_W * dpr;
    canvas.height = CSS_H * dpr;
    canvas.style.width = CSS_W + 'px';
    canvas.style.height = CSS_H + 'px';
    ctx.scale(dpr, dpr);

    const toScreen = (wx: number, wy: number) => {
      const v = viewRef.current;
      return {
        x: (wx - CSS_W / 2) * v.zoom + CSS_W / 2 + v.panX,
        y: (wy - CSS_H / 2) * v.zoom + CSS_H / 2 + v.panY,
      };
    };

    const render = () => {
      const sim = simRef.current;
      if (!sim) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }

      // Run simulation step
      stepSimulation();

      // Entrance animation
      if (entranceProgressRef.current < 1) {
        entranceProgressRef.current = Math.min(1, entranceProgressRef.current + 0.02);
      }

      // Smooth zoom
      const v = viewRef.current;
      v.zoom += (v.targetZoom - v.zoom) * 0.1;

      const nodes = sim.nodes;
      const edges = sim.edges;
      const hoveredId = hoverNodeRef.current;
      const pinnedIds = pinnedNodesRef.current;

      // Compute adjacency for highlighting
      const adjMap = new Map<string, Set<string>>();
      for (const n of nodes) adjMap.set(n.id, new Set());
      for (const e of edges) {
        adjMap.get(e.source)?.add(e.target);
        adjMap.get(e.target)?.add(e.source);
      }
      const isAdjacent = (a: string, b: string) => adjMap.get(a)?.has(b) || false;

      // Clear background
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, CSS_W, CSS_H);

      // Dot grid background
      ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
      const dotSpacing = 20 * v.zoom;
      const dotOffsetX = ((v.panX % dotSpacing) + dotSpacing) % dotSpacing;
      const dotOffsetY = ((v.panY % dotSpacing) + dotSpacing) % dotSpacing;
      const dotR = Math.max(0.5, 0.6 * v.zoom);
      for (let gx = dotOffsetX; gx < CSS_W; gx += dotSpacing) {
        for (let gy = dotOffsetY; gy < CSS_H; gy += dotSpacing) {
          ctx.beginPath();
          ctx.arc(gx, gy, dotR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const entrance = 1 - Math.pow(1 - entranceProgressRef.current, 3);

      // ===== Draw edges =====
      for (const edge of edges) {
        const src = nodes.find(n => n.id === edge.source);
        const tgt = nodes.find(n => n.id === edge.target);
        if (!src || !tgt) continue;

        const style = EDGE_STYLES[edge.relationType];
        const s1 = toScreen(src.x, src.y);
        const s2 = toScreen(tgt.x, tgt.y);

        // Determine if edge should be highlighted
        const isHoveredEdge = hoveredId && (hoveredId === src.id || hoveredId === tgt.id);
        const isDimmed = hoveredId && !isHoveredEdge && !isAdjacent(hoveredId, src.id) && !isAdjacent(hoveredId, tgt.id);

        const alpha = isDimmed ? 0.08 : isHoveredEdge ? style.opacity * 1.8 : style.opacity;
        const lineWidth = isHoveredEdge ? style.width * 1.8 : style.width;

        // Compute intersection with node bounds
        const dx = s2.x - s1.x;
        const dy = s2.y - s1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = dx / dist;
        const ny = dy / dist;

        const srcW = src.width * v.zoom * 0.5;
        const srcH = src.height * v.zoom * 0.5;
        const tgtW = tgt.width * v.zoom * 0.5;
        const tgtH = tgt.height * v.zoom * 0.5;

        // Simple bounding box intersection
        const startX = s1.x + nx * srcW;
        const startY = s1.y + ny * srcH;
        const endX = s2.x - nx * (tgtW + (style.arrow ? 10 * v.zoom : 0));
        const endY = s2.y - ny * (tgtH + (style.arrow ? 10 * v.zoom : 0));

        ctx.save();
        ctx.globalAlpha = alpha * entrance;
        ctx.strokeStyle = style.color;
        ctx.lineWidth = lineWidth * v.zoom;
        ctx.lineCap = 'round';
        if (style.dashed) {
          ctx.setLineDash([4 * v.zoom, 4 * v.zoom]);
        }

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Arrow
        if (style.arrow) {
          const angle = Math.atan2(dy, dx);
          drawArrow(ctx, endX, endY, angle, 6 * v.zoom, style.color);
        }

        ctx.restore();

        // Store for flow particles
        (edge as any)._line = { sx: startX, sy: startY, ex: endX, ey: endY };
      }

      // ===== Flow particles =====
      const particles = flowParticlesRef.current;
      for (const p of particles) {
        const edge = edges.find(e => e.id === p.edgeId);
        if (!edge) continue;
        const line = (edge as any)._line;
        if (!line) continue;

        p.t += p.speed;
        if (p.t > 1) p.t = 0;

        const px2 = line.sx + (line.ex - line.sx) * p.t;
        const py2 = line.sy + (line.ey - line.sy) * p.t;

        const isDimmed = hoveredId && hoveredId !== edge.source && hoveredId !== edge.target &&
          !isAdjacent(hoveredId, edge.source) && !isAdjacent(hoveredId, edge.target);

        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.1 : 0.9 * entrance;
        ctx.beginPath();
        ctx.arc(px2, py2, Math.max(2, 3 * v.zoom), 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px2, py2, Math.max(1.5, 2 * v.zoom), 0, Math.PI * 2);
        ctx.fillStyle = EDGE_STYLES.flows_to.color;
        ctx.fill();
        ctx.restore();
      }

      // ===== Draw nodes =====
      for (const node of nodes) {
        const isHovered = hoveredId === node.id;
        const isPinned = pinnedIds.has(node.id);
        const isDimmed = hoveredId && hoveredId !== node.id && !isAdjacent(hoveredId, node.id);

        const pos = toScreen(node.x, node.y);
        const nw = node.width * v.zoom;
        const nh = node.height * v.zoom;
        const halfW = nw / 2;
        const halfH = nh / 2;

        // Entrance: scale from center + fade in
        const nodeScale = 0.5 + 0.5 * entrance;
        const nodeOpacity = entrance;
        const hoverScale = isHovered ? 1.1 : 1;
        const finalScale = nodeScale * hoverScale;
        const finalW = nw * finalScale / nodeScale;
        const finalH = nh * finalScale / nodeScale;
        const finalHalfW = finalW / 2;
        const finalHalfH = finalH / 2;

        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.15 : nodeOpacity;

        const color = NODE_TYPE_COLORS[node.type];
        const r = node.type === 'attribute' ? 4 * v.zoom : 8 * v.zoom;

        // Shadow
        ctx.save();
        ctx.shadowColor = isHovered ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.08)';
        ctx.shadowBlur = isHovered ? 16 * v.zoom : 6 * v.zoom;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = isHovered ? 8 * v.zoom : 3 * v.zoom;

        // Card background
        if (node.type === 'attribute') {
          ctx.fillStyle = '#E6F4FF';
        } else {
          ctx.fillStyle = '#FFFFFF';
        }
        roundRect(ctx, pos.x - finalHalfW, pos.y - finalHalfH, finalW, finalH, r);
        ctx.fill();
        ctx.restore();

        // Left color bar (4px) for non-attribute nodes
        const barW = node.type !== 'attribute' ? Math.max(2, 4 * v.zoom) : 0;
        if (node.type !== 'attribute') {
          ctx.fillStyle = color;
          roundRect(ctx, pos.x - finalHalfW, pos.y - finalHalfH, barW, finalH, Math.min(r, barW / 2));
          ctx.fill();
        }

        // Pinned indicator
        if (isPinned) {
          ctx.save();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2 * v.zoom;
          roundRect(ctx, pos.x - finalHalfW - 2 * v.zoom, pos.y - finalHalfH - 2 * v.zoom, finalW + 4 * v.zoom, finalH + 4 * v.zoom, r + 2 * v.zoom);
          ctx.stroke();
          ctx.restore();
        }

        // Hover glow
        if (isHovered) {
          ctx.save();
          ctx.strokeStyle = hexToRgba(color, 0.4);
          ctx.lineWidth = 2 * v.zoom;
          roundRect(ctx, pos.x - finalHalfW - 1 * v.zoom, pos.y - finalHalfH - 1 * v.zoom, finalW + 2 * v.zoom, finalH + 2 * v.zoom, r + 1 * v.zoom);
          ctx.stroke();
          ctx.restore();
        }

        // Label
        ctx.save();
        const fontSize = node.type === 'attribute'
          ? Math.max(8, 10 * v.zoom)
          : Math.max(10, 12 * v.zoom);
        ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = node.type === 'attribute' ? color : '#1F2937';

        let displayLabel = node.label;
        const maxTextW = finalW - (node.type === 'attribute' ? 8 * v.zoom : 16 * v.zoom);
        if (ctx.measureText(displayLabel).width > maxTextW) {
          while (ctx.measureText(displayLabel + '...').width > maxTextW && displayLabel.length > 0) {
            displayLabel = displayLabel.slice(0, -1);
          }
          displayLabel += '...';
        }
        ctx.fillText(displayLabel, pos.x + (node.type === 'attribute' ? 0 : 2 * v.zoom), pos.y);
        ctx.restore();

        // Icon for non-attribute nodes (first letter as icon)
        if (node.type !== 'attribute') {
          ctx.save();
          const iconSize = Math.max(10, 14 * v.zoom);
          const iconX = pos.x - finalHalfW + barW + 6 * v.zoom;
          const iconY = pos.y;
          ctx.font = `600 ${iconSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = color;
          const iconChar = NODE_TYPE_CONFIG[node.type].icon === 'database' ? 'D'
            : NODE_TYPE_CONFIG[node.type].icon === 'wrench' ? 'S'
            : NODE_TYPE_CONFIG[node.type].icon === 'shield' ? 'C'
            : NODE_TYPE_CONFIG[node.type].icon === 'play' ? 'P'
            : NODE_TYPE_CONFIG[node.type].icon === 'file' ? 'R'
            : NODE_TYPE_CONFIG[node.type].icon === 'brain' ? 'I'
            : 'N';
          ctx.fillText(iconChar, iconX, iconY);
          ctx.restore();
        }

        ctx.restore();
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationRef.current);
  }, [stepSimulation]);

  // Mouse event handlers
  const getMouseWorldPos = (mx: number, my: number) => {
    const v = viewRef.current;
    return {
      x: (mx - CSS_W / 2 - v.panX) / v.zoom + CSS_W / 2,
      y: (my - CSS_H / 2 - v.panY) / v.zoom + CSS_H / 2,
    };
  };

  const findNodeAt = (mx: number, my: number): SimNode | null => {
    const sim = simRef.current;
    if (!sim) return null;
    const v = viewRef.current;
    for (let i = sim.nodes.length - 1; i >= 0; i--) {
      const n = sim.nodes[i];
      const pos = {
        x: (n.x - CSS_W / 2) * v.zoom + CSS_W / 2 + v.panX,
        y: (n.y - CSS_H / 2) * v.zoom + CSS_H / 2 + v.panY,
      };
      const nw = n.width * v.zoom;
      const nh = n.height * v.zoom;
      if (mx >= pos.x - nw / 2 && mx <= pos.x + nw / 2 && my >= pos.y - nh / 2 && my <= pos.y + nh / 2) {
        return n;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const node = findNodeAt(mx, my);

    if (node) {
      // Toggle pin
      const pinned = pinnedNodesRef.current;
      if (pinned.has(node.id)) {
        pinned.delete(node.id);
        node.pinned = false;
      } else {
        pinned.add(node.id);
        node.pinned = true;
      }
      pinnedNodesRef.current = new Set(pinned);
      // Wake up simulation briefly
      convergedRef.current = false;
      frameCountRef.current = Math.min(frameCountRef.current, 200);
    } else {
      isPanningRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      setCursorStyle('grabbing');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Pan handling
    if (isPanningRef.current && lastMouseRef.current) {
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      viewRef.current.panX += dx;
      viewRef.current.panY += dy;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Hover detection
    const node = findNodeAt(mx, my);
    if (node) {
      hoverNodeRef.current = node.id;
      setTooltipPos({ x: mx + 16, y: my - 8, node });
      setCursorStyle('pointer');
    } else {
      hoverNodeRef.current = null;
      setTooltipPos(null);
      setCursorStyle(isPanningRef.current ? 'grabbing' : 'grab');
    }
  };

  const handleMouseUp = () => {
    isPanningRef.current = false;
    lastMouseRef.current = null;
    setCursorStyle('grab');
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const v = viewRef.current;
    const oldZoom = v.zoom;
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    let newZoom = oldZoom * zoomFactor;
    newZoom = Math.max(0.3, Math.min(3, newZoom));
    const worldX = (mx - CSS_W / 2 - v.panX) / oldZoom + CSS_W / 2;
    const worldY = (my - CSS_H / 2 - v.panY) / oldZoom + CSS_H / 2;
    v.panX = mx - CSS_W / 2 - (worldX - CSS_W / 2) * newZoom;
    v.panY = my - CSS_H / 2 - (worldY - CSS_H / 2) * newZoom;
    v.targetZoom = newZoom;
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const node = findNodeAt(mx, my);
    if (!node) {
      // Reset view
      viewRef.current = { panX: 0, panY: 0, zoom: 1, targetZoom: 1 };
    }
  };

  const handleMouseLeave = () => {
    hoverNodeRef.current = null;
    setTooltipPos(null);
    isPanningRef.current = false;
    setCursorStyle('grab');
  };

  // Stats
  const sim = simRef.current;
  const skillCount = sim ? sim.nodes.filter(n => n.type === 'skill').length : 0;
  const dataCount = sim ? sim.nodes.filter(n => n.type === 'data_source').length : 0;
  const ontologyCount = sim ? sim.nodes.filter(n => n.type === 'ontology').length : 0;
  const totalNodes = sim ? sim.nodes.length : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch size={16} className="text-indigo-600" />
          <span className="text-sm font-bold text-gray-900">Agent 推演知识图谱</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="flex items-center gap-2 flex-wrap">
            {(['ontology', 'attribute', 'data_source', 'skill', 'constraint', 'result'] as GraphNodeType[]).map(type => (
              <div key={type} className="flex items-center gap-1">
                <div className="w-2 h-3 rounded-sm" style={{ backgroundColor: NODE_TYPE_CONFIG[type].color }} />
                <span className="text-[10px] text-gray-500">{NODE_TYPE_CONFIG[type].label}</span>
              </div>
            ))}
          </div>
          <span className="text-[10px] text-gray-400">力导向布局</span>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden relative" style={{ height: CSS_H }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
          style={{ width: CSS_W, height: CSS_H, cursor: cursorStyle }}
        />

        {/* Tooltip */}
        {tooltipPos && (
          <div
            className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-3 pointer-events-none"
            style={{
              left: Math.min(tooltipPos.x, CSS_W - 300),
              top: Math.max(tooltipPos.y - 80, 4),
              maxWidth: 280,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 rounded-sm" style={{ backgroundColor: NODE_TYPE_COLORS[tooltipPos.node.type] }} />
              <span className="text-xs font-bold text-gray-900">{tooltipPos.node.label}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: NODE_TYPE_COLORS[tooltipPos.node.type] }}>
                {NODE_TYPE_CONFIG[tooltipPos.node.type].label}
              </span>
              {pinnedNodesRef.current.has(tooltipPos.node.id) && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">已固定</span>
              )}
            </div>
            <p className="text-[11px] text-gray-600 mb-2 leading-relaxed">{tooltipPos.node.description}</p>
            {tooltipPos.node.details && tooltipPos.node.details.length > 0 && (
              <div className="space-y-1">
                {tooltipPos.node.details.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-gray-400" />
                    <span className="text-[10px] text-gray-500">{d}</span>
                  </div>
                ))}
              </div>
            )}
            {tooltipPos.node.output && (
              <div className="mt-2 p-1.5 bg-emerald-50 border border-emerald-200 rounded text-[10px] text-emerald-700">
                {tooltipPos.node.output}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '调用技能', value: `${skillCount}个`, icon: Wrench, color: 'text-amber-600 bg-amber-50' },
          { label: '数据源', value: `${dataCount}个`, icon: Database, color: 'text-cyan-600 bg-cyan-50' },
          { label: '本体实体', value: `${ontologyCount}个`, icon: Layers, color: 'text-blue-600 bg-blue-50' },
          { label: '图谱节点', value: `${totalNodes}个`, icon: GitBranch, color: 'text-emerald-600 bg-emerald-50' },
        ].map(stat => (
          <div key={stat.label} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <div className={`p-1.5 rounded-md ${stat.color}`}><stat.icon size={14} /></div>
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

// ============================================================
// 颜色工具函数
// ============================================================

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function lightenColor(hex: string, percent: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const newR = Math.min(255, Math.round(r + (255 - r) * percent / 100));
  const newG = Math.min(255, Math.round(g + (255 - g) * percent / 100));
  const newB = Math.min(255, Math.round(b + (255 - b) * percent / 100));
  return `rgb(${newR},${newG},${newB})`;
}

function darkenColor(hex: string, percent: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const newR = Math.max(0, Math.round(r * (1 - percent / 100)));
  const newG = Math.max(0, Math.round(g * (1 - percent / 100)));
  const newB = Math.max(0, Math.round(b * (1 - percent / 100)));
  return `rgb(${newR},${newG},${newB})`;
}
