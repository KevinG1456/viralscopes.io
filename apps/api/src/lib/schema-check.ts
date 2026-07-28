// Minimal structural check against a prompt_library.output_schema (a plain
// JSON-Schema-shaped object, not a Zod schema -- see Database_Schema.md
// section 8's "Zod schema in JSON format" description, which this project
// stores as JSON Schema rather than a serialized Zod instance since Zod
// itself has no JSON serialization format). Deliberately not a full
// JSON-Schema validator (no $ref, no nested array-item validation beyond
// one level) -- PROJECT_RULES.md section 9.5's own regression assertions
// are exactly this shallow: "output is valid JSON, matches the expected
// Zod schema, no required fields are null or empty."
export interface SchemaCheckResult {
  valid: boolean;
  errors: string[];
}

interface JsonSchemaLike {
  type?: string;
  required?: string[];
  properties?: Record<string, { enum?: unknown[] }>;
}

export function checkAgainstOutputSchema(output: unknown, schema: unknown): SchemaCheckResult {
  const errors: string[] = [];
  const s = schema as JsonSchemaLike;

  if (typeof output !== 'object' || output === null || Array.isArray(output)) {
    return { valid: false, errors: ['output is not a JSON object'] };
  }
  const obj = output as Record<string, unknown>;

  for (const key of s.required ?? []) {
    const value = obj[key];
    if (value === undefined || value === null || value === '') {
      errors.push(`required field "${key}" is missing or empty`);
      continue;
    }
    const enumValues = s.properties?.[key]?.enum;
    if (enumValues && !enumValues.includes(value)) {
      errors.push(`field "${key}" value "${String(value)}" is not one of the allowed enum values`);
    }
  }

  return { valid: errors.length === 0, errors };
}
