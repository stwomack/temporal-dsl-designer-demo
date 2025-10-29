import { WorkflowValidator } from '../validators';
import { WorkflowDefinition, NodeType, TriggerType, ActionType } from '../types';

describe('WorkflowValidator', () => {
  it('should validate a valid workflow', () => {
    const workflow: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test Workflow',
      version: '1.0.0',
      nodes: [
        {
          id: 'trigger-1',
          type: NodeType.TRIGGER,
          name: 'Start',
          triggerType: TriggerType.MANUAL,
          config: {},
        },
        {
          id: 'action-1',
          type: NodeType.ACTION,
          name: 'Send Email',
          actionType: ActionType.SEND_EMAIL,
          config: {},
        },
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'trigger-1',
          target: 'action-1',
        },
      ],
    };

    const result = WorkflowValidator.validate(workflow);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject workflow without trigger', () => {
    const workflow: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test Workflow',
      version: '1.0.0',
      nodes: [
        {
          id: 'action-1',
          type: NodeType.ACTION,
          name: 'Send Email',
          actionType: ActionType.SEND_EMAIL,
          config: {},
        },
      ],
      edges: [],
    };

    const result = WorkflowValidator.validate(workflow);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Workflow must have at least one trigger node');
  });

  it('should detect unreachable nodes', () => {
    const workflow: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test Workflow',
      version: '1.0.0',
      nodes: [
        {
          id: 'trigger-1',
          type: NodeType.TRIGGER,
          name: 'Start',
          triggerType: TriggerType.MANUAL,
          config: {},
        },
        {
          id: 'action-1',
          type: NodeType.ACTION,
          name: 'Send Email',
          actionType: ActionType.SEND_EMAIL,
          config: {},
        },
      ],
      edges: [],
    };

    const result = WorkflowValidator.validate(workflow);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Unreachable nodes'))).toBe(true);
  });
});
