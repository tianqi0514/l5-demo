// 零售/休闲食品连锁领域本体库
// 共享给 AgentStudio 和 OntologyModeling 使用

export interface Ontology {
  id: string;
  name: string;
  description: string;
  attributes: string[];
  domain?: string;
  relations?: string[];
}

// 零售连锁领域本体库 - 覆盖门店/商品/供应链/会员/销售/营销/财务/竞品 8大域
export const RETAIL_ONTOLOGY_LIBRARY: Ontology[] = [
  // ========== 门店域 (6个) ==========
  {
    id: 'store',
    name: 'Store (门店)',
    description: '零售门店实体，直营店或加盟店',
    domain: '门店域',
    attributes: ['store_id', 'store_code', 'store_name', 'store_type', 'region_id', 'city_id', 'address', 'area_sqm', 'open_date', 'status', 'biz_hours', 'rent_cost'],
    relations: ['belongs_to Region', 'belongs_to City', 'managed_by StoreManager', 'generates SalesOrder', 'has Inventory', 'has StoreLayout']
  },
  {
    id: 'region',
    name: 'Region (大区)',
    description: '大区管理单元',
    domain: '门店域',
    attributes: ['region_id', 'region_name', 'region_manager_id', 'store_count', 'total_revenue_target'],
    relations: ['contains Store', 'contains City', 'managed_by RegionManager']
  },
  {
    id: 'city',
    name: 'City (城市)',
    description: '城市管理单元',
    domain: '门店域',
    attributes: ['city_id', 'city_name', 'region_id', 'store_count', 'city_manager_id', 'population', 'gdp'],
    relations: ['belongs_to Region', 'contains Store']
  },
  {
    id: 'store_manager',
    name: 'StoreManager (店长)',
    description: '门店负责人',
    domain: '门店域',
    attributes: ['manager_id', 'name', 'store_id', 'phone', 'tenure_months', 'performance_rating'],
    relations: ['manages Store']
  },
  {
    id: 'store_layout',
    name: 'StoreLayout (门店布局)',
    description: '门店货架陈列布局方案',
    domain: '门店域',
    attributes: ['layout_id', 'store_id', 'layout_version', 'shelf_count', 'hot_zone_config', 'update_date'],
    relations: ['belongs_to Store', 'displays Product']
  },
  {
    id: 'store_inspection',
    name: 'StoreInspection (门店巡检)',
    description: '门店日常巡检记录',
    domain: '门店域',
    attributes: ['inspect_id', 'store_id', 'inspector_id', 'inspect_date', 'score', 'issues', 'status'],
    relations: ['inspects Store', 'raised_by StoreManager']
  },

  // ========== 商品域 (7个) ==========
  {
    id: 'product',
    name: 'Product (商品)',
    description: '休闲食品商品实体',
    domain: '商品域',
    attributes: ['product_id', 'product_code', 'product_name', 'category_id', 'brand_id', 'spec', 'unit_price', 'cost_price', 'shelf_life_days', 'is_new', 'is_seasonal'],
    relations: ['belongs_to Category', 'belongs_to Brand', 'included_in SKU', 'sold_in SalesOrder', 'has ProductReview']
  },
  {
    id: 'sku',
    name: 'SKU (库存单元)',
    description: '最小库存管理单元',
    domain: '商品域',
    attributes: ['sku_id', 'sku_code', 'product_id', 'spec_variant', 'barcode', 'unit', 'weight_g', 'package_type'],
    relations: ['belongs_to Product', 'has Inventory', 'sold_in SalesOrder']
  },
  {
    id: 'category',
    name: 'Category (品类)',
    description: '商品品类分类（坚果/肉脯/糖果/糕点等）',
    domain: '商品域',
    attributes: ['category_id', 'category_name', 'parent_id', 'level', 'seasonality', 'profit_margin_target'],
    relations: ['contains Product', 'has SalesTarget']
  },
  {
    id: 'brand',
    name: 'Brand (品牌)',
    description: '商品品牌（自有品牌/代理品牌）',
    domain: '商品域',
    attributes: ['brand_id', 'brand_name', 'brand_type', 'cooperation_mode', 'royalty_rate'],
    relations: ['owns Product']
  },
  {
    id: 'seasonal_product',
    name: 'SeasonalProduct (季节性商品)',
    description: '季节性/节假日特供商品',
    domain: '商品域',
    attributes: ['sp_id', 'product_id', 'season', 'start_date', 'end_date', 'expected_sales', 'actual_sales'],
    relations: ['is_variant_of Product', 'triggered_by Promotion']
  },
  {
    id: 'product_review',
    name: 'ProductReview (商品评价)',
    description: '顾客对商品的评价反馈',
    domain: '商品域',
    attributes: ['review_id', 'product_id', 'member_id', 'rating', 'comment', 'review_date', 'has_image'],
    relations: ['reviews Product', 'written_by Member']
  },
  {
    id: 'price_strategy',
    name: 'PriceStrategy (定价策略)',
    description: '商品动态定价策略',
    domain: '商品域',
    attributes: ['strategy_id', 'sku_id', 'base_price', 'vip_price', 'promo_price', 'dynamic_price', 'effective_from', 'effective_to'],
    relations: ['applies_to SKU', 'triggered_by Promotion']
  },

  // ========== 供应链域 (8个) ==========
  {
    id: 'supplier',
    name: 'Supplier (供应商)',
    description: '食品供应商实体',
    domain: '供应链域',
    attributes: ['supplier_id', 'supplier_name', 'category', 'rating', 'lead_time_days', 'qualification_status', 'cooperation_years', 'annual_purchase_amount'],
    relations: ['supplies Product', 'receives PurchaseOrder', 'audited_by QualityCheck']
  },
  {
    id: 'warehouse',
    name: 'Warehouse (仓库)',
    description: '仓储物流中心（CDC/RDC/前置仓）',
    domain: '供应链域',
    attributes: ['warehouse_id', 'warehouse_name', 'warehouse_type', 'region_id', 'capacity', 'status', 'temp_controlled'],
    relations: ['belongs_to Region', 'stores Inventory', 'fulfills Distribution']
  },
  {
    id: 'distribution',
    name: 'Distribution (配送单)',
    description: '仓到店配送单',
    domain: '供应链域',
    attributes: ['dist_id', 'dist_no', 'warehouse_id', 'store_id', 'status', 'delivery_date', 'driver_id', 'vehicle_id', 'actual_arrival'],
    relations: ['from Warehouse', 'to Store', 'contains SKU']
  },
  {
    id: 'inventory',
    name: 'Inventory (库存)',
    description: '库存台账（仓库存/门店存/在途）',
    domain: '供应链域',
    attributes: ['inventory_id', 'sku_id', 'location_type', 'location_id', 'qty_on_hand', 'qty_reserved', 'qty_in_transit', 'expiry_date', 'safety_stock'],
    relations: ['belongs_to SKU', 'stored_in Warehouse', 'sold_in Store']
  },
  {
    id: 'purchase_order',
    name: 'PurchaseOrder (采购订单)',
    description: '商品采购订单',
    domain: '供应链域',
    attributes: ['po_id', 'po_no', 'supplier_id', 'total_amount', 'status', 'expected_delivery', 'actual_delivery', 'payment_terms'],
    relations: ['to Supplier', 'contains SKU']
  },
  {
    id: 'return_order',
    name: 'ReturnOrder (退货单)',
    description: '门店/顾客退货记录',
    domain: '供应链域',
    attributes: ['return_id', 'source_type', 'source_id', 'sku_id', 'qty', 'reason', 'return_date', 'status', 'refund_amount'],
    relations: ['returns SKU', 'from Store', 'from Member']
  },
  {
    id: 'quality_check',
    name: 'QualityCheck (质检记录)',
    description: '入库/在库质检记录',
    domain: '供应链域',
    attributes: ['qc_id', 'batch_no', 'sku_id', 'check_date', 'checker_id', 'result', 'defect_count', 'defect_type'],
    relations: ['checks SKU', 'audits Supplier']
  },
  {
    id: 'forecast',
    name: 'DemandForecast (需求预测)',
    description: 'SKU级需求预测数据',
    domain: '供应链域',
    attributes: ['forecast_id', 'sku_id', 'store_id', 'forecast_date', 'forecast_qty', 'confidence', 'model_version'],
    relations: ['predicts Inventory', 'drives PurchaseOrder']
  },

  // ========== 会员域 (6个) ==========
  {
    id: 'member',
    name: 'Member (会员)',
    description: '会员客户实体',
    domain: '会员域',
    attributes: ['member_id', 'member_name', 'phone', 'tier', 'register_date', 'total_points', 'lifetime_value', 'last_purchase_date', 'churn_risk'],
    relations: ['places SalesOrder', 'receives Promotion', 'uses Coupon', 'has MemberTag']
  },
  {
    id: 'member_tag',
    name: 'MemberTag (会员标签)',
    description: '会员画像标签',
    domain: '会员域',
    attributes: ['tag_id', 'member_id', 'tag_name', 'tag_value', 'source', 'update_date'],
    relations: ['belongs_to Member']
  },
  {
    id: 'promotion',
    name: 'Promotion (促销活动)',
    description: '营销活动（满减/折扣/买赠）',
    domain: '会员域',
    attributes: ['promo_id', 'promo_name', 'promo_type', 'start_date', 'end_date', 'budget', 'status', 'region_scope', 'target_tier'],
    relations: ['targets Member', 'applies_to SKU', 'executed_in Store']
  },
  {
    id: 'coupon',
    name: 'Coupon (优惠券)',
    description: '优惠券实体',
    domain: '会员域',
    attributes: ['coupon_id', 'coupon_code', 'coupon_type', 'discount_value', 'min_order_amount', 'valid_from', 'valid_to', 'usage_limit', 'used_count'],
    relations: ['owned_by Member', 'used_in SalesOrder']
  },
  {
    id: 'loyalty_program',
    name: 'LoyaltyProgram (忠诚度计划)',
    description: '会员积分/成长值体系',
    domain: '会员域',
    attributes: ['program_id', 'member_id', 'points_balance', 'growth_value', 'tier', 'next_tier_threshold', 'upgrade_date'],
    relations: ['belongs_to Member', 'rewards SalesOrder']
  },
  {
    id: 'member_behavior',
    name: 'MemberBehavior (会员行为)',
    description: '会员浏览/收藏/加购等行为',
    domain: '会员域',
    attributes: ['behavior_id', 'member_id', 'behavior_type', 'sku_id', 'store_id', 'behavior_time', 'channel'],
    relations: ['by Member', 'on SKU', 'at Store']
  },

  // ========== 销售域 (6个) ==========
  {
    id: 'sales_order',
    name: 'SalesOrder (销售订单)',
    description: '门店销售订单',
    domain: '销售域',
    attributes: ['so_id', 'so_no', 'store_id', 'member_id', 'total_amount', 'discount_amount', 'payment_method', 'order_date', 'channel'],
    relations: ['from Store', 'by Member', 'contains SKU', 'has POSTransaction']
  },
  {
    id: 'pos_transaction',
    name: 'POSTransaction (POS交易)',
    description: 'POS终端交易记录',
    domain: '销售域',
    attributes: ['txn_id', 'pos_id', 'store_id', 'txn_time', 'amount', 'item_count', 'payment_type', 'cashier_id'],
    relations: ['at Store', 'contains SKU', 'part_of SalesOrder']
  },
  {
    id: 'sales_target',
    name: 'SalesTarget (销售目标)',
    description: '销售目标与KPI',
    domain: '销售域',
    attributes: ['target_id', 'target_type', 'target_period', 'target_amount', 'actual_amount', 'completion_rate', 'target_level'],
    relations: ['for Store', 'for Region', 'for Category']
  },
  {
    id: 'shopping_cart',
    name: 'ShoppingCart (购物车)',
    description: '小程序/APP购物车',
    domain: '销售域',
    attributes: ['cart_id', 'member_id', 'sku_id', 'qty', 'add_time', 'is_abandoned'],
    relations: ['by Member', 'contains SKU']
  },
  {
    id: 'refund',
    name: 'Refund (退款)',
    description: '订单退款记录',
    domain: '销售域',
    attributes: ['refund_id', 'so_id', 'amount', 'reason', 'refund_date', 'status', 'approver_id'],
    relations: ['for SalesOrder', 'approved_by StoreManager']
  },
  {
    id: 'sales_anomaly',
    name: 'SalesAnomaly (销售异常)',
    description: '销售数据异常检测记录',
    domain: '销售域',
    attributes: ['anomaly_id', 'store_id', 'detect_date', 'anomaly_type', 'severity', 'expected_value', 'actual_value', 'status'],
    relations: ['at Store', 'triggers Alert']
  },

  // ========== 营销域 (4个) ==========
  {
    id: 'ad_campaign',
    name: 'AdCampaign (广告投放)',
    description: '线上/线下广告投放',
    domain: '营销域',
    attributes: ['campaign_id', 'campaign_name', 'channel', 'budget', 'start_date', 'end_date', 'impressions', 'clicks', 'conversions'],
    relations: ['promotes Promotion', 'targets Region']
  },
  {
    id: 'channel',
    name: 'Channel (渠道)',
    description: '销售渠道（门店/小程序/第三方平台）',
    domain: '营销域',
    attributes: ['channel_id', 'channel_name', 'channel_type', 'commission_rate', 'status'],
    relations: ['generates SalesOrder', 'serves Member']
  },
  {
    id: 'content',
    name: 'Content (营销内容)',
    description: '营销素材内容（图文/视频/海报）',
    domain: '营销域',
    attributes: ['content_id', 'content_type', 'title', 'publish_date', 'channel', 'views', 'likes', 'conversion_rate'],
    relations: ['promotes Product', 'used_in AdCampaign']
  },
  {
    id: 'market_event',
    name: 'MarketEvent (市场活动)',
    description: '节假日/大促活动',
    domain: '营销域',
    attributes: ['event_id', 'event_name', 'event_type', 'start_date', 'end_date', 'participating_stores', 'gmv_target', 'actual_gmv'],
    relations: ['triggers Promotion', 'applies_to Store']
  },

  // ========== 财务域 (3个) ==========
  {
    id: 'cost_center',
    name: 'CostCenter (成本中心)',
    description: '门店/区域成本核算单元',
    domain: '财务域',
    attributes: ['cc_id', 'cc_name', 'cc_type', 'parent_id', 'monthly_budget', 'actual_cost', 'variance'],
    relations: ['belongs_to Store', 'belongs_to Region']
  },
  {
    id: 'budget',
    name: 'Budget (预算)',
    description: '年度/季度预算',
    domain: '财务域',
    attributes: ['budget_id', 'budget_type', 'period', 'amount', 'spent', 'remaining', 'approval_status'],
    relations: ['for CostCenter', 'drives Promotion']
  },
  {
    id: 'settlement',
    name: 'Settlement (结算单)',
    description: '供应商/加盟商结算',
    domain: '财务域',
    attributes: ['settle_id', 'counterparty_id', 'counterparty_type', 'amount', 'period', 'status', 'settle_date'],
    relations: ['with Supplier', 'for Store']
  },

  // ========== 竞品域 (2个) ==========
  {
    id: 'competitor',
    name: 'Competitor (竞品)',
    description: '竞争对手商品/价格监控',
    domain: '竞品域',
    attributes: ['comp_id', 'comp_name', 'comp_product_name', 'our_product_id', 'comp_price', 'our_price', 'price_gap', 'update_date'],
    relations: ['competes_with Product', 'has MarketPrice']
  },
  {
    id: 'market_price',
    name: 'MarketPrice (市场价格)',
    description: '市场价格监控数据',
    domain: '竞品域',
    attributes: ['mp_id', 'product_id', 'competitor_id', 'market_price', 'promo_price', 'collect_date', 'source'],
    relations: ['for Product', 'from Competitor']
  }
];

export function getOntologyById(id: string): Ontology | undefined {
  return RETAIL_ONTOLOGY_LIBRARY.find(o => o.id === id);
}

export function getOntologiesByDomain(domain: string): Ontology[] {
  return RETAIL_ONTOLOGY_LIBRARY.filter(o => o.domain === domain);
}

export function getAllDomains(): string[] {
  const domains = new Set(RETAIL_ONTOLOGY_LIBRARY.map(o => o.domain).filter(Boolean));
  return Array.from(domains) as string[];
}

export function searchOntologies(keyword: string): Ontology[] {
  const lower = keyword.toLowerCase();
  return RETAIL_ONTOLOGY_LIBRARY.filter(o =>
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

export default RETAIL_ONTOLOGY_LIBRARY;
