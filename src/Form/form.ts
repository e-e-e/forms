import { observable } from '../observables/observable_object'
import { ObservableValue } from '../observables/observable_value'
import { computed } from '../observables/computed'
import { createObservableArray } from '../observables/observable_array'
import { action } from '../observables/action'
import { createValidatorFromExpression } from './validations'
import { observer } from '../observables/observer'

export type FormSchema = FieldGroup

type CommonField = { key: string; name: string }
type TextField = CommonField & { type: 'text' }
type NumberField = CommonField & { type: 'number' }

type Condition = {}

type Validation = {
  expression: string
  message: string
}

type ConditionalField = CommonField & { type: 'conditional'; condition: Condition; field: Field }
type RepeatableField = CommonField & { type: 'repeatable'; field: Field }
type FieldGroup = CommonField & {
  type: 'group'
  fields: Field[]
  validation: Validation[]
}
export type Field = TextField | NumberField | FieldGroup | RepeatableField // | ConditionalField

type InputStateCommon = {
  dirty: boolean
  value: string | number
  errors: string[]
}
export type TextInputState = InputStateCommon & TextField & { value: string }
export type NumberInputState = InputStateCommon & NumberField & { value: number }
export type InputState = InputStateGroup | TextInputState | NumberInputState | RepeatableInputState
export type InputStateGroup = Omit<FieldGroup, 'fields'> & {
  fields: { [keyof: string]: InputState }
  errors: string[]
}
export type RepeatableInputState = RepeatableField & { fields: InputState[]; add: () => void }

function fieldToInputState(field: Field): InputState {
  switch (field.type) {
    case 'group':
      return createGroupInputState(field)
    // case 'conditional':
    //   return createConditionalInputState(field);
    case 'repeatable':
      return createRepeatableInputState(field)
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

const createRepeatableInputState = (field: RepeatableField): RepeatableInputState => {
  const fields = createObservableArray([fieldToInputState(field.field)])
  return observable({
    ...field,
    fields,
    add: action(() => fields.push(fieldToInputState(field.field))),
  })
}

const createGroupInputState = (group: FieldGroup): InputStateGroup => {
  // create new validator based on field
  const validators = group.validation.map((v) =>
    createValidatorFromExpression(v.expression, v.message),
  )
  const fields = group.fields.reduce<InputStateGroup['fields']>((acc, cur) => {
    acc[cur.key] = fieldToInputState(cur)
    return acc
  }, {})
  const errors = computed(() => {
    console.log('running')
    const ok = validators
      .map((validate) => validate(fields))
      .filter((a): a is string => typeof a === 'string')
    console.log('ok')
    return ok
  })
  observer(() => {
    console.log('errors', errors.get())
  })
  // listen to changes on fields...
  return observable({
    ...group,
    fields: fields,
    errors,
  })
}
//
// function fieldGroupToInputStateGroup(group: FieldGroup): InputStateGroup {
//   return {
//     ...group,
//     fields: group.fields.reduce<InputStateGroup['fields']>((acc, cur) => {
//       acc[cur.key] = fieldToInputState(cur)
//       return acc
//     }, {}),
//   }
// }

export function createStateFromSchema(schema: FormSchema): InputStateGroup {
  return createGroupInputState(schema)
}
