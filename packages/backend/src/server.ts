import express from 'express';
import cors from 'cors';
import {
  initializeTemporalClient,
  createWorkflow,
  executeWorkflow,
  getWorkflowStatus,
  cancelWorkflow,
  validateWorkflow,
} from './api/workflowController';
import { config } from './config';

async function startServer() {
  await initializeTemporalClient();

  const app = express();

  app.use(cors({ origin: config.server.corsOrigin }));
  app.use(express.json());

  app.post('/api/workflows', createWorkflow);
  app.post('/api/workflows/execute', executeWorkflow);
  app.post('/api/workflows/validate', validateWorkflow);
  app.get('/api/workflows/:workflowId/status', getWorkflowStatus);
  app.delete('/api/workflows/:workflowId', cancelWorkflow);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.listen(config.server.port, () => {
    console.log(`Server running on port ${config.server.port}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
