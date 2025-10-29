# API Documentation

## Base URL

```
http://localhost:3001/api
```

## Endpoints

### Health Check

Check if the API server is running.

**Request**

```http
GET /health
```

**Response**

```json
{
  "status": "ok"
}
```

**Status Codes**
- `200 OK`: Service is healthy

---

### Create Workflow

Save a workflow definition.

**Request**

```http
POST /workflows
Content-Type: application/json
```

**Body**

```json
{
  "id": "welcome-email-workflow",
  "name": "Welcome Email Workflow",
  "version": "1.0.0",
  "description": "Send welcome email to new users",
  "nodes": [
    {
      "id": "trigger-1",
      "type": "trigger",
      "name": "User Registered",
      "triggerType": "event",
      "config": {
        "eventType": "user.registered"
      }
    },
    {
      "id": "action-1",
      "type": "action",
      "name": "Send Welcome Email",
      "actionType": "send_email",
      "config": {
        "email": {
          "to": "{{input.email}}",
          "subject": "Welcome to Journey Platform",
          "body": "Hello {{input.name}}, welcome aboard!"
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "trigger-1",
      "target": "action-1"
    }
  ]
}
```

**Response**

```json
{
  "message": "Workflow definition saved",
  "workflowId": "welcome-email-workflow"
}
```

**Status Codes**
- `201 Created`: Workflow created successfully
- `400 Bad Request`: Invalid workflow definition
- `500 Internal Server Error`: Server error

---

### Execute Workflow

Start a workflow execution with input parameters.

**Request**

```http
POST /workflows/execute
Content-Type: application/json
```

**Body**

```json
{
  "workflowDef": {
    "id": "welcome-email-workflow",
    "name": "Welcome Email Workflow",
    "version": "1.0.0",
    "nodes": [...],
    "edges": [...]
  },
  "input": {
    "userId": "user-123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Response**

```json
{
  "workflowId": "welcome-email-workflow-1703123456789",
  "runId": "abc123-def456-ghi789",
  "status": "started"
}
```

**Status Codes**
- `200 OK`: Workflow started successfully
- `400 Bad Request`: Invalid workflow or input
- `500 Internal Server Error`: Failed to start workflow

---

### Get Workflow Status

Get the current status of a workflow execution.

**Request**

```http
GET /workflows/{workflowId}/status
```

**Parameters**
- `workflowId` (path): Workflow execution ID

**Response**

```json
{
  "workflowId": "welcome-email-workflow-1703123456789",
  "status": "COMPLETED",
  "startTime": "2024-12-21T10:30:00.000Z",
  "closeTime": "2024-12-21T10:30:05.000Z"
}
```

**Possible Status Values**
- `RUNNING`: Workflow is currently executing
- `COMPLETED`: Workflow finished successfully
- `FAILED`: Workflow failed with error
- `CANCELLED`: Workflow was cancelled
- `TERMINATED`: Workflow was forcefully terminated
- `TIMED_OUT`: Workflow exceeded time limit

**Status Codes**
- `200 OK`: Status retrieved successfully
- `404 Not Found`: Workflow not found
- `500 Internal Server Error`: Failed to get status

---

### Cancel Workflow

Cancel a running workflow execution.

**Request**

```http
DELETE /workflows/{workflowId}
```

**Parameters**
- `workflowId` (path): Workflow execution ID

**Response**

```json
{
  "workflowId": "welcome-email-workflow-1703123456789",
  "status": "cancelled"
}
```

**Status Codes**
- `200 OK`: Workflow cancelled successfully
- `404 Not Found`: Workflow not found
- `500 Internal Server Error`: Failed to cancel workflow

---

### Validate Workflow

Validate a workflow definition without executing it.

**Request**

```http
POST /workflows/validate
Content-Type: application/json
```

**Body**

```json
{
  "id": "test-workflow",
  "name": "Test Workflow",
  "version": "1.0.0",
  "nodes": [
    {
      "id": "trigger-1",
      "type": "trigger",
      "name": "Start",
      "triggerType": "manual",
      "config": {}
    }
  ],
  "edges": []
}
```

**Response (Valid)**

```json
{
  "valid": true,
  "errors": []
}
```

**Response (Invalid)**

```json
{
  "valid": false,
  "errors": [
    "Workflow must have at least one trigger node",
    "Unreachable nodes: action-1, action-2"
  ]
}
```

**Status Codes**
- `200 OK`: Validation completed
- `500 Internal Server Error`: Validation failed

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

## Common Error Codes

- `400 Bad Request`: Invalid request body or parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Parameter Templating

Use double curly braces to reference dynamic values:

```
{{input.fieldName}}           - From workflow input
{{attributes.fieldName}}      - From attribute store
{{event.payload.fieldName}}   - From event data
{{results.nodeId.fieldName}}  - From previous node result
```

## Examples

### Example 1: Simple Email Workflow

```bash
curl -X POST http://localhost:3001/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflowDef": {
      "id": "simple-email",
      "name": "Simple Email",
      "version": "1.0.0",
      "nodes": [
        {
          "id": "trigger-1",
          "type": "trigger",
          "name": "Start",
          "triggerType": "manual",
          "config": {}
        },
        {
          "id": "action-1",
          "type": "action",
          "name": "Send Email",
          "actionType": "send_email",
          "config": {
            "email": {
              "to": "test@example.com",
              "subject": "Test Email",
              "body": "This is a test"
            }
          }
        }
      ],
      "edges": [
        {
          "id": "edge-1",
          "source": "trigger-1",
          "target": "action-1"
        }
      ]
    },
    "input": {}
  }'
```

### Example 2: Conditional Workflow

```bash
curl -X POST http://localhost:3001/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflowDef": {
      "id": "conditional-workflow",
      "name": "Conditional Workflow",
      "version": "1.0.0",
      "nodes": [
        {
          "id": "trigger-1",
          "type": "trigger",
          "name": "Start",
          "triggerType": "manual",
          "config": {}
        },
        {
          "id": "condition-1",
          "type": "condition",
          "name": "Check Amount",
          "condition": {
            "operator": "greater_than",
            "left": "{{input.amount}}",
            "right": 100
          },
          "trueBranch": "action-high",
          "falseBranch": "action-low"
        },
        {
          "id": "action-high",
          "type": "action",
          "name": "High Value Email",
          "actionType": "send_email",
          "config": {
            "email": {
              "to": "{{input.email}}",
              "subject": "High Value Order",
              "body": "Thank you for your large order!"
            }
          }
        },
        {
          "id": "action-low",
          "type": "action",
          "name": "Standard Email",
          "actionType": "send_email",
          "config": {
            "email": {
              "to": "{{input.email}}",
              "subject": "Order Confirmation",
              "body": "Thank you for your order!"
            }
          }
        }
      ],
      "edges": [
        {
          "id": "edge-1",
          "source": "trigger-1",
          "target": "condition-1"
        }
      ]
    },
    "input": {
      "email": "customer@example.com",
      "amount": 150
    }
  }'
```

### Example 3: Delayed Workflow

```bash
curl -X POST http://localhost:3001/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflowDef": {
      "id": "delayed-workflow",
      "name": "Delayed Workflow",
      "version": "1.0.0",
      "nodes": [
        {
          "id": "trigger-1",
          "type": "trigger",
          "name": "Start",
          "triggerType": "manual",
          "config": {}
        },
        {
          "id": "delay-1",
          "type": "delay",
          "name": "Wait 1 Minute",
          "duration": 1,
          "unit": "minutes"
        },
        {
          "id": "action-1",
          "type": "action",
          "name": "Send Reminder",
          "actionType": "send_email",
          "config": {
            "email": {
              "to": "{{input.email}}",
              "subject": "Reminder",
              "body": "This is your reminder!"
            }
          }
        }
      ],
      "edges": [
        {
          "id": "edge-1",
          "source": "trigger-1",
          "target": "delay-1"
        },
        {
          "id": "edge-2",
          "source": "delay-1",
          "target": "action-1"
        }
      ]
    },
    "input": {
      "email": "user@example.com"
    }
  }'
```

## Rate Limits

Currently no rate limits are enforced. In production, consider:

- 100 requests per minute per IP
- 1000 workflow executions per hour per user
- Maximum workflow definition size: 1MB

## Authentication

Currently no authentication is required. In production, use:

```http
Authorization: Bearer {jwt_token}
```

## Versioning

API version is currently v1 (implicit). Future versions will use explicit versioning:

```
/api/v2/workflows
```
