import { merge, observable } from '../observables/observable_object'
import { ObservableValue } from '../observables/observable_value'
import { computed } from '../observables/computed'
import { createObservableArray } from '../observables/observable_array'
import { action } from '../observables/action'
import { createExpression, createValidatorFromExpression } from './validations'
import {
  ConditionalField,
  ConditionalInputState,
  Field,
  FieldGroup,
  FormSchema,
  InputState,
  InputStateGroup,
  NumberField,
  NumberInputState,
  RepeatableField,
  RepeatableInputState,
  TextField,
  TextInputState,
} from './field_types'

function fieldToInputState(field: Field, parent: ParentState): InputState {
  switch (field.type) {
    case 'group':
      return createGroupInputState(field, parent)
    case 'conditional':
      return createConditionalInputState(field, parent)
    case 'repeatable':
      return createRepeatableInputState(field, parent)
    case 'number':
      return createNumberInputState(field)
    case 'text':
      return createTextInputState(field)
  }
}

const createTextInputState = (field: TextField): TextInputState => {
  const value = new ObservableValue('')
  // Create new validator based on field
  const validate = (v: string) => []
  return observable({
    ...field,
    dirty: false,
    value,
    errors: computed(() => validate(value.get())),
  })
}

const createNumberInputState = (field: NumberField): NumberInputState => {
  const value = new ObservableValue(NaN)
  const validate = (v: number) => []
  return observable({
    ...field,
    dirty: false,
    value,
    errors: computed(() => validate(value.get())),
  })
}

const createRepeatableInputState = (
  field: RepeatableField,
  parent: ParentState,
): RepeatableInputState => {
  const fields = createObservableArray([fieldToInputState(field.field, parent)])
  return observable({
    ...field,
    fields,
    add: action(() => fields.push(fieldToInputState(field.field, parent))),
    remove: action((index: number) => {
      console.log('remove')
      fields.splice(index, 1)
      console.log(fields)
    }),
  })
}

const createConditionalInputState = (
  field: ConditionalField,
  parent: ParentState,
): ConditionalInputState => {
  // root state
  // create a condition...
  const conditions = field.conditions.map((c) => createExpression(c.expression))
  const state = fieldToInputState(field.field, parent)
  const optionalField = computed(() => {
    if (conditions.every((exp) => parent.fields && exp(parent.fields))) {
      return state
    }
    return undefined
  })
  observable(() => {
    Object.keys(parent.fields || {})
  })
  return observable({
    ...field,
    field: optionalField,
  })
}

type ParentState = Omit<InputStateGroup, 'fields' | 'errors'> &
  Partial<Pick<InputStateGroup, 'fields' | 'errors'>>

const createGroupInputState = (group: FieldGroup, parent?: ParentState): InputStateGroup => {
  const rootState = observable<ParentState>({ ...group, fields: undefined, errors: undefined })
  // create new validator based on field
  const validators = group.validation.map((v) =>
    createValidatorFromExpression(v.expression, v.message),
  )
  const fields = group.fields.reduce<InputStateGroup['fields']>((acc, cur) => {
    acc[cur.key] = fieldToInputState(cur, parent || rootState)
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

export function createStateFromSchema(schema: FormSchema): InputStateGroup {
  return createGroupInputState(schema)
}

export function toValue(state: InputStateGroup) {}
