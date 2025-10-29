import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities/workflowActivities';
import { EventStore, AttributeStore, ActionStore } from './stores';
import { config } from './config';

async function run() {
  const eventStore = new EventStore({
    brokers: config.kafka.brokers,
    clientId: config.kafka.clientId,
    groupId: config.kafka.groupId,
  });

  const attributeStore = new AttributeStore();
  const actionStore = new ActionStore({
    email: config.email,
  });

  actionStore.setEventStore(eventStore);
  activities.setActionStore(actionStore);
  activities.setAttributeStore(attributeStore);

  await eventStore.connect();

  const connection = await NativeConnection.connect({
    address: config.temporal.address,
  });

  const worker = await Worker.create({
    connection,
    namespace: config.temporal.namespace,
    taskQueue: config.temporal.taskQueue,
    workflowsPath: require.resolve('./workflows/journeyWorkflow'),
    activities,
  });

  console.log('Worker started');
  console.log(`Task Queue: ${config.temporal.taskQueue}`);
  console.log(`Namespace: ${config.temporal.namespace}`);

  await worker.run();

  await eventStore.disconnect();
}

run().catch((err) => {
  console.error('Worker failed:', err);
  process.exit(1);
});
