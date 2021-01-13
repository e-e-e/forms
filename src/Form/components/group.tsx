import React from 'react'
import { observer } from '../../observables/observer_component'
import { FormElementComponent } from './form'
import { InputStateGroup } from '../fields/group'

const Errors = observer(({ input }: { input: InputStateGroup }) => {
  return <>errors: {input.errors.join(',')}</>
})

export const InputGroup = ({
  input,
  FormElement,
}: {
  input: InputStateGroup
  FormElement: FormElementComponent
}) => {
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
