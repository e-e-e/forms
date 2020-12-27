import React from 'react'
import './App.css'
import { Form } from './Form/FormComponent'
import { FormSchema } from './Form/form'

const formSchema: FormSchema = {
  type: 'group',
  key: 'test',
  name: 'test',
  validation: [
    { expression: 'name IN [pass "ok" "another"]', message: 'Name must be' },
    { expression: 'LEN pass NOT 0', message: 'Pass needs to be bigger' },
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
      conditions: [{ expression: 'LEN name IS 2' }],
      field: {
        type: 'group',
        key: 'nested',
        name: 'nested',
        validation: [],
        fields: [{ type: 'number', key: 'number', name: 'Number' }],
      },
    },
  ],
}
function App() {
  return (
    <div className="App">
      <Form schema={formSchema} />
    </div>
  )
}

export default App
