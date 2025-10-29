import { NodeType, ActionType, TriggerType } from '@journey/shared';

interface NodePanelProps {
  onAddNode: (nodeType: NodeType, additionalData?: any) => void;
}

export default function NodePanel({ onAddNode }: NodePanelProps) {
  const nodeTypes = [
    {
      type: NodeType.TRIGGER,
      label: 'Trigger',
      color: '#10b981',
      options: [
        { label: 'Event Trigger', data: { triggerType: TriggerType.EVENT } },
        { label: 'Schedule Trigger', data: { triggerType: TriggerType.SCHEDULE } },
        { label: 'Manual Trigger', data: { triggerType: TriggerType.MANUAL } },
      ],
    },
    {
      type: NodeType.ACTION,
      label: 'Action',
      color: '#3b82f6',
      options: [
        { label: 'Send Email', data: { actionType: ActionType.SEND_EMAIL } },
        { label: 'Send Webhook', data: { actionType: ActionType.SEND_WEBHOOK } },
        { label: 'Emit Event', data: { actionType: ActionType.EMIT_EVENT } },
      ],
    },
    {
      type: NodeType.CONDITION,
      label: 'Condition',
      color: '#f59e0b',
      options: [{ label: 'Add Condition', data: {} }],
    },
    {
      type: NodeType.DELAY,
      label: 'Delay',
      color: '#8b5cf6',
      options: [{ label: 'Add Delay', data: {} }],
    },
    {
      type: NodeType.PARALLEL,
      label: 'Parallel',
      color: '#ec4899',
      options: [{ label: 'Add Parallel', data: {} }],
    },
    {
      type: NodeType.END,
      label: 'End',
      color: '#6b7280',
      options: [{ label: 'Add End', data: {} }],
    },
  ];

  return (
    <div style={styles.panel}>
      <h3 style={styles.title}>Workflow Nodes</h3>
      {nodeTypes.map((category) => (
        <div key={category.type} style={styles.category}>
          <div style={{ ...styles.categoryTitle, color: category.color }}>
            {category.label}
          </div>
          {category.options.map((option, idx) => (
            <button
              key={idx}
              style={{ ...styles.button, borderColor: category.color }}
              onClick={() => onAddNode(category.type, option.data)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

const styles = {
  panel: {
    width: '250px',
    background: '#f9fafb',
    padding: '16px',
    borderRight: '1px solid #e5e7eb',
    overflowY: 'auto' as const,
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#111827',
  },
  category: {
    marginBottom: '16px',
  },
  categoryTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  button: {
    width: '100%',
    padding: '8px 12px',
    marginBottom: '4px',
    background: '#fff',
    border: '1px solid',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    textAlign: 'left' as const,
    transition: 'all 0.2s',
  },
};
