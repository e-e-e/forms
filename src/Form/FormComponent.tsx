import React, {useMemo} from "react";
import {createStateFromSchema, FormSchema, InputState, InputStateGroup, NumberInputState, TextInputState} from "./form";
import {observer} from "../observables/observer_component";
import {runInAction} from "../observables/action";



const InputGroup = ({input}: { input: InputStateGroup }) => {
  return (<div>
    {
      Object.entries(input.fields).map(([k, v]) => <FormElement key={k} input={v}/>)
    }
  </div>)
}

const NumberInput = observer(({input}: { input: NumberInputState }) => {
  return (
  <div>
    <label>{input.name}:</label>
    <input type="number" value={input.value} onChange={(e) => runInAction(() => {
      console.log('action')
      input.value = e.target.value
    })}/>
  </div>
  )
})
const TextInput = observer(({input}: { input: TextInputState }) => {
  console.log(input);
  return (
    <div>
      <label>{input.name}:</label>
      <input type="text" value={input.value} onChange={(e) => runInAction(() => input.value = e.target.value)}/>
    </div>
  )
})

const FormElement = ({input}: { input: InputState }) => {
 console.log('log input', input)
  switch (input.type) {
    case "group":
      return <InputGroup input={input}/>
    case "number":
      return <NumberInput input={input}/>
    case "text":
      return <TextInput input={input}/>
  }
}

export const Form = ({schema}: { schema: FormSchema }) => {
  const state = useMemo(() => createStateFromSchema(schema), [schema])

  return (
    <form>
      <FormElement input={state} />
    </form>
  )
}
