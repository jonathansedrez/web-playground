import { createForm, ValidationError } from "../src/index.js";
import type { Schema } from "../src/types.js";

interface UserForm {
  username: string;
  email: string;
  age: number;
}

const schema: Schema<UserForm> = {
  username: {
    type: "string",
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: "Username must be 3-20 alphanumeric characters",
  },
  email: {
    type: "string",
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Invalid email format",
  },
  age: {
    type: "number",
    min: 18,
    max: 120,
    message: "Age must be between 18 and 120",
  },
};

const form = createForm<UserForm>(schema);

console.log("Setting values...");
form.username = "john_doe";
form.email = "john@example.com";
form.age = 25;

console.log("\nCurrent values:");
console.log("Username:", form.username);
console.log("Email:", form.email);
console.log("Age:", form.age);

console.log("\nForm state:");
console.log("Errors:", form.getErrors());
console.log("Touched:", form.getTouched());
console.log("Is Valid:", form.isValid());
console.log("Is Dirty:", form.isDirty());

console.log("\nSaving form...");
try {
  const data = form.save();
  console.log("Saved successfully:", data);
} catch (e) {
  if (e instanceof ValidationError) {
    console.log("Validation failed:", e.errors);
  }
}

console.log("\n--- Testing validation errors ---");
form.username = "ab";
console.log("After setting short username:");
console.log("Errors:", form.getErrors());
console.log("Is Valid:", form.isValid());

try {
  form.save();
} catch (e) {
  if (e instanceof ValidationError) {
    console.log("Cannot save - errors:", e.errors);
  }
}

console.log("\n--- Resetting form ---");
form.reset();
console.log("After reset:");
console.log("Values:", form.getValues());
console.log("Touched:", form.getTouched());
console.log("Is Dirty:", form.isDirty());
