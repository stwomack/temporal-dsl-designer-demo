import {
  proxyActivities,
  sleep,
  condition,
  defineSignal,
  setHandler,
  ParentClosePolicy,
  startChild,
} from '@temporalio/workflow';
import type * as activities from '../activities/workflowActivities';
import {
  WorkflowDefinition,
  WorkflowNode,
  NodeType,
  ActionNode,
  ConditionNode,
  DelayNode,
  ParallelNode,
  WorkflowParameter,
} from '@journey/shared';
import { ParameterResolver, ConditionEvaluator } from '@journey/shared';

const { executeAction, getAttributes, logActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
  retry: {
    initialInterval: '1s',
    maximumInterval: '10s',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

export const eventSignal = defineSignal<[Record<string, any>]>('event');

export async function journeyWorkflow(
  workflowDef: WorkflowDefinition,
  input: Record<string, any>
): Promise<any> {
  let workflowContext: Record<string, any> = {
    input,
    parameters: {},
    results: {},
  };

  const pendingSignals: Record<string, any>[] = [];

  setHandler(eventSignal, (payload: Record<string, any>) => {
    pendingSignals.push(payload);
  });

  const startNode = workflowDef.nodes.find((n) => n.type === NodeType.TRIGGER);
  if (!startNode) {
    throw new Error('No trigger node found in workflow');
  }

  await logActivity('Starting workflow execution', {
    workflowId: workflowDef.id,
    workflowName: workflowDef.name,
  });

  const result = await executeNode(startNode, workflowDef, workflowContext);

  await logActivity('Workflow execution completed', { result });

  return result;
}

async function executeNode(
  node: WorkflowNode,
  workflowDef: WorkflowDefinition,
  context: Record<string, any>
): Promise<any> {
  await logActivity(`Executing node: ${node.name}`, { nodeId: node.id, type: node.type });

  let result: any;

  switch (node.type) {
    case NodeType.TRIGGER:
      result = { triggered: true };
      break;

    case NodeType.ACTION:
      result = await executeActionNode(node as ActionNode, context);
      break;

    case NodeType.CONDITION:
      result = await executeConditionNode(node as ConditionNode, workflowDef, context);
      return result;

    case NodeType.DELAY:
      result = await executeDelayNode(node as DelayNode);
      break;

    case NodeType.PARALLEL:
      result = await executeParallelNode(node as ParallelNode, workflowDef, context);
      break;

    case NodeType.END:
      return context.results;

    default:
      throw new Error(`Unknown node type: ${(node as any).type}`);
  }

  context.results[node.id] = result;

  const nextNodes = findNextNodes(node.id, workflowDef);
  if (nextNodes.length === 0) {
    return context.results;
  }

  for (const nextNode of nextNodes) {
    await executeNode(nextNode, workflowDef, context);
  }

  return context.results;
}

async function executeActionNode(node: ActionNode, context: Record<string, any>): Promise<any> {
  const resolvedConfig = resolveParameters(node.config, context);

  const retryPolicy = node.retryPolicy || {
    maxAttempts: 3,
    initialInterval: 1000,
    backoffCoefficient: 2,
    maximumInterval: 10000,
  };

  return await executeAction(node.actionType, resolvedConfig);
}

async function executeConditionNode(
  node: ConditionNode,
  workflowDef: WorkflowDefinition,
  context: Record<string, any>
): Promise<any> {
  const conditionResult = ConditionEvaluator.evaluate(node.condition, context);

  const branchNodeId = conditionResult ? node.trueBranch : node.falseBranch;
  if (!branchNodeId) {
    return { condition: conditionResult };
  }

  const branchNode = workflowDef.nodes.find((n) => n.id === branchNodeId);
  if (!branchNode) {
    throw new Error(`Branch node not found: ${branchNodeId}`);
  }

  return await executeNode(branchNode, workflowDef, context);
}

async function executeDelayNode(node: DelayNode): Promise<any> {
  const durationMs = convertToMilliseconds(node.duration, node.unit);
  await sleep(durationMs);
  return { delayed: node.duration, unit: node.unit };
}

async function executeParallelNode(
  node: ParallelNode,
  workflowDef: WorkflowDefinition,
  context: Record<string, any>
): Promise<any> {
  const branchResults = await Promise.all(
    node.branches.map(async (branchNodeId) => {
      const branchNode = workflowDef.nodes.find((n) => n.id === branchNodeId);
      if (!branchNode) {
        throw new Error(`Branch node not found: ${branchNodeId}`);
      }
      return await executeNode(branchNode, workflowDef, { ...context });
    })
  );

  return { branches: branchResults };
}

function findNextNodes(nodeId: string, workflowDef: WorkflowDefinition): WorkflowNode[] {
  const outgoingEdges = workflowDef.edges.filter((e) => e.source === nodeId);
  return outgoingEdges
    .map((edge) => workflowDef.nodes.find((n) => n.id === edge.target))
    .filter((n): n is WorkflowNode => n !== undefined);
}

function resolveParameters(config: any, context: Record<string, any>): any {
  if (typeof config === 'string') {
    return ParameterResolver.resolve(config, context);
  }

  if (Array.isArray(config)) {
    return config.map((item) => resolveParameters(item, context));
  }

  if (typeof config === 'object' && config !== null) {
    const resolved: any = {};
    for (const key in config) {
      resolved[key] = resolveParameters(config[key], context);
    }
    return resolved;
  }

  return config;
}

function convertToMilliseconds(duration: number, unit: string): number {
  switch (unit) {
    case 'seconds':
      return duration * 1000;
    case 'minutes':
      return duration * 60 * 1000;
    case 'hours':
      return duration * 60 * 60 * 1000;
    case 'days':
      return duration * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unknown time unit: ${unit}`);
  }
}
