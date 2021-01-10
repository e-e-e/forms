export type FormSchema = FieldGroup

export interface CommonField {
  key: string
  name: string
}

export interface TextField extends CommonField {
  type: 'text'
  // required: boolean
  // default?: string
}

export interface NumberField extends CommonField {
  type: 'number'
  // required: boolean
  // default?: number
}

type SelectOptionValue = {
  name: string
  value: string
}

type SelectOptionGroup = {
  name: string
  Options: SelectOption[]
}

type SelectOption = SelectOptionGroup | SelectOptionValue

export interface SelectField extends CommonField {
  type: 'select'
  options: SelectOption[]
}

export type Condition = { when: string; field: Field }

export interface ConditionalField extends CommonField {
  type: 'conditional'
  conditions: Condition[]
}

export interface RepeatableField extends CommonField {
  type: 'repeatable'
  field: Field
}

export type Validation = {
  expression: string
  message: string
}

export interface FieldGroup extends CommonField {
  type: 'group'
  fields: Field[]
  validation: Validation[]
}

export type Field =
  | TextField
  | NumberField
  | SelectField
  | FieldGroup
  | RepeatableField
  | ConditionalField

export type InputStateCommon = {
  dirty: boolean
  value: string | number
  errors: string[]
}
export type TextInputState = TextField & { value: string } & InputStateCommon
export type NumberInputState = InputStateCommon & NumberField & { value: number }
export type SelectInputState = InputStateCommon & SelectField & { value: string }
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
  | SelectInputState
  | RepeatableInputState
  | ConditionalInputState
