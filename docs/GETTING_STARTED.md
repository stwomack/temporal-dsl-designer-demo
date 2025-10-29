# Getting Started with Journey Platform

This guide will walk you through setting up and running Journey Platform for the first time.

## Prerequisites

Before starting, ensure you have:

- Node.js 18 or higher installed
- Docker Desktop installed and running
- At least 4GB of free RAM
- Basic understanding of workflows and event-driven systems

## Installation

### Step 1: Clone and Setup

```bash
cd temporal-dsl-designer-demo
npm install
```

### Step 2: Start Infrastructure Services

```bash
./scripts/dev.sh
```

This command will:
- Start Kafka and Zookeeper
- Start Temporal Server and PostgreSQL
- Start Temporal UI
- Start MailHog for email testing
- Install all dependencies
- Build the shared package

Wait for the message "Journey Platform is ready!"

### Step 3: Verify Services

Check that all Docker services are running:

```bash
docker compose ps
```

You should see:
- zookeeper (host port 2182)
- kafka (host port 9093)
- postgresql (host port 5433)
- temporal (host port 7234)
- temporal-ui (host port 8081)
- mailhog (ports 1025, 8025)

### Step 4: Start Application Services

Open three terminal windows:

**Terminal 1 - Backend API Server:**
```bash
npm run dev:backend
```

Wait for: "Server running on port 3001"

**Terminal 2 - Temporal Worker:**
```bash
npm run dev:worker
```

Wait for: "Worker started"

**Terminal 3 - Frontend:**
```bash
npm run dev:frontend
```

Wait for: "Local: http://localhost:5173"

## First Workflow

### Create a Simple Email Workflow

1. Open http://localhost:5173 in your browser

2. You'll see the Journey Platform designer with:
   - Left sidebar: Available node types
   - Center: Canvas for workflow design
   - Top: Toolbar with workflow name and action buttons

3. Add a Trigger Node:
   - Click "Manual Trigger" in the left sidebar
   - A trigger node appears on the canvas

4. Add an Action Node:
   - Click "Send Email" in the left sidebar
   - An email action node appears on the canvas
   - Configure the node:
     - To: 
     - Subject: Hello from Journey Platform
     - Body: Hello from Journey Platform!

5. Connect the Nodes:
   - Click and drag from the bottom dot of the trigger node
   - Release on the top dot of the email action node
   - An edge connects them

6. Configure the Email Node:
   - Click on the email action node
   - In the future, a configuration panel will appear
   - For now, the default configuration will be used

7. Save the Workflow:
   - Click the "Save" button in the toolbar
   - You should see "Workflow saved successfully!"

8. Execute the Workflow:
   - Click the "Execute" button
   - The workflow will start running
   - Note the workflow ID from the alert

9. Check Email:
   - Open http://localhost:8025 (MailHog)
   - You should see the email sent by the workflow

10. Check Temporal UI:
    - Open http://localhost:8081
    - Navigate to "Workflows"
    - Find your workflow execution
    - View the execution timeline and results

## Understanding the Components

### Frontend (http://localhost:5173)

The visual workflow designer where you:
- Drag and drop nodes to create workflows
- Connect nodes to define execution order
- Configure node parameters
- Save and execute workflows

### Backend API (http://localhost:3001)

The REST API that:
- Validates workflow definitions
- Starts workflow executions
- Queries workflow status
- Manages workflow lifecycle

### Temporal UI (http://localhost:8081)

Monitor and debug workflows:
- View all workflow executions
- See execution timeline
- Inspect workflow state
- Retry failed workflows
- View activity logs

### MailHog (http://localhost:8025)

Email testing interface:
- Capture all outgoing emails
- View email content
- No emails are actually sent externally
- Perfect for development and testing

## Next Steps

### Try More Complex Workflows

#### Workflow with Delay

1. Add a Manual Trigger
2. Add a Delay node (5 seconds)
3. Add an Email action
4. Connect: Trigger -> Delay -> Email
5. Execute and watch in Temporal UI

#### Workflow with Condition

1. Add a Manual Trigger
2. Add a Condition node
3. Add two Email actions (high value / standard)
4. Connect accordingly
5. Execute with different inputs

#### Workflow with Parallel Actions

1. Add a Manual Trigger
2. Add a Parallel node
3. Add multiple Email actions
4. Configure parallel branches
5. All emails will be sent simultaneously

### Explore the Code

**Frontend Code:**
```
packages/frontend/src/
  components/WorkflowDesigner.tsx  - Main designer
  components/CustomNode.tsx        - Node rendering
  utils/dslConverter.ts            - DSL conversion
```

**Backend Code:**
```
packages/backend/src/
  workflows/journeyWorkflow.ts     - Workflow logic
  activities/workflowActivities.ts - Activity functions
  stores/                          - Action/Event/Attribute stores
```

**Shared Types:**
```
packages/shared/src/
  types.ts                         - DSL type definitions
  validators.ts                    - Validation logic
  utils.ts                         - Helper functions
```

## Common Tasks

### View Workflow Logs

```bash
docker compose logs -f temporal
```

### Restart Services

```bash
./scripts/stop.sh
./scripts/start.sh
```

### Clear All Data

```bash
docker compose down -v
docker compose up -d
```

### Run Tests

```bash
./scripts/test.sh
```

## Troubleshooting

### "Cannot connect to Temporal"

Check Temporal is running:
```bash
docker compose ps temporal
docker compose logs temporal
```

Wait 10-15 seconds after starting Docker services.

### "Kafka connection failed"

Check Kafka is running:
```bash
docker compose ps kafka
docker compose logs kafka
```

Ensure port 9092 is not in use by another application.

### "Port already in use"

Find and kill the process:
```bash
lsof -i :3001  # Backend
lsof -i :5173  # Frontend
lsof -i :7233  # Temporal
```

Then restart the service.

### "Worker not processing workflows"

Check the worker is running:
```bash
ps aux | grep "ts-node src/worker.ts"
```

Check worker logs for errors.

### Frontend not loading

Clear browser cache and reload.
Check console for errors (F12).

## Development Tips

### Hot Reload

All services support hot reload:
- Frontend: Vite hot module replacement
- Backend: ts-node with watch mode
- Worker: Restart required for workflow changes

### Debugging

**Frontend:**
- Use React DevTools
- Check browser console
- Use Redux DevTools (future)

**Backend:**
- Use VS Code debugger
- Add console.log statements
- Check Temporal UI for workflow state

**Temporal Workflows:**
- View in Temporal UI
- Check activity history
- Inspect event history
- Use workflow timeline

### Best Practices

1. Always validate workflows before executing
2. Use descriptive node names
3. Test with small delays first
4. Monitor Temporal UI during development
5. Check MailHog for email testing
6. Use structured logging
7. Keep workflows simple initially

## Learning Resources

### Understanding Temporal

- Temporal Docs: https://docs.temporal.io
- Temporal Samples: https://github.com/temporalio/samples-typescript
- Temporal UI Guide: https://docs.temporal.io/web-ui

### Understanding React Flow

- React Flow Docs: https://reactflow.dev
- React Flow Examples: https://reactflow.dev/examples

### Understanding Kafka

- Kafka Docs: https://kafka.apache.org/documentation/
- KafkaJS Docs: https://kafka.js.org

## What's Next?

Now that you have Journey Platform running:

1. Read the [Architecture Documentation](./ARCHITECTURE.md)
2. Explore the [API Documentation](./API.md)
3. Create more complex workflows
4. Integrate with your applications
5. Extend with custom node types
6. Add your own actions

## Getting Help

If you encounter issues:

1. Check the logs
2. Review the troubleshooting section
3. Search existing GitHub issues
4. Create a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Relevant logs

Happy workflow building!
