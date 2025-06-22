import { Rule } from 'eslint';
import * as ESTree from 'estree';

// 中文字符正则表达式（包括常用汉字、扩展汉字、符号等）
const CHINESE_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303f\uff00-\uffef]/;

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow Chinese characters in localization and format values',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      chineseInValue: 'Chinese characters are not allowed in {{functionName}} values. Found: "{{value}}"',
    },
  },

  create(context) {
    // Helper to check if a node is a localize or format function call
    const isTargetCall = (node: ESTree.CallExpression): { isTarget: boolean; functionName: string } => {
      const callee = node.callee;

      // Check direct function calls: localize() or format()
      if (callee.type === 'Identifier') {
        if (callee.name === 'localize') {
          return { isTarget: true, functionName: 'localize' };
        }
        if (callee.name === 'format') {
          return { isTarget: true, functionName: 'format' };
        }
      }

      // Check member expression calls: object.format()
      if (callee.type === 'MemberExpression') {
        const property = callee.property;
        if (property.type === 'Identifier' && property.name === 'format') {
          return { isTarget: true, functionName: 'format' };
        }
      }

      return { isTarget: false, functionName: '' };
    };

    // Helper to check if string contains Chinese characters
    const containsChinese = (str: string): boolean => {
      return CHINESE_REGEX.test(str);
    };

    // Helper to process localize function calls
    const processLocalizeCall = (node: ESTree.CallExpression, functionName: string) => {
      if (node.arguments.length < 2) {
        return;
      }

      const valueNode = node.arguments[1];

      // Only check string literals for Chinese characters
      if (valueNode.type === 'Literal' && typeof valueNode.value === 'string') {
        const value = valueNode.value;

        if (containsChinese(value)) {
          context.report({
            node: valueNode,
            messageId: 'chineseInValue',
            data: {
              value: value,
              functionName: functionName,
            },
          });
        }
      }
    };

    // Helper to process format function calls
    const processFormatCall = (node: ESTree.CallExpression, functionName: string) => {
      if (node.arguments.length < 1) {
        return;
      }

      const valueNode = node.arguments[0];

      // Only check string literals for Chinese characters
      if (valueNode.type === 'Literal' && typeof valueNode.value === 'string') {
        const value = valueNode.value;

        if (containsChinese(value)) {
          context.report({
            node: valueNode,
            messageId: 'chineseInValue',
            data: {
              value: value,
              functionName: functionName,
            },
          });
        }
      }
    };

    return {
      // Look for localize and format function calls
      CallExpression(node: ESTree.CallExpression) {
        const { isTarget, functionName } = isTargetCall(node);
        if (isTarget) {
          if (functionName === 'localize') {
            processLocalizeCall(node, functionName);
          } else if (functionName === 'format') {
            processFormatCall(node, functionName);
          }
        }
      },
    };
  },
};

export default rule;
