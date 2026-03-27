import type { FieldRule } from "./types.js";

type ValidatorFn = (value: unknown, rule: FieldRule<unknown>) => string | null;

const validateRequired: ValidatorFn = (value, rule) => {
  if (
    rule.required &&
    (value === undefined || value === null || value === "")
  ) {
    return rule.message ?? "This field is required";
  }
  return null;
};

const validateType: ValidatorFn = (value, rule) => {
  if (value !== undefined && value !== null && typeof value !== rule.type) {
    return rule.message ?? `Expected ${rule.type}`;
  }
  return null;
};

const validateMinLength: ValidatorFn = (value, rule) => {
  if (
    typeof value === "string" &&
    rule.minLength !== undefined &&
    value.length < rule.minLength
  ) {
    return rule.message ?? `Must be at least ${rule.minLength} characters`;
  }
  return null;
};

const validateMaxLength: ValidatorFn = (value, rule) => {
  if (
    typeof value === "string" &&
    rule.maxLength !== undefined &&
    value.length > rule.maxLength
  ) {
    return rule.message ?? `Must be at most ${rule.maxLength} characters`;
  }
  return null;
};

const validateMin: ValidatorFn = (value, rule) => {
  if (typeof value === "number" && rule.min !== undefined && value < rule.min) {
    return rule.message ?? `Must be at least ${rule.min}`;
  }
  return null;
};

const validateMax: ValidatorFn = (value, rule) => {
  if (typeof value === "number" && rule.max !== undefined && value > rule.max) {
    return rule.message ?? `Must be at most ${rule.max}`;
  }
  return null;
};

const validatePattern: ValidatorFn = (value, rule) => {
  if (typeof value === "string" && rule.pattern && !rule.pattern.test(value)) {
    return rule.message ?? "Invalid format";
  }
  return null;
};

const validators: ValidatorFn[] = [
  validateRequired,
  validateType,
  validateMinLength,
  validateMaxLength,
  validateMin,
  validateMax,
  validatePattern,
];

export function validateField<T>(
  value: unknown,
  rule: FieldRule<T>,
  allValues: Record<string, unknown>,
): string | null {
  for (const validator of validators) {
    const error = validator(value, rule as FieldRule<unknown>);
    if (error) return error;
  }

  if (rule.validate) {
    return rule.validate(value as T, allValues);
  }

  return null;
}
