import axios from 'axios';
import { WorkflowDefinition } from '@journey/shared';

const API_BASE_URL = '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function createWorkflow(workflow: WorkflowDefinition) {
  const response = await client.post('/workflows', workflow);
  return response.data;
}

export async function executeWorkflow(workflowDef: WorkflowDefinition, input: Record<string, any>) {
  const response = await client.post('/workflows/execute', {
    workflowDef,
    input,
  });
  return response.data;
}

export async function getWorkflowStatus(workflowId: string) {
  const response = await client.get(`/workflows/${workflowId}/status`);
  return response.data;
}

export async function cancelWorkflow(workflowId: string) {
  const response = await client.delete(`/workflows/${workflowId}`);
  return response.data;
}

export async function validateWorkflow(workflow: WorkflowDefinition) {
  const response = await client.post('/workflows/validate', workflow);
  return response.data;
}
