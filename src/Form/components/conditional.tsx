import { observer } from '../../observables/observer_component'
import React from 'react'
import { FormElementComponent } from './form'
import { ConditionalInputState } from '../fields/conditional'

export const ConditionalInput = observer(
  ({ input, FormElement }: { input: ConditionalInputState; FormElement: FormElementComponent }) => {
    return <>{input.field && <FormElement input={input.field} />}</>
  },
)
