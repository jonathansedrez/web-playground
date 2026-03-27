import { describe, it, expect } from 'vitest';
import { createForm } from '../src/createForm.js';
import { ValidationError } from '../src/errors.js';
import type { Schema } from '../src/types.js';

interface TestForm {
  username: string;
  email: string;
  age: number;
}

const testSchema: Schema<TestForm> = {
  username: {
    type: 'string',
    required: true,
    minLength: 3,
    maxLength: 20,
  },
  email: {
    type: 'string',
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  age: {
    type: 'number',
    min: 18,
    max: 120,
  },
};

describe('createForm', () => {
  describe('basic operations', () => {
    it('should create a form with schema', () => {
      const form = createForm<TestForm>(testSchema);
      expect(form).toBeDefined();
    });

    it('should set and get field values', () => {
      const form = createForm<TestForm>(testSchema);
      form.username = 'john_doe';
      form.email = 'john@example.com';
      form.age = 25;

      expect(form.username).toBe('john_doe');
      expect(form.email).toBe('john@example.com');
      expect(form.age).toBe(25);
    });

    it('should return undefined for unset fields', () => {
      const form = createForm<TestForm>(testSchema);
      expect(form.username).toBeUndefined();
    });
  });

  describe('initial values', () => {
    it('should accept initial values', () => {
      const form = createForm<TestForm>(testSchema, {
        initialValues: {
          username: 'existing_user',
          email: 'existing@example.com',
        },
      });

      expect(form.username).toBe('existing_user');
      expect(form.email).toBe('existing@example.com');
      expect(form.age).toBeUndefined();
    });
  });

  describe('getValues()', () => {
    it('should return all current values', () => {
      const form = createForm<TestForm>(testSchema);
      form.username = 'john';
      form.age = 30;

      const values = form.getValues();
      expect(values).toEqual({
        username: 'john',
        age: 30,
      });
    });

    it('should return a copy of values', () => {
      const form = createForm<TestForm>(testSchema);
      form.username = 'john';

      const values = form.getValues();
      values.username = 'modified';

      expect(form.username).toBe('john');
    });
  });

  describe('getErrors()', () => {
    it('should return errors for invalid fields', () => {
      const form = createForm<TestForm>(testSchema);
      form.username = 'ab'; // Too short
      form.age = 15; // Below min

      const errors = form.getErrors();
      expect(errors.username).toBe('Must be at least 3 characters');
      expect(errors.age).toBe('Must be at least 18');
    });

    it('should return null for valid fields', () => {
      const form = createForm<TestForm>(testSchema);
      form.username = 'john_doe';

      const errors = form.getErrors();
      expect(errors.username).toBeNull();
    });
  });

  describe('getTouched()', () => {
    it('should mark fields as touched when set', () => {
      const form = createForm<TestForm>(testSchema);

      expect(form.getTouched().username).toBe(false);

      form.username = 'john';

      expect(form.getTouched().username).toBe(true);
      expect(form.getTouched().email).toBe(false);
    });
  });

  describe('isValid()', () => {
    it('should return true when all touched fields are valid', () => {
      const form = createForm<TestForm>(testSchema);
      form.username = 'john_doe';
      form.email = 'john@example.com';
      form.age = 25;

      expect(form.isValid()).toBe(true);
    });

    it('should return false when any field has error', () => {
      const form = createForm<TestForm>(testSchema);
      form.username = 'ab'; // Too short

      expect(form.isValid()).toBe(false);
    });

    it('should return true when no fields are touched', () => {
      const form = createForm<TestForm>(testSchema);
      expect(form.isValid()).toBe(true);
    });
  });

  describe('isDirty()', () => {
    it('should return false initially', () => {
      const form = createForm<TestForm>(testSchema);
      expect(form.isDirty()).toBe(false);
    });

    it('should return true after setting a field', () => {
      const form = createForm<TestForm>(testSchema);
      form.username = 'john';
      expect(form.isDirty()).toBe(true);
    });
  });

  describe('validate()', () => {
    it('should validate all fields and return boolean', () => {
      const form = createForm<TestForm>(testSchema);
      form.username = 'john_doe';
      form.email = 'john@example.com';
      form.age = 25;

      expect(form.validate()).toBe(true);
    });

    it('should return false and set errors for invalid form', () => {
      const form = createForm<TestForm>(testSchema);
      // username and email are required but not set

      expect(form.validate()).toBe(false);

      const errors = form.getErrors();
      expect(errors.username).toBe('This field is required');
      expect(errors.email).toBe('This field is required');
    });

    it('should mark all fields as touched', () => {
      const form = createForm<TestForm>(testSchema);
      form.validate();

      const touched = form.getTouched();
      expect(touched.username).toBe(true);
      expect(touched.email).toBe(true);
      expect(touched.age).toBe(true);
    });
  });

  describe('save()', () => {
    it('should return values when form is valid', () => {
      const form = createForm<TestForm>(testSchema);
      form.username = 'john_doe';
      form.email = 'john@example.com';
      form.age = 25;

      const result = form.save();
      expect(result).toEqual({
        username: 'john_doe',
        email: 'john@example.com',
        age: 25,
      });
    });

    it('should throw ValidationError when form is invalid', () => {
      const form = createForm<TestForm>(testSchema);
      form.username = 'ab'; // Too short

      expect(() => form.save()).toThrow(ValidationError);
    });

    it('should include errors in ValidationError', () => {
      const form = createForm<TestForm>(testSchema);
      form.username = 'ab';

      try {
        form.save();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationError);
        expect((e as ValidationError).errors.username).toBe(
          'Must be at least 3 characters'
        );
      }
    });
  });

  describe('reset()', () => {
    it('should reset to initial values', () => {
      const form = createForm<TestForm>(testSchema, {
        initialValues: { username: 'initial' },
      });

      form.username = 'modified';
      form.reset();

      expect(form.username).toBe('initial');
    });

    it('should clear touched state', () => {
      const form = createForm<TestForm>(testSchema);
      form.username = 'john';
      form.reset();

      expect(form.getTouched().username).toBe(false);
    });

    it('should clear errors', () => {
      const form = createForm<TestForm>(testSchema);
      form.username = 'ab'; // Invalid
      form.reset();

      expect(form.getErrors().username).toBeNull();
    });
  });

  describe('reserved methods protection', () => {
    it('should not allow overwriting reserved methods', () => {
      const form = createForm<TestForm>(testSchema);

      // Attempting to set a reserved method should throw TypeError
      expect(() => {
        (form as unknown as Record<string, unknown>).getErrors = 'overwritten';
      }).toThrow(TypeError);

      expect(typeof form.getErrors).toBe('function');
    });
  });

  describe('unknown fields', () => {
    it('should not allow setting fields not in schema', () => {
      const form = createForm<TestForm>(testSchema);

      // Attempting to set unknown field should throw TypeError
      expect(() => {
        (form as unknown as Record<string, unknown>).unknownField = 'value';
      }).toThrow(TypeError);

      expect((form as unknown as Record<string, unknown>).unknownField).toBeUndefined();
    });
  });
});
