import { describe, it, expect } from 'vitest';
import { createForm, ValidationError } from '../src/index.js';
import type { Schema } from '../src/types.js';

describe('Integration Tests', () => {
  describe('Login Form', () => {
    interface LoginForm {
      email: string;
      password: string;
    }

    const loginSchema: Schema<LoginForm> = {
      email: {
        type: 'string',
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Invalid email format',
      },
      password: {
        type: 'string',
        required: true,
        minLength: 8,
        message: 'Password must be at least 8 characters',
      },
    };

    it('should handle complete login flow', () => {
      const form = createForm<LoginForm>(loginSchema);

      // Initially not dirty
      expect(form.isDirty()).toBe(false);

      // Set email
      form.email = 'user@example.com';
      expect(form.isDirty()).toBe(true);
      expect(form.getErrors().email).toBeNull();

      // Set short password
      form.password = 'short';
      expect(form.getErrors().password).toBe('Password must be at least 8 characters');
      expect(form.isValid()).toBe(false);

      // Fix password
      form.password = 'validpassword123';
      expect(form.getErrors().password).toBeNull();
      expect(form.isValid()).toBe(true);

      // Save
      const data = form.save();
      expect(data.email).toBe('user@example.com');
      expect(data.password).toBe('validpassword123');
    });
  });

  describe('Signup Form with Password Confirmation', () => {
    interface SignupForm {
      password: string;
      confirmPassword: string;
    }

    const signupSchema: Schema<SignupForm> = {
      password: {
        type: 'string',
        required: true,
        minLength: 8,
      },
      confirmPassword: {
        type: 'string',
        required: true,
        validate: (value, allValues) =>
          value !== allValues.password ? 'Passwords must match' : null,
      },
    };

    it('should validate password confirmation', () => {
      const form = createForm<SignupForm>(signupSchema);

      form.password = 'securepassword';
      form.confirmPassword = 'differentpassword';

      expect(form.getErrors().confirmPassword).toBe('Passwords must match');

      form.confirmPassword = 'securepassword';
      expect(form.getErrors().confirmPassword).toBeNull();
    });
  });

  describe('Edit Form with Initial Values', () => {
    interface UserForm {
      name: string;
      bio: string;
    }

    const userSchema: Schema<UserForm> = {
      name: { type: 'string', required: true },
      bio: { type: 'string', maxLength: 200 },
    };

    it('should handle edit workflow', () => {
      const form = createForm<UserForm>(userSchema, {
        initialValues: {
          name: 'John Doe',
          bio: 'Software developer',
        },
      });

      // Should have initial values
      expect(form.name).toBe('John Doe');
      expect(form.bio).toBe('Software developer');

      // Modify
      form.bio = 'Senior software developer';
      expect(form.isDirty()).toBe(true);

      // Reset should restore initial values
      form.reset();
      expect(form.bio).toBe('Software developer');
      expect(form.isDirty()).toBe(false);
    });
  });

  describe('Numeric Range Form', () => {
    interface AgeForm {
      age: number;
    }

    const ageSchema: Schema<AgeForm> = {
      age: {
        type: 'number',
        required: true,
        min: 18,
        max: 120,
        message: 'Age must be between 18 and 120',
      },
    };

    it('should validate numeric ranges', () => {
      const form = createForm<AgeForm>(ageSchema);

      form.age = 15;
      expect(form.getErrors().age).toBe('Age must be between 18 and 120');

      form.age = 25;
      expect(form.getErrors().age).toBeNull();

      form.age = 150;
      expect(form.getErrors().age).toBe('Age must be between 18 and 120');
    });
  });

  describe('Error Handling', () => {
    interface SimpleForm {
      field: string;
    }

    const schema: Schema<SimpleForm> = {
      field: { type: 'string', required: true },
    };

    it('should throw ValidationError with proper structure', () => {
      const form = createForm<SimpleForm>(schema);

      try {
        form.save();
        expect.fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationError);
        expect((e as ValidationError).name).toBe('ValidationError');
        expect((e as ValidationError).message).toBe('Form validation failed');
        expect((e as ValidationError).errors).toHaveProperty('field');
      }
    });
  });

  describe('Type Validation', () => {
    interface TypedForm {
      name: string;
      count: number;
      active: boolean;
    }

    const schema: Schema<TypedForm> = {
      name: { type: 'string' },
      count: { type: 'number' },
      active: { type: 'boolean' },
    };

    it('should validate types correctly', () => {
      const form = createForm<TypedForm>(schema);

      form.name = 'valid';
      expect(form.getErrors().name).toBeNull();

      // Setting wrong type
      (form as unknown as Record<string, unknown>).name = 123;
      expect(form.getErrors().name).toBe('Expected string');

      form.count = 42;
      expect(form.getErrors().count).toBeNull();

      form.active = true;
      expect(form.getErrors().active).toBeNull();
    });
  });
});
