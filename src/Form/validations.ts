import { InputState, InputStateGroup } from './field_types'

type RawValue = string | number | boolean

function isString(v: unknown): v is string {
  return typeof v === 'string'
}
function isNumber(v: unknown): v is number {
  return typeof v === 'number'
}
function isBoolean(v: unknown): v is boolean {
  return typeof v === 'boolean'
}
function isRawValue(v: unknown): v is RawValue {
  return isNumber(v) || isString(v) || isBoolean(v)
}

type Fields = Record<string, InputState>
type Resolver = (i: Fields) => RawValue | undefined | (RawValue | undefined)[]

function getValue(state: Fields, keys: string[]): undefined | RawValue {
  if (keys.length === 0) return undefined
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const key = keys.shift()!
  const item = state[key]
  console.log('item', state, key)
  switch (item.type) {
    case 'group':
      return getValue(item.fields, keys)
    case 'number':
    case 'text':
      return item.value
  }
}

function isFuncLike(str: string) {
  return !!str.match(/^[A-Z]+$/)
}
function isIdLike(str: string) {
  return !!str.match(/^[a-z_][.a-z0-9_]*$/)
}

type BinaryFunctionKey = 'AND' | 'OR' | 'NOT' | 'IS' | 'IN'

const binaryFunctionKeys: BinaryFunctionKey[] = ['AND', 'OR', 'NOT', 'IS', 'IN']

function isBinaryFunctionKey(s: string): s is BinaryFunctionKey {
  return binaryFunctionKeys.includes(s as BinaryFunctionKey)
}

type UnaryFunctionKey = 'LEN' | 'UNIQUE'

const unaryFunctionKeys: UnaryFunctionKey[] = ['LEN', 'UNIQUE']

function isUnaryFunctionKey(s: string): s is UnaryFunctionKey {
  return unaryFunctionKeys.includes(s as UnaryFunctionKey)
}

type Token =
  | { type: 'func-binary'; value: BinaryFunctionKey }
  | { type: 'func-unary'; value: UnaryFunctionKey }
  | { type: 'accessor'; value: string }
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'boolean'; value: boolean }
  | { type: 'open-expression' }
  | { type: 'end-expression' }
  | { type: 'open-set' }
  | { type: 'end-set' }

function toToken(token: string): Token {
  if (token === '(') {
    return { type: 'open-expression' }
  }
  if (token === ')') {
    return { type: 'end-expression' }
  }
  if (token === '[') {
    return { type: 'open-set' }
  }
  if (token === ']') {
    return { type: 'end-set' }
  }
  if (token === 'true') {
    return { type: 'boolean', value: true }
  }
  if (token === 'false') {
    return { type: 'boolean', value: false }
  }
  if (isFuncLike(token)) {
    console.log(token)
    if (isBinaryFunctionKey(token)) {
      return { type: 'func-binary', value: token }
    }
    if (isUnaryFunctionKey(token)) {
      return { type: 'func-unary', value: token }
    }
    throw new Error('Not a valid function')
  }
  if (isIdLike(token)) {
    return { type: 'accessor', value: token }
  }
  const str = token.match(/^(".+"|'.+')$/)
  if (str) {
    return { type: 'string', value: str[1].slice(1, -1) }
  }
  const number = parseFloat(token)
  if (!isNaN(number)) {
    return { type: 'number', value: number }
  } else throw Error('could not parse token')
}

function tokenize(condition: string) {
  const tokens: string[] = []
  let str = ''
  for (let i = 0; i < condition.length; i++) {
    switch (condition[i]) {
      case ' ':
        if (str) tokens.push(str)
        str = ''
        break
      case '[':
      case ']':
      case '(':
      case ')':
        if (str) tokens.push(str)
        tokens.push(condition[i])
        str = ''
        break
      default:
        str += condition[i]
    }
  }
  if (str) tokens.push(str)
  console.log('tokens', tokens)
  return tokens.map(toToken)
}

type AccessorNode = {
  type: 'accessor'
  value: string
}

type RawValueNode = StringNode | NumberNode | BooleanNode

type StringNode = {
  type: 'string'
  value: string
}

type NumberNode = {
  type: 'number'
  value: number
}

type BooleanNode = {
  type: 'boolean'
  value: boolean
}

type SetNode = {
  type: 'set'
  values: ASTNode[]
}

type BinaryFunctionNode = {
  type: 'func'
  func: BinaryFunctionKey
  args: [ASTNode, ASTNode]
}

type UnaryFunctionNode = {
  type: 'func'
  func: UnaryFunctionKey
  args: [ASTNode]
}

type ExpressionNode = BinaryFunctionNode | UnaryFunctionNode
type ASTNode = AccessorNode | ExpressionNode | RawValueNode | SetNode

export function parse(condition: string): ASTNode {
  const tokens = tokenize(condition)
  console.log(tokens)
  return parseExpression(tokens, true)
}

function parseExpression(tokens: Token[], scoped: boolean): ASTNode {
  if (tokens.length === 0) {
    throw new Error('Empty Expression')
  }
  let lhs: ASTNode = parseArgument(tokens)
  while (tokens.length > 0) {
    if (tokens[0].type === 'end-expression') {
      if (scoped) {
        tokens.shift()
        break
      }
    }
    const next = parseBinaryFunctionName(tokens)
    const rhs = parseArgument(tokens)
    lhs = {
      type: 'func',
      func: next,
      args: [lhs, rhs],
    }
  }
  return lhs
}

function parseUnaryFunction(tokens: Token[]): UnaryFunctionNode {
  const func = parseUnaryFunctionName(tokens)
  const value = parseArgument(tokens)
  return {
    type: 'func',
    func: func,
    args: [value],
  }
}

function parseBinaryFunctionName(tokens: Token[]): BinaryFunctionNode['func'] {
  const token = tokens.shift()!
  if (token.type !== 'func-binary') {
    throw new Error('Expected binary function term')
  }
  return token.value
}
function parseUnaryFunctionName(tokens: Token[]): UnaryFunctionNode['func'] {
  const token = tokens.shift()!
  if (token.type !== 'func-unary') {
    throw new Error('Expected unary function term')
  }
  return token.value
}

function parseSet(tokens: Token[]): SetNode {
  const values: ASTNode[] = []
  while (tokens[0].type !== 'end-set') {
    const value = parseArgument(tokens)
    console.log('v:.', value)
    values.push(value)
  }
  tokens.shift()
  return {
    type: 'set',
    values,
  }
}

function parseArgument(tokens: Token[]): ASTNode {
  const token = tokens.shift()
  if (!token) throw new Error('Expected an argument but found nothing.')
  switch (token.type) {
    case 'open-set':
      return parseSet(tokens)
    case 'open-expression': {
      return parseExpression(tokens, true)
    }
    case 'func-unary': {
      tokens.unshift(token)
      return parseUnaryFunction(tokens)
    }
    case 'string':
    case 'number':
    case 'boolean':
    case 'accessor':
      return token
    case undefined:
  }
  // TODO: Make exhaustive check
  throw new Error('Unexpected token')
}

export function createExpression(expression: string) {
  const ast = parse(expression)
  return processAstNode(ast)
}

export function createValidatorFromExpression(expression: string, message: string) {
  const ast = parse(expression)
  const fn = processAstNode(ast)
  return (state: InputStateGroup['fields']) => (fn(state) ? undefined : message)
}

const processAstNode = (node: ASTNode): Resolver => {
  switch (node.type) {
    case 'boolean':
    case 'string':
    case 'number':
      return () => node.value
    case 'set': {
      const values = node.values.map(processAstNode)
      return (state) => values.flatMap((r) => r(state))
    }
    case 'accessor': {
      return (state) => {
        const keys = node.value.split('.')
        return getValue(state, keys)
      }
    }
    case 'func':
      return makeExpression(node)
  }
}

function makeExpression(func: ExpressionNode): Resolver {
  const [a, b] = func.args.map(processAstNode)
  switch (func.func) {
    case 'IS':
      return (i) => a(i) === b(i)
    case 'IN':
      return (i) => {
        const set = b(i)
        if (!Array.isArray(set)) throw new Error('IN expects an array as the second argument')
        const key = a(i)
        if (Array.isArray(key)) {
          return key.every((k) => set.includes(k))
        } else {
          return set.includes(key)
        }
      }
    case 'UNIQUE':
      return (i) => {
        const array = a(i)
        if (!Array.isArray(array)) throw new Error('IN expects an array as the second argument')
        const set = new Set(array)
        return set.size === array.length
      }
    case 'NOT':
      return (i) => a(i) !== b(i)
    case 'AND':
      return (i) => !!(a(i) && b(i))
    case 'OR':
      return (i) => !!(a(i) || b(i))
    case 'LEN':
      return (i) => {
        const val = a(i)
        if (val == null) throw new Error('LEN received undefined argument.')
        if (typeof val !== 'string') throw new Error('LEN expects a string argument')
        return val.length
      }
  }
}

// a IS 'b'
// FN x
// a IS LEN b
// a IS (SUM b c d e)
// v IN a, b, d, c
// x IN group
// UNIQUE group
// a LT b
// v GT 0 AND v LT max
// group ALL x GT 0
// x MATCHES "\d+"

// then validations become:
// { validator: 'v GT 0 AND v LT max', message: 'some message' }

// Different types returned by identifiers,
// - Raw value (string, number, boolean)
// - Group
// - Array

// Group and Array Operators
// ALL, IN, UNIQUE,

// types of checks that could be:

// Sum of all values is > X
// No duplicate values
// all required fields are filled?
