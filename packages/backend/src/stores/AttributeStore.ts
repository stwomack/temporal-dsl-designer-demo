import { AttributeQuery, AttributeResult } from '@journey/shared';

export class AttributeStore {
  private attributes: Map<string, Record<string, any>>;

  constructor() {
    this.attributes = new Map();
  }

  async setAttribute(userId: string, attribute: string, value: any): Promise<void> {
    if (!this.attributes.has(userId)) {
      this.attributes.set(userId, {});
    }
    this.attributes.get(userId)![attribute] = value;
  }

  async setAttributes(userId: string, attributes: Record<string, any>): Promise<void> {
    if (!this.attributes.has(userId)) {
      this.attributes.set(userId, {});
    }
    Object.assign(this.attributes.get(userId)!, attributes);
  }

  async getAttribute(userId: string, attribute: string): Promise<any> {
    const userAttrs = this.attributes.get(userId);
    return userAttrs ? userAttrs[attribute] : undefined;
  }

  async getAttributes(query: AttributeQuery): Promise<AttributeResult> {
    const userAttrs = this.attributes.get(query.userId) || {};
    const result: Record<string, any> = {};

    for (const attr of query.attributes) {
      result[attr] = userAttrs[attr];
    }

    return {
      userId: query.userId,
      attributes: result,
    };
  }

  async getAllAttributes(userId: string): Promise<Record<string, any>> {
    return this.attributes.get(userId) || {};
  }

  async deleteAttribute(userId: string, attribute: string): Promise<void> {
    const userAttrs = this.attributes.get(userId);
    if (userAttrs) {
      delete userAttrs[attribute];
    }
  }

  async deleteAllAttributes(userId: string): Promise<void> {
    this.attributes.delete(userId);
  }
}
