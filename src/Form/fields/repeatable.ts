import { CommonField } from './common'
import { Field, FieldConverter, InputState, ParentState } from './index'
import { createObservableArray } from '../../observables/observable_array'
import { observable } from '../../observables/observable_object'
import { action } from '../../observables/action'

export interface RepeatableField extends CommonField {
  type: 'repeatable'
  field: Field
}

export type RepeatableInputState = RepeatableField & {
  fields: InputState[]
  add: () => void
  remove: (index: number) => void
}

export const createRepeatableInputState = (fieldConverter: FieldConverter) => (
  field: RepeatableField,
  parent?: ParentState,
): RepeatableInputState => {
  const fields = createObservableArray([fieldConverter(field.field, parent)])
  return observable({
    ...field,
    fields,
    add: action(() => fields.push(fieldConverter(field.field, parent))),
    remove: action((index: number) => fields.splice(index, 1)),
  })
}
