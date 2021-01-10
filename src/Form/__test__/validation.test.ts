import { createValidatorFromExpression, parse } from '../validations'
import { InputStateGroup } from '../field_types'

describe('parse', () => {
  test.each([
    [
      'a AND b',
      {
        type: 'func',
        func: 'AND',
        args: [
          { type: 'accessor', value: 'a' },
          { type: 'accessor', value: 'b' },
        ],
      },
    ],
    [
      'a OR 1',
      {
        type: 'func',
        func: 'OR',
        args: [
          { type: 'accessor', value: 'a' },
          { type: 'number', value: 1 },
        ],
      },
    ],
    [
      "a OR 'ok'",
      {
        type: 'func',
        func: 'OR',
        args: [
          { type: 'accessor', value: 'a' },
          { type: 'string', value: 'ok' },
        ],
      },
    ],
    [
      'LEN a1',
      {
        type: 'func',
        func: 'LEN',
        args: [{ type: 'accessor', value: 'a1' }],
      },
    ],
    [
      'a AND LEN b',
      {
        type: 'func',
        func: 'AND',
        args: [
          { type: 'accessor', value: 'a' },
          { type: 'func', func: 'LEN', args: [{ type: 'accessor', value: 'b' }] },
        ],
      },
    ],
    [
      'a AND b AND c',
      {
        type: 'func',
        func: 'AND',
        args: [
          {
            type: 'func',
            func: 'AND',
            args: [
              { type: 'accessor', value: 'a' },
              { type: 'accessor', value: 'b' },
            ],
          },
          { type: 'accessor', value: 'c' },
        ],
      },
    ],
    [
      'LEN a OR LEN b',
      {
        type: 'func',
        func: 'OR',
        args: [
          { type: 'func', func: 'LEN', args: [{ type: 'accessor', value: 'a' }] },
          { type: 'func', func: 'LEN', args: [{ type: 'accessor', value: 'b' }] },
        ],
      },
    ],
    [
      'a AND (b_2 OR c)',
      {
        type: 'func',
        func: 'AND',
        args: [
          { type: 'accessor', value: 'a' },
          {
            type: 'func',
            func: 'OR',
            args: [
              { type: 'accessor', value: 'b_2' },
              { type: 'accessor', value: 'c' },
            ],
          },
        ],
      },
    ],
    [
      '[a b c] IS ok',
      {
        args: [
          {
            type: 'set',
            values: [
              { type: 'accessor', value: 'a' },
              { type: 'accessor', value: 'b' },
              { type: 'accessor', value: 'c' },
            ],
          },
          { type: 'accessor', value: 'ok' },
        ],
        func: 'IS',
        type: 'func',
      },
    ],
    [
      '(true OR false) AND false',
      {
        func: 'AND',
        type: 'func',
        args: [
          {
            type: 'func',
            func: 'OR',
            args: [
              { type: 'boolean', value: true },
              { type: 'boolean', value: false },
            ],
          },
          { type: 'boolean', value: false },
        ],
      },
    ],
  ])('parses %s', (expression, ast) => {
    expect(parse(expression)).toEqual(ast)
  })
})

describe('createValidatorFromExpression', () => {
  it('validates', () => {
    const state: InputStateGroup['fields'] = {
      a: { type: 'text', key: 'a', name: 'Name', value: 'value', errors: [], dirty: true },
      b: { type: 'text', key: 'b', name: 'Age', value: '', errors: [], dirty: true },
    }
    const validator = createValidatorFromExpression('LEN b IS 0', 'Failed')
    expect(validator(state)).toEqual(undefined)
  })

  it.only('allows deeply nested accessor', () => {
    const state: InputStateGroup['fields'] = {
      a: { type: 'text', key: 'a', name: 'Name', value: 'value', errors: [], dirty: true },
      b: {
        type: 'group',
        key: 'b',
        name: 'group',
        validation: [],
        fields: {
          c: { type: 'text', key: 'c', name: 'Name', value: 'value', errors: [], dirty: true },
        },
        errors: [],
      },
    }
    const failureMsg = 'failed'
    let validator = createValidatorFromExpression('b.c IS "value"', failureMsg)
    expect(validator(state)).toEqual(undefined)
    validator = createValidatorFromExpression('b.c IS "not"', failureMsg)
    expect(validator(state)).toEqual(failureMsg)
  })

  const trueExpressions = [
    '1 IN [1 2 3]',
    '[1 2] IN [1 3 4 2]',
    '"HELLO" IS "HELLO"',
    'true OR (false AND false)',
    "UNIQUE ['a' 'c' 'd' 'e']",
    '2 <= 2',
    '-1 < 2',
    '2 > 0',
    '4 >= 4',
  ]
  test.each(trueExpressions)('%s is ok', (expression) => {
    const validator = createValidatorFromExpression(expression, 'Failed')
    expect(validator({} as any)).toEqual(undefined)
  })

  const falseExpressions = [
    '1 NOT 1',
    "1 IS 'this'",
    "'#' IN [ 2 3 4 5 ]",
    'true AND false',
    '(true OR false) AND false',
    "UNIQUE ['a' 'a' 'c' 'd' 'e']",
    '2 >= 3',
    '-1 > 2',
    '2 <= 0',
    '4 < 4',
  ]
  test.each(falseExpressions)('%s fails', (expression) => {
    const failureMsg = 'failed'
    const validator = createValidatorFromExpression(expression, failureMsg)
    expect(validator({} as any)).toEqual(failureMsg)
  })
})
