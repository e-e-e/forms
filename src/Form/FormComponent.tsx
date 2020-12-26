import React, { DependencyList, useMemo } from 'react'
import {
  createStateFromSchema,
  FormSchema,
  InputState,
  InputStateGroup,
  NumberInputState,
  RepeatableInputState,
  TextInputState,
} from './form'
import { observer } from '../observables/observer_component'
import { action } from '../observables/action'

function useAction<T extends (...args: any[]) => any>(callback: T, deps: DependencyList): T {
  return React.useCallback(action(callback), deps)
}

const Errors = observer(({ input }: { input: InputStateGroup }) => {
  return <>errors: {input.errors}</>
})

const InputGroup = ({ input }: { input: InputStateGroup }) => {
  return (
    <fieldset>
      <legend>{input.name}</legend>
      {Object.entries(input.fields).map(([k, v]) => (
        <FormElement key={k} input={v} />
      ))}
      <Errors input={input} />
    </fieldset>
  )
}

const NumberInput = observer(({ input }: { input: NumberInputState }) => {
  const onChange = useAction(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      input.value = parseFloat(e.target.value)
    },
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

const RepeatableInput = observer(({ input }: { input: RepeatableInputState }) => {
  console.log('repeat', input.fields)
  return (
    <div>
      <hr />
      {input.fields.map((field, index) => {
        console.log('ok')
        return <FormElement key={`${field.key}:${index}`} input={field} />
      })}
      <button onClick={input.add}>add</button>
    </div>
  )
})

const FormElement = ({ input }: { input: InputState }) => {
  switch (input.type) {
    case 'group':
      return <InputGroup input={input} />
    case 'repeatable':
      return <RepeatableInput input={input} />
    case 'number':
      return <NumberInput input={input} />
    case 'text':
      return <TextInput input={input} />
  }
}

export const Form = ({ schema }: { schema: FormSchema }) => {
  const state = useMemo(() => createStateFromSchema(schema), [schema])

  return (
    // <form>
    <FormElement input={state} />
    // </form>
  )
}
