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
import RETAIL_ONTOLOGY_LIBRARY from '../constants/ontology';
import type { Ontology } from '../constants/ontology';

/* ------------------------------------------------------------------ */
/*  Domain meta                                                        */
/* ------------------------------------------------------------------ */

const DOMAIN_META: Record<string, { color: string; bg: string; border: string; text: string; icon: React.ReactNode }> = {
  门店域: { color: 'blue',   bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   icon: <Building2 size={14} /> },
  商品域: { color: 'emerald',bg: 'bg-emerald-50',border: 'border-emerald-200',text: 'text-emerald-700',icon: <Package size={14} /> },
  供应链域:{ color: 'amber',  bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  icon: <Truck size={14} /> },
  会员域: { color: 'violet', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', icon: <Users size={14} /> },
  销售域: { color: 'cyan',   bg: 'bg-cyan-50',   border: 'border-cyan-200',   text: 'text-cyan-700',   icon: <ShoppingCart size={14} /> },
  营销域: { color: 'rose',   bg: 'bg-rose-50',   border: 'border-rose-200',   text: 'text-rose-700',   icon: <Megaphone size={14} /> },
  财务域: { color: 'slate',  bg: 'bg-slate-50',  border: 'border-slate-200',  text: 'text-slate-700',  icon: <Calculator size={14} /> },
  竞品域: { color: 'orange', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: <Target size={14} /> },
};

const DOMAIN_ORDER = ['门店域','商品域','供应链域','会员域','销售域','营销域','财务域','竞品域'];

/* ------------------------------------------------------------------ */
/*  Data Sources                                                       */
/* ------------------------------------------------------------------ */

const DATA_SOURCES = [
  {
    name: 'POS系统', type: 'mysql',
    tables: [
      { name: 'pos_transaction', rows: '2.4M', entity: 'POSTransaction', conf: 96,
        fields: [
          { name: 'transaction_id', type: 'varchar(32)', comment: '交易流水号' },
          { name: 'store_id', type: 'varchar(16)', comment: '门店编码', ontology: 'Store' },
          { name: 'sku_id', type: 'varchar(16)', comment: 'SKU编码', ontology: 'SKU' },
          { name: 'amount', type: 'decimal(10,2)', comment: '交易金额' },
          { name: 'pay_time', type: 'datetime', comment: '支付时间' },
          { name: 'member_id', type: 'varchar(16)', comment: '会员ID', ontology: 'Member' },
          { name: 'payment_method', type: 'varchar(20)', comment: '支付方式' },
          { name: 'discount_amount', type: 'decimal(10,2)', comment: '折扣金额' },
        ]
      },
      { name: 'pos_daily_summary', rows: '45K', entity: 'SalesTarget', conf: 78,
        fields: [
          { name: 'summary_date', type: 'date', comment: '汇总日期' },
          { name: 'store_id', type: 'varchar(16)', comment: '门店编码', ontology: 'Store' },
          { name: 'total_amount', type: 'decimal(12,2)', comment: '日销售总额' },
          { name: 'transaction_count', type: 'int', comment: '交易笔数' },
          { name: 'avg_ticket', type: 'decimal(8,2)', comment: '客单价' },
          { name: 'member_txn_ratio', type: 'decimal(4,2)', comment: '会员交易占比' },
          { name: 'return_amount', type: 'decimal(10,2)', comment: '退货金额' },
          { name: 'create_time', type: 'datetime', comment: '创建时间' },
        ]
      },
      { name: 'member_checkin', rows: '890K', entity: 'MemberBehavior', conf: 88,
        fields: [
          { name: 'checkin_id', type: 'varchar(32)', comment: '签到ID' },
          { name: 'member_id', type: 'varchar(16)', comment: '会员ID', ontology: 'Member' },
          { name: 'store_id', type: 'varchar(16)', comment: '门店编码', ontology: 'Store' },
          { name: 'checkin_time', type: 'datetime', comment: '签到时间' },
          { name: 'checkin_type', type: 'varchar(20)', comment: '签到类型' },
          { name: 'points_earned', type: 'int', comment: '获得积分' },
          { name: 'device_id', type: 'varchar(32)', comment: '设备ID' },
          { name: 'location_lat', type: 'decimal(10,6)', comment: '纬度' },
        ]
      },
    ]
  },
  {
    name: 'ERP系统', type: 'oracle',
    tables: [
      { name: 'sales_order', rows: '1.8M', entity: 'SalesOrder', conf: 94,
        fields: [
          { name: 'order_id', type: 'varchar(32)', comment: '订单编号' },
          { name: 'store_id', type: 'varchar(16)', comment: '门店编码', ontology: 'Store' },
          { name: 'member_id', type: 'varchar(16)', comment: '会员ID', ontology: 'Member' },
          { name: 'order_amount', type: 'number(12,2)', comment: '订单金额' },
          { name: 'order_status', type: 'varchar(10)', comment: '订单状态' },
          { name: 'order_channel', type: 'varchar(20)', comment: '下单渠道' },
          { name: 'delivery_type', type: 'varchar(20)', comment: '配送方式' },
          { name: 'create_time', type: 'date', comment: '创建时间' },
        ]
      },
      { name: 'inventory_ledger', rows: '5.2M', entity: 'Inventory', conf: 92,
        fields: [
          { name: 'ledger_id', type: 'varchar(32)', comment: '台账ID' },
          { name: 'sku_id', type: 'varchar(16)', comment: 'SKU编码', ontology: 'SKU' },
          { name: 'warehouse_id', type: 'varchar(16)', comment: '仓库编码', ontology: 'Warehouse' },
          { name: 'quantity', type: 'number(10)', comment: '库存数量' },
          { name: 'last_update', type: 'date', comment: '最后更新' },
          { name: 'batch_no', type: 'varchar(50)', comment: '批次号' },
          { name: 'safety_stock', type: 'int', comment: '安全库存' },
          { name: 'abc_class', type: 'varchar(5)', comment: 'ABC分类' },
        ]
      },
      { name: 'purchase_order', rows: '320K', entity: 'PurchaseOrder', conf: 95,
        fields: [
          { name: 'po_id', type: 'varchar(32)', comment: '采购单号' },
          { name: 'supplier_id', type: 'varchar(16)', comment: '供应商编码', ontology: 'Supplier' },
          { name: 'sku_id', type: 'varchar(16)', comment: 'SKU编码', ontology: 'SKU' },
          { name: 'quantity', type: 'number(10)', comment: '采购数量' },
          { name: 'po_status', type: 'varchar(10)', comment: '采购状态' },
          { name: 'expected_date', type: 'date', comment: '预计到货日' },
          { name: 'buyer_id', type: 'varchar(32)', comment: '采购员ID' },
          { name: 'approval_status', type: 'varchar(20)', comment: '审批状态' },
        ]
      },
      { name: 'settlement', rows: '120K', entity: 'Settlement', conf: 89,
        fields: [
          { name: 'settlement_id', type: 'varchar(32)', comment: '结算单号' },
          { name: 'store_id', type: 'varchar(16)', comment: '门店编码', ontology: 'Store' },
          { name: 'settlement_amount', type: 'number(12,2)', comment: '结算金额' },
          { name: 'settlement_date', type: 'date', comment: '结算日期' },
          { name: 'settle_type', type: 'varchar(20)', comment: '结算类型' },
          { name: 'invoice_no', type: 'varchar(50)', comment: '发票号' },
          { name: 'tax_amount', type: 'decimal(10,2)', comment: '税额' },
          { name: 'pay_date', type: 'date', comment: '付款日期' },
        ]
      },
    ]
  },
  {
    name: 'WMS系统', type: 'mysql',
    tables: [
      { name: 'warehouse_stock', rows: '1.1M', entity: 'Inventory', conf: 93,
        fields: [
          { name: 'stock_id', type: 'varchar(32)', comment: '库存ID' },
          { name: 'warehouse_id', type: 'varchar(16)', comment: '仓库编码', ontology: 'Warehouse' },
          { name: 'sku_id', type: 'varchar(16)', comment: 'SKU编码', ontology: 'SKU' },
          { name: 'stock_qty', type: 'int', comment: '库存数量' },
          { name: 'safety_stock', type: 'int', comment: '安全库存' },
          { name: 'available_qty', type: 'int', comment: '可用数量' },
          { name: 'zone_code', type: 'varchar(20)', comment: '库区编码' },
          { name: 'last_count_date', type: 'date', comment: '最后盘点日' },
        ]
      },
      { name: 'distribution_order', rows: '280K', entity: 'Distribution', conf: 91,
        fields: [
          { name: 'dist_id', type: 'varchar(32)', comment: '配送单号' },
          { name: 'from_warehouse', type: 'varchar(16)', comment: '出库仓库', ontology: 'Warehouse' },
          { name: 'to_store', type: 'varchar(16)', comment: '目标门店', ontology: 'Store' },
          { name: 'dist_status', type: 'varchar(10)', comment: '配送状态' },
          { name: 'plan_date', type: 'date', comment: '计划配送日' },
          { name: 'actual_date', type: 'date', comment: '实际配送日' },
          { name: 'carrier_id', type: 'varchar(32)', comment: '承运商ID' },
          { name: 'temperature', type: 'decimal(4,1)', comment: '运输温度' },
        ]
      },
      { name: 'quality_check_record', rows: '65K', entity: 'QualityCheck', conf: 90,
        fields: [
          { name: 'qc_id', type: 'varchar(32)', comment: '质检编号' },
          { name: 'sku_id', type: 'varchar(16)', comment: 'SKU编码', ontology: 'SKU' },
          { name: 'supplier_id', type: 'varchar(16)', comment: '供应商编码', ontology: 'Supplier' },
          { name: 'qc_result', type: 'varchar(10)', comment: '质检结果' },
          { name: 'qc_type', type: 'varchar(20)', comment: '质检类型' },
          { name: 'inspector_id', type: 'varchar(32)', comment: '质检员ID' },
          { name: 'sample_size', type: 'int', comment: '抽样数量' },
          { name: 'defect_count', type: 'int', comment: '缺陷数量' },
        ]
      },
    ]
  },
  {
    name: '会员系统', type: 'postgres',
    tables: [
      { name: 'member', rows: '3.6M', entity: 'Member', conf: 98,
        fields: [
          { name: 'member_id', type: 'varchar(16)', comment: '会员ID' },
          { name: 'member_name', type: 'varchar(50)', comment: '会员姓名' },
          { name: 'phone', type: 'varchar(20)', comment: '手机号' },
          { name: 'register_date', type: 'date', comment: '注册日期' },
          { name: 'member_level', type: 'varchar(10)', comment: '会员等级' },
          { name: 'birth_date', type: 'date', comment: '生日' },
          { name: 'gender', type: 'varchar(5)', comment: '性别' },
          { name: 'city', type: 'varchar(50)', comment: '所在城市' },
        ]
      },
      { name: 'promotion', rows: '12K', entity: 'Promotion', conf: 95,
        fields: [
          { name: 'promo_id', type: 'varchar(16)', comment: '促销编码' },
          { name: 'promo_name', type: 'varchar(100)', comment: '促销名称' },
          { name: 'promo_type', type: 'varchar(20)', comment: '促销类型' },
          { name: 'start_date', type: 'date', comment: '开始日期' },
          { name: 'end_date', type: 'date', comment: '结束日期' },
          { name: 'budget', type: 'decimal(12,2)', comment: '活动预算' },
          { name: 'target_group', type: 'varchar(50)', comment: '目标人群' },
          { name: 'status', type: 'varchar(20)', comment: '活动状态' },
        ]
      },
      { name: 'coupon', rows: '480K', entity: 'Coupon', conf: 94,
        fields: [
          { name: 'coupon_id', type: 'varchar(32)', comment: '券编号' },
          { name: 'member_id', type: 'varchar(16)', comment: '会员ID', ontology: 'Member' },
          { name: 'coupon_type', type: 'varchar(20)', comment: '券类型' },
          { name: 'face_value', type: 'decimal(10,2)', comment: '面值' },
          { name: 'expire_date', type: 'date', comment: '过期日期' },
          { name: 'min_order_amount', type: 'decimal(10,2)', comment: '最低消费额' },
          { name: 'usage_limit', type: 'int', comment: '使用次数限制' },
          { name: 'used_count', type: 'int', comment: '已使用次数' },
        ]
      },
      { name: 'member_tag', rows: '2.1M', entity: 'MemberTag', conf: 87,
        fields: [
          { name: 'tag_id', type: 'varchar(16)', comment: '标签ID' },
          { name: 'member_id', type: 'varchar(16)', comment: '会员ID', ontology: 'Member' },
          { name: 'tag_name', type: 'varchar(50)', comment: '标签名称' },
          { name: 'tag_category', type: 'varchar(20)', comment: '标签分类' },
          { name: 'tag_value', type: 'varchar(100)', comment: '标签值' },
          { name: 'score', type: 'decimal(5,2)', comment: '标签得分' },
          { name: 'update_time', type: 'datetime', comment: '更新时间' },
          { name: 'source', type: 'varchar(30)', comment: '标签来源' },
        ]
      },
      { name: 'loyalty_program', rows: '8K', entity: 'LoyaltyProgram', conf: 85,
        fields: [
          { name: 'program_id', type: 'varchar(16)', comment: '计划ID' },
          { name: 'program_name', type: 'varchar(100)', comment: '计划名称' },
          { name: 'points_rule', type: 'json', comment: '积分规则' },
          { name: 'member_id', type: 'varchar(16)', comment: '会员ID', ontology: 'Member' },
          { name: 'points_balance', type: 'int', comment: '积分余额' },
          { name: 'tier', type: 'varchar(10)', comment: '当前等级' },
          { name: 'lifetime_points', type: 'int', comment: '累计积分' },
          { name: 'expire_date', type: 'date', comment: '积分过期日' },
        ]
      },
    ]
  },
  {
    name: 'CRM系统', type: 'rest',
    tables: [
      { name: 'customer_feedback', rows: '156K', entity: 'ProductReview', conf: 76,
        fields: [
          { name: 'feedback_id', type: 'string', comment: '反馈ID' },
          { name: 'member_id', type: 'string', comment: '会员ID', ontology: 'Member' },
          { name: 'sku_id', type: 'string', comment: 'SKU编码', ontology: 'SKU' },
          { name: 'rating', type: 'int', comment: '评分' },
          { name: 'content', type: 'string', comment: '反馈内容' },
          { name: 'feedback_type', type: 'varchar(20)', comment: '反馈类型' },
          { name: 'store_id', type: 'varchar(32)', comment: '门店ID' },
          { name: 'reply_status', type: 'varchar(20)', comment: '回复状态' },
        ]
      },
      { name: 'campaign_effect', rows: '34K', entity: 'AdCampaign', conf: 82,
        fields: [
          { name: 'campaign_id', type: 'string', comment: '活动ID' },
          { name: 'impressions', type: 'int', comment: '曝光量' },
          { name: 'clicks', type: 'int', comment: '点击量' },
          { name: 'conversions', type: 'int', comment: '转化量' },
          { name: 'cost', type: 'decimal(12,2)', comment: '投放成本' },
          { name: 'roi', type: 'decimal(5,2)', comment: 'ROI' },
          { name: 'click_rate', type: 'decimal(5,4)', comment: '点击率' },
          { name: 'conversion_rate', type: 'decimal(5,4)', comment: '转化率' },
        ]
      },
      { name: 'member_behavior', rows: '5.8M', entity: 'MemberBehavior', conf: 90,
        fields: [
          { name: 'behavior_id', type: 'string', comment: '行为ID' },
          { name: 'member_id', type: 'string', comment: '会员ID', ontology: 'Member' },
          { name: 'behavior_type', type: 'string', comment: '行为类型' },
          { name: 'behavior_time', type: 'datetime', comment: '行为时间' },
          { name: 'channel', type: 'varchar(20)', comment: '行为渠道' },
          { name: 'device_type', type: 'varchar(20)', comment: '设备类型' },
          { name: 'session_id', type: 'varchar(32)', comment: '会话ID' },
          { name: 'page_url', type: 'varchar(200)', comment: '页面URL' },
        ]
      },
    ]
  },
  {
    name: 'BI系统', type: 'clickhouse',
    tables: [
      { name: 'sales_anomaly', rows: '23K', entity: 'SalesAnomaly', conf: 88,
        fields: [
          { name: 'anomaly_id', type: 'String', comment: '异常ID' },
          { name: 'store_id', type: 'String', comment: '门店编码', ontology: 'Store' },
          { name: 'sku_id', type: 'String', comment: 'SKU编码', ontology: 'SKU' },
          { name: 'anomaly_type', type: 'String', comment: '异常类型' },
          { name: 'anomaly_score', type: 'Float64', comment: '异常分数' },
          { name: 'detect_time', type: 'datetime', comment: '检测时间' },
          { name: 'metric_value', type: 'decimal(12,2)', comment: '指标值' },
          { name: 'threshold', type: 'decimal(12,2)', comment: '阈值' },
        ]
      },
      { name: 'demand_forecast', rows: '180K', entity: 'DemandForecast', conf: 85,
        fields: [
          { name: 'forecast_id', type: 'String', comment: '预测ID' },
          { name: 'sku_id', type: 'String', comment: 'SKU编码', ontology: 'SKU' },
          { name: 'store_id', type: 'String', comment: '门店编码', ontology: 'Store' },
          { name: 'forecast_qty', type: 'Int64', comment: '预测销量' },
          { name: 'forecast_date', type: 'Date', comment: '预测日期' },
          { name: 'horizon_days', type: 'int', comment: '预测周期(天)' },
          { name: 'model_version', type: 'varchar(20)', comment: '模型版本' },
          { name: 'mape', type: 'decimal(5,2)', comment: 'MAPE误差率' },
        ]
      },
      { name: 'competitor_price', rows: '420K', entity: 'MarketPrice', conf: 86,
        fields: [
          { name: 'record_id', type: 'String', comment: '记录ID' },
          { name: 'competitor_id', type: 'String', comment: '竞品ID', ontology: 'Competitor' },
          { name: 'sku_id', type: 'String', comment: 'SKU编码', ontology: 'SKU' },
          { name: 'market_price', type: 'Float64', comment: '市场价格' },
          { name: 'record_date', type: 'Date', comment: '记录日期' },
          { name: 'competitor_name', type: 'varchar(50)', comment: '竞品名称' },
          { name: 'platform', type: 'varchar(30)', comment: '采集平台' },
          { name: 'price_diff_pct', type: 'decimal(5,2)', comment: '价差百分比' },
        ]
      },
    ]
  },
  {
    name: '外卖平台API', type: 'rest',
    tables: [
      { name: 'platform_order', rows: '3.2M', entity: 'PlatformOrder', conf: 93,
        fields: [
          { name: 'platform_order_id', type: 'varchar(32)', comment: '平台订单ID' },
          { name: 'platform_type', type: 'varchar(20)', comment: '平台类型' },
          { name: 'store_id', type: 'varchar(32)', comment: '门店ID' },
          { name: 'customer_phone', type: 'varchar(20)', comment: '顾客手机号' },
          { name: 'order_amount', type: 'decimal(10,2)', comment: '订单金额' },
          { name: 'delivery_fee', type: 'decimal(8,2)', comment: '配送费' },
          { name: 'platform_fee', type: 'decimal(8,2)', comment: '平台佣金' },
          { name: 'order_time', type: 'datetime', comment: '下单时间' },
        ]
      },
      { name: 'platform_review', rows: '1.8M', entity: 'PlatformReview', conf: 87,
        fields: [
          { name: 'review_id', type: 'varchar(32)', comment: '评价ID' },
          { name: 'platform_order_id', type: 'varchar(32)', comment: '平台订单ID' },
          { name: 'rating', type: 'int', comment: '评分' },
          { name: 'review_content', type: 'text', comment: '评价内容' },
          { name: 'review_time', type: 'datetime', comment: '评价时间' },
          { name: 'reply_content', type: 'text', comment: '回复内容' },
          { name: 'has_image', type: 'int', comment: '是否有图' },
          { name: 'sentiment_score', type: 'decimal(4,2)', comment: '情感得分' },
        ]
      },
      { name: 'platform_promo', rows: '120K', entity: 'PlatformPromotion', conf: 89,
        fields: [
          { name: 'promo_id', type: 'varchar(32)', comment: '活动ID' },
          { name: 'platform_type', type: 'varchar(20)', comment: '平台类型' },
          { name: 'promo_name', type: 'varchar(100)', comment: '活动名称' },
          { name: 'discount_type', type: 'varchar(20)', comment: '优惠类型' },
          { name: 'discount_value', type: 'decimal(8,2)', comment: '优惠金额' },
          { name: 'start_time', type: 'datetime', comment: '开始时间' },
          { name: 'end_time', type: 'datetime', comment: '结束时间' },
          { name: 'participation_fee', type: 'decimal(8,2)', comment: '参与费用' },
        ]
      },
    ]
  },
  {
    name: '智能秤IoT', type: 'mqtt',
    tables: [
      { name: 'scale_weight_data', rows: '5.6亿', entity: 'ScaleWeightData', conf: 91,
        fields: [
          { name: 'data_id', type: 'varchar(32)', comment: '数据ID' },
          { name: 'device_id', type: 'varchar(32)', comment: '设备ID' },
          { name: 'store_id', type: 'varchar(32)', comment: '门店ID' },
          { name: 'sku_id', type: 'varchar(32)', comment: 'SKU ID' },
          { name: 'weight_g', type: 'decimal(8,2)', comment: '重量(g)' },
          { name: 'unit_price', type: 'decimal(8,2)', comment: '单价' },
          { name: 'total_price', type: 'decimal(8,2)', comment: '总价' },
          { name: 'weigh_time', type: 'datetime', comment: '称重时间' },
        ]
      },
      { name: 'scale_shelf_monitor', rows: '1.2亿', entity: 'ShelfMonitor', conf: 88,
        fields: [
          { name: 'monitor_id', type: 'varchar(32)', comment: '监控ID' },
          { name: 'device_id', type: 'varchar(32)', comment: '设备ID' },
          { name: 'shelf_id', type: 'varchar(32)', comment: '货架ID' },
          { name: 'sku_id', type: 'varchar(32)', comment: 'SKU ID' },
          { name: 'current_qty', type: 'int', comment: '当前数量' },
          { name: 'shelf_capacity', type: 'int', comment: '货架容量' },
          { name: 'fill_rate', type: 'decimal(4,2)', comment: '填充率' },
          { name: 'alert_level', type: 'varchar(10)', comment: '预警等级' },
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
  { id: 'store', label: '门店', x: 400, y: 200, domain: '门店域' },
  { id: 'product', label: '商品', x: 200, y: 100, domain: '商品域' },
  { id: 'member', label: '会员', x: 600, y: 100, domain: '会员域' },
  { id: 'sales_order', label: '销售订单', x: 400, y: 350, domain: '销售域' },
  { id: 'inventory', label: '库存', x: 100, y: 250, domain: '供应链域' },
  { id: 'promotion', label: '促销', x: 700, y: 250, domain: '营销域' },
  { id: 'supplier', label: '供应商', x: 100, y: 400, domain: '供应链域' },
  { id: 'warehouse', label: '仓库', x: 250, y: 450, domain: '供应链域' },
  { id: 'competitor', label: '竞品', x: 750, y: 400, domain: '竞品域' },
  { id: 'ad_campaign', label: '广告投放', x: 550, y: 50, domain: '营销域' },
  { id: 'category', label: '品类', x: 80, y: 80, domain: '商品域' },
  { id: 'brand', label: '品牌', x: 80, y: 20, domain: '商品域' },
  { id: 'sku', label: 'SKU', x: 280, y: 160, domain: '商品域' },
  { id: 'distribution', label: '配送', x: 220, y: 380, domain: '供应链域' },
  { id: 'member_tag', label: '会员标签', x: 780, y: 120, domain: '会员域' },
  { id: 'loyalty_program', label: '忠诚度计划', x: 820, y: 40, domain: '会员域' },
  { id: 'market_event', label: '市场活动', x: 620, y: 140, domain: '营销域' },
  { id: 'content', label: '内容', x: 480, y: 20, domain: '营销域' },
  { id: 'cost_center', label: '成本中心', x: 80, y: 520, domain: '财务域' },
  { id: 'demand_forecast', label: '需求预测', x: 80, y: 320, domain: '供应链域' },
  { id: 'quality_check', label: '质检', x: 320, y: 480, domain: '供应链域' },
  { id: 'return_order', label: '退货', x: 550, y: 480, domain: '供应链域' },
];

const GRAPH_EDGES: GraphEdge[] = [
  { source: 'store', target: 'sales_order', label: '产生' },
  { source: 'product', target: 'sales_order', label: '包含于' },
  { source: 'member', target: 'sales_order', label: '下单' },
  { source: 'inventory', target: 'store', label: '供应' },
  { source: 'product', target: 'inventory', label: '存储为' },
  { source: 'promotion', target: 'sales_order', label: '应用于' },
  { source: 'supplier', target: 'product', label: '供应' },
  { source: 'warehouse', target: 'inventory', label: '存储' },
  { source: 'competitor', target: 'product', label: '竞争' },
  { source: 'ad_campaign', target: 'promotion', label: '推广' },
  { source: 'member', target: 'promotion', label: '接收' },
  { source: 'category', target: 'product', label: '包含' },
  { source: 'sales_order', target: 'return_order', label: '可退' },
  { source: 'store', target: 'return_order', label: '处理' },
  { source: 'brand', target: 'product', label: '拥有' },
  { source: 'product', target: 'sku', label: '细分为' },
  { source: 'warehouse', target: 'distribution', label: '发起' },
  { source: 'distribution', target: 'store', label: '送达' },
  { source: 'member_tag', target: 'member', label: '标记' },
  { source: 'loyalty_program', target: 'member', label: '服务' },
  { source: 'market_event', target: 'promotion', label: '触发' },
  { source: 'content', target: 'ad_campaign', label: '素材' },
  { source: 'cost_center', target: 'store', label: '核算' },
  { source: 'demand_forecast', target: 'inventory', label: '指导' },
  { source: 'quality_check', target: 'inventory', label: '检验' },
  { source: 'supplier', target: 'quality_check', label: '送检' },
  { source: 'sku', target: 'inventory', label: '库存单元' },
  { source: 'member', target: 'loyalty_program', label: '参与' },
  { source: 'ad_campaign', target: 'member_tag', label: '定向' },
  { source: 'category', target: 'brand', label: '关联' },
];

/* ------------------------------------------------------------------ */
/*  Scenario data                                                      */
/* ------------------------------------------------------------------ */

const SCENARIOS = [
  {
    id: 'promo-618',
    name: '618大促促销场景',
    desc: '模拟618大促期间会员参与促销、下单购买的完整业务流程',
    nodes: [
      { id: 'sh001', label: '门店SH-001', domain: '门店域', x: 400, y: 150, detail: { type: 'Store', attrs: { store_code: 'SH-001', store_name: '上海南京东路店', city: '上海', region: '华东区', manager: '王经理' } } },
      { id: 'zhangsan', label: '会员张三', domain: '会员域', x: 650, y: 150, detail: { type: 'Member', attrs: { member_id: 'M-10086', name: '张三', level: '钻石会员', points: 12800, tags: ['坚果爱好者','高频消费'] } } },
      { id: 'promo618', label: '促销618-坚果', domain: '营销域', x: 650, y: 320, detail: { type: 'Promotion', attrs: { promo_id: '618-NUT-2025', name: '618坚果狂欢节', discount: '满199减50', start: '2025-06-01', end: '2025-06-18' } } },
      { id: 'lyf001', label: '商品LYF-001', domain: '商品域', x: 200, y: 320, detail: { type: 'SKU', attrs: { sku_code: 'LYF-001', name: '每日坚果礼盒500g', category: '坚果炒货', brand: '来伊份', price: 128.00 } } },
      { id: 'wh001', label: '库存WH-001', domain: '供应链域', x: 200, y: 500, detail: { type: 'Inventory', attrs: { inventory_id: 'WH-001', warehouse: '上海总仓', sku_code: 'LYF-001', qty: 3500, safety_stock: 500 } } },
      { id: 'so1284', label: '订单SO-1284', domain: '销售域', x: 400, y: 400, detail: { type: 'SalesOrder', attrs: { order_id: 'SO-1284', member: '张三', store: 'SH-001', amount: 256.00, status: '已支付', create_time: '2025-06-15 14:32:18' } } },
    ],
    edges: [
      { source: 'sh001', target: 'so1284', label: '产生' },
      { source: 'zhangsan', target: 'so1284', label: '下单' },
      { source: 'zhangsan', target: 'promo618', label: '参与' },
      { source: 'promo618', target: 'so1284', label: '优惠' },
      { source: 'lyf001', target: 'so1284', label: '包含' },
      { source: 'wh001', target: 'lyf001', label: '供应' },
      { source: 'wh001', target: 'sh001', label: '配送' },
    ],
  },
  {
    id: 'food-trace',
    name: '食品安全溯源场景',
    desc: '追踪坚果礼盒从供应商到门店的全链路质量信息',
    nodes: [
      { id: 'xjlp', label: '供应商新疆良品', domain: '供应链域', x: 150, y: 150, detail: { type: 'Supplier', attrs: { supplier_id: 'SUP-001', name: '新疆良品农业', region: '新疆喀什', grade: 'A级', coop_since: '2019-03' } } },
      { id: 'batch001', label: '坚果礼盒(Batch-2025-05)', domain: '商品域', x: 400, y: 150, detail: { type: 'SKU', attrs: { sku_code: 'LYF-001', batch: 'Batch-2025-05', production_date: '2025-05-10', shelf_life: '180天', origin: '新疆喀什' } } },
      { id: 'qc001', label: '质检记录QC-001', domain: '供应链域', x: 650, y: 150, detail: { type: 'QualityCheck', attrs: { qc_id: 'QC-001', batch: 'Batch-2025-05', result: '合格', inspector: '李质检', check_date: '2025-05-12', items: ['水分','黄曲霉素','微生物'] } } },
      { id: 'hz001', label: '门店HZ-001', domain: '门店域', x: 400, y: 350, detail: { type: 'Store', attrs: { store_code: 'HZ-001', store_name: '杭州西湖店', city: '杭州', region: '华东区', received_batch: 'Batch-2025-05' } } },
      { id: 'rt001', label: '退货单RT-001', domain: '销售域', x: 650, y: 350, detail: { type: 'ReturnOrder', attrs: { return_id: 'RT-001', store: 'HZ-001', sku: 'LYF-001', batch: 'Batch-2025-05', reason: '临期预警', return_qty: 12, status: '已处理' } } },
    ],
    edges: [
      { source: 'xjlp', target: 'batch001', label: '生产' },
      { source: 'batch001', target: 'qc001', label: '质检' },
      { source: 'batch001', target: 'hz001', label: '配送至' },
      { source: 'hz001', target: 'rt001', label: '发起退货' },
      { source: 'batch001', target: 'rt001', label: '退货商品' },
    ],
  },
  {
    id: 'marketing',
    name: '会员精准营销场景',
    desc: '基于会员标签的精准营销活动推送与转化流程',
    nodes: [
      { id: 'm_lisi', label: '会员李四(钻石卡)', domain: '会员域', x: 150, y: 150, detail: { type: 'Member', attrs: { member_id: 'M-20001', name: '李四', level: '钻石卡', points: 25600, tags: ['高净值','进口食品偏好'] } } },
      { id: 'm_tag', label: '会员标签(高净值)', domain: '会员域', x: 150, y: 350, detail: { type: 'MemberTag', attrs: { tag_id: 'TAG-001', tag_name: '高净值', category: '价值分层', score: 95, members: 12800 } } },
      { id: 'm_promo', label: '促销618-VIP', domain: '营销域', x: 400, y: 150, detail: { type: 'Promotion', attrs: { promo_id: '618-VIP-001', name: 'VIP专享8折', discount: '全场8折', target: '钻石会员', budget: '¥50万' } } },
      { id: 'm_product', label: '商品LYF-002(进口巧克力)', domain: '商品域', x: 400, y: 350, detail: { type: 'SKU', attrs: { sku_code: 'LYF-002', name: '进口黑巧克力200g', category: '进口零食', brand: '来伊份', price: 68.00 } } },
      { id: 'm_cart', label: '购物车Cart-001', domain: '销售域', x: 650, y: 150, detail: { type: 'Cart', attrs: { cart_id: 'Cart-001', member: '李四', items: 3, total: 204.00, status: '待结算' } } },
      { id: 'm_ad', label: '广告投放AD-001', domain: '营销域', x: 650, y: 350, detail: { type: 'AdCampaign', attrs: { campaign_id: 'AD-001', channel: '微信小程序', budget: '¥10万', impressions: 50000, ctr: '3.2%' } } },
    ],
    edges: [
      { source: 'm_tag', target: 'm_lisi', label: '标签→会员' },
      { source: 'm_ad', target: 'm_promo', label: '广告→促销' },
      { source: 'm_promo', target: 'm_product', label: '促销→商品' },
      { source: 'm_product', target: 'm_cart', label: '商品→购物车' },
      { source: 'm_lisi', target: 'm_cart', label: '会员→购物车' },
      { source: 'm_ad', target: 'm_lisi', label: '广告触达' },
    ],
  },
  {
    id: 'supplychain',
    name: '供应链异常处置场景',
    desc: '供应商延迟交货触发的库存预警与备选方案激活流程',
    nodes: [
      { id: 'sc_supplier_a', label: '供应商A(延迟交货)', domain: '供应链域', x: 150, y: 150, detail: { type: 'Supplier', attrs: { supplier_id: 'SUP-A', name: '供应商A', status: '延迟', delay_days: 5, risk_level: '高' } } },
      { id: 'sc_po', label: '采购订单PO-001', domain: '供应链域', x: 400, y: 150, detail: { type: 'PurchaseOrder', attrs: { po_id: 'PO-001', supplier: '供应商A', sku: 'LYF-003', qty: 5000, status: '延迟', eta: '2025-06-20' } } },
      { id: 'sc_wh', label: '库存预警WH-002', domain: '供应链域', x: 400, y: 350, detail: { type: 'InventoryAlert', attrs: { alert_id: 'WH-002', sku: 'LYF-003', current: 800, safety: 2000, gap: 1200, level: '红色预警' } } },
      { id: 'sc_fc', label: '需求预测FC-001', domain: '供应链域', x: 150, y: 350, detail: { type: 'DemandForecast', attrs: { forecast_id: 'FC-001', sku: 'LYF-003', forecast_qty: 3500, confidence: 0.92, period: '2025-W25' } } },
      { id: 'sc_supplier_b', label: '备选供应商B', domain: '供应链域', x: 650, y: 150, detail: { type: 'Supplier', attrs: { supplier_id: 'SUP-B', name: '备选供应商B', status: '正常', lead_time: '3天', capacity: '充足' } } },
      { id: 'sc_store', label: '门店SH-003(缺货)', domain: '门店域', x: 650, y: 350, detail: { type: 'Store', attrs: { store_code: 'SH-003', name: '上海五角场店', status: '缺货', affected_skus: 3, lost_sales: '¥8,500/天' } } },
    ],
    edges: [
      { source: 'sc_supplier_a', target: 'sc_po', label: '供应商→订单' },
      { source: 'sc_po', target: 'sc_wh', label: '订单→库存' },
      { source: 'sc_fc', target: 'sc_wh', label: '预测→库存' },
      { source: 'sc_wh', target: 'sc_store', label: '库存→门店' },
      { source: 'sc_supplier_b', target: 'sc_po', label: '备选→订单' },
      { source: 'sc_fc', target: 'sc_supplier_b', label: '预测→备选' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getDomainIcon(domain: string) {
  switch (domain) {
    case '门店域': return <Building2 size={18} />;
    case '商品域': return <Package size={18} />;
    case '供应链域': return <Truck size={18} />;
    case '会员域': return <Users size={18} />;
    case '销售域': return <ShoppingCart size={18} />;
    case '营销域': return <Megaphone size={18} />;
    case '财务域': return <Calculator size={18} />;
    case '竞品域': return <Target size={18} />;
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
    let list = Object.values(RETAIL_ONTOLOGY_LIBRARY);
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

  const totalEntities = Object.values(RETAIL_ONTOLOGY_LIBRARY).length;
  const totalDomains = DOMAIN_ORDER.length;
  const totalAttrs = Object.values(RETAIL_ONTOLOGY_LIBRARY).reduce((sum, o) => sum + o.attributes.length, 0);
  const totalRels = Object.values(RETAIL_ONTOLOGY_LIBRARY).reduce((sum, o) => sum + (o.relations?.length || 0), 0);

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
                    const ontology = Object.values(RETAIL_ONTOLOGY_LIBRARY).find(
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
