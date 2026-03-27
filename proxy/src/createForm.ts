import type { Schema, Form, FormState, CreateFormOptions } from './types.js';
import { createState, resetState } from './state.js';
import { validateField } from './validators.js';
import { ValidationError } from './errors.js';

const RESERVED_METHOD_SET = new Set([
  'getErrors',
  'getTouched',
  'getValues',
  'isValid',
  'isDirty',
  'save',
  'reset',
  'validate',
]);

function validateAllFields<T extends object>(
  state: FormState<T>,
  schema: Schema<T>
): boolean {
  const keys = Object.keys(schema) as Array<keyof T>;
  let isValid = true;

  for (const key of keys) {
    const rule = schema[key];
    const value = state.values[key];
    const error = validateField(value, rule, state.values as Record<string, unknown>);
    state.errors[key] = error;
    state.touched[key] = true;
    if (error !== null) {
      isValid = false;
    }
  }

  return isValid;
}

function saveForm<T extends object>(state: FormState<T>, schema: Schema<T>): T {
  const isValid = validateAllFields(state, schema);

  if (!isValid) {
    const errors: Record<string, string | null> = {};
    for (const key of Object.keys(state.errors)) {
      errors[key] = state.errors[key as keyof T];
    }
    throw new ValidationError(errors);
  }

  return { ...state.values } as T;
}

function createProxyHandler<T extends object>(
  state: FormState<T>,
  schema: Schema<T>
): ProxyHandler<T> {
  return {
    get(_target: T, prop: string | symbol): unknown {
      if (typeof prop === 'symbol') return undefined;

      switch (prop) {
        case 'getErrors':
          return () => ({ ...state.errors });
        case 'getTouched':
          return () => ({ ...state.touched });
        case 'getValues':
          return () => ({ ...state.values });
        case 'isValid':
          return () => Object.values(state.errors).every((e) => e === null);
        case 'isDirty':
          return () => Object.values(state.touched).some((t) => t);
        case 'save':
          return () => saveForm(state, schema);
        case 'reset':
          return () => resetState(state);
        case 'validate':
          return () => validateAllFields(state, schema);
      }

      return state.values[prop as keyof T];
    },

    set(_target: T, prop: string | symbol, value: unknown): boolean {
      if (typeof prop === 'symbol') return false;

      if (RESERVED_METHOD_SET.has(prop)) {
        return false;
      }

      const fieldName = prop as keyof T;
      const rule = schema[fieldName];

      if (!rule) return false;

      state.touched[fieldName] = true;
      state.errors[fieldName] = validateField(
        value,
        rule,
        state.values as Record<string, unknown>
      );
      state.values[fieldName] = value as T[keyof T];

      return true;
    },
  };
}

export function createForm<T extends object>(
  schema: Schema<T>,
  options?: CreateFormOptions<T>
): Form<T> {
  const state = createState(schema, options?.initialValues);
  const handler = createProxyHandler(state, schema);

  return new Proxy({} as T, handler) as Form<T>;
}
