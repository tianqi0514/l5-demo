// 能源采购合规 - 决策室类型定义

export type IssueStatus =
  | 'DRAFT' | 'INITIALIZING' | 'OPEN' | 'DISCUSSING'
  | 'PENDING_HUMAN' | 'RESOLVED' | 'CANCELLED' | 'SUSPENDED' | 'FROZEN' | 'EXPIRED';

export type IssueCategory =
  | 'bid_compliance' | 'supplier_risk' | 'contract_risk' | 'collusion_detection'
  | 'budget_overrun' | 'related_party' | 'supplier_elimination' | 'anti_corruption'
  | 'centralized_procurement' | 'sanction_screening' | 'process_audit' | 'other';

export type SensitivityLevel = 'normal' | 'sensitive' | 'highly_sensitive';
export type UrgencyLevel = 'normal' | 'urgent' | 'critical';

export type RoleId =
  | 'ceo' | 'cco' | 'vp_procurement' | 'vp_compliance' | 'vp_audit' | 'vp_finance'
  | 'mgr_bid' | 'mgr_supplier' | 'mgr_contract' | 'mgr_risk' | 'mgr_audit'
  | 'mgr_legal' | 'mgr_cost' | 'gm_north' | 'gm_east' | 'coord_agent';

export interface User {
  id: string;
  role_id: RoleId;
  name: string;
  title: string;
  department: string;
  email: string;
  factory_scope: string[];
  product_line_scope: string[];
  is_active: boolean;
}

export interface Agent {
  id: string;
  user_id: string | null;
  display_name: string;
  avatar_initial: string;
  stance_config: {
    risk_preference: 'conservative' | 'balanced' | 'aggressive';
    key_constraints: string[];
    delegation_scope: string[];
  };
  knowledge_sources: string[];
  is_active: boolean;
  last_synced_at: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  urgency: UrgencyLevel;
  sensitivity: SensitivityLevel;
  creator_user_id: string;
  creatorName: string;
  participant_role_ids: RoleId[];
  ontology_node_ids: string[];
  parent_topic_id: string | null;
  referenced_asset_ids: string[];
  source_template_id: string | null;
  pending_user_id: string | null;
  pendingUserName: string | null;
  created_at: string;
  updated_at: string;
  decided_at: string | null;
  decided_by_user_id: string | null;
  final_resolution: string | null;
  referencedIssues?: { id: string; title: string; resolution: string }[];
}

export interface Message {
  id: string;
  topic_id: string;
  author_type: 'user' | 'agent' | 'system';
  author_id: string;
  author_display: string;
  author_color_class: string;
  message_type: 'STATEMENT' | 'QUESTION' | 'SUGGESTION' | 'OBJECTION' | 'VOTE' | 'CONSENSUS' | 'ALERT';
  content: string;
  mentions: { start: number; end: number; type: string; target_role_id: string; target_display: string }[];
  reply_to_message_id: string | null;
  reasoning_path: { ontology_refs: string[] } | null;
  attached_data: Record<string, unknown> | null;
  is_pinned: boolean;
  created_at: string;
  created_at_display: string;
}

export interface DecisionAsset {
  type: string;
  typeName: string;
  content: Record<string, unknown>;
}

export interface ResolutionStatus {
  consensusSummary?: string;
  pendingQuestion?: string;
  pending_user_id?: string;
  pendingUserName?: string;
  options: { id: string; label: string; isRecommended: boolean; isFollowup?: boolean }[];
}

export interface ActiveControl {
  type: string;
  ruleText: string;
  currentlyActive: boolean;
}

export interface ScopeCounts {
  pending: number;
  watching: number;
  decided: number;
  global?: number | null;
  restricted: number;
}

export interface Notification {
  id: string;
  user_id: string;
  notification_type: 'ESCALATED' | 'TOPIC_DECIDED' | 'MENTIONED' | 'CONSENSUS_REACHED';
  title: string;
  preview: string;
  topic_id: string;
  is_read: boolean;
  created_at: string;
}

export type ResolutionType = 'approved' | 'rejected' | 'escalated' | 'deferred' | 'pending';
export type ActiveControlType = 'ai_auto' | 'human_review' | 'escalated';
