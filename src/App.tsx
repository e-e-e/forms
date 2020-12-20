import React from 'react'
import './App.css'
import { observer, Observer } from './observables/observer_component'
import { action } from './observables/action'
import { observable } from './observables/observable_object'
import { Form } from './Form/FormComponent'
import { FormSchema } from './Form/form'

const state = observable({
  name: 'default',
  valid: false,
})

const Label = (props: { value: { name: string } }) => {
  console.log('rendered lable')
  return <p>{props.value.name}</p>
}
const ObservableLabel = observer(Label)

const testInput = () => {
  console.log('rendered test input')
  const setValue = action((changeEvent: React.ChangeEvent<HTMLInputElement>) => {
    state.name = changeEvent.target.value
  })
  return (
    <div>
      <h1>{state.name}</h1>
      <input type="text" onChange={setValue} value={state.name} />
      <Observer>
        {() => {
          console.log('rendered validation')
          return state.valid ? 'ok' : 'not ok'
        }}
      </Observer>
    </div>
  )
}
const formSchema: FormSchema = {
  type: 'group',
  key: 'test',
  name: 'test',
  fields: [
    { type: 'text', key: 'name', name: 'Name' },
    { type: 'number', key: 'age', name: 'Age' },
  ],
  // types of validation
  // age is over 18
  // all values are less then < x
  // value X + Y = value Z
}
function App() {
  const check = React.useCallback(
    action(() => (state.valid = state.name === 'pass')),
    [],
  )
  return (
    <div className="App">
      <Observer>{testInput}</Observer>
      <button onClick={check}>Check</button>
      <ObservableLabel value={state} />
      <Form schema={formSchema} />
    </div>
  )
}

export default App
