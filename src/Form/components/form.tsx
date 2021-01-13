import React, { useMemo } from 'react'
import { createStateFromSchema, FormSchema, InputState } from '../fields'
import { TextInput } from './text'
import { InputGroup } from './group'
import { NumberInput } from './number'
import { SelectInput } from './select'
import { RepeatableInput } from './repeatable'
import { ConditionalInput } from './conditional'

export type FormElementComponent = ({ input }: { input: InputState }) => JSX.Element | null

const FormElement = ({ input }: { input: InputState }) => {
  switch (input.type) {
    case 'conditional':
      return <ConditionalInput input={input} FormElement={FormElement} />
    case 'group':
      return <InputGroup input={input} FormElement={FormElement} />
    case 'repeatable':
      return <RepeatableInput input={input} FormElement={FormElement} />
    case 'number':
      return <NumberInput input={input} />
    case 'select':
      return <SelectInput input={input} />
    case 'text':
      return <TextInput input={input} />
  }
}

export const Form = ({ schema }: { schema: FormSchema }) => {
  const state = useMemo(() => createStateFromSchema(schema), [schema])
  return <FormElement input={state} />
}
