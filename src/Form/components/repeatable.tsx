import { observer } from '../../observables/observer_component'
import React from 'react'
import { RepeatableInputState } from '../fields/repeatable'
import { FormElementComponent } from './form'
import { InputState } from '../fields'

export const RepeatableInput = observer(
  ({ input, FormElement }: { input: RepeatableInputState; FormElement: FormElementComponent }) => {
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
              FormElement={FormElement}
            />
          )
        })}
        <button onClick={input.add}>add</button>
      </div>
    )
  },
)

const RepeatableInputElement = React.memo(
  ({
    field,
    remove,
    index,
    FormElement,
  }: {
    field: InputState
    remove: (id: number) => void
    index: number
    FormElement: FormElementComponent
  }) => {
    return (
      <div>
        <FormElement input={field} />
        <button onClick={() => remove(index)}>X</button>
      </div>
    )
  },
)
