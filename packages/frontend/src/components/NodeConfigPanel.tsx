
import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { ActionType, TriggerType } from '@journey/shared';

interface NodeConfigPanelProps {
    selectedNode: Node | null;
    onClose: () => void;
    onSave: (nodeId: string, config: any) => void;
}

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({ selectedNode, onClose, onSave }) => {
    const [config, setConfig] = useState<any>({});

    useEffect(() => {
        if (selectedNode) {
            setConfig(selectedNode.data?.config || {});
        }
    }, [selectedNode]);

    if (!selectedNode) return null;

    const handleSave = () => {
        onSave(selectedNode.id, config);
        onClose();
    };

    const renderActionConfig = () => {
        const actionType = selectedNode.data?.actionType;

        if (actionType === ActionType.SEND_EMAIL) {
            return (
                <div style={{ marginTop: '10px' }}>
                    <h4>Email Configuration</h4>
                    <div style={{ marginBottom: '10px' }}>
                        <label>To:</label>
                        <input
                            type="text"
                            value={config.email?.to || ''}
                            onChange={(e) => setConfig({
                                ...config,
                                email: { ...config.email, to: e.target.value }
                            })}
                            placeholder="recipient@example.com"
                            style={{ width: '100%', padding: '5px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Subject:</label>
                        <input
                            type="text"
                            value={config.email?.subject || ''}
                            onChange={(e) => setConfig({
                                ...config,
                                email: { ...config.email, subject: e.target.value }
                            })}
                            placeholder="Email subject"
                            style={{ width: '100%', padding: '5px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Body:</label>
                        <textarea
                            value={config.email?.body || ''}
                            onChange={(e) => setConfig({
                                ...config,
                                email: { ...config.email, body: e.target.value }
                            })}
                            placeholder="Email body (supports templates like {{input.userName}})"
                            rows={4}
                            style={{ width: '100%', padding: '5px' }}
                        />
                    </div>
                </div>
            );
        }

        if (actionType === ActionType.SEND_WEBHOOK) {
            return (
                <div style={{ marginTop: '10px' }}>
                    <h4>Webhook Configuration</h4>
                    <div style={{ marginBottom: '10px' }}>
                        <label>URL:</label>
                        <input
                            type="text"
                            value={config.webhook?.url || ''}
                            onChange={(e) => setConfig({
                                ...config,
                                webhook: { ...config.webhook, url: e.target.value }
                            })}
                            placeholder="https://api.example.com/webhook"
                            style={{ width: '100%', padding: '5px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Method:</label>
                        <select
                            value={config.webhook?.method || 'POST'}
                            onChange={(e) => setConfig({
                                ...config,
                                webhook: { ...config.webhook, method: e.target.value }
                            })}
                            style={{ width: '100%', padding: '5px' }}
                        >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Body (JSON):</label>
                        <textarea
                            value={config.webhook?.body || ''}
                            onChange={(e) => setConfig({
                                ...config,
                                webhook: { ...config.webhook, body: e.target.value }
                            })}
                            placeholder='{"key": "value"}'
                            rows={4}
                            style={{ width: '100%', padding: '5px' }}
                        />
                    </div>
                </div>
            );
        }

        if (actionType === ActionType.EMIT_EVENT) {
            return (
                <div style={{ marginTop: '10px' }}>
                    <h4>Event Configuration</h4>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Event Type:</label>
                        <input
                            type="text"
                            value={config.event?.eventType || ''}
                            onChange={(e) => setConfig({
                                ...config,
                                event: { ...config.event, eventType: e.target.value }
                            })}
                            placeholder="order.created"
                            style={{ width: '100%', padding: '5px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Payload (JSON):</label>
                        <textarea
                            value={config.event?.payload ? JSON.stringify(config.event.payload, null, 2) : ''}
                            onChange={(e) => {
                                try {
                                    const payload = JSON.parse(e.target.value);
                                    setConfig({
                                        ...config,
                                        event: { ...config.event, payload }
                                    });
                                } catch (err) {
                                    // Invalid JSON, just update the text
                                    setConfig({
                                        ...config,
                                        event: { ...config.event, payload: e.target.value }
                                    });
                                }
                            }}
                            placeholder='{"orderId": "123"}'
                            rows={4}
                            style={{ width: '100%', padding: '5px' }}
                        />
                    </div>
                </div>
            );
        }

        return null;
    };

    const renderTriggerConfig = () => {
        const triggerType = selectedNode.data?.triggerType;

        if (triggerType === TriggerType.EVENT) {
            return (
                <div style={{ marginTop: '10px' }}>
                    <h4>Event Trigger Configuration</h4>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Event Type:</label>
                        <input
                            type="text"
                            value={config.eventType || ''}
                            onChange={(e) => setConfig({ ...config, eventType: e.target.value })}
                            placeholder="order.created"
                            style={{ width: '100%', padding: '5px' }}
                        />
                    </div>
                </div>
            );
        }

        if (triggerType === TriggerType.SCHEDULE) {
            return (
                <div style={{ marginTop: '10px' }}>
                    <h4>Schedule Trigger Configuration</h4>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Cron Expression:</label>
                        <input
                            type="text"
                            value={config.schedule || ''}
                            onChange={(e) => setConfig({ ...config, schedule: e.target.value })}
                            placeholder="0 9 * * *"
                            style={{ width: '100%', padding: '5px' }}
                        />
                    </div>
                </div>
            );
        }

        return <p>Manual trigger - no configuration needed</p>;
    };

    return (
        <div style={{
            position: 'fixed',
            right: 0,
            top: 0,
            width: '300px',
            height: '100vh',
            backgroundColor: 'white',
            boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
            padding: '20px',
            overflowY: 'auto',
            zIndex: 1000
        }}>
            <h3>Configure Node</h3>
            <p><strong>Name:</strong> {selectedNode.data?.label}</p>
            <p><strong>Type:</strong> {selectedNode.data?.nodeType}</p>

            {selectedNode.data?.nodeType === 'action' && renderActionConfig()}
            {selectedNode.data?.nodeType === 'trigger' && renderTriggerConfig()}

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button onClick={handleSave} style={{ flex: 1, padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Save
                </button>
                <button onClick={onClose} style={{ flex: 1, padding: '10px', backgroundColor: '#f44336', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default NodeConfigPanel;