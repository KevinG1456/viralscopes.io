// Renders a prompt_library user_template ({{variable}} placeholders,
// per Database_Schema.md section 8's "handlebars-style" description) --
// deliberately not a full Handlebars dependency for this small, flat
// substitution need. An unresolved placeholder is left as literal text
// rather than throwing, since a test-harness run against a fixture that
// doesn't define every variable a given prompt references is a fixture
// gap worth seeing in the output, not a crash.
export function renderPromptTemplate(template: string, variables: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    const value = variables[key];
    if (value === undefined || value === null) {
      return match;
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  });
}
