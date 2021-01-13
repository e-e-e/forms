import { observer } from '../../observables/observer_component'
import React from 'react'
import { NumberInputState } from '../fields/number'

export const NumberInput = observer(({ input }: { input: NumberInputState }) => {
  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => input.update(parseFloat(e.target.value)),
    [input],
  )
  return (
    <div>
      <label>{input.name}:</label>
      <input type="number" value={input.value} onChange={onChange} />
    </div>
  )
})
