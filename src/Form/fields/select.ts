import { CommonField, InputStateCommon } from './common'
import { ObservableValue } from '../../observables/observable_value'
import { observable } from '../../observables/observable_object'

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

export type SelectInputState = InputStateCommon & SelectField & { value: string }

export const createSelectInputState = (field: SelectField): SelectInputState => {
  const value = new ObservableValue('')
  const dirty = new ObservableValue(false)
  return observable({
    ...field,
    dirty,
    value,
    errors: [],
    update: (v: string) => {
      value.set(v)
      dirty.set(true)
    },
  })
}
