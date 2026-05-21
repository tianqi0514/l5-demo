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

// --- Retail MCP Tools ---
const TOOLS = [
  {
    id: 'tool-get-store-sales',
    name: 'get_store_sales',
    displayName: '获取门店销售数据',
    description: '获取指定门店在指定时间范围内的销售数据，包括GMV、订单数、客单价等',
    version: 'v1.3.0',
    status: 'online',
    server: 'POS服务器',
    auth: 'OAuth2',
    calls: 12560,
    latency: '45ms',
    author: '门店数据团队',
    updatedAt: '2024-03-15'
  },
  {
    id: 'tool-query-inventory',
    name: 'query_inventory',
    displayName: '查询库存',
    description: '查询指定门店或仓库的SKU实时库存、在途库存、保质期等信息',
    version: 'v2.1.0',
    status: 'online',
    server: 'ERP服务器',
    auth: 'API密钥',
    calls: 8920,
    latency: '32ms',
    author: '供应链团队',
    updatedAt: '2024-03-18'
  },
  {
    id: 'tool-update-promotion',
    name: 'update_promotion',
    displayName: '更新促销策略',
    description: '创建或更新门店促销活动，支持满减、折扣、赠品等多种类型',
    version: 'v1.5.0',
    status: 'online',
    server: '营销中台',
    auth: 'OAuth2',
    calls: 1567,
    latency: '120ms',
    author: '营销技术组',
    updatedAt: '2024-03-20'
  },
  {
    id: 'tool-analyze-member',
    name: 'analyze_member',
    displayName: '会员消费分析',
    description: '分析会员消费行为，输出RFM模型、消费偏好、流失风险等洞察',
    version: 'v1.8.0',
    status: 'online',
    server: '会员系统',
    auth: 'JWT',
    calls: 6789,
    latency: '85ms',
    author: '会员运营组',
    updatedAt: '2024-03-19'
  },
  {
    id: 'tool-get-product-margin',
    name: 'get_product_margin',
    displayName: '查询商品毛利率',
    description: '查询指定SKU或品类的毛利率、成本构成、价格弹性等数据',
    version: 'v1.2.0',
    status: 'offline',
    server: '财务系统',
    auth: 'mTLS',
    calls: 2340,
    latency: '-',
    author: '财务数据组',
    updatedAt: '2024-03-10'
  },
];

const SCHEMA_JSON = `{
  "name": "get_store_sales",
  "description": "获取指定门店在指定时间范围内的销售数据",
  "version": "1.3.0",
  "auth": {
    "type": "OAuth2",
    "scopes": ["sales:read"]
  },
  "parameters": {
    "type": "object",
    "required": ["store_id"],
    "properties": {
      "store_id": {
        "type": "string",
        "description": "门店唯一标识符"
      },
      "start_date": {
        "type": "string",
        "description": "开始日期 (YYYY-MM-DD)"
      },
      "end_date": {
        "type": "string",
        "description": "结束日期 (YYYY-MM-DD)"
      },
      "metrics": {
        "type": "array",
        "description": "需要获取的指标列表",
        "items": {
          "enum": ["gmv", "order_count", "customer_count", "avg_order_value"]
        },
        "default": ["gmv", "order_count"]
      }
    }
  },
  "returns": {
    "type": "object",
    "properties": {
      "store_id": { "type": "string" },
      "period": { "type": "string" },
      "gmv": { "type": "number", "unit": "元" },
      "order_count": { "type": "number" },
      "customer_count": { "type": "number" },
      "avg_order_value": { "type": "number", "unit": "元" }
    }
  }
}`;

const IMPLEMENTATION_CODE = `class StoreSalesTool:
    """获取门店销售数据的MCP工具实现"""

    def __init__(self, pos_client):
        self.pos = pos_client
        self.cache = CacheManager(ttl=60)

    async def execute(self, params: dict) -> dict:
        store_id = params.get('store_id')
        start_date = params.get('start_date')
        end_date = params.get('end_date')
        metrics = params.get('metrics', ['gmv', 'order_count'])

        # 验证门店ID
        if not store_id:
            raise InvalidParameterError("store_id is required")

        # 检查缓存
        cache_key = f"store_sales:{store_id}:{start_date}:{end_date}"
        cached = await self.cache.get(cache_key)
        if cached:
            return cached

        # 调用POS接口
        data = await self.pos.get_store_sales(
            store_id=store_id,
            start_date=start_date,
            end_date=end_date,
            metrics=metrics
        )

        # 缓存结果
        await self.cache.set(cache_key, data, ttl=60)

        return {
            "store_id": store_id,
            "period": f"{start_date} to {end_date}",
            "gmv": data.get('gmv', 0),
            "order_count": data.get('order_count', 0),
            "customer_count": data.get('customer_count', 0),
            "avg_order_value": data.get('avg_order_value', 0)
        }`;

const README_MD = `# get_store_sales

## 描述
获取指定门店在指定时间范围内的销售数据，包括GMV、订单数、客单价等核心指标。

## 使用场景
- 门店销售日报生成
- 区域销售排名分析
- 促销活动效果评估
- 门店经营健康度监控

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| store_id | string | 是 | 门店唯一标识符 |
| start_date | string | 否 | 开始日期 (YYYY-MM-DD) |
| end_date | string | 否 | 结束日期 (YYYY-MM-DD) |
| metrics | array | 否 | 需要获取的指标列表 |

## 返回值

\`\`\`json
{
  "store_id": "SH-001",
  "period": "2024-03-01 to 2024-03-07",
  "gmv": 85600.50,
  "order_count": 1245,
  "customer_count": 890,
  "avg_order_value": 68.76
}
\`\`\`

## 错误码
- 400: 参数错误
- 404: 门店不存在
- 503: POS服务暂不可用`;

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
