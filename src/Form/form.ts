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
  SelectField,
  SelectInputState,
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
    case 'select':
      return createSelectInputState(field)
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

const createSelectInputState = (field: SelectField): SelectInputState => {
  const value = new ObservableValue('')
  return observable({
    ...field,
    dirty: false,
    value,
    errors: [],
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
    remove: action((index: number) => fields.splice(index, 1)),
  })
}

const createConditionalInputState = (
  field: ConditionalField,
  parent: ParentState,
): ConditionalInputState => {
  // root state
  // create a condition...
  const conditions = field.conditions.map((c) => createExpression(c.when))
  // const state = fieldToInputState(field.field, parent)
  let lastIndex = -1
  let existingState: InputState | null = null
  const optionalField = computed(() => {
    if (!parent.fields) return null
    for (let i = 0; i < conditions.length; i++) {
      if (conditions[i](parent.fields)) {
        if (lastIndex !== i) {
          existingState = fieldToInputState(field.conditions[i].field, parent)
        }
        lastIndex = i
        return existingState
      }
    }
    return null
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
