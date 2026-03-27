import { describe, it, expect } from 'vitest';
import { validateField } from '../src/validators.js';
import type { FieldRule } from '../src/types.js';

describe('validators', () => {
  describe('required validation', () => {
    it('should return error for undefined value when required', () => {
      const rule: FieldRule<string> = { type: 'string', required: true };
      expect(validateField(undefined, rule, {})).toBe('This field is required');
    });

    it('should return error for null value when required', () => {
      const rule: FieldRule<string> = { type: 'string', required: true };
      expect(validateField(null, rule, {})).toBe('This field is required');
    });

    it('should return error for empty string when required', () => {
      const rule: FieldRule<string> = { type: 'string', required: true };
      expect(validateField('', rule, {})).toBe('This field is required');
    });

    it('should pass for valid value when required', () => {
      const rule: FieldRule<string> = { type: 'string', required: true };
      expect(validateField('hello', rule, {})).toBeNull();
    });

    it('should pass for undefined value when not required', () => {
      const rule: FieldRule<string> = { type: 'string' };
      expect(validateField(undefined, rule, {})).toBeNull();
    });
  });

  describe('type validation', () => {
    it('should return error for wrong type', () => {
      const rule: FieldRule<string> = { type: 'string' };
      expect(validateField(123, rule, {})).toBe('Expected string');
    });

    it('should pass for correct string type', () => {
      const rule: FieldRule<string> = { type: 'string' };
      expect(validateField('hello', rule, {})).toBeNull();
    });

    it('should pass for correct number type', () => {
      const rule: FieldRule<number> = { type: 'number' };
      expect(validateField(42, rule, {})).toBeNull();
    });

    it('should pass for correct boolean type', () => {
      const rule: FieldRule<boolean> = { type: 'boolean' };
      expect(validateField(true, rule, {})).toBeNull();
    });
  });

  describe('minLength validation', () => {
    it('should return error when string is too short', () => {
      const rule: FieldRule<string> = { type: 'string', minLength: 5 };
      expect(validateField('abc', rule, {})).toBe('Must be at least 5 characters');
    });

    it('should pass when string meets minimum length', () => {
      const rule: FieldRule<string> = { type: 'string', minLength: 3 };
      expect(validateField('abc', rule, {})).toBeNull();
    });
  });

  describe('maxLength validation', () => {
    it('should return error when string is too long', () => {
      const rule: FieldRule<string> = { type: 'string', maxLength: 5 };
      expect(validateField('abcdefgh', rule, {})).toBe('Must be at most 5 characters');
    });

    it('should pass when string meets maximum length', () => {
      const rule: FieldRule<string> = { type: 'string', maxLength: 10 };
      expect(validateField('abc', rule, {})).toBeNull();
    });
  });

  describe('min validation', () => {
    it('should return error when number is too small', () => {
      const rule: FieldRule<number> = { type: 'number', min: 10 };
      expect(validateField(5, rule, {})).toBe('Must be at least 10');
    });

    it('should pass when number meets minimum', () => {
      const rule: FieldRule<number> = { type: 'number', min: 10 };
      expect(validateField(10, rule, {})).toBeNull();
    });
  });

  describe('max validation', () => {
    it('should return error when number is too large', () => {
      const rule: FieldRule<number> = { type: 'number', max: 10 };
      expect(validateField(15, rule, {})).toBe('Must be at most 10');
    });

    it('should pass when number meets maximum', () => {
      const rule: FieldRule<number> = { type: 'number', max: 10 };
      expect(validateField(10, rule, {})).toBeNull();
    });
  });

  describe('pattern validation', () => {
    it('should return error when pattern does not match', () => {
      const rule: FieldRule<string> = { type: 'string', pattern: /^[a-z]+$/ };
      expect(validateField('ABC123', rule, {})).toBe('Invalid format');
    });

    it('should pass when pattern matches', () => {
      const rule: FieldRule<string> = { type: 'string', pattern: /^[a-z]+$/ };
      expect(validateField('abc', rule, {})).toBeNull();
    });
  });

  describe('custom message', () => {
    it('should use custom message for required', () => {
      const rule: FieldRule<string> = {
        type: 'string',
        required: true,
        message: 'Custom required message',
      };
      expect(validateField('', rule, {})).toBe('Custom required message');
    });

    it('should use custom message for pattern', () => {
      const rule: FieldRule<string> = {
        type: 'string',
        pattern: /^[a-z]+$/,
        message: 'Only lowercase letters allowed',
      };
      expect(validateField('ABC', rule, {})).toBe('Only lowercase letters allowed');
    });
  });

  describe('custom validator', () => {
    it('should run custom validator function', () => {
      const rule: FieldRule<string> = {
        type: 'string',
        validate: (value) => (value === 'forbidden' ? 'Value is forbidden' : null),
      };
      expect(validateField('forbidden', rule, {})).toBe('Value is forbidden');
    });

    it('should pass custom validator for valid value', () => {
      const rule: FieldRule<string> = {
        type: 'string',
        validate: (value) => (value === 'forbidden' ? 'Value is forbidden' : null),
      };
      expect(validateField('allowed', rule, {})).toBeNull();
    });

    it('should have access to all values', () => {
      const rule: FieldRule<string> = {
        type: 'string',
        validate: (value, allValues) =>
          value !== allValues.password ? 'Passwords must match' : null,
      };
      expect(validateField('abc', rule, { password: 'xyz' })).toBe('Passwords must match');
      expect(validateField('xyz', rule, { password: 'xyz' })).toBeNull();
    });
  });
});
