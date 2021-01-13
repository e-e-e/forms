import { observer } from '../../observables/observer_component'
import React from 'react'
import { TextInputState } from '../fields/text'

export const TextInput = observer(({ input }: { input: TextInputState }) => {
  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => input.update(e.target.value),
    [input],
  )
  return (
    <div>
      <label>{input.name}:</label>
      <input type="text" value={input.value} onChange={onChange} />
    </div>
  )
})
