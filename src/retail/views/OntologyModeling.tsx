import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Database, Plus, Search, Server, Table2, ChevronRight, ChevronDown, Box,
  Wand2, Save, Network, Settings, X, ZoomIn, ZoomOut, Move, Trash2,
  GitMerge, Eye, Sparkles, ArrowRight, Link2, Layers
} from 'lucide-react';
import { cn } from '../lib/utils';
import RETAIL_ONTOLOGY_LIBRARY from '../constants/ontology';
import type { Ontology } from '../constants/ontology';

type TabKey = 'discovery' | 'graph' | 'ontology' | 'instances';

/* ============================================================
   Domain Colors
   ============================================================ */
const DOMAIN_COLORS: Record<string, { bg: string; text: string; border: string; light: string }> = {
  '门店域': { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-200', light: 'bg-blue-50' },
  '商品域': { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', light: 'bg-emerald-50' },
  '供应链域': { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200', light: 'bg-amber-50' },
  '会员域': { bg: 'bg-violet-500', text: 'text-violet-700', border: 'border-violet-200', light: 'bg-violet-50' },
  '销售域': { bg: 'bg-cyan-500', text: 'text-cyan-700', border: 'border-cyan-200', light: 'bg-cyan-50' },
  '营销域': { bg: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-200', light: 'bg-rose-50' },
  '财务域': { bg: 'bg-slate-500', text: 'text-slate-700', border: 'border-slate-200', light: 'bg-slate-50' },
  '竞品域': { bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-200', light: 'bg-orange-50' },
  '自定义': { bg: 'bg-gray-500', text: 'text-gray-700', border: 'border-gray-200', light: 'bg-gray-50' },
};

/* ============================================================
   Data Sources (Tab 1)
   ============================================================ */
const DATA_SOURCES = [
  {
    id: 'pos', name: 'POS系统', type: 'mysql', icon: Server,
    tables: [
      { id: 'pos_transaction', name: 'pos_transaction', rows: '1.2亿', recognizedAs: 'POSTransaction', confidence: 95, fields: [{ name: 'txn_id', type: 'varchar(32)', comment: '交易ID' }, { name: 'store_id', type: 'varchar(32)', comment: '门店ID → Store' }, { name: 'amount', type: 'decimal(10,2)', comment: '交易金额' }, { name: 'txn_time', type: 'datetime', comment: '交易时间' }] },
      { id: 'pos_daily_summary', name: 'pos_daily_summary', rows: '4500万', recognizedAs: 'SalesTarget', confidence: 88, fields: [{ name: 'store_id', type: 'varchar(32)', comment: '门店ID' }, { name: 'summary_date', type: 'date', comment: '汇总日期' }, { name: 'total_amount', type: 'decimal(12,2)', comment: '日销售总额' }] },
      { id: 'member_checkin', name: 'member_checkin', rows: '8900万', recognizedAs: 'MemberBehavior', confidence: 91, fields: [{ name: 'checkin_id', type: 'varchar(32)', comment: '签到ID' }, { name: 'member_id', type: 'varchar(32)', comment: '会员ID → Member' }, { name: 'store_id', type: 'varchar(32)', comment: '门店ID' }, { name: 'checkin_time', type: 'datetime', comment: '签到时间' }] },
    ]
  },
  {
    id: 'erp', name: 'ERP系统', type: 'oracle', icon: Database,
    tables: [
      { id: 'erp_sales_order', name: 'sales_order', rows: '8500万', recognizedAs: 'SalesOrder', confidence: 92, fields: [{ name: 'so_id', type: 'varchar(32)', comment: '订单ID' }, { name: 'store_id', type: 'varchar(32)', comment: '门店ID' }, { name: 'member_id', type: 'varchar(32)', comment: '会员ID' }, { name: 'total_amount', type: 'decimal(10,2)', comment: '订单金额' }] },
      { id: 'erp_inventory', name: 'inventory_ledger', rows: '8500万', recognizedAs: 'Inventory', confidence: 90, fields: [{ name: 'sku_id', type: 'varchar(32)', comment: 'SKU ID → SKU' }, { name: 'location_id', type: 'varchar(32)', comment: '库位ID' }, { name: 'qty_on_hand', type: 'decimal(10,2)', comment: '在手库存' }, { name: 'expiry_date', type: 'date', comment: '保质期' }] },
      { id: 'erp_purchase_order', name: 'purchase_order', rows: '120万', recognizedAs: 'PurchaseOrder', confidence: 94, fields: [{ name: 'po_id', type: 'varchar(32)', comment: '采购单ID' }, { name: 'supplier_id', type: 'varchar(32)', comment: '供应商ID → Supplier' }, { name: 'total_amount', type: 'decimal(10,2)', comment: '总金额' }, { name: 'status', type: 'varchar(20)', comment: '订单状态' }] },
      { id: 'erp_settlement', name: 'settlement', rows: '45万', recognizedAs: 'Settlement', confidence: 87, fields: [{ name: 'settle_id', type: 'varchar(32)', comment: '结算ID' }, { name: 'counterparty_id', type: 'varchar(32)', comment: '结算方ID' }, { name: 'amount', type: 'decimal(10,2)', comment: '结算金额' }, { name: 'period', type: 'varchar(20)', comment: '结算周期' }] },
    ]
  },
  {
    id: 'wms', name: 'WMS系统', type: 'mysql', icon: Database,
    tables: [
      { id: 'wms_stock', name: 'warehouse_stock', rows: '8500万', recognizedAs: 'Inventory', confidence: 93, fields: [{ name: 'stock_id', type: 'varchar(32)', comment: '库存记录ID' }, { name: 'warehouse_id', type: 'varchar(32)', comment: '仓库ID → Warehouse' }, { name: 'sku_id', type: 'varchar(32)', comment: 'SKU ID' }, { name: 'qty', type: 'int', comment: '库存数量' }] },
      { id: 'wms_dist', name: 'distribution_order', rows: '320万', recognizedAs: 'Distribution', confidence: 89, fields: [{ name: 'dist_id', type: 'varchar(32)', comment: '配送单ID' }, { name: 'warehouse_id', type: 'varchar(32)', comment: '仓库ID' }, { name: 'store_id', type: 'varchar(32)', comment: '门店ID' }, { name: 'status', type: 'varchar(20)', comment: '配送状态' }] },
      { id: 'wms_qc', name: 'quality_check_record', rows: '180万', recognizedAs: 'QualityCheck', confidence: 91, fields: [{ name: 'qc_id', type: 'varchar(32)', comment: '质检ID' }, { name: 'batch_no', type: 'varchar(50)', comment: '批次号' }, { name: 'sku_id', type: 'varchar(32)', comment: 'SKU ID' }, { name: 'result', type: 'varchar(10)', comment: '质检结果' }] },
    ]
  },
  {
    id: 'member', name: '会员系统', type: 'postgres', icon: Database,
    tables: [
      { id: 'crm_member', name: 'member', rows: '3600万', recognizedAs: 'Member', confidence: 94, fields: [{ name: 'member_id', type: 'varchar(32)', comment: '会员ID' }, { name: 'phone', type: 'varchar(20)', comment: '手机号' }, { name: 'tier', type: 'varchar(10)', comment: '会员等级' }, { name: 'register_date', type: 'date', comment: '注册日期' }] },
      { id: 'crm_promotion', name: 'promotion', rows: '1200万', recognizedAs: 'Promotion', confidence: 89, fields: [{ name: 'promo_id', type: 'varchar(32)', comment: '活动ID' }, { name: 'promo_name', type: 'varchar(100)', comment: '活动名称' }, { name: 'start_date', type: 'date', comment: '开始日期' }, { name: 'budget', type: 'decimal(12,2)', comment: '活动预算' }] },
      { id: 'crm_coupon', name: 'coupon', rows: '5800万', recognizedAs: 'Coupon', confidence: 88, fields: [{ name: 'coupon_id', type: 'varchar(32)', comment: '优惠券ID' }, { name: 'coupon_code', type: 'varchar(50)', comment: '券码' }, { name: 'discount_value', type: 'decimal(8,2)', comment: '折扣金额' }, { name: 'valid_to', type: 'date', comment: '有效期至' }] },
      { id: 'crm_member_tag', name: 'member_tag', rows: '1.2亿', recognizedAs: 'MemberTag', confidence: 85, fields: [{ name: 'tag_id', type: 'varchar(32)', comment: '标签ID' }, { name: 'member_id', type: 'varchar(32)', comment: '会员ID' }, { name: 'tag_name', type: 'varchar(50)', comment: '标签名' }, { name: 'tag_value', type: 'varchar(100)', comment: '标签值' }] },
      { id: 'crm_loyalty', name: 'loyalty_program', rows: '3600万', recognizedAs: 'LoyaltyProgram', confidence: 90, fields: [{ name: 'program_id', type: 'varchar(32)', comment: '计划ID' }, { name: 'member_id', type: 'varchar(32)', comment: '会员ID' }, { name: 'points_balance', type: 'int', comment: '积分余额' }, { name: 'tier', type: 'varchar(10)', comment: '当前等级' }] },
    ]
  },
  {
    id: 'crm', name: 'CRM系统', type: 'rest', icon: Database,
    tables: [
      { id: 'crm_feedback', name: 'customer_feedback', rows: '560万', recognizedAs: 'ProductReview', confidence: 86, fields: [{ name: 'feedback_id', type: 'varchar(32)', comment: '反馈ID' }, { name: 'member_id', type: 'varchar(32)', comment: '会员ID' }, { name: 'content', type: 'text', comment: '反馈内容' }, { name: 'rating', type: 'int', comment: '评分' }] },
      { id: 'crm_campaign', name: 'campaign_effect', rows: '120万', recognizedAs: 'AdCampaign', confidence: 84, fields: [{ name: 'campaign_id', type: 'varchar(32)', comment: '活动ID' }, { name: 'channel', type: 'varchar(50)', comment: '投放渠道' }, { name: 'impressions', type: 'bigint', comment: '曝光量' }, { name: 'conversions', type: 'int', comment: '转化数' }] },
    ]
  },
  {
    id: 'bi', name: 'BI系统', type: 'clickhouse', icon: Database,
    tables: [
      { id: 'bi_anomaly', name: 'sales_anomaly', rows: '45万', recognizedAs: 'SalesAnomaly', confidence: 92, fields: [{ name: 'anomaly_id', type: 'varchar(32)', comment: '异常ID' }, { name: 'store_id', type: 'varchar(32)', comment: '门店ID' }, { name: 'anomaly_type', type: 'varchar(50)', comment: '异常类型' }, { name: 'severity', type: 'varchar(10)', comment: '严重程度' }] },
      { id: 'bi_forecast', name: 'demand_forecast', rows: '2800万', recognizedAs: 'DemandForecast', confidence: 88, fields: [{ name: 'forecast_id', type: 'varchar(32)', comment: '预测ID' }, { name: 'sku_id', type: 'varchar(32)', comment: 'SKU ID' }, { name: 'forecast_qty', type: 'int', comment: '预测量' }, { name: 'confidence', type: 'decimal(4,2)', comment: '置信度' }] },
      { id: 'bi_competitor', name: 'competitor_price', rows: '1800万', recognizedAs: 'MarketPrice', confidence: 85, fields: [{ name: 'mp_id', type: 'varchar(32)', comment: '价格ID' }, { name: 'product_id', type: 'varchar(32)', comment: '商品ID' }, { name: 'market_price', type: 'decimal(10,2)', comment: '市场价' }, { name: 'collect_date', type: 'date', comment: '采集日期' }] },
    ]
  },
];

/* ============================================================
   Graph Data (Tab 2)
   ============================================================ */
interface GraphNode { id: string; label: string; x: number; y: number; domain: string; }
interface GraphEdge { id: string; source: string; target: string; label: string; }

const INITIAL_GRAPH_NODES: GraphNode[] = [
  { id: 'store', label: '门店', x: 400, y: 200, domain: '门店域' },
  { id: 'product', label: '商品', x: 200, y: 80, domain: '商品域' },
  { id: 'member', label: '会员', x: 650, y: 80, domain: '会员域' },
  { id: 'sales_order', label: '销售订单', x: 400, y: 380, domain: '销售域' },
  { id: 'inventory', label: '库存', x: 80, y: 220, domain: '供应链域' },
  { id: 'promotion', label: '促销', x: 720, y: 220, domain: '会员域' },
  { id: 'supplier', label: '供应商', x: 80, y: 420, domain: '供应链域' },
  { id: 'warehouse', label: '仓库', x: 220, y: 480, domain: '供应链域' },
  { id: 'competitor', label: '竞品', x: 720, y: 420, domain: '竞品域' },
  { id: 'ad_campaign', label: '广告投放', x: 550, y: 40, domain: '营销域' },
  { id: 'category', label: '品类', x: 80, y: 80, domain: '商品域' },
  { id: 'return_order', label: '退货', x: 550, y: 480, domain: '供应链域' },
];

const INITIAL_GRAPH_EDGES: GraphEdge[] = [
  { id: 'e1', source: 'store', target: 'sales_order', label: '产生' },
  { id: 'e2', source: 'product', target: 'sales_order', label: '包含于' },
  { id: 'e3', source: 'member', target: 'sales_order', label: '下单' },
  { id: 'e4', source: 'inventory', target: 'store', label: '供应' },
  { id: 'e5', source: 'product', target: 'inventory', label: '存储为' },
  { id: 'e6', source: 'promotion', target: 'sales_order', label: '应用于' },
  { id: 'e7', source: 'supplier', target: 'product', label: '供应' },
  { id: 'e8', source: 'warehouse', target: 'inventory', label: '存储' },
  { id: 'e9', source: 'competitor', target: 'product', label: '竞争' },
  { id: 'e10', source: 'ad_campaign', target: 'promotion', label: '推广' },
  { id: 'e11', source: 'member', target: 'promotion', label: '接收' },
  { id: 'e12', source: 'category', target: 'product', label: '包含' },
  { id: 'e13', source: 'sales_order', target: 'return_order', label: '可退' },
  { id: 'e14', source: 'store', target: 'return_order', label: '处理' },
];

/* ============================================================
   Instance Scenarios (Tab 4)
   ============================================================ */
const SCENARIOS = [
  {
    id: 'promotion', name: '618大促促销场景',
    nodes: [
      { id: 'n1', label: '门店SH-001', type: '门店', x: 100, y: 150 },
      { id: 'n2', label: '会员张三', type: '会员', x: 300, y: 50 },
      { id: 'n3', label: '促销618-坚果', type: '促销', x: 500, y: 50 },
      { id: 'n4', label: '坚果礼盒LYF-001', type: '商品', x: 300, y: 250 },
      { id: 'n5', label: '库存WH-001', type: '库存', x: 100, y: 350 },
      { id: 'n6', label: '订单SO-1284', type: '订单', x: 500, y: 250 },
    ],
    edges: [
      { source: 'n2', target: 'n6', label: '下单' },
      { source: 'n3', target: 'n6', label: '优惠' },
      { source: 'n4', target: 'n6', label: '商品' },
      { source: 'n5', target: 'n4', label: '供货' },
      { source: 'n1', target: 'n5', label: '门店库存' },
      { source: 'n1', target: 'n6', label: '成交' },
    ]
  },
  {
    id: 'trace', name: '食品安全溯源场景',
    nodes: [
      { id: 'n1', label: '供应商新疆良品', type: '供应商', x: 100, y: 100 },
      { id: 'n2', label: '坚果礼盒(Batch-05)', type: '商品', x: 300, y: 100 },
      { id: 'n3', label: '质检QC-001', type: '质检', x: 300, y: 250 },
      { id: 'n4', label: '门店HZ-001', type: '门店', x: 500, y: 100 },
      { id: 'n5', label: '退货单RT-001', type: '退货', x: 500, y: 250 },
    ],
    edges: [
      { source: 'n1', target: 'n2', label: '供应' },
      { source: 'n2', target: 'n3', label: '质检' },
      { source: 'n3', target: 'n4', label: '入库' },
      { source: 'n4', target: 'n5', label: '退货' },
      { source: 'n2', target: 'n5', label: '问题批次' },
    ]
  },
];

/* ============================================================
   Main Component
   ============================================================ */
export default function OntologyModeling() {
  const [activeTab, setActiveTab] = useState<TabKey>('discovery');

  const tabs: { id: TabKey; label: string; icon: any }[] = [
    { id: 'discovery', label: '数据源发现', icon: Server },
    { id: 'graph', label: '关系图谱', icon: Network },
    { id: 'ontology', label: '本体库', icon: Box },
    { id: 'instances', label: '实例推演', icon: Sparkles },
  ];

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 shrink-0 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Database size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">本体与语义建模</h2>
            <p className="text-[10px] text-gray-500 font-mono">零售领域本体库 · 8大域 · {RETAIL_ONTOLOGY_LIBRARY.length}实体</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'discovery' && <DiscoveryTab />}
        {activeTab === 'graph' && <GraphTab />}
        {activeTab === 'ontology' && <OntologyTab />}
        {activeTab === 'instances' && <InstancesTab />}
      </div>
    </div>
  );
}

/* ============================================================
   Tab 1: Data Source Discovery
   ============================================================ */
function DiscoveryTab() {
  const [expandedSources, setExpandedSources] = useState<string[]>(['pos', 'member']);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [expandedTable, setExpandedTable] = useState<string | null>(null);

  const toggleSource = (id: string) => {
    setExpandedSources(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const selectedTable = DATA_SOURCES.flatMap(s => s.tables).find(t => t.id === selectedTableId);

  return (
    <div className="flex h-full">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-gray-50/30 flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input type="text" placeholder="搜索数据表..." className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {DATA_SOURCES.map((source) => (
            <div key={source.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSource(source.id)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50"
              >
                <source.icon size={16} className="text-blue-500" />
                <span className="text-sm font-medium text-gray-900 flex-1">{source.name}</span>
                <span className="text-xs text-gray-400">{source.tables.length} 表</span>
                {expandedSources.includes(source.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {expandedSources.includes(source.id) && (
                <div className="border-t border-gray-100">
                  {source.tables.map((table) => (
                    <div key={table.id}>
                      <button
                        onClick={() => { setSelectedTableId(table.id); setExpandedTable(expandedTable === table.id ? null : table.id); }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-gray-50",
                          selectedTableId === table.id && "bg-blue-50"
                        )}
                      >
                        <Table2 size={12} className="text-gray-400" />
                        <span className="flex-1 font-mono text-gray-700">{table.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded">{table.confidence}%</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white flex flex-col overflow-hidden">
        {selectedTable ? (
          <div className="p-6 overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <Box size={20} className="text-indigo-600" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedTable.name}</h3>
                <p className="text-sm text-gray-500">
                  识别为: <span className="font-medium text-indigo-600">{selectedTable.recognizedAs}</span> · 置信度 {selectedTable.confidence}% · {selectedTable.rows} 行
                </p>
              </div>
            </div>
            <div className="mb-4 flex gap-2">
              <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 flex items-center gap-1">
                <GitMerge size={12} /> 映射到本体
              </button>
              <button className="px-3 py-1.5 border border-gray-200 text-gray-700 text-xs rounded hover:bg-gray-50 flex items-center gap-1">
                <Eye size={12} /> 预览数据
              </button>
            </div>
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">字段名</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">类型</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">注释</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedTable.fields.map((f, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-gray-900">{f.name}</td>
                    <td className="px-4 py-2 text-gray-600 font-mono text-xs">{f.type}</td>
                    <td className="px-4 py-2 text-gray-500">{f.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Database size={48} className="mb-4 opacity-30" />
            <p>选择左侧数据表查看详情</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Tab 2: Relationship Graph
   ============================================================ */
function GraphTab() {
  const [nodes, setNodes] = useState(INITIAL_GRAPH_NODES);
  const [edges, setEdges] = useState(INITIAL_GRAPH_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showAddEdge, setShowAddEdge] = useState(false);
  const [newEdge, setNewEdge] = useState({ source: '', target: '', label: '' });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setDragging(nodeId);
    setDragOffset({ x: e.clientX - node.x, y: e.clientY - node.y });
    setSelectedNodeId(nodeId);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = (e.clientX - rect.left - dragOffset.x) / zoom;
    const newY = (e.clientY - rect.top - dragOffset.y) / zoom;
    setNodes(prev => prev.map(n => n.id === dragging ? { ...n, x: Math.max(30, Math.min(870, newX)), y: Math.max(30, Math.min(520, newY)) } : n));
  }, [dragging, dragOffset, zoom]);

  const handleMouseUp = useCallback(() => setDragging(null), []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  const addEdge = () => {
    if (newEdge.source && newEdge.target && newEdge.label) {
      setEdges(prev => [...prev, { id: `e${Date.now()}`, source: newEdge.source, target: newEdge.target, label: newEdge.label }]);
      setNewEdge({ source: '', target: '', label: '' });
      setShowAddEdge(false);
    }
  };

  const deleteEdge = (edgeId: string) => setEdges(prev => prev.filter(e => e.id !== edgeId));

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const selectedOntology = selectedNode ? RETAIL_ONTOLOGY_LIBRARY.find(o => o.id === selectedNode.id || o.name.includes(selectedNode.label)) : null;

  return (
    <div className="flex h-full">
      {/* Graph Canvas */}
      <div className="flex-1 relative overflow-hidden bg-gray-50" ref={containerRef}>
        {/* Toolbar */}
        <div className="absolute top-3 left-3 z-10 flex gap-1">
          <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50" title="放大"><ZoomIn size={14} /></button>
          <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50" title="缩小"><ZoomOut size={14} /></button>
          <button onClick={() => setShowAddEdge(true)} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50" title="添加关系"><Plus size={14} /></button>
          <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-500">{zoom.toFixed(1)}x</span>
        </div>

        {/* Graph */}
        <div className="w-full h-full relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
          {/* Edges (SVG) */}
          <svg className="absolute inset-0 w-[900px] h-[550px] pointer-events-none" style={{ width: '100%', height: '100%' }}>
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
              </marker>
            </defs>
            {edges.map(edge => {
              const s = nodes.find(n => n.id === edge.source);
              const t = nodes.find(n => n.id === edge.target);
              if (!s || !t) return null;
              const mx = (s.x + t.x) / 2;
              const my = (s.y + t.y) / 2;
              return (
                <g key={edge.id}>
                  <line x1={s.x} y1={s.y + 20} x2={t.x} y2={t.y - 20} stroke="#cbd5e1" strokeWidth={1.5} markerEnd="url(#arrow)" />
                  <rect x={mx - 16} y={my - 8} width={32} height={16} rx={4} fill="#f1f5f9" stroke="#e2e8f0" />
                  <text x={mx} y={my + 3} textAnchor="middle" fontSize={9} fill="#64748b">{edge.label}</text>
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map(node => {
            const colors = DOMAIN_COLORS[node.domain] || DOMAIN_COLORS['自定义'];
            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                className={cn(
                  "absolute px-3 py-2 rounded-lg text-white text-xs font-medium shadow-md cursor-move select-none transition-shadow",
                  colors.bg,
                  selectedNodeId === node.id && "ring-2 ring-offset-2 ring-gray-400 shadow-lg"
                )}
                style={{ left: node.x - 30, top: node.y - 16, minWidth: 60, textAlign: 'center' }}
              >
                {node.label}
              </div>
            );
          })}
        </div>

        {/* Add Edge Modal */}
        {showAddEdge && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20" onClick={() => setShowAddEdge(false)}>
            <div className="bg-white rounded-xl shadow-xl p-5 w-80" onClick={e => e.stopPropagation()}>
              <h3 className="font-semibold text-gray-900 mb-3">添加关系</h3>
              <div className="space-y-3">
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={newEdge.source} onChange={e => setNewEdge({ ...newEdge, source: e.target.value })}>
                  <option value="">选择源节点</option>
                  {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                </select>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={newEdge.target} onChange={e => setNewEdge({ ...newEdge, target: e.target.value })}>
                  <option value="">选择目标节点</option>
                  {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                </select>
                <input type="text" placeholder="关系标签" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={newEdge.label} onChange={e => setNewEdge({ ...newEdge, label: e.target.value })} />
                <div className="flex gap-2">
                  <button onClick={addEdge} className="flex-1 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">添加</button>
                  <button onClick={() => setShowAddEdge(false)} className="flex-1 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50">取消</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="w-72 border-l border-gray-200 bg-white flex flex-col">
        {selectedOntology ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Box size={18} className="text-indigo-600" />
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{selectedOntology.domain}</span>
              </div>
              <h3 className="font-bold text-gray-900">{selectedOntology.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{selectedOntology.description}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">属性 ({selectedOntology.attributes.length})</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedOntology.attributes.map(attr => (
                    <span key={attr} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-mono rounded">{attr}</span>
                  ))}
                </div>
              </div>
              {selectedOntology.relations && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">关系 ({selectedOntology.relations.length})</h4>
                  <div className="space-y-1">
                    {selectedOntology.relations.map((rel, i) => (
                      <div key={i} className="flex items-center gap-1 text-xs text-gray-600">
                        <Link2 size={10} className="text-gray-400" />
                        {rel}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">相关关系</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {edges.filter(e => e.source === selectedNodeId || e.target === selectedNodeId).map(edge => {
                  const other = edge.source === selectedNodeId ? nodes.find(n => n.id === edge.target) : nodes.find(n => n.id === edge.source);
                  return (
                    <div key={edge.id} className="flex items-center justify-between text-xs group">
                      <span className="text-gray-600">{edge.label} → {other?.label}</span>
                      <button onClick={() => deleteEdge(edge.id)} className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700"><Trash2 size={12} /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
            <Network size={40} className="mb-3 opacity-30" />
            <p className="text-sm">点击节点查看详情</p>
            <p className="text-xs mt-1">拖拽节点调整布局</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Tab 3: Ontology Library
   ============================================================ */
function OntologyTab() {
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('全部');
  const [selectedOntology, setSelectedOntology] = useState<Ontology | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const domains = ['全部', ...Array.from(new Set(RETAIL_ONTOLOGY_LIBRARY.map(o => o.domain).filter(Boolean)))];

  const filtered = RETAIL_ONTOLOGY_LIBRARY.filter(o => {
    const matchDomain = domainFilter === '全部' || o.domain === domainFilter;
    const matchSearch = !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.description.toLowerCase().includes(search.toLowerCase());
    return matchDomain && matchSearch;
  });

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="搜索本体..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {domains.map(d => (
              <button
                key={d}
                onClick={() => setDomainFilter(d)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors",
                  domainFilter === d ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {d}
              </button>
            ))}
          </div>
          <button onClick={() => setShowCreate(true)} className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700">
            <Plus size={14} /> 创建
          </button>
        </div>

        {/* Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-3">
            {filtered.map(onto => {
              const colors = DOMAIN_COLORS[onto.domain || '自定义'] || DOMAIN_COLORS['自定义'];
              return (
                <button
                  key={onto.id}
                  onClick={() => setSelectedOntology(onto)}
                  className="text-left p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-white", colors.bg)}>
                      <Box size={14} />
                    </div>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", colors.light, colors.text)}>{onto.domain}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">{onto.name}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2">{onto.description}</p>
                  <div className="flex gap-3 mt-3 text-[10px] text-gray-400">
                    <span>{onto.attributes.length} 属性</span>
                    <span>{onto.relations?.length || 0} 关系</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedOntology && (
        <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">本体详情</h3>
            <button onClick={() => setSelectedOntology(null)} className="p-1 hover:bg-gray-100 rounded"><X size={14} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", (DOMAIN_COLORS[selectedOntology.domain || ''] || DOMAIN_COLORS['自定义']).bg)}>
                <Box size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{selectedOntology.name}</h4>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full", (DOMAIN_COLORS[selectedOntology.domain || ''] || DOMAIN_COLORS['自定义']).light, (DOMAIN_COLORS[selectedOntology.domain || ''] || DOMAIN_COLORS['自定义']).text)}>{selectedOntology.domain}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{selectedOntology.description}</p>

            <div className="mb-4">
              <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">属性列表</h5>
              <div className="space-y-1">
                {selectedOntology.attributes.map((attr, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded text-xs">
                    <span className="w-4 h-4 rounded bg-gray-200 text-gray-600 flex items-center justify-center text-[9px] font-mono">{i + 1}</span>
                    <span className="font-mono text-gray-700">{attr}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedOntology.relations && (
              <div>
                <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">关系定义</h5>
                <div className="space-y-1">
                  {selectedOntology.relations.map((rel, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-indigo-50 rounded text-xs text-indigo-800">
                      <Link2 size={10} />
                      {rel}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-96" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 mb-4">创建新本体</h3>
            <div className="space-y-3">
              <input type="text" placeholder="本体名称" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input type="text" placeholder="描述" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option>选择领域</option>
                {domains.filter(d => d !== '全部').map(d => <option key={d}>{d}</option>)}
              </select>
              <input type="text" placeholder="属性（逗号分隔）" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">创建</button>
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50">取消</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Tab 4: Instance Scenarios
   ============================================================ */
function InstancesTab() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const scenario = SCENARIOS[activeScenario];

  return (
    <div className="flex h-full">
      {/* Left: Scenario List */}
      <div className="w-64 border-r border-gray-200 bg-gray-50/30 flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">推演场景</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {SCENARIOS.map((sc, i) => (
            <button
              key={sc.id}
              onClick={() => { setActiveScenario(i); setSelectedNode(null); }}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all",
                activeScenario === i ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-100" : "bg-white border-gray-200 hover:border-indigo-300"
              )}
            >
              <div className="font-medium text-sm text-gray-900">{sc.name}</div>
              <div className="text-xs text-gray-500 mt-1">{sc.nodes.length} 节点 · {sc.edges.length} 关系</div>
            </button>
          ))}
        </div>
      </div>

      {/* Middle: Graph */}
      <div className="flex-1 relative bg-gray-50 overflow-hidden">
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600 font-medium">{scenario.name}</span>
        </div>
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <marker id="iarrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
            </marker>
          </defs>
          {scenario.edges.map((edge, i) => {
            const s = scenario.nodes.find(n => n.id === edge.source);
            const t = scenario.nodes.find(n => n.id === edge.target);
            if (!s || !t) return null;
            return (
              <g key={i}>
                <line x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="#cbd5e1" strokeWidth={1.5} markerEnd="url(#iarrow)" />
                <text x={(s.x + t.x) / 2} y={(s.y + t.y) / 2 - 5} textAnchor="middle" fontSize={9} fill="#64748b">{edge.label}</text>
              </g>
            );
          })}
        </svg>
        {scenario.nodes.map(node => {
          const typeColors: Record<string, string> = { '门店': 'bg-blue-500', '会员': 'bg-violet-500', '促销': 'bg-rose-500', '商品': 'bg-emerald-500', '库存': 'bg-amber-500', '订单': 'bg-cyan-500', '供应商': 'bg-orange-500', '质检': 'bg-slate-500', '退货': 'bg-red-500' };
          return (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node.id)}
              className={cn(
                "absolute px-3 py-2 rounded-lg text-white text-xs font-medium shadow-md transition-all",
                typeColors[node.type] || 'bg-gray-500',
                selectedNode === node.id && "ring-2 ring-offset-2 ring-gray-400 scale-110"
              )}
              style={{ left: node.x - 40, top: node.y - 16 }}
            >
              {node.label}
            </button>
          );
        })}
      </div>

      {/* Right: Node Detail */}
      <div className="w-72 border-l border-gray-200 bg-white flex flex-col">
        {selectedNode ? (
          (() => {
            const node = scenario.nodes.find(n => n.id === selectedNode);
            if (!node) return null;
            const details: Record<string, Record<string, string>> = {
              'n1': { '类型': '实体门店', 'ID': 'SH-001', '地址': '上海市南京东路800号', '面积': '120㎡', '日均GMV': '¥32,500' },
              'n2': { '类型': 'VIP会员', 'ID': 'M-12847', '等级': '钻石卡', '积分': '15,680', '最近消费': '2025-06-18' },
              'n3': { '类型': '满减活动', 'ID': 'PROMO-618-001', '规则': '满200减50', '预算': '¥200万', '参与门店': '300家' },
              'n4': { '类型': 'SKU', 'ID': 'LYF-001-NUT-500G', '名称': '每日坚果礼盒500g', '售价': '¥128', '成本': '¥72' },
              'n5': { '类型': '仓库库存', 'ID': 'WH-001-STK', '可用': '12,500件', '安全库存': '3,000件', '状态': '充足' },
              'n6': { '类型': '销售订单', 'ID': 'SO-1284', '金额': '¥256.00', '时间': '2025-06-18 14:32', '状态': '已完成' },
            };
            const info = details[node.id] || {};
            return (
              <>
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">{node.label}</h3>
                  <span className="text-xs text-gray-500">{node.type}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-3">
                    {Object.entries(info).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-medium text-gray-900">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            );
          })()
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
            <Sparkles size={40} className="mb-3 opacity-30" />
            <p className="text-sm">点击节点查看实例详情</p>
          </div>
        )}
      </div>
    </div>
  );
}
