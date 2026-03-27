export interface ValidationErrors {
  [field: string]: string | null;
}

export class ValidationError extends Error {
  public readonly errors: ValidationErrors;

  constructor(errors: ValidationErrors) {
    super('Form validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}
