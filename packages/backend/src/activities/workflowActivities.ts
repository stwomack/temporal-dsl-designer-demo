import { ActionStore, AttributeStore } from '../stores';
import { ActionType, ActionConfig, AttributeQuery } from '@journey/shared';

let actionStore: ActionStore;
let attributeStore: AttributeStore;

export function setActionStore(store: ActionStore): void {
  actionStore = store;
}

export function setAttributeStore(store: AttributeStore): void {
  attributeStore = store;
}

export async function executeAction(actionType: ActionType, config: ActionConfig): Promise<any> {
  if (!actionStore) {
    throw new Error('Action store not initialized');
  }
  return await actionStore.executeAction(actionType, config);
}

export async function getAttributes(query: AttributeQuery): Promise<Record<string, any>> {
  if (!attributeStore) {
    throw new Error('Attribute store not initialized');
  }
  const result = await attributeStore.getAttributes(query);
  return result.attributes;
}

export async function getAttribute(userId: string, attribute: string): Promise<any> {
  if (!attributeStore) {
    throw new Error('Attribute store not initialized');
  }
  return await attributeStore.getAttribute(userId, attribute);
}

export async function setAttribute(userId: string, attribute: string, value: any): Promise<void> {
  if (!attributeStore) {
    throw new Error('Attribute store not initialized');
  }
  await attributeStore.setAttribute(userId, attribute, value);
}

export async function logActivity(message: string, data?: any): Promise<void> {
  console.log(`[Activity] ${message}`, data || '');
}
