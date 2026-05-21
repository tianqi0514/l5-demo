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

// 零售连锁领域本体库
export const RETAIL_ONTOLOGY_LIBRARY: Ontology[] = [
  // 门店域
  {
    id: 'store',
    name: 'Store (门店)',
    description: '零售门店实体，直营店或加盟店',
    domain: '门店域',
    attributes: ['store_id', 'store_code', 'store_name', 'store_type', 'region_id', 'city_id', 'address', 'area_sqm', 'open_date', 'status'],
    relations: ['belongs_to Region', 'belongs_to City', 'managed_by StoreManager', 'generates SalesOrder', 'has Inventory']
  },
  {
    id: 'region',
    name: 'Region (大区)',
    description: '大区管理单元',
    domain: '门店域',
    attributes: ['region_id', 'region_name', 'region_manager_id', 'store_count'],
    relations: ['contains Store', 'contains City', 'managed_by RegionManager']
  },
  {
    id: 'city',
    name: 'City (城市)',
    description: '城市管理单元',
    domain: '门店域',
    attributes: ['city_id', 'city_name', 'region_id', 'store_count', 'city_manager_id'],
    relations: ['belongs_to Region', 'contains Store']
  },
  {
    id: 'store_manager',
    name: 'StoreManager (店长)',
    description: '门店负责人',
    domain: '门店域',
    attributes: ['manager_id', 'name', 'store_id', 'phone', 'tenure_months'],
    relations: ['manages Store']
  },

  // 商品域
  {
    id: 'product',
    name: 'Product (商品)',
    description: '休闲食品商品实体',
    domain: '商品域',
    attributes: ['product_id', 'product_code', 'product_name', 'category_id', 'brand_id', 'spec', 'unit_price', 'cost_price', 'shelf_life_days'],
    relations: ['belongs_to Category', 'belongs_to Brand', 'included_in SKU', 'sold_in SalesOrder']
  },
  {
    id: 'sku',
    name: 'SKU (库存单元)',
    description: '最小库存管理单元',
    domain: '商品域',
    attributes: ['sku_id', 'sku_code', 'product_id', 'spec_variant', 'barcode', 'unit'],
    relations: ['belongs_to Product', 'has Inventory', 'sold_in SalesOrder']
  },
  {
    id: 'category',
    name: 'Category (品类)',
    description: '商品品类分类',
    domain: '商品域',
    attributes: ['category_id', 'category_name', 'parent_id', 'level'],
    relations: ['contains Product', 'has SalesTarget']
  },
  {
    id: 'brand',
    name: 'Brand (品牌)',
    description: '商品品牌',
    domain: '商品域',
    attributes: ['brand_id', 'brand_name', 'brand_type'],
    relations: ['owns Product']
  },

  // 供应链域
  {
    id: 'supplier',
    name: 'Supplier (供应商)',
    description: '食品供应商实体',
    domain: '供应链域',
    attributes: ['supplier_id', 'supplier_name', 'category', 'rating', 'lead_time_days', 'qualification_status'],
    relations: ['supplies Product', 'receives PurchaseOrder']
  },
  {
    id: 'warehouse',
    name: 'Warehouse (仓库)',
    description: '仓储物流中心',
    domain: '供应链域',
    attributes: ['warehouse_id', 'warehouse_name', 'warehouse_type', 'region_id', 'capacity', 'status'],
    relations: ['belongs_to Region', 'stores Inventory', 'fulfills Distribution']
  },
  {
    id: 'distribution',
    name: 'Distribution (配送单)',
    description: '门店配送单',
    domain: '供应链域',
    attributes: ['dist_id', 'dist_no', 'warehouse_id', 'store_id', 'status', 'delivery_date'],
    relations: ['from Warehouse', 'to Store', 'contains SKU']
  },
  {
    id: 'inventory',
    name: 'Inventory (库存)',
    description: '库存台账',
    domain: '供应链域',
    attributes: ['inventory_id', 'sku_id', 'location_type', 'location_id', 'qty_on_hand', 'qty_reserved', 'expiry_date'],
    relations: ['belongs_to SKU', 'stored_in Warehouse', 'sold_in Store']
  },
  {
    id: 'purchase_order',
    name: 'PurchaseOrder (采购订单)',
    description: '商品采购订单',
    domain: '供应链域',
    attributes: ['po_id', 'po_no', 'supplier_id', 'total_amount', 'status', 'expected_delivery'],
    relations: ['to Supplier', 'contains SKU']
  },

  // 会员域
  {
    id: 'member',
    name: 'Member (会员)',
    description: '会员客户实体',
    domain: '会员域',
    attributes: ['member_id', 'member_name', 'phone', 'tier', 'register_date', 'total_points', 'lifetime_value'],
    relations: ['places SalesOrder', 'receives Promotion', 'uses Coupon']
  },
  {
    id: 'promotion',
    name: 'Promotion (促销活动)',
    description: '营销活动',
    domain: '会员域',
    attributes: ['promo_id', 'promo_name', 'promo_type', 'start_date', 'end_date', 'budget', 'status', 'region_scope'],
    relations: ['targets Member', 'applies_to SKU', 'executed_in Store']
  },
  {
    id: 'coupon',
    name: 'Coupon (优惠券)',
    description: '优惠券实体',
    domain: '会员域',
    attributes: ['coupon_id', 'coupon_code', 'coupon_type', 'discount_value', 'min_order_amount', 'valid_from', 'valid_to'],
    relations: ['owned_by Member', 'used_in SalesOrder']
  },

  // 销售域
  {
    id: 'sales_order',
    name: 'SalesOrder (销售订单)',
    description: '门店销售订单/POS交易',
    domain: '销售域',
    attributes: ['so_id', 'so_no', 'store_id', 'member_id', 'total_amount', 'discount_amount', 'payment_method', 'order_date'],
    relations: ['from Store', 'by Member', 'contains SKU']
  },
  {
    id: 'pos_transaction',
    name: 'POSTransaction (POS交易)',
    description: 'POS终端交易记录',
    domain: '销售域',
    attributes: ['txn_id', 'pos_id', 'store_id', 'txn_time', 'amount', 'item_count', 'payment_type'],
    relations: ['at Store', 'contains SKU']
  },
  {
    id: 'sales_target',
    name: 'SalesTarget (销售目标)',
    description: '销售目标与KPI',
    domain: '销售域',
    attributes: ['target_id', 'target_type', 'target_period', 'target_amount', 'actual_amount', 'completion_rate'],
    relations: ['for Store', 'for Region', 'for Category']
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
