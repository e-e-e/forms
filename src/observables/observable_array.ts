import { MANAGER } from './global_state'
import { ObservableAtom } from './observable_atom'

class ObservableArrayManager<T> extends ObservableAtom {
  readonly values: T[] = []

  constructor(readonly initialValues: T[] = []) {
    super()
    this.values = initialValues
  }
  get(idx: number): T {
    this.reportObserved()
    return this.values[idx]
  }
  observed() {
    this.reportObserved()
  }
  set(idx: number, value: T) {
    this.values[idx] = value
    this.emitChanged()
  }
  getArrayLength() {
    this.reportObserved()
    return this.values.length
  }

  setArrayLength(length: number) {
    this.values.length = length
  }
}

const proxyHandler = {
  get(target: ObservableArray<any>, name: PropertyKey) {
    const manager = target[MANAGER]
    // console.log(name, manager.values)
    if (name === MANAGER) return manager
    if (name === 'length') return manager.getArrayLength()
    if (typeof name === 'number') {
      return manager.get(name)
    }
    if (typeof name === 'string' && !isNaN(name as any)) {
      return manager.get(parseInt(name))
    }
    if (name === 'map') {
      console.log(manager.values)
      manager.observed()
    }
    // Reflect.get(target, name) //
    return (target as any)[name]
  },
  set(target: ObservableArray<any>, name: PropertyKey, value: any): boolean {
    const manager = target[MANAGER]
    if (name === 'length') {
      manager.setArrayLength(value)
    }
    if (typeof name === 'number') {
      manager.set(name, value)
    } else if (typeof name === 'symbol' || isNaN(name as any)) {
      target[name as any] = value
    } else {
      manager.set(parseInt(name), value)
    }
    return true
  },
  preventExtensions(target: ObservableArray<any>) {
    fail(`Observable arrays cannot be frozen`)
    return false
  },
}

interface ObservableArray<T> extends Array<T> {
  [MANAGER]: ObservableArrayManager<T>
}

export function createObservableArray<T>(initialValues: T[] | undefined): ObservableArray<T> {
  const adm = new ObservableArrayManager(initialValues)
  Object.defineProperty(adm.values, MANAGER, {
    enumerable: false,
    writable: true,
    configurable: true,
    value: adm,
  })
  return new Proxy(adm.values, proxyHandler) as any
}
