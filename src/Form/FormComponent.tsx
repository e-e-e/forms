import React, { DependencyList, useMemo } from 'react'
import { createStateFromSchema } from './form'
import { observer } from '../observables/observer_component'
import { action } from '../observables/action'
import {
  ConditionalInputState,
  FormSchema,
  InputState,
  InputStateGroup,
  NumberInputState,
  RepeatableInputState,
  TextInputState,
} from './field_types'

function useAction<T extends (...args: any[]) => any>(callback: T, deps: DependencyList): T {
  return React.useCallback(action(callback), deps)
}

const Errors = observer(({ input }: { input: InputStateGroup }) => {
  return <>errors: {input.errors.join(',')}</>
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
        return (
          <RepeatableInputElement
            key={`${field.key}:${index}`}
            field={field}
            remove={input.remove}
            index={index}
          />
        )
      })}
      <button onClick={input.add}>add</button>
    </div>
  )
})

const RepeatableInputElement = React.memo(
  ({
    field,
    remove,
    index,
  }: {
    field: InputState
    remove: (id: number) => void
    index: number
  }) => {
    return (
      <div>
        <FormElement input={field} />
        <button onClick={() => remove(index)}>X</button>
      </div>
    )
  },
)

const ConditionalInput = observer(({ input }: { input: ConditionalInputState }) => {
  return <div>{input.field && <FormElement input={input.field} />}</div>
})

const FormElement = ({ input }: { input: InputState }) => {
  switch (input.type) {
    case 'conditional':
      return <ConditionalInput input={input} />
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

  return <FormElement input={state} />
}
