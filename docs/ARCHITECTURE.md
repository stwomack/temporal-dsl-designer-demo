# Architecture Documentation

## System Overview

Journey Platform is a low-code workflow orchestration system that enables users to create, manage, and execute complex event-driven workflows through a visual interface.

## Core Components

### 1. Frontend - Visual Workflow Designer

**Technology**: React, React Flow, TypeScript, Vite

**Responsibilities**:
- Provide drag-and-drop interface for workflow creation
- Visual representation of workflow nodes and edges
- Real-time workflow validation
- Node configuration management
- Workflow execution triggering
- Status monitoring

**Key Components**:
- `WorkflowDesigner`: Main canvas component
- `CustomNode`: Individual workflow node renderer
- `NodeConfigPanel`: Node configuration modal
- `NodePanel`: Sidebar with available node types
- `Toolbar`: Workflow actions (save, execute, validate)
- DSL Converter: Transforms UI state to/from DSL

### 2. Shared - DSL and Types

**Technology**: TypeScript

**Responsibilities**:
- Define workflow DSL schema
- Provide type safety across frontend and backend
- Validate workflow definitions
- Resolve parameter templates
- Evaluate conditional expressions

**Key Modules**:
- `types.ts`: Core type definitions for all node types
- `validators.ts`: Workflow validation logic
- `utils.ts`: Parameter resolution and condition evaluation

### 3. Backend - Orchestration Engine

**Technology**: Node.js, TypeScript, Temporal, Kafka

**Responsibilities**:
- Execute workflows using Temporal
- Manage workflow lifecycle
- Integrate with external systems
- Store and retrieve workflow state
- Handle events and triggers

**Key Modules**:

#### Workflows
- `journeyWorkflow.ts`: Main Temporal workflow implementation
  - Interprets DSL nodes
  - Executes actions in sequence or parallel
  - Handles conditional branching
  - Manages delays and retries

#### Activities
- `workflowActivities.ts`: Temporal activities for side effects
  - Execute actions (email, webhook, event)
  - Query attribute store
  - Update attribute store
  - Log activity

#### Stores

**Event Store** (`EventStore.ts`)
- Kafka-based event streaming
- Event publication and subscription
- Event handler registration
- Workflow trigger on events

**Attribute Store** (`AttributeStore.ts`)
- User context and metadata storage
- In-memory key-value store
- Attribute querying for conditional logic
- User segmentation data

**Action Store** (`ActionStore.ts`)
- Action execution abstraction
- Email sending (via Nodemailer)
- HTTP webhooks (via Axios)
- Event emission (via Event Store)

#### API Server
- `server.ts`: Express REST API
- `workflowController.ts`: Workflow management endpoints
  - Create workflow definitions
  - Execute workflows
  - Get workflow status
  - Cancel workflows
  - Validate workflows

## Data Flow

### Workflow Creation Flow

```
User creates workflow in UI
  -> React Flow nodes/edges updated
  -> Convert to DSL on save
  -> Send to API server
  -> Validate DSL
  -> Store definition (future: database)
  -> Return success
```

### Workflow Execution Flow

```
User clicks Execute
  -> Send DSL + input to API
  -> API starts Temporal workflow
  -> Temporal schedules workflow on task queue
  -> Worker picks up workflow
  -> Execute nodes sequentially/parallel
    -> For actions: call activity
    -> Activity executes via store
    -> Return result to workflow
  -> Workflow completes
  -> State persisted in Temporal
```

### Event-Driven Flow

```
External system publishes event to Kafka
  -> Event Store receives event
  -> Event handlers triggered
  -> Matching workflows started
  -> Workflow receives event payload
  -> Execute workflow with event context
```

## Technical Decisions

### Why Temporal?

1. **Durable Execution**: State automatically persisted
2. **Retry Logic**: Built-in exponential backoff
3. **Workflow Versioning**: Safe updates to running workflows
4. **Debugging**: Timeline view of workflow execution
5. **Scalability**: Distributed worker architecture

### Why Kafka?

1. **Event Streaming**: High-throughput event processing
2. **Decoupling**: Producers and consumers independent
3. **Replay**: Ability to replay events for debugging
4. **Scalability**: Horizontal scaling with partitions
5. **Reliability**: Persistent event log

### Why React Flow?

1. **Rich Features**: Built-in panning, zooming, minimap
2. **Customizable**: Full control over node rendering
3. **Performance**: Optimized for large graphs
4. **Accessibility**: Keyboard navigation support
5. **Developer Experience**: Well-documented API

## Scalability Considerations

### Horizontal Scaling

**Worker Scaling**:
- Multiple Temporal workers can run in parallel
- Each worker polls the same task queue
- Temporal handles distribution automatically

**API Server Scaling**:
- Stateless API servers behind load balancer
- Session affinity not required
- Database for workflow definitions (future)

**Kafka Scaling**:
- Multiple partitions for parallel processing
- Consumer groups for load distribution
- Topic per workflow type for isolation

### Performance Optimization

**Frontend**:
- React Flow virtualization for large workflows
- Debounced validation
- Lazy loading of workflow history

**Backend**:
- Connection pooling for Kafka and database
- Temporal activity batching
- Caching of attribute store queries
- Event filtering before workflow trigger

## Security Considerations

### Authentication (Future)

- JWT-based API authentication
- OAuth2 integration for UI
- Service accounts for workers

### Authorization (Future)

- Role-based access control (RBAC)
- Workflow ownership and permissions
- Audit logging of workflow executions

### Data Protection

- Parameter encryption for sensitive data
- Secure credential storage
- HTTPS for all external communications
- Kafka ACLs for topic access

## Monitoring and Observability

### Metrics

- Workflow execution count
- Workflow success/failure rate
- Action execution latency
- Event processing lag
- Worker resource usage

### Logging

- Structured logging with correlation IDs
- Workflow execution logs in Temporal
- Activity logs with context
- Error tracking and alerting

### Tracing

- Distributed tracing across services
- Workflow execution timeline
- Activity spans
- External API call traces

## Future Enhancements

### Short Term

1. Persistent workflow definition storage (database)
2. Workflow version management
3. Enhanced parameter editor in UI
4. Workflow templates library
5. Execution history viewer

### Medium Term

1. Advanced conditional expressions
2. Loop/iteration nodes
3. Sub-workflow support
4. A/B testing framework
5. Real-time collaboration

### Long Term

1. Visual debugging with breakpoints
2. Workflow analytics dashboard
3. Machine learning for optimization
4. Multi-tenancy support
5. Marketplace for workflow plugins
