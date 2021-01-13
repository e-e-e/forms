import { CommonField, InputStateCommon } from './common'
import { ObservableValue } from '../../observables/observable_value'
import { observable } from '../../observables/observable_object'
import { computed } from '../../observables/computed'
import { action } from '../../observables/action'

export interface NumberField extends CommonField {
  type: 'number'
  // required: boolean
  // default?: number
}
export type NumberInputState = InputStateCommon &
  NumberField & { value: number; update: (value: number) => void }

export const createNumberInputState = (field: NumberField): NumberInputState => {
  const value = new ObservableValue(NaN)
  const dirty = new ObservableValue(false)
  const validate = (v: number) => []
  return observable({
    ...field,
    dirty,
    value,
    errors: computed(() => validate(value.get())),
    update: action((v: number) => {
      value.set(v)
      dirty.set(true)
    }),
  })
}
