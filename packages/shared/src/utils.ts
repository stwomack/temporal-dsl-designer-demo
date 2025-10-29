import { WorkflowParameter, ConditionExpression } from './types.js';

export class ParameterResolver {
  static resolve(
    paramValue: string,
    context: Record<string, any>
  ): any {
    if (typeof paramValue !== 'string') {
      return paramValue;
    }

    const templateRegex = /\{\{(.+?)\}\}/g;
    const matches = paramValue.matchAll(templateRegex);

    let resolved = paramValue;
    for (const match of matches) {
      const path = match[1].trim();
      const value = this.getValueByPath(context, path);
      resolved = resolved.replace(match[0], String(value ?? ''));
    }

    return resolved;
  }

  private static getValueByPath(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current == null) return undefined;
      current = current[part];
    }

    return current;
  }
}

export class ConditionEvaluator {
  static evaluate(
    expression: ConditionExpression,
    context: Record<string, any>
  ): boolean {
    const left = this.resolveValue(expression.left, context);
    const right = this.resolveValue(expression.right, context);

    switch (expression.operator) {
      case 'equals':
        return left === right;
      case 'not_equals':
        return left !== right;
      case 'greater_than':
        return left > right;
      case 'less_than':
        return left < right;
      case 'contains':
        if (typeof left === 'string') {
          return left.includes(String(right));
        }
        if (Array.isArray(left)) {
          return left.includes(right);
        }
        return false;
      case 'and':
        return Boolean(left) && Boolean(right);
      case 'or':
        return Boolean(left) || Boolean(right);
      default:
        throw new Error(`Unknown operator: ${expression.operator}`);
    }
  }

  private static resolveValue(
    value: string | number | boolean | ConditionExpression,
    context: Record<string, any>
  ): any {
    if (typeof value === 'object' && 'operator' in value) {
      return this.evaluate(value, context);
    }

    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const path = value.slice(2, -2).trim();
      return ParameterResolver.resolve(value, context);
    }

    return value;
  }
}

export function generateId(prefix: string = 'node'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function serializeWorkflow(workflow: any): string {
  return JSON.stringify(workflow, null, 2);
}

export function deserializeWorkflow(json: string): any {
  return JSON.parse(json);
}
