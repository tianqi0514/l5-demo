import { useState } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Play,
  Settings,
  Code,
  FileText,
  FolderOpen,
  History,
  ChevronRight,
  Copy,
  Check,
  LayoutGrid,
  List,
  Database,
  TerminalSquare,
  Terminal,
  MoreHorizontal,
  Send,
  Clock,
  ArrowLeft,
  Store,
  Package,
  Percent,
  User,
  TrendingUp
} from 'lucide-react';
import { cn } from '../lib/utils';

// --- Energy Procurement MCP Tools ---
const TOOLS = [
  {
    id: 'tool-query-supplier-qual',
    name: 'query_supplier_qualification',
    displayName: '查询供应商资质信息',
    description: '查询供应商资质证书、认证范围、有效期等信息，支持批量筛查',
    version: 'v2.0.0',
    status: 'online',
    server: 'SRM供应商管理',
    auth: 'OAuth2',
    calls: 18920,
    latency: '38ms',
    author: '供应商管理团队',
    updatedAt: '2026-03-15'
  },
  {
    id: 'tool-detect-collusion',
    name: 'detect_bid_collusion',
    displayName: '检测串标围标行为',
    description: '基于报价聚类、IP关联、人员交叉等维度检测疑似围标串标行为',
    version: 'v1.5.0',
    status: 'online',
    server: '风控分析平台',
    auth: 'mTLS',
    calls: 3456,
    latency: '280ms',
    author: '风控技术组',
    updatedAt: '2026-03-18'
  },
  {
    id: 'tool-check-contract-clause',
    name: 'check_contract_clause',
    displayName: '合同条款合规校验',
    description: '校验合同条款是否偏离标准模板，识别风险条款并给出修改建议',
    version: 'v1.8.0',
    status: 'online',
    server: '合同管理系统',
    auth: 'JWT',
    calls: 6789,
    latency: '95ms',
    author: '法务技术组',
    updatedAt: '2026-03-20'
  },
  {
    id: 'tool-supplier-risk-score',
    name: 'calculate_supplier_risk_score',
    displayName: '供应商风险评分',
    description: '综合财务、履约、合规、舆情等维度计算供应商风险评分',
    version: 'v2.2.0',
    status: 'online',
    server: 'GRC合规平台',
    auth: 'OAuth2',
    calls: 12340,
    latency: '150ms',
    author: '风控团队',
    updatedAt: '2026-03-19'
  },
  {
    id: 'tool-screen-related-party',
    name: 'screen_related_party',
    displayName: '关联交易筛查',
    description: '筛查供应商与集团关联方的股权、人员、交易关系',
    version: 'v1.3.0',
    status: 'online',
    server: 'GRC合规平台',
    auth: 'mTLS',
    calls: 2890,
    latency: '220ms',
    author: '合规技术组',
    updatedAt: '2026-03-12'
  },
  {
    id: 'tool-sanction-screening',
    name: 'sanction_list_screening',
    displayName: '制裁名单比对',
    description: '将供应商信息与国际制裁名单(OFAC/EU/UN)进行比对筛查',
    version: 'v1.1.0',
    status: 'online',
    server: '合规数据服务',
    auth: 'API密钥',
    calls: 1560,
    latency: '350ms',
    author: '国际合规组',
    updatedAt: '2026-03-10'
  },
  {
    id: 'tool-price-analysis',
    name: 'analyze_procurement_price',
    displayName: '采购价格合理性分析',
    description: '对比历史采购价、市场基准价、同行采购价，评估价格合理性',
    version: 'v1.6.0',
    status: 'offline',
    server: '财务共享中心',
    auth: 'mTLS',
    calls: 4560,
    latency: '-',
    author: '成本分析组',
    updatedAt: '2026-02-28'
  },
  {
    id: 'tool-audit-trail',
    name: 'trace_audit_trail',
    displayName: '审计线索追踪',
    description: '追踪采购全流程操作日志，识别异常操作和违规行为',
    version: 'v1.4.0',
    status: 'online',
    server: '审计系统',
    auth: 'OAuth2',
    calls: 7890,
    latency: '120ms',
    author: '审计技术组',
    updatedAt: '2026-03-22'
  },
];

const SCHEMA_JSON = `{
  "name": "query_supplier_qualification",
  "description": "查询供应商资质证书、认证范围、有效期等信息",
  "version": "2.0.0",
  "auth": {
    "type": "OAuth2",
    "scopes": ["supplier:read", "qualification:read"]
  },
  "parameters": {
    "type": "object",
    "required": ["supplier_id"],
    "properties": {
      "supplier_id": {
        "type": "string",
        "description": "供应商唯一标识符"
      },
      "cert_type": {
        "type": "string",
        "description": "证书类型(可选)",
        "enum": ["ISO9001", "ISO14001", "OHSAS18001", "安全生产许可证", "特种设备许可证"]
      },
      "include_expired": {
        "type": "boolean",
        "description": "是否包含已过期资质",
        "default": false
      }
    }
  },
  "returns": {
    "type": "object",
    "properties": {
      "supplier_id": { "type": "string" },
      "supplier_name": { "type": "string" },
      "qualifications": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "cert_type": { "type": "string" },
            "cert_no": { "type": "string" },
            "expiry_date": { "type": "string" },
            "status": { "type": "string" }
          }
        }
      },
      "risk_level": { "type": "string" }
    }
  }
}`;

const IMPLEMENTATION_CODE = `class SupplierQualificationTool:
    """查询供应商资质信息的MCP工具实现"""

    def __init__(self, srm_client):
        self.srm = srm_client
        self.cache = CacheManager(ttl=300)

    async def execute(self, params: dict) -> dict:
        supplier_id = params.get('supplier_id')
        cert_type = params.get('cert_type')
        include_expired = params.get('include_expired', False)

        # 验证供应商ID
        if not supplier_id:
            raise InvalidParameterError("supplier_id is required")

        # 检查缓存
        cache_key = f"supplier_qual:{supplier_id}:{cert_type}"
        cached = await self.cache.get(cache_key)
        if cached:
            return cached

        # 调用SRM接口
        data = await self.srm.query_qualifications(
            supplier_id=supplier_id,
            cert_type=cert_type,
            include_expired=include_expired
        )

        # 缓存结果
        await self.cache.set(cache_key, data, ttl=300)

        return {
            "supplier_id": supplier_id,
            "supplier_name": data.get('supplier_name'),
            "qualifications": data.get('qualifications', []),
            "risk_level": data.get('risk_level', 'unknown')
        }`;

const README_MD = `# query_supplier_qualification

## 描述
查询供应商资质证书、认证范围、有效期等信息，支持按证书类型筛选。

## 使用场景
- 供应商准入审查
- 招标资格预审
- 资质到期预警
- 合规检查

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| supplier_id | string | 是 | 供应商唯一标识符 |
| cert_type | string | 否 | 证书类型 |
| include_expired | boolean | 否 | 是否包含已过期资质 |

## 返回值

\`\`\`json
{
  "supplier_id": "SUP-001",
  "supplier_name": "华东重工集团",
  "qualifications": [
    {
      "cert_type": "ISO9001",
      "cert_no": "QMS-2024-001",
      "expiry_date": "2027-06-30",
      "status": "有效"
    }
  ],
  "risk_level": "低"
}
\`\`\`

## 错误码
- 400: 参数错误
- 404: 供应商不存在
- 503: SRM服务暂不可用`;

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className="absolute right-2 top-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded transition-colors"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <div className="bg-slate-900 text-slate-300 p-4 pt-10 overflow-x-auto rounded-b-lg">
        <pre className="text-sm font-mono">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function ToolDetail({ tool, onClose }: { tool: typeof TOOLS[0]; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'readme' | 'schema' | 'code' | 'test'>('readme');

  const tabs = [
    { id: 'readme', label: 'README.md', icon: FileText },
    { id: 'schema', label: 'schema.json', icon: Database },
    { id: 'code', label: 'implementation.py', icon: Code },
    { id: 'test', label: '测试沙盒', icon: TerminalSquare },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <header className="border-b border-slate-200">
        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2 text-sm text-slate-600">
          <Terminal size={14} className="text-slate-400" />
          <span className="hover:text-slate-900 cursor-pointer">MCP工具中心</span>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="font-medium text-slate-900">{tool.name}</span>
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 text-white flex items-center justify-center">
                <Terminal size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{tool.displayName}</h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                  <span className="font-mono">{tool.name}</span>
                  <span>•</span>
                  <span>{tool.version}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 text-xs rounded",
                    tool.status === 'online'
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  )}>
                    {tool.status === 'online' ? '在线' : '离线'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft size={14} />
                返回
              </button>
              <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">
                <Settings size={14} />
                设置
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 px-4 border-t border-slate-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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

      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-5xl mx-auto p-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 text-sm text-slate-600 rounded-t-lg">
            <span className="font-medium text-slate-900">{tool.id}</span>
            <span className="text-slate-400">/</span>
            <span>
              {activeTab === 'readme' && 'README.md'}
              {activeTab === 'schema' && 'schema.json'}
              {activeTab === 'code' && 'implementation.py'}
              {activeTab === 'test' && 'sandbox/'}
            </span>
          </div>

          {activeTab === 'readme' && (
            <div className="bg-white border border-t-0 border-slate-200 rounded-b-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-700">README.md</span>
              </div>
              <div className="p-6">
                <pre className="text-sm text-slate-800 whitespace-pre-wrap font-mono">
                  {README_MD}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="bg-white border border-t-0 border-slate-200 rounded-b-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-700">schema.json</span>
                <span className="text-xs text-slate-500">JSON Schema</span>
              </div>
              <CodeBlock code={SCHEMA_JSON} language="json" />
            </div>
          )}

          {activeTab === 'code' && (
            <div className="bg-white border border-t-0 border-slate-200 rounded-b-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-700">implementation.py</span>
                <span className="text-xs text-slate-500">Python</span>
              </div>
              <CodeBlock code={IMPLEMENTATION_CODE} language="python" />
            </div>
          )}

          {activeTab === 'test' && (
            <div className="bg-white border border-t-0 border-slate-200 rounded-b-lg">
              <div className="grid grid-cols-2 gap-0">
                <div className="border-r border-slate-200">
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">请求参数</span>
                    <button className="px-3 py-1 bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 flex items-center gap-1">
                      <Send size={12} />
                      发送
                    </button>
                  </div>
                  <div className="p-4">
                    <textarea
                      className="w-full h-64 p-3 bg-slate-900 text-green-400 font-mono text-sm rounded resize-none focus:outline-none"
                      defaultValue={`{\n  "store_id": "SH-001",\n  "start_date": "2024-03-01",\n  "end_date": "2024-03-07",\n  "metrics": ["gmv", "order_count", "avg_order_value"]\n}`}
                    />
                  </div>
                </div>
                <div>
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">响应结果</span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock size={12} />
                      45ms
                    </span>
                  </div>
                  <div className="p-4">
                    <pre className="w-full h-64 p-3 bg-slate-50 text-slate-700 font-mono text-sm rounded overflow-auto">
{`{
  "store_id": "SH-001",
  "period": "2024-03-01 to 2024-03-07",
  "gmv": 85600.50,
  "order_count": 1245,
  "customer_count": 890,
  "avg_order_value": 68.76
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MCPStudio() {
  const [tools] = useState(TOOLS);
  const [selectedTool, setSelectedTool] = useState<typeof TOOLS[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = tools.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white">
      <header className="border-b border-slate-200">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 text-sm text-slate-600">
          <Terminal size={16} className="text-slate-400" />
          <span className="font-medium text-slate-900">MCP Studio</span>
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 text-white flex items-center justify-center">
                <Terminal size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">MCP工具中心</h1>
                <p className="text-sm text-slate-500">模型上下文协议工具注册与测试</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white text-sm font-medium hover:bg-slate-700">
                <Plus size={14} />
                注册工具
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-6xl mx-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 border border-slate-200">
              <div className="text-sm text-slate-500">工具总数</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">45</div>
            </div>
            <div className="bg-white p-4 border border-slate-200">
              <div className="text-sm text-slate-500">在线</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">42</div>
            </div>
            <div className="bg-white p-4 border border-slate-200">
              <div className="text-sm text-slate-500">离线</div>
              <div className="text-2xl font-bold text-rose-600 mt-1">3</div>
            </div>
            <div className="bg-white p-4 border border-slate-200">
              <div className="text-sm text-slate-500">总调用次数</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">110K</div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="搜索工具..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-64 bg-white border border-slate-200 text-sm focus:outline-none focus:border-slate-400 rounded"
              />
            </div>
          </div>

          {/* Tool List */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">工具名称</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">状态</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">认证方式</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">延迟</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">调用次数</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTools.map((tool) => (
                  <tr
                    key={tool.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => setSelectedTool(tool)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Terminal size={18} className="text-slate-500" />
                        <div>
                          <div className="font-medium text-sky-600 hover:underline">{tool.displayName}</div>
                          <div className="text-xs text-slate-500 font-mono">{tool.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{tool.server}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "flex items-center gap-1.5 text-xs",
                        tool.status === 'online' ? "text-emerald-600" : "text-rose-600"
                      )}>
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          tool.status === 'online' ? "bg-emerald-500" : "bg-rose-500"
                        )} />
                        {tool.status === 'online' ? '在线' : '离线'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{tool.auth}</td>
                    <td className="px-4 py-3 text-slate-600">{tool.latency}</td>
                    <td className="px-4 py-3 text-slate-600">{tool.calls.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button className="p-1 hover:bg-slate-200 text-slate-400">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedTool && (
        <ToolDetail
          tool={selectedTool}
          onClose={() => setSelectedTool(null)}
        />
      )}
    </div>
  );
}
