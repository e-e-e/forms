import {ObservableAtom} from "./observable_atom";


export interface ObservableGetter<T> {
  get(): T
}

export interface ObservableSetter<T> {
  set(v: T): void
}

export class ObservableValue<T> extends ObservableAtom implements ObservableGetter<T>, ObservableSetter<T> {

  constructor(private value: T) {
    super()
  }

  get() {
    this.reportObserved();
    return this.value
  }

  set(value: T) {
    if (value === this.value) return
    this.value = value
    this.reportChanged();
    this.emitChanged();
  }

  private reportChanged() {
    // console.log('changed')
    // do something
  }
}
