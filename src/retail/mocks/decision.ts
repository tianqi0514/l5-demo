import type {
  Issue, Message, DecisionAsset, ActiveControl, ResolutionStatus,
  IssueStatus, IssueCategory, RoleId, User, Agent, ScopeCounts,
  Notification, DecisionLog, AssetReference
} from '../types/decision';

// ============================================================
// MOCK_USERS (10 users)
// ============================================================
export const MOCK_USERS: User[] = [
  { id: 'u_001', role_id: 'ceo', name: '王建国', title: 'CEO', department: '集团', email: 'ceo@retail.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_002', role_id: 'vp_prod', name: '李秀英', title: '运营副总裁', department: '运营', email: 'vp.ops@retail.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_003', role_id: 'vp_sales', name: '张明德', title: '营销副总裁', department: '营销', email: 'vp.mkt@retail.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_004', role_id: 'mgr_plan', name: '陈志强', title: '商品总监', department: '商品部', email: 'director.product@retail.com', factory_scope: ['EAST','NORTH'], product_line_scope: ['SNACK','NUT'], is_active: true },
  { id: 'u_005', role_id: 'mgr_process', name: '刘芳华', title: '运营总监', department: '运营部', email: 'director.ops@retail.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_006', role_id: 'mgr_quality', name: '赵敏', title: '品控总监', department: '品控部', email: 'director.qc@retail.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_007', role_id: 'mgr_finance', name: '周建华', title: '财务总监', department: '财务部', email: 'cfo@retail.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_008', role_id: 'mgr_sales', name: '孙丽', title: '营销总监', department: '营销部', email: 'director.mkt@retail.com', factory_scope: ['EAST','SOUTH'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_009', role_id: 'mgr_purchase', name: '吴强', title: '采购总监', department: '采购部', email: 'director.procurement@retail.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_010', role_id: 'mgr_factory', name: '郑勇', title: '华东大区总', department: '华东大区', email: 'gm.east@retail.com', factory_scope: ['EAST'], product_line_scope: ['ALL'], is_active: true },
];

// ============================================================
// MOCK_AGENTS (7 agents)
// ============================================================
export const MOCK_AGENTS: Agent[] = [
  { id: 'a_product', user_id: 'u_004', display_name: '商品选品Agent', avatar_initial: '商', stance_config: { risk_preference: 'balanced', key_constraints: ['毛利率>35%','动销率>80%'], delegation_scope: ['选品建议','品类规划','定价策略'] }, knowledge_sources: ['商品本体','销售数据','竞品数据'], is_active: true, last_synced_at: '2026-05-10T09:00:00Z' },
  { id: 'a_ops', user_id: 'u_005', display_name: '门店运营Agent', avatar_initial: '运', stance_config: { risk_preference: 'balanced', key_constraints: ['坪效达标','人效达标'], delegation_scope: ['排班优化','坪效分析','关店评估'] }, knowledge_sources: ['门店本体','客流数据','坪效历史'], is_active: true, last_synced_at: '2026-05-08T14:30:00Z' },
  { id: 'a_qc', user_id: 'u_006', display_name: '品控Agent', avatar_initial: '品', stance_config: { risk_preference: 'conservative', key_constraints: ['食品安全零事故','保质期预警'], delegation_scope: ['食安预警','临期预警','供应商评估'] }, knowledge_sources: ['品控本体','食安法规','供应商档案'], is_active: true, last_synced_at: '2026-05-11T10:15:00Z' },
  { id: 'a_finance', user_id: 'u_007', display_name: '财务分析Agent', avatar_initial: '财', stance_config: { risk_preference: 'balanced', key_constraints: ['ROI>15%','现金流健康'], delegation_scope: ['预算评估','ROI测算','促销损益'] }, knowledge_sources: ['财务本体','预算系统','历史损益'], is_active: true, last_synced_at: '2026-05-09T16:00:00Z' },
  { id: 'a_mkt', user_id: 'u_008', display_name: '营销Agent', avatar_initial: '营', stance_config: { risk_preference: 'aggressive', key_constraints: ['会员复购率>40%','获客成本可控'], delegation_scope: ['促销策略','会员运营','投放优化'] }, knowledge_sources: ['会员本体','营销本体','历史活动数据'], is_active: true, last_synced_at: '2026-05-12T11:00:00Z' },
  { id: 'a_supply', user_id: 'u_009', display_name: '供应链Agent', avatar_initial: '供', stance_config: { risk_preference: 'balanced', key_constraints: ['库存周转<25天','缺货率<3%'], delegation_scope: ['库存预警','调拨建议','采购计划'] }, knowledge_sources: ['供应链本体','库存数据','物流数据'], is_active: true, last_synced_at: '2026-05-10T08:30:00Z' },
  { id: 'a_coord', user_id: null, display_name: '协调Agent', avatar_initial: '协', stance_config: { risk_preference: 'balanced', key_constraints: ['共识可识别','冲突可定位'], delegation_scope: ['议题分类','共识总结','升级判断'] }, knowledge_sources: ['全部本体','治理规则'], is_active: true, last_synced_at: '2026-05-13T00:00:00Z' },
];

// ============================================================
// ROLES record
// ============================================================
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

// ============================================================
// CURRENT_USER
// ============================================================
export const CURRENT_USER: User = MOCK_USERS[0];

// ============================================================
// ISSUE #1284 - 华东大区618促销活动预算审批 (ENHANCED)
// ============================================================
export const MOCK_ISSUE_1284: Issue = {
  id: '#1284',
  title: '华东大区618促销活动预算审批',
  description: '营销部申请华东大区618大促活动预算680万元，覆盖上海/杭州/南京300家门店，预计带动GMV 4200万。需评估ROI及对各门店库存压力。',
  category: 'customer_urgent_order',
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
    content: '重点促销SKU 45个，库存充足率92%。坚果礼盒和肉脯系列库存偏紧，建议提前加订或替换为同类高毛利SKU。其中坚果礼盒缺口约8000盒，肉脯缺口约5000袋。',
    mentions: [],
    reply_to_message_id: 'msg_1284_001',
    reasoning_path: { ontology_refs: ['node_product','node_inventory'] },
    attached_data: { sku_count: 45, inventory_rate: 0.92, tight_categories: ['坚果礼盒','肉脯'], gap_nuts: 8000, gap_meat: 5000 },
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
    content: '加订坚果礼盒需注意供应商H首批货保质期，建议抽检比例提升至10%。肉脯系列库存均在安全期内。另外提醒：活动期间门店端需加强临期品巡检频次，建议每日2次。',
    mentions: [],
    reply_to_message_id: 'msg_1284_002',
    reasoning_path: { ontology_refs: ['node_quality','node_supplier'] },
    attached_data: { inspect_rate: 0.10, daily_check: 2 },
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
    content: '预算680万，预估GMV 4200万，综合毛利率38%，扣除促销折扣后净收益约+420万。ROI约1:5.2。会员拉新预计8万人，获客成本85元/人，低于Q1均值92元。建议批准。',
    mentions: [],
    reply_to_message_id: 'msg_1284_001',
    reasoning_path: { ontology_refs: ['node_profit','node_cost'] },
    attached_data: { budget: 6800000, gmv: 42000000, margin: 0.38, net_benefit: 4200000, roi: 5.2, new_members: 80000, cac: 85 },
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
    content: '活动期间日均销量预计提升3倍，华东DC库存可支撑5天，需提前3天补货。物流运力充足，但杭州仓周末需加派人手。@运营 确认门店收货排班。加订坚果礼盒预计交期5月18日。',
    mentions: [
      { start: 68, end: 71, type: 'ROLE', target_role_id: 'mgr_process', target_display: '运营' }
    ],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_warehouse','node_distribution'] },
    attached_data: { daily_boost: 3, dc_coverage_days: 5, delivery_date: '2026-05-18' },
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
      tags: ['促销活动','618大促','华东大区','预算审批','GMV增长'],
      entities: [
        { type: 'region', id: 'EAST', name: '华东大区' },
        { type: 'promotion', id: '618', name: '618大促' },
        { type: 'store', id: '300', name: '300家门店' },
        { type: 'budget', id: '680', name: '680万预算' },
        { type: 'gmv_target', id: '4200', name: '4200万GMV目标' }
      ],
      summary: '华东大区618促销预算审批 · 跨区域多门店协同类 · 预计ROI 1:5.2',
      autoGenerated: true
    }
  },
  {
    type: '02',
    typeName: 'KEY_TRADEOFFS',
    content: {
      tradeoffs: [
        { sideA: 'GMV增长(4200万目标)', sideB: '促销折扣对毛利率压缩', weightA: 0.6, weightB: 0.4, reasoning: '618大促是全年GMV重要来源，折扣后仍保持38%毛利率，净收益正向' },
        { sideA: '库存充足(92%满足率)', sideB: '坚果礼盒加订风险', weightA: 0.7, weightB: 0.3, reasoning: '通过10%加严抽检和替换SKU可有效控制风险，加订交期可控' },
        { sideA: '会员拉新(8万人)', sideB: '获客成本上升压力', weightA: 0.65, weightB: 0.35, reasoning: '获客成本85元/人低于Q1均值92元，会员增长可持续' }
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
        { name: 'ROI', value: '1:5.2', source: '历史活动对比', confidence: 'medium' },
        { name: '会员拉新', value: '8万人', source: '营销预测', confidence: 'medium' },
        { name: '获客成本', value: '85元/人', source: 'Q1数据对比', confidence: 'high' }
      ]
    }
  },
  {
    type: '04',
    typeName: 'CONCLUSION',
    content: {
      resolutionText: '批准618促销预算680万，商品加订+品控抽检+供应链补货',
      resolutionType: 'pending',
      escalationPath: ['CEO审批']
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

// ============================================================
// ISSUE #1281 - 坚果供应商H资质审查 (NEW FULL)
// ============================================================
export const MOCK_ISSUE_1281: Issue = {
  id: '#1281',
  title: '坚果供应商H资质审查',
  description: '新增坚果供应商「新疆良品H系列」，主营新疆核桃、巴旦木、开心果等。采购总监初审通过，需CEO终审。涉及未来6个月内30%的坚果类供货比例，年度采购额预计1200万。',
  category: 'supplier_qualification',
  status: 'PENDING_HUMAN',
  urgency: 'normal',
  sensitivity: 'normal',
  creator_user_id: 'u_009',
  creatorName: '吴强',
  participant_role_ids: ['mgr_purchase','mgr_quality','mgr_finance','coord_agent'],
  ontology_node_ids: ['node_supplier','node_product','node_quality','node_cost'],
  parent_topic_id: null,
  referenced_asset_ids: [],
  source_template_id: null,
  pending_user_id: 'u_001',
  pendingUserName: '王建国',
  created_at: '2026-05-13T08:30:00Z',
  updated_at: '2026-05-13T09:15:00Z',
  decided_at: null,
  decided_by_user_id: null,
  final_resolution: null,
  referencedIssues: [
    { id: '#1156', title: '供应商准入标准修订', resolution: '建立三级准入评估体系' }
  ]
};

export const MOCK_MESSAGES_1281: Message[] = [
  {
    id: 'msg_1281_001',
    topic_id: '#1281',
    author_type: 'agent',
    author_id: 'a_supply',
    author_display: '采购',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '新疆良品H系列供应商资质初审完成。主营新疆核桃(年产500吨)、巴旦木(年产300吨)、开心果(年产200吨)。报价较现有供应商D低12%，账期30天。已提交营业执照、食品生产许可证、ISO22000认证。请 @品控 评估质检能力，@财务 审核财务风险。',
    mentions: [
      { start: 95, end: 98, type: 'ROLE', target_role_id: 'mgr_quality', target_display: '品控' },
      { start: 104, end: 107, type: 'ROLE', target_role_id: 'mgr_finance', target_display: '财务' }
    ],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_supplier','node_cost'] },
    attached_data: { price_advantage: 0.12, payment_term: 30, annual_volume: 1000 },
    is_pinned: false,
    created_at: '2026-05-13T08:30:15Z',
    created_at_display: '08:30'
  },
  {
    id: 'msg_1281_002',
    topic_id: '#1281',
    author_type: 'agent',
    author_id: 'a_qc',
    author_display: '品控',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '质检能力评估：H系列自有实验室，具备黄曲霉毒素B1、大肠菌群、过氧化值等关键指标检测能力。但重金属检测需外送第三方，周期3-5天。建议首批到货100%全检，后续批次按5%抽检。供应商历史无食安事故记录，信用良好。',
    mentions: [],
    reply_to_message_id: 'msg_1281_001',
    reasoning_path: { ontology_refs: ['node_quality','node_supplier'] },
    attached_data: { first_inspect: 1.0, routine_inspect: 0.05, heavy_metal_outsource: true },
    is_pinned: false,
    created_at: '2026-05-13T08:45:22Z',
    created_at_display: '08:45'
  },
  {
    id: 'msg_1281_003',
    topic_id: '#1281',
    author_type: 'agent',
    author_id: 'a_finance',
    author_display: '财务',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '财务风险评估：注册资本5000万，资产负债率42%，流动比率1.8，信用等级AA。年度采购额1200万占其营收约15%，依赖性适中。报价低12%预计年节省144万，但需考虑新疆至华东物流成本增加约28万/年。净节省约116万/年。',
    mentions: [],
    reply_to_message_id: 'msg_1281_001',
    reasoning_path: { ontology_refs: ['node_cost','node_profit'] },
    attached_data: { registered_capital: 50000000, debt_ratio: 0.42, current_ratio: 1.8, credit_rating: 'AA', annual_saving: 1160000 },
    is_pinned: false,
    created_at: '2026-05-13T09:00:08Z',
    created_at_display: '09:00'
  },
  {
    id: 'msg_1281_004',
    topic_id: '#1281',
    author_type: 'agent',
    author_id: 'a_coord',
    author_display: '协调',
    author_color_class: 'accent',
    message_type: 'CONSENSUS',
    content: '共识达成：供应商H资质基本合格，质检能力满足要求(首批100%全检)，财务风险可控(AA级)。建议 @CEO 决策：是否批准准入？可选条件通过(首批全检+季度审核)或直接通过。',
    mentions: [
      { start: 52, end: 56, type: 'ESCALATE', target_role_id: 'ceo', target_display: 'CEO' }
    ],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_consensus','node_decision_required'] },
    attached_data: null,
    is_pinned: true,
    created_at: '2026-05-13T09:15:00Z',
    created_at_display: '09:15'
  }
];

export const MOCK_ASSETS_1281: DecisionAsset[] = [
  {
    type: '01',
    typeName: 'ISSUE_PROFILE',
    content: {
      category: 'supplier_qualification',
      tags: ['供应商准入','坚果类','新疆产地','成本优化'],
      entities: [
        { type: 'supplier', id: 'H', name: '新疆良品H系列' },
        { type: 'product', id: 'NUT', name: '坚果类' },
        { type: 'region', id: 'XINJIANG', name: '新疆' },
        { type: 'budget', id: '1200', name: '1200万年采购额' }
      ],
      summary: '坚果供应商H资质审查 · 新供应商准入评估 · 预计年节省116万',
      autoGenerated: true
    }
  },
  {
    type: '02',
    typeName: 'KEY_TRADEOFFS',
    content: {
      tradeoffs: [
        { sideA: '采购成本降低12%(年省116万)', sideB: '新供应商磨合风险', weightA: 0.55, weightB: 0.45, reasoning: '成本优势明显，但需首批100%全检和季度审核降低磨合风险' },
        { sideA: '货源多元化(降低集中度风险)', sideB: '管理复杂度增加', weightA: 0.6, weightB: 0.4, reasoning: '当前坚果类过度依赖供应商D，引入H可分散风险' },
        { sideA: '新疆产地品质优势', sideB: '物流成本增加28万/年', weightA: 0.7, weightB: 0.3, reasoning: '新疆坚果品质口碑好，物流增量在可接受范围内' }
      ]
    }
  },
  {
    type: '03',
    typeName: 'DECISION_BASIS',
    content: {
      dataPoints: [
        { name: '报价优势', value: '低12%', source: '采购部比价', confidence: 'high' },
        { name: '注册资本', value: '5000万', source: '营业执照', confidence: 'high' },
        { name: '资产负债率', value: '42%', source: '财务报表', confidence: 'high' },
        { name: '信用等级', value: 'AA', source: '第三方征信', confidence: 'high' },
        { name: '年采购额', value: '1200万', source: '采购预测', confidence: 'medium' },
        { name: '年净节省', value: '116万', source: '财务测算', confidence: 'medium' },
        { name: '首批检测', value: '100%全检', source: '品控要求', confidence: 'high' },
        { name: '历史食安事故', value: '0起', source: '信用查询', confidence: 'high' }
      ]
    }
  },
  {
    type: '04',
    typeName: 'CONCLUSION',
    content: {
      resolutionText: '供应商H资质基本合格，建议条件通过(首批100%全检+季度审核)',
      resolutionType: 'pending',
      escalationPath: ['CEO终审']
    }
  },
  {
    type: '05',
    typeName: 'REUSABLE_RULE',
    content: {
      ruleText: '新供应商准入评估 → 采购初审+品控质检能力评估+财务风险评估+CEO终审',
      triggerPattern: {
        category: 'supplier_qualification',
        conditions: [
          { field: '供应商类型', operator: 'in', value: ['新准入','复评'] },
          { field: '年采购额', operator: 'gte', value: 500000 }
        ]
      },
      recommendedAction: '三级评估：采购资质初审→品控质检评估→财务风险评估→CEO终审',
      applicableScope: {
        plants: ['ALL'],
        productionLines: ['NUT','SNACK','MEAT','CANDY'],
        customerTiers: ['ALL']
      },
      confidenceScore: 0.92,
      humanApproved: true
    }
  }
];

export const MOCK_RESOLUTION_STATUS_1281: ResolutionStatus = {
  consensusSummary: '供应商H资质基本合格 · 建议条件通过',
  pendingQuestion: '是否批准供应商H准入？',
  pending_user_id: 'u_001',
  pendingUserName: '王建国',
  options: [
    { id: 'opt_1', label: '直接通过', isRecommended: false },
    { id: 'opt_2', label: '条件通过(首批全检+季度审核)', isRecommended: true },
    { id: 'opt_3', label: '暂不通过', isRecommended: false }
  ]
};

// ============================================================
// ISSUE #1278 - Q2门店翻新预算调整 (NEW FULL)
// ============================================================
export const MOCK_ISSUE_1278: Issue = {
  id: '#1278',
  title: 'Q2门店翻新预算调整',
  description: '华东大区50家老旧门店(开业5年以上)翻新预算需追加280万。运营部门认为必要提升坪效和客户体验，财务部门认为可分批执行以降低现金流压力。',
  category: 'budget_adjustment',
  status: 'PENDING_HUMAN',
  urgency: 'normal',
  sensitivity: 'normal',
  creator_user_id: 'u_010',
  creatorName: '郑勇',
  participant_role_ids: ['mgr_process','mgr_finance','mgr_factory','coord_agent'],
  ontology_node_ids: ['node_store','node_budget','node_profit'],
  parent_topic_id: null,
  referenced_asset_ids: [],
  source_template_id: null,
  pending_user_id: 'u_002',
  pendingUserName: '李秀英',
  created_at: '2026-05-12T11:00:00Z',
  updated_at: '2026-05-12T11:45:00Z',
  decided_at: null,
  decided_by_user_id: null,
  final_resolution: null,
  referencedIssues: [
    { id: '#1201', title: 'Q1门店翻新效果评估', resolution: '翻新门店坪效提升18%，客单价提升12%' }
  ]
};

export const MOCK_MESSAGES_1278: Message[] = [
  {
    id: 'msg_1278_001',
    topic_id: '#1278',
    author_type: 'agent',
    author_id: 'a_ops',
    author_display: '运营',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '华东大区50家老旧门店(平均开业6.2年)翻新申请，原预算520万，现需追加280万。主要因装修材料涨价15%及新增智能收银系统。预计翻新后坪效提升15-20%，客单价提升10%。@财务 请评估追加预算合理性。',
    mentions: [
      { start: 78, end: 81, type: 'ROLE', target_role_id: 'mgr_finance', target_display: '财务' }
    ],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_store','node_budget'] },
    attached_data: { original_budget: 5200000, additional: 2800000, store_count: 50, avg_age: 6.2 },
    is_pinned: false,
    created_at: '2026-05-12T11:00:15Z',
    created_at_display: '11:00'
  },
  {
    id: 'msg_1278_002',
    topic_id: '#1278',
    author_type: 'agent',
    author_id: 'a_finance',
    author_display: '财务',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '追加280万后总预算800万，单店成本16万。按Q1翻新数据(坪效提升18%)测算，投资回收期约14个月。但Q2已有3个大型项目(618促销、会员系统升级、供应链改造)，现金流压力较大。建议分两批执行：第一批25家(400万)5月启动，第二批25家(400万)8月启动。',
    mentions: [],
    reply_to_message_id: 'msg_1278_001',
    reasoning_path: { ontology_refs: ['node_cost','node_profit'] },
    attached_data: { total_budget: 8000000, per_store: 160000, payback_months: 14, batch1: 25, batch2: 25 },
    is_pinned: false,
    created_at: '2026-05-12T11:15:30Z',
    created_at_display: '11:15'
  },
  {
    id: 'msg_1278_003',
    topic_id: '#1278',
    author_type: 'agent',
    author_id: 'a_ops',
    author_display: '区域',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '区域影响评估：50家门店中，A类商圈18家(优先翻新)、B类商圈22家、C类商圈10家。建议第一批优先A类+B类重点门店(共25家)，预计影响最小。翻新期间单店停业7天，需安排临时促销转移客流。杭州西湖店、南京新街口店因客流量大，建议夜间施工不停业。',
    mentions: [],
    reply_to_message_id: 'msg_1278_002',
    reasoning_path: { ontology_refs: ['node_store','node_distribution'] },
    attached_data: { a_class: 18, b_class: 22, c_class: 10, closure_days: 7 },
    is_pinned: false,
    created_at: '2026-05-12T11:30:45Z',
    created_at_display: '11:30'
  },
  {
    id: 'msg_1278_004',
    topic_id: '#1278',
    author_type: 'agent',
    author_id: 'a_coord',
    author_display: '协调',
    author_color_class: 'accent',
    message_type: 'CONSENSUS',
    content: '共识达成：同意门店翻新必要性，但建议分两批执行以缓解Q2现金流压力。第一批25家(A类+B类重点)5月启动，第二批25家8月启动。需 @运营副总裁 决策：是否批准分两批执行方案？',
    mentions: [
      { start: 62, end: 68, type: 'ESCALATE', target_role_id: 'vp_prod', target_display: '运营副总裁' }
    ],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_consensus','node_decision_required'] },
    attached_data: null,
    is_pinned: true,
    created_at: '2026-05-12T11:45:00Z',
    created_at_display: '11:45'
  }
];

export const MOCK_ASSETS_1278: DecisionAsset[] = [
  {
    type: '01',
    typeName: 'ISSUE_PROFILE',
    content: {
      category: 'budget_adjustment',
      tags: ['门店翻新','预算追加','华东大区','坪效提升','现金流'],
      entities: [
        { type: 'region', id: 'EAST', name: '华东大区' },
        { type: 'store', id: '50', name: '50家门店' },
        { type: 'budget', id: '800', name: '800万总预算' },
        { type: 'additional', id: '280', name: '追加280万' }
      ],
      summary: 'Q2门店翻新预算调整 · 50家老旧门店 · 分两批执行方案',
      autoGenerated: true
    }
  },
  {
    type: '02',
    typeName: 'KEY_TRADEOFFS',
    content: {
      tradeoffs: [
        { sideA: '一次性翻新(快速见效)', sideB: '分批执行(缓解现金流)', weightA: 0.4, weightB: 0.6, reasoning: 'Q2已有3个大型项目，现金流紧张，分批执行更稳妥' },
        { sideA: '翻新投入(800万)', sideB: '坪效提升收益(回收期14月)', weightA: 0.35, weightB: 0.65, reasoning: 'Q1翻新数据验证坪效提升18%，投资回收期合理' },
        { sideA: '停业翻新(7天/店)', sideB: '夜间施工(成本+30%)', weightA: 0.7, weightB: 0.3, reasoning: '仅重点门店夜间施工，其余正常停业即可' }
      ]
    }
  },
  {
    type: '03',
    typeName: 'DECISION_BASIS',
    content: {
      dataPoints: [
        { name: '门店数量', value: '50家', source: '运营统计', confidence: 'high' },
        { name: '平均店龄', value: '6.2年', source: '门店档案', confidence: 'high' },
        { name: '原预算', value: '520万', source: 'Q2预算', confidence: 'high' },
        { name: '追加金额', value: '280万', source: '运营申请', confidence: 'high' },
        { name: '总预算', value: '800万', source: '财务测算', confidence: 'high' },
        { name: '单店成本', value: '16万', source: '财务测算', confidence: 'high' },
        { name: '坪效提升', value: '15-20%', source: 'Q1翻新数据', confidence: 'medium' },
        { name: '投资回收期', value: '14个月', source: '财务模型', confidence: 'medium' }
      ]
    }
  },
  {
    type: '04',
    typeName: 'CONCLUSION',
    content: {
      resolutionText: '同意分两批执行：第一批25家5月启动，第二批25家8月启动',
      resolutionType: 'pending',
      escalationPath: ['运营副总裁审批']
    }
  },
  {
    type: '05',
    typeName: 'REUSABLE_RULE',
    content: {
      ruleText: '门店翻新预算追加类议题 → 参考坪效提升数据+投资回收期+现金流压力评估',
      triggerPattern: {
        category: 'budget_adjustment',
        conditions: [
          { field: '议题类型', operator: 'eq', value: '门店翻新' },
          { field: '追加金额', operator: 'gte', value: 1000000 }
        ]
      },
      recommendedAction: '评估投资回收期+现金流影响+分批执行可行性',
      applicableScope: {
        plants: ['EAST','NORTH','SOUTH','WEST'],
        productionLines: ['ALL'],
        customerTiers: ['ALL']
      },
      confidenceScore: 0.85,
      humanApproved: false
    }
  }
];

export const MOCK_RESOLUTION_STATUS_1278: ResolutionStatus = {
  consensusSummary: '同意门店翻新必要性 · 建议分两批执行',
  pendingQuestion: '是否批准分两批执行方案？',
  pending_user_id: 'u_002',
  pendingUserName: '李秀英',
  options: [
    { id: 'opt_1', label: '批准分两批执行', isRecommended: true },
    { id: 'opt_2', label: '一次性执行(800万)', isRecommended: false },
    { id: 'opt_3', label: '驳回追加，维持原预算', isRecommended: false }
  ]
};

// ============================================================
// ISSUE #1275 - 杭州西湖店食品安全异常处置 (NEW FULL)
// ============================================================
export const MOCK_ISSUE_1275: Issue = {
  id: '#1275',
  title: '杭州西湖店食品安全异常处置',
  description: '杭州西湖店5月13日上午发现一批坚果礼盒(批号LYF250518，生产日期2025-05-18，保质期6个月)临近保质期(剩余15天)，涉及库存320盒，价值2.8万。同时发现同批次在途库存150盒。',
  category: 'quality_anomaly',
  status: 'OPEN',
  urgency: 'urgent',
  sensitivity: 'normal',
  creator_user_id: 'u_006',
  creatorName: '赵敏',
  participant_role_ids: ['mgr_quality','mgr_process','mgr_sales','mgr_factory','coord_agent'],
  ontology_node_ids: ['node_quality','node_batch','node_traceability','node_store'],
  parent_topic_id: null,
  referenced_asset_ids: [],
  source_template_id: null,
  created_at: '2026-05-13T10:20:00Z',
  updated_at: '2026-05-13T10:35:00Z'
};

export const MOCK_MESSAGES_1275: Message[] = [
  {
    id: 'msg_1275_001',
    topic_id: '#1275',
    author_type: 'agent',
    author_id: 'a_qc',
    author_display: '品控',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '【食安预警】杭州西湖店坚果礼盒(批号LYF250518)临期预警触发。生产日期2025-05-18，保质期6个月，剩余15天。门店库存320盒，在途150盒，总价值2.8万。该批次涉及供应商D，同期发货共2000盒，已分销至华东大区28家门店。@门店 请立即下架该批次，@供应链 启动溯源追踪。',
    mentions: [
      { start: 118, end: 121, type: 'ROLE', target_role_id: 'mgr_process', target_display: '门店' },
      { start: 129, end: 133, type: 'ROLE', target_role_id: 'mgr_purchase', target_display: '供应链' }
    ],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_quality','node_batch'] },
    attached_data: { batch_no: 'LYF250518', store_stock: 320, transit: 150, total_value: 28000, affected_stores: 28 },
    is_pinned: false,
    created_at: '2026-05-13T10:20:15Z',
    created_at_display: '10:20'
  },
  {
    id: 'msg_1275_002',
    topic_id: '#1275',
    author_type: 'agent',
    author_id: 'a_ops',
    author_display: '门店',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '杭州西湖店已立即下架批号LYF250518坚果礼盒320盒，放置于临期品专区。已通知店员禁止销售。建议：1) 临期15天内可打折促销(5折)；2) 转移至企业团购渠道；3) 退回DC统一处理。请 @营销 评估促销可行性，避免食安风险同时减少损失。',
    mentions: [
      { start: 89, end: 92, type: 'ROLE', target_role_id: 'mgr_sales', target_display: '营销' }
    ],
    reply_to_message_id: 'msg_1275_001',
    reasoning_path: { ontology_refs: ['node_store','node_batch'] },
    attached_data: { removed: 320, options: ['打折促销','团购渠道','退回DC'] },
    is_pinned: false,
    created_at: '2026-05-13T10:25:30Z',
    created_at_display: '10:25'
  },
  {
    id: 'msg_1275_003',
    topic_id: '#1275',
    author_type: 'agent',
    author_id: 'a_supply',
    author_display: '供应链',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '溯源追踪完成：批号LYF250518共生产2000盒，已分销28家门店。各门店库存情况：杭州区域8家(库存+在途共580盒)，上海区域12家(720盒)，南京区域8家(350盒)。建议：1) 全部门店立即下架；2) 在途150盒改道退回DC；3) 联系供应商D协商退换货。预计可回收价值约1.8万(按退货价)。',
    mentions: [],
    reply_to_message_id: 'msg_1275_001',
    reasoning_path: { ontology_refs: ['node_traceability','node_distribution'] },
    attached_data: { total_produced: 2000, hangzhou: 580, shanghai: 720, nanjing: 350, recoverable: 18000 },
    is_pinned: false,
    created_at: '2026-05-13T10:30:45Z',
    created_at_display: '10:30'
  },
  {
    id: 'msg_1275_004',
    topic_id: '#1275',
    author_type: 'agent',
    author_id: 'a_mkt',
    author_display: '运营',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '处置方案评估：临期15天不建议门店端促销(食安风险高)。建议：1) 全部下架退回DC；2) DC端统一做员工内购(3折，仅限内部)；3) 剩余部分捐赠公益(可抵税)。预计损失：总货值2.8万 - 内购回收0.6万 - 抵税0.3万 = 净损失约1.9万。此方案食安风险最低。',
    mentions: [],
    reply_to_message_id: 'msg_1275_002',
    reasoning_path: { ontology_refs: ['node_cost','node_quality'] },
    attached_data: { total_loss: 19000, internal_sale: 6000, tax_deduction: 3000 },
    is_pinned: false,
    created_at: '2026-05-13T10:35:00Z',
    created_at_display: '10:35'
  }
];

export const MOCK_ASSETS_1275: DecisionAsset[] = [
  {
    type: '01',
    typeName: 'ISSUE_PROFILE',
    content: {
      category: 'quality_anomaly',
      tags: ['食品安全','临期预警','坚果礼盒','批次追溯','杭州西湖店'],
      entities: [
        { type: 'store', id: 'HZ_XIHU', name: '杭州西湖店' },
        { type: 'batch', id: 'LYF250518', name: '批号LYF250518' },
        { type: 'product', id: 'NUT_GIFT', name: '坚果礼盒' },
        { type: 'supplier', id: 'D', name: '供应商D' },
        { type: 'value', id: '28000', name: '货值2.8万' }
      ],
      summary: '杭州西湖店食品安全异常处置 · 临期预警 · 28家门店批次追溯',
      autoGenerated: true
    }
  },
  {
    type: '02',
    typeName: 'KEY_TRADEOFFS',
    content: {
      tradeoffs: [
        { sideA: '门店促销(减少损失)', sideB: '食安风险(品牌声誉)', weightA: 0.2, weightB: 0.8, reasoning: '临期15天门店促销食安风险极高，品牌声誉损失远超货值' },
        { sideA: '全部退回DC(统一管理)', sideB: '分散处理(效率低)', weightA: 0.8, weightB: 0.2, reasoning: '统一退回DC便于集中处理和内购/捐赠' },
        { sideA: '供应商追责(退换货)', sideB: '快速处置(降低影响)', weightA: 0.5, weightB: 0.5, reasoning: '可同时推进：快速处置+事后追责' }
      ]
    }
  },
  {
    type: '03',
    typeName: 'DECISION_BASIS',
    content: {
      dataPoints: [
        { name: '批号', value: 'LYF250518', source: '品控系统', confidence: 'high' },
        { name: '生产日期', value: '2025-05-18', source: '批次记录', confidence: 'high' },
        { name: '保质期', value: '6个月', source: '产品标准', confidence: 'high' },
        { name: '剩余天数', value: '15天', source: '临期预警', confidence: 'high' },
        { name: '门店库存', value: '320盒', source: '门店盘点', confidence: 'high' },
        { name: '在途库存', value: '150盒', source: '物流系统', confidence: 'high' },
        { name: '涉及门店', value: '28家', source: '分销记录', confidence: 'high' },
        { name: '总货值', value: '2.8万', source: '财务系统', confidence: 'high' }
      ]
    }
  },
  {
    type: '04',
    typeName: 'CONCLUSION',
    content: {
      resolutionText: '全部下架退回DC，统一内购+捐赠处置，预计净损失1.9万',
      resolutionType: 'pending'
    }
  },
  {
    type: '05',
    typeName: 'REUSABLE_RULE',
    content: {
      ruleText: '临期品处置(剩余<30天) → 立即下架+溯源追踪+统一退回DC+内购/捐赠',
      triggerPattern: {
        category: 'quality_anomaly',
        conditions: [
          { field: '剩余保质期', operator: 'lte', value: 30 },
          { field: '产品类型', operator: 'in', value: ['坚果','肉脯','糕点'] }
        ]
      },
      recommendedAction: '立即下架→溯源追踪→统一退回→内购/捐赠→供应商追责',
      applicableScope: {
        plants: ['ALL'],
        productionLines: ['NUT','MEAT','PASTRY'],
        customerTiers: ['ALL']
      },
      confidenceScore: 0.95,
      humanApproved: true
    }
  }
];

export const MOCK_RESOLUTION_STATUS_1275: ResolutionStatus = {
  consensusSummary: '全部下架退回DC · 统一内购+捐赠处置',
  pendingQuestion: '确认处置方案执行？',
  options: [
    { id: 'opt_1', label: '执行内购+捐赠方案', isRecommended: true },
    { id: 'opt_2', label: '仅做下架销毁', isRecommended: false },
    { id: 'opt_3', label: '联系供应商D全额退货', isRecommended: false, isFollowup: true }
  ]
};

// ============================================================
// ISSUE #1265 - 考虑终止供应商D合作 (KEEP, sensitive)
// ============================================================
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

export const MOCK_MESSAGES_1265: Message[] = [];
export const MOCK_ASSETS_1265: DecisionAsset[] = [];
export const MOCK_RESOLUTION_STATUS_1265: ResolutionStatus = {
  consensusSummary: '议题已暂停，仅白名单用户可见',
  options: []
};

// ============================================================
// ISSUE #1290 - 上海五角场新店选址评估 (NEW)
// ============================================================
export const MOCK_ISSUE_1290: Issue = {
  id: '#1290',
  title: '上海五角场新店选址评估',
  description: '拓展部提交上海五角场商圈新店选址方案，预计面积120平米，月租8.5万，装修投入约180万。商圈日均客流12万，周边3公里竞品门店5家。需评估投资回报和品类匹配度。',
  category: 'capacity_allocation',
  status: 'PENDING_HUMAN',
  urgency: 'normal',
  sensitivity: 'normal',
  creator_user_id: 'u_005',
  creatorName: '刘芳华',
  participant_role_ids: ['mgr_process','mgr_finance','mgr_plan','mgr_sales','coord_agent'],
  ontology_node_ids: ['node_store','node_profit','node_product','node_competition'],
  parent_topic_id: null,
  referenced_asset_ids: [],
  source_template_id: null,
  pending_user_id: 'u_002',
  pendingUserName: '李秀英',
  created_at: '2026-05-14T09:00:00Z',
  updated_at: '2026-05-14T10:30:00Z',
  decided_at: null,
  decided_by_user_id: null,
  final_resolution: null,
  referencedIssues: [
    { id: '#1220', title: '上海静安寺店选址复盘', resolution: '签约入驻，月销达成率105%' }
  ]
};

export const MOCK_MESSAGES_1290: Message[] = [
  {
    id: 'msg_1290_001',
    topic_id: '#1290',
    author_type: 'agent',
    author_id: 'a_ops',
    author_display: '拓展',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '上海五角场商圈新店选址方案：面积120平米，月租8.5万(含物业)，位置在万达广场B1层美食区入口。商圈日均客流12万，周末峰值18万。周边3公里内来伊份现有门店2家(距离2.8km和3.2km)，竞品5家(三只松鼠、良品铺子等)。预计首年营收目标480万。@运营 评估坪效可行性。',
    mentions: [
      { start: 118, end: 121, type: 'ROLE', target_role_id: 'mgr_process', target_display: '运营' }
    ],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_store','node_competition'] },
    attached_data: { area: 120, monthly_rent: 85000, daily_traffic: 120000, competitors: 5, target_revenue: 4800000 },
    is_pinned: false,
    created_at: '2026-05-14T09:00:15Z',
    created_at_display: '09:00'
  },
  {
    id: 'msg_1290_002',
    topic_id: '#1290',
    author_type: 'agent',
    author_id: 'a_ops',
    author_display: '运营',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '坪效预测：120平米，按行业标杆坪效3.5万/平米/年计算，年营收可达420万。但五角场商圈客单价较高(预估85元)，且美食区入口位置优越，实际坪效有望达4万/平米/年(年营收480万)。人效方面需配置8人(含店长)，月人力成本约6万。盈亏平衡点月营收约35万。',
    mentions: [],
    reply_to_message_id: 'msg_1290_001',
    reasoning_path: { ontology_refs: ['node_store','node_profit'] },
    attached_data: { pingxiao_target: 40000, staff_count: 8, labor_cost: 60000, break_even: 350000 },
    is_pinned: false,
    created_at: '2026-05-14T09:15:30Z',
    created_at_display: '09:15'
  },
  {
    id: 'msg_1290_003',
    topic_id: '#1290',
    author_type: 'agent',
    author_id: 'a_finance',
    author_display: '财务',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '投资回报测算：装修投入180万(分3年摊销)，月租8.5万，人力6万，水电杂费1.5万，月固定成本约16万。按年营收480万、毛利率42%计算，月毛利16.8万，净利润约0.8万/月。投资回收期约22个月。建议：若首年营收可达500万，回收期可缩短至18个月。',
    mentions: [],
    reply_to_message_id: 'msg_1290_001',
    reasoning_path: { ontology_refs: ['node_cost','node_profit'] },
    attached_data: { renovation: 1800000, monthly_fixed: 160000, monthly_profit: 8000, payback_months: 22 },
    is_pinned: false,
    created_at: '2026-05-14T09:30:45Z',
    created_at_display: '09:30'
  },
  {
    id: 'msg_1290_004',
    topic_id: '#1290',
    author_type: 'agent',
    author_id: 'a_product',
    author_display: '商品',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '品类匹配评估：五角场商圈年轻客群占比65%，建议SKU结构偏年轻化——坚果类30%、肉脯20%、进口零食15%、烘焙10%、饮料25%。避免过多传统糕点。可引入联名款和季节限定款提升差异化。预计首铺货约25万，周转天数控制在20天内。',
    mentions: [],
    reply_to_message_id: 'msg_1290_001',
    reasoning_path: { ontology_refs: ['node_product','node_store'] },
    attached_data: { young_ratio: 0.65, sku_mix: { nut: 0.3, meat: 0.2, import: 0.15, bakery: 0.1, drink: 0.25 }, initial_stock: 250000 },
    is_pinned: false,
    created_at: '2026-05-14T10:00:00Z',
    created_at_display: '10:00'
  },
  {
    id: 'msg_1290_005',
    topic_id: '#1290',
    author_type: 'agent',
    author_id: 'a_coord',
    author_display: '协调',
    author_color_class: 'accent',
    message_type: 'CONSENSUS',
    content: '共识达成：五角场选址条件良好，商圈客流充足，品类匹配年轻客群。投资回收期22个月在可接受范围。建议 @运营副总裁 决策：是否签约入驻？可选方案：1) 直接签约；2) 再考察1个月(观察周末客流稳定性)；3) 放弃，寻找替代点位。',
    mentions: [
      { start: 52, end: 58, type: 'ESCALATE', target_role_id: 'vp_prod', target_display: '运营副总裁' }
    ],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_consensus','node_decision_required'] },
    attached_data: null,
    is_pinned: true,
    created_at: '2026-05-14T10:30:00Z',
    created_at_display: '10:30'
  }
];

export const MOCK_ASSETS_1290: DecisionAsset[] = [
  {
    type: '01',
    typeName: 'ISSUE_PROFILE',
    content: {
      category: 'capacity_allocation',
      tags: ['新店选址','上海','五角场','投资回报','坪效评估'],
      entities: [
        { type: 'city', id: 'SHANGHAI', name: '上海' },
        { type: 'location', id: 'WUJIAOCHANG', name: '五角场商圈' },
        { type: 'store', id: 'NEW', name: '新店' },
        { type: 'area', id: '120', name: '120平米' },
        { type: 'budget', id: '180', name: '180万装修' }
      ],
      summary: '上海五角场新店选址评估 · 商圈客流12万/日 · 投资回收期22个月',
      autoGenerated: true
    }
  },
  {
    type: '02',
    typeName: 'KEY_TRADEOFFS',
    content: {
      tradeoffs: [
        { sideA: '商圈优势(客流12万/日)', sideB: '竞品密集(5家)', weightA: 0.6, weightB: 0.4, reasoning: '来伊份品牌认知度高，位置在美食区入口有流量优势' },
        { sideA: '年轻化品类(差异化)', sideB: '传统品类库存风险', weightA: 0.7, weightB: 0.3, reasoning: '商圈年轻客群65%，年轻化品类匹配度高' },
        { sideA: '签约入驻(抢占位置)', sideB: '再考察(降低风险)', weightA: 0.55, weightB: 0.45, reasoning: '优质铺位稀缺，延迟可能被竞品抢占' }
      ]
    }
  },
  {
    type: '03',
    typeName: 'DECISION_BASIS',
    content: {
      dataPoints: [
        { name: '店铺面积', value: '120平米', source: '拓展部', confidence: 'high' },
        { name: '月租金', value: '8.5万', source: '租赁合同', confidence: 'high' },
        { name: '装修投入', value: '180万', source: '工程预算', confidence: 'high' },
        { name: '日均客流', value: '12万', source: '商圈数据', confidence: 'medium' },
        { name: '竞品数量', value: '5家', source: '市场调研', confidence: 'high' },
        { name: '年营收目标', value: '480万', source: '运营预测', confidence: 'medium' },
        { name: '毛利率', value: '42%', source: '财务测算', confidence: 'medium' },
        { name: '投资回收期', value: '22个月', source: '财务模型', confidence: 'medium' }
      ]
    }
  },
  {
    type: '04',
    typeName: 'CONCLUSION',
    content: {
      resolutionText: '建议签约入驻，投资回收期22个月可接受',
      resolutionType: 'pending',
      escalationPath: ['运营副总裁审批']
    }
  },
  {
    type: '05',
    typeName: 'REUSABLE_RULE',
    content: {
      ruleText: '新店选址评估 → 商圈客流+竞品分析+坪效预测+投资回报+品类匹配',
      triggerPattern: {
        category: 'capacity_allocation',
        conditions: [
          { field: '议题类型', operator: 'eq', value: '新店选址' },
          { field: '投资金额', operator: 'gte', value: 1000000 }
        ]
      },
      recommendedAction: '拓展评估→运营坪效预测→财务投资回报→商品品类匹配→决策',
      applicableScope: {
        plants: ['EAST','NORTH','SOUTH','WEST'],
        productionLines: ['ALL'],
        customerTiers: ['ALL']
      },
      confidenceScore: 0.87,
      humanApproved: false
    }
  }
];

export const MOCK_RESOLUTION_STATUS_1290: ResolutionStatus = {
  consensusSummary: '选址条件良好 · 建议签约入驻',
  pendingQuestion: '是否签约入驻五角场新店？',
  pending_user_id: 'u_002',
  pendingUserName: '李秀英',
  options: [
    { id: 'opt_1', label: '签约入驻', isRecommended: true },
    { id: 'opt_2', label: '再考察1个月', isRecommended: false },
    { id: 'opt_3', label: '放弃，寻找替代', isRecommended: false }
  ]
};

// ============================================================
// ISSUE #1291 - 中秋月饼礼盒备货决策 (NEW)
// ============================================================
export const MOCK_ISSUE_1291: Issue = {
  id: '#1291',
  title: '中秋月饼礼盒备货决策',
  description: '2026年中秋月饼礼盒备货决策，商品部预测需求8万盒，供应链反馈产能上限6万盒，财务建议控制库存风险。需在加订、维持、减订之间做出决策。中秋为9月25日，备货窗口期剩余约4个月。',
  category: 'capacity_allocation',
  status: 'DISCUSSING',
  urgency: 'urgent',
  sensitivity: 'normal',
  creator_user_id: 'u_004',
  creatorName: '陈志强',
  participant_role_ids: ['mgr_plan','mgr_purchase','mgr_finance','mgr_sales','coord_agent'],
  ontology_node_ids: ['node_product','node_inventory','node_cost','node_promotion'],
  parent_topic_id: null,
  referenced_asset_ids: [],
  source_template_id: null,
  created_at: '2026-05-14T13:00:00Z',
  updated_at: '2026-05-14T14:15:00Z',
  decided_at: null,
  decided_by_user_id: null,
  final_resolution: null,
  referencedIssues: [
    { id: '#1234', title: '2025中秋月饼销售复盘', resolution: '实际销售5.2万盒，库存积压8000盒' }
  ]
};

export const MOCK_MESSAGES_1291: Message[] = [
  {
    id: 'msg_1291_001',
    topic_id: '#1291',
    author_type: 'agent',
    author_id: 'a_product',
    author_display: '商品',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '2026年中秋月饼礼盒需求预测：基于去年销售5.2万盒+今年门店新增50家+会员增长30%，预测需求8万盒。建议SKU 6款(经典款2款、创新款3款、联名款1款)，定价区间128-398元。去年库存积压8000盒主要因创新款滞销，今年需优化SKU结构。@供应链 确认产能情况。',
    mentions: [
      { start: 118, end: 122, type: 'ROLE', target_role_id: 'mgr_purchase', target_display: '供应链' }
    ],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_product','node_inventory'] },
    attached_data: { forecast_demand: 80000, sku_count: 6, price_range: '128-398', last_year_sales: 52000 },
    is_pinned: false,
    created_at: '2026-05-14T13:00:15Z',
    created_at_display: '13:00'
  },
  {
    id: 'msg_1291_002',
    topic_id: '#1291',
    author_type: 'agent',
    author_id: 'a_supply',
    author_display: '供应链',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '产能评估：自有工厂月饼产能上限6万盒/季，外包工厂可追加2万盒但成本+15%。建议：1) 自有工厂满产6万盒(经典款+创新款)；2) 联名款1万盒外包(成本可控)；3) 剩余1万盒缺口需决策：加订外包(成本高)或控制需求。交货期：7月15日前需确定最终订单，8月初开始分批发货。',
    mentions: [],
    reply_to_message_id: 'msg_1291_001',
    reasoning_path: { ontology_refs: ['node_inventory','node_cost'] },
    attached_data: { internal_capacity: 60000, outsource_capacity: 20000, outsource_premium: 0.15, deadline: '2026-07-15' },
    is_pinned: false,
    created_at: '2026-05-14T13:20:30Z',
    created_at_display: '13:20'
  },
  {
    id: 'msg_1291_003',
    topic_id: '#1291',
    author_type: 'agent',
    author_id: 'a_finance',
    author_display: '财务',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '资金占用分析：8万盒按均价228元计算，货值约1824万。自有工厂6万盒成本约980万，外包2万盒成本约350万(+15%)，总成本1330万。库存周转风险：若滞销20%，损失约266万。建议：保守备货7万盒(自有6万+外包1万联名款)，通过预售锁定需求后再决定是否加订。',
    mentions: [],
    reply_to_message_id: 'msg_1291_001',
    reasoning_path: { ontology_refs: ['node_cost','node_profit'] },
    attached_data: { total_value: 18240000, total_cost: 13300000, risk_loss: 2660000, conservative: 70000 },
    is_pinned: false,
    created_at: '2026-05-14T13:40:00Z',
    created_at_display: '13:40'
  },
  {
    id: 'msg_1291_004',
    topic_id: '#1291',
    author_type: 'agent',
    author_id: 'a_mkt',
    author_display: '营销',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '预售策略建议：6月15日启动中秋礼盒预售，通过会员APP和企业团购渠道提前锁定订单。预计预售可覆盖30%需求(约2.4万盒)。联名款(与故宫文创合作)已有企业客户意向订单3000盒。建议：首批备货7万盒，预售达标后再加订1万盒。营销费用预算120万(线上投放+门店陈列)。',
    mentions: [],
    reply_to_message_id: 'msg_1291_003',
    reasoning_path: { ontology_refs: ['node_promotion','node_product'] },
    attached_data: { presale_ratio: 0.3, presale_units: 24000, b2b_intent: 3000, mkt_budget: 1200000 },
    is_pinned: false,
    created_at: '2026-05-14T14:00:00Z',
    created_at_display: '14:00'
  },
  {
    id: 'msg_1291_005',
    topic_id: '#1291',
    author_type: 'agent',
    author_id: 'a_coord',
    author_display: '协调',
    author_color_class: 'accent',
    message_type: 'CONSENSUS',
    content: '初步共识：建议首批备货7万盒(自有6万+外包联名款1万)，6月15日启动预售锁定需求，达标后加订1万盒。需继续讨论：是否接受外包成本+15%的1万盒加订？',
    mentions: [],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_consensus'] },
    attached_data: null,
    is_pinned: true,
    created_at: '2026-05-14T14:15:00Z',
    created_at_display: '14:15'
  }
];

export const MOCK_ASSETS_1291: DecisionAsset[] = [
  {
    type: '01',
    typeName: 'ISSUE_PROFILE',
    content: {
      category: 'capacity_allocation',
      tags: ['中秋备货','月饼礼盒','季节性商品','库存风险','预售策略'],
      entities: [
        { type: 'product', id: 'MOONCAKE', name: '中秋月饼礼盒' },
        { type: 'demand', id: '80000', name: '需求8万盒' },
        { type: 'capacity', id: '60000', name: '产能6万盒' },
        { type: 'festival', id: 'MID_AUTUMN', name: '2026中秋' }
      ],
      summary: '中秋月饼礼盒备货决策 · 需求8万盒vs产能6万盒 · 预售+分批加订策略',
      autoGenerated: true
    }
  },
  {
    type: '02',
    typeName: 'KEY_TRADEOFFS',
    content: {
      tradeoffs: [
        { sideA: '满足需求(8万盒)', sideB: '控制库存风险', weightA: 0.5, weightB: 0.5, reasoning: '去年积压8000盒，今年需平衡需求满足和库存风险' },
        { sideA: '自有工厂(成本低)', sideB: '外包(成本+15%)', weightA: 0.7, weightB: 0.3, reasoning: '优先自有产能，外包仅用于联名款和补充' },
        { sideA: '提前备货(价格锁定)', sideB: '预售后再加订(灵活)', weightA: 0.4, weightB: 0.6, reasoning: '预售可锁定30%需求，降低盲目备货风险' }
      ]
    }
  },
  {
    type: '03',
    typeName: 'DECISION_BASIS',
    content: {
      dataPoints: [
        { name: '需求预测', value: '8万盒', source: '商品预测模型', confidence: 'medium' },
        { name: '去年实际销售', value: '5.2万盒', source: '销售数据', confidence: 'high' },
        { name: '自有产能', value: '6万盒', source: '工厂排产', confidence: 'high' },
        { name: '外包产能', value: '2万盒', source: '供应商确认', confidence: 'medium' },
        { name: '外包溢价', value: '+15%', source: '采购询价', confidence: 'high' },
        { name: '总货值', value: '1824万', source: '财务测算', confidence: 'high' },
        { name: '预售占比', value: '30%', source: '营销预测', confidence: 'medium' },
        { name: '滞销风险', value: '20%', source: '历史数据', confidence: 'medium' }
      ]
    }
  },
  {
    type: '04',
    typeName: 'CONCLUSION',
    content: {
      resolutionText: '首批备货7万盒，预售达标后加订1万盒',
      resolutionType: 'pending'
    }
  },
  {
    type: '05',
    typeName: 'REUSABLE_RULE',
    content: {
      ruleText: '季节性商品备货 → 需求预测+产能评估+预售锁定+分批加订',
      triggerPattern: {
        category: 'capacity_allocation',
        conditions: [
          { field: '商品类型', operator: 'in', value: ['季节性','节日礼盒'] },
          { field: '预测需求', operator: 'gt', value: 50000 }
        ]
      },
      recommendedAction: '商品预测→产能评估→财务风险→预售策略→分批加订',
      applicableScope: {
        plants: ['ALL'],
        productionLines: ['SNACK','NUT','PASTRY'],
        customerTiers: ['ALL']
      },
      confidenceScore: 0.90,
      humanApproved: true
    }
  }
];

export const MOCK_RESOLUTION_STATUS_1291: ResolutionStatus = {
  consensusSummary: '首批备货7万盒 · 预售达标后加订',
  pendingQuestion: '是否接受外包加订1万盒(成本+15%)？',
  options: [
    { id: 'opt_1', label: '加订1万盒(外包)', isRecommended: false },
    { id: 'opt_2', label: '维持7万盒不变', isRecommended: true },
    { id: 'opt_3', label: '减订至6万盒(仅自有)', isRecommended: false }
  ]
};

// ============================================================
// ISSUE #1292 - 钻石会员批量流失预警 (NEW)
// ============================================================
export const MOCK_ISSUE_1292: Issue = {
  id: '#1292',
  title: '钻石会员批量流失预警',
  description: '会员系统监测到近30天钻石会员(年消费>5000元)流失率异常上升至8.5%(正常<3%)，涉及流失会员约1200人。主要流失原因：竞品促销吸引、会员权益感知下降、门店体验问题。需制定挽回方案。',
  category: 'customer_urgent_order',
  status: 'OPEN',
  urgency: 'urgent',
  sensitivity: 'normal',
  creator_user_id: 'u_008',
  creatorName: '孙丽',
  participant_role_ids: ['mgr_sales','mgr_plan','mgr_finance','coord_agent'],
  ontology_node_ids: ['node_member','node_promotion','node_product','node_cost'],
  parent_topic_id: null,
  referenced_asset_ids: [],
  source_template_id: null,
  created_at: '2026-05-14T15:00:00Z',
  updated_at: '2026-05-14T16:30:00Z',
  decided_at: null,
  decided_by_user_id: null,
  final_resolution: null,
  referencedIssues: [
    { id: '#1250', title: 'Q1会员流失分析', resolution: '流失主因价格敏感，推出专属折扣后挽回率35%' }
  ]
};

export const MOCK_MESSAGES_1292: Message[] = [
  {
    id: 'msg_1292_001',
    topic_id: '#1292',
    author_type: 'agent',
    author_id: 'a_mkt',
    author_display: '会员',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '【会员预警】钻石会员近30天流失率异常：8.5%(正常<3%)，流失人数约1200人。流失画像：60%为价格敏感型(被竞品低价吸引)，25%为体验不满型(门店服务投诉)，15%为自然流失(搬家/工作变动)。单会员年均消费6800元，预计年损失约816万。需立即制定挽回方案。@营销 评估促销挽回可行性。',
    mentions: [
      { start: 130, end: 133, type: 'ROLE', target_role_id: 'mgr_sales', target_display: '营销' }
    ],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_member','node_promotion'] },
    attached_data: { churn_rate: 0.085, churn_count: 1200, annual_loss: 8160000, price_sensitive: 0.6, experience: 0.25 },
    is_pinned: false,
    created_at: '2026-05-14T15:00:15Z',
    created_at_display: '15:00'
  },
  {
    id: 'msg_1292_002',
    topic_id: '#1292',
    author_type: 'agent',
    author_id: 'a_mkt',
    author_display: '营销',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '挽回方案：1) 定向召回短信+APP推送，提供「回归礼包」(满200减50券+新品试吃)；2) 电话回访体验不满型会员，赠送专属客服+优先发货权益；3) 价格敏感型匹配竞品价格(精选SKU)。预计召回成本约36万(30元/人)，历史召回率35%，预计挽回420人，挽回价值约286万。ROI约1:7.9。',
    mentions: [],
    reply_to_message_id: 'msg_1292_001',
    reasoning_path: { ontology_refs: ['node_promotion','node_member'] },
    attached_data: { recall_cost: 360000, cost_per_user: 30, historical_rate: 0.35, expected_recall: 420, expected_value: 2860000, roi: 7.9 },
    is_pinned: false,
    created_at: '2026-05-14T15:20:30Z',
    created_at_display: '15:20'
  },
  {
    id: 'msg_1292_003',
    topic_id: '#1292',
    author_type: 'agent',
    author_id: 'a_product',
    author_display: '商品',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '会员权益优化建议：当前钻石会员权益(9.5折+生日礼)感知度下降。建议升级：1) 新增「每月1次免邮」；2) 专属新品优先购；3) 季度会员日双倍积分。权益成本约增加15万/月，但可提升会员活跃度和留存率。同时建议开发「黑钻会员」层级(年消费>1万)，提供更高阶权益形成升级动力。',
    mentions: [],
    reply_to_message_id: 'msg_1292_001',
    reasoning_path: { ontology_refs: ['node_product','node_member'] },
    attached_data: { extra_cost: 150000, new_tier: '黑钻会员', threshold: 10000 },
    is_pinned: false,
    created_at: '2026-05-14T15:45:00Z',
    created_at_display: '15:45'
  },
  {
    id: 'msg_1292_004',
    topic_id: '#1292',
    author_type: 'agent',
    author_id: 'a_finance',
    author_display: '财务',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '成本效益分析：召回成本36万+权益升级成本180万/年(15万x12)，总投入216万/年。预期收益：挽回420人x6800元=286万/年，加上留存提升带来的增量消费约150万/年。净收益约220万/年。但需注意：权益升级后所有钻石会员(1.5万人)均享受，边际成本需重新测算。建议先试点1000人验证效果。',
    mentions: [],
    reply_to_message_id: 'msg_1292_002',
    reasoning_path: { ontology_refs: ['node_cost','node_profit'] },
    attached_data: { total_investment: 2160000, expected_return: 4360000, net_benefit: 2200000, pilot_size: 1000 },
    is_pinned: false,
    created_at: '2026-05-14T16:15:00Z',
    created_at_display: '16:15'
  }
];

export const MOCK_ASSETS_1292: DecisionAsset[] = [
  {
    type: '01',
    typeName: 'ISSUE_PROFILE',
    content: {
      category: 'customer_urgent_order',
      tags: ['会员流失','钻石会员','挽回方案','会员权益','竞品影响'],
      entities: [
        { type: 'member_tier', id: 'DIAMOND', name: '钻石会员' },
        { type: 'churn_count', id: '1200', name: '流失1200人' },
        { type: 'churn_rate', id: '8.5', name: '流失率8.5%' },
        { type: 'annual_loss', id: '816', name: '年损失816万' }
      ],
      summary: '钻石会员批量流失预警 · 流失率8.5% · 预计年损失816万 · 召回+权益升级方案',
      autoGenerated: true
    }
  },
  {
    type: '02',
    typeName: 'KEY_TRADEOFFS',
    content: {
      tradeoffs: [
        { sideA: '召回投入(36万)', sideB: '流失损失(816万)', weightA: 0.8, weightB: 0.2, reasoning: '召回ROI 1:7.9，投入产出比高，应积极召回' },
        { sideA: '权益升级(全量成本)', sideB: '留存提升收益', weightA: 0.45, weightB: 0.55, reasoning: '建议先试点1000人验证效果，再决定是否全量推广' },
        { sideA: '价格匹配(短期挽回)', sideB: '品牌价值(长期)', weightA: 0.3, weightB: 0.7, reasoning: '避免陷入价格战，以权益和服务差异化竞争' }
      ]
    }
  },
  {
    type: '03',
    typeName: 'DECISION_BASIS',
    content: {
      dataPoints: [
        { name: '流失率', value: '8.5%', source: '会员系统', confidence: 'high' },
        { name: '正常流失率', value: '<3%', source: '历史均值', confidence: 'high' },
        { name: '流失人数', value: '1200人', source: '会员系统', confidence: 'high' },
        { name: '单会员年消费', value: '6800元', source: '消费数据', confidence: 'high' },
        { name: '预计年损失', value: '816万', source: '财务测算', confidence: 'medium' },
        { name: '召回成本', value: '36万', source: '营销预算', confidence: 'high' },
        { name: '历史召回率', value: '35%', source: 'Q1数据', confidence: 'medium' },
        { name: '召回ROI', value: '1:7.9', source: '财务测算', confidence: 'medium' }
      ]
    }
  },
  {
    type: '04',
    typeName: 'CONCLUSION',
    content: {
      resolutionText: '启动召回计划+权益升级试点，预计投入216万/年，净收益220万/年',
      resolutionType: 'pending'
    }
  },
  {
    type: '05',
    typeName: 'REUSABLE_RULE',
    content: {
      ruleText: '会员流失预警 → 流失画像分析→召回方案→权益升级→成本效益评估→试点验证',
      triggerPattern: {
        category: 'customer_urgent_order',
        conditions: [
          { field: '流失率', operator: 'gt', value: 0.05 },
          { field: '会员层级', operator: 'in', value: ['钻石','金卡'] }
        ]
      },
      recommendedAction: '立即启动召回+权益升级试点，7天内出试点结果',
      applicableScope: {
        plants: ['ALL'],
        productionLines: ['ALL'],
        customerTiers: ['钻石','金卡']
      },
      confidenceScore: 0.89,
      humanApproved: false
    }
  }
];

export const MOCK_RESOLUTION_STATUS_1292: ResolutionStatus = {
  consensusSummary: '启动召回+权益升级试点',
  pendingQuestion: '确认召回方案执行及试点范围？',
  options: [
    { id: 'opt_1', label: '执行召回+1000人权益试点', isRecommended: true },
    { id: 'opt_2', label: '仅执行召回，暂不升级权益', isRecommended: false },
    { id: 'opt_3', label: '全量升级权益(1.5万人)', isRecommended: false }
  ]
};

// ============================================================
// ISSUE #1293 - 竞品坚果降价应对 (NEW)
// ============================================================
export const MOCK_ISSUE_1293: Issue = {
  id: '#1293',
  title: '竞品坚果降价应对',
  description: '监测到主要竞品「三只松鼠」5月12日起对每日坚果系列降价15%-20%，来伊份同款产品销量近3天下降22%。需决策是否跟进降价、维持价格或采取差异化策略。',
  category: 'pricing_decision',
  status: 'PENDING_HUMAN',
  urgency: 'normal',
  sensitivity: 'normal',
  creator_user_id: 'u_004',
  creatorName: '陈志强',
  participant_role_ids: ['mgr_plan','mgr_finance','mgr_sales','coord_agent'],
  ontology_node_ids: ['node_product','node_cost','node_promotion','node_competition'],
  parent_topic_id: null,
  referenced_asset_ids: [],
  source_template_id: null,
  pending_user_id: 'u_003',
  pendingUserName: '张明德',
  created_at: '2026-05-14T16:00:00Z',
  updated_at: '2026-05-14T17:00:00Z',
  decided_at: null,
  decided_by_user_id: null,
  final_resolution: null,
  referencedIssues: [
    { id: '#1210', title: '2025Q4竞品价格战应对', resolution: '选择性跟降+会员专属价，毛利损失控制在3%以内' }
  ]
};

export const MOCK_MESSAGES_1293: Message[] = [
  {
    id: 'msg_1293_001',
    topic_id: '#1293',
    author_type: 'agent',
    author_id: 'a_product',
    author_display: '数据',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '竞品监控预警：三只松鼠5月12日起每日坚果系列降价15%-20%(原价39.9元→32.9元)。来伊份同款「每日坚果混合装」近3天销量下降22%，客单价下降5%。受影响SKU共8个，占坚果类销售额35%。@商品 评估是否跟进调价。',
    mentions: [
      { start: 95, end: 98, type: 'ROLE', target_role_id: 'mgr_plan', target_display: '商品' }
    ],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_competition','node_product'] },
    attached_data: { competitor_discount: 0.2, sales_drop: 0.22, affected_skus: 8, sales_ratio: 0.35 },
    is_pinned: false,
    created_at: '2026-05-14T16:00:15Z',
    created_at_display: '16:00'
  },
  {
    id: 'msg_1293_002',
    topic_id: '#1293',
    author_type: 'agent',
    author_id: 'a_product',
    author_display: '商品',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '调价影响分析：若跟进降价15%(39.9元→33.9元)，预计销量可恢复至原水平，但单品毛利从45%降至32%，坚果类整体毛利下降约4.5%。若仅对会员降价(会员价33.9元，原价维持39.9元)，可保护毛利同时提升会员转化。第三种方案：推出差异化新品(如「有机坚果系列」)，避开直接价格竞争。',
    mentions: [],
    reply_to_message_id: 'msg_1293_001',
    reasoning_path: { ontology_refs: ['node_product','node_cost'] },
    attached_data: { follow_margin_drop: 0.045, member_only: true, new_product: '有机坚果系列' },
    is_pinned: false,
    created_at: '2026-05-14T16:15:30Z',
    created_at_display: '16:15'
  },
  {
    id: 'msg_1293_003',
    topic_id: '#1293',
    author_type: 'agent',
    author_id: 'a_finance',
    author_display: '财务',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '毛利影响测算：坚果类月销售额约600万。方案A(跟降15%)：月毛利损失约27万，但销量恢复。方案B(会员专享价)：仅影响会员购买部分(约40%)，月毛利损失约11万，同时可提升非会员转化率。方案C(差异化新品)：前期投入研发+包装约50万，但可建立长期差异化优势。建议短期选B，中期推进C。',
    mentions: [],
    reply_to_message_id: 'msg_1293_002',
    reasoning_path: { ontology_refs: ['node_cost','node_profit'] },
    attached_data: { monthly_sales: 6000000, option_a_loss: 270000, option_b_loss: 110000, option_c_invest: 500000 },
    is_pinned: false,
    created_at: '2026-05-14T16:35:00Z',
    created_at_display: '16:35'
  },
  {
    id: 'msg_1293_004',
    topic_id: '#1293',
    author_type: 'agent',
    author_id: 'a_mkt',
    author_display: '营销',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '营销策略建议：不建议直接跟进降价(损害品牌价值)。推荐组合策略：1) 会员专享价(33.9元)限时2周；2) 同步推出「坚果+果干」组合装(差异化SKU，定价45元)；3) 强化「新鲜直采」卖点，突出品质差异。配合小红书/抖音内容营销，强调「不降价但加量」(加赠小包装试吃)。预计营销投入15万，可对冲竞品影响。',
    mentions: [],
    reply_to_message_id: 'msg_1293_002',
    reasoning_path: { ontology_refs: ['node_promotion','node_competition'] },
    attached_data: { member_promo: true, combo_product: true, mkt_invest: 150000 },
    is_pinned: false,
    created_at: '2026-05-14T16:50:00Z',
    created_at_display: '16:50'
  },
  {
    id: 'msg_1293_005',
    topic_id: '#1293',
    author_type: 'agent',
    author_id: 'a_coord',
    author_display: '协调',
    author_color_class: 'accent',
    message_type: 'CONSENSUS',
    content: '共识达成：不建议直接跟进降价。推荐「会员专享价+差异化组合装+内容营销」组合策略。短期保护毛利，中期建立差异化。需 @营销副总裁 决策：是否批准该组合策略？',
    mentions: [
      { start: 52, end: 58, type: 'ESCALATE', target_role_id: 'vp_sales', target_display: '营销副总裁' }
    ],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_consensus','node_decision_required'] },
    attached_data: null,
    is_pinned: true,
    created_at: '2026-05-14T17:00:00Z',
    created_at_display: '17:00'
  }
];

export const MOCK_ASSETS_1293: DecisionAsset[] = [
  {
    type: '01',
    typeName: 'ISSUE_PROFILE',
    content: {
      category: 'pricing_decision',
      tags: ['竞品降价','坚果类','价格战','会员策略','差异化'],
      entities: [
        { type: 'competitor', id: 'THREE_SQUIRREL', name: '三只松鼠' },
        { type: 'product', id: 'DAILY_NUTS', name: '每日坚果' },
        { type: 'discount', id: '20', name: '降价20%' },
        { type: 'impact', id: '22', name: '销量下降22%' }
      ],
      summary: '竞品坚果降价应对 · 三只松鼠降价20% · 来伊份销量下降22% · 组合策略方案',
      autoGenerated: true
    }
  },
  {
    type: '02',
    typeName: 'KEY_TRADEOFFS',
    content: {
      tradeoffs: [
        { sideA: '跟进降价(销量恢复)', sideB: '品牌价值+毛利损失', weightA: 0.3, weightB: 0.7, reasoning: '直接降价损害品牌定位，且毛利损失大(月27万)' },
        { sideA: '会员专享价(精准让利)', sideB: '非会员流失风险', weightA: 0.65, weightB: 0.35, reasoning: '仅影响40%会员购买，同时可提升非会员转化' },
        { sideA: '差异化新品(长期优势)', sideB: '短期销量压力', weightA: 0.55, weightB: 0.45, reasoning: '短期需承受销量压力，但可建立长期竞争壁垒' }
      ]
    }
  },
  {
    type: '03',
    typeName: 'DECISION_BASIS',
    content: {
      dataPoints: [
        { name: '竞品降幅', value: '15-20%', source: '价格监控', confidence: 'high' },
        { name: '销量下降', value: '22%', source: '销售数据', confidence: 'high' },
        { name: '受影响SKU', value: '8个', source: '商品系统', confidence: 'high' },
        { name: '销售占比', value: '35%', source: '品类分析', confidence: 'high' },
        { name: '坚果类月销', value: '600万', source: '财务数据', confidence: 'high' },
        { name: '跟降毛利损失', value: '27万/月', source: '财务测算', confidence: 'medium' },
        { name: '会员占比', value: '40%', source: '会员系统', confidence: 'high' },
        { name: '差异化投入', value: '50万', source: '研发预算', confidence: 'medium' }
      ]
    }
  },
  {
    type: '04',
    typeName: 'CONCLUSION',
    content: {
      resolutionText: '不推荐直接跟降，采用会员专享价+差异化组合装+内容营销组合策略',
      resolutionType: 'pending',
      escalationPath: ['营销副总裁审批']
    }
  },
  {
    type: '05',
    typeName: 'REUSABLE_RULE',
    content: {
      ruleText: '竞品降价应对 → 价格监控→影响评估→多方案比选(跟降/会员价/差异化)→决策',
      triggerPattern: {
        category: 'pricing_decision',
        conditions: [
          { field: '竞品降幅', operator: 'gte', value: 0.15 },
          { field: '销量影响', operator: 'gte', value: 0.2 }
        ]
      },
      recommendedAction: '数据监控→商品分析→财务测算→营销方案→组合决策',
      applicableScope: {
        plants: ['ALL'],
        productionLines: ['NUT','SNACK','MEAT'],
        customerTiers: ['ALL']
      },
      confidenceScore: 0.86,
      humanApproved: false
    }
  }
];

export const MOCK_RESOLUTION_STATUS_1293: ResolutionStatus = {
  consensusSummary: '不推荐直接跟降 · 采用组合策略',
  pendingQuestion: '是否批准会员专享价+差异化组合装+内容营销组合策略？',
  pending_user_id: 'u_003',
  pendingUserName: '张明德',
  options: [
    { id: 'opt_1', label: '批准组合策略', isRecommended: true },
    { id: 'opt_2', label: '直接跟进降价15%', isRecommended: false },
    { id: 'opt_3', label: '维持原价不变', isRecommended: false }
  ]
};

// ============================================================
// ISSUE #1294 - 亏损门店闭店评估 (NEW)
// ============================================================
export const MOCK_ISSUE_1294: Issue = {
  id: '#1294',
  title: '亏损门店闭店评估',
  description: '华东大区12家门店连续6个月亏损，月均亏损合计约18万。主要原因为商圈客流下降、租金上涨、人效不足。需评估闭店、改造升级或继续观察三种方案。',
  category: 'budget_adjustment',
  status: 'PENDING_HUMAN',
  urgency: 'normal',
  sensitivity: 'normal',
  creator_user_id: 'u_010',
  creatorName: '郑勇',
  participant_role_ids: ['mgr_process','mgr_finance','mgr_factory','coord_agent'],
  ontology_node_ids: ['node_store','node_cost','node_profit'],
  parent_topic_id: null,
  referenced_asset_ids: [],
  source_template_id: null,
  pending_user_id: 'u_002',
  pendingUserName: '李秀英',
  created_at: '2026-05-15T09:00:00Z',
  updated_at: '2026-05-15T10:30:00Z',
  decided_at: null,
  decided_by_user_id: null,
  final_resolution: null,
  referencedIssues: [
    { id: '#1190', title: '2025年闭店复盘', resolution: '关闭8家亏损门店，年节省216万' }
  ]
};

export const MOCK_MESSAGES_1294: Message[] = [
  {
    id: 'msg_1294_001',
    topic_id: '#1294',
    author_type: 'agent',
    author_id: 'a_ops',
    author_display: '运营',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '华东大区12家亏损门店评估：连续6个月亏损，月均亏损合计18万(单店平均1.5万)。亏损原因分析：商圈客流下降(平均-25%)8家，租金上涨(涨幅>20%)3家，人效不足(低于均值40%)4家。其中杭州2家、上海5家、南京3家、苏州2家。@财务 评估闭店成本，@区域 评估区域影响。',
    mentions: [
      { start: 118, end: 121, type: 'ROLE', target_role_id: 'mgr_finance', target_display: '财务' },
      { start: 126, end: 129, type: 'ROLE', target_role_id: 'mgr_factory', target_display: '区域' }
    ],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_store','node_cost'] },
    attached_data: { loss_stores: 12, monthly_loss: 180000, avg_loss_per_store: 15000, traffic_drop: 0.25 },
    is_pinned: false,
    created_at: '2026-05-15T09:00:15Z',
    created_at_display: '09:00'
  },
  {
    id: 'msg_1294_002',
    topic_id: '#1294',
    author_type: 'agent',
    author_id: 'a_finance',
    author_display: '财务',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '闭店成本测算：12家门店闭店一次性成本约120万(装修残值损失+违约金+员工补偿)。但闭店后年节省亏损216万+租金节省约300万，净收益约516万/年。改造升级方案：单店投入约25万(调整品类+数字化升级)，预计6个月后50%门店可扭亏。观察方案：维持现状，但需设定止损线(再亏3个月强制闭店)。',
    mentions: [],
    reply_to_message_id: 'msg_1294_001',
    reasoning_path: { ontology_refs: ['node_cost','node_profit'] },
    attached_data: { closure_cost: 1200000, annual_saving: 5160000, upgrade_per_store: 250000, upgrade_success_rate: 0.5 },
    is_pinned: false,
    created_at: '2026-05-15T09:20:30Z',
    created_at_display: '09:20'
  },
  {
    id: 'msg_1294_003',
    topic_id: '#1294',
    author_type: 'agent',
    author_id: 'a_ops',
    author_display: '区域',
    author_color_class: 'primary',
    message_type: 'STATEMENT',
    content: '区域影响评估：12家门店中，3家为区域旗舰店(品牌展示作用，不单纯看盈利)，建议保留并改造。其余9家：5家位于客流持续下降的老商圈(建议闭店)，4家位于新兴商圈(建议改造观察)。闭店后员工安置：约45人，可优先调配至区域内其他门店(缺口约30人)，剩余15人按N+1补偿。',
    mentions: [],
    reply_to_message_id: 'msg_1294_001',
    reasoning_path: { ontology_refs: ['node_store','node_distribution'] },
    attached_data: { flagship: 3, old_district: 5, emerging: 4, staff_count: 45, redeploy: 30 },
    is_pinned: false,
    created_at: '2026-05-15T09:45:00Z',
    created_at_display: '09:45'
  },
  {
    id: 'msg_1294_004',
    topic_id: '#1294',
    author_type: 'agent',
    author_id: 'a_coord',
    author_display: '协调',
    author_color_class: 'accent',
    message_type: 'CONSENSUS',
    content: '共识达成：分类处置方案——3家旗舰店保留改造，5家老商圈店建议闭店，4家新兴商圈店改造观察3个月。预计一次性投入改造费175万(7家x25万)，闭店成本75万(5家)，年节省约400万。需 @运营副总裁 决策：是否批准分类处置方案？',
    mentions: [
      { start: 78, end: 84, type: 'ESCALATE', target_role_id: 'vp_prod', target_display: '运营副总裁' }
    ],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_consensus','node_decision_required'] },
    attached_data: null,
    is_pinned: true,
    created_at: '2026-05-15T10:30:00Z',
    created_at_display: '10:30'
  }
];

export const MOCK_ASSETS_1294: DecisionAsset[] = [
  {
    type: '01',
    typeName: 'ISSUE_PROFILE',
    content: {
      category: 'budget_adjustment',
      tags: ['亏损门店','闭店评估','华东大区','成本优化','员工安置'],
      entities: [
        { type: 'region', id: 'EAST', name: '华东大区' },
        { type: 'store', id: '12', name: '12家门店' },
        { type: 'loss', id: '18', name: '月均亏损18万' },
        { type: 'duration', id: '6', name: '连续6个月' }
      ],
      summary: '亏损门店闭店评估 · 12家门店连续6月亏损 · 分类处置方案',
      autoGenerated: true
    }
  },
  {
    type: '02',
    typeName: 'KEY_TRADEOFFS',
    content: {
      tradeoffs: [
        { sideA: '闭店止损(年省400万)', sideB: '品牌覆盖+员工安置', weightA: 0.6, weightB: 0.4, reasoning: '老商圈客流持续下降，闭店是理性选择，员工可大部分调配' },
        { sideA: '改造升级(保留门店)', sideB: '改造投入(175万)', weightA: 0.5, weightB: 0.5, reasoning: '旗舰店和新兴商圈店值得改造，但需控制投入' },
        { sideA: '继续观察(机会成本)', sideB: '及时止损', weightA: 0.2, weightB: 0.8, reasoning: '已亏损6个月，继续观察机会成本高' }
      ]
    }
  },
  {
    type: '03',
    typeName: 'DECISION_BASIS',
    content: {
      dataPoints: [
        { name: '亏损门店数', value: '12家', source: '运营统计', confidence: 'high' },
        { name: '连续亏损月数', value: '6个月', source: '财务数据', confidence: 'high' },
        { name: '月均亏损', value: '18万', source: '财务数据', confidence: 'high' },
        { name: '单店平均亏损', value: '1.5万', source: '财务测算', confidence: 'high' },
        { name: '客流下降', value: '25%', source: '商圈数据', confidence: 'medium' },
        { name: '闭店一次性成本', value: '120万', source: '财务测算', confidence: 'medium' },
        { name: '年节省', value: '516万', source: '财务测算', confidence: 'medium' },
        { name: '改造单店投入', value: '25万', source: '工程预算', confidence: 'high' }
      ]
    }
  },
  {
    type: '04',
    typeName: 'CONCLUSION',
    content: {
      resolutionText: '分类处置：3家旗舰店保留改造，5家老商圈店闭店，4家新兴店改造观察',
      resolutionType: 'pending',
      escalationPath: ['运营副总裁审批']
    }
  },
  {
    type: '05',
    typeName: 'REUSABLE_RULE',
    content: {
      ruleText: '亏损门店处置 → 亏损分析→分类评估(旗舰店/老商圈/新兴商圈)→闭店/改造/观察',
      triggerPattern: {
        category: 'budget_adjustment',
        conditions: [
          { field: '连续亏损月数', operator: 'gte', value: 6 },
          { field: '月均亏损', operator: 'gte', value: 100000 }
        ]
      },
      recommendedAction: '运营分析→财务测算→区域影响→分类处置→员工安置',
      applicableScope: {
        plants: ['EAST','NORTH','SOUTH','WEST'],
        productionLines: ['ALL'],
        customerTiers: ['ALL']
      },
      confidenceScore: 0.91,
      humanApproved: true
    }
  }
];

export const MOCK_RESOLUTION_STATUS_1294: ResolutionStatus = {
  consensusSummary: '分类处置 · 3家改造保留+5家闭店+4家观察',
  pendingQuestion: '是否批准分类处置方案？',
  pending_user_id: 'u_002',
  pendingUserName: '李秀英',
  options: [
    { id: 'opt_1', label: '批准分类处置方案', isRecommended: true },
    { id: 'opt_2', label: '全部改造观察', isRecommended: false },
    { id: 'opt_3', label: '全部闭店止损', isRecommended: false }
  ]
};

// ============================================================
// ISSUE #1295 - 会员系统升级预算 (NEW, simple RESOLVED)
// ============================================================
export const MOCK_ISSUE_1295: Issue = {
  id: '#1295',
  title: '会员系统升级预算',
  description: '技术部申请会员系统升级预算350万，用于CRM系统重构、会员标签体系升级、精准营销引擎开发。已通过技术评审和财务审批。',
  category: 'budget_adjustment',
  status: 'RESOLVED',
  urgency: 'normal',
  sensitivity: 'normal',
  creator_user_id: 'u_005',
  creatorName: '刘芳华',
  participant_role_ids: ['mgr_process','mgr_finance','coord_agent'],
  ontology_node_ids: ['node_budget','node_technology'],
  parent_topic_id: null,
  referenced_asset_ids: [],
  source_template_id: null,
  created_at: '2026-05-08T10:00:00Z',
  updated_at: '2026-05-10T14:00:00Z',
  decided_at: '2026-05-10T14:00:00Z',
  decided_by_user_id: 'u_001',
  final_resolution: '批准预算350万，分三期执行：Q2需求评审+Q3开发+Q4上线'
};

export const MOCK_MESSAGES_1295: Message[] = [
  {
    id: 'msg_1295_001',
    topic_id: '#1295',
    author_type: 'agent',
    author_id: 'a_coord',
    author_display: '协调',
    author_color_class: 'accent',
    message_type: 'CONSENSUS',
    content: '本议题已结案。CEO王建国于2026-05-10批准会员系统升级预算350万，分三期执行：Q2需求评审(50万)+Q3开发(200万)+Q4上线(100万)。项目已纳入技术部OKR。',
    mentions: [],
    reply_to_message_id: null,
    reasoning_path: { ontology_refs: ['node_decision_made'] },
    attached_data: { budget: 3500000, approved_by: 'u_001', phases: ['Q2评审','Q3开发','Q4上线'] },
    is_pinned: true,
    created_at: '2026-05-10T14:00:00Z',
    created_at_display: '14:00'
  }
];

export const MOCK_ASSETS_1295: DecisionAsset[] = [
  {
    type: '01',
    typeName: 'ISSUE_PROFILE',
    content: {
      category: 'budget_adjustment',
      tags: ['会员系统','技术升级','预算审批','已结案'],
      entities: [
        { type: 'system', id: 'CRM', name: '会员CRM系统' },
        { type: 'budget', id: '350', name: '350万预算' },
        { type: 'project', id: 'UPGRADE', name: '系统升级' }
      ],
      summary: '会员系统升级预算 · 已批准350万 · 分三期执行',
      autoGenerated: true
    }
  },
  {
    type: '02',
    typeName: 'KEY_TRADEOFFS',
    content: {
      tradeoffs: [
        { sideA: '自研(定制化)', sideB: '外采(快速上线)', weightA: 0.6, weightB: 0.4, reasoning: '会员系统为核心竞争力，自研更可控' }
      ]
    }
  },
  {
    type: '03',
    typeName: 'DECISION_BASIS',
    content: {
      dataPoints: [
        { name: '预算金额', value: '350万', source: '技术部申请', confidence: 'high' },
        { name: '执行周期', value: '3个季度', source: '项目计划', confidence: 'high' },
        { name: '预期效果', value: '会员转化率+15%', source: '技术评估', confidence: 'medium' }
      ]
    }
  },
  {
    type: '04',
    typeName: 'CONCLUSION',
    content: {
      resolutionText: '批准预算350万，分三期执行：Q2需求评审+Q3开发+Q4上线',
      resolutionType: 'ai_consensus_then_human_confirmed',
      resolverUserId: 'u_001',
      resolverName: '王建国',
      resolvedAt: '2026-05-10T14:00:00Z'
    }
  },
  {
    type: '05',
    typeName: 'REUSABLE_RULE',
    content: {
      ruleText: '技术系统升级预算 → 技术评审→财务审批→CEO终审→分期执行',
      triggerPattern: {
        category: 'budget_adjustment',
        conditions: [
          { field: '议题类型', operator: 'eq', value: '技术升级' },
          { field: '预算金额', operator: 'gte', value: 2000000 }
        ]
      },
      recommendedAction: '技术评审→财务审批→CEO终审→分期执行+里程碑验收',
      applicableScope: {
        plants: ['ALL'],
        productionLines: ['ALL'],
        customerTiers: ['ALL']
      },
      confidenceScore: 0.93,
      humanApproved: true
    }
  }
];

export const MOCK_RESOLUTION_STATUS_1295: ResolutionStatus = {
  consensusSummary: '已批准预算350万 · 分三期执行',
  options: []
};

// ============================================================
// MOCK_ISSUES array
// ============================================================
export const MOCK_ISSUES: Issue[] = [
  MOCK_ISSUE_1284,
  MOCK_ISSUE_1281,
  MOCK_ISSUE_1278,
  MOCK_ISSUE_1275,
  MOCK_ISSUE_1265,
  MOCK_ISSUE_1290,
  MOCK_ISSUE_1291,
  MOCK_ISSUE_1292,
  MOCK_ISSUE_1293,
  MOCK_ISSUE_1294,
  MOCK_ISSUE_1295
];

// ============================================================
// MOCK_ACTIVE_CONTROLS
// ============================================================
export const MOCK_ACTIVE_CONTROLS: ActiveControl[] = [
  { type: 'auto_escalation', ruleText: '促销预算 > 500万元 → 自动 @CEO', currentlyActive: true },
  { type: 'anomaly_keyword', ruleText: '出现「食品安全」「临期」类关键词 → 自动冻结', currentlyActive: true },
  { type: 'audit_trail', ruleText: '所有 @ 链路完整留痕,可追溯', currentlyActive: true },
  { type: 'sensitive_filter', ruleText: '敏感议题自动白名单隔离', currentlyActive: true },
  { type: 'budget_threshold', ruleText: '预算调整 > 200万元 → 自动 @运营副总裁', currentlyActive: true }
];

// ============================================================
// MOCK_SCOPE_COUNTS
// ============================================================
export const MOCK_SCOPE_COUNTS: ScopeCounts = {
  pending: 6,
  watching: 11,
  decided: 48,
  global: 11,
  restricted: 1
};

// ============================================================
// MOCK_NOTIFICATIONS
// ============================================================
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
  },
  {
    id: 'n_004',
    user_id: 'u_002',
    notification_type: 'ESCALATED',
    title: '#1278 等您决策',
    preview: 'Q2门店翻新预算调整 · 需您决策:是否批准分两批执行?',
    topic_id: '#1278',
    is_read: false,
    created_at: '2026-05-12T11:45:00Z'
  },
  {
    id: 'n_005',
    user_id: 'u_002',
    notification_type: 'ESCALATED',
    title: '#1290 等您决策',
    preview: '上海五角场新店选址评估 · 需您决策:是否签约入驻?',
    topic_id: '#1290',
    is_read: false,
    created_at: '2026-05-14T10:30:00Z'
  },
  {
    id: 'n_006',
    user_id: 'u_002',
    notification_type: 'ESCALATED',
    title: '#1294 等您决策',
    preview: '亏损门店闭店评估 · 需您决策:是否批准分类处置方案?',
    topic_id: '#1294',
    is_read: false,
    created_at: '2026-05-15T10:30:00Z'
  },
  {
    id: 'n_007',
    user_id: 'u_003',
    notification_type: 'ESCALATED',
    title: '#1293 等您决策',
    preview: '竞品坚果降价应对 · 需您决策:是否批准组合策略?',
    topic_id: '#1293',
    is_read: false,
    created_at: '2026-05-14T17:00:00Z'
  },
  {
    id: 'n_008',
    user_id: 'u_006',
    notification_type: 'MENTIONED',
    title: '#1275 食安预警',
    preview: '杭州西湖店食品安全异常处置 · 品控Agent已启动溯源',
    topic_id: '#1275',
    is_read: false,
    created_at: '2026-05-13T10:20:00Z'
  },
  {
    id: 'n_009',
    user_id: 'u_004',
    notification_type: 'CONSENSUS_REACHED',
    title: '#1291 共识达成',
    preview: '中秋月饼礼盒备货决策 · 协调Agent已总结初步共识',
    topic_id: '#1291',
    is_read: false,
    created_at: '2026-05-14T14:15:00Z'
  },
  {
    id: 'n_010',
    user_id: 'u_008',
    notification_type: 'ESCALATED',
    title: '#1292 会员流失预警',
    preview: '钻石会员批量流失预警 · 需营销部制定挽回方案',
    topic_id: '#1292',
    is_read: false,
    created_at: '2026-05-14T15:00:00Z'
  }
];

// ============================================================
// MOCK_DECISION_LOGS
// ============================================================
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
  },
  {
    id: 'dlog_1295',
    topic_id: '#1295',
    decision_type: 'APPROVE',
    decided_by_user_id: 'u_001',
    decision_text: '批准会员系统升级预算350万，分三期执行',
    ai_consensus_at_time: '批准预算350万',
    override_reason: null,
    created_at: '2026-05-10T14:00:00Z'
  }
];

// ============================================================
// MOCK_ASSET_REFERENCES
// ============================================================
export const MOCK_ASSET_REFERENCES: AssetReference[] = [
  { id: 'ref_001', source_asset_id: 'ast_1247_05', target_topic_id: '#1284', reference_type: 'INIT_DRAFT', created_at: '2026-05-13T14:02:00Z' },
  { id: 'ref_002', source_asset_id: 'ast_1156_05', target_topic_id: '#1284', reference_type: 'INLINE_CITE', created_at: '2026-05-13T14:04:00Z' },
  { id: 'ref_003', source_asset_id: 'ast_1156_05', target_topic_id: '#1281', reference_type: 'RULE_TRIGGERED', created_at: '2026-05-13T08:30:00Z' },
  { id: 'ref_004', source_asset_id: 'ast_1201_05', target_topic_id: '#1278', reference_type: 'INIT_DRAFT', created_at: '2026-05-12T11:00:00Z' },
  { id: 'ref_005', source_asset_id: 'ast_1189_05', target_topic_id: '#1275', reference_type: 'RULE_TRIGGERED', created_at: '2026-05-13T10:20:00Z' },
  { id: 'ref_006', source_asset_id: 'ast_1220_05', target_topic_id: '#1290', reference_type: 'INIT_DRAFT', created_at: '2026-05-14T09:00:00Z' },
  { id: 'ref_007', source_asset_id: 'ast_1234_05', target_topic_id: '#1291', reference_type: 'INIT_DRAFT', created_at: '2026-05-14T13:00:00Z' },
  { id: 'ref_008', source_asset_id: 'ast_1250_05', target_topic_id: '#1292', reference_type: 'INIT_DRAFT', created_at: '2026-05-14T15:00:00Z' },
  { id: 'ref_009', source_asset_id: 'ast_1210_05', target_topic_id: '#1293', reference_type: 'INIT_DRAFT', created_at: '2026-05-14T16:00:00Z' },
  { id: 'ref_010', source_asset_id: 'ast_1190_05', target_topic_id: '#1294', reference_type: 'INIT_DRAFT', created_at: '2026-05-15T09:00:00Z' }
];

// ============================================================
// getIssueData
// ============================================================
export function getIssueData(issueId: string) {
  const issue = MOCK_ISSUES.find(i => i.id === issueId);
  if (!issue) return null;

  const messagesMap: Record<string, Message[]> = {
    '#1284': MOCK_MESSAGES_1284,
    '#1281': MOCK_MESSAGES_1281,
    '#1278': MOCK_MESSAGES_1278,
    '#1275': MOCK_MESSAGES_1275,
    '#1265': MOCK_MESSAGES_1265,
    '#1290': MOCK_MESSAGES_1290,
    '#1291': MOCK_MESSAGES_1291,
    '#1292': MOCK_MESSAGES_1292,
    '#1293': MOCK_MESSAGES_1293,
    '#1294': MOCK_MESSAGES_1294,
    '#1295': MOCK_MESSAGES_1295
  };

  const assetsMap: Record<string, DecisionAsset[]> = {
    '#1284': MOCK_ASSETS_1284,
    '#1281': MOCK_ASSETS_1281,
    '#1278': MOCK_ASSETS_1278,
    '#1275': MOCK_ASSETS_1275,
    '#1265': MOCK_ASSETS_1265,
    '#1290': MOCK_ASSETS_1290,
    '#1291': MOCK_ASSETS_1291,
    '#1292': MOCK_ASSETS_1292,
    '#1293': MOCK_ASSETS_1293,
    '#1294': MOCK_ASSETS_1294,
    '#1295': MOCK_ASSETS_1295
  };

  const resolutionMap: Record<string, ResolutionStatus> = {
    '#1284': MOCK_RESOLUTION_STATUS_1284,
    '#1281': MOCK_RESOLUTION_STATUS_1281,
    '#1278': MOCK_RESOLUTION_STATUS_1278,
    '#1275': MOCK_RESOLUTION_STATUS_1275,
    '#1265': MOCK_RESOLUTION_STATUS_1265,
    '#1290': MOCK_RESOLUTION_STATUS_1290,
    '#1291': MOCK_RESOLUTION_STATUS_1291,
    '#1292': MOCK_RESOLUTION_STATUS_1292,
    '#1293': MOCK_RESOLUTION_STATUS_1293,
    '#1294': MOCK_RESOLUTION_STATUS_1294,
    '#1295': MOCK_RESOLUTION_STATUS_1295
  };

  return {
    issue,
    messages: messagesMap[issueId] || [],
    assets: assetsMap[issueId] || [],
    resolutionStatus: resolutionMap[issueId] || null,
    activeControls: MOCK_ACTIVE_CONTROLS
  };
}

// ============================================================
// getScopeCounts
// ============================================================
export function getScopeCounts(userId: string): ScopeCounts {
  if (userId === 'u_001') return { pending: 2, watching: 5, decided: 47, global: 11, restricted: 1 };
  if (userId === 'u_002') return { pending: 4, watching: 8, decided: 47, global: 11, restricted: 1 };
  if (userId === 'u_003') return { pending: 1, watching: 3, decided: 15, global: 5, restricted: 0 };
  if (userId === 'u_004') return { pending: 1, watching: 4, decided: 15, global: 5, restricted: 0 };
  if (userId === 'u_005') return { pending: 0, watching: 6, decided: 20, global: 8, restricted: 0 };
  if (userId === 'u_006') return { pending: 0, watching: 3, decided: 10, global: 4, restricted: 0 };
  if (userId === 'u_007') return { pending: 0, watching: 5, decided: 18, global: 7, restricted: 0 };
  if (userId === 'u_008') return { pending: 1, watching: 4, decided: 12, global: 5, restricted: 0 };
  if (userId === 'u_009') return { pending: 0, watching: 3, decided: 10, global: 4, restricted: 1 };
  if (userId === 'u_010') return { pending: 0, watching: 4, decided: 8, global: 4, restricted: 0 };
  return { pending: 0, watching: 0, decided: 0, global: 0, restricted: 0 };
}

// ============================================================
// getNotifications
// ============================================================
export function getNotifications(userId: string): Notification[] {
  return MOCK_NOTIFICATIONS.filter(n => n.user_id === userId);
}
