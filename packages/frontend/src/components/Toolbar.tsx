interface ToolbarProps {
  onSave: () => void;
  onExecute: () => void;
  workflowInfo: { id: string; name: string; version: string };
  onWorkflowInfoChange: (info: { id: string; name: string; version: string }) => void;
}

export default function Toolbar({ onSave, onExecute, workflowInfo, onWorkflowInfoChange }: ToolbarProps) {
  return (
    <div style={styles.toolbar}>
      <div style={styles.left}>
        <h1 style={styles.title}>Journey Platform</h1>
        <input
          type="text"
          value={workflowInfo.name}
          onChange={(e) => onWorkflowInfoChange({ ...workflowInfo, name: e.target.value })}
          style={styles.input}
          placeholder="Workflow Name"
        />
      </div>
      <div style={styles.right}>
        <button onClick={onSave} style={styles.button}>
          Save
        </button>
        <button onClick={onExecute} style={{ ...styles.button, ...styles.executeButton }}>
          Execute
        </button>
      </div>
    </div>
  );
}

const styles = {
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    background: '#1f2937',
    borderBottom: '1px solid #374151',
    color: '#fff',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: 0,
  },
  input: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #4b5563',
    background: '#374151',
    color: '#fff',
    fontSize: '14px',
    minWidth: '200px',
  },
  right: {
    display: 'flex',
    gap: '12px',
  },
  button: {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    background: '#3b82f6',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  executeButton: {
    background: '#10b981',
  },
};
