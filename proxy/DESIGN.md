# Proxy-Powered Form: Design Document

## Overview

A `createForm<T>(schema)` function that returns a Proxy-powered form object with automatic validation, touch tracking, and save prevention on errors.

## Tech Stack

- **Language:** TypeScript (strict mode)
- **Runtime:** Node.js / Browser (ES2020+)
- **Build:** `tsc` only (vanilla TypeScript, no bundlers)
- **Testing:** Vitest
- **No frameworks or external dependencies**

## Type Definitions

### Core Types

```typescript
// Supported field types
type FieldType = 'string' | 'number' | 'boolean';

// Validation rule for a single field
interface FieldRule<T = unknown> {
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

// Schema is a record of field names to rules
type Schema<T> = {
  [K in keyof T]: FieldRule<T[K]>;
};

// Form state
interface FormState<T> {
  values: Partial<T>;
  errors: Record<keyof T, string | null>;
  touched: Record<keyof T, boolean>;
  initial: Partial<T>;
}

// Form methods (accessible via method calls)
interface FormMethods<T> {
  getErrors(): Record<keyof T, string | null>;
  getTouched(): Record<keyof T, boolean>;
  getValues(): Partial<T>;
  isValid(): boolean;
  isDirty(): boolean;
  save(): T;
  reset(): void;
  validate(): boolean;
}

// The returned form type combines field access with methods
type Form<T> = T & FormMethods<T>;

// Options for createForm
interface CreateFormOptions<T> {
  initialValues?: Partial<T>;
}
```

### Factory Function Signature

```typescript
function createForm<T extends Record<string, unknown>>(
  schema: Schema<T>,
  options?: CreateFormOptions<T>
): Form<T>;
```

## API Design

### Schema Definition

```typescript
interface UserForm {
  username: string;
  email: string;
  age: number;
}

const schema: Schema<UserForm> = {
  username: {
    type: 'string',
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'Username must be 3-20 alphanumeric characters'
  },
  email: {
    type: 'string',
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email format'
  },
  age: {
    type: 'number',
    min: 18,
    max: 120,
    message: 'Age must be between 18 and 120'
  }
};
```

### Form Object Interface

```typescript
const form = createForm<UserForm>(schema);

// Setting values (triggers validation) - fully typed!
form.username = 'john_doe';
form.email = 'john@example.com';
form.age = 25;

// Type error: form.age = 'not a number';

// Reading values
console.log(form.username); // 'john_doe'

// Methods for state inspection
form.getErrors();    // { username: null, email: null, age: null }
form.getTouched();   // { username: true, email: true, age: true }
form.getValues();    // { username: 'john_doe', email: 'john@example.com', age: 25 }
form.isValid();      // true
form.isDirty();      // true

// Methods for actions
form.save();         // Returns UserForm if valid, throws ValidationError if invalid
form.reset();        // Resets to initial state
form.validate();     // Force validate all fields, returns boolean
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   createForm<T>(schema)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Schema     │    │    State     │    │   Proxy      │  │
│  │   Parser     │───▶│   Manager    │◀──▶│   Handler    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                             │                    │          │
│                             ▼                    │          │
│                      ┌──────────────┐            │          │
│                      │  Validator   │◀───────────┘          │
│                      │   Engine     │                       │
│                      └──────────────┘                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. State Manager

Holds the internal form state:

```typescript
interface FormState<T> {
  values: Partial<T>;
  errors: Record<keyof T, string | null>;
  touched: Record<keyof T, boolean>;
  initial: Partial<T>;
}

function createState<T>(schema: Schema<T>, initial?: Partial<T>): FormState<T> {
  const keys = Object.keys(schema) as Array<keyof T>;

  return {
    values: { ...initial },
    errors: keys.reduce((acc, key) => ({ ...acc, [key]: null }), {} as Record<keyof T, string | null>),
    touched: keys.reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<keyof T, boolean>),
    initial: { ...initial }
  };
}
```

### 2. Validator Engine

Validates fields based on schema rules:

```typescript
type ValidatorFn<T> = (value: unknown, rule: FieldRule<T>) => string | null;

const validators: Record<string, ValidatorFn<unknown>> = {
  required: (value, rule) => {
    if (rule.required && (value === undefined || value === null || value === '')) {
      return rule.message ?? 'This field is required';
    }
    return null;
  },

  type: (value, rule) => {
    if (value !== undefined && value !== null && typeof value !== rule.type) {
      return rule.message ?? `Expected ${rule.type}`;
    }
    return null;
  },

  minLength: (value, rule) => {
    if (typeof value === 'string' && rule.minLength && value.length < rule.minLength) {
      return rule.message ?? `Must be at least ${rule.minLength} characters`;
    }
    return null;
  },

  // ... more validators
};

function validate<T>(
  fieldName: keyof T,
  value: unknown,
  rule: FieldRule,
  allValues: Partial<T>
): string | null {
  // Run built-in validators
  for (const validator of Object.values(validators)) {
    const error = validator(value, rule);
    if (error) return error;
  }

  // Run custom validator
  if (rule.validate) {
    return rule.validate(value, allValues as Record<string, unknown>);
  }

  return null;
}
```

### 3. Proxy Handler

Intercepts get/set operations:

```typescript
// Reserved method names that cannot be used as field names
const RESERVED_METHODS = [
  'getErrors', 'getTouched', 'getValues',
  'isValid', 'isDirty', 'save', 'reset', 'validate'
] as const;

function createProxyHandler<T extends Record<string, unknown>>(
  state: FormState<T>,
  schema: Schema<T>
): ProxyHandler<T> {
  return {
    get(target: T, prop: string | symbol): unknown {
      if (typeof prop === 'symbol') return undefined;

      // Handle method calls
      switch (prop) {
        case 'getErrors':  return () => ({ ...state.errors });
        case 'getTouched': return () => ({ ...state.touched });
        case 'getValues':  return () => ({ ...state.values });
        case 'isValid':    return () => Object.values(state.errors).every(e => e === null);
        case 'isDirty':    return () => Object.values(state.touched).some(t => t);
        case 'save':       return () => save(state);
        case 'reset':      return () => reset(state);
        case 'validate':   return () => validateAll(state, schema);
      }

      // Return field value
      return state.values[prop as keyof T];
    },

    set(target: T, prop: string | symbol, value: unknown): boolean {
      if (typeof prop === 'symbol') return false;

      // Prevent overwriting methods
      if (RESERVED_METHODS.includes(prop as typeof RESERVED_METHODS[number])) {
        return false;
      }

      const fieldName = prop as keyof T;
      const rule = schema[fieldName];

      if (!rule) return false;

      // Mark as touched
      state.touched[fieldName] = true;

      // Validate and store
      state.errors[fieldName] = validate(fieldName, value, rule, state.values);
      state.values[fieldName] = value as T[keyof T];

      return true;
    }
  };
}
```

## Validation Rules

| Rule | Type | Description |
|------|------|-------------|
| `type` | `FieldType` | Expected type: 'string', 'number', 'boolean' |
| `required` | `boolean` | Field must have a value |
| `min` | `number` | Minimum value (numbers) |
| `max` | `number` | Maximum value (numbers) |
| `minLength` | `number` | Minimum length (strings) |
| `maxLength` | `number` | Maximum length (strings) |
| `pattern` | `RegExp` | Must match pattern |
| `validate` | `(value: T, values: Record<string, unknown>) => string \| null` | Custom validator |
| `message` | `string` | Custom error message |

## Usage Examples

### Basic Form

```typescript
interface LoginForm {
  email: string;
  password: string;
}

const loginForm = createForm<LoginForm>({
  email: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { type: 'string', required: true, minLength: 8 }
});

loginForm.email = 'user@example.com';
loginForm.password = 'short';

console.log(loginForm.getErrors());
// { email: null, password: 'Must be at least 8 characters' }

console.log(loginForm.isValid()); // false

try {
  const data = loginForm.save(); // data is typed as LoginForm
} catch (e) {
  if (e instanceof ValidationError) {
    console.log('Cannot save:', e.errors);
  }
}
```

### Custom Validators

```typescript
interface SignupForm {
  password: string;
  confirmPassword: string;
}

const signupForm = createForm<SignupForm>({
  password: { type: 'string', required: true, minLength: 8 },
  confirmPassword: {
    type: 'string',
    required: true,
    validate: (value, allValues) =>
      value !== allValues.password ? 'Passwords must match' : null
  }
});
```

### With Initial Values

```typescript
const editForm = createForm<UserForm>(schema, {
  initialValues: {
    username: 'existing_user',
    email: 'existing@example.com'
  }
});

// Later...
editForm.reset(); // Reverts to initial values
```

## Implementation Phases

### Phase 1: Core Types & Proxy
- [ ] Define all TypeScript types and interfaces
- [ ] Basic Proxy with get/set handlers
- [ ] Value storage and retrieval
- [ ] Touch tracking

### Phase 2: Validation
- [ ] Type validation
- [ ] Required fields
- [ ] Min/Max constraints
- [ ] Pattern matching
- [ ] Custom validators

### Phase 3: State Methods
- [ ] `getErrors()` method
- [ ] `getTouched()` method
- [ ] `getValues()` method
- [ ] `isValid()` method
- [ ] `isDirty()` method

### Phase 4: Action Methods
- [ ] `save()` - return typed values or throw
- [ ] `reset()` - reset to initial state
- [ ] `validate()` - force validation

### Phase 5: Enhancements
- [ ] Nested object support
- [ ] Array field support
- [ ] Async validators
- [ ] Field dependencies

## Error Handling

```typescript
interface ValidationErrors {
  [field: string]: string | null;
}

class ValidationError extends Error {
  public readonly errors: ValidationErrors;

  constructor(errors: ValidationErrors) {
    super('Form validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

// Usage
try {
  const data = form.save();
  // data is fully typed as T
} catch (e) {
  if (e instanceof ValidationError) {
    console.log(e.errors); // { email: 'Required', password: 'Too short' }
  }
}
```

## File Structure

```
proxy/
├── src/
│   ├── index.ts            # Public exports
│   ├── createForm.ts       # Main factory function
│   ├── types.ts            # Type definitions
│   ├── validators.ts       # Validation rules
│   ├── state.ts            # State management
│   └── errors.ts           # Error classes
├── tests/
│   ├── createForm.test.ts
│   ├── validators.test.ts
│   └── integration.test.ts
├── examples/
│   └── basic-form.ts
├── tsconfig.json
├── package.json
├── DESIGN.md
└── README.md
```

## TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

## Package Configuration

```json
{
  "name": "proxy-form",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest",
    "test:run": "vitest run"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```
