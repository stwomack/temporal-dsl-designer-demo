import { useCallback, useState } from 'react';
import ReactFlow, {
    Node,
    addEdge,
    Background,
    Controls,
    MiniMap,
    Connection,
    useNodesState,
    useEdgesState,
    NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import NodePanel from './NodePanel';
import Toolbar from './Toolbar';
import NodeConfigPanel from './NodeConfigPanel';
import { NodeType } from '@journey/shared';
import { convertToDSL } from '../utils/dslConverter';
import { executeWorkflow, validateWorkflow } from '../api/client';

const nodeTypes: NodeTypes = {
    custom: CustomNode,
};

export default function WorkflowDesigner() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [workflowInfo, setWorkflowInfo] = useState({
        id: 'workflow-1',
        name: 'My Workflow',
        version: '1.0.0',
    });
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onAddNode = useCallback(
        (nodeType: NodeType, additionalData: any = {}) => {
            const newNode: Node = {
                id: `${nodeType}-${Date.now()}`,
                type: 'custom',
                position: { x: Math.random() * 400, y: Math.random() * 400 },
                data: {
                    label: `${nodeType} ${nodes.length + 1}`,
                    nodeType,
                    ...additionalData,
                },
            };
            setNodes((nds) => [...nds, newNode]);
        },
        [nodes.length, setNodes]
    );

    const onSave = useCallback(async () => {
        try {
            const dsl = convertToDSL(nodes, edges, workflowInfo);
            const validation = await validateWorkflow(dsl);

            if (!validation.valid) {
                alert(`Validation errors:\n${validation.errors.join('\n')}`);
                return;
            }

            console.log('Workflow saved:', dsl);
            alert('Workflow saved successfully!');
        } catch (error) {
            console.error('Error saving workflow:', error);
            alert('Failed to save workflow');
        }
    }, [nodes, edges, workflowInfo]);

    const onExecute = useCallback(async () => {
        try {
            const dsl = convertToDSL(nodes, edges, workflowInfo);
            const input = { userId: 'test-user' };

            const result = await executeWorkflow(dsl, input);
            console.log('Workflow executed:', result);
            alert(`Workflow started! ID: ${result.workflowId}`);
        } catch (error) {
            console.error('Error executing workflow:', error);
            alert('Failed to execute workflow');
        }
    }, [nodes, edges, workflowInfo]);

    const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const handleConfigSave = useCallback((nodeId: string, config: any) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            config,
                        },
                    };
                }
                return node;
            })
        );
    }, [setNodes]);

    const handleClosePanel = useCallback(() => {
        setSelectedNode(null);
    }, []);

    return (
        <div style={styles.container}>
            <Toolbar
                onSave={onSave}
                onExecute={onExecute}
                workflowInfo={workflowInfo}
                onWorkflowInfoChange={setWorkflowInfo}
            />
            <div style={styles.content}>
                <NodePanel onAddNode={onAddNode} />
                <div style={styles.canvas}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Background />
                        <Controls />
                        <MiniMap />
                    </ReactFlow>
                </div>
            </div>

            {selectedNode && (
                <NodeConfigPanel
                    selectedNode={selectedNode}
                    onClose={handleClosePanel}
                    onSave={handleConfigSave}
                />
            )}
        </div>
    );
}

const styles = {
    container: {
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column' as const,
    },
    content: {
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
    },
    canvas: {
        flex: 1,
        position: 'relative' as const,
    },
};