import React, { useState, useMemo } from 'react';
import {
  Database, Plus, Search, CheckCircle2, GitMerge, Link2, Layers, Cpu,
  ChevronRight, ChevronDown, ChevronUp, Box, FileText, Terminal, Play,
  Wand2, Save, Server, Table2, Sparkles, ArrowRight, ArrowLeft, Network, Settings,
  Activity, ShieldCheck, Wrench, Users, Headset, Truck, FileSpreadsheet, AlertTriangle,
  Trash2, Edit3, X, Info
} from 'lucide-react';
import { cn } from '../lib/utils';

type TabKey = 'discovery' | 'mapping' | 'ontology' | 'instances';

// --- Expanded Mock Data for Lithium Battery Manufacturing ---
const DATA_SOURCES = [
  { 
    id: 'mes', name: 'MES 制造执行系统', type: 'mysql', icon: Server, color: 'text-blue-500',
    tables: [
      { 
        id: 'mes_production_line', name: 'production_line', rows: 12, recognizedAs: 'ProductionLine', confidence: 95,
        reasons: ['表名 production_line 强语义匹配', '包含典型特征字段 capacity_per_hour'],
        fields: [
          { name: 'id', type: 'varchar(32)', comment: '主键' },
          { name: 'line_code', type: 'varchar(50)', comment: '产线编码 (如: 涂布一线)' },
          { name: 'capacity_per_hour', type: 'int', comment: '小时产能 (PPM)' },
          { name: 'current_status', type: 'varchar(20)', comment: '当前状态 (运行/停机/待机)' },
          { name: 'workshop_id', type: 'varchar(32)', comment: '所属车间' },
        ]
      },
      { 
        id: 'mes_device_master', name: 'device_master', rows: 156, recognizedAs: 'Device', confidence: 92,
        reasons: ['表名 device_master 匹配设备主数据', '包含 device_code, model_number'],
        fields: [
          { name: 'id', type: 'varchar(32)', comment: '主键' },
          { name: 'device_code', type: 'varchar(50)', comment: '设备编号 (如: COAT-001)' },
          { name: 'device_type', type: 'varchar(50)', comment: '设备类型 (涂布机/辊压机/卷绕机)' },
          { name: 'installation_date', type: 'date', comment: '安装日期' },
          { name: 'status', type: 'varchar(20)', comment: '设备状态' },
        ]
      },
      { 
        id: 'mes_work_order', name: 'work_order', rows: 5000, recognizedAs: 'WorkOrder', confidence: 88,
        reasons: ['表名 work_order 匹配工单实体', '包含 planned_qty, actual_qty'],
        fields: [
          { name: 'id', type: 'varchar(32)', comment: '主键' },
          { name: 'wo_number', type: 'varchar(50)', comment: '工单号' },
          { name: 'product_id', type: 'varchar(32)', comment: '产品ID (如: LFP-100Ah电芯)' },
          { name: 'planned_qty', type: 'int', comment: '计划生产数量' },
          { name: 'actual_qty', type: 'int', comment: '实际产出数量' },
          { name: 'status', type: 'varchar(20)', comment: '工单状态 (下达/执行中/完工)' },
        ]
      },
      { 
        id: 'mes_process_route', name: 'process_route', rows: 45, recognizedAs: 'ProcessRoute', confidence: 94,
        reasons: ['表名 process_route 匹配工艺路线', '包含 step_sequence, standard_time'],
        fields: [
          { name: 'id', type: 'varchar(32)', comment: '主键' },
          { name: 'route_code', type: 'varchar(50)', comment: '路线编码 (如: NCM-811-标准工艺)' },
          { name: 'step_sequence', type: 'int', comment: '工序序号 (10, 20, 30...)' },
          { name: 'step_name', type: 'varchar(50)', comment: '工序名称 (搅拌/涂布/辊压/分切)' },
          { name: 'standard_time', type: 'decimal(8,2)', comment: '标准工时(秒)' },
        ]
      },
    ]
  },
  { 
    id: 'erp', name: 'ERP 企业资源计划', type: 'oracle', icon: Database, color: 'text-slate-600',
    tables: [
      { 
        id: 'erp_sales_order', name: 'sales_order', rows: 12000, recognizedAs: 'SalesOrder', confidence: 85,
        reasons: ['表名 sales_order 匹配销售订单', '包含 customer_id, total_amount'],
        fields: [
          { name: 'id', type: 'varchar(32)', comment: '主键' },
          { name: 'order_no', type: 'varchar(50)', comment: '订单编号' },
          { name: 'customer_id', type: 'varchar(32)', comment: '客户ID (如: 某新能源车企)' },
          { name: 'total_amount', type: 'decimal(10,2)', comment: '订单总金额' },
          { name: 'delivery_date', type: 'date', comment: '交货日期' },
        ]
      },
      { 
        id: 'erp_purchase_order', name: 'purchase_order', rows: 8500, recognizedAs: 'PurchaseOrder', confidence: 87,
        reasons: ['表名 purchase_order 匹配采购订单', '包含 supplier_id, material_code'],
        fields: [
          { name: 'id', type: 'varchar(32)', comment: '主键' },
          { name: 'po_number', type: 'varchar(50)', comment: '采购单号' },
          { name: 'supplier_id', type: 'varchar(32)', comment: '供应商ID (如: 某碳酸锂供应商)' },
          { name: 'material_code', type: 'varchar(50)', comment: '采购物料编码' },
          { name: 'expected_arrival', type: 'date', comment: '预计到货日期' },
        ]
      },
      { 
        id: 'erp_inventory', name: 'inventory_ledger', rows: 45000, recognizedAs: 'Inventory', confidence: 89,
        reasons: ['表名 inventory_ledger 匹配库存台账', '包含 material_code, current_stock'],
        fields: [
          { name: 'id', type: 'varchar(32)', comment: '主键' },
          { name: 'material_code', type: 'varchar(50)', comment: '物料编码 (如: 正极材料/铝箔)' },
          { name: 'warehouse_id', type: 'varchar(32)', comment: '仓库ID' },
          { name: 'current_stock', type: 'decimal(10,2)', comment: '当前库存量' },
          { name: 'unit', type: 'varchar(10)', comment: '计量单位 (kg/卷/pcs)' },
        ]
      },
      { 
        id: 'erp_supplier', name: 'supplier_master', rows: 320, recognizedAs: 'Supplier', confidence: 93,
        reasons: ['表名 supplier_master 匹配供应商档案', '包含 credit_level, contact_info'],
        fields: [
          { name: 'id', type: 'varchar(32)', comment: '主键' },
          { name: 'supplier_code', type: 'varchar(50)', comment: '供应商编码' },
          { name: 'supplier_name', type: 'varchar(100)', comment: '供应商名称' },
          { name: 'credit_level', type: 'varchar(10)', comment: '信用等级 (A/B/C/D)' },
          { name: 'contact_info', type: 'varchar(100)', comment: '联系方式' },
        ]
      },
    ]
  },
  { 
    id: 'plm', name: 'PLM 产品生命周期 (BOM)', type: 'postgresql', icon: Layers, color: 'text-purple-500',
    tables: [
      { 
        id: 'plm_bom_master', name: 'bom_master', rows: 340, recognizedAs: 'BOM', confidence: 96,
        reasons: ['表名 bom_master 强语义匹配', '包含 product_code, version'],
        fields: [
          { name: 'id', type: 'varchar(32)', comment: '主键' },
          { name: 'bom_no', type: 'varchar(50)', comment: 'BOM编号' },
          { name: 'product_code', type: 'varchar(50)', comment: '成品编码 (如: NCM-811电池包)' },
          { name: 'version', type: 'varchar(10)', comment: 'BOM版本 (如: V1.2)' },
          { name: 'is_active', type: 'boolean', comment: '是否生效' },
        ]
      },
      { 
        id: 'plm_material_spec', name: 'material_spec', rows: 1200, recognizedAs: 'MaterialSpec', confidence: 82,
        reasons: ['表名 material_spec 匹配物料规格', '包含 thickness, width 等物理属性'],
        fields: [
          { name: 'id', type: 'varchar(32)', comment: '主键' },
          { name: 'material_code', type: 'varchar(50)', comment: '物料编码' },
          { name: 'thickness_um', type: 'decimal(8,2)', comment: '厚度(微米) - 极片关键参数' },
          { name: 'width_mm', type: 'decimal(8,2)', comment: '宽度(毫米)' },
          { name: 'weight_tolerance', type: 'decimal(5,2)', comment: '面密度公差(%)' },
        ]
      },
    ]
  },
  { 
    id: 'qms', name: 'QMS 质量管理系统', type: 'sqlserver', icon: ShieldCheck, color: 'text-emerald-500',
    tables: [
      { 
        id: 'qms_inspection', name: 'inspection_record', rows: 85000, recognizedAs: 'QualityInspection', confidence: 91,
        reasons: ['表名 inspection_record 匹配质检记录', '包含 result, defect_code'],
        fields: [
          { name: 'id', type: 'varchar(32)', comment: '主键' },
          { name: 'batch_no', type: 'varchar(50)', comment: '电芯批次号' },
          { name: 'step_name', type: 'varchar(50)', comment: '工序 (如: 化成/分容/OCV测试)' },
          { name: 'internal_resistance', type: 'decimal(8,2)', comment: '内阻测试值(mΩ)' },
          { name: 'voltage_drop', type: 'decimal(8,2)', comment: '压降测试值(mV)' },
          { name: 'result', type: 'varchar(10)', comment: '判定结果 (OK/NG)' },
        ]
      },
      { 
        id: 'qms_spc', name: 'spc_control_data', rows: 450000, recognizedAs: 'SPCData', confidence: 95,
        reasons: ['表名 spc_control_data 匹配统计过程控制', '包含 cp, cpk, ucl, lcl'],
        fields: [
          { name: 'id', type: 'varchar(32)', comment: '主键' },
          { name: 'parameter_id', type: 'varchar(50)', comment: '管控参数 (如: 涂布面密度)' },
          { name: 'cpk_value', type: 'decimal(5,2)', comment: '过程能力指数 CPK' },
          { name: 'ucl', type: 'decimal(8,2)', comment: '控制上限 (Upper Control Limit)' },
          { name: 'lcl', type: 'decimal(8,2)', comment: '控制下限 (Lower Control Limit)' },
          { name: 'is_out_of_control', type: 'boolean', comment: '是否失控' },
        ]
      }
    ]
  },
  { 
    id: 'scada', name: 'SCADA / IoT 物联平台', type: 'timescaledb', icon: Activity, color: 'text-amber-500',
    tables: [
      { 
        id: 'iot_telemetry', name: 'telemetry_data', rows: 999999, recognizedAs: 'Telemetry', confidence: 98,
        reasons: ['表名 telemetry_data 匹配时序遥测数据', '包含 timestamp, value'],
        fields: [
          { name: 'time', type: 'timestamp', comment: '时间戳' },
          { name: 'device_id', type: 'varchar(32)', comment: '设备ID' },
          { name: 'sensor_tag', type: 'varchar(50)', comment: '测点标签 (如: oven_temp_zone1)' },
          { name: 'value', type: 'float', comment: '采集值' },
          { name: 'unit', type: 'varchar(10)', comment: '单位 (℃, MPa, m/min)' },
        ]
      }
    ]
  },
  { 
    id: 'crm', name: 'CRM 客户关系管理', type: 'salesforce', icon: Users, color: 'text-rose-500',
    tables: [
      { 
        id: 'crm_customer', name: 'customer_profile', rows: 850, recognizedAs: 'Customer', confidence: 94,
        reasons: ['表名 customer_profile 匹配客户档案', '包含 industry, account_manager'],
        fields: [
          { name: 'id', type: 'varchar(32)', comment: '主键' },
          { name: 'customer_name', type: 'varchar(100)', comment: '客户名称 (如: 某造车新势力)' },
          { name: 'industry', type: 'varchar(50)', comment: '所属行业 (乘用车/储能/两轮车)' },
          { name: 'account_manager', type: 'varchar(50)', comment: '客户经理' },
          { name: 'risk_level', type: 'varchar(20)', comment: '风险评级' },
        ]
      },
      { 
        id: 'crm_complaint', name: 'after_sales_ticket', rows: 3200, recognizedAs: 'CustomerComplaint', confidence: 97,
        reasons: ['表名 after_sales_ticket 匹配售后客诉', '包含 issue_type, battery_pack_sn'],
        fields: [
          { name: 'id', type: 'varchar(32)', comment: '主键' },
          { name: 'ticket_no', type: 'varchar(50)', comment: '客诉工单号' },
          { name: 'customer_id', type: 'varchar(32)', comment: '关联客户' },
          { name: 'battery_pack_sn', type: 'varchar(50)', comment: '电池包SN码 (用于追溯)' },
          { name: 'issue_type', type: 'varchar(50)', comment: '问题分类 (如: 压差大/漏液/热失控)' },
          { name: 'resolution_status', type: 'varchar(20)', comment: '处理状态 (新建/分析中/已结案)' },
        ]
      }
    ]
  },
  { 
    id: 'eam', name: 'EAM 设备资产管理', type: 'sqlserver', icon: Wrench, color: 'text-orange-500',
    tables: [
      { 
        id: 'eam_maintenance', name: 'maintenance_order', rows: 15000, recognizedAs: 'MaintenanceOrder', confidence: 96,
        reasons: ['表名 maintenance_order 匹配维修工单', '包含 maint_type, est_time'],
        fields: [
          { name: 'id', type: 'varchar(32)', comment: '主键' },
          { name: 'work_order_no', type: 'varchar(50)', comment: '维修工单号' },
          { name: 'device_id', type: 'varchar(32)', comment: '关联设备' },
          { name: 'maint_type', type: 'varchar(20)', comment: '维修类型 (预防性/纠正性)' },
          { name: 'est_time', type: 'decimal(5,1)', comment: '预计工时(小时)' },
          { name: 'status', type: 'varchar(20)', comment: '状态 (待分配/执行中/已完成)' },
        ]
      },
      { 
        id: 'eam_failure', name: 'equipment_failure_log', rows: 45000, recognizedAs: 'EquipmentFailure', confidence: 98,
        reasons: ['表名 equipment_failure_log 匹配故障记录', '包含 err_code, level'],
        fields: [
          { name: 'id', type: 'varchar(32)', comment: '主键' },
          { name: 'alarm_id', type: 'varchar(50)', comment: '报警编号' },
          { name: 'device_id', type: 'varchar(32)', comment: '发生设备' },
          { name: 'err_code', type: 'varchar(50)', comment: '故障代码 (如: ERR-SPINDLE-01)' },
          { name: 'level', type: 'varchar(10)', comment: '严重程度 (Critical/Warning)' },
          { name: 'time', type: 'timestamp', comment: '发生时间' },
        ]
      }
    ]
  },
  { 
    id: 'wms', name: 'WMS 仓储管理系统', type: 'mysql', icon: Box, color: 'text-teal-500',
    tables: [
      { 
        id: 'wms_spare_part', name: 'spare_part_inventory', rows: 8500, recognizedAs: 'SparePart', confidence: 95,
        reasons: ['表名 spare_part_inventory 匹配备件库存', '包含 qty_on_hand, bin_location'],
        fields: [
          { name: 'id', type: 'varchar(32)', comment: '主键' },
          { name: 'part_no', type: 'varchar(50)', comment: '备件编号 (如: SP-ROLLER-05)' },
          { name: 'part_name', type: 'varchar(100)', comment: '备件名称 (如: 涂布辊)' },
          { name: 'qty_on_hand', type: 'int', comment: '现有库存量' },
          { name: 'bin_location', type: 'varchar(50)', comment: '库位 (如: A-01-05)' },
        ]
      }
    ]
  },
  { 
    id: 'hrms', name: 'HRMS 人力资源管理', type: 'oracle', icon: Users, color: 'text-pink-500',
    tables: [
      { 
        id: 'hrms_employee', name: 'employee_roster', rows: 12000, recognizedAs: 'Technician', confidence: 88,
        reasons: ['表名 employee_roster 匹配员工花名册', '包含 certification, current_shift'],
        fields: [
          { name: 'id', type: 'varchar(32)', comment: '主键' },
          { name: 'employee_no', type: 'varchar(50)', comment: '工号' },
          { name: 'emp_name', type: 'varchar(50)', comment: '姓名' },
          { name: 'department', type: 'varchar(50)', comment: '部门 (如: 设备维修部)' },
          { name: 'certification', type: 'varchar(50)', comment: '技能认证级别 (如: 高级维修工)' },
          { name: 'current_shift', type: 'varchar(20)', comment: '当前班次 (白班/夜班)' },
        ]
      }
    ]
  }
];

const TEMPLATES = [
  { 
    id: 'tpl_factory', name: '工厂模板', category: '基础资源',
    structure: `{\n  "entity": "Factory",\n  "attributes": [\n    "factory_id", \n    "name", \n    "location",\n    "capacity"\n  ],\n  "relations": [\n    {"type": "contains", "target": "Workshop"}\n  ],\n  "behaviors": [\n    "calculate_overall_oee"\n  ]\n}`,
    mappings: [
      { source: 'factory_code', target: 'factory_id', status: 'mapped', auto: true },
      { source: 'factory_name', target: 'name', status: 'mapped', auto: true },
      { source: 'address', target: 'location', status: 'mapped', auto: true },
    ]
  },
  { 
    id: 'tpl_workshop', name: '车间模板', category: '基础资源',
    structure: `{\n  "entity": "Workshop",\n  "attributes": [\n    "workshop_id", \n    "type", \n    "manager"\n  ],\n  "relations": [\n    {"type": "belongs_to", "target": "Factory"},\n    {"type": "contains", "target": "ProductionLine"}\n  ],\n  "behaviors": [\n    "monitor_environment"\n  ]\n}`,
    mappings: [
      { source: 'ws_code', target: 'workshop_id', status: 'mapped', auto: true },
      { source: 'ws_type', target: 'type', status: 'mapped', auto: true },
      { source: 'manager_id', target: 'manager', status: 'mapped', auto: true },
    ]
  },
  { 
    id: 'tpl_line', name: '产线模板', category: '基础资源',
    structure: `{\n  "entity": "ProductionLine",\n  "attributes": [\n    "line_id", \n    "capacity", \n    "status",\n    "location"\n  ],\n  "relations": [\n    {"type": "belongs_to", "target": "Workshop"},\n    {"type": "contains", "target": "Device"},\n    {"type": "executes", "target": "WorkOrder"}\n  ],\n  "behaviors": [\n    "calculate_capacity",\n    "optimize_schedule"\n  ]\n}`,
    mappings: [
      { source: 'line_code', target: 'line_id', status: 'mapped', auto: true },
      { source: 'capacity_per_hour', target: 'capacity', status: 'mapped', auto: true },
      { source: 'current_status', target: 'status', status: 'mapped', auto: true },
      { source: 'workshop_id', target: 'location', status: 'unmapped', auto: false },
    ]
  },
  { 
    id: 'tpl_device', name: '设备模板', category: '基础资源',
    structure: `{\n  "entity": "Device",\n  "attributes": [\n    "device_id", \n    "type", \n    "install_date",\n    "status"\n  ],\n  "relations": [\n    {"type": "belongs_to", "target": "ProductionLine"},\n    {"type": "generates", "target": "Telemetry"},\n    {"type": "requires", "target": "MaintenanceOrder"}\n  ],\n  "behaviors": [\n    "predict_maintenance",\n    "report_fault"\n  ]\n}`,
    mappings: [
      { source: 'device_code', target: 'device_id', status: 'mapped', auto: true },
      { source: 'device_type', target: 'type', status: 'mapped', auto: true },
      { source: 'installation_date', target: 'install_date', status: 'mapped', auto: true },
      { source: 'status', target: 'status', status: 'mapped', auto: true },
    ]
  },
  { 
    id: 'tpl_material', name: '物料模板', category: '供应域',
    structure: `{\n  "entity": "Material",\n  "attributes": [\n    "material_id", \n    "name", \n    "type",\n    "supplier"\n  ],\n  "relations": [\n    {"type": "supplied_by", "target": "Supplier"},\n    {"type": "consumed_by", "target": "Batch"}\n  ],\n  "behaviors": [\n    "check_inventory"\n  ]\n}`,
    mappings: [
      { source: 'material_code', target: 'material_id', status: 'mapped', auto: true },
      { source: 'material_name', target: 'name', status: 'mapped', auto: true },
      { source: 'category', target: 'type', status: 'mapped', auto: true },
    ]
  },
  { 
    id: 'tpl_product', name: '产品模板', category: '供应域',
    structure: `{\n  "entity": "Product",\n  "attributes": [\n    "product_id", \n    "model", \n    "capacity_ah"\n  ],\n  "relations": [\n    {"type": "defined_by", "target": "BOM"},\n    {"type": "produced_by", "target": "WorkOrder"}\n  ],\n  "behaviors": [\n    "track_lifecycle"\n  ]\n}`,
    mappings: [
      { source: 'product_code', target: 'product_id', status: 'mapped', auto: true },
      { source: 'model_name', target: 'model', status: 'mapped', auto: true },
      { source: 'nominal_capacity', target: 'capacity_ah', status: 'mapped', auto: true },
    ]
  },
  { 
    id: 'tpl_bom', name: 'BOM模板', category: '供应域',
    structure: `{\n  "entity": "BOM",\n  "attributes": [\n    "bom_id", \n    "product_code", \n    "version",\n    "active"\n  ],\n  "relations": [\n    {"type": "defines", "target": "Product"},\n    {"type": "requires", "target": "MaterialSpec"}\n  ],\n  "behaviors": [\n    "version_control",\n    "explode_bom"\n  ]\n}`,
    mappings: [
      { source: 'bom_no', target: 'bom_id', status: 'mapped', auto: true },
      { source: 'product_code', target: 'product_code', status: 'mapped', auto: true },
      { source: 'version', target: 'version', status: 'mapped', auto: true },
      { source: 'is_active', target: 'active', status: 'mapped', auto: true },
    ]
  },
  { 
    id: 'tpl_so', name: '销售订单模板', category: '生产域',
    structure: `{\n  "entity": "SalesOrder",\n  "attributes": [\n    "so_id", \n    "customer", \n    "delivery_date"\n  ],\n  "relations": [\n    {"type": "includes", "target": "Product"},\n    {"type": "fulfilled_by", "target": "WorkOrder"}\n  ],\n  "behaviors": [\n    "track_delivery"\n  ]\n}`,
    mappings: [
      { source: 'order_no', target: 'so_id', status: 'mapped', auto: true },
      { source: 'customer_id', target: 'customer', status: 'mapped', auto: true },
      { source: 'delivery_date', target: 'delivery_date', status: 'mapped', auto: true },
    ]
  },
  { 
    id: 'tpl_wo', name: '工单模板', category: '生产域',
    structure: `{\n  "entity": "WorkOrder",\n  "attributes": [\n    "wo_id", \n    "product_id", \n    "planned_qty",\n    "actual_qty",\n    "status"\n  ],\n  "relations": [\n    {"type": "fulfills", "target": "SalesOrder"},\n    {"type": "produces", "target": "Product"},\n    {"type": "generates", "target": "Batch"}\n  ],\n  "behaviors": [\n    "track_progress",\n    "calculate_yield"\n  ]\n}`,
    mappings: [
      { source: 'wo_number', target: 'wo_id', status: 'mapped', auto: true },
      { source: 'product_id', target: 'product_id', status: 'mapped', auto: true },
      { source: 'planned_qty', target: 'planned_qty', status: 'mapped', auto: true },
      { source: 'actual_qty', target: 'actual_qty', status: 'mapped', auto: true },
      { source: 'status', target: 'status', status: 'mapped', auto: true },
    ]
  },
  { 
    id: 'tpl_batch', name: '批次模板', category: '生产域',
    structure: `{\n  "entity": "Batch",\n  "attributes": [\n    "batch_id", \n    "step", \n    "qty"\n  ],\n  "relations": [\n    {"type": "belongs_to", "target": "WorkOrder"},\n    {"type": "processed_on", "target": "Device"},\n    {"type": "consumes", "target": "Material"},\n    {"type": "consumes", "target": "Batch"}\n  ],\n  "behaviors": [\n    "trace_genealogy"\n  ]\n}`,
    mappings: [
      { source: 'batch_no', target: 'batch_id', status: 'mapped', auto: true },
      { source: 'process_step', target: 'step', status: 'mapped', auto: true },
      { source: 'quantity', target: 'qty', status: 'mapped', auto: true },
    ]
  },
  { 
    id: 'tpl_quality', name: '质检模板', category: '质量与运维',
    structure: `{\n  "entity": "QualityInspection",\n  "attributes": [\n    "inspection_id", \n    "batch_no", \n    "step",\n    "resistance",\n    "voltage_drop",\n    "result"\n  ],\n  "relations": [\n    {"type": "inspects", "target": "Batch"},\n    {"type": "triggers", "target": "CustomerComplaint"}\n  ],\n  "behaviors": [\n    "evaluate_pass_fail",\n    "generate_spc_alert"\n  ]\n}`,
    mappings: [
      { source: 'id', target: 'inspection_id', status: 'mapped', auto: true },
      { source: 'batch_no', target: 'batch_no', status: 'mapped', auto: true },
      { source: 'step_name', target: 'step', status: 'mapped', auto: true },
      { source: 'internal_resistance', target: 'resistance', status: 'mapped', auto: true },
      { source: 'voltage_drop', target: 'voltage_drop', status: 'mapped', auto: true },
      { source: 'result', target: 'result', status: 'mapped', auto: true },
    ]
  },
  { 
    id: 'tpl_telemetry', name: '时序遥测模板', category: '质量与运维',
    structure: `{\n  "entity": "Telemetry",\n  "attributes": [\n    "timestamp", \n    "sensor_tag", \n    "value"\n  ],\n  "relations": [\n    {"type": "measured_on", "target": "Device"}\n  ],\n  "behaviors": [\n    "aggregate_data"\n  ]\n}`,
    mappings: [
      { source: 'time', target: 'timestamp', status: 'mapped', auto: true },
      { source: 'sensor_tag', target: 'sensor_tag', status: 'mapped', auto: true },
      { source: 'value', target: 'value', status: 'mapped', auto: true },
    ]
  },
  { 
    id: 'tpl_fault', name: '故障事件模板', category: '质量与运维',
    structure: `{\n  "entity": "EquipmentFailure",\n  "attributes": [\n    "fault_id", \n    "error_code", \n    "severity",\n    "timestamp"\n  ],\n  "relations": [\n    {"type": "occurs_on", "target": "Device"},\n    {"type": "triggers", "target": "MaintenanceOrder"}\n  ],\n  "behaviors": [\n    "analyze_root_cause"\n  ]\n}`,
    mappings: [
      { source: 'alarm_id', target: 'fault_id', status: 'mapped', auto: true },
      { source: 'err_code', target: 'error_code', status: 'mapped', auto: true },
      { source: 'level', target: 'severity', status: 'mapped', auto: true },
      { source: 'time', target: 'timestamp', status: 'mapped', auto: true },
    ]
  },
  { 
    id: 'tpl_maintenance', name: '维修工单模板', category: '质量与运维',
    structure: `{\n  "entity": "MaintenanceOrder",\n  "attributes": [\n    "mo_id", \n    "type", \n    "status",\n    "estimated_hours"\n  ],\n  "relations": [\n    {"type": "resolves", "target": "EquipmentFailure"},\n    {"type": "consumes", "target": "SparePart"},\n    {"type": "assigned_to", "target": "Technician"}\n  ],\n  "behaviors": [\n    "track_repair_time"\n  ]\n}`,
    mappings: [
      { source: 'work_order_no', target: 'mo_id', status: 'mapped', auto: true },
      { source: 'maint_type', target: 'type', status: 'mapped', auto: true },
      { source: 'status', target: 'status', status: 'mapped', auto: true },
      { source: 'est_time', target: 'estimated_hours', status: 'mapped', auto: true },
    ]
  },
  { 
    id: 'tpl_sparepart', name: '备件模板', category: '质量与运维',
    structure: `{\n  "entity": "SparePart",\n  "attributes": [\n    "part_id", \n    "name", \n    "stock_qty",\n    "location"\n  ],\n  "relations": [\n    {"type": "consumed_by", "target": "MaintenanceOrder"}\n  ],\n  "behaviors": [\n    "check_availability"\n  ]\n}`,
    mappings: [
      { source: 'part_no', target: 'part_id', status: 'mapped', auto: true },
      { source: 'part_name', target: 'name', status: 'mapped', auto: true },
      { source: 'qty_on_hand', target: 'stock_qty', status: 'mapped', auto: true },
      { source: 'bin_location', target: 'location', status: 'mapped', auto: true },
    ]
  },
  { 
    id: 'tpl_technician', name: '技术员模板', category: '需求域',
    structure: `{\n  "entity": "Technician",\n  "attributes": [\n    "emp_id", \n    "name", \n    "skill_level",\n    "shift"\n  ],\n  "relations": [\n    {"type": "executes", "target": "MaintenanceOrder"}\n  ],\n  "behaviors": [\n    "assign_task"\n  ]\n}`,
    mappings: [
      { source: 'employee_no', target: 'emp_id', status: 'mapped', auto: true },
      { source: 'emp_name', target: 'name', status: 'mapped', auto: true },
      { source: 'certification', target: 'skill_level', status: 'mapped', auto: true },
      { source: 'current_shift', target: 'shift', status: 'mapped', auto: true },
    ]
  },
  { 
    id: 'tpl_customer', name: '客户模板', category: '需求域',
    structure: `{\n  "entity": "Customer",\n  "attributes": [\n    "customer_id", \n    "name", \n    "region",\n    "tier"\n  ],\n  "relations": [\n    {"type": "places", "target": "SalesOrder"}\n  ],\n  "behaviors": [\n    "calculate_satisfaction"\n  ]\n}`,
    mappings: [
      { source: 'cust_code', target: 'customer_id', status: 'mapped', auto: true },
      { source: 'cust_name', target: 'name', status: 'mapped', auto: true },
      { source: 'sales_region', target: 'region', status: 'mapped', auto: true },
      { source: 'priority', target: 'tier', status: 'mapped', auto: true },
    ]
  },
];

const SCENARIOS_DATA: Record<string, { name: string, nodes: any[], edges: any[] }> = {
  failure_impact: {
    name: '设备故障影响评估 (COATER-01)',
    nodes: [
      { id: 'FAIL-001', label: '主轴卡死 (当前故障)', type: 'EquipmentFailure', x: 0, y: -100 },
      { id: 'COATER-01', label: '涂布机-01', type: '设备', x: -150, y: 0 },
      { id: 'LINE-1', label: '涂布一线 (受影响产线)', type: 'ProductionLine', x: -300, y: 0 },
      { id: 'MAINT-NEW', label: '维修单-更换主轴', type: 'MaintenanceOrder', x: 150, y: 0 },
      { id: 'MAINT-HIST', label: '历史维修单 (3个月前)', type: 'MaintenanceOrder', x: -150, y: 150 },
      { id: 'SP-ROLLER-05', label: '备件-涂布辊 (库存:充足)', type: 'SparePart', x: 150, y: 150 },
      { id: 'WH-SPARE', label: 'A栋备件仓 (库位:A-12)', type: 'Workshop', x: 300, y: 150 },
      { id: 'SUPP-MECH', label: '机械供应商 (L/T:3天, 成本:高)', type: 'Supplier', x: 150, y: 250 },
      { id: 'TECH-ZHANG', label: '张三 (高级维修工)', type: 'Technician', x: 300, y: 0 },
    ],
    edges: [
      { id: 'e1', source: 'FAIL-001', target: 'COATER-01', label: '发生于' },
      { id: 'e2', source: 'COATER-01', target: 'LINE-1', label: '属于' },
      { id: 'e3', source: 'FAIL-001', target: 'MAINT-NEW', label: '触发' },
      { id: 'e4', source: 'COATER-01', target: 'MAINT-HIST', label: '拥有历史' },
      { id: 'e5', source: 'MAINT-NEW', target: 'SP-ROLLER-05', label: '消耗' },
      { id: 'e6', source: 'SP-ROLLER-05', target: 'WH-SPARE', label: '存储于' },
      { id: 'e7', source: 'SP-ROLLER-05', target: 'SUPP-MECH', label: '由...供应' },
      { id: 'e8', source: 'MAINT-NEW', target: 'TECH-ZHANG', label: '分配给' },
    ]
  },
  line_schedule: {
    name: '产线排产计划 (LINE-A)',
    nodes: [
      { id: 'LINE-A', label: '涂布一线 (OEE:85%)', type: 'ProductionLine', x: -200, y: 0 },
      { id: 'WO-0318', label: 'WO-20260318-01', type: 'WorkOrder', x: 0, y: 0 },
      { id: 'PROD-LFP', label: 'Cell-LFP-280Ah', type: 'Product', x: 200, y: -100 },
      { id: 'SO-202603', label: 'SO-202603 (加急)', type: 'SalesOrder', x: 200, y: 100 },
      { id: 'CUST-XPENG', label: '小鹏汽车 (VIP客户)', type: 'Customer', x: 0, y: 150 },
      { id: 'MAT-SLURRY', label: 'LFP浆料 (库存:充足)', type: 'Material', x: -200, y: 150 },
      { id: 'SHIFT-A', label: '白班班组 (缺1人)', type: 'Batch', x: -200, y: -150 },
      { id: 'COATER-01', label: '涂布机-01 (运行中)', type: '设备', x: -400, y: 0 },
    ],
    edges: [
      { id: 'e1', source: 'WO-0318', target: 'LINE-A', label: '分配给' },
      { id: 'e2', source: 'WO-0318', target: 'PROD-LFP', label: '生产' },
      { id: 'e3', source: 'WO-0318', target: 'SO-202603', label: '履行' },
      { id: 'e4', source: 'SO-202603', target: 'CUST-XPENG', label: '由...下达' },
      { id: 'e5', source: 'WO-0318', target: 'MAT-SLURRY', label: '需要' },
      { id: 'e6', source: 'LINE-A', target: 'SHIFT-A', label: '由...操作' },
      { id: 'e7', source: 'COATER-01', target: 'LINE-A', label: '属于' },
    ]
  },
  quality_trace: {
    name: '质量追溯 (LOT-C-001)',
    nodes: [
      { id: 'LOT-C-001', label: 'LOT-C-001 (异常批次)', type: 'Batch', x: 0, y: 0 },
      { id: 'QI-001', label: '面密度偏低 (NG)', type: 'QualityInspection', x: -200, y: -100 },
      { id: 'COATER-01', label: '涂布机-01', type: '设备', x: 200, y: -100 },
      { id: 'TEL-TEMP', label: '烘箱温度 (波动)', type: 'Telemetry', x: 400, y: -100 },
      { id: 'MAT-ANODE', label: '负极浆料 (LOT-A-09)', type: 'Material', x: -200, y: 100 },
      { id: 'SUPP-LITHIUM', label: '天齐锂业', type: 'Supplier', x: -400, y: 100 },
      { id: 'TECH-LI', label: '李四 (操作工)', type: 'Technician', x: 200, y: 100 },
      { id: 'WO-0315', label: '生产工单-0315', type: 'WorkOrder', x: 0, y: 150 },
    ],
    edges: [
      { id: 'e1', source: 'LOT-C-001', target: 'QI-001', label: '由...检验' },
      { id: 'e2', source: 'LOT-C-001', target: 'COATER-01', label: '加工于' },
      { id: 'e3', source: 'COATER-01', target: 'TEL-TEMP', label: '产生' },
      { id: 'e4', source: 'LOT-C-001', target: 'MAT-ANODE', label: '消耗' },
      { id: 'e5', source: 'MAT-ANODE', target: 'SUPP-LITHIUM', label: '由...供应' },
      { id: 'e6', source: 'LOT-C-001', target: 'TECH-LI', label: '由...操作' },
      { id: 'e7', source: 'LOT-C-001', target: 'WO-0315', label: '属于' },
    ]
  },
  supply_chain: {
    name: '供应链协同 (MAT-CATHODE)',
    nodes: [
      { id: 'MAT-CATHODE', label: '正极材料 (NCM811)', type: 'Material', x: 0, y: 0 },
      { id: 'SUPP-SHANSHAN', label: '杉杉股份 (核心供应商)', type: 'Supplier', x: -200, y: -100 },
      { id: 'PO-202603', label: '采购单-03 (在途)', type: 'WorkOrder', x: 200, y: -100 },
      { id: 'LOGISTICS-01', label: '顺丰冷链 (预计明天达)', type: 'Telemetry', x: 400, y: -100 },
      { id: 'WH-RAW', label: '原料仓 (库容:80%)', type: 'Workshop', x: -200, y: 100 },
      { id: 'QI-INCOMING', label: 'IQC检验标准', type: 'QualityInspection', x: 200, y: 100 },
      { id: 'PROD-NCM', label: 'Cell-NCM-100Ah', type: 'Product', x: 0, y: 150 },
    ],
    edges: [
      { id: 'e1', source: 'MAT-CATHODE', target: 'SUPP-SHANSHAN', label: '由...供应' },
      { id: 'e2', source: 'PO-202603', target: 'MAT-CATHODE', label: '采购' },
      { id: 'e3', source: 'PO-202603', target: 'LOGISTICS-01', label: '由...追踪' },
      { id: 'e4', source: 'MAT-CATHODE', target: 'WH-RAW', label: '存储于' },
      { id: 'e5', source: 'MAT-CATHODE', target: 'QI-INCOMING', label: '需要' },
      { id: 'e6', source: 'PROD-NCM', target: 'MAT-CATHODE', label: '消耗' },
    ]
  },
  energy_consumption: {
    name: '能耗异常分析 (OVEN-03)',
    nodes: [
      { id: 'OVEN-03', label: '烘烤箱-03 (能耗飙升)', type: '设备', x: 0, y: 0 },
      { id: 'TEL-ELEC', label: '电表-03 (150kWh)', type: 'Telemetry', x: -200, y: -100 },
      { id: 'TEL-TEMP', label: '内部温度 (偏低)', type: 'Telemetry', x: -200, y: 100 },
      { id: 'LINE-B', label: '烘烤二线', type: 'ProductionLine', x: 200, y: -100 },
      { id: 'WS-BAKING', label: '烘烤车间', type: 'Workshop', x: 400, y: -100 },
      { id: 'WO-0310', label: '工单-0310', type: 'WorkOrder', x: 200, y: 100 },
      { id: 'PROD-LFP', label: '单耗基准 (1.2kWh/pcs)', type: 'Product', x: 400, y: 100 },
    ],
    edges: [
      { id: 'e1', source: 'OVEN-03', target: 'TEL-ELEC', label: '由...监控' },
      { id: 'e2', source: 'OVEN-03', target: 'TEL-TEMP', label: '由...监控' },
      { id: 'e3', source: 'OVEN-03', target: 'LINE-B', label: '属于' },
      { id: 'e4', source: 'LINE-B', target: 'WS-BAKING', label: '位于' },
      { id: 'e5', source: 'WO-0310', target: 'OVEN-03', label: '执行于' },
      { id: 'e6', source: 'WO-0310', target: 'PROD-LFP', label: '生产' },
    ]
  },
  maintenance_plan: {
    name: '预防性维护排程 (WINDER-02)',
    nodes: [
      { id: 'WINDER-02', label: '卷绕机-02 (运行:500h)', type: '设备', x: 0, y: 0 },
      { id: 'PM-202604', label: '4月月度保养 (计划)', type: 'MaintenanceOrder', x: -200, y: -100 },
      { id: 'TECH-WANG', label: '王五 (排班:周二)', type: 'Technician', x: 200, y: -100 },
      { id: 'SP-BEARING', label: '备件-轴承 (库存:0)', type: 'SparePart', x: -200, y: 100 },
      { id: 'PO-SPARE', label: '采购单-轴承 (在途)', type: 'WorkOrder', x: -400, y: 100 },
      { id: 'LINE-WIND', label: '卷绕产线 (排产满)', type: 'ProductionLine', x: 200, y: 100 },
    ],
    edges: [
      { id: 'e1', source: 'PM-202604', target: 'WINDER-02', label: '维护' },
      { id: 'e2', source: 'PM-202604', target: 'TECH-WANG', label: '分配给' },
      { id: 'e3', source: 'PM-202604', target: 'SP-BEARING', label: '需要' },
      { id: 'e4', source: 'PO-SPARE', target: 'SP-BEARING', label: '补充' },
      { id: 'e5', source: 'WINDER-02', target: 'LINE-WIND', label: '属于' },
    ]
  },
  yield_analysis: {
    name: '良率波动诊断 (CELL-BATCH-05)',
    nodes: [
      { id: 'CELL-BATCH-05', label: '电芯批次-05 (良率88%)', type: 'Batch', x: 0, y: 0 },
      { id: 'QI-CAPACITY', label: '容量测试 (低容)', type: 'QualityInspection', x: -200, y: -100 },
      { id: 'FORMATION-01', label: '化成柜-01', type: '设备', x: 200, y: -100 },
      { id: 'TEL-VOLTAGE', label: '化成电压曲线 (异常)', type: 'Telemetry', x: 400, y: -100 },
      { id: 'WO-0319', label: 'WO-20260319', type: 'WorkOrder', x: -200, y: 100 },
      { id: 'MAT-ELECTROLYTE', label: '电解液 (LOT-E-12)', type: 'Material', x: 200, y: 100 },
    ],
    edges: [
      { id: 'e1', source: 'CELL-BATCH-05', target: 'QI-CAPACITY', label: '由...检验' },
      { id: 'e2', source: 'CELL-BATCH-05', target: 'FORMATION-01', label: '加工于' },
      { id: 'e3', source: 'FORMATION-01', target: 'TEL-VOLTAGE', label: '产生' },
      { id: 'e4', source: 'CELL-BATCH-05', target: 'WO-0319', label: '属于' },
      { id: 'e5', source: 'CELL-BATCH-05', target: 'MAT-ELECTROLYTE', label: '消耗' },
    ]
  },
  inventory_warning: {
    name: '备件库存预警 (SP-ROLLER-05)',
    nodes: [
      { id: 'SP-ROLLER-05', label: '备件-涂布辊 (库存:1)', type: 'SparePart', x: 0, y: 0 },
      { id: 'SUPP-ROLLER', label: '辊轴供应商 (L/T:15天)', type: 'Supplier', x: -200, y: -100 },
      { id: 'WH-SPARE', label: '备件仓 (安全库存:3)', type: 'Workshop', x: 200, y: -100 },
      { id: 'MAINT-URGENT', label: '紧急抢修单 (需1个)', type: 'MaintenanceOrder', x: -200, y: 100 },
      { id: 'COATER-02', label: '涂布机-02 (待修)', type: '设备', x: 0, y: 150 },
      { id: 'PO-AUTO', label: '自动触发采购单', type: 'WorkOrder', x: 200, y: 100 },
    ],
    edges: [
      { id: 'e1', source: 'SP-ROLLER-05', target: 'SUPP-ROLLER', label: '由...供应' },
      { id: 'e2', source: 'SP-ROLLER-05', target: 'WH-SPARE', label: '存储于' },
      { id: 'e3', source: 'MAINT-URGENT', target: 'SP-ROLLER-05', label: '需要' },
      { id: 'e4', source: 'MAINT-URGENT', target: 'COATER-02', label: '维护' },
      { id: 'e5', source: 'PO-AUTO', target: 'SP-ROLLER-05', label: '补充' },
    ]
  },
  customer_complaint: {
    name: '客户投诉溯源 (CUST-XPENG-001)',
    nodes: [
      { id: 'CUST-XPENG', label: '小鹏汽车 (投诉:续航短)', type: 'Customer', x: 0, y: 0 },
      { id: 'SO-202601', label: 'SO-202601 (历史订单)', type: 'SalesOrder', x: -200, y: -100 },
      { id: 'PROD-LFP', label: 'Cell-LFP-280Ah', type: 'Product', x: 200, y: -100 },
      { id: 'LOT-C-001', label: 'LOT-C-001 (发货批次)', type: 'Batch', x: -200, y: 100 },
      { id: 'QI-001', label: '出货检验 (当时OK)', type: 'QualityInspection', x: 0, y: 150 },
      { id: 'MAT-CATHODE', label: '正极材料 (追溯源头)', type: 'Material', x: 200, y: 100 },
      { id: 'SUPP-SHANSHAN', label: '杉杉股份 (材料供应商)', type: 'Supplier', x: 400, y: 100 },
      { id: 'LINE-1', label: '涂布一线 (生产线)', type: 'ProductionLine', x: -400, y: 100 },
    ],
    edges: [
      { id: 'e1', source: 'SO-202601', target: 'CUST-XPENG', label: '由...下达' },
      { id: 'e2', source: 'SO-202601', target: 'PROD-LFP', label: '包含' },
      { id: 'e3', source: 'LOT-C-001', target: 'PROD-LFP', label: '是...的实例' },
      { id: 'e4', source: 'LOT-C-001', target: 'QI-001', label: '由...检验' },
      { id: 'e5', source: 'LOT-C-001', target: 'MAT-CATHODE', label: '消耗' },
      { id: 'e6', source: 'MAT-CATHODE', target: 'SUPP-SHANSHAN', label: '由...供应' },
      { id: 'e7', source: 'LOT-C-001', target: 'LINE-1', label: '加工于' },
    ]
  },
  worker_schedule: {
    name: '关键岗位人员排班 (TECH-ZHANG)',
    nodes: [
      { id: 'TECH-ZHANG', label: '张三 (高级涂布工)', type: 'Technician', x: 0, y: 0 },
      { id: 'SHIFT-NIGHT', label: '夜班 (疲劳度高)', type: 'Batch', x: -200, y: -100 },
      { id: 'LINE-1', label: '涂布一线', type: 'ProductionLine', x: 200, y: -100 },
      { id: 'WS-COATING', label: '涂布车间', type: 'Workshop', x: 400, y: -100 },
      { id: 'CERT-01', label: '特种作业证 (下月过期)', type: 'QualityInspection', x: -200, y: 100 },
      { id: 'MAINT-TASK', label: '临时维修任务', type: 'MaintenanceOrder', x: 200, y: 100 },
      { id: 'COATER-01', label: '涂布机-01', type: '设备', x: 400, y: 100 },
    ],
    edges: [
      { id: 'e1', source: 'TECH-ZHANG', target: 'SHIFT-NIGHT', label: '分配给' },
      { id: 'e2', source: 'SHIFT-NIGHT', target: 'LINE-1', label: '操作' },
      { id: 'e3', source: 'LINE-1', target: 'WS-COATING', label: '位于' },
      { id: 'e4', source: 'TECH-ZHANG', target: 'CERT-01', label: '持有' },
      { id: 'e5', source: 'MAINT-TASK', target: 'TECH-ZHANG', label: '分配给' },
      { id: 'e6', source: 'MAINT-TASK', target: 'COATER-01', label: '维护' },
    ]
  },
  material_shortage: {
    name: '物料短缺影响评估 (MAT-ANODE)',
    nodes: [
      { id: 'MAT-ANODE', label: '负极材料 (缺口:5吨)', type: 'Material', x: 0, y: 0 },
      { id: 'BOM-LFP', label: 'BOM-LFP-280', type: 'BOM', x: -200, y: -100 },
      { id: 'PROD-LFP', label: 'Cell-LFP-280Ah', type: 'Product', x: 200, y: -100 },
      { id: 'WO-0320', label: 'WO-20260320 (停工待料)', type: 'WorkOrder', x: -200, y: 100 },
      { id: 'SO-202605', label: 'SO-202605 (违约风险)', type: 'SalesOrder', x: 0, y: 150 },
      { id: 'SUPP-ANODE', label: '负极供应商 (交期延误)', type: 'Supplier', x: 200, y: 100 },
      { id: 'LINE-3', label: '涂布三线 (受影响产线)', type: 'ProductionLine', x: 400, y: 100 },
      { id: 'LOGISTICS-02', label: '跨省物流 (在途:2天)', type: 'Telemetry', x: 400, y: 0 },
    ],
    edges: [
      { id: 'e1', source: 'BOM-LFP', target: 'MAT-ANODE', label: '需要' },
      { id: 'e2', source: 'BOM-LFP', target: 'PROD-LFP', label: '定义' },
      { id: 'e3', source: 'WO-0320', target: 'PROD-LFP', label: '生产' },
      { id: 'e4', source: 'WO-0320', target: 'SO-202605', label: '履行' },
      { id: 'e5', source: 'MAT-ANODE', target: 'SUPP-ANODE', label: '由...供应' },
      { id: 'e6', source: 'WO-0320', target: 'LINE-3', label: '分配给' },
      { id: 'e7', source: 'SUPP-ANODE', target: 'LOGISTICS-02', label: '通过...运输' },
    ]
  },
  order_delay: {
    name: '订单延期风险预测 (SO-202604)',
    nodes: [
      { id: 'SO-202604', label: 'SO-202604 (订单)', type: 'SalesOrder', x: 0, y: 0 },
      { id: 'WO-0321', label: 'WO-20260321', type: 'WorkOrder', x: -200, y: -100 },
      { id: 'LINE-2', label: '涂布二线', type: 'ProductionLine', x: 200, y: -100 },
      { id: 'FAIL-002', label: '烘箱温度异常', type: 'EquipmentFailure', x: 0, y: 150 },
      { id: 'CUST-AITO', label: '问界 (客户)', type: 'Customer', x: -200, y: 150 },
      { id: 'MAINT-URGENT', label: '紧急抢修单', type: 'MaintenanceOrder', x: 200, y: 150 },
      { id: 'SP-HEATER', label: '加热管备件 (库存:0)', type: 'SparePart', x: 400, y: 150 },
    ],
    edges: [
      { id: 'e1', source: 'WO-0321', target: 'SO-202604', label: '履行' },
      { id: 'e2', source: 'WO-0321', target: 'LINE-2', label: '分配给' },
      { id: 'e3', source: 'FAIL-002', target: 'LINE-2', label: '影响' },
      { id: 'e4', source: 'SO-202604', target: 'CUST-AITO', label: '由...下达' },
      { id: 'e5', source: 'FAIL-002', target: 'MAINT-URGENT', label: '触发' },
      { id: 'e6', source: 'MAINT-URGENT', target: 'SP-HEATER', label: '需要' },
    ]
  },
  equipment_upgrade: {
    name: '设备技改停机评估 (LINE-2)',
    nodes: [
      { id: 'LINE-2', label: '涂布二线', type: 'ProductionLine', x: 0, y: 0 },
      { id: 'COATER-02', label: '涂布机-02', type: '设备', x: -200, y: -100 },
      { id: 'MAINT-UPGRADE', label: '技改工单-01', type: 'MaintenanceOrder', x: 200, y: -100 },
      { id: 'TECH-LI', label: '李四 (工程师)', type: 'Technician', x: 0, y: 150 },
      { id: 'WO-0325', label: '受影响生产工单', type: 'WorkOrder', x: -200, y: 150 },
      { id: 'SP-SENSOR', label: '新型传感器备件', type: 'SparePart', x: 200, y: 150 },
    ],
    edges: [
      { id: 'e1', source: 'COATER-02', target: 'LINE-2', label: '属于' },
      { id: 'e2', source: 'MAINT-UPGRADE', target: 'COATER-02', label: '升级' },
      { id: 'e3', source: 'MAINT-UPGRADE', target: 'TECH-LI', label: '分配给' },
      { id: 'e4', source: 'MAINT-UPGRADE', target: 'WO-0325', label: '延迟' },
      { id: 'e5', source: 'MAINT-UPGRADE', target: 'SP-SENSOR', label: '安装' },
    ]
  },
  process_optimization: {
    name: '工艺参数优化验证 (RECIPE-002)',
    nodes: [
      { id: 'RECIPE-002', label: '工艺配方-002', type: 'BOM', x: 0, y: 0 },
      { id: 'PROD-NCM', label: 'Cell-NCM-100Ah', type: 'Product', x: -200, y: -100 },
      { id: 'LOT-TEST-01', label: '实验批次-01', type: 'Batch', x: 200, y: -100 },
      { id: 'QI-PERFORMANCE', label: '性能测试', type: 'QualityInspection', x: 0, y: 150 },
      { id: 'LINE-LAB', label: '实验产线', type: 'ProductionLine', x: -200, y: 150 },
      { id: 'MAT-NEW-ADDITIVE', label: '新型添加剂', type: 'Material', x: 200, y: 150 },
    ],
    edges: [
      { id: 'e1', source: 'RECIPE-002', target: 'PROD-NCM', label: '定义' },
      { id: 'e2', source: 'LOT-TEST-01', target: 'RECIPE-002', label: '使用' },
      { id: 'e3', source: 'LOT-TEST-01', target: 'QI-PERFORMANCE', label: '由...检验' },
      { id: 'e4', source: 'LOT-TEST-01', target: 'LINE-LAB', label: '加工于' },
      { id: 'e5', source: 'RECIPE-002', target: 'MAT-NEW-ADDITIVE', label: '包含' },
    ]
  },
  supplier_evaluation: {
    name: '供应商质量评估 (SUPP-LITHIUM)',
    nodes: [
      { id: 'SUPP-LITHIUM', label: '天齐锂业', type: 'Supplier', x: 0, y: 0 },
      { id: 'MAT-LITHIUM', label: '碳酸锂', type: 'Material', x: -200, y: -100 },
      { id: 'QI-INCOMING', label: '来料检验', type: 'QualityInspection', x: 200, y: -100 },
      { id: 'LOT-RAW-05', label: '原料批次-05', type: 'Batch', x: 0, y: 150 },
      { id: 'PO-202602', label: '历史采购单', type: 'WorkOrder', x: -200, y: 150 },
      { id: 'LOGISTICS-03', label: '物流时效 (平均3天)', type: 'Telemetry', x: 200, y: 150 },
    ],
    edges: [
      { id: 'e1', source: 'MAT-LITHIUM', target: 'SUPP-LITHIUM', label: '由...供应' },
      { id: 'e2', source: 'LOT-RAW-05', target: 'MAT-LITHIUM', label: '是...的实例' },
      { id: 'e3', source: 'LOT-RAW-05', target: 'QI-INCOMING', label: '由...检验' },
      { id: 'e4', source: 'PO-202602', target: 'SUPP-LITHIUM', label: '采购自' },
      { id: 'e5', source: 'SUPP-LITHIUM', target: 'LOGISTICS-03', label: '由...评估' },
    ]
  },
  logistics_tracking: {
    name: '成品发货物流追踪 (SHIP-009)',
    nodes: [
      { id: 'SHIP-009', label: '发货单-009', type: 'SalesOrder', x: 0, y: 0 },
      { id: 'CUST-ARCFOX', label: '极狐汽车', type: 'Customer', x: -200, y: -100 },
      { id: 'PROD-PACK', label: 'Battery-Pack-100kWh', type: 'Product', x: 200, y: -100 },
      { id: 'FAC-SHANGHAI', label: '上海临港工厂', type: 'Factory', x: 0, y: 150 },
      { id: 'LOGISTICS-04', label: '冷链运输 (温度:22℃)', type: 'Telemetry', x: -200, y: 150 },
      { id: 'WH-FINISHED', label: '成品仓 (出库)', type: 'Workshop', x: 200, y: 150 },
    ],
    edges: [
      { id: 'e1', source: 'SHIP-009', target: 'CUST-ARCFOX', label: '交付给' },
      { id: 'e2', source: 'SHIP-009', target: 'PROD-PACK', label: '包含' },
      { id: 'e3', source: 'SHIP-009', target: 'FAC-SHANGHAI', label: '发货自' },
      { id: 'e4', source: 'SHIP-009', target: 'LOGISTICS-04', label: '由...追踪' },
      { id: 'e5', source: 'SHIP-009', target: 'WH-FINISHED', label: '离开自' },
    ]
  },
  environmental_monitor: {
    name: '车间环境温湿度监控 (WS-CLEANROOM)',
    nodes: [
      { id: 'WS-CLEANROOM', label: '注液无尘车间', type: 'Workshop', x: 0, y: 0 },
      { id: 'TEL-TEMP', label: '温湿度传感器', type: 'Telemetry', x: -200, y: -100 },
      { id: 'LOT-INJECT-01', label: '注液批次-01', type: 'Batch', x: 200, y: -100 },
      { id: 'QI-MOISTURE', label: '水分检测', type: 'QualityInspection', x: 0, y: 150 },
      { id: 'DEVICE-HVAC', label: '空调机组 (高负荷)', type: '设备', x: -200, y: 150 },
      { id: 'MAINT-HVAC', label: '空调维保工单', type: 'MaintenanceOrder', x: 200, y: 150 },
    ],
    edges: [
      { id: 'e1', source: 'TEL-TEMP', target: 'WS-CLEANROOM', label: '监控' },
      { id: 'e2', source: 'LOT-INJECT-01', target: 'WS-CLEANROOM', label: '加工于' },
      { id: 'e3', source: 'LOT-INJECT-01', target: 'QI-MOISTURE', label: '由...检验' },
      { id: 'e4', source: 'DEVICE-HVAC', target: 'WS-CLEANROOM', label: '控制环境' },
      { id: 'e5', source: 'MAINT-HVAC', target: 'DEVICE-HVAC', label: '维护' },
    ]
  },
  tool_lifespan: {
    name: '模具寿命预警管理 (TOOL-PUNCH-01)',
    nodes: [
      { id: 'TOOL-PUNCH-01', label: '冲压模具-01', type: 'SparePart', x: 0, y: 0 },
      { id: 'PUNCH-MACHINE', label: '冲压机-05 (产线:L-006)', type: '设备', x: -200, y: -100 },
      { id: 'LOT-PUNCH-02', label: '冲压批次-02 (数量:10000)', type: 'Batch', x: 200, y: -100 },
      { id: 'QI-DIMENSION', label: '尺寸检测 (毛刺增多)', type: 'QualityInspection', x: 0, y: 150 },
      { id: 'MAINT-TOOL', label: '模具修磨工单 (耗时:8h)', type: 'MaintenanceOrder', x: -200, y: 150 },
      { id: 'SP-NEW-TOOL', label: '备用模具 (库存:1, 成本:¥2w)', type: 'SparePart', x: 200, y: 150 },
    ],
    edges: [
      { id: 'e1', source: 'TOOL-PUNCH-01', target: 'PUNCH-MACHINE', label: '安装于' },
      { id: 'e2', source: 'LOT-PUNCH-02', target: 'PUNCH-MACHINE', label: '加工于' },
      { id: 'e3', source: 'LOT-PUNCH-02', target: 'QI-DIMENSION', label: '由...检验' },
      { id: 'e4', source: 'TOOL-PUNCH-01', target: 'MAINT-TOOL', label: '需要' },
      { id: 'e5', source: 'MAINT-TOOL', target: 'SP-NEW-TOOL', label: '被...替换' },
    ]
  },
  cost_accounting: {
    name: '批次生产成本核算 (LOT-W-002)',
    nodes: [
      { id: 'LOT-W-002', label: '卷绕批次-002 (产线:L-003)', type: 'Batch', x: 0, y: 0 },
      { id: 'MAT-FOIL', label: '铜箔/铝箔 (成本:¥5000, 供应商:诺德)', type: 'Material', x: -200, y: -100 },
      { id: 'WO-0322', label: 'WO-20260322 (人工成本:¥800)', type: 'WorkOrder', x: 200, y: -100 },
      { id: 'SO-202606', label: 'SO-202606 (客户:小鹏)', type: 'SalesOrder', x: 0, y: 150 },
      { id: 'TEL-ENERGY', label: '能耗数据 (电费:¥300)', type: 'Telemetry', x: -200, y: 150 },
      { id: 'QI-SCRAP', label: '废品记录 (损失:¥200)', type: 'QualityInspection', x: 200, y: 150 },
    ],
    edges: [
      { id: 'e1', source: 'LOT-W-002', target: 'MAT-FOIL', label: '消耗' },
      { id: 'e2', source: 'LOT-W-002', target: 'WO-0322', label: '属于' },
      { id: 'e3', source: 'WO-0322', target: 'SO-202606', label: '履行' },
      { id: 'e4', source: 'LOT-W-002', target: 'TEL-ENERGY', label: '消耗能源' },
      { id: 'e5', source: 'LOT-W-002', target: 'QI-SCRAP', label: '产生废料' },
    ]
  },
  safety_incident: {
    name: '安全生产事故排查 (INCIDENT-001)',
    nodes: [
      { id: 'INCIDENT-001', label: '电池热失控事故', type: 'EquipmentFailure', x: 0, y: 0 },
      { id: 'WS-TESTING', label: '测试车间', type: 'Workshop', x: -200, y: -100 },
      { id: 'TECH-ZHAO', label: '赵六 (测试员, 受伤)', type: 'Technician', x: 200, y: -100 },
      { id: 'TEST-CHAMBER', label: '防爆测试箱 (损坏)', type: '设备', x: 0, y: 150 },
      { id: 'LOT-TEST-05', label: '测试批次-05 (起火源)', type: 'Batch', x: -200, y: 150 },
      { id: 'MAINT-REPAIR', label: '设备大修工单', type: 'MaintenanceOrder', x: 200, y: 150 },
    ],
    edges: [
      { id: 'e1', source: 'INCIDENT-001', target: 'WS-TESTING', label: '发生于' },
      { id: 'e2', source: 'INCIDENT-001', target: 'TECH-ZHAO', label: '由...报告' },
      { id: 'e3', source: 'INCIDENT-001', target: 'TEST-CHAMBER', label: '涉及' },
      { id: 'e4', source: 'LOT-TEST-05', target: 'TEST-CHAMBER', label: '测试于' },
      { id: 'e5', source: 'INCIDENT-001', target: 'MAINT-REPAIR', label: '触发' },
    ]
  }
};

const SCHEMA_NODES = [
  { id: 'Factory', label: '工厂', x: 50, y: 10, color: 'indigo', icon: 'Database' },
  { id: 'Workshop', label: '车间', x: 50, y: 25, color: 'indigo', icon: 'Layers' },
  { id: 'ProductionLine', label: '产线', x: 50, y: 40, color: 'indigo', icon: 'Activity' },
  { id: 'Device', label: '设备', x: 25, y: 55, color: 'blue', icon: 'Cpu' },
  { id: 'Telemetry', label: '遥测数据', x: 25, y: 75, color: 'amber', icon: 'Activity' },
  { id: 'Supplier', label: '供应商', x: 15, y: 25, color: 'rose', icon: 'Users' },
  { id: 'Material', label: '物料', x: 15, y: 40, color: 'rose', icon: 'Box' },
  { id: 'Customer', label: '客户', x: 85, y: 25, color: 'emerald', icon: 'Users' },
  { id: 'SalesOrder', label: '销售订单', x: 85, y: 40, color: 'emerald', icon: 'FileText' },
  { id: 'Product', label: '产品', x: 85, y: 55, color: 'purple', icon: 'Box' },
  { id: 'BOM', label: '物料清单', x: 85, y: 75, color: 'purple', icon: 'Layers' },
  { id: 'WorkOrder', label: '工单', x: 65, y: 55, color: 'emerald', icon: 'FileText' },
  { id: 'Batch', label: '批次', x: 45, y: 55, color: 'emerald', icon: 'Layers' },
  { id: 'QualityInspection', label: '质检记录', x: 45, y: 75, color: 'rose', icon: 'ShieldCheck' },
  { id: 'EquipmentFailure', label: '设备故障', x: 10, y: 55, color: 'red', icon: 'AlertTriangle' },
  { id: 'MaintenanceOrder', label: '维修工单', x: 10, y: 70, color: 'orange', icon: 'Wrench' },
  { id: 'SparePart', label: '备件', x: 10, y: 85, color: 'blue', icon: 'Box' },
  { id: 'Technician', label: '技术员', x: 25, y: 85, color: 'emerald', icon: 'Users' },
];

const SCHEMA_EDGES = [
  { source: 'Factory', target: 'Workshop', label: '包含' },
  { source: 'Workshop', target: 'ProductionLine', label: '包含' },
  { source: 'ProductionLine', target: 'Device', label: '包含' },
  { source: 'ProductionLine', target: 'WorkOrder', label: '执行' },
  { source: 'Device', target: 'Telemetry', label: '产生' },
  { source: 'Supplier', target: 'Material', label: '供应' },
  { source: 'Material', target: 'Batch', label: '被消耗于' },
  { source: 'Customer', target: 'SalesOrder', label: '下达' },
  { source: 'SalesOrder', target: 'WorkOrder', label: '履行于' },
  { source: 'SalesOrder', target: 'Product', label: '包含' },
  { source: 'WorkOrder', target: 'Batch', label: '产生' },
  { source: 'WorkOrder', target: 'Product', label: '生产' },
  { source: 'Batch', target: 'Device', label: '加工于' },
  { source: 'Batch', target: 'QualityInspection', label: '检验于' },
  { source: 'BOM', target: 'Product', label: '定义' },
  { source: 'Device', target: 'EquipmentFailure', label: '发生' },
  { source: 'EquipmentFailure', target: 'MaintenanceOrder', label: '触发' },
  { source: 'MaintenanceOrder', target: 'SparePart', label: '消耗' },
  { source: 'MaintenanceOrder', target: 'Technician', label: '分配给' },
];

const getIcon = (name: string) => {
  switch(name) {
    case 'Database': return <Database size={16} />;
    case 'Layers': return <Layers size={16} />;
    case 'Activity': return <Activity size={16} />;
    case 'Cpu': return <Cpu size={16} />;
    case 'Users': return <Users size={16} />;
    case 'Box': return <Box size={16} />;
    case 'FileText': return <FileText size={16} />;
    case 'ShieldCheck': return <ShieldCheck size={16} />;
    case 'AlertTriangle': return <AlertTriangle size={16} />;
    case 'Wrench': return <Wrench size={16} />;
    default: return <Box size={16} />;
  }
};

const BEHAVIOR_RULES_LIBRARY = [
    // 计算规则
    { id: 'calc_capacity', name: '工作中心日可用产能计算', type: 'calculation', domain: '生产域', description: 'WorkCenter.daily_available_capacity = SUM(shift.duration) × standard_capacity × efficiency_factor', applicableRelations: [['ProductionLine', 'Workshop'], ['Workshop', 'Factory']] },
    { id: 'calc_oee', name: '整体设备效率计算', type: 'calculation', domain: '基础资源', description: 'OEE = 可用率 × 性能率 × 质量率', applicableRelations: [['Device', 'ProductionLine']] },
    { id: 'calc_bom_cost', name: 'BOM成本卷积计算', type: 'calculation', domain: '供应域', description: '自底向上卷积计算产品标准成本', applicableRelations: [['Product', 'BOM'], ['BOM', 'Material']] },
    { id: 'calc_batch_yield', name: '批次合格率计算', type: 'calculation', domain: '质量与运维', description: 'Batch.yield_rate = qualified_qty / total_qty × 100%', applicableRelations: [['Batch', 'QualityInspection'], ['WorkOrder', 'Batch']] },
    { id: 'calc_mttr', name: '平均修复时间计算', type: 'calculation', domain: '质量与运维', description: 'MTTR = SUM(repair_duration) / failure_count', applicableRelations: [['EquipmentFailure', 'MaintenanceOrder'], ['Device', 'MaintenanceOrder']] },
    // 触发规则
    { id: 'trigger_overload', name: '产能超负荷触发重排', type: 'trigger', domain: '生产域', description: '当产线负载超过产能阈值时触发排程调整', applicableRelations: [['ProductionLine', 'WorkOrder']] },
    { id: 'trigger_quality_hold', name: '质量异常触发停线', type: 'trigger', domain: '质量与运维', description: '当不良率超过阈值时触发产线暂停', applicableRelations: [['QualityInspection', 'ProductionLine'], ['Batch', 'QualityInspection']] },
    { id: 'trigger_fault', name: '设备故障触发维修', type: 'trigger', domain: '质量与运维', description: '设备故障自动触发维修工单创建', applicableRelations: [['Device', 'MaintenanceOrder'], ['EquipmentFailure', 'MaintenanceOrder']] },
    { id: 'trigger_spare_shortage', name: '备件短缺预警', type: 'trigger', domain: '供应域', description: '备件库存低于安全库存时触发采购', applicableRelations: [['SparePart', 'MaintenanceOrder'], ['SparePart', 'Supplier']] },
    { id: 'trigger_delivery_delay', name: '订单交付延迟预警', type: 'trigger', domain: '需求域', description: '预测完工时间晚于承诺交期时触发预警', applicableRelations: [['WorkOrder', 'SalesOrder'], ['Batch', 'SalesOrder']] },
    // 约束规则
    { id: 'constraint_resource_exclusive', name: '设备互斥约束', type: 'constraint', domain: '生产域', description: '同一时间同一设备只能处理一个工单', applicableRelations: [['Device', 'WorkOrder'], ['ProductionLine', 'WorkOrder']] },
    { id: 'constraint_material_balance', name: '物料齐套约束', type: 'constraint', domain: '供应域', description: '工单开工前必须满足物料齐套要求', applicableRelations: [['Material', 'WorkOrder'], ['BOM', 'WorkOrder']] },
    { id: 'constraint_sequence', name: '工艺顺序约束', type: 'constraint', domain: '生产域', description: '批次必须按工艺路线顺序流转', applicableRelations: [['Batch', 'Batch'], ['WorkOrder', 'WorkOrder']] },
    { id: 'constraint_quality_gate', name: '质量门禁约束', type: 'constraint', domain: '质量与运维', description: '质检不合格不得流入下道工序', applicableRelations: [['QualityInspection', 'Batch'], ['QualityInspection', 'WorkOrder']] },
    { id: 'constraint_certified_tech', name: '持证上岗约束', type: 'constraint', domain: '基础资源', description: '关键工序必须由持证技术员操作', applicableRelations: [['Technician', 'Device'], ['Technician', 'ProductionLine']] },
  ];

export default function OntologyModeling() {
  const [activeTab, setActiveTab] = useState<TabKey>('discovery');
  const [expandedSources, setExpandedSources] = useState<string[]>(['mes', 'plm', 'qms']);
  const [selectedTableId, setSelectedTableId] = useState('mes_production_line');
  const [selectedTemplate, setSelectedTemplate] = useState('tpl_line');
  const [selectedInstanceTarget, setSelectedInstanceTarget] = useState('failure_impact');
  
  // Apple-style on-demand panels state
  const [isRelToolboxOpen, setIsRelToolboxOpen] = useState(true);
  const [isRelInspectorOpen, setIsRelInspectorOpen] = useState(true);

  // State for draggable instance nodes
  const [instanceNodes, setInstanceNodes] = useState(SCENARIOS_DATA['failure_impact'].nodes);
  const [dragState, setDragState] = useState<{ id: string, startX: number, startY: number, initialNodeX: number, initialNodeY: number } | null>(null);

  React.useEffect(() => {
    if (SCENARIOS_DATA[selectedInstanceTarget]) {
      setInstanceNodes(SCENARIOS_DATA[selectedInstanceTarget].nodes);
      setInstanceEdges(SCENARIOS_DATA[selectedInstanceTarget].edges || []);
    }
  }, [selectedInstanceTarget]);

  const handleNodeMouseDown = (e: React.MouseEvent, id: string, initialNodeX: number, initialNodeY: number) => {
    e.preventDefault();
    setDragState({
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialNodeX,
      initialNodeY
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragState) {
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      setInstanceNodes(prev => prev.map(node => {
        if (node.id === dragState.id) {
          return {
            ...node,
            x: dragState.initialNodeX + dx,
            y: dragState.initialNodeY + dy
          };
        }
        return node;
      }));
    }
  };

  const handleMouseUp = () => {
    setDragState(null);
  };

  // --- Relations Tab State & Handlers ---
  const [relNodes, setRelNodes] = useState(SCHEMA_NODES);
  const [relEdges, setRelEdges] = useState(SCHEMA_EDGES.map((e, i) => ({ ...e, id: `rel-edge-${i}`, cardinality: '1:N' })));
  // 关系与行为规则绑定: { edgeId: [ruleId1, ruleId2, ...] }
  const [edgeRules, setEdgeRules] = useState<Record<string, string[]>>({});
  const [activeRelId, setActiveRelId] = useState<string | null>(null);
  const [isAddingRel, setIsAddingRel] = useState(false);
  const [relFormData, setRelFormData] = useState({ source: '', target: '', label: '', cardinality: '1:N' });
  const [relDragState, setRelDragState] = useState<{ id: string, startX: number, startY: number, initialNodeX: number, initialNodeY: number } | null>(null);
  const [graphName, setGraphName] = useState('默认生产制造本体');
  const [isEditingGraphName, setIsEditingGraphName] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [showNewGraphConfirm, setShowNewGraphConfirm] = useState(false);
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [newNodeData, setNewNodeData] = useState({ id: '', label: '', type: '设备' });

  // Node editing state
  const [showEditNodeModal, setShowEditNodeModal] = useState(false);
  const [editingNode, setEditingNode] = useState<any>(null);
  const [editNodeData, setEditNodeData] = useState({ id: '', label: '', type: '设备' });

  // Node detail modal state
  const [showNodeDetailModal, setShowNodeDetailModal] = useState(false);

  // 计算适用于当前关系的规则
  const applicableRulesForCurrentEdge = useMemo(() => {
    if (!activeRelId) return [];
    const currentEdge = relEdges.find(e => e.id === activeRelId);
    if (!currentEdge) return [];
    const sourceNode = relNodes.find(n => n.id === currentEdge.source);
    const targetNode = relNodes.find(n => n.id === currentEdge.target);
    const sourceType = sourceNode?.type || '';
    const targetType = targetNode?.type || '';

    return BEHAVIOR_RULES_LIBRARY.filter(rule => {
      if (edgeRules[activeRelId]?.includes(rule.id)) return false;
      if (!rule.applicableRelations) return false;
      return rule.applicableRelations.some(([s, t]) =>
        (s === sourceType && t === targetType) || (s === targetType && t === sourceType)
      );
    });
  }, [activeRelId, relEdges, relNodes, edgeRules]);
  const [selectedNodeDetail, setSelectedNodeDetail] = useState<any>(null);

  // Instances tab editing state
  const [instanceEdges, setInstanceEdges] = useState<any[]>([]);
  const [showInstanceNodeModal, setShowInstanceNodeModal] = useState(false);
  const [showInstanceEdgeModal, setShowInstanceEdgeModal] = useState(false);
  const [editingInstanceNode, setEditingInstanceNode] = useState<any>(null);
  const [editingInstanceEdge, setEditingInstanceEdge] = useState<any>(null);
  const [instanceNodeForm, setInstanceNodeForm] = useState({ id: '', label: '', type: '设备' });
  const [instanceEdgeForm, setInstanceEdgeForm] = useState({ source: '', target: '', label: '' });

  // 实体属性定义（基于业务需求文档）
  const ENTITY_ATTRIBUTE_DEFINITIONS: Record<string, any> = {
    '客户': {
      description: '需求域核心实体 - 客户信息',
      attributes: [
        { name: 'customer_id', type: 'String', desc: '客户唯一标识', required: true },
        { name: 'customer_name', type: 'String', desc: '客户名称', required: true },
        { name: 'priority_level', type: 'Enum', desc: '战略等级', values: ['VIP', 'Key', 'Standard', 'Trial'], required: true },
        { name: 'credit_limit', type: 'Decimal', desc: '信用额度', required: false },
        { name: 'contract_terms', type: 'Object', desc: '合同条款集合', children: [
          { name: 'penalty_threshold_days', type: 'Int', desc: '延误超过N天触发罚款' },
          { name: 'penalty_rate', type: 'Decimal', desc: '罚款比率（占订单金额%）' },
          { name: 'max_penalty_cap', type: 'Decimal', desc: '最高罚款上限' },
          { name: 'force_majeure_clause', type: 'Boolean', desc: '是否含不可抗力条款' }
        ]},
        { name: 'delivery_reliability', type: 'Decimal', desc: '历史交期履约率（0-1）', required: false },
        { name: 'complaint_sensitivity', type: 'Enum', desc: '投诉敏感度', values: ['High', 'Medium', 'Low'], required: false },
        { name: 'account_manager', type: 'String', desc: '客户经理（用于升级通知）', required: false }
      ]
    },
    'Customer': {
      description: '需求域核心实体 - 客户信息',
      attributes: [
        { name: 'customer_id', type: 'String', desc: '客户唯一标识', required: true },
        { name: 'customer_name', type: 'String', desc: '客户名称', required: true },
        { name: 'priority_level', type: 'Enum', desc: '战略等级', values: ['VIP', 'Key', 'Standard', 'Trial'], required: true },
        { name: 'credit_limit', type: 'Decimal', desc: '信用额度', required: false },
        { name: 'contract_terms', type: 'Object', desc: '合同条款集合', children: [
          { name: 'penalty_threshold_days', type: 'Int', desc: '延误超过N天触发罚款' },
          { name: 'penalty_rate', type: 'Decimal', desc: '罚款比率（占订单金额%）' },
          { name: 'max_penalty_cap', type: 'Decimal', desc: '最高罚款上限' },
          { name: 'force_majeure_clause', type: 'Boolean', desc: '是否含不可抗力条款' }
        ]},
        { name: 'delivery_reliability', type: 'Decimal', desc: '历史交期履约率（0-1）', required: false },
        { name: 'complaint_sensitivity', type: 'Enum', desc: '投诉敏感度', values: ['High', 'Medium', 'Low'], required: false },
        { name: 'account_manager', type: 'String', desc: '客户经理（用于升级通知）', required: false }
      ]
    },
    '客户订单': {
      description: '需求域核心实体 - 客户订单（本体中心枢纽）',
      attributes: [
        { name: 'order_id', type: 'String', desc: '订单唯一标识（SAP SO号）', required: true },
        { name: 'customer_ref', type: 'Reference', desc: '关联客户', ref: '客户', required: true },
        { name: 'item_ref', type: 'Reference', desc: '关联成品物料', ref: '成品物料', required: true },
        { name: 'quantity', type: 'Decimal', desc: '需求数量', required: true },
        { name: 'unit', type: 'String', desc: '单位（PCS/KG/SET）', required: true },
        { name: 'requested_date', type: 'Date', desc: '客户要求交期', required: true },
        { name: 'committed_date', type: 'Date', desc: '系统承诺交期（最新一次）', required: false },
        { name: 'order_priority', type: 'Int', desc: '当前排程优先级（1最高）', required: false },
        { name: 'order_type', type: 'Enum', desc: '订单类型', values: ['Standard', 'Rush', 'Frame', 'Sample'], required: true },
        { name: 'special_requirements', type: 'String[]', desc: '特殊要求（包装/认证/分批）', required: false },
        { name: 'status', type: 'Enum', desc: '当前状态', values: ['新建', '已确认', '生产中', '完工', '发货', '关闭', '暂挂', '取消'], required: true },
        { name: 'created_at', type: 'DateTime', desc: '下单时间', required: true }
      ]
    },
    '工作中心': {
      description: '生产域核心实体 - 产能约束的核心载体',
      attributes: [
        { name: 'wc_id', type: 'String', desc: '工作中心标识', required: true },
        { name: 'wc_name', type: 'String', desc: '名称（如：SMT贴片线3号）', required: true },
        { name: 'wc_type', type: 'Enum', desc: '类型', values: ['Machine', 'Labor', 'Mixed'], required: true },
        { name: 'plant_id', type: 'String', desc: '所属工厂', required: true },
        { name: 'capacity_model', type: 'Object', desc: '产能模型', children: [
          { name: 'shifts', type: 'Array', desc: '班次配置' },
          { name: 'standard_capacity', type: 'Decimal', desc: '标准产能（件/小时）' },
          { name: 'efficiency_factor', type: 'Decimal', desc: '实际效率系数（0.6-1.0）' },
          { name: 'overtime_capacity', type: 'Decimal', desc: '加班最大产能' },
          { name: 'overtime_cost_rate', type: 'Decimal', desc: '加班单位成本' }
        ]},
        { name: 'setup_matrix', type: 'Array', desc: '换模时间矩阵', required: false },
        { name: 'maintenance_schedule', type: 'Array', desc: '计划性维护窗口', required: false },
        { name: 'bottleneck_flag', type: 'Boolean', desc: '是否为系统瓶颈', required: false },
        { name: 'utilization_target', type: 'Decimal', desc: '目标利用率', required: false }
      ]
    },
    '工序': {
      description: '生产域核心实体 - 支持精确的关键路径计算',
      attributes: [
        { name: 'op_id', type: 'String', desc: '工序标识', required: true },
        { name: 'op_sequence', type: 'Int', desc: '工序序号（10,20,30...）', required: true },
        { name: 'op_description', type: 'String', desc: '工序描述', required: true },
        { name: 'wo_ref', type: 'Reference', desc: '所属工单', ref: '生产工单', required: true },
        { name: 'wc_ref', type: 'Reference', desc: '执行工作中心', ref: '工作中心', required: true },
        { name: 'time_model', type: 'Object', desc: '时间模型', children: [
          { name: 'setup_time', type: 'Decimal', desc: '准备时间（小时）' },
          { name: 'processing_time', type: 'Decimal', desc: '加工时间（小时/件）' },
          { name: 'queue_time', type: 'Decimal', desc: '等待时间' },
          { name: 'move_time', type: 'Decimal', desc: '转移时间（工序间物流）' },
          { name: 'total_lead_time', type: 'Decimal', desc: '总提前期' }
        ]},
        { name: 'actual_setup_time', type: 'Decimal', desc: '实际准备时间（MES记录）', required: false },
        { name: 'actual_processing_time', type: 'Decimal', desc: '实际加工时间（MES记录）', required: false },
        { name: 'predecessor_ops', type: 'Reference[]', desc: '前置工序列表（支持多前置）', ref: '工序', required: false },
        { name: 'parallel_flag', type: 'Boolean', desc: '是否可与前序工序并行', required: false },
        { name: 'status', type: 'Enum', desc: '工序状态', values: ['Planned', 'InProgress', 'Completed', 'Skipped'], required: true },
        { name: 'completion_percentage', type: 'Decimal', desc: '完成百分比（0-100，MES实时）', required: false },
        { name: 'quality_hold_flag', type: 'Boolean', desc: '是否因质量问题暂停', required: false }
      ]
    },
    '库存': {
      description: '供应域核心实体 - 四维数量模型',
      attributes: [
        { name: 'inventory_id', type: 'String', desc: '库存记录标识', required: true },
        { name: 'item_ref', type: 'Reference', desc: '关联物料', ref: '物料', required: true },
        { name: 'plant_id', type: 'String', desc: '所在工厂', required: true },
        { name: 'storage_location', type: 'String', desc: '库位', required: true },
        { name: 'quantity_model', type: 'Object', desc: '四维数量模型', children: [
          { name: 'on_hand_qty', type: 'Decimal', desc: '现货库存（实际在库，可立即使用）' },
          { name: 'in_transit_qty', type: 'Decimal', desc: '在途数量（已发货/采购，未到库）' },
          { name: 'reserved_qty', type: 'Decimal', desc: '已预留数量（被其他订单锁定）' },
          { name: 'available_qty', type: 'Decimal', desc: '可用数量 = 现货 + 在途 - 预留' }
        ]},
        { name: 'in_transit_details', type: 'Array', desc: '在途明细（预计到货日期）', required: false },
        { name: 'reorder_point', type: 'Decimal', desc: '再订货点', required: false },
        { name: 'last_updated', type: 'DateTime', desc: '最后更新时间', required: false },
        { name: 'data_source', type: 'Enum', desc: '数据来源', values: ['SAP_LIVE', 'SAP_SNAPSHOT', 'MES_ADJUSTED'], required: false }
      ]
    },
    'BOM层级': {
      description: '供应域核心实体 - 支持多层BOM展开和替代料推理',
      attributes: [
        { name: 'bom_id', type: 'String', desc: 'BOM记录标识', required: true },
        { name: 'bom_version', type: 'String', desc: 'BOM版本号（支持多版本共存）', required: true },
        { name: 'parent_item', type: 'Reference', desc: '父项物料', ref: '成品物料', required: true },
        { name: 'child_item', type: 'Reference', desc: '子项物料', ref: '物料', required: true },
        { name: 'level', type: 'Int', desc: 'BOM层级（0=成品，1=一级组件，2=原材料）', required: true },
        { name: 'quantity_per', type: 'Decimal', desc: '单位父项需用量', required: true },
        { name: 'scrap_factor', type: 'Decimal', desc: '损耗系数（1.05 = 5%损耗）', required: false },
        { name: 'effective_from', type: 'Date', desc: '生效日期', required: true },
        { name: 'effective_to', type: 'Date', desc: '失效日期（支持ECO工程变更）', required: false },
        { name: 'alternative_items', type: 'Array', desc: '替代料清单', required: false, children: [
          { name: 'alt_item_ref', type: 'Reference', desc: '替代物料' },
          { name: 'usage_priority', type: 'Int', desc: '替代使用优先级' },
          { name: 'substitution_ratio', type: 'Decimal', desc: '替代比例' },
          { name: 'approval_status', type: 'Enum', desc: '替代批准状态', values: ['Approved', 'Conditional', 'Pending'] }
        ]},
        { name: 'phantom_flag', type: 'Boolean', desc: '是否虚拟件（展开时跳过）', required: false },
        { name: 'purchase_or_make', type: 'Enum', desc: '自制/外购', values: ['Make', 'Buy', 'Either'], required: true }
      ]
    },
    '交期承诺': {
      description: '计划域核心实体 - 可独立追溯、对比和学习',
      attributes: [
        { name: 'commitment_id', type: 'String', desc: '承诺唯一标识', required: true },
        { name: 'order_ref', type: 'Reference', desc: '关联订单', ref: '客户订单', required: true },
        { name: 'commitment_version', type: 'Int', desc: '承诺版本（同一订单可有多次承诺历史）', required: true },
        { name: 'committed_date', type: 'Date', desc: '承诺交期', required: true },
        { name: 'commitment_type', type: 'Enum', desc: '承诺类型', values: ['Standard', 'Overtime', 'PrioritySwap', 'PartialDelivery', 'AlternativeRouting'], required: true },
        { name: 'confidence_score', type: 'Decimal', desc: '置信度（0-100，ML计算）', required: false },
        { name: 'risk_level', type: 'Enum', desc: '风险等级', values: ['High', 'Medium', 'Low'], required: false },
        { name: 'reason_chain', type: 'String[]', desc: '推理原因链（AI生成，可解释）', required: false },
        { name: 'cost_impact', type: 'Decimal', desc: '与标准方案相比的额外成本', required: false },
        { name: 'data_snapshot', type: 'Object', desc: '承诺时刻的关键数据快照', required: false },
        { name: 'created_by', type: 'Enum', desc: '承诺来源', values: ['AI_AUTO', 'HUMAN_CONFIRMED', 'HUMAN_OVERRIDE'], required: true },
        { name: 'created_at', type: 'DateTime', desc: '承诺时间', required: true },
        { name: 'actual_delivery_date', type: 'Date', desc: '实际交货日期（事后填入）', required: false },
        { name: 'deviation_days', type: 'Int', desc: '实际偏差天数（负=提前，正=延误）', required: false }
      ]
    },
    '工厂': {
      description: '基础资源实体 - 工厂',
      attributes: [
        { name: 'factory_id', type: 'String', desc: '工厂唯一标识', required: true },
        { name: 'factory_name', type: 'String', desc: '工厂名称', required: true },
        { name: 'factory_code', type: 'String', desc: '工厂代码', required: true },
        { name: 'location', type: 'String', desc: '工厂地址', required: true },
        { name: 'workshop_count', type: 'Int', desc: '车间数量', required: false },
        { name: 'contact_person', type: 'String', desc: '工厂联系人', required: false },
        { name: 'status', type: 'Enum', desc: '工厂状态', values: ['运营中', '停产', '建设中'], required: true }
      ]
    },
    '车间': {
      description: '生产域核心实体 - 车间',
      attributes: [
        { name: 'workshop_id', type: 'String', desc: '车间唯一标识', required: true },
        { name: 'workshop_name', type: 'String', desc: '车间名称', required: true },
        { name: 'workshop_type', type: 'Enum', desc: '车间类型', values: ['搅拌', '涂布', '辊压', '分切', '卷绕', '装配', '测试'], required: true },
        { name: 'factory_ref', type: 'Reference', desc: '所属工厂', ref: '工厂', required: true },
        { name: 'manager', type: 'String', desc: '车间负责人', required: false },
        { name: 'line_count', type: 'Int', desc: '产线数量', required: false },
        { name: 'area_sqm', type: 'Decimal', desc: '车间面积（平方米）', required: false }
      ]
    },
    '产线': {
      description: '生产域核心实体 - 产线（生产线）',
      attributes: [
        { name: 'line_id', type: 'String', desc: '产线唯一标识', required: true },
        { name: 'line_name', type: 'String', desc: '产线名称', required: true },
        { name: 'line_type', type: 'Enum', desc: '产线类型', values: ['装配线', '加工线', '测试线', '包装线'], required: true },
        { name: 'workshop_ref', type: 'Reference', desc: '所属车间', ref: '车间', required: true },
        { name: 'capacity_per_hour', type: 'Decimal', desc: '每小时产能', required: true },
        { name: 'current_status', type: 'Enum', desc: '当前状态', values: ['运行', '待机', '维护', '停机'], required: true },
        { name: 'oee_current', type: 'Decimal', desc: '当前OEE', required: false },
        { name: 'shift_count', type: 'Int', desc: '班次数', required: false }
      ]
    },
    '成品物料': {
      description: '需求域核心实体 - 成品物料',
      attributes: [
        { name: 'product_id', type: 'String', desc: '产品唯一标识', required: true },
        { name: 'product_name', type: 'String', desc: '产品名称', required: true },
        { name: 'product_code', type: 'String', desc: '产品编码', required: true },
        { name: 'product_type', type: 'Enum', desc: '产品类型', values: ['电芯', '模组', '电池包'], required: true },
        { name: 'uom', type: 'String', desc: '计量单位', required: true },
        { name: 'shelf_life_days', type: 'Int', desc: '保质期（天）', required: false },
        { name: 'moq', type: 'Decimal', desc: '最小起订量', required: false },
        { name: 'specifications', type: 'String', desc: '规格参数', required: false }
      ]
    },
    '供应商': {
      description: '供应域核心实体 - 供应商',
      attributes: [
        { name: 'supplier_id', type: 'String', desc: '供应商唯一标识', required: true },
        { name: 'supplier_name', type: 'String', desc: '供应商名称', required: true },
        { name: 'supplier_code', type: 'String', desc: '供应商编码', required: true },
        { name: 'contact_person', type: 'String', desc: '联系人', required: false },
        { name: 'lead_time_days', type: 'Int', desc: '交货提前期（天）', required: false },
        { name: 'quality_rating', type: 'Enum', desc: '质量评级', values: ['A', 'B', 'C', 'D'], required: false },
        { name: 'status', type: 'Enum', desc: '供应商状态', values: ['合格', '观察', '暂停', '淘汰'], required: true }
      ]
    },
    '物料': {
      description: '供应域核心实体 - 物料',
      attributes: [
        { name: 'material_id', type: 'String', desc: '物料唯一标识', required: true },
        { name: 'material_name', type: 'String', desc: '物料名称', required: true },
        { name: 'material_code', type: 'String', desc: '物料编码', required: true },
        { name: 'material_type', type: 'Enum', desc: '物料类型', values: ['正极材料', '负极材料', '电解液', '隔膜', '外壳', '其他'], required: true },
        { name: 'uom', type: 'String', desc: '计量单位', required: true },
        { name: 'safety_stock', type: 'Decimal', desc: '安全库存', required: false },
        { name: 'supplier_ref', type: 'Reference', desc: '主要供应商', ref: '供应商', required: false }
      ]
    },
    '工艺路线': {
      description: '计划域核心实体 - 工艺路线',
      attributes: [
        { name: 'routing_id', type: 'String', desc: '工艺路线唯一标识', required: true },
        { name: 'routing_code', type: 'String', desc: '工艺路线编码', required: true },
        { name: 'product_ref', type: 'Reference', desc: '适用产品', ref: '成品物料', required: true },
        { name: 'routing_version', type: 'String', desc: '版本号', required: true },
        { name: 'operation_count', type: 'Int', desc: '工序数量', required: true },
        { name: 'standard_lead_time', type: 'Decimal', desc: '标准生产周期（小时）', required: true },
        { name: 'status', type: 'Enum', desc: '状态', values: ['草稿', '生效', '失效'], required: true }
      ]
    },
    '生产工单': {
      description: '生产域核心实体 - 生产工单',
      attributes: [
        { name: 'wo_id', type: 'String', desc: '工单唯一标识', required: true },
        { name: 'wo_number', type: 'String', desc: '工单号', required: true },
        { name: 'product_ref', type: 'Reference', desc: '生产产品', ref: '成品物料', required: true },
        { name: 'quantity', type: 'Decimal', desc: '生产数量', required: true },
        { name: 'planned_start', type: 'DateTime', desc: '计划开始时间', required: true },
        { name: 'planned_end', type: 'DateTime', desc: '计划结束时间', required: true },
        { name: 'actual_start', type: 'DateTime', desc: '实际开始时间', required: false },
        { name: 'actual_end', type: 'DateTime', desc: '实际结束时间', required: false },
        { name: 'status', type: 'Enum', desc: '工单状态', values: ['计划中', '已下达', '生产中', '已完成', '已关闭'], required: true },
        { name: 'priority', type: 'Int', desc: '优先级', required: false }
      ]
    },
    '设备': {
      description: '基础资源实体 - 设备主数据',
      attributes: [
        { name: 'device_id', type: 'String', desc: '设备编号（如: COAT-001）', required: true },
        { name: 'device_type', type: 'String', desc: '设备类型（涂布机/辊压机/卷绕机）', required: true },
        { name: 'device_name', type: 'String', desc: '设备名称', required: true },
        { name: 'installation_date', type: 'Date', desc: '安装日期', required: false },
        { name: 'status', type: 'Enum', desc: '设备状态', values: ['运行', '停机', '待机', '维修中'], required: true },
        { name: 'production_line_ref', type: 'Reference', desc: '所属产线', ref: '产线', required: false },
        { name: 'oee_target', type: 'Decimal', desc: 'OEE目标值', required: false },
        { name: 'maintenance_cycle', type: 'Int', desc: '保养周期（小时）', required: false }
      ]
    },
    'ProductionLine': {
      description: '生产域核心实体 - 产线（生产线）',
      attributes: [
        { name: 'line_id', type: 'String', desc: '产线唯一标识', required: true },
        { name: 'line_name', type: 'String', desc: '产线名称', required: true },
        { name: 'line_type', type: 'Enum', desc: '产线类型', values: ['Assembly', 'Processing', 'Testing', 'Packaging'], required: true },
        { name: 'workshop_ref', type: 'Reference', desc: '所属车间', ref: 'Workshop', required: true },
        { name: 'capacity_per_hour', type: 'Decimal', desc: '每小时产能', required: true },
        { name: 'current_status', type: 'Enum', desc: '当前状态', values: ['Running', 'Idle', 'Maintenance', 'Down'], required: true },
        { name: 'oee_current', type: 'Decimal', desc: '当前OEE', required: false },
        { name: 'shift_count', type: 'Int', desc: '班次数', required: false }
      ]
    },
    'Workshop': {
      description: '生产域核心实体 - 车间',
      attributes: [
        { name: 'workshop_id', type: 'String', desc: '车间唯一标识', required: true },
        { name: 'workshop_name', type: 'String', desc: '车间名称', required: true },
        { name: 'workshop_type', type: 'Enum', desc: '车间类型', values: ['Coating', 'Pressing', 'Winding', 'Assembly', 'Testing'], required: true },
        { name: 'factory_ref', type: 'Reference', desc: '所属工厂', ref: 'Factory', required: true },
        { name: 'manager', type: 'String', desc: '车间负责人', required: false },
        { name: 'line_count', type: 'Int', desc: '产线数量', required: false }
      ]
    },
    'Factory': {
      description: '基础资源实体 - 工厂',
      attributes: [
        { name: 'factory_id', type: 'String', desc: '工厂唯一标识', required: true },
        { name: 'factory_name', type: 'String', desc: '工厂名称', required: true },
        { name: 'factory_code', type: 'String', desc: '工厂代码', required: true },
        { name: 'location', type: 'String', desc: '工厂地址', required: true },
        { name: 'workshop_count', type: 'Int', desc: '车间数量', required: false }
      ]
    },
    'Device': {
      description: '基础资源实体 - 设备',
      attributes: [
        { name: 'device_id', type: 'String', desc: '设备唯一标识', required: true },
        { name: 'device_name', type: 'String', desc: '设备名称', required: true },
        { name: 'device_type', type: 'String', desc: '设备类型', required: true },
        { name: 'line_ref', type: 'Reference', desc: '所属产线', ref: 'ProductionLine', required: true },
        { name: 'install_date', type: 'Date', desc: '安装日期', required: false },
        { name: 'status', type: 'Enum', desc: '设备状态', values: ['Running', 'Idle', 'Maintenance', 'Fault'], required: true }
      ]
    },
    'WorkOrder': {
      description: '生产域核心实体 - 工单',
      attributes: [
        { name: 'wo_id', type: 'String', desc: '工单唯一标识', required: true },
        { name: 'wo_number', type: 'String', desc: '工单号', required: true },
        { name: 'product_ref', type: 'Reference', desc: '生产产品', ref: 'Product', required: true },
        { name: 'quantity', type: 'Decimal', desc: '生产数量', required: true },
        { name: 'planned_start', type: 'DateTime', desc: '计划开始时间', required: true },
        { name: 'planned_end', type: 'DateTime', desc: '计划结束时间', required: true },
        { name: 'actual_start', type: 'DateTime', desc: '实际开始时间', required: false },
        { name: 'actual_end', type: 'DateTime', desc: '实际结束时间', required: false },
        { name: 'status', type: 'Enum', desc: '工单状态', values: ['Planned', 'Released', 'InProgress', 'Completed', 'Closed'], required: true },
        { name: 'priority', type: 'Int', desc: '优先级', required: false }
      ]
    },
    'Batch': {
      description: '生产域核心实体 - 批次',
      attributes: [
        { name: 'batch_id', type: 'String', desc: '批次唯一标识', required: true },
        { name: 'batch_number', type: 'String', desc: '批次号', required: true },
        { name: 'wo_ref', type: 'Reference', desc: '所属工单', ref: 'WorkOrder', required: true },
        { name: 'product_ref', type: 'Reference', desc: '产品', ref: 'Product', required: true },
        { name: 'quantity', type: 'Decimal', desc: '批次数量', required: true },
        { name: 'yield_rate', type: 'Decimal', desc: '合格率', required: false },
        { name: 'status', type: 'Enum', desc: '批次状态', values: ['InProduction', 'QualityCheck', 'Released', 'Rejected'], required: true }
      ]
    },
    'Product': {
      description: '供应域核心实体 - 产品',
      attributes: [
        { name: 'product_id', type: 'String', desc: '产品唯一标识', required: true },
        { name: 'product_name', type: 'String', desc: '产品名称', required: true },
        { name: 'product_code', type: 'String', desc: '产品编码', required: true },
        { name: 'product_type', type: 'Enum', desc: '产品类型', values: ['Finished', 'SemiFinished', 'RawMaterial'], required: true },
        { name: 'uom', type: 'String', desc: '计量单位', required: true },
        { name: 'shelf_life_days', type: 'Int', desc: '保质期（天）', required: false }
      ]
    },
    'Material': {
      description: '供应域核心实体 - 物料',
      attributes: [
        { name: 'material_id', type: 'String', desc: '物料唯一标识', required: true },
        { name: 'material_name', type: 'String', desc: '物料名称', required: true },
        { name: 'material_code', type: 'String', desc: '物料编码', required: true },
        { name: 'material_type', type: 'Enum', desc: '物料类型', values: ['Raw', 'Component', 'Packaging'], required: true },
        { name: 'uom', type: 'String', desc: '计量单位', required: true },
        { name: 'safety_stock', type: 'Decimal', desc: '安全库存', required: false }
      ]
    },
    'BOM': {
      description: '供应域核心实体 - 物料清单',
      attributes: [
        { name: 'bom_id', type: 'String', desc: 'BOM唯一标识', required: true },
        { name: 'product_ref', type: 'Reference', desc: '所属产品', ref: 'Product', required: true },
        { name: 'bom_version', type: 'String', desc: 'BOM版本', required: true },
        { name: 'level', type: 'Int', desc: '层级', required: true },
        { name: 'item_count', type: 'Int', desc: '物料项数', required: false }
      ]
    },
    'SalesOrder': {
      description: '需求域核心实体 - 销售订单',
      attributes: [
        { name: 'so_id', type: 'String', desc: '销售订单唯一标识', required: true },
        { name: 'so_number', type: 'String', desc: '销售订单号', required: true },
        { name: 'customer_ref', type: 'Reference', desc: '客户', ref: 'Customer', required: true },
        { name: 'order_date', type: 'Date', desc: '订单日期', required: true },
        { name: 'requested_delivery', type: 'Date', desc: '要求交期', required: true },
        { name: 'total_amount', type: 'Decimal', desc: '订单金额', required: false },
        { name: 'status', type: 'Enum', desc: '订单状态', values: ['New', 'Confirmed', 'InProduction', 'Shipped', 'Closed'], required: true }
      ]
    },
    'Supplier': {
      description: '供应域核心实体 - 供应商',
      attributes: [
        { name: 'supplier_id', type: 'String', desc: '供应商唯一标识', required: true },
        { name: 'supplier_name', type: 'String', desc: '供应商名称', required: true },
        { name: 'supplier_code', type: 'String', desc: '供应商编码', required: true },
        { name: 'contact_person', type: 'String', desc: '联系人', required: false },
        { name: 'lead_time_days', type: 'Int', desc: '交货提前期（天）', required: false }
      ]
    },
    'QualityInspection': {
      description: '质量与运维实体 - 质检记录',
      attributes: [
        { name: 'qi_id', type: 'String', desc: '质检记录唯一标识', required: true },
        { name: 'batch_ref', type: 'Reference', desc: '检验批次', ref: 'Batch', required: true },
        { name: 'inspection_date', type: 'DateTime', desc: '检验日期', required: true },
        { name: 'inspector', type: 'String', desc: '检验员', required: true },
        { name: 'result', type: 'Enum', desc: '检验结果', values: ['Pass', 'Fail', 'Conditional'], required: true },
        { name: 'defect_count', type: 'Int', desc: '不良数量', required: false },
        { name: 'defect_rate', type: 'Decimal', desc: '不良率', required: false }
      ]
    },
    'EquipmentFailure': {
      description: '质量与运维实体 - 设备故障',
      attributes: [
        { name: 'failure_id', type: 'String', desc: '故障记录唯一标识', required: true },
        { name: 'device_ref', type: 'Reference', desc: '故障设备', ref: 'Device', required: true },
        { name: 'failure_time', type: 'DateTime', desc: '故障时间', required: true },
        { name: 'failure_type', type: 'Enum', desc: '故障类型', values: ['Mechanical', 'Electrical', 'Software', 'Operator'], required: true },
        { name: 'severity', type: 'Enum', desc: '严重程度', values: ['Minor', 'Major', 'Critical'], required: true },
        { name: 'description', type: 'String', desc: '故障描述', required: true }
      ]
    },
    'MaintenanceOrder': {
      description: '质量与运维实体 - 维修工单',
      attributes: [
        { name: 'mo_id', type: 'String', desc: '维修工单唯一标识', required: true },
        { name: 'mo_number', type: 'String', desc: '维修工单号', required: true },
        { name: 'device_ref', type: 'Reference', desc: '维修设备', ref: 'Device', required: true },
        { name: 'failure_ref', type: 'Reference', desc: '关联故障', ref: 'EquipmentFailure', required: false },
        { name: 'maintenance_type', type: 'Enum', desc: '维修类型', values: ['Preventive', 'Corrective', 'Predictive'], required: true },
        { name: 'scheduled_date', type: 'Date', desc: '计划维修日期', required: true },
        { name: 'status', type: 'Enum', desc: '维修状态', values: ['Planned', 'InProgress', 'Completed', 'Cancelled'], required: true }
      ]
    },
    'SparePart': {
      description: '质量与运维实体 - 备件',
      attributes: [
        { name: 'part_id', type: 'String', desc: '备件唯一标识', required: true },
        { name: 'part_name', type: 'String', desc: '备件名称', required: true },
        { name: 'part_code', type: 'String', desc: '备件编码', required: true },
        { name: 'stock_qty', type: 'Decimal', desc: '库存数量', required: true },
        { name: 'safety_stock', type: 'Decimal', desc: '安全库存', required: false }
      ]
    },
    'Technician': {
      description: '基础资源实体 - 技术员',
      attributes: [
        { name: 'tech_id', type: 'String', desc: '技术员唯一标识', required: true },
        { name: 'tech_name', type: 'String', desc: '技术员姓名', required: true },
        { name: 'employee_code', type: 'String', desc: '员工编号', required: true },
        { name: 'skill_level', type: 'Enum', desc: '技能等级', values: ['Junior', 'Intermediate', 'Senior', 'Expert'], required: true },
        { name: 'certifications', type: 'String[]', desc: '持有证书', required: false },
        { name: 'workshop_ref', type: 'Reference', desc: '所属车间', ref: 'Workshop', required: false }
      ]
    },
    'Telemetry': {
      description: '质量与运维实体 - 遥测数据',
      attributes: [
        { name: 'telemetry_id', type: 'String', desc: '遥测记录唯一标识', required: true },
        { name: 'device_ref', type: 'Reference', desc: '数据来源设备', ref: 'Device', required: true },
        { name: 'timestamp', type: 'DateTime', desc: '数据采集时间', required: true },
        { name: 'metric_type', type: 'Enum', desc: '指标类型', values: ['Temperature', 'Pressure', 'Vibration', 'Current', 'Voltage', 'Speed'], required: true },
        { name: 'metric_value', type: 'Decimal', desc: '指标值', required: true },
        { name: 'unit', type: 'String', desc: '单位', required: true },
        { name: 'alarm_flag', type: 'Boolean', desc: '是否报警', required: false }
      ]
    }
  };

  // Helper to get icon based on node type
  const getIconForType = (type: string): string => {
    // 基础资源
    if (['Equipment', 'Device', '设备', 'ProductionLine', '产线'].includes(type)) return 'Cpu';
    if (['Factory', '工厂', 'Workshop', '车间', 'Warehouse', '仓库'].includes(type)) return 'Database';
    // 需求域
    if (['Customer', '客户', 'CustomerOrder', '客户订单', 'FinishedItem', '成品物料'].includes(type)) return 'Users';
    // 生产域
    if (['WorkCenter', '工作中心', 'ProductionLine', '产线', 'Device', '设备', 'Workshop', '车间', 'Factory', '工厂'].includes(type)) return 'Cpu';
    if (['ProductionOrder', '生产工单', 'WorkOrder', '工单'].includes(type)) return 'FileText';
    if (['Operation', '工序', 'Process', '工艺'].includes(type)) return 'Layers';
    // 供应域
    if (['Material', '物料', 'Product', '产品', 'SparePart', '备件'].includes(type)) return 'Box';
    if (['Inventory', '库存'].includes(type)) return 'Database';
    if (['BOMLevel', 'BOM层级', 'BOM', '物料清单'].includes(type)) return 'Layers';
    if (['Supplier', '供应商'].includes(type)) return 'Users';
    // 计划域
    if (['Routing', '工艺路线'].includes(type)) return 'Activity';
    if (['ATPCommitment', '交期承诺'].includes(type)) return 'CheckCircle2';
    // 质量与运维
    if (['QualityInspection', '质检记录', 'Telemetry', '遥测数据', 'EquipmentFailure', '设备故障'].includes(type)) return 'Activity';
    if (['MaintenanceOrder', '维修工单'].includes(type)) return 'Wrench';
    if (['Technician', '技术员'].includes(type)) return 'Users';
    // 兼容旧类型
    if (['SalesOrder', '销售订单', 'PurchaseOrder', '采购订单'].includes(type)) return 'FileText';
    if (['Worker', '人员'].includes(type)) return 'Users';
    return 'Box';
  };

  const handleAddNode = () => {
    if (!newNodeData.id || !newNodeData.label) return;

    // 四域颜色分配
    let color = 'indigo';
    // 需求域 - 蓝色系
    if (['Customer', '客户', 'CustomerOrder', '客户订单', 'FinishedItem', '成品物料'].includes(newNodeData.type)) color = 'blue';
    // 生产域 - 绿色系
    else if (['WorkCenter', '工作中心', 'ProductionLine', '产线', 'Device', '设备', 'Workshop', '车间', 'Factory', '工厂'].includes(newNodeData.type)) color = 'emerald';
    else if (['ProductionOrder', '生产工单', 'WorkOrder', '工单', 'Operation', '工序'].includes(newNodeData.type)) color = 'teal';
    // 供应域 - 紫色系
    else if (['Material', '物料', 'Product', '产品', 'SparePart', '备件', 'BOM', '物料清单', 'BOMLevel', 'BOM层级', 'Inventory', '库存'].includes(newNodeData.type)) color = 'purple';
    else if (['Supplier', '供应商'].includes(newNodeData.type)) color = 'violet';
    // 计划域 - 橙色系
    else if (['Routing', '工艺路线', 'ATPCommitment', '交期承诺'].includes(newNodeData.type)) color = 'orange';
    // 质量与运维 - 红色系
    else if (['QualityInspection', '质检记录', 'Telemetry', '遥测数据', 'EquipmentFailure', '设备故障', 'MaintenanceOrder', '维修工单'].includes(newNodeData.type)) color = 'rose';
    else if (['Technician', '技术员'].includes(newNodeData.type)) color = 'red';
    // 兼容旧类型
    else if (['SalesOrder', '销售订单', 'PurchaseOrder', '采购订单', 'Batch', '批次'].includes(newNodeData.type)) color = 'cyan';
    else if (['Warehouse', '仓库', 'Logistics', '物流'].includes(newNodeData.type)) color = 'gray';

    const newNode = {
      id: newNodeData.id,
      label: newNodeData.label,
      type: newNodeData.type,
      color,
      icon: getIconForType(newNodeData.type),
      x: 50 + Math.random() * 10 - 5,
      y: 50 + Math.random() * 10 - 5
    };

    setRelNodes([...relNodes, newNode]);
    setShowAddNodeModal(false);
    setNewNodeData({ id: '', label: '', type: '工作中心' });
  };

  // Node editing functions
  const handleShowNodeDetail = (node: any) => {
    setSelectedNodeDetail(node);
    setShowNodeDetailModal(true);
  };

  const handleEditNode = (node: any) => {
    setEditingNode(node);
    setEditNodeData({ id: node.id, label: node.label, type: node.type });
    setShowEditNodeModal(true);
  };

  const handleSaveEditNode = () => {
    if (!editNodeData.id || !editNodeData.label) return;

    // 四域颜色分配
    let color = 'indigo';
    // 需求域 - 蓝色系
    if (['Customer', '客户', 'CustomerOrder', '客户订单', 'FinishedItem', '成品物料'].includes(editNodeData.type)) color = 'blue';
    // 生产域 - 绿色系
    else if (['WorkCenter', '工作中心', 'ProductionLine', '产线', 'Device', '设备', 'Workshop', '车间', 'Factory', '工厂'].includes(editNodeData.type)) color = 'emerald';
    else if (['ProductionOrder', '生产工单', 'WorkOrder', '工单', 'Operation', '工序'].includes(editNodeData.type)) color = 'teal';
    // 供应域 - 紫色系
    else if (['Material', '物料', 'Product', '产品', 'SparePart', '备件', 'BOM', '物料清单', 'BOMLevel', 'BOM层级', 'Inventory', '库存'].includes(editNodeData.type)) color = 'purple';
    else if (['Supplier', '供应商'].includes(editNodeData.type)) color = 'violet';
    // 计划域 - 橙色系
    else if (['Routing', '工艺路线', 'ATPCommitment', '交期承诺'].includes(editNodeData.type)) color = 'orange';
    // 质量与运维 - 红色系
    else if (['QualityInspection', '质检记录', 'Telemetry', '遥测数据', 'EquipmentFailure', '设备故障', 'MaintenanceOrder', '维修工单'].includes(editNodeData.type)) color = 'rose';
    else if (['Technician', '技术员'].includes(editNodeData.type)) color = 'red';
    // 兼容旧类型
    else if (['SalesOrder', '销售订单', 'PurchaseOrder', '采购订单', 'Batch', '批次'].includes(editNodeData.type)) color = 'cyan';
    else if (['Warehouse', '仓库', 'Logistics', '物流'].includes(editNodeData.type)) color = 'gray';

    // Update node
    setRelNodes(prev => prev.map(n => {
      if (n.id === editingNode.id) {
        return { ...n, id: editNodeData.id, label: editNodeData.label, type: editNodeData.type, color, icon: getIconForType(editNodeData.type) };
      }
      return n;
    }));

    // Update edges that reference this node
    setRelEdges(prev => prev.map(e => {
      if (e.source === editingNode.id) return { ...e, source: editNodeData.id };
      if (e.target === editingNode.id) return { ...e, target: editNodeData.id };
      return e;
    }));

    setShowEditNodeModal(false);
    setEditingNode(null);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!confirm('确定要删除此节点吗？相关的关系也将被删除。')) return;
    setRelNodes(prev => prev.filter(n => n.id !== nodeId));
    setRelEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
    if (activeRelId) setActiveRelId(null);
  };

  // Instance tab functions
  const handleAddInstanceNode = () => {
    if (!instanceNodeForm.id || !instanceNodeForm.label) return;
    const newNode = {
      id: instanceNodeForm.id,
      label: instanceNodeForm.label,
      type: instanceNodeForm.type,
      x: 0,
      y: 0
    };
    setInstanceNodes(prev => [...prev, newNode]);
    setShowInstanceNodeModal(false);
    setInstanceNodeForm({ id: '', label: '', type: '设备' });
  };

  const handleEditInstanceNode = (node: any) => {
    setEditingInstanceNode(node);
    setInstanceNodeForm({ id: node.id, label: node.label, type: node.type });
    setShowInstanceNodeModal(true);
  };

  const handleSaveInstanceNode = () => {
    if (!instanceNodeForm.id || !instanceNodeForm.label) return;

    if (editingInstanceNode) {
      // Update existing
      setInstanceNodes(prev => prev.map(n => {
        if (n.id === editingInstanceNode.id) {
          return { ...n, id: instanceNodeForm.id, label: instanceNodeForm.label, type: instanceNodeForm.type };
        }
        return n;
      }));
      // Update edges
      setInstanceEdges(prev => prev.map(e => {
        if (e.source === editingInstanceNode.id) return { ...e, source: instanceNodeForm.id };
        if (e.target === editingInstanceNode.id) return { ...e, target: instanceNodeForm.id };
        return e;
      }));
    } else {
      // Add new
      handleAddInstanceNode();
      return;
    }

    setShowInstanceNodeModal(false);
    setEditingInstanceNode(null);
    setInstanceNodeForm({ id: '', label: '', type: '设备' });
  };

  const handleDeleteInstanceNode = (nodeId: string) => {
    if (!confirm('确定要删除此实例节点吗？相关的关系也将被删除。')) return;
    setInstanceNodes(prev => prev.filter(n => n.id !== nodeId));
    setInstanceEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
  };

  const handleAddInstanceEdge = () => {
    if (!instanceEdgeForm.source || !instanceEdgeForm.target || !instanceEdgeForm.label) return;
    const newEdge = {
      id: `edge-${Date.now()}`,
      source: instanceEdgeForm.source,
      target: instanceEdgeForm.target,
      label: instanceEdgeForm.label
    };
    setInstanceEdges(prev => [...prev, newEdge]);
    setShowInstanceEdgeModal(false);
    setInstanceEdgeForm({ source: '', target: '', label: '' });
  };

  const handleEditInstanceEdge = (edge: any) => {
    setEditingInstanceEdge(edge);
    setInstanceEdgeForm({ source: edge.source, target: edge.target, label: edge.label });
    setShowInstanceEdgeModal(true);
  };

  const handleSaveInstanceEdge = () => {
    if (!instanceEdgeForm.source || !instanceEdgeForm.target || !instanceEdgeForm.label) return;

    if (editingInstanceEdge) {
      setInstanceEdges(prev => prev.map(e =>
        e.id === editingInstanceEdge.id
          ? { ...e, source: instanceEdgeForm.source, target: instanceEdgeForm.target, label: instanceEdgeForm.label }
          : e
      ));
    } else {
      handleAddInstanceEdge();
      return;
    }

    setShowInstanceEdgeModal(false);
    setEditingInstanceEdge(null);
    setInstanceEdgeForm({ source: '', target: '', label: '' });
  };

  const handleDeleteInstanceEdge = (edgeId: string) => {
    if (!confirm('确定要删除此关系吗？')) return;
    setInstanceEdges(prev => prev.filter(e => e.id !== edgeId));
  };

  const handleCreateNewOntology = () => {
    const name = prompt('请输入新本体名称:');
    if (!name) return;

    const newKey = `custom-${Date.now()}`;
    SCENARIOS_DATA[newKey] = {
      name: name,
      nodes: [],
      edges: []
    };
    setSelectedInstanceTarget(newKey);
    setInstanceNodes([]);
    setInstanceEdges([]);
  };

  const handleRelNodeMouseDown = (e: React.MouseEvent, id: string, initialNodeX: number, initialNodeY: number) => {
    e.preventDefault();
    setRelDragState({ id, startX: e.clientX, startY: e.clientY, initialNodeX, initialNodeY });
  };

  const handleRelMouseMove = (e: React.MouseEvent) => {
    if (relDragState) {
      const dx = (e.clientX - relDragState.startX) * 0.08; 
      const dy = (e.clientY - relDragState.startY) * 0.08;
      setRelNodes(prev => prev.map(node => {
        if (node.id === relDragState.id) {
          return { ...node, x: relDragState.initialNodeX + dx, y: relDragState.initialNodeY + dy };
        }
        return node;
      }));
    }
  };

  const handleRelMouseUp = () => setRelDragState(null);

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('application/ontology-node', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/ontology-node');
    if (!type) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.5;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.5;

    let color = 'indigo';
    if (['Material', 'Product', 'SparePart', 'BOM'].includes(type)) color = 'emerald';
    else if (['WorkOrder', 'SalesOrder', 'MaintenanceOrder', 'PurchaseOrder', 'Batch'].includes(type)) color = 'purple';
    else if (['QualityInspection', 'Telemetry', 'Incident', 'EquipmentFailure'].includes(type)) color = 'rose';
    else if (['Process', 'Recipe'].includes(type)) color = 'amber';
    else if (['Worker', 'Supplier', 'Customer', 'Technician'].includes(type)) color = 'blue';
    else if (['Warehouse', 'Logistics'].includes(type)) color = 'gray';

    const newNode = {
      id: `${type}-${Date.now()}`,
      label: `新建 ${type}`,
      type: type,
      color,
      x,
      y
    };

    setRelNodes([...relNodes, newNode]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleSaveRel = () => {
    if (activeRelId) {
      setRelEdges(prev => prev.map(e => e.id === activeRelId ? { ...e, ...relFormData } : e));
    } else {
      setRelEdges(prev => [...prev, { ...relFormData, id: `rel-edge-${Date.now()}` }]);
    }
    setActiveRelId(null);
    setIsAddingRel(false);
  };

  const handleDeleteRel = (id: string) => {
    setRelEdges(prev => prev.filter(e => e.id !== id));
    if (activeRelId === id) setActiveRelId(null);
  };

  // 关系行为规则绑定处理函数
  const handleAssignRuleToEdge = (ruleId: string, edgeId: string) => {
    setEdgeRules(prev => ({
      ...prev,
      [edgeId]: [...(prev[edgeId] || []), ruleId]
    }));
  };

  const handleRemoveRuleFromEdge = (ruleId: string, edgeId: string) => {
    setEdgeRules(prev => ({
      ...prev,
      [edgeId]: (prev[edgeId] || []).filter(id => id !== ruleId)
    }));
  };

  const openEditRel = (edge: any) => {
    setRelFormData(edge);
    setActiveRelId(edge.id);
    setIsAddingRel(false);
  };

  const openAddRel = () => {
    if (relNodes.length < 2) return;
    setRelFormData({ source: relNodes[0].id, target: relNodes[1].id, label: '关联', cardinality: '1:N' });
    setActiveRelId(null);
    setIsAddingRel(true);
  };
  // --------------------------------------

  const toggleSource = (sourceId: string) => {
    setExpandedSources(prev => 
      prev.includes(sourceId) ? prev.filter(id => id !== sourceId) : [...prev, sourceId]
    );
  };

  // Find the currently selected table data
  const currentTable = useMemo(() => {
    for (const source of DATA_SOURCES) {
      const table = source.tables.find(t => t.id === selectedTableId);
      if (table) return table;
    }
    return DATA_SOURCES[0].tables[0];
  }, [selectedTableId]);

  // Find the currently selected template data
  const currentTemplateData = useMemo(() => {
    return TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0];
  }, [selectedTemplate]);

  const renderDiscoveryTab = () => (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Data Sources */}
      <div className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-200 bg-slate-50/80">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Database size={14} /> 数据源接入
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {DATA_SOURCES.map((source) => {
            const SourceIcon = source.icon;
            return (
              <div key={source.id} className="mb-2">
                <button 
                  onClick={() => toggleSource(source.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded text-sm text-slate-700 font-medium transition-colors"
                >
                  {expandedSources.includes(source.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <SourceIcon size={14} className={source.color} />
                  <span className="truncate">{source.name}</span>
                </button>
                {expandedSources.includes(source.id) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {source.tables.map(table => (
                      <button 
                        key={table.id}
                        onClick={() => setSelectedTableId(table.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-all",
                          selectedTableId === table.id ? "bg-slate-100 text-slate-800 font-medium" : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Table2 size={12} className={selectedTableId === table.id ? "text-slate-600" : "text-slate-400"} />
                          <span className="truncate">{table.name}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 bg-white px-1 rounded border border-slate-100">{table.rows > 1000 ? (table.rows/1000).toFixed(1) + 'k' : table.rows}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle: Table Structure */}
      <div className="flex-1 border-r border-slate-200 bg-slate-50/30 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Table2 size={16} className="text-slate-800" /> {currentTable.name}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">元数据采集完成，共 {currentTable.fields.length} 个字段</p>
          </div>
          <button className="bg-slate-100 text-slate-800 px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 hover:bg-slate-200 transition-colors border border-slate-200">
            <Sparkles size={14} /> 重新识别
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="p-3 font-medium">字段名</th>
                  <th className="p-3 font-medium">数据类型</th>
                  <th className="p-3 font-medium">业务含义</th>
                </tr>
              </thead>
              <tbody>
                {currentTable.fields.map((field, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 text-xs">
                    <td className="p-3 font-mono text-slate-800">{field.name}</td>
                    <td className="p-3 text-slate-500 font-mono text-[10px]">{field.type}</td>
                    <td className="p-3 text-slate-600">{field.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right: AI Recognition Result */}
      <div className="w-80 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 bg-slate-100/50">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Wand2 size={16} className="text-slate-800" /> AI 实体识别结果
          </h3>
        </div>
        <div className="p-5 space-y-6">
          <div className="text-center p-6 bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-sm">
            <div className="w-12 h-12 bg-slate-200 text-slate-800 rounded-sm flex items-center justify-center mx-auto mb-3">
              <Layers size={24} />
            </div>
            <div className="text-xs text-slate-500 mb-1">推断实体类型</div>
            <div className="text-lg font-bold text-slate-900">{currentTable.recognizedAs}</div>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-sm text-[10px] font-medium border border-emerald-200">
              <CheckCircle2 size={12} /> 置信度 {currentTable.confidence}%
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">识别依据 (可解释性)</h4>
            <div className="space-y-2 text-xs">
              {currentTable.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                  <CheckCircle2 size={14} className="text-slate-600 shrink-0 mt-0.5" />
                  <span className="text-slate-600">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('mapping')}
            className="w-full bg-slate-800 text-white py-2.5 rounded-sm text-sm font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            去匹配模板 <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderMappingTab = () => (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Template Library */}
      <div className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-200 bg-slate-50/80">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <FileText size={14} /> 本体模板库
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {TEMPLATES.map(tpl => (
            <div 
              key={tpl.id}
              onClick={() => setSelectedTemplate(tpl.id)}
              className={cn(
                "p-3 rounded-sm border cursor-pointer transition-all",
                selectedTemplate === tpl.id ? "bg-slate-100 border-slate-400" : "bg-white border-slate-200 hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Layers size={14} className={selectedTemplate === tpl.id ? "text-slate-800" : "text-slate-400"} />
                <h4 className="text-xs font-bold text-slate-800">{tpl.name}</h4>
              </div>
              <div className="text-[10px] text-slate-500 bg-slate-100 inline-block px-1.5 py-0.5 rounded">{tpl.category}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Middle: Recommended Template Structure */}
      <div className="flex-1 border-r border-slate-200 bg-slate-50/30 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" /> AI 推荐模板结构
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-slate-900 rounded-sm p-4">
            <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap">
{currentTemplateData.structure}
            </pre>
          </div>
        </div>
      </div>

      {/* Right: Field Mapping */}
      <div className="w-96 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Link2 size={16} className="text-slate-800" /> 字段自动映射 (Auto Mapping)
          </h3>
          <button className="bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-slate-700 transition-colors">
            一键映射
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {currentTemplateData.mappings.map((mapping, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-50 p-3 rounded-sm border border-slate-200">
              <div className="flex-1">
                <div className="text-[10px] text-slate-500 mb-1">数据源字段</div>
                <div className="text-xs font-mono font-medium text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 inline-block">{mapping.source}</div>
              </div>
              <div className="px-3 flex flex-col items-center">
                {mapping.status === 'mapped' ? (
                  <ArrowRight size={16} className="text-emerald-500" />
                ) : (
                  <ArrowRight size={16} className="text-slate-300" />
                )}
                {mapping.auto && <span className="text-[8px] text-emerald-600 font-bold mt-1">AUTO</span>}
              </div>
              <div className="flex-1 text-right">
                <div className="text-[10px] text-slate-500 mb-1">本体属性</div>
                <div className={cn(
                  "text-xs font-mono font-medium px-2 py-1 rounded border inline-block",
                  mapping.status === 'mapped' ? "bg-slate-100 text-slate-800 border-slate-300" : "bg-white text-slate-400 border-slate-200 border-dashed"
                )}>
                  {mapping.target}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
          <button 
            onClick={() => setActiveTab('discovery')}
            className="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-sm text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> 上一步
          </button>
          <button 
            onClick={() => setActiveTab('ontology')}
            className="flex-1 bg-slate-800 text-white py-2.5 rounded-sm text-sm font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            保存并定义关系 <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  // 子选项卡状态：在本体创建中使用
  const [ontologySubTab, setOntologySubTab] = useState<'relations' | 'rules'>('relations');

  const renderOntologyCreationTab = () => (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* 子选项卡导航 */}
      <div className="flex items-center gap-1 px-4 py-2 bg-white border-b border-slate-200">
        <button
          onClick={() => setOntologySubTab('relations')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm transition-colors",
            ontologySubTab === 'relations'
              ? "bg-slate-100 text-slate-900"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          )}
        >
          <GitMerge size={14} />
          关系配置
        </button>
        <button
          onClick={() => setOntologySubTab('rules')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm transition-colors",
            ontologySubTab === 'rules'
              ? "bg-slate-100 text-slate-900"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          )}
        >
          <Wrench size={14} />
          行为规则
        </button>
      </div>

      {/* 子选项卡内容 */}
      <div className="flex-1 overflow-hidden">
        {ontologySubTab === 'relations' && renderRelationsSubTab()}
        {ontologySubTab === 'rules' && renderRulesSubTab()}
      </div>
    </div>
  );

  const renderRelationsSubTab = () => (
    <div className="flex-1 flex overflow-hidden relative bg-slate-50">
      {/* Left Sidebar: Toolbox (Floating & Collapsible) */}
      <div 
        className={cn(
          "absolute top-4 left-4 bottom-4 w-64 bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-sm flex flex-col z-20 transition-all duration-300 ease-in-out",
          isRelToolboxOpen ? "translate-x-0 opacity-100" : "-translate-x-72 opacity-0 pointer-events-none"
        )}
      >
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
            <Box size={16} className="text-slate-600" />
            实体节点库
          </h3>
          <button onClick={() => setIsRelToolboxOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-sm hover:bg-slate-100 transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">基础资源</div>
            <div className="space-y-1.5">
              {['工厂', '车间', '产线', '设备'].map(type => (
                <div
                  key={type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, type)}
                  className="px-3 py-2 bg-slate-50/80 border border-slate-200/60 rounded-sm text-[13px] text-slate-700 cursor-grab hover:bg-white hover:border-slate-400 hover:shadow-sm transition-all flex items-center justify-between group"
                >
                  <span>{type}</span>
                  <Plus size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">需求域</div>
            <div className="space-y-1.5">
              {['客户', '客户订单', '成品物料'].map(type => (
                <div
                  key={type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, type)}
                  className="px-3 py-2 bg-slate-50/80 border border-slate-200/60 rounded-sm text-[13px] text-slate-700 cursor-grab hover:bg-white hover:border-emerald-300 hover:shadow-sm transition-all flex items-center justify-between group"
                >
                  <span>{type}</span>
                  <Plus size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">生产域</div>
            <div className="space-y-1.5">
              {['工作中心', '生产工单', '工序', '设备'].map(type => (
                <div
                  key={type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, type)}
                  className="px-3 py-2 bg-slate-50/80 border border-slate-200/60 rounded-sm text-[13px] text-slate-700 cursor-grab hover:bg-white hover:border-purple-300 hover:shadow-sm transition-all flex items-center justify-between group"
                >
                  <span>{type}</span>
                  <Plus size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">供应域</div>
            <div className="space-y-1.5">
              {['库存', 'BOM层级', '供应商', '物料'].map(type => (
                <div
                  key={type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, type)}
                  className="px-3 py-2 bg-slate-50/80 border border-slate-200/60 rounded-sm text-[13px] text-slate-700 cursor-grab hover:bg-white hover:border-rose-300 hover:shadow-sm transition-all flex items-center justify-between group"
                >
                  <span>{type}</span>
                  <Plus size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">计划域</div>
            <div className="space-y-1.5">
              {['工艺路线', '交期承诺'].map(type => (
                <div
                  key={type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, type)}
                  className="px-3 py-2 bg-slate-50/80 border border-slate-200/60 rounded-sm text-[13px] text-slate-700 cursor-grab hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between group"
                >
                  <span>{type}</span>
                  <Plus size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Graph */}
      <div 
        className="flex-1 w-full h-full relative flex flex-col"
        onMouseMove={handleRelMouseMove}
        onMouseUp={handleRelMouseUp}
        onMouseLeave={handleRelMouseUp}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* Top Controls Overlay */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
          <div className="flex flex-col gap-2 pointer-events-auto">
            <div className="flex items-center gap-3">
              {!isRelToolboxOpen && (
                <button 
                  onClick={() => setIsRelToolboxOpen(true)}
                  className="w-10 h-10 bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-sm flex items-center justify-center text-slate-600 hover:text-slate-800 hover:bg-white transition-all"
                  title="打开节点库"
                >
                  <Box size={18} />
                </button>
              )}
              <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-sm border border-slate-200/60 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {isEditingGraphName ? (
                    <input
                      autoFocus
                      value={graphName}
                      onChange={e => setGraphName(e.target.value)}
                      onBlur={() => setIsEditingGraphName(false)}
                      onKeyDown={e => e.key === 'Enter' && setIsEditingGraphName(false)}
                      className="text-[15px] font-semibold text-slate-900 border-b-2 border-slate-800 focus:outline-none px-1 bg-transparent w-48"
                    />
                  ) : (
                    <div
                      className="text-[15px] font-semibold text-slate-900 cursor-pointer hover:text-slate-800 flex items-center gap-1.5 group transition-colors"
                      onClick={() => setIsEditingGraphName(true)}
                    >
                      {graphName} <Edit3 size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>
                <div className="w-px h-4 bg-slate-300"></div>
                <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-slate-1000"></div> 需求域</span>
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-emerald-500"></div> 生产域</span>
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-purple-500"></div> 供应域</span>
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-rose-500"></div> 计划域</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            <button
              onClick={() => setShowNewGraphConfirm(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-slate-700 bg-white/90 backdrop-blur-md border border-slate-200/60 hover:bg-white rounded-sm transition-all"
            >
              <Plus size={16} /> 新建图谱
            </button>
            <button 
              onClick={() => {
                setShowSaveToast(true);
                setTimeout(() => setShowSaveToast(false), 3000);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-slate-900 hover:bg-black rounded-sm transition-all"
            >
              <Save size={16} /> 保存图谱
            </button>
            {!isRelInspectorOpen && (
              <button 
                onClick={() => setIsRelInspectorOpen(true)}
                className="w-10 h-10 bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-sm flex items-center justify-center text-slate-600 hover:text-slate-800 hover:bg-white transition-all"
                title="打开属性检查器"
              >
                <Settings size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-md px-2 py-2 rounded-sm border border-slate-200/60 flex items-center gap-2 pointer-events-auto">
          <button 
            onClick={() => setShowAddNodeModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-100 rounded-sm transition-colors"
          >
            <Plus size={16} className="text-slate-800" /> 添加节点
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <button 
            onClick={openAddRel}
            disabled={relNodes.length < 2}
            className={`flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-sm transition-colors ${relNodes.length < 2 ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            <Link2 size={16} className={relNodes.length < 2 ? 'text-slate-400' : 'text-emerald-600'} /> 添加关系
          </button>
        </div>

        {/* Complex SVG Graph Representation */}
        <div className="flex-1 w-full h-full relative flex items-center justify-center overflow-auto min-h-[600px]">
          {relNodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
              <div className="w-24 h-24 bg-slate-100/50 rounded-sm flex items-center justify-center mb-6">
                <Network size={40} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">图谱为空</h3>
              <p className="text-[13px] text-slate-500 mb-8 max-w-md text-center leading-relaxed">
                当前本体图谱没有任何节点和关系。请先从左侧节点库拖拽实体，或点击下方“添加节点”按钮。
              </p>
              <button 
                onClick={() => setShowAddNodeModal(true)}
                className="px-6 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-700 flex items-center gap-2 font-medium transition-colors"
              >
                <Plus size={18} /> 添加节点
              </button>
            </div>
          )}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 min-w-[800px] min-h-[600px]">
            <defs>
              <marker id="arrow-gray" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
              </marker>
              <marker id="arrow-indigo" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
              </marker>
            </defs>
            {relEdges.map((edge) => {
              const sourceNode = relNodes.find(n => n.id === edge.source);
              const targetNode = relNodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;
              const isSelected = edge.id === activeRelId;
              return (
                <line
                  key={edge.id}
                  x1={`${sourceNode.x}%`} y1={`${sourceNode.y}%`}
                  x2={`${targetNode.x}%`} y2={`${targetNode.y}%`}
                  stroke={isSelected ? "#6366f1" : "#9ca3af"}
                  strokeWidth={isSelected ? "2.5" : "2"}
                  markerEnd={isSelected ? "url(#arrow-indigo)" : "url(#arrow-gray)"}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>

          {/* Edge Labels */}
          {relEdges.map((edge) => {
            const sourceNode = relNodes.find(n => n.id === edge.source);
            const targetNode = relNodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;
            
            const midX = (sourceNode.x + targetNode.x) / 2;
            const midY = (sourceNode.y + targetNode.y) / 2;
            const isSelected = edge.id === activeRelId;
            
            return (
              <div 
                key={`label-${edge.id}`}
                onClick={() => openEditRel(edge)}
                className={cn(
                  "absolute px-2 py-1  text-[10px] font-mono rounded border cursor-pointer whitespace-nowrap z-10 transition-all hover:scale-110",
                  isSelected ? "bg-slate-200 text-slate-800 border-slate-400 font-bold" : "bg-white/90 text-slate-500 border-slate-200"
                )}
                style={{ left: `${midX}%`, top: `${midY}%`, transform: 'translate(-50%, -50%)' }}
              >
                {edge.label}
              </div>
            );
          })}

          {/* Nodes */}
          {relNodes.map((node) => {
            const isDragging = relDragState?.id === node.id;

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleRelNodeMouseDown(e, node.id, node.x, node.y)}
                onDoubleClick={(e) => { e.stopPropagation(); handleShowNodeDetail(node); }}
                className={cn(
                  "absolute transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 p-3 rounded-sm flex flex-col items-center w-36 z-20 cursor-move select-none transition-shadow group",
                  isDragging ? "border-slate-400 ring-2 ring-slate-100" : "border-slate-300 hover:border-slate-400 hover:shadow-md"
                )}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                title="双击查看详情"
              >
                {/* Node Action Buttons */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleShowNodeDetail(node); }}
                    className="w-6 h-6 bg-white border border-slate-200 rounded-sm flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:border-emerald-300 shadow-sm"
                    title="查看详情"
                  >
                    <Info size={12} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEditNode(node); }}
                    className="w-6 h-6 bg-white border border-slate-200 rounded-sm flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 shadow-sm"
                    title="编辑节点"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }}
                    className="w-6 h-6 bg-white border border-slate-200 rounded-sm flex items-center justify-center text-slate-600 hover:text-rose-600 hover:border-rose-300 shadow-sm"
                    title="删除节点"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider pointer-events-none">{node.type}</div>
                <span className="text-sm font-bold text-slate-900 pointer-events-none">{node.label}</span>
                <div className="text-[9px] font-mono text-slate-400 mt-1 pointer-events-none">{node.id}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Relation Config (Inspector) */}
      <div 
        className={cn(
          "absolute top-4 right-4 bottom-4 w-80 bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-sm flex flex-col z-20 transition-all duration-300 ease-in-out",
          isRelInspectorOpen ? "translate-x-0 opacity-100" : "translate-x-88 opacity-0 pointer-events-none"
        )}
      >
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
              <Network size={16} className="text-slate-600" /> 属性检查器
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">共定义 {relEdges.length} 组实体关系</p>
          </div>
          <div className="flex items-center gap-2">
            {!isAddingRel && !activeRelId && (
              <button 
                onClick={openAddRel}
                disabled={relNodes.length < 2}
                className={`p-1.5 rounded-sm transition-colors ${relNodes.length < 2 ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
                title={relNodes.length < 2 ? "需至少两个节点才能新建关系" : "新建关系"}
              >
                <Plus size={14} />
              </button>
            )}
            <button onClick={() => setIsRelInspectorOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-sm hover:bg-slate-100 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar">
          {(isAddingRel || activeRelId) ? (
            <div className="p-4 space-y-4 bg-white border-b border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[13px] font-semibold text-slate-800">{isAddingRel ? '新建实体关系' : '编辑实体关系'}</h4>
                <button onClick={() => { setIsAddingRel(false); setActiveRelId(null); }} className="text-slate-400 hover:text-slate-600 p-1 rounded-sm hover:bg-slate-100 transition-colors">
                  <X size={14} />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">源实体 (Source)</label>
                  <select 
                    value={relFormData.source} 
                    onChange={e => setRelFormData({...relFormData, source: e.target.value})}
                    className="w-full text-xs border border-slate-300 rounded-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    {relNodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">目标实体 (Target)</label>
                  <select 
                    value={relFormData.target} 
                    onChange={e => setRelFormData({...relFormData, target: e.target.value})}
                    className="w-full text-xs border border-slate-300 rounded-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    {relNodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">关系名称 (Label)</label>
                  <input 
                    type="text" 
                    list="relation-labels"
                    value={relFormData.label}
                    onChange={e => setRelFormData({...relFormData, label: e.target.value})}
                    placeholder="例如: 包含, 产生"
                    className="w-full text-xs border border-slate-300 rounded-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                  <datalist id="relation-labels">
                    <option value="包含" />
                    <option value="属于" />
                    <option value="产生" />
                    <option value="消耗" />
                    <option value="触发" />
                    <option value="分配给" />
                    <option value="需要" />
                    <option value="维护" />
                    <option value="加工于" />
                    <option value="由...检验" />
                    <option value="由...操作" />
                    <option value="由...供应" />
                    <option value="位于" />
                    <option value="监控" />
                    <option value="定义" />
                    <option value="生产" />
                    <option value="履行" />
                    <option value="由...下达" />
                    <option value="采购" />
                    <option value="由...追踪" />
                    <option value="执行于" />
                    <option value="补充" />
                    <option value="是...的实例" />
                    <option value="操作" />
                    <option value="持有" />
                    <option value="通过...运输" />
                    <option value="影响" />
                    <option value="升级" />
                    <option value="延迟" />
                    <option value="安装" />
                    <option value="使用" />
                    <option value="采购自" />
                    <option value="由...评估" />
                    <option value="交付给" />
                    <option value="发货自" />
                    <option value="离开自" />
                    <option value="控制环境" />
                    <option value="安装于" />
                    <option value="被...替换" />
                    <option value="消耗能源" />
                    <option value="产生废料" />
                    <option value="发生于" />
                    <option value="由...报告" />
                    <option value="涉及" />
                    <option value="测试于" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">基数 (Cardinality)</label>
                  <select 
                    value={relFormData.cardinality} 
                    onChange={e => setRelFormData({...relFormData, cardinality: e.target.value})}
                    className="w-full text-xs border border-slate-300 rounded-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="1:1">1 : 1 (一对一)</option>
                    <option value="1:N">1 : N (一对多)</option>
                    <option value="N:M">N : M (多对多)</option>
                  </select>
                </div>
              </div>

              {/* 行为规则绑定区域 */}
              <div className="border-t border-slate-200 pt-3 mt-3">
                <h5 className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1">
                  <Wrench size={12} /> 行为规则配置
                </h5>
                {/* 当前绑定的规则 */}
                <div className="space-y-1.5 mb-3">
                  {(activeRelId ? edgeRules[activeRelId] || [] : []).map(ruleId => {
                    const rule = BEHAVIOR_RULES_LIBRARY.find(r => r.id === ruleId);
                    if (!rule) return null;
                    const typeInfo = getRuleTypeLabel(rule.type);
                    return (
                      <div key={ruleId} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded border border-slate-200">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className={`w-1.5 h-1.5 rounded-full ${typeInfo.color.split(' ')[0].replace('100', '500')}`}></span>
                          <span className="text-slate-700 truncate">{rule.name}</span>
                        </div>
                        <button
                          onClick={() => activeRelId && handleRemoveRuleFromEdge(ruleId, activeRelId)}
                          className="text-slate-400 hover:text-rose-600 ml-2"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                  {(!activeRelId || !(edgeRules[activeRelId] || []).length) && (
                    <p className="text-[10px] text-slate-400 italic">暂无绑定规则</p>
                  )}
                </div>
                {/* 添加规则下拉框 */}
                <select
                  onChange={(e) => {
                    if (e.target.value && activeRelId) {
                      handleAssignRuleToEdge(e.target.value, activeRelId);
                      e.target.value = '';
                    }
                  }}
                  disabled={!activeRelId}
                  className="w-full text-xs border border-slate-300 rounded-sm px-2 py-1.5 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">+ 从规则库选择...</option>
                  {applicableRulesForCurrentEdge.length === 0 ? (
                    <option value="" disabled>无适用规则（点击下方"新建规则"创建）</option>
                  ) : (
                    applicableRulesForCurrentEdge.map(rule => (
                      <option key={rule.id} value={rule.id}>
                        {getRuleTypeLabel(rule.type).label}: {rule.name}
                      </option>
                    ))
                  )}
                </select>
                {applicableRulesForCurrentEdge.length === 0 && activeRelId && !isAddingRel && (
                  <p className="text-[10px] text-slate-500 mt-1.5 italic">
                    没有适用的规则？点击下方按钮新建
                  </p>
                )}
                {isAddingRel && (
                  <p className="text-[10px] text-amber-600 mt-1.5">提示：请先保存关系后再配置规则</p>
                )}
                {/* 新建规则按钮 */}
                <button
                  onClick={() => {
                    setOntologySubTab('rules');
                    setShowAddRuleModal(true);
                  }}
                  className="w-full mt-2 px-3 py-1.5 text-[10px] bg-slate-800 text-white rounded-sm hover:bg-slate-700 flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus size={10} /> 新建规则
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveRel}
                  className="flex-1 bg-slate-800 text-white py-2 rounded-sm text-xs font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-1"
                >
                  <Save size={14} /> 保存
                </button>
                {activeRelId && (
                  <button
                    onClick={() => handleDeleteRel(activeRelId)}
                    className="px-3 bg-rose-50 text-rose-600 rounded-sm hover:bg-rose-100 transition-colors"
                    title="删除关系"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {relEdges.map((edge) => {
                const sourceNode = relNodes.find(n => n.id === edge.source);
                const targetNode = relNodes.find(n => n.id === edge.target);
                return (
                  <div 
                    key={edge.id} 
                    onClick={() => openEditRel(edge)}
                    className="bg-white border border-slate-200 rounded-sm p-3 hover:border-slate-400  cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200 group-hover:bg-slate-100 group-hover:text-slate-800 group-hover:border-slate-300 transition-colors">{edge.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-800 font-medium">{edge.cardinality}</span>
                        <Edit3 size={12} className="text-slate-300 group-hover:text-slate-600" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="text-slate-600 font-medium truncate max-w-[100px]">{sourceNode?.label || edge.source}</div>
                      <ArrowRight size={12} className="text-slate-400 mx-2 shrink-0" />
                      <div className="text-slate-600 font-medium truncate max-w-[100px]">{targetNode?.label || edge.target}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-200 bg-white flex gap-3">
          <button 
            onClick={() => setActiveTab('mapping')}
            className="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-sm text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> 上一步
          </button>
          <button 
            onClick={() => setActiveTab('instances')}
            className="flex-1 bg-slate-800 text-white py-2.5 rounded-sm text-sm font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            生成实例图谱 <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Modals and Toasts */}
      {showAddNodeModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 ">
          <div className="bg-white rounded-sm shadow-xl w-[400px] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus size={16} className="text-slate-800" />
                添加实体节点
              </h3>
              <button onClick={() => setShowAddNodeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">节点 ID (唯一标识)</label>
                <input 
                  type="text" 
                  value={newNodeData.id}
                  onChange={e => setNewNodeData({...newNodeData, id: e.target.value})}
                  placeholder="例如: EQUIP-001"
                  className="w-full text-sm border border-slate-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">节点名称 (显示标签)</label>
                <input 
                  type="text" 
                  value={newNodeData.label}
                  onChange={e => setNewNodeData({...newNodeData, label: e.target.value})}
                  placeholder="例如: 1号涂布机"
                  className="w-full text-sm border border-slate-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">实体类型 (Type)</label>
                <select 
                  value={newNodeData.type}
                  onChange={e => setNewNodeData({...newNodeData, type: e.target.value})}
                  className="w-full text-sm border border-slate-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  <optgroup label="需求域">
                    <option value="Customer">客户</option>
                    <option value="CustomerOrder">客户订单</option>
                    <option value="FinishedItem">成品物料</option>
                  </optgroup>
                  <optgroup label="生产域">
                    <option value="WorkCenter">工作中心</option>
                    <option value="ProductionOrder">生产工单</option>
                    <option value="Operation">工序</option>
                    <option value="Device">设备</option>
                    <option value="ProductionLine">产线</option>
                  </optgroup>
                  <optgroup label="供应域">
                    <option value="Inventory">库存</option>
                    <option value="BOMLevel">BOM层级</option>
                    <option value="Supplier">供应商</option>
                    <option value="Material">物料</option>
                    <option value="Product">产品</option>
                    <option value="SparePart">备件</option>
                  </optgroup>
                  <optgroup label="计划域">
                    <option value="Routing">工艺路线</option>
                    <option value="ATPCommitment">交期承诺</option>
                  </optgroup>
                  <optgroup label="质量与运维">
                    <option value="QualityInspection">质检记录</option>
                    <option value="Telemetry">遥测数据</option>
                    <option value="EquipmentFailure">设备故障</option>
                    <option value="MaintenanceOrder">维修工单</option>
                  </optgroup>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowAddNodeModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-sm hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleAddNode}
                disabled={!newNodeData.id || !newNodeData.label}
                className="px-4 py-2 text-xs font-medium text-white bg-slate-800 rounded-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加节点
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Node Modal */}
      {showEditNodeModal && editingNode && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 ">
          <div className="bg-white rounded-sm shadow-xl w-[400px] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit3 size={16} className="text-slate-800" />
                编辑实体节点
              </h3>
              <button onClick={() => { setShowEditNodeModal(false); setEditingNode(null); }} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">节点 ID (唯一标识)</label>
                <input
                  type="text"
                  value={editNodeData.id}
                  onChange={e => setEditNodeData({...editNodeData, id: e.target.value})}
                  placeholder="例如: EQUIP-001"
                  className="w-full text-sm border border-slate-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">节点名称 (显示标签)</label>
                <input
                  type="text"
                  value={editNodeData.label}
                  onChange={e => setEditNodeData({...editNodeData, label: e.target.value})}
                  placeholder="例如: 1号涂布机"
                  className="w-full text-sm border border-slate-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">实体类型 (Type)</label>
                <select
                  value={editNodeData.type}
                  onChange={e => setEditNodeData({...editNodeData, type: e.target.value})}
                  className="w-full text-sm border border-slate-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  <optgroup label="需求域">
                    <option value="Customer">客户</option>
                    <option value="CustomerOrder">客户订单</option>
                    <option value="FinishedItem">成品物料</option>
                  </optgroup>
                  <optgroup label="生产域">
                    <option value="WorkCenter">工作中心</option>
                    <option value="ProductionOrder">生产工单</option>
                    <option value="Operation">工序</option>
                    <option value="Device">设备</option>
                    <option value="ProductionLine">产线</option>
                  </optgroup>
                  <optgroup label="供应域">
                    <option value="Inventory">库存</option>
                    <option value="BOMLevel">BOM层级</option>
                    <option value="Supplier">供应商</option>
                    <option value="Material">物料</option>
                    <option value="Product">产品</option>
                    <option value="SparePart">备件</option>
                  </optgroup>
                  <optgroup label="计划域">
                    <option value="Routing">工艺路线</option>
                    <option value="ATPCommitment">交期承诺</option>
                  </optgroup>
                  <optgroup label="质量与运维">
                    <option value="QualityInspection">质检记录</option>
                    <option value="Telemetry">遥测数据</option>
                    <option value="EquipmentFailure">设备故障</option>
                    <option value="MaintenanceOrder">维修工单</option>
                  </optgroup>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => { setShowEditNodeModal(false); setEditingNode(null); }}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-sm hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleSaveEditNode}
                disabled={!editNodeData.id || !editNodeData.label}
                className="px-4 py-2 text-xs font-medium text-white bg-slate-800 rounded-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Node Detail Modal */}
      {showNodeDetailModal && selectedNodeDetail && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 " onClick={() => setShowNodeDetailModal(false)}>
          <div className="bg-white rounded-sm shadow-xl w-[600px] max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Info size={20} className="text-slate-800" />
                  {selectedNodeDetail.label}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  类型: {selectedNodeDetail.type} | ID: {selectedNodeDetail.id}
                </p>
              </div>
              <button onClick={() => setShowNodeDetailModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {(() => {
                const def = ENTITY_ATTRIBUTE_DEFINITIONS[selectedNodeDetail.type];
                if (!def) {
                  return (
                    <div className="text-center text-slate-500 py-8">
                      <Box size={48} className="mx-auto mb-4 text-slate-300" />
                      <p>暂无 "{selectedNodeDetail.type}" 的详细属性定义</p>
                      <p className="text-xs mt-2">请在系统中添加该实体类型的属性定义</p>
                    </div>
                  );
                }
                return (
                  <div>
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-sm">
                      <p className="text-sm text-blue-800">{def.description}</p>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Layers size={14} />
                      属性定义
                    </h4>
                    <div className="space-y-2">
                      {def.attributes.map((attr: any, idx: number) => (
                        <div key={idx} className="border border-slate-200 rounded-sm overflow-hidden">
                          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-semibold text-slate-800">{attr.name}</span>
                              <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded">{attr.type}</span>
                              {attr.required && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded">必填</span>
                              )}
                            </div>
                          </div>
                          <div className="px-3 py-2">
                            <p className="text-xs text-slate-600">{attr.desc}</p>
                            {attr.values && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {attr.values.map((v: string) => (
                                  <span key={v} className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded border border-emerald-200">
                                    {v}
                                  </span>
                                ))}
                              </div>
                            )}
                            {attr.ref && (
                              <p className="mt-1 text-[10px] text-slate-500">
                                引用: <span className="text-blue-600">{attr.ref}</span>
                              </p>
                            )}
                          </div>
                          {attr.children && (
                            <div className="px-3 pb-2">
                              <div className="pl-3 border-l-2 border-slate-200 space-y-1">
                                {attr.children.map((child: any, childIdx: number) => (
                                  <div key={childIdx} className="flex items-start gap-2 py-1">
                                    <span className="text-slate-400 mt-0.5">└</span>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-slate-700">{child.name}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">{child.type}</span>
                                      </div>
                                      <p className="text-[10px] text-slate-500">{child.desc}</p>
                                      {child.values && (
                                        <div className="mt-0.5 flex flex-wrap gap-1">
                                          {child.values.map((v: string) => (
                                            <span key={v} className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                              {v}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowNodeDetailModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-sm hover:bg-slate-100"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewGraphConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 ">
          <div className="bg-white rounded-sm shadow-xl w-[400px] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                新建图谱确认
              </h3>
              <button onClick={() => setShowNewGraphConfirm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600">
                确定要新建图谱吗？当前未保存的节点和关系将被清空。
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowNewGraphConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-sm hover:bg-slate-50"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  setRelNodes([]);
                  setRelEdges([]);
                  setGraphName('新建本体图谱');
                  setActiveRelId(null);
                  setIsAddingRel(false);
                  setShowNewGraphConfirm(false);
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-slate-800 rounded-sm hover:bg-slate-700"
              >
                确定新建
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveToast && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-sm animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span className="text-sm font-medium">图谱 "{graphName}" 已保存！可在“本体库”模块中使用。</span>
        </div>
      )}
    </div>
  );

  // 预定义的行为规则库（基于业务需求文档）
  const [selectedRuleType, setSelectedRuleType] = useState<'all' | 'calculation' | 'trigger' | 'constraint'>('all');
  const [selectedRuleDomain, setSelectedRuleDomain] = useState<string>('all');
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [ruleForm, setRuleForm] = useState({
    id: '',
    name: '',
    type: 'calculation',
    domain: '生产域',
    description: '',
    targetEntities: [] as string[]
  });
  const [entityRules, setEntityRules] = useState<Record<string, string[]>>({
    '工作中心': ['calc_capacity', 'calc_oee'],
    '工序': ['calc_operation_time', 'calc_critical_path', 'constraint_no_skip'],
    '库存': ['calc_inventory', 'constraint_no_double_reserve', 'constraint_shelf_life'],
    '生产工单': ['trigger_overload'],
    '客户订单': ['trigger_vip_alert', 'trigger_delivery_risk'],
    '设备': ['trigger_fault'],
    '成品物料': ['constraint_moq'],
  });

  const handleAddRule = () => {
    if (!ruleForm.id || !ruleForm.name) return;
    // 添加到库中
    // 这里简化处理，实际应该更新 BEHAVIOR_RULES_LIBRARY
    setShowAddRuleModal(false);
    setRuleForm({ id: '', name: '', type: 'calculation', domain: '生产域', description: '', targetEntities: [] });
  };

  const handleAssignRuleToEntity = (ruleId: string, entityType: string) => {
    setEntityRules(prev => ({
      ...prev,
      [entityType]: [...(prev[entityType] || []), ruleId]
    }));
  };

  const handleRemoveRuleFromEntity = (ruleId: string, entityType: string) => {
    setEntityRules(prev => ({
      ...prev,
      [entityType]: (prev[entityType] || []).filter(id => id !== ruleId)
    }));
  };

  const getRuleTypeLabel = (type: string) => {
    switch(type) {
      case 'calculation': return { label: '计算规则', color: 'bg-blue-100 text-blue-700 border-blue-300' };
      case 'trigger': return { label: '触发规则', color: 'bg-amber-100 text-amber-700 border-amber-300' };
      case 'constraint': return { label: '约束规则', color: 'bg-rose-100 text-rose-700 border-rose-300' };
      default: return { label: type, color: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  const renderRulesSubTab = () => {
    return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Wrench size={16} className="text-slate-800" /> 行为规则建模
          </h3>
          <div className="h-4 w-px bg-slate-300"></div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>共 {BEHAVIOR_RULES_LIBRARY.length} 条预定义规则</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddRuleModal(true)}
            className="bg-slate-800 text-white px-4 py-1.5 rounded text-xs font-medium hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <Plus size={14} /> 新建规则
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">规则类型:</span>
          <select
            value={selectedRuleType}
            onChange={(e) => setSelectedRuleType(e.target.value as any)}
            className="text-xs border border-slate-300 rounded px-2 py-1 bg-slate-50 focus:outline-none focus:border-slate-800"
          >
            <option value="all">全部类型</option>
            <option value="calculation">计算规则</option>
            <option value="trigger">触发规则</option>
            <option value="constraint">约束规则</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">所属域:</span>
          <select
            value={selectedRuleDomain}
            onChange={(e) => setSelectedRuleDomain(e.target.value)}
            className="text-xs border border-slate-300 rounded px-2 py-1 bg-slate-50 focus:outline-none focus:border-slate-800"
          >
            <option value="all">全部域</option>
            <option value="需求域">需求域</option>
            <option value="生产域">生产域</option>
            <option value="供应域">供应域</option>
            <option value="计划域">计划域</option>
            <option value="基础资源">基础资源</option>
            <option value="质量与运维">质量与运维</option>
          </select>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <span className="w-2 h-2 rounded-sm bg-blue-500"></span> 计算规则
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <span className="w-2 h-2 rounded-sm bg-amber-500"></span> 触发规则
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <span className="w-2 h-2 rounded-sm bg-rose-500"></span> 约束规则
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Rules Library */}
        <div className="w-1/2 border-r border-slate-200 bg-white relative" style={{ height: 'calc(100vh - 280px)', overflow: 'hidden' }}>
          <div className="overflow-y-scroll p-4 pb-20" style={{ height: '100%', maxHeight: 'calc(100vh - 280px)' }}>
            <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Database size={12} /> 规则库
            </h4>
            <div className="space-y-3">
              {BEHAVIOR_RULES_LIBRARY
                .filter(rule => selectedRuleType === 'all' || rule.type === selectedRuleType)
                .filter(rule => selectedRuleDomain === 'all' || rule.domain === selectedRuleDomain)
                .map(rule => {
                  const typeInfo = getRuleTypeLabel(rule.type);
                  return (
                    <div
                      key={rule.id}
                      onClick={() => setSelectedRuleId(rule.id)}
                      className={cn(
                        "border rounded-sm p-3 cursor-pointer transition-colors group",
                        selectedRuleId === rule.id
                          ? "border-slate-800 bg-slate-50 ring-1 ring-slate-200"
                          : "border-slate-200 hover:border-slate-400"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded border ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {rule.domain}
                          </span>
                        </div>
                        {selectedRuleId === rule.id && (
                          <span className="text-[10px] text-slate-800 font-medium">已选中</span>
                        )}
                      </div>
                      <h5 className="text-sm font-semibold text-slate-800 mb-1">{rule.name}</h5>
                      <p className="text-xs text-slate-600 mb-2 font-mono bg-slate-50 p-2 rounded break-words whitespace-pre-wrap overflow-y-auto" style={{ maxHeight: '120px' }}>{rule.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">已绑定实体:</span>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(entityRules)
                            .filter(([_, rules]) => rules.includes(rule.id))
                            .map(([entityType]) => (
                              <span key={entityType} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                {entityType}
                              </span>
                            ))}
                          {Object.entries(entityRules).filter(([_, rules]) => rules.includes(rule.id)).length === 0 && (
                            <span className="text-[10px] text-slate-400 italic">未绑定</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Entity Rules Assignment */}
        <div className="w-1/2 bg-slate-50" style={{ height: 'calc(100vh - 280px)', overflow: 'hidden' }}>
          <div className="overflow-y-scroll p-4 pb-20" style={{ height: '100%', maxHeight: 'calc(100vh - 280px)' }}>
            {selectedRuleId ? (() => {
              const selectedRule = BEHAVIOR_RULES_LIBRARY.find(r => r.id === selectedRuleId);
              if (!selectedRule) return null;
              const typeInfo = getRuleTypeLabel(selectedRule.type);
              // 获取已绑定该规则的实体
              const boundEntities = Object.entries(entityRules)
                .filter(([_, rules]) => rules.includes(selectedRuleId))
                .map(([entityType]) => entityType);
              // 获取可绑定该规则的实体（未绑定的）
              const availableEntities = Object.keys(entityRules).filter(
                entityType => !entityRules[entityType]?.includes(selectedRuleId)
              );

              return (
                <div>
                  {/* 规则详情头部 */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <Settings size={12} /> 规则配置
                    </h4>
                    <button
                      onClick={() => setSelectedRuleId(null)}
                      className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      <X size={12} /> 关闭
                    </button>
                  </div>

                  {/* 规则基本信息 */}
                  <div className="bg-white border border-slate-200 rounded-sm p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {selectedRule.domain}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">{selectedRule.name}</h3>
                    <p className="text-xs text-slate-600 font-mono bg-slate-50 p-2 rounded break-words whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {selectedRule.description}
                    </p>
                    {selectedRule.applicableRelations && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <span className="text-[10px] text-slate-500">适用关系:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedRule.applicableRelations.map(([s, t], idx) => (
                            <span key={idx} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                              {s} → {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 已绑定实体 */}
                  <div className="mb-4">
                    <h5 className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1">
                      <CheckCircle2 size={12} /> 已绑定实体 ({boundEntities.length})
                    </h5>
                    {boundEntities.length > 0 ? (
                      <div className="space-y-2">
                        {boundEntities.map(entityType => (
                          <div key={entityType} className="flex items-center justify-between bg-white border border-slate-200 rounded-sm p-2">
                            <span className="text-xs text-slate-700">{entityType}</span>
                            <button
                              onClick={() => handleRemoveRuleFromEntity(selectedRuleId, entityType)}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">该规则尚未绑定任何实体</p>
                    )}
                  </div>

                  {/* 可绑定实体 */}
                  {availableEntities.length > 0 && (
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-700 mb-2">绑定到实体</h5>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignRuleToEntity(selectedRuleId, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 bg-white"
                      >
                        <option value="">+ 选择实体类型...</option>
                        {availableEntities.map(entityType => (
                          <option key={entityType} value={entityType}>{entityType}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })() : (
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Box size={12} /> 实体规则绑定概览
                </h4>
                <div className="space-y-4">
                  {Object.entries(entityRules).map(([entityType, rules]) => (
                    <div key={entityType} className="bg-white border border-slate-200 rounded-sm p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-semibold text-slate-800">{entityType}</h5>
                        <span className="text-[10px] text-slate-500">{rules.length} 条规则</span>
                      </div>
                      <div className="space-y-2">
                        {rules.map(ruleId => {
                          const rule = BEHAVIOR_RULES_LIBRARY.find(r => r.id === ruleId);
                          if (!rule) return null;
                          const typeInfo = getRuleTypeLabel(rule.type);
                          return (
                            <div
                              key={ruleId}
                              onClick={() => setSelectedRuleId(ruleId)}
                              className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded cursor-pointer hover:bg-slate-100"
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${typeInfo.color.split(' ')[0].replace('bg-', 'bg-').replace('100', '500')}`}></span>
                                <span className="text-slate-700">{rule.name}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssignRuleToEntity(e.target.value, entityType);
                              e.target.value = '';
                            }
                          }}
                          className="w-full text-xs border border-slate-300 rounded px-2 py-1 bg-white"
                        >
                          <option value="">+ 添加规则...</option>
                          {BEHAVIOR_RULES_LIBRARY
                            .filter(rule => !rules.includes(rule.id))
                            .map(rule => (
                              <option key={rule.id} value={rule.id}>
                                {getRuleTypeLabel(rule.type).label}: {rule.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

  const renderInstancesTab = () => (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Box size={16} className="text-slate-800" /> 本体库
          </h3>
          <div className="h-4 w-px bg-slate-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">选择目标实例:</span>
            <select
              className="text-xs border border-slate-300 rounded px-2 py-1 focus:outline-none focus:border-slate-800 bg-slate-50"
              value={selectedInstanceTarget}
              onChange={(e) => setSelectedInstanceTarget(e.target.value)}
            >
              {Object.entries(SCENARIOS_DATA).map(([key, data]) => (
                <option key={key} value={key}>{data.name}</option>
              ))}
            </select>
            <button
              onClick={handleCreateNewOntology}
              className="ml-2 px-2 py-1 text-[10px] bg-slate-100 text-slate-700 rounded border border-slate-300 hover:bg-slate-200 flex items-center gap-1"
            >
              <Plus size={10} /> 新建
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInstanceNodeModal(true)}
            className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Plus size={14} /> 添加节点
          </button>
          <button
            onClick={() => setShowInstanceEdgeModal(true)}
            className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Link2 size={14} /> 添加关系
          </button>
          <div className="w-px h-4 bg-slate-300"></div>
          <button
            onClick={() => setActiveTab('ontology')}
            className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> 上一步
          </button>
          <button className="bg-slate-800 text-white px-4 py-1.5 rounded text-xs font-medium hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Save size={14} /> 发布至知识库
          </button>
        </div>
      </div>

      <div 
        className="flex-1 relative overflow-hidden flex items-center justify-center bg-slate-50"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Instance Graph Visualization */}
        <div className="absolute top-1/2 left-1/2 w-0 h-0">
          <svg className="absolute overflow-visible pointer-events-none" style={{ top: 0, left: 0 }}>
            <defs>
              <marker id="arrow-inst" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
              </marker>
            </defs>
            {(instanceEdges.length > 0 ? instanceEdges : SCENARIOS_DATA[selectedInstanceTarget]?.edges || []).map(edge => {
              const source = instanceNodes.find(n => n.id === edge.source);
              const target = instanceNodes.find(n => n.id === edge.target);
              if (!source || !target) return null;

              return (
                <g key={edge.id}>
                  <line
                    x1={source.x} y1={source.y}
                    x2={target.x} y2={target.y}
                    stroke="#9ca3af" strokeWidth="2" markerEnd="url(#arrow-inst)"
                  />
                  <text
                    x={(source.x + target.x)/2}
                    y={(source.y + target.y)/2 - 5}
                    textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="medium"
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {instanceNodes.map(node => {
            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id, node.x, node.y)}
                onDoubleClick={(e) => { e.stopPropagation(); handleShowNodeDetail(node); }}
                className={cn(
                  "absolute transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 p-3 rounded-sm flex flex-col items-center w-36 z-10 cursor-move select-none transition-shadow group",
                  dragState?.id === node.id ? "border-slate-400 ring-2 ring-slate-100" : "border-slate-300 hover:border-slate-400 hover:shadow-md"
                )}
                style={{ left: node.x, top: node.y }}
                title="双击查看详情"
              >
                {/* Node Action Buttons */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleShowNodeDetail(node); }}
                    className="w-6 h-6 bg-white border border-slate-200 rounded-sm flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:border-emerald-300 shadow-sm"
                    title="查看详情"
                  >
                    <Info size={12} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEditInstanceNode(node); }}
                    className="w-6 h-6 bg-white border border-slate-200 rounded-sm flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 shadow-sm"
                    title="编辑节点"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteInstanceNode(node.id); }}
                    className="w-6 h-6 bg-white border border-slate-200 rounded-sm flex items-center justify-center text-slate-600 hover:text-rose-600 hover:border-rose-300 shadow-sm"
                    title="删除节点"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider pointer-events-none">{node.type}</div>
                <span className="text-sm font-bold text-slate-900 pointer-events-none">{node.label}</span>
                <div className="text-[9px] font-mono text-slate-400 mt-1 pointer-events-none">{node.id}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instance Node Modal */}
      {showInstanceNodeModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 ">
          <div className="bg-white rounded-sm shadow-xl w-[400px] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {editingInstanceNode ? <Edit3 size={16} className="text-slate-800" /> : <Plus size={16} className="text-slate-800" />}
                {editingInstanceNode ? '编辑实例节点' : '添加实例节点'}
              </h3>
              <button onClick={() => { setShowInstanceNodeModal(false); setEditingInstanceNode(null); setInstanceNodeForm({ id: '', label: '', type: '设备' }); }} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">节点 ID (唯一标识)</label>
                <input
                  type="text"
                  value={instanceNodeForm.id}
                  onChange={e => setInstanceNodeForm({...instanceNodeForm, id: e.target.value})}
                  placeholder="例如: COATER-001"
                  className="w-full text-sm border border-slate-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">节点名称 (显示标签)</label>
                <input
                  type="text"
                  value={instanceNodeForm.label}
                  onChange={e => setInstanceNodeForm({...instanceNodeForm, label: e.target.value})}
                  placeholder="例如: 涂布机-01"
                  className="w-full text-sm border border-slate-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">实体类型</label>
                <select
                  value={instanceNodeForm.type}
                  onChange={e => setInstanceNodeForm({...instanceNodeForm, type: e.target.value})}
                  className="w-full text-sm border border-slate-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  <optgroup label="需求域">
                    <option value="Customer">客户</option>
                    <option value="CustomerOrder">客户订单</option>
                    <option value="FinishedItem">成品物料</option>
                  </optgroup>
                  <optgroup label="生产域">
                    <option value="WorkCenter">工作中心</option>
                    <option value="ProductionOrder">生产工单</option>
                    <option value="Operation">工序</option>
                    <option value="Device">设备</option>
                    <option value="ProductionLine">产线</option>
                    <option value="Workshop">车间</option>
                    <option value="Factory">工厂</option>
                  </optgroup>
                  <optgroup label="供应域">
                    <option value="Inventory">库存</option>
                    <option value="BOMLevel">BOM层级</option>
                    <option value="BOM">物料清单</option>
                    <option value="Supplier">供应商</option>
                    <option value="Material">物料</option>
                    <option value="Product">产品</option>
                    <option value="SparePart">备件</option>
                  </optgroup>
                  <optgroup label="计划域">
                    <option value="Routing">工艺路线</option>
                    <option value="ATPCommitment">交期承诺</option>
                  </optgroup>
                  <optgroup label="质量与运维">
                    <option value="QualityInspection">质检记录</option>
                    <option value="Telemetry">遥测数据</option>
                    <option value="EquipmentFailure">设备故障</option>
                    <option value="MaintenanceOrder">维修工单</option>
                  </optgroup>
                  <optgroup label="组织与人员">
                    <option value="Technician">技术员</option>
                  </optgroup>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => { setShowInstanceNodeModal(false); setEditingInstanceNode(null); setInstanceNodeForm({ id: '', label: '', type: '设备' }); }}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-sm hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleSaveInstanceNode}
                disabled={!instanceNodeForm.id || !instanceNodeForm.label}
                className="px-4 py-2 text-xs font-medium text-white bg-slate-800 rounded-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingInstanceNode ? '保存修改' : '添加节点'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Node Detail Modal */}
      {showNodeDetailModal && selectedNodeDetail && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 " onClick={() => setShowNodeDetailModal(false)}>
          <div className="bg-white rounded-sm shadow-xl w-[600px] max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Info size={20} className="text-slate-800" />
                  {selectedNodeDetail.label}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  类型: {selectedNodeDetail.type} | ID: {selectedNodeDetail.id}
                </p>
              </div>
              <button onClick={() => setShowNodeDetailModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {(() => {
                const def = ENTITY_ATTRIBUTE_DEFINITIONS[selectedNodeDetail.type];
                if (!def) {
                  return (
                    <div className="text-center text-slate-500 py-8">
                      <Box size={48} className="mx-auto mb-4 text-slate-300" />
                      <p>暂无 "{selectedNodeDetail.type}" 的详细属性定义</p>
                      <p className="text-xs mt-2">请在系统中添加该实体类型的属性定义</p>
                    </div>
                  );
                }
                return (
                  <div>
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-sm">
                      <p className="text-sm text-blue-800">{def.description}</p>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Layers size={14} />
                      属性定义
                    </h4>
                    <div className="space-y-2">
                      {def.attributes.map((attr: any, idx: number) => (
                        <div key={idx} className="border border-slate-200 rounded-sm overflow-hidden">
                          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-semibold text-slate-800">{attr.name}</span>
                              <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded">{attr.type}</span>
                              {attr.required && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded">必填</span>
                              )}
                            </div>
                          </div>
                          <div className="px-3 py-2">
                            <p className="text-xs text-slate-600">{attr.desc}</p>
                            {attr.values && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {attr.values.map((v: string) => (
                                  <span key={v} className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded border border-emerald-200">
                                    {v}
                                  </span>
                                ))}
                              </div>
                            )}
                            {attr.ref && (
                              <p className="mt-1 text-[10px] text-slate-500">
                                引用: <span className="text-blue-600">{attr.ref}</span>
                              </p>
                            )}
                          </div>
                          {attr.children && (
                            <div className="px-3 pb-2">
                              <div className="pl-3 border-l-2 border-slate-200 space-y-1">
                                {attr.children.map((child: any, childIdx: number) => (
                                  <div key={childIdx} className="flex items-start gap-2 py-1">
                                    <span className="text-slate-400 mt-0.5">└</span>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-slate-700">{child.name}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">{child.type}</span>
                                      </div>
                                      <p className="text-[10px] text-slate-500">{child.desc}</p>
                                      {child.values && (
                                        <div className="mt-0.5 flex flex-wrap gap-1">
                                          {child.values.map((v: string) => (
                                            <span key={v} className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                              {v}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Instance Edge Modal */}
      {showInstanceEdgeModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 ">
          <div className="bg-white rounded-sm shadow-xl w-[400px] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {editingInstanceEdge ? <Edit3 size={16} className="text-slate-800" /> : <Link2 size={16} className="text-slate-800" />}
                {editingInstanceEdge ? '编辑关系' : '添加关系'}
              </h3>
              <button onClick={() => { setShowInstanceEdgeModal(false); setEditingInstanceEdge(null); setInstanceEdgeForm({ source: '', target: '', label: '' }); }} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">源节点 (Source)</label>
                <select
                  value={instanceEdgeForm.source}
                  onChange={e => setInstanceEdgeForm({...instanceEdgeForm, source: e.target.value})}
                  className="w-full text-sm border border-slate-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  <option value="">选择源节点</option>
                  {instanceNodes.map(n => <option key={n.id} value={n.id}>{n.label} ({n.id})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">目标节点 (Target)</label>
                <select
                  value={instanceEdgeForm.target}
                  onChange={e => setInstanceEdgeForm({...instanceEdgeForm, target: e.target.value})}
                  className="w-full text-sm border border-slate-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  <option value="">选择目标节点</option>
                  {instanceNodes.map(n => <option key={n.id} value={n.id}>{n.label} ({n.id})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">关系名称</label>
                <input
                  type="text"
                  list="instance-relation-labels"
                  value={instanceEdgeForm.label}
                  onChange={e => setInstanceEdgeForm({...instanceEdgeForm, label: e.target.value})}
                  placeholder="例如: 包含, 属于, 产生"
                  className="w-full text-sm border border-slate-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                <datalist id="instance-relation-labels">
                  <option value="包含" />
                  <option value="属于" />
                  <option value="产生" />
                  <option value="消耗" />
                  <option value="触发" />
                  <option value="分配给" />
                  <option value="需要" />
                  <option value="维护" />
                  <option value="加工于" />
                  <option value="由...检验" />
                  <option value="由...供应" />
                  <option value="监控" />
                  <option value="定义" />
                  <option value="生产" />
                  <option value="履行" />
                  <option value="影响" />
                  <option value="升级" />
                  <option value="延迟" />
                  <option value="安装" />
                  <option value="使用" />
                  <option value="采购自" />
                  <option value="交付给" />
                  <option value="发货自" />
                  <option value="控制环境" />
                  <option value="安装于" />
                  <option value="被...替换" />
                  <option value="消耗能源" />
                  <option value="产生废料" />
                  <option value="发生于" />
                  <option value="由...报告" />
                  <option value="涉及" />
                  <option value="测试于" />
                </datalist>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => { setShowInstanceEdgeModal(false); setEditingInstanceEdge(null); setInstanceEdgeForm({ source: '', target: '', label: '' }); }}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-sm hover:bg-slate-50"
              >
                取消
              </button>
              {editingInstanceEdge && (
                <button
                  onClick={() => handleDeleteInstanceEdge(editingInstanceEdge.id)}
                  className="px-4 py-2 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-sm hover:bg-rose-100"
                >
                  删除
                </button>
              )}
              <button
                onClick={handleSaveInstanceEdge}
                disabled={!instanceEdgeForm.source || !instanceEdgeForm.target || !instanceEdgeForm.label}
                className="px-4 py-2 text-xs font-medium text-white bg-slate-800 rounded-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingInstanceEdge ? '保存修改' : '添加关系'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* GitHub-style Header */}
      <header className="border-b border-slate-200">
        {/* Top Bar */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 text-sm text-slate-600">
          <Database size={16} className="text-slate-400" />
          <span className="font-medium text-slate-900">本体与语义建模</span>
        </div>

        {/* Title Row */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 text-white flex items-center justify-center">
                <Network size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">锂电池制造领域本体</h1>
                <p className="text-sm text-slate-500">数据源映射、本体定义与关系图谱管理</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">
                <Save size={14} />
                保存本体
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white text-sm font-medium hover:bg-slate-700">
                <Plus size={14} />
                添加实体
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 border-t border-slate-200">
          {[
            { id: 'discovery', label: '数据接入', icon: Database },
            { id: 'mapping', label: '模版匹配', icon: Layers },
            { id: 'ontology', label: '本体创建', icon: GitMerge },
            { id: 'instances', label: '本体库', icon: Box },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabKey)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-t-2 transition-colors",
                  isActive
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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden bg-slate-50">
  {activeTab === 'discovery' && renderDiscoveryTab()}
        {activeTab === 'mapping' && renderMappingTab()}
        {activeTab === 'ontology' && renderOntologyCreationTab()}
        {activeTab === 'instances' && renderInstancesTab()}
      </div>
    </div>
  );
}
