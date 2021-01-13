import { CommonField } from './common'
import { Field, FieldConverter, InputState, ParentState } from './index'
import { merge, observable } from '../../observables/observable_object'
import { createValidatorFromExpression } from '../validations'
import { computed } from '../../observables/computed'

type Validation = {
  expression: string
  message: string
}

export interface FieldGroup extends CommonField {
  type: 'group'
  fields: Field[]
  validation: Validation[]
}

export type InputStateGroup = Omit<FieldGroup, 'fields'> & {
  fields: { [keyof: string]: InputState }
  errors: string[]
}

export const createGroupInputState = (fieldConverter: FieldConverter) => (
  group: FieldGroup,
  parent?: ParentState,
): InputStateGroup => {
  const rootState = observable<ParentState>({ ...group, fields: undefined, errors: undefined })
  // create new validator based on field
  const validators = group.validation.map((v) =>
    createValidatorFromExpression(v.expression, v.message),
  )
  const fields = group.fields.reduce<InputStateGroup['fields']>((acc, cur) => {
    acc[cur.key] = fieldConverter(cur, parent || rootState)
    return acc
  }, {})
  const errors = computed(() => {
    const ok = validators
      .map((validate) => validate(fields))
      .filter((a): a is string => typeof a === 'string')
    return ok
  })
  return merge(rootState, { fields, errors }) as InputStateGroup
}
