import { createTextInputState, TextField, TextInputState } from './text'
import { createNumberInputState, NumberField, NumberInputState } from './number'
import { createGroupInputState, FieldGroup, InputStateGroup } from './group'
import { ConditionalField, ConditionalInputState, createConditionalInputState } from './conditional'
import { createRepeatableInputState, RepeatableField, RepeatableInputState } from './repeatable'
import { createSelectInputState, SelectField, SelectInputState } from './select'

export type Field =
  | TextField
  | NumberField
  | FieldGroup
  | ConditionalField
  | RepeatableField
  | SelectField

export type InputState =
  | TextInputState
  | NumberInputState
  | SelectInputState
  | InputStateGroup
  | ConditionalInputState
  | RepeatableInputState

export type ParentState = Omit<InputStateGroup, 'fields' | 'errors'> &
  Partial<Pick<InputStateGroup, 'fields' | 'errors'>>

export type FieldConverter = (field: Field, parent?: ParentState) => InputState

const makeGroupInputState = createGroupInputState(fieldToInputState)
const makeConditionalInputState = createConditionalInputState(fieldToInputState)
const makeRepeatableInputState = createRepeatableInputState(fieldToInputState)

function fieldToInputState(field: Field, parent?: ParentState): InputState {
  switch (field.type) {
    case 'group':
      return makeGroupInputState(field, parent)
    case 'conditional':
      return makeConditionalInputState(field, parent)
    case 'repeatable':
      return makeRepeatableInputState(field, parent)
    case 'number':
      return createNumberInputState(field)
    case 'text':
      return createTextInputState(field)
    case 'select':
      return createSelectInputState(field)
  }
}

export type FormSchema = FieldGroup

export function createStateFromSchema(schema: FormSchema): InputStateGroup {
  return makeGroupInputState(schema)
}
