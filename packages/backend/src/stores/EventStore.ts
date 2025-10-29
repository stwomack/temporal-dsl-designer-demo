import { Kafka, Consumer, Producer, EachMessagePayload } from 'kafkajs';
import { EventTrigger } from '@journey/shared';

export interface EventStoreConfig {
  brokers: string[];
  clientId: string;
  groupId: string;
}

export class EventStore {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private eventHandlers: Map<string, Set<(event: EventTrigger) => void>>;

  constructor(private config: EventStoreConfig) {
    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: config.groupId });
    this.eventHandlers = new Map();
  }

  async connect(): Promise<void> {
    await this.producer.connect();
    await this.consumer.connect();
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  async publishEvent(eventType: string, payload: Record<string, any>): Promise<void> {
    await this.producer.send({
      topic: 'workflow-events',
      messages: [
        {
          key: eventType,
          value: JSON.stringify({
            eventType,
            payload,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
  }

  async subscribe(eventTypes: string[]): Promise<void> {
    await this.consumer.subscribe({ topic: 'workflow-events', fromBeginning: false });

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const { message } = payload;
        if (!message.value) return;

        const event = JSON.parse(message.value.toString()) as EventTrigger;
        const handlers = this.eventHandlers.get(event.eventType);

        if (handlers) {
          for (const handler of handlers) {
            try {
              handler(event);
            } catch (error) {
              console.error(`Error handling event ${event.eventType}:`, error);
            }
          }
        }
      },
    });
  }

  registerHandler(eventType: string, handler: (event: EventTrigger) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
  }

  unregisterHandler(eventType: string, handler: (event: EventTrigger) => void): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(eventType);
      }
    }
  }
}
