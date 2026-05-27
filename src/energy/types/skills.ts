// 能源采购合规 - 技能类型定义

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  author: string;
  icon: string;
  tags: string[];
  downloads: number;
  rating: number;
  status: 'active' | 'beta' | 'deprecated';
  lastUpdated: string;
  inputs: { name: string; type: string; required: boolean; description: string }[];
  outputs: { name: string; type: string; description: string }[];
  mcp_endpoint?: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}
