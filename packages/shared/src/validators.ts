import { WorkflowDefinition, WorkflowNode, NodeType } from './types';

export class WorkflowValidator {
  static validate(workflow: WorkflowDefinition): ValidationResult {
    const errors: string[] = [];

    if (!workflow.id || !workflow.name || !workflow.version) {
      errors.push('Workflow must have id, name, and version');
    }

    if (!workflow.nodes || workflow.nodes.length === 0) {
      errors.push('Workflow must have at least one node');
    }

    const triggerNodes = workflow.nodes.filter(n => n.type === NodeType.TRIGGER);
    if (triggerNodes.length === 0) {
      errors.push('Workflow must have at least one trigger node');
    }

    const nodeIds = new Set<string>();
    for (const node of workflow.nodes) {
      if (nodeIds.has(node.id)) {
        errors.push(`Duplicate node id: ${node.id}`);
      }
      nodeIds.add(node.id);

      const nodeErrors = this.validateNode(node);
      errors.push(...nodeErrors);
    }

    for (const edge of workflow.edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge source node not found: ${edge.source}`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge target node not found: ${edge.target}`);
      }
    }

    const reachable = this.findReachableNodes(workflow);
    const unreachable = workflow.nodes.filter(n => !reachable.has(n.id));
    if (unreachable.length > 0) {
      errors.push(`Unreachable nodes: ${unreachable.map(n => n.id).join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private static validateNode(node: WorkflowNode): string[] {
    const errors: string[] = [];

    if (!node.id || !node.name) {
      errors.push(`Node must have id and name: ${node.id}`);
    }

    switch (node.type) {
      case NodeType.TRIGGER:
        if (!node.triggerType) {
          errors.push(`Trigger node must have triggerType: ${node.id}`);
        }
        break;
      case NodeType.ACTION:
        if (!node.actionType) {
          errors.push(`Action node must have actionType: ${node.id}`);
        }
        break;
      case NodeType.CONDITION:
        if (!node.condition) {
          errors.push(`Condition node must have condition: ${node.id}`);
        }
        break;
      case NodeType.DELAY:
        if (!node.duration || !node.unit) {
          errors.push(`Delay node must have duration and unit: ${node.id}`);
        }
        break;
      case NodeType.PARALLEL:
        if (!node.branches || node.branches.length < 2) {
          errors.push(`Parallel node must have at least 2 branches: ${node.id}`);
        }
        break;
    }

    return errors;
  }

  private static findReachableNodes(workflow: WorkflowDefinition): Set<string> {
    const reachable = new Set<string>();
    const triggers = workflow.nodes.filter(n => n.type === NodeType.TRIGGER);

    for (const trigger of triggers) {
      this.dfs(trigger.id, workflow.edges, reachable);
    }

    return reachable;
  }

  private static dfs(nodeId: string, edges: { source: string; target: string }[], visited: Set<string>) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const outgoing = edges.filter(e => e.source === nodeId);
    for (const edge of outgoing) {
      this.dfs(edge.target, edges, visited);
    }
  }
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
