import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  Database, Network, BookOpen, Play, Pause, ChevronDown, ChevronRight, Package,
  Truck, Users, ShoppingCart, Megaphone, Calculator, Target, Search, Plus, Trash2,
  ZoomIn, ZoomOut, X, Link2, Tag, Layers, ArrowRight, CheckCircle2, Box, Building2,
  TrendingUp, ShieldCheck, FileText, Hash, Type, Calendar, GripVertical, LayoutGrid,
  Wand2, Eye, GitMerge, Edit3, Info, CircleDot, ArrowUpRight, Sparkles, Server,
  Activity, MapPin, CreditCard, RefreshCw, AlertTriangle, Zap, Award, Clock
} from 'lucide-react';
import { cn } from '../lib/utils';
import ENERGY_ONTOLOGY_LIBRARY from '../constants/ontology';
import type { Ontology } from '../constants/ontology';

/* ------------------------------------------------------------------ */
/*  Domain meta                                                        */
/* ------------------------------------------------------------------ */

const DOMAIN_META: Record<string, { color: string; bg: string; border: string; text: string; icon: React.ReactNode }> = {
  招采域: { color: 'blue',   bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   icon: <FileText size={14} /> },
  供应商域:{ color: 'emerald',bg: 'bg-emerald-50',border: 'border-emerald-200',text: 'text-emerald-700',icon: <Users size={14} /> },
  合同域: { color: 'amber',  bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  icon: <FileText size={14} /> },
  合规域: { color: 'violet', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', icon: <ShieldCheck size={14} /> },
  风控域: { color: 'rose',   bg: 'bg-rose-50',   border: 'border-rose-200',   text: 'text-rose-700',   icon: <AlertTriangle size={14} /> },
  物资域: { color: 'cyan',   bg: 'bg-cyan-50',   border: 'border-cyan-200',   text: 'text-cyan-700',   icon: <Package size={14} /> },
  财务域: { color: 'slate',  bg: 'bg-slate-50',  border: 'border-slate-200',  text: 'text-slate-700',  icon: <Calculator size={14} /> },
  审计域: { color: 'orange', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: <Search size={14} /> },
};

const DOMAIN_ORDER = ['招采域','供应商域','合同域','合规域','风控域','物资域','财务域','审计域'];

/* ------------------------------------------------------------------ */
/*  Data Sources                                                       */
/* ------------------------------------------------------------------ */

const DATA_SOURCES = [
  {
    name: 'ERP采购模块', type: 'oracle',
    tables: [
      { name: 'procurement_project', rows: '186K', entity: 'ProcurementProject', conf: 97,
        fields: [
          { name: 'project_id', type: 'varchar(32)', comment: '项目编号' },
          { name: 'project_name', type: 'varchar(200)', comment: '项目名称' },
          { name: 'project_type', type: 'varchar(20)', comment: '项目类型' },
          { name: 'budget_amount', type: 'number(14,2)', comment: '预算金额' },
          { name: 'procurement_method', type: 'varchar(20)', comment: '采购方式', ontology: 'ProcurementMethod' },
          { name: 'category_id', type: 'varchar(16)', comment: '品类编码', ontology: 'MaterialCategory' },
          { name: 'status', type: 'varchar(10)', comment: '项目状态' },
          { name: 'project_manager_id', type: 'varchar(32)', comment: '项目经理' },
        ]
      },
      { name: 'bid_document', rows: '320K', entity: 'BidDocument', conf: 95,
        fields: [
          { name: 'doc_id', type: 'varchar(32)', comment: '文件编号' },
          { name: 'project_id', type: 'varchar(32)', comment: '项目编号', ontology: 'ProcurementProject' },
          { name: 'doc_type', type: 'varchar(20)', comment: '文件类型' },
          { name: 'tech_specs', type: 'clob', comment: '技术规格' },
          { name: 'evaluation_criteria', type: 'clob', comment: '评标标准' },
          { name: 'publish_date', type: 'date', comment: '发布日期' },
          { name: 'deadline', type: 'date', comment: '截止日期' },
        ]
      },
      { name: 'bid_response', rows: '580K', entity: 'BidResponse', conf: 94,
        fields: [
          { name: 'response_id', type: 'varchar(32)', comment: '响应编号' },
          { name: 'project_id', type: 'varchar(32)', comment: '项目编号', ontology: 'ProcurementProject' },
          { name: 'supplier_id', type: 'varchar(16)', comment: '供应商编码', ontology: 'Supplier' },
          { name: 'bid_price', type: 'number(14,2)', comment: '投标报价' },
          { name: 'tech_score', type: 'number(5,2)', comment: '技术得分' },
          { name: 'commercial_score', type: 'number(5,2)', comment: '商务得分' },
          { name: 'is_qualified', type: 'varchar(5)', comment: '是否合格' },
        ]
      },
    ]
  },
  {
    name: 'SRM供应商管理', type: 'mysql',
    tables: [
      { name: 'supplier', rows: '12.6K', entity: 'Supplier', conf: 98,
        fields: [
          { name: 'supplier_id', type: 'varchar(16)', comment: '供应商编码' },
          { name: 'supplier_name', type: 'varchar(200)', comment: '供应商名称' },
          { name: 'unified_social_credit_code', type: 'varchar(18)', comment: '统一社会信用代码' },
          { name: 'registered_capital', type: 'number(14,2)', comment: '注册资本' },
          { name: 'risk_level', type: 'varchar(10)', comment: '风险等级' },
          { name: 'status', type: 'varchar(10)', comment: '状态' },
          { name: 'annual_transaction_amount', type: 'number(14,2)', comment: '年度交易额' },
          { name: 'cooperation_years', type: 'int', comment: '合作年限' },
        ]
      },
      { name: 'supplier_qualification', rows: '45K', entity: 'SupplierQualification', conf: 96,
        fields: [
          { name: 'qual_id', type: 'varchar(32)', comment: '资质编号' },
          { name: 'supplier_id', type: 'varchar(16)', comment: '供应商编码', ontology: 'Supplier' },
          { name: 'cert_type', type: 'varchar(50)', comment: '证书类型' },
          { name: 'cert_no', type: 'varchar(50)', comment: '证书编号' },
          { name: 'expiry_date', type: 'date', comment: '到期日期' },
          { name: 'status', type: 'varchar(10)', comment: '状态' },
        ]
      },
      { name: 'supplier_performance', rows: '38K', entity: 'SupplierPerformance', conf: 93,
        fields: [
          { name: 'perf_id', type: 'varchar(32)', comment: '绩效编号' },
          { name: 'supplier_id', type: 'varchar(16)', comment: '供应商编码', ontology: 'Supplier' },
          { name: 'eval_period', type: 'varchar(20)', comment: '考核周期' },
          { name: 'quality_score', type: 'number(5,2)', comment: '质量得分' },
          { name: 'delivery_score', type: 'number(5,2)', comment: '交付得分' },
          { name: 'overall_score', type: 'number(5,2)', comment: '综合得分' },
          { name: 'is_bottom_5pct', type: 'varchar(5)', comment: '是否后5%' },
        ]
      },
    ]
  },
  {
    name: '合同管理系统', type: 'postgres',
    tables: [
      { name: 'contract', rows: '86K', entity: 'Contract', conf: 97,
        fields: [
          { name: 'contract_id', type: 'varchar(32)', comment: '合同编号' },
          { name: 'project_id', type: 'varchar(32)', comment: '项目编号', ontology: 'ProcurementProject' },
          { name: 'supplier_id', type: 'varchar(16)', comment: '供应商编码', ontology: 'Supplier' },
          { name: 'total_amount', type: 'number(14,2)', comment: '合同总额' },
          { name: 'contract_type', type: 'varchar(20)', comment: '合同类型' },
          { name: 'status', type: 'varchar(10)', comment: '合同状态' },
          { name: 'sign_date', type: 'date', comment: '签订日期' },
          { name: 'expiry_date', type: 'date', comment: '到期日期' },
        ]
      },
      { name: 'contract_clause', rows: '680K', entity: 'ContractClause', conf: 94,
        fields: [
          { name: 'clause_id', type: 'varchar(32)', comment: '条款编号' },
          { name: 'contract_id', type: 'varchar(32)', comment: '合同编号', ontology: 'Contract' },
          { name: 'clause_type', type: 'varchar(30)', comment: '条款类型' },
          { name: 'content', type: 'clob', comment: '条款内容' },
          { name: 'is_standard', type: 'varchar(5)', comment: '是否标准条款' },
          { name: 'deviation_level', type: 'varchar(10)', comment: '偏离等级' },
        ]
      },
    ]
  },
  {
    name: 'GRC合规平台', type: 'mysql',
    tables: [
      { name: 'compliance_rule', rows: '2.4K', entity: 'ComplianceRule', conf: 99,
        fields: [
          { name: 'rule_id', type: 'varchar(16)', comment: '规则编号' },
          { name: 'rule_name', type: 'varchar(200)', comment: '规则名称' },
          { name: 'rule_type', type: 'varchar(30)', comment: '规则类型' },
          { name: 'source', type: 'varchar(50)', comment: '来源' },
          { name: 'severity', type: 'varchar(10)', comment: '严重程度' },
          { name: 'auto_check', type: 'varchar(5)', comment: '是否自动检查' },
        ]
      },
      { name: 'compliance_violation', rows: '18K', entity: 'ComplianceViolation', conf: 92,
        fields: [
          { name: 'violation_id', type: 'varchar(32)', comment: '违规编号' },
          { name: 'rule_id', type: 'varchar(16)', comment: '规则编号', ontology: 'ComplianceRule' },
          { name: 'target_type', type: 'varchar(30)', comment: '对象类型' },
          { name: 'target_id', type: 'varchar(32)', comment: '对象编号' },
          { name: 'violation_type', type: 'varchar(30)', comment: '违规类型' },
          { name: 'severity', type: 'varchar(10)', comment: '严重程度' },
          { name: 'status', type: 'varchar(10)', comment: '状态' },
        ]
      },
      { name: 'risk_event', rows: '5.6K', entity: 'RiskEvent', conf: 90,
        fields: [
          { name: 'event_id', type: 'varchar(32)', comment: '事件编号' },
          { name: 'event_type', type: 'varchar(30)', comment: '事件类型' },
          { name: 'severity', type: 'varchar(10)', comment: '严重程度' },
          { name: 'detect_date', type: 'datetime', comment: '检测时间' },
          { name: 'impact_amount', type: 'number(14,2)', comment: '影响金额' },
          { name: 'status', type: 'varchar(10)', comment: '状态' },
        ]
      },
    ]
  },
  {
    name: '财务共享中心', type: 'oracle',
    tables: [
      { name: 'budget', rows: '8.6K', entity: 'Budget', conf: 96,
        fields: [
          { name: 'budget_id', type: 'varchar(16)', comment: '预算编号' },
          { name: 'budget_type', type: 'varchar(20)', comment: '预算类型' },
          { name: 'period', type: 'varchar(10)', comment: '预算期间' },
          { name: 'department', type: 'varchar(50)', comment: '部门' },
          { name: 'amount', type: 'number(14,2)', comment: '预算金额' },
          { name: 'spent', type: 'number(14,2)', comment: '已执行' },
          { name: 'utilization_rate', type: 'number(5,2)', comment: '执行率' },
        ]
      },
      { name: 'payment', rows: '126K', entity: 'Payment', conf: 95,
        fields: [
          { name: 'payment_id', type: 'varchar(32)', comment: '付款编号' },
          { name: 'contract_id', type: 'varchar(32)', comment: '合同编号', ontology: 'Contract' },
          { name: 'amount', type: 'number(14,2)', comment: '付款金额' },
          { name: 'payment_date', type: 'date', comment: '付款日期' },
          { name: 'status', type: 'varchar(10)', comment: '状态' },
        ]
      },
    ]
  },
  {
    name: '审计系统', type: 'postgres',
    tables: [
      { name: 'audit_project', rows: '3.2K', entity: 'AuditProject', conf: 97,
        fields: [
          { name: 'audit_id', type: 'varchar(16)', comment: '审计编号' },
          { name: 'audit_name', type: 'varchar(200)', comment: '审计名称' },
          { name: 'audit_type', type: 'varchar(20)', comment: '审计类型' },
          { name: 'start_date', type: 'date', comment: '开始日期' },
          { name: 'end_date', type: 'date', comment: '结束日期' },
          { name: 'status', type: 'varchar(10)', comment: '状态' },
          { name: 'finding_count', type: 'int', comment: '发现数量' },
        ]
      },
      { name: 'audit_finding', rows: '12K', entity: 'AuditFinding', conf: 94,
        fields: [
          { name: 'finding_id', type: 'varchar(32)', comment: '发现编号' },
          { name: 'audit_id', type: 'varchar(16)', comment: '审计编号', ontology: 'AuditProject' },
          { name: 'finding_type', type: 'varchar(30)', comment: '发现类型' },
          { name: 'severity', type: 'varchar(10)', comment: '严重程度' },
          { name: 'affected_amount', type: 'number(14,2)', comment: '涉及金额' },
          { name: 'description', type: 'clob', comment: '问题描述' },
        ]
      },
    ]
  },
];

/* ------------------------------------------------------------------ */
/*  Graph data                                                         */
/* ------------------------------------------------------------------ */

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  domain: string;
}

interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

const GRAPH_NODES: GraphNode[] = [
  { id: 'procurement_project', label: '采购项目', x: 400, y: 200, domain: '招采域' },
  { id: 'bid_document', label: '招标文件', x: 250, y: 100, domain: '招采域' },
  { id: 'bid_response', label: '投标响应', x: 150, y: 200, domain: '招采域' },
  { id: 'bid_evaluation', label: '评标', x: 300, y: 300, domain: '招采域' },
  { id: 'supplier', label: '供应商', x: 600, y: 100, domain: '供应商域' },
  { id: 'supplier_qualification', label: '供应商资质', x: 750, y: 50, domain: '供应商域' },
  { id: 'supplier_risk', label: '供应商风险', x: 750, y: 150, domain: '供应商域' },
  { id: 'contract', label: '合同', x: 500, y: 350, domain: '合同域' },
  { id: 'contract_clause', label: '合同条款', x: 600, y: 450, domain: '合同域' },
  { id: 'compliance_rule', label: '合规规则', x: 100, y: 400, domain: '合规域' },
  { id: 'compliance_violation', label: '违规记录', x: 200, y: 500, domain: '合规域' },
  { id: 'risk_event', label: '风险事件', x: 350, y: 500, domain: '风控域' },
  { id: 'material', label: '物资', x: 500, y: 100, domain: '物资域' },
  { id: 'material_category', label: '物资类别', x: 400, y: 50, domain: '物资域' },
  { id: 'budget', label: '预算', x: 100, y: 300, domain: '财务域' },
  { id: 'payment', label: '付款', x: 650, y: 350, domain: '财务域' },
  { id: 'audit_project', label: '审计项目', x: 100, y: 500, domain: '审计域' },
  { id: 'audit_finding', label: '审计发现', x: 250, y: 600, domain: '审计域' },
];

const GRAPH_EDGES: GraphEdge[] = [
  { source: 'procurement_project', target: 'bid_document', label: '包含' },
  { source: 'bid_document', target: 'bid_response', label: '接收' },
  { source: 'bid_response', target: 'bid_evaluation', label: '评估' },
  { source: 'bid_evaluation', target: 'supplier', label: '选定' },
  { source: 'procurement_project', target: 'contract', label: '生成' },
  { source: 'supplier', target: 'contract', label: '签订' },
  { source: 'contract', target: 'contract_clause', label: '包含' },
  { source: 'contract', target: 'payment', label: '触发' },
  { source: 'supplier', target: 'supplier_qualification', label: '持有' },
  { source: 'supplier', target: 'supplier_risk', label: '评估' },
  { source: 'supplier_risk', target: 'risk_event', label: '触发' },
  { source: 'compliance_rule', target: 'compliance_violation', label: '违反' },
  { source: 'procurement_project', target: 'material', label: '采购' },
  { source: 'material', target: 'material_category', label: '归属' },
  { source: 'budget', target: 'procurement_project', label: '控制' },
  { source: 'procurement_project', target: 'supplier', label: '邀请' },
  { source: 'audit_project', target: 'audit_finding', label: '发现' },
  { source: 'compliance_violation', target: 'audit_finding', label: '关联' },
];

/* ------------------------------------------------------------------ */
/*  Scenario data                                                      */
/* ------------------------------------------------------------------ */

const SCENARIOS = [
  {
    id: 'bid-compliance',
    name: '大型设备招标合规审查',
    desc: '钻采设备招标5200万，3家投标方资质审查与评标流程',
    nodes: [
      { id: 'proj001', label: '采购项目PJ-3001', domain: '招采域', x: 400, y: 150, detail: { type: 'ProcurementProject', attrs: { project_id: 'PJ-3001', name: '钻采设备采购', budget: '5200万', method: '公开招标', status: '评标中' } } },
      { id: 'bid_doc', label: '招标文件BD-001', domain: '招采域', x: 200, y: 150, detail: { type: 'BidDocument', attrs: { doc_id: 'BD-001', deadline: '2026-04-15', tech_specs: '详见技术附件', bidders: 3 } } },
      { id: 'sup_a', label: '供应商A(合格)', domain: '供应商域', x: 150, y: 350, detail: { type: 'Supplier', attrs: { supplier_id: 'SUP-A', name: '华东重工', risk_level: '低', qual_status: '合格', bid_price: '4800万' } } },
      { id: 'sup_b', label: '供应商B(存疑)', domain: '供应商域', x: 400, y: 350, detail: { type: 'Supplier', attrs: { supplier_id: 'SUP-B', name: '北方装备', risk_level: '高', qual_status: '资质存疑', bid_price: '4200万' } } },
      { id: 'eval001', label: '评标记录', domain: '招采域', x: 600, y: 250, detail: { type: 'BidEvaluation', attrs: { eval_id: 'EVAL-001', winner: '待定', issue: '供应商B资质存疑', recommendation: '需人工复审' } } },
    ],
    edges: [
      { source: 'proj001', target: 'bid_doc', label: '包含' },
      { source: 'bid_doc', target: 'sup_a', label: '投标' },
      { source: 'bid_doc', target: 'sup_b', label: '投标' },
      { source: 'sup_a', target: 'eval001', label: '评估' },
      { source: 'sup_b', target: 'eval001', label: '存疑' },
      { source: 'proj001', target: 'eval001', label: '评标' },
    ],
  },
  {
    id: 'supplier-risk',
    name: '供应商黑名单准入评审',
    desc: '拟将化工材料供应商列入黑名单，涉及年度采购额1.8亿',
    nodes: [
      { id: 'sup_chem', label: '化工供应商(拟黑名单)', domain: '供应商域', x: 400, y: 150, detail: { type: 'Supplier', attrs: { supplier_id: 'SUP-088', name: '华兴化工', annual_amount: '1.8亿', risk_level: '高', issues: '连续3次质量不合格' } } },
      { id: 'perf001', label: '绩效记录', domain: '供应商域', x: 200, y: 150, detail: { type: 'SupplierPerformance', attrs: { perf_id: 'PERF-088', quality_score: 52, delivery_score: 68, overall_score: 58, rank: '后5%' } } },
      { id: 'risk001', label: '风险事件', domain: '风控域', x: 200, y: 350, detail: { type: 'RiskEvent', attrs: { event_id: 'RE-088', type: '质量事故', severity: '严重', impact: '3个项目受影响' } } },
      { id: 'contract001', label: '在执行合同', domain: '合同域', x: 600, y: 150, detail: { type: 'Contract', attrs: { contract_id: 'CT-088', amount: '6000万', status: '执行中', remaining: '4200万' } } },
      { id: 'blacklist', label: '黑名单决策', domain: '供应商域', x: 600, y: 350, detail: { type: 'BlacklistSupplier', attrs: { decision: '待定', impact: '需终止3份合同', alternative: '备选供应商2家' } } },
    ],
    edges: [
      { source: 'sup_chem', target: 'perf001', label: '绩效' },
      { source: 'sup_chem', target: 'risk001', label: '触发' },
      { source: 'sup_chem', target: 'contract001', label: '签订' },
      { source: 'risk001', target: 'blacklist', label: '建议' },
      { source: 'perf001', target: 'blacklist', label: '依据' },
      { source: 'contract001', target: 'blacklist', label: '影响' },
    ],
  },
  {
    id: 'collusion-detection',
    name: '串标围标风险识别',
    desc: '分析近6个月招标数据，发现2组疑似围标行为',
    nodes: [
      { id: 'bid_group1', label: '围标组A(3家)', domain: '招采域', x: 200, y: 150, detail: { type: 'BidResponse', attrs: { group: 'A', suppliers: ['SUP-101','SUP-102','SUP-103'], pattern: '报价呈等差数列', confidence: '92%' } } },
      { id: 'bid_group2', label: '围标组B(2家)', domain: '招采域', x: 600, y: 150, detail: { type: 'BidResponse', attrs: { group: 'B', suppliers: ['SUP-201','SUP-202'], pattern: 'IP地址相同', confidence: '88%' } } },
      { id: 'analysis', label: '异常分析报告', domain: '风控域', x: 400, y: 300, detail: { type: 'RiskAssessment', attrs: { report_id: 'RA-001', method: '关联分析+聚类', findings: '报价异常、人员关联、IP重合' } } },
      { id: 'affected_projects', label: '受影响项目(5个)', domain: '招采域', x: 400, y: 450, detail: { type: 'ProcurementProject', attrs: { count: 5, total_amount: '2.3亿', status: '需复审' } } },
    ],
    edges: [
      { source: 'bid_group1', target: 'analysis', label: '检测' },
      { source: 'bid_group2', target: 'analysis', label: '检测' },
      { source: 'analysis', target: 'affected_projects', label: '影响' },
    ],
  },
  {
    id: 'anti-corruption',
    name: '反商业贿赂专项审计',
    desc: '接到匿名举报，某项目采购负责人疑似收受回扣',
    nodes: [
      { id: 'whistle', label: '匿名举报WR-001', domain: '审计域', x: 200, y: 150, detail: { type: 'WhistleblowerReport', attrs: { report_id: 'WR-001', type: '匿名举报', target: '采购经理张某', allegation: '收受供应商回扣', evidence_level: '中' } } },
      { id: 'audit001', label: '专项审计AP-001', domain: '审计域', x: 400, y: 250, detail: { type: 'AuditProject', attrs: { audit_id: 'AP-001', name: '反商业贿赂专项', scope: '2024-2025年设备采购', status: '进行中' } } },
      { id: 'finding001', label: '审计发现', domain: '审计域', x: 600, y: 150, detail: { type: 'AuditFinding', attrs: { finding_id: 'AF-001', issues: ['价格异常偏高','供应商集中度异常','审批流程违规'], affected_amount: '380万' } } },
      { id: 'supplier_involved', label: '涉事供应商', domain: '供应商域', x: 600, y: 350, detail: { type: 'Supplier', attrs: { supplier_id: 'SUP-066', name: '某设备公司', relationship: '与采购经理存在利益关联', status: '调查中' } } },
    ],
    edges: [
      { source: 'whistle', target: 'audit001', label: '触发' },
      { source: 'audit001', target: 'finding001', label: '发现' },
      { source: 'finding001', target: 'supplier_involved', label: '涉及' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getDomainIcon(domain: string) {
  switch (domain) {
    case '招采域': return <FileText size={18} />;
    case '供应商域': return <Users size={18} />;
    case '合同域': return <FileText size={18} />;
    case '合规域': return <ShieldCheck size={18} />;
    case '风控域': return <AlertTriangle size={18} />;
    case '物资域': return <Package size={18} />;
    case '财务域': return <Calculator size={18} />;
    case '审计域': return <Search size={18} />;
    default: return <Box size={18} />;
  }
}

function getFieldTypeIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes('varchar') || t.includes('string') || t.includes('text')) return <Type size={12} />;
  if (t.includes('int') || t.includes('number') || t.includes('float') || t.includes('decimal')) return <Hash size={12} />;
  if (t.includes('date') || t.includes('time')) return <Calendar size={12} />;
  if (t.includes('json')) return <Layers size={12} />;
  return <FileText size={12} />;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function OntologyModeling() {
  const [activeTab, setActiveTab] = useState(0);

  /* ---- Tab 0: Data Source Discovery ---- */
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({ 'POS系统': true });
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const [selectedTable, setSelectedTable] = useState<any>(null);

  const toggleSource = (name: string) => setExpandedSources(p => ({ ...p, [name]: !p[name] }));
  const toggleTable = (name: string) => setExpandedTables(p => ({ ...p, [name]: !p[name] }));

  const totalSources = DATA_SOURCES.length;
  const totalTables = DATA_SOURCES.reduce((sum, s) => sum + s.tables.length, 0);
  const recognizedTables = DATA_SOURCES.flatMap(s => s.tables).filter(t => t.conf >= 85).length;
  const recognitionRate = Math.round((recognizedTables / totalTables) * 100);

  /* ---- Tab 1: Relationship Graph ---- */
  const [nodes, setNodes] = useState<GraphNode[]>(GRAPH_NODES.map(n => ({ ...n })));
  const [edges, setEdges] = useState<GraphEdge[]>([...GRAPH_EDGES]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const graphRef = useRef<HTMLDivElement>(null);
  const [addingEdge, setAddingEdge] = useState(false);
  const [edgeSource, setEdgeSource] = useState('');
  const [edgeTarget, setEdgeTarget] = useState('');
  const [edgeLabel, setEdgeLabel] = useState('');

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, node: GraphNode) => {
    e.stopPropagation();
    setSelectedNode(node);
    setDragging(node.id);
    const rect = graphRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: (e.clientX - rect.left) / zoom - node.x,
        y: (e.clientY - rect.top) / zoom - node.y,
      });
    }
  }, [zoom]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !graphRef.current) return;
    const rect = graphRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - dragOffset.x;
    const y = (e.clientY - rect.top) / zoom - dragOffset.y;
    setNodes(prev => prev.map(n => n.id === dragging ? { ...n, x, y } : n));
  }, [dragging, dragOffset, zoom]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const addEdge = () => {
    if (edgeSource && edgeTarget && edgeLabel && edgeSource !== edgeTarget) {
      setEdges(prev => [...prev, { source: edgeSource, target: edgeTarget, label: edgeLabel }]);
      setEdgeSource('');
      setEdgeTarget('');
      setEdgeLabel('');
      setAddingEdge(false);
    }
  };

  const deleteEdge = (idx: number) => {
    setEdges(prev => prev.filter((_, i) => i !== idx));
  };

  const autoLayout = () => {
    const count = nodes.length;
    const centerX = 450;
    const centerY = 280;
    const radius = 220;
    setNodes(prev => prev.map((n, i) => {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      return { ...n, x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) };
    }));
  };

  const getEdgePath = (sourceId: string, targetId: string) => {
    const s = nodes.find(n => n.id === sourceId);
    const t = nodes.find(n => n.id === targetId);
    if (!s || !t) return '';
    return `M ${s.x} ${s.y} L ${t.x} ${t.y}`;
  };

  const getEdgeMid = (sourceId: string, targetId: string) => {
    const s = nodes.find(n => n.id === sourceId);
    const t = nodes.find(n => n.id === targetId);
    if (!s || !t) return { x: 0, y: 0 };
    return { x: (s.x + t.x) / 2, y: (s.y + t.y) / 2 };
  };

  const domainsInGraph = useMemo(() => Array.from(new Set(nodes.map(n => n.domain))), [nodes]);

  /* ---- Tab 2: Ontology Library ---- */
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDomain, setFilterDomain] = useState('全部');
  const [detailOntology, setDetailOntology] = useState<Ontology | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOntology, setNewOntology] = useState({ name: '', domain: '门店域', description: '' });

  const filteredOntologies = useMemo(() => {
    let list = Object.values(ENERGY_ONTOLOGY_LIBRARY);
    if (filterDomain !== '全部') list = list.filter(o => o.domain === filterDomain);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(o =>
        o.name.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        (o.domain && o.domain.includes(q))
      );
    }
    return list;
  }, [searchQuery, filterDomain]);

  const totalEntities = Object.values(ENERGY_ONTOLOGY_LIBRARY).length;
  const totalDomains = DOMAIN_ORDER.length;
  const totalAttrs = Object.values(ENERGY_ONTOLOGY_LIBRARY).reduce((sum, o) => sum + o.attributes.length, 0);
  const totalRels = Object.values(ENERGY_ONTOLOGY_LIBRARY).reduce((sum, o) => sum + (o.relations?.length || 0), 0);

  /* ---- Tab 3: Instance Scenarios ---- */
  const [activeScenario, setActiveScenario] = useState(0);
  const [scenarioSelectedNode, setScenarioSelectedNode] = useState<any>(null);
  const [playingNode, setPlayingNode] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentScenario = SCENARIOS[activeScenario];

  const startPlayback = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    setIsPlaying(true);
    let index = 0;
    setPlayingNode(currentScenario.nodes[0].id);
    playIntervalRef.current = setInterval(() => {
      index = (index + 1) % currentScenario.nodes.length;
      setPlayingNode(currentScenario.nodes[index].id);
    }, 1500);
  };

  const stopPlayback = () => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
    setIsPlaying(false);
    setPlayingNode(null);
  };

  useEffect(() => {
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    stopPlayback();
    setScenarioSelectedNode(null);
  }, [activeScenario]);

  const getCriticalPathLength = () => {
    const adj: Record<string, string[]> = {};
    currentScenario.nodes.forEach(n => adj[n.id] = []);
    currentScenario.edges.forEach(e => {
      if (adj[e.source]) adj[e.source].push(e.target);
    });
    const dfs = (nodeId: string, visited: Set<string>): number => {
      if (visited.has(nodeId)) return 0;
      visited.add(nodeId);
      const neighbors = adj[nodeId] || [];
      if (neighbors.length === 0) return 1;
      return 1 + Math.max(...neighbors.map(n => dfs(n, new Set(visited))));
    };
    return Math.max(...currentScenario.nodes.map(n => dfs(n.id, new Set())));
  };

  const criticalPathLength = getCriticalPathLength();

  /* ---- Render helpers ---- */
  const tabs = [
    { label: '数据源发现', icon: <Database size={16} /> },
    { label: '关系图谱', icon: <Network size={16} /> },
    { label: '本体库', icon: <BookOpen size={16} /> },
    { label: '实例推演', icon: <Play size={16} /> },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">本体与语义建模</h1>
            <p className="text-sm text-gray-500 mt-0.5">零售领域本体库 · 8大域 · 42实体</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Layers size={16} />
            <span>L3 语义层</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-1">
          {tabs.map((t, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-300',
                activeTab === i
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {/* ===== Tab 0: Data Source Discovery ===== */}
        {activeTab === 0 && (
          <div className="flex h-full">
            {/* Left sidebar */}
            <div className="w-[300px] bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
              <div className="p-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Database size={14} /> 数据源 ({DATA_SOURCES.length})
                </h3>
              </div>
              {/* Stats */}
              <div className="px-3 py-2 border-b border-gray-100">
                <div className="grid grid-cols-4 gap-1">
                  <div className="text-center p-1.5 bg-gray-50 rounded-lg border border-gray-100 transition-all duration-300 hover:shadow-sm">
                    <div className="text-sm font-bold text-indigo-600">{totalSources}</div>
                    <div className="text-[9px] text-gray-400">数据源</div>
                  </div>
                  <div className="text-center p-1.5 bg-gray-50 rounded-lg border border-gray-100 transition-all duration-300 hover:shadow-sm">
                    <div className="text-sm font-bold text-emerald-600">{totalTables}</div>
                    <div className="text-[9px] text-gray-400">数据表</div>
                  </div>
                  <div className="text-center p-1.5 bg-gray-50 rounded-lg border border-gray-100 transition-all duration-300 hover:shadow-sm">
                    <div className="text-sm font-bold text-blue-600">{recognizedTables}</div>
                    <div className="text-[9px] text-gray-400">已识别</div>
                  </div>
                  <div className="text-center p-1.5 bg-gray-50 rounded-lg border border-gray-100 transition-all duration-300 hover:shadow-sm">
                    <div className="text-sm font-bold text-amber-600">{recognitionRate}%</div>
                    <div className="text-[9px] text-gray-400">识别率</div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                {DATA_SOURCES.map(source => (
                  <div key={source.name} className="border-b border-gray-100">
                    <button
                      onClick={() => toggleSource(source.name)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 transition-all duration-300"
                    >
                      {expandedSources[source.name] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span className="font-medium text-gray-800">{source.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{source.type}</span>
                      <span className="text-xs text-gray-400 ml-auto">{source.tables.length}表</span>
                    </button>
                    {expandedSources[source.name] && (
                      <div className="pb-1">
                        {source.tables.map(table => (
                          <div key={table.name}>
                            <button
                              onClick={() => { toggleTable(table.name); setSelectedTable(table); }}
                              className={cn(
                                'w-full text-left px-5 py-2 text-xs hover:bg-gray-50 transition-all duration-300',
                                selectedTable?.name === table.name ? 'bg-blue-50' : ''
                              )}
                            >
                              <div className="flex items-center gap-2">
                                {expandedTables[table.name] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                <span className="font-medium text-gray-700">{table.name}</span>
                                <span className="text-gray-400">{table.rows}行</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 ml-4">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                                  {table.entity}
                                </span>
                                <span className="text-[10px] text-gray-400">置信度 {table.conf}%</span>
                              </div>
                            </button>
                            {expandedTables[table.name] && (
                              <div className="px-5 pb-2 ml-4">
                                {table.fields.map((field: any) => (
                                  <div
                                    key={field.name}
                                    className={cn(
                                      'flex items-center gap-2 py-1 px-2 rounded text-xs transition-colors duration-300',
                                      field.ontology ? 'bg-amber-50/50' : ''
                                    )}
                                  >
                                    {getFieldTypeIcon(field.type)}
                                    <span className="font-mono text-gray-600">{field.name}</span>
                                    <span className="text-gray-400">{field.type}</span>
                                    <span className="text-gray-500">{field.comment}</span>
                                    {field.ontology && (
                                      <span className="text-[10px] px-1 py-0.5 rounded bg-amber-100 text-amber-700 ml-auto">
                                        {field.ontology}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedTable ? (
                <div className="max-w-2xl">
                  <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">{selectedTable.name}</h2>
                        <p className="text-sm text-gray-500 mt-1">{selectedTable.rows} 行数据</p>
                      </div>
                      <span className="text-sm px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        识别为: {selectedTable.entity} ({selectedTable.conf}%)
                      </span>
                    </div>
                    <div className="mb-4 flex gap-2">
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-md flex items-center gap-1.5">
                        <GitMerge size={14} /> 映射到本体
                      </button>
                      <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-all duration-300 hover:shadow-md flex items-center gap-1.5">
                        <Wand2 size={14} /> 批量映射
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all duration-300 flex items-center gap-1.5">
                        <Eye size={14} /> 查看样本数据
                      </button>
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">字段列表 ({selectedTable.fields.length})</h3>
                      <div className="space-y-2">
                        {selectedTable.fields.map((field: any) => (
                          <div
                            key={field.name}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 hover:shadow-sm',
                              field.ontology
                                ? 'border-amber-200 bg-amber-50/30'
                                : 'border-gray-100 bg-gray-50/50'
                            )}
                          >
                            <div className="text-gray-400">{getFieldTypeIcon(field.type)}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-medium text-gray-800">{field.name}</span>
                                <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{field.type}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">{field.comment}</div>
                            </div>
                            {field.ontology && (
                              <div className="flex items-center gap-1 text-xs text-amber-700">
                                <Link2 size={12} />
                                <span>映射到 {field.ontology}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <Database size={48} className="mx-auto mb-3 opacity-50" />
                    <p>选择左侧数据源查看详情</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== Tab 1: Relationship Graph ===== */}
        {activeTab === 1 && (
          <div className="flex h-full">
            <div className="flex-1 relative overflow-hidden bg-slate-50" ref={graphRef}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Grid background */}
              <div className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Zoom controls */}
              <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
                <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} className="p-2 bg-white rounded-lg shadow border border-gray-200 hover:bg-gray-50 transition-all duration-300 hover:shadow-md">
                  <ZoomIn size={16} />
                </button>
                <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))} className="p-2 bg-white rounded-lg shadow border border-gray-200 hover:bg-gray-50 transition-all duration-300 hover:shadow-md">
                  <ZoomOut size={16} />
                </button>
                <div className="p-2 bg-white rounded-lg shadow border border-gray-200 text-xs text-center text-gray-500">
                  {Math.round(zoom * 100)}%
                </div>
              </div>

              {/* Auto layout button */}
              <div className="absolute top-4 left-20 z-10">
                <button
                  onClick={autoLayout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium shadow border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-300 hover:shadow-md"
                >
                  <LayoutGrid size={14} />
                  自动布局
                </button>
              </div>

              {/* Edge controls */}
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button
                  onClick={() => setAddingEdge(!addingEdge)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium shadow border transition-all duration-300',
                    addingEdge
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  )}
                >
                  <Plus size={14} />
                  添加关系
                </button>
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 z-10 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                <div className="text-[10px] font-semibold text-gray-500 mb-2">领域图例</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {domainsInGraph.map(domain => {
                    const meta = DOMAIN_META[domain];
                    return (
                      <div key={domain} className="flex items-center gap-1.5">
                        <div className={cn("w-2.5 h-2.5 rounded-full", meta ? `bg-${meta.color}-500` : 'bg-gray-400')} />
                        <span className="text-[10px] text-gray-600">{domain}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add edge panel */}
              {addingEdge && (
                <div className="absolute top-14 right-4 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-20">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">添加关系</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">源实体</label>
                      <select
                        value={edgeSource}
                        onChange={e => setEdgeSource(e.target.value)}
                        className="w-full mt-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5"
                      >
                        <option value="">选择源实体</option>
                        {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">目标实体</label>
                      <select
                        value={edgeTarget}
                        onChange={e => setEdgeTarget(e.target.value)}
                        className="w-full mt-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5"
                      >
                        <option value="">选择目标实体</option>
                        {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">关系名称</label>
                      <input
                        value={edgeLabel}
                        onChange={e => setEdgeLabel(e.target.value)}
                        placeholder="如: 包含、关联"
                        className="w-full mt-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5"
                      />
                    </div>
                    <button
                      onClick={addEdge}
                      disabled={!edgeSource || !edgeTarget || !edgeLabel || edgeSource === edgeTarget}
                      className="w-full py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      确认添加
                    </button>
                  </div>
                </div>
              )}

              {/* Graph */}
              <div
                className="absolute inset-0"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                }}
              >
                {/* SVG edges */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: '2000px', height: '1200px' }}>
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                    </marker>
                    <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                    </marker>
                  </defs>
                  {edges.map((edge, i) => {
                    const path = getEdgePath(edge.source, edge.target);
                    const isHovered = hoveredEdge === i;
                    return (
                      <g key={i}>
                        <path
                          d={path}
                          stroke={isHovered ? '#3b82f6' : '#94a3b8'}
                          strokeWidth={isHovered ? 2.5 : 1.5}
                          fill="none"
                          markerEnd={isHovered ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                          className="pointer-events-auto cursor-pointer transition-all duration-300"
                          onMouseEnter={() => setHoveredEdge(i)}
                          onMouseLeave={() => setHoveredEdge(null)}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Edge labels */}
                {edges.map((edge, i) => {
                  const mid = getEdgeMid(edge.source, edge.target);
                  return (
                    <div
                      key={`label-${i}`}
                      className={cn(
                        'absolute px-2 py-0.5 rounded text-[10px] font-medium border pointer-events-none transition-all duration-300',
                        hoveredEdge === i
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-white text-gray-500 border-gray-200'
                      )}
                      style={{
                        left: mid.x,
                        top: mid.y,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      {edge.label}
                    </div>
                  );
                })}

                {/* Nodes */}
                {nodes.map(node => {
                  const meta = DOMAIN_META[node.domain];
                  const isSelected = selectedNode?.id === node.id;
                  const isConnected = hoveredEdge !== null && (
                    edges[hoveredEdge]?.source === node.id || edges[hoveredEdge]?.target === node.id
                  );
                  return (
                    <div
                      key={node.id}
                      className={cn(
                        'absolute flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-move select-none transition-all duration-300',
                        meta?.bg || 'bg-gray-50',
                        meta?.border || 'border-gray-200',
                        isSelected ? 'shadow-lg ring-2 ring-blue-400 ring-offset-2' : 'shadow-sm hover:shadow-md',
                        isConnected && 'ring-2 ring-yellow-400 ring-offset-2 scale-105'
                      )}
                      style={{
                        left: node.x,
                        top: node.y,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onMouseDown={e => handleNodeMouseDown(e, node)}
                    >
                      <GripVertical size={12} className="text-gray-400 opacity-50" />
                      <span className={cn('text-xs', meta?.text || 'text-gray-700')}>
                        {meta?.icon}
                      </span>
                      <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">{node.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detail panel */}
            {selectedNode && (
              <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">实体详情</h3>
                  <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600 transition-colors duration-300">
                    <X size={16} />
                  </button>
                </div>
                <div className="p-4">
                  {(() => {
                    const ontology = Object.values(ENERGY_ONTOLOGY_LIBRARY).find(
                      o => o.name === selectedNode.label || o.name.includes(selectedNode.label)
                    );
                    const meta = DOMAIN_META[selectedNode.domain];
                    return (
                      <div>
                        <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium mb-3', meta?.bg, meta?.text, meta?.border, 'border')}>
                          {meta?.icon}
                          {selectedNode.domain}
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-1">{selectedNode.label}</h2>
                        <p className="text-sm text-gray-500 mb-4">{ontology?.description || '零售领域核心实体'}</p>

                        {ontology && (
                          <>
                            <div className="mb-4">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">属性 ({ontology.attributes.length})</h4>
                              <div className="space-y-1.5">
                                {ontology.attributes.map((attr: any) => (
                                  <div key={attr.name || attr} className="flex items-center gap-2 text-sm p-2 rounded bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                                    <Tag size={12} className="text-gray-400" />
                                    <span className="font-medium text-gray-700">{attr.name || attr}</span>
                                    {attr.type && <span className="text-xs text-gray-400 ml-auto">{attr.type}</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">关系 ({(ontology.relations || []).length})</h4>
                              <div className="space-y-1.5">
                                {(ontology.relations || []).map((rel: any, i: number) => (
                                  <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                                    <Link2 size={12} className="text-gray-400" />
                                    <span className="text-gray-600">{typeof rel === 'string' ? rel : rel.name}</span>
                                    {typeof rel !== 'string' && rel.target && (
                                      <>
                                        <ArrowRight size={12} className="text-gray-300" />
                                        <span className="text-blue-600">{rel.target}</span>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {/* Edges from/to this node */}
                        <div className="mt-4">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">图谱连接</h4>
                          <div className="space-y-1.5">
                            {edges.map((edge, i) => {
                              if (edge.source !== selectedNode.id && edge.target !== selectedNode.id) return null;
                              const isSource = edge.source === selectedNode.id;
                              const otherId = isSource ? edge.target : edge.source;
                              const other = nodes.find(n => n.id === otherId);
                              return (
                                <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-gray-50 group hover:bg-gray-100 transition-colors duration-300">
                                  {isSource ? (
                                    <><span className="text-gray-500">→</span><span>{edge.label}</span></>
                                  ) : (
                                    <><span className="text-gray-500">←</span><span>{edge.label}</span></>
                                  )}
                                  <span className="text-blue-600 ml-auto">{other?.label}</span>
                                  <button
                                    onClick={() => deleteEdge(i)}
                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity duration-300"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== Tab 2: Ontology Library ===== */}
        {activeTab === 2 && (
          <div className="flex flex-col h-full">
            {/* Stats Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-2">
              <div className="flex gap-6">
                <div className="flex items-center gap-1.5">
                  <Box size={14} className="text-indigo-500" />
                  <span className="text-xs text-gray-500"><span className="font-bold text-gray-900">{totalEntities}</span> 实体</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers size={14} className="text-emerald-500" />
                  <span className="text-xs text-gray-500"><span className="font-bold text-gray-900">{totalDomains}</span> 领域</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-500" />
                  <span className="text-xs text-gray-500"><span className="font-bold text-gray-900">{totalAttrs}</span> 属性</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Link2 size={14} className="text-rose-500" />
                  <span className="text-xs text-gray-500"><span className="font-bold text-gray-900">{totalRels}</span> 关系</span>
                </div>
              </div>
            </div>

            {/* Search & filter */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="搜索本体名称、描述..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-md"
                >
                  <Plus size={16} />
                  创建新本体
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {['全部', ...DOMAIN_ORDER].map(domain => (
                  <button
                    key={domain}
                    onClick={() => setFilterDomain(domain)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-300',
                      filterDomain === domain
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    )}
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-3 gap-4">
                {filteredOntologies.map(ontology => {
                  const meta = DOMAIN_META[ontology.domain || ''];
                  return (
                    <button
                      key={ontology.name}
                      onClick={() => setDetailOntology(ontology)}
                      className="text-left bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-300 group hover:-translate-y-0.5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn('p-2.5 rounded-xl', meta?.bg || 'bg-gray-50')}>
                          <span className={meta?.text || 'text-gray-600'}>{getDomainIcon(ontology.domain || '')}</span>
                        </div>
                        <span className={cn('text-xs px-2 py-1 rounded-full border font-medium', meta?.bg, meta?.text, meta?.border)}>
                          {ontology.domain}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors duration-300">
                        {ontology.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{ontology.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Tag size={12} />
                          {ontology.attributes.length} 属性
                        </span>
                        <span className="flex items-center gap-1">
                          <Link2 size={12} />
                          {(ontology.relations || []).length} 关系
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detail panel (slide-in instead of modal for richer experience) */}
            {detailOntology && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDetailOntology(null)}>
                <div className="bg-white rounded-2xl shadow-2xl w-[640px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-3 rounded-xl', DOMAIN_META[detailOntology.domain || '']?.bg || 'bg-gray-50')}>
                        {getDomainIcon(detailOntology.domain || '')}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{detailOntology.name}</h2>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium mt-1 inline-block', DOMAIN_META[detailOntology.domain || '']?.bg, DOMAIN_META[detailOntology.domain || '']?.text, DOMAIN_META[detailOntology.domain || '']?.border)}>
                          {detailOntology.domain}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setDetailOntology(null)} className="text-gray-400 hover:text-gray-600 p-1 transition-colors duration-300">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-5 leading-relaxed">{detailOntology.description}</p>

                    {/* Fake Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                        <div className="text-lg font-bold text-indigo-600">{Math.floor(Math.random() * 50) + 10}</div>
                        <div className="text-[10px] text-gray-500">引用次数</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                        <div className="text-lg font-bold text-emerald-600">{Math.floor(Math.random() * 8) + 1}</div>
                        <div className="text-[10px] text-gray-500">关联Agent数</div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Tag size={14} />
                        属性定义 ({detailOntology.attributes.length})
                      </h3>
                      <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">属性名</th>
                              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">类型</th>
                              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">描述</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {detailOntology.attributes.map((attr: any) => (
                              <tr key={attr.name || attr} className="hover:bg-gray-50/50 transition-colors duration-300">
                                <td className="px-4 py-2.5 font-medium text-gray-800">{attr.name || attr}</td>
                                <td className="px-4 py-2.5">
                                  {attr.type && <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">{attr.type}</span>}
                                  {!attr.type && <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">string</span>}
                                </td>
                                <td className="px-4 py-2.5 text-gray-500">{attr.description || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Link2 size={14} />
                        关系定义 ({(detailOntology.relations || []).length})
                      </h3>
                      <div className="space-y-2">
                        {(detailOntology.relations || []).map((rel: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors duration-300">
                            <span className="text-sm font-medium text-gray-700">{typeof rel === 'string' ? rel : rel.name}</span>
                            {typeof rel !== 'string' && rel.target && (
                              <>
                                <ArrowRight size={14} className="text-gray-300" />
                                <span className="text-sm text-blue-600 font-medium">{rel.target}</span>
                              </>
                            )}
                            <span className="text-xs text-gray-400 ml-auto">{typeof rel !== 'string' ? rel.type || '关联' : '关联'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mini Graph Text */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Network size={14} />
                        关系图谱
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <CircleDot size={14} className="text-indigo-500" />
                          <span className="font-medium">{detailOntology.name}</span>
                        </div>
                        {(detailOntology.relations || []).slice(0, 4).map((rel: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-gray-500 pl-5">
                            <ArrowUpRight size={12} />
                            {typeof rel === 'string' ? rel : `${rel.name} → ${rel.target || '?'}`}
                          </div>
                        ))}
                        {(detailOntology.relations?.length || 0) > 4 && (
                          <div className="text-[10px] text-gray-400 pl-5">... 还有 {(detailOntology.relations?.length || 0) - 4} 个关系</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                    <button
                      onClick={() => setDetailOntology(null)}
                      className="px-4 py-2 text-sm text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-lg transition-all duration-300 flex items-center gap-1.5"
                    >
                      <Trash2 size={14} /> 删除
                    </button>
                    <button
                      onClick={() => setDetailOntology(null)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-1.5"
                    >
                      <Edit3 size={14} /> 编辑
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Create modal */}
            {showCreateModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreateModal(false)}>
                <div className="bg-white rounded-2xl shadow-2xl w-[480px]" onClick={e => e.stopPropagation()}>
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">创建新本体</h2>
                    <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors duration-300">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">本体名称</label>
                      <input
                        value={newOntology.name}
                        onChange={e => setNewOntology(p => ({ ...p, name: e.target.value }))}
                        placeholder="如: 门店巡检"
                        className="w-full mt-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">所属域</label>
                      <select
                        value={newOntology.domain}
                        onChange={e => setNewOntology(p => ({ ...p, domain: e.target.value }))}
                        className="w-full mt-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                      >
                        {DOMAIN_ORDER.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">描述</label>
                      <textarea
                        value={newOntology.description}
                        onChange={e => setNewOntology(p => ({ ...p, description: e.target.value }))}
                        placeholder="描述本体的业务含义..."
                        rows={3}
                        className="w-full mt-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all duration-300"
                      />
                    </div>
                  </div>
                  <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-300"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        if (newOntology.name.trim()) {
                          setShowCreateModal(false);
                          setNewOntology({ name: '', domain: '门店域', description: '' });
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-300"
                    >
                      创建
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== Tab 3: Instance Scenarios ===== */}
        {activeTab === 3 && (
          <div className="flex h-full">
            {/* Scenario selector */}
            <div className="w-72 bg-white border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Play size={14} /> 推演场景
                </h3>
              </div>
              {SCENARIOS.map((scenario, i) => (
                <button
                  key={scenario.id}
                  onClick={() => { setActiveScenario(i); setScenarioSelectedNode(null); }}
                  className={cn(
                    'w-full text-left p-4 border-b border-gray-100 transition-all duration-300',
                    activeScenario === i ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {i === 0 && <TrendingUp size={14} className="text-rose-500" />}
                    {i === 1 && <ShieldCheck size={14} className="text-emerald-500" />}
                    {i === 2 && <Megaphone size={14} className="text-violet-500" />}
                    {i === 3 && <AlertTriangle size={14} className="text-amber-500" />}
                    <span className="text-sm font-semibold text-gray-800">{scenario.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{scenario.desc}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                    <span>{scenario.nodes.length} 节点</span>
                    <span>{scenario.edges.length} 关系</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Scenario graph */}
            <div className="flex-1 relative overflow-hidden bg-slate-50">
              <div className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              <div className="absolute top-4 left-4 bg-white rounded-lg shadow border border-gray-200 px-3 py-2 z-10">
                <h4 className="text-sm font-semibold text-gray-800">{currentScenario.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{currentScenario.desc}</p>
              </div>

              {/* Play button */}
              <div className="absolute top-4 left-64 z-10">
                <button
                  onClick={startPlayback}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all duration-300 hover:shadow-md",
                    isPlaying ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-indigo-600 text-white hover:bg-indigo-700"
                  )}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  {isPlaying ? '停止推演' : '播放推演'}
                </button>
              </div>

              {/* Scenario Stats */}
              <div className="absolute top-4 right-4 z-10 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm font-bold text-indigo-600">{currentScenario.nodes.length}</div>
                    <div className="text-[9px] text-gray-400">节点数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-emerald-600">{currentScenario.edges.length}</div>
                    <div className="text-[9px] text-gray-400">关系数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-amber-600">{criticalPathLength}</div>
                    <div className="text-[9px] text-gray-400">关键路径</div>
                  </div>
                </div>
              </div>

              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: '2000px', height: '1200px' }}>
                <defs>
                  <marker id="s-arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                  </marker>
                  <marker id="s-arrowhead-active" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
                  </marker>
                </defs>
                {currentScenario.edges.map((edge, i) => {
                  const s = currentScenario.nodes.find(n => n.id === edge.source);
                  const t = currentScenario.nodes.find(n => n.id === edge.target);
                  if (!s || !t) return null;
                  const isActive = playingNode === s.id || playingNode === t.id;
                  return (
                    <path
                      key={i}
                      d={`M ${s.x} ${s.y} L ${t.x} ${t.y}`}
                      stroke={isActive ? "#6366f1" : "#94a3b8"}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      fill="none"
                      markerEnd={isActive ? "url(#s-arrowhead-active)" : "url(#s-arrowhead)"}
                      className="transition-all duration-500"
                    />
                  );
                })}
              </svg>

              {currentScenario.edges.map((edge, i) => {
                const s = currentScenario.nodes.find(n => n.id === edge.source);
                const t = currentScenario.nodes.find(n => n.id === edge.target);
                if (!s || !t) return null;
                const isActive = playingNode === s.id || playingNode === t.id;
                return (
                  <div
                    key={`sl-${i}`}
                    className={cn(
                      "absolute px-2 py-0.5 rounded text-[10px] font-medium border pointer-events-none transition-all duration-500",
                      isActive ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-white text-gray-500 border-gray-200"
                    )}
                    style={{
                      left: (s.x + t.x) / 2,
                      top: (s.y + t.y) / 2,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {edge.label}
                  </div>
                );
              })}

              {currentScenario.nodes.map(node => {
                const meta = DOMAIN_META[node.domain];
                const isSelected = scenarioSelectedNode?.id === node.id;
                const isPlayingNode = playingNode === node.id;
                return (
                  <button
                    key={node.id}
                    className={cn(
                      'absolute flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all duration-500',
                      meta?.bg || 'bg-gray-50',
                      meta?.border || 'border-gray-200',
                      isSelected ? 'shadow-lg ring-2 ring-blue-400 ring-offset-2' : 'shadow-sm hover:shadow-md',
                      isPlayingNode && 'ring-2 ring-yellow-400 ring-offset-2 scale-110 shadow-xl'
                    )}
                    style={{
                      left: node.x,
                      top: node.y,
                      transform: `translate(-50%, -50%) ${isSelected ? 'scale(1.05)' : ''} ${isPlayingNode ? 'scale(1.1)' : ''}`,
                    }}
                    onClick={() => setScenarioSelectedNode(node)}
                  >
                    <span className={cn('text-xs', meta?.text || 'text-gray-700')}>
                      {meta?.icon}
                    </span>
                    <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">{node.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Instance detail panel */}
            {scenarioSelectedNode && (
              <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">实例详情</h3>
                  <button onClick={() => setScenarioSelectedNode(null)} className="text-gray-400 hover:text-gray-600 transition-colors duration-300">
                    <X size={16} />
                  </button>
                </div>
                <div className="p-4">
                  <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium mb-3', DOMAIN_META[scenarioSelectedNode.domain]?.bg, DOMAIN_META[scenarioSelectedNode.domain]?.text, DOMAIN_META[scenarioSelectedNode.domain]?.border, 'border')}>
                    {DOMAIN_META[scenarioSelectedNode.domain]?.icon}
                    {scenarioSelectedNode.domain}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">{scenarioSelectedNode.label}</h2>
                  <p className="text-sm text-blue-600 mb-4">类型: {scenarioSelectedNode.detail.type}</p>

                  <div className="space-y-2">
                    {Object.entries(scenarioSelectedNode.detail.attrs).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                        <span className="text-xs font-medium text-gray-500 uppercase w-20 shrink-0">{key}</span>
                        <span className="text-sm text-gray-800">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <div className="flex items-center gap-2 text-xs text-blue-700 mb-1">
                      <CheckCircle2 size={12} />
                      <span className="font-medium">推演状态</span>
                    </div>
                    <p className="text-xs text-blue-600">该实例处于正常业务流程中，所有属性校验通过。</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
