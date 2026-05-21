// 锂电池制造领域本体库
// 共享给 AgentStudio 和 OntologyModeling 使用

export interface Ontology {
  id: string;
  name: string;
  description: string;
  attributes: string[];
  // 可选字段
  domain?: string;
  relations?: string[];
}

// 锂电池制造领域本体库 - 与 OntologyModeling 中识别的实体保持一致
export const LITHIUM_BATTERY_ONTOLOGY_LIBRARY: Ontology[] = [
  // 生产域
  {
    id: 'production_line',
    name: 'ProductionLine (产线)',
    description: '生产线实体，用于电池制造的产线管理',
    domain: '生产域',
    attributes: ['line_id', 'capacity_per_hour', 'current_status', 'workshop_id', 'OEE'],
    relations: ['belongs_to Workshop', 'contains Device', 'executes WorkOrder']
  },
  {
    id: 'device',
    name: 'Device (设备)',
    description: '生产设备实体，包括涂布机、辊压机、卷绕机等',
    domain: '生产域',
    attributes: ['device_id', 'device_code', 'device_type', 'installation_date', 'status'],
    relations: ['belongs_to ProductionLine', 'generates Telemetry', 'requires MaintenanceOrder']
  },
  {
    id: 'work_order',
    name: 'WorkOrder (工单)',
    description: '生产工单实体，管理生产任务',
    domain: '生产域',
    attributes: ['wo_id', 'wo_number', 'product_id', 'planned_qty', 'actual_qty', 'status'],
    relations: ['fulfills SalesOrder', 'produces Product', 'generates Batch']
  },
  {
    id: 'workshop',
    name: 'Workshop (车间)',
    description: '车间实体，包含多条产线',
    domain: '生产域',
    attributes: ['workshop_id', 'type', 'manager'],
    relations: ['belongs_to Factory', 'contains ProductionLine']
  },
  {
    id: 'process_route',
    name: 'ProcessRoute (工艺路线)',
    description: '生产工艺路线定义',
    domain: '生产域',
    attributes: ['route_id', 'product_code', 'steps', 'cycle_time'],
    relations: ['defines Product', 'sequences WorkOrder']
  },

  // 物料/供应域
  {
    id: 'material',
    name: 'Material (物料)',
    description: '物料库存实体，包括正负极材料、电解液等',
    domain: '供应域',
    attributes: ['material_id', 'name', 'type', 'supplier', 'inventory_qty'],
    relations: ['supplied_by Supplier', 'consumed_by Batch']
  },
  {
    id: 'material_spec',
    name: 'MaterialSpec (物料规格)',
    description: '物料规格定义',
    domain: '供应域',
    attributes: ['spec_id', 'material_code', 'density', 'purity', 'particle_size'],
    relations: ['defined_by BOM', 'supplied_by Supplier']
  },
  {
    id: 'bom',
    name: 'BOM (物料清单)',
    description: '产品物料清单',
    domain: '供应域',
    attributes: ['bom_id', 'product_code', 'version', 'active'],
    relations: ['defines Product', 'requires MaterialSpec']
  },
  {
    id: 'supplier',
    name: 'Supplier (供应商)',
    description: '供应商实体',
    domain: '供应域',
    attributes: ['supplier_id', 'name', 'category', 'rating', 'lead_time'],
    relations: ['supplies Material', 'supplies SparePart']
  },
  {
    id: 'spare_part',
    name: 'SparePart (备件)',
    description: '设备备件库存',
    domain: '供应域',
    attributes: ['part_id', 'name', 'device_type', 'stock_qty', 'safety_stock'],
    relations: ['consumed_by MaintenanceOrder', 'supplied_by Supplier']
  },
  {
    id: 'inventory',
    name: 'Inventory (库存)',
    description: '库存台账',
    domain: '供应域',
    attributes: ['sku_id', 'location', 'qty_on_hand', 'qty_reserved', 'expiry_date'],
    relations: ['contains Material', 'contains Product']
  },

  // 产品域
  {
    id: 'product',
    name: 'Product (产品)',
    description: '产品实体，包括电芯、模组、Pack等',
    domain: '产品域',
    attributes: ['product_id', 'model', 'capacity_ah', 'voltage', 'type'],
    relations: ['defined_by BOM', 'produced_by WorkOrder', 'included_in SalesOrder']
  },
  {
    id: 'batch',
    name: 'Batch (批次)',
    description: '生产批次实体，追溯核心',
    domain: '产品域',
    attributes: ['batch_id', 'step', 'qty', 'start_time', 'end_time'],
    relations: ['belongs_to WorkOrder', 'processed_on Device', 'consumes Material', 'inspected_by QualityInspection']
  },

  // 质量域
  {
    id: 'quality_inspection',
    name: 'QualityInspection (质检记录)',
    description: '质量检验记录',
    domain: '质量域',
    attributes: ['inspection_id', 'batch_no', 'step', 'resistance', 'voltage_drop', 'result'],
    relations: ['inspects Batch', 'triggers CustomerComplaint']
  },
  {
    id: 'spc_data',
    name: 'SPCData (过程控制数据)',
    description: '统计过程控制数据',
    domain: '质量域',
    attributes: ['data_id', 'parameter', 'value', 'ucl', 'lcl', 'timestamp'],
    relations: ['monitors Device', 'monitors Batch']
  },

  // 设备运维域
  {
    id: 'maintenance_order',
    name: 'MaintenanceOrder (维修工单)',
    description: '设备维修保养工单',
    domain: '运维域',
    attributes: ['mo_id', 'device_id', 'type', 'scheduled_date', 'status', 'technician'],
    relations: ['maintains Device', 'consumes SparePart']
  },
  {
    id: 'equipment_failure',
    name: 'EquipmentFailure (设备故障)',
    description: '设备故障记录',
    domain: '运维域',
    attributes: ['failure_id', 'device_id', 'symptom', 'cause', 'downtime_minutes'],
    relations: ['occurs_on Device', 'triggers MaintenanceOrder']
  },
  {
    id: 'telemetry',
    name: 'Telemetry (遥测数据)',
    description: 'IoT传感器遥测数据',
    domain: '运维域',
    attributes: ['timestamp', 'sensor_tag', 'value', 'unit', 'device_id'],
    relations: ['measured_on Device']
  },
  {
    id: 'technician',
    name: 'Technician (技术员)',
    description: '生产/维修技术人员',
    domain: '运维域',
    attributes: ['tech_id', 'name', 'certifications', 'work_center'],
    relations: ['operates Device', 'executes MaintenanceOrder']
  },

  // 销售/客户域
  {
    id: 'sales_order',
    name: 'SalesOrder (销售订单)',
    description: '客户销售订单',
    domain: '销售域',
    attributes: ['so_id', 'customer', 'delivery_date', 'qty', 'amount'],
    relations: ['includes Product', 'fulfilled_by WorkOrder']
  },
  {
    id: 'customer',
    name: 'Customer (客户)',
    description: '客户实体',
    domain: '销售域',
    attributes: ['customer_id', 'name', 'tier', 'credit_limit', 'region'],
    relations: ['places SalesOrder', 'raises CustomerComplaint']
  },
  {
    id: 'customer_complaint',
    name: 'CustomerComplaint (客诉)',
    description: '客户投诉/售后服务',
    domain: '销售域',
    attributes: ['ticket_id', 'customer_id', 'issue_type', 'severity', 'status'],
    relations: ['raised_by Customer', 'traced_to Batch']
  },
  {
    id: 'purchase_order',
    name: 'PurchaseOrder (采购订单)',
    description: '物料采购订单',
    domain: '销售域',
    attributes: ['po_id', 'supplier_id', 'material_id', 'qty', 'delivery_date'],
    relations: ['places_to Supplier', 'receives Material']
  }
];

// 根据ID获取本体
export function getOntologyById(id: string): Ontology | undefined {
  return LITHIUM_BATTERY_ONTOLOGY_LIBRARY.find(o => o.id === id);
}

// 根据领域获取本体列表
export function getOntologiesByDomain(domain: string): Ontology[] {
  return LITHIUM_BATTERY_ONTOLOGY_LIBRARY.filter(o => o.domain === domain);
}

// 获取所有领域列表
export function getAllDomains(): string[] {
  const domains = new Set(LITHIUM_BATTERY_ONTOLOGY_LIBRARY.map(o => o.domain).filter(Boolean));
  return Array.from(domains) as string[];
}

// 搜索本体（按名称或描述）
export function searchOntologies(keyword: string): Ontology[] {
  const lower = keyword.toLowerCase();
  return LITHIUM_BATTERY_ONTOLOGY_LIBRARY.filter(o =>
    o.name.toLowerCase().includes(lower) ||
    o.description.toLowerCase().includes(lower) ||
    o.attributes.some(attr => attr.toLowerCase().includes(lower))
  );
}

// 创建新本体（自动补齐到库中）
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

export default LITHIUM_BATTERY_ONTOLOGY_LIBRARY;
