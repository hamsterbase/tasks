import type { Rule } from 'eslint';
import type { MemberExpression, Node, ObjectExpression, Property, VariableDeclarator } from 'estree';

const globalStyleState = {
  usedStyles: new Set<string>(),
  definedStyles: new Set<string>(),
  desktopStylesDefinition: null as ObjectExpression | null,
  definitionFile: null as string | null,
  processedFiles: new Set<string>(),
};

const detectUnusedDesktopStyles: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect unused desktop styles',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      unusedStyle: 'Desktop style "{{styleName}}" is defined but never used',
    },
  },

  create(context) {
    const filename = context.filename;

    return {
      VariableDeclarator(node: VariableDeclarator) {
        if (
          node.id &&
          node.id.type === 'Identifier' &&
          node.id.name === 'desktopStyles' &&
          node.init &&
          node.init.type === 'ObjectExpression'
        ) {
          globalStyleState.desktopStylesDefinition = node.init;
          globalStyleState.definitionFile = filename;
          node.init.properties.forEach((property) => {
            if (property.type === 'Property' && property.key) {
              let keyName: string | undefined;
              if (property.key.type === 'Identifier') {
                keyName = property.key.name;
              } else if (property.key.type === 'Literal' && typeof property.key.value === 'string') {
                keyName = property.key.value;
              }
              if (keyName) {
                globalStyleState.definedStyles.add(keyName);
              }
            }
          });
        }
      },

      MemberExpression(node: MemberExpression) {
        if (node.object && node.object.type === 'Identifier' && node.object.name === 'desktopStyles' && node.property) {
          let propertyName: string | undefined;
          if (node.computed === false && node.property.type === 'Identifier') {
            propertyName = node.property.name;
          } else if (
            node.computed === true &&
            node.property.type === 'Literal' &&
            typeof node.property.value === 'string'
          ) {
            propertyName = node.property.value;
          }
          if (propertyName) {
            globalStyleState.usedStyles.add(propertyName);
          }
        }
      },

      'Program:exit'() {
        if (filename !== globalStyleState.definitionFile || !globalStyleState.desktopStylesDefinition) {
          return;
        }
        if (globalStyleState.usedStyles.size === 0) {
          // 如果没有使用的样式，直接返回
          return;
        }
        if (process.env.NODE_PATH?.includes('lint-staged')) {
          return;
        }
        for (const styleName of globalStyleState.definedStyles) {
          if (!globalStyleState.usedStyles.has(styleName)) {
            const propertyNode = globalStyleState.desktopStylesDefinition.properties.find((property) => {
              if (property.type === 'Property' && property.key) {
                let keyName: string | undefined;
                if (property.key.type === 'Identifier') {
                  keyName = property.key.name;
                } else if (property.key.type === 'Literal' && typeof property.key.value === 'string') {
                  keyName = property.key.value;
                }
                return keyName === styleName;
              }
              return false;
            }) as Property | undefined;

            if (propertyNode) {
              context.report({
                node: propertyNode as Node,
                messageId: 'unusedStyle',
                data: { styleName },
              });
            }
          }
        }
      },
    };
  },
};

export default detectUnusedDesktopStyles;
