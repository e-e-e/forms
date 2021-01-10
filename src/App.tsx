import React from 'react'
import './App.css'
import { Form } from './Form/FormComponent'
import { FormSchema } from './Form/field_types'

const formSchema: FormSchema = {
  type: 'group',
  key: 'test',
  name: 'test',
  validation: [
    //   { expression: 'name IN [pass "ok" "another"]', message: 'Name must be' },
    //   { expression: 'LEN pass NOT 0', message: 'Pass needs to be bigger' },
  ],
  fields: [
    { type: 'text', key: 'name', name: 'Name' },
    { type: 'text', key: 'pass', name: 'Pass' },
    { type: 'number', key: 'age', name: 'Age' },
    {
      type: 'repeatable',
      name: 'rr',
      key: 'rr',
      field: { type: 'text', key: 'likes', name: 'Likes' },
    },
    {
      type: 'conditional',
      key: 'cub',
      name: 'con',
      conditions: [
        {
          when: 'LEN name IS 0',
          field: { type: 'number', key: 'number', name: 'Number' },
        },
      ],
    },
  ],
}

const x = {
  fields: [
    {
      type: 'select',
      key: 'option',
      options: [
        { value: 'one', name: 'One' },
        { value: 'two', name: 'Two' },
        { value: 'three', name: 'Three' },
      ],
    },
    {
      type: 'conditional',
      conditions: [
        {
          when: "option IS 'two'",
          fields: [],
        },
        {
          when: "option IS 'three'",
          fields: [],
        },
      ],
    },
  ],
}

interface CF {
  name: string
  value: never
}
interface TF extends CF {
  type: 'text'
}
interface NF extends CF {
  type: 'number'
}

type Field = TF | NF

type FTS = TF & { value: string }

interface TF {
  required: boolean
}

function CustomInput({ input }: { input: FTS }) {
  return (
    <div>
      <input type={'text'} value={input.value} required={input.required} />
    </div>
  )
}

function MasterInput(field: Field) {
  if (field.type === 'text') {
    field.required = true
  } else {
  }
}

function App() {
  return (
    <div className="App">
      <Form schema={formSchema} />
    </div>
  )
}

export default App
