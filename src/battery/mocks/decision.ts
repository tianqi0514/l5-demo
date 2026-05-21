// Mock 数据 - 基于 PRD Appendix v1.0

import type {
  Issue, Message, DecisionAsset, ActiveControl, ResolutionStatus,
  IssueStatus, IssueCategory, RoleId, User, Agent, ScopeCounts,
  Notification, DecisionLog, AssetReference
} from '../types/decision';

// ========== 6.1 用户列表(10个) ==========
export const MOCK_USERS: User[] = [
  {
    id: 'u_001',
    role_id: 'ceo',
    name: '张志强',
    title: 'CEO',
    department: '集团',
    email: 'zhang.zq@battery.example.com',
    factory_scope: ['F01', 'F02', 'F03', 'F04', 'F05'],
    product_line_scope: ['PL_EV', 'PL_COMMERCIAL', 'PL_ESS'],
    is_active: true
  },
  {
    id: 'u_002',
    role_id: 'vp_prod',
    name: '李建国',
    title: '生产副总裁',
    department: '生产',
    email: 'li.jg@battery.example.com',
    factory_scope: ['F01', 'F02', 'F03', 'F04', 'F05'],
    product_line_scope: ['PL_EV', 'PL_COMMERCIAL', 'PL_ESS'],
    is_active: true
  },
  {
    id: 'u_003',
    role_id: 'vp_sales',
    name: '王秀英',
    title: '销售副总裁',
    department: '销售',
    email: 'wang.xy@battery.example.com',
    factory_scope: ['F01', 'F02', 'F03', 'F04', 'F05'],
    product_line_scope: ['PL_EV', 'PL_COMMERCIAL', 'PL_ESS'],
    is_active: true
  },
  {
    id: 'u_004',
    role_id: 'mgr_plan',
    name: '张明',
    title: '计划经理',
    department: '生产计划部',
    email: 'zhang.m@battery.example.com',
    factory_scope: ['F01', 'F02', 'F03'],
    product_line_scope: ['PL_EV', 'PL_COMMERCIAL'],
    is_active: true
  },
  {
    id: 'u_005',
    role_id: 'mgr_process',
    name: '陈卫国',
    title: '工艺总监',
    department: '工艺技术部',
    email: 'chen.wg@battery.example.com',
    factory_scope: ['F01', 'F02', 'F03', 'F04', 'F05'],
    product_line_scope: ['PL_EV', 'PL_COMMERCIAL', 'PL_ESS'],
    is_active: true
  },
  {
    id: 'u_006',
    role_id: 'mgr_quality',
    name: '李梅',
    title: '质量经理',
    department: '质量控制部',
    email: 'li.mei@battery.example.com',
    factory_scope: ['F01', 'F02', 'F03'],
    product_line_scope: ['PL_EV', 'PL_COMMERCIAL'],
    is_active: true
  },
  {
    id: 'u_007',
    role_id: 'mgr_finance',
    name: '周建华',
    title: '财务经理',
    department: '财务部',
    email: 'zhou.jh@battery.example.com',
    factory_scope: ['F01', 'F02', 'F03', 'F04', 'F05'],
    product_line_scope: ['PL_EV', 'PL_COMMERCIAL', 'PL_ESS'],
    is_active: true
  },
  {
    id: 'u_008',
    role_id: 'mgr_sales',
    name: '刘小芳',
    title: '销售经理',
    department: '销售部',
    email: 'liu.xf@battery.example.com',
    factory_scope: ['F01', 'F02'],
    product_line_scope: ['PL_EV'],
    is_active: true
  },
  {
    id: 'u_009',
    role_id: 'mgr_purchase',
    name: '孙强',
    title: '采购经理',
    department: '采购部',
    email: 'sun.q@battery.example.com',
    factory_scope: ['F01', 'F02', 'F03', 'F04', 'F05'],
    product_line_scope: ['PL_EV', 'PL_COMMERCIAL', 'PL_ESS'],
    is_active: true
  },
  {
    id: 'u_010',
    role_id: 'mgr_factory',
    name: '赵敏',
    title: 'F02 工厂厂长',
    department: 'F02 工厂',
    email: 'zhao.min@battery.example.com',
    factory_scope: ['F02'],
    product_line_scope: ['PL_EV', 'PL_COMMERCIAL'],
    is_active: true
  }
];

// ========== 6.2 Agent 列表(7个) ==========
export const MOCK_AGENTS: Agent[] = [
  {
    id: 'a_plan',
    user_id: 'u_004',
    display_name: '计划 Agent',
    avatar_initial: '计',
    stance_config: {
      risk_preference: 'balanced',
      key_constraints: ['按时交付', '产能利用率高于 85%'],
      delegation_scope: ['排产建议', '产能评估', '订单优先级']
    },
    knowledge_sources: ['订单本体', '产能本体', '历史排产决策'],
    is_active: true,
    last_synced_at: '2026-05-10T09:00:00Z'
  },
  {
    id: 'a_process',
    user_id: 'u_005',
    display_name: '工艺 Agent',
    avatar_initial: '工',
    stance_config: {
      risk_preference: 'conservative',
      key_constraints: ['良率高于 95%', '工艺参数稳定'],
      delegation_scope: ['工艺评估', '设备能力评估', '切换成本估算']
    },
    knowledge_sources: ['工艺本体', '设备本体', '历史工艺决策'],
    is_active: true,
    last_synced_at: '2026-05-08T14:30:00Z'
  },
  {
    id: 'a_quality',
    user_id: 'u_006',
    display_name: '质量 Agent',
    avatar_initial: '质',
    stance_config: {
      risk_preference: 'conservative',
      key_constraints: ['批次合格率', 'SPC 不超控', '客户投诉率为零'],
      delegation_scope: ['质量评估', '检验方案建议', '风险预警']
    },
    knowledge_sources: ['质量本体', 'SPC 历史数据', '客户投诉记录'],
    is_active: true,
    last_synced_at: '2026-05-11T10:15:00Z'
  },
  {
    id: 'a_finance',
    user_id: 'u_007',
    display_name: '财务 Agent',
    avatar_initial: '财',
    stance_config: {
      risk_preference: 'balanced',
      key_constraints: ['毛利率高于 18%', '现金流为正'],
      delegation_scope: ['成本测算', '收益评估', '违约金估算']
    },
    knowledge_sources: ['成本本体', '客户合同库', '历史财务决策'],
    is_active: true,
    last_synced_at: '2026-05-09T16:00:00Z'
  },
  {
    id: 'a_sales',
    user_id: 'u_008',
    display_name: '销售 Agent',
    avatar_initial: '销',
    stance_config: {
      risk_preference: 'aggressive',
      key_constraints: ['客户满意度', '战略客户优先'],
      delegation_scope: ['客户分级评估', '沟通方案建议']
    },
    knowledge_sources: ['客户本体', '订单本体', '历史商务决策'],
    is_active: true,
    last_synced_at: '2026-05-12T11:00:00Z'
  },
  {
    id: 'a_purchase',
    user_id: 'u_009',
    display_name: '采购 Agent',
    avatar_initial: '采',
    stance_config: {
      risk_preference: 'balanced',
      key_constraints: ['双源供应', '库存周转 30 天内'],
      delegation_scope: ['物料评估', '供应商建议', 'BOM 变更影响']
    },
    knowledge_sources: ['BOM 本体', '供应商本体', '库存数据'],
    is_active: true,
    last_synced_at: '2026-05-10T08:30:00Z'
  },
  {
    id: 'a_coord',
    user_id: null,
    display_name: '协调 Agent',
    avatar_initial: '协',
    stance_config: {
      risk_preference: 'balanced',
      key_constraints: ['共识可识别', '冲突可定位', '决策可追溯'],
      delegation_scope: ['议题分类', '共识总结', '升级判断', '人工决策触发']
    },
    knowledge_sources: ['全部本体', '治理规则'],
    is_active: true,
    last_synced_at: '2026-05-13T00:00:00Z'
  }
];

// 角色定义(用于UI显示)
export const ROLES: Record<RoleId, { name: string; department: string; isAgent: boolean }> = {
  'ceo': { name: 'CEO', department: '集团', isAgent: false },
  'vp_prod': { name: '生产副总裁', department: '生产', isAgent: false },
  'vp_sales': { name: '销售副总裁', department: '销售', isAgent: false },
  'mgr_plan': { name: '计划经理', department: '生产计划部', isAgent: true },
  'mgr_process': { name: '工艺总监', department: '工艺技术部', isAgent: true },
  'mgr_quality': { name: '质量经理', department: '质量控制部', isAgent: true },
  'mgr_finance': { name: '财务经理', department: '财务部', isAgent: true },
  'mgr_sales': { name: '销售经理', department: '销售部', isAgent: true },
  'mgr_purchase': { name: '采购经理', department: '采购部', isAgent: true },
  'mgr_factory': { name: '工厂厂长', department: '工厂', isAgent: true },
  'coord_agent': { name: '协调 Agent', department: '系统', isAgent: true }
};

// 当前用户(CEO视角)
export const CURRENT_USER: User = MOCK_USERS[0]; // 张志强 CEO

// ========== 7. 议题种子数据 ==========

// 7.2 议题 #1284 - 主演示议题
export const MOCK_ISSUE_1284: Issue = {
  id: '#1284',
  title: '客户 X 加急订单是否接单',
  description: '客户 X 申请在 6/15 前交付 800 套乘用车电池(型号 EV-200)。目前订单池已满 92%,需挤占商用车产线 PL_COMMERCIAL 约 3 天产能。请各部门评估接单可行性。',
  status: 'PENDING_HUMAN',
  urgency: 'urgent',
  sensitivity: 'normal',
  creator_user_id: 'u_004',
  creatorName: '张明',
  participant_role_ids: ['mgr_plan', 'mgr_process', 'mgr_quality', 'mgr_finance', 'mgr_sales', 'coord_agent'],
  ontology_node_ids: ['node_order', 'node_capacity', 'node_customer_priority', 'node_product_line_conflict'],
  parent_topic_id: null,
  referenced_asset_ids: ['ast_1247_05'],
  source_template_id: null,
  pending_user_id: 'u_001',
  pendingUserName: '张志强',
  created_at: '2026-05-13T14:02:00Z',
  updated_at: '2026-05-13T14:05:30Z',
  decided_at: null,
  decided_by_user_id: null,
  final_resolution: null,
  referencedIssues: [
    { id: '#1247', title: '客户 Z 加急订单决策', resolution: '接单,前 50 套加严检验,销售主导沟通' }
  ]
};

// 7.3 议题 #1281 - 供应商资格审查
export const MOCK_ISSUE_1281: Issue = {
  id: '#1281',
  title: '电芯供应商 B 资格审查',
  description: '新增电芯供应商「韩国 SK 创新 B 系列」,采购总监已初审通过,需 CEO 终审。涉及未来 6 个月内 30% 的电芯供货比例。',
  status: 'PENDING_HUMAN',
  urgency: 'normal',
  sensitivity: 'normal',
  creator_user_id: 'u_009',
  creatorName: '孙强',
  participant_role_ids: ['mgr_purchase', 'mgr_quality', 'mgr_finance', 'coord_agent'],
  ontology_node_ids: ['node_supplier', 'node_material', 'node_quality'],
  created_at: '2026-05-13T08:30:00Z',
  updated_at: '2026-05-13T09:15:00Z',
  pending_user_id: 'u_001',
  pendingUserName: '张志强'
};

// 7.4 议题 #1278 - 预算调整(冲突案例)
export const MOCK_ISSUE_1278: Issue = {
  id: '#1278',
  title: 'Q3 设备维保预算调整',
  description: 'F02 工厂设备维保预算需追加 320 万。工艺部门认为必要,财务部门认为可推迟。',
  status: 'PENDING_HUMAN',
  urgency: 'normal',
  sensitivity: 'normal',
  creator_user_id: 'u_010',
  creatorName: '赵敏',
  participant_role_ids: ['mgr_process', 'mgr_finance', 'mgr_factory', 'coord_agent'],
  ontology_node_ids: ['node_equipment', 'node_budget'],
  created_at: '2026-05-12T11:00:00Z',
  updated_at: '2026-05-12T11:45:00Z',
  pending_user_id: 'u_002',
  pendingUserName: '李建国'
};

// 7.5 议题 #1275 - 进行中议题(OPEN 状态)
export const MOCK_ISSUE_1275: Issue = {
  id: '#1275',
  title: 'F03 工厂质量异常处置',
  description: 'F03 工厂上午 10 点发现 2025 年第 18 批电芯组(批号 B202518)外观异常,涉及 320 套未发货产品。',
  status: 'OPEN',
  urgency: 'urgent',
  sensitivity: 'normal',
  creator_user_id: 'u_006',
  creatorName: '李梅',
  participant_role_ids: ['mgr_quality', 'mgr_process', 'mgr_sales', 'mgr_factory', 'coord_agent'],
  ontology_node_ids: ['node_quality', 'node_batch', 'node_traceability'],
  created_at: '2026-05-13T10:20:00Z',
  updated_at: '2026-05-13T10:35:00Z'
};

// 7.6 议题 #1265 - 高敏议题(SUSPENDED)
export const MOCK_ISSUE_1265: Issue = {
  id: '#1265',
  title: '考虑解雇供应商 C 合作',
  description: '[内容仅对白名单用户可见]',
  status: 'SUSPENDED',
  urgency: 'normal',
  sensitivity: 'sensitive',
  creator_user_id: 'u_009',
  creatorName: '孙强',
  participant_role_ids: ['mgr_purchase', 'coord_agent'],
  whitelist_user_ids: ['u_001', 'u_002', 'u_009'],
  ontology_node_ids: ['node_supplier_exit'],
  created_at: '2026-05-10T14:00:00Z',
  updated_at: '2026-05-10T14:00:30Z'
};

// 议题列表
export const MOCK_ISSUES: Issue[] = [
  MOCK_ISSUE_1284,
  MOCK_ISSUE_1281,
  MOCK_ISSUE_1278,
  MOCK_ISSUE_1275,
  MOCK_ISSUE_1265
];

// ========== 消息数据 ==========

// 7.2.2 议题 #1284 的完整消息流(6条)
export const MOCK_MESSAGES_1284: Message[] = [
  {
    id: 'msg_1284_001',
    topic_id: '#1284',
    author_type: 'agent',
    author_id: 'a_plan',
    author_display: '计划',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '客户 X 申请 6/15 前交付 800 套。当前订单池已满 92%,需挤占商用车产线 3 天产能。@工艺 评估切换成本,@财务 算净收益。',
    mentions: [
      { start: 41, end: 44, type: 'ROLE', target_role_id: 'mgr_process', target_display: '工艺' },
      { start: 53, end: 56, type: 'ROLE', target_role_id: 'mgr_finance', target_display: '财务' }
    ],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_order', 'node_capacity'] },
    attached_data: null,
    is_pinned: false,
    created_at: '2026-05-13T14:02:15Z',
    created_at_display: '14:02'
  },
  {
    id: 'msg_1284_002',
    topic_id: '#1284',
    author_type: 'agent',
    author_id: 'a_process',
    author_display: '工艺',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '产线切换需 6 小时设备调校 + 4 小时工艺验证,首批 200 套良率预计降至 92%(常规 98%)。后续可恢复。',
    mentions: [],
    reply_to_message_id: 'msg_1284_001',
    reasoning_path: { ontology_refs: ['node_process', 'node_equipment'] },
    attached_data: { switching_cost_hours: 10, first_batch_yield: 0.92, normal_yield: 0.98 },
    is_pinned: false,
    created_at: '2026-05-13T14:03:08Z',
    created_at_display: '14:03'
  },
  {
    id: 'msg_1284_003',
    topic_id: '#1284',
    author_type: 'agent',
    author_id: 'a_quality',
    author_display: '质量',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '节奏过快可能引发 SPC 漂移。建议:前 100 套加严检验、保留追溯样本;若良率低于 95%,触发停线复核。',
    mentions: [],
    reply_to_message_id: 'msg_1284_002',
    reasoning_path: { ontology_refs: ['node_quality', 'node_spc'] },
    attached_data: { strict_inspection_count: 100, yield_threshold: 0.95 },
    is_pinned: false,
    created_at: '2026-05-13T14:03:42Z',
    created_at_display: '14:03'
  },
  {
    id: 'msg_1284_004',
    topic_id: '#1284',
    author_type: 'agent',
    author_id: 'a_finance',
    author_display: '财务',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '订单毛利率 22%,商用车被挤压订单延期违约金约 18 万。综合净收益约 +84 万。可接。',
    mentions: [],
    reply_to_message_id: 'msg_1284_001',
    reasoning_path: { ontology_refs: ['node_revenue', 'node_cost'] },
    attached_data: { gross_margin: 0.22, penalty_cost: 180000, net_benefit: 840000 },
    is_pinned: false,
    created_at: '2026-05-13T14:04:21Z',
    created_at_display: '14:04'
  },
  {
    id: 'msg_1284_005',
    topic_id: '#1284',
    author_type: 'agent',
    author_id: 'a_sales',
    author_display: '销售',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '客户 X 是战略客户(A 级),接单可巩固关系;商用车客户 Y 已有过两次延期记录,需额外做客户沟通。@CEO 客户 Y 沟通需高级出面。',
    mentions: [
      { start: 60, end: 64, type: 'ESCALATE', target_role_id: 'ceo', target_display: 'CEO' }
    ],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_customer_priority', 'node_customer_history'] },
    attached_data: { customer_x_tier: 'A', customer_y_delay_count: 2 },
    is_pinned: false,
    created_at: '2026-05-13T14:04:55Z',
    created_at_display: '14:04'
  },
  {
    id: 'msg_1284_006',
    topic_id: '#1284',
    author_type: 'agent',
    author_id: 'a_coord',
    author_display: '协调',
    author_color_class: 'accent',
    message_type: 'CONSENSUS',
    content: '共识达成:接单,前 100 套加严检验,销售主导沟通客户 Y。需 @CEO 决策:与客户 Y 沟通的主导人是销售经理还是您亲自出面?',
    mentions: [
      { start: 33, end: 37, type: 'ESCALATE', target_role_id: 'ceo', target_display: 'CEO' }
    ],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_consensus', 'node_decision_required'] },
    attached_data: null,
    is_pinned: true,
    created_at: '2026-05-13T14:05:30Z',
    created_at_display: '14:05'
  }
];

// ========== 决策资产 ==========

// 7.2.3 议题 #1284 的 5 张资产
export const MOCK_ASSETS_1284: DecisionAsset[] = [
  {
    type: '01',
    typeName: 'ISSUE_PROFILE',
    content: {
      category: 'customer_urgent_order',
      tags: ['加急订单', '跨产线', '战略客户', '产能挤占'],
      entities: [
        { type: 'customer', id: 'X', name: '客户X' },
        { type: 'customer', id: 'Y', name: '客户Y' },
        { type: 'product', id: 'EV-200', name: '乘用车电池' },
        { type: 'line', id: 'PL_EV', name: '乘用车产线' },
        { type: 'line', id: 'PL_COMMERCIAL', name: '商用车产线' }
      ],
      summary: '客户加急订单 vs 现有订单冲突 · 跨产线产能挤占类',
      autoGenerated: true
    }
  },
  {
    type: '02',
    typeName: 'KEY_TRADEOFFS',
    content: {
      tradeoffs: [
        {
          sideA: '战略客户关系(A级)',
          sideB: '现有客户承诺(客户Y)',
          weightA: 0.7,
          weightB: 0.3,
          reasoning: '客户X为战略客户，客户Y历史上对短期延期接受度较高'
        },
        {
          sideA: '短期良率下降(92% vs 98%)',
          sideB: '财务净收益(+84万)',
          weightA: 0.3,
          weightB: 0.7,
          reasoning: '通过前100套加严检验可有效控制质量风险'
        }
      ]
    }
  },
  {
    type: '03',
    typeName: 'DECISION_BASIS',
    content: {
      dataPoints: [
        { name: '订单池饱和度', value: '92%', source: 'MES实时数据', confidence: 'high' },
        { name: '产线切换成本', value: '10小时', source: 'APS模拟', confidence: 'high' },
        { name: '首批良率', value: '92% (常规98%)', source: '工艺Agent', confidence: 'medium' },
        { name: '订单毛利率', value: '22%', source: '报价系统', confidence: 'high' },
        { name: '违约金成本', value: '18万', source: '合同条款', confidence: 'high' },
        { name: '综合净收益', value: '+84万', source: '财务Agent', confidence: 'medium' }
      ]
    }
  },
  {
    type: '04',
    typeName: 'CONCLUSION',
    content: {
      resolutionText: '接单,前100套加严检验,销售主导沟通客户Y',
      resolutionType: 'pending'
    }
  },
  {
    type: '05',
    typeName: 'REUSABLE_RULE',
    content: {
      ruleText: '加急订单类冲突 → 调用本议题决策路径作初稿(战略客户优先 + 加严检验 + 高层介入沟通)',
      triggerPattern: {
        category: 'customer_urgent_order',
        conditions: [
          { field: '客户分级', operator: 'in', value: ['A级', '战略'] },
          { field: '跨产线挤占', operator: 'is_true' }
        ]
      },
      recommendedAction: '销售主导沟通受影响客户,CEO视情况介入',
      applicableScope: {
        plants: ['F01', 'F02', 'F03'],
        productionLines: ['PL_EV', 'PL_COMMERCIAL'],
        customerTiers: ['A级', '战略']
      },
      confidenceScore: 0.85,
      humanApproved: false
    }
  }
];

// ========== 决策状态 ==========
export const MOCK_RESOLUTION_STATUS_1284: ResolutionStatus = {
  consensusSummary: '接单 · 前100套加严检验 · 销售主导沟通客户Y',
  pendingQuestion: '与客户 Y 沟通的主导人是销售经理还是您亲自出面?',
  pending_user_id: 'u_001',
  pendingUserName: '张志强',
  options: [
    { id: 'opt_1', label: '销售经理主导', isRecommended: true },
    { id: 'opt_2', label: '我亲自出面', isRecommended: false },
    { id: 'opt_3', label: '指定其他人', isRecommended: false, isFollowup: true }
  ]
};

// ========== 活跃控制规则 ==========
export const MOCK_ACTIVE_CONTROLS: ActiveControl[] = [
  { type: 'auto_escalation', ruleText: '财务总额 > 50 万元 → 自动 @CEO', currentlyActive: true },
  { type: 'anomaly_keyword', ruleText: '出现「删除BOM」类关键词 → 自动冻结', currentlyActive: true },
  { type: 'audit_trail', ruleText: '所有 @ 链路完整留痕,可追溯', currentlyActive: true }
];

// ========== 视野计数 ==========
export const MOCK_SCOPE_COUNTS: ScopeCounts = {
  pending: 2,
  watching: 5,
  decided: 47,
  global: 5,
  restricted: 0
};

// ========== 9. 通知数据 ==========
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n_001',
    user_id: 'u_001',
    notification_type: 'ESCALATED',
    title: '#1284 等您决策',
    preview: '客户 X 加急订单是否接单 · 需您决策:与客户 Y 沟通由谁主导?',
    topic_id: '#1284',
    is_read: false,
    created_at: '2026-05-13T14:05:30Z'
  },
  {
    id: 'n_002',
    user_id: 'u_001',
    notification_type: 'ESCALATED',
    title: '#1281 等您终审',
    preview: '电芯供应商 B 资格审查 · 采购总监已批,需您终审',
    topic_id: '#1281',
    is_read: false,
    created_at: '2026-05-13T09:15:00Z'
  },
  {
    id: 'n_003',
    user_id: 'u_001',
    notification_type: 'TOPIC_DECIDED',
    title: '#1247 已结案',
    preview: '客户 Z 加急订单决策 · 李建国已决策',
    topic_id: '#1247',
    is_read: true,
    created_at: '2026-04-21T15:35:00Z'
  }
];

// ========== 12. 决策日志数据 ==========
export const MOCK_DECISION_LOGS: DecisionLog[] = [
  {
    id: 'dlog_1247',
    topic_id: '#1247',
    decision_type: 'APPROVE',
    decided_by_user_id: 'u_002',
    decision_text: '接单,前 50 套加严检验,销售主导沟通',
    ai_consensus_at_time: '接单,前 50 套加严检验,销售主导沟通',
    override_reason: null,
    created_at: '2026-04-21T15:30:00Z'
  },
  {
    id: 'dlog_1156',
    topic_id: '#1156',
    decision_type: 'OVERRIDE',
    decided_by_user_id: 'u_002',
    decision_text: '建立产线优先级矩阵 + 触发条件清单 + 周度评审机制',
    ai_consensus_at_time: '建立产线优先级矩阵',
    override_reason: 'AI 共识仅覆盖矩阵规则,但实际操作中还需要触发条件清单和评审机制,缺一不可',
    created_at: '2026-01-25T16:45:00Z'
  }
];

// ========== 11. 资产引用关系数据 ==========
export const MOCK_ASSET_REFERENCES: AssetReference[] = [
  {
    id: 'ref_001',
    source_asset_id: 'ast_1247_05',
    target_topic_id: '#1284',
    reference_type: 'INIT_DRAFT',
    created_at: '2026-05-13T14:02:00Z'
  },
  {
    id: 'ref_002',
    source_asset_id: 'ast_1156_05',
    target_topic_id: '#1284',
    reference_type: 'INLINE_CITE',
    created_at: '2026-05-13T14:04:00Z'
  }
];

// ========== 获取议题完整数据 ==========
export function getIssueData(issueId: string) {
  const issue = MOCK_ISSUES.find(i => i.id === issueId);
  if (!issue) return null;

  return {
    issue,
    messages: issueId === '#1284' ? MOCK_MESSAGES_1284 : [],
    assets: issueId === '#1284' ? MOCK_ASSETS_1284 : [],
    resolutionStatus: issueId === '#1284' ? MOCK_RESOLUTION_STATUS_1284 : null,
    activeControls: MOCK_ACTIVE_CONTROLS
  };
}

// ========== 获取用户视野计数 ==========
export function getScopeCounts(userId: string): ScopeCounts {
  // CEO视角
  if (userId === 'u_001') {
    return { pending: 2, watching: 5, decided: 47, global: 5, restricted: 0 };
  }
  // 生产副总裁视角
  if (userId === 'u_002') {
    return { pending: 3, watching: 8, decided: 47, global: 15, restricted: 12 };
  }
  // 计划经理视角
  if (userId === 'u_004') {
    return { pending: 1, watching: 4, decided: 15, restricted: 6 };
  }
  // 默认
  return { pending: 0, watching: 0, decided: 0, restricted: 0 };
}

// ========== 获取用户通知 ==========
export function getNotifications(userId: string): Notification[] {
  return MOCK_NOTIFICATIONS.filter(n => n.user_id === userId);
}
