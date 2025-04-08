import { Rule } from 'eslint';
import * as ESTree from 'estree';

interface BlacklistedStringRule {
  value: string;
  reason?: string;
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect blacklisted strings in the codebase',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          strings: {
            type: 'array',
            items: {
              oneOf: [
                { type: 'string' },
                {
                  type: 'object',
                  properties: {
                    value: { type: 'string' },
                    reason: { type: 'string' },
                  },
                  required: ['value'],
                  additionalProperties: false,
                },
              ],
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = (context.options[0] || {}) as { strings?: (string | BlacklistedStringRule)[] };
    const blacklistedStrings: (string | BlacklistedStringRule)[] = options.strings || [];

    // Skip if no blacklisted strings are defined
    if (blacklistedStrings.length === 0) {
      return {};
    }

    // Helper function to check if a string contains blacklisted content
    const checkForBlacklistedStrings = (stringValue: string, node: ESTree.Node) => {
      // Check if the string contains any blacklisted strings
      const blacklistedString = blacklistedStrings.find((str) => {
        const value = typeof str === 'string' ? str : str.value;
        return stringValue.includes(value);
      });

      if (blacklistedString) {
        const blacklistedValue = typeof blacklistedString === 'string' ? blacklistedString : blacklistedString.value;

        const message =
          typeof blacklistedString === 'string'
            ? `String "${blacklistedValue}" is blacklisted.`
            : blacklistedString.reason
              ? `String "${blacklistedValue}" is blacklisted: ${blacklistedString.reason}`
              : `String "${blacklistedValue}" is blacklisted.`;

        context.report({
          node,
          message,
        });
      }
    };

    return {
      Literal(node: ESTree.Literal) {
        // Only check string literals
        if (typeof node.value === 'string') {
          checkForBlacklistedStrings(node.value, node);
        }
      },

      // Also check template literals
      TemplateLiteral(node: ESTree.TemplateLiteral) {
        // Check each quasi (string part) of the template literal
        if (Array.isArray(node.quasis)) {
          node.quasis.forEach((quasi: ESTree.TemplateElement) => {
            if (quasi.value && quasi.value.raw) {
              checkForBlacklistedStrings(quasi.value.raw, quasi);
            }
          });
        }
      },

      // Check JSX text content
      JSXText(node: ESTree.Literal) {
        if (typeof node.value === 'string') {
          checkForBlacklistedStrings(node.value, node);
        }
      },
    };
  },
};

export default rule;
