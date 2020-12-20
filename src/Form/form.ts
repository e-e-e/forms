import { observable } from '../observables/observable_object'
import { ObservableValue } from '../observables/observable_value'
import { computed } from '../observables/computed'

export type FormSchema = FieldGroup

type CommonField = { key: string; name: string }
type TextField = CommonField & { type: 'text' }
type NumberField = CommonField & { type: 'number' }

type Condition = {}

type ConditionalField = { type: 'conditional'; condition: Condition; field: Field }
type RepeatableField = { type: 'repeatable'; field: Field }
type FieldGroup = CommonField & {
  type: 'group'
  fields: Field[]
}
export type Field = TextField | NumberField | FieldGroup

type InputStateCommon = {
  dirty: boolean
  value: string
  errors: string[]
}
export type TextInputState = InputStateCommon & TextField
export type NumberInputState = InputStateCommon & NumberField
export type InputState = InputStateGroup | TextInputState | NumberInputState
export type InputStateGroup = Omit<FieldGroup, 'fields'> & {
  fields: { [keyof: string]: InputState }
}

function fieldToInputState(field: Field): InputState {
  switch (field.type) {
    case 'group':
      return createGroupInputState(field)
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
  const value = new ObservableValue('')
  const validate = (v: string) => []
  return observable({
    ...field,
    dirty: false,
    value,
    errors: computed(() => validate(value.get())),
  })
}

const createGroupInputState = (group: FieldGroup): InputStateGroup => {
  // create new validator based on field
  const validate = (v: string) => []
  const fields = group.fields.reduce<InputStateGroup['fields']>((acc, cur) => {
    acc[cur.key] = fieldToInputState(cur)
    return acc
  }, {})
  // listen to changes on fields...
  return observable({
    ...group,
    fields: fields,
  })
}

function fieldGroupToInputStateGroup(group: FieldGroup): InputStateGroup {
  return {
    ...group,
    fields: group.fields.reduce<InputStateGroup['fields']>((acc, cur) => {
      acc[cur.key] = fieldToInputState(cur)
      return acc
    }, {}),
  }
}

export function createStateFromSchema(schema: FormSchema): InputStateGroup {
  return fieldGroupToInputStateGroup(schema)
}
