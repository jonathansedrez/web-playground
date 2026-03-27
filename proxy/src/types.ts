export type FieldType = 'string' | 'number' | 'boolean';

export interface FieldRule<T = unknown> {
  type: FieldType;
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: (value: T, allValues: Record<string, unknown>) => string | null;
  message?: string;
}

export type Schema<T> = {
  [K in keyof T]: FieldRule<T[K]>;
};

export interface FormState<T> {
  values: Partial<T>;
  errors: Record<keyof T, string | null>;
  touched: Record<keyof T, boolean>;
  initial: Partial<T>;
}

export interface FormMethods<T> {
  getErrors(): Record<keyof T, string | null>;
  getTouched(): Record<keyof T, boolean>;
  getValues(): Partial<T>;
  isValid(): boolean;
  isDirty(): boolean;
  save(): T;
  reset(): void;
  validate(): boolean;
}

export type Form<T> = T & FormMethods<T>;

export interface CreateFormOptions<T> {
  initialValues?: Partial<T>;
}

export const RESERVED_METHODS = [
  'getErrors',
  'getTouched',
  'getValues',
  'isValid',
  'isDirty',
  'save',
  'reset',
  'validate',
] as const;

export type ReservedMethod = (typeof RESERVED_METHODS)[number];
