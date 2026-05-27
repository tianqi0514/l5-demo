import { useState } from 'react';
import { FlaskConical, Play, Save, Settings, BarChart3, TrendingUp, TrendingDown, ArrowRight, Activity, Zap, Layers, Cpu, CheckCircle2, Plus, Store, Percent, Users, Ruler } from 'lucide-react';
import { cn } from '../lib/utils';

const scenariosData: Record<string, any> = {
  'baseline': {
    id: 'baseline',
    name: '当前基线',
    status: 'active',
    gmv: 8500,
    gmvDiff: '0%',
    margin: 37,
    marginDiff: '0pt',
    efficiency: 1250,
    efficiencyDiff: '0%',
    laborCost: 2800,
    laborCostDiff: '0%',
    memberConversion: 18.5,
    memberConversionDiff: '0pt',
    metrics: [
      { label: '日均GMV (元/店)', value: 8500, unit: '' },
      { label: '毛利率 (%)', value: 37, unit: '%' },
      { label: '坪效 (元/㎡/月)', value: 1250, unit: '' },
      { label: '人效 (元/人/天)', value: 850, unit: '' },
      { label: '会员转化率 (%)', value: 18.5, unit: '%' },
    ],
    recommendation: '当前门店经营状态稳定，日均GMV 8500元/店，毛利率37%，各项指标处于正常区间。',
    confidence: '0.95',
    conclusion: '建议保持当前经营策略，关注季节性波动。'
  },
  'sc-1': {
    id: 'sc-1',
    name: '方案 A: 激进促销',
    status: 'simulated',
    gmv: 9775,
    gmvDiff: '+15%',
    margin: 35,
    marginDiff: '-2pt',
    efficiency: 1280,
    efficiencyDiff: '+2.4%',
    laborCost: 3100,
    laborCostDiff: '+10.7%',
    memberConversion: 22.0,
    memberConversionDiff: '+3.5pt',
    metrics: [
      { label: '日均GMV (元/店)', value: 9775, unit: '' },
      { label: '毛利率 (%)', value: 35, unit: '%' },
      { label: '坪效 (元/㎡/月)', value: 1280, unit: '' },
      { label: '人效 (元/人/天)', value: 920, unit: '' },
      { label: '会员转化率 (%)', value: 22.0, unit: '%' },
    ],
    recommendation: '方案A (激进促销) 预计可提升15% GMV，但毛利率下降2个百分点。需要大量促销投入，短期拉动明显但长期盈利承压。',
    confidence: '0.82',
    conclusion: '建议短期大促期间采用，不宜长期执行。'
  },
  'sc-2': {
    id: 'sc-2',
    name: '方案 B: 会员深耕',
    status: 'simulated',
    gmv: 9180,
    gmvDiff: '+8%',
    margin: 38,
    marginDiff: '+1pt',
    efficiency: 1320,
    efficiencyDiff: '+5.6%',
    laborCost: 2900,
    laborCostDiff: '+3.6%',
    memberConversion: 23.5,
    memberConversionDiff: '+5pt',
    metrics: [
      { label: '日均GMV (元/店)', value: 9180, unit: '' },
      { label: '毛利率 (%)', value: 38, unit: '%' },
      { label: '坪效 (元/㎡/月)', value: 1320, unit: '' },
      { label: '人效 (元/人/天)', value: 880, unit: '' },
      { label: '会员转化率 (%)', value: 23.5, unit: '%' },
    ],
    recommendation: '方案B (会员深耕) 预计可提升8% GMV，毛利率反而提升1个百分点，会员转化率提升5pt。投入产出比最优。',
    confidence: '0.88',
    conclusion: '建议作为常态化经营策略推广。'
  },
  'sc-3': {
    id: 'sc-3',
    name: '方案 C: 新店模型',
    status: 'draft',
    gmv: 9520,
    gmvDiff: '+12%',
    margin: 36,
    marginDiff: '-1pt',
    efficiency: 1400,
    efficiencyDiff: '+12%',
    laborCost: 3024,
    laborCostDiff: '+8%',
    memberConversion: 20.0,
    memberConversionDiff: '+1.5pt',
    metrics: [
      { label: '日均GMV (元/店)', value: 9520, unit: '' },
      { label: '毛利率 (%)', value: 36, unit: '%' },
      { label: '坪效 (元/㎡/月)', value: 1400, unit: '' },
      { label: '人效 (元/人/天)', value: 900, unit: '' },
      { label: '会员转化率 (%)', value: 20.0, unit: '%' },
    ],
    recommendation: '方案C (新店模型) 通过优化门店布局和动线设计，坪效提升12%，但人力成本增加8%。适合新开店或老店改造。',
    confidence: '0.75',
    conclusion: '建议在新店开业或老店翻新时采用。'
  }
};

const scenarios = Object.values(scenariosData);
const baselineMetrics = scenariosData['baseline'].metrics;

export default function SimulationLab() {
  const [activeScenario, setActiveScenario] = useState('sc-1');

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 shrink-0 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
            <FlaskConical size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">推演实验室</h2>
            <p className="text-[10px] text-gray-500 font-mono">零售场景生成与仿真验证</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors text-xs shadow-sm">
            <Save size={14} /> 保存方案
          </button>
          <button className="px-3 py-1.5 bg-cyan-600 text-white font-medium rounded-lg flex items-center gap-2 hover:bg-cyan-700 transition-colors text-xs shadow-sm">
            <Play size={14} /> 批量仿真
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Scenarios */}
        <div className="w-64 border-r border-gray-200 bg-gray-50/30 flex flex-col shrink-0">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">仿真场景</h3>
            <button className="text-cyan-600 hover:text-cyan-700"><Plus size={14} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {scenarios.map(sc => (
              <div
                key={sc.id}
                onClick={() => setActiveScenario(sc.id)}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all",
                  activeScenario === sc.id
                    ? "bg-cyan-50 border-cyan-200 ring-1 ring-cyan-100 shadow-sm"
                    : "bg-white border-gray-200 hover:border-cyan-300 hover:shadow-sm"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-gray-900">{sc.name}</span>
                  {sc.status === 'active' && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                  {sc.status === 'simulated' && <CheckCircle2 size={12} className="text-cyan-600" />}
                  {sc.status === 'draft' && <span className="w-2 h-2 rounded-full bg-gray-300"></span>}
                </div>
                <div className="text-[10px] text-gray-500 font-mono">编号: {sc.id.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle - Scenario Config */}
        <div className="flex-1 border-r border-gray-200 bg-white flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Settings size={16} className="text-gray-500" />
              参数调节 - {scenariosData[activeScenario]?.name}
            </h3>
          </div>
          <div className="p-6 space-y-8">
            {/* Business Models */}
            <section>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                <Store size={14} /> 经营模型参数
              </h4>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-700">日均GMV (元/店)</label>
                    <span className="text-xs font-mono text-cyan-600">{scenariosData[activeScenario]?.gmv.toLocaleString()} 元 ({scenariosData[activeScenario]?.gmvDiff})</span>
                  </div>
                  <input type="range" min="6000" max="12000" step="100" value={scenariosData[activeScenario]?.gmv} readOnly className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600" />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                    <span>6,000 (保守)</span>
                    <span>8,500 (基线)</span>
                    <span>12,000 (激进)</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-700">毛利率 (%)</label>
                    <span className="text-xs font-mono text-cyan-600">{scenariosData[activeScenario]?.margin}% ({scenariosData[activeScenario]?.marginDiff})</span>
                  </div>
                  <input type="range" min="30" max="45" step="0.5" value={scenariosData[activeScenario]?.margin} readOnly className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600" />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                    <span>30% (最低)</span>
                    <span>37% (基线)</span>
                    <span>45% (最高)</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Efficiency Models */}
            <section>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                <Layers size={14} /> 效率模型参数
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-700">坪效 (元/㎡/月)</label>
                    <span className="text-xs font-mono text-cyan-600">{scenariosData[activeScenario]?.efficiency} ({scenariosData[activeScenario]?.efficiencyDiff})</span>
                  </div>
                  <input type="range" min="800" max="1800" step="10" value={scenariosData[activeScenario]?.efficiency} readOnly className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600" />
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-700">人力成本 (元/店/月)</label>
                    <span className="text-xs font-mono text-cyan-600">{scenariosData[activeScenario]?.laborCost.toLocaleString()} ({scenariosData[activeScenario]?.laborCostDiff})</span>
                  </div>
                  <input type="range" min="2500" max="4000" step="50" value={scenariosData[activeScenario]?.laborCost} readOnly className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600" />
                </div>
              </div>
            </section>

            {/* Member Model */}
            <section>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                <Users size={14} /> 会员模型参数
              </h4>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-700">会员转化率 (%)</label>
                  <span className="text-xs font-mono text-cyan-600">{scenariosData[activeScenario]?.memberConversion}% ({scenariosData[activeScenario]?.memberConversionDiff})</span>
                </div>
                <input type="range" min="10" max="30" step="0.5" value={scenariosData[activeScenario]?.memberConversion} readOnly className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600" />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                  <span>10% (低)</span>
                  <span>18.5% (基线)</span>
                  <span>30% (高)</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Right - Simulation Results */}
        <div className="w-96 bg-[#f8f9fa] flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 size={16} className="text-cyan-600" />
              仿真结果对比
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-6">

            {/* Comparison Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3 font-semibold">指标</th>
                    <th className="p-3 font-semibold text-right">基线</th>
                    <th className="p-3 font-semibold text-right text-cyan-700">当前方案</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {scenariosData[activeScenario]?.metrics.map((m: any, i: number) => {
                    const baselineVal = baselineMetrics[i].value;
                    const diff = typeof m.value === 'number' && typeof baselineVal === 'number' ? m.value - baselineVal : null;
                    const isPositive = diff !== null && diff > 0;
                    const isNegative = diff !== null && diff < 0;

                    const isGood = (m.label.includes('GMV') || m.label.includes('坪效') || m.label.includes('人效') || m.label.includes('转化率')) ? isPositive : isNegative;
                    const isBad = (m.label.includes('GMV') || m.label.includes('坪效') || m.label.includes('人效') || m.label.includes('转化率')) ? isNegative : isPositive;

                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-700">{m.label}</td>
                        <td className="p-3 text-right font-mono text-gray-500">{baselineVal}{m.unit}</td>
                        <td className="p-3 text-right font-mono font-bold text-gray-900">
                          {diff !== null && diff !== 0 && (
                            <span className={cn(
                              "text-[10px] flex items-center justify-end gap-0.5",
                              isGood ? "text-emerald-500" : isBad ? "text-red-500" : "text-gray-400"
                            )}>
                              {isPositive ? <TrendingUp size={10} /> : isNegative ? <TrendingDown size={10} /> : null}
                              {Math.abs(diff).toFixed(1)}{m.unit}
                            </span>
                          )}
                          {m.value}{m.unit}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* AI Recommendation */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-cyan-600" />
                <h4 className="text-xs font-bold text-cyan-900 uppercase tracking-wider">智能体评估建议</h4>
              </div>
              <p className="text-xs text-cyan-800 leading-relaxed mb-3">
                <strong>{scenariosData[activeScenario]?.name}</strong>: {scenariosData[activeScenario]?.recommendation}
              </p>
              <div className="bg-white/60 rounded p-2 text-[10px] text-cyan-700 font-mono border border-cyan-200/50">
                置信度: {scenariosData[activeScenario]?.confidence}<br/>
                结论: {scenariosData[activeScenario]?.conclusion}
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center gap-2">
              <Activity size={16} />
              应用此方案至门店系统
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
