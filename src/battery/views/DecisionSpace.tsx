import React, { useState, useMemo, useEffect, useRef } from 'react';

// ============================================================
// 严格 3 色规范
// ============================================================
const C = {
  primary: '#1E2A3A',    // 深蓝:主文字 / 主色
  accent: '#B8860B',     // 金色:强调 / 待拍板 / 高亮
  grey: '#94A3B8',       // 灰色:次要文字 / 边框
  // 派生(同色系)
  primaryLight: '#475569',
  accentBg: '#FEF3D7',
  greyLight: '#E2E8F0',
  bgLight: '#F8F9FB',
  bgGrey: '#EFF1F4',
  white: '#FFFFFF',
};

const FONT = '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';

// ============================================================
// 群成员自动配置规则(基于金额 + 安全等级)
// ============================================================
// 议题创建时,系统按规则自动决定哪些角色进群,避免:
// 1) 一线员工自己拉领导/领导 Agent 进群
// 2) 跨级别的群(CEO 不和经理同群,只和直接汇报对象同群)
const GROUP_RULES = {
  // 按金额分档
  small: {
    label: '小额议题', threshold: '< 5000 万',
    allowedLevels: ['执行层', '基地层', '工厂层', '产线层'],
    needsApproval: '执行层经理拍板',
  },
  medium: {
    label: '中额议题', threshold: '5000 万 ~ 5 亿',
    allowedLevels: ['经营层', '执行层', '基地层', '工厂层'],
    needsApproval: '副总裁拍板',
  },
  large: {
    label: '大额议题', threshold: '> 5 亿',
    allowedLevels: ['战略层', '经营层'],
    needsApproval: 'CEO 拍板',
    note: '跨级隔离 · CEO 群只含直接汇报的副总裁',
  },
};

// 议题转发链路:议题在跨级时通过「转发」延续,而非把跨级人员拉进同一个群
// 例:#1284 战术议题在执行层达成共识后,转发给副总裁群 → 副总裁群转发给 CEO 群
// 每次转发携带:议题摘要 + 关键数据 + 上一群的结论

// 根据议题 groupTier + 相关角色清单,自动计算群成员
function computeGroupMembers(topic) {
  const tier = topic.groupTier || 'medium';
  const rule = GROUP_RULES[tier];
  const allowedLevels = rule.allowedLevels;
  // 优先用 coreGroup(议题作者标记的核心相关角色),fallback 到 visible
  const relevant = topic.coreGroup || topic.visible || [];
  return relevant.filter(uid => {
    const u = USERS[uid];
    if (!u) return false;
    return allowedLevels.includes(u.level);
  });
}

// ============================================================
// 26 个角色(只用 title,无人名)
// ============================================================
const USERS = {
  // L1
  u_001: { id: 'u_001', title: 'CEO', initial: 'C', level: '战略层', role: 'ceo',
           scope: '全集团 · 4 基地 · 全工厂', defaultView: 'cockpit' },
  // L2
  u_002: { id: 'u_002', title: '生产副总裁', initial: '生', level: '经营层', role: 'vp_prod',
           scope: '集团生产 · 4 基地', defaultView: 'room' },
  u_003: { id: 'u_003', title: '销售副总裁', initial: '销', level: '经营层', role: 'vp_sales',
           scope: '集团销售 · 全客户', defaultView: 'room' },
  u_011: { id: 'u_011', title: '供应链副总裁', initial: '供', level: '经营层', role: 'vp_supply',
           scope: '集团供应链', defaultView: 'room' },
  u_051: { id: 'u_051', title: '运营副总裁', initial: '运', level: '经营层', role: 'vp_ops',
           scope: '集团运营 · 跨基地协同 · KPI 管控', defaultView: 'room' },
  // L3
  u_012: { id: 'u_012', title: '大客户经理 KA', initial: 'K', level: '执行层', role: 'mgr_ka',
           scope: 'A 类战略客户', defaultView: 'room' },
  u_013: { id: 'u_013', title: 'S&OP 经理', initial: 'S', level: '执行层', role: 'mgr_sop',
           scope: '销售/生产/供应链协调', defaultView: 'room' },
  u_014: { id: 'u_014', title: '需求预测分析师', initial: '需', level: '执行层', role: 'analyst_demand',
           scope: '12 个月滚动预测', defaultView: 'room' },
  u_015: { id: 'u_015', title: '产能规划师', initial: '容', level: '执行层', role: 'planner_capacity',
           scope: '中长期产能规划', defaultView: 'room' },
  u_004: { id: 'u_004', title: '计划经理', initial: '计', level: '执行层', role: 'mgr_plan',
           scope: '生产计划部', defaultView: 'room' },
  u_007: { id: 'u_007', title: '财务经理', initial: '财', level: '执行层', role: 'mgr_finance',
           scope: '财务部 · 全口径', defaultView: 'room' },
  u_006: { id: 'u_006', title: '质量经理', initial: '质', level: '执行层', role: 'mgr_quality',
           scope: '质量控制部', defaultView: 'room' },
  u_005: { id: 'u_005', title: '工艺总监', initial: '工', level: '执行层', role: 'mgr_process',
           scope: '工艺技术部 · 全工厂', defaultView: 'room' },
  u_009: { id: 'u_009', title: '采购负责人', initial: '采', level: '执行层', role: 'mgr_purchase',
           scope: '采购部 · 全物料', defaultView: 'room' },
  u_052: { id: 'u_052', title: '运营部长', initial: '运', level: '执行层', role: 'mgr_ops_director',
           scope: '集团运营管理部 · KPI 体系', defaultView: 'room' },
  u_053: { id: 'u_053', title: '运营经理', initial: '运', level: '执行层', role: 'mgr_ops',
           scope: '运营管理部 · 跨基地协同执行', defaultView: 'room' },
  // L3.5
  u_021: { id: 'u_021', title: '常州基地总经理', initial: '常', level: '基地层', role: 'gm_changzhou',
           scope: '常州基地 · F02 + F03', defaultView: 'room' },
  u_022: { id: 'u_022', title: '四川基地总经理', initial: '川', level: '基地层', role: 'gm_sichuan',
           scope: '四川基地 · F08 + F09', defaultView: 'room' },
  u_023: { id: 'u_023', title: '武汉基地总经理', initial: '汉', level: '基地层', role: 'gm_wuhan',
           scope: '武汉基地 · F12 + F13', defaultView: 'room' },
  u_024: { id: 'u_024', title: '厦门基地总经理', initial: '厦', level: '基地层', role: 'gm_xiamen',
           scope: '厦门基地 · F15 + F16', defaultView: 'room' },
  // L4
  u_031: { id: 'u_031', title: 'F02 工厂厂长', initial: 'F2', level: '工厂层', role: 'mgr_factory',
           scope: 'F02 · 乘用车', defaultView: 'room' },
  u_032: { id: 'u_032', title: 'F08 工厂厂长', initial: 'F8', level: '工厂层', role: 'mgr_factory',
           scope: 'F08 · 商用车', defaultView: 'room' },
  u_033: { id: 'u_033', title: 'F12 工厂厂长', initial: 'F12', level: '工厂层', role: 'mgr_factory',
           scope: 'F12 · 储能', defaultView: 'room' },
  u_034: { id: 'u_034', title: 'F15 工厂厂长', initial: 'F15', level: '工厂层', role: 'mgr_factory',
           scope: 'F15 · 海外', defaultView: 'room' },
  // L4.5
  u_041: { id: 'u_041', title: 'F02-PL01 产线长', initial: '线', level: '产线层', role: 'mgr_line',
           scope: 'F02 乘用车 · EV-200', defaultView: 'room' },
  u_042: { id: 'u_042', title: 'F02-PL02 产线长', initial: '线', level: '产线层', role: 'mgr_line',
           scope: 'F02 储能 · ESS-100', defaultView: 'room' },
  u_043: { id: 'u_043', title: 'F08-PL05 产线长', initial: '线', level: '产线层', role: 'mgr_line',
           scope: 'F08 商用车 · CV-300', defaultView: 'room' },
};

const USER_GROUPS = [
  { label: '战略层', ids: ['u_001'] },
  { label: '经营层', ids: ['u_002', 'u_003', 'u_011', 'u_051'] },
  { label: '执行层', ids: ['u_012', 'u_013', 'u_014', 'u_015', 'u_004', 'u_007', 'u_006', 'u_005', 'u_009', 'u_052', 'u_053'] },
  { label: '基地层', ids: ['u_021', 'u_022', 'u_023', 'u_024'] },
  { label: '工厂层', ids: ['u_031', 'u_032', 'u_033', 'u_034'] },
  { label: '产线层', ids: ['u_041', 'u_042', 'u_043'] },
];

const AGENT_INFO = {
  mgr_plan: { initial: '计', title: '计划经理' },
  mgr_process: { initial: '工', title: '工艺总监' },
  mgr_quality: { initial: '质', title: '质量经理' },
  mgr_finance: { initial: '财', title: '财务经理' },
  mgr_purchase: { initial: '采', title: '采购负责人' },
  vp_ops: { initial: '运', title: '运营副总裁' },
  mgr_ops_director: { initial: '运', title: '运营部长' },
  mgr_ops: { initial: '运', title: '运营经理' },
  mgr_ka: { initial: 'K', title: '大客户经理' },
  mgr_sop: { initial: 'S', title: 'S&OP 经理' },
  analyst_demand: { initial: '需', title: '需求预测' },
  planner_capacity: { initial: '容', title: '产能规划' },
  gm_changzhou: { initial: '常', title: '常州基地' },
  gm_sichuan: { initial: '川', title: '四川基地' },
  gm_wuhan: { initial: '汉', title: '武汉基地' },
  gm_xiamen: { initial: '厦', title: '厦门基地' },
  mgr_factory: { initial: '厂', title: '工厂' },
  mgr_line: { initial: '线', title: '产线' },
  value_stream: { initial: '流', title: '价值流' },
};

// ============================================================
// 年度目标(5 KPI)
// ============================================================
const GOALS = {
  revenue: { name: '年度营收', target: 650, actual: 500, unit: '亿',
             progress: 0.769, deviation: -5.7, level: 'warning' },
  margin: { name: '毛利率', target: 19.5, actual: 18.3, unit: '%',
            progress: 0.94, deviation: -1.2, level: 'warning' },
  capacity: { name: '产能利用率', target: 96, actual: 92, unit: '%',
              progress: 0.958, deviation: -4, level: 'warning' },
  inventory: { name: '库存周转', target: 28, actual: 32, unit: '天',
               progress: 0.88, deviation: 4, level: 'warning' },
  yield: { name: '良率', target: 97.5, actual: 96.2, unit: '%',
           progress: 0.987, deviation: -1.3, level: 'critical' },
};

const GOAL_ALERTS = [
  { id: 'a1', severity: 'warning', title: 'Q3 营收预测低于目标 5.7%',
    desc: '订单池 154 亿,目标 162 亿,缺口 8 亿', topicId: '#1295' },
  { id: 'a2', severity: 'critical', title: 'Q3 良率持续低于年度目标',
    desc: '当前 96.2% vs 目标 97.5%,全年预计损失 5.5 亿', topicId: '#1298' },
  { id: 'a3', severity: 'warning', title: '库存周转天数 32 天,高于目标 4 天',
    desc: '主要为电芯正极材料和铜箔安全库存偏高', topicId: null },
];

const BASES = [
  { id: 'b1', name: '常州基地', region: '华东', product: '乘用车', revenue: '247 / 190 亿', yield: '96.5%' },
  { id: 'b2', name: '四川基地', region: '西南', product: '商用车', revenue: '143 / 110 亿', yield: '96.1%' },
  { id: 'b3', name: '武汉基地', region: '华中', product: '储能', revenue: '162.5 / 125 亿', yield: '96.4%' },
  { id: 'b4', name: '厦门基地', region: '华南', product: '海外+储能', revenue: '97.5 / 75 亿', yield: '95.8%' },
];

// ============================================================
// 推演数据(每条消息 + 每个方案的「背后的数据 + 规则 + 历史」)
// ============================================================
// 消息推演:key = topicId + ':' + 消息序号(从 1 开始)
// 缺失的 key 会回退到通用模板
const MSG_REASONING = {
  '#1301:1': {
    dataSources: [
      'ERP 财务月结系统 · Q3 实际运营成本 8.0 亿',
      '预算系统 · Q3 预算 6.8 亿',
      'MES 系统 · 4 基地费用归集明细',
      '历史成本数据库 · 近 4 个季度的成本结构',
    ],
    rules: [
      '季度成本超预算 > 15% 自动触发 VP 级议题',
      '超额归因优先级:OEE > 班次 > 能耗 > 物料',
      '议题创建时自动关联所有上游告警议题',
    ],
    steps: [
      '采集 Q3 实际成本 8.0 亿 vs 预算 6.8 亿,超 17.6%',
      '执行 4 基地费用归集:常州 +3200 / 四川 +4500 / 武汉 +2800 / 厦门 +1500 万',
      '帕累托分析:OEE 不达标占 57%,班次切换 20%,能耗 18%',
      '自动创建 VP 级议题 + @运营副总裁 触发 Q3 复盘',
    ],
    references: ['#2025-Q1 类似治理案例(回收 6500 万,达成率 92%)'],
  },
  '#1304:2': {
    dataSources: [
      '集团 OEE 监控平台 · 4 基地实时数据',
      'ERP 投资管理 · 历史专项 ROI 数据',
      '设备资产库 · 主工序设备型号 + 寿命',
      '产能本体 · OEE +6pt 与产能扩张的映射关系',
    ],
    rules: [
      'OEE +1pt ≈ 等效产能扩张 1.4%',
      '专项 IRR ≥ 22% 集团红线即可立项',
      '试点基地需覆盖 ≥ 3 种产品类型保证代表性',
    ],
    steps: [
      '采集 4 基地 OEE 现状:常州 68% / 四川 65% / 武汉 76% / 厦门 71%',
      '识别提升空间最大的 3 基地组合',
      '执行产能模拟:OEE 72%→78% → 营收 +5.4 亿 / 毛利 +6300 万',
      '匹配 IRR 计算:14 个月回收期 → IRR 31%,超 22% 红线',
    ],
    references: ['#2024 类似 OEE 专项(达成 96%,ROI 1.6 倍)'],
  },
  '#1307:1': {
    dataSources: [
      'MES OEE 实时监控 · F01-PL03 涂布工序 11 周数据',
      '设备日志 · 涂布机 #3 #5 张力波动记录',
      '工艺数据库 · 涂头标准寿命 3800 小时',
      '排产历史 · 3 次停线检修申请被排产挤掉记录',
    ],
    rules: [
      'OEE 连续 4 周低于阈值自动开议题',
      'OEE 持续低于 70% + 累计损失 > 5000 万 → 强制上报运营条线',
      '设备实际使用 > 标准寿命 10% 触发到期警示',
    ],
    steps: [
      '识别 F01-PL03 涂布工序 OEE 持续 11 周低于 70%',
      '累计损失 560 万/周 × 11 周 = 6160 万,超 5000 万阈值',
      '匹配设备数据:涂头 4200h 已超 3800h 标准寿命 10.5%',
      '关联议题转发:#1301 成本超标的关键子问题',
      '自动创建议题 + @运营经理 立即处置',
    ],
    references: ['#2024-09 类似停线检修(达成 100%,3 周回收损失)'],
  },
  '#1284:1': {
    dataSources: [
      'ERP 订单系统 · 客户 X 的 PO #2026-0513',
      'MES 系统 · F02 当前订单池占用率 92%',
      '产能本体 · F02-PL01 / PL02 当周排程',
    ],
    rules: [
      '订单 > 200 套触发跨产线协同评估',
      '订单池占用 > 85% 触发产能挤占预警',
    ],
    steps: [
      '识别订单关键参数:8000 套 EV-200 / 6-15 交付 / 客户 X 战略级',
      '匹配产能本体:F02 当周可用余量约 280 套,缺口 520 套',
      '推断需挤占 PL02 储能产线 3 天产能',
      '生成发言并 @ 相关角色请求评估',
    ],
    references: ['#1247 客户 Z 加急订单(同类拆分场景)'],
  },
  '#1284:2': {
    dataSources: [
      'MES 工艺参数库 · F02-PL01 标准切换 SOP',
      '历史良率数据库 · 切换后首批良率统计(近 12 月)',
      '设备日志 · PL01 化成工序设备健康度',
    ],
    rules: [
      '产线切换 SOP:设备调校 + 工艺验证 = 10 小时',
      '首批良率经验值:常规 98% → 切换后 92%(±2pt)',
    ],
    steps: [
      '查询 PL01 当前生产产品 vs EV-200 工艺差异',
      '调用历史数据:近 12 次切换平均首批良率 91.8%',
      '判断:200 套是统计上稳定的恢复期产量',
      '输出切换时间 + 良率预测',
    ],
    references: ['#1180 Q1 切换良率复盘'],
  },
  '#1284:3': {
    dataSources: [
      'WMS 库存系统 · 正极材料实时库存 500 套用量',
      '供应商管理系统 · 主供应商交付周期',
      'BOM 系统 · EV-200 物料清单',
    ],
    rules: [
      '紧急补订前置时间 ≥ 5 天才能保证不影响交付',
      '战略储备库启用需供应链副总裁批准',
    ],
    steps: [
      'BOM 展开:8000 套 EV-200 正极材料需求量',
      '比对库存:可支撑 500 套 / 缺口 300 套',
      '查供应商交期:5 天到货,需 6/10 前下单',
      '判断:常规采购可满足 → 战略储备库由副总裁决定',
    ],
    references: ['#1199 电芯供应商 B 引入'],
  },
  '#1284:4': {
    dataSources: [
      'QMS 质量管理系统 · SPC 控制图历史',
      '质量本体 · 加严检验规则库',
      '客户 X 质量协议 · 检验标准',
    ],
    rules: [
      '产线节奏变化 + 战略客户 → 触发加严检验',
      'SPC 漂移阈值:Cpk < 1.33 时强制干预',
    ],
    steps: [
      '识别风险:切换+加急双重压力,SPC 漂移概率 +35%',
      '匹配检验规则:前 100 套全检 + 追溯样本保留',
      '生成 [加严检验方案] 草稿',
      '主人(质量经理)修改:增加「触发停线复核」条款',
    ],
    references: ['#1180 Q1 质量损失复盘', '#1199 新供应商前期全检'],
  },
  '#1284:5': {
    dataSources: [
      '财务模型 · 客户 X 历史毛利率 22%(战略客户优惠价)',
      '商用车合同 · 客户 Y 延期违约金条款 1800 万',
      '成本中心 · F02 产线切换工时成本 600 万',
      'ERP 订单系统 · 客户 X PO 单价 35000 元/套',
    ],
    rules: [
      '订单评估口径:净收益 = 营收 - 物料 - 切换 - 违约金',
      '战略客户毛利率使用合同价而非市场价',
    ],
    steps: [
      '订单营收:8000 × 35000 元 = 2.8 亿',
      '物料成本(70%):1.96 亿',
      '产线切换成本:600 万',
      '客户 Y 延期违约金:1800 万',
      '直接计算净收益:6160 万',
      '修正:战略客户毛利率 22% 包含长期合作溢价,实际净收益 +8400 万',
    ],
    references: ['#1247 客户 Z 加急订单(同口径核算)'],
  },
  '#1284:6': {
    dataSources: [
      '基地产能本体 · 常州 F02/F03 + 四川 F08/F09 利用率',
      'MES 跨基地排程系统 · 产线兼容性矩阵',
      '历史议题库 · 跨基地协同案例',
    ],
    rules: [
      '基地内单工厂承接 > 60% 月产能 → 触发跨基地评估',
      '跨基地拆分需目标基地 < 85% 利用率',
    ],
    steps: [
      '评估 F02 单独承接:良率风险 + PL02 挤占,综合风险评分 7.2/10',
      '搜索备选基地:四川 F08 利用率 79%,符合拆分条件',
      '匹配产线兼容性:F08-PL05 商用车线,可短期改造 EV-200',
      '生成 [拆分方案]:F02:500 + F08:300',
    ],
    references: ['#1215 跨基地协同生产(2025 Q4)'],
  },
  '#1284:7': {
    dataSources: [
      'F08 当周排程 · PL05 商用车产线富余 21%',
      '工艺差异库 · 商用车 ↔ EV-200 切换 SOP',
      'F08 人员排班 · 当周可调配工艺工人',
    ],
    rules: [
      '商用车 ↔ 乘用车切换需 8 小时(含工艺验证)',
      '富余产能 ≥ 25% 才能稳定承接 300 套',
    ],
    steps: [
      '确认 F08-PL05 可用产能:21% × 月产能 = 约 380 套',
      '匹配工艺切换 SOP:8 小时',
      '排班评估:可调配 18 名工艺工人',
      '确认承接 300 套可行',
    ],
    references: ['#1215 跨基地协同生产'],
  },
  '#1284:8': {
    dataSources: [
      'MES F02-PL01 当周排程',
      '人员排班系统 · F02 当班工人',
      '设备维护记录 · PL01 设备就绪度',
    ],
    rules: [
      '产线切换前需提前 24 小时通知工艺',
      '切换需配备 ≥ 20 名经过培训的工人',
    ],
    steps: [
      '安排切换窗口:5/14 14:00(避开夜班交接)',
      '调度工人 22 名(2 名备份)',
      '通知 PL01 产线长:5/15 完成首批 100 套',
      '同步设备维保:确认 PL01 化成设备无待修工单',
    ],
    references: ['#1180 切换 SOP'],
  },
  '#1284:9': {
    dataSources: [
      '客户分级系统 · 客户 X(A 类)/ 客户 Y(C 类延期 2 次)',
      'CRM · 客户 Y 历史沟通记录',
      '商用车订单库 · 客户 Y 延期影响订单 3 个',
    ],
    rules: [
      'A 类客户保供优先级 > C 类',
      'C 类客户 + 多次延期 → 升级到副总裁级沟通',
    ],
    steps: [
      '识别冲突:客户 X(A 类)vs 客户 Y(C 类)',
      '查询客户 Y 历史:已有 2 次延期记录,关系敏感',
      '匹配沟通规则:升级到副总裁级',
      '生成建议 + @ CEO 确认',
    ],
    references: ['#1247 客户 Z(A 类)沟通范式'],
  },
  '#1284:10': {
    dataSources: [
      '本议题前 9 条所有 Agent 发言',
      '年度目标本体 · 5 KPI 实时进度',
      '关联议题库 · #1290 #1298 状态',
      '多目标权重表 · CEO 视角(营收 30% / 毛利 25% / 产能 15% / 库存 10% / 良率 20%)',
    ],
    rules: [
      '价值流 Agent 综合时检查:对每个年度 KPI 的影响',
      '若决策加剧任一 KPI 偏差 → 在共识中明确提示',
      '需 CEO 拍板的悬置问题必须显式标出',
    ],
    steps: [
      '聚合所有 Agent 结论 → 形成 [拆分方案]',
      '多目标计算:营收 +8400 万 / 良率 -0.4pt(短期)',
      '与年度目标对齐检查:良率本已偏离 1.3pt,本方案再降 0.4pt',
      '触发关联议题提示:建议同步关注 #1298',
      '识别悬置问题:客户 Y 沟通主导方 → 由 CEO 拍板',
    ],
    references: ['#1247 同类拆分决策', '#1298 良率告警议题'],
  },
};

// ============================================================
// 人机内部沟通(主人和自己的 Agent 在群外私聊后,Agent 才在群里发言)
// key = topicId + ':' + 消息序号
// 只有 source: 'manual' 或 'modified' 的消息才有
// ============================================================
const MSG_NEGOTIATION = {
  '#1284:1': [
    { from: 'agent', text: '检测到客户 X 加急 800 套订单,F02 当前订单池已满 92%。我准备开议题,@工艺 @采购 @财务 评估。要发吗?' },
    { from: 'owner', text: '先别急,先告诉我:这种规模的订单,过去 3 年我们接过几单?最低毛利率是多少?' },
    { from: 'agent', text: '近 3 年同类加急订单 12 单,平均毛利率 19.4%,最低 14.2%(2024-Q2 那笔)。本单初步预估毛利率 22%,在历史均值之上。' },
    { from: 'owner', text: '好。那记得提醒挤占的是 PL02 储能产线,不是说「挤占商用车」—— 这次客户 X 是乘用车线本身满了。' },
    { from: 'agent', text: '已更正。最终版本:挤占储能产线 PL02 3 天。@工艺 @采购 @财务 评估。这样发?' },
    { from: 'owner', text: '可以,发。' },
  ],

  '#1284:3': [
    { from: 'agent', text: '正极材料库存可支撑 500 套,缺口 300 套。常规补订 5 天到货。建议发起常规补订流程。' },
    { from: 'owner', text: '5 天能赶上 6/15 交付吗?现在到 6/15 还有几天?' },
    { from: 'agent', text: '今天 5/13,到 6/15 还有 33 天。5 天补订完全够。但建议 6/10 前到货,给 F02 + F08 留 5 天物料分拨缓冲。' },
    { from: 'owner', text: '为什么不直接动用战略储备库?储备库是干嘛用的?' },
    { from: 'agent', text: '战略储备库定位是「7 天内无法常规补订」的应急场景。本次 5 天可补订,不符合启用条件。但如果您倾向更稳妥,可以让供应链副总裁决定 —— 我把这个选项放进发言里。' },
    { from: 'owner', text: '对,把决策权抛给副总裁,我们不替他做主。这样发。' },
  ],

  '#1284:4': [
    { from: 'agent', text: '节奏过快可能引发 SPC 漂移。建议前 100 套加严检验,保留追溯样本。这是常规风控做法。' },
    { from: 'owner', text: '「加严检验」具体什么标准?客户 X 协议里有没有相关条款?' },
    { from: 'agent', text: '我们的加严检验规则 v2.1 规定:前 100 套 100% 全检 + 追溯样本保留 6 个月。客户 X 协议 6.2 条要求 AQL 0.65,我们的加严标准等同于 AQL 0.4,更严。' },
    { from: 'owner', text: '加一个触发停线的条件 —— 不然万一良率失控,等到 100 套结束才发现就晚了。' },
    { from: 'agent', text: '同意。补充:若过程良率 < 95%,触发停线复核。修改版本您看?' },
    { from: 'owner', text: '可以,这样发。我修改后确认。' },
  ],

  '#1284:5': [
    { from: 'agent', text: '订单营收 8000 × 35000 元 = 2.8 亿,扣物料 1.96 亿、切换 600 万、违约金 1800 万,净收益 6160 万。建议接单。' },
    { from: 'owner', text: '战略客户的毛利率是不是有合作溢价?6160 万和「+8400 万」差在哪?' },
    { from: 'agent', text: '您提醒得对。客户 X 有 5 年战略协议,享有 8% 的合作溢价(体现在长期合作返点)。本单实际净收益 = 6160 万 + 2240 万溢价摊销 = +8400 万。' },
    { from: 'owner', text: '那 1800 万违约金的依据呢?客户 Y 合同里到底怎么写的?' },
    { from: 'agent', text: '客户 Y 供货合同第 8.3 条:延期 > 5 天,每天 300 万,5 天封顶 1800 万。本次预估延期 3 天,实际违约金可能仅 900 万,但保守取上限。' },
    { from: 'owner', text: '保守是对的。就按 +8400 万发,可接。' },
  ],

  '#1284:7': [
    { from: 'agent', text: '我们基地 F08-PL05 本月利用率 79%,有富余,改造 EV-200 约 8 小时,可接 300 套。要响应吗?' },
    { from: 'owner', text: '别那么快答应。300 套的工艺工人能凑齐吗?上个月我们还在缺人。' },
    { from: 'agent', text: '查了排班:可调配 18 名持证工艺工人,加 2 名备份。但 5/20 起有 3 名工人计划外出培训,如果接单需调整培训计划。' },
    { from: 'owner', text: '培训别动。让 HR 临时借调 F09 的人过来撑一下。这个我会和厂长沟通,你先表态可以接,但提一句「需 F09 支援工艺工人」。' },
    { from: 'agent', text: '明白。最终版本:F08-PL05 可承接 300 套,需 F09 临时支援 3 名工艺工人。发?' },
    { from: 'owner', text: '发。' },
  ],

  '#1284:8': [
    { from: 'agent', text: 'PL01 切换计划:5/14 14:00 启动,5/15 完成首批 100 套。我准备调度工人 22 名。要发吗?' },
    { from: 'owner', text: '为什么是 14:00?夜班交接是几点?会不会有冲突?' },
    { from: 'agent', text: '夜班交接 22:00。14:00 启动设备调校 + 工艺验证共 10 小时,正好在 24:00 完成,刚好夜班接力首批生产,不打架。' },
    { from: 'owner', text: '考虑过 PL01 上次维保是什么时候吗?设备状态稳吗?' },
    { from: 'agent', text: '查过设备日志:PL01 上次维保 5/8,健康度 96%。无待修工单。切换风险可控。' },
    { from: 'owner', text: '好。再确认一下 PL01 产线长今天在班,有人对接。这样发。' },
  ],
};

// 方案推演路径图(节点流程图)
// 每个方案对应一条「触发 → 数据 → 协商 → 综合 → 结论」的路径
const REASONING_PATHS = {
  p_split: {
    nodes: [
      {
        id: 'n1', label: '触发', short: '客户 X 加急 800 套',
        inputs: ['客户 X PO #2026-0513', '6/15 前交付要求', 'A 类战略客户标识'],
        logic: '加急订单规则引擎:订单 > 200 套且 ≤ 7 天交付 → 自动开议题',
        outputs: ['议题 #1284 创建,目标 CEO 拍板'],
      },
      {
        id: 'n2', label: '数据采集', short: '产能 / 物料 / 财务',
        inputs: [
          'F02 订单池占用 92% · PL01 可切换',
          '正极材料库存 500 套用量 · 缺口 300',
          '客户 X 历史毛利 22% · 客户 Y 违约金 1800 万',
          'F08 商用车线利用率 79%',
        ],
        logic: '价值流 Agent 自动跨系统调数据:MES + WMS + ERP + 财务',
        outputs: ['完整决策上下文 · 12 个关键数据点'],
      },
      {
        id: 'n3', label: '多 Agent 协商', short: '6 个角色发言',
        inputs: [
          '计划经理:接单需挤占 PL02 3 天',
          '工艺总监:切换 10h,首批良率 92%',
          '采购负责人:缺口 300 套,需补订',
          '质量经理:[加严检验方案]',
          '财务经理:净收益 +8400 万',
          '大客户经理:客户 Y 关系风险',
        ],
        logic: 'Agent 之间通过 @提及 触发协同;每个 Agent 在自己的专业域内独立推理',
        outputs: ['6 个专业视角共识 + 1 个悬置问题(客户 Y 沟通)'],
      },
      {
        id: 'n4', label: '多目标权衡', short: '5 KPI 影响评估',
        inputs: [
          '营收影响:+8400 万',
          '毛利:持平',
          '产能利用率:+0.3pt',
          '库存周转:持平',
          '良率:-0.4pt(短期,与 #1298 叠加风险)',
        ],
        logic: '价值流 Agent 用 CEO 视角权重(R30/M25/C15/I10/Y20)综合评分',
        outputs: ['综合评分 84 分 / 100 · 推荐通过 · 标注良率告警'],
      },
      {
        id: 'n5', label: '结论 + 关联', short: '[拆分方案]',
        inputs: [
          '通过的方案:F02:500 + F08:300',
          '关联议题:#1290(月度排程)、#1298(良率告警)',
          '悬置问题:客户 Y 沟通主导方',
        ],
        logic: '生成结构化方案 + 自动建立议题关联 + 推送悬置问题给 CEO',
        outputs: ['方案 prop_split · 关联图谱更新 · 议题待 CEO 拍板'],
      },
    ],
  },

  p_strict: {
    nodes: [
      { id: 'n1', label: '触发', short: '切换 + 加急双重压力',
        inputs: ['F02-PL01 即将切换', '客户 X 战略级'],
        logic: '质量风险预警规则:产线节奏变化 + 战略客户 → 自动启动加严流程',
        outputs: ['触发加严检验评估'] },
      { id: 'n2', label: '规则匹配', short: '质量本体库',
        inputs: ['SPC 漂移阈值 Cpk < 1.33', '加严检验规则 v2.1'],
        logic: '匹配质量本体中的同类规则模板',
        outputs: ['确定:前 100 套全检 + 追溯保留'] },
      { id: 'n3', label: '结论', short: '加严检验方案',
        inputs: ['检验范围 100 套', '触发停线条件:良率 < 95%'],
        logic: '主人(质量经理)修改后批准',
        outputs: ['方案 p_strict · 关联 #1180'] },
    ],
  },

  p_cross: {
    nodes: [
      { id: 'n1', label: '触发', short: '6 月 S&OP 评审',
        inputs: ['乘用车订单 +18%', '商用车 -12%'],
        logic: 'S&OP 月度自动评审:订单结构性偏差 > 15% 触发',
        outputs: ['议题 #1290 创建'] },
      { id: 'n2', label: '数据采集', short: '产能 / 需求 / 客户',
        inputs: ['F08 商用车线利用率 79%', '宁德 +600 套 · 比亚迪 +200 套'],
        logic: '需求预测 + 产能规划 + 大客户三 Agent 数据汇总',
        outputs: ['可用产能 21% · 客户优先级清单'] },
      { id: 'n3', label: '协商', short: '5 角色发言',
        inputs: ['需求预测 / 产能规划 / 四川基地 / 采购 / 财务'],
        logic: '多 Agent 协同,生成 F08 转产 30% 草案',
        outputs: ['跨产线调配方案'] },
      { id: 'n4', label: '权衡', short: '5 KPI 评估',
        inputs: ['营收 +3.2 亿', '库存 +2 天(风险)'],
        logic: '价值流 Agent 综合权重',
        outputs: ['综合评分 81 · 推荐通过'] },
      { id: 'n5', label: '结论', short: '[跨产线调配]',
        inputs: ['F08 转产 30%', '与 #1284 叠加风险提示'],
        logic: '生成方案 + 关联 #1284',
        outputs: ['方案 p_cross · 待生产副总裁拍板'] },
    ],
  },

  p_multi: {
    nodes: [
      { id: 'n1', label: '触发', short: 'Q3 营收缺口 8 亿',
        inputs: ['Q3 目标 162 亿', '订单池 154 亿'],
        logic: '季度滚动规划:缺口 > 5% 触发',
        outputs: ['议题 #1295 创建'] },
      { id: 'n2', label: '方案生成', short: '3 个备选方案',
        inputs: ['需求预测 / 产能规划 / 大客户共同生成'],
        logic: '多 Agent 头脑风暴:激进 / 平衡 / 保守',
        outputs: ['方案 A/B/C'] },
      { id: 'n3', label: '影响计算', short: '5 KPI × 3 方案',
        inputs: ['每个方案对 5 个 KPI 的预测影响'],
        logic: '财务 Agent 建模 + 各基地确认可行性',
        outputs: ['15 个影响数字 · 三方案权衡矩阵'] },
      { id: 'n4', label: '多目标求解', short: '价值流综合评分',
        inputs: ['CEO 视角权重(R30/M25/C15/I10/Y20)'],
        logic: '加权评分 + 与 #1298 良率告警冲突检查',
        outputs: ['A:72 · B:88 ⭐ · C:75 → 推荐 B'] },
      { id: 'n5', label: '结论', short: '[多目标求解方案]',
        inputs: ['推荐方案 B', '并行启动 #1298'],
        logic: '生成结构化方案 · 自动联动 #1298',
        outputs: ['方案 p_multi · 待 CEO 拍板'] },
    ],
  },

  p_yield: {
    nodes: [
      { id: 'n1', label: '触发', short: '系统自动告警',
        inputs: ['良率连续 3 月低于目标 1.0pt 以上'],
        logic: '年度目标监控:连续偏离 ≥ 3 个周期 → 自动创建议题',
        outputs: ['议题 #1298 自动创建(creator=system)'] },
      { id: 'n2', label: '根因分析', short: '质量 + 工艺 + 4 基地',
        inputs: ['SPC 数据', '4 基地工序参数对比', 'F03 设备日志'],
        logic: '多角色协同分析,聚焦化成工序湿度控制',
        outputs: ['根因:F03 设备老化 + F08 参数未定制化'] },
      { id: 'n3', label: '方案合成', short: '三管齐下',
        inputs: ['标准化 + SPC 升级 + F03 维保'],
        logic: '匹配「年度目标偏差」决策路径模板',
        outputs: ['8 周达 97.0%,12 周达 97.5%'] },
      { id: 'n4', label: '结论', short: '[良率改善方案]',
        inputs: ['专项投入 2800 万', '与 #1295 并行'],
        logic: '生成方案 · 跨基地资源协调',
        outputs: ['方案 p_yield · 待 CEO 批准'] },
    ],
  },
  // ====== v4.6 新增推演路径(对应 #1301-#1309 方案)====== //
  p_ops_cost: {
    nodes: [
      {
        id: 'n1', label: '触发', short: 'Q3 成本超标 1.2 亿',
        inputs: ['Q3 实际运营成本 8.0 亿', '预算 6.8 亿', '4 基地费用归集数据'],
        logic: '运营 KPI 引擎:季度费用超 15% → 自动开 VP 级议题',
        outputs: ['议题 #1301 创建,目标运营副总裁'],
      },
      {
        id: 'n2', label: '归因分析', short: '4 大成本驱动',
        inputs: ['OEE 不达标 6800 万 (57%)', '班次切换损失 2400 万 (20%)',
                '能耗超标 2200 万 (18%)', '其他 600 万 (5%)'],
        logic: '价值流 Agent 跨系统数据归因 + 帕累托分析',
        outputs: ['前两项占 77%,治理优先级 OEE > 班次'],
      },
      {
        id: 'n3', label: '双轨方案', short: 'OEE + 班次',
        inputs: ['OEE 专项 4500 万投入 → 回收 6500 万',
                '班次优化零投入 → 回收 2400 万',
                '能耗治理 350 万 → 220 万/年'],
        logic: 'ROI 排序 + 风险分散:双轨并行,Q4 见效',
        outputs: ['Q4 回收 8000 万 · 2026 年化 4.5 亿'],
      },
    ],
  },
  p_capacity_balance: {
    nodes: [
      {
        id: 'n1', label: '触发', short: '稼动率差距 11.4pt',
        inputs: ['常州 96.2% (过载)', '四川 89.5%', '武汉 91.3%', '厦门 84.8% (欠载)'],
        logic: '稼动率监控:基地间差距 > 5pt 触发再平衡议题',
        outputs: ['议题 #1302 创建,目标运营副总裁'],
      },
      {
        id: 'n2', label: '订单转移模拟', short: '2 条主路径',
        inputs: ['武汉 → 厦门:2.4 亿储能订单(改造 4 小时)',
                '常州 → 四川:1800 万乘用车订单(改造 8 小时)',
                '客户接受度评估'],
        logic: '产能模拟 + 加班合规度优化 + 客户优先级',
        outputs: ['2 条转移路径,均可行'],
      },
      {
        id: 'n3', label: '销售协同', short: '统一告知 4 客户',
        inputs: ['涉及 4 个客户的订单转移', 'KA 销售口径统一建议'],
        logic: '客户体验保护:避免基地分别沟通造成口径不一',
        outputs: ['销售统一告知 · 均衡度从 11.4pt → 4pt'],
      },
    ],
  },
  p_budget_2026: {
    nodes: [
      {
        id: 'n1', label: '现状', short: '2025 占比 13.2%',
        inputs: ['2025 实际运营成本 85.8 亿', '营收 650 亿', '行业头部中位数 11.5%'],
        logic: '行业对标:我方占比偏离头部 1.7pt,有改善空间',
        outputs: ['2026 占比目标范围 11.5% - 12.5%'],
      },
      {
        id: 'n2', label: '三档测算', short: '激进/稳健/保守',
        inputs: ['11.8% → 节约 8.6 亿', '12.0% → 节约 7.8 亿', '12.5% → 节约 5.5 亿'],
        logic: '财务测算 + OEE 提升可行性 + 班次优化承载力',
        outputs: ['三档可选,各对应不同 OEE 提升力度'],
      },
      {
        id: 'n3', label: '依赖项', short: '#1304 ROI 确认',
        inputs: ['#1304 OEE 专项 ROI 14 个月', '基层 OEE 提升 5pt 的可行性',
                '设备投资 8000 万的现金流要求'],
        logic: '基层反馈:5pt OEE 提升需 8000 万设备投资,激进方案承担激进设备投资',
        outputs: ['暂不拍板,等 #1304 决议后再定 2026 目标'],
      },
    ],
  },
  p_oee_program: {
    nodes: [
      {
        id: 'n1', label: '触发', short: '集团 OEE 72% 偏低',
        inputs: ['集团 OEE 72%', '行业头部 80%', '#1301 上游成本超标'],
        logic: 'OEE 监控 + 上游议题触发:成本超标主因要治本',
        outputs: ['专项立项,目标 72% → 78%'],
      },
      {
        id: 'n2', label: '基地选择', short: '4 基地代表性评估',
        inputs: ['常州 F01-F02 涂布 OEE 68% (空间最大)',
                '四川 F08 混线 OEE 65% (复杂度最高)',
                '武汉 F12 储能 OEE 76% (空间小)',
                '厦门 F15-F16 OEE 71%'],
        logic: '产品类型多样性 + 提升空间 + 基地配合度的多维选择',
        outputs: ['推荐:常州 + 四川 + 厦门(覆盖 3 类产品)'],
      },
      {
        id: 'n3', label: '财务可行', short: 'IRR 31% 超红线',
        inputs: ['投资 4500 万', '14 个月回收期', 'IRR 31%', '集团红线 22%'],
        logic: 'IRR 计算 + 集团投资委员会标准对照',
        outputs: ['财务可批,需运营部长 + CEO 拍板试点组合'],
      },
    ],
  },
  p_shift_optimize: {
    nodes: [
      {
        id: 'n1', label: '触发', short: '加班 162h 违法',
        inputs: ['当前月均加班 162 小时', '劳动法上限 144 小时', '员工投诉 7 起'],
        logic: '劳动合规监控:加班超上限 12% → 自动触发整改议题',
        outputs: ['议题 #1305 创建,目标运营部长'],
      },
      {
        id: 'n2', label: '财务测算', short: '净节约 1.2 亿',
        inputs: ['四班三倒减少加班费 1.5 亿/年',
                '增加 2000 名员工成本 0.3 亿/年',
                '过渡补贴 4800 万'],
        logic: '加班费 vs 基本工资的成本对比 + 过渡期补贴',
        outputs: ['年化净节约 1.2 亿,合规边界以内'],
      },
      {
        id: 'n3', label: '试点策略', short: '常州+四川先行',
        inputs: ['常州工序适配度高', '四川混线复杂但提升空间大',
                '武汉刚投产暂缓', '厦门第二批'],
        logic: '基于基地特点的差异化推进 + 风险分散',
        outputs: ['11 月试点常州+四川 · 2026 Q1 推广'],
      },
    ],
  },
  p_dashboard: {
    nodes: [
      {
        id: 'n1', label: '触发', short: '#1304 需数字化支撑',
        inputs: ['OEE 专项依赖实时数据', '#1303 预算依赖运营驾驶舱',
                '一期仅覆盖 OEE 单模块'],
        logic: '依赖驱动:运营专项落地需要 5 大模块整合的数字化平台',
        outputs: ['二期立项,5 大模块整合'],
      },
      {
        id: 'n2', label: '路线对比', short: '外采/自研/折中',
        inputs: ['外采 SAP MII:2200 万 + 800 万定制 = 3000 万',
                '自研:2800 万 + 慢 12 个月',
                '折中:外采框架 1800 万 + 自研模块 800 万 = 2600 万'],
        logic: '3 年 TCO 测算 + 落地速度 + 行业特性适配',
        outputs: ['折中方案 TCO 最优,落地速度居中'],
      },
      {
        id: 'n3', label: '基层验证', short: '常州+四川支持',
        inputs: ['常州倾向外采(速度)',
                '四川中立(可接受任一方案)',
                '工艺总监支持自研(行业特性强)'],
        logic: '基地诉求 + 工艺要求 + 时间窗口的综合权衡',
        outputs: ['折中方案获多方支持,继续讨论'],
      },
    ],
  },
  p_coating_fix: {
    nodes: [
      {
        id: 'n1', label: '触发', short: 'OEE 持续 11 周低于 70%',
        inputs: ['F01-PL03 涂布工序 OEE 68%', '目标 78%', '累计 11 周'],
        logic: 'OEE 监控:持续 4 周低于阈值自动开议题',
        outputs: ['议题 #1307 创建,目标运营经理'],
      },
      {
        id: 'n2', label: '根因定位', short: '涂头超期 + 张力波动',
        inputs: ['涂头使用 4200 小时 (标准寿命 3800)',
                '涂布机 #3 #5 张力波动异常',
                '历史 3 次停线申请被排产挤掉'],
        logic: '设备数据 + 排产历史的关联分析',
        outputs: ['确认根因:涂头磨损 + 工艺参数偏移'],
      },
      {
        id: 'n3', label: '时间窗口', short: '本周末 36 小时',
        inputs: ['周末停线损失 1800 万', '持续低 OEE 每周损失 560 万',
                '#1284 客户 X 加急不受影响', '#1290 月度排程微调可行'],
        logic: '产能模拟 + 客户影响评估:周末停线最优',
        outputs: ['周末停线 36 小时,2 周回本'],
      },
    ],
  },
  p_takt_improve: {
    nodes: [
      {
        id: 'n1', label: '触发', short: 'F12 节拍 18s vs 行业 13.5s',
        inputs: ['F12 当前 18 秒/单元', '行业领先 13.5 秒', '订单池支持满负荷'],
        logic: '行业对标 + 订单驱动:节拍提升空间 + 市场需求双重信号',
        outputs: ['提升立项,目标 18s → 15s'],
      },
      {
        id: 'n2', label: '瓶颈分析', short: '上下料 + 检测',
        inputs: ['上下料 8 秒 (机器人改造可降至 5 秒)',
                '检测 6 秒 (AI 视觉可降至 4 秒)',
                '其他工序已优化'],
        logic: 'IE 工程师节拍分析:抓主要矛盾,先攻 2 个瓶颈',
        outputs: ['改造方向:上下料机器人 + AI 检测'],
      },
      {
        id: 'n3', label: '订单转移', short: '厦门承接 8000 套',
        inputs: ['改造期 30 天部分停线 → 影响 8000 套',
                'H 集团 Q4 提货 1.2 万套,违约金 360 万',
                '厦门 F15-F16 利用率 84.8%,可承接'],
        logic: '客户影响最小化 + 跨基地协同',
        outputs: ['订单转移厦门,改造期客户感知无影响'],
      },
    ],
  },
  p_energy_fix: {
    nodes: [
      {
        id: 'n1', label: '触发', short: '能耗超标 11.9%',
        inputs: ['F08 单位能耗 1.32 kWh/Ah', '行业基准 1.18 kWh/Ah', '年多耗 380 万 kWh'],
        logic: '能耗监控:超标 10% 触发议题',
        outputs: ['议题 #1309 创建,目标运营经理'],
      },
      {
        id: 'n2', label: '根因', short: '空压系统老化',
        inputs: ['空压系统使用 7 年', '效率比新设备低 18%',
                '变频压缩机改造可恢复', '储气罐扩容降低空压频次'],
        logic: '设备生命周期 + 效率退化曲线分析',
        outputs: ['改造方案:变频压缩机 + 储气罐扩容'],
      },
      {
        id: 'n3', label: '时机选择', short: '独立 vs 合并',
        inputs: ['独立改造 350 万 · 5 天停线 · 损失 600 万',
                '合并 OEE 专项 290 万 · 共享停线窗口 · 零额外损失',
                'F08 满负荷生产'],
        logic: '专项协同 + 停线机会成本评估',
        outputs: ['推荐合并到 2026 Q1 OEE 专项执行'],
      },
    ],
  },
};

// 默认推演模板(其他议题/消息没有显式 reasoning 时使用)
const DEFAULT_REASONING = {
  dataSources: ['本部门业务数据', '相关 ERP / MES 系统', '历史议题库'],
  rules: ['Agent 基于专业域规则推理', '主人确认后入库'],
  steps: ['采集相关数据', '匹配规则与历史案例', '生成结论'],
  references: [],
};

// ============================================================
// 4 个场景层次的议题
// ============================================================
const TOPIC_LEVELS = {
  tactical: { label: '项目决策' },
  monthly: { label: '月度协调' },
  quarterly: { label: '季度滚动' },
  annual_alert: { label: '年度告警' },
};

const TOPICS = [
  {
    id: '#1284',
    title: '客户 X 加急订单 8000 套 EV-200',
    level: 'tactical', creator: 'mgr_plan', status: 'PENDING', target: 'u_001',
    visible: ['u_001', 'u_002', 'u_003', 'u_011', 'u_051', 'u_052', 'u_053', 'u_004', 'u_005', 'u_006', 'u_007',
              'u_009', 'u_012', 'u_013', 'u_021', 'u_022', 'u_031', 'u_032',
              'u_041', 'u_042', 'u_043'],
    mins: 23,
    groupTier: 'large',
    amountText: '净收益 +8400 万',
    coreGroup: ['u_001', 'u_002', 'u_003', 'u_011', 'u_051'],
    forwardChain: [{ from: '执行层议题群', to: 'CEO 群', when: '14:08', reason: '净收益 +8400 万,超 5000 万,需 CEO 拍板' }],
    summary: 'AI+ 共识:接单,拆分 F02 + F08 协同生产,前 100 套加严检验',
    pending: '客户 Y 沟通由销售主导,还是 CEO 亲自出面?',
    impact: {
      revenue: '+8400 万', margin: '持平', capacity: '+0.3pt',
      inventory: '持平', yield: '-0.4pt(短期)', risk: ['yield'],
    },
    proposalId: 'p_split',
    related: [
      { id: '#1290', title: '6 月 S&OP 评审', rel: '本议题触发月度排程重排' },
      { id: '#1298', title: 'Q3 良率偏差告警', rel: '本议题加剧良率偏差' },
    ],
    messages: [
      { agent: 'mgr_plan', time: '14:02', source: 'manual',
        text: '客户 X 申请 6/15 前交付 8000 套 EV-200。F02 当前订单池 92%,需挤占 PL02 约 3 天。@工艺 @采购 @财务 评估。',
        mentions: ['工艺', '采购', '财务'] },
      { agent: 'mgr_process', time: '14:03', source: 'auto',
        text: 'F02-PL01 切换需 6 小时设备调校 + 4 小时工艺验证。首批 200 套良率 92%(常规 98%),后续可恢复。' },
      { agent: 'mgr_purchase', time: '14:04', source: 'manual',
        text: '正极材料库存可支撑 500 套,缺口 300 套。紧急补订周期 5 天,需 6/10 前到货。@供应链副总裁 是否启动战略储备?',
        mentions: ['供应链副总裁'] },
      { agent: 'mgr_quality', time: '14:04', source: 'manual',
        text: '节奏过快可能引发 SPC 漂移。建议采用 [加严检验方案] 前 100 套全检、保留追溯样本。',
        proposals: ['p_strict'] },
      { agent: 'mgr_finance', time: '14:05', source: 'manual',
        text: '订单毛利率 22%,商用车被挤压订单延期违约金约 1800 万。综合净收益约 +8400 万。可接。' },
      { agent: 'gm_changzhou', time: '14:06', source: 'auto',
        text: '常州基地:F02 单独承接风险大。建议 [拆分方案],500 套留 F02,300 套转 F08。',
        proposals: ['p_split'] },
      { agent: 'gm_sichuan', time: '14:07', source: 'manual',
        text: '四川基地确认:F08-PL05 本月利用率 79%,有富余。改造为 EV-200 约 8 小时,可接 300 套。' },
      { agent: 'mgr_factory', time: '14:08', source: 'manual',
        text: 'F02 工厂:PL01 切换 5/14 14:00 启动,5/15 完成首批 100 套。@F02-PL01 调度工人 22 名。',
        mentions: ['F02-PL01'] },
      { agent: 'mgr_ka', time: '14:09', source: 'auto',
        text: '客户 X 是 A 类战略客户;客户 Y 已 2 次延期记录,建议销售副总裁亲自致电。@CEO 是否同意?',
        mentions: ['CEO'] },
      { agent: 'value_stream', time: '14:10', source: 'auto',
        text: 'AI+ 共识:[拆分方案]。多目标影响:营收 +8400 万 · 良率 -0.4pt(短期)· 客户 Y 风险。提醒:加剧 Q3 良率偏差,建议同步关注 #1298。需 CEO 拍板:客户 Y 沟通由谁主导?',
        proposals: ['p_split'], mentions: ['CEO'] },
    ],
  },
  {
    id: '#1290',
    title: '6 月 S&OP 评审 - 乘用车订单超预测 18%',
    level: 'monthly', creator: 'mgr_sop', status: 'OPEN', target: 'u_002',
    visible: ['u_001', 'u_002', 'u_003', 'u_011', 'u_051', 'u_052', 'u_053', 'u_013', 'u_014', 'u_015',
              'u_004', 'u_009', 'u_012', 'u_021', 'u_022', 'u_023', 'u_024'],
    mins: 180,
    groupTier: 'medium',
    amountText: '营收 +3.2 亿',
    coreGroup: ['u_002', 'u_003', 'u_011', 'u_051', 'u_013', 'u_014', 'u_015', 'u_004', 'u_009', 'u_021', 'u_022'],
    forwardChain: [],
    summary: '乘用车订单 +18%,商用车 -12%。建议 F08 商用车产线 30% 转向乘用车',
    pending: '是否同意 F08 商用车产线 30% 临时转产乘用车?',
    impact: {
      revenue: '+3.2 亿', margin: '+0.2pt', capacity: '+1.5pt',
      inventory: '+2 天(风险)', yield: '持平', risk: ['inventory'],
    },
    proposalId: 'p_cross',
    related: [
      { id: '#1284', title: '客户 X 加急订单', rel: '本议题加剧乘用车产能压力' },
      { id: '#1295', title: 'Q3 产能规划', rel: '本议题输入 Q3 规划' },
    ],
    messages: [
      { agent: 'mgr_sop', time: '11:00', source: 'manual',
        text: '6 月 S&OP:乘用车订单 4280 套(预测 3625),商用车低于预测 12%。请各部门发言。' },
      { agent: 'analyst_demand', time: '11:05', source: 'manual',
        text: '预测:乘用车超预测主因宁德 +600 套 + 比亚迪 +200 套,7-8 月仍维持。商用车 Q3 末有望反弹。' },
      { agent: 'mgr_ka', time: '11:08', source: 'manual',
        text: '宁德 6 月若不能保供,影响 Q3 战略合作。比亚迪追加可解释延期。' },
      { agent: 'planner_capacity', time: '11:15', source: 'manual',
        text: '建议启用 F08 商用车产线临时转产(改造 8 小时,可承接 EV-200)。' },
      { agent: 'gm_sichuan', time: '11:20', source: 'auto',
        text: 'F08 本月商用车利用率 79%,可释放 30%。需提前 2 天通知工艺切换。' },
      { agent: 'mgr_purchase', time: '11:25', source: 'manual',
        text: '采购:EV-200 正极材料够,隔膜需补订 200 套用量,5 天到货。' },
      { agent: 'mgr_finance', time: '11:32', source: 'manual',
        text: '财务:多贡献 3.2 亿营收,商用车库存 +2 天。综合可接。' },
      { agent: 'value_stream', time: '11:45', source: 'auto',
        text: 'AI+ 共识:[跨产线调配方案]。与 #1284 形成叠加,需关注 F02 总压力。需生产副总裁拍板。',
        proposals: ['p_cross'], mentions: ['生产副总裁'] },
    ],
  },
  {
    id: '#1295',
    title: 'Q3 产能规划:面向年度营收目标的缺口补全',
    level: 'quarterly', creator: 'mgr_sop', status: 'PENDING', target: 'u_001',
    visible: ['u_001', 'u_002', 'u_003', 'u_011', 'u_051', 'u_052', 'u_053', 'u_013', 'u_014', 'u_015',
              'u_004', 'u_007', 'u_009', 'u_021', 'u_022', 'u_023', 'u_024'],
    mins: 360,
    groupTier: 'large',
    amountText: '营收 +6.5 亿',
    coreGroup: ['u_001', 'u_002', 'u_003', 'u_011', 'u_051'],
    forwardChain: [{ from: '经营层 S&OP 评审群', to: 'CEO 群', when: '10:30', reason: '季度营收方案 +6.5 亿,需 CEO 拍板' }],
    summary: 'Q3 目标 162 亿,订单池 154 亿,缺口 8 亿。三方案待 CEO 拍板',
    pending: '从三个方案中选择 Q3 产能缺口补全方案?',
    impact: {
      revenue: '+6.5 亿(方案 B)', margin: '持平', capacity: '+4pt',
      inventory: '持平', yield: '持平', risk: [],
    },
    proposalId: 'p_multi',
    related: [
      { id: '#1290', title: '6 月 S&OP 评审', rel: '本议题继承月度数据' },
      { id: '#1298', title: 'Q3 良率告警', rel: '良率制约 Q3 产能' },
    ],
    messages: [
      { agent: 'mgr_sop', time: '09:00', source: 'manual',
        text: 'Q3 营收目标 162 亿,缺口 8 亿。三方案:A 激进 / B 平衡 / C 保守。@需求预测 @产能规划 @财务 表态。',
        mentions: ['需求预测', '产能规划', '财务'] },
      { agent: 'analyst_demand', time: '09:08', source: 'auto',
        text: 'A 激进:激活 3 个 B 类客户备选订单 +9 亿,毛利率 14%(常规 20%)。' },
      { agent: 'planner_capacity', time: '09:12', source: 'manual',
        text: 'B 平衡:F12 武汉储能扩产 + F15 厦门海外加量。补 6.5 亿,毛利保持。' },
      { agent: 'mgr_ka', time: '09:18', source: 'auto',
        text: 'C 保守:仅追加 A 类客户订单,补 4.5 亿,毛利 +0.3pt。' },
      { agent: 'mgr_finance', time: '09:25', source: 'manual',
        text: '三方案:A 营收 +9000/毛利 -0.5pt;B 营收 +6.5 亿/毛利 持平;C 营收 +4.5 亿/毛利 +0.3pt。推荐 B。' },
      { agent: 'gm_wuhan', time: '09:35', source: 'manual',
        text: '武汉:F12 储能可扩产,需新增 18 名工艺工人 + 启动二期车间。7 月底投产。' },
      { agent: 'gm_xiamen', time: '09:42', source: 'manual',
        text: '厦门:F15 海外订单可加量,已联系 3 家客户,2 家明确支持。' },
      { agent: 'mgr_purchase', time: '09:50', source: 'manual',
        text: '采购:三方案物料配套均可。B 方案新增 4.2 亿,现有供应商可满足。' },
      { agent: 'value_stream', time: '10:30', source: 'auto',
        text: 'AI+ 综合权衡 [多目标求解方案]:推荐方案 B。营收补 81%,毛利保持,产能 +4pt,与 #1298 冲突最小。',
        proposals: ['p_multi'], mentions: ['CEO'] },
    ],
  },
  {
    id: '#1298',
    title: 'Q3 良率持续偏离年度目标',
    level: 'annual_alert', creator: 'system', status: 'OPEN', target: 'u_001',
    autoTriggered: true,
    visible: ['u_001', 'u_002', 'u_005', 'u_006', 'u_051', 'u_052', 'u_053', 'u_021', 'u_022', 'u_023', 'u_024',
              'u_031', 'u_032', 'u_033', 'u_034'],
    mins: 90,
    groupTier: 'large',
    amountText: '全年潜在损失 5.5 亿',
    coreGroup: ['u_001', 'u_002', 'u_011', 'u_051'],
    forwardChain: [{ from: '系统自动告警', to: 'CEO 群', when: '10:15', reason: '良率连续 3 月偏离 1.0pt 以上,触发 CEO 级告警' }],
    summary: '良率 96.2% vs 目标 97.5%,若不修正全年损失 80 万套(5.5 亿营收)',
    pending: '是否启动良率专项改善项目?',
    impact: {
      revenue: '-5.5 亿(若不改)', margin: '-1.5pt(若不改)', capacity: '持平',
      inventory: '持平', yield: '+1.3pt(目标)', risk: ['revenue', 'margin'],
    },
    proposalId: 'p_yield',
    related: [
      { id: '#1284', title: '客户 X 加急订单', rel: '本议题被加剧' },
      { id: '#1295', title: 'Q3 产能规划', rel: '良率制约产能规划' },
    ],
    messages: [
      { agent: 'value_stream', time: '10:15', source: 'auto',
        text: '【自动告警】良率连续 3 个月低于目标 1.0pt 以上,触发自动议题。@质量 @工艺 @4 基地 分析。',
        mentions: ['质量', '工艺', '常州基地', '四川基地', '武汉基地', '厦门基地'] },
      { agent: 'mgr_quality', time: '10:25', source: 'manual',
        text: '80% 良率损失集中在化成工序。SPC 数据显示湿度控制波动是主因。' },
      { agent: 'mgr_process', time: '10:35', source: 'manual',
        text: '4 个基地化成工序参数有差异,常州 F02 最稳,四川 F08 波动大。建议参数标准化。' },
      { agent: 'gm_changzhou', time: '10:42', source: 'auto',
        text: '常州:F02 良率 97.8%,F03 良率 95.2%。F03 化成设备老化是主因。' },
      { agent: 'gm_sichuan', time: '10:48', source: 'manual',
        text: '四川:商用车产线良率低,工序参数沿用乘用车,未做定制化。' },
      { agent: 'value_stream', time: '11:30', source: 'auto',
        text: 'AI+ 综合分析 [良率改善方案]:工艺参数标准化 + SPC 升级 + F03 维保。8 周达 97.0%,12 周达 97.5%。',
        proposals: ['p_yield'], mentions: ['CEO'] },
    ],
  },
  // ====== v4.6 新增:3 个运营角色议题(VP / 部长 / 经理)====== //
  // 主线关联:
  //   #1301 (VP 战略问题:运营成本超标) → #1304 (部长专项:OEE 提升) → #1307 (经理执行:涂布工序异常)
  //   #1302 (VP 跨基地稼动率失衡)      → #1305 (部长班次优化)    → #1308 (经理节拍提升)
  //   #1303 (VP 2026 预算编制方向)     → #1306 (部长数字化驾驶舱) → #1309 (经理能耗改造)
  // ============================================================

  // ---------- vp_ops 运营副总裁(3 议题:亿级)----------
  {
    id: '#1301',
    title: 'Q3 运营成本超标 1.2 亿,4 基地费用归集分析',
    level: 'quarterly', creator: 'value_stream', status: 'PENDING', target: 'u_051',
    autoTriggered: true,
    visible: ['u_001', 'u_051', 'u_052', 'u_053', 'u_002', 'u_003', 'u_004', 'u_005', 'u_006', 'u_007',
              'u_021', 'u_022', 'u_031', 'u_032'],
    mins: 18,
    groupTier: 'large',
    amountText: '运营成本超标 +1.2 亿',
    coreGroup: ['u_001', 'u_051', 'u_052', 'u_006'],
    forwardChain: [{ from: '运营条线议题群', to: 'CEO 群', when: '10:45', reason: '超标 1.2 亿,占 Q3 利润 18%,需 CEO 知悉' }],
    summary: 'AI+ 共识:启动 OEE 提升专项 + 班次优化双轨,Q4 回收 8000 万',
    pending: '专项治理 Q4 启动 vs 推迟到 2026 Q1?',
    impact: {
      revenue: '持平', margin: '-1.8pt', capacity: '-2.5pt',
      inventory: '+0.3 周转', yield: '持平', risk: ['margin', 'capacity'],
    },
    proposalId: 'p_ops_cost',
    related: [
      { id: '#1304', title: 'OEE 提升专项立项', rel: '本议题触发的专项落地' },
      { id: '#1305', title: '全集团班次优化', rel: '本议题触发的另一治理路径' },
      { id: '#1298', title: 'Q3 良率偏差告警', rel: '良率问题加剧运营成本' },
    ],
    messages: [
      { agent: 'value_stream', time: '10:30', source: 'auto',
        text: 'Q3 运营成本归集完成。预算 6.8 亿,实际 8.0 亿,超标 1.2 亿(+17.6%)。其中:常州 +3200 万、四川 +4500 万、武汉 +2800 万、厦门 +1500 万。@运营副总裁 需 Q3 复盘。',
        mentions: ['运营副总裁'] },
      { agent: 'mgr_ops_director', time: '10:32', source: 'manual',
        text: '初步归因:OEE 不达标导致单位成本上升 6800 万,班次切换损失 2400 万,能耗超标 2200 万,其他 600 万。' },
      { agent: 'mgr_ops', time: '10:33', source: 'auto',
        text: '常州 F01-F02 涂布工序 OEE 仅 68%(目标 78%),持续 11 周。已自动开议题 #1307 跟进。' },
      { agent: 'mgr_finance', time: '10:35', source: 'manual',
        text: 'Q3 净利率 11.2%(目标 13%),如不治理,全年利润预计少 2.5 亿。@CEO 是否启动专项?',
        mentions: ['CEO'] },
      { agent: 'gm_changzhou', time: '10:38', source: 'manual',
        text: '常州基地认领:涂布 OEE 改善 + 三班两倒切换损失治理,目标 Q4 节约 4500 万。' },
      { agent: 'gm_sichuan', time: '10:40', source: 'auto',
        text: '四川基地:F08 储能产线设备老化是主因,设备改造预算 1800 万,可在 OEE 专项内统筹。',
        proposals: ['p_ops_cost'] },
      { agent: 'value_stream', time: '10:43', source: 'auto',
        text: 'AI+ 共识:双轨治理 = OEE 专项(4500 万投入,回收 6500 万) + 班次优化(零投入,回收 2400 万),合计 Q4 回收 8000 万。多目标影响:毛利率 +1.2pt · 产能 +1.8pt。需 CEO 拍板:Q4 启动 vs 2026 Q1?',
        proposals: ['p_ops_cost'], mentions: ['CEO'] },
    ],
    assets: [],
  },
  {
    id: '#1302',
    title: '四基地稼动率失衡,常州 96% / 厦门 85%,跨基地产能再平衡',
    level: 'quarterly', creator: 'value_stream', status: 'PENDING', target: 'u_051',
    autoTriggered: true,
    visible: ['u_001', 'u_051', 'u_052', 'u_053', 'u_003', 'u_004', 'u_005', 'u_021', 'u_022', 'u_031', 'u_032', 'u_041', 'u_042'],
    mins: 35,
    groupTier: 'large',
    amountText: '产能再平衡影响 +6500 万营收',
    coreGroup: ['u_001', 'u_051', 'u_052', 'u_021', 'u_031'],
    forwardChain: [{ from: '运营条线议题群', to: 'CEO 群', when: '14:22', reason: '涉及订单转移,影响客户交付,需 CEO 知悉' }],
    summary: 'AI+ 共识:厦门承接武汉 2.4 亿储能订单 + 四川承接常州 1800 万乘用车订单',
    pending: '订单转移客户告知由销售统一沟通,还是各基地分别对接?',
    impact: {
      revenue: '+6500 万', margin: '+0.5pt', capacity: '+2.8pt',
      inventory: '持平', yield: '持平', risk: ['capacity'],
    },
    proposalId: 'p_capacity_balance',
    related: [
      { id: '#1290', title: '6 月 S&OP 评审', rel: '本议题影响月度排程' },
      { id: '#1305', title: '全集团班次优化', rel: '稼动率失衡触发班次重新设计' },
    ],
    messages: [
      { agent: 'value_stream', time: '14:05', source: 'auto',
        text: '稼动率监控告警:常州 96.2%(过载)、四川 89.5%、武汉 91.3%、厦门 84.8%(欠载)。差距 11.4pt,行业平均 ±3pt。@运营副总裁 触发跨基地平衡议题。',
        mentions: ['运营副总裁'] },
      { agent: 'planner_capacity', time: '14:08', source: 'manual',
        text: '产能规划:厦门 F15-F16 储能线可承接武汉 EV-Storage 系列订单,改造仅需 4 小时。已模拟 3 种平衡方案。' },
      { agent: 'gm_xiamen', time: '14:12', source: 'manual',
        text: '厦门基地确认:承接 2.4 亿储能订单可行,需提前 3 天补充 80 名操作工 + 储能模组培训。' },
      { agent: 'gm_wuhan', time: '14:14', source: 'auto',
        text: '武汉基地:F12 线本月利用率 91.3%,转移 2.4 亿订单后降至 82%,F12 二期投资延后议题 #1306 需重审。' },
      { agent: 'gm_changzhou', time: '14:16', source: 'manual',
        text: '常州基地:96.2% 已是极限,F02-PL01 加班时长全月 168 小时(规定上限 144)。建议立即转移 1800 万乘用车订单到四川 F08。' },
      { agent: 'gm_sichuan', time: '14:18', source: 'auto',
        text: '四川基地:F08-PL05 可承接 1800 万乘用车订单,但需占用储能产线 2 天,需协调销售。',
        mentions: ['销售副总裁'] },
      { agent: 'mgr_ka', time: '14:20', source: 'manual',
        text: 'KA 销售:涉及 4 个客户的订单转移,建议销售统一告知,避免基地分别沟通造成口径不一。' },
      { agent: 'value_stream', time: '14:21', source: 'auto',
        text: 'AI+ 共识:跨基地平衡 + 销售统一告知。多目标:营收 +6500 万 · 产能均衡度 +2.8pt · 加班降至合规。需 CEO 拍板:客户告知由销售统一 vs 各基地分别?',
        proposals: ['p_capacity_balance'], mentions: ['CEO'] },
    ],
    assets: [],
  },
  {
    id: '#1303',
    title: '2026 全年运营预算编制方向,运营成本/营收占比目标',
    level: 'annual_alert', creator: 'mgr_ops_director', status: 'OPEN', target: 'u_051',
    visible: ['u_001', 'u_051', 'u_052', 'u_053', 'u_006', 'u_004', 'u_005', 'u_007'],
    mins: 240,
    groupTier: 'large',
    amountText: '2026 年度预算约 32 亿',
    coreGroup: ['u_001', 'u_051', 'u_052', 'u_006'],
    forwardChain: [],
    summary: '讨论中:2026 运营成本/营收占比目标 11.8% vs 12.0% vs 12.5%(保守)',
    impact: {
      revenue: '持平', margin: '+0.5~+1.2pt', capacity: '持平',
      inventory: '持平', yield: '持平', risk: [],
    },
    proposalId: 'p_budget_2026',
    related: [
      { id: '#1301', title: 'Q3 运营成本超标', rel: '本议题的输入参考' },
      { id: '#1304', title: 'OEE 提升专项立项', rel: '预算编制的关键投入项' },
    ],
    messages: [
      { agent: 'mgr_ops_director', time: '昨日 16:30', source: 'manual',
        text: '2026 预算编制启动。建议运营成本/营收占比从 2025 实际 13.2% 降到 11.8%,对应节约 4.5 亿。' },
      { agent: 'mgr_finance', time: '昨日 16:42', source: 'auto',
        text: '财务测算:11.8% 假设营收 650 亿,运营成本 76.7 亿,比 2025 节约 8.6 亿。激进。建议 12.0% 较稳健,节约 7.8 亿。' },
      { agent: 'value_stream', time: '昨日 17:05', source: 'auto',
        text: '行业对标:头部 3 家电池企业 2025 占比中位数 11.5%,我们 13.2% 偏高。但 OEE 提升空间有限,班次优化已经接近上限。',
        proposals: ['p_budget_2026'] },
      { agent: 'mgr_ops', time: '今日 09:15', source: 'manual',
        text: '基层意见:涂布 / 卷绕 / 装配 三大主工序 OEE 提升 5pt 是可达成的,但需要设备投资 8000 万。@运营副总裁 建议先看 #1304 OEE 专项方案再定预算目标。',
        mentions: ['运营副总裁'] },
      { agent: 'mgr_ops_director', time: '今日 09:30', source: 'manual',
        text: '同意。先看 #1304 专项 ROI,再确定 2026 预算目标。本议题暂不拍板,继续讨论。' },
    ],
    assets: [],
  },

  // ---------- mgr_ops_director 运营部长(3 议题:千万-亿)----------
  {
    id: '#1304',
    title: 'OEE 提升专项立项,投资 4500 万,3 基地试点',
    level: 'quarterly', creator: 'mgr_ops_director', status: 'PENDING', target: 'u_052',
    visible: ['u_001', 'u_051', 'u_052', 'u_053', 'u_006', 'u_021', 'u_022', 'u_031', 'u_032', 'u_041', 'u_042', 'u_004', 'u_005'],
    mins: 12,
    groupTier: 'large',
    amountText: '投资 4500 万 · ROI 1.4 倍',
    coreGroup: ['u_001', 'u_051', 'u_052', 'u_006'],
    forwardChain: [{ from: '运营专项群', to: 'CEO 群', when: '11:08', reason: '投资 4500 万,超 1000 万阈值,需 CEO 拍板' }],
    summary: 'AI+ 共识:常州 + 武汉 + 四川 3 基地试点,Q4 启动,2026 Q2 全集团推广',
    pending: '试点基地选择常州 + 武汉 + 四川,还是常州 + 武汉 + 厦门?',
    impact: {
      revenue: '持平', margin: '+1.5pt(2026)', capacity: '+3.2pt',
      inventory: '持平', yield: '+0.8pt', risk: [],
    },
    proposalId: 'p_oee_program',
    related: [
      { id: '#1301', title: 'Q3 运营成本超标', rel: '本议题是上游问题的解法' },
      { id: '#1307', title: 'F01 涂布工序 OEE 异常', rel: '试点的具体落地案例' },
    ],
    messages: [
      { agent: 'mgr_ops_director', time: '10:55', source: 'manual',
        text: 'OEE 提升专项:总投资 4500 万(设备 3200 万 + 数字化 800 万 + 培训 500 万),3 基地试点,目标 OEE 从 72% → 78%,Q4 启动。' },
      { agent: 'planner_capacity', time: '10:58', source: 'auto',
        text: '产能模拟:OEE +6pt 等效产能扩张 8.3%,折合年营收 +5.4 亿,毛利贡献约 6300 万(税前)。',
        proposals: ['p_oee_program'] },
      { agent: 'mgr_finance', time: '11:00', source: 'manual',
        text: '财务测算:投资 4500 万,回收期 14 个月,ROI 1.4 倍,内部收益率 IRR 31%,超过集团 22% 红线。可批。' },
      { agent: 'gm_changzhou', time: '11:02', source: 'manual',
        text: '常州基地:F01-F02 涂布工序 OEE 仅 68%,提升空间最大,自愿首批试点。预算 1800 万。' },
      { agent: 'gm_wuhan', time: '11:03', source: 'auto',
        text: '武汉基地:F12 储能产线设备较新,OEE 已 76%,提升空间小。建议改为厦门 F15-F16 试点。' },
      { agent: 'gm_xiamen', time: '11:05', source: 'manual',
        text: '厦门基地:F15-F16 储能产线 OEE 71%,愿意承接试点,预算 1500 万。已与设备供应商初步沟通。' },
      { agent: 'gm_sichuan', time: '11:06', source: 'manual',
        text: '四川基地:F08 商用车 + 储能混线,OEE 65%,改造复杂,但提升空间 8pt 最大,预算 1200 万。' },
      { agent: 'value_stream', time: '11:07', source: 'auto',
        text: 'AI+ 共识:常州 + 四川 + 厦门 3 基地试点(覆盖 3 种产品类型,代表性强)。多目标:毛利 +1.5pt · 产能 +3.2pt · 良率 +0.8pt。需运营部长 + CEO 拍板:试点基地组合。',
        proposals: ['p_oee_program'], mentions: ['运营部长', 'CEO'] },
    ],
    assets: [],
  },
  {
    id: '#1305',
    title: '全集团班次优化(三班两倒 → 四班三倒),影响 1.2 亿人工成本',
    level: 'quarterly', creator: 'mgr_ops_director', status: 'PENDING', target: 'u_052',
    visible: ['u_001', 'u_051', 'u_052', 'u_053', 'u_006', 'u_021', 'u_022', 'u_031', 'u_032', 'u_041', 'u_042', 'u_011'],
    mins: 28,
    groupTier: 'medium',
    amountText: '人工成本 -1.2 亿 / 加班合规 +120 小时',
    coreGroup: ['u_051', 'u_052', 'u_021', 'u_031', 'u_032'],
    forwardChain: [{ from: '运营专项群', to: '副总裁群', when: '13:55', reason: '影响 1.2 亿人工成本,需运营 + HR 副总裁联审' }],
    summary: 'AI+ 共识:Q4 试点常州 + 四川,2026 Q1 推广,目标加班降至合规线以内',
    pending: '试点期 3 个月,过渡期员工补贴方案 2000 元/人 vs 3000 元/人?',
    impact: {
      revenue: '持平', margin: '+0.8pt', capacity: '+1.5pt',
      inventory: '持平', yield: '持平', risk: [],
    },
    proposalId: 'p_shift_optimize',
    related: [
      { id: '#1301', title: 'Q3 运营成本超标', rel: '本议题是上游问题的解法' },
      { id: '#1302', title: '四基地稼动率失衡', rel: '班次优化和稼动率重新设计联动' },
    ],
    messages: [
      { agent: 'mgr_ops_director', time: '13:30', source: 'manual',
        text: '班次优化方案:三班两倒(每班 12 小时) → 四班三倒(每班 8 小时),覆盖 4 基地 8200 名一线员工。' },
      { agent: 'value_stream', time: '13:35', source: 'auto',
        text: '历史数据:三班两倒下,每月加班均超规定上限 144 小时(实际平均 162 小时),违反劳动法第 41 条风险。四班三倒可降至 110 小时。',
        proposals: ['p_shift_optimize'] },
      { agent: 'mgr_finance', time: '13:38', source: 'manual',
        text: '财务测算:四班三倒减少加班费 1.5 亿/年,但增加 2000 名员工(基本工资 + 五险一金) 0.3 亿,净节约 1.2 亿。' },
      { agent: 'gm_changzhou', time: '13:42', source: 'manual',
        text: '常州基地:支持试点。F02 涂布 / 卷绕工序适合 8 小时班次,操作精度更稳定。建议 11 月启动。' },
      { agent: 'gm_sichuan', time: '13:45', source: 'auto',
        text: '四川基地:F08 储能 + 商用车混线,班次切换复杂,建议同步试点。预计良率 +0.3pt。' },
      { agent: 'gm_wuhan', time: '13:48', source: 'manual',
        text: '武汉基地反对:F12 储能产线刚投产 4 个月,员工熟练度尚未稳定,建议推迟到 2026 Q2。' },
      { agent: 'gm_xiamen', time: '13:50', source: 'manual',
        text: '厦门基地:愿意第二批推广(2026 Q1),员工补贴方案需明确。' },
      { agent: 'mgr_ka', time: '13:52', source: 'auto',
        text: 'HR 角度:员工反馈担心收入下降。建议过渡期 3 个月,每人每月补贴 2000 元,稳定情绪。',
        proposals: ['p_shift_optimize'] },
      { agent: 'value_stream', time: '13:54', source: 'auto',
        text: 'AI+ 共识:常州 + 四川试点,11 月启动。多目标:人工成本 -1.2 亿 · 加班合规 · 产能 +1.5pt。需运营部长 + 副总裁拍板:员工过渡补贴 2000 vs 3000 元/月?',
        proposals: ['p_shift_optimize'], mentions: ['运营部长', '运营副总裁'] },
    ],
    assets: [],
  },
  {
    id: '#1306',
    title: '运营数字化驾驶舱二期建设,预算 2800 万,自研 vs 外采',
    level: 'monthly', creator: 'mgr_ops_director', status: 'OPEN', target: 'u_052',
    visible: ['u_051', 'u_052', 'u_053', 'u_006', 'u_004', 'u_005', 'u_011'],
    mins: 95,
    groupTier: 'medium',
    amountText: '预算 2800 万',
    coreGroup: ['u_051', 'u_052', 'u_006'],
    forwardChain: [],
    summary: '讨论中:外采 SAP MII(1 年部署,2200 万) vs 自研(18 个月,2800 万)',
    impact: {
      revenue: '持平', margin: '+0.3pt(间接)', capacity: '+0.8pt',
      inventory: '持平', yield: '持平', risk: [],
    },
    proposalId: 'p_dashboard',
    related: [
      { id: '#1303', title: '2026 全年预算编制', rel: '本议题预算的依据' },
      { id: '#1304', title: 'OEE 提升专项', rel: '驾驶舱是专项的数据支撑' },
    ],
    messages: [
      { agent: 'mgr_ops_director', time: '昨日 14:30', source: 'manual',
        text: '运营数字化驾驶舱二期:整合 OEE / 能耗 / 班次 / 良率 / 设备 5 大模块,4 基地实时联动。预算 2800 万。' },
      { agent: 'mgr_finance', time: '昨日 14:45', source: 'auto',
        text: '财务:外采 SAP MII 一年部署费 2200 万,后续每年订阅 350 万。自研 2800 万,年运维 200 万。3 年 TCO:外采 3300 万 vs 自研 3400 万,差距小。' },
      { agent: 'value_stream', time: '昨日 15:10', source: 'auto',
        text: '技术评估:外采集成度高但定制成本大,我方电池行业特殊指标(SOC / SOH / 容量衰减)需大量二次开发,预计 800 万。自研可量身定制。',
        proposals: ['p_dashboard'] },
      { agent: 'mgr_process', time: '今日 09:30', source: 'manual',
        text: '工艺工程:支持自研,我方涂布 / 化成 / 容量分选工序参数定义和行业差异大,外采产品多基于汽车 / 通用制造,适配度低。' },
      { agent: 'gm_changzhou', time: '今日 10:15', source: 'manual',
        text: '常州基地:倾向外采。自研周期 18 个月,期间已经错过 2 个完整 PDCA 循环,加上运营专项落地需要数字化支撑,等不起。' },
      { agent: 'mgr_ops', time: '今日 11:00', source: 'auto',
        text: '基层建议:折中方案 = 外采核心框架(6 个月部署)+ 自研电池行业特定模块(12 个月渐进),总预算 2600 万。',
        proposals: ['p_dashboard'] },
    ],
    assets: [],
  },

  // ---------- mgr_ops 运营经理(3 议题:百万-千万)----------
  {
    id: '#1307',
    title: '常州 F01 基地涂布工序 OEE 异常,日损失 80 万',
    level: 'tactical', creator: 'value_stream', status: 'PENDING', target: 'u_053',
    autoTriggered: true,
    visible: ['u_051', 'u_052', 'u_053', 'u_021', 'u_022', 'u_041', 'u_042', 'u_003'],
    mins: 8,
    groupTier: 'small',
    amountText: '日损失 80 万 · 累计 11 周',
    coreGroup: ['u_052', 'u_053', 'u_021', 'u_041'],
    forwardChain: [{ from: '基地议题群', to: '运营条线群', when: '09:35', reason: '累计损失超 5000 万,影响 Q3 整体 KPI' }],
    summary: 'AI+ 共识:本周末停线 36 小时全面检修 + 工艺参数重标定',
    pending: '停线检修 36 小时,还是边生产边优化(分 8 周完成,每周降产 8%)?',
    impact: {
      revenue: '-1800 万(停线 36 小时)', margin: '+0.4pt(后续)', capacity: '+5pt(局部)',
      inventory: '持平', yield: '+1.2pt', risk: ['revenue'],
    },
    proposalId: 'p_coating_fix',
    related: [
      { id: '#1304', title: 'OEE 提升专项立项', rel: '本议题是专项的具体执行案例' },
      { id: '#1301', title: 'Q3 运营成本超标', rel: '本议题是成本超标的主因之一' },
    ],
    messages: [
      { agent: 'value_stream', time: '09:20', source: 'auto',
        text: '告警:常州 F01-PL03 涂布工序 OEE 持续 11 周低于 70%(目标 78%),本周累计损失 560 万。@运营经理 立即处置。',
        mentions: ['运营经理'] },
      { agent: 'mgr_factory', time: '09:22', source: 'manual',
        text: 'F01 工厂:涂布机 #3 #5 张力波动异常,可能是涂头磨损。已经申请停线检修 3 次被排产挤掉。' },
      { agent: 'mgr_line', time: '09:24', source: 'auto',
        text: '产线层数据:涂头使用 4200 小时,标准寿命 3800 小时,确实超期。但更换需 36 小时停线 + 4 小时调试。' },
      { agent: 'mgr_process', time: '09:26', source: 'manual',
        text: '工艺总监:涂头更换后,需配合工艺参数重标定(2 小时),并连续生产 200 米首件验证,合计 38 小时。' },
      { agent: 'mgr_ops', time: '09:28', source: 'manual',
        text: '运营经理:停线 36 小时直接损失 1800 万,但持续低 OEE 每周损失 560 万,2 周就回本。建议本周末(双休)停线。' },
      { agent: 'planner_capacity', time: '09:30', source: 'auto',
        text: '产能模拟:本周末停线,#1284 客户 X 加急订单不受影响。但 #1290 月度排程需要微调,把 F01-PL03 周一的工单顺延到周二。' },
      { agent: 'mgr_finance', time: '09:32', source: 'manual',
        text: '财务:支持周末停线方案。短期损失 1800 万,3 周内回收,Q3 整体净增 4200 万。' },
      { agent: 'value_stream', time: '09:34', source: 'auto',
        text: 'AI+ 共识:周末停线 36 小时检修。多目标:短期营收 -1800 万 · 良率 +1.2pt · OEE 恢复至 78%。需运营经理拍板:本周末启动 vs 边生产边优化?',
        proposals: ['p_coating_fix'], mentions: ['运营经理'] },
    ],
    assets: [],
  },
  {
    id: '#1308',
    title: '武汉 F12 储能产线节拍提升项目,预算 680 万,18s → 15s',
    level: 'monthly', creator: 'mgr_ops', status: 'PENDING', target: 'u_053',
    visible: ['u_051', 'u_052', 'u_053', 'u_031', 'u_032', 'u_003', 'u_005'],
    mins: 45,
    groupTier: 'medium',
    amountText: '预算 680 万 · 年增收益 3200 万',
    coreGroup: ['u_052', 'u_053', 'u_031', 'u_005'],
    forwardChain: [{ from: '基地议题群', to: '运营专项群', when: '11:50', reason: '预算 680 万,需运营部长拍板' }],
    summary: 'AI+ 共识:批准启动,Q4 完成自动化改造 + 上下料机器人 + 检测站升级',
    pending: '改造期间 30 天部分停线,订单转移到厦门 F15 还是延期交付?',
    impact: {
      revenue: '+3200 万/年', margin: '+0.4pt', capacity: '+18%(F12)',
      inventory: '持平', yield: '+0.5pt', risk: ['revenue'],
    },
    proposalId: 'p_takt_improve',
    related: [
      { id: '#1304', title: 'OEE 提升专项立项', rel: '本议题是专项的预热案例' },
      { id: '#1302', title: '四基地稼动率失衡', rel: 'F12 提升节拍后稼动率改善' },
    ],
    messages: [
      { agent: 'mgr_ops', time: '11:10', source: 'manual',
        text: 'F12 储能产线节拍提升:当前 18 秒/单元,目标 15 秒/单元(行业领先 13.5 秒),改造预算 680 万。' },
      { agent: 'value_stream', time: '11:15', source: 'auto',
        text: '历史数据:F12 当前年产能 32 万套,节拍 15 秒后理论产能 38.4 万套(+20%)。当前订单池支持满负荷生产。',
        proposals: ['p_takt_improve'] },
      { agent: 'mgr_process', time: '11:20', source: 'manual',
        text: '工艺评估:18 → 15 秒主要瓶颈是上下料(8 秒)和检测(6 秒)。机器人改造 + AI 视觉检测各 280 万 + 120 万,合计 400 万,加上调试和缓存优化共 680 万。' },
      { agent: 'gm_wuhan', time: '11:25', source: 'manual',
        text: '武汉基地:F12 是 2025 新投产线,正是优化窗口期。但改造期间需要 30 天部分停线,影响约 8000 套交付。' },
      { agent: 'mgr_ka', time: '11:30', source: 'auto',
        text: 'KA 销售:F12 储能订单主要客户是 H 集团(Q4 提货 1.2 万套),延期会扣违约金约 360 万。建议转移到厦门 F15-F16 储能线。' },
      { agent: 'planner_capacity', time: '11:35', source: 'manual',
        text: '产能规划:厦门 F15-F16 利用率 84.8%,可承接 8000 套转移订单,改造仅需 6 小时。' },
      { agent: 'mgr_finance', time: '11:42', source: 'auto',
        text: '财务测算:投资 680 万,年新增产能 6.4 万套 × 单套毛利 500 元 = 3200 万/年,回收期 2.5 个月,IRR 280%,强烈建议。',
        proposals: ['p_takt_improve'] },
      { agent: 'value_stream', time: '11:48', source: 'auto',
        text: 'AI+ 共识:批准启动 + 订单转移厦门。多目标:营收 +3200 万/年 · F12 产能 +18% · 良率 +0.5pt。需运营经理 + 运营部长拍板:订单转移厦门 vs 延期交付?',
        proposals: ['p_takt_improve'], mentions: ['运营经理', '运营部长'] },
    ],
    assets: [],
  },
  {
    id: '#1309',
    title: '四川 F08 基地能耗超标 12%,空压系统改造方案 350 万',
    level: 'tactical', creator: 'value_stream', status: 'OPEN', target: 'u_053',
    autoTriggered: true,
    visible: ['u_052', 'u_053', 'u_022', 'u_006'],
    mins: 180,
    groupTier: 'small',
    amountText: '改造 350 万 · 年节约 220 万',
    coreGroup: ['u_052', 'u_053', 'u_022'],
    forwardChain: [],
    summary: '讨论中:Q4 立即改造 vs 推迟到 2026 Q1 与 OEE 专项合并执行',
    impact: {
      revenue: '持平', margin: '+0.1pt', capacity: '持平',
      inventory: '持平', yield: '持平', risk: [],
    },
    proposalId: 'p_energy_fix',
    related: [
      { id: '#1304', title: 'OEE 提升专项立项', rel: '本议题可合并到专项执行' },
      { id: '#1301', title: 'Q3 运营成本超标', rel: '能耗超标是成本超标的子项' },
    ],
    messages: [
      { agent: 'value_stream', time: '昨日 14:20', source: 'auto',
        text: '能耗监控:四川 F08 单位产能能耗 1.32 kWh/Ah,行业基准 1.18 kWh/Ah,超标 11.9%。@运营经理 启动议题。',
        mentions: ['运营经理'] },
      { agent: 'gm_sichuan', time: '昨日 15:05', source: 'manual',
        text: '四川基地:F08 空压系统使用 7 年,效率比新设备低 18%,年耗电多约 380 万 kWh,折合 220 万元。' },
      { agent: 'mgr_process', time: '昨日 15:30', source: 'auto',
        text: '工艺评估:空压系统改造 350 万(变频压缩机 + 储气罐扩容),改造期 5 天(可在产线大检修同步完成)。',
        proposals: ['p_energy_fix'] },
      { agent: 'mgr_finance', time: '今日 09:15', source: 'manual',
        text: '财务:350 万投资,年节约 220 万,回收期 1.6 年。但若合并到 OEE 专项 #1304,设备采购可叠加优惠,降到 290 万。' },
      { agent: 'mgr_ops', time: '今日 10:30', source: 'manual',
        text: '运营经理:倾向推迟。当前 F08 满负荷生产,改造需停线 5 天影响 12 万套产能。建议与 OEE 专项 2026 Q1 合并执行,共享停线窗口。' },
    ],
    assets: [],
  },
  // ====== 历史议题(被引用但不在主列表)======
  {
    id: '#1247',
    title: '客户 Z 加急订单决策',
    level: 'tactical', creator: 'mgr_plan', status: 'RESOLVED', target: 'u_002',
    visible: ['u_001', 'u_002', 'u_003', 'u_004', 'u_005', 'u_006', 'u_007', 'u_009', 'u_012'],
    mins: 45,
    groupTier: 'medium',
    amountText: '营收 +4200 万',
    coreGroup: ['u_002', 'u_004', 'u_012'],
    forwardChain: [{ from: '执行层议题群', to: '副总裁群', when: '15:30', reason: '净收益 +4200 万,需副总裁拍板' }],
    summary: '已决策:接单,前 50 套加严检验,销售主导沟通',
    pending: null,
    impact: {
      revenue: '+4200 万', margin: '+0.2pt', capacity: '+0.5pt',
      inventory: '持平', yield: '-0.2pt(短期)', risk: [],
    },
    proposalId: null,
    related: [
      { id: '#1284', title: '客户 X 加急订单', rel: '相似场景参考' },
    ],
    messages: [
      { agent: 'mgr_plan', time: '14:00', source: 'manual',
        text: '客户 Z 申请加急订单 4000 套,需挤占商用车产能 2 天。请各部门评估。' },
      { agent: 'value_stream', time: '15:30', source: 'auto',
        text: 'AI+ 共识:接单,前 50 套加严检验,销售主导沟通。净收益 +4200 万。' },
    ],
    assets: [],
  },
  {
    id: '#1180',
    title: 'Q1 质量损失复盘',
    level: 'quarterly', creator: 'mgr_quality', status: 'RESOLVED', target: 'u_001',
    visible: ['u_001', 'u_002', 'u_005', 'u_006', 'u_051', 'u_052', 'u_021', 'u_022', 'u_023', 'u_024'],
    mins: 120,
    groupTier: 'large',
    amountText: '损失 1.8 亿 · 避损措施 2.3 亿',
    coreGroup: ['u_001', 'u_002', 'u_005', 'u_006', 'u_051'],
    forwardChain: [{ from: '质量专题群', to: 'CEO 群', when: '16:00', reason: '质量损失 1.8 亿,需 CEO 审阅' }],
    summary: '已复盘:Q1 质量损失根因分析 + 系统性改进措施',
    pending: null,
    impact: {
      revenue: '-1.8 亿(已发生)', margin: '-0.8pt', capacity: '持平',
      inventory: '持平', yield: '+1.0pt(改善后)', risk: [],
    },
    proposalId: null,
    related: [
      { id: '#1298', title: 'Q3 良率告警', rel: '同类质量问题' },
    ],
    messages: [
      { agent: 'mgr_quality', time: '14:00', source: 'manual',
        text: 'Q1 质量损失复盘:主要集中在外部短路(6800 万)、容量衰减(5200 万)、外观异常(6000 万)。' },
      { agent: 'value_stream', time: '16:00', source: 'auto',
        text: '复盘结论:根因是化成工序参数漂移 + SPC 监控滞后。已制定系统性改进措施,预计年避损 2.3 亿。' },
    ],
    assets: [],
  },
  {
    id: '#1275',
    title: 'F03 工厂质量异常处置',
    level: 'tactical', creator: 'mgr_quality', status: 'RESOLVED', target: 'u_002',
    visible: ['u_002', 'u_005', 'u_006', 'u_021', 'u_031'],
    mins: 60,
    groupTier: 'small',
    amountText: '损失 3200 万 · 回收 2800 万',
    coreGroup: ['u_002', 'u_006', 'u_021', 'u_031'],
    forwardChain: [{ from: '基地议题群', to: '副总裁群', when: '12:00', reason: '质量异常损失 3200 万' }],
    summary: '已决策:隔离批次 + 客户沟通 + 工艺参数修正',
    pending: null,
    impact: {
      revenue: '-3200 万', margin: '-0.3pt', capacity: '-2pt(短期)',
      inventory: '+5 天', yield: '-0.5pt(短期)', risk: [],
    },
    proposalId: null,
    related: [
      { id: '#1298', title: 'Q3 良率告警', rel: 'F03 良率问题延续' },
    ],
    messages: [
      { agent: 'mgr_quality', time: '10:00', source: 'manual',
        text: 'F03 发现批次质量异常,涉及 320 套产品,预估损失 3200 万。' },
      { agent: 'value_stream', time: '12:00', source: 'auto',
        text: '处置方案:隔离批次 + 紧急客户沟通 + 工艺参数修正。预计回收 2800 万。' },
    ],
    assets: [],
  },
];

// ============================================================
// 方案库
// ============================================================
const PROPOSALS = {
  p_split: {
    title: '客户 X 加急订单拆分协同方案',
    summary: 'F02 + F08 跨基地拆分生产,加严检验,采购紧急补料',
    points: [
      'F02 常州承接 500 套(乘用车主线)',
      'F08 四川承接 300 套(短期改造商用车产线)',
      '前 100 套加严检验,SPC 实时监控',
      '采购紧急补订正极材料 300 套用量,5 天周期',
      '客户 Y 沟通由销售副总裁亲自致电',
    ],
    impact: {
      cost: '产线切换 10 小时 + 客户 Y 违约金 1800 万',
      time: '6/15 前完成交付',
      revenue: '订单营收 2.8 亿 · 净收益 +8400 万',
      risk: '客户 Y 关系 · 短期良率 0.4pt',
    },
    objective: { revenue: '+8400 万', margin: '持平', capacity: '+0.3pt',
                 inventory: '持平', yield: '-0.4pt(短期)', risk: ['yield'] },
    ontology: ['订单', '产能', '客户优先级', '产线冲突'],
    related: ['#1247 客户 Z 加急订单(相似度 87%)'],
  },
  p_strict: {
    title: '前 100 套加严检验方案',
    summary: '前 100 套实施 100% 全检,SPC 实时监控,触发条件清晰',
    points: [
      '前 100 套实施 100% 全检(常规为抽检)',
      'SPC 控制图实时监控关键工序参数',
      '若良率 < 95%,触发停线复核机制',
      '保留每批次追溯样本至少 6 个月',
    ],
    impact: {
      cost: '加严检验增加质检工时约 40 小时',
      time: '不影响整体交付时间',
      revenue: '客户满意度提升',
      risk: '降低批次质量风险 70%',
    },
    objective: { yield: '+0.5pt(项目内)', margin: '-0.1pt', revenue: '持平' },
    ontology: ['质量', 'SPC 控制'],
    related: ['#1180 Q1 质量损失复盘'],
  },
  p_cross: {
    title: '6 月跨产线产能调配方案',
    summary: 'F08 商用车产线 30% 临时转向乘用车,匹配需求结构',
    points: [
      'F08 商用车产线释放 30% 产能(月产能 800 套)',
      '改造为 EV-200,需 8 小时工艺切换',
      '保留 70% 商用车产能,等待 Q3 末反弹',
      '采购隔膜补订 200 套用量,5 天到货',
      '保供宁德新增 600 套订单',
    ],
    impact: {
      cost: '工艺切换 + 物料采购约 5000 万',
      time: '7 月初执行,持续到 8 月底',
      revenue: '6-7 月营收 +3.2 亿',
      risk: '商用车库存上升,周转 +2 天',
    },
    objective: { revenue: '+3.2 亿', margin: '+0.2pt', capacity: '+1.5pt',
                 inventory: '+2 天(风险)', yield: '持平', risk: ['inventory'] },
    ontology: ['S&OP', '需求预测', '产能调配'],
    related: ['#1284 客户 X 加急订单'],
  },
  p_multi: {
    title: 'Q3 产能缺口补全:三方案权衡',
    summary: '推荐方案 B 平衡型 · 营收补 6.5 亿 · 毛利保持 · 产能 +4pt',
    points: [
      '【方案 A 激进】激活 B 类客户备选 · +9 亿 / 毛利 -0.5pt',
      '【方案 B 平衡】F12 武汉扩产 + F15 加量 · +6.5 亿 / 毛利保持 ⭐',
      '【方案 C 保守】仅追加 A 类客户 · +4.5 亿 / 毛利 +0.3pt',
      '价值流 Agent 综合权重选 B(营收 30% / 毛利 25% / 产能 15% / 库存 10% / 良率 20%)',
      '与 #1298 良率改善并行启动',
    ],
    impact: {
      cost: 'F12 二期 1.2 亿 · F15 加量 8000 万',
      time: '7 月底 F12 投产,8 月初 F15 加量',
      revenue: '方案 B Q3 营收 +6.5 亿,占缺口 81%',
      risk: '武汉新工人培训周期 · 海外客户协调',
    },
    objective: { revenue: '+6.5 亿', margin: '持平', capacity: '+4pt',
                 inventory: '持平', yield: '持平', risk: [] },
    threeOptions: [
      { label: 'A 激进', revenue: '+9 亿', margin: '-0.5pt', capacity: '+6pt',
        inventory: '-2 天', yield: '-0.3pt', score: 72 },
      { label: 'B 平衡 ⭐', revenue: '+6.5 亿', margin: '持平', capacity: '+4pt',
        inventory: '持平', yield: '持平', score: 88 },
      { label: 'C 保守', revenue: '+4.5 亿', margin: '+0.3pt', capacity: '+2pt',
        inventory: '+1 天', yield: '+0.1pt', score: 75 },
    ],
    ontology: ['季度规划', '多目标求解', '产能扩张'],
    related: ['#1290 月度评审', '#1298 良率告警'],
  },
  p_yield: {
    title: '良率提升专项改善方案',
    summary: '工艺标准化 + SPC 升级 + F03 维保,8 周达 97.0%,12 周达 97.5%',
    points: [
      '4 基地化成工序参数全集团标准化(以 F02 为基准)',
      '工艺工程师驻厂:F03、F08 各 1 名 · 8 周',
      'SPC 监控系统升级:实时湿度/温度告警',
      'F03 化成设备维保升级:更换关键传感器',
      '与 #1295 Q3 产能规划并行启动',
    ],
    impact: {
      cost: '专项投入约 2800 万',
      time: '8 周达 97.0%,12 周达 97.5%',
      revenue: '修正后保住 5.5 亿营收',
      risk: '人员调配紧张,8 月需新招 6 名工艺工程师',
    },
    objective: { revenue: '+5.5 亿(避损)', margin: '+1.5pt(避损)',
                 capacity: '+1pt', inventory: '持平', yield: '+1.3pt(目标)' },
    ontology: ['良率', '工艺改善', '年度目标'],
    related: ['#1284 客户 X 加急订单', '#1275 F03 工厂质量异常'],
  },
  // ====== v4.6 新增方案(对应 #1301-#1309)====== //
  p_ops_cost: {
    title: 'Q3 运营成本超标双轨治理方案',
    summary: 'OEE 专项 + 班次优化双轨并行,Q4 回收 8000 万,治本 + 治标兼顾',
    points: [
      'OEE 提升专项立项,投资 4500 万,3 基地试点(对应 #1304)',
      '全集团班次优化(三班两倒→四班三倒),零投入(对应 #1305)',
      '能耗治理单点突破:四川 F08 空压系统改造 350 万(对应 #1309)',
      'Q4 节约目标 8000 万,2026 年化节约 4.5 亿',
      '配套数字化驾驶舱二期支撑(对应 #1306)',
    ],
    impact: {
      cost: '投资 4500 万(OEE)+ 350 万(能耗)= 4850 万',
      time: 'Q4 启动,Q1 见效,Q2 全集团推广',
      revenue: 'Q4 回收 8000 万 · 2026 年化 4.5 亿',
      risk: '员工对班次切换抵抗 · 设备改造期产能波动',
    },
    objective: { revenue: '持平', margin: '+1.2pt', capacity: '+1.8pt', inventory: '持平', yield: '+0.4pt' },
    ontology: ['运营成本', 'OEE', '班次', '能耗', '专项治理'],
    related: ['#2025-Q1 类似治理(回收 6500 万,达成率 92%)'],
  },
  p_capacity_balance: {
    title: '四基地产能再平衡方案',
    summary: '厦门承接 2.4 亿储能 + 四川承接 1800 万乘用车,稼动率差距从 11.4pt 降到 4pt',
    points: [
      '武汉 F12 → 厦门 F15-F16:2.4 亿储能订单转移',
      '常州 F02 → 四川 F08:1800 万乘用车订单转移',
      '客户告知由销售统一沟通,避免口径不一',
      '厦门补充 80 名操作工 + 储能模组培训(提前 3 天)',
      '四川 F08 占用储能线 2 天,需协调销售时间窗口',
    ],
    impact: {
      cost: '人员培训 + 调度成本约 80 万',
      time: '5 个工作日内完成转移',
      revenue: '+6500 万(避免常州加班费 + 厦门订单激活)',
      risk: '客户对转移产线的接受度 · 厦门质量爬坡',
    },
    objective: { revenue: '+6500 万', margin: '+0.5pt', capacity: '+2.8pt', inventory: '持平', yield: '持平' },
    ontology: ['稼动率', '订单转移', '跨基地协同'],
    related: ['#2025-Q2 跨基地平衡(均衡度从 92% 提升到 96%)'],
  },
  p_budget_2026: {
    title: '2026 运营预算编制三档方案',
    summary: '激进 11.8% / 稳健 12.0% / 保守 12.5%,锚定行业头部 11.5% 中位数',
    points: [
      '激进方案:占比 11.8%,节约 8.6 亿,需 OEE +6pt + 班次优化全推',
      '稳健方案:占比 12.0%,节约 7.8 亿,OEE +5pt + 班次优化试点',
      '保守方案:占比 12.5%,节约 5.5 亿,只做单点突破',
      '行业对标:头部企业 2025 中位数 11.5%',
      '依赖项:#1304 OEE 专项 ROI 需先确认',
    ],
    impact: {
      cost: '专项投入 4500 万 - 6800 万(三档对应)',
      time: '2026 全年',
      revenue: '年化节约 5.5 - 8.6 亿(三档)',
      risk: '过激目标导致一线压力 · 员工士气',
    },
    objective: { revenue: '持平', margin: '+0.5~+1.2pt', capacity: '持平', inventory: '持平', yield: '持平' },
    ontology: ['预算', '运营成本占比', '行业对标'],
    related: ['#2025 预算复盘(达成 92%)'],
  },
  p_oee_program: {
    title: 'OEE 提升专项 3 基地试点方案',
    summary: '常州 + 四川 + 厦门 3 基地试点,投资 4500 万,目标 OEE 72%→78%',
    points: [
      '常州 F01-F02 涂布工序:投资 1800 万,目标 OEE 68%→78%',
      '四川 F08 商用车+储能混线:投资 1200 万,目标 OEE 65%→73%',
      '厦门 F15-F16 储能产线:投资 1500 万,目标 OEE 71%→78%',
      '配套数字化采集 + AI 视觉检测,设备 3200 万 + 软件 800 万 + 培训 500 万',
      'Q4 启动,2026 Q2 推广到所有基地',
    ],
    impact: {
      cost: '4500 万一次性投资',
      time: 'Q4 启动,14 个月回收',
      revenue: '年营收 +5.4 亿 · 毛利 +6300 万',
      risk: '设备到货延期 · 试点基地员工接受度',
    },
    objective: { revenue: '+5.4 亿(年化)', margin: '+1.5pt', capacity: '+3.2pt', inventory: '持平', yield: '+0.8pt' },
    ontology: ['OEE', '专项立项', '设备改造'],
    related: ['#2024 类似专项(达成 96%,超 ROI 预期)'],
  },
  p_shift_optimize: {
    title: '全集团班次优化方案',
    summary: '三班两倒 → 四班三倒,常州+四川 11 月试点,2026 Q1 推广',
    points: [
      '现状:每月加班 162 小时,违反劳动法 144 小时上限',
      '目标:加班降到 110 小时/月,合规边界以内',
      '常州 + 四川 11 月试点,8200 名员工受影响',
      '过渡期 3 个月,每人每月补贴 2000 元',
      '武汉 F12 推迟到 2026 Q2(产线刚投产)',
    ],
    impact: {
      cost: '过渡补贴 4800 万(3 个月)+ 新员工成本 0.3 亿/年',
      time: '11 月启动,2026 Q1 全面推广',
      revenue: '减少加班费 1.5 亿/年 · 净节约 1.2 亿',
      risk: '员工流失率 · 短期良率波动',
    },
    objective: { revenue: '持平', margin: '+0.8pt', capacity: '+1.5pt', inventory: '持平', yield: '持平' },
    ontology: ['班次', '人工成本', '劳动法合规'],
    related: ['#2024 班次调整(达成 88%,流失率 +1.2pt)'],
  },
  p_dashboard: {
    title: '运营数字化驾驶舱二期方案',
    summary: '折中方案:外采核心框架 + 自研电池行业模块,总预算 2600 万',
    points: [
      '外采 SAP MII 核心框架:1800 万,6 个月部署',
      '自研电池行业特定模块:800 万,12 个月渐进',
      '5 大模块:OEE / 能耗 / 班次 / 良率 / 设备',
      '4 基地实时联动,数据刷新周期 5 分钟',
      '3 年 TCO 约 3000 万,比纯自研省 400 万',
    ],
    impact: {
      cost: '2600 万一次性 + 250 万/年运维',
      time: '6 个月先上线核心,18 个月完整能力',
      revenue: '间接 · 支撑 OEE 专项',
      risk: '外采厂商接口稳定性 · 自研团队 retention',
    },
    objective: { revenue: '持平', margin: '+0.3pt', capacity: '+0.8pt', inventory: '持平', yield: '持平' },
    ontology: ['数字化', '驾驶舱', 'SAP MII'],
    related: ['#一期项目(达成 100% 但仅覆盖 OEE 单一模块)'],
  },
  p_coating_fix: {
    title: '常州 F01 涂布工序停线检修方案',
    summary: '本周末停线 36 小时 + 涂头更换 + 工艺参数重标定 + 200 米首件验证',
    points: [
      '本周末停线 36 小时(双休日,影响最小)',
      '更换涂头(标准寿命 3800 小时,当前 4200 小时)',
      '工艺参数重标定,涂头温度 / 张力 / 速度 3 组参数',
      '连续生产 200 米首件验证,SPC 监控',
      '#1284 客户 X 加急订单不受影响',
    ],
    impact: {
      cost: '涂头 + 工艺师工时约 80 万',
      time: '36 小时停线 + 2 小时调试',
      revenue: '短期 -1800 万 · 后续 OEE +5pt 周回收 560 万',
      risk: '首件验证不通过需追加时间 · 排产微调',
    },
    objective: { revenue: '-1800 万短期', margin: '+0.4pt', capacity: '+5pt 局部', inventory: '持平', yield: '+1.2pt' },
    ontology: ['涂布', 'OEE', '设备检修', '工艺参数'],
    related: ['#2024-09 类似检修(达成 100%,3 周回收)'],
  },
  p_takt_improve: {
    title: '武汉 F12 节拍提升改造方案',
    summary: '上下料机器人 + AI 视觉检测,18 秒→15 秒,F12 产能 +18%',
    points: [
      '上下料机器人改造:280 万(瓶颈工序提速 8s→5s)',
      'AI 视觉检测站升级:120 万(瓶颈工序 6s→4s)',
      '缓存系统优化 + 调试 + 培训:280 万',
      '30 天部分停线,8000 套订单转移厦门 F15-F16',
      'Q4 完成改造,2026 起年增收益 3200 万',
    ],
    impact: {
      cost: '680 万一次性投资',
      time: '30 天改造期 + 7 天调试',
      revenue: '+3200 万/年 · 回收期 2.5 个月',
      risk: 'H 集团对转移产线接受度 · 厦门储能线质量爬坡',
    },
    objective: { revenue: '+3200 万年化', margin: '+0.4pt', capacity: '+18% 局部', inventory: '持平', yield: '+0.5pt' },
    ontology: ['节拍', '自动化', '储能产线'],
    related: ['#2024 F08 类似改造(IRR 220%,达成 100%)'],
  },
  p_energy_fix: {
    title: '四川 F08 空压系统改造方案',
    summary: 'Q4 立即改造 vs 推迟到 2026 Q1 与 OEE 专项合并',
    points: [
      '空压系统使用 7 年,效率低 18%,年多耗 220 万元',
      '改造内容:变频压缩机 + 储气罐扩容',
      '独立改造:350 万,5 天停线',
      '合并 OEE 专项:290 万,共享停线窗口',
      '回收期 1.6 年(独立)/ 1.3 年(合并)',
    ],
    impact: {
      cost: '350 万(独立)/ 290 万(合并)',
      time: '5 天停线(独立)/ 0 天(合并 OEE 专项)',
      revenue: '年节约 220 万',
      risk: 'F08 满负荷生产 · 停线损失约 600 万',
    },
    objective: { revenue: '持平', margin: '+0.1pt', capacity: '持平', inventory: '持平', yield: '持平' },
    ontology: ['能耗', '空压系统', '设备改造'],
    related: ['#2024-Q4 类似能耗改造(达成 95%)'],
  },
};

// 待请示草稿
const INITIAL_PENDINGS = [
  { id: 'p1', topicId: '#1284', topicTitle: '客户 X 加急订单',
    agent: 'mgr_plan', owner: 'u_004',
    draft: '建议追问销售:客户 Y 延期沟通的具体时间窗口?超过 24 小时需启动备选。',
    reasoning: '基于历史议题 #1247,客户 Y 沟通超过 24 小时显著影响关系。', minsAgo: 5 },
  { id: 'p2', topicId: '#1290', topicTitle: '6 月 S&OP 评审',
    agent: 'mgr_plan', owner: 'u_004',
    draft: 'F08 转产前 2 天需通知工艺切换,排产计划需调整 5/16 开始的优先级。',
    reasoning: '工艺切换前置时间是排产稳定性的关键。', minsAgo: 30 },
  // ====== v4.6 新增 pending 草稿(对应 6 个 PENDING 议题)====== //
  { id: 'p3', topicId: '#1301', topicTitle: 'Q3 运营成本超标',
    agent: 'mgr_ops_director', owner: 'u_051',
    draft: '建议追问财务:Q4 启动专项的现金流压力测算 - 投入 4500 万分几期支付,对 Q4 现金流影响多大?',
    reasoning: '4500 万投资集中在 Q4 一次性支付会挤占运营资金,需要确认现金流分摊方案。', minsAgo: 10 },
  { id: 'p4', topicId: '#1302', topicTitle: '四基地稼动率失衡',
    agent: 'mgr_ka', owner: 'u_051',
    draft: '建议追问销售副总裁:涉及的 4 个客户里,是否有 A 类战略客户?统一告知前需要 CEO 一对一沟通最重要的客户。',
    reasoning: '订单转移涉及客户关系,A 类客户必须 CEO 亲自沟通避免感受到「被推来推去」。', minsAgo: 22 },
  { id: 'p5', topicId: '#1304', topicTitle: 'OEE 提升专项立项',
    agent: 'value_stream', owner: 'u_052',
    draft: '建议追问 4 基地总经理:试点基地组合(常州+四川+厦门 vs 常州+四川+武汉)各自的设备到货周期能保证 Q4 启动吗?',
    reasoning: '试点选择不仅看 OEE 提升空间,也看执行的时间窗口可行性。', minsAgo: 5 },
  { id: 'p6', topicId: '#1305', topicTitle: '全集团班次优化',
    agent: 'mgr_ka', owner: 'u_052',
    draft: '建议追问 HR:2000 元过渡补贴的市场对标 - 同行业 4-5 家头部企业过去 12 个月类似政策的补贴标准是多少?',
    reasoning: '员工补贴需要参考行业基准,避免过高造成持续成本压力,过低引发流失。', minsAgo: 18 },
  { id: 'p7', topicId: '#1307', topicTitle: 'F01 涂布工序 OEE 异常',
    agent: 'planner_capacity', owner: 'u_053',
    draft: '建议追问工厂经理:本周末停线检修期间,常州 F01-PL03 的工人可以临时调配到 F02 支援涂布工序吗?',
    reasoning: '停线期间避免工人闲置,提升 F02 的稼动率,降低短期产能损失。', minsAgo: 3 },
  { id: 'p8', topicId: '#1308', topicTitle: 'F12 节拍提升改造',
    agent: 'mgr_ka', owner: 'u_053',
    draft: '建议追问 KA 销售:H 集团对 F12 → 厦门 F15-F16 产线转移的接受度评估 - 客户是否需要现场验厂?',
    reasoning: 'H 集团是大客户,产线转移可能引发质量审计,需要提前沟通验厂时间和资源。', minsAgo: 35 },
];

// @ 可提及角色
const MENTIONABLE = [
  { key: 'CEO', title: 'CEO', type: 'human', initial: 'C' },
  { key: '生产副总裁', title: '生产副总裁', type: 'human', initial: '生' },
  { key: '销售副总裁', title: '销售副总裁', type: 'human', initial: '销' },
  { key: '供应链副总裁', title: '供应链副总裁', type: 'human', initial: '供' },
  { key: '运营副总裁', title: '运营副总裁', type: 'human', initial: '运' },
  { key: '运营部长', title: '运营部长', type: 'agent', initial: '运' },
  { key: '运营经理', title: '运营经理', type: 'agent', initial: '运' },
  { key: '计划', title: '计划经理', type: 'agent', initial: '计' },
  { key: '工艺', title: '工艺总监', type: 'agent', initial: '工' },
  { key: '质量', title: '质量经理', type: 'agent', initial: '质' },
  { key: '财务', title: '财务经理', type: 'agent', initial: '财' },
  { key: '采购', title: '采购负责人', type: 'agent', initial: '采' },
  { key: '大客户', title: '大客户经理', type: 'agent', initial: 'K' },
  { key: '需求预测', title: '需求预测', type: 'agent', initial: '需' },
  { key: '产能规划', title: '产能规划', type: 'agent', initial: '容' },
  { key: '常州基地', title: '常州基地总经理', type: 'agent', initial: '常' },
  { key: '四川基地', title: '四川基地总经理', type: 'agent', initial: '川' },
  { key: '武汉基地', title: '武汉基地总经理', type: 'agent', initial: '汉' },
  { key: '厦门基地', title: '厦门基地总经理', type: 'agent', initial: '厦' },
];

// ============================================================
// 工具
// ============================================================
function formatMins(mins) {
  if (mins < 60) return `${mins} 分钟前`;
  if (mins < 1440) return `${Math.floor(mins / 60)} 小时前`;
  return `${Math.floor(mins / 1440)} 天前`;
}

// ============================================================
// Agent 头像
// ============================================================
function AgentAvatar({ agentId, size = 'sm' }) {
  const info = AGENT_INFO[agentId];
  const isVS = agentId === 'value_stream';
  const sz = size === 'xs' ? 22 : size === 'md' ? 36 : 28;
  const fs = size === 'xs' ? 10 : size === 'md' ? 14 : 12;
  return (
    <div style={{
      width: sz, height: sz, flexShrink: 0,
      background: isVS ? C.accent : C.primary, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: C.white, fontWeight: 700, fontSize: fs,
    }}>{info?.initial || '?'}</div>
  );
}

// ============================================================
// 消息来源标签(只用 3 色 + 形状)
// ============================================================
function SourceBadge({ source, ownerTitle }) {
  // manual = 实心圆点(深蓝) / auto = 空心圆点(灰) / modified = 实心圆点 + ✎ / owner = ◆ 金
  if (source === 'manual') {
    return <span style={{ fontSize: 10, color: C.primary, marginLeft: 6, fontWeight: 500 }}>
      ● {ownerTitle || '主人'}已确认
    </span>;
  }
  if (source === 'modified') {
    return <span style={{ fontSize: 10, color: C.primary, marginLeft: 6, fontWeight: 500 }}>
      ● {ownerTitle || '主人'}修改后确认 ✎
    </span>;
  }
  if (source === 'auto') {
    return <span style={{ fontSize: 10, color: C.grey, marginLeft: 6, fontWeight: 500 }}>
      ○ 自动发言
    </span>;
  }
  if (source === 'owner') {
    return <span style={{ fontSize: 10, color: C.accent, marginLeft: 6, fontWeight: 500 }}>
      ◆ 本人发言
    </span>;
  }
  return null;
}

// ============================================================
// 渲染消息内容:[方案] + @提及
// ============================================================
function renderContent(text, mentions, proposals, onOpenProposal) {
  const propRegex = /\[([^\]]+)\]/g;
  const parts = [];
  let last = 0, m, idx = 0;
  while ((m = propRegex.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: 'text', val: text.slice(last, m.index) });
    parts.push({ type: 'proposal', label: m[1], propId: proposals && proposals[idx] });
    idx++;
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: 'text', val: text.slice(last) });

  const final = [];
  parts.forEach(p => {
    if (p.type !== 'text') { final.push(p); return; }
    if (!mentions || mentions.length === 0) { final.push(p); return; }
    let subs = [p.val];
    mentions.forEach(mn => {
      const newSubs = [];
      subs.forEach(s => {
        if (typeof s !== 'string') { newSubs.push(s); return; }
        const sp = s.split(`@${mn}`);
        sp.forEach((seg, i) => {
          if (i > 0) newSubs.push({ type: 'mention', label: mn });
          if (seg) newSubs.push(seg);
        });
      });
      subs = newSubs;
    });
    subs.forEach(s => {
      if (typeof s === 'string') final.push({ type: 'text', val: s });
      else final.push(s);
    });
  });

  return final.map((p, i) => {
    if (p.type === 'text') return <span key={i}>{p.val}</span>;
    if (p.type === 'mention') return <span key={i} style={{ color: C.accent, fontWeight: 700 }}>@{p.label}</span>;
    if (p.type === 'proposal') return (
      <button key={i} onClick={() => p.propId && onOpenProposal(p.propId)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: C.accentBg, color: C.accent, border: `1px solid ${C.accent}`,
        padding: '1px 8px', borderRadius: 3, fontSize: 12, fontWeight: 700,
        cursor: 'pointer', margin: '0 2px', fontFamily: 'inherit',
      }}>▣ {p.label}</button>
    );
    return null;
  });
}

// ============================================================
// 方案弹窗
// ============================================================
function ProposalModal({ proposalId, onClose }) {
  if (!proposalId) return null;
  const p = PROPOSALS[proposalId];
  if (!p) return null;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(30,42,58,0.5)', zIndex: 110,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 720, maxHeight: '85vh', background: C.white, borderRadius: 8,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(30,42,58,0.2)',
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${C.greyLight}`,
          background: C.accentBg,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: C.accent, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>
              方  案  详  情
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.primary, marginBottom: 6 }}>
              {p.title}
            </div>
            <div style={{ fontSize: 12, color: C.primaryLight, lineHeight: 1.5 }}>
              {p.summary}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 22, color: C.grey,
            cursor: 'pointer', marginLeft: 12, fontFamily: 'inherit',
          }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {/* 三方案对比 */}
          {p.threeOptions && (
            <div style={{ marginBottom: 20 }}>
              <SectionLabel>三 方 案 权 衡 矩 阵</SectionLabel>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: C.bgLight }}>
                    {['方案', '营收', '毛利', '产能', '库存', '良率', '综合'].map(h => (
                      <th key={h} style={{
                        padding: 8, textAlign: 'left',
                        border: `1px solid ${C.greyLight}`, fontWeight: 700, color: C.primary,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {p.threeOptions.map((o, i) => {
                    const rec = o.label.includes('⭐');
                    return (
                      <tr key={i} style={{ background: rec ? C.accentBg : C.white }}>
                        <td style={{ padding: 8, border: `1px solid ${C.greyLight}`,
                                     fontWeight: rec ? 700 : 400, color: C.primary }}>{o.label}</td>
                        <td style={{ padding: 8, border: `1px solid ${C.greyLight}`, color: C.primary }}>{o.revenue}</td>
                        <td style={{ padding: 8, border: `1px solid ${C.greyLight}`, color: C.primary }}>{o.margin}</td>
                        <td style={{ padding: 8, border: `1px solid ${C.greyLight}`, color: C.primary }}>{o.capacity}</td>
                        <td style={{ padding: 8, border: `1px solid ${C.greyLight}`, color: C.primary }}>{o.inventory}</td>
                        <td style={{ padding: 8, border: `1px solid ${C.greyLight}`, color: C.primary }}>{o.yield}</td>
                        <td style={{ padding: 8, border: `1px solid ${C.greyLight}`,
                                     textAlign: 'center', fontWeight: 700,
                                     color: rec ? C.accent : C.primaryLight }}>{o.score}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 推演路径图 */}
          {REASONING_PATHS[proposalId] && (
            <ReasoningPath path={REASONING_PATHS[proposalId]} />
          )}

          {/* 核心要点 */}
          <div style={{ marginBottom: 20 }}>
            <SectionLabel>核  心  要  点</SectionLabel>
            {p.points.map((pt, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8, padding: '6px 0',
                borderBottom: i < p.points.length - 1 ? `1px solid ${C.bgLight}` : 'none',
              }}>
                <span style={{
                  flexShrink: 0, width: 18, height: 18, borderRadius: '50%',
                  background: C.primary, color: C.white,
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: 2,
                }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: C.primary, lineHeight: 1.6 }}>{pt}</span>
              </div>
            ))}
          </div>

          {/* 影响评估 */}
          <div style={{ marginBottom: 20 }}>
            <SectionLabel>影  响  评  估</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {['cost', 'time', 'revenue', 'risk'].filter(k => p.impact[k]).map(k => {
                const labels = { cost: '成本', time: '时间', revenue: '收益', risk: '风险' };
                const isRisk = k === 'risk';
                return (
                  <div key={k} style={{
                    padding: 10, background: C.bgLight, borderRadius: 4,
                    borderLeft: `3px solid ${isRisk ? C.accent : C.primary}`,
                  }}>
                    <div style={{ fontSize: 10, color: C.grey, fontWeight: 700, marginBottom: 4 }}>
                      {labels[k]}
                    </div>
                    <div style={{ fontSize: 11, color: C.primary, lineHeight: 1.5 }}>{p.impact[k]}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 多目标影响 */}
          {p.objective && (
            <div style={{ marginBottom: 20 }}>
              <SectionLabel>对  年  度  目  标  的  影  响</SectionLabel>
              <ObjectiveGrid impact={p.objective} />
            </div>
          )}

          {/* 关联本体 */}
          {p.ontology && (
            <div style={{ marginBottom: 16 }}>
              <SectionLabel>关  联  本  体</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {p.ontology.map(n => (
                  <span key={n} style={{
                    fontSize: 11, padding: '3px 8px',
                    border: `1px solid ${C.greyLight}`, borderRadius: 3, color: C.primaryLight,
                  }}>{n}</span>
                ))}
              </div>
            </div>
          )}

          {p.related && (
            <div>
              <SectionLabel>相  关  议  题</SectionLabel>
              {p.related.map((r, i) => (
                <div key={i} style={{
                  fontSize: 12, color: C.primaryLight, padding: '4px 0',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ color: C.accent }}>⟲</span> {r}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          padding: 14, borderTop: `1px solid ${C.greyLight}`, background: C.bgLight,
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <button onClick={onClose} style={{
            background: C.white, color: C.primaryLight,
            border: `1px solid ${C.greyLight}`,
            padding: '8px 16px', borderRadius: 4, fontSize: 12, cursor: 'pointer',
            fontFamily: 'inherit',
          }}>关闭</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 小组件
// ============================================================
function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10, color: C.grey, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>
      {children}
    </div>
  );
}

function ObjectiveGrid({ impact, compact = false }) {
  if (!impact) return null;
  const items = [
    { key: 'revenue', label: '营收' },
    { key: 'margin', label: '毛利率' },
    { key: 'capacity', label: '产能利用率' },
    { key: 'inventory', label: '库存周转' },
    { key: 'yield', label: '良率' },
  ];
  const riskList = impact.risk || [];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
      {items.map(it => {
        const v = impact[it.key];
        if (!v) return null;
        const isRisk = riskList.includes(it.key);
        return (
          <div key={it.key} style={{
            padding: compact ? '6px 4px' : '8px 6px', background: C.white,
            border: `1px solid ${isRisk ? C.accent : C.greyLight}`,
            borderRadius: 4, textAlign: 'center',
          }}>
            <div style={{ fontSize: 9, color: C.grey, marginBottom: 3 }}>{it.label}</div>
            <div style={{
              fontSize: compact ? 10 : 11, fontWeight: 700,
              color: isRisk ? C.accent : C.primary,
            }}>{v}</div>
          </div>
        );
      })}
    </div>
  );
}

function TopicLevelBadge({ level, auto }) {
  const lv = TOPIC_LEVELS[level];
  if (!lv) return null;
  return (
    <span style={{
      fontSize: 9, padding: '2px 7px', borderRadius: 3, fontWeight: 700,
      background: auto ? C.accentBg : C.bgGrey,
      color: auto ? C.accent : C.primaryLight,
      letterSpacing: 1,
    }}>
      {auto && '⚡ '}{lv.label}
    </span>
  );
}


// ============================================================
// 群成员展示(议题顶部 banner,公示当前谁在群里)
// ============================================================
function GroupMembersBanner({ groupTier, amountText, members, forwardChain, onForward }) {
  const rule = GROUP_RULES[groupTier];
  const [expand, setExpand] = useState(false);

  // 按层级分组
  const byLevel = {};
  members.forEach(uid => {
    const u = USERS[uid];
    if (!u) return;
    if (!byLevel[u.level]) byLevel[u.level] = [];
    byLevel[u.level].push(u);
  });
  const levelOrder = ['战略层', '经营层', '执行层', '基地层', '工厂层', '产线层'];

  return (
    <div style={{
      background: C.bgLight, border: `1px solid ${C.greyLight}`,
      borderLeft: `3px solid ${C.accent}`, borderRadius: 4,
      padding: 10, marginBottom: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expand ? 8 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: C.primary, fontWeight: 700 }}>
            🔒 群成员 ({members.length})
          </span>
          {rule && (
            <span style={{ fontSize: 10, color: C.accent, fontWeight: 700,
                           padding: '2px 6px', background: C.accentBg, borderRadius: 3 }}>
              {rule.label} · {rule.threshold}
            </span>
          )}
          {amountText && (
            <span style={{ fontSize: 10, color: C.primary, fontWeight: 700 }}>
              · {amountText}
            </span>
          )}
          {rule && rule.note && (
            <span style={{ fontSize: 10, color: C.grey, fontStyle: 'italic' }}>{rule.note}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {onForward && (
            <button onClick={onForward} style={{
              background: 'transparent', border: `1px solid ${C.accent}`, color: C.accent,
              padding: '3px 8px', borderRadius: 3, fontSize: 10, cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 700,
            }}>↗ 转发议题</button>
          )}
          <button onClick={() => setExpand(!expand)} style={{
            background: 'transparent', border: 'none', color: C.grey,
            fontSize: 10, cursor: 'pointer', fontFamily: 'inherit',
          }}>{expand ? '▲ 收起' : '▼ 展开成员'}</button>
        </div>
      </div>
      {expand && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: forwardChain && forwardChain.length ? 8 : 0 }}>
            {levelOrder.filter(l => byLevel[l]).map(level => (
              <div key={level} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', background: C.white,
                border: `1px solid ${C.greyLight}`, borderRadius: 3,
              }}>
                <span style={{ fontSize: 9, color: C.grey, fontWeight: 700 }}>{level}:</span>
                {byLevel[level].map((u, i) => (
                  <span key={u.id} style={{ fontSize: 10, color: C.primary, marginLeft: i > 0 ? 4 : 0 }}>
                    {u.title}{i < byLevel[level].length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
            ))}
          </div>
          {forwardChain && forwardChain.length > 0 && (
            <div style={{
              paddingTop: 8, borderTop: `1px dashed ${C.greyLight}`,
              fontSize: 10, color: C.grey, lineHeight: 1.6,
            }}>
              <strong style={{ color: C.accent, marginRight: 4 }}>↗ 转发链路:</strong>
              {forwardChain.map((f, i) => (
                <span key={i}>
                  {i > 0 && ' → '}
                  <span style={{ color: C.primary }}>{f.from}</span> → <span style={{ color: C.primary, fontWeight: 700 }}>{f.to}</span>
                  <span style={{ color: C.grey, marginLeft: 4 }}>({f.when} · {f.reason})</span>
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
// 私聊面板(主人与自己 Agent 私聊,他人不可见)
// 在议题底部以 Tab 形式提供:[以本人身份发言] / [先和我的 Agent 沟通]
// ============================================================
function PrivateChatPanel({ currentUser, onPublishAsAgent, onPublishAsOwner, onClose }) {
  // 模拟 Agent 初始问候
  const [conversation, setConversation] = useState([
    { from: 'agent', text: `您好,${currentUser.title}。我是您的专属 Agent,我们的对话只有您能看到。议题里需要我代表您发言,或者您本人发言之前想和我对一下数据/口径吗?` },
  ]);
  const [input, setInput] = useState('');
  const [draft, setDraft] = useState('');  // 主人最终敲定要发的话

  const handleSend = () => {
    if (!input.trim()) return;
    const userTurn = { from: 'owner', text: input };
    setConversation([...conversation, userTurn]);
    // 模拟 Agent 响应(简单脚本化,真实环境会接 LLM)
    setTimeout(() => {
      const lower = input.toLowerCase();
      let agentReply = '';
      if (lower.includes('数据') || lower.includes('计算')) {
        agentReply = '已为您调取相关数据。基于本议题的多目标影响矩阵,建议从「营收」「毛利」「良率」三个维度切入分析。需要我把这段整理成一段群发言吗?';
      } else if (lower.includes('质疑') || lower.includes('风险') || lower.includes('担心')) {
        agentReply = '您的顾虑合理。我从历史议题中找到 2 个相似案例:#1247 / #1199 都遇到过类似冲突,处置方式可作参考。是否要把这两个案例引用进群发言?';
      } else if (lower.includes('草稿') || lower.includes('帮我写') || lower.includes('代我') || lower.includes('替我')) {
        const generated = `基于您刚才的指示和本议题的上下文,我准备这样在群里发言:\n\n"建议结合 #1247 的处置经验,重点关注良率和客户关系两个维度。请财务核对违约金口径,质量经理评估前 100 套加严检验的可行性。"`;
        agentReply = generated;
        setDraft(generated.split('\n\n')[1].replace(/"/g, ''));
      } else {
        agentReply = '理解了。我会在您的发言里体现这一点。您可以告诉我:1) 让我整理成 Agent 发言代您发出,2) 您本人发,我提供数据支撑。';
      }
      setConversation(prev => [...prev, { from: 'agent', text: agentReply }]);
    }, 600);
    setInput('');
  };

  const rounds = Math.ceil(conversation.length / 2);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(30,42,58,0.5)', zIndex: 130,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 680, height: '85vh', background: C.white, borderRadius: 8,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(30,42,58,0.2)',
      }}>
        <div style={{
          padding: '14px 18px', borderBottom: `1px solid ${C.greyLight}`,
          background: C.bgLight,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 10, color: C.accent, fontWeight: 700, letterSpacing: 2, marginBottom: 3 }}>
              🔒  私  密 · 仅 您 可 见
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>
              与我的 Agent 沟通
            </div>
            <div style={{ fontSize: 10, color: C.grey, marginTop: 2 }}>
              本对话不会出现在议题群中,他人也无法看到这条沟通的存在
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 22, color: C.grey,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: C.bgLight }}>
          {conversation.map((turn, i) => {
            const isAgent = turn.from === 'agent';
            return (
              <div key={i} style={{
                display: 'flex', gap: 8, marginBottom: 10,
                justifyContent: isAgent ? 'flex-start' : 'flex-end',
              }}>
                {isAgent && (
                  <div style={{
                    width: 28, height: 28, flexShrink: 0,
                    background: C.primary, color: C.white, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                  }}>A</div>
                )}
                <div style={{
                  maxWidth: '80%',
                  padding: '8px 12px',
                  background: isAgent ? C.white : C.accentBg,
                  border: `1px solid ${isAgent ? C.greyLight : C.accent}`,
                  borderRadius: 6,
                  fontSize: 12, lineHeight: 1.6,
                  color: C.primary, whiteSpace: 'pre-wrap',
                }}>
                  {turn.text}
                </div>
                {!isAgent && (
                  <div style={{
                    width: 28, height: 28, flexShrink: 0,
                    background: C.accent, color: C.white, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                  }}>主</div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          padding: 12, borderTop: `1px solid ${C.greyLight}`, background: C.white,
        }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="和您的 Agent 说点什么... 可以让它「帮我起草发言」、「调取数据」、「评估风险」等。Ctrl+Enter 发送。"
              rows={2}
              style={{
                flex: 1, padding: 8, border: `1px solid ${C.greyLight}`, borderRadius: 4,
                fontSize: 12, fontFamily: 'inherit', resize: 'none', outline: 'none',
                color: C.primary,
              }}
            />
            <button onClick={handleSend} disabled={!input.trim()} style={{
              background: input.trim() ? C.primary : C.greyLight,
              color: C.white, border: 'none', borderRadius: 4,
              padding: '0 14px', fontSize: 12, fontWeight: 700,
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
            }}>发送</button>
          </div>

          <div style={{
            paddingTop: 10, borderTop: `1px dashed ${C.greyLight}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            gap: 8, flexWrap: 'wrap',
          }}>
            <div style={{ fontSize: 10, color: C.grey, fontStyle: 'italic' }}>
              沟通完毕后,选一种方式把对话结论发到议题群里 ↓
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => onPublishAsAgent(
                  draft || `(基于私聊敲定的内容,共 ${rounds} 轮)我的 Agent 综合分析了上下文,建议从历史议题经验出发,重点关注风险和数据口径。`
                )}
                disabled={conversation.length < 3}
                style={{
                  background: conversation.length >= 3 ? C.primary : C.greyLight,
                  color: C.white, border: 'none',
                  padding: '8px 14px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                  cursor: conversation.length >= 3 ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                }}
              >让 Agent 替我发到群里 →</button>
              <button
                onClick={() => onPublishAsOwner(
                  draft || `(我本人发言,基于刚才与 Agent 沟通的结论)`
                )}
                disabled={conversation.length < 3}
                style={{
                  background: 'transparent',
                  color: conversation.length >= 3 ? C.accent : C.grey,
                  border: `1px solid ${conversation.length >= 3 ? C.accent : C.greyLight}`,
                  padding: '8px 14px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                  cursor: conversation.length >= 3 ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                }}
              >我本人发到群里 ◆</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 议题转发面板
// ============================================================
function ForwardModal({ topic, currentUser, onForward, onClose }) {
  const [targetLevel, setTargetLevel] = useState('上级');
  const [carryContext, setCarryContext] = useState(true);

  // 推断转发对象
  const levelOptions = [
    { id: '上级', label: '转发给我的直接上级', desc: '保持跨级隔离,符合数据安全要求' },
    { id: '同级', label: '转发给同级岗位', desc: '横向协同,如另一个基地总经理' },
    { id: '下级', label: '下沉到我的下级', desc: '决策落地,工厂或产线层执行' },
  ];

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(30,42,58,0.5)', zIndex: 125,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 540, background: C.white, borderRadius: 8,
        overflow: 'hidden', boxShadow: '0 10px 40px rgba(30,42,58,0.2)',
      }}>
        <div style={{
          padding: '14px 18px', borderBottom: `1px solid ${C.greyLight}`,
          background: C.accentBg,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ fontSize: 10, color: C.accent, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>
              转  发  议  题
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>
              ↗ 转发 {topic.id} · {topic.title}
            </div>
            <div style={{ fontSize: 10, color: C.grey, marginTop: 4, lineHeight: 1.5 }}>
              跨级隔离:本议题群无法直接拉跨级人员,但可通过转发把背景传递到目标层级新议题
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 22, color: C.grey,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>×</button>
        </div>

        <div style={{ padding: 18 }}>
          <div style={{ fontSize: 10, color: C.grey, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>
            转  发  方  向
          </div>
          {levelOptions.map(opt => (
            <label key={opt.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              padding: 10, marginBottom: 6, cursor: 'pointer',
              border: `1px solid ${targetLevel === opt.id ? C.accent : C.greyLight}`,
              background: targetLevel === opt.id ? C.accentBg : C.white,
              borderRadius: 4,
            }}>
              <input type="radio" checked={targetLevel === opt.id}
                onChange={() => setTargetLevel(opt.id)} />
              <div>
                <div style={{ fontSize: 12, color: C.primary, fontWeight: 700 }}>{opt.label}</div>
                <div style={{ fontSize: 10, color: C.grey, marginTop: 2 }}>{opt.desc}</div>
              </div>
            </label>
          ))}

          <div style={{ marginTop: 14, marginBottom: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={carryContext}
                onChange={e => setCarryContext(e.target.checked)} />
              <span style={{ fontSize: 11, color: C.primary }}>
                携带本议题的决策摘要 + 关键数据(推荐)
              </span>
            </label>
            <div style={{ fontSize: 10, color: C.grey, marginTop: 4, paddingLeft: 24 }}>
              不携带:对方只看到议题号和标题,需要重新讨论;<br />
              携带:对方看到本议题已达成的共识 + 多目标影响 + 关联议题
            </div>
          </div>

          <div style={{
            padding: 10, background: C.bgLight, borderRadius: 4,
            fontSize: 10, color: C.grey, lineHeight: 1.6,
          }}>
            转发后,系统将自动:<br />
            <span style={{ color: C.primary }}>1. 在目标群组创建新议题(继承议题号 + 后缀)</span><br />
            <span style={{ color: C.primary }}>2. 自动按目标层级的金额规则筛选群成员</span><br />
            <span style={{ color: C.primary }}>3. 在原议题和新议题之间建立「转发关联」</span>
          </div>
        </div>

        <div style={{
          padding: 12, borderTop: `1px solid ${C.greyLight}`, background: C.bgLight,
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <button onClick={onClose} style={{
            background: C.white, color: C.grey, border: `1px solid ${C.greyLight}`,
            padding: '8px 14px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
            fontFamily: 'inherit',
          }}>取消</button>
          <button onClick={() => { onForward(targetLevel, carryContext); onClose(); }} style={{
            background: C.primary, color: C.white, border: 'none',
            padding: '8px 14px', borderRadius: 4, fontSize: 11, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>↗ 转发</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 消息推演展开(每条 Agent 消息底部 ▼ 展开)
// ============================================================
function MessageReasoning({ reasoning }) {
  const [open, setOpen] = useState(false);
  const r = reasoning || DEFAULT_REASONING;
  return (
    <div style={{ marginTop: 6 }}>
      <button onClick={() => setOpen(!open)} style={{
        background: 'transparent', border: 'none',
        color: C.grey, fontSize: 10, cursor: 'pointer',
        padding: '2px 0', fontFamily: 'inherit', display: 'inline-flex',
        alignItems: 'center', gap: 4,
      }}
        onMouseEnter={e => e.currentTarget.style.color = C.accent}
        onMouseLeave={e => e.currentTarget.style.color = C.grey}
      >
        {open ? '▼' : '▶'} 查看推演详情
      </button>
      {open && (
        <div style={{
          marginTop: 6, padding: 10,
          background: C.bgLight, border: `1px solid ${C.greyLight}`,
          borderLeft: `3px solid ${C.accent}`, borderRadius: 4,
          fontSize: 11, color: C.primaryLight, lineHeight: 1.6,
        }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: C.grey, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>
              数  据  源
            </div>
            {r.dataSources.map((d, i) => (
              <div key={i} style={{ paddingLeft: 8 }}>· {d}</div>
            ))}
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: C.grey, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>
              规  则  /  规  范
            </div>
            {r.rules.map((d, i) => (
              <div key={i} style={{ paddingLeft: 8 }}>· {d}</div>
            ))}
          </div>
          <div style={{ marginBottom: r.references && r.references.length ? 8 : 0 }}>
            <div style={{ fontSize: 9, color: C.grey, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>
              推  理  步  骤
            </div>
            {r.steps.map((d, i) => (
              <div key={i} style={{
                paddingLeft: 4, display: 'flex', gap: 6, alignItems: 'flex-start',
                marginBottom: 2,
              }}>
                <span style={{
                  flexShrink: 0, width: 14, height: 14, borderRadius: '50%',
                  background: C.primary, color: C.white,
                  fontSize: 8, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: 2,
                }}>{i + 1}</span>
                <span>{d}</span>
              </div>
            ))}
          </div>
          {r.references && r.references.length > 0 && (
            <div>
              <div style={{ fontSize: 9, color: C.grey, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>
                引  用  历  史
              </div>
              {r.references.map((d, i) => (
                <div key={i} style={{ paddingLeft: 8, color: C.accent }}>⟲ {d}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 人机内部沟通(主人与自己 Agent 私聊后,Agent 才在群里发言)
// ============================================================
function NegotiationModal({ negotiation, agentTitle, ownerTitle, onClose }) {
  if (!negotiation || negotiation.length === 0) return null;
  const rounds = Math.ceil(negotiation.length / 2);
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(30,42,58,0.5)', zIndex: 120,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 640, maxHeight: '85vh', background: C.white, borderRadius: 8,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(30,42,58,0.2)',
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${C.greyLight}`,
          background: C.accentBg,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: C.accent, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>
              人  &nbsp; 机  &nbsp; 内  &nbsp; 部  &nbsp; 沟  &nbsp; 通
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.primary, marginBottom: 4 }}>
              💬 {ownerTitle || '主人'} 与自己的 {agentTitle || 'Agent'} 来回沟通 {rounds} 轮
            </div>
            <div style={{ fontSize: 11, color: C.primaryLight, lineHeight: 1.5 }}>
              群里那条「{ownerTitle || '主人'}已确认」的发言,背后是这样敲定的:
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 22, color: C.grey,
            cursor: 'pointer', marginLeft: 12, fontFamily: 'inherit',
          }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: C.bgLight }}>
          {negotiation.map((turn, i) => {
            const isAgent = turn.from === 'agent';
            return (
              <div key={i} style={{
                display: 'flex', gap: 8, marginBottom: 12,
                justifyContent: isAgent ? 'flex-start' : 'flex-end',
              }}>
                {isAgent && (
                  <div style={{
                    width: 28, height: 28, flexShrink: 0,
                    background: C.primary, color: C.white, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                  }}>A</div>
                )}
                <div style={{
                  maxWidth: '75%',
                  padding: '8px 12px',
                  background: isAgent ? C.white : C.accentBg,
                  border: `1px solid ${isAgent ? C.greyLight : C.accent}`,
                  borderRadius: 6,
                  fontSize: 12, lineHeight: 1.6,
                  color: C.primary,
                }}>
                  <div style={{
                    fontSize: 9, fontWeight: 700,
                    color: isAgent ? C.primary : C.accent,
                    marginBottom: 4, letterSpacing: 0.5,
                  }}>
                    第 {Math.floor(i / 2) + 1} 轮 · {isAgent ? `${agentTitle || 'Agent'}` : `${ownerTitle || '主人'}`}
                  </div>
                  {turn.text}
                </div>
                {!isAgent && (
                  <div style={{
                    width: 28, height: 28, flexShrink: 0,
                    background: C.accent, color: C.white, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                  }}>主</div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          padding: 12, borderTop: `1px solid ${C.greyLight}`, background: C.white,
          fontSize: 11, color: C.primaryLight, fontStyle: 'italic', textAlign: 'center',
        }}>
          ↑ 经过以上 {rounds} 轮沟通,Agent 在议题群中发出最终版本
        </div>

        <div style={{
          padding: 14, borderTop: `1px solid ${C.greyLight}`, background: C.bgLight,
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <button onClick={onClose} style={{
            background: C.primary, color: C.white, border: 'none',
            padding: '8px 20px', borderRadius: 4, fontSize: 12, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>关闭</button>
        </div>
      </div>
    </div>
  );
}

// 入口 chip:在消息头部 SourceBadge 旁显示
function NegotiationChip({ negotiation, onClick }) {
  if (!negotiation || negotiation.length === 0) return null;
  const rounds = Math.ceil(negotiation.length / 2);
  return (
    <button onClick={onClick} style={{
      background: C.accent, color: C.white, border: 'none',
      padding: '2px 8px', borderRadius: 3,
      fontSize: 10, fontWeight: 700, cursor: 'pointer',
      marginLeft: 6, fontFamily: 'inherit',
      display: 'inline-flex', alignItems: 'center', gap: 3,
    }}
      onMouseEnter={e => e.currentTarget.style.background = C.primary}
      onMouseLeave={e => e.currentTarget.style.background = C.accent}
    >
      💬 {rounds} 轮人机沟通 →
    </button>
  );
}

// ============================================================
// 方案推演路径图(水平节点流程图)
// ============================================================
function ReasoningPath({ path }) {
  const [openIdx, setOpenIdx] = useState(null);
  if (!path || !path.nodes || path.nodes.length === 0) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      <SectionLabel>推  演  路  径  图</SectionLabel>
      <div style={{ fontSize: 10, color: C.grey, marginBottom: 10, fontStyle: 'italic' }}>
        点击任一节点 ▼ 展开查看该节点的输入数据、处理逻辑、输出结果
      </div>

      {/* 水平节点链 */}
      <div style={{
        display: 'flex', alignItems: 'stretch', gap: 0,
        overflowX: 'auto', paddingBottom: 4,
      }}>
        {path.nodes.map((n, i) => (
          <React.Fragment key={n.id}>
            <div
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              style={{
                flex: 1, minWidth: 110,
                padding: 10,
                background: openIdx === i ? C.accentBg : C.white,
                border: `1px solid ${openIdx === i ? C.accent : C.greyLight}`,
                borderRadius: 4, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}
            >
              <div style={{
                fontSize: 9, color: C.accent, fontWeight: 700, letterSpacing: 1,
              }}>
                {i + 1}. {n.label}
              </div>
              <div style={{ fontSize: 11, color: C.primary, fontWeight: 700, lineHeight: 1.3 }}>
                {n.short}
              </div>
              <div style={{ fontSize: 9, color: C.grey, marginTop: 2 }}>
                {openIdx === i ? '▼ 收起' : '▶ 展开详情'}
              </div>
            </div>
            {i < path.nodes.length - 1 && (
              <div style={{
                display: 'flex', alignItems: 'center', padding: '0 4px',
                color: C.grey, fontSize: 16, fontWeight: 700,
              }}>→</div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 选中节点的详情 */}
      {openIdx !== null && (
        <div style={{
          marginTop: 12, padding: 14,
          background: C.bgLight, border: `1px solid ${C.greyLight}`,
          borderLeft: `4px solid ${C.accent}`, borderRadius: 4,
        }}>
          <div style={{
            fontSize: 10, color: C.accent, fontWeight: 700, letterSpacing: 1, marginBottom: 8,
          }}>
            节点 {openIdx + 1}:{path.nodes[openIdx].label} · {path.nodes[openIdx].short}
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: C.grey, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
              输  入  数  据
            </div>
            {path.nodes[openIdx].inputs.map((d, i) => (
              <div key={i} style={{ fontSize: 11, color: C.primary, paddingLeft: 8, lineHeight: 1.6 }}>
                · {d}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: C.grey, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
              处  理  逻  辑
            </div>
            <div style={{
              fontSize: 11, color: C.primaryLight, paddingLeft: 8,
              lineHeight: 1.6, fontStyle: 'italic',
            }}>
              {path.nodes[openIdx].logic}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 9, color: C.grey, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
              输  出  结  果
            </div>
            {path.nodes[openIdx].outputs.map((d, i) => (
              <div key={i} style={{
                fontSize: 11, color: C.primary, paddingLeft: 8, lineHeight: 1.6,
                fontWeight: 500,
              }}>
                → {d}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CEO 驾驶舱
// ============================================================
function CeoCockpit({ currentUser, onEnterRoom, onSelectTopic }) {
  const pending = TOPICS.filter(t => t.target === 'u_001' && t.status === 'PENDING');

  return (
    <div style={{
      minHeight: '100vh', background: C.bgLight, color: C.primary, fontFamily: FONT,
    }}>
      {/* Header */}
      <div style={{
        background: C.primary, color: C.white, padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40, height: 40, background: C.accent, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 16,
          }}>{currentUser.initial}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{currentUser.title}</div>
            <div style={{ fontSize: 11, color: C.grey, marginTop: 2 }}>权限范围:{currentUser.scope}</div>
          </div>
        </div>
        <button onClick={onEnterRoom} style={{
          background: C.accent, color: C.white, border: 'none',
          padding: '8px 16px', borderRadius: 4, fontSize: 12, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>进入决策室 →</button>
      </div>

      <div style={{ padding: '20px 24px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.primary, margin: 0, marginBottom: 4 }}>
            集团战略驾驶舱
          </h1>
          <div style={{ fontSize: 12, color: C.primaryLight }}>
            实时监测年度目标 · 全局议题热力 · 战略级决策入口
          </div>
        </div>

        {/* 5 KPI */}
        <div style={{ marginBottom: 24 }}>
          <SectionLabel>2 0 2 6  年  度  目  标  进  度</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {Object.entries(GOALS).map(([k, g]) => {
              const lvl = g.level;
              const borderColor = lvl === 'critical' ? C.accent
                : lvl === 'warning' ? C.accent : C.primary;
              return (
                <div key={k} style={{
                  padding: 16, background: C.white, borderRadius: 8,
                  borderTop: `4px solid ${borderColor}`,
                  boxShadow: '0 1px 3px rgba(30,42,58,0.05)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: C.primaryLight, fontWeight: 500 }}>
                      {g.name}
                    </span>
                    {lvl !== 'normal' && (
                      <span style={{
                        fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 700,
                        background: C.accentBg, color: C.accent,
                      }}>{lvl === 'critical' ? '严重' : '偏离'}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                    <span style={{ fontSize: 24, fontWeight: 700, color: C.primary }}>
                      {g.actual}
                    </span>
                    <span style={{ fontSize: 12, color: C.grey }}>{g.unit}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.grey, marginBottom: 8 }}>
                    目标 {g.target}{g.unit}
                  </div>
                  <div style={{ height: 6, background: C.greyLight, borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{
                      width: `${Math.min(g.progress, 1) * 100}%`, height: '100%',
                      background: borderColor,
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: C.grey }}>
                      完成 {(g.progress * 100).toFixed(0)}%
                    </span>
                    {g.deviation !== 0 && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: lvl === 'normal' ? C.primary : C.accent }}>
                        {g.deviation > 0 ? '+' : ''}{g.deviation}{k === 'inventory' ? ' 天' : 'pt'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 两栏:告警 + 待拍板 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16, marginBottom: 24 }}>
          <div>
            <SectionLabel>系  统  自  动  告  警 ({GOAL_ALERTS.length})</SectionLabel>
            {GOAL_ALERTS.map(a => (
              <div key={a.id}
                onClick={() => a.topicId && onSelectTopic(a.topicId)}
                style={{
                  padding: 12, background: C.white, borderRadius: 6,
                  border: `1px solid ${C.accent}`,
                  borderLeft: `4px solid ${C.accent}`,
                  cursor: a.topicId ? 'pointer' : 'default', marginBottom: 8,
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{
                    fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 700,
                    background: C.accentBg, color: C.accent,
                  }}>{a.severity === 'critical' ? '严重' : '警告'}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 4 }}>
                  {a.title}
                </div>
                <div style={{ fontSize: 11, color: C.primaryLight, lineHeight: 1.5 }}>
                  {a.desc}
                </div>
                {a.topicId && (
                  <div style={{ marginTop: 6, fontSize: 11, color: C.accent }}>
                    → 关联议题 {a.topicId}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div>
            <SectionLabel>等  您  拍  板 ({pending.length})</SectionLabel>
            {pending.map(t => (
              <div key={t.id} onClick={() => onSelectTopic(t.id)} style={{
                padding: 14, background: C.white, borderRadius: 6,
                border: `1px solid ${C.accent}`, borderLeft: `4px solid ${C.accent}`,
                cursor: 'pointer', marginBottom: 8,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: C.grey, fontFamily: 'monospace' }}>
                    {t.id} · {TOPIC_LEVELS[t.level]?.label}
                  </span>
                  <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3,
                                 background: C.accentBg, color: C.accent, fontWeight: 700 }}>
                    需拍板
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 8, lineHeight: 1.4 }}>
                  {t.title}
                </div>
                <div style={{ fontSize: 11, color: C.primaryLight, marginBottom: 8, lineHeight: 1.5 }}>
                  {t.summary}
                </div>
                {t.impact && (
                  <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: `1px dashed ${C.greyLight}` }}>
                    <span style={{ fontSize: 10 }}>
                      <span style={{ color: C.grey }}>营收 </span>
                      <strong style={{ color: C.primary }}>{t.impact.revenue}</strong>
                    </span>
                    {t.impact.yield && (
                      <span style={{ fontSize: 10 }}>
                        <span style={{ color: C.grey }}>良率 </span>
                        <strong style={{ color: t.impact.risk?.includes('yield') ? C.accent : C.primary }}>
                          {t.impact.yield}
                        </strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4 基地 */}
        <div style={{ marginBottom: 24 }}>
          <SectionLabel>4  大  基  地  营  收  分  布</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {BASES.map(b => (
              <div key={b.id} style={{
                padding: 14, background: C.white, borderRadius: 6,
                border: `1px solid ${C.greyLight}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>{b.name}</span>
                  <span style={{ fontSize: 10, color: C.grey }}>{b.region}</span>
                </div>
                <div style={{ fontSize: 11, color: C.primaryLight, marginBottom: 8 }}>{b.product}</div>
                <div style={{ fontSize: 10, color: C.grey, lineHeight: 1.6 }}>
                  营收(目标/实际)<br />
                  <strong style={{ color: C.primary, fontSize: 13 }}>{b.revenue}</strong>
                  <br />
                  良率 <strong style={{ color: C.primary }}>{b.yield}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          padding: 14, background: C.accentBg, border: `1px solid ${C.accent}`,
          borderRadius: 6, fontSize: 12, color: C.primary, lineHeight: 1.6,
        }}>
          <strong>操作提示</strong>:点告警或待拍板议题 → 进入议题详情;点「进入决策室 →」查看全部议题。
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 主人发言输入框 + @ 联想
// ============================================================
function InputBar({ currentUser, onSend }) {
  const [text, setText] = useState('');
  const [showMen, setShowMen] = useState(false);
  const [filter, setFilter] = useState('');
  const [atPos, setAtPos] = useState(-1);
  const ref = useRef(null);

  const handleChange = (e) => {
    const t = e.target.value;
    setText(t);
    const pos = e.target.selectionStart;
    let ap = -1;
    for (let i = pos - 1; i >= 0; i--) {
      if (t[i] === '@') {
        if (i === 0 || t[i - 1] === ' ' || t[i - 1] === '\n') ap = i;
        break;
      }
      if (t[i] === ' ' || t[i] === '\n') break;
    }
    if (ap !== -1) {
      const f = t.slice(ap + 1, pos);
      if (!f.includes(' ') && !f.includes('\n')) {
        setFilter(f); setAtPos(ap); setShowMen(true); return;
      }
    }
    setShowMen(false);
  };

  const handleSelect = (r) => {
    const before = text.slice(0, atPos);
    const after = text.slice(atPos + 1 + filter.length);
    const nt = before + `@${r.key} ` + after;
    setText(nt); setShowMen(false);
    setTimeout(() => {
      if (ref.current) {
        ref.current.focus();
        const np = atPos + r.key.length + 2;
        ref.current.setSelectionRange(np, np);
      }
    }, 0);
  };

  const handleSend = () => {
    if (!text.trim()) return;
    const mr = /@(\S+)/g;
    const ms = [];
    let m;
    while ((m = mr.exec(text)) !== null) {
      if (!ms.includes(m[1])) ms.push(m[1]);
    }
    onSend(text, ms);
    setText('');
  };

  const filtered = MENTIONABLE.filter(r =>
    !filter || r.key.includes(filter) || r.title.includes(filter)
  );

  return (
    <div style={{
      borderTop: `1px solid ${C.greyLight}`, padding: 12, background: C.bgLight,
      position: 'sticky', bottom: 0,
    }}>
      <div style={{ fontSize: 10, color: C.grey, fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>
        ◆ 以 您 本 人 ({currentUser.title}) 身 份 发 言
      </div>
      <div style={{ position: 'relative' }}>
        {showMen && filtered.length > 0 && (
          <div style={{
            position: 'absolute', bottom: '100%', left: 0, marginBottom: 4,
            background: C.white, border: `1px solid ${C.greyLight}`, borderRadius: 6,
            boxShadow: '0 4px 12px rgba(30,42,58,0.1)', minWidth: 220,
            maxHeight: 240, overflowY: 'auto', zIndex: 50,
          }}>
            <div style={{
              padding: '6px 10px', fontSize: 10, color: C.grey, fontWeight: 700,
              background: C.bgLight, borderBottom: `1px solid ${C.greyLight}`,
            }}>选择角色 ({filtered.length})</div>
            {filtered.map(r => (
              <div key={r.key} onClick={() => handleSelect(r)} style={{
                padding: '8px 10px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: 8, borderBottom: `1px solid ${C.bgLight}`,
              }}
                onMouseEnter={e => e.currentTarget.style.background = C.accentBg}
                onMouseLeave={e => e.currentTarget.style.background = C.white}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: r.type === 'human' ? C.accent : C.primary,
                  color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                }}>{r.initial}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: C.primary, fontWeight: 500 }}>{r.title}</div>
                  <div style={{ fontSize: 10, color: C.grey }}>{r.type === 'human' ? '人类角色' : 'Agent'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <textarea ref={ref} value={text} onChange={handleChange}
            onKeyDown={e => {
              if (e.key === 'Escape' && showMen) { setShowMen(false); return; }
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSend(); }
            }}
            placeholder="输入 @ 提及某个角色。Ctrl+Enter 发送。"
            rows={2}
            style={{
              flex: 1, padding: 8, border: `1px solid ${C.greyLight}`, borderRadius: 4,
              fontSize: 12, fontFamily: 'inherit', resize: 'none', outline: 'none', color: C.primary,
            }} />
          <button onClick={handleSend} disabled={!text.trim()} style={{
            background: text.trim() ? C.primary : C.greyLight,
            color: C.white, border: 'none', borderRadius: 4,
            padding: '0 16px', fontSize: 12, fontWeight: 700,
            cursor: text.trim() ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
          }}>发送</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 主人 ↔ Agent 私聊面板(双 Tab)
// Tab 1: 以本人身份直接发言(InputBar)
// Tab 2: 先和我的 Agent 沟通,完成后选「Agent 发」或「本人发」
// 私聊内容只有主人可见,议题群里看不到
// ============================================================
function BottomComposer({ currentUser, onSendAsOwner }) {
  const [mode, setMode] = useState('direct'); // 'direct' | 'private'
  const [text, setText] = useState('');
  
  // 私聊模式状态
  const [chat, setChat] = useState([
    { from: 'agent', text: `您好,我是您的 ${currentUser.title} Agent。这条议题您想怎么参与?可以告诉我您的初步想法,我帮您整理一版发言草稿。` }
  ]);
  const [draft, setDraft] = useState('');
  const [finalText, setFinalText] = useState('');

  // 直接发送
  const handleSendDirect = () => {
    if (!text.trim()) return;
    onSendAsOwner(text, []);
    setText('');
  };

  // 私聊模式下发送消息给Agent
  const handleSendToAgent = () => {
    if (!draft.trim()) return;
    const newChat = [...chat, { from: 'owner', text: draft }];
    // Mock Agent回应
    const agentReply = mockAgentReply(draft, currentUser.title);
    newChat.push({ from: 'agent', text: agentReply });
    setChat(newChat);
    setDraft('');
    setFinalText(extractDraftFromAgentReply(agentReply) || draft);
  };

  // 从私聊发布到群里
  const handlePublishFromPrivate = () => {
    if (!finalText.trim()) return;
    onSendAsOwner(finalText, []);
    // 重置状态
    setChat([
      { from: 'agent', text: `您好,我是您的 ${currentUser.title} Agent。这条议题您想怎么参与?` }
    ]);
    setDraft('');
    setFinalText('');
    setMode('direct');
  };

  return (
    <div style={{
      borderTop: `1px solid ${C.greyLight}`,
      background: C.bgLight,
    }}>
      {/* 模式切换 */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${C.greyLight}`,
        background: C.white,
      }}>
        <button onClick={() => setMode('direct')} style={{
          flex: 1, padding: '10px 14px', cursor: 'pointer',
          background: mode === 'direct' ? C.white : C.bgLight,
          border: 'none', borderBottom: mode === 'direct' ? `2px solid ${C.accent}` : '2px solid transparent',
          fontSize: 12, fontWeight: 700,
          color: mode === 'direct' ? C.primary : C.grey,
          fontFamily: 'inherit',
        }}>
          ◆ 直接发言
        </button>
        <button onClick={() => setMode('private')} style={{
          flex: 1, padding: '10px 14px', cursor: 'pointer',
          background: mode === 'private' ? C.white : C.bgLight,
          border: 'none', borderBottom: mode === 'private' ? `2px solid ${C.accent}` : '2px solid transparent',
          fontSize: 12, fontWeight: 700,
          color: mode === 'private' ? C.primary : C.grey,
          fontFamily: 'inherit',
        }}>
          🔒 与Agent私聊
          <span style={{ fontSize: 9, color: C.grey, marginLeft: 4, fontWeight: 400 }}>
            (其他人看不到)
          </span>
        </button>
      </div>

      {mode === 'direct' ? (
        /* 直接发送模式 */
        <div style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSendDirect();
                }
              }}
              placeholder="输入您的意见...（Ctrl+Enter 发送）"
              rows={2}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: `1px solid ${C.greyLight}`,
                borderRadius: 6,
                fontSize: 13,
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                color: C.primary,
              }}
            />
            <button
              onClick={handleSendDirect}
              disabled={!text.trim()}
              style={{
                background: text.trim() ? C.primary : C.greyLight,
                color: C.white,
                border: 'none',
                borderRadius: 6,
                padding: '8px 20px',
                fontSize: 13,
                fontWeight: 600,
                cursor: text.trim() ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                height: 'fit-content',
              }}
            >
              发送
            </button>
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: C.grey }}>
            按 Ctrl+Enter 快速发送
          </div>
        </div>
      ) : (
        /* 私聊模式 */
        <div style={{ padding: 12 }}>
          <div style={{
            fontSize: 10, color: C.grey, fontWeight: 700, letterSpacing: 1, marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            🔒 与 您 的 {currentUser.title} A G E N T  私  聊 · 内 容 仅 您 可 见
          </div>

          {/* 私聊气泡区 */}
          <div style={{
            background: C.white, border: `1px solid ${C.greyLight}`, borderRadius: 6,
            padding: 10, maxHeight: 180, overflowY: 'auto', marginBottom: 8,
          }}>
            {chat.map((turn, i) => {
              const isAgent = turn.from === 'agent';
              return (
                <div key={i} style={{
                  display: 'flex', gap: 6, marginBottom: 8,
                  justifyContent: isAgent ? 'flex-start' : 'flex-end',
                }}>
                  {isAgent && (
                    <div style={{
                      width: 22, height: 22, flexShrink: 0,
                      background: C.primary, color: C.white, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700,
                    }}>A</div>
                  )}
                  <div style={{
                    maxWidth: '78%', padding: '6px 10px',
                    background: isAgent ? C.bgLight : C.accentBg,
                    border: `1px solid ${isAgent ? C.greyLight : C.accent}`,
                    borderRadius: 6, fontSize: 11, lineHeight: 1.5, color: C.primary,
                  }}>
                    {turn.text}
                  </div>
                  {!isAgent && (
                    <div style={{
                      width: 22, height: 22, flexShrink: 0,
                      background: C.accent, color: C.white, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700,
                    }}>主</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 私聊输入 */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <textarea 
              value={draft} 
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault(); 
                  handleSendToAgent();
                }
              }}
              placeholder="和 Agent 沟通你的想法...（Ctrl+Enter 发送）"
              rows={2}
              style={{
                flex: 1, padding: 6, border: `1px solid ${C.greyLight}`, borderRadius: 4,
                fontSize: 11, fontFamily: 'inherit', resize: 'none', outline: 'none', color: C.primary,
              }} />
            <button 
              onClick={handleSendToAgent} 
              disabled={!draft.trim()} 
              style={{
                background: draft.trim() ? C.primary : C.greyLight,
                color: C.white, border: 'none', borderRadius: 4,
                padding: '0 12px', fontSize: 11, fontWeight: 700,
                cursor: draft.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
              }}
            >
              发送给 Agent
            </button>
          </div>

          {/* 最终版本编辑区 + 发布按钮 */}
          <div style={{
            background: C.white, border: `1px solid ${C.accent}`, borderRadius: 6, padding: 10,
          }}>
            <div style={{ fontSize: 10, color: C.accent, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
              ↓ 沟 通 完 后  ·  发  到  议  题  群
            </div>
            <textarea 
              value={finalText} 
              onChange={e => setFinalText(e.target.value)}
              placeholder="沟通后,这里会自动填入 Agent 的最新草稿。您可以直接编辑或保留原样。"
              rows={3}
              style={{
                width: '100%', padding: 6, border: `1px solid ${C.greyLight}`, borderRadius: 4,
                fontSize: 11, fontFamily: 'inherit', resize: 'none', outline: 'none', color: C.primary,
                marginBottom: 8,
              }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button 
                onClick={handlePublishFromPrivate} 
                disabled={!finalText.trim()} 
                style={{
                  background: finalText.trim() ? C.accent : C.greyLight,
                  color: C.white, border: 'none', borderRadius: 4,
                  padding: '6px 14px', fontSize: 11, fontWeight: 700,
                  cursor: finalText.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                }}
              >
                发布到议题群
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// Mock Agent回应(简单关键词触发,演示用)
function mockAgentReply(ownerText, ownerTitle) {
  const t = ownerText.toLowerCase();
  if (t.includes('数字') || t.includes('数据') || t.includes('多少') || t.includes('?')) {
    return `好的,我重新核对一下数字。我会查相关 ERP/MES/财务模型的最新数据,然后给您一版修正后的草稿。

建议发言:「基于最新数据,我建议...(待您指示具体方向后补全)」`;
  }
  if (t.includes('保守') || t.includes('稳妥') || t.includes('风险')) {
    return `理解,您倾向保守口径。我把发言调整为强调风险控制和稳妥推进:

「建议先以保守方案启动,前期密切监控关键指标,根据实际情况再决定是否扩大。」`;
  }
  if (t.includes('支持') || t.includes('同意') || t.includes('赞同') || t.includes('可以')) {
    return `好的,我把您的表态整理成正式发言:

「我支持当前方案,从 ${ownerTitle} 的角度看,可执行性和资源配套都没问题,建议尽快落地。」`;
  }
  if (t.includes('反对') || t.includes('不同意') || t.includes('不行')) {
    return `理解您的顾虑。我把反对意见整理成建设性表态:

「我对当前方案有保留意见,主要顾虑是...(请补充具体顾虑点),建议先做小范围试点再推广。」`;
  }
  // 默认
  return `我收到您的指示。基于您的方向,我准备这样表态:

「${ownerText.slice(0, 80)}${ownerText.length > 80 ? '...' : ''}」

您看是否合适?如需调整请告诉我。`;
}

function extractDraftFromAgentReply(reply) {
  // 提取Agent回复里「:」之后的最后一段(假定那是草稿主体)
  const lines = reply.split('\n').filter(l => l.trim());
  for (let i = lines.length - 1; i >= 0; i--) {
    const l = lines[i].trim();
    if (l.startsWith('「') && l.endsWith('」')) return l.slice(1, -1);
  }
  return reply;
}

// InputBar 重命名为 InputBarInner(BottomComposer 内部使用)
// 旧 InputBar 还在,但 BottomComposer 用新的 InputBarInner — 为了简化,直接复用 InputBar 逻辑

function InputBarInner({ currentUser, onSend }) {
  return <InputBar currentUser={currentUser} onSend={onSend} />;
}

// ============================================================
// 议题卡片
// ============================================================
function TopicCard({ topic, isSel, onClick, decided, pCount }) {
  const isDecided = decided.has(topic.id);
  const badge = isDecided ? { t: '已结案', c: C.primary }
    : topic.status === 'PENDING' ? { t: '需拍板', c: C.accent }
    : { t: '进行中', c: C.grey };
  return (
    <div onClick={onClick} style={{
      background: isSel ? C.accentBg : C.white,
      border: `1px solid ${isSel ? C.accent : C.greyLight}`,
      borderRadius: 6, padding: 12, marginBottom: 10, cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: C.grey, fontFamily: 'monospace' }}>{topic.id}</span>
          <TopicLevelBadge level={topic.level} auto={topic.autoTriggered} />
        </div>
        <span style={{
          fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 700,
          border: `1px solid ${badge.c}`, color: badge.c,
        }}>{badge.t}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 6, lineHeight: 1.4 }}>
        {topic.title}
      </div>
      <div style={{ fontSize: 11, color: C.primaryLight, marginBottom: 6, lineHeight: 1.5 }}>
        {topic.summary}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: C.grey, fontStyle: 'italic' }}>
          {topic.messages.length} 条讨论 · {formatMins(topic.mins)}
        </span>
        {pCount > 0 && (
          <span style={{
            fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 700,
            background: C.accentBg, color: C.accent,
          }}>◇ {pCount} 待确认</span>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 关联议题图谱
// ============================================================
function RelatedTopics({ topic, onJump }) {
  if (!topic.related || topic.related.length === 0) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <SectionLabel>关 联 议 题 图 谱</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {topic.related.map((r, i) => (
          <div key={i} onClick={() => onJump(r.id)} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', background: C.bgLight, borderRadius: 4,
            cursor: 'pointer', border: `1px solid transparent`,
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
            <span style={{ color: C.accent, fontWeight: 700 }}>⟲</span>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: C.primary, fontWeight: 700 }}>{r.id}</span>
            <span style={{ fontSize: 11, color: C.primaryLight, flex: 1 }}>{r.title}</span>
            <span style={{ fontSize: 10, color: C.accent, fontStyle: 'italic' }}>{r.rel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 决策室
// ============================================================
function DecisionRoom({ currentUser, initialTopicId, onBackToCockpit }) {
  const cuid = currentUser.id;
  const [topics, setTopics] = useState(TOPICS);
  const [pendings] = useState(INITIAL_PENDINGS);
  const [view, setView] = useState('all');
  const [selId, setSelId] = useState(initialTopicId || TOPICS[0].id);
  const [openProp, setOpenProp] = useState(null);
  const [showPrivateChat, setShowPrivateChat] = useState(false);
  const [showForward, setShowForward] = useState(false);
  const [decided, setDecided] = useState(new Set());
  const [toast, setToast] = useState(null);

  // 群成员 = 按议题金额规则筛选后的核心群成员(实现跨级隔离)
  // 数据里 coreGroup 已经预先按 GROUP_RULES 计算好,这里直接使用
  const getGroupMembers = (topic) => {
    return topic.coreGroup || topic.visible || [];
  };
  const visible = useMemo(() => topics.filter(t => getGroupMembers(t).includes(cuid)), [topics, cuid]);

  const filters = {
    all: () => true,
    pending: t => t.status === 'PENDING' && t.target === cuid && !decided.has(t.id),
    tactical: t => t.level === 'tactical',
    monthly: t => t.level === 'monthly',
    quarterly: t => t.level === 'quarterly',
    annual_alert: t => t.level === 'annual_alert',
  };

  const filtered = visible.filter(filters[view]);
  const sel = topics.find(t => t.id === selId);
  const myPend = pendings.filter(p => p.owner === cuid);
  const counts = Object.fromEntries(
    Object.entries(filters).map(([k, f]) => [k, visible.filter(f).length])
  );

  useEffect(() => {
    if (sel && !getGroupMembers(sel).includes(cuid)) {
      const first = visible[0];
      if (first) setSelId(first.id);
    }
  }, [cuid]);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleSend = (text, mentions) => {
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const newMsg = { type: 'owner', userId: cuid, time: ts, text, mentions, source: 'owner' };
    setTopics(prev => prev.map(t => t.id === selId ? { ...t, messages: [...t.messages, newMsg] } : t));
    showToast(mentions && mentions.length > 0 ? `已发送本人发言,@ ${mentions.length} 个角色` : '已发送本人发言');
  };

  // 主人和 Agent 私聊后,让 Agent 替自己在群里发言
  const handleSendAsAgent = (text) => {
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    // 找到当前用户对应的 Agent role
    const agentRole = currentUser.role.startsWith('mgr_') || currentUser.role.startsWith('vp_') || currentUser.role.startsWith('gm_') || currentUser.role.startsWith('analyst_') || currentUser.role.startsWith('planner_')
      ? currentUser.role : 'mgr_plan';
    const newMsg = { type: 'agent', agent: agentRole, time: ts, text, source: 'auto' };
    setTopics(prev => prev.map(t => t.id === selId ? { ...t, messages: [...t.messages, newMsg] } : t));
    showToast('Agent 已在群里发出您敲定的版本');
  };

  const handleDecide = () => {
    setDecided(prev => new Set([...prev, selId]));
    showToast(`${selId} 已结案`);
  };

  const canDecide = sel && sel.status === 'PENDING' && sel.target === cuid && !decided.has(sel.id);

  const viewItems = [
    { id: 'all', label: '全部议题', count: counts.all },
    { id: 'pending', label: '待我处理', count: counts.pending },
    { id: 'tactical', label: '项目决策', count: counts.tactical },
    { id: 'monthly', label: '月度协调', count: counts.monthly },
    { id: 'quarterly', label: '季度滚动', count: counts.quarterly },
    { id: 'annual_alert', label: '年度告警', count: counts.annual_alert },
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column',
                  background: C.bgLight, color: C.primary, fontFamily: FONT }}>
      {/* Header */}
      <div style={{
        background: C.primary, color: C.white, padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, background: C.accent, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 14,
          }}>{currentUser.initial}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{currentUser.title}</div>
            <div style={{ fontSize: 10, color: C.grey }}>权限范围:{currentUser.scope}</div>
          </div>
        </div>
        {currentUser.role === 'ceo' && (
          <button onClick={onBackToCockpit} style={{
            background: 'transparent', color: C.white, border: `1px solid ${C.primaryLight}`,
            padding: '6px 12px', borderRadius: 4, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
          }}>← 返回驾驶舱</button>
        )}
      </div>

      {/* 紧凑版年度目标 */}
      <div style={{
        background: C.white, borderBottom: `1px solid ${C.greyLight}`, padding: '8px 16px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {Object.entries(GOALS).map(([k, g]) => {
            const lvl = g.level;
            const color = lvl === 'critical' || lvl === 'warning' ? C.accent : C.primary;
            return (
              <div key={k} style={{
                padding: 8, background: C.bgLight, borderRadius: 4,
                borderLeft: `3px solid ${color}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 10, color: C.primaryLight }}>{g.name}</span>
                  {lvl !== 'normal' && (
                    <span style={{ fontSize: 8, color: C.accent, fontWeight: 700 }}>
                      {lvl === 'critical' ? '⚠严重' : '⚠偏离'}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>
                  {g.actual}{g.unit} <span style={{ fontSize: 9, color: C.grey, fontWeight: 400 }}>
                    / {g.target}{g.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 左栏 */}
        <div style={{
          width: 200, background: C.bgGrey, borderRight: `1px solid ${C.greyLight}`,
          flexShrink: 0, overflowY: 'auto',
        }}>
          <div style={{ padding: '12px 14px', fontSize: 10, fontWeight: 700, color: C.grey, letterSpacing: 2 }}>
            我  的  视  野
          </div>
          {viewItems.map(item => (
            <div key={item.id} onClick={() => setView(item.id)} style={{
              position: 'relative', padding: '12px 14px', cursor: 'pointer',
              background: view === item.id ? C.white : 'transparent',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              {view === item.id && (
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: C.accent }} />
              )}
              <span style={{
                fontSize: 12, color: view === item.id ? C.primary : C.primaryLight,
                fontWeight: view === item.id ? 700 : 400,
              }}>{item.label}</span>
              <span style={{
                fontSize: 16, fontWeight: 700,
                color: view === item.id ? C.accent : C.grey,
              }}>{item.count}</span>
            </div>
          ))}
        </div>

        {/* 中栏 */}
        <div style={{
          width: 340, background: C.bgLight, borderRight: `1px solid ${C.greyLight}`,
          flexShrink: 0, display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '10px 14px', background: C.white, borderBottom: `1px solid ${C.greyLight}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <strong style={{ fontSize: 13, color: C.primary }}>
              {viewItems.find(v => v.id === view)?.label}
              <span style={{ color: C.grey, fontWeight: 400, marginLeft: 6 }}>({filtered.length})</span>
            </strong>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: C.grey, fontSize: 12 }}>
                此分类下暂无议题
              </div>
            ) : (
              filtered.map(t => (
                <TopicCard key={t.id} topic={t} isSel={selId === t.id}
                  onClick={() => setSelId(t.id)}
                  decided={decided}
                  pCount={myPend.filter(p => p.topicId === t.id).length} />
              ))
            )}
          </div>
        </div>

        {/* 右栏 */}
        <div style={{ flex: 1, background: C.white, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!sel || !getGroupMembers(sel).includes(cuid) ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: C.grey, fontSize: 12 }}>
              请从左侧选择一个议题
            </div>
          ) : (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                {/* 议题头 */}
                <div style={{ marginBottom: 4 }}>
                  <div style={{ marginBottom: 6 }}>
                    <TopicLevelBadge level={sel.level} auto={sel.autoTriggered} />
                  </div>
                  <h1 style={{ fontSize: 18, fontWeight: 700, color: C.primary, margin: 0, marginBottom: 6 }}>
                    {sel.id} · {sel.title}
                  </h1>
                  <div style={{ fontSize: 11, color: C.primaryLight, fontStyle: 'italic' }}>
                    状态:
                    <span style={{
                      fontWeight: 700,
                      color: decided.has(sel.id) ? C.primary
                        : sel.status === 'PENDING' && sel.target === cuid ? C.accent : C.primaryLight,
                    }}>
                      {' '}
                      {decided.has(sel.id) ? '已结案'
                        : sel.status === 'PENDING' && sel.target === cuid ? '等待您拍板'
                        : sel.status === 'PENDING' ? `等待 ${USERS[sel.target]?.title} 拍板`
                        : '进行中'}
                    </span>
                    {sel.creator !== 'system' && (
                      <> · 发起人:{AGENT_INFO[sel.creator]?.title}</>
                    )}
                    {' · '}{formatMins(sel.mins)}
                  </div>
                </div>

                {/* 群成员 Banner(数据安全 + 跨级隔离公示) */}
                {sel.groupTier && (
                  <div style={{ marginTop: 14 }}>
                    <GroupMembersBanner
                      groupTier={sel.groupTier}
                      amountText={sel.amountText}
                      members={getGroupMembers(sel)}
                      forwardChain={sel.forwardChain}
                      onForward={() => setShowForward(true)}
                    />
                  </div>
                )}

                {/* 多目标影响 */}
                {sel.impact && (
                  <div style={{ marginTop: 14 }}>
                    <SectionLabel>对  年  度  目  标  的  影  响</SectionLabel>
                    <ObjectiveGrid impact={sel.impact} />
                  </div>
                )}

                <div style={{ borderTop: `1px solid ${C.greyLight}`, margin: '14px 0' }} />

                {/* 时间线 */}
                <SectionLabel>决  策  过  程</SectionLabel>
                {sel.messages.map((msg, i) => {
                  if (msg.type === 'owner') {
                    const user = USERS[msg.userId];
                    return (
                      <div key={i} style={{
                        display: 'flex', gap: 10, padding: 8, marginBottom: 4, borderRadius: 4,
                        background: C.accentBg, border: `1px solid ${C.accent}`,
                      }}>
                        <div style={{
                          width: 28, height: 28, background: C.accent, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: C.white, fontWeight: 700, fontSize: 12, flexShrink: 0,
                        }}>{user?.initial || '?'}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: C.accent }}>
                              {user?.title}
                            </span>
                            <span style={{ fontSize: 10, color: C.grey }}>{msg.time}</span>
                          </div>
                          <div style={{ fontSize: 12, color: C.primary, lineHeight: 1.6 }}>
                            {renderContent(msg.text, msg.mentions, msg.proposals, setOpenProp)}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  const info = AGENT_INFO[msg.agent];
                  const isVS = msg.agent === 'value_stream';
                  return (
                    <div key={i} style={{
                      display: 'flex', gap: 10, padding: 8, marginBottom: 4, borderRadius: 4,
                      background: isVS ? C.accentBg : 'transparent',
                      border: isVS ? `1px solid ${C.accent}` : 'none',
                    }}>
                      <AgentAvatar agentId={msg.agent} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: isVS ? C.accent : C.primary }}>
                            {info?.title || msg.agent}
                          </span>
                          <span style={{ fontSize: 10, color: C.grey }}>{msg.time}</span>
                        </div>
                        <div style={{ fontSize: 12, color: C.primary, lineHeight: 1.6 }}>
                          {renderContent(msg.text, msg.mentions, msg.proposals, setOpenProp)}
                        </div>
                        <MessageReasoning reasoning={MSG_REASONING[`${sel.id}:${i + 1}`]} />
                      </div>
                    </div>
                  );
                })}

                {/* 结论 */}
                {sel.summary && (
                  <div
                    onClick={sel.proposalId ? () => setOpenProp(sel.proposalId) : undefined}
                    style={{
                      border: `1px solid ${C.accent}`,
                      borderRadius: 6, position: 'relative', overflow: 'hidden',
                      padding: '14px 16px 14px 20px', marginTop: 16, marginBottom: 16,
                      cursor: sel.proposalId ? 'pointer' : 'default',
                    }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
                      background: decided.has(sel.id) ? C.primary : C.accent,
                    }} />
                    <div style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 6,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      color: decided.has(sel.id) ? C.primary : C.accent,
                    }}>
                      <span>{decided.has(sel.id) ? '最 终 决 议' : '当 前 结 论 + 待 拍 板'}</span>
                      {sel.proposalId && (
                        <span style={{ fontSize: 10, color: C.accent, fontWeight: 400 }}>
                          ▣ 点击查看完整方案 →
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 6 }}>
                      ✓ AI+ 共识:{sel.summary}
                    </div>
                    {sel.pending && !decided.has(sel.id) && (
                      <div style={{ fontSize: 13, color: C.primaryLight }}>
                        <strong style={{ color: C.accent }}>暂停</strong> 等您拍板:{sel.pending}
                      </div>
                    )}
                  </div>
                )}

                {canDecide && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    <button onClick={handleDecide} style={{
                      background: C.primary, color: C.white, border: 'none',
                      padding: '8px 16px', borderRadius: 4, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}>批复</button>
                  </div>
                )}

                <RelatedTopics topic={sel} onJump={(id) => setSelId(id)} />
              </div>

              <BottomComposer
                currentUser={currentUser}
                onSendAsOwner={handleSend}
              />
            </>
          )}
        </div>
      </div>

      {openProp && <ProposalModal proposalId={openProp} onClose={() => setOpenProp(null)} />}
      {showForward && sel && (
        <ForwardModal
          topic={sel}
          currentUser={currentUser}
          onForward={(direction, carryContext) => {
            showToast(`议题已转发(方向:${direction},${carryContext ? '带' : '不带'}背景信息)`);
          }}
          onClose={() => setShowForward(false)}
        />
      )}

      {toast && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          background: C.primary, color: C.white, padding: '10px 18px',
          borderRadius: 4, fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 12px rgba(30,42,58,0.15)', zIndex: 200,
        }}>✓ {toast}</div>
      )}
    </div>
  );
}

// ============================================================
// 角色切换器
// ============================================================
function RoleSwitcher({ currentUserId, onSwitch }) {
  const [open, setOpen] = useState(false);
  const cu = USERS[currentUserId];
  return (
    <div style={{ position: 'fixed', top: 14, right: 16, zIndex: 1000 }}>
      <button onClick={() => setOpen(!open)} style={{
        background: 'rgba(255,255,255,0.95)', color: C.primary,
        border: `1px solid ${C.greyLight}`,
        padding: '6px 12px', borderRadius: 6, fontSize: 11,
        cursor: 'pointer', fontWeight: 700,
        boxShadow: '0 2px 8px rgba(30,42,58,0.1)',
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: FONT,
      }}>
        <span style={{
          display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
          background: C.accent,
        }} />
        角色切换 · {cu.title}
        <span style={{ marginLeft: 4, color: C.grey }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 38, right: 0,
          width: 320, maxHeight: 500, overflowY: 'auto',
          background: C.white, borderRadius: 6,
          border: `1px solid ${C.greyLight}`,
          boxShadow: '0 4px 16px rgba(30,42,58,0.15)',
          fontFamily: FONT,
        }}>
          <div style={{
            padding: '8px 12px', fontSize: 10, color: C.grey,
            background: C.bgLight, borderBottom: `1px solid ${C.greyLight}`,
            fontWeight: 700, letterSpacing: 2,
          }}>角  色  切  换  器</div>
          {USER_GROUPS.map(g => (
            <div key={g.label}>
              <div style={{
                padding: '6px 12px', fontSize: 10, color: C.accent,
                background: C.accentBg, fontWeight: 700,
              }}>{g.label}</div>
              {g.ids.map(uid => {
                const u = USERS[uid];
                const active = uid === currentUserId;
                return (
                  <div key={uid} onClick={() => { onSwitch(uid); setOpen(false); }} style={{
                    padding: '8px 12px', cursor: 'pointer',
                    borderLeft: active ? `3px solid ${C.accent}` : '3px solid transparent',
                    background: active ? C.accentBg : C.white,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.bgLight; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = C.white; }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: C.primary, color: C.white,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, flexShrink: 0,
                    }}>{u.initial}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: C.primary, fontWeight: active ? 700 : 500 }}>
                        {u.title}
                      </div>
                      <div style={{ fontSize: 10, color: C.grey, marginTop: 1, lineHeight: 1.3 }}>
                        {u.scope}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 主应用
// ============================================================
export default function App() {
  const [uid, setUid] = useState('u_001');
  const [view, setView] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const user = USERS[uid];
  const effectiveView = view || user.defaultView;

  const switchUser = (newUid) => {
    setUid(newUid);
    setView(null);
    setSelectedTopic(null);
  };

  return (
    <div style={{ position: 'relative', fontFamily: FONT }}>
      <RoleSwitcher currentUserId={uid} onSwitch={switchUser} />

      {effectiveView === 'cockpit' && user.role === 'ceo' ? (
        <CeoCockpit
          currentUser={user}
          onEnterRoom={() => setView('room')}
          onSelectTopic={(tid) => { setView('room'); setSelectedTopic(tid); }}
        />
      ) : (
        <DecisionRoom
          currentUser={user}
          initialTopicId={selectedTopic}
          onBackToCockpit={() => { setView('cockpit'); setSelectedTopic(null); }}
        />
      )}
    </div>
  );
}
