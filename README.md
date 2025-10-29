# Journey Platform

A low-code workflow orchestration platform inspired by Airbnb's Journey Platform. Build and execute complex event-driven workflows using a visual drag-and-drop designer backed by Temporal workflows.

## Architecture

Journey Platform consists of three main components:

### 1. Visual Designer (Frontend)
- React-based drag-and-drop interface using React Flow
- Real-time workflow validation
- Node configuration panels
- Visual workflow execution tracking

### 2. DSL (Domain-Specific Language)
- JSON-based workflow definition format
- Type-safe schema with TypeScript
- Support for triggers, actions, conditions, delays, and parallel execution
- Parameter management and template resolution

### 3. Workflow Orchestrator (Backend)
- Temporal-based workflow execution engine
- Event Store (Kafka) for event-driven triggers
- Attribute Store for user context data
- Action Store for executing emails, webhooks, and events
- Automatic retries and error handling

## Features

- **Visual Workflow Designer**: Drag-and-drop workflow designer with React Flow
- **Node Configuration**: Click on any node to configure its properties in a side panel
- **Multiple Trigger Types**: Event-based, scheduled (cron), and manual triggers
- **Action Nodes**: Send emails, call webhooks, emit events
- **Conditional Branching**: Route workflows based on conditions
- **Delay Nodes**: Time-based orchestration
- **Parallel Execution**: Execute multiple paths simultaneously
- **Parameter Templating**: Use `{{input.userId}}` syntax for dynamic values
- **Real-time Validation**: Validate workflows before execution
- **Persistent Workflow State**: Temporal handles state management
- **Event-driven Architecture**: Kafka for event processing

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm or yarn

## Quick Start

### 1. Start Infrastructure

```bash
./scripts/dev.sh
```

This will start:
- Kafka and Zookeeper
- Temporal Server and UI
- PostgreSQL
- MailHog (email testing)

### 2. Start Services

In separate terminals:

```bash
npm run dev:backend
npm run dev:worker
npm run dev:frontend
```

Or start everything together:

```bash
npm start
```

### 3. Access Services

### 3. Create Your First Workflow

1. Open the frontend at http://localhost:5173
2. Add a **Manual Trigger** node from the left panel
3. Add an **Email Action** node
4. Add an **End** node
5. Connect them: Trigger → Email → End
6. **Click on the Email node** to configure it:
    - To: `test@example.com`
    - Subject: `Test Email`
    - Body: `Hello from Journey Platform!`
7. Click **Save** in the config panel
8. Click **Save Workflow** in the top toolbar
9. Click **Execute** to run the workflow
10. Check http://localhost:8025 to see the email in MailHog!

- Backend API: http://localhost:3001
- Temporal UI: http://localhost:8081

## Workflow DSL

### Node Types

#### Trigger Node
```json
{
  "id": "trigger-1",
  "type": "trigger",
  "name": "Order Created",
  "triggerType": "event",
  "config": {
    "eventType": "order.created",
    "eventFilter": {
      "status": "pending"
    }
  }
}
```

#### Action Node
```json
{
  "id": "action-1",
  "type": "action",
  "name": "Send Confirmation Email",
  "actionType": "send_email",
  "config": {
    "email": {
      "to": "{{input.userEmail}}",
      "subject": "Order Confirmation",
      "body": "Your order {{input.orderId}} has been received"
    }
  }
}
```

#### Condition Node
```json
{
  "id": "condition-1",
  "type": "condition",
  "name": "Check Order Amount",
  "condition": {
    "operator": "greater_than",
    "left": "{{input.amount}}",
    "right": 100
  },
  "trueBranch": "action-high-value",
  "falseBranch": "action-standard"
}
```

#### Delay Node
```json
{
  "id": "delay-1",
  "type": "delay",
  "name": "Wait 24 Hours",
  "duration": 24,
  "unit": "hours"
}
```

#### Parallel Node
```json
{
  "id": "parallel-1",
  "type": "parallel",
  "name": "Send Notifications",
  "branches": ["email-action", "sms-action", "push-action"]
}
```

### Parameter Templates

Use double curly braces for dynamic values:

```
{{input.userId}}          # From workflow input
{{attributes.userEmail}}   # From attribute store
{{event.payload.orderId}}  # From event data
{{results.action-1.id}}    # From previous node results
```

## API Reference

### Create Workflow
```http
POST /api/workflows
Content-Type: application/json

{
  "id": "workflow-1",
  "name": "Order Processing",
  "version": "1.0.0",
  "nodes": [...],
  "edges": [...]
}
```

### Execute Workflow
```http
POST /api/workflows/execute
Content-Type: application/json

{
  "workflowDef": {...},
  "input": {
    "userId": "user-123",
    "orderId": "order-456"
  }
}
```

### Get Workflow Status
```http
GET /api/workflows/{workflowId}/status
```

### Validate Workflow
```http
POST /api/workflows/validate
Content-Type: application/json

{
  "id": "workflow-1",
  "name": "Order Processing",
  "nodes": [...],
  "edges": [...]
}
```

## Configuration

Environment variables:

```bash
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default
TEMPORAL_TASK_QUEUE=journey-workflows

KAFKA_BROKERS=localhost:9093
KAFKA_CLIENT_ID=journey-platform
KAFKA_GROUP_ID=journey-platform-workers

SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=

SERVER_PORT=3001
CORS_ORIGIN=http://localhost:5173
```

## Testing

Run all tests:

```bash
./scripts/test.sh
```

Or run specific package tests:

```bash
npm run test --workspace=packages/shared
```

## Development

### Adding a New Node Type

1. Update types in `packages/shared/src/types.ts`
2. Add execution logic in `packages/backend/src/workflows/journeyWorkflow.ts`
3. Add UI component in `packages/frontend/src/components/`
4. Update DSL converter in `packages/frontend/src/utils/dslConverter.ts`

### Adding a New Action

1. Add action type to `packages/shared/src/types.ts`
2. Implement action in `packages/backend/src/stores/ActionStore.ts`
3. Add configuration form in frontend

## Stopping Services

```bash
./scripts/stop.sh
```

Or stop individual services:

```bash
docker compose down
pkill -f "ts-node"
```

## Troubleshooting

### Temporal Connection Issues
Ensure Temporal is running and accessible:
```bash
docker compose ps
docker compose logs temporal
```

### Kafka Connection Issues
Check Kafka is running and topics are created:
```bash
docker compose logs kafka
```

### Port Conflicts
Check if ports are already in use:
```bash
lsof -i :7234    # Temporal
lsof -i :9093    # Kafka
lsof -i :3001    # Backend
lsof -i :5173    # Frontend
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT