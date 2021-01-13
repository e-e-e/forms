import { observer } from '../../observables/observer_component'
import React from 'react'
import { action } from '../../observables/action'
import { SelectInputState } from '../fields/select'

export const SelectInput = observer(({ input }: { input: SelectInputState }) => {
  const onChange = React.useCallback(
    action((e: React.ChangeEvent<HTMLSelectElement>) => {
      input.value = e.target.value
    }),
    [input],
  )
  return (
    <div>
      <label>{input.name}:</label>
      <select value={input.value} onChange={onChange}></select>
    </div>
  )
})
