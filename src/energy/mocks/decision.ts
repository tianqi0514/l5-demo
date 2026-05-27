import type {
  Issue, Message, DecisionAsset, ActiveControl, ResolutionStatus,
  IssueStatus, IssueCategory, RoleId, User, Agent, ScopeCounts,
  Notification, DecisionLog, AssetReference
} from '../types/decision';

// ============================================================
// MOCK_USERS
// ============================================================
export const MOCK_USERS: User[] = [
  { id: 'u_001', role_id: 'ceo', name: '张建国', title: 'CEO', department: '集团', email: 'ceo@energy.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_002', role_id: 'cco', name: '李正廉', title: '首席合规官', department: '合规部', email: 'cco@energy.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_003', role_id: 'vp_procurement', name: '王德明', title: '采购副总裁', department: '采购', email: 'vp.proc@energy.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_004', role_id: 'vp_compliance', name: '赵守正', title: '合规副总裁', department: '合规', email: 'vp.comp@energy.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_005', role_id: 'mgr_bid', name: '陈志远', title: '招采合规经理', department: '招采部', email: 'mgr.bid@energy.com', factory_scope: ['NORTH','EAST'], product_line_scope: ['EQUIPMENT','MATERIAL'], is_active: true },
  { id: 'u_006', role_id: 'mgr_supplier', name: '刘卫东', title: '供应商管理经理', department: '供应商管理部', email: 'mgr.supplier@energy.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_007', role_id: 'mgr_contract', name: '孙丽华', title: '合同管理经理', department: '合同管理部', email: 'mgr.contract@energy.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_008', role_id: 'mgr_risk', name: '周建国', title: '风控经理', department: '风控部', email: 'mgr.risk@energy.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_009', role_id: 'mgr_audit', name: '吴明辉', title: '审计经理', department: '审计部', email: 'mgr.audit@energy.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
  { id: 'u_010', role_id: 'mgr_cost', name: '郑海涛', title: '成本分析师', department: '财务部', email: 'mgr.cost@energy.com', factory_scope: ['ALL'], product_line_scope: ['ALL'], is_active: true },
];

// ============================================================
// MOCK_AGENTS
// ============================================================
export const MOCK_AGENTS: Agent[] = [
  { id: 'a_bid', user_id: 'u_005', display_name: '招采合规Agent', avatar_initial: '招', stance_config: { risk_preference: 'conservative', key_constraints: ['招标合规率100%','评标过程可追溯'], delegation_scope: ['招标审查','评标监控','采购方式合规校验'] }, knowledge_sources: ['招采本体','合规规则库','历史招标数据'], is_active: true, last_synced_at: '2026-05-15T09:00:00Z' },
  { id: 'a_supplier', user_id: 'u_006', display_name: '供应商风控Agent', avatar_initial: '供', stance_config: { risk_preference: 'balanced', key_constraints: ['供应商合格率>90%','黑名单0遗漏'], delegation_scope: ['供应商准入评审','风险预警','绩效淘汰'] }, knowledge_sources: ['供应商本体','工商数据','司法数据','舆情数据'], is_active: true, last_synced_at: '2026-05-15T08:30:00Z' },
  { id: 'a_contract', user_id: 'u_007', display_name: '合同审查Agent', avatar_initial: '合', stance_config: { risk_preference: 'conservative', key_constraints: ['条款偏离0容忍','合同履约率>95%'], delegation_scope: ['条款合规校验','异常预警','变更审批'] }, knowledge_sources: ['合同本体','标准模板库','法律法规库'], is_active: true, last_synced_at: '2026-05-14T16:00:00Z' },
  { id: 'a_risk', user_id: 'u_008', display_name: '风控Agent', avatar_initial: '风', stance_config: { risk_preference: 'conservative', key_constraints: ['风险事件24h响应','高危供应商零容忍'], delegation_scope: ['风险评估','串标检测','关联交易筛查'] }, knowledge_sources: ['风控本体','交易数据','关联图谱'], is_active: true, last_synced_at: '2026-05-15T10:00:00Z' },
  { id: 'a_audit', user_id: 'u_009', display_name: '审计线索Agent', avatar_initial: '审', stance_config: { risk_preference: 'balanced', key_constraints: ['审计发现闭环率>95%','举报响应<48h'], delegation_scope: ['异常行为检测','审计追踪','反腐分析'] }, knowledge_sources: ['审计本体','操作日志','财务数据'], is_active: true, last_synced_at: '2026-05-15T07:00:00Z' },
  { id: 'a_cost', user_id: 'u_010', display_name: '成本优化Agent', avatar_initial: '成', stance_config: { risk_preference: 'aggressive', key_constraints: ['招标节约率>8%','价格偏离<15%'], delegation_scope: ['价格分析','成本优化','集中采购建议'] }, knowledge_sources: ['财务本体','市场价格库','历史采购数据'], is_active: true, last_synced_at: '2026-05-14T14:00:00Z' },
  { id: 'a_coord', user_id: null, display_name: '协调Agent', avatar_initial: '协', stance_config: { risk_preference: 'balanced', key_constraints: ['共识可识别','冲突可定位'], delegation_scope: ['议题分类','共识总结','升级判断'] }, knowledge_sources: ['全部本体','治理规则'], is_active: true, last_synced_at: '2026-05-15T00:00:00Z' },
];

// ============================================================
// ROLES record
// ============================================================
export const ROLES: Record<RoleId, { name: string; department: string; isAgent: boolean }> = {
  'ceo': { name: 'CEO', department: '集团', isAgent: false },
  'cco': { name: '首席合规官', department: '合规部', isAgent: false },
  'vp_procurement': { name: '采购副总裁', department: '采购', isAgent: false },
  'vp_compliance': { name: '合规副总裁', department: '合规', isAgent: false },
  'vp_audit': { name: '审计副总裁', department: '审计', isAgent: false },
  'vp_finance': { name: '财务副总裁', department: '财务', isAgent: false },
  'mgr_bid': { name: '招采合规经理', department: '招采部', isAgent: true },
  'mgr_supplier': { name: '供应商管理经理', department: '供应商管理部', isAgent: true },
  'mgr_contract': { name: '合同管理经理', department: '合同管理部', isAgent: true },
  'mgr_risk': { name: '风控经理', department: '风控部', isAgent: true },
  'mgr_audit': { name: '审计经理', department: '审计部', isAgent: true },
  'mgr_legal': { name: '法务经理', department: '法务部', isAgent: true },
  'mgr_cost': { name: '成本分析师', department: '财务部', isAgent: true },
  'gm_north': { name: '华北采购中心总', department: '华北采购中心', isAgent: true },
  'gm_east': { name: '华东采购中心总', department: '华东采购中心', isAgent: true },
  'coord_agent': { name: '协调Agent', department: '系统', isAgent: true },
};

export const CURRENT_USER: User = MOCK_USERS[0];

// ============================================================
// ISSUE #3001 - 大型钻采设备招标合规审查
// ============================================================
export const MOCK_ISSUE_3001: Issue = {
  id: '#3001',
  title: '大型钻采设备招标合规审查',
  description: '西北油田钻采设备采购项目，预算5200万元，公开招标。3家投标方中"华锐重工"资质存疑，疑似与项目组某成员存在关联关系。需审查招标全流程合规性。',
  category: 'bid_compliance',
  status: 'PENDING_HUMAN',
  urgency: 'urgent',
  sensitivity: 'highly_sensitive',
  creator_user_id: 'u_005',
  creatorName: '陈志远',
  participant_role_ids: ['mgr_bid','mgr_supplier','mgr_risk','mgr_audit','mgr_cost','coord_agent'],
  ontology_node_ids: ['node_procurement','node_bid','node_supplier','node_compliance'],
  parent_topic_id: null,
  referenced_asset_ids: ['ast_2987_03'],
  source_template_id: null,
  pending_user_id: 'u_002',
  pendingUserName: '李正廉',
  created_at: '2026-05-15T09:30:00Z',
  updated_at: '2026-05-15T10:15:00Z',
  decided_at: null,
  decided_by_user_id: null,
  final_resolution: null,
  referencedIssues: [
    { id: '#2987', title: 'Q1钻采设备采购复盘', resolution: '批准采购4800万，实际节约率9.2%' }
  ]
};

export const MOCK_MESSAGES_3001: Message[] = [
  {
    id: 'msg_3001_001', topic_id: '#3001', author_type: 'agent', author_id: 'a_bid', author_display: '招采', author_color_class: 'primary', message_type: 'STATEMENT',
    content: '西北油田钻采设备招标5200万，公开招标3家投标。初步审查发现：华锐重工投标文件中技术负责人简历与项目评审组成员张某存在同校同届关系，需进一步排查关联性。@风控 启动关联关系筛查，@审计 核查张某过往评审记录。',
    mentions: [
      { start: 95, end: 98, type: 'ROLE', target_role_id: 'mgr_risk', target_display: '风控' },
      { start: 110, end: 113, type: 'ROLE', target_role_id: 'mgr_audit', target_display: '审计' }
    ],
    reply_to_message_id: null, reasoning_path: { ontology_refs: ['node_bid','node_compliance'] }, attached_data: null, is_pinned: false,
    created_at: '2026-05-15T09:30:15Z', created_at_display: '09:30'
  },
  {
    id: 'msg_3001_002', topic_id: '#3001', author_type: 'agent', author_id: 'a_risk', author_display: '风控', author_color_class: 'primary', message_type: 'STATEMENT',
    content: '关联关系筛查结果：华锐重工法人代表王某与张某妻子为兄妹关系（工商数据交叉比对确认）。同时发现华锐重工近3年投标12次，中标4次，中标率33%显著高于行业均值18%。建议暂停该项目评标，启动专项调查。',
    mentions: [],
    reply_to_message_id: 'msg_3001_001', reasoning_path: { ontology_refs: ['node_supplier','node_risk'] },
    attached_data: { relation_type: '亲属关联', bid_count: 12, win_count: 4, win_rate: 0.33, industry_avg: 0.18 },
    is_pinned: false, created_at: '2026-05-15T09:32:40Z', created_at_display: '09:32'
  },
  {
    id: 'msg_3001_003', topic_id: '#3001', author_type: 'agent', author_id: 'a_audit', author_display: '审计', author_color_class: 'primary', message_type: 'STATEMENT',
    content: '张某近3年参与评审项目8个，其中华锐重工参与的3个项目均中标。此外发现张某在2个项目中打分显著高于其他评委（偏差>15分）。已锁定审计证据，建议暂停张某评审资格并启动反腐败专项调查。',
    mentions: [],
    reply_to_message_id: 'msg_3001_001', reasoning_path: { ontology_refs: ['node_audit','node_compliance'] },
    attached_data: { reviewed_projects: 8, target_supplier_projects: 3, score_deviation: 15 },
    is_pinned: false, created_at: '2026-05-15T09:35:10Z', created_at_display: '09:35'
  },
  {
    id: 'msg_3001_004', topic_id: '#3001', author_type: 'agent', author_id: 'a_cost', author_display: '成本', author_color_class: 'primary', message_type: 'STATEMENT',
    content: '华锐重工报价4680万，低于第二名720万（差距13.3%），价格异常偏低。对标市场价格，同规格设备均价5050万，华锐重工报价低于市场价7.3%。可能存在低价中标后变更索赔风险。@招建 评估是否需要废标重招。',
    mentions: [
      { start: 115, end: 118, type: 'ROLE', target_role_id: 'mgr_bid', target_display: '招建' }
    ],
    reply_to_message_id: null, reasoning_path: { ontology_refs: ['node_cost','node_bid'] },
    attached_data: { bid_price: 46800000, second_price: 54000000, market_price: 50500000, gap_pct: 0.133 },
    is_pinned: false, created_at: '2026-05-15T09:37:25Z', created_at_display: '09:37'
  },
  {
    id: 'msg_3001_005', topic_id: '#3001', author_type: 'agent', author_id: 'a_coord', author_display: '协调', author_color_class: 'accent', message_type: 'CONSENSUS',
    content: '共识形成：(1)暂停评标，废除华锐重工投标资格；(2)启动张某反腐败专项调查，暂停其评审资格；(3)剩余2家投标方重新评标或废标重招。需 @首席合规官 决策：废标重招 vs 二选一继续评标？',
    mentions: [
      { start: 105, end: 112, type: 'ESCALATE', target_role_id: 'cco', target_display: '首席合规官' }
    ],
    reply_to_message_id: null, reasoning_path: { ontology_refs: ['node_consensus','node_decision_required'] },
    attached_data: null, is_pinned: true, created_at: '2026-05-15T10:15:00Z', created_at_display: '10:15'
  }
];

export const MOCK_ASSETS_3001: DecisionAsset[] = [
  { type: '01', typeName: 'ISSUE_PROFILE', content: {
    category: 'bid_compliance', tags: ['招标合规','关联关系','串标嫌疑','钻采设备','西北油田'],
    entities: [
      { type: 'procurement_project', id: 'PJ3001', name: '西北油田钻采设备采购' },
      { type: 'supplier', id: 'SUP_HR', name: '华锐重工' },
      { type: 'budget', id: '5200', name: '5200万预算' },
      { type: 'person', id: 'ZHANG', name: '评审组成员张某' }
    ],
    summary: '招标合规审查 · 关联关系+价格异常+评审偏差三重风险 · 紧急', autoGenerated: true
  }},
  { type: '02', typeName: 'KEY_TRADEOFFS', content: {
    tradeoffs: [
      { sideA: '合规零容忍(废标重招)', sideB: '项目延期3-4个月', weightA: 0.7, weightB: 0.3, reasoning: '涉及亲属关联+评审偏差，合规风险高于工期风险' },
      { sideA: '剩余2家继续评标', sideB: '竞争不足导致价格偏高', weightA: 0.4, weightB: 0.6, reasoning: '仅2家投标不满足充分竞争要求，且可能引发二次合规质疑' },
      { sideA: '反腐败调查深度', sideB: '调查成本与时间', weightA: 0.8, weightB: 0.2, reasoning: '已有明确证据链，应彻底调查以儆效尤' }
    ]
  }},
  { type: '03', typeName: 'DECISION_BASIS', content: {
    dataPoints: [
      { name: '关联关系', value: '亲属(妻兄妹)', source: '工商数据交叉比对', confidence: 'high' },
      { name: '中标异常率', value: '33% vs 行业18%', source: '历史投标数据', confidence: 'high' },
      { name: '评审偏差', value: '>15分', source: '评审记录分析', confidence: 'high' },
      { name: '报价偏离', value: '低于市场价7.3%', source: '市场价格比对', confidence: 'medium' },
      { name: '项目预算', value: '5200万', source: '采购计划', confidence: 'high' }
    ]
  }},
  { type: '04', typeName: 'CONCLUSION', content: {
    resolutionText: '废除华锐重工资格+启动反腐败调查+废标重招或二选一续评', resolutionType: 'pending', escalationPath: ['首席合规官审批']
  }},
  { type: '05', typeName: 'REUSABLE_RULE', content: {
    ruleText: '招标中发现关联关系 → 自动触发工商数据交叉比对+评审记录回溯+价格异常检测',
    triggerPattern: { category: 'bid_compliance', conditions: [
      { field: '关联关系线索', operator: 'exists', value: true },
      { field: '投标价格偏离', operator: 'gte', value: 0.10 }
    ]},
    recommendedAction: '暂停评标→关联筛查→评审回溯→价格比对→合规处置',
    applicableScope: { plants: ['ALL'], productionLines: ['EQUIPMENT','MATERIAL','SERVICE','ENGINEERING'], customerTiers: [] },
    confidenceScore: 0.92, humanApproved: false
  }}
];

// ============================================================
// ISSUE #3002 - 供应商黑名单准入评审
// ============================================================
export const MOCK_ISSUE_3002: Issue = {
  id: '#3002',
  title: '化工材料供应商黑名单准入评审',
  description: '化工材料供应商"东方化工"近6个月内连续3批次质量不合格，累计造成生产停工损失约850万元。拟将其列入集团供应商黑名单，涉及年度采购额1.8亿元的化工材料供应链调整。',
  category: 'supplier_risk',
  status: 'PENDING_HUMAN',
  urgency: 'urgent',
  sensitivity: 'sensitive',
  creator_user_id: 'u_006',
  creatorName: '刘卫东',
  participant_role_ids: ['mgr_supplier','mgr_risk','mgr_cost','mgr_audit','coord_agent'],
  ontology_node_ids: ['node_supplier','node_material','node_risk','node_cost'],
  parent_topic_id: null,
  referenced_asset_ids: [],
  source_template_id: null,
  pending_user_id: 'u_003',
  pendingUserName: '王德明',
  created_at: '2026-05-14T11:00:00Z',
  updated_at: '2026-05-14T12:30:00Z',
  decided_at: null,
  decided_by_user_id: null,
  final_resolution: null,
  referencedIssues: [
    { id: '#2856', title: '东方化工Q4质量整改', resolution: '限期整改3个月，整改期间降级为B级' }
  ]
};

export const MOCK_MESSAGES_3002: Message[] = [
  {
    id: 'msg_3002_001', topic_id: '#3002', author_type: 'agent', author_id: 'a_supplier', author_display: '供应商', author_color_class: 'primary', message_type: 'STATEMENT',
    content: '东方化工近6个月3批次质量不合格（纯度不达标），Q4已整改但Q1再次复发。累计停工损失850万，影响3条生产线。供应商绩效评分降至62分（集团末位2%）。建议列入黑名单。@成本 评估替代供应商方案。',
    mentions: [
      { start: 115, end: 118, type: 'ROLE', target_role_id: 'mgr_cost', target_display: '成本' }
    ],
    reply_to_message_id: null, reasoning_path: { ontology_refs: ['node_supplier','node_material'] },
    attached_data: { fail_batches: 3, loss_amount: 8500000, perf_score: 62, rank_percentile: 0.02 },
    is_pinned: false, created_at: '2026-05-14T11:00:20Z', created_at_display: '11:00'
  },
  {
    id: 'msg_3002_002', topic_id: '#3002', author_type: 'agent', author_id: 'a_cost', author_display: '成本', author_color_class: 'primary', message_type: 'STATEMENT',
    content: '替代方案：齐鲁石化可承接60%产能，交期45天；金陵化工可承接40%，交期30天。两家合计年度采购额约1.6亿，综合成本较东方化工高约3.2%（+576万/年）。但质量合格率预计提升至99.5%，可避免停工损失。',
    mentions: [],
    reply_to_message_id: 'msg_3002_001', reasoning_path: { ontology_refs: ['node_cost','node_supplier'] },
    attached_data: { alt_suppliers: 2, cost_increase_pct: 0.032, annual_increase: 5760000, expected_quality: 0.995 },
    is_pinned: false, created_at: '2026-05-14T11:05:30Z', created_at_display: '11:05'
  },
  {
    id: 'msg_3002_003', topic_id: '#3002', author_type: 'agent', author_id: 'a_risk', author_display: '风控', author_color_class: 'primary', message_type: 'ALERT',
    content: '风险提示：东方化工实际控制人名下还有2家关联供应商（华东方、北方化工），均在合格供应商名录中。建议同步评估这2家供应商风险，防止黑名单规避。已触发关联交易筛查。',
    mentions: [],
    reply_to_message_id: null, reasoning_path: { ontology_refs: ['node_risk','node_supplier'] },
    attached_data: { related_suppliers: 2, screening_status: 'in_progress' },
    is_pinned: false, created_at: '2026-05-14T11:08:00Z', created_at_display: '11:08'
  },
  {
    id: 'msg_3002_004', topic_id: '#3002', author_type: 'agent', author_id: 'a_coord', author_display: '协调', author_color_class: 'accent', message_type: 'CONSENSUS',
    content: '共识：(1)东方化工列入黑名单，立即停止新订单；(2)齐鲁石化+金陵化工双供应商替代方案，综合成本+3.2%可接受；(3)华东方、北方化工同步降级观察。需 @采购副总裁 决策：是否批准黑名单及替代方案？',
    mentions: [
      { start: 110, end: 118, type: 'ESCALATE', target_role_id: 'vp_procurement', target_display: '采购副总裁' }
    ],
    reply_to_message_id: null, reasoning_path: { ontology_refs: ['node_consensus','node_decision_required'] },
    attached_data: null, is_pinned: true, created_at: '2026-05-14T12:30:00Z', created_at_display: '12:30'
  }
];

export const MOCK_ASSETS_3002: DecisionAsset[] = [
  { type: '01', typeName: 'ISSUE_PROFILE', content: {
    category: 'supplier_risk', tags: ['供应商黑名单','质量不合格','化工材料','替代方案','关联供应商'],
    entities: [
      { type: 'supplier', id: 'SUP_DF', name: '东方化工' },
      { type: 'material', id: 'CHEM_01', name: '化工材料' },
      { type: 'loss', id: '850', name: '850万停工损失' },
      { type: 'annual_amount', id: '180', name: '年度1.8亿采购额' }
    ],
    summary: '供应商黑名单评审 · 连续质量不合格+关联供应商风险 · 年度1.8亿影响', autoGenerated: true
  }},
  { type: '02', typeName: 'KEY_TRADEOFFS', content: {
    tradeoffs: [
      { sideA: '质量零容忍(列入黑名单)', sideB: '年度成本+576万(3.2%)', weightA: 0.75, weightB: 0.25, reasoning: '质量损失850万已超成本增加，且影响生产连续性' },
      { sideA: '双供应商替代(分散风险)', sideB: '供应链管理复杂度增加', weightA: 0.6, weightB: 0.4, reasoning: '双源供应更安全，齐鲁石化+金陵化工互补' },
      { sideA: '关联供应商同步降级', sideB: '可能误伤合规供应商', weightA: 0.55, weightB: 0.45, reasoning: '同一实控人下风险传导概率高，降级观察合理' }
    ]
  }},
  { type: '03', typeName: 'DECISION_BASIS', content: {
    dataPoints: [
      { name: '不合格批次', value: '3批次/6个月', source: '质检数据', confidence: 'high' },
      { name: '停工损失', value: '850万', source: '生产系统', confidence: 'high' },
      { name: '绩效评分', value: '62分(末位2%)', source: '供应商管理系统', confidence: 'high' },
      { name: '替代成本增加', value: '3.2%/年+576万', source: '成本分析', confidence: 'medium' },
      { name: '关联供应商', value: '2家', source: '工商数据', confidence: 'high' }
    ]
  }},
  { type: '04', typeName: 'CONCLUSION', content: {
    resolutionText: '东方化工列入黑名单+双供应商替代+关联供应商降级观察', resolutionType: 'pending', escalationPath: ['采购副总裁审批']
  }},
  { type: '05', typeName: 'REUSABLE_RULE', content: {
    ruleText: '供应商连续不合格 → 自动触发绩效评估+替代方案测算+关联供应商筛查',
    triggerPattern: { category: 'supplier_risk', conditions: [
      { field: '连续不合格批次', operator: 'gte', value: 3 },
      { field: '累计损失金额', operator: 'gte', value: 5000000 }
    ]},
    recommendedAction: '绩效评估→替代方案→关联筛查→黑名单评审→供应链调整',
    applicableScope: { plants: ['ALL'], productionLines: ['ALL'], customerTiers: [] },
    confidenceScore: 0.90, humanApproved: false
  }}
];

// ============================================================
// ISSUE #3003 - 采购合同异常条款预警
// ============================================================
export const MOCK_ISSUE_3003: Issue = {
  id: '#3003',
  title: '采购合同异常条款预警',
  description: '合同审查Agent检测到3份在执行合同存在偏离标准模板的风险条款：合同A违约金条款缺失、合同B质保期缩短50%、合同C付款条件异常宽松（预付款比例达60%）。',
  category: 'contract_risk',
  status: 'DISCUSSING',
  urgency: 'urgent',
  sensitivity: 'normal',
  creator_user_id: 'u_007',
  creatorName: '孙丽华',
  participant_role_ids: ['mgr_contract','mgr_risk','mgr_legal','mgr_audit','coord_agent'],
  ontology_node_ids: ['node_contract','node_compliance','node_risk'],
  parent_topic_id: null,
  referenced_asset_ids: [],
  source_template_id: null,
  pending_user_id: null,
  pendingUserName: null,
  created_at: '2026-05-14T14:00:00Z',
  updated_at: '2026-05-14T15:20:00Z',
  decided_at: null,
  decided_by_user_id: null,
  final_resolution: null,
  referencedIssues: []
};

export const MOCK_MESSAGES_3003: Message[] = [
  {
    id: 'msg_3003_001', topic_id: '#3003', author_type: 'agent', author_id: 'a_contract', author_display: '合同', author_color_class: 'primary', message_type: 'ALERT',
    content: '异常条款预警：(1)合同CT-2026-0189(石化设备)违约金条款完全缺失，标准模板要求合同额5%；(2)合同CT-2026-0203(管道材料)质保期从24个月缩短至12个月；(3)合同CT-2026-0211(技术服务)预付款比例60%，标准为30%。3份合同涉及总金额3800万。',
    mentions: [],
    reply_to_message_id: null, reasoning_path: { ontology_refs: ['node_contract','node_compliance'] },
    attached_data: { abnormal_contracts: 3, total_amount: 38000000 },
    is_pinned: false, created_at: '2026-05-14T14:00:15Z', created_at_display: '14:00'
  },
  {
    id: 'msg_3003_002', topic_id: '#3003', author_type: 'agent', author_id: 'a_risk', author_display: '风控', author_color_class: 'primary', message_type: 'STATEMENT',
    content: '风险评估：预付款60%合同(CT-2026-0211)供应商为新准入供应商(合作不满1年)，高预付款+新供应商组合风险等级为"高"。违约金缺失合同供应商为老供应商但近2年有2次延期交付记录。建议：(1)暂停高风险合同付款；(2)要求补充违约金条款；(3)质保期恢复标准值。',
    mentions: [],
    reply_to_message_id: 'msg_3003_001', reasoning_path: { ontology_refs: ['node_risk','node_contract'] },
    attached_data: { high_risk_count: 1, recommendations: 3 },
    is_pinned: false, created_at: '2026-05-14T14:08:30Z', created_at_display: '14:08'
  },
  {
    id: 'msg_3003_003', topic_id: '#3003', author_type: 'agent', author_id: 'a_audit', author_display: '审计', author_color_class: 'primary', message_type: 'STATEMENT',
    content: '审计回溯：3份异常合同的审批链中，CT-2026-0211的审批人与CT-2026-0203为同一人（采购经理马某），其审批的合同异常率(12%)显著高于部门均值(3%)。建议纳入重点审计对象。',
    mentions: [],
    reply_to_message_id: 'msg_3003_001', reasoning_path: { ontology_refs: ['node_audit','node_compliance'] },
    attached_data: { approver: '马某', abnormal_rate: 0.12, dept_avg: 0.03 },
    is_pinned: false, created_at: '2026-05-14T14:15:00Z', created_at_display: '14:15'
  }
];

export const MOCK_ASSETS_3003: DecisionAsset[] = [
  { type: '01', typeName: 'ISSUE_PROFILE', content: {
    category: 'contract_risk', tags: ['合同风险','异常条款','违约金缺失','质保期缩短','预付款异常'],
    entities: [
      { type: 'contract', id: 'CT-189', name: 'CT-2026-0189 石化设备' },
      { type: 'contract', id: 'CT-203', name: 'CT-2026-0203 管道材料' },
      { type: 'contract', id: 'CT-211', name: 'CT-2026-0211 技术服务' },
      { type: 'amount', id: '3800', name: '3800万合同总额' }
    ],
    summary: '合同条款异常预警 · 3份合同偏离标准模板 · 涉及3800万', autoGenerated: true
  }},
  { type: '02', typeName: 'KEY_TRADEOFFS', content: {
    tradeoffs: [
      { sideA: '严格执行标准模板', sideB: '可能影响业务推进效率', weightA: 0.8, weightB: 0.2, reasoning: '合同合规是底线，异常条款必须纠正' },
      { sideA: '审批人异常率排查', sideB: '可能引发人事争议', weightA: 0.65, weightB: 0.35, reasoning: '数据客观，审计发现问题应如实上报' }
    ]
  }},
  { type: '03', typeName: 'DECISION_BASIS', content: {
    dataPoints: [
      { name: '异常合同数', value: '3份', source: '合同审查Agent', confidence: 'high' },
      { name: '涉及金额', value: '3800万', source: '合同系统', confidence: 'high' },
      { name: '审批人异常率', value: '12% vs 3%', source: '审计分析', confidence: 'high' },
      { name: '高风险合同', value: '1份(预付60%+新供应商)', source: '风控评估', confidence: 'high' }
    ]
  }},
  { type: '04', typeName: 'CONCLUSION', content: {
    resolutionText: '暂停高风险合同付款+补充违约金条款+质保期恢复+审批人审计', resolutionType: 'pending', escalationPath: ['合规副总裁审批']
  }},
  { type: '05', typeName: 'REUSABLE_RULE', content: {
    ruleText: '合同条款偏离标准模板 → 自动触发风险评估+审批人回溯+付款冻结',
    triggerPattern: { category: 'contract_risk', conditions: [
      { field: '条款偏离度', operator: 'gte', value: 2 },
      { field: '合同金额', operator: 'gte', value: 10000000 }
    ]},
    recommendedAction: '风险评估→条款纠正→审批人审计→付款管控',
    applicableScope: { plants: ['ALL'], productionLines: ['ALL'], customerTiers: [] },
    confidenceScore: 0.88, humanApproved: false
  }}
];

// ============================================================
// ISSUE #3004 - 串标围标风险识别
// ============================================================
export const MOCK_ISSUE_3004: Issue = {
  id: '#3004',
  title: '串标围标风险识别',
  description: '分析近6个月招标数据，发现2组疑似围标行为：A组3家投标方报价呈阶梯式分布（差价<2%），B组2家投标方IP地址相同。涉及项目总金额1.2亿元。',
  category: 'collusion_detection',
  status: 'OPEN',
  urgency: 'urgent',
  sensitivity: 'highly_sensitive',
  creator_user_id: 'u_008',
  creatorName: '周建国',
  participant_role_ids: ['mgr_risk','mgr_bid','mgr_audit','mgr_legal','coord_agent'],
  ontology_node_ids: ['node_bid','node_risk','node_compliance'],
  parent_topic_id: null,
  referenced_asset_ids: [],
  source_template_id: null,
  pending_user_id: null,
  pendingUserName: null,
  created_at: '2026-05-13T16:00:00Z',
  updated_at: '2026-05-13T17:00:00Z',
  decided_at: null,
  decided_by_user_id: null,
  final_resolution: null,
  referencedIssues: []
};

export const MOCK_MESSAGES_3004: Message[] = [
  {
    id: 'msg_3004_001', topic_id: '#3004', author_type: 'agent', author_id: 'a_risk', author_display: '风控', author_color_class: 'primary', message_type: 'ALERT',
    content: '串标围标检测结果：A组（华东管道项目）3家投标方报价分别为3280万、3295万、3310万，差价<2%，呈典型阶梯报价模式。B组（华北电气项目）2家投标方投标文件上传IP地址相同（192.168.1.105），且投标时间仅差8分钟。涉及总金额1.2亿。@招建 暂停相关项目评标。',
    mentions: [
      { start: 195, end: 198, type: 'ROLE', target_role_id: 'mgr_bid', target_display: '招建' }
    ],
    reply_to_message_id: null, reasoning_path: { ontology_refs: ['node_risk','node_bid'] },
    attached_data: { group_a: { count: 3, price_range: '3280-3310万', gap_pct: 0.02 }, group_b: { count: 2, ip_match: true, time_gap_min: 8 }, total_amount: 120000000 },
    is_pinned: false, created_at: '2026-05-13T16:00:15Z', created_at_display: '16:00'
  },
  {
    id: 'msg_3004_002', topic_id: '#3004', author_type: 'agent', author_id: 'a_audit', author_display: '审计', author_color_class: 'primary', message_type: 'STATEMENT',
    content: '深度分析：A组3家企业法人代表互为同学关系（工商关系图谱确认）。B组2家企业共用同一投标编制软件版本和文档模板元数据。证据链完整，建议移交纪检监察部门，并向监管部门报告。',
    mentions: [],
    reply_to_message_id: 'msg_3004_001', reasoning_path: { ontology_refs: ['node_audit','node_compliance'] },
    attached_data: { group_a_relation: '同学关系', group_b_evidence: '软件版本+文档元数据一致' },
    is_pinned: false, created_at: '2026-05-13T16:10:00Z', created_at_display: '16:10'
  }
];

export const MOCK_ASSETS_3004: DecisionAsset[] = [
  { type: '01', typeName: 'ISSUE_PROFILE', content: {
    category: 'collusion_detection', tags: ['串标围标','阶梯报价','IP相同','围标检测','招标合规'],
    entities: [
      { type: 'project', id: 'PJ_EAST', name: '华东管道项目' },
      { type: 'project', id: 'PJ_NORTH', name: '华北电气项目' },
      { type: 'amount', id: '120', name: '1.2亿涉及金额' }
    ],
    summary: '串标围标检测 · 2组疑似围标行为 · 涉及1.2亿', autoGenerated: true
  }},
  { type: '02', typeName: 'KEY_TRADEOFFS', content: {
    tradeoffs: [
      { sideA: '严厉处罚(废标+黑名单+报案)', sideB: '可能引发法律诉讼', weightA: 0.85, weightB: 0.15, reasoning: '证据链完整，应依法处置以儆效尤' },
      { sideA: '扩大排查范围', sideB: '排查成本与时间', weightA: 0.7, weightB: 0.3, reasoning: '已发现明确模式，应扩大排查近3年所有招标数据' }
    ]
  }},
  { type: '03', typeName: 'DECISION_BASIS', content: {
    dataPoints: [
      { name: 'A组报价差', value: '<2%', source: '招标系统', confidence: 'high' },
      { name: 'B组IP相同', value: '192.168.1.105', source: '投标系统日志', confidence: 'high' },
      { name: '关联关系', value: '同学关系(工商确认)', source: '工商数据', confidence: 'high' },
      { name: '涉及金额', value: '1.2亿', source: '招标记录', confidence: 'high' }
    ]
  }},
  { type: '04', typeName: 'CONCLUSION', content: {
    resolutionText: '废标+黑名单+移交纪检+向监管部门报告', resolutionType: 'pending', escalationPath: ['首席合规官→CEO']
  }},
  { type: '05', typeName: 'REUSABLE_RULE', content: {
    ruleText: '投标报价差<5%且投标方存在关联 → 自动触发围标嫌疑预警',
    triggerPattern: { category: 'collusion_detection', conditions: [
      { field: '报价差', operator: 'lt', value: 0.05 },
      { field: '关联关系', operator: 'exists', value: true }
    ]},
    recommendedAction: '暂停评标→证据锁定→深度调查→合规处置',
    applicableScope: { plants: ['ALL'], productionLines: ['ALL'], customerTiers: [] },
    confidenceScore: 0.95, humanApproved: false
  }}
];

// ============================================================
// 其余议题（精简版，保持数据完整性）
// ============================================================
export const MOCK_ISSUE_3005: Issue = {
  id: '#3005', title: '年度采购预算超支预警', description: 'Q3采购执行率已达全年预算的78%，按当前趋势Q4将超支12%。需评估是否调整预算或收紧采购审批。',
  category: 'budget_overrun', status: 'DISCUSSING', urgency: 'urgent', sensitivity: 'normal',
  creator_user_id: 'u_010', creatorName: '郑海涛', participant_role_ids: ['mgr_cost','mgr_audit','vp_finance','coord_agent'],
  ontology_node_ids: ['node_budget','node_cost','node_compliance'], parent_topic_id: null, referenced_asset_ids: [], source_template_id: null,
  pending_user_id: null, pendingUserName: null, created_at: '2026-05-13T10:00:00Z', updated_at: '2026-05-13T11:30:00Z',
  decided_at: null, decided_by_user_id: null, final_resolution: null, referencedIssues: []
};

export const MOCK_MESSAGES_3005: Message[] = [
  { id: 'msg_3005_001', topic_id: '#3005', author_type: 'agent', author_id: 'a_cost', author_display: '成本', author_color_class: 'primary', message_type: 'ALERT',
    content: '预算预警：Q3采购执行率78%，剩余预算仅够支撑正常采购至11月。超支主因：(1)设备采购超预算23%（西北油田新增需求）；(2)材料价格上涨8%。建议：设备类暂停非紧急采购，材料类启动框架协议价格重新谈判。',
    mentions: [], reply_to_message_id: null, reasoning_path: { ontology_refs: ['node_budget','node_cost'] },
    attached_data: { execution_rate: 0.78, equipment_overrun: 0.23, material_inflation: 0.08 },
    is_pinned: false, created_at: '2026-05-13T10:00:15Z', created_at_display: '10:00'
  },
  { id: 'msg_3005_002', topic_id: '#3005', author_type: 'agent', author_id: 'a_audit', author_display: '审计', author_color_class: 'primary', message_type: 'STATEMENT',
    content: '预算执行分析：设备类超预算的23%中，15%为计划外紧急采购（生产急需），8%为价格超预期。建议：(1)紧急采购走特批通道；(2)价格超预期部分纳入季度价格审查；(3)Q4预算追加申请需附详细论证。',
    mentions: [], reply_to_message_id: 'msg_3005_001', reasoning_path: { ontology_refs: ['node_audit','node_budget'] },
    attached_data: { urgent_pct: 0.15, price_overrun_pct: 0.08 },
    is_pinned: false, created_at: '2026-05-13T10:15:00Z', created_at_display: '10:15'
  }
];

export const MOCK_ASSETS_3005: DecisionAsset[] = [
  { type: '01', typeName: 'ISSUE_PROFILE', content: { category: 'budget_overrun', tags: ['预算超支','采购执行率','设备采购','价格波动'], entities: [{ type: 'budget', id: 'Q3', name: 'Q3采购预算' }], summary: '预算超支预警 · Q3执行率78% · 设备类超预算23%', autoGenerated: true }},
  { type: '02', typeName: 'KEY_TRADEOFFS', content: { tradeoffs: [{ sideA: '收紧审批(控制超支)', sideB: '影响生产急需采购', weightA: 0.5, weightB: 0.5, reasoning: '紧急生产需求不能卡，但价格超预期需严格审查' }] }},
  { type: '03', typeName: 'DECISION_BASIS', content: { dataPoints: [{ name: '执行率', value: '78%', source: '预算系统', confidence: 'high' }, { name: '设备超预算', value: '23%', source: '采购分析', confidence: 'high' }] }},
  { type: '04', typeName: 'CONCLUSION', content: { resolutionText: '紧急采购特批+价格审查+Q4追加论证', resolutionType: 'pending', escalationPath: ['财务副总裁审批'] }},
  { type: '05', typeName: 'REUSABLE_RULE', content: { ruleText: '季度预算执行率>75% → 自动预警+分类分析', triggerPattern: { category: 'budget_overrun', conditions: [{ field: '执行率', operator: 'gte', value: 0.75 }]}, recommendedAction: '分类分析→紧急特批→价格审查→追加论证', applicableScope: { plants: ['ALL'], productionLines: ['ALL'], customerTiers: [] }, confidenceScore: 0.85, humanApproved: false }}
];

export const MOCK_ISSUE_3006: Issue = {
  id: '#3006', title: '关联交易合规审查', description: '某子公司与关联方的采购交易占比从8%异常升高至22%，涉及金额4600万元。需审查交易定价公允性和审批流程合规性。',
  category: 'related_party', status: 'PENDING_HUMAN', urgency: 'urgent', sensitivity: 'highly_sensitive',
  creator_user_id: 'u_009', creatorName: '吴明辉', participant_role_ids: ['mgr_audit','mgr_risk','mgr_legal','mgr_cost','coord_agent'],
  ontology_node_ids: ['node_compliance','node_risk','node_audit'], parent_topic_id: null, referenced_asset_ids: [], source_template_id: null,
  pending_user_id: 'u_002', pendingUserName: '李正廉', created_at: '2026-05-12T09:00:00Z', updated_at: '2026-05-12T11:00:00Z',
  decided_at: null, decided_by_user_id: null, final_resolution: null, referencedIssues: []
};

export const MOCK_MESSAGES_3006: Message[] = [
  { id: 'msg_3006_001', topic_id: '#3006', author_type: 'agent', author_id: 'a_audit', author_display: '审计', author_color_class: 'primary', message_type: 'ALERT',
    content: '关联交易异常：华东子公司与"东方石化集团"采购占比从Q1的8%升至Q2的22%，增幅175%。涉及金额4600万。东方石化实控人为集团前高管亲属。定价比对：部分物资高于市场价12-18%。@风控 深度筛查关联交易图谱。',
    mentions: [{ start: 155, end: 158, type: 'ROLE', target_role_id: 'mgr_risk', target_display: '风控' }],
    reply_to_message_id: null, reasoning_path: { ontology_refs: ['node_audit','node_compliance'] },
    attached_data: { q1_pct: 0.08, q2_pct: 0.22, amount: 46000000, price_premium: '12-18%' },
    is_pinned: false, created_at: '2026-05-12T09:00:15Z', created_at_display: '09:00'
  },
  { id: 'msg_3006_002', topic_id: '#3006', author_type: 'agent', author_id: 'a_risk', author_display: '风控', author_color_class: 'primary', message_type: 'STATEMENT',
    content: '关联交易图谱分析：东方石化集团实控人张某与集团前副总裁李某为夫妻关系。华东子公司采购经理王某系李某外甥。存在利益输送嫌疑。建议：(1)立即暂停与东方石化新合同；(2)已执行合同价格审计；(3)王某调离采购岗位。',
    mentions: [], reply_to_message_id: 'msg_3006_001', reasoning_path: { ontology_refs: ['node_risk','node_compliance'] },
    attached_data: { relation_chain: '前副总裁→妻子→东方石化→外甥(采购经理)' },
    is_pinned: false, created_at: '2026-05-12T09:20:00Z', created_at_display: '09:20'
  }
];

export const MOCK_ASSETS_3006: DecisionAsset[] = [
  { type: '01', typeName: 'ISSUE_PROFILE', content: { category: 'related_party', tags: ['关联交易','利益输送','定价异常','亲属关系'], entities: [{ type: 'supplier', id: 'SUP_DF', name: '东方石化集团' }, { type: 'amount', id: '4600', name: '4600万关联交易' }], summary: '关联交易合规审查 · 占比异常升高+定价偏高+亲属关系链', autoGenerated: true }},
  { type: '02', typeName: 'KEY_TRADEOFFS', content: { tradeoffs: [{ sideA: '彻底清查(暂停+审计+调岗)', sideB: '影响正常业务', weightA: 0.85, weightB: 0.15, reasoning: '利益输送嫌疑明确，应果断处置' }] }},
  { type: '03', typeName: 'DECISION_BASIS', content: { dataPoints: [{ name: '占比增幅', value: '8%→22%', source: '采购数据', confidence: 'high' }, { name: '定价溢价', value: '12-18%', source: '价格比对', confidence: 'high' }, { name: '关系链', value: '前副总裁→妻→供应商→外甥(采购经理)', source: '工商数据', confidence: 'high' }] }},
  { type: '04', typeName: 'CONCLUSION', content: { resolutionText: '暂停新合同+价格审计+采购经理调岗+移交纪检', resolutionType: 'pending', escalationPath: ['首席合规官→CEO'] }},
  { type: '05', typeName: 'REUSABLE_RULE', content: { ruleText: '关联交易占比季度增幅>50% → 自动触发合规审查', triggerPattern: { category: 'related_party', conditions: [{ field: '季度增幅', operator: 'gte', value: 0.5 }]}, recommendedAction: '图谱分析→定价审计→关系链排查→合规处置', applicableScope: { plants: ['ALL'], productionLines: ['ALL'], customerTiers: [] }, confidenceScore: 0.93, humanApproved: false }}
];

export const MOCK_ISSUE_3007: Issue = {
  id: '#3007', title: '供应商绩效淘汰决策', description: '年度供应商绩效考核完成，后5%共28家供应商需淘汰评审。涉及年度采购额3.2亿元，需评估替代方案和过渡期安排。',
  category: 'supplier_elimination', status: 'DISCUSSING', urgency: 'normal', sensitivity: 'normal',
  creator_user_id: 'u_006', creatorName: '刘卫东', participant_role_ids: ['mgr_supplier','mgr_cost','mgr_risk','coord_agent'],
  ontology_node_ids: ['node_supplier','node_material','node_cost'], parent_topic_id: null, referenced_asset_ids: [], source_template_id: null,
  pending_user_id: null, pendingUserName: null, created_at: '2026-05-11T14:00:00Z', updated_at: '2026-05-11T16:00:00Z',
  decided_at: null, decided_by_user_id: null, final_resolution: null, referencedIssues: []
};

export const MOCK_MESSAGES_3007: Message[] = [
  { id: 'msg_3007_001', topic_id: '#3007', author_type: 'agent', author_id: 'a_supplier', author_display: '供应商', author_color_class: 'primary', message_type: 'STATEMENT',
    content: '年度绩效考核结果：后5%共28家供应商，综合评分<65分。其中：设备类8家（年度采购额1.2亿）、材料类12家（1.5亿）、服务类8家（0.5亿）。主要扣分项：质量不合格(45%)、交期延误(30%)、服务响应慢(25%)。@成本 评估替代供应商可用性。',
    mentions: [{ start: 135, end: 138, type: 'ROLE', target_role_id: 'mgr_cost', target_display: '成本' }],
    reply_to_message_id: null, reasoning_path: { ontology_refs: ['node_supplier','node_material'] },
    attached_data: { total_eliminate: 28, total_amount: 320000000, equipment_count: 8, material_count: 12, service_count: 8 },
    is_pinned: false, created_at: '2026-05-11T14:00:15Z', created_at_display: '14:00'
  }
];

export const MOCK_ASSETS_3007: DecisionAsset[] = [
  { type: '01', typeName: 'ISSUE_PROFILE', content: { category: 'supplier_elimination', tags: ['供应商淘汰','绩效考核','替代方案','过渡期'], entities: [{ type: 'supplier', id: '28', name: '28家待淘汰供应商' }, { type: 'amount', id: '320', name: '3.2亿涉及金额' }], summary: '供应商淘汰评审 · 后5%共28家 · 涉及3.2亿', autoGenerated: true }},
  { type: '02', typeName: 'KEY_TRADEOFFS', content: { tradeoffs: [{ sideA: '严格执行淘汰(提升供应链质量)', sideB: '短期内供应风险', weightA: 0.6, weightB: 0.4, reasoning: '应分批淘汰+替代供应商预准入，降低过渡风险' }] }},
  { type: '03', typeName: 'DECISION_BASIS', content: { dataPoints: [{ name: '淘汰数量', value: '28家(后5%)', source: '绩效系统', confidence: 'high' }, { name: '涉及金额', value: '3.2亿/年', source: '采购数据', confidence: 'high' }] }},
  { type: '04', typeName: 'CONCLUSION', content: { resolutionText: '分批淘汰+替代预准入+3个月过渡期', resolutionType: 'pending', escalationPath: ['采购副总裁审批'] }},
  { type: '05', typeName: 'REUSABLE_RULE', content: { ruleText: '供应商绩效<65分 → 自动进入淘汰评审流程', triggerPattern: { category: 'supplier_elimination', conditions: [{ field: '绩效评分', operator: 'lt', value: 65 }]}, recommendedAction: '绩效评估→替代方案→分批淘汰→过渡期管理', applicableScope: { plants: ['ALL'], productionLines: ['ALL'], customerTiers: [] }, confidenceScore: 0.87, humanApproved: false }}
];

export const MOCK_ISSUE_3008: Issue = {
  id: '#3008', title: '反商业贿赂专项审计', description: '接到匿名举报，西北油田某项目采购负责人赵某疑似收受供应商回扣，涉及金额约200万元。需启动反腐败专项调查。',
  category: 'anti_corruption', status: 'OPEN', urgency: 'critical', sensitivity: 'highly_sensitive',
  creator_user_id: 'u_009', creatorName: '吴明辉', participant_role_ids: ['mgr_audit','mgr_risk','mgr_legal','cco','coord_agent'],
  ontology_node_ids: ['node_audit','node_compliance','node_risk'], parent_topic_id: null, referenced_asset_ids: [], source_template_id: null,
  pending_user_id: null, pendingUserName: null, created_at: '2026-05-15T08:00:00Z', updated_at: '2026-05-15T08:30:00Z',
  decided_at: null, decided_by_user_id: null, final_resolution: null, referencedIssues: []
};

export const MOCK_MESSAGES_3008: Message[] = [
  { id: 'msg_3008_001', topic_id: '#3008', author_type: 'agent', author_id: 'a_audit', author_display: '审计', author_color_class: 'primary', message_type: 'ALERT',
    content: '紧急：匿名举报西北油田项目采购负责人赵某收受回扣。初步核查：赵某近2年审批的供应商"西域物资"采购额从500万增至3200万（增幅540%），且赵某配偶名下公司与西域物资存在业务往来。举报金额约200万。建议立即：(1)赵某停职调查；(2)冻结西域物资付款；(3)调取赵某2年审批记录全量审计。',
    mentions: [], reply_to_message_id: null, reasoning_path: { ontology_refs: ['node_audit','node_compliance'] },
    attached_data: { supplier_growth: '500万→3200万', growth_pct: 5.4, alleged_amount: 2000000 },
    is_pinned: false, created_at: '2026-05-15T08:00:15Z', created_at_display: '08:00'
  }
];

export const MOCK_ASSETS_3008: DecisionAsset[] = [
  { type: '01', typeName: 'ISSUE_PROFILE', content: { category: 'anti_corruption', tags: ['反腐败','商业贿赂','匿名举报','采购负责人','停职调查'], entities: [{ type: 'person', id: 'ZHAO', name: '采购负责人赵某' }, { type: 'supplier', id: 'SUP_XY', name: '西域物资' }], summary: '反商业贿赂 · 匿名举报+采购额异常增长+亲属关联', autoGenerated: true }},
  { type: '02', typeName: 'KEY_TRADEOFFS', content: { tradeoffs: [{ sideA: '立即停职+冻结付款', sideB: '可能影响正常业务', weightA: 0.9, weightB: 0.1, reasoning: '反腐零容忍，宁可短期影响也不能姑息' }] }},
  { type: '03', typeName: 'DECISION_BASIS', content: { dataPoints: [{ name: '采购额增幅', value: '540%(500万→3200万)', source: '采购数据', confidence: 'high' }, { name: '举报金额', value: '约200万', source: '匿名举报', confidence: 'medium' }, { name: '亲属关联', value: '配偶公司↔供应商', source: '工商数据', confidence: 'high' }] }},
  { type: '04', typeName: 'CONCLUSION', content: { resolutionText: '停职+冻结付款+全量审计+移交纪检', resolutionType: 'pending', escalationPath: ['首席合规官→CEO'] }},
  { type: '05', typeName: 'REUSABLE_RULE', content: { ruleText: '供应商采购额年度增幅>200% → 自动触发反腐败预警', triggerPattern: { category: 'anti_corruption', conditions: [{ field: '年度增幅', operator: 'gte', value: 2.0 }]}, recommendedAction: '停职→冻结→审计→纪检', applicableScope: { plants: ['ALL'], productionLines: ['ALL'], customerTiers: [] }, confidenceScore: 0.91, humanApproved: false }}
];

export const MOCK_ISSUE_3009: Issue = {
  id: '#3009', title: '集中采购 vs 分散采购策略评估', description: '办公用品类物资目前各子公司分散采购，年度总额约2800万元。评估转为集团集中采购的可行性和预期节约效果。',
  category: 'centralized_procurement', status: 'DISCUSSING', urgency: 'normal', sensitivity: 'normal',
  creator_user_id: 'u_010', creatorName: '郑海涛', participant_role_ids: ['mgr_cost','mgr_bid','vp_procurement','coord_agent'],
  ontology_node_ids: ['node_material','node_cost','node_procurement'], parent_topic_id: null, referenced_asset_ids: [], source_template_id: null,
  pending_user_id: null, pendingUserName: null, created_at: '2026-05-10T10:00:00Z', updated_at: '2026-05-10T12:00:00Z',
  decided_at: null, decided_by_user_id: null, final_resolution: null, referencedIssues: []
};

export const MOCK_MESSAGES_3009: Message[] = [
  { id: 'msg_3009_001', topic_id: '#3009', author_type: 'agent', author_id: 'a_cost', author_display: '成本', author_color_class: 'primary', message_type: 'STATEMENT',
    content: '集中采购可行性分析：办公用品类年度2800万，分散采购下各子公司独立签约，价格差异最高达35%。集中采购预计：(1)议价能力提升，综合节约率12-15%（约336-420万/年）；(2)供应商从42家精简至8-10家；(3)管理成本降低约80万/年。风险：子公司个性化需求响应可能变慢。',
    mentions: [], reply_to_message_id: null, reasoning_path: { ontology_refs: ['node_cost','node_material'] },
    attached_data: { annual_amount: 28000000, saving_rate: '12-15%', saving_amount: '336-420万', supplier_reduction: '42→8-10家' },
    is_pinned: false, created_at: '2026-05-10T10:00:15Z', created_at_display: '10:00'
  }
];

export const MOCK_ASSETS_3009: DecisionAsset[] = [
  { type: '01', typeName: 'ISSUE_PROFILE', content: { category: 'centralized_procurement', tags: ['集中采购','办公用品','成本节约','供应商精简'], entities: [{ type: 'material', id: 'OFFICE', name: '办公用品' }, { type: 'amount', id: '2800', name: '年度2800万' }], summary: '集中采购策略评估 · 年度2800万 · 预计节约12-15%', autoGenerated: true }},
  { type: '02', typeName: 'KEY_TRADEOFFS', content: { tradeoffs: [{ sideA: '集中采购(节约336-420万/年)', sideB: '子公司灵活性降低', weightA: 0.7, weightB: 0.3, reasoning: '节约效果显著，可通过框架协议保留个性化条款' }] }},
  { type: '03', typeName: 'DECISION_BASIS', content: { dataPoints: [{ name: '年度总额', value: '2800万', source: '采购数据', confidence: 'high' }, { name: '价格差异', value: '最高35%', source: '价格比对', confidence: 'high' }, { name: '预计节约', value: '12-15%', source: '成本分析', confidence: 'medium' }] }},
  { type: '04', typeName: 'CONCLUSION', content: { resolutionText: '推进集中采购+框架协议+保留个性化条款', resolutionType: 'pending', escalationPath: ['采购副总裁审批'] }},
  { type: '05', typeName: 'REUSABLE_RULE', content: { ruleText: '同类物资价格差异>20% → 建议集中采购评估', triggerPattern: { category: 'centralized_procurement', conditions: [{ field: '价格差异', operator: 'gte', value: 0.20 }]}, recommendedAction: '价格分析→集中评估→框架协议→分批实施', applicableScope: { plants: ['ALL'], productionLines: ['ALL'], customerTiers: [] }, confidenceScore: 0.86, humanApproved: false }}
];

export const MOCK_ISSUE_3010: Issue = {
  id: '#3010', title: '国际制裁合规筛查', description: '部分进口设备供应商涉及制裁名单筛查，3家供应商初步命中待确认。涉及在执行合同金额6800万元，需评估合规风险和替代方案。',
  category: 'sanction_screening', status: 'OPEN', urgency: 'critical', sensitivity: 'highly_sensitive',
  creator_user_id: 'u_008', creatorName: '周建国', participant_role_ids: ['mgr_risk','mgr_legal','mgr_contract','cco','coord_agent'],
  ontology_node_ids: ['node_supplier','node_compliance','node_risk'], parent_topic_id: null, referenced_asset_ids: [], source_template_id: null,
  pending_user_id: null, pendingUserName: null, created_at: '2026-05-15T11:00:00Z', updated_at: '2026-05-15T11:30:00Z',
  decided_at: null, decided_by_user_id: null, final_resolution: null, referencedIssues: []
};

export const MOCK_MESSAGES_3010: Message[] = [
  { id: 'msg_3010_001', topic_id: '#3010', author_type: 'agent', author_id: 'a_risk', author_display: '风控', author_color_class: 'primary', message_type: 'ALERT',
    content: '制裁筛查预警：季度筛查发现3家进口设备供应商初步命中：(1)俄罗斯某阀门制造商（OFAC名单）；(2)伊朗某石化设备代理商（UN制裁）；(3)某香港中间商（最终用户存疑）。在执行合同合计6800万。@法务 确认制裁清单精确匹配，@合同 评估合同终止条款。',
    mentions: [
      { start: 130, end: 133, type: 'ROLE', target_role_id: 'mgr_legal', target_display: '法务' },
      { start: 148, end: 151, type: 'ROLE', target_role_id: 'mgr_contract', target_display: '合同' }
    ],
    reply_to_message_id: null, reasoning_path: { ontology_refs: ['node_risk','node_compliance'] },
    attached_data: { hit_suppliers: 3, contract_amount: 68000000 },
    is_pinned: false, created_at: '2026-05-15T11:00:15Z', created_at_display: '11:00'
  }
];

export const MOCK_ASSETS_3010: DecisionAsset[] = [
  { type: '01', typeName: 'ISSUE_PROFILE', content: { category: 'sanction_screening', tags: ['制裁筛查','进口设备','OFAC','UN制裁','合规风险'], entities: [{ type: 'supplier', id: 'SANCTIONED', name: '3家命中供应商' }, { type: 'amount', id: '6800', name: '6800万在执行合同' }], summary: '国际制裁筛查 · 3家供应商命中 · 涉及6800万合同', autoGenerated: true }},
  { type: '02', typeName: 'KEY_TRADEOFFS', content: { tradeoffs: [{ sideA: '立即终止合同(零风险)', sideB: '6800万合同违约成本', weightA: 0.9, weightB: 0.1, reasoning: '制裁合规是法律红线，违约成本远低于违规成本' }] }},
  { type: '03', typeName: 'DECISION_BASIS', content: { dataPoints: [{ name: '命中供应商', value: '3家', source: '制裁名单筛查', confidence: 'high' }, { name: '涉及金额', value: '6800万', source: '合同系统', confidence: 'high' }, { name: '制裁类型', value: 'OFAC+UN', source: '制裁清单', confidence: 'high' }] }},
  { type: '04', typeName: 'CONCLUSION', content: { resolutionText: '确认命中→合同终止→替代供应商→合规报告', resolutionType: 'pending', escalationPath: ['首席合规官→CEO'] }},
  { type: '05', typeName: 'REUSABLE_RULE', content: { ruleText: '供应商命中制裁名单 → 自动冻结合同+启动替代方案', triggerPattern: { category: 'sanction_screening', conditions: [{ field: '制裁命中', operator: 'eq', value: true }]}, recommendedAction: '冻结→确认→终止→替代→报告', applicableScope: { plants: ['ALL'], productionLines: ['ALL'], customerTiers: [] }, confidenceScore: 0.97, humanApproved: false }}
];

export const MOCK_ISSUE_3011: Issue = {
  id: '#3011', title: '采购流程合规性审计', description: '季度采购流程合规率仅为87%，低于目标95%。主要问题：未经审批的紧急采购(42%)、采购方式选择不当(31%)、评标流程不完整(27%)。',
  category: 'process_audit', status: 'DISCUSSING', urgency: 'normal', sensitivity: 'normal',
  creator_user_id: 'u_009', creatorName: '吴明辉', participant_role_ids: ['mgr_audit','mgr_bid','mgr_risk','coord_agent'],
  ontology_node_ids: ['node_audit','node_compliance','node_procurement'], parent_topic_id: null, referenced_asset_ids: [], source_template_id: null,
  pending_user_id: null, pendingUserName: null, created_at: '2026-05-10T14:00:00Z', updated_at: '2026-05-10T16:00:00Z',
  decided_at: null, decided_by_user_id: null, final_resolution: null, referencedIssues: []
};

export const MOCK_MESSAGES_3011: Message[] = [
  { id: 'msg_3011_001', topic_id: '#3011', author_type: 'agent', author_id: 'a_audit', author_display: '审计', author_color_class: 'primary', message_type: 'STATEMENT',
    content: 'Q1采购流程合规审计结果：合规率87%（目标95%），共47项不合规。分类：(1)未经审批紧急采购20项(42%) - 主要在西北和华东；(2)采购方式选择不当15项(31%) - 应招标未招标；(3)评标流程不完整12项(25%) - 缺少技术评审环节。建议：强化紧急采购审批流程，增加采购方式合规自动校验。',
    mentions: [], reply_to_message_id: null, reasoning_path: { ontology_refs: ['node_audit','node_compliance'] },
    attached_data: { compliance_rate: 0.87, target: 0.95, total_violations: 47, urgent_no_approval: 20, wrong_method: 15, incomplete_eval: 12 },
    is_pinned: false, created_at: '2026-05-10T14:00:15Z', created_at_display: '14:00'
  }
];

export const MOCK_ASSETS_3011: DecisionAsset[] = [
  { type: '01', typeName: 'ISSUE_PROFILE', content: { category: 'process_audit', tags: ['流程合规','紧急采购','采购方式','评标流程','合规率'], entities: [{ type: 'audit', id: 'Q1_AUDIT', name: 'Q1采购流程审计' }], summary: '流程合规审计 · 合规率87%低于目标 · 47项不合规', autoGenerated: true }},
  { type: '02', typeName: 'KEY_TRADEOFFS', content: { tradeoffs: [{ sideA: '严格合规(补齐审批)', sideB: '影响采购效率', weightA: 0.65, weightB: 0.35, reasoning: '通过系统自动化校验可兼顾合规与效率' }] }},
  { type: '03', typeName: 'DECISION_BASIS', content: { dataPoints: [{ name: '合规率', value: '87%(目标95%)', source: '审计系统', confidence: 'high' }, { name: '不合规项', value: '47项', source: '审计报告', confidence: 'high' }, { name: '主因', value: '紧急采购未审批(42%)', source: '根因分析', confidence: 'high' }] }},
  { type: '04', typeName: 'CONCLUSION', content: { resolutionText: '强化紧急审批+采购方式自动校验+评标流程补全', resolutionType: 'pending', escalationPath: ['合规副总裁审批'] }},
  { type: '05', typeName: 'REUSABLE_RULE', content: { ruleText: '季度合规率<90% → 自动触发流程整改专项', triggerPattern: { category: 'process_audit', conditions: [{ field: '合规率', operator: 'lt', value: 0.90 }]}, recommendedAction: '根因分析→流程优化→系统校验→培训宣贯', applicableScope: { plants: ['ALL'], productionLines: ['ALL'], customerTiers: [] }, confidenceScore: 0.88, humanApproved: false }}
];

// ============================================================
// ALL ISSUES COLLECTION
// ============================================================
export const ALL_ISSUES: Issue[] = [
  MOCK_ISSUE_3001, MOCK_ISSUE_3002, MOCK_ISSUE_3003, MOCK_ISSUE_3004,
  MOCK_ISSUE_3005, MOCK_ISSUE_3006, MOCK_ISSUE_3007, MOCK_ISSUE_3008,
  MOCK_ISSUE_3009, MOCK_ISSUE_3010, MOCK_ISSUE_3011
];

export const ALL_MESSAGES: Record<string, Message[]> = {
  '#3001': MOCK_MESSAGES_3001,
  '#3002': MOCK_MESSAGES_3002,
  '#3003': MOCK_MESSAGES_3003,
  '#3004': MOCK_MESSAGES_3004,
  '#3005': MOCK_MESSAGES_3005,
  '#3006': MOCK_MESSAGES_3006,
  '#3007': MOCK_MESSAGES_3007,
  '#3008': MOCK_MESSAGES_3008,
  '#3009': MOCK_MESSAGES_3009,
  '#3010': MOCK_MESSAGES_3010,
  '#3011': MOCK_MESSAGES_3011,
};

export const ALL_ASSETS: Record<string, DecisionAsset[]> = {
  '#3001': MOCK_ASSETS_3001,
  '#3002': MOCK_ASSETS_3002,
  '#3003': MOCK_ASSETS_3003,
  '#3004': MOCK_ASSETS_3004,
  '#3005': MOCK_ASSETS_3005,
  '#3006': MOCK_ASSETS_3006,
  '#3007': MOCK_ASSETS_3007,
  '#3008': MOCK_ASSETS_3008,
  '#3009': MOCK_ASSETS_3009,
  '#3010': MOCK_ASSETS_3010,
  '#3011': MOCK_ASSETS_3011,
};

// ============================================================
// MOCK_ISSUES array
// ============================================================
export const MOCK_ISSUES: Issue[] = [
  MOCK_ISSUE_3001, MOCK_ISSUE_3002, MOCK_ISSUE_3003, MOCK_ISSUE_3004,
  MOCK_ISSUE_3005, MOCK_ISSUE_3006, MOCK_ISSUE_3007, MOCK_ISSUE_3008,
  MOCK_ISSUE_3009, MOCK_ISSUE_3010, MOCK_ISSUE_3011
];

// ============================================================
// MOCK_ACTIVE_CONTROLS
// ============================================================
export const MOCK_ACTIVE_CONTROLS: ActiveControl[] = [
  { type: 'auto_escalation', ruleText: '招标金额 > 3000万元 → 自动 @首席合规官', currentlyActive: true },
  { type: 'anomaly_keyword', ruleText: '出现「串标」「围标」「贿赂」类关键词 → 自动冻结', currentlyActive: true },
  { type: 'audit_trail', ruleText: '所有 @ 链路完整留痕,可追溯', currentlyActive: true },
  { type: 'sanction_alert', ruleText: '供应商命中制裁名单 → 自动冻结合同', currentlyActive: true },
  { type: 'budget_threshold', ruleText: '预算超支 > 15% → 自动 @财务副总裁', currentlyActive: true }
];

// ============================================================
// MOCK_SCOPE_COUNTS
// ============================================================
export const MOCK_SCOPE_COUNTS: ScopeCounts = {
  pending: 5,
  watching: 11,
  decided: 38,
  global: 11,
  restricted: 2
};

// ============================================================
// MOCK_NOTIFICATIONS
// ============================================================
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n_001', user_id: 'u_002', notification_type: 'ESCALATED',
    title: '#3001 等您决策', preview: '大型钻采设备招标合规审查 · 需您决策:废标重招 vs 二选一续评?',
    topic_id: '#3001', is_read: false, created_at: '2026-05-15T10:15:00Z'
  },
  {
    id: 'n_002', user_id: 'u_003', notification_type: 'ESCALATED',
    title: '#3002 等您决策', preview: '化工材料供应商黑名单准入评审 · 需您决策:是否批准黑名单及替代方案?',
    topic_id: '#3002', is_read: false, created_at: '2026-05-14T12:30:00Z'
  },
  {
    id: 'n_003', user_id: 'u_002', notification_type: 'ESCALATED',
    title: '#3006 等您决策', preview: '关联交易合规审查 · 需您决策:暂停新合同+采购经理调岗',
    topic_id: '#3006', is_read: false, created_at: '2026-05-12T11:00:00Z'
  },
  {
    id: 'n_004', user_id: 'u_002', notification_type: 'ESCALATED',
    title: '#3008 紧急', preview: '反商业贿赂专项审计 · 匿名举报采购负责人收受回扣',
    topic_id: '#3008', is_read: false, created_at: '2026-05-15T08:30:00Z'
  },
  {
    id: 'n_005', user_id: 'u_002', notification_type: 'ESCALATED',
    title: '#3010 紧急', preview: '国际制裁合规筛查 · 3家供应商命中制裁名单',
    topic_id: '#3010', is_read: false, created_at: '2026-05-15T11:30:00Z'
  },
  {
    id: 'n_006', user_id: 'u_001', notification_type: 'CONSENSUS_REACHED',
    title: '#3009 共识达成', preview: '集中采购 vs 分散采购策略评估 · 已形成共识',
    topic_id: '#3009', is_read: true, created_at: '2026-05-10T12:00:00Z'
  }
];

// ============================================================
// RESOLUTION STATUS
// ============================================================
export const MOCK_RESOLUTION_STATUS_3001: ResolutionStatus = {
  consensusSummary: '废除华锐重工资格+启动反腐败调查+废标重招',
  pendingQuestion: '废标重招 vs 剩余2家继续评标?',
  pending_user_id: 'u_002', pendingUserName: '李正廉',
  options: [
    { id: 'opt_1', label: '废标重招(推荐)', isRecommended: true },
    { id: 'opt_2', label: '剩余2家继续评标', isRecommended: false },
    { id: 'opt_3', label: '邀请招标替代', isRecommended: false, isFollowup: true }
  ]
};

export const MOCK_RESOLUTION_STATUS_3002: ResolutionStatus = {
  consensusSummary: '东方化工列入黑名单+双供应商替代+关联供应商降级',
  pendingQuestion: '是否批准黑名单及替代方案?',
  pending_user_id: 'u_003', pendingUserName: '王德明',
  options: [
    { id: 'opt_1', label: '批准黑名单+双供应商替代(推荐)', isRecommended: true },
    { id: 'opt_2', label: '暂缓黑名单,再观察3个月', isRecommended: false }
  ]
};

export const MOCK_RESOLUTION_STATUS_3006: ResolutionStatus = {
  consensusSummary: '暂停新合同+价格审计+采购经理调岗+移交纪检',
  pendingQuestion: '是否批准处置方案?',
  pending_user_id: 'u_002', pendingUserName: '李正廉',
  options: [
    { id: 'opt_1', label: '批准全部处置措施(推荐)', isRecommended: true },
    { id: 'opt_2', label: '先暂停+审计,暂不调岗', isRecommended: false }
  ]
};

// ============================================================
// getIssueData
// ============================================================
export function getIssueData(issueId: string) {
  const issue = MOCK_ISSUES.find(i => i.id === issueId);
  if (!issue) return null;
  return {
    issue,
    messages: ALL_MESSAGES[issueId] || [],
    assets: ALL_ASSETS[issueId] || [],
    resolution: resolutionMap[issueId] || { options: [] },
  };
}

const resolutionMap: Record<string, ResolutionStatus> = {
  '#3001': MOCK_RESOLUTION_STATUS_3001,
  '#3002': MOCK_RESOLUTION_STATUS_3002,
  '#3006': MOCK_RESOLUTION_STATUS_3006,
};

// ============================================================
// getScopeCounts
// ============================================================
export function getScopeCounts(userId: string): ScopeCounts {
  return MOCK_SCOPE_COUNTS;
}

// ============================================================
// getNotifications
// ============================================================
export function getNotifications(userId: string): Notification[] {
  return MOCK_NOTIFICATIONS.filter(n => n.user_id === userId);
}
