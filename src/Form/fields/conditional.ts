import { createExpression } from '../validations'
import { computed } from '../../observables/computed'
import { observable } from '../../observables/observable_object'
import { Field, FieldConverter, InputState, ParentState } from './index'
import { CommonField } from './common'

export type Condition = { when: string; field: Field }

export interface ConditionalField extends CommonField {
  type: 'conditional'
  conditions: Condition[]
}

export type ConditionalInputState = ConditionalField & { field: InputState | null }

export const createConditionalInputState = (fieldConverter: FieldConverter) => (
  field: ConditionalField,
  parent?: ParentState,
): ConditionalInputState => {
  const conditions = field.conditions.map((c) => createExpression(c.when))
  let lastIndex = -1
  let existingState: InputState | null = null
  const optionalField = computed(() => {
    if (!parent?.fields) return null
    for (let i = 0; i < conditions.length; i++) {
      if (conditions[i](parent.fields)) {
        if (lastIndex !== i) {
          existingState = fieldConverter(field.conditions[i].field, parent)
        }
        lastIndex = i
        return existingState
      }
    }
    return null
  })
  return observable({
    ...field,
    field: optionalField,
  })
}
