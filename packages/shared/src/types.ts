export enum NodeType {
  TRIGGER = 'trigger',
  ACTION = 'action',
  CONDITION = 'condition',
  DELAY = 'delay',
  PARALLEL = 'parallel',
  END = 'end'
}

export enum ActionType {
  SEND_EMAIL = 'send_email',
  SEND_WEBHOOK = 'send_webhook',
  EMIT_EVENT = 'emit_event'
}

export enum TriggerType {
  EVENT = 'event',
  SCHEDULE = 'schedule',
  MANUAL = 'manual'
}

export interface WorkflowParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  value?: any;
  source?: 'input' | 'attribute' | 'event' | 'computed';
}

export interface NodeBase {
  id: string;
  type: NodeType;
  name: string;
  description?: string;
  parameters?: Record<string, WorkflowParameter>;
}

export interface TriggerNode extends NodeBase {
  type: NodeType.TRIGGER;
  triggerType: TriggerType;
  config: TriggerConfig;
}

export interface TriggerConfig {
  eventType?: string;
  eventFilter?: Record<string, any>;
  schedule?: string;
}

export interface ActionNode extends NodeBase {
  type: NodeType.ACTION;
  actionType: ActionType;
  config: ActionConfig;
  retryPolicy?: RetryPolicy;
}

export interface ActionConfig {
  email?: EmailConfig;
  webhook?: WebhookConfig;
  event?: EventConfig;
}

export interface EmailConfig {
  to: string;
  subject: string;
  body: string;
  templateId?: string;
  templateData?: Record<string, any>;
}

export interface WebhookConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

export interface EventConfig {
  eventType: string;
  payload: Record<string, any>;
}

export interface ConditionNode extends NodeBase {
  type: NodeType.CONDITION;
  condition: ConditionExpression;
  trueBranch?: string;
  falseBranch?: string;
}

export interface ConditionExpression {
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'and' | 'or';
  left: string | ConditionExpression;
  right: string | number | boolean | ConditionExpression;
}

export interface DelayNode extends NodeBase {
  type: NodeType.DELAY;
  duration: number;
  unit: 'seconds' | 'minutes' | 'hours' | 'days';
}

export interface ParallelNode extends NodeBase {
  type: NodeType.PARALLEL;
  branches: string[];
}

export interface EndNode extends NodeBase {
  type: NodeType.END;
}

export type WorkflowNode = TriggerNode | ActionNode | ConditionNode | DelayNode | ParallelNode | EndNode;

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  parameters?: Record<string, WorkflowParameter>;
  metadata?: Record<string, any>;
}

export interface RetryPolicy {
  maxAttempts: number;
  initialInterval: number;
  backoffCoefficient: number;
  maximumInterval: number;
}

export interface WorkflowExecution {
  workflowId: string;
  executionId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
}

export interface EventTrigger {
  eventType: string;
  payload: Record<string, any>;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AttributeQuery {
  userId: string;
  attributes: string[];
}

export interface AttributeResult {
  userId: string;
  attributes: Record<string, any>;
}
