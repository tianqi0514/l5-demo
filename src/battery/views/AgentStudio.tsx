import React, { useState } from 'react';
import {
  Bot, Plus, Search, Settings, Cpu, BrainCircuit, Database, Wrench,
  ShieldCheck, MonitorPlay, FileOutput, ArrowRight, Save, Play, CheckCircle2,
  Users, Crown, Briefcase, Factory, UserCircle, MapPin, ChevronDown, ChevronUp
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
