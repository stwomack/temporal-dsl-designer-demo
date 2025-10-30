# DSL (Domain-Specific Language) Documentation

The DSL in this project is a **JSON-based workflow definition format** that serves as the bridge between the visual workflow designer and the Temporal workflow execution engine.

## Core DSL Structure

The DSL is defined by the `WorkflowDefinition` interface:

```typescript
interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: string;
  nodes: WorkflowNode[];      // The workflow steps
  edges: WorkflowEdge[];      // Connections between steps
  parameters?: Record<string, WorkflowParameter>;
  metadata?: Record<string, any>;
}
```

## Node Types (The Building Blocks)

The DSL supports 6 different node types, each representing a different kind of workflow operation:

### Trigger Nodes - Workflow Entry Points

```typescript
interface TriggerNode {
  type: 'trigger';
  triggerType: 'event' | 'schedule' | 'manual';
  config: {
    eventType?: string;        // For event triggers
    eventFilter?: Record<string, any>;
    schedule?: string;         // For cron-style schedules
  };
}
```

**Example:**
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

### Action Nodes - Execute Side Effects

```typescript
interface ActionNode {
  type: 'action';
  actionType: 'send_email' | 'send_webhook' | 'emit_event';
  config: {
    email?: { to: string; subject: string; body: string; };
    webhook?: { url: string; method: string; headers?: Record<string, string>; };
    event?: { eventType: string; payload: Record<string, any>; };
  };
  retryPolicy?: RetryPolicy;
}
```

**Example:**
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

### Condition Nodes - Branching Logic

```typescript
interface ConditionNode {
  type: 'condition';
  condition: {
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'and' | 'or';
    left: string | ConditionExpression;
    right: string | number | boolean | ConditionExpression;
  };
  trueBranch?: string;   // Node ID to go to if true
  falseBranch?: string;  // Node ID to go to if false
}
```

**Example:**
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

### Delay Nodes - Time-based Orchestration

```typescript
interface DelayNode {
  type: 'delay';
  duration: number;
  unit: 'seconds' | 'minutes' | 'hours' | 'days';
}
```

**Example:**
```json
{
  "id": "delay-1",
  "type": "delay",
  "name": "Wait 24 Hours",
  "duration": 24,
  "unit": "hours"
}
```

### Parallel Nodes - Concurrent Execution

```typescript
interface ParallelNode {
  type: 'parallel';
  branches: string[];  // Array of node IDs to execute in parallel
}
```

**Example:**
```json
{
  "id": "parallel-1",
  "type": "parallel",
  "name": "Send Multiple Notifications",
  "branches": ["action-email", "action-sms", "action-push"]
}
```

### End Nodes - Workflow Termination

```typescript
interface EndNode {
  type: 'end';
}
```

**Example:**
```json
{
  "id": "end-1",
  "type": "end",
  "name": "End"
}
```

## Parameter Templating System

The DSL includes a powerful parameter resolution system using `{{}}` syntax:

### Basic Parameter Access

```json
{
  "config": {
    "email": {
      "to": "{{input.userEmail}}",
      "subject": "Welcome {{input.userName}}!",
      "body": "Your order {{input.orderId}} is confirmed"
    }
  }
}
```

### Supported Parameter Sources

- `{{input.userEmail}}` - Access workflow input data
- `{{parameters.customValue}}` - Access workflow parameters
- `{{results.previousNodeId}}` - Access results from previous nodes
- `{{input.user.profile.email}}` - Nested object access

### Parameter Resolution

The `ParameterResolver` class handles:
- Template matching with regex `/\{\{(.+?)\}\}/g`
- Nested object property access using dot notation
- Type conversion and null handling
- Recursive resolution for complex objects

## Condition Expression System

The DSL supports complex conditional logic with nested expressions:

### Simple Conditions

```json
{
  "operator": "greater_than",
  "left": "{{input.amount}}",
  "right": 100
}
```

### Complex Nested Conditions

```json
{
  "operator": "and",
  "left": {
    "operator": "equals",
    "left": "{{input.userType}}",
    "right": "premium"
  },
  "right": {
    "operator": "greater_than",
    "left": "{{input.orderValue}}",
    "right": 500
  }
}
```

### Supported Operators

- `equals` - Equality comparison
- `not_equals` - Inequality comparison
- `greater_than` - Numeric greater than
- `less_than` - Numeric less than
- `contains` - String or array contains
- `and` - Logical AND
- `or` - Logical OR

## Workflow Execution Flow

The DSL defines the execution flow through:

1. **Edges** - Define connections between nodes
2. **Sequential execution** - Nodes execute in order based on edges
3. **Conditional branching** - Condition nodes route to different paths
4. **Parallel execution** - Parallel nodes execute multiple branches simultaneously
5. **State management** - Each node's results are stored in the workflow context

## Complete DSL Example

Here's a complete example of a DSL workflow definition:

```json
{
  "id": "welcome-email-workflow",
  "name": "Welcome Email Workflow",
  "version": "1.0.0",
  "nodes": [
    {
      "id": "trigger-1",
      "type": "trigger",
      "name": "User Registration",
      "triggerType": "event",
      "config": {
        "eventType": "user.registered"
      }
    },
    {
      "id": "condition-1",
      "type": "condition",
      "name": "Check User Type",
      "condition": {
        "operator": "equals",
        "left": "{{input.userType}}",
        "right": "premium"
      },
      "trueBranch": "action-premium",
      "falseBranch": "action-standard"
    },
    {
      "id": "action-premium",
      "type": "action",
      "name": "Send Premium Welcome",
      "actionType": "send_email",
      "config": {
        "email": {
          "to": "{{input.email}}",
          "subject": "Welcome to Premium!",
          "body": "Thanks for upgrading, {{input.name}}!"
        }
      }
    },
    {
      "id": "action-standard",
      "type": "action",
      "name": "Send Standard Welcome",
      "actionType": "send_email",
      "config": {
        "email": {
          "to": "{{input.email}}",
          "subject": "Welcome!",
          "body": "Thanks for joining us, {{input.name}}!"
        }
      }
    },
    {
      "id": "end-1",
      "type": "end",
      "name": "End"
    }
  ],
  "edges": [
    { "id": "e1", "source": "trigger-1", "target": "condition-1" },
    { "id": "e2", "source": "condition-1", "target": "action-premium" },
    { "id": "e3", "source": "condition-1", "target": "action-standard" },
    { "id": "e4", "source": "action-premium", "target": "end-1" },
    { "id": "e5", "source": "action-standard", "target": "end-1" }
  ]
}
```

## Key DSL Features

- **Type Safety**: Full TypeScript support with strict typing
- **Validation**: Built-in workflow validation with `WorkflowValidator`
- **Parameter Resolution**: Dynamic value substitution using `{{}}` syntax
- **Conditional Logic**: Complex branching with nested expressions
- **Retry Policies**: Configurable retry behavior for action nodes
- **Parallel Execution**: Support for concurrent workflow branches
- **Event-driven**: Integration with Kafka for event-based triggers
- **Temporal Integration**: Seamless execution through Temporal workflows

## Architecture Integration

The DSL serves as the core data structure that:

1. **Frontend**: Visual workflow designer converts UI state to DSL
2. **Shared**: Type definitions and validation logic
3. **Backend**: Temporal workflow engine interprets and executes DSL
4. **Stores**: Event Store, Action Store, and Attribute Store provide data context

The DSL essentially provides a **declarative way to define complex workflows** that can be visually designed in the frontend, validated, and then executed by the Temporal workflow engine in the backend. It's inspired by Airbnb's Journey Platform architecture.
