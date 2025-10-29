import { ActionType, ActionConfig } from '@journey/shared';
import nodemailer, { Transporter } from 'nodemailer';
import axios from 'axios';
import { EventStore } from './EventStore';

export interface ActionStoreConfig {
  email?: {
    host: string;
    port: number;
    auth: {
      user: string;
      pass: string;
    };
  };
}

export class ActionStore {
  private emailTransporter?: Transporter;
  private eventStore?: EventStore;

  constructor(private config: ActionStoreConfig) {
    if (config.email) {
      this.emailTransporter = nodemailer.createTransporter(config.email);
    }
  }

  setEventStore(eventStore: EventStore): void {
    this.eventStore = eventStore;
  }

  async executeAction(actionType: ActionType, config: ActionConfig): Promise<any> {
    switch (actionType) {
      case ActionType.SEND_EMAIL:
        return this.sendEmail(config.email!);
      case ActionType.SEND_WEBHOOK:
        return this.sendWebhook(config.webhook!);
      case ActionType.EMIT_EVENT:
        return this.emitEvent(config.event!);
      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }
  }

  private async sendEmail(config: any): Promise<any> {
    if (!this.emailTransporter) {
      throw new Error('Email transporter not configured');
    }

    const mailOptions = {
      from: config.from || 'noreply@journey-platform.com',
      to: config.to,
      subject: config.subject,
      text: config.body,
      html: config.body,
    };

    const result = await this.emailTransporter.sendMail(mailOptions);
    return { messageId: result.messageId, status: 'sent' };
  }

  private async sendWebhook(config: any): Promise<any> {
    const response = await axios({
      method: config.method,
      url: config.url,
      headers: config.headers || {},
      data: config.body,
    });

    return {
      status: response.status,
      data: response.data,
    };
  }

  private async emitEvent(config: any): Promise<any> {
    if (!this.eventStore) {
      throw new Error('Event store not configured');
    }

    await this.eventStore.publishEvent(config.eventType, config.payload);
    return { status: 'emitted', eventType: config.eventType };
  }
}
