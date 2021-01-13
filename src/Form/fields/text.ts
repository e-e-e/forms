import { ObservableValue } from '../../observables/observable_value'
import { observable } from '../../observables/observable_object'
import { computed } from '../../observables/computed'
import { CommonField, InputStateCommon } from './common'
import { action } from '../../observables/action'

export interface TextField extends CommonField {
  type: 'text'
  // required: boolean
  // default?: string
}

export type TextInputState = InputStateCommon &
  TextField & {
    value: string
    update: (value: string) => void
  }

export const createTextInputState = (field: TextField): TextInputState => {
  const value = new ObservableValue('')
  const dirty = new ObservableValue(false)
  const update = action((v: string) => {
    value.set(v)
    dirty.set(true)
  })
  // Create new validator based on field
  const validate = (v: string) => []
  return observable({
    ...field,
    dirty,
    value,
    errors: computed(() => validate(value.get())),
    update,
  })
}
