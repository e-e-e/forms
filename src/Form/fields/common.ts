export interface CommonField {
  key: string
  name: string
}

export type InputStateCommon = {
  dirty: boolean
  value: string | number
  errors: string[]
}
