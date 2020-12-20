import { ObservableGetter } from './observable_value'
import { popExecutionContext, pushExecutionContext } from './global_state'
import { ObservableAtom } from './observable_atom'

export class ComputedValue<T> extends ObservableAtom implements ObservableGetter<T> {
  private invalid = false
  private observables: ObservableAtom[] = []
  private value: T | null = null

  constructor(private readonly fn: () => T) {
    super()
  }

  invalidate = () => {
    this.emitChanged()
    this.invalid = true
  }

  run = () => {
    pushExecutionContext()
    this.value = this.fn()
    this.invalid = false
    const context = popExecutionContext()
    const observed = context?.observables ?? []
    this.observables.forEach((o) => o.removeListener(this.invalidate))
    observed.forEach((o) => o.attachListener(this.invalidate))
    this.observables = observed
  }

  get(): T {
    this.reportObserved()
    if (this.invalid || this.value === null) {
      this.run()
    }
    return this.value!
  }
}

export function computed<T>(fn: () => T): ComputedValue<T> {
  return new ComputedValue(fn)
}
