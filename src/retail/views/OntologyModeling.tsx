import { useState } from 'react';
import {
  Database, Plus, Search, CheckCircle2, GitMerge, Link2, Layers,
  ChevronRight, ChevronDown, Box, FileText, Terminal, Play,
  Wand2, Save, Server, Table2, Sparkles, ArrowRight, ArrowLeft, Network,
  Activity, ShieldCheck, Wrench, Users, Headset, Truck, FileSpreadsheet, AlertTriangle,
  Trash2, Edit3, X, Info, ShoppingCart, CreditCard, User, Tag, Percent, MapPin
} from 'lucide-react';
import { cn } from '../lib/utils';

type TabKey = 'discovery' | 'mapping' | 'ontology' | 'instances';

// --- Retail Data Sources ---
const DATA_SOURCES = [
  {
    id: 'pos', name: 'POS 销售系统', type: 'mysql', icon: ShoppingCart, color: 'text-blue-500',
    tables: [
      {
        id: 'pos_transaction', name: 'pos_transaction', rows: 8500000, recognizedAs: 'POSTransaction', confidence: 96,
        reasons: ['表名 pos_transaction 匹配POS交易', '包含 txn_time, amount, payment_type'],
        fields: [
          { name: 'txn_id', type: 'varchar(32)', comment: '交易ID' },
          { name: 'pos_id', type: 'varchar(20)', comment: 'POS终端编号' },
          { name: 'store_id', type: 'varchar(20)', comment: '门店ID' },
          { name: 'txn_time', type: 'datetime', comment: '交易时间' },
          { name: 'amount', type: 'decimal(10,2)', comment: '交易金额' },
          { name: 'item_count', type: 'int', comment: '商品件数' },
          { name: 'payment_type', type: 'varchar(20)', comment: '支付方式 (微信/支付宝/现金)' },
        ]
      },
      {
        id: 'pos_daily_summary', name: 'pos_daily_summary', rows: 12000, recognizedAs: 'SalesTarget', confidence: 88,
        reasons: ['表名 pos_daily_summary 匹配日销售汇总', '包含 daily_gmv, daily_orders'],
        fields: [
          { name: 'summary_id', type: 'varchar(32)', comment: '汇总ID' },
          { name: 'store_id', type: 'varchar(20)', comment: '门店ID' },
          { name: 'summary_date', type: 'date', comment: '汇总日期' },
          { name: 'daily_gmv', type: 'decimal(12,2)', comment: '日GMV' },
          { name: 'daily_orders', type: 'int', comment: '日订单数' },
          { name: 'daily_customers', type: 'int', comment: '日客数' },
        ]
      },
    ]
  },
  {
    id: 'erp', name: 'ERP 企业资源计划', type: 'oracle', icon: Database, color: 'text-slate-600',
    tables: [
      {
        id: 'erp_sales_order', name: 'sales_order', rows: 450000, recognizedAs: 'SalesOrder', confidence: 90,
        reasons: ['表名 sales_order 匹配销售订单', '包含 store_id, total_amount, order_date'],
        fields: [
          { name: 'so_id', type: 'varchar(32)', comment: '订单ID' },
          { name: 'so_no', type: 'varchar(50)', comment: '订单编号' },
          { name: 'store_id', type: 'varchar(20)', comment: '门店ID' },
          { name: 'member_id', type: 'varchar(32)', comment: '会员ID' },
          { name: 'total_amount', type: 'decimal(10,2)', comment: '订单总金额' },
          { name: 'discount_amount', type: 'decimal(10,2)', comment: '优惠金额' },
          { name: 'order_date', type: 'datetime', comment: '下单时间' },
        ]
      },
      {
        id: 'erp_inventory_ledger', name: 'inventory_ledger', rows: 120000, recognizedAs: 'Inventory', confidence: 92,
        reasons: ['表名 inventory_ledger 匹配库存台账', '包含 sku_id, qty_on_hand, expiry_date'],
        fields: [
          { name: 'inventory_id', type: 'varchar(32)', comment: '库存ID' },
          { name: 'sku_id', type: 'varchar(32)', comment: 'SKU ID' },
          { name: 'location_type', type: 'varchar(20)', comment: '库位类型 (门店/仓库)' },
          { name: 'location_id', type: 'varchar(20)', comment: '库位ID' },
          { name: 'qty_on_hand', type: 'decimal(10,2)', comment: '在手库存' },
          { name: 'qty_reserved', type: 'decimal(10,2)', comment: '预留库存' },
          { name: 'expiry_date', type: 'date', comment: '保质期' },
        ]
      },
      {
        id: 'erp_member_profile', name: 'member_profile', rows: 8500000, recognizedAs: 'Member', confidence: 95,
        reasons: ['表名 member_profile 匹配会员档案', '包含 phone, tier, lifetime_value'],
        fields: [
          { name: 'member_id', type: 'varchar(32)', comment: '会员ID' },
          { name: 'member_name', type: 'varchar(50)', comment: '会员姓名' },
          { name: 'phone', type: 'varchar(20)', comment: '手机号' },
          { name: 'tier', type: 'varchar(10)', comment: '会员等级' },
          { name: 'register_date', type: 'date', comment: '注册日期' },
          { name: 'total_points', type: 'int', comment: '总积分' },
          { name: 'lifetime_value', type: 'decimal(12,2)', comment: '生命周期价值' },
        ]
      },
    ]
  },
  {
    id: 'wms', name: 'WMS 仓储管理系统', type: 'mysql', icon: Box, color: 'text-teal-500',
    tables: [
      {
        id: 'wms_warehouse_stock', name: 'warehouse_stock', rows: 85000, recognizedAs: 'Inventory', confidence: 94,
        reasons: ['表名 warehouse_stock 匹配仓库库存', '包含 warehouse_id, sku_id, stock_qty'],
        fields: [
          { name: 'stock_id', type: 'varchar(32)', comment: '库存ID' },
          { name: 'warehouse_id', type: 'varchar(20)', comment: '仓库ID' },
          { name: 'sku_id', type: 'varchar(32)', comment: 'SKU ID' },
          { name: 'stock_qty', type: 'decimal(10,2)', comment: '库存数量' },
          { name: 'available_qty', type: 'decimal(10,2)', comment: '可用数量' },
          { name: 'last_update', type: 'datetime', comment: '最后更新' },
        ]
      },
      {
        id: 'wms_distribution_order', name: 'distribution_order', rows: 56000, recognizedAs: 'Distribution', confidence: 91,
        reasons: ['表名 distribution_order 匹配配送单', '包含 store_id, warehouse_id, delivery_date'],
        fields: [
          { name: 'dist_id', type: 'varchar(32)', comment: '配送单ID' },
          { name: 'dist_no', type: 'varchar(50)', comment: '配送单号' },
          { name: 'warehouse_id', type: 'varchar(20)', comment: '发货仓库' },
          { name: 'store_id', type: 'varchar(20)', comment: '目标门店' },
          { name: 'status', type: 'varchar(20)', comment: '状态 (待发货/配送中/已签收)' },
          { name: 'delivery_date', type: 'date', comment: '配送日期' },
        ]
      },
    ]
  },
  {
    id: 'member', name: '会员系统', type: 'postgresql', icon: User, color: 'text-rose-500',
    tables: [
      {
        id: 'mem_member', name: 'member', rows: 8500000, recognizedAs: 'Member', confidence: 98,
        reasons: ['表名 member 强语义匹配', '包含 member_id, phone, tier'],
        fields: [
          { name: 'member_id', type: 'varchar(32)', comment: '会员ID' },
          { name: 'phone', type: 'varchar(20)', comment: '手机号' },
          { name: 'tier', type: 'varchar(10)', comment: '会员等级' },
          { name: 'register_channel', type: 'varchar(20)', comment: '注册渠道' },
          { name: 'last_purchase_date', type: 'date', comment: '最近购买日期' },
        ]
      },
      {
        id: 'mem_promotion', name: 'promotion', rows: 1200, recognizedAs: 'Promotion', confidence: 93,
        reasons: ['表名 promotion 匹配促销活动', '包含 promo_type, start_date, budget'],
        fields: [
          { name: 'promo_id', type: 'varchar(32)', comment: '活动ID' },
          { name: 'promo_name', type: 'varchar(100)', comment: '活动名称' },
          { name: 'promo_type', type: 'varchar(20)', comment: '活动类型 (满减/折扣/赠品)' },
          { name: 'start_date', type: 'date', comment: '开始日期' },
          { name: 'end_date', type: 'date', comment: '结束日期' },
          { name: 'budget', type: 'decimal(12,2)', comment: '活动预算' },
        ]
      },
      {
        id: 'mem_coupon', name: 'coupon', rows: 450000, recognizedAs: 'Coupon', confidence: 95,
        reasons: ['表名 coupon 匹配优惠券', '包含 coupon_type, discount_value, valid_to'],
        fields: [
          { name: 'coupon_id', type: 'varchar(32)', comment: '优惠券ID' },
          { name: 'coupon_code', type: 'varchar(50)', comment: '券码' },
          { name: 'coupon_type', type: 'varchar(20)', comment: '券类型' },
          { name: 'discount_value', type: 'decimal(10,2)', comment: '优惠金额' },
          { name: 'min_order_amount', type: 'decimal(10,2)', comment: '最低消费金额' },
          { name: 'valid_to', type: 'date', comment: '有效期至' },
        ]
      },
    ]
  },
  {
    id: 'crm', name: 'CRM 客户关系系统', type: 'rest', icon: Users, color: 'text-indigo-500',
    tables: [
      {
        id: 'crm_customer_feedback', name: 'customer_feedback', rows: 56000, recognizedAs: 'CustomerFeedback', confidence: 90,
        reasons: ['接口名 customer_feedback 匹配客户反馈', '包含 feedback_type, satisfaction_score'],
        fields: [
          { name: 'feedback_id', type: 'string', comment: '反馈ID' },
          { name: 'member_id', type: 'string', comment: '会员ID' },
          { name: 'store_id', type: 'string', comment: '门店ID' },
          { name: 'feedback_type', type: 'string', comment: '反馈类型 (投诉/建议/表扬)' },
          { name: 'satisfaction_score', type: 'int', comment: '满意度评分 (1-5)' },
          { name: 'create_time', type: 'datetime', comment: '创建时间' },
        ]
      },
      {
        id: 'crm_campaign_effect', name: 'campaign_effect', rows: 8900, recognizedAs: 'CampaignEffect', confidence: 88,
        reasons: ['接口名 campaign_effect 匹配活动效果', '包含 campaign_id, conversion_rate, roi'],
        fields: [
          { name: 'campaign_id', type: 'string', comment: '活动ID' },
          { name: 'reach_count', type: 'int', comment: '触达人数' },
          { name: 'conversion_count', type: 'int', comment: '转化人数' },
          { name: 'conversion_rate', type: 'decimal(5,2)', comment: '转化率%' },
          { name: 'roi', type: 'decimal(5,2)', comment: 'ROI' },
        ]
      },
    ]
  },
];

// Templates based on retail ontology
const TEMPLATES = [
  {
    id: 'tpl_store', name: '门店模板', category: '门店域',
    structure: `{\n  "entity": "Store",\n  "attributes": [\n    "store_id", \n    "store_code", \n    "store_name",\n    "area_sqm",\n    "open_date"\n  ],\n  "relations": [\n    {"type": "belongs_to", "target": "Region"},\n    {"type": "belongs_to", "target": "City"}\n  ],\n  "behaviors": [\n    "calculate_revenue_per_sqm"\n  ]\n}`,
    mappings: [
      { source: 'store_id', target: 'store_id', status: 'mapped', auto: true },
      { source: 'store_code', target: 'store_code', status: 'mapped', auto: true },
      { source: 'store_name', target: 'store_name', status: 'mapped', auto: true },
    ]
  },
  {
    id: 'tpl_product', name: '商品模板', category: '商品域',
    structure: `{\n  "entity": "Product",\n  "attributes": [\n    "product_id", \n    "product_code", \n    "product_name",\n    "unit_price",\n    "cost_price",\n    "shelf_life_days"\n  ],\n  "relations": [\n    {"type": "belongs_to", "target": "Category"},\n    {"type": "belongs_to", "target": "Brand"}\n  ],\n  "behaviors": [\n    "calculate_margin"\n  ]\n}`,
    mappings: [
      { source: 'product_id', target: 'product_id', status: 'mapped', auto: true },
      { source: 'product_code', target: 'product_code', status: 'mapped', auto: true },
      { source: 'product_name', target: 'product_name', status: 'mapped', auto: true },
    ]
  },
  {
    id: 'tpl_member', name: '会员模板', category: '会员域',
    structure: `{\n  "entity": "Member",\n  "attributes": [\n    "member_id", \n    "member_name", \n    "phone",\n    "tier",\n    "lifetime_value"\n  ],\n  "relations": [\n    {"type": "places", "target": "SalesOrder"},\n    {"type": "receives", "target": "Promotion"}\n  ],\n  "behaviors": [\n    "calculate_churn_risk"\n  ]\n}`,
    mappings: [
      { source: 'member_id', target: 'member_id', status: 'mapped', auto: true },
      { source: 'phone', target: 'phone', status: 'mapped', auto: true },
      { source: 'tier', target: 'tier', status: 'mapped', auto: true },
    ]
  },
  {
    id: 'tpl_sales_order', name: '销售订单模板', category: '销售域',
    structure: `{\n  "entity": "SalesOrder",\n  "attributes": [\n    "so_id", \n    "store_id", \n    "member_id",\n    "total_amount",\n    "order_date"\n  ],\n  "relations": [\n    {"type": "from", "target": "Store"},\n    {"type": "by", "target": "Member"}\n  ],\n  "behaviors": [\n    "track_sales_trend"\n  ]\n}`,
    mappings: [
      { source: 'so_id', target: 'so_id', status: 'mapped', auto: true },
      { source: 'store_id', target: 'store_id', status: 'mapped', auto: true },
      { source: 'total_amount', target: 'total_amount', status: 'mapped', auto: true },
    ]
  },
  {
    id: 'tpl_inventory', name: '库存模板', category: '供应链域',
    structure: `{\n  "entity": "Inventory",\n  "attributes": [\n    "inventory_id", \n    "sku_id", \n    "qty_on_hand",\n    "qty_reserved",\n    "expiry_date"\n  ],\n  "relations": [\n    {"type": "belongs_to", "target": "SKU"},\n    {"type": "stored_in", "target": "Warehouse"}\n  ],\n  "behaviors": [\n    "check_stock_alert"\n  ]\n}`,
    mappings: [
      { source: 'sku_id', target: 'sku_id', status: 'mapped', auto: true },
      { source: 'qty_on_hand', target: 'qty_on_hand', status: 'mapped', auto: true },
      { source: 'expiry_date', target: 'expiry_date', status: 'mapped', auto: true },
    ]
  },
  {
    id: 'tpl_promotion', name: '促销模板', category: '会员域',
    structure: `{\n  "entity": "Promotion",\n  "attributes": [\n    "promo_id", \n    "promo_name", \n    "promo_type",\n    "start_date",\n    "budget"\n  ],\n  "relations": [\n    {"type": "targets", "target": "Member"},\n    {"type": "applies_to", "target": "SKU"}\n  ],\n  "behaviors": [\n    "evaluate_roi"\n  ]\n}`,
    mappings: [
      { source: 'promo_id', target: 'promo_id', status: 'mapped', auto: true },
      { source: 'promo_name', target: 'promo_name', status: 'mapped', auto: true },
      { source: 'budget', target: 'budget', status: 'mapped', auto: true },
    ]
  },
];

// Ontology library from constants
const ONTOLOGY_DOMAINS = [
  {
    id: 'store',
    name: '门店域',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    entities: ['Store', 'Region', 'City', 'StoreManager'],
    description: '门店、区域、城市等空间组织实体'
  },
  {
    id: 'product',
    name: '商品域',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    entities: ['Product', 'SKU', 'Category', 'Brand'],
    description: '商品、SKU、品类、品牌等商品实体'
  },
  {
    id: 'supply',
    name: '供应链域',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    entities: ['Supplier', 'Warehouse', 'Distribution', 'Inventory', 'PurchaseOrder'],
    description: '供应商、仓库、配送、库存等供应链实体'
  },
  {
    id: 'member',
    name: '会员域',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    entities: ['Member', 'Promotion', 'Coupon'],
    description: '会员、促销、优惠券等会员营销实体'
  },
  {
    id: 'sales',
    name: '销售域',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    entities: ['SalesOrder', 'POSTransaction', 'SalesTarget'],
    description: '销售订单、POS交易、销售目标等销售实体'
  },
];

export default function OntologyModeling() {
  const [activeTab, setActiveTab] = useState<TabKey>('discovery');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const tabs: { id: TabKey; label: string; icon: any }[] = [
    { id: 'discovery', label: '数据源发现', icon: Database },
    { id: 'mapping', label: '本体映射', icon: GitMerge },
    { id: 'ontology', label: '本体库', icon: Layers },
    { id: 'instances', label: '实例管理', icon: Box },
  ];

  const currentSource = DATA_SOURCES.find(s => s.id === selectedSource);
  const currentTable = currentSource?.tables.find(t => t.id === selectedTable);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-slate-200">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 text-sm text-slate-600">
          <Network size={16} className="text-slate-400" />
          <span className="font-medium text-slate-900">Ontology Studio</span>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 text-white flex items-center justify-center">
                <Layers size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">本体建模</h1>
                <p className="text-sm text-slate-500">零售数据源发现与本体映射</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 px-4 border-t border-slate-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-t-2 transition-colors",
                  activeTab === tab.id
                    ? "border-slate-800 text-slate-900"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-slate-50">
        {/* Discovery Tab */}
        {activeTab === 'discovery' && (
          <div className="flex h-full">
            {/* Left: Data Sources */}
            <div className="w-72 border-r border-slate-200 bg-white flex flex-col shrink-0">
              <div className="p-3 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="搜索数据源..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 w-full border border-slate-200 text-sm focus:outline-none focus:border-slate-400 rounded"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {DATA_SOURCES.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((source) => (
                  <div key={source.id}>
                    <button
                      onClick={() => { setSelectedSource(source.id); setSelectedTable(null); }}
                      className={cn(
                        "w-full p-3 text-left rounded-lg border transition-all",
                        selectedSource === source.id
                          ? "bg-slate-50 border-slate-300"
                          : "border-transparent hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <source.icon size={18} className={source.color} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900">{source.name}</div>
                          <div className="text-xs text-slate-500">{source.type} · {source.tables.length} 张表</div>
                        </div>
                      </div>
                    </button>
                    {selectedSource === source.id && (
                      <div className="ml-6 mt-1 space-y-1">
                        {source.tables.map((table) => (
                          <button
                            key={table.id}
                            onClick={() => setSelectedTable(table.id)}
                            className={cn(
                              "w-full p-2 text-left text-xs rounded border transition-all flex items-center gap-2",
                              selectedTable === table.id
                                ? "bg-sky-50 border-sky-200 text-sky-700"
                                : "border-transparent hover:bg-slate-50 text-slate-600"
                            )}
                          >
                            <Table2 size={12} />
                            <span className="font-mono">{table.name}</span>
                            <span className="ml-auto text-[10px] text-slate-400">{table.rows.toLocaleString()} 行</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Table Detail */}
            <div className="flex-1 p-6 overflow-y-auto">
              {currentTable ? (
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 font-mono">{currentTable.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded">
                          识别为: {currentTable.recognizedAs}
                        </span>
                        <span className="text-xs text-slate-500">置信度: {currentTable.confidence}%</span>
                        <span className="text-xs text-slate-400">{currentTable.rows.toLocaleString()} 行</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm hover:bg-slate-50 rounded flex items-center gap-2">
                        <Wand2 size={14} />
                        自动映射
                      </button>
                      <button className="px-3 py-1.5 bg-slate-800 text-white text-sm hover:bg-slate-700 rounded flex items-center gap-2">
                        <Save size={14} />
                        保存映射
                      </button>
                    </div>
                  </div>

                  {/* Recognition Reasons */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                    <div className="flex items-center gap-2 text-xs text-amber-800">
                      <Sparkles size={14} />
                      <span className="font-semibold">识别依据:</span>
                      {currentTable.reasons.map((r, i) => (
                        <span key={i}>{r}{i < currentTable.reasons.length - 1 ? '；' : ''}</span>
                      ))}
                    </div>
                  </div>

                  {/* Fields Table */}
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">字段名</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">类型</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">注释</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">映射状态</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentTable.fields.map((field, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono text-slate-900 text-xs">{field.name}</td>
                            <td className="px-4 py-3 text-slate-600 text-xs">{field.type}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{field.comment}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded">
                                已映射
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <Database size={48} className="mx-auto mb-4 opacity-30" />
                    <p>选择左侧数据源和表查看详情</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mapping Tab */}
        {activeTab === 'mapping' && (
          <div className="max-w-6xl mx-auto p-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Templates */}
              <div className="bg-white border border-slate-200 rounded-lg">
                <div className="px-4 py-3 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">映射模板</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={cn(
                        "w-full p-3 text-left hover:bg-slate-50 transition-colors",
                        selectedTemplate === tpl.id && "bg-sky-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-slate-500" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">{tpl.name}</div>
                          <div className="text-xs text-slate-500">{tpl.category}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Detail */}
              <div className="col-span-2">
                {selectedTemplate ? (
                  <div className="bg-white border border-slate-200 rounded-lg p-6">
                    {(() => {
                      const tpl = TEMPLATES.find(t => t.id === selectedTemplate)!;
                      return (
                        <>
                          <h3 className="text-lg font-bold text-slate-900 mb-4">{tpl.name}</h3>
                          <div className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto mb-6">
                            <pre className="text-sm font-mono">{tpl.structure}</pre>
                          </div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-3">字段映射</h4>
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                              <tr>
                                <th className="px-4 py-2 text-left font-semibold text-slate-700">源字段</th>
                                <th className="px-4 py-2 text-left font-semibold text-slate-700">目标属性</th>
                                <th className="px-4 py-2 text-left font-semibold text-slate-700">状态</th>
                                <th className="px-4 py-2 text-left font-semibold text-slate-700">方式</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {tpl.mappings.map((m, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                  <td className="px-4 py-2 font-mono text-xs text-slate-600">{m.source}</td>
                                  <td className="px-4 py-2 font-mono text-xs text-slate-900">{m.target}</td>
                                  <td className="px-4 py-2">
                                    <span className={cn(
                                      "px-2 py-0.5 text-xs rounded",
                                      m.status === 'mapped'
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-amber-100 text-amber-700"
                                    )}>
                                      {m.status === 'mapped' ? '已映射' : '待映射'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 text-xs text-slate-500">
                                    {m.auto ? '自动' : '手动'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-400">
                    <GitMerge size={48} className="mx-auto mb-4 opacity-30" />
                    <p>选择左侧模板查看映射详情</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ontology Tab */}
        {activeTab === 'ontology' && (
          <div className="max-w-6xl mx-auto p-6">
            <div className="grid grid-cols-1 gap-4">
              {ONTOLOGY_DOMAINS.map((domain) => (
                <div key={domain.id} className={cn("bg-white border rounded-lg p-5", domain.color.replace('text-', 'border-').replace('700', '200'))}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Layers size={20} className={domain.color.split(' ')[1]} />
                      <div>
                        <h3 className="font-bold text-slate-900">{domain.name}</h3>
                        <p className="text-xs text-slate-500">{domain.description}</p>
                      </div>
                    </div>
                    <span className={cn("px-2 py-1 text-xs font-medium rounded", domain.color.split(' ')[0], domain.color.split(' ')[1])}>
                      {domain.entities.length} 个实体
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {domain.entities.map((entity) => (
                      <span
                        key={entity}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:border-slate-400 transition-colors cursor-pointer"
                      >
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instances Tab */}
        {activeTab === 'instances' && (
          <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-400">
              <Box size={48} className="mx-auto mb-4 opacity-30" />
              <p>实例管理功能开发中</p>
              <p className="text-xs mt-2">将支持门店实例、商品实例、会员实例的CRUD操作</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
