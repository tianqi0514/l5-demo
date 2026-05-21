import React, { useState, useMemo, useRef } from 'react';
import { getIssueData, MOCK_ISSUES, getScopeCounts, getNotifications } from '../mocks/decision';
import type { Issue, Message, DecisionAsset, ResolutionStatus, IssueStatus } from '../types/decision';

// ============================================================
// Color Scheme (same as lithium version)
// ============================================================
const C = {
  primary: '#1E2A3A',
  accent: '#B8860B',
  grey: '#94A3B8',
  primaryLight: '#475569',
  accentBg: '#FEF3D7',
  greyLight: '#E2E8F0',
  bgLight: '#F8F9FB',
  bgGrey: '#EFF1F4',
  white: '#FFFFFF',
};

const FONT = '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';

// ============================================================
// 26 Roles (Retail Organization, 6 Levels)
// ============================================================
const USERS: Record<string, { id: string; title: string; initial: string; level: string; scope: string }> = {
  // L1 Strategic
  u_001: { id: 'u_001', title: 'CEO', initial: 'C', level: '战略层', scope: '全集团 · 4大区 · 3600+门店' },
  // L2 Management
  u_002: { id: 'u_002', title: '运营副总裁', initial: '运', level: '经营层', scope: '集团运营 · 4大区' },
  u_003: { id: 'u_003', title: '营销副总裁', initial: '营', level: '经营层', scope: '集团营销 · 全渠道' },
  u_011: { id: 'u_011', title: '商品副总裁', initial: '商', level: '经营层', scope: '集团商品' },
  u_051: { id: 'u_051', title: '供应链副总裁', initial: '供', level: '经营层', scope: '集团供应链 · 跨区协同' },
  // L3 Execution
  u_012: { id: 'u_012', title: '会员运营经理', initial: '会', level: '执行层', scope: '会员体系 · 3600万会员' },
  u_013: { id: 'u_013', title: '门店拓展经理', initial: '拓', level: '执行层', scope: '新店选址 · 加盟管理' },
  u_014: { id: 'u_014', title: '需求预测分析师', initial: '预', level: '执行层', scope: '12周滚动预测' },
  u_015: { id: 'u_015', title: '物流规划师', initial: '物', level: '执行层', scope: '仓配网络优化' },
  u_004: { id: 'u_004', title: '商品总监', initial: '品', level: '执行层', scope: '商品部 · 选品定价' },
  u_007: { id: 'u_007', title: '财务总监', initial: '财', level: '执行层', scope: '财务部 · 全口径' },
  u_006: { id: 'u_006', title: '品控总监', initial: '控', level: '执行层', scope: '品控部 · 食品安全' },
  u_005: { id: 'u_005', title: '运营总监', initial: '运', level: '执行层', scope: '运营部 · 门店运营' },
  u_009: { id: 'u_009', title: '采购总监', initial: '采', level: '执行层', scope: '采购部 · 全品类' },
  u_052: { id: 'u_052', title: '营销总监', initial: '销', level: '执行层', scope: '营销部 · 全渠道投放' },
  u_053: { id: 'u_053', title: '数据分析师', initial: '数', level: '执行层', scope: '数据部 · 经营分析' },
  // L3.5 Regional
  u_021: { id: 'u_021', title: '华东大区总', initial: '华', level: '区域层', scope: '华东 · 上海/杭州/南京 1200店' },
  u_022: { id: 'u_022', title: '华北大区总', initial: '北', level: '区域层', scope: '华北 · 北京/天津/石家庄 800店' },
  u_023: { id: 'u_023', title: '华南大区总', initial: '南', level: '区域层', scope: '华南 · 广州/深圳/福州 900店' },
  u_024: { id: 'u_024', title: '西南大区总', initial: '西', level: '区域层', scope: '西南 · 成都/重庆/昆明 700店' },
  // L4 City
  u_031: { id: 'u_031', title: '上海城市经理', initial: '上', level: '城市层', scope: '上海 · 380店' },
  u_032: { id: 'u_032', title: '杭州城市经理', initial: '杭', level: '城市层', scope: '杭州 · 210店' },
  u_033: { id: 'u_033', title: '成都城市经理', initial: '成', level: '城市层', scope: '成都 · 180店' },
  u_034: { id: 'u_034', title: '广州城市经理', initial: '广', level: '城市层', scope: '广州 · 160店' },
  // L4.5 Store
  u_041: { id: 'u_041', title: '南京路店店长', initial: '店', level: '门店层', scope: '南京路旗舰店 · 日均GMV 3.2万' },
  u_042: { id: 'u_042', title: '西湖店店长', initial: '店', level: '门店层', scope: '西湖店 · 日均GMV 2.8万' },
  u_043: { id: 'u_043', title: '春熙路店店长', initial: '店', level: '门店层', scope: '春熙路店 · 日均GMV 2.5万' },
};

const USER_GROUPS = [
  { label: '战略层', ids: ['u_001'] },
  { label: '经营层', ids: ['u_002', 'u_003', 'u_011', 'u_051'] },
  { label: '执行层', ids: ['u_012', 'u_013', 'u_014', 'u_015', 'u_004', 'u_007', 'u_006', 'u_005', 'u_009', 'u_052', 'u_053'] },
  { label: '区域层', ids: ['u_021', 'u_022', 'u_023', 'u_024'] },
  { label: '城市层', ids: ['u_031', 'u_032', 'u_033', 'u_034'] },
  { label: '门店层', ids: ['u_041', 'u_042', 'u_043'] },
];

const CURRENT_USER = USERS['u_001'];

// ============================================================
// KPI Dashboard (Retail)
// ============================================================
const GOALS = {
  revenue: { name: '年度营收', target: 85, actual: 62, unit: '亿', progress: 0.729, deviation: -3.2, level: 'warning' as const },
  margin: { name: '毛利率', target: 38.5, actual: 36.8, unit: '%', progress: 0.956, deviation: -1.7, level: 'warning' as const },
  per_sqm: { name: '坪效', target: 2800, actual: 2650, unit: '元/㎡', progress: 0.946, deviation: -150, level: 'warning' as const },
  inventory: { name: '库存周转', target: 22, actual: 26, unit: '天', progress: 0.85, deviation: 4, level: 'warning' as const },
  member_rate: { name: '会员复购率', target: 42, actual: 38.5, unit: '%', progress: 0.917, deviation: -3.5, level: 'critical' as const },
};

const GOAL_ALERTS = [
  { id: 'a1', severity: 'warning' as const, title: 'Q2营收预测低于目标 3.2%', desc: '订单池 58亿,目标 60亿,缺口 2亿', topicId: '#1295' },
  { id: 'a2', severity: 'critical' as const, title: '会员复购率持续低于年度目标', desc: '当前 38.5% vs 目标 42%,预计流失 120万活跃会员', topicId: '#1298' },
  { id: 'a3', severity: 'warning' as const, title: '库存周转天数 26天,高于目标 4天', desc: '主要为坚果和肉脯品类安全库存偏高', topicId: null },
];

const REGIONS = [
  { id: 'r1', name: '华东大区', region: '华东', stores: 1200, revenue: '32 / 24亿', member_rate: '39.2%' },
  { id: 'r2', name: '华北大区', region: '华北', stores: 800, revenue: '19 / 14亿', member_rate: '37.8%' },
  { id: 'r3', name: '华南大区', region: '华南', stores: 900, revenue: '21.5 / 16亿', member_rate: '38.6%' },
  { id: 'r4', name: '西南大区', region: '西南', stores: 700, revenue: '12.5 / 9亿', member_rate: '36.1%' },
];

// ============================================================
// Agent Info
// ============================================================
const AGENT_INFO: Record<string, { initial: string; title: string }> = {
  a_product: { initial: '商', title: '商品选品Agent' },
  a_ops: { initial: '运', title: '门店运营Agent' },
  a_qc: { initial: '品', title: '品控Agent' },
  a_finance: { initial: '财', title: '财务分析Agent' },
  a_mkt: { initial: '营', title: '营销Agent' },
  a_supply: { initial: '供', title: '供应链Agent' },
  a_coord: { initial: '协', title: '协调Agent' },
};

// ============================================================
// Status Helpers
// ============================================================
function statusLabel(status: IssueStatus): { text: string; color: string } {
  switch (status) {
    case 'PENDING_HUMAN': return { text: '需拍板', color: C.accent };
    case 'OPEN': return { text: '进行中', color: C.grey };
    case 'DISCUSSING': return { text: '讨论中', color: C.primary };
    case 'RESOLVED': return { text: '已结案', color: C.primary };
    case 'SUSPENDED': return { text: '已暂停', color: C.grey };
    case 'FROZEN': return { text: '已冻结', color: C.accent };
    default: return { text: status, color: C.grey };
  }
}

function urgencyLabel(urgency: string): { text: string; bg: string; color: string } {
  switch (urgency) {
    case 'critical': return { text: '紧急', bg: '#FEE2E2', color: '#DC2626' };
    case 'urgent': return { text: '加急', bg: C.accentBg, color: C.accent };
    default: return { text: '普通', bg: C.bgGrey, color: C.primaryLight };
  }
}

// ============================================================
// Render message content with @mentions highlighted
// ============================================================
function renderMessageContent(content: string, mentions?: Message['mentions']) {
  if (!mentions || mentions.length === 0) return <span>{content}</span>;

  const parts: React.ReactNode[] = [];
  let lastIdx = 0;

  // Sort mentions by start position
  const sorted = [...mentions].sort((a, b) => a.start - b.start);

  sorted.forEach((m, i) => {
    if (m.start > lastIdx) {
      parts.push(<span key={`t${i}`}>{content.slice(lastIdx, m.start)}</span>);
    }
    const mentionText = content.slice(m.start, m.end);
    parts.push(
      <span key={`m${i}`} style={{ color: C.accent, fontWeight: 700 }}>
        {mentionText}
      </span>
    );
    lastIdx = m.end;
  });

  if (lastIdx < content.length) {
    parts.push(<span key="tail">{content.slice(lastIdx)}</span>);
  }

  return <>{parts}</>;
}

// ============================================================
// Small Components
// ============================================================
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, color: C.grey, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>
      {children}
    </div>
  );
}

function AgentAvatar({ agentId, size = 28 }: { agentId: string; size?: number }) {
  const info = AGENT_INFO[agentId];
  const isCoord = agentId === 'a_coord';
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      background: isCoord ? C.accent : C.primary, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: C.white, fontWeight: 700, fontSize: size <= 22 ? 10 : 12,
    }}>{info?.initial || '?'}</div>
  );
}

function UserAvatar({ userId, size = 28 }: { userId: string; size?: number }) {
  const u = USERS[userId];
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      background: C.accent, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: C.white, fontWeight: 700, fontSize: size <= 22 ? 10 : 12,
    }}>{u?.initial || '?'}</div>
  );
}

// ============================================================
// KPI Dashboard Panel (shown when no issue selected)
// ============================================================
function KpiDashboard({ onSelectAlertTopic }: { onSelectAlertTopic: (id: string) => void }) {
  return (
    <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, color: C.primary, margin: '0 0 16px' }}>
        集团经营驾驶舱
      </h1>

      {/* 5 KPI Cards */}
      <SectionLabel>年 度 目 标 进 度</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {Object.entries(GOALS).map(([k, g]) => {
          const isCritical = g.level === 'critical';
          const borderColor = isCritical ? C.accent : C.primary;
          return (
            <div key={k} style={{
              padding: 16, background: C.white, borderRadius: 8,
              borderTop: `4px solid ${borderColor}`,
              boxShadow: '0 1px 3px rgba(30,42,58,0.05)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: C.primaryLight, fontWeight: 500 }}>{g.name}</span>
                {isCritical && (
                  <span style={{
                    fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 700,
                    background: C.accentBg, color: C.accent,
                  }}>严重</span>
                )}
                {!isCritical && g.level === 'warning' && (
                  <span style={{
                    fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 700,
                    background: C.bgGrey, color: C.primaryLight,
                  }}>偏离</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: C.primary }}>{g.actual}</span>
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
                <span style={{ fontSize: 10, color: C.grey }}>完成 {(g.progress * 100).toFixed(0)}%</span>
                {g.deviation !== 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: g.level === 'critical' ? '#DC2626' : C.accent,
                  }}>
                    {g.deviation > 0 ? '+' : ''}{g.deviation}{k === 'inventory' ? '天' : ''}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two columns: Alerts + Regions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Alerts */}
        <div>
          <SectionLabel>系 统 告 警 ({GOAL_ALERTS.length})</SectionLabel>
          {GOAL_ALERTS.map(a => (
            <div key={a.id}
              onClick={() => a.topicId && onSelectAlertTopic(a.topicId)}
              style={{
                padding: 12, background: C.white, borderRadius: 6,
                border: `1px solid ${C.accent}`,
                borderLeft: `4px solid ${C.accent}`,
                cursor: a.topicId ? 'pointer' : 'default', marginBottom: 8,
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{
                  fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 700,
                  background: a.severity === 'critical' ? '#FEE2E2' : C.accentBg,
                  color: a.severity === 'critical' ? '#DC2626' : C.accent,
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

        {/* Regions */}
        <div>
          <SectionLabel>4 大 区 经 营 分 布</SectionLabel>
          <div style={{ background: C.white, borderRadius: 6, border: `1px solid ${C.greyLight}`, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: C.bgLight }}>
                  {['大区', '门店数', '营收(目标/实际)', '会员复购率'].map(h => (
                    <th key={h} style={{
                      padding: '8px 10px', textAlign: 'left',
                      borderBottom: `1px solid ${C.greyLight}`, fontWeight: 700, color: C.primary, fontSize: 11,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REGIONS.map(r => (
                  <tr key={r.id}>
                    <td style={{ padding: '8px 10px', borderBottom: `1px solid ${C.bgLight}`, fontWeight: 600, color: C.primary }}>
                      {r.name}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: `1px solid ${C.bgLight}`, color: C.primary }}>
                      {r.stores}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: `1px solid ${C.bgLight}`, color: C.primary }}>
                      {r.revenue}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: `1px solid ${C.bgLight}`, color: C.primary }}>
                      {r.member_rate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Message Stream
// ============================================================
function MessageStream({ messages, issue }: { messages: Message[]; issue: Issue }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
      {/* Issue Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 10, color: C.grey, fontFamily: 'monospace' }}>{issue.id}</span>
          {issue.urgency && (
            <span style={{
              fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 700,
              background: urgencyLabel(issue.urgency).bg,
              color: urgencyLabel(issue.urgency).color,
            }}>{urgencyLabel(issue.urgency).text}</span>
          )}
          <span style={{
            fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 700,
            border: `1px solid ${statusLabel(issue.status).color}`,
            color: statusLabel(issue.status).color,
          }}>{statusLabel(issue.status).text}</span>
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: C.primary, margin: '0 0 8px' }}>
          {issue.title}
        </h1>
        <div style={{ fontSize: 12, color: C.primaryLight, lineHeight: 1.6, marginBottom: 8 }}>
          {issue.description}
        </div>
        <div style={{ fontSize: 11, color: C.grey }}>
          发起人: {issue.creatorName || issue.creator_user_id}
          {issue.pendingUserName && (
            <span style={{ marginLeft: 12 }}>
              待决策: <strong style={{ color: C.accent }}>{issue.pendingUserName}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <SectionLabel>决 策 过 程</SectionLabel>
      {messages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: C.grey, fontSize: 12 }}>
          暂无讨论消息
        </div>
      ) : (
        messages.map((msg, i) => {
          const isCoord = msg.author_id === 'a_coord';
          const isConsensus = msg.message_type === 'CONSENSUS';
          const info = AGENT_INFO[msg.author_id];

          return (
            <div key={msg.id || i} style={{
              display: 'flex', gap: 10, padding: 10, marginBottom: 6, borderRadius: 6,
              background: isConsensus ? C.accentBg : C.white,
              border: isConsensus ? `1px solid ${C.accent}` : `1px solid ${C.greyLight}`,
            }}>
              <AgentAvatar agentId={msg.author_id} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: isCoord ? C.accent : C.primary,
                  }}>
                    {msg.author_display}
                    {info && <span style={{ color: C.grey, fontWeight: 400, marginLeft: 4 }}>({info.title})</span>}
                  </span>
                  <span style={{ fontSize: 10, color: C.grey }}>{msg.created_at_display}</span>
                  {msg.is_pinned && (
                    <span style={{
                      fontSize: 9, padding: '1px 5px', borderRadius: 3,
                      background: C.accentBg, color: C.accent, fontWeight: 700,
                    }}>置顶</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: C.primary, lineHeight: 1.7 }}>
                  {renderMessageContent(msg.content, msg.mentions)}
                </div>
                {msg.attached_data && (
                  <div style={{
                    marginTop: 8, padding: 8, background: C.bgLight, borderRadius: 4,
                    fontSize: 11, color: C.primaryLight,
                  }}>
                    {Object.entries(msg.attached_data).map(([k, v]) => (
                      <div key={k}>
                        <span style={{ color: C.grey }}>{k}: </span>
                        <strong style={{ color: C.primary }}>{String(v)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ============================================================
// Decision Assets Panel
// ============================================================
function AssetPanel({ assets }: { assets: DecisionAsset[] }) {
  if (assets.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: C.grey, fontSize: 12 }}>
        暂无决策资产
      </div>
    );
  }

  const typeNames: Record<string, string> = {
    '01': '议题画像',
    '02': '关键权衡',
    '03': '决策依据',
    '04': '决策结论',
    '05': '可复用规则',
  };

  return (
    <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
      <SectionLabel>决 策 资 产 ({assets.length})</SectionLabel>
      {assets.map((asset, i) => (
        <div key={i} style={{
          background: C.white, border: `1px solid ${C.greyLight}`,
          borderRadius: 6, marginBottom: 12, overflow: 'hidden',
        }}>
          <div style={{
            padding: '10px 14px', background: C.bgLight,
            borderBottom: `1px solid ${C.greyLight}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.primary }}>
              {typeNames[asset.type] || asset.typeName}
            </span>
            <span style={{
              fontSize: 10, color: C.accent, fontWeight: 700,
              padding: '2px 6px', background: C.accentBg, borderRadius: 3,
            }}>0{asset.type}</span>
          </div>
          <div style={{ padding: 14 }}>
            {asset.type === '01' && 'content' in asset && (
              <div>
                {(asset.content as any).summary && (
                  <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, marginBottom: 8 }}>
                    {(asset.content as any).summary}
                  </div>
                )}
                {(asset.content as any).tags && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {(asset.content as any).tags.map((tag: string, ti: number) => (
                      <span key={ti} style={{
                        fontSize: 10, padding: '2px 8px',
                        background: C.bgLight, borderRadius: 3, color: C.primaryLight,
                      }}>{tag}</span>
                    ))}
                  </div>
                )}
                {(asset.content as any).entities && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(asset.content as any).entities.map((e: any, ei: number) => (
                      <span key={ei} style={{
                        fontSize: 10, padding: '3px 8px',
                        background: C.accentBg, borderRadius: 3, color: C.accent,
                      }}>{e.name}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {asset.type === '02' && 'content' in asset && (
              <div>
                {(asset.content as any).tradeoffs?.map((t: any, ti: number) => (
                  <div key={ti} style={{
                    padding: '8px 0',
                    borderBottom: ti < (asset.content as any).tradeoffs.length - 1 ? `1px solid ${C.bgLight}` : 'none',
                  }}>
                    <div style={{ fontSize: 11, color: C.primary, fontWeight: 600, marginBottom: 4 }}>
                      {t.sideA} vs {t.sideB}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                      <div style={{ flex: t.weightA, height: 4, background: C.primary, borderRadius: 2 }} />
                      <div style={{ flex: t.weightB, height: 4, background: C.greyLight, borderRadius: 2 }} />
                    </div>
                    <div style={{ fontSize: 10, color: C.grey }}>{t.reasoning}</div>
                  </div>
                ))}
              </div>
            )}
            {asset.type === '03' && 'content' in asset && (
              <div>
                {(asset.content as any).dataPoints?.map((dp: any, di: number) => (
                  <div key={di} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '6px 0',
                    borderBottom: di < (asset.content as any).dataPoints.length - 1 ? `1px solid ${C.bgLight}` : 'none',
                  }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.primary }}>{dp.name}</div>
                      <div style={{ fontSize: 10, color: C.grey }}>{dp.source}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>{dp.value}</div>
                      <div style={{
                        fontSize: 9, color: dp.confidence === 'high' ? C.primary : C.grey,
                      }}>
                        {dp.confidence === 'high' ? '高置信' : dp.confidence === 'medium' ? '中置信' : '低置信'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {asset.type === '04' && 'content' in asset && (
              <div>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: C.primary,
                  padding: 10, background: C.accentBg, borderRadius: 4,
                }}>
                  {(asset.content as any).resolutionText}
                </div>
              </div>
            )}
            {asset.type === '05' && 'content' in asset && (
              <div>
                <div style={{ fontSize: 11, color: C.primary, lineHeight: 1.6, marginBottom: 8 }}>
                  {(asset.content as any).ruleText}
                </div>
                <div style={{ fontSize: 10, color: C.grey, marginBottom: 4 }}>
                  推荐行动: {(asset.content as any).recommendedAction}
                </div>
                <div style={{ fontSize: 10, color: C.accent }}>
                  置信度: {((asset.content as any).confidenceScore * 100).toFixed(0)}%
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Members Panel
// ============================================================
function MembersPanel({ participantIds }: { participantIds?: string[] }) {
  const allIds = participantIds || Object.keys(USERS);

  const byLevel: Record<string, typeof USERS[string][]> = {};
  allIds.forEach(id => {
    const u = USERS[id];
    if (!u) return;
    if (!byLevel[u.level]) byLevel[u.level] = [];
    byLevel[u.level].push(u);
  });

  const levelOrder = ['战略层', '经营层', '执行层', '区域层', '城市层', '门店层'];

  return (
    <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
      <SectionLabel>参 与 角 色 ({allIds.length})</SectionLabel>
      {levelOrder.filter(l => byLevel[l]).map(level => (
        <div key={level} style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 10, color: C.accent, fontWeight: 700,
            padding: '4px 8px', background: C.accentBg, borderRadius: 3,
            marginBottom: 8, display: 'inline-block',
          }}>
            {level}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {byLevel[level].map(u => (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', background: C.white,
                border: `1px solid ${C.greyLight}`, borderRadius: 4,
              }}>
                <UserAvatar userId={u.id} size={28} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.primary }}>{u.title}</div>
                  <div style={{ fontSize: 10, color: C.grey }}>{u.scope}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Consensus / Resolution Panel
// ============================================================
function ConsensusPanel({
  resolution,
  issueStatus,
  onDecide,
}: {
  resolution: ResolutionStatus | null;
  issueStatus: IssueStatus;
  onDecide: (optionId: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!resolution || issueStatus !== 'PENDING_HUMAN') {
    return null;
  }

  return (
    <div style={{
      padding: 16, background: C.accentBg,
      borderTop: `2px solid ${C.accent}`,
    }}>
      <div style={{ fontSize: 10, color: C.accent, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>
        共 识 与 待 决 策
      </div>
      {resolution.consensusSummary && (
        <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 8 }}>
          AI共识: {resolution.consensusSummary}
        </div>
      )}
      {resolution.pendingQuestion && (
        <div style={{ fontSize: 12, color: C.primaryLight, marginBottom: 12 }}>
          <strong style={{ color: C.accent }}>待决策:</strong> {resolution.pendingQuestion}
        </div>
      )}
      {resolution.options.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {resolution.options.map(opt => (
            <label key={opt.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: 10, background: C.white, borderRadius: 4,
              border: `1px solid ${selected === opt.id ? C.accent : C.greyLight}`,
              cursor: 'pointer',
            }}>
              <input
                type="radio"
                name="resolution"
                checked={selected === opt.id}
                onChange={() => setSelected(opt.id)}
              />
              <div style={{ flex: 1 }}>
                <span style={{
                  fontSize: 12, color: C.primary,
                  fontWeight: opt.isRecommended ? 700 : 400,
                }}>
                  {opt.label}
                </span>
                {opt.isRecommended && (
                  <span style={{
                    fontSize: 9, marginLeft: 6, padding: '1px 5px',
                    background: C.accentBg, color: C.accent,
                    borderRadius: 3, fontWeight: 700,
                  }}>推荐</span>
                )}
                {opt.isFollowup && (
                  <span style={{
                    fontSize: 9, marginLeft: 6, padding: '1px 5px',
                    background: C.bgGrey, color: C.primaryLight,
                    borderRadius: 3,
                  }}>后续跟进</span>
                )}
              </div>
            </label>
          ))}
        </div>
      )}
      <button
        onClick={() => selected && onDecide(selected)}
        disabled={!selected}
        style={{
          width: '100%', padding: '10px 16px',
          background: selected ? C.primary : C.greyLight,
          color: C.white, border: 'none', borderRadius: 4,
          fontSize: 13, fontWeight: 700,
          cursor: selected ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit',
        }}
      >
        确认决策
      </button>
    </div>
  );
}

// ============================================================
// KPI Tab (Right Panel)
// ============================================================
function KpiTab() {
  return (
    <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
      <SectionLabel>目 标 进 度</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {Object.entries(GOALS).map(([k, g]) => {
          const isCritical = g.level === 'critical';
          return (
            <div key={k} style={{
              padding: 12, background: C.white,
              border: `1px solid ${isCritical ? C.accent : C.greyLight}`,
              borderRadius: 6,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.primary }}>{g.name}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: isCritical ? C.accent : C.primary,
                }}>
                  {g.actual} / {g.target} {g.unit}
                </span>
              </div>
              <div style={{ height: 6, background: C.greyLight, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(g.progress, 1) * 100}%`, height: '100%',
                  background: isCritical ? C.accent : C.primary,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      <SectionLabel>系 统 告 警</SectionLabel>
      {GOAL_ALERTS.map(a => (
        <div key={a.id} style={{
          padding: 10, background: C.white, borderRadius: 6,
          border: `1px solid ${C.accent}`, marginBottom: 8,
        }}>
          <div style={{
            fontSize: 9, padding: '1px 5px', borderRadius: 3, fontWeight: 700,
            background: a.severity === 'critical' ? '#FEE2E2' : C.accentBg,
            color: a.severity === 'critical' ? '#DC2626' : C.accent,
            display: 'inline-block', marginBottom: 4,
          }}>
            {a.severity === 'critical' ? '严重' : '警告'}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.primary, marginBottom: 2 }}>
            {a.title}
          </div>
          <div style={{ fontSize: 10, color: C.grey }}>{a.desc}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Issue Card (Left Panel)
// ============================================================
function IssueCard({
  issue,
  isSelected,
  onClick,
}: {
  issue: Issue;
  isSelected: boolean;
  onClick: () => void;
  key?: React.Key;
}) {
  const st = statusLabel(issue.status);
  const ug = urgencyLabel(issue.urgency);

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? C.accentBg : C.white,
        border: `1px solid ${isSelected ? C.accent : C.greyLight}`,
        borderRadius: 6, padding: 12, marginBottom: 10, cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: C.grey, fontFamily: 'monospace' }}>{issue.id}</span>
          <span style={{
            fontSize: 9, padding: '1px 5px', borderRadius: 3, fontWeight: 700,
            background: ug.bg, color: ug.color,
          }}>{ug.text}</span>
        </div>
        <span style={{
          fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 700,
          border: `1px solid ${st.color}`, color: st.color,
        }}>{st.text}</span>
      </div>
      <div style={{
        fontSize: 13, fontWeight: 700, color: C.primary,
        marginBottom: 6, lineHeight: 1.4,
      }}>
        {issue.title}
      </div>
      <div style={{
        fontSize: 11, color: C.primaryLight,
        lineHeight: 1.5, marginBottom: 6,
        overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      }}>
        {issue.description}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: C.grey }}>
          {issue.creatorName || issue.creator_user_id}
        </span>
        {issue.pendingUserName && (
          <span style={{
            fontSize: 9, padding: '1px 5px', borderRadius: 3,
            background: C.accentBg, color: C.accent, fontWeight: 700,
          }}>
            待 {issue.pendingUserName}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Main DecisionSpace Component
// ============================================================
export default function DecisionSpace() {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rightTab, setRightTab] = useState<'kpi' | 'assets' | 'members'>('kpi');
  const [toast, setToast] = useState<string | null>(null);
  const [decidedIssues, setDecidedIssues] = useState<Set<string>>(new Set());

  const scopeCounts = getScopeCounts(CURRENT_USER.id);
  const notifications = getNotifications(CURRENT_USER.id);

  const selectedIssue = useMemo(() => {
    if (!selectedIssueId) return null;
    return MOCK_ISSUES.find(i => i.id === selectedIssueId) || null;
  }, [selectedIssueId]);

  const issueData = useMemo(() => {
    if (!selectedIssueId) return null;
    return getIssueData(selectedIssueId);
  }, [selectedIssueId]);

  const filteredIssues = useMemo<Issue[]>(() => {
    let issues = [...MOCK_ISSUES];
    if (statusFilter !== 'all') {
      issues = issues.filter(i => {
        if (statusFilter === 'pending') return i.status === 'PENDING_HUMAN' || i.status === 'OPEN';
        if (statusFilter === 'resolved') return i.status === 'RESOLVED';
        if (statusFilter === 'suspended') return i.status === 'SUSPENDED';
        return true;
      });
    }
    return issues;
  }, [statusFilter]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDecide = (optionId: string) => {
    if (selectedIssueId) {
      setDecidedIssues(prev => new Set([...prev, selectedIssueId]));
      showToast(`已确认决策: ${issueData?.resolutionStatus?.options.find(o => o.id === optionId)?.label || optionId}`);
    }
  };

  const handleSelectAlertTopic = (topicId: string) => {
    // Check if it's a real issue, otherwise just show toast
    const issue = MOCK_ISSUES.find(i => i.id === topicId);
    if (issue) {
      setSelectedIssueId(topicId);
    } else {
      showToast(`议题 ${topicId} 暂无详细数据`);
    }
  };

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: C.bgLight, color: C.primary, fontFamily: FONT,
    }}>
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
          }}>{CURRENT_USER.initial}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{CURRENT_USER.title}</div>
            <div style={{ fontSize: 10, color: C.grey }}>权限范围: {CURRENT_USER.scope}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {notifications.length > 0 && (
            <div style={{
              position: 'relative', padding: '4px 10px', background: C.accent,
              borderRadius: 4, fontSize: 11, fontWeight: 700,
            }}>
              {notifications.filter(n => !n.is_read).length} 条未读通知
            </div>
          )}
          <div style={{ fontSize: 11, color: C.grey }}>
            来伊份零售决策中台
          </div>
        </div>
      </div>

      {/* Compact KPI Bar */}
      <div style={{
        background: C.white, borderBottom: `1px solid ${C.greyLight}`, padding: '8px 16px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {Object.entries(GOALS).map(([k, g]) => {
            const isCritical = g.level === 'critical';
            const color = isCritical || g.level === 'warning' ? C.accent : C.primary;
            return (
              <div key={k} style={{
                padding: 8, background: C.bgLight, borderRadius: 4,
                borderLeft: `3px solid ${color}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 10, color: C.primaryLight }}>{g.name}</span>
                  {isCritical && (
                    <span style={{ fontSize: 8, color: C.accent, fontWeight: 700 }}>严重</span>
                  )}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>
                  {g.actual}{g.unit}{' '}
                  <span style={{ fontSize: 9, color: C.grey, fontWeight: 400 }}>
                    / {g.target}{g.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3-Pane Layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* LEFT: Issue List */}
        <div style={{
          width: 280, background: C.bgGrey, borderRight: `1px solid ${C.greyLight}`,
          flexShrink: 0, display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '12px 14px', fontSize: 10, fontWeight: 700,
            color: C.grey, letterSpacing: 2,
          }}>
            议 题 列 表 ({filteredIssues.length})
          </div>

          {/* Status Filter */}
          <div style={{
            padding: '0 14px 10px', display: 'flex', gap: 6, flexWrap: 'wrap',
          }}>
            {[
              { id: 'all', label: '全部' },
              { id: 'pending', label: '待处理' },
              { id: 'resolved', label: '已结案' },
              { id: 'suspended', label: '已暂停' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                style={{
                  padding: '4px 10px', borderRadius: 3, fontSize: 11,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: statusFilter === f.id ? C.primary : C.white,
                  color: statusFilter === f.id ? C.white : C.primaryLight,
                  fontWeight: statusFilter === f.id ? 700 : 400,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Scope counts */}
          <div style={{
            padding: '8px 14px', display: 'flex', gap: 12,
            borderTop: `1px solid ${C.greyLight}`, borderBottom: `1px solid ${C.greyLight}`,
            background: C.bgLight,
          }}>
            {[
              { label: '待处理', count: scopeCounts.pending },
              { label: '关注中', count: scopeCounts.watching },
              { label: '已结案', count: scopeCounts.decided },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>{s.count}</div>
                <div style={{ fontSize: 9, color: C.grey }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Issue Cards */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
            {filteredIssues.map((issue: Issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                isSelected={selectedIssueId === issue.id}
                onClick={(): void => { setSelectedIssueId(issue.id); }}
              />
            ))}
          </div>
        </div>

        {/* MIDDLE: Message Stream or KPI Dashboard */}
        <div style={{
          flex: 1, background: C.white,
          borderRight: `1px solid ${C.greyLight}`,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {!selectedIssue ? (
            <KpiDashboard onSelectAlertTopic={handleSelectAlertTopic} />
          ) : (
            <>
              <MessageStream
                messages={issueData?.messages || []}
                issue={selectedIssue}
              />
              {/* Consensus Panel for PENDING_HUMAN issues */}
              {selectedIssue.status === 'PENDING_HUMAN' && issueData?.resolutionStatus && (
                <ConsensusPanel
                  resolution={issueData.resolutionStatus}
                  issueStatus={selectedIssue.status}
                  onDecide={handleDecide}
                />
              )}
            </>
          )}
        </div>

        {/* RIGHT: KPI / Assets / Members Tabs */}
        <div style={{
          width: 300, background: C.bgLight,
          flexShrink: 0, display: 'flex', flexDirection: 'column',
        }}>
          {/* Tab Bar */}
          <div style={{
            display: 'flex', borderBottom: `1px solid ${C.greyLight}`,
            background: C.white,
          }}>
            {[
              { id: 'kpi' as const, label: 'KPI' },
              { id: 'assets' as const, label: '资产' },
              { id: 'members' as const, label: '成员' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRightTab(tab.id)}
                style={{
                  flex: 1, padding: '10px 0', cursor: 'pointer',
                  background: rightTab === tab.id ? C.white : C.bgLight,
                  border: 'none',
                  borderBottom: rightTab === tab.id ? `2px solid ${C.accent}` : '2px solid transparent',
                  fontSize: 12, fontWeight: 700,
                  color: rightTab === tab.id ? C.primary : C.grey,
                  fontFamily: 'inherit',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {rightTab === 'kpi' && <KpiTab />}
          {rightTab === 'assets' && (
            selectedIssue && issueData ? (
              <AssetPanel assets={issueData.assets || []} />
            ) : (
              <div style={{ padding: 20, textAlign: 'center', color: C.grey, fontSize: 12 }}>
                请选择一个议题查看决策资产
              </div>
            )
          )}
          {rightTab === 'members' && (
            <MembersPanel participantIds={selectedIssue?.participant_role_ids?.map(r => {
              // Map role_id back to user id for display
              const mapping: Record<string, string> = {
                ceo: 'u_001', vp_prod: 'u_002', vp_sales: 'u_003',
                mgr_plan: 'u_004', mgr_process: 'u_005', mgr_quality: 'u_006',
                mgr_finance: 'u_007', mgr_sales: 'u_052', mgr_purchase: 'u_009',
                mgr_factory: 'u_021', coord_agent: 'u_053',
              };
              return mapping[r] || 'u_001';
            })} />
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          background: C.primary, color: C.white, padding: '10px 18px',
          borderRadius: 4, fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 12px rgba(30,42,58,0.15)', zIndex: 200,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
