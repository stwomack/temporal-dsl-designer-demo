# Journey Platform

A low-code workflow orchestration platform inspired by Airbnb's Journey Platform. Build and execute complex event-driven workflows using a visual drag-and-drop designer backed by Temporal workflows.

## Architecture

Journey Platform consists of three main components:

### 1. Visual Designer (Frontend)
- React-based drag-and-drop interface using React Flow
- Real-time workflow validation
- Interactive node configuration panels
- Visual workflow execution tracking
- Click any node to configure its properties (email addresses, webhook URLs, etc.)

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
- npm (comes with Node.js)

## Quick Start

### 1. Start Infrastructure

```bash
npm start
```