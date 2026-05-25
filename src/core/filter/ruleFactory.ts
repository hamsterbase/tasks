import * as espree from 'espree';
import type { Node } from 'estree';
import type { FieldSchema, FilterItem, ItemSchema, ParseError, ParseResult } from './types.ts';

export type { FieldSchema, ItemSchema, FilterItem, ErrorCode, ParseError, ParseResult } from './types.ts';

const ROOT_NAME = 'item';

class CompileError extends Error {
  constructor(public readonly parseError: ParseError) {
    super(parseError.message);
  }
}

export interface RuleFactoryOptions {
  /** Named numeric constants usable on the right-hand side of comparisons. */
  constants?: Record<string, number>;
}

export function ruleFactory(
  schema: ItemSchema,
  options: RuleFactoryOptions = {}
): (expr: string) => ParseResult {
  const fields = new Map<string, FieldSchema>(Object.entries(schema));
  const constants = options.constants ?? {};

  return (expr: string): ParseResult => {
    if (expr.trim() === '') {
      return {
        success: false,
        error: {
          code: 'EMPTY_EXPRESSION',
          message: 'Expression is empty',
          location: { start: 0, end: 0 },
        },
      };
    }

    let ast: Node;
    try {
      ast = espree.parse(expr, {
        ecmaVersion: 'latest',
        sourceType: 'script',
        loc: true,
        range: true,
      }) as Node;
    } catch (e) {
      return { success: false, error: toSyntaxError(e, expr) };
    }

    try {
      const fn = compileProgram(ast, fields, constants);
      return { success: true, fn };
    } catch (e) {
      if (e instanceof CompileError) {
        return { success: false, error: e.parseError };
      }
      throw e;
    }
  };
}

function compileProgram(
  ast: Node,
  fields: Map<string, FieldSchema>,
  constants: Record<string, number>
): (item: FilterItem) => boolean {
  if (ast.type !== 'Program' || ast.body.length !== 1 || ast.body[0].type !== 'ExpressionStatement') {
    throw new CompileError({
      code: 'UNSUPPORTED_SYNTAX',
      message: 'Expression must be a single boolean expression',
      location: rangeOf(ast),
    });
  }
  return compileBoolean(ast.body[0].expression, fields, constants);
}

function compileBoolean(
  node: Node,
  fields: Map<string, FieldSchema>,
  constants: Record<string, number>
): (item: FilterItem) => boolean {
  if (node.type === 'BinaryExpression') {
    return compileBinary(node, fields, constants);
  }
  if (node.type === 'LogicalExpression') {
    if (node.operator !== '&&' && node.operator !== '||') {
      throw new CompileError({
        code: 'INVALID_OPERATOR',
        message: `Logical operator '${node.operator}' is not supported`,
        location: rangeOf(node),
      });
    }
    const left = compileBoolean(node.left as Node, fields, constants);
    const right = compileBoolean(node.right as Node, fields, constants);
    return node.operator === '&&' ? (item) => left(item) && right(item) : (item) => left(item) || right(item);
  }
  if (node.type === 'UnaryExpression') {
    if (node.operator !== '!') {
      throw new CompileError({
        code: 'INVALID_OPERATOR',
        message: `Unary operator '${node.operator}' is not supported`,
        location: rangeOf(node),
      });
    }
    const inner = compileBoolean(node.argument as Node, fields, constants);
    return (item) => !inner(item);
  }
  if (node.type === 'CallExpression') {
    return compileCall(node, fields);
  }
  if (node.type === 'Identifier') {
    throw new CompileError({
      code: 'UNKNOWN_IDENTIFIER',
      message:
        node.name === ROOT_NAME
          ? `'${ROOT_NAME}' must be accessed via '${ROOT_NAME}.<field>'`
          : `Unknown identifier '${node.name}'`,
      location: rangeOf(node),
      params: { name: node.name },
    });
  }
  if (node.type === 'MemberExpression') {
    const field = readItemField(node, fields);
    if (field.schema.type !== 'boolean') {
      throw new CompileError({
        code: 'INVALID_LOGICAL_OPERAND',
        message: `Field '${field.name}' of type '${field.schema.type}' cannot be used as a boolean; only boolean fields may appear in a logical position`,
        location: rangeOf(node),
        params: { name: field.name, type: field.schema.type },
      });
    }
    return (item) => readBoolean(item, field.name);
  }
  throw new CompileError({
    code: 'UNSUPPORTED_SYNTAX',
    message: `Unsupported expression: ${node.type}`,
    location: rangeOf(node),
  });
}

function compileBinary(
  node: Extract<Node, { type: 'BinaryExpression' }>,
  fields: Map<string, FieldSchema>,
  constants: Record<string, number>
): (item: FilterItem) => boolean {
  const op = node.operator;
  if (op !== '===' && op !== '!==' && op !== '<' && op !== '<=' && op !== '>' && op !== '>=') {
    throw new CompileError({
      code: 'INVALID_OPERATOR',
      message: `Operator '${op}' is not supported`,
      location: rangeOf(node),
    });
  }

  const rightIsNull =
    (op === '===' || op === '!==') &&
    node.right.type === 'Literal' &&
    (node.right as { value: unknown }).value === null;

  const numLeft = tryCompileNumericValue(node.left as Node, fields);
  if (numLeft) {
    return compileNumericComparison(numLeft, op, node.right as Node, node, constants);
  }

  if (rightIsNull) {
    const field = readItemField(node.left as Node, fields);
    throw new CompileError({
      code: 'INVALID_NULL_CHECK',
      message: `Field '${field.name}' of type '${field.schema.type}' cannot be compared with null; only number fields may be null-checked`,
      location: rangeOf(node.right),
      params: { field: field.name, type: field.schema.type },
    });
  }

  if (op === '===' || op === '!==') {
    const field = readItemField(node.left as Node, fields);
    if (field.schema.type === 'string') {
      const literal = readStringLiteral(node.right as Node);
      const accessor = (item: FilterItem) => readString(item, field.name);
      return op === '===' ? (item) => accessor(item) === literal : (item) => accessor(item) !== literal;
    }
    if (field.schema.type === 'boolean') {
      const literal = readBooleanLiteral(node.right as Node);
      const accessor = (item: FilterItem) => readBoolean(item, field.name);
      return op === '===' ? (item) => accessor(item) === literal : (item) => accessor(item) !== literal;
    }
    if (field.schema.type === 'enum') {
      const literal = readEnumLiteral(node.right as Node, field.schema.values, field.name);
      const accessor = (item: FilterItem) => readEnum(item, field.name);
      return op === '===' ? (item) => accessor(item) === literal : (item) => accessor(item) !== literal;
    }
    throw new CompileError({
      code: 'TYPE_MISMATCH',
      message: `Equality on type '${field.schema.type}' is not supported`,
      location: rangeOf(node),
    });
  }

  throw new CompileError({
    code: 'TYPE_MISMATCH',
    message: `Operator '${op}' requires a numeric operand on the left`,
    location: rangeOf(node.left),
  });
}

type NumericValue = (item: FilterItem) => number | null;

function tryCompileNumericValue(node: Node, fields: Map<string, FieldSchema>): NumericValue | null {
  if (node.type === 'MemberExpression' && !node.computed) {
    // item.<numberField>
    if (node.object.type === 'Identifier' && node.object.name === ROOT_NAME) {
      const field = readItemField(node, fields);
      if (field.schema.type === 'number') {
        return (item) => readNullableNumber(item, field.name);
      }
      return null;
    }
    // item.<listField>.length
    if (
      node.property.type === 'Identifier' &&
      node.property.name === 'length' &&
      node.object.type === 'MemberExpression'
    ) {
      const inner = readItemField(node.object, fields);
      if (inner.schema.type !== 'list') {
        throw new CompileError({
          code: 'INVALID_MEMBER_ACCESS',
          message: `Property '.length' is not available on type '${inner.schema.type}'`,
          location: rangeOf(node.property),
        });
      }
      return (item) => readList(item, inner.name).length;
    }
  }
  return null;
}

function compileNumericComparison(
  left: NumericValue,
  op: '===' | '!==' | '<' | '<=' | '>' | '>=',
  rightNode: Node,
  fullNode: Node,
  constants: Record<string, number>
): (item: FilterItem) => boolean {
  if (op === '===' || op === '!==') {
    if (rightNode.type === 'Literal' && rightNode.value === null) {
      return op === '===' ? (item) => left(item) === null : (item) => left(item) !== null;
    }
    const literal = readNumericLiteral(rightNode, constants);
    return op === '===' ? (item) => left(item) === literal : (item) => left(item) !== literal;
  }
  const literal = readNumericLiteral(rightNode, constants);
  return (item) => {
    const v = left(item);
    if (v === null) return false;
    switch (op) {
      case '<':
        return v < literal;
      case '<=':
        return v <= literal;
      case '>':
        return v > literal;
      case '>=':
        return v >= literal;
    }
    void fullNode;
    return false;
  };
}

function readNumericLiteral(node: Node, constants: Record<string, number>): number {
  if (node.type === 'Literal' && typeof node.value === 'number') {
    return node.value;
  }
  if (node.type === 'UnaryExpression' && (node.operator === '-' || node.operator === '+')) {
    const inner = readNumericLiteral(node.argument as Node, constants);
    return node.operator === '-' ? -inner : inner;
  }
  if (node.type === 'Identifier' && Object.prototype.hasOwnProperty.call(constants, node.name)) {
    return constants[node.name];
  }
  if (node.type === 'BinaryExpression') {
    const left = readNumericLiteral(node.left as Node, constants);
    const right = readNumericLiteral(node.right as Node, constants);
    switch (node.operator) {
      case '+':
        return left + right;
      case '-':
        return left - right;
      case '*':
        return left * right;
      case '/':
        return left / right;
    }
    throw new CompileError({
      code: 'INVALID_OPERATOR',
      message: `Arithmetic operator '${node.operator}' is not supported`,
      location: rangeOf(node),
    });
  }
  throw new CompileError({
    code: 'TYPE_MISMATCH',
    message: 'Expected a numeric literal or constant',
    location: rangeOf(node),
  });
}

function readNullableNumber(item: FilterItem, name: string): number | null {
  const v = item[name];
  if (typeof v === 'number') return v;
  return null;
}

function compileCall(
  node: Extract<Node, { type: 'CallExpression' }>,
  fields: Map<string, FieldSchema>
): (item: FilterItem) => boolean {
  const callee = node.callee as Node;
  if (callee.type !== 'MemberExpression' || callee.computed || callee.property.type !== 'Identifier') {
    throw new CompileError({
      code: 'INVALID_METHOD',
      message: 'Only whitelisted methods on item.<field> may be called',
      location: rangeOf(node),
    });
  }
  const methodName = callee.property.name;
  if (methodName !== 'includes') {
    throw new CompileError({
      code: 'INVALID_METHOD',
      message: `Method '${methodName}' is not supported`,
      location: rangeOf(callee.property),
      params: { method: methodName },
    });
  }
  const field = readItemField(callee.object as Node, fields);
  if (field.schema.type !== 'list' && field.schema.type !== 'string') {
    throw new CompileError({
      code: 'INVALID_METHOD',
      message: `Method 'includes' is not available on type '${field.schema.type}'`,
      location: rangeOf(callee.property),
      params: { method: 'includes', type: field.schema.type },
    });
  }
  if (node.arguments.length !== 1) {
    throw new CompileError({
      code: 'INVALID_ARGUMENT',
      message: `Method 'includes' expects exactly 1 argument`,
      location: rangeOf(node),
    });
  }
  const arg = node.arguments[0] as Node;
  if (arg.type !== 'Literal' || typeof arg.value !== 'string') {
    throw new CompileError({
      code: 'INVALID_ARGUMENT',
      message: `Method 'includes' expects a string literal argument`,
      location: rangeOf(arg),
    });
  }
  const literal = arg.value;
  if (field.schema.type === 'list') {
    return (item) => readList(item, field.name).includes(literal);
  }
  return (item) => readString(item, field.name).includes(literal);
}

function readItemField(node: Node, fields: Map<string, FieldSchema>): { name: string; schema: FieldSchema } {
  if (node.type === 'Identifier') {
    throw new CompileError({
      code: 'UNKNOWN_IDENTIFIER',
      message:
        node.name === ROOT_NAME
          ? `'${ROOT_NAME}' must be accessed via '${ROOT_NAME}.<field>'`
          : `Unknown identifier '${node.name}'`,
      location: rangeOf(node),
      params: { name: node.name },
    });
  }
  if (node.type !== 'MemberExpression') {
    throw new CompileError({
      code: 'UNSUPPORTED_SYNTAX',
      message: `Expected ${ROOT_NAME}.<field>`,
      location: rangeOf(node),
    });
  }
  if (node.computed) {
    throw new CompileError({
      code: 'INVALID_MEMBER_ACCESS',
      message: 'Computed member access is not supported',
      location: rangeOf(node),
    });
  }
  if (node.object.type !== 'Identifier' || node.object.name !== ROOT_NAME) {
    throw new CompileError({
      code: 'UNKNOWN_IDENTIFIER',
      message: `Only '${ROOT_NAME}' is allowed as the root identifier`,
      location: rangeOf(node.object),
    });
  }
  if (node.property.type !== 'Identifier') {
    throw new CompileError({
      code: 'INVALID_MEMBER_ACCESS',
      message: 'Field name must be a plain identifier',
      location: rangeOf(node.property),
    });
  }
  const name = node.property.name;
  const schema = fields.get(name);
  if (!schema) {
    throw new CompileError({
      code: 'UNKNOWN_FIELD',
      message: `Unknown field '${name}'`,
      location: rangeOf(node.property),
      params: { name },
    });
  }
  return { name, schema };
}

function readBooleanLiteral(node: Node): boolean {
  if (node.type !== 'Literal' || typeof node.value !== 'boolean') {
    throw new CompileError({
      code: 'TYPE_MISMATCH',
      message: 'Expected a boolean literal (true or false)',
      location: rangeOf(node),
    });
  }
  return node.value;
}

function readEnumLiteral(node: Node, values: string[], fieldName: string): string {
  if (node.type !== 'Literal' || typeof node.value !== 'string') {
    throw new CompileError({
      code: 'TYPE_MISMATCH',
      message: `Expected a string literal for enum field '${fieldName}'`,
      location: rangeOf(node),
      params: { field: fieldName },
    });
  }
  if (!values.includes(node.value)) {
    throw new CompileError({
      code: 'INVALID_ENUM_VALUE',
      message: `'${node.value}' is not a valid value for '${fieldName}'; expected one of: ${values.map((v) => `'${v}'`).join(', ')}`,
      location: rangeOf(node),
      params: { field: fieldName, value: node.value, allowed: values },
    });
  }
  return node.value;
}

function readEnum(item: FilterItem, name: string): string | undefined {
  const v = item[name];
  return typeof v === 'string' ? v : undefined;
}

function readStringLiteral(node: Node): string {
  if (node.type !== 'Literal' || typeof node.value !== 'string') {
    throw new CompileError({
      code: 'TYPE_MISMATCH',
      message: 'Expected a string literal',
      location: rangeOf(node),
    });
  }
  return node.value;
}

function readString(item: FilterItem, name: string): string {
  const v = item[name];
  return typeof v === 'string' ? v : '';
}

function readBoolean(item: FilterItem, name: string): boolean {
  return item[name] === true;
}

function readList(item: FilterItem, name: string): string[] {
  const v = item[name];
  return Array.isArray(v) ? (v as string[]) : [];
}

function rangeOf(node: Node): { start: number; end: number } {
  const range = (node as Node & { range?: [number, number] }).range;
  if (range) return { start: range[0], end: range[1] };
  return { start: 0, end: 0 };
}

function toSyntaxError(e: unknown, source: string): ParseError {
  const err = e as { message?: string; index?: number };
  const pos = typeof err.index === 'number' ? err.index : 0;
  const start = Math.min(pos, source.length);
  return {
    code: 'SYNTAX_ERROR',
    message: (err.message ?? 'Syntax error').replace(/\s*\(\d+:\d+\)\s*$/, ''),
    location: { start, end: Math.min(start + 1, source.length) },
  };
}
