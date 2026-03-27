import type { FormState, Schema } from './types.js';

export function createState<T extends object>(
  schema: Schema<T>,
  initial?: Partial<T>
): FormState<T> {
  const keys = Object.keys(schema) as Array<keyof T>;

  return {
    values: (initial ? { ...initial } : {}) as Partial<T>,
    errors: keys.reduce(
      (acc, key) => ({ ...acc, [key]: null }),
      {} as Record<keyof T, string | null>
    ),
    touched: keys.reduce(
      (acc, key) => ({ ...acc, [key]: false }),
      {} as Record<keyof T, boolean>
    ),
    initial: (initial ? { ...initial } : {}) as Partial<T>,
  };
}

export function resetState<T extends object>(state: FormState<T>): void {
  const keys = Object.keys(state.errors) as Array<keyof T>;

  state.values = { ...state.initial } as Partial<T>;
  keys.forEach((key) => {
    state.errors[key] = null;
    state.touched[key] = false;
  });
}
