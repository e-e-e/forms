import React, { useMemo } from 'react'
import {
  createStateFromSchema,
  FormSchema,
  InputState,
  InputStateGroup,
  NumberInputState,
  TextInputState,
} from './form'
import { observer } from '../observables/observer_component'
import { action } from '../observables/action'

const InputGroup = ({ input }: { input: InputStateGroup }) => {
  return (
    <fieldset>
      <legend>{input.name}</legend>
      {Object.entries(input.fields).map(([k, v]) => (
        <FormElement key={k} input={v} />
      ))}
    </fieldset>
  )
}

const NumberInput = observer(({ input }: { input: NumberInputState }) => {
  const onChange = React.useCallback(
    action((e: React.ChangeEvent<HTMLInputElement>) => {
      input.value = e.target.value
    }),
    [input],
  )
  return (
    <div>
      <label>{input.name}:</label>
      <input type="number" value={input.value} onChange={onChange} />
    </div>
  )
})
const TextInput = observer(({ input }: { input: TextInputState }) => {
  const onChange = React.useCallback(
    action((e: React.ChangeEvent<HTMLInputElement>) => {
      input.value = e.target.value
    }),
    [input],
  )
  return (
    <div>
      <label>{input.name}:</label>
      <input type="text" value={input.value} onChange={onChange} />
    </div>
  )
})

const FormElement = ({ input }: { input: InputState }) => {
  switch (input.type) {
    case 'group':
      return <InputGroup input={input} />
    case 'number':
      return <NumberInput input={input} />
    case 'text':
      return <TextInput input={input} />
  }
}

export const Form = ({ schema }: { schema: FormSchema }) => {
  const state = useMemo(() => createStateFromSchema(schema), [schema])

  return (
    <form>
      <FormElement input={state} />
    </form>
  )
}
