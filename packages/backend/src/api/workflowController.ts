import { Request, Response } from 'express';
import { Connection, Client } from '@temporalio/client';
import { WorkflowDefinition, WorkflowValidator } from '@journey/shared';
import { config } from '../config';

let temporalClient: Client;

export async function initializeTemporalClient(): Promise<void> {
  const connection = await Connection.connect({
    address: config.temporal.address,
  });

  temporalClient = new Client({
    connection,
    namespace: config.temporal.namespace,
  });
}

export async function createWorkflow(req: Request, res: Response): Promise<void> {
  try {
    const workflowDef: WorkflowDefinition = req.body;

    const validation = WorkflowValidator.validate(workflowDef);
    if (!validation.valid) {
      res.status(400).json({ errors: validation.errors });
      return;
    }

    res.status(201).json({
      message: 'Workflow definition saved',
      workflowId: workflowDef.id,
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
}

export async function executeWorkflow(req: Request, res: Response): Promise<void> {
  try {
    const { workflowDef, input } = req.body;

    const validation = WorkflowValidator.validate(workflowDef);
    if (!validation.valid) {
      res.status(400).json({ errors: validation.errors });
      return;
    }

    const workflowId = `${workflowDef.id}-${Date.now()}`;

    const handle = await temporalClient.workflow.start('journeyWorkflow', {
      taskQueue: config.temporal.taskQueue,
      args: [workflowDef, input],
      workflowId,
    });

    res.status(200).json({
      workflowId,
      runId: handle.firstExecutionRunId,
      status: 'started',
    });
  } catch (error) {
    console.error('Error executing workflow:', error);
    res.status(500).json({ error: 'Failed to execute workflow' });
  }
}

export async function getWorkflowStatus(req: Request, res: Response): Promise<void> {
  try {
    const { workflowId } = req.params;

    const handle = temporalClient.workflow.getHandle(workflowId);
    const description = await handle.describe();

    res.status(200).json({
      workflowId,
      status: description.status.name,
      startTime: description.startTime,
      closeTime: description.closeTime,
    });
  } catch (error) {
    console.error('Error getting workflow status:', error);
    res.status(500).json({ error: 'Failed to get workflow status' });
  }
}

export async function cancelWorkflow(req: Request, res: Response): Promise<void> {
  try {
    const { workflowId } = req.params;

    const handle = temporalClient.workflow.getHandle(workflowId);
    await handle.cancel();

    res.status(200).json({
      workflowId,
      status: 'cancelled',
    });
  } catch (error) {
    console.error('Error cancelling workflow:', error);
    res.status(500).json({ error: 'Failed to cancel workflow' });
  }
}

export async function validateWorkflow(req: Request, res: Response): Promise<void> {
  try {
    const workflowDef: WorkflowDefinition = req.body;
    const validation = WorkflowValidator.validate(workflowDef);

    res.status(200).json(validation);
  } catch (error) {
    console.error('Error validating workflow:', error);
    res.status(500).json({ error: 'Failed to validate workflow' });
  }
}
