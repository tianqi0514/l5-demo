import type {
  Issue, Message, DecisionAsset, ActiveControl, ResolutionStatus,
  IssueStatus, IssueCategory, RoleId, User, Agent, ScopeCounts,
  Notification, DecisionLog, AssetReference
} from '../types/decision';

export const MOCK_USERS: User[] = [
  { id: 'u_001', role_id: 'ceo', name: '王建国', title: 'CEO', department: '集团', email: 'ceo@laiyifen.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_002', role_id: 'vp_prod', name: '李秀英', title: '运营副总裁', department: '运营', email: 'vp.ops@laiyifen.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_003', role_id: 'vp_sales', name: '张明德', title: '营销副总裁', department: '营销', email: 'vp.mkt@laiyifen.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_004', role_id: 'mgr_plan', name: '陈志强', title: '商品总监', department: '商品部', email: 'director.product@laiyifen.com', factory_scope: ['EAST','NORTH'], product_line_scope: ['SNACK','NUT'], is_active: true },
  { id: 'u_005', role_id: 'mgr_process', name: '刘芳华', title: '运营总监', department: '运营部', email: 'director.ops@laiyifen.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_006', role_id: 'mgr_quality', name: '赵敏', title: '品控总监', department: '品控部', email: 'director.qc@laiyifen.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_007', role_id: 'mgr_finance', name: '周建华', title: '财务总监', department: '财务部', email: 'cfo@laiyifen.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_008', role_id: 'mgr_sales', name: '孙丽', title: '营销总监', department: '营销部', email: 'director.mkt@laiyifen.com', factory_scope: ['EAST','SOUTH'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_009', role_id: 'mgr_purchase', name: '吴强', title: '采购总监', department: '采购部', email: 'director.procurement@laiyifen.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_010', role_id: 'mgr_factory', name: '郑勇', title: '华东大区总', department: '华东大区', email: 'gm.east@laiyifen.com', factory_scope: ['EAST'], product_line_scope: ['ALL'], is_active: true },
];

export const MOCK_AGENTS: Agent[] = [
  { id: 'a_product', user_id: 'u_004', display_name: '商品选品Agent', avatar_initial: '商', stance_config: { risk_preference: 'balanced', key_constraints: ['毛利率>35%', '动销率>80%'], delegation_scope: ['选品建议','品类规划','定价策略'] }, knowledge_sources: ['商品本体','销售数据','竞品数据'], is_active: true, last_synced_at: '2026-05-10T09:00:00Z' },
  { id: 'a_ops', user_id: 'u_005', display_name: '门店运营Agent', avatar_initial: '运', stance_config: { risk_preference: 'balanced', key_constraints: ['坪效达标','人效达标'], delegation_scope: ['排班优化','坪效分析','关店评估'] }, knowledge_sources: ['门店本体','客流数据','坪效历史'], is_active: true, last_synced_at: '2026-05-08T14:30:00Z' },
  { id: 'a_qc', user_id: 'u_006', display_name: '品控Agent', avatar_initial: '品', stance_config: { risk_preference: 'conservative', key_constraints: ['食品安全零事故','保质期预警'], delegation_scope: ['食安预警','临期预警','供应商评估'] }, knowledge_sources: ['品控本体','食安法规','供应商档案'], is_active: true, last_synced_at: '2026-05-11T10:15:00Z' },
  { id: 'a_finance', user_id: 'u_007', display_name: '财务分析Agent', avatar_initial: '财', stance_config: { risk_preference: 'balanced', key_constraints: ['ROI>15%','现金流健康'], delegation_scope: ['预算评估','ROI测算','促销损益'] }, knowledge_sources: ['财务本体','预算系统','历史损益'], is_active: true, last_synced_at: '2026-05-09T16:00:00Z' },
  { id: 'a_mkt', user_id: 'u_008', display_name: '营销Agent', avatar_initial: '营', stance_config: { risk_preference: 'aggressive', key_constraints: ['会员复购率>40%','获客成本可控'], delegation_scope: ['促销策略','会员运营','投放优化'] }, knowledge_sources: ['会员本体','营销本体','历史活动数据'], is_active: true, last_synced_at: '2026-05-12T11:00:00Z' },
  { id: 'a_supply', user_id: 'u_009', display_name: '供应链Agent', avatar_initial: '供', stance_config: { risk_preference: 'balanced', key_constraints: ['库存周转<25天','缺货率<3%'], delegation_scope: ['库存预警','调拨建议','采购计划'] }, knowledge_sources: ['供应链本体','库存数据','物流数据'], is_active: true, last_synced_at: '2026-05-10T08:30:00Z' },
  { id: 'a_coord', user_id: null, display_name: '协调Agent', avatar_initial: '协', stance_config: { risk_preference: 'balanced', key_constraints: ['共识可识别','冲突可定位'], delegation_scope: ['议题分类','共识总结','升级判断'] }, knowledge_sources: ['全部本体','治理规则'], is_active: true, last_synced_at: '2026-05-13T00:00:00Z' },
];

export const ROLES: Record<RoleId, { name: string; department: string; isAgent: boolean }> = {
  'ceo': { name: 'CEO', department: '集团', isAgent: false },
  'vp_prod': { name: '运营副总裁', department: '运营', isAgent: false },
  'vp_sales': { name: '营销副总裁', department: '营销', isAgent: false },
  'mgr_plan': { name: '商品总监', department: '商品部', isAgent: true },
  'mgr_process': { name: '运营总监', department: '运营部', isAgent: true },
  'mgr_quality': { name: '品控总监', department: '品控部', isAgent: true },
  'mgr_finance': { name: '财务总监', department: '财务部', isAgent: true },
  'mgr_sales': { name: '营销总监', department: '营销部', isAgent: true },
  'mgr_purchase': { name: '采购总监', department: '采购部', isAgent: true },
  'mgr_factory': { name: '华东大区总', department: '华东大区', isAgent: true },
  'coord_agent': { name: '协调Agent', department: '系统', isAgent: true },
};

export const CURRENT_USER: User = MOCK_USERS[0];

export const MOCK_ISSUE_1284: Issue = {
  id: '#1284',
  title: '华东大区618促销活动预算审批',
  description: '营销部申请华东大区618大促活动预算680万元，覆盖上海/杭州/南京300家门店，预计带动GMV 4200万。需评估ROI及对各门店库存压力。',
  status: 'PENDING_HUMAN',
  urgency: 'urgent',
  sensitivity: 'normal',
  creator_user_id: 'u_008',
  creatorName: '孙丽',
  participant_role_ids: ['mgr_plan','mgr_process','mgr_quality','mgr_finance','mgr_sales','coord_agent'],
  ontology_node_ids: ['node_promotion','node_store','node_inventory','node_profit'],
  parent_topic_id: null,
  referenced_asset_ids: ['ast_1247_05'],
  source_template_id: null,
  pending_user_id: 'u_001',
  pendingUserName: '王建国',
  created_at: '2026-05-13T14:02:00Z',
  updated_at: '2026-05-13T14:05:30Z',
  decided_at: null,
  decided_by_user_id: null,
  final_resolution: null,
  referencedIssues: [
    { id: '#1247', title: '双11华东促销复盘', resolution: '批准预算580万，实际ROI 1:5.2，会员增长12%' }
  ]
};

export const MOCK_ISSUE_1281: Issue = {
  id: '#1281',
  title: '坚果供应商H资质审查',
  description: '新增坚果供应商「新疆良品H系列」，采购总监初审通过，需CEO终审。涉及未来6个月内30%的坚果类供货比例。',
  status: 'PENDING_HUMAN',
  urgency: 'normal',
  sensitivity: 'normal',
  creator_user_id: 'u_009',
  creatorName: '吴强',
  participant_role_ids: ['mgr_purchase','mgr_quality','mgr_finance','coord_agent'],
  ontology_node_ids: ['node_supplier','node_product','node_quality'],
  created_at: '2026-05-13T08:30:00Z',
  updated_at: '2026-05-13T09:15:00Z',
  pending_user_id: 'u_001',
  pendingUserName: '王建国'
};

export const MOCK_ISSUE_1278: Issue = {
  id: '#1278',
  title: 'Q2门店翻新预算调整',
  description: '华东大区50家老旧门店翻新预算需追加280万。运营部门认为必要提升坪效，财务部门认为可分批执行。',
  status: 'PENDING_HUMAN',
  urgency: 'normal',
  sensitivity: 'normal',
  creator_user_id: 'u_010',
  creatorName: '郑勇',
  participant_role_ids: ['mgr_process','mgr_finance','mgr_factory','coord_agent'],
  ontology_node_ids: ['node_store','node_budget'],
  created_at: '2026-05-12T11:00:00Z',
  updated_at: '2026-05-12T11:45:00Z',
  pending_user_id: 'u_002',
  pendingUserName: '李秀英'
};

export const MOCK_ISSUE_1275: Issue = {
  id: '#1275',
  title: '杭州西湖店食品安全异常处置',
  description: '杭州西湖店5月13日上午发现一批坚果礼盒（批号LYF250518）临近保质期，涉及库存320盒，价值2.8万。',
  status: 'OPEN',
  urgency: 'urgent',
  sensitivity: 'normal',
  creator_user_id: 'u_006',
  creatorName: '赵敏',
  participant_role_ids: ['mgr_quality','mgr_process','mgr_sales','mgr_factory','coord_agent'],
  ontology_node_ids: ['node_quality','node_batch','node_traceability'],
  created_at: '2026-05-13T10:20:00Z',
  updated_at: '2026-05-13T10:35:00Z'
};

export const MOCK_ISSUE_1265: Issue = {
  id: '#1265',
  title: '考虑终止供应商D合作',
  description: '[内容仅对白名单用户可见]',
  status: 'SUSPENDED',
  urgency: 'normal',
  sensitivity: 'sensitive',
  creator_user_id: 'u_009',
  creatorName: '吴强',
  participant_role_ids: ['mgr_purchase','coord_agent'],
  whitelist_user_ids: ['u_001','u_002','u_009'],
  ontology_node_ids: ['node_supplier_exit'],
  created_at: '2026-05-10T14:00:00Z',
  updated_at: '2026-05-10T14:00:30Z'
};

export const MOCK_ISSUES: Issue[] = [MOCK_ISSUE_1284, MOCK_ISSUE_1281, MOCK_ISSUE_1278, MOCK_ISSUE_1275, MOCK_ISSUE_1265];

export const MOCK_MESSAGES_1284: Message[] = [
  {
    id: 'msg_1284_001',
    topic_id: '#1284',
    author_type: 'agent',
    author_id: 'a_mkt',
    author_display: '营销',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '华东大区618活动预算680万，预计覆盖300家门店，目标GMV 4200万。当前库存可支撑活动前2周。@商品 评估选品是否充足，@财务 测算整体ROI。',
    mentions: [
      { start: 52, end: 55, type: 'ROLE', target_role_id: 'mgr_plan', target_display: '商品' },
      { start: 62, end: 65, type: 'ROLE', target_role_id: 'mgr_finance', target_display: '财务' }
    ],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_promotion','node_store'] },
    attached_data: null,
    is_pinned: false,
    created_at: '2026-05-13T14:02:15Z',
    created_at_display: '14:02'
  },
  {
    id: 'msg_1284_002',
    topic_id: '#1284',
    author_type: 'agent',
    author_id: 'a_product',
    author_display: '商品',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '重点促销SKU 45个，库存充足率92%。坚果礼盒和肉脯系列库存偏紧，建议提前加订或替换为同类高毛利SKU。',
    mentions: [],
    reply_to_message_id: 'msg_1284_001',
    reasoning_path: { ontology_refs: ['node_product','node_inventory'] },
    attached_data: { sku_count: 45, inventory_rate: 0.92, tight_categories: ['坚果礼盒','肉脯'] },
    is_pinned: false,
    created_at: '2026-05-13T14:03:08Z',
    created_at_display: '14:03'
  },
  {
    id: 'msg_1284_003',
    topic_id: '#1284',
    author_type: 'agent',
    author_id: 'a_qc',
    author_display: '品控',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '加订坚果礼盒需注意供应商H首批货保质期，建议抽检比例提升至10%。肉脯系列库存均在安全期内。',
    mentions: [],
    reply_to_message_id: 'msg_1284_002',
    reasoning_path: { ontology_refs: ['node_quality','node_supplier'] },
    attached_data: { inspect_rate: 0.10 },
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
    content: '预算680万，预估GMV 4200万，综合毛利率38%，扣除促销折扣后净收益约+420万。ROI约1:5.2。建议批准。',
    mentions: [],
    reply_to_message_id: 'msg_1284_001',
    reasoning_path: { ontology_refs: ['node_profit','node_cost'] },
    attached_data: { budget: 6800000, gmv: 42000000, margin: 0.38, net_benefit: 4200000, roi: 5.2 },
    is_pinned: false,
    created_at: '2026-05-13T14:04:21Z',
    created_at_display: '14:04'
  },
  {
    id: 'msg_1284_005',
    topic_id: '#1284',
    author_type: 'agent',
    author_id: 'a_supply',
    author_display: '供应链',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '活动期间日均销量预计提升3倍，华东DC库存可支撑5天，需提前3天补货。物流运力充足，但杭州仓周末需加派人手。@运营 确认门店收货排班。',
    mentions: [
      { start: 68, end: 71, type: 'ROLE', target_role_id: 'mgr_process', target_display: '运营' }
    ],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_warehouse','node_distribution'] },
    attached_data: { daily_boost: 3, dc_coverage_days: 5 },
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
    content: '共识达成：批准618促销预算680万，商品提前加订坚果礼盒(10%加严抽检)，供应链提前3天补货，运营确认门店排班。需 @CEO 决策：是否追加杭州仓周末物流人力？',
    mentions: [
      { start: 67, end: 71, type: 'ESCALATE', target_role_id: 'ceo', target_display: 'CEO' }
    ],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_consensus','node_decision_required'] },
    attached_data: null,
    is_pinned: true,
    created_at: '2026-05-13T14:05:30Z',
    created_at_display: '14:05'
  }
];

export const MOCK_ASSETS_1284: DecisionAsset[] = [
  {
    type: '01',
    typeName: 'ISSUE_PROFILE',
    content: {
      category: 'customer_urgent_order',
      tags: ['促销活动','618大促','华东大区','预算审批'],
      entities: [
        { type: 'region', id: 'EAST', name: '华东大区' },
        { type: 'promotion', id: '618', name: '618大促' },
        { type: 'store', id: '300', name: '300家门店' },
        { type: 'budget', id: '680', name: '680万预算' }
      ],
      summary: '华东大区618促销预算审批 · 跨区域多门店协同类',
      autoGenerated: true
    }
  },
  {
    type: '02',
    typeName: 'KEY_TRADEOFFS',
    content: {
      tradeoffs: [
        { sideA: 'GMV增长(4200万目标)', sideB: '促销折扣对毛利率压缩', weightA: 0.6, weightB: 0.4, reasoning: '618大促是全年GMV重要来源，折扣后仍保持38%毛利率' },
        { sideA: '库存充足(92%满足率)', sideB: '坚果礼盒加订风险', weightA: 0.7, weightB: 0.3, reasoning: '通过10%加严抽检和替换SKU可有效控制风险' }
      ]
    }
  },
  {
    type: '03',
    typeName: 'DECISION_BASIS',
    content: {
      dataPoints: [
        { name: '预算总额', value: '680万', source: '营销部申请', confidence: 'high' },
        { name: '目标GMV', value: '4200万', source: '营销预测模型', confidence: 'high' },
        { name: 'SKU充足率', value: '92%', source: '商品库存系统', confidence: 'high' },
        { name: '综合毛利率', value: '38%', source: '财务测算', confidence: 'high' },
        { name: '预估净收益', value: '+420万', source: '财务Agent', confidence: 'medium' },
        { name: 'ROI', value: '1:5.2', source: '历史活动对比', confidence: 'medium' }
      ]
    }
  },
  {
    type: '04',
    typeName: 'CONCLUSION',
    content: {
      resolutionText: '批准618促销预算680万，商品加订+品控抽检+供应链补货',
      resolutionType: 'pending'
    }
  },
  {
    type: '05',
    typeName: 'REUSABLE_RULE',
    content: {
      ruleText: '大促活动预算类议题 → 调用本议题决策路径作初稿(ROI测算+库存评估+品控抽检)',
      triggerPattern: {
        category: 'customer_urgent_order',
        conditions: [
          { field: '活动类型', operator: 'in', value: ['618','双11','年货节'] },
          { field: '预算金额', operator: 'gte', value: 5000000 }
        ]
      },
      recommendedAction: '财务ROI测算+商品库存评估+品控抽检+供应链补货计划',
      applicableScope: {
        plants: ['EAST','NORTH','SOUTH','WEST'],
        productionLines: ['SNACK','NUT','MEAT','CANDY'],
        customerTiers: ['A级','战略']
      },
      confidenceScore: 0.88,
      humanApproved: false
    }
  }
];

export const MOCK_RESOLUTION_STATUS_1284: ResolutionStatus = {
  consensusSummary: '批准618促销预算680万 · 商品加订+品控抽检+供应链补货',
  pendingQuestion: '是否追加杭州仓周末物流人力?',
  pending_user_id: 'u_001',
  pendingUserName: '王建国',
  options: [
    { id: 'opt_1', label: '追加物流人力(+5万)', isRecommended: true },
    { id: 'opt_2', label: '维持现有运力', isRecommended: false },
    { id: 'opt_3', label: '调配其他仓库支援', isRecommended: false, isFollowup: true }
  ]
};

export const MOCK_ACTIVE_CONTROLS: ActiveControl[] = [
  { type: 'auto_escalation', ruleText: '促销预算 > 500万元 → 自动 @CEO', currentlyActive: true },
  { type: 'anomaly_keyword', ruleText: '出现「食品安全」「临期」类关键词 → 自动冻结', currentlyActive: true },
  { type: 'audit_trail', ruleText: '所有 @ 链路完整留痕,可追溯', currentlyActive: true }
];

export const MOCK_SCOPE_COUNTS: ScopeCounts = {
  pending: 2,
  watching: 5,
  decided: 47,
  global: 5,
  restricted: 0
};

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n_001',
    user_id: 'u_001',
    notification_type: 'ESCALATED',
    title: '#1284 等您决策',
    preview: '华东大区618促销活动预算审批 · 需您决策:是否追加杭州仓物流人力?',
    topic_id: '#1284',
    is_read: false,
    created_at: '2026-05-13T14:05:30Z'
  },
  {
    id: 'n_002',
    user_id: 'u_001',
    notification_type: 'ESCALATED',
    title: '#1281 等您终审',
    preview: '坚果供应商H资质审查 · 采购总监已批,需您终审',
    topic_id: '#1281',
    is_read: false,
    created_at: '2026-05-13T09:15:00Z'
  },
  {
    id: 'n_003',
    user_id: 'u_001',
    notification_type: 'TOPIC_DECIDED',
    title: '#1247 已结案',
    preview: '双11华东促销复盘 · 李秀英已决策',
    topic_id: '#1247',
    is_read: true,
    created_at: '2026-04-21T15:35:00Z'
  }
];

export const MOCK_DECISION_LOGS: DecisionLog[] = [
  {
    id: 'dlog_1247',
    topic_id: '#1247',
    decision_type: 'APPROVE',
    decided_by_user_id: 'u_002',
    decision_text: '批准预算580万，实际ROI 1:5.2，会员增长12%',
    ai_consensus_at_time: '批准预算580万，实际ROI 1:5.2，会员增长12%',
    override_reason: null,
    created_at: '2026-04-21T15:30:00Z'
  },
  {
    id: 'dlog_1156',
    topic_id: '#1156',
    decision_type: 'OVERRIDE',
    decided_by_user_id: 'u_002',
    decision_text: '建立促销审批矩阵 + 触发条件清单 + 月度评审机制',
    ai_consensus_at_time: '建立促销审批矩阵',
    override_reason: 'AI共识仅覆盖矩阵规则，但实际操作中还需要触发条件清单和评审机制',
    created_at: '2026-01-25T16:45:00Z'
  }
];

export const MOCK_ASSET_REFERENCES: AssetReference[] = [
  { id: 'ref_001', source_asset_id: 'ast_1247_05', target_topic_id: '#1284', reference_type: 'INIT_DRAFT', created_at: '2026-05-13T14:02:00Z' },
  { id: 'ref_002', source_asset_id: 'ast_1156_05', target_topic_id: '#1284', reference_type: 'INLINE_CITE', created_at: '2026-05-13T14:04:00Z' }
];

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

export function getScopeCounts(userId: string): ScopeCounts {
  if (userId === 'u_001') return { pending: 2, watching: 5, decided: 47, global: 5, restricted: 0 };
  if (userId === 'u_002') return { pending: 3, watching: 8, decided: 47, global: 15, restricted: 12 };
  if (userId === 'u_004') return { pending: 1, watching: 4, decided: 15, restricted: 6 };
  return { pending: 0, watching: 0, decided: 0, restricted: 0 };
}

export function getNotifications(userId: string): Notification[] {
  return MOCK_NOTIFICATIONS.filter(n => n.user_id === userId);
}
