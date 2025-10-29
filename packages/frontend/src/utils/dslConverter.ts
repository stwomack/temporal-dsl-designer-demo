import { Node, Edge } from 'reactflow';
import {
  WorkflowDefinition,
  WorkflowNode,
  WorkflowEdge,
  NodeType,
  ActionNode,
  TriggerNode,
  ConditionNode,
  DelayNode,
  ParallelNode,
  EndNode,
} from '@journey/shared';

export function convertToDSL(
  nodes: Node[],
  edges: Edge[],
  workflowInfo: { id: string; name: string; version: string }
): WorkflowDefinition {
  const workflowNodes: WorkflowNode[] = nodes.map((node) => {
    const baseNode = {
      id: node.id,
      name: node.data.label || node.id,
      description: node.data.description,
      parameters: node.data.parameters,
    };

    switch (node.data.nodeType) {
      case NodeType.TRIGGER:
        return {
          ...baseNode,
          type: NodeType.TRIGGER,
          triggerType: node.data.triggerType,
          config: node.data.config || {},
        } as TriggerNode;

      case NodeType.ACTION:
        return {
          ...baseNode,
          type: NodeType.ACTION,
          actionType: node.data.actionType,
          config: node.data.config || {},
          retryPolicy: node.data.retryPolicy,
        } as ActionNode;

      case NodeType.CONDITION:
        return {
          ...baseNode,
          type: NodeType.CONDITION,
          condition: node.data.condition,
          trueBranch: node.data.trueBranch,
          falseBranch: node.data.falseBranch,
        } as ConditionNode;

      case NodeType.DELAY:
        return {
          ...baseNode,
          type: NodeType.DELAY,
          duration: node.data.duration || 1,
          unit: node.data.unit || 'minutes',
        } as DelayNode;

      case NodeType.PARALLEL:
        return {
          ...baseNode,
          type: NodeType.PARALLEL,
          branches: node.data.branches || [],
        } as ParallelNode;

      case NodeType.END:
        return {
          ...baseNode,
          type: NodeType.END,
        } as EndNode;

      default:
        throw new Error(`Unknown node type: ${node.data.nodeType}`);
    }
  });

  const workflowEdges: WorkflowEdge[] = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label as string,
    condition: edge.data?.condition,
  }));

  return {
    id: workflowInfo.id,
    name: workflowInfo.name,
    version: workflowInfo.version,
    nodes: workflowNodes,
    edges: workflowEdges,
  };
}

export function convertFromDSL(workflow: WorkflowDefinition): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = workflow.nodes.map((node, index) => ({
    id: node.id,
    type: 'custom',
    position: { x: 250 * (index % 3), y: 150 * Math.floor(index / 3) },
    data: {
      label: node.name,
      nodeType: node.type,
      ...node,
    },
  }));

  const edges: Edge[] = workflow.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    data: { condition: edge.condition },
  }));

  return { nodes, edges };
}
