import { Rule } from 'eslint';
import * as ESTree from 'estree';

// Track all localization keys and their corresponding values and locations
interface LocalizationInfo {
  value: string;
  locations: string[];
}

// Store our localization data
// This needs to be global to share across all files
const localizedStrings: Map<string, LocalizationInfo> = new Map();

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect duplicate localization keys with different values and collect all key-value pairs',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
  },

  create(context) {
    // Get the source filepath to include in reporting
    const filepath = context.getFilename();

    // Helper to check if a node is a localize function call
    const isLocalizeCall = (node: ESTree.CallExpression): boolean => {
      const callee = node.callee;
      if (callee.type === 'Identifier') {
        return callee.name === 'localize';
      }
      return false;
    };

    // Helper to extract key and value from localize calls
    const processLocalizeCall = (node: ESTree.CallExpression) => {
      if (node.arguments.length < 2) {
        return;
      }

      const keyNode = node.arguments[0];
      const valueNode = node.arguments[1];

      // Check for template literals
      if (keyNode.type === 'TemplateLiteral' || valueNode.type === 'TemplateLiteral') {
        context.report({
          node,
          message: 'Template literals are not allowed in localize function calls. Please use string literals instead.',
        });
        return;
      }

      // Only process when both key and value are string literals
      if (
        keyNode.type === 'Literal' &&
        typeof keyNode.value === 'string' &&
        valueNode.type === 'Literal' &&
        typeof valueNode.value === 'string'
      ) {
        const key = keyNode.value;
        const value = valueNode.value;
        const location = `${filepath}:${node.loc?.start.line || 0}`;

        // Check if this key was used before
        if (localizedStrings.has(key)) {
          const existingInfo = localizedStrings.get(key)!;

          // If the value is different, report an error
          if (existingInfo.value !== value) {
            context.report({
              node,
              message:
                `Duplicate localization key '${key}' with different values.\n` +
                `Current: '${value}' at ${location}\n` +
                `Previously: '${existingInfo.value}' at ${existingInfo.locations[0]}`,
            });
          } else {
            // Same value, just track the new location
            existingInfo.locations.push(location);
          }
        } else {
          // New key, store it with its location
          localizedStrings.set(key, {
            value,
            locations: [location],
          });
        }
      }
    };

    return {
      // Look for localize function calls
      CallExpression(node: ESTree.CallExpression) {
        if (isLocalizeCall(node)) {
          processLocalizeCall(node);
        }
      },
    };
  },
};

export default rule;
