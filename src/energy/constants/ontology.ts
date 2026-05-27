// 能源采购合规模块 - 本体库
// 覆盖招采/供应商/合同/合规/风控/物资/财务/审计 8大域

export interface Ontology {
  id: string;
  name: string;
  description: string;
  attributes: string[];
  domain?: string;
  relations?: string[];
}

export const ENERGY_ONTOLOGY_LIBRARY: Ontology[] = [
  // ========== 招采域 (5个) ==========
  {
    id: 'procurement_project',
    name: 'ProcurementProject (采购项目)',
    description: '采购项目实体，包含公开招标、竞争性谈判、询价采购等方式',
    domain: '招采域',
    attributes: ['project_id', 'project_name', 'project_type', 'budget_amount', 'estimated_saving', 'procurement_method', 'category_id', 'status', 'create_date', 'due_date', 'project_manager_id'],
    relations: ['contains BidDocument', 'has BidEvaluation', 'generates Contract', 'uses ProcurementMethod', 'belongs_to MaterialCategory']
  },
  {
    id: 'bid_document',
    name: 'BidDocument (招标文件)',
    description: '招标/采购文件，含技术规格、商务条件、评标标准',
    domain: '招采域',
    attributes: ['doc_id', 'project_id', 'doc_type', 'version', 'tech_specs', 'commercial_terms', 'evaluation_criteria', 'publish_date', 'deadline', 'clarification_count'],
    relations: ['belongs_to ProcurementProject', 'received_by Supplier', 'evaluated_in BidEvaluation']
  },
  {
    id: 'bid_response',
    name: 'BidResponse (投标响应)',
    description: '供应商投标/报价响应',
    domain: '招采域',
    attributes: ['response_id', 'project_id', 'supplier_id', 'bid_price', 'tech_score', 'commercial_score', 'submit_time', 'is_qualified', 'rejection_reason'],
    relations: ['responds_to BidDocument', 'from Supplier', 'evaluated_in BidEvaluation']
  },
  {
    id: 'bid_evaluation',
    name: 'BidEvaluation (评标)',
    description: '评标过程与结果记录',
    domain: '招采域',
    attributes: ['eval_id', 'project_id', 'eval_committee', 'eval_date', 'method', 'winner_id', 'winner_price', 'second_price', 'price_saving_rate', 'eval_report_url'],
    relations: ['evaluates BidDocument', 'selects Supplier', 'generates ProcurementProject']
  },
  {
    id: 'procurement_method',
    name: 'ProcurementMethod (采购方式)',
    description: '采购方式定义（公开招标/邀请招标/竞争性谈判/单一来源/询价/框架协议）',
    domain: '招采域',
    attributes: ['method_id', 'method_name', 'threshold_amount', 'required_suppliers', 'approval_level', 'description'],
    relations: ['used_by ProcurementProject']
  },

  // ========== 供应商域 (5个) ==========
  {
    id: 'supplier',
    name: 'Supplier (供应商)',
    description: '供应商实体，含基本信息、资质、风险等级',
    domain: '供应商域',
    attributes: ['supplier_id', 'supplier_name', 'unified_social_credit_code', 'registered_capital', 'legal_rep', 'category', 'region', 'cooperation_years', 'risk_level', 'status', 'annual_transaction_amount'],
    relations: ['has SupplierQualification', 'has SupplierRisk', 'has SupplierPerformance', 'supplies Material', 'participates_in BidResponse', 'signs Contract']
  },
  {
    id: 'supplier_qualification',
    name: 'SupplierQualification (供应商资质)',
    description: '供应商资质证书与认证信息',
    domain: '供应商域',
    attributes: ['qual_id', 'supplier_id', 'cert_type', 'cert_no', 'issue_date', 'expiry_date', 'issuing_authority', 'scope', 'status'],
    relations: ['belongs_to Supplier']
  },
  {
    id: 'supplier_risk',
    name: 'SupplierRisk (供应商风险)',
    description: '供应商风险评估记录',
    domain: '供应商域',
    attributes: ['risk_id', 'supplier_id', 'risk_type', 'risk_level', 'risk_score', 'detect_date', 'description', 'mitigation_action', 'status'],
    relations: ['belongs_to Supplier', 'triggers RiskEvent']
  },
  {
    id: 'supplier_performance',
    name: 'SupplierPerformance (供应商绩效)',
    description: '供应商历史绩效考核',
    domain: '供应商域',
    attributes: ['perf_id', 'supplier_id', 'eval_period', 'quality_score', 'delivery_score', 'service_score', 'price_score', 'overall_score', 'rank', 'is_bottom_5pct'],
    relations: ['belongs_to Supplier']
  },
  {
    id: 'blacklist_supplier',
    name: 'BlacklistSupplier (黑名单供应商)',
    description: '供应商黑名单/禁入名单',
    domain: '供应商域',
    attributes: ['bl_id', 'supplier_id', 'reason', 'effective_date', 'expiry_date', 'approved_by', 'related_violations'],
    relations: ['blocks Supplier']
  },

  // ========== 合同域 (4个) ==========
  {
    id: 'contract',
    name: 'Contract (合同)',
    description: '采购合同实体',
    domain: '合同域',
    attributes: ['contract_id', 'contract_no', 'project_id', 'supplier_id', 'contract_type', 'total_amount', 'payment_terms', 'delivery_terms', 'warranty_months', 'status', 'sign_date', 'effective_date', 'expiry_date'],
    relations: ['for ProcurementProject', 'with Supplier', 'has ContractClause', 'has ContractAmendment', 'has ContractRisk']
  },
  {
    id: 'contract_clause',
    name: 'ContractClause (合同条款)',
    description: '合同条款明细',
    domain: '合同域',
    attributes: ['clause_id', 'contract_id', 'clause_no', 'clause_type', 'content', 'is_standard', 'deviation_level', 'deviation_reason'],
    relations: ['belongs_to Contract']
  },
  {
    id: 'contract_amendment',
    name: 'ContractAmendment (合同变更)',
    description: '合同变更记录',
    domain: '合同域',
    attributes: ['amend_id', 'contract_id', 'amend_type', 'original_value', 'new_value', 'reason', 'approved_by', 'amend_date'],
    relations: ['modifies Contract']
  },
  {
    id: 'contract_risk',
    name: 'ContractRisk (合同风险)',
    description: '合同风险评估',
    domain: '合同域',
    attributes: ['crisk_id', 'contract_id', 'risk_type', 'risk_level', 'description', 'detect_date', 'mitigation', 'status'],
    relations: ['belongs_to Contract']
  },

  // ========== 合规域 (4个) ==========
  {
    id: 'compliance_rule',
    name: 'ComplianceRule (合规规则)',
    description: '合规制度与规则条款',
    domain: '合规域',
    attributes: ['rule_id', 'rule_name', 'rule_type', 'source', 'effective_date', 'severity', 'auto_check', 'description'],
    relations: ['checked_by ComplianceCheck', 'violated_by ComplianceViolation']
  },
  {
    id: 'compliance_check',
    name: 'ComplianceCheck (合规检查)',
    description: '合规检查执行记录',
    domain: '合规域',
    attributes: ['check_id', 'rule_id', 'target_type', 'target_id', 'check_date', 'result', 'findings', 'checker_id'],
    relations: ['checks ComplianceRule', 'generates ComplianceViolation']
  },
  {
    id: 'compliance_violation',
    name: 'ComplianceViolation (违规记录)',
    description: '合规违规事件记录',
    domain: '合规域',
    attributes: ['violation_id', 'rule_id', 'target_type', 'target_id', 'violation_type', 'severity', 'discovered_date', 'description', 'rectification_deadline', 'status'],
    relations: ['violates ComplianceRule', 'recorded_in AuditTrail']
  },
  {
    id: 'audit_trail',
    name: 'AuditTrail (审计追踪)',
    description: '操作审计日志',
    domain: '合规域',
    attributes: ['trail_id', 'operator_id', 'action', 'target_type', 'target_id', 'timestamp', 'ip_address', 'detail'],
    relations: ['records ComplianceViolation']
  },

  // ========== 风控域 (4个) ==========
  {
    id: 'risk_assessment',
    name: 'RiskAssessment (风险评估)',
    description: '综合风险评估报告',
    domain: '风控域',
    attributes: ['assess_id', 'target_type', 'target_id', 'assess_date', 'risk_score', 'risk_level', 'factors', 'assessor_id', 'conclusion'],
    relations: ['evaluates Supplier', 'uses RiskIndicator']
  },
  {
    id: 'risk_indicator',
    name: 'RiskIndicator (风险指标)',
    description: '风险监测指标定义',
    domain: '风控域',
    attributes: ['indicator_id', 'indicator_name', 'category', 'threshold_warning', 'threshold_critical', 'unit', 'data_source', 'calculation_formula'],
    relations: ['used_by RiskAssessment', 'triggers RiskEvent']
  },
  {
    id: 'risk_event',
    name: 'RiskEvent (风险事件)',
    description: '已发生的风险事件',
    domain: '风控域',
    attributes: ['event_id', 'event_type', 'severity', 'source', 'detect_date', 'description', 'impact_amount', 'affected_projects', 'resolution', 'status'],
    relations: ['triggered_by RiskIndicator', 'related_to SupplierRisk']
  },
  {
    id: 'risk_mitigation',
    name: 'RiskMitigation (风险处置)',
    description: '风险处置措施与跟踪',
    domain: '风控域',
    attributes: ['mit_id', 'event_id', 'action_type', 'description', 'responsible_id', 'deadline', 'status', 'effectiveness'],
    relations: ['mitigates RiskEvent']
  },

  // ========== 物资域 (4个) ==========
  {
    id: 'material_category',
    name: 'MaterialCategory (物资类别)',
    description: '采购物资分类（设备/材料/服务/工程）',
    domain: '物资域',
    attributes: ['category_id', 'category_name', 'parent_id', 'level', 'annual_budget', 'preferred_method', 'risk_level'],
    relations: ['contains Material', 'has PurchasePlan']
  },
  {
    id: 'material',
    name: 'Material (物资)',
    description: '采购物资/服务实体',
    domain: '物资域',
    attributes: ['material_id', 'material_code', 'material_name', 'category_id', 'spec', 'unit', 'reference_price', 'is_framework', 'approved_suppliers_count'],
    relations: ['belongs_to MaterialCategory', 'has MaterialSpecification', 'supplied_by Supplier']
  },
  {
    id: 'material_specification',
    name: 'MaterialSpecification (物资规格)',
    description: '物资技术规格与标准',
    domain: '物资域',
    attributes: ['spec_id', 'material_id', 'spec_name', 'spec_value', 'standard_ref', 'is_mandatory'],
    relations: ['belongs_to Material']
  },
  {
    id: 'purchase_plan',
    name: 'PurchasePlan (采购计划)',
    description: '年度/季度采购计划',
    domain: '物资域',
    attributes: ['plan_id', 'plan_period', 'category_id', 'planned_amount', 'actual_amount', 'execution_rate', 'status'],
    relations: ['for MaterialCategory', 'drives ProcurementProject']
  },

  // ========== 财务域 (4个) ==========
  {
    id: 'budget',
    name: 'Budget (预算)',
    description: '采购预算管理',
    domain: '财务域',
    attributes: ['budget_id', 'budget_type', 'period', 'department', 'amount', 'committed', 'spent', 'remaining', 'utilization_rate'],
    relations: ['controls ProcurementProject', 'for MaterialCategory']
  },
  {
    id: 'payment',
    name: 'Payment (付款)',
    description: '采购付款记录',
    domain: '财务域',
    attributes: ['payment_id', 'contract_id', 'payment_type', 'amount', 'payment_date', 'due_date', 'status', 'approval_chain'],
    relations: ['for Contract', 'to Supplier']
  },
  {
    id: 'cost_analysis',
    name: 'CostAnalysis (成本分析)',
    description: '采购成本分析报告',
    domain: '财务域',
    attributes: ['analysis_id', 'material_id', 'period', 'avg_price', 'market_price', 'price_gap', 'saving_opportunity', 'trend'],
    relations: ['analyzes Material', 'compares PriceComparison']
  },
  {
    id: 'price_comparison',
    name: 'PriceComparison (价格比对)',
    description: '历史采购价格与市场价格比对',
    domain: '财务域',
    attributes: ['comp_id', 'material_id', 'supplier_id', 'our_price', 'market_price', 'benchmark_price', 'gap_pct', 'collect_date'],
    relations: ['compares Material', 'from Supplier']
  },

  // ========== 审计域 (4个) ==========
  {
    id: 'audit_project',
    name: 'AuditProject (审计项目)',
    description: '审计项目实体',
    domain: '审计域',
    attributes: ['audit_id', 'audit_name', 'audit_type', 'scope', 'start_date', 'end_date', 'lead_auditor', 'status', 'finding_count'],
    relations: ['has AuditFinding', 'generates AuditRecommendation']
  },
  {
    id: 'audit_finding',
    name: 'AuditFinding (审计发现)',
    description: '审计发现的问题',
    domain: '审计域',
    attributes: ['finding_id', 'audit_id', 'finding_type', 'severity', 'description', 'evidence', 'affected_amount', 'recommendation'],
    relations: ['belongs_to AuditProject', 'related_to ComplianceViolation']
  },
  {
    id: 'audit_recommendation',
    name: 'AuditRecommendation (审计建议)',
    description: '审计整改建议',
    domain: '审计域',
    attributes: ['rec_id', 'audit_id', 'finding_id', 'recommendation', 'responsible_dept', 'deadline', 'status', 'effectiveness'],
    relations: ['for AuditFinding', 'belongs_to AuditProject']
  },
  {
    id: 'whistleblower_report',
    name: 'WhistleblowerReport (举报)',
    description: '匿名举报/信访记录',
    domain: '审计域',
    attributes: ['report_id', 'report_type', 'target_type', 'target_id', 'description', 'receive_date', 'evidence_level', 'investigation_status', 'outcome'],
    relations: ['triggers AuditProject', 'related_to ComplianceViolation']
  }
];

export function getOntologyById(id: string): Ontology | undefined {
  return ENERGY_ONTOLOGY_LIBRARY.find(o => o.id === id);
}

export function getOntologiesByDomain(domain: string): Ontology[] {
  return ENERGY_ONTOLOGY_LIBRARY.filter(o => o.domain === domain);
}

export function getAllDomains(): string[] {
  const domains = new Set(ENERGY_ONTOLOGY_LIBRARY.map(o => o.domain).filter(Boolean));
  return Array.from(domains) as string[];
}

export function searchOntologies(keyword: string): Ontology[] {
  const lower = keyword.toLowerCase();
  return ENERGY_ONTOLOGY_LIBRARY.filter(o =>
    o.name.toLowerCase().includes(lower) ||
    o.description.toLowerCase().includes(lower) ||
    o.attributes.some(attr => attr.toLowerCase().includes(lower))
  );
}

export function createOntology(
  name: string,
  description: string,
  attributes: string[],
  domain?: string
): Ontology {
  const id = name.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') + `_${Date.now()}`;

  return {
    id,
    name: name.trim(),
    description: description.trim() || `${name.trim()}实体`,
    attributes: attributes.length > 0 ? attributes : ['name'],
    domain: domain || '自定义'
  };
}

export default ENERGY_ONTOLOGY_LIBRARY;
