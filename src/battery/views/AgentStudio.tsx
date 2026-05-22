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
                <BatteryReasoningGraph activeAgentId={activeAgentId} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 锂电版推演知识图谱组件 —— 网络图可视化
// ============================================================

type GraphNodeType = 'intent' | 'ontology' | 'data' | 'skill' | 'constraint' | 'simulation' | 'result';

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
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

const NODE_TYPE_CONFIG: Record<GraphNodeType, { color: string; bg: string; label: string }> = {
  intent:     { color: '#7C3AED', bg: '#F3E8FF', label: '意图' },
  ontology:   { color: '#2563EB', bg: '#DBEAFE', label: '本体' },
  data:       { color: '#0891B2', bg: '#CFFAFE', label: '数据' },
  skill:      { color: '#D97706', bg: '#FEF3C7', label: '技能' },
  constraint: { color: '#DC2626', bg: '#FEE2E2', label: '约束' },
  simulation: { color: '#4F46E5', bg: '#E0E7FF', label: '推演' },
  result:     { color: '#059669', bg: '#D1FAE5', label: '结果' },
};

// Agent a1: 产销匹配推演Agent
const AGENT_A1_NODES: GraphNode[] = [
  // Layer 0: Intent (top center)
  { id: 'a1-intent', label: '产销匹配意图', type: 'intent', x: 400, y: 30, width: 140, height: 44, description: '解析"Q3产能瓶颈应对"意图，提取时间维度、约束条件、决策目标', output: '意图: 产能优化 | 时间: Q3 | 约束: 准时交付>95%', icon: 'brain', details: ['用户输入文本'] },

  // Layer 1: Ontologies (spread left/right)
  { id: 'a1-onto-prodline', label: 'ProductionLine', type: 'ontology', x: 120, y: 120, width: 120, height: 40, description: '产线本体：产能、状态、OEE、节拍等属性', icon: 'database', details: ['产能: 1200pcs/day', 'OEE: 85%', '状态: 运行中'] },
  { id: 'a1-onto-workorder', label: 'WorkOrder', type: 'ontology', x: 280, y: 110, width: 110, height: 40, description: '工单本体：工序、数量、优先级、交期', icon: 'database', details: ['工单数: 47', '优先级: 高', '交期: 2024-08-15'] },
  { id: 'a1-onto-equip', label: 'Equipment', type: 'ontology', x: 430, y: 115, width: 100, height: 40, description: '设备本体：设备编号、类型、健康度', icon: 'database', details: ['设备数: 28', '健康度: 92%', '维保状态: 正常'] },
  { id: 'a1-onto-material', label: 'Material', type: 'ontology', x: 570, y: 110, width: 100, height: 40, description: '物料本体：库存量、采购周期、供应商', icon: 'database', details: ['库存: 5000pcs', '采购周期: 7天', '供应商: 12家'] },
  { id: 'a1-onto-sales', label: 'SalesOrder', type: 'ontology', x: 700, y: 120, width: 110, height: 40, description: '销售订单本体：客户、数量、交期、优先级', icon: 'database', details: ['订单数: 23', '客户: A类', '交付窗口: Q3'] },

  // Layer 2: Data sources
  { id: 'a1-data-mes', label: 'MES', type: 'data', x: 180, y: 200, width: 80, height: 40, description: '制造执行系统实时数据', icon: 'arrow', details: ['产线实时状态', '工单进度', '质量数据'] },
  { id: 'a1-data-erp', label: 'ERP', type: 'data', x: 320, y: 195, width: 80, height: 40, description: '企业资源计划系统数据', icon: 'arrow', details: ['销售订单', '物料库存', '财务数据'] },
  { id: 'a1-data-scada', label: 'SCADA', type: 'data', x: 480, y: 200, width: 90, height: 40, description: '数据采集与监控系统', icon: 'arrow', details: ['设备遥测', '温度/压力', '能耗数据'] },

  // Layer 3: Skills (middle)
  { id: 'a1-skill-capacity', label: 'capacity_planning', type: 'skill', x: 140, y: 290, width: 140, height: 40, description: '产能规划技能：计算各产线产能利用率', icon: 'wrench', details: ['瓶颈分析', '产能平衡', '负载预测'] },
  { id: 'a1-skill-scheduling', label: 'production_scheduling', type: 'skill', x: 330, y: 285, width: 160, height: 40, description: '生产排程优化技能：智能排产算法', icon: 'wrench', details: ['遗传算法', '约束满足', '多目标优化'] },
  { id: 'a1-skill-oee', label: 'oee_optimizer', type: 'skill', x: 540, y: 290, width: 130, height: 40, description: 'OEE优化技能：设备综合效率提升', icon: 'wrench', details: ['停机分析', '速度损失', '质量损失'] },

  // Layer 4: Constraints
  { id: 'a1-constraint-capacity', label: '产能利用率>96%', type: 'constraint', x: 200, y: 370, width: 140, height: 40, description: '硬约束：产能利用率必须大于96%', icon: 'shield', details: ['当前: 78%', '缺口: 18%', '优先级: P0'] },
  { id: 'a1-constraint-delivery', label: '准时交付率>95%', type: 'constraint', x: 400, y: 375, width: 140, height: 40, description: '硬约束：订单准时交付率必须大于95%', icon: 'shield', details: ['当前: 89%', '缺口: 6%', '优先级: P0'] },
  { id: 'a1-constraint-cost', label: '成本最优', type: 'constraint', x: 580, y: 370, width: 100, height: 40, description: '软约束：在满足硬约束前提下成本最优', icon: 'shield', details: ['加班成本', '调线成本', '外包成本'] },

  // Layer 5: Simulation
  { id: 'a1-sim-des', label: '离散事件仿真', type: 'simulation', x: 320, y: 460, width: 160, height: 48, description: 'DES仿真引擎：生成多套方案并预测KPI', output: '加班: 成本+8% 准交+3% | 调线: 成本+2% 准交+1%', icon: 'play', details: ['方案数: 3', '仿真时长: 30天', '置信度: 91%'] },

  // Layer 6: Result (bottom center)
  { id: 'a1-result', label: '最优方案', type: 'result', x: 330, y: 550, width: 140, height: 48, description: '推荐调线方案：成本最低且满足交付约束', output: '推荐调线方案：成本最低且满足交付约束，置信度91%', icon: 'file', details: ['成本增加: +2%', '准交率: 96.5%', '执行周期: 3天'] },
];

const AGENT_A1_EDGES: GraphEdge[] = [
  // Intent -> Ontologies
  { id: 'e1', source: 'a1-intent', target: 'a1-onto-prodline' },
  { id: 'e2', source: 'a1-intent', target: 'a1-onto-workorder' },
  { id: 'e3', source: 'a1-intent', target: 'a1-onto-equip' },
  { id: 'e4', source: 'a1-intent', target: 'a1-onto-material' },
  { id: 'e5', source: 'a1-intent', target: 'a1-onto-sales' },
  // Ontologies -> Data
  { id: 'e6', source: 'a1-onto-prodline', target: 'a1-data-mes' },
  { id: 'e7', source: 'a1-onto-workorder', target: 'a1-data-mes' },
  { id: 'e8', source: 'a1-onto-equip', target: 'a1-data-scada' },
  { id: 'e9', source: 'a1-onto-material', target: 'a1-data-erp' },
  { id: 'e10', source: 'a1-onto-sales', target: 'a1-data-erp' },
  // Data -> Skills
  { id: 'e11', source: 'a1-data-mes', target: 'a1-skill-capacity' },
  { id: 'e12', source: 'a1-data-erp', target: 'a1-skill-scheduling' },
  { id: 'e13', source: 'a1-data-scada', target: 'a1-skill-oee' },
  // Skills -> Constraints
  { id: 'e14', source: 'a1-skill-capacity', target: 'a1-constraint-capacity' },
  { id: 'e15', source: 'a1-skill-scheduling', target: 'a1-constraint-delivery' },
  { id: 'e16', source: 'a1-skill-oee', target: 'a1-constraint-cost' },
  // Constraints -> Simulation
  { id: 'e17', source: 'a1-constraint-capacity', target: 'a1-sim-des' },
  { id: 'e18', source: 'a1-constraint-delivery', target: 'a1-sim-des' },
  { id: 'e19', source: 'a1-constraint-cost', target: 'a1-sim-des' },
  // Simulation -> Result
  { id: 'e20', source: 'a1-sim-des', target: 'a1-result' },
];

// Agent a2: 设备异常诊断Agent
const AGENT_A2_NODES: GraphNode[] = [
  { id: 'a2-intent', label: '设备异常诊断', type: 'intent', x: 400, y: 30, width: 140, height: 44, description: '解析"产线设备异常诊断"意图，识别异常类型、设备编号', output: '意图: 异常诊断 | 设备: L3-涂布机-02 | 类型: 温度异常', icon: 'brain', details: ['用户输入文本'] },

  { id: 'a2-onto-equip', label: 'Equipment', type: 'ontology', x: 130, y: 120, width: 110, height: 40, description: '设备本体：设备编号、类型、健康度、维保记录', icon: 'database', details: ['设备: L3-涂布机-02', '类型: 涂布', '运行时长: 8760h'] },
  { id: 'a2-onto-prodline', label: 'ProductionLine', type: 'ontology', x: 290, y: 110, width: 120, height: 40, description: '产线本体：产线编号、工序、产能', icon: 'database', details: ['产线: L3', '工序: 涂布', '节拍: 120pcs/h'] },
  { id: 'a2-onto-quality', label: 'QualityCheck', type: 'ontology', x: 450, y: 115, width: 120, height: 40, description: '质量检测本体：检测项、标准值、实测值', icon: 'database', details: ['检测项: 温度', '标准: 80±2°C', '实测: 87.3°C'] },
  { id: 'a2-onto-material', label: 'Material', type: 'ontology', x: 610, y: 110, width: 100, height: 40, description: '物料本体：浆料批次、供应商、入库时间', icon: 'database', details: ['浆料批次: SJ-240815', '供应商: B公司', '入库: 2024-08-10'] },
  { id: 'a2-onto-process', label: 'Process', type: 'ontology', x: 740, y: 120, width: 100, height: 40, description: '工艺本体：工艺参数、标准配方', icon: 'database', details: ['工艺: 负极涂布', '速度: 12m/min', '厚度: 120μm'] },

  { id: 'a2-data-scada', label: 'SCADA', type: 'data', x: 160, y: 200, width: 90, height: 40, description: 'SCADA实时数据流', icon: 'arrow', details: ['温度遥测', '压力数据', '振动频谱'] },
  { id: 'a2-data-iot', label: 'IoT Sensors', type: 'data', x: 310, y: 195, width: 100, height: 40, description: 'IoT传感器数据', icon: 'arrow', details: ['温度传感器', '电流传感器', '红外热像'] },
  { id: 'a2-data-maint', label: 'Maintenance', type: 'data', x: 470, y: 200, width: 110, height: 40, description: '设备维保历史数据库', icon: 'arrow', details: ['维保记录', '备件更换', '故障历史'] },

  { id: 'a2-skill-anomaly', label: 'anomaly_detector', type: 'skill', x: 130, y: 290, width: 150, height: 40, description: '异常检测技能：基于时序数据的异常模式识别', icon: 'wrench', details: ['温度异常', '趋势分析', '阈值判断'] },
  { id: 'a2-skill-rootcause', label: 'root_cause_analysis', type: 'skill', x: 330, y: 285, width: 160, height: 40, description: '根因分析技能：基于知识图谱的故障定位', icon: 'wrench', details: ['故障树', '关联分析', '历史匹配'] },
  { id: 'a2-skill-predict', label: 'predictive_maintenance', type: 'skill', x: 540, y: 290, width: 170, height: 40, description: '预测性维护技能：剩余使用寿命预测', icon: 'wrench', details: ['RUL预测', '劣化趋势', '维护建议'] },

  { id: 'a2-constraint-downtime', label: '停机时间<4h', type: 'constraint', x: 180, y: 375, width: 130, height: 40, description: '硬约束：设备停机维修时间必须小于4小时', icon: 'shield', details: ['当前预估: 2h', '满足约束', '优先级: P0'] },
  { id: 'a2-constraint-cost', label: '维修成本<5万', type: 'constraint', x: 360, y: 380, width: 130, height: 40, description: '硬约束：单次维修成本必须小于5万元', icon: 'shield', details: ['当前预估: 1.2万', '满足约束', '优先级: P0'] },
  { id: 'a2-constraint-safety', label: '安全标准', type: 'constraint', x: 530, y: 375, width: 100, height: 40, description: '硬约束：必须符合安全生产标准', icon: 'shield', details: ['温度超限', '安全停机', '人员疏散'] },

  { id: 'a2-sim-impact', label: '影响仿真', type: 'simulation', x: 310, y: 465, width: 140, height: 48, description: '仿真故障对产线排程的影响', output: '预计产能损失120pcs，可通过调线弥补80%缺口', icon: 'play', details: ['产能损失: 120pcs', '调线弥补: 80%', '恢复时间: 2h'] },

  { id: 'a2-result', label: '诊断报告', type: 'result', x: 310, y: 555, width: 140, height: 48, description: '输出故障诊断报告和维修建议', output: '根因: 加热管老化 | 建议: 立即更换 | 预计恢复: 2h', icon: 'file', details: ['根因: 加热管老化', '建议: 立即更换', '预计恢复: 2h'] },
];

const AGENT_A2_EDGES: GraphEdge[] = [
  { id: 'e1', source: 'a2-intent', target: 'a2-onto-equip' },
  { id: 'e2', source: 'a2-intent', target: 'a2-onto-prodline' },
  { id: 'e3', source: 'a2-intent', target: 'a2-onto-quality' },
  { id: 'e4', source: 'a2-intent', target: 'a2-onto-material' },
  { id: 'e5', source: 'a2-intent', target: 'a2-onto-process' },
  { id: 'e6', source: 'a2-onto-equip', target: 'a2-data-scada' },
  { id: 'e7', source: 'a2-onto-prodline', target: 'a2-data-scada' },
  { id: 'e8', source: 'a2-onto-quality', target: 'a2-data-iot' },
  { id: 'e9', source: 'a2-onto-material', target: 'a2-data-maint' },
  { id: 'e10', source: 'a2-onto-process', target: 'a2-data-iot' },
  { id: 'e11', source: 'a2-data-scada', target: 'a2-skill-anomaly' },
  { id: 'e12', source: 'a2-data-iot', target: 'a2-skill-rootcause' },
  { id: 'e13', source: 'a2-data-maint', target: 'a2-skill-predict' },
  { id: 'e14', source: 'a2-skill-anomaly', target: 'a2-constraint-downtime' },
  { id: 'e15', source: 'a2-skill-rootcause', target: 'a2-constraint-cost' },
  { id: 'e16', source: 'a2-skill-predict', target: 'a2-constraint-safety' },
  { id: 'e17', source: 'a2-constraint-downtime', target: 'a2-sim-impact' },
  { id: 'e18', source: 'a2-constraint-cost', target: 'a2-sim-impact' },
  { id: 'e19', source: 'a2-constraint-safety', target: 'a2-sim-impact' },
  { id: 'e20', source: 'a2-sim-impact', target: 'a2-result' },
];

// Agent a3: 质量追溯分析Agent
const AGENT_A3_NODES: GraphNode[] = [
  { id: 'a3-intent', label: '质量追溯分析', type: 'intent', x: 400, y: 30, width: 140, height: 44, description: '解析"批次质量缺陷追溯"意图，识别批次号、缺陷类型', output: '意图: 质量追溯 | 批次: BT-2024-Q3-8847 | 缺陷: 容量衰减', icon: 'brain', details: ['用户输入文本'] },

  { id: 'a3-onto-product', label: 'Product', type: 'ontology', x: 110, y: 120, width: 100, height: 40, description: '产品本体：产品型号、批次、规格', icon: 'database', details: ['型号: LP-280', '批次: BT-8847', '规格: 280Ah'] },
  { id: 'a3-onto-workorder', label: 'WorkOrder', type: 'ontology', x: 250, y: 110, width: 110, height: 40, description: '工单本体：工序流转、操作员、设备', icon: 'database', details: ['工单: WO-4521', '工序: 12道', '操作员: 张三'] },
  { id: 'a3-onto-quality', label: 'QualityCheck', type: 'ontology', x: 400, y: 115, width: 120, height: 40, description: '质量检测本体：检测项、CPK、不良率', icon: 'database', details: ['CPK: 1.15', '不良率: 0.8%', '检测项: 容量'] },
  { id: 'a3-onto-material', label: 'Material', type: 'ontology', x: 560, y: 110, width: 100, height: 40, description: '物料本体：物料批次、供应商、来料检验', icon: 'database', details: ['物料批次: FM-3321', '供应商: C公司', '来料: 合格'] },
  { id: 'a3-onto-equip', label: 'Equipment', type: 'ontology', x: 700, y: 120, width: 100, height: 40, description: '设备本体：设备编号、工序、维护记录', icon: 'database', details: ['设备: E-1205', '工序: 负极涂布', '维护: 正常'] },

  { id: 'a3-data-qms', label: 'QMS', type: 'data', x: 150, y: 200, width: 80, height: 40, description: '质量管理系统数据', icon: 'arrow', details: ['检验记录', 'SPC数据', '不合格品'] },
  { id: 'a3-data-mes', label: 'MES', type: 'data', x: 290, y: 195, width: 80, height: 40, description: '制造执行系统数据', icon: 'arrow', details: ['工序参数', '设备数据', '环境数据'] },
  { id: 'a3-data-wms', label: 'WMS', type: 'data', x: 430, y: 200, width: 80, height: 40, description: '仓库管理系统数据', icon: 'arrow', details: ['物料批次', '入库记录', '库位信息'] },

  { id: 'a3-skill-trace', label: 'traceability_query', type: 'skill', x: 140, y: 290, width: 150, height: 40, description: '追溯查询技能：跨工序正向/反向追溯', icon: 'wrench', details: ['正向追溯', '反向追溯', '树状展开'] },
  { id: 'a3-skill-correlation', label: 'correlation_analyzer', type: 'skill', x: 350, y: 285, width: 170, height: 40, description: '关联分析技能：缺陷与工艺参数关联', icon: 'wrench', details: ['相关性分析', '回归模型', '显著性检验'] },
  { id: 'a3-skill-spc', label: 'spc_analysis', type: 'skill', x: 570, y: 290, width: 130, height: 40, description: 'SPC统计过程控制分析', icon: 'wrench', details: ['控制图', '过程能力', '异常模式'] },

  { id: 'a3-constraint-cpk', label: 'CPK>1.33', type: 'constraint', x: 170, y: 375, width: 110, height: 40, description: '硬约束：过程能力指数必须大于1.33', icon: 'shield', details: ['当前: 1.15', '不满足', '触发预警'] },
  { id: 'a3-constraint-defect', label: '不良率<0.5%', type: 'constraint', x: 330, y: 380, width: 120, height: 40, description: '硬约束：不良率必须小于0.5%', icon: 'shield', details: ['当前: 0.8%', '不满足', '触发预警'] },
  { id: 'a3-constraint-trace', label: '追溯完整度100%', type: 'constraint', x: 500, y: 375, width: 140, height: 40, description: '硬约束：质量追溯数据完整度100%', icon: 'shield', details: ['当前: 100%', '满足', '优先级: P0'] },

  { id: 'a3-sim-impact', label: '影响范围分析', type: 'simulation', x: 300, y: 465, width: 160, height: 48, description: '分析缺陷影响范围：同批次、同供应商、同设备', output: '影响范围：同批次200pcs + 同供应商3批次共600pcs', icon: 'play', details: ['同批次: 200pcs', '同供应商: 600pcs', '同设备: 1500pcs'] },

  { id: 'a3-result', label: '追溯报告', type: 'result', x: 310, y: 555, width: 140, height: 48, description: '输出质量追溯报告和处置建议', output: '建议隔离800pcs产品，调整涂布参数后复测CPK', icon: 'file', details: ['隔离: 800pcs', '调整: 涂布参数', '复测: CPK'] },
];

const AGENT_A3_EDGES: GraphEdge[] = [
  { id: 'e1', source: 'a3-intent', target: 'a3-onto-product' },
  { id: 'e2', source: 'a3-intent', target: 'a3-onto-workorder' },
  { id: 'e3', source: 'a3-intent', target: 'a3-onto-quality' },
  { id: 'e4', source: 'a3-intent', target: 'a3-onto-material' },
  { id: 'e5', source: 'a3-intent', target: 'a3-onto-equip' },
  { id: 'e6', source: 'a3-onto-product', target: 'a3-data-qms' },
  { id: 'e7', source: 'a3-onto-workorder', target: 'a3-data-mes' },
  { id: 'e8', source: 'a3-onto-quality', target: 'a3-data-qms' },
  { id: 'e9', source: 'a3-onto-material', target: 'a3-data-wms' },
  { id: 'e10', source: 'a3-onto-equip', target: 'a3-data-mes' },
  { id: 'e11', source: 'a3-data-qms', target: 'a3-skill-trace' },
  { id: 'e12', source: 'a3-data-mes', target: 'a3-skill-correlation' },
  { id: 'e13', source: 'a3-data-wms', target: 'a3-skill-spc' },
  { id: 'e14', source: 'a3-skill-trace', target: 'a3-constraint-cpk' },
  { id: 'e15', source: 'a3-skill-correlation', target: 'a3-constraint-defect' },
  { id: 'e16', source: 'a3-skill-spc', target: 'a3-constraint-trace' },
  { id: 'e17', source: 'a3-constraint-cpk', target: 'a3-sim-impact' },
  { id: 'e18', source: 'a3-constraint-defect', target: 'a3-sim-impact' },
  { id: 'e19', source: 'a3-constraint-trace', target: 'a3-sim-impact' },
  { id: 'e20', source: 'a3-sim-impact', target: 'a3-result' },
];

const AGENT_GRAPHS: Record<string, { nodes: GraphNode[]; edges: GraphEdge[] }> = {
  a1: { nodes: AGENT_A1_NODES, edges: AGENT_A1_EDGES },
  a2: { nodes: AGENT_A2_NODES, edges: AGENT_A2_EDGES },
  a3: { nodes: AGENT_A3_NODES, edges: AGENT_A3_EDGES },
};

const B_ICON_MAP: Record<string, any> = {
  brain: BrainCircuit, database: Database, arrow: ArrowRight,
  wrench: Wrench, shield: ShieldCheck, play: MonitorPlay, file: FileOutput,
};

// Draw different node shapes based on type
function drawNodeShape(
  ctx: CanvasRenderingContext2D,
  type: GraphNodeType,
  x: number, y: number,
  w: number, h: number,
  color: string,
  isActive: boolean,
  isHovered: boolean
) {
  const r = Math.min(w, h) * 0.2;
  ctx.save();

  // Shadow
  ctx.shadowColor = isActive ? color + '66' : 'rgba(0,0,0,0.12)';
  ctx.shadowBlur = isActive ? 16 : 8;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = isActive ? 4 : 2;

  // Fill
  ctx.fillStyle = isActive ? '#FFFFFF' : (isHovered ? '#FAFAFA' : '#FFFFFF');

  // Glow for active
  if (isActive) {
    ctx.shadowColor = color + '99';
    ctx.shadowBlur = 24;
  }

  ctx.beginPath();
  switch (type) {
    case 'ontology': // Circle
      ctx.arc(x, y, w / 2, 0, Math.PI * 2);
      break;
    case 'data': // Diamond (rotated square)
      ctx.moveTo(x, y - h / 2);
      ctx.lineTo(x + w / 2, y);
      ctx.lineTo(x, y + h / 2);
      ctx.lineTo(x - w / 2, y);
      ctx.closePath();
      break;
    case 'skill': // Hexagon
      const hexR = Math.max(w, h) / 2;
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + hexR * Math.cos(angle);
        const py = y + hexR * Math.sin(angle) * 0.6;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    default: // Rounded rect for intent, constraint, simulation, result
      ctx.moveTo(x - w / 2 + r, y - h / 2);
      ctx.lineTo(x + w / 2 - r, y - h / 2);
      ctx.quadraticCurveTo(x + w / 2, y - h / 2, x + w / 2, y - h / 2 + r);
      ctx.lineTo(x + w / 2, y + h / 2 - r);
      ctx.quadraticCurveTo(x + w / 2, y + h / 2, x + w / 2 - r, y + h / 2);
      ctx.lineTo(x - w / 2 + r, y + h / 2);
      ctx.quadraticCurveTo(x - w / 2, y + h / 2, x - w / 2, y + h / 2 - r);
      ctx.lineTo(x - w / 2, y - h / 2 + r);
      ctx.quadraticCurveTo(x - w / 2, y - h / 2, x - w / 2 + r, y - h / 2);
      ctx.closePath();
      break;
  }

  ctx.fill();

  // Stroke
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = isActive ? 2.5 : (isHovered ? 2 : 1.5);
  ctx.strokeStyle = isActive ? color : (isHovered ? '#9CA3AF' : '#E5E7EB');
  ctx.stroke();

  // Extra border for constraint
  if (type === 'constraint') {
    ctx.lineWidth = 1;
    ctx.strokeStyle = color + '44';
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

function BatteryReasoningGraph({ activeAgentId }: { activeAgentId: string }) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const animationRef = React.useRef<number>(0);
  const dashOffsetRef = React.useRef(0);

  const graph = AGENT_GRAPHS[activeAgentId] || AGENT_GRAPHS.a1;
  const { nodes, edges } = graph;

  // Auto-play: nodes light up in sequence along the reasoning path
  useEffect(() => {
    // Define the reasoning sequence
    const sequence = nodes.map(n => n.id);
    let idx = 0;
    setActiveNodeId(sequence[0]);
    const timer = setInterval(() => {
      idx = (idx + 1) % sequence.length;
      setActiveNodeId(sequence[idx]);
    }, 2000);
    return () => clearInterval(timer);
  }, [activeAgentId, nodes]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = 840;
    const cssHeight = 640;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    canvas.style.width = cssWidth + 'px';
    canvas.style.height = cssHeight + 'px';
    ctx.scale(dpr, dpr);

    const render = () => {
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      // Background grid
      ctx.strokeStyle = '#F3F4F6';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < cssWidth; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, cssHeight);
        ctx.stroke();
      }
      for (let gy = 0; gy < cssHeight; gy += 40) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(cssWidth, gy);
        ctx.stroke();
      }

      // Draw edges
      dashOffsetRef.current -= 0.5;
      edges.forEach(edge => {
        const src = nodes.find(n => n.id === edge.source);
        const tgt = nodes.find(n => n.id === edge.target);
        if (!src || !tgt) return;

        const isSourceActive = activeNodeId === src.id;
        const isTargetActive = activeNodeId === tgt.id;
        const isEdgeActive = isSourceActive || isTargetActive;

        // Calculate connection points
        let sx = src.x, sy = src.y, tx = tgt.x, ty = tgt.y;
        // Adjust start/end to edge of node shapes
        const dx = tx - sx;
        const dy = ty - sy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / dist;
        const ny = dy / dist;

        // Offset from node center to edge
        const srcOffset = src.type === 'ontology' ? src.width / 2 + 2 :
          src.type === 'data' ? Math.min(src.width, src.height) / 2 + 2 :
            src.type === 'skill' ? Math.max(src.width, src.height) / 2 + 2 :
              src.width / 2 + 4;
        const tgtOffset = tgt.type === 'ontology' ? tgt.width / 2 + 6 :
          tgt.type === 'data' ? Math.min(tgt.width, tgt.height) / 2 + 6 :
            tgt.type === 'skill' ? Math.max(tgt.width, tgt.height) / 2 + 6 :
              tgt.width / 2 + 8;

        sx += nx * srcOffset;
        sy += ny * srcOffset;
        tx -= nx * tgtOffset;
        ty -= ny * tgtOffset;

        // Bezier curve
        const midY = (sy + ty) / 2;
        const cp1x = sx;
        const cp1y = midY;
        const cp2x = tx;
        const cp2y = midY;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, tx, ty);

        // Edge styling
        const edgeColor = isEdgeActive ? NODE_TYPE_CONFIG[src.type].color : '#D1D5DB';
        ctx.strokeStyle = edgeColor;
        ctx.lineWidth = isEdgeActive ? 2.5 : 1.5;

        if (isEdgeActive) {
          ctx.setLineDash([8, 6]);
          ctx.lineDashOffset = dashOffsetRef.current;
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrowhead
        const arrowLen = 10;
        const arrowAngle = Math.atan2(ty - cp2y, tx - cp2x);
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(
          tx - arrowLen * Math.cos(arrowAngle - Math.PI / 6),
          ty - arrowLen * Math.sin(arrowAngle - Math.PI / 6)
        );
        ctx.lineTo(
          tx - arrowLen * Math.cos(arrowAngle + Math.PI / 6),
          ty - arrowLen * Math.sin(arrowAngle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = edgeColor;
        ctx.fill();

        ctx.restore();
      });

      // Draw nodes
      nodes.forEach(node => {
        const isActive = activeNodeId === node.id;
        const isHovered = hoveredNode === node.id;
        const config = NODE_TYPE_CONFIG[node.type];

        drawNodeShape(ctx, node.type, node.x, node.y, node.width, node.height, config.color, isActive, isHovered);

        // Draw icon
        const iconSize = 14;
        const iconX = node.x - node.width / 2 + 18;
        const iconY = node.y - 1;

        // Icon background circle
        ctx.beginPath();
        ctx.arc(iconX, iconY, 10, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? config.color : config.bg;
        ctx.fill();

        // Icon text (fallback since we can't render React components on canvas)
        ctx.fillStyle = isActive ? '#FFFFFF' : config.color;
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const iconChar = node.type === 'intent' ? 'I' :
          node.type === 'ontology' ? 'O' :
            node.type === 'data' ? 'D' :
              node.type === 'skill' ? 'S' :
                node.type === 'constraint' ? 'C' :
                  node.type === 'simulation' ? 'M' : 'R';
        ctx.fillText(iconChar, iconX, iconY);

        // Node label
        ctx.fillStyle = isActive ? config.color : '#1F2937';
        ctx.font = isActive ? 'bold 11px sans-serif' : '500 11px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const labelX = iconX + 16;
        const maxLabelWidth = node.width - 40;
        let displayLabel = node.label;
        if (ctx.measureText(displayLabel).width > maxLabelWidth) {
          while (ctx.measureText(displayLabel + '...').width > maxLabelWidth && displayLabel.length > 0) {
            displayLabel = displayLabel.slice(0, -1);
          }
          displayLabel += '...';
        }
        ctx.fillText(displayLabel, labelX, node.y);

        // Active pulse effect
        if (isActive) {
          const pulseRadius = Math.max(node.width, node.height) / 2 + 8 + Math.sin(Date.now() / 300) * 4;
          ctx.beginPath();
          if (node.type === 'ontology') {
            ctx.arc(node.x, node.y, pulseRadius, 0, Math.PI * 2);
          } else if (node.type === 'data') {
            ctx.moveTo(node.x, node.y - pulseRadius);
            ctx.lineTo(node.x + pulseRadius, node.y);
            ctx.lineTo(node.x, node.y + pulseRadius);
            ctx.lineTo(node.x - pulseRadius, node.y);
            ctx.closePath();
          } else {
            const pr = 6;
            ctx.moveTo(node.x - pulseRadius + pr, node.y - pulseRadius * 0.6);
            ctx.lineTo(node.x + pulseRadius - pr, node.y - pulseRadius * 0.6);
            ctx.quadraticCurveTo(node.x + pulseRadius, node.y - pulseRadius * 0.6, node.x + pulseRadius, node.y - pulseRadius * 0.6 + pr);
            ctx.lineTo(node.x + pulseRadius, node.y + pulseRadius * 0.6 - pr);
            ctx.quadraticCurveTo(node.x + pulseRadius, node.y + pulseRadius * 0.6, node.x + pulseRadius - pr, node.y + pulseRadius * 0.6);
            ctx.lineTo(node.x - pulseRadius + pr, node.y + pulseRadius * 0.6);
            ctx.quadraticCurveTo(node.x - pulseRadius, node.y + pulseRadius * 0.6, node.x - pulseRadius, node.y + pulseRadius * 0.6 - pr);
            ctx.lineTo(node.x - pulseRadius, node.y - pulseRadius * 0.6 + pr);
            ctx.quadraticCurveTo(node.x - pulseRadius, node.y - pulseRadius * 0.6, node.x - pulseRadius + pr, node.y - pulseRadius * 0.6);
            ctx.closePath();
          }
          ctx.strokeStyle = config.color + '33';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationRef.current);
  }, [nodes, edges, activeNodeId, hoveredNode]);

  // Mouse interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let found: GraphNode | null = null;
    for (const node of nodes) {
      const halfW = node.width / 2;
      const halfH = node.height / 2;
      if (node.type === 'ontology') {
        const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
        if (dist <= halfW) found = node;
      } else if (node.type === 'data') {
        const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
        if (dist <= Math.min(halfW, halfH)) found = node;
      } else {
        if (x >= node.x - halfW && x <= node.x + halfW && y >= node.y - halfH && y <= node.y + halfH) {
          found = node;
        }
      }
      if (found) break;
    }

    if (found) {
      setHoveredNode(found.id);
      setTooltipPos({ x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 12 });
    } else {
      setHoveredNode(null);
      setTooltipPos(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredNode(null);
    setTooltipPos(null);
  };

  const hoveredNodeData = hoveredNode ? nodes.find(n => n.id === hoveredNode) : null;

  // Stats
  const skillCount = nodes.filter(n => n.type === 'skill').length;
  const dataCount = nodes.filter(n => n.type === 'data').length;
  const ontologyCount = nodes.filter(n => n.type === 'ontology').length;
  const totalNodes = nodes.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch size={16} className="text-indigo-600" />
          <span className="text-sm font-bold text-gray-900">Agent 推演知识图谱</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="flex items-center gap-2">
            {(Object.entries(NODE_TYPE_CONFIG) as [GraphNodeType, typeof NODE_TYPE_CONFIG['intent']][]).map(([type, cfg]) => (
              <div key={type} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: cfg.color }} />
                <span className="text-[10px] text-gray-500">{cfg.label}</span>
              </div>
            ))}
          </div>
          <span className="text-[10px] text-gray-400">自动轮播演示中...</span>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden relative" style={{ height: 640 }}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ width: 840, height: 640, cursor: hoveredNode ? 'pointer' : 'default' }}
        />

        {/* Rich tooltip */}
        {hoveredNodeData && tooltipPos && (
          <div
            className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-3 pointer-events-none"
            style={{
              left: Math.min(tooltipPos.x, 600),
              top: Math.max(tooltipPos.y - 80, 0),
              maxWidth: 280,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: NODE_TYPE_CONFIG[hoveredNodeData.type].color }} />
              <span className="text-xs font-bold text-gray-900">{hoveredNodeData.label}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: NODE_TYPE_CONFIG[hoveredNodeData.type].color }}>
                {NODE_TYPE_CONFIG[hoveredNodeData.type].label}
              </span>
            </div>
            <p className="text-[11px] text-gray-600 mb-2 leading-relaxed">{hoveredNodeData.description}</p>
            {hoveredNodeData.details && hoveredNodeData.details.length > 0 && (
              <div className="space-y-1">
                {hoveredNodeData.details.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-gray-400" />
                    <span className="text-[10px] text-gray-500">{d}</span>
                  </div>
                ))}
              </div>
            )}
            {hoveredNodeData.output && (
              <div className="mt-2 p-1.5 bg-emerald-50 border border-emerald-200 rounded text-[10px] text-emerald-700">
                {hoveredNodeData.output}
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
