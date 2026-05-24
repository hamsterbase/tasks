export type FieldSchema =
  | { type: 'string' }
  | { type: 'number' }
  | { type: 'boolean' }
  | { type: 'list' }
  | { type: 'enum'; values: string[] };

export type ItemSchema = Record<string, FieldSchema>;

export type FilterItem = Record<string, unknown>;

export type ErrorCode =
  | 'EMPTY_EXPRESSION'
  | 'SYNTAX_ERROR'
  | 'UNSUPPORTED_SYNTAX'
  | 'UNKNOWN_IDENTIFIER'
  | 'UNKNOWN_FIELD'
  | 'INVALID_MEMBER_ACCESS'
  | 'INVALID_METHOD'
  | 'INVALID_ARGUMENT'
  | 'INVALID_OPERATOR'
  | 'TYPE_MISMATCH'
  | 'INVALID_NULL_CHECK'
  | 'INVALID_ENUM_VALUE'
  | 'INVALID_LOGICAL_OPERAND';

export interface ParseError {
  code: ErrorCode;
  message: string;
  location: { start: number; end: number };
  params?: Record<string, unknown>;
}

export type ParseResult = { success: true; fn: (item: FilterItem) => boolean } | { success: false; error: ParseError };
