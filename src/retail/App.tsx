import { useState } from 'react';
import {
  Activity, BrainCircuit, Database, Settings, Terminal, FlaskConical,
  Workflow, ShieldCheck, Store, Briefcase, Network, HardDrive, Layers,
  LayoutTemplate, Cpu, ArrowLeft, Home, ShoppingBag
} from 'lucide-react';
import { cn } from './lib/utils';
import DecisionSpace from './views/DecisionSpace';
import SimulationLab from './views/SimulationLab';
import WorkflowStudio from './views/WorkflowStudio';
import OntologyModeling from './views/OntologyModeling';
import MCPStudio from './views/MCPStudio';
import SkillsOS from './views/SkillsOS';
import PlaceholderView from './views/PlaceholderView';
import IoTDeviceManagement from './views/IoTDeviceManagement';
import BusinessSystemIntegration from './views/BusinessSystemIntegration';
import DataIntegrationHub from './views/DataIntegrationHub';
import RealTimeDataLake from './views/RealTimeDataLake';
import AgentStudio from './views/AgentStudio';
import AgentWorkspace from './views/AgentWorkspace';

interface PageHeaderProps {
  title: string;
  onBack: () => void;
  onGoHome: () => void;
}

function PageHeader({ title, onBack, onGoHome }: PageHeaderProps) {
  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 shrink-0">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        title="返回首页"
      >
        <ArrowLeft size={16} />
        <span>返回</span>
      </button>
      <div className="w-px h-5 bg-gray-200 mx-4" />
      <button
        onClick={onGoHome}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        title="回到首页"
      >
        <Home size={16} />
        <span>首页</span>
      </button>
      <div className="flex-1" />
      <h2 className="text-sm font-medium text-gray-700">{title}</h2>
    </div>
  );
}

const navGroups = [
  {
    layer: 'L1: 门店/业务层',
    items: [
      { id: 'iot', label: '门店IoT接入', icon: Store },
      { id: 'mes_erp', label: '业务系统接入', icon: Briefcase },
    ]
  },
  {
    layer: 'L2: 数据层',
    items: [
      { id: 'data_integration', label: '数据集成枢纽', icon: Network },
      { id: 'data_lake', label: '实时数据湖', icon: HardDrive },
    ]
  },
  {
    layer: 'L3: 对象建模/语义层',
    items: [
      { id: 'ontology', label: '本体与语义建模', icon: Database },
    ]
  },
  {
    layer: 'L4: 智能体/工具',
    items: [
      { id: 'agent_workspace', label: '智能体总览', icon: LayoutTemplate },
      { id: 'agent_studio', label: '智能体配置', icon: Layers },
      { id: 'workflow', label: '工作流编排', icon: Workflow },
      { id: 'tool', label: '工具中心 (MCP)', icon: Terminal },
      { id: 'skill', label: '技能市场', icon: Store },
    ]
  },
  {
    layer: 'L5: 执行 & 可视化层',
    items: [
      { id: 'decision', label: '决策空间', icon: BrainCircuit },
    ]
  }
];

export default function RetailApp() {
  const [activeTab, setActiveTab] = useState('agent_workspace');
  const [tabHistory, setTabHistory] = useState<string[]>([]);

  const handleTabChange = (tabId: string) => {
    if (tabId !== activeTab) {
      setTabHistory(prev => [...prev, activeTab]);
      setActiveTab(tabId);
    }
  };

  const handleBack = () => {
    if (tabHistory.length > 0) {
      const newHistory = [...tabHistory];
      const prevTab = newHistory.pop();
      setTabHistory(newHistory);
      if (prevTab) setActiveTab(prevTab);
    }
  };

  const handleGoHome = () => {
    if (activeTab !== 'decision') {
      setTabHistory(prev => [...prev, activeTab]);
      setActiveTab('decision');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col shrink-0">
        <div
          className="p-6 flex items-center gap-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => handleTabChange('agent_workspace')}
          title="点击返回首页"
        >
          <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
            <ShoppingBag size={18} />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">零售决策中台</h1>
            <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Retail Agent OS</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.layer}>
              <h3 className="px-3 text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                {group.layer}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs transition-all duration-200",
                        isActive
                          ? "bg-gray-100 text-gray-900 font-semibold"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <Icon size={14} className={cn(isActive ? "text-gray-900" : "text-gray-400")} />
                      <span className="tracking-wide">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2 text-xs text-gray-500 font-medium hover:text-gray-900 cursor-pointer transition-colors">
            <Settings size={14} />
            <span>系统配置</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 relative overflow-hidden bg-gray-50 flex flex-col">
        {activeTab !== 'agent_workspace' && (
          <PageHeader
            title={navGroups.flatMap(g => g.items).find(item => item.id === activeTab)?.label || ''}
            onBack={handleBack}
            onGoHome={handleGoHome}
          />
        )}
        <div className="flex-1 overflow-y-auto relative z-10">
          {activeTab === 'iot' && <IoTDeviceManagement />}
          {activeTab === 'mes_erp' && <BusinessSystemIntegration />}
          {activeTab === 'data_integration' && <DataIntegrationHub />}
          {activeTab === 'data_lake' && <RealTimeDataLake />}
          {activeTab === 'decision' && <div className="h-full"><DecisionSpace /></div>}
          {activeTab === 'agent_studio' && <div className="p-6 h-full"><AgentStudio /></div>}
          {activeTab === 'agent_workspace' && <div className="h-full"><AgentWorkspace onNavigate={handleTabChange} /></div>}
          {activeTab === 'workflow' && <div className="p-6 h-full"><WorkflowStudio /></div>}
          {activeTab === 'ontology' && <div className="p-6 h-full"><OntologyModeling /></div>}
          {activeTab === 'tool' && <div className="p-6 h-full"><MCPStudio /></div>}
          {activeTab === 'skill' && <div className="h-full"><SkillsOS /></div>}
        </div>
      </main>
    </div>
  );
}
