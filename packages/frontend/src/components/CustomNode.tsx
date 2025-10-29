import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeType } from '@journey/shared';

function CustomNode({ data }: NodeProps) {
  const getNodeColor = () => {
    switch (data.nodeType) {
      case NodeType.TRIGGER:
        return '#10b981';
      case NodeType.ACTION:
        return '#3b82f6';
      case NodeType.CONDITION:
        return '#f59e0b';
      case NodeType.DELAY:
        return '#8b5cf6';
      case NodeType.PARALLEL:
        return '#ec4899';
      case NodeType.END:
        return '#6b7280';
      default:
        return '#3b82f6';
    }
  };

  const getNodeIcon = () => {
    switch (data.nodeType) {
      case NodeType.TRIGGER:
        return '▶';
      case NodeType.ACTION:
        return '⚡';
      case NodeType.CONDITION:
        return '?';
      case NodeType.DELAY:
        return '⏱';
      case NodeType.PARALLEL:
        return '⫸';
      case NodeType.END:
        return '■';
      default:
        return '○';
    }
  };

  const style = {
    background: '#fff',
    border: `2px solid ${getNodeColor()}`,
    borderRadius: '8px',
    padding: '12px',
    minWidth: '150px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: getNodeColor(),
  };

  return (
    <div style={style}>
      <Handle type="target" position={Position.Top} />
      <div style={headerStyle}>
        <span>{getNodeIcon()}</span>
        <span>{data.label}</span>
      </div>
      {data.description && (
        <div style={{ fontSize: '12px', color: '#666' }}>{data.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default memo(CustomNode);
