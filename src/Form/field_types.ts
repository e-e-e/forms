export type FormSchema = FieldGroup

export interface CommonField {
  key: string
  name: string
}

export interface TextField extends CommonField {
  type: 'text'
}
export interface NumberField extends CommonField {
  type: 'number'
}

export type Condition = { when: string; field: Field }

export type Validation = {
  expression: string
  message: string
}

export interface ConditionalField extends CommonField {
  type: 'conditional'
  conditions: Condition[]
}

export interface RepeatableField extends CommonField {
  type: 'repeatable'
  field: Field
}

export interface FieldGroup extends CommonField {
  type: 'group'
  fields: Field[]
  validation: Validation[]
}

export type Field = TextField | NumberField | FieldGroup | RepeatableField | ConditionalField

export type InputStateCommon = {
  dirty: boolean
  value: string | number
  errors: string[]
}
export type TextInputState = TextField & { value: string } & InputStateCommon
export type NumberInputState = InputStateCommon & NumberField & { value: number }
export type InputStateGroup = Omit<FieldGroup, 'fields'> & {
  fields: { [keyof: string]: InputState }
  errors: string[]
}
export type RepeatableInputState = RepeatableField & {
  fields: InputState[]
  add: () => void
  remove: (index: number) => void
}
export type ConditionalInputState = ConditionalField & { field: InputState | null }
export type InputState =
  | InputStateGroup
  | TextInputState
  | NumberInputState
  | RepeatableInputState
  | ConditionalInputState
